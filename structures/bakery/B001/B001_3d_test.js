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

    function addPiece(name, rect, holeIndexes) {
      const polygon = clipPolygon(outline, rect);
      if (polygon.length < 3) return null;
      const holes = (holeIndexes || []).map(index => requiredCuts[index]);
      const made = makeGeometry(polygon, holes);
      const mesh = new THREE.Mesh(made.geometry, materials);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      if (name === 'sideL' || name === 'sideR') mesh.receiveShadow = false;
      mesh.position.set(made.centerX - center.x, center.y - made.centerY, 0);
      const record = { mesh, flatCenter: mesh.position.clone(), basePosition: mesh.position.clone(), centerY: made.centerY };
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
      const midpoint = (a, b) => ({
        p: a.p.map((value, index) => (value + b.p[index]) * .5),
        uv: a.uv ? a.uv.map((value, index) => (value + b.uv[index]) * .5) : null
      });
      const emit = triangle => triangle.forEach(v => {
        outPositions.push(...v.p);
        if (v.uv) outUvs.push(...v.uv);
      });
      const uniformLevels = 4;
      const split = (triangle, depth) => {
        if (depth >= uniformLevels) { emit(triangle); return; }
        const ab = midpoint(triangle[0], triangle[1]);
        const bc = midpoint(triangle[1], triangle[2]);
        const ca = midpoint(triangle[2], triangle[0]);
        split([triangle[0], ab, ca], depth + 1);
        split([ab, triangle[1], bc], depth + 1);
        split([ca, bc, triangle[2]], depth + 1);
        split([ab, bc, ca], depth + 1);
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
      computeGroupedSmoothNormals(geometry);
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

    ['sideL', 'sideR'].forEach(name => {
      const piece = pieceByName.get(name);
      const original = piece.mesh.geometry;
      piece.mesh.geometry = subdivideForSmoothBend(original, 4);
      original.dispose();
    });

    const point = (x, y, z) => new THREE.Vector3(x - center.x, center.y - y, z || 0);
    const sheet = new THREE.Group(); model.add(sheet);
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
      hinges.push({ object: hinge, axis, angle: (angle == null ? Math.PI / 2 : angle) * sign, start, end });
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
    const roofAngle = THREE.MathUtils.degToRad(77);
    const frontRoofFrame = attach(sheet, 'frontRoof', { x: xs[1], y: top }, { x: xs[0], y: top }, .68, .76, roofAngle);
    const backRoofFrame = attach(backFrame, 'backRoof', { x: xs[2], y: top }, { x: xs[3], y: top }, .7, .78, roofAngle);
    // Cancel the roof tilt at the unprinted neck so both handle crowns finish
    // upright and face one another at the centre ridge.
    const handleFoldAngle = roofAngle;
    attach(frontRoofFrame, 'frontHandle', { x: xs[1], y: handleFoldY }, { x: xs[0], y: handleFoldY }, .74, .79, - handleFoldAngle);
    attach(backRoofFrame, 'backHandle', { x: xs[2], y: handleFoldY }, { x: xs[3], y: handleFoldY }, .74, .79, -handleFoldAngle);
    // Lock the slot wings one at a time. The first wing completes its full
    // bend/push/seat action before the opposite wing begins to move.
    const slotInsertions = [
      {
        piece: pieceByName.get('sideR'),
        bendStart: .81, bendEnd: .88,
        overStart: .88, overEnd: .91,
        stackOffset: PAPER / 2
      },
      {
        piece: pieceByName.get('sideL'),
        bendStart: .91, bendEnd: .97,
        overStart: .97, overEnd: 1,
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
      item.slotAlong = clamp((98.199 * (D / 110)) / item.length, .45, .8);
      item.originalPositions = new Float32Array(geometry.attributes.position.array);
    });

    function curveSlotWing(item, bentAmount, overAmount) {
      const bent = clamp(bentAmount, 0, 1);
      const over = clamp(overAmount, 0, 1);
      const poseKey = bent + (over * 2);
      if (Math.abs(poseKey - (item.lastCurvePose ?? -1)) < .0005) return;
      item.lastCurvePose = poseKey;
      const geometry = item.piece.mesh.geometry;
      const position = geometry.attributes.position;
      const original = item.originalPositions;
      if (bent < .0001) {
        position.array.set(original);
        position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return;
      }
      // Keep the approved quarter-circle as the approach pose, then morph the
      // whole 1-23 -> 1-21 span into one continuous half ellipse.
      const bendAngle = Math.PI / 2;
      const radius = item.length / Math.max(bendAngle, .0001);
      const ovalRadiusX = W / 2;
      const ovalRadiusY = 12;
      for (let index = 0; index < position.count; index += 1) {
        const offset = index * 3;
        const x = original[offset];
        const y = original[offset + 1];
        const z = original[offset + 2];
        if (y <= item.baseY) {
          position.setXYZ(index, x, y, z);
          continue;
        }
        const along = clamp((y - item.baseY) / item.length, 0, 1);



const angle = bendAngle * along;
const arcCenterY = item.baseY + (Math.sin(angle) * radius);
const arcCenterZ = (1 - Math.cos(angle)) * radius;
const arcNormalY = -Math.sin(angle);
const arcNormalZ = Math.cos(angle);
const arcY = arcCenterY + (z * arcNormalY);
const arcZ = arcCenterZ + (z * arcNormalZ);

const ovalAngle = along <= item.slotAlong
  ? (along / item.slotAlong) * (Math.PI / 2)
  : (Math.PI / 2) + (((along - item.slotAlong) / (1 - item.slotAlong)) * (Math.PI / 2));

const ovalCenterY = item.baseY + (Math.sin(ovalAngle) * ovalRadiusY);
const ovalCenterZ = (1 - Math.cos(ovalAngle)) * ovalRadiusX;
const ovalTangentY = Math.cos(ovalAngle) * ovalRadiusY;
const ovalTangentZ = Math.sin(ovalAngle) * ovalRadiusX;
const ovalNormalLength = Math.hypot(ovalTangentY, ovalTangentZ) || 1;
const ovalNormalY = -ovalTangentZ / ovalNormalLength;
const ovalNormalZ = ovalTangentY / ovalNormalLength;
const stackProfile = smooth(clamp(along / .12, 0, 1));
const surfaceOffset = z + (item.stackOffset * stackProfile * over);
const ovalY = ovalCenterY + (surfaceOffset * ovalNormalY);
const ovalZ = ovalCenterZ + (surfaceOffset * ovalNormalZ);

const lockedY = arcY + ((ovalY - arcY) * over);
const lockedZ = arcZ + ((ovalZ - arcZ) * over);

position.setXYZ(
  index,
  x,
  y + ((lockedY - y) * bent),
  z + ((lockedZ - z) * bent)
);


      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
    }

    function pose(value) {
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
        frontHandle.mesh.material = handleMaterials;
        backHandle.mesh.material = handleMaterials;
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
          (frontContact - backContact + HANDLE_CONTACT_GAP) * closure
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
    }

    function resize() {
      const width = stage.clientWidth; const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
    }
    function view(type) {
      global.PacVu3DViewer.fitObject(model, camera, controls, type);
    }
    const slider = modal.querySelector('input');
    slider.oninput = () => {
      const value = Number(slider.value) / 100; pose(value);
      const step = value < .34 ? 0 : value < .9 ? 1 : 2;
      modal.querySelectorAll('.assembly-labels span').forEach((node, index) => node.classList.toggle('active', index <= step));
    };
    slider.onchange = () => view('iso');
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
      frame = requestAnimationFrame(renderLoop); controls.update(); renderer.render(scene, camera);
    })();
    return {
      open() { modal.classList.add('open'); resize(); view('iso'); },
      destroy() {
        live = false; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose?.();
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
