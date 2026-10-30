(function (global) {
  'use strict';

  const EPSILON = 0.001;

  function clipEdge(points, inside, intersect) {
    const result = [];
    if (!points.length) return result;
    let previous = points[points.length - 1];
    let previousInside = inside(previous);
    points.forEach(current => {
      const currentInside = inside(current);
      if (currentInside !== previousInside) result.push(intersect(previous, current));
      if (currentInside) result.push(current);
      previous = current;
      previousInside = currentInside;
    });
    return result;
  }

  function intersectionAtX(a, b, x) {
    const span = b.x - a.x;
    const t = Math.abs(span) < 1e-9 ? 0 : (x - a.x) / span;
    return { x, y: a.y + (b.y - a.y) * t };
  }

  function intersectionAtY(a, b, y) {
    const span = b.y - a.y;
    const t = Math.abs(span) < 1e-9 ? 0 : (y - a.y) / span;
    return { x: a.x + (b.x - a.x) * t, y };
  }

  function clipPolygon(points, bounds, epsilon) {
    const tolerance = epsilon == null ? EPSILON : epsilon;
    const snap = (value, low, high) => Math.abs(value - low) <= tolerance ? low
      : Math.abs(value - high) <= tolerance ? high : value;
    let polygon = points.map(point => ({
      x: snap(point.x, bounds.minX, bounds.maxX),
      y: snap(point.y, bounds.minY, bounds.maxY)
    }));
    polygon = clipEdge(polygon, point => point.x >= bounds.minX,
      (a, b) => intersectionAtX(a, b, bounds.minX));
    polygon = clipEdge(polygon, point => point.x <= bounds.maxX,
      (a, b) => intersectionAtX(a, b, bounds.maxX));
    polygon = clipEdge(polygon, point => point.y >= bounds.minY,
      (a, b) => intersectionAtY(a, b, bounds.minY));
    polygon = clipEdge(polygon, point => point.y <= bounds.maxY,
      (a, b) => intersectionAtY(a, b, bounds.maxY));
    return polygon;
  }

  function polygonArea(points) {
    let area = 0;
    for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
      area += points[previous].x * points[index].y - points[index].x * points[previous].y;
    }
    return Math.abs(area / 2);
  }

  function cleanPolygon(points, epsilon) {
    const tolerance = epsilon == null ? EPSILON : epsilon;
    const cleaned = [];
    points.forEach(point => {
      const previous = cleaned[cleaned.length - 1];
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > tolerance) cleaned.push(point);
    });
    if (cleaned.length > 1 && Math.hypot(
      cleaned[0].x - cleaned[cleaned.length - 1].x,
      cleaned[0].y - cleaned[cleaned.length - 1].y
    ) <= tolerance) cleaned.pop();
    let changed = true;
    while (changed && cleaned.length > 3) {
      changed = false;
      for (let index = 0; index < cleaned.length; index += 1) {
        const previous = cleaned[(index - 1 + cleaned.length) % cleaned.length];
        const current = cleaned[index];
        const next = cleaned[(index + 1) % cleaned.length];
        const cross = (current.x - previous.x) * (next.y - current.y) -
          (current.y - previous.y) * (next.x - current.x);
        if (Math.abs(cross) <= tolerance) {
          cleaned.splice(index, 1);
          changed = true;
          break;
        }
      }
    }
    return cleaned;
  }

  function create(options) {
    const THREE = options.THREE;
    const contract = options.contract;
    const pieces = options.pieces;
    const frames = options.frames;
    const hinges = options.hinges;
    const root = options.root;
    const center = options.center;
    const materials = options.materials;
    const whitePaperboard = options.whitePaperboard;
    const clamp = options.clamp;
    const phase = options.phase;
    const point = options.point;
    const epsilon = options.epsilon == null ? EPSILON : options.epsilon;
    const originalThickness = options.initialThickness;
    let paperThickness = originalThickness;
    let materialMode = options.initialMaterialMode || 'existing';
    let adhesiveContacts = [];

    const originalPieces = new Map([...pieces].map(([id, piece]) => [id, {
      geometry: piece.mesh.geometry,
      position: piece.mesh.position.clone()
    }]));
    const paperBridges = new THREE.Group();
    paperBridges.name = options.bridgeGroupName || 'Physical paper crease surfaces';
    root.add(paperBridges);
    const paperMaterials = {
      existing: (whitePaperboard?.materials || materials).map(material => material.clone()),
      white: (whitePaperboard?.materials || materials).map(material => material.clone())
    };
    paperMaterials.existing[0].color.copy(materials[0].color);
    paperMaterials.existing[1].color.copy(materials[1].color);
    paperMaterials.existing[2].color.copy(materials[1].color).multiplyScalar(0.82);
    if(options.preserveSourceEdge)paperMaterials.existing[2].color.copy(materials[2].color);
    Object.values(paperMaterials).flat().forEach(material => {
      if ('roughness' in material) material.roughness = 0.98;
      if ('bumpScale' in material) material.bumpScale = 0.016;
    });
    paperMaterials.existing[0].map = materials[0].map || null;
    if ('bumpScale' in paperMaterials.existing[0]) paperMaterials.existing[0].bumpScale = 0.008;

    const creaseData = contract.foldRelations.map(relation => {
      const a = point(relation.axis.a);
      const b = point(relation.axis.b);
      const axis = b.clone().sub(a).normalize();
      const v = new THREE.Vector3(-axis.y, axis.x, 0);
      const childPiece=pieces.get(relation.childId);
      if (v.dot((childPiece.directionCenter||childPiece.flatCenter).clone().sub(a)) < 0) v.negate();
      return { relation, a, b, axis, v, sourceV: { x: v.x, y: -v.y }, length: a.distanceTo(b) };
    });

    function disposePhysicalGeometry() {
      pieces.forEach((piece, id) => {
        const original = originalPieces.get(id);
        if (piece.mesh.geometry !== original.geometry) piece.mesh.geometry.dispose();
        piece.mesh.geometry = original.geometry;
      });
      while (paperBridges.children.length) {
        const mesh = paperBridges.children[0];
        paperBridges.remove(mesh);
        mesh.geometry.dispose();
      }
    }

    function clipCrease(points, crease, child, distance) {
      const a = crease.relation.axis.a;
      const v = crease.sourceV;
      const sign = child ? 1 : -1;
      const value = pointValue => sign * ((pointValue.x - a.x) * v.x + (pointValue.y - a.y) * v.y) - distance;
      return clipEdge(points, pointValue => value(pointValue) >= -1e-7, (p, q) => {
        const t = value(p) / (value(p) - value(q));
        return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
      });
    }

    function paperPanelGeometry(id, polygon, trim) {
      if(options.preserveVoids) return voidPanelGeometry(id,polygon,trim);
      const original = pieces.get(id).flatCenter;
      const cx = original.x + center.x;
      const cy = center.y - original.y;
      const positions = [];
      const normals = [];
      const groups = [];
      const emit = (points, normal, material) => {
        const start = positions.length / 3;
        points.forEach(vertex => {
          positions.push(vertex.x, vertex.y, vertex.z);
          normals.push(normal.x, normal.y, normal.z);
        });
        groups.push({ start, count: points.length, materialIndex: material });
      };
      const local = (source, z) => new THREE.Vector3(source.x - cx, cy - source.y, z);
      const contour = polygon.map(source => new THREE.Vector2(source.x - cx, cy - source.y));
      THREE.ShapeUtils.triangulateShape(contour, []).forEach(([a, b, c]) => {
        const p = contour[a];
        const q = contour[b];
        const r = contour[c];
        if ((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x) < 0) [b, c] = [c, b];
        emit([a, b, c].map(index => local(polygon[index], paperThickness / 2)), new THREE.Vector3(0, 0, 1), 1);
        emit([c, b, a].map(index => local(polygon[index], -paperThickness / 2)), new THREE.Vector3(0, 0, -1), 0);
      });
      let signed = 0;
      polygon.forEach((p, index) => {
        const q = polygon[(index + 1) % polygon.length];
        signed += p.x * q.y - q.x * p.y;
      });
      polygon.forEach((p, index) => {
        const q = polygon[(index + 1) % polygon.length];
        const hingeEdge = trim.some(({ crease, child, distance }) => {
          const a = crease.relation.axis.a;
          const v = crease.sourceV;
          const sign = child ? 1 : -1;
          const on = source => Math.abs(sign * ((source.x - a.x) * v.x + (source.y - a.y) * v.y) - distance) < 2e-5;
          return on(p) && on(q);
        });
        if (hingeEdge) return;
        let a = p;
        let b = q;
        if (signed > 0) [a, b] = [b, a];
        const a0 = local(a, -paperThickness / 2);
        const b0 = local(b, -paperThickness / 2);
        const a1 = local(a, paperThickness / 2);
        const b1 = local(b, paperThickness / 2);
        const normal = new THREE.Vector3().crossVectors(b0.clone().sub(a0), b1.clone().sub(a0)).normalize();
        emit([a0, b0, b1, a0, b1, a1], normal, 2);
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      groups.forEach(group => geometry.addGroup(group.start, group.count, group.materialIndex));
      global.PacVuWhitePaperboard?.applyPhysicalUV(THREE, geometry, { offsetX: cx, offsetY: cy });
      return geometry;
    }

    // Opt-in material boolean for assembly adapters. The legacy T001 path is
    // unchanged. Difference before triangulation handles through holes AND
    // slots touching an outside edge; clipping holes independently does not.
    function materialRegions(definition, boundary) {
      const lib=global.ClipperLib,S=1e5;
      if(!lib)throw new Error('Physical paper void preservation requires ClipperLib');
      const path=points=>points.map(p=>({X:Math.round(p.x*S),Y:Math.round(p.y*S)}));
      const positive=points=>{const p=path(points);if(!lib.Clipper.Orientation(p))p.reverse();return p;};
      const op=new lib.Clipper(),difference=new lib.Paths();
      op.AddPath(positive(definition.polygon),lib.PolyType.ptSubject,true);
      for(const hole of definition.holes||[])op.AddPath(positive(hole),lib.PolyType.ptClip,true);
      op.Execute(lib.ClipType.ctDifference,difference,lib.PolyFillType.pftNonZero,lib.PolyFillType.pftNonZero);
      const clip=new lib.Clipper(),tree=new lib.PolyTree();
      clip.AddPaths(difference,lib.PolyType.ptSubject,true);clip.AddPath(positive(boundary),lib.PolyType.ptClip,true);
      clip.Execute(lib.ClipType.ctIntersection,tree,lib.PolyFillType.pftNonZero,lib.PolyFillType.pftNonZero);
      const result=[],points=node=>node.Contour().map(p=>({x:p.X/S,y:p.Y/S}));
      function visit(node){if(node.Contour().length&&!node.IsHole())result.push({outer:points(node),holes:node.Childs().filter(n=>n.IsHole()).map(points)});node.Childs().forEach(visit);}
      visit(tree);return result;
    }
    function voidPanelGeometry(id,boundary,trims){
      const definition=contract.panels.find(p=>p.id===id),regions=materialRegions(definition,boundary);
      for(const patch of definition.patches||[]){
        let clipped=patch.slice();trims.forEach(t=>{clipped=clipCrease(clipped,t.crease,t.child,t.distance);});
        if(clipped.length>=3)regions.push(...materialRegions({polygon:patch,holes:[]},clipped));
      }
      const shapes=regions.map(region=>{const shape=new THREE.Shape(region.outer.map(p=>new THREE.Vector2(p.x,-p.y)));for(const h of region.holes)shape.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(p.x,-p.y))));return shape;});
      if(!shapes.length)throw new Error('Physical paper: empty material '+id);
      const geometry=new THREE.ExtrudeGeometry(shapes,{depth:paperThickness,bevelEnabled:false,curveSegments:1});
      const original=pieces.get(id).flatCenter;
      geometry.translate(-original.x-center.x,center.y-original.y,-paperThickness/2);
      global.PacVu3DViewer.assignBoardFaceMaterials(geometry,paperThickness,'interior');
      // A manufactured fold has bend surfaces, not a second dark cut wall
      // underneath the bend. Keep real slot/outer boundary walls untouched.
      const positions=geometry.attributes.position,indices=[],groups=[];
      for(const group of geometry.groups){
        const onTrim=group.materialIndex===2&&trims.some(({crease,child,distance})=>distance>1e-6&&[0,1,2].every(j=>{
          const i=group.start+j,x=positions.getX(i)+original.x+center.x,y=center.y-original.y-positions.getY(i),a=crease.relation.axis.a,v=crease.sourceV;
          return Math.abs((child?1:-1)*((x-a.x)*v.x+(y-a.y)*v.y)-distance)<.0003;
        }));
        if(onTrim)continue;
        groups.push({start:indices.length,count:3,materialIndex:group.materialIndex});indices.push(group.start,group.start+1,group.start+2);
      }
      geometry.setIndex(indices);geometry.clearGroups();groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));
      global.PacVuWhitePaperboard?.applyPhysicalUV(THREE,geometry,{tileSize:32/(options.worldUnitsPerSourceUnit||1)});
      geometry.userData.physicalPaper={panelId:id,holesPreserved:true,thickness:paperThickness};
      return geometry;
    }

    function creaseBridge(crease, distance, parentDistance, childDistance, angle) {
      const relation = crease.relation;
      const parent = pieces.get(relation.parentId);
      const child = pieces.get(relation.childId);
      const inverseRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const direction = (mesh, vector) => vector.clone().transformDirection(mesh.matrixWorld).transformDirection(inverseRoot);
      const axis = direction(parent.mesh, crease.axis);
      const normal = direction(parent.mesh, new THREE.Vector3(0, 0, 1));
      const tangent0 = direction(parent.mesh, crease.v);
      const tangent1 = direction(child.mesh, crease.v);
      const sign = new THREE.Vector3().crossVectors(axis, tangent0).dot(normal) >= 0 ? 1 : -1;
      const h = options.bendModel === 'developed-arc' && angle > 1e-5
        ? (2 * distance / angle) * (4 / 3) * Math.tan(angle / 4)
        : Math.abs(angle) < 1e-5 ? distance * 2 / 3
        : distance * (4 / 3) * Math.tan(Math.abs(angle) / 4) / Math.tan(Math.abs(angle) / 2);
      const from = (piece, s, radial) => {
        const source = crease.a.clone().addScaledVector(crease.axis, s).addScaledVector(crease.v, radial).sub(piece.flatCenter);
        return piece.mesh.localToWorld(source).applyMatrix4(inverseRoot);
      };
      const positions = [];
      const normals = [];
      const uv = [];
      const groups = [];
      function vertex(s, u, side) {
        const p0 = from(parent, s, -parentDistance);
        const p3 = from(child, s, childDistance);
        const p1 = p0.clone().addScaledVector(tangent0, h);
        const p2 = p3.clone().addScaledVector(tangent1, -h);
        const v = 1 - u;
        const position = p0.clone().multiplyScalar(v * v * v)
          .addScaledVector(p1, 3 * v * v * u)
          .addScaledVector(p2, 3 * v * u * u)
          .addScaledVector(p3, u * u * u);
        const tangent = p1.clone().sub(p0).multiplyScalar(3 * v * v)
          .addScaledVector(p2.clone().sub(p1), 6 * v * u)
          .addScaledVector(p3.clone().sub(p2), 3 * u * u).normalize();
        const n = new THREE.Vector3().crossVectors(axis, tangent).multiplyScalar(sign).normalize();
        position.addScaledVector(n, side * paperThickness / 2);
        const flat = crease.a.clone().addScaledVector(crease.axis, s)
          .addScaledVector(crease.v, -parentDistance + (parentDistance + childDistance) * u);
        const uvScale=options.worldUnitsPerSourceUnit||1;
        return { p: position, n: n.multiplyScalar(side), uv: [(flat.x + center.x)*uvScale / 32, (center.y - flat.y)*uvScale / 32] };
      }
      function triangle(a, b, c, material, overrideNormal) {
        const n = overrideNormal || a.n;
        if (new THREE.Vector3().crossVectors(b.p.clone().sub(a.p), c.p.clone().sub(a.p)).dot(n) < 0) [b, c] = [c, b];
        const start = positions.length / 3;
        [a, b, c].forEach(item => {
          positions.push(...item.p.toArray());
          normals.push(...(overrideNormal || item.n).toArray());
          uv.push(...item.uv);
        });
        groups.push({ start, count: 3, materialIndex: material });
      }
      const project = source => ({
        s: (source.x - relation.axis.a.x) * crease.axis.x - (source.y - relation.axis.a.y) * crease.axis.y,
        r: (source.x - relation.axis.a.x) * crease.sourceV.x + (source.y - relation.axis.a.y) * crease.sourceV.y
      });
      const total = parentDistance + childDistance;
      if (total < epsilon) return;
      const segments = 12;
      for (const id of [relation.parentId, relation.childId]) {
        const original = contract.panels.find(panel => panel.id === id).polygon;
        for (let index = 0; index < segments; index += 1) {
          const low = -parentDistance + total * index / segments;
          const high = -parentDistance + total * (index + 1) / segments;
          let polygon = clipEdge(original, source => project(source).r >= low - 1e-8, (a, b) => {
            const t = (low - project(a).r) / (project(b).r - project(a).r);
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          });
          polygon = clipEdge(polygon, source => project(source).r <= high + 1e-8, (a, b) => {
            const t = (high - project(a).r) / (project(b).r - project(a).r);
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          });
          if (polygon.length < 3) continue;
          const mapped = source => {
            const projected = project(source);
            return { s: projected.s, u: clamp((projected.r + parentDistance) / total, 0, 1) };
          };
          const regions=options.preserveVoids?materialRegions(contract.panels.find(p=>p.id===id),polygon):[{outer:polygon,holes:[]}];
          for(const region of regions){
          const boundary=region.outer,holes=region.holes,vertices2D=[...boundary,...holes.flat()];
          const contour = boundary.map(source => new THREE.Vector2(source.x, source.y));
          for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(contour, holes.map(h=>h.map(p=>new THREE.Vector2(p.x,p.y))))) {
            for (const side of [-1, 1]) {
              const vertices = [a, b, c].map(vertexIndex => {
                const value = mapped(vertices2D[vertexIndex]);
                return vertex(value.s, value.u, side);
              });
              triangle(...vertices, side > 0 ? 1 : 0);
            }
          }
          for(const ring of [boundary,...holes])ring.forEach((p, polygonIndex) => {
            const q = ring[(polygonIndex + 1) % ring.length];
            const projectedP = project(p).r;
            const projectedQ = project(q).r;
            if (Math.abs(projectedP - projectedQ) < 1e-7 && [low, high, 0].some(value => Math.abs(projectedP - value) < 1e-7)) return;
            const a = mapped(p);
            const b = mapped(q);
            const v0 = vertex(a.s, a.u, -1);
            const v1 = vertex(b.s, b.u, -1);
            const v2 = vertex(b.s, b.u, 1);
            const v3 = vertex(a.s, a.u, 1);
            const sideNormal = new THREE.Vector3().crossVectors(v1.p.clone().sub(v0.p), v2.p.clone().sub(v0.p)).normalize();
            triangle(v0, v1, v2, 2, sideNormal);
            triangle(v0, v2, v3, 2, sideNormal);
          });
          }
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv1', new THREE.Float32BufferAttribute(uv, 2));
      groups.forEach(group => geometry.addGroup(group.start, group.count, group.materialIndex));
      const mesh = new THREE.Mesh(geometry, paperMaterials[materialMode]);
      mesh.name = (options.bridgeNamePrefix || 'Rounded paper ') + relation.id;
      mesh.castShadow = options.preserveVoids ? parent.mesh.castShadow&&child.mesh.castShadow : true;
      mesh.receiveShadow = options.preserveVoids ? parent.mesh.receiveShadow&&child.mesh.receiveShadow : true;
      paperBridges.add(mesh);
    }

    function contactSurface(id, face, polygons) {
      const piece = pieces.get(id);
      const polygon = polygons?.get(id) || contract.panels.find(panel => panel.id === id).polygon;
      return polygon.map(source => {
        const local = point(source).sub(piece.flatCenter);
        local.z = face * paperThickness / 2;
        return piece.mesh.localToWorld(local);
      });
    }

    function adhesiveOverlap(relation, polygons) {
      const target = pieces.get(relation.to).mesh;
      const project = source => {
        const local = target.worldToLocal(source.clone());
        return { x: local.x, y: local.y };
      };
      const boundary = contactSurface(relation.to, relation.toFace, polygons).map(project);
      let overlap = contactSurface(relation.from, relation.fromFace, polygons).map(project);
      const winding = Math.sign(boundary.reduce((sum, a, index) => {
        const b = boundary[(index + 1) % boundary.length];
        return sum + a.x * b.y - b.x * a.y;
      }, 0));
      boundary.forEach((a, index) => {
        const b = boundary[(index + 1) % boundary.length];
        const side = source => winding * ((b.x - a.x) * (source.y - a.y) - (b.y - a.y) * (source.x - a.x));
        overlap = clipEdge(overlap, source => side(source) >= -1e-9, (p, q) => {
          const fraction = side(p) / (side(p) - side(q));
          return { x: p.x + (q.x - p.x) * fraction, y: p.y + (q.y - p.y) * fraction };
        });
      });
      return cleanPolygon(overlap, epsilon);
    }

    function recordAdhesiveContacts(polygons) {
      adhesiveContacts = contract.adhesiveRelations.map(relation => {
        const moving = pieces.get(relation.from).mesh;
        const target = pieces.get(relation.to).mesh;
        const normal = new THREE.Vector3(0, 0, relation.toFace).transformDirection(target.matrixWorld);
        const fromNormal = new THREE.Vector3(0, 0, relation.fromFace).transformDirection(moving.matrixWorld);
        const polygon = adhesiveOverlap(relation, polygons);
        const targetPoint = target.localToWorld(new THREE.Vector3(0, 0, relation.toFace * paperThickness / 2));
        const gaps = contactSurface(relation.from, relation.fromFace, polygons).map(source => source.sub(targetPoint).dot(normal));
        return {
          id: relation.id,
          type: relation.type,
          opposedNormalDot: normal.dot(fromNormal),
          overlapAreaMm2: polygonArea(polygon),
          minGapMm: Math.min(...gaps),
          maxGapMm: Math.max(...gaps),
          contactPolygon: polygon.map(source => target.localToWorld(
            new THREE.Vector3(source.x, source.y, relation.toFace * paperThickness / 2)
          ).toArray())
        };
      });
    }

    function seatAdhesiveFaces(progress) {
      for (const relation of contract.adhesiveRelations) {
        const moving = pieces.get(relation.from).mesh;
        const target = pieces.get(relation.to).mesh;
        const targetNormal = new THREE.Vector3(0, 0, relation.toFace).transformDirection(target.matrixWorld);
        const movingNormal = new THREE.Vector3(0, 0, relation.fromFace).transformDirection(moving.matrixWorld);
        if (targetNormal.dot(movingNormal) > -1 + 1e-8) continue;
        if (polygonArea(adhesiveOverlap(relation)) <= epsilon) continue;
        const foldEnd = Math.max(...contract.foldRelations
          .filter(item => item.childId === relation.from || item.childId === relation.to)
          .map(item => item.phase[1]));
        const weight = phase(progress, [foldEnd, Math.max(foldEnd + 1e-6, relation.phase[1])]);
        const targetPoint = target.localToWorld(new THREE.Vector3(0, 0, relation.toFace * paperThickness / 2));
        const movingPoint = moving.localToWorld(new THREE.Vector3(0, 0, relation.fromFace * paperThickness / 2));
        const signedGap = movingPoint.clone().sub(targetPoint).dot(targetNormal);
        const correction = targetNormal.multiplyScalar(-signedGap * weight);
        const origin = moving.getWorldPosition(new THREE.Vector3());
        const localOrigin = moving.parent.worldToLocal(origin.clone());
        const localTarget = moving.parent.worldToLocal(origin.add(correction));
        moving.position.add(localTarget.sub(localOrigin));
        root.updateMatrixWorld(true);
      }
    }

    function rebuild(progress) {
      options.beforeRebuild?.({ progress, paperThickness, phase, creaseData });
      root.updateMatrixWorld(true);
      seatAdhesiveFaces(progress);
      disposePhysicalGeometry();
      const trims = new Map(contract.panels.map(panel => [panel.id, []]));
      const creases = creaseData.map(crease => {
        const hinge = hinges.find(item => item.relationId === crease.relation.id);
        const angle = options.hingeAngle ? options.hingeAngle(crease,hinge) : 2 * Math.acos(clamp(Math.abs(hinge.object.quaternion.w), 0, 1));
        // Opt-in developed bend allowance stays finite through a 180° press.
        // Legacy owners retain the tangent-intersection construction.
        const distance = paperThickness * 0.75 * (options.bendModel === 'developed-arc' ? angle / 2 : Math.tan(angle / 2));
        let parentDistance = distance;
        let childDistance = distance;
        if (options.bendModel !== 'developed-arc' && Math.sin(angle) > 1e-5) {
          const parent = pieces.get(crease.relation.parentId);
          const child = pieces.get(crease.relation.childId);
          const a = crease.v.clone().transformDirection(parent.mesh.matrixWorld);
          const b = crease.v.clone().transformDirection(child.mesh.matrixWorld);
          const cosine = a.dot(b);
          const sine = Math.sqrt(Math.max(0, 1 - cosine * cosine));
          const normal = b.clone().addScaledVector(a, -cosine).normalize();
          const origin = piece => piece.mesh.localToWorld(crease.a.clone().sub(piece.flatCenter));
          const delta = origin(child).sub(origin(parent)).multiplyScalar(1/(options.worldUnitsPerSourceUnit||1));
          const along = delta.dot(a);
          const across = delta.dot(normal);
          if (sine > 1e-5) {
            parentDistance += -along + across * cosine / sine;
            childDistance -= across / sine;
          }
          parentDistance = Math.max(0, parentDistance);
          childDistance = Math.max(0, childDistance);
        }
        if(!options.preserveVoids||angle>1e-7){
          trims.get(crease.relation.parentId).push({ crease, child: false, distance: parentDistance });
          trims.get(crease.relation.childId).push({ crease, child: true, distance: childDistance });
        }
        return { crease, distance, parentDistance, childDistance, angle };
      });
      const polygons = new Map();
      contract.panels.forEach(definition => {
        let polygon = definition.polygon.slice();
        trims.get(definition.id).forEach(trim => {
          polygon = clipCrease(polygon, trim.crease, trim.child, trim.distance);
        });
        if (polygon.length < 3) throw new Error('Physical paper: crease trim removed ' + definition.id);
        polygons.set(definition.id, polygon);
        pieces.get(definition.id).mesh.geometry = paperPanelGeometry(definition.id, polygon, trims.get(definition.id));
      });
      creases.forEach(({ crease, distance, parentDistance, childDistance, angle }) => {
        if (distance < 1e-5) return;
        creaseBridge(crease, distance, parentDistance, childDistance, angle);
      });
      recordAdhesiveContacts(polygons);
      options.afterRebuild?.({ progress, paperThickness, polygons });
    }

    function setThickness(value) {
      const precision=options.thicknessPrecision||100;
      paperThickness = Math.round(clamp(Number(value) || originalThickness, options.minThickness || 0.25, options.maxThickness || 0.8) * precision) / precision;
      return paperThickness;
    }

    function setMaterialMode(mode, physical) {
      materialMode = mode === 'white' ? 'white' : 'existing';
      pieces.forEach(piece => {
        piece.mesh.material = physical ? paperMaterials[materialMode] : options.materialSets[materialMode];
      });
      paperBridges.children.forEach(mesh => {
        mesh.material = physical ? paperMaterials[materialMode] : options.materialSets[materialMode];
      });
    }

    function restore() {
      disposePhysicalGeometry();
      adhesiveContacts = [];
    }

    function dispose() {
      disposePhysicalGeometry();
      Object.values(paperMaterials).flat().forEach(material => material.dispose());
      root.remove(paperBridges);
    }

    return Object.freeze({
      rebuild,
      restore,
      setThickness,
      setMaterialMode,
      dispose,
      refreshMaterials() {
        Object.values(paperMaterials).flat().forEach(material => { material.needsUpdate = true; });
      },
      getAdhesiveContacts() {
        return JSON.parse(JSON.stringify(adhesiveContacts));
      },
      get thickness() { return paperThickness; }
    });
  }

  /* Contract geometry, independent of the legacy T001 create()/rebuild() path.
   * Produces flat, part-local meshes only; never poses/reparents caller objects.
   * THREE, ClipperLib and Contract validator are explicit dependencies.
   * Curves are tessellated for display only; Contract paths remain untouched.
   * XY maps to (x,-y), Z and material sides follow faceConvention. UV stores
   * original part-local millimetres, not an inferred design/atlas placement.
   */
  function createContractGeometry(options) {
    const { THREE, ClipperLib: lib } = options;
    const validator = options.validator || global.PacVu3DContract;
    const contract = options.contract || options.prepared?.contract;
    if (!THREE?.ShapeUtils || !lib?.Clipper || !validator?.validate)
      throw new Error('Physical geometry requires THREE, ClipperLib and PacVu3DContract.');
    const validation = validator.validate(contract);
    if (!validation.ok) throw new Error('Physical geometry: invalid Contract: ' + JSON.stringify(validation.errors));
    const tolerance = options.curveToleranceMm ?? 0.05;
    if (!Number.isFinite(tolerance) || tolerance < 0.0001 || tolerance > 1)
      throw new Error('Physical geometry: curveToleranceMm must be 0.0001..1.');
    const SCALE = 1e6, EPS = 4 / SCALE;
    const paths = new Map(contract.paths.map(p => [p.id, p]));
    const holes = new Map(contract.holes.map(h => [h.id, h]));
    const diagnostics = [], panels = [], cache = new Map();
    const diagnostic = (code, id, message, severity = 'warning') => diagnostics.push({code, id, message, severity});
    const pt = p => ({x:p.x, y:p.y});
    const cross = (a,b,c) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    const length = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const signedArea = p => p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y;},0)/2;
    const on = (p,a,b) => Math.abs(cross(a,b,p)) <= EPS*Math.max(1,length(a,b)) &&
      (p.x-a.x)*(p.x-b.x)+(p.y-a.y)*(p.y-b.y) <= EPS*Math.max(EPS,length(a,b));
    const integer = p => ({X:Math.round(p.x*SCALE),Y:Math.round(p.y*SCALE)});
    const decimal = p => ({x:p.X/SCALE,y:p.Y/SCALE});
    const loop = p => {const a=p.map(integer);if(!lib.Clipper.Orientation(a))a.reverse();return a;};
    const pointLineDistance = (p,a,b) => {
      const d=(b.x-a.x)**2+(b.y-a.y)**2;
      const t=d?Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/d)):0;
      return length(p,{x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)});
    };
    function sample(path) {
      if(cache.has(path.id))return cache.get(path.id);
      const edges=[],points=[pt(path.start)];let a=pt(path.start);
      function bezier(control,out,depth=0) {
        if(control.slice(1,-1).every(p=>pointLineDistance(p,control[0],control.at(-1))<=tolerance)) {out.push(pt(control.at(-1)));return;}
        if(depth>=20)throw new Error('Physical geometry: curve subdivision limit '+path.id);
        const levels=[control];while(levels.at(-1).length>1){const c=levels.at(-1);levels.push(c.slice(1).map((p,i)=>({x:(p.x+c[i].x)/2,y:(p.y+c[i].y)/2})));}
        bezier(levels.map(l=>l[0]),out,depth+1);bezier(levels.map(l=>l.at(-1)).reverse(),out,depth+1);
      }
      for(const segment of path.segments) {
        const out=[],b=segment.to;
        if(segment.type==='line')out.push(pt(b));
        else if(segment.type==='quadratic')bezier([a,segment.control,b],out);
        else if(segment.type==='cubic')bezier([a,segment.control1,segment.control2,b],out);
        else {
          // SVG endpoint arc -> center parameterization (radii correction included).
          if(length(a,b)<EPS)throw new Error('Physical geometry: degenerate arc '+path.id);
          const phi=segment.rotationDeg*Math.PI/180,co=Math.cos(phi),si=Math.sin(phi);
          const dx=(a.x-b.x)/2,dy=(a.y-b.y)/2,x=co*dx+si*dy,y=-si*dx+co*dy;
          let rx=segment.rx,ry=segment.ry;const ratio=x*x/(rx*rx)+y*y/(ry*ry);
          if(ratio>1){rx*=Math.sqrt(ratio);ry*=Math.sqrt(ratio);}
          const factor=(segment.largeArc===segment.sweep?-1:1)*Math.sqrt(Math.max(0,(rx*rx*ry*ry-rx*rx*y*y-ry*ry*x*x)/(rx*rx*y*y+ry*ry*x*x)));
          const cxp=factor*rx*y/ry,cyp=-factor*ry*x/rx;
          const cx=co*cxp-si*cyp+(a.x+b.x)/2,cy=si*cxp+co*cyp+(a.y+b.y)/2;
          const start=Math.atan2((y-cyp)/ry,(x-cxp)/rx);
          let delta=Math.atan2((-y-cyp)/ry,(-x-cxp)/rx)-start;
          if(segment.sweep&&delta<0)delta+=2*Math.PI;if(!segment.sweep&&delta>0)delta-=2*Math.PI;
          const step=2*Math.acos(Math.max(-1,1-tolerance/Math.max(rx,ry)));
          const count=Math.max(1,Math.ceil(Math.abs(delta)/step));
          if(!Number.isFinite(count)||count>65536)throw new Error('Physical geometry: arc subdivision limit '+path.id);
          for(let i=1;i<=count;i++){const t=start+delta*i/count;out.push(i===count?pt(b):{x:cx+co*rx*Math.cos(t)-si*ry*Math.sin(t),y:cy+si*rx*Math.cos(t)+co*ry*Math.sin(t)});}
        }
        let previous=a;for(const p of out){if(length(previous,p)>EPS){edges.push({a:pt(previous),b:pt(p),segmentId:segment.id});points.push(pt(p));}previous=p;}a=pt(b);
      }
      if(path.closed&&length(points[0],points.at(-1))<=EPS)points.pop();
      const result={points,edges};cache.set(path.id,result);return result;
    }
    function boolean(subject,clip,type) {
      const op=new lib.Clipper();op.StrictlySimple=true;op.PreserveCollinear=true;
      op.AddPaths(subject,lib.PolyType.ptSubject,true);
      if(clip.length)op.AddPaths(clip,lib.PolyType.ptClip,true);
      const tree=new lib.PolyTree();op.Execute(type,tree,lib.PolyFillType.pftNonZero,lib.PolyFillType.pftNonZero);return tree;
    }
    function rings(tree) {
      const result=[];
      function visit(node){for(const child of node.Childs()){if(!child.IsHole())result.push({outer:child.Contour().map(decimal),holes:child.Childs().filter(h=>h.IsHole()).map(h=>h.Contour().map(decimal))});visit(child);}}
      visit(tree);return result;
    }
    const flatPaths = tree => lib.Clipper.PolyTreeToPaths(tree);
    const materialThickness=new Map(contract.materials.map(m=>{
      const override=options.thicknessByMaterial?.[m.id],t=override===undefined?m.thicknessMm:override;
      if(!Number.isFinite(t)||t<=0)throw new Error('Physical geometry: explicit positive thickness required for '+m.id);
      return [m.id,t];
    }));
    const parts=contract.parts.map(p=>({id:p.id,materialId:p.materialId,thicknessMm:materialThickness.get(p.materialId),panelIds:p.panelIds.slice()}));
    try {
      for(const panel of contract.panels) {
        const part=parts.find(p=>p.id===panel.partId),thickness=part.thicknessMm;
        const boundaries=[],allRegions=[],zeroSlits=[],kerfs=[];
        for(const region of panel.regions) {
          const path=paths.get(region.outerPathId),outer=sample(path);
          const bindings=new Map(region.boundaryBindings.flatMap(b=>b.segmentIds.map(id=>[id,b])));
          outer.edges.forEach(e=>boundaries.push({...e,...bindings.get(e.segmentId),regionId:region.id}));
          const holeLoops=region.holeIds.map(id=>{
            const h=sample(paths.get(holes.get(id).boundaryPathId));
            h.edges.forEach(e=>boundaries.push({...e,kind:'cut',featureId:id,hole:true}));return loop(h.points);
          });
          const tree=boolean([loop(outer.points)],holeLoops,lib.ClipType.ctDifference);
          allRegions.push(...flatPaths(tree));
        }
        let tree=boolean(allRegions,[],lib.ClipType.ctUnion);
        for(const slit of contract.slits.filter(s=>s.panelIds.includes(panel.id))) {
          const line=sample(paths.get(slit.pathId));
          if(slit.kerfMm===0)zeroSlits.push(...line.edges.map(e=>({...e,featureId:slit.id})));
          else {
            const offset=new lib.ClipperOffset(2,tolerance*SCALE),out=new lib.Paths();
            offset.AddPath(line.points.map(integer),lib.JoinType.jtMiter,lib.EndType.etOpenButt);
            offset.Execute(out,slit.kerfMm*SCALE/2);kerfs.push(...out);
            for(const ring of out){const p=ring.map(decimal);p.forEach((a,i)=>boundaries.push({a,b:p[(i+1)%p.length],kind:'slit',featureId:slit.id}));}
          }
        }
        if(kerfs.length)tree=boolean(flatPaths(tree),kerfs,lib.ClipType.ctDifference);
        const regions=rings(tree);
        if(!regions.length)throw new Error('Physical geometry: no material remains in panel '+panel.id);
        const positions=[],normals=[],uv=[],groups=[],walls=[];
        const emit=(vertices,normal,material)=>{
          const start=positions.length/3;
          let v=vertices;
          const ab=new THREE.Vector3().subVectors(v[1],v[0]),ac=new THREE.Vector3().subVectors(v[2],v[0]);
          if(ab.cross(ac).dot(normal)<0)v=[v[0],v[2],v[1]];
          for(const p of v){positions.push(p.x,p.y,p.z);normals.push(normal.x,normal.y,normal.z);uv.push(p.x,-p.y);}
          const last=groups.at(-1);if(last&&last.materialIndex===material)last.count+=3;else groups.push({start,count:3,materialIndex:material});
        };
        const vector=(p,z)=>new THREE.Vector3(p.x,-p.y,z);
        // Non-indexed cap triangles are split along zero-kerf slit banks. No
        // opening width/removed area is invented; flat banks occupy same line.
        function splitTriangle(triangle) {
          let cells=[triangle];
          const splitLines=zeroSlits.flatMap(s=>{
            const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y;
            return [s,...[s.a,s.b].map(a=>({a,b:{x:a.x-dy,y:a.y+dx}}))];
          });
          for(const slit of splitLines){
            cells=cells.flatMap(cell=>{
              const values=cell.map(p=>cross(slit.a,slit.b,p));
              if(!values.some(v=>v>EPS)||!values.some(v=>v<-EPS))return [cell];
              const clip=sign=>clipEdge(cell,p=>sign*cross(slit.a,slit.b,p)>=-1e-10,(a,b)=>{
                const va=cross(slit.a,slit.b,a),vb=cross(slit.a,slit.b,b),t=va/(va-vb);return {x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)};
              });return [clip(1),clip(-1)].filter(c=>c.length>=3);
            });
          }return cells.flatMap(c=>c.slice(1,-1).map((p,i)=>[c[0],p,c[i+2]]));
        }
        let area=0,triangleArea=0;
        for(const region of regions){
          area+=polygonArea(region.outer)-region.holes.reduce((s,h)=>s+polygonArea(h),0);
          const outer=region.outer.map(p=>new THREE.Vector2(p.x,p.y));
          const inner=region.holes.map(h=>h.map(p=>new THREE.Vector2(p.x,p.y)));
          const all=outer.concat(...inner);
          for(const indices of THREE.ShapeUtils.triangulateShape(outer,inner)){
            const t=indices.map(i=>all[i]);triangleArea+=Math.abs(cross(...t))/2;
            for(const triangle of splitTriangle(t))if(Math.abs(cross(...triangle))>EPS*EPS)for(const side of [-1,1]){
              const outside=panel.faceConvention.outside===(side>0?'positiveZ':'negativeZ');
              emit(triangle.map(p=>vector(p,side*thickness/2)),new THREE.Vector3(0,0,side),outside?0:1);
            }
          }
        }
        if(Math.abs(triangleArea-area)>Math.max(1e-5,area*1e-7))throw new Error('Physical geometry: incomplete triangulation '+panel.id);
        function wall(a,b,kind,featureId,reverse=false){
          if(length(a,b)<EPS)return;
          const a0=vector(a,-thickness/2),b0=vector(b,-thickness/2),a1=vector(a,thickness/2),b1=vector(b,thickness/2);
          const normal=new THREE.Vector3(b0.y-a0.y,a0.x-b0.x,0).normalize();if(reverse)normal.negate();
          emit([a0,b0,b1],normal,2);emit([a0,b1,a1],normal,2);
          walls.push({a:pt(a),b:pt(b),kind,featureId});
        }
        function cutRing(ring,hole){
          // In source Y-down space, positive winding becomes clockwise in 3D.
          let points=ring.slice();if((signedArea(points)>0)!==!hole)points.reverse();
          for(let i=0;i<points.length;i++){
            const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
            const ts=[0,1];for(const e of boundaries)for(const p of [e.a,e.b])if(on(p,a,b))ts.push(((p.x-a.x)*dx+(p.y-a.y)*dy)/d);
            ts.sort((a,b)=>a-b);const unique=ts.filter((t,i)=>!i||t-ts[i-1]>1e-8);
            for(let j=1;j<unique.length;j++){
              const p={x:a.x+dx*unique[j-1],y:a.y+dy*unique[j-1]},q={x:a.x+dx*unique[j],y:a.y+dy*unique[j]};
              const matches=boundaries.filter(e=>on(p,e.a,e.b)&&on(q,e.a,e.b));
              const binding=matches.find(e=>e.hole)||matches.find(e=>e.kind==='slit')||matches.find(e=>e.kind==='cut')||matches[0];
              if(binding?.kind==='cut'||binding?.kind==='slit')wall(p,q,binding.kind,binding.featureId,true);
              else if(!binding)diagnostic('UNCLASSIFIED_BOUNDARY',panel.id,'No manufactured wall inferred for an unmatched boundary.','blocking');
              else if(binding.source?.mechanicalMapping==='unresolved')diagnostic('UNRESOLVED_BOUNDARY',panel.id,'Continuous boundary retained without inferring a cut.','blocking');
            }
          }
        }
        for(const region of regions){cutRing(region.outer,false);region.holes.forEach(h=>cutRing(h,true));}
        function inside(p,ring){return lib.Clipper.PointInPolygon(integer(p),ring.map(integer))===1;}
        for(const slit of zeroSlits){
          const a=slit.a,b=slit.b,dx=b.x-a.x,dy=b.y-a.y,ts=[0,1];
          for(const region of regions)for(const ring of [region.outer,...region.holes])ring.forEach((p,i)=>{
            const q=ring[(i+1)%ring.length],ex=q.x-p.x,ey=q.y-p.y,den=dx*ey-dy*ex;
            if(Math.abs(den)<1e-12)return;
            const t=((p.x-a.x)*ey-(p.y-a.y)*ex)/den,u=((p.x-a.x)*dy-(p.y-a.y)*dx)/den;
            if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);
          });ts.sort((a,b)=>a-b);
          for(let i=1;i<ts.length;i++){
            const mid=(ts[i-1]+ts[i])/2,p={x:a.x+dx*mid,y:a.y+dy*mid};
            if(!regions.some(r=>inside(p,r.outer)&&!r.holes.some(h=>inside(p,h))))continue;
            const from={x:a.x+dx*ts[i-1],y:a.y+dy*ts[i-1]},to={x:a.x+dx*ts[i],y:a.y+dy*ts[i]};
            wall(from,to,'slit',slit.featureId);wall(from,to,'slit',slit.featureId,true);
          }
        }
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
        geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));
        geometry.computeBoundingBox();geometry.computeBoundingSphere();
        geometry.userData.physicalPaper={panelId:panel.id,partId:panel.partId,uvUnits:'mm'};
        panels.push({id:panel.id,partId:panel.partId,geometry,regions,walls,areaMm2:area,thicknessMm:thickness});
      }
      for(const key of ['perforations','layers','glues','insertions','bonds'])if(contract[key].length)diagnostic('ASSEMBLY_FEATURE_DEFERRED',key,'Retained in Contract; not executed by flat geometry.');
      if(contract.folds.length)diagnostic('FOLD_POSE_DEFERRED','folds','Crease walls omitted; assembly and rounded crease surfaces are not executed here.');
      if(contract.source?.unresolvedFeatures?.length||contract.source?.unresolvedRelations?.length)diagnostic('SOURCE_UNRESOLVED','source','Source diagnostics remain unresolved.');
      let disposed=false;
      return {parts,panels,diagnostics,curveToleranceMm:tolerance,assemblyReady:false,
        complete:!diagnostics.some(d=>d.severity==='blocking'),
        dispose(){if(!disposed){panels.forEach(p=>p.geometry.dispose());disposed=true;}}};
    } catch(error){panels.forEach(p=>p.geometry.dispose());throw error;}
  }

  /* Stage 4: explicit static physical pose, NOT an Assembly Runtime connection.
   * Caller supplies poses keyed by Contract fold ID: {angleDeg, innerRadiusMm,
   * neutralAxisFraction?, stackOffsetMm?}. angleDeg is right-hand rotation about
   * the source a->b axis after XY -> (x,-y). Neutral fraction runs -Z(0) to +Z(1).
   * material-defined neutral axes MUST be supplied; midplane defaults to .5.
   * Finite bend allowance = neutralRadius * abs(angle); a centered source band
   * is deformed, not discarded. Outside that band the panels remain rigid.
   * No inferred angles, animation, layer order, contacts, runtime or scene hooks.
   * placements is an optional partId -> rigid Matrix4.elements (no scaling).
   * contacts: [{id,from:{panelId,side},to:{panelId,side},clearanceMm,mode}].
   * mode='measure'|'seat'. Seating translates the WHOLE free fold component,
   * never an individual member of a fold chain. Connected face pairs measure
   * only. Cyclic/repeated-mover seating declarations are rejected explicitly.
   * Planar cap patches only are contact candidates; bent strips are excluded.
   * Returned regions/walls/areaMm2 remain flat source metadata; geometry is posed
   * and matrix describes the panel's rigid tangent frame, not the curved band.
   */
  function createPhysicalPose(options) {
    if(options.assemblyPose)return createAssemblyPhysicalPose(options);
    const {THREE,ClipperLib:lib}=options;
    const contract=options.contract||options.prepared?.contract;
    const flat=createContractGeometry(options);
    const EPS=1e-7,stepDeg=options.maxAngleStepDeg??5;
    const poses=options.poses||{},geometries=[];
    const fail=message=>{throw new Error('Physical pose: '+message);};
    try {
      if(!Number.isFinite(stepDeg)||stepDeg<.5||stepDeg>15)fail('maxAngleStepDeg must be .5..15');
      if(contract.panels.some(p=>p.rigidWith!==undefined))fail('rigidWith patches need an explicit physical-region binding before posing');
      const definitions=new Map(contract.panels.map(p=>[p.id,p]));
      const panels=new Map(flat.panels.map(p=>[p.id,{...p,transform:new THREE.Matrix4(),triangles:[]}])) ;
      const foldIds=new Set(contract.folds.map(f=>f.id));
      for(const key of Object.keys(poses))if(!foldIds.has(key))fail('unknown fold '+key);
      const parentFold=new Map(contract.folds.map(f=>[f.childPanelId,f]));
      const vector=p=>new THREE.Vector3(p.x,-p.y,0);
      const dot=(v,a,d)=>v.clone().sub(a).dot(d);
      const diagnostics=flat.diagnostics.filter(d=>d.code!=='FOLD_POSE_DEFERRED');
      const folds=contract.folds.map(f=>{
        const input=poses[f.id];
        if(!input||!Number.isFinite(input.angleDeg)||Math.abs(input.angleDeg)>180)fail('explicit -180..180 angle required for '+f.id);
        const parent=panels.get(f.parentPanelId),child=panels.get(f.childPanelId),t=parent.thicknessMm;
        if(Math.abs(child.thicknessMm-t)>EPS)fail('fold cannot join unequal sheet thicknesses: '+f.id);
        if(!['crease','returnFold'].includes(f.profile.kind))fail('unsupported fold profile '+f.profile.kind);
        if(!f.profile.thicknessAware)fail('thickness-aware fold profile required: '+f.id);
        if(f.source?.kind==='assembly-only')fail('assembly-only axis is not a manufactured crease: '+f.id);
        const fraction=input.neutralAxisFraction??(f.profile.neutralAxis==='midplane'?.5:undefined);
        if(!Number.isFinite(fraction)||fraction<0||fraction>1)fail('explicit neutralAxisFraction required for '+f.id);
        const radius=input.innerRadiusMm,stack=input.stackOffsetMm??0;
        if(!Number.isFinite(radius)||radius<=0||!Number.isFinite(stack)||stack<0)fail('positive innerRadiusMm and nonnegative stackOffsetMm required for '+f.id);
        const a=vector(f.axis.a),b=vector(f.axis.b),axis=b.clone().sub(a).normalize(),left=new THREE.Vector3(-axis.y,axis.x,0);
        // No manufactured crease is invented from a curved/mismatched source.
        for(const ref of f.segments){
          const path=contract.paths.find(p=>p.id===ref.pathId);
          if(path.segments.some(s=>s.type!=='line')||[path.start,...path.segments.map(s=>s.to)].some(p=>Math.abs(dot(vector(p),a,left))>1e-4))fail('crease/axis mismatch or curved crease: '+f.id);
        }
        function extent(panel,d){let min=Infinity,max=-Infinity;const pos=panel.geometry.attributes.position;for(let i=0;i<pos.count;i++){const r=dot(new THREE.Vector3().fromBufferAttribute(pos,i),a,d);min=Math.min(min,r);max=Math.max(max,r);}return {min,max};}
        const e=extent(child,left);let side;
        if(e.min>=-1e-4&&e.max>EPS)side=1;else if(e.max<=1e-4&&e.min<-EPS)side=-1;else fail('child panel straddles fold axis: '+f.id);
        const radial=left.clone().multiplyScalar(side),pe=extent(parent,radial),ce=extent(child,radial);
        if(pe.max>1e-4||pe.min>=-EPS)fail('parent/child do not lie on opposing crease sides: '+f.id);
        const theta=input.angleDeg*Math.PI/180,sign=Math.sign(theta)||1,neutralZ=(fraction-.5)*t;
        const innerDistance=side*sign>0?t/2-neutralZ:t/2+neutralZ;
        const neutralRadius=innerDistance+radius+stack/2,allowance=neutralRadius*Math.abs(theta),half=allowance/2;
        if(half>Math.min(-pe.min,ce.max)-EPS&&Math.abs(theta)>EPS)fail('BEND_BAND_TOO_WIDE: '+f.id+'; panel retained, no result substituted');
        // Child rigid transform is the tangent frame at the end of the band.
        const rotation=new THREE.Matrix4().makeRotationAxis(axis,theta);
        const end=a.clone().addScaledVector(radial,-half+neutralRadius*Math.sin(Math.abs(theta)))
          .add(new THREE.Vector3(0,0,neutralZ+side*sign*neutralRadius*(1-Math.cos(theta))));
        const start=a.clone().addScaledVector(radial,half).add(new THREE.Vector3(0,0,neutralZ));
        const shift=end.clone().sub(start.clone().applyMatrix4(rotation));rotation.setPosition(shift);
        return {id:f.id,parentId:f.parentPanelId,childId:f.childPanelId,partId:f.axis.partId,a,axis,radial,side,theta,sign,
          neutralZ,neutralRadius,innerRadiusMm:radius,stackOffsetMm:stack,half,allowance,rotation};
      });
      const depth=id=>{let n=0;while(parentFold.has(id)){id=parentFold.get(id).parentPanelId;n++;}return n;};
      folds.sort((a,b)=>depth(b.childId)-depth(a.childId));
      const descends=(id,ancestor)=>{while(id!==ancestor&&parentFold.has(id))id=parentFold.get(id).parentPanelId;return id===ancestor;};
      const component=id=>{while(parentFold.has(id))id=parentFold.get(id).parentPanelId;return id;};
      // Preserve source coordinates per vertex across subdivisions and transforms.
      for(const panel of panels.values()){
        const geometry=panel.geometry,p=geometry.attributes.position,n=geometry.attributes.normal;
        for(const group of geometry.groups)for(let i=group.start;i<group.start+group.count;i+=3){
          const triangle=[];for(let k=0;k<3;k++){const point=new THREE.Vector3().fromBufferAttribute(p,i+k);triangle.push({source:point.clone(),point,normal:new THREE.Vector3().fromBufferAttribute(n,i+k)});}
          panel.triangles.push({vertices:triangle,material:group.materialIndex});
        }
      }
      const interpolate=(a,b,t)=>({source:a.source.clone().lerp(b.source,t),point:a.point.clone().lerp(b.point,t),normal:a.normal.clone().lerp(b.normal,t).normalize()});
      function clip(cell,value,positive){
        const result=[];let previous=cell.at(-1),pv=value(previous),pi=positive?pv>=-1e-10:pv<=1e-10;
        for(const current of cell){const cv=value(current),ci=positive?cv>=-1e-10:cv<=1e-10;
          if(ci!==pi)result.push(interpolate(previous,current,pv/(pv-cv)));if(ci)result.push(current);
          previous=current;pv=cv;pi=ci;
        }return result;
      }
      function area(cell){let result=0;for(let i=1;i<cell.length-1;i++)result+=cell[i].source.clone().sub(cell[0].source).cross(cell[i+1].source.clone().sub(cell[0].source)).length()/2;return result;}
      // Independent cylindrical strips cannot overlap on the same paper patch.
      for(const panel of panels.values()){
        const bands=folds.filter(f=>Math.abs(f.theta)>EPS&&[f.parentId,f.childId].includes(panel.id));
        for(let i=0;i<bands.length;i++)for(let j=i+1;j<bands.length;j++)for(const tri of panel.triangles.filter(t=>t.material!==2)){
          let cell=tri.vertices;for(const f of [bands[i],bands[j]]){
            const low=panel.id===f.parentId?-f.half:0,high=panel.id===f.parentId?0:f.half;
            if(cell.length)cell=clip(cell,v=>dot(v.source,f.a,f.radial)-low,true);
            if(cell.length)cell=clip(cell,v=>dot(v.source,f.a,f.radial)-high,false);
          }
          if(cell.length>=3&&area(cell)>1e-7)fail('OVERLAPPING_BEND_BANDS: '+panel.id);
        }
      }
      for(const f of folds){
        if(Math.abs(f.theta)<EPS)continue;
        const slices=Math.max(2,Math.ceil(Math.abs(f.theta)*180/Math.PI/stepDeg));
        const cuts=Array.from({length:slices+1},(_,i)=>-f.half+f.allowance*i/slices);
        const rigidNormal=new THREE.Matrix3().getNormalMatrix(f.rotation);
        for(const panel of panels.values()){
          const direct=panel.id===f.parentId||panel.id===f.childId;
          const descendant=descends(panel.id,f.childId);
          if(!direct&&!descendant)continue;
          if(descendant&&panel.id!==f.childId){
            panel.triangles=panel.triangles.map(tri=>({...tri,vertices:tri.vertices.map(v=>({...v,point:v.point.clone().applyMatrix4(f.rotation),normal:v.normal.clone().applyMatrix3(rigidNormal).normalize()}))}));
            panel.transform.premultiply(f.rotation);continue;
          }
          const subdivided=[];
          for(const tri of panel.triangles){let cells=[tri.vertices];
            for(const cut of cuts){cells=cells.flatMap(cell=>{
              const values=cell.map(v=>dot(v.source,f.a,f.radial)-cut);
              return values.some(v=>v>1e-9)&&values.some(v=>v<-1e-9)?[clip(cell,v=>dot(v.source,f.a,f.radial)-cut,true),clip(cell,v=>dot(v.source,f.a,f.radial)-cut,false)]:[cell];
            });}
            for(const cell of cells)for(let i=1;i<cell.length-1;i++)if(area([cell[0],cell[i],cell[i+1]])>1e-12)subdivided.push({material:tri.material,vertices:[cell[0],cell[i],cell[i+1]]});
          }
          panel.triangles=subdivided.map(tri=>({...tri,vertices:tri.vertices.map(v=>{
            const r=dot(v.source,f.a,f.radial);
            if(r<=-f.half+1e-10)return {...v,point:v.point.clone(),normal:v.normal.clone()};
            if(r>=f.half-1e-10)return {...v,point:v.point.clone().applyMatrix4(f.rotation),normal:v.normal.clone().applyMatrix3(rigidNormal).normalize()};
            const beta=(r+f.half)/f.neutralRadius,rotation=new THREE.Quaternion().setFromAxisAngle(f.axis,f.sign*beta);
            const u=dot(v.source,f.a,f.axis),delta=v.source.z-f.neutralZ;
            const normal=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
            const point=f.a.clone().addScaledVector(f.axis,u).addScaledVector(f.radial,-f.half+f.neutralRadius*Math.sin(beta))
              .add(new THREE.Vector3(0,0,f.neutralZ+f.side*f.sign*f.neutralRadius*(1-Math.cos(beta)))).addScaledVector(normal,delta);
            return {...v,point,normal:v.normal.clone().applyQuaternion(rotation).normalize()};
          })}));
          if(panel.id===f.childId)panel.transform.premultiply(f.rotation);
        }
      }
      for(const key of Object.keys(options.placements||{}))if(!flat.parts.some(p=>p.id===key))fail('unknown placement part '+key);
      for(const part of flat.parts){
        const values=options.placements?.[part.id];if(values===undefined)continue;
        if(!Array.isArray(values)||values.length!==16||!values.every(Number.isFinite))fail('placement needs 16 finite elements');
        const matrix=new THREE.Matrix4().fromArray(values),x=new THREE.Vector3().setFromMatrixColumn(matrix,0),y=new THREE.Vector3().setFromMatrixColumn(matrix,1),z=new THREE.Vector3().setFromMatrixColumn(matrix,2);
        if(Math.abs(x.length()-1)>EPS||Math.abs(y.length()-1)>EPS||Math.abs(z.length()-1)>EPS||Math.abs(x.dot(y))>EPS||Math.abs(x.dot(z))>EPS||Math.abs(y.dot(z))>EPS||Math.abs(matrix.determinant()-1)>EPS||values[3]!==0||values[7]!==0||values[11]!==0||values[15]!==1)fail('placement must be rigid, no reflection or scale');
        const normal=new THREE.Matrix3().getNormalMatrix(matrix);
        for(const panel of panels.values())if(panel.partId===part.id){
          panel.transform.premultiply(matrix);panel.triangles.forEach(tri=>tri.vertices.forEach(v=>{v.point.applyMatrix4(matrix);v.normal.applyMatrix3(normal).normalize();}));
        }
      }
      const contactDefinitions=options.contacts||[];
      if(!Array.isArray(contactDefinitions))fail('contacts must be an array');
      const contactIds=new Set(),movers=new Set();
      for(const contact of contactDefinitions){
        if(typeof contact.id!=='string'||!contact.id||contactIds.has(contact.id))fail('unique contact ID required');contactIds.add(contact.id);
        for(const face of [contact.from,contact.to])if(!face||!panels.has(face.panelId)||!['inside','outside'].includes(face.side))fail('contact requires known panel and inside/outside face');
        if(contact.from.panelId===contact.to.panelId||!['measure','seat'].includes(contact.mode)||!Number.isFinite(contact.clearanceMm)||contact.clearanceMm<0)fail('invalid contact mode, endpoints or clearance');
        if(contact.mode==='seat'){
          const moving=component(contact.from.panelId),fixed=component(contact.to.panelId);
          if(moving===fixed)fail('cannot independently seat connected fold panels; use measure or explicit fold radius');
          if(movers.has(moving))fail('repeated moving contact component');movers.add(moving);
        }
      }
      // Order is explicitly caller supplied. Targets may have been seated earlier,
      // but cannot move later and silently invalidate an already seated relation.
      for(let i=0;i<contactDefinitions.length;i++)if(contactDefinitions[i].mode==='seat')for(let j=i+1;j<contactDefinitions.length;j++)if(contactDefinitions[j].mode==='seat'&&component(contactDefinitions[i].to.panelId)===component(contactDefinitions[j].from.panelId))fail('contact target moves later; cyclic/out-of-order seating');
      function surface(face){
        const panel=panels.get(face.panelId),definition=definitions.get(face.panelId),sign=definition.faceConvention[face.side]==='positiveZ'?1:-1;
        const origin=new THREE.Vector3(0,0,sign*panel.thicknessMm/2).applyMatrix4(panel.transform);
        const normal=new THREE.Vector3(0,0,sign).transformDirection(panel.transform),x=new THREE.Vector3(1,0,0).transformDirection(panel.transform),y=new THREE.Vector3(0,1,0).transformDirection(panel.transform);
        const material=face.side==='outside'?0:1;
        const triangles=panel.triangles.filter(t=>t.material===material&&t.vertices.every(v=>Math.abs(v.point.clone().sub(origin).dot(normal))<1e-5&&v.normal.dot(normal)>.999999));
        return {panel,origin,normal,x,y,triangles};
      }
      function measure(contact){
        const from=surface(contact.from),to=surface(contact.to),normalDot=from.normal.dot(to.normal);
        if(normalDot>-1+1e-10||!from.triangles.length||!to.triangles.length)return {id:contact.id,status:'nonparallel-or-no-rigid-face',normalDot,overlapAreaMm2:0,gapMm:null};
        const project=p=>{const v=p.clone().sub(to.origin);return {X:Math.round(v.dot(to.x)*1e6),Y:Math.round(v.dot(to.y)*1e6)};};
        const paths=s=>s.triangles.map(t=>{const p=t.vertices.map(v=>project(v.point));if(!lib.Clipper.Orientation(p))p.reverse();return p;});
        const op=new lib.Clipper(),out=new lib.Paths();op.AddPaths(paths(from),lib.PolyType.ptSubject,true);op.AddPaths(paths(to),lib.PolyType.ptClip,true);
        op.Execute(lib.ClipType.ctIntersection,out,lib.PolyFillType.pftNonZero,lib.PolyFillType.pftNonZero);
        const overlapAreaMm2=Math.abs(out.reduce((sum,p)=>sum+lib.Clipper.Area(p),0))/1e12;
        const gap=from.origin.clone().sub(to.origin).dot(to.normal);
        return {id:contact.id,status:overlapAreaMm2<=EPS?'no-overlap':gap<contact.clearanceMm-1e-5?'penetrating':Math.abs(gap-contact.clearanceMm)<=1e-5?'contact':'separated',normalDot,overlapAreaMm2,gapMm:gap,clearanceMm:contact.clearanceMm};
      }
      const movements=[];
      for(const contact of contactDefinitions)if(contact.mode==='seat'){
        const before=measure(contact);
        if(before.overlapAreaMm2<=EPS||before.gapMm===null){diagnostics.push({code:'CONTACT_NOT_SEATED',id:contact.id,severity:'warning',message:before.status});continue;}
        const delta=surface(contact.to).normal.multiplyScalar(contact.clearanceMm-before.gapMm),translation=new THREE.Matrix4().makeTranslation(delta.x,delta.y,delta.z),moving=component(contact.from.panelId);
        const moved=[];for(const panel of panels.values())if(component(panel.id)===moving){panel.transform.premultiply(translation);panel.triangles.forEach(t=>t.vertices.forEach(v=>v.point.add(delta)));moved.push(panel.id);}
        movements.push({contactId:contact.id,panelIds:moved,translation:delta.toArray()});
      }
      const contacts=contactDefinitions.map(measure);
      contacts.filter(c=>c.status==='penetrating').forEach(c=>diagnostics.push({code:'CONTACT_PENETRATION',id:c.id,severity:'blocking',message:'Declared planar contact is below the required clearance; adjust explicit fold/placement inputs.'}));
      for(const panel of panels.values()){
        const positions=[],normals=[],sources=[],uv=[],groups=[];
        for(const triangle of panel.triangles){
          const vertices=triangle.vertices,normal=vertices[1].point.clone().sub(vertices[0].point).cross(vertices[2].point.clone().sub(vertices[0].point));
          if(normal.lengthSq()<1e-22)continue;
          const start=positions.length/3;for(const v of vertices){positions.push(...v.point.toArray());normals.push(...v.normal.toArray());sources.push(...v.source.toArray());uv.push(v.source.x,-v.source.y);}
          const last=groups.at(-1);if(last&&last.materialIndex===triangle.material)last.count+=3;else groups.push({start,count:3,materialIndex:triangle.material});
        }
        if(!positions.length||!positions.every(Number.isFinite))fail('empty/nonfinite panel '+panel.id);
        const geometry=new THREE.BufferGeometry();geometries.push(geometry);
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
        geometry.setAttribute('sourcePosition',new THREE.Float32BufferAttribute(sources,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
        groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));geometry.computeBoundingBox();geometry.computeBoundingSphere();
        geometry.userData.physicalPaper={panelId:panel.id,partId:panel.partId,uvUnits:'mm',pose:'explicit-static'};
        panel.geometry=geometry;panel.matrix=panel.transform.toArray();delete panel.triangles;delete panel.transform;
      }
      let disposed=false;
      return {parts:flat.parts,panels:[...panels.values()],contacts,movements,diagnostics,assemblyConnected:false,
        folds:folds.map(f=>({id:f.id,angleDeg:f.theta*180/Math.PI,neutralRadiusMm:f.neutralRadius,bendAllowanceMm:f.allowance,innerRadiusMm:f.innerRadiusMm,stackOffsetMm:f.stackOffsetMm})),
        dispose(){if(!disposed){geometries.forEach(g=>g.dispose());disposed=true;}}};
    }catch(error){geometries.forEach(g=>g.dispose());throw error;}finally{flat.dispose();}
  }

  /* Assembly-owned pose: positions/orientations are constraints, not hints.
   * Reuse Contract geometry and preserve every owner frame, including synthetic
   * assembly axes. Do NOT run the finite-radius solver then pose a second time.
   * With fixed sharp-hinge frames a positive-thickness seam need not be closed.
   * Report its exact endpoint mismatch; never fill it with an invented crease,
   * move a panel, or claim a constant-radius/constant-thickness bend was made.
   * sourceToWorld maps (source.x,-source.y,z) to the owner's world millimetres.
   */
  function createAssemblyPhysicalPose(options) {
    const {THREE}=options,c=options.contract||options.prepared?.contract,pose=options.assemblyPose;
    const fail=message=>{throw new Error('Assembly physical pose: '+message);};
    if(options.placements||options.contacts)fail('placements/contact solving cannot override owner frames');
    const fraction=options.neutralAxisFraction;
    if(!Number.isFinite(fraction)||fraction<0||fraction>1)fail('explicit neutralAxisFraction 0..1 required');
    if(!pose||!Array.isArray(pose.panels)||!Array.isArray(pose.hinges))fail('panel and hinge snapshots required');
    const panelInputs=new Map(pose.panels.map(p=>[p.id,p])),hinges=new Map(pose.hinges.map(h=>[h.id,h]));
    if(panelInputs.size!==pose.panels.length||panelInputs.size!==c.panels.length||c.panels.some(p=>!panelInputs.has(p.id)))fail('exact panel coverage required');
    if(hinges.size!==pose.hinges.length||hinges.size!==c.folds.length||c.folds.some(f=>!hinges.has(f.id)))fail('exact hinge coverage required');
    const transforms=new Map();
    for(const p of c.panels){
      const input=panelInputs.get(p.id),v=input.sourceToWorld;
      if(input.partId!==p.partId||!Array.isArray(v)||v.length!==16||!v.every(Number.isFinite))fail('invalid panel frame '+p.id);
      const m=new THREE.Matrix4().fromArray(v),axes=[0,1,2].map(i=>new THREE.Vector3().setFromMatrixColumn(m,i)),eps=1e-7;
      if(axes.some(a=>Math.abs(a.length()-1)>eps)||Math.abs(axes[0].dot(axes[1]))>eps||Math.abs(axes[0].dot(axes[2]))>eps||Math.abs(axes[1].dot(axes[2]))>eps||Math.abs(m.determinant()-1)>eps||v[3]!==0||v[7]!==0||v[11]!==0||v[15]!==1)fail('frame must be rigid millimetres, no reflection/scale: '+p.id);
      transforms.set(p.id,m);
    }
    for(const f of c.folds){const h=hinges.get(f.id);
      if(h.parentPanelId!==f.parentPanelId||h.childPanelId!==f.childPanelId||h.partId!==f.axis.partId||!Number.isFinite(h.angleDeg)||Math.abs(h.angleDeg)>180+1e-7)fail('invalid hinge '+f.id);
    }
    const flat=createContractGeometry(options),diagnostics=flat.diagnostics.filter(d=>d.code!=='FOLD_POSE_DEFERRED');
    try{
      const byId=new Map(flat.panels.map(p=>[p.id,p]));
      for(const p of flat.panels){
        const matrix=transforms.get(p.id),source=p.geometry.attributes.position.clone();
        p.geometry.setAttribute('sourcePosition',source);
        // The supplied owner plane is the neutral plane. Material extends
        // fraction*t toward -Z and (1-fraction)*t toward +Z, not always t/2.
        p.geometry.translate(0,0,(.5-fraction)*p.thicknessMm);
        p.geometry.applyMatrix4(matrix);p.geometry.computeBoundingBox();p.geometry.computeBoundingSphere();
        if(!Array.from(p.geometry.attributes.position.array).every(Number.isFinite))fail('nonfinite panel '+p.id);
        p.matrix=matrix.toArray();p.neutralAxisFraction=fraction;
        p.geometry.userData.physicalPaper.pose='assembly-owned-rigid';
      }
      const folds=c.folds.map(f=>{
        const parent=byId.get(f.parentPanelId),child=byId.get(f.childPanelId),pm=transforms.get(parent.id),cm=transforms.get(child.id),h=hinges.get(f.id);
        const ends=[f.axis.a,f.axis.b];
        const point=(p,z,m)=>new THREE.Vector3(p.x,-p.y,z).applyMatrix4(m);
        const gap=(pz,cz)=>Math.max(...ends.map(p=>point(p,pz,pm).distanceTo(point(p,cz,cm))));
        const neutralGapMm=gap(0,0),negativeGapMm=gap(-fraction*parent.thicknessMm,-fraction*child.thicknessMm),positiveGapMm=gap((1-fraction)*parent.thicknessMm,(1-fraction)*child.thicknessMm);
        const surfaceGapMm=Math.max(negativeGapMm,positiveGapMm),assemblyOnly=f.source?.kind==='assembly-only';
        const axis=new THREE.Vector3(f.axis.b.x-f.axis.a.x,f.axis.a.y-f.axis.b.y,0).normalize();
        const expected=new THREE.Matrix4().copy(pm).multiply(new THREE.Matrix4().makeRotationAxis(axis,h.angleDeg*Math.PI/180));
        const rotationError=Math.max(...[0,1,2,4,5,6,8,9,10].map(i=>Math.abs(expected.elements[i]-cm.elements[i])));
        if(rotationError>1e-6)fail('angle/frame mismatch '+f.id);
        if(surfaceGapMm>1e-4)diagnostics.push({code:'OWNER_FRAME_SEAM_OPEN',id:f.id,severity:'blocking',message:'Exact owner frames retained; thickness surfaces are not joined.',neutralGapMm,surfaceGapMm});
        if(Math.abs(h.angleDeg)>1e-7)diagnostics.push({code:assemblyOnly?'ASSEMBLY_AXIS_UNSMOOTHED':'FINITE_RADIUS_NOT_APPLIED',id:f.id,severity:'blocking',message:'Rigid assembly pose only; no fabricated bend surface or frame correction.'});
        return {id:f.id,angleDeg:h.angleDeg,assemblyOnly,manufactured:!assemblyOnly,neutralGapMm,surfaceGapMm,rotationError,
          parentAxisWorld:ends.map(p=>point(p,0,pm).toArray()),childAxisWorld:ends.map(p=>point(p,0,cm).toArray())};
      });
      for(const r of c.source?.unresolvedRelations||[])diagnostics.push({code:'RELATION_NOT_SOLVED',severity:'warning',message:r.kind+' remains owned by the original assembly; not physically certified.'});
      return {...flat,diagnostics,folds,contacts:[],movements:[],assemblyConnected:true,assemblyReady:true,
        poseMode:'assembly-owned-rigid',finiteRadiusApplied:false,neutralAxisFraction:fraction,
        complete:!diagnostics.some(d=>d.severity==='blocking')&&!(c.source?.unresolvedRelations?.length),
        physicalComplete:!diagnostics.some(d=>d.severity==='blocking')&&!(c.source?.unresolvedRelations?.length)};
    }catch(error){flat.dispose();throw error;}
  }

  // Explicit, opt-in adapter for existing assembly owners. SVG/2D, angular
  // schedules and the scene hierarchy remain owned by the template. All
  // thickness values exposed by this adapter are real millimetres.
  function createAssemblyAdapter({THREE,renderer,model,panels,hinges,bonds=[],voids=[],insertions=[],locks=[],slots=[],anchoredPanels=[],layerOrder=[],layerConstraints=[],closureClearances=[],preserveSourceEdge=false,sourceThickness=.18}){
    const scale=model.scale.x;
    if(!(scale>0)||Math.abs(model.scale.y-scale)>1e-8||Math.abs(model.scale.z-scale)>1e-8)throw new Error('Physical assembly requires uniform source units');
    const saved=new Map(),pieces=new Map(),definitions=[];
    function ring(points){const p=points.map(v=>({x:v.x,y:-v.y}));if(p.length>1&&Math.hypot(p[0].x-p.at(-1).x,p[0].y-p.at(-1).y)<1e-7)p.pop();return p;}
    function voidRing(v){
      const path=new THREE.Path();
      if(v.r){path.absarc(v.cx,-v.cy,v.r,0,Math.PI*2,false);return ring(path.getPoints(24));}
      const x=v.x??v.cx-v.width/2,y=-(v.y??v.cy-v.height/2)-v.height,w=v.width,h=v.height,r=Math.min(v.radius||0,w/2,h/2);
      path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);path.closePath();return ring(path.getPoints(12));
    }
    for(const [id,mesh] of panels){
      const shape=mesh.geometry.parameters?.shapes;
      if(!shape||Array.isArray(shape))throw new Error('Physical assembly requires a source Shape: '+id);
      const sampled=shape.extractPoints(mesh.geometry.parameters.options.curveSegments||12),polygon=ring(sampled.shape),holes=sampled.holes.map(ring);
      for(const v of voids.filter(v=>v.panelId===id))holes.push(voidRing(v));
      // A triangular gusset's bounding-box centre lies ON its diagonal hinge.
      // Use its area centroid to determine the material side unambiguously.
      let area2=0,cx=0,cy=0;
      polygon.forEach((p,i)=>{const q=polygon[(i+1)%polygon.length],cross=p.x*q.y-q.x*p.y;area2+=cross;cx+=(p.x+q.x)*cross;cy+=(p.y+q.y)*cross;});
      if(Math.abs(area2)<1e-8)throw new Error('Physical assembly: zero-area panel '+id);
      const directionCenter=new THREE.Vector3(cx/(3*area2),-cy/(3*area2),0);
      definitions.push({id,polygon,holes});pieces.set(id,{mesh,flatCenter:new THREE.Vector3(),directionCenter});
      saved.set(mesh,{geometry:mesh.geometry,position:mesh.position.clone()});
    }
    for(const b of bonds)if(b.bondedTarget)saved.set(b.bondedTarget,{geometry:b.bondedTarget.geometry,position:b.bondedTarget.position.clone()});
    const homes=hinges.map(h=>({h,position:h.object.position.clone(),framePosition:h.frame.position.clone()}));
    const relations=hinges.map((h,i)=>({id:'assembly-'+i,parentId:h.parentMesh.name,childId:h.childMesh.name,axis:{a:h.a,b:h.b},phase:[0,1]}));
    const runtimeHinges=hinges.map((h,i)=>({object:h.object,relationId:relations[i].id}));
    const materials=panels.values().next().value.material;
    const whitePaperboard=renderer?global.PacVuWhitePaperboard?.createMaterials(THREE,renderer,{sourceMaterials:materials}):null;
    let thicknessMm=.45,enabled=false,diagnostics=[],currentProgress=0;
    const originalBrands=[];model.traverse(o=>{if(o.userData.pacvuBrand)originalBrands.push([o,o.position.z]);});
    function resetOffsets(){
      for(const {h,position,framePosition}of homes){h.object.position.copy(position);h.frame.position.copy(framePosition);}
      for(const [mesh,record]of saved)mesh.position.copy(record.position);
      for(const [brand,z]of originalBrands)brand.position.z=z;
    }
    function normal(mesh){return new THREE.Vector3(0,0,1).transformDirection(mesh.matrixWorld);}
    function moveWorld(mesh,delta){const origin=mesh.getWorldPosition(new THREE.Vector3());mesh.position.add(mesh.parent.worldToLocal(origin.clone().add(delta)).sub(mesh.parent.worldToLocal(origin)));model.updateMatrixWorld(true);}
    function insertionState(relation){
      const lock=locks.find(l=>l.id===relation.lockId),slot=slots.find(s=>s.id===relation.slotId),moving=panels.get(relation.movingPanelId),target=panels.get(relation.targetPanelId),definition=definitions.find(d=>d.id===relation.movingPanelId);
      if(!lock||!slot||!moving||!target)return null;
      const xs=[];definition.polygon.forEach((a,i)=>{const b=definition.polygon[(i+1)%definition.polygon.length];if((a.y<=lock.centerY&&b.y>=lock.centerY)||(a.y>=lock.centerY&&b.y<=lock.centerY)){if(Math.abs(b.y-a.y)>1e-8)xs.push(a.x+(b.x-a.x)*(lock.centerY-a.y)/(b.y-a.y));}});
      if(!xs.length)return null;const x=lock.side==='L'?Math.min(...xs):Math.max(...xs),sign=lock.side==='L'?1:-1;
      const tip=target.worldToLocal(moving.localToWorld(new THREE.Vector3(x,-lock.centerY,0))),heel=target.worldToLocal(moving.localToWorld(new THREE.Vector3(x+sign*lock.depth,-lock.centerY,0)));
      const dz=tip.z-heel.z,ratio=Math.abs(dz)>1e-8?-heel.z/dz:NaN,hit=heel.clone().lerp(tip,ratio);
      return {lock,slot,moving,target,tip,heel,hit,ratio};
    }
    function seatInsertions(){
      const pinned=new Set(anchoredPanels);
      for(const relation of insertions){
        const state=insertionState(relation);if(!state||!Number.isFinite(state.hit.x))continue;
        const h=hinges.find(h=>h.childMesh===state.moving),angle=h?2*Math.acos(Math.min(1,Math.abs(h.object.quaternion.w))):0;
        const raw=Math.max(0,Math.min(1,(angle/(Math.PI/2)-.85)/.15)),weight=raw*raw*(3-2*raw);
        if(!weight)continue;
        const half=state.slot.width/2-thicknessMm/(2*scale)-.001/scale;
        if(half<0)continue; // The diagnostic below reports an impossible stock/slot fit.
        const offset=state.hit.x-relation.targetPosition.x,dx=Math.max(-half,Math.min(half,offset))-offset;
        // Keep the tab spanning both stock faces when resized hinge offsets
        // place its heel below the base. Preserve its original insertion depth
        // whenever it already spans the stock; never alter the fold angle.
        const margin=thicknessMm/(2*scale)+.001/scale;
        const low=Math.min(state.tip.z,state.heel.z),high=Math.max(state.tip.z,state.heel.z);
        const dz=high-low>=2*margin?Math.max(margin-high,Math.min(-margin-low,0)):0;
        const origin=state.target.localToWorld(new THREE.Vector3()),delta=state.target.localToWorld(new THREE.Vector3(dx*weight,0,dz*weight)).sub(origin);
        moveWorld(state.moving,delta);
        if(weight>.99999)pinned.add(relation.movingPanelId);
      }
      return pinned;
    }
    function overlap(a,b){
      const lib=global.ClipperLib,S=1e4,op=new lib.Clipper(),out=new lib.Paths();
      const paths=(p,target)=>{const d=definitions.find(d=>d.id===p.id),m=pieces.get(p.id).mesh;return [d.polygon,...d.holes].map((ring,i)=>{const path=ring.map(v=>{const w=target.worldToLocal(m.localToWorld(new THREE.Vector3(v.x,-v.y,0)));return {X:Math.round(w.x*S),Y:Math.round(w.y*S)};});if(lib.Clipper.Orientation(path)!==(i===0))path.reverse();return path;});};
      op.AddPaths(paths(a,b.mesh),lib.PolyType.ptSubject,true);op.AddPaths(paths(b,b.mesh),lib.PolyType.ptClip,true);
      op.Execute(lib.ClipType.ctIntersection,out,lib.PolyFillType.pftNonZero,lib.PolyFillType.pftNonZero);
      return Math.abs(out.reduce((s,p)=>s+lib.Clipper.Area(p),0))*scale*scale/(S*S);
    }
    // Resolve only parallel overlapping layers, with deterministic original
    // layer order. Angular assembly motion is never replaced by a new rig.
    function seatLayers(pinned){
      const rank=id=>layerOrder.includes(id)?layerOrder.indexOf(id):layerOrder.length;
      const list=[...pieces].map(([id,p])=>({id,mesh:p.mesh})).filter(p=>p.mesh.visible).sort((a,b)=>Number(pinned.has(b.id))-Number(pinned.has(a.id))||rank(a.id)-rank(b.id));
      const side=new Map();
      for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
        const a=list[i],b=list[j],n=normal(a.mesh),dot=n.dot(normal(b.mesh));if(Math.abs(dot)<.99999)continue;
        const gap=b.mesh.localToWorld(new THREE.Vector3()).sub(a.mesh.localToWorld(new THREE.Vector3())).dot(n);
        const declared=layerConstraints.find(c=>c.outer===a.id&&c.inner===b.id);
        if((!declared&&Math.abs(gap)>thicknessMm*2+sourceThickness*scale)||overlap(a,b)<.01)continue;
        // Owner-declared exterior anchors retain their exterior surface.
        // +Z is the existing Viewer interior face convention; thin source
        // drawing offsets must not put an internal gusset outside that face.
        let sign=anchoredPanels.includes(a.id)?1:Math.abs(gap)>1e-5?Math.sign(gap):1;
        if(layerOrder.length){
          const origin=a.mesh.localToWorld(new THREE.Vector3());
          const anchor=list.filter(p=>anchoredPanels.includes(p.id)&&Math.abs(normal(p.mesh).dot(n))>.99999).sort((p,q)=>Math.abs(p.mesh.localToWorld(new THREE.Vector3()).sub(origin).dot(n))-Math.abs(q.mesh.localToWorld(new THREE.Vector3()).sub(origin).dot(n)))[0];
          if(anchor)sign=normal(anchor.mesh).dot(n)>=0?1:-1;
        }
        if(declared)sign=declared.interiorSign??1;
        side.set(i+':'+j,{a,b,n,sign,declared});
      }
      function clearance({a,b,n,sign,declared}){
        const origin=a.mesh.localToWorld(new THREE.Vector3());
        if(!declared)return b.mesh.localToWorld(new THREE.Vector3()).sub(origin).dot(n)*sign;
        // Declared containment must include the whole inner panel, not merely
        // its origin: source crease axes can be slightly non-parallel.
        const polygon=definitions.find(d=>d.id===b.id).polygon;
        return Math.min(...polygon.map(p=>b.mesh.localToWorld(new THREE.Vector3(p.x,-p.y,0)).sub(origin).dot(n)*sign));
      }
      for(let pass=0;pass<4;pass++)for(const entry of side.values()){
        const {b,n,sign}=entry,gap=clearance(entry);
        if(gap<thicknessMm&&!pinned.has(b.id))moveWorld(b.mesh,n.clone().multiplyScalar(sign*(thicknessMm-gap)));
      }
      diagnostics=[...side.values()].map(entry=>({kind:'layer',from:entry.a.id,to:entry.b.id,gapMm:clearance(entry)-thicknessMm}));
    }
    function closureBounds(id,axis){
      const bond=bonds.find(b=>b.bondedTarget?.name===id),mesh=bond?.bondedTarget||panels.get(id);
      if(!mesh?.visible)return null;
      const definition=definitions.find(d=>d.id===(bond?bond.target.name:id));
      if(!definition)return null;
      const projections=definition.polygon.map(p=>mesh.localToWorld(new THREE.Vector3(p.x,-p.y,0)).dot(axis));
      const half=thicknessMm*Math.abs(normal(mesh).dot(axis))/2;
      return {min:Math.min(...projections)-half,max:Math.max(...projections)+half};
    }
    function seatClosures(progress){
      for(const relation of closureClearances){
        const hinge=hinges.find(h=>h.childMesh.name===relation.lid);
        if(!hinge)continue;
        const raw=Math.max(0,Math.min(1,(progress-relation.phase[0])/(relation.phase[1]-relation.phase[0]))),weight=raw*raw*(3-2*raw);
        if(!weight)continue;
        const axis=new THREE.Vector3(0,0,1).transformDirection(model.matrixWorld),lid=closureBounds(relation.lid,axis);
        const contents=relation.contents.map(id=>closureBounds(id,axis)).filter(Boolean);
        if(!lid||!contents.length)continue;
        const top=Math.max(...contents.map(b=>b.max)),lift=Math.max(0,top+.01-lid.min)*weight;
        // Move the lid's entire assembly frame, including its bonded gussets.
        // Do not trim, scale, or separately displace the glued body panels.
        // This runs before core rebuild so the existing bend bridge follows it.
        moveWorld(hinge.frame,axis.multiplyScalar(lift));
        diagnostics.push({kind:'closure',from:relation.lid,liftMm:lift,clearanceMm:lid.min+lift-top,weight});
      }
    }
    const core=create({THREE,contract:{code:'assembly-adapter',panels:definitions,foldRelations:relations,adhesiveRelations:[]},pieces,frames:new Map(),hinges:runtimeHinges,root:model,center:{x:0,y:0},materials,whitePaperboard,
      clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),phase:(v,r)=>Math.max(0,Math.min(1,(v-r[0])/(r[1]-r[0]))),point:p=>new THREE.Vector3(p.x,-p.y,0),
      initialThickness:sourceThickness,minThickness:.15/scale,maxThickness:.8/scale,thicknessPrecision:1e6,preserveVoids:true,preserveSourceEdge,worldUnitsPerSourceUnit:scale,materialSets:{existing:materials,white:whitePaperboard?.materials||materials},
      beforeRebuild({progress}){
        resetOffsets();
        const localThickness=thicknessMm/scale;
        for(const {h,position,framePosition}of homes){const shift=position.z*(localThickness/sourceThickness-1);h.object.position.z+=shift;h.frame.position.z-=shift;}
        for(const [brand,z]of originalBrands)brand.position.z=z-(localThickness-sourceThickness)/2;
        model.updateMatrixWorld(true);const pinned=seatInsertions();
        diagnostics=[];seatClosures(progress);const closureDiagnostics=diagnostics;
        seatLayers(pinned);diagnostics.push(...closureDiagnostics);
      },afterRebuild(){
        for(const bond of bonds){if(!bond.bondedTarget)continue;bond.bondedTarget.geometry=bond.target.geometry;
          if(!bond.bondedTarget.visible)continue;
          const source=bond.source,target=bond.bondedTarget,n=normal(source),dot=n.dot(normal(target));
          const gap=target.localToWorld(new THREE.Vector3()).sub(source.localToWorld(new THREE.Vector3())).dot(n);
          const contact=bond.paperContact;
          if(contact&&contact.sourceFace*contact.targetFace*dot<-.99999){const desired=(contact.sourceFace-contact.targetFace*dot)*thicknessMm/2;moveWorld(target,n.clone().multiplyScalar(desired-gap));const measured=target.localToWorld(new THREE.Vector3()).sub(source.localToWorld(new THREE.Vector3())).dot(n)-desired;diagnostics.push({kind:'adhesive',from:source.name,to:target.name,gapMm:measured});}
          else diagnostics.push({kind:'adhesive',from:source.name,to:target.name,unresolved:true,normalDot:dot});
        }
        for(const relation of insertions){
          const state=insertionState(relation);if(!state)continue;const {slot,tip,heel,hit}=state,offsetXMm=(hit.x-relation.targetPosition.x)*scale;
          diagnostics.push({kind:'insertion',id:relation.id,crossesBase:Math.min(tip.z,heel.z)*scale<=.001&&Math.max(tip.z,heel.z)*scale>=-.001,tipZMm:tip.z*scale,heelZMm:heel.z*scale,offsetXMm,offsetYMm:(hit.y+relation.targetPosition.y)*scale,edgeClearanceMm:slot.width*scale/2-Math.abs(offsetXMm)-thicknessMm/2,slotWidthMm:slot.width*scale,paperThicknessMm:thicknessMm});
        }
      }
    });
    function update(progress){currentProgress=progress;if(!enabled)return;try{core.setThickness(thicknessMm/scale);core.rebuild(progress);}catch(error){enabled=false;restore();throw error;}}
    function restore(){core.restore();resetOffsets();for(const [mesh,s]of saved)mesh.geometry=s.geometry;model.updateMatrixWorld(true);}
    return {update,restore,setEnabled(value){enabled=!!value;if(enabled)update(currentProgress);else restore();},setThickness(value){const n=Number(value);if(!Number.isFinite(n))throw new Error('Paper thickness must be finite');thicknessMm=Math.max(.15,Math.min(.8,n));if(enabled)update(currentProgress);return thicknessMm;},
      setMaterialMode(mode){core.setMaterialMode(mode,enabled);},get enabled(){return enabled;},get thickness(){return thicknessMm;},getDiagnostics(){return diagnostics.map(d=>({...d}));},
      dispose(){restore();core.dispose();whitePaperboard?.dispose();}};
  }

  // Stage 5 observation wrapper. The legacy implementation above stays intact.
  const legacyReaders = new Map();
  let legacySerial = 0;
  function listLegacyAssemblies() { return Array.from(legacyReaders.keys()); }
  function readLegacyAssembly(id) { return legacyReaders.get(id)?.() || null; }
  function createObserved(options) {
    const legacy = create(options);
    // Only T001 has been audited; all other owners use the original API verbatim.
    if(options.contract.code!=='T001')return legacy;
    const instanceId=++legacySerial;
    let progress=null,mode='original';
    const {root,contract,pieces,hinges,center}=options;
    legacyReaders.set(instanceId,()=>{
      // Refresh derived matrices only; no pose/rebuild or geometry writes.
      root.updateMatrixWorld(true);
      const matrix=object=>Array.from(object.matrixWorld.elements);
      return {instanceId,structureId:contract.code,dimensions:{...contract.dimensions},revision:instanceId,
        state:{progress,mode},thicknessMm:legacy.thickness,rootMatrix:matrix(root),center:{x:center.x,y:center.y},
        panels:Array.from(pieces,([id,p])=>({id,partId:'sheet',matrixWorld:matrix(p.mesh),flatCenter:p.flatCenter.toArray()})),
        hinges:hinges.filter(h=>h.relationId).map(h=>{
          const r=contract.foldRelations.find(f=>f.id===h.relationId),q=h.object.quaternion;
          return {id:h.relationId,partId:'sheet',parentPanelId:r.parentId,childPanelId:r.childId,matrixWorld:matrix(h.object),axis:h.axis.toArray(),
            angleDeg:2*Math.atan2(q.x*h.axis.x+q.y*h.axis.y+q.z*h.axis.z,q.w)*180/Math.PI};
        }),parts:[{id:'sheet',matrixWorld:matrix(root)}]};
    });
    return Object.freeze({...legacy,get thickness(){return legacy.thickness;},
      rebuild(value){progress=null;mode='legacy-rebuilding';const result=legacy.rebuild(value);progress=value;mode='legacy-poc';return result;},
      restore(){const result=legacy.restore();progress=null;mode='original';return result;},
      dispose(){try{return legacy.dispose();}finally{legacyReaders.delete(instanceId);}}
    });
  }

  // Pose-owned assemblies (including pressed automatic bottoms) retain their
  // template timeline. This adapter only supplies shared paper geometry.
  function createFoldedAdapter(options) {
    const {THREE,contract,pieces,bondCopies,repose}=options;
    const originalMaterials=new Map([...pieces].map(([id,p])=>[id,p.mesh.material]));
    const originalBondMaterials=new Map();bondCopies?.forEach(link=>originalBondMaterials.set(link,link.copy.material));
    const panels=contract.panels.map(p=>({...p,holes:(p.holes||[]).map(h=>{
      if(Array.isArray(h))return h;
      return Array.from({length:96},(_,i)=>({x:h.cx+h.r*Math.cos(i*Math.PI/48),y:h.cy+h.r*Math.sin(i*Math.PI/48)}));
    })}));
    const directedPieces=new Map([...pieces].map(([id,piece])=>{
      const polygon=panels.find(p=>p.id===id).polygon;let area=0,x=0,y=0;
      polygon.forEach((p,i)=>{const q=polygon[(i+1)%polygon.length],cross=p.x*q.y-q.x*p.y;area+=cross;x+=(p.x+q.x)*cross;y+=(p.y+q.y)*cross;});
      return [id,{...piece,directionCenter:options.point({x:x/(3*area),y:y/(3*area)})}];
    }));
    const core=create({...options,pieces:directedPieces,contract:{...contract,panels,foldRelations:contract.folds,adhesiveRelations:[]},
      hinges:options.hinges.map(h=>({...h,relationId:h.id})),
      materialSets:options.baseMaterialSets,preserveVoids:true,preserveSourceEdge:true,
      bendModel:'developed-arc',minThickness:.15,maxThickness:.8});
    let enabled=false,mode='existing',thickness=.45,progress=0;
    function syncCopies(){bondCopies?.forEach(link=>{link.copy.geometry=link.original.geometry;link.copy.material=!enabled&&mode==='existing'?originalBondMaterials.get(link):link.original.material;});}
    function applyMaterial(){if(enabled)core.setMaterialMode(mode,true);else pieces.forEach((p,id)=>{p.mesh.material=mode==='existing'?originalMaterials.get(id):(p.materialSets?.white||options.baseMaterialSets.white);});syncCopies();}
    function update(value){progress=value;if(enabled)core.rebuild(progress);else core.restore();applyMaterial();}
    return {update,get enabled(){return enabled;},get thickness(){return thickness;},
      setEnabled(value){enabled=!!value;repose();},
      setThickness(value){thickness=core.setThickness(value);if(enabled)repose();return thickness;},
      setMaterialMode(value){mode=value;applyMaterial();},
      getDiagnostics(){return [{kind:'pose-owned',progress,thickness,enabled}];},
      dispose(){core.dispose();syncCopies();}};
  }

  global.PacVuPhysicalPaper3D = Object.freeze({
    listLegacyAssemblies,
    readLegacyAssembly,
    clipEdge,
    intersectionAtX,
    intersectionAtY,
    clipPolygon,
    polygonArea,
    cleanPolygon,
    create: createObserved,
    createAssemblyAdapter,
    createFoldedAdapter,
    createContractGeometry,
    createPhysicalPose
  });
})(window);
