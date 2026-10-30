(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE || !global.B001_getLayout) return;

  const W = 160;
  const D = 110;
  const H = 80;
  const PAPER = 0.32;
  const HANDLE_CONTACT_GAP = 0.02;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = value => { const v = clamp(value, 0, 1); return v * v * (3 - (2 * v)); };
  const phase = (value, start, end) => smooth((value - start) / (end - start));

  function pointsFromPath(pathData, samples) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    svg.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px';
    document.body.appendChild(svg);
    const length = path.getTotalLength();
    const count = samples || Math.max(160, Math.ceil(length / 2));
    const points = [];
    for (let index = 0; index < count; index += 1) {
      const point = path.getPointAtLength(length * index / count);
      points.push({ x: point.x, y: point.y });
    }
    svg.remove();
    return points;
  }

  function pointsFromMarkup(markup, samples) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.innerHTML = markup;
    svg.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px';
    document.body.appendChild(svg);
    const element = svg.firstElementChild;
    const length = element.getTotalLength();
    const count = samples || Math.max(80, Math.ceil(length));
    const points = [];
    for (let index = 0; index < count; index += 1) {
      const point = element.getPointAtLength(length * index / count);
      points.push({ x: point.x, y: point.y });
    }
    svg.remove();
    return points;
  }

  function clipPolygon(polygon, rect) {
    const edges = [
      [point => point.x >= rect.x0 - .01, (a, b) => ({ x: rect.x0, y: a.y + ((b.y - a.y) * (rect.x0 - a.x) / (b.x - a.x)) })],
      [point => point.x <= rect.x1 + .01, (a, b) => ({ x: rect.x1, y: a.y + ((b.y - a.y) * (rect.x1 - a.x) / (b.x - a.x)) })],
      [point => point.y >= rect.y0 - .01, (a, b) => ({ y: rect.y0, x: a.x + ((b.x - a.x) * (rect.y0 - a.y) / (b.y - a.y)) })],
      [point => point.y <= rect.y1 + .01, (a, b) => ({ y: rect.y1, x: a.x + ((b.x - a.x) * (rect.y1 - a.y) / (b.y - a.y)) })]
    ];
    let output = polygon.slice();
    edges.forEach(([inside, intersect]) => {
      const input = output;
      output = [];
      if (!input.length) return;
      let a = input[input.length - 1];
      input.forEach(b => {
        const aInside = inside(a);
        const bInside = inside(b);
        if (bInside) {
          if (!aInside) output.push(intersect(a, b));
          output.push(b);
        } else if (aInside) output.push(intersect(a, b));
        a = b;
      });
    });
    return output.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  }

  function makeGeometry(polygon, holes) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    polygon.forEach(point => {
      minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
    });
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const shape = new THREE.Shape();
    polygon.forEach((point, index) => {
      const x = point.x - centerX;
      const y = centerY - point.y;
      if (index) shape.lineTo(x, y); else shape.moveTo(x, y);
    });
    shape.closePath();
    (holes || []).forEach(points => {
      const hole = new THREE.Path();
      points.forEach((point, index) => {
        const x = point.x - centerX;
        const y = centerY - point.y;
        if (index) hole.lineTo(x, y); else hole.moveTo(x, y);
      });
      hole.closePath();
      shape.holes.push(hole);
    });
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: PAPER,
      bevelEnabled: false,
      curveSegments: 16
    });
    geometry.translate(0, 0, -PAPER / 2);
    global.PacVu3DViewer.assignBoardFaceMaterials(geometry, PAPER, 'interior');
    geometry.computeVertexNormals();
    return { geometry, centerX, centerY };
  }

  function addBrand(panel) {
    panel.geometry.computeBoundingBox();
    const bounds = panel.geometry.boundingBox;
    const size = new THREE.Vector3();
    bounds.getSize(size);
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 320;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#625d57';
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = '700 260px Arial, sans-serif'; context.fillText('PacVu', 512, 105);
    context.font = '500 42px Arial, sans-serif'; context.fillText('Packaging + View + Use', 512, 262);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    const width = size.x * .34;
    const brand = new THREE.Mesh(
      new THREE.PlaneGeometry(width, width * canvas.height / canvas.width),
      global.PacVu3DViewer.createOverlayMaterial(THREE, { map: texture, transparent: true, opacity: .46, depthWrite: false, toneMapped: false })
    );
    // B001 is laid internal-side-up in the Flat stage.  The printed exterior
    // is the reverse face, so the brand belongs on the negative-Z skin.
    brand.position.set((bounds.min.x + bounds.max.x) / 2, (bounds.min.y + bounds.max.y) / 2, -PAPER / 2 - .02);
    brand.rotation.y = Math.PI;
    brand.renderOrder = 100;
    brand.userData.pacvuBrand = true;
    brand.userData.flatY = brand.position.y;
    panel.add(brand);
  }

  function init3D() {
    const layout = global.B001_getLayout(W, D, H);
    const bounds = layout.bounds;
    const anchors = layout.anchors;
    const xs = anchors.panelsX;
    const top = anchors.bodyTopY;
    const bottom = anchors.bodyBottomY;
    const minY = bounds.minY;
    const maxY = bounds.minY + bounds.height;
    const center = { x: bounds.minX + bounds.width / 2, y: bounds.minY + bounds.height / 2 };
    const outline = pointsFromPath(layout.fillPath, 2600);
    const requiredCuts = layout.requiredCutElements.map(markup => pointsFromMarkup(markup, 180));
    const handleFoldY = Math.max.apply(null, requiredCuts[0].map(point => point.y));

    const viewer = global.PacVu3DViewer.createModal({
      id: 'b0013dModal',
      badge: 'B001 · Bakery Box · Fixed 160×110×80 mm'
    });
    const modal = viewer.modal;
    const stage = viewer.stage;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera = global.PacVu3DViewer.createPerspectiveCamera(THREE, { W, D, H });
    const renderer = global.PacVu3DViewer.createRenderer(THREE, { preserveDrawingBuffer: true });
    stage.prepend(renderer.domElement);
    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .075;
    controls.rotateSpeed = .45; controls.panSpeed = .65; controls.zoomSpeed = .75;
    controls.screenSpacePanning = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;

    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor, global.PacVu3DTheme.hemisphereLight.groundColor, global.PacVu3DTheme.hemisphereLight.intensity));
    const sun = new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color, global.PacVu3DTheme.directionalLight.intensity);
    sun.position.fromArray(global.PacVu3DTheme.directionalLight.position); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -600; sun.shadow.camera.right = 600;
    sun.shadow.camera.top = 600; sun.shadow.camera.bottom = -600;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 1500;
    sun.shadow.bias = -.00035; sun.shadow.normalBias = 1.2;
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.ShadowMaterial({ color: 0x3f3933, opacity: .34 }));
    floor.receiveShadow = true; floor.position.z = -1.7; scene.add(floor);
    const grid = new THREE.GridHelper(global.PacVu3DTheme.grid.size, global.PacVu3DTheme.grid.divisions, global.PacVu3DTheme.grid.centerColor, global.PacVu3DTheme.grid.lineColor);
    grid.rotation.x = Math.PI / 2; grid.position.z = -1.4; scene.add(grid);
    global.PacVu3DViewer.standardizeEnvironment({ renderer, scene, controls, floor, grid });

    const materials = global.PacVu3DViewer.createBoardMaterials(THREE);
    materials[2] = materials[2].clone();
    materials[2].color.copy(materials[0].color);
    materials[2].name = 'B001 seamless white paper edge';
    const model = new THREE.Group(); scene.add(model);
    const pieceByName = new Map();
    const hinges = [];
    let paper = null, paperMaterialMode = 'existing';

    function addPiece(name, rect, holeIndexes) {
      const polygon = clipPolygon(outline, rect);
      if (polygon.length < 3) return null;
      const holes = (holeIndexes || []).map(index => requiredCuts[index]);
      const made = makeGeometry(polygon, holes);
      const mesh = new THREE.Mesh(made.geometry, materials);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      if (name === 'sideL' || name === 'sideR') mesh.receiveShadow = false;
      mesh.position.set(made.centerX - center.x, center.y - made.centerY, 0);
      const record = { mesh, polygon, holes, flatCenter: mesh.position.clone(), basePosition: mesh.position.clone(), centerY: made.centerY };
      pieceByName.set(name, record);
      return mesh;
    }

    // The locking wings are one continuous sheet of board.  Give only those
    // meshes enough longitudinal vertices to bow smoothly around the handles.
    function computeGroupedSmoothNormals(geometry) {
      const positions = geometry.getAttribute('position');
      if (!positions) return;
      const sums = new Map();
      const vertexGroups = new Int16Array(positions.count);
      geometry.groups.forEach(group => {
        const end = group.start + group.count;
        for (let index = group.start; index < end; index += 1) {
          vertexGroups[index] = group.materialIndex;
        }
      });
      const keyFor = index => vertexGroups[index] + ':' +
        positions.getX(index).toFixed(4) + ':' +
        positions.getY(index).toFixed(4) + ':' +
        positions.getZ(index).toFixed(4);
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const c = new THREE.Vector3();
      const ab = new THREE.Vector3();
      const ac = new THREE.Vector3();
      const face = new THREE.Vector3();
      for (let index = 0; index < positions.count; index += 3) {
        a.fromBufferAttribute(positions, index);
        b.fromBufferAttribute(positions, index + 1);
        c.fromBufferAttribute(positions, index + 2);
        ab.subVectors(b, a);
        ac.subVectors(c, a);
        face.crossVectors(ab, ac);
        for (let offset = 0; offset < 3; offset += 1) {
          const key = keyFor(index + offset);
          if (!sums.has(key)) sums.set(key, new THREE.Vector3());
          sums.get(key).add(face);
        }
      }
      const normals = new Float32Array(positions.count * 3);
      for (let index = 0; index < positions.count; index += 1) {
        const normal = sums.get(keyFor(index));
        if (normal && normal.lengthSq() > 0) normal.normalize();
        normals[index * 3] = normal ? normal.x : 0;
        normals[(index * 3) + 1] = normal ? normal.y : 0;
        normals[(index * 3) + 2] = normal ? normal.z : 1;
      }
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geometry.attributes.normal.needsUpdate = true;
    }

    function subdivideForSmoothBend(source, maxYSpan) {
      const input = source.index ? source.toNonIndexed() : source.clone();
      const positions = input.getAttribute('position');
      const uvs = input.getAttribute('uv');
      const geometry = new THREE.BufferGeometry();
      const outPositions = [];
      const outUvs = [];
      const groups = input.groups.length
        ? input.groups
        : [{ start: 0, count: positions.count, materialIndex: 0 }];

      const vertex = index => ({
        p: [positions.getX(index), positions.getY(index), positions.getZ(index)],
        uv: uvs ? [uvs.getX(index), uvs.getY(index)] : null
      });
      const emit = triangle => triangle.forEach(v => {
        outPositions.push(...v.p);
        if (v.uv) outUvs.push(...v.uv);
      });
      // Shared clipping planes give adjacent triangles identical edge vertices.
      // Independent recursive splits left T-junctions that opened when bent.
      const clip = (polygon, axis, boundary, above) => {
        const result = [];
        let a = polygon[polygon.length - 1];
        if (!a) return result;
        for (const b of polygon) {
          const ia = above ? a.p[axis] >= boundary : a.p[axis] <= boundary;
          const ib = above ? b.p[axis] >= boundary : b.p[axis] <= boundary;
          if (ia !== ib) {
            const t = (boundary - a.p[axis]) / (b.p[axis] - a.p[axis]);
            result.push({ p: a.p.map((v, i) => v + (b.p[i] - v) * t),
              uv: a.uv ? a.uv.map((v, i) => v + (b.uv[i] - v) * t) : null });
          }
          if (ib) result.push(b);
          a = b;
        }
        return result;
      };
      const splitAxis = (polygon, axis) => {
        const values = polygon.map(v => v.p[axis]);
        const first = Math.floor(Math.min(...values) / maxYSpan);
        const last = Math.floor(Math.max(...values) / maxYSpan);
        const parts = [];
        for (let k = first; k <= last; k++) {
          const part = clip(clip(polygon, axis, k * maxYSpan, true), axis, (k + 1) * maxYSpan, false);
          if (part.length >= 3) parts.push(part);
        }
        return parts;
      };
      const split = triangle => {
        for (const strip of splitAxis(triangle, 1)) {
          for (const cell of splitAxis(strip, 0)) {
            for (let i = 1; i + 1 < cell.length; i++) emit([cell[0], cell[i], cell[i + 1]]);
          }
        }
      };
      groups.forEach(group => {
        const groupStart = outPositions.length / 3;
        for (let i = group.start; i < group.start + group.count; i += 3) {
          split([vertex(i), vertex(i + 1), vertex(i + 2)], 0);
        }
        geometry.addGroup(groupStart, outPositions.length / 3 - groupStart, group.materialIndex);
      });
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(outPositions, 3));
      if (outUvs.length) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(outUvs, 2));
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      input.dispose();
      return geometry;
    }

    addPiece('glue', { x0: bounds.minX, x1: xs[0], y0: top, y1: bottom });
    addPiece('front', { x0: xs[0], x1: xs[1], y0: top, y1: bottom });
    // f-2/f-4 are absent: each side wall and its locking lid are one mesh.
    // Keeping them in one geometry removes the artificial 3D seam entirely.
    addPiece('sideL', { x0: xs[1], x1: xs[2], y0: minY, y1: bottom }, [2]);
    const back = addPiece('back', { x0: xs[2], x1: xs[3], y0: top, y1: bottom });
    addBrand(back);
    addPiece('sideR', { x0: xs[3], x1: xs[4], y0: minY, y1: bottom }, [3]);
    // The production dieline has no printed fold across the handle neck.
    // Cardboard still flexes there during assembly, so 3D uses a virtual
    // hinge: roof first, handle crown upright second.
    addPiece('frontRoof', { x0: xs[0], x1: xs[1], y0: handleFoldY, y1: top });
    addPiece('frontHandle', { x0: xs[0], x1: xs[1], y0: minY, y1: handleFoldY }, [0]);
    addPiece('backRoof', { x0: xs[2], x1: xs[3], y0: handleFoldY, y1: top });
    addPiece('backHandle', { x0: xs[2], x1: xs[3], y0: minY, y1: handleFoldY }, [1]);
    addPiece('frontBottom', { x0: xs[0], x1: xs[1], y0: bottom, y1: maxY });
    addPiece('sideLBottom', { x0: xs[1], x1: xs[2], y0: bottom, y1: maxY });
    addPiece('backBottom', { x0: xs[2], x1: xs[3], y0: bottom, y1: maxY });
    addPiece('sideRBottom', { x0: xs[3], x1: xs[4], y0: bottom, y1: maxY });

    // Flat shows the interior kraft face. Once the crowns have folded into
    // their assembled position, the exposed handle surfaces are exterior
    // white. Keep these states separate so Flat is never recoloured.
    const flatHandleMaterials = materials;
    const assembledHandleMaterials = [materials[0], materials[0], materials[0]];

    // The locking-wing cut edges are buried by the overlap in the assembled
    // carton. Keep their geometry/thickness, but avoid a dark pencil-like seam
    // where the shared cut-edge material would otherwise remain visible.
    const lockingWingMaterials = [materials[0], materials[1], materials[0]];
    pieceByName.get('sideL').mesh.material = lockingWingMaterials;
    pieceByName.get('sideR').mesh.material = lockingWingMaterials;

    const flexNames = ['glue', 'front', 'back', 'frontRoof', 'backRoof', 'frontHandle', 'backHandle', 'sideL', 'sideR'];
    const flexSources = new Map();
    flexNames.forEach(name => {
      const piece = pieceByName.get(name);
      const original = piece.mesh.geometry;
      piece.mesh.geometry = subdivideForSmoothBend(original, name === 'sideL' || name === 'sideR' ? 3 : 6);
      original.dispose();
      flexSources.set(name, new Float32Array(piece.mesh.geometry.attributes.position.array));
    });

    const point = (x, y, z) => new THREE.Vector3(x - center.x, center.y - y, z || 0);
    const sheet = new THREE.Group(); model.add(sheet);
    sheet.userData.panelId = 'front';
    sheet.add(pieceByName.get('front').mesh);

    function attach(parentFrame, name, a, b, start, end, angle) {
      const piece = pieceByName.get(name);
      if (!piece) return parentFrame;
      const p = point(a.x, a.y);
      const q = point(b.x, b.y);
      const hinge = new THREE.Group(); hinge.position.copy(p); parentFrame.add(hinge);
      const frame = new THREE.Group(); frame.position.copy(p).multiplyScalar(-1); hinge.add(frame);
      frame.add(piece.mesh);
      const axis = q.clone().sub(p).normalize();
      const radial = piece.flatCenter.clone().sub(p);
      const sign = new THREE.Vector3().crossVectors(axis, radial).z >= 0 ? 1 : -1;
      frame.userData.panelId = name;
      const parentMesh = pieceByName.get(parentFrame.userData.panelId).mesh;
      hinges.push({ object: hinge, frame, parentMesh, childMesh: piece.mesh, sourceA:a, sourceB:b,
        a: {x:p.x-parentMesh.position.x,y:-(p.y-parentMesh.position.y)},
        b: {x:q.x-parentMesh.position.x,y:-(q.y-parentMesh.position.y)},
        axis, angle: (angle == null ? Math.PI / 2 : angle) * sign, start, end });
      return frame;
    }

    const sideLFrame = attach(sheet, 'sideL', { x: xs[1], y: top }, { x: xs[1], y: bottom }, .08, .22);
    const backFrame = attach(sideLFrame, 'back', { x: xs[2], y: top }, { x: xs[2], y: bottom }, .18, .34);
    const sideRFrame = attach(backFrame, 'sideR', { x: xs[3], y: top }, { x: xs[3], y: bottom }, .28, .44);
    attach(sheet, 'glue', { x: xs[0], y: bottom }, { x: xs[0], y: top }, .02, .13);

    const standPoint = point(xs[0], bottom);
    const standHinge = new THREE.Group(); standHinge.position.copy(standPoint); model.add(standHinge);
    model.remove(sheet); standHinge.add(sheet); sheet.position.sub(standPoint);
    hinges.push({ object: standHinge, axis: new THREE.Vector3(1, 0, 0), angle: Math.PI / 2, start: .42, end: .52 });

    attach(sheet, 'frontBottom', { x: xs[0], y: bottom }, { x: xs[1], y: bottom }, .53, .68);
    attach(sideLFrame, 'sideLBottom', { x: xs[1], y: bottom }, { x: xs[2], y: bottom }, .56, .7);
    attach(backFrame, 'backBottom', { x: xs[2], y: bottom }, { x: xs[3], y: bottom }, .59, .72);
    attach(sideRFrame, 'sideRBottom', { x: xs[3], y: bottom }, { x: xs[4], y: bottom }, .62, .74);

    // Bring the two opposing handle bases together at the centre ridge.
    // 77 degrees gives each 56.5 mm roof shoulder roughly D/2 inward reach.
    const roofAngle = 0; // Continuous shoulder bending below replaces rigid roof hinges.
    const frontRoofFrame = attach(sheet, 'frontRoof', { x: xs[1], y: top }, { x: xs[0], y: top }, .68, .76, roofAngle);
    const backRoofFrame = attach(backFrame, 'backRoof', { x: xs[2], y: top }, { x: xs[3], y: top }, .7, .78, roofAngle);
    // Cancel the roof tilt at the unprinted neck so both handle crowns finish
    // upright and face one another at the centre ridge.
    const handleFoldAngle = roofAngle;
    attach(frontRoofFrame, 'frontHandle', { x: xs[1], y: handleFoldY }, { x: xs[0], y: handleFoldY }, .74, .79, - handleFoldAngle);
    attach(backRoofFrame, 'backHandle', { x: xs[2], y: handleFoldY }, { x: xs[3], y: handleFoldY }, .74, .79, -handleFoldAngle);
    // Both wings approach inward; the first slot seats before the second
    // finishes pushing down onto its separate paper layer.
    const slotInsertions = [
      {
        piece: pieceByName.get('sideR'),
        bendStart: .79, bendEnd: .86,
        overStart: .86, overEnd: .93,
        stackOffset: PAPER / 2
      },
      {
        piece: pieceByName.get('sideL'),
        bendStart: .82, bendEnd: .90,
        overStart: .90, overEnd: 1,
        stackOffset: -PAPER / 2
      }
    ];
    slotInsertions.forEach(item => {
      const geometry = item.piece.mesh.geometry;
      geometry.computeBoundingBox();
      // Local Y at the former f-2/f-4 position. Vertices below it are the
      // rigid side wall; vertices above it are the continuous curved lid.
      item.baseY = item.piece.centerY - top;
      item.length = geometry.boundingBox.max.y - item.baseY;
      const slot = requiredCuts[item.piece.mesh.name === 'sideL' ? 2 : 3];
      item.slotStart = top - Math.max(...slot.map(point => point.y));
      item.slotEnd = top - Math.min(...slot.map(point => point.y));
      item.originalPositions = new Float32Array(geometry.attributes.position.array);
    });

    // A continuous, arc-length-parametrized shoulder joins the upright body
    // to the centre crown. A monotone quarter arc avoids the former S-bend.
    // The handle itself stays upright above the curved shoulder.
    const shoulderStart = handleFoldY + Math.PI * (D - PAPER - HANDLE_CONTACT_GAP) / 4;
    const shoulderLength = shoulderStart - handleFoldY;
    let shoulderCache = null;
    function shoulderProfile(amount, thickness) {
      const key = amount + ':' + thickness;
      if (shoulderCache?.key === key) return shoulderCache;
      const reach = Math.max(0, (D - thickness - HANDLE_CONTACT_GAP) / 2);
      const integrate = angle => {
        const rows = [{ y: 0, z: 0, angle: 0 }];
        let y = 0, z = 0;
        for (let i = 1; i <= 256; i++) {
          const a = angle * Math.pow((i - .5) / 256, .45);
          y += Math.cos(a) * shoulderLength / 256;
          z += Math.sin(a) * shoulderLength / 256;
          rows.push({ y, z, angle: angle * Math.pow(i / 256, .45) });
        }
        return rows;
      };
      let lo = 0, hi = Math.PI * .55;
      for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2;
        if (integrate(mid)[256].z < reach) lo = mid; else hi = mid;
      }
      const rows = integrate((lo + hi) / 2 * amount);
      const at = distance => {
        if (distance <= 0) return { y: distance, z: 0, angle: 0 };
        if (distance >= shoulderLength) return { ...rows[256], y: rows[256].y + distance - shoulderLength, angle: 0 };
        const index = distance / shoulderLength * 256;
        const i = Math.floor(index), t = index - i, a = rows[i], b = rows[i + 1];
        return { y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, angle: a.angle + (b.angle - a.angle) * t };
      };
      shoulderCache = { key, at, base: at(shoulderStart - top), crown: at(shoulderLength) };
      return shoulderCache;
    }
    let shoulderAmount = 0;
    function curveShoulders(amount, thickness) {
      const profile = shoulderProfile(amount, thickness);
      flexNames.filter(name => name !== 'sideL' && name !== 'sideR').forEach(name => {
        const piece = pieceByName.get(name), original = flexSources.get(name);
        const geometry = piece.mesh.geometry, positions = geometry.attributes.position;
        if (piece.lastShoulderKey === profile.key) return;
        piece.lastShoulderKey = profile.key;
        for (let i = 0; i < positions.count; i++) {
          const x = original[i * 3], y = original[i * 3 + 1], z = original[i * 3 + 2] * thickness / PAPER;
          const distance = shoulderStart - piece.centerY + y;
          const p = profile.at(distance);
          if (name === 'glue') positions.setXYZ(i, x - p.z, piece.centerY - shoulderStart + p.y, z);
          else positions.setXYZ(i, x, piece.centerY - shoulderStart + p.y - z * Math.sin(p.angle), p.z + z * Math.cos(p.angle));
        }
        positions.needsUpdate = true;
        computeGroupedSmoothNormals(geometry);
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        piece.mesh.children.forEach(child => {
          if (!child.userData.pacvuBrand) return;
          const p = profile.at(shoulderStart - piece.centerY + child.userData.flatY);
          const skin = -thickness / 2 - .02;
          child.position.y = piece.centerY - shoulderStart + p.y - skin * Math.sin(p.angle);
          child.position.z = p.z + skin * Math.cos(p.angle);
          child.rotation.set(p.angle, Math.PI, 0);
        });
      });
    }

    function curveSlotWing(item, bentAmount, overAmount) {
      const bent = clamp(bentAmount, 0, 1);
      const over = clamp(overAmount, 0, 1);
      const thickness = paper?.enabled ? paper.thickness : PAPER;
      const poseKey = bent + (over * 2) + thickness * 10 + shoulderAmount * 100;
      if (Math.abs(poseKey - (item.lastCurvePose ?? -1)) < .0005) return;
      item.lastCurvePose = poseKey;
      const geometry = item.piece.mesh.geometry;
      const position = geometry.attributes.position;
      const original = item.originalPositions;
      if (bent < .0001 && shoulderAmount < .0001) {
        position.array.set(original);
        for (let index = 0; index < position.count; index += 1) position.setZ(index, original[index * 3 + 2] * thickness / PAPER);
        position.needsUpdate = true;
        computeGroupedSmoothNormals(geometry);
        
        return;
      }
      // The full cross-slot seats across the upright handle, not just its
      // midpoint. A round shoulder meets a straight slot-bearing saddle.
      const profile = shoulderProfile(shoulderAmount, thickness);
      // Spread the bend into the upper 12 mm of the continuous side wall.
      // This rounds the shoulder without moving the seated slot or handle.
      const blendLength = 12;
      const bendBaseY = item.baseY - blendLength;
      const rootProfile = profile.at(shoulderStart - top - blendLength);
      const bodyShift = rootProfile.y - (shoulderStart - top - blendLength);
      const slotStart = item.slotStart + blendLength;
      const slotEnd = item.slotEnd + blendLength;
      const slotLength = item.slotEnd - item.slotStart;
      const reach = (W - slotLength) / 2;
      const layer = thickness * (item.stackOffset > 0 ? 1 : 2);
      const rise = profile.crown.y - rootProfile.y + layer;
      const key = profile.key + ':' + layer;
      if (item.seatKey !== key) {
        const sample = (arm, count) => {
          const rows = [{ s: 0, y: 0, z: 0, angle: 0 }];
          let length = 0;
          for (let i = 1; i <= count; i++) {
            const t = i / count, u = 1 - t;
            // Collinear first/last three controls give zero curvature at
            // both joins: the bow eases out of the wall and into the slot.
            const y = 5 * u ** 4 * t * arm + 20 * u ** 3 * t ** 2 * arm +
              (10 * u ** 2 * t ** 3 + 5 * u * t ** 4 + t ** 5) * rise;
            const z = 10 * u ** 2 * t ** 3 * (reach - 2 * arm) +
              5 * u * t ** 4 * (reach - arm) + t ** 5 * reach;
            const dy = 5 * (u ** 4 * arm + 4 * u ** 3 * t * arm +
              6 * u ** 2 * t ** 2 * (rise - 2 * arm));
            const dz = 5 * (6 * u ** 2 * t ** 2 * (reach - 2 * arm) +
              4 * u * t ** 3 * arm + t ** 4 * arm);
            const last = rows[rows.length - 1];
            length += Math.hypot(y - last.y, z - last.z);
            rows.push({ s: length, y, z, angle: Math.atan2(dz, dy) });
          }
          return rows;
        };
        let lo = 0, hi = Math.min(reach, rise) / 2;
        for (let i = 0; i < 28; i++) {
          const arm = (lo + hi) / 2;
          if (sample(arm, 256)[256].s < slotStart) lo = arm; else hi = arm;
        }
        item.seatRows = sample((lo + hi) / 2, 256);
        item.seatKey = key;
      }
      const rows = item.seatRows;
      const finalAt = distance => {
        if (distance >= slotStart && distance <= slotEnd)
          return { y: rise, z: reach + distance - slotStart, angle: Math.PI / 2 };
        if (distance > slotEnd) {
          const tail = distance - slotEnd, radius = 80, a = tail / radius;
          return { y: rise - radius * (1 - Math.cos(a)), z: reach + slotLength + radius * Math.sin(a), angle: Math.PI / 2 + a };
        }
        let lo = 0, hi = rows.length - 1;
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          if (rows[mid].s < distance) lo = mid; else hi = mid;
        }
        const a = rows[lo], b = rows[hi], t = clamp((distance - a.s) / (b.s - a.s), 0, 1);
        return { y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, angle: a.angle + (b.angle - a.angle) * t };
      };
      // First bow inward, then push the slot down over the paired handles.
      // Integrating unit tangents preserves the authored wing/slot lengths.
      const closure = bent * (.78 + .22 * over);
      const count = 640, step = (item.length + blendLength) / count;
      const bentRows = [{ y: 0, z: 0 }];
      for (let i = 1; i <= count; i++) {
        const a = finalAt((i - .5) * step).angle * closure;
        const last = bentRows[i - 1];
        bentRows.push({ y: last.y + Math.cos(a) * step, z: last.z + Math.sin(a) * step });
      }
      for (let index = 0; index < position.count; index++) {
        const offset = index * 3;
        const x = original[offset], y = original[offset + 1];
        const z = original[offset + 2] * thickness / PAPER;
        if (y <= bendBaseY) {
          const p = profile.at(shoulderStart - item.piece.centerY + y);
          position.setXYZ(index, x, item.piece.centerY - shoulderStart + p.y, z);
          continue;
        }
        const distance = y - bendBaseY, exact = finalAt(distance);
        const row = clamp(distance / step, 0, count), i = Math.min(count - 1, Math.floor(row)), t = row - i;
        const a = bentRows[i], b = bentRows[i + 1];
        const py = closure === 1 ? exact.y : a.y + (b.y - a.y) * t;
        const pz = closure === 1 ? exact.z : a.z + (b.z - a.z) * t;
        const angle = exact.angle * closure;
        position.setXYZ(index, x, bendBaseY + bodyShift + py - z * Math.sin(angle), pz + z * Math.cos(angle));
      }
      position.needsUpdate = true;
      computeGroupedSmoothNormals(geometry);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }

    // Rigid panels use the shared physical engine. The two continuous wings
    // retain their authored curved deformation, including its stock normals.
    const presentation = global.PacVuMailer3DControls.create({id:'B001',modal,stage,renderer,scene,camera,controls,getModel:()=>model,
      createPaper(){
        const pieces = new Map([...pieceByName].filter(([id])=>!flexNames.includes(id)));
        const paperHinges = hinges.filter(h=>h.childMesh&&pieces.has(h.parentMesh.name)&&pieces.has(h.childMesh.name)).map((h,i)=>({...h,id:'b001-'+i}));
        const white = global.PacVuWhitePaperboard.createMaterials(THREE,renderer,{sourceMaterials:materials});
        let core;
        core = global.PacVuPhysicalPaper3D.createFoldedAdapter({THREE,root:model,pieces,frames:new Map(),center,
          contract:{code:'B001',panels:[...pieces].map(([id,p])=>({id,polygon:p.polygon,holes:p.holes})),
            folds:paperHinges.map(h=>({id:h.id,parentId:h.parentMesh.name,childId:h.childMesh.name,axis:{a:h.sourceA,b:h.sourceB},phase:[h.start,h.end]}))},
          hinges:paperHinges,materials,whitePaperboard:white,baseMaterialSets:{existing:materials,white:white.materials},
          clamp,phase:(v,r)=>phase(v,r[0],r[1]),point:p=>point(p.x,p.y),initialThickness:PAPER,
          repose(){const v=Number(viewer.range.value)/100;pose(v,true);core.update(v);pose(v,true);}});
        paper = core;
        const repose = ()=>pose(Number(viewer.range.value)/100,true);
        return {get enabled(){return core.enabled;},update(v){core.update(v);repose();},
          setEnabled(v){core.setEnabled(v);repose();},setThickness(v){const t=core.setThickness(v);repose();return t;},
          setMaterialMode(mode){paperMaterialMode=mode;core.setMaterialMode(mode);},
          getDiagnostics:()=>core.getDiagnostics(),dispose(){core.dispose();white.dispose();}};
      }});
    presentation.bind();

    function pose(value, skipPaper=false) {
      const thickness = paper?.enabled ? paper.thickness : PAPER;
      shoulderAmount = phase(value, .68, .79);
      curveShoulders(shoulderAmount, thickness);
      modal.querySelector('.m001-3d-controls').style.setProperty('--progress', Math.round(value * 100) + '%');
      hinges.forEach(hinge => {
        hinge.object.quaternion.setFromAxisAngle(hinge.axis, hinge.angle * phase(value, hinge.start, hinge.end));
      });
      const frontHandle = pieceByName.get('frontHandle');
      const backHandle = pieceByName.get('backHandle');
      if (frontHandle && backHandle) {
        // Always solve handle contact from the authored pose. Using the
        // previous frame's corrected position creates a feedback loop that
        // makes the handle jump back and forth while scrubbing the slider.
        backHandle.mesh.position.copy(backHandle.basePosition);
        model.updateMatrixWorld(true);
        const closure = phase(value, .74, .79);
        const handleMaterials = closure >= .999
          ? assembledHandleMaterials
          : flatHandleMaterials;
        if(paperMaterialMode==='existing') {
          frontHandle.mesh.material = handleMaterials;
          backHandle.mesh.material = handleMaterials;
        }
        const frontBox = new THREE.Box3().setFromObject(frontHandle.mesh);
        const backBox = new THREE.Box3().setFromObject(backHandle.mesh);
        const frontNormal = new THREE.Vector3(0, 0, 1)
          .applyQuaternion(frontHandle.mesh.getWorldQuaternion(new THREE.Quaternion()))
          .normalize();
        const corners = box => [
          new THREE.Vector3(box.min.x, box.min.y, box.min.z), new THREE.Vector3(box.min.x, box.min.y, box.max.z),
          new THREE.Vector3(box.min.x, box.max.y, box.min.z), new THREE.Vector3(box.min.x, box.max.y, box.max.z),
          new THREE.Vector3(box.max.x, box.min.y, box.min.z), new THREE.Vector3(box.max.x, box.min.y, box.max.z),
          new THREE.Vector3(box.max.x, box.max.y, box.min.z), new THREE.Vector3(box.max.x, box.max.y, box.max.z)
        ];
        const frontProjection = corners(frontBox).map(point => point.dot(frontNormal));
        const backProjection = corners(backBox).map(point => point.dot(frontNormal));
        const frontContact = Math.max(...frontProjection);
        const backContact = Math.min(...backProjection);
        const worldCorrection = frontNormal.clone().multiplyScalar(
          0 // Crowns meet through the continuous shoulder profile, not detached translation.
        );
        const localCorrection = worldCorrection.applyQuaternion(
          backHandle.mesh.parent.getWorldQuaternion(new THREE.Quaternion()).invert()
        );
        backHandle.mesh.position.copy(backHandle.basePosition).add(localCorrection);
      }
      const lift = phase(value, .42, .52);
      const lower = phase(value, .72, .78);
      model.position.z = Math.max(D, H) * .65 * lift * (1 - lower);
      // B001 is a single connected sheet.  The slot wings may flex around the
      // handles, but their roots must remain fixed to the side-wall hinges.
      slotInsertions.forEach(item => {
        const bent = phase(value, item.bendStart, item.bendEnd);
        const over = phase(value, item.overStart, item.overEnd);
        curveSlotWing(item, bent, over);
      });
      model.updateMatrixWorld(true);
      if(!skipPaper)presentation.update(value);
    }

    function resize() {
      const width = stage.clientWidth; const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
    }
    function view(type) {
      presentation.fit(type);
    }
    const slider = viewer.range;
    // Common material switches run before this listener; retain B001's
    // assembled handle-face rule without overriding White Paperboard.
    modal.addEventListener('click',event=>{if(event.target.closest('[data-mailer-action]'))pose(Number(slider.value)/100,true);});
    modal.addEventListener('input',event=>{if(event.target!==slider)pose(Number(slider.value)/100,true);});
    slider.oninput = () => {
      const value = Number(slider.value) / 100; pose(value);
      const step = value < .34 ? 0 : value < .9 ? 1 : 2;
      modal.querySelectorAll('.assembly-labels span').forEach((node, index) => node.classList.toggle('active', index <= step));
    };
    modal.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => view(button.dataset.view); });
    modal.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
    let shadowOn = true;
    modal.querySelector('[data-shadow]').onclick = event => {
      shadowOn = !shadowOn; floor.visible = shadowOn; sun.castShadow = shadowOn;
      event.currentTarget.textContent = shadowOn ? 'Shadows On' : 'Shadows Off';
    };
    modal.querySelector('[data-download]').onclick = () => {
      const floorVisible = floor.visible; const gridVisible = grid.visible; const background = scene.background;
      floor.visible = false; grid.visible = false; scene.background = null;
      renderer.setClearColor(0x000000, 0); renderer.render(scene, camera);
      renderer.domElement.toBlob(blob => {
        floor.visible = floorVisible; grid.visible = gridVisible; scene.background = background;
        renderer.setClearColor(global.PacVu3DTheme.colors.background, 1);
        if (!blob) return;
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
        link.download = 'B001_3D_' + slider.value + '.png'; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, 'image/png');
    };
    const observer = new ResizeObserver(resize); observer.observe(stage);
    resize(); view('iso'); pose(0);
    let live = true; let frame = 0;
    (function renderLoop() {
      if (!live) return;
      frame = requestAnimationFrame(renderLoop);
      if(modal.classList.contains('open')) { controls.update(); renderer.render(scene, camera); }
    })();
    return {
      open() { modal.classList.add('open'); resize(); view('iso'); },
      destroy() {
        live = false; cancelAnimationFrame(frame); observer.disconnect(); presentation.dispose(); controls.dispose?.();
        model.traverse(object => {
          object.geometry?.dispose();
          if (object.userData?.pacvuOffsetMaterials) object.userData.pacvuOffsetMaterials.forEach(material => material.dispose());
          if (object.userData?.pacvuBrand) object.material?.map?.dispose();
          if (object.userData?.pacvuBrand) object.material?.dispose();
        });
        materials.forEach(material => material.dispose()); renderer.dispose(); modal.remove();
      }
    };
  }

  let app = null;
  function attachButton() {
    const toolbar = document.querySelector('.toolbar') || document.querySelector('header') || document.body;
    if (document.getElementById('b001-3d-btn')) return;
    const button = document.createElement('button');
    button.id = 'b001-3d-btn'; button.textContent = '3D MOCKUP'; button.style.display = 'none';
    toolbar.appendChild(button);
    button.onclick = () => { if (!app) app = init3D(); app.open(); };
    function updateVisibility() {
      const active = typeof selectedBoxMeta !== 'undefined' && selectedBoxMeta && selectedBoxMeta.engineKey === 'b001';
      button.style.display = active ? '' : 'none';
    }
    updateVisibility(); setInterval(updateVisibility, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachButton);
  else attachButton();
})(window);



