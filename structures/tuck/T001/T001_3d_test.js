(function (global) {
  'use strict';

  if (!global.T001_getLayout) return;

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

  function clipPolygon(points, bounds) {
    // Rounded SVG coordinates can fall just outside a partition axis. Snap
    // those sub-micron differences before clipping, not after triangulation:
    // accepting outside vertices creates a self-crossing strip at flap roots.
    const snap = (value, low, high) => Math.abs(value-low) <= EPSILON ? low
      : Math.abs(value-high) <= EPSILON ? high : value;
    let polygon = points.map(p => ({x:snap(p.x,bounds.minX,bounds.maxX),y:snap(p.y,bounds.minY,bounds.maxY)}));
    polygon = clipEdge(polygon, p => p.x >= bounds.minX,
      (a, b) => intersectionAtX(a, b, bounds.minX));
    polygon = clipEdge(polygon, p => p.x <= bounds.maxX,
      (a, b) => intersectionAtX(a, b, bounds.maxX));
    polygon = clipEdge(polygon, p => p.y >= bounds.minY,
      (a, b) => intersectionAtY(a, b, bounds.minY));
    polygon = clipEdge(polygon, p => p.y <= bounds.maxY,
      (a, b) => intersectionAtY(a, b, bounds.maxY));
    return polygon;
  }

  function rectangle(minX, minY, maxX, maxY) {
    return { minX, minY, maxX, maxY };
  }

  function polygonArea(points) {
    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
      area += points[j].x * points[i].y - points[i].x * points[j].y;
    }
    return Math.abs(area / 2);
  }

  function cleanPolygon(points) {
    const cleaned = [];
    points.forEach(point => {
      const previous = cleaned[cleaned.length - 1];
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > EPSILON) cleaned.push(point);
    });
    if (cleaned.length > 1 && Math.hypot(
      cleaned[0].x - cleaned[cleaned.length - 1].x,
      cleaned[0].y - cleaned[cleaned.length - 1].y
    ) <= EPSILON) cleaned.pop();
    let changed = true;
    while (changed && cleaned.length > 3) {
      changed = false;
      for (let index = 0; index < cleaned.length; index += 1) {
        const previous = cleaned[(index - 1 + cleaned.length) % cleaned.length];
        const current = cleaned[index];
        const next = cleaned[(index + 1) % cleaned.length];
        const cross = (current.x - previous.x) * (next.y - current.y) -
          (current.y - previous.y) * (next.x - current.x);
        if (Math.abs(cross) <= EPSILON) {
          cleaned.splice(index, 1);
          changed = true;
          break;
        }
      }
    }
    return cleaned;
  }

  function panel(id, role, polygon, parentId) {
    return Object.freeze({ id, role, parentId: parentId || null, polygon: Object.freeze(polygon) });
  }

  function fold(id, parentId, childId, a, b, angle, phase, internal) {
    return Object.freeze({
      id, parentId, childId,
      axis: Object.freeze({ a: Object.freeze(a), b: Object.freeze(b) }),
      angle,
      phase: Object.freeze(phase),
      internal: Boolean(internal)
    });
  }

  function buildContract(input) {
    const W = Number(input && input.W) || 57;
    const D = Number(input && input.D) || 57;
    const H = Number(input && input.H) || 177;
    const layout = global.T001_getLayout(W, D, H);
    const g = layout.grid;
    const outline = global.T001_flattenPathD(layout.fillPath);
    if (!outline || outline.length < 3) throw new Error('T001 3D: approved Cut outline is unavailable.');

    // Read actual 2D fold segments. Their endpoint relief is not a panel boundary.
    const sourceFolds = layout.foldElements.map(el => {
      const read = key => Number(el.match(new RegExp(key + '="([^"]+)"'))?.[1]);
      return { a: {x:read('x1'),y:read('y1')}, b: {x:read('x2'),y:read('y2')} };
    });
    const findFold = (a,b) => {
      const vertical = Math.abs(a.x-b.x)<EPSILON;
      const choices = sourceFolds.filter(f => vertical
        ? Math.abs(f.a.x-f.b.x)<EPSILON && Math.abs(f.a.x-a.x)<EPSILON
        : Math.abs(f.a.y-f.b.y)<EPSILON && Math.min(f.a.x,f.b.x)>=Math.min(a.x,b.x)-EPSILON && Math.max(f.a.x,f.b.x)<=Math.max(a.x,b.x)+EPSILON);
      choices.sort((p,q)=>Math.abs((p.a.y+p.b.y)/2-(a.y+b.y)/2)-Math.abs((q.a.y+q.b.y)/2-(a.y+b.y)/2));
      if(!choices.length)throw new Error('T001: missing source fold');
      const f=choices[0];return vertical ? (f.a.y<f.b.y?f:{a:f.b,b:f.a}) : (f.a.x<f.b.x?f:{a:f.b,b:f.a});
    };
    const lidBodyFold = findFold({x:g.xFrontL,y:g.yBodyTop},{x:g.xFrontR,y:g.yBodyTop});
    const lidBodyY = lidBodyFold.a.y;
    const regions = [
      ['glue', 'adhesive', rectangle(g.xGlueL, g.yBodyTop, g.xFrontL, g.yBodyBottom), 'front'],
      ['front', 'body', rectangle(g.xFrontL, lidBodyY, g.xFrontR, g.yBodyBottom), null],
      ['sideLeft', 'body', rectangle(g.xFrontR, g.yBodyTop, g.xSideLR, g.yBodyBottom), 'front'],
      ['back', 'body', rectangle(g.xSideLR, g.yBodyTop, g.xBackR, g.yBodyBottom), 'sideLeft'],
      ['sideRight', 'body', rectangle(g.xBackR, g.yBodyTop, g.xSideRR, g.yBodyBottom), 'back'],
      ['upperTuck', 'topTuck', rectangle(g.xFrontL, g.yTop, g.xFrontR, g.yLidFold), 'lidTop'],
      ['lidTop', 'top', rectangle(g.xFrontL, g.yLidFold, g.xFrontR, lidBodyY), 'front'],
      ['lidSideLeft', 'dust', rectangle(g.xFrontR, g.yTop, g.xSideLR, g.yBodyTop), 'sideLeft'],
      ['lidSideRight', 'dust', rectangle(g.xBackR, g.yTop, g.xSideRR, g.yBodyTop), 'sideRight'],
      ['bottomFront', 'bottomLock', rectangle(g.xFrontL, g.yBodyBottom, g.xFrontR, g.yBottomLockEnd), 'front'],
      ['bottomSideLeft', 'bottomLock', rectangle(g.xFrontR, g.yBodyBottom, g.xSideLR, g.yBottomLockBend), 'sideLeft'],
      ['bottomBack', 'bottomLock', rectangle(g.xSideLR, g.yBodyBottom, g.xBackR, g.yBottomLockBend), 'back'],
      ['bottomBackTip', 'bottomLockTip', rectangle(g.xSideLR, g.yBottomLockBend, g.xBackR, g.yBottomLockEnd), 'bottomBack'],
      ['bottomSideRight', 'bottomLock', rectangle(g.xBackR, g.yBodyBottom, g.xSideRR, g.yBottomLockBend), 'sideRight']
    ];

    const panels = regions.map(definition => panel(
      definition[0], definition[1], cleanPolygon(clipPolygon(outline, definition[2])), definition[3]
    )).filter(item => item.polygon.length >= 3 && polygonArea(item.polygon) > EPSILON);

    const verticalAxis = (x) => ({ x, y: g.yBodyTop });
    const verticalAxisEnd = (x) => ({ x, y: g.yBodyBottom });
    const horizontalAxis = (x1, x2, y) => [{ x: x1, y }, { x: x2, y }];
    const foldRelations = [
      fold('body.front-sideLeft', 'front', 'sideLeft', verticalAxis(g.xFrontR), verticalAxisEnd(g.xFrontR), 90, [0.10, 0.24]),
      fold('body.sideLeft-back', 'sideLeft', 'back', verticalAxis(g.xSideLR), verticalAxisEnd(g.xSideLR), 90, [0.20, 0.34]),
      fold('body.back-sideRight', 'back', 'sideRight', verticalAxis(g.xBackR), verticalAxisEnd(g.xBackR), 90, [0.30, 0.44]),
      fold('body.front-glue', 'front', 'glue', verticalAxis(g.xFrontL), verticalAxisEnd(g.xFrontL), 90, [0.02, 0.14]),
      fold('top.sideLeft-dust', 'sideLeft', 'lidSideLeft', ...horizontalAxis(g.xFrontR, g.xSideLR, g.yBodyTop), 90, [0.78, 0.84]),
      fold('top.sideRight-dust', 'sideRight', 'lidSideRight', ...horizontalAxis(g.xBackR, g.xSideRR, g.yBodyTop), 90, [0.78, 0.84]),
      fold('top.front-lid', 'front', 'lidTop', ...horizontalAxis(g.xFrontL, g.xFrontR, g.yBodyTop), 90, [0.90, 1.00]),
      fold('top.lid-tuck', 'lidTop', 'upperTuck', ...horizontalAxis(g.xFrontL, g.xFrontR, g.yLidFold), 110, [0.84, 0.90]),
      fold('bottom.front', 'front', 'bottomFront', ...horizontalAxis(g.xFrontL, g.xFrontR, g.yBodyBottom), 90, [0.46, 0.52]),
      fold('bottom.sideLeft', 'sideLeft', 'bottomSideLeft', ...horizontalAxis(g.xFrontR, g.xSideLR, g.yBodyBottom), 90, [0.58, 0.64]),
      fold('bottom.sideRight', 'sideRight', 'bottomSideRight', ...horizontalAxis(g.xBackR, g.xSideRR, g.yBodyBottom), 90, [0.58, 0.64]),
      fold('bottom.back', 'back', 'bottomBack', ...horizontalAxis(g.xSideLR, g.xBackR, g.yBodyBottom), 90, [0.66, 0.74]),
      fold('bottom.back-bend', 'bottomBack', 'bottomBackTip', ...horizontalAxis(g.xSideLR, g.xBackR, g.yBottomLockBend), 105, [0.70, 0.76], true)
    ];

    // All real folds retain their source axis. Only the existing internal
    // insertion bend has no separate crease in the SVG.
    for(let i=0;i<foldRelations.length;i++) {
      const r=foldRelations[i];if(r.internal)continue;
      const axis=findFold(r.axis.a,r.axis.b);
      foldRelations[i]=fold(r.id,r.parentId,r.childId,axis.a,axis.b,r.angle,r.phase,false);
    }

    const adhesiveRelations = Object.freeze([
      Object.freeze({
        id: 'body-glue-seam',
        from: 'glue',
        to: 'sideRight',
        insidePanel: 'glue',
        outsidePanel: 'sideRight',
        order: Object.freeze(['fold-glue-inward', 'wrap-side-right', 'adhere']),
        phase: Object.freeze([0.36, 0.46])
      })
    ]);
    const insertionRelations = Object.freeze([
      Object.freeze({
        id: 'bottom-back-slot-insertion',
        from: 'bottomBackTip',
        to: 'bottomLockSlot',
        formedBy: Object.freeze(['bottomFront', 'bottomSideLeft', 'bottomSideRight']),
        direction: 'inside',
        phase: Object.freeze([0.72, 0.76])
      }),
      Object.freeze({ id: 'upper-tuck-insertion', from: 'upperTuck', to: 'back', phase: Object.freeze([0.92, 1.00]) })
    ]);

    const bendDepth = g.yBottomLockBend - g.yBodyBottom;
    if (Math.abs(bendDepth - D * 0.5) > EPSILON) {
      throw new Error('T001 3D: Bottom Lock bend contract failed.');
    }
    const panelIds = new Set(panels.map(item => item.id));
    foldRelations.forEach(relation => {
      if (!panelIds.has(relation.parentId) || !panelIds.has(relation.childId)) {
        throw new Error('T001 3D: invalid fold relation ' + relation.id);
      }
    });
    const bottomPanelIds = ['bottomFront', 'bottomSideLeft', 'bottomBack', 'bottomBackTip', 'bottomSideRight'];
    const missingBottomPanels = bottomPanelIds.filter(id => !panelIds.has(id));
    if (missingBottomPanels.length) {
      throw new Error('T001 3D: missing Bottom Lock panels: ' + missingBottomPanels.join(', '));
    }
    const bottomFolds = new Map(foldRelations
      .filter(relation => relation.id.indexOf('bottom.') === 0)
      .map(relation => [relation.id, relation]));
    const lockA = bottomFolds.get('bottom.front');
    const lockL = bottomFolds.get('bottom.sideLeft');
    const lockR = bottomFolds.get('bottom.sideRight');
    const lockB = bottomFolds.get('bottom.back');
    const lockBInsert = bottomFolds.get('bottom.back-bend');
    if (!lockA || !lockL || !lockR || !lockB || !lockBInsert ||
        lockA.phase[1] > lockL.phase[0] + EPSILON ||
        lockA.phase[1] > lockR.phase[0] + EPSILON ||
        Math.max(lockL.phase[1], lockR.phase[1]) > lockB.phase[0] + EPSILON) {
      throw new Error('T001 3D: Bottom Lock assembly order must be A -> L/R -> B.');
    }
    if (Math.abs(lockA.axis.a.y - g.yBodyBottom) > EPSILON ||
        Math.abs(lockA.axis.b.y - g.yBodyBottom) > EPSILON ||
        lockA.axis.a.x < g.xFrontL - EPSILON ||
        lockA.axis.b.x > g.xFrontR + EPSILON) {
      throw new Error('T001 3D: Front and Bottom Lock A hinge are disconnected.');
    }

    return Object.freeze({
      code: 'T001',
      dimensions: Object.freeze({ W, D, H }),
      layout,
      panels: Object.freeze(panels),
      foldRelations: Object.freeze(foldRelations),
      adhesiveRelations,
      insertionRelations,
      bottomAssemblyOrder: Object.freeze(['bottomFront', 'bottomSideLeft+bottomSideRight', 'bottomBack', 'bottomBackTip']),
      internalAxes: Object.freeze({ yBottomLockBend: g.yBottomLockBend }),
      states: Object.freeze({ flat: 0, fold: 0.58, closed: 1 })
    });
  }

  function createMaster(input) {
    const THREE = global.THREE;
    const Viewer = global.PacVu3DViewer;
    if (!THREE || !Viewer || !global.PacVuOrbitControls) {
      throw new Error('T001 3D: GA001 viewer dependencies are unavailable.');
    }
    const contract = buildContract(input);
    const C = contract.dimensions;
    const bounds = contract.layout.dielineBounds;
    const center = { x: bounds.minX + bounds.width / 2, y: bounds.minY + bounds.height / 2 };
    const thickness = 0.45;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const smooth = value => { const v = clamp(value, 0, 1); return v * v * (3 - 2 * v); };
    const phase = (value, range) => smooth((value - range[0]) / (range[1] - range[0]));
    const point = (p, z) => new THREE.Vector3(p.x - center.x, center.y - p.y, z || 0);

    function addFrontBrand(mesh) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 480;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgb(72,67,62)';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '700 250px Pretendard';
      context.fillText('PacVu', 512, 165);
      context.font = '500 48px Pretendard';
      context.fillText('Packaging + View + Use', 512, 370);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      mesh.geometry.computeBoundingBox();
      const panelBounds = mesh.geometry.boundingBox;
      const panelSize = new THREE.Vector3();
      panelBounds.getSize(panelSize);
      const width = panelSize.x * 0.76;
      const height = width * canvas.height / canvas.width;
      const brand = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        Viewer.createOverlayMaterial(THREE, {
          map: texture,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
          side: THREE.FrontSide,
          toneMapped: false
        })
      );
      brand.name = 'PacVu front watermark';
      brand.position.set(
        (panelBounds.min.x + panelBounds.max.x) / 2,
        panelBounds.max.y - panelSize.y * 0.30,
        -thickness / 2 - 0.012
      );
      brand.rotation.y = Math.PI;
      brand.renderOrder = 1000;
      brand.userData.pacvuBrand = true;
      mesh.add(brand);
    }

    function panelGeometry(polygon) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      polygon.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const shape = new THREE.Shape();
      polygon.forEach((p, index) => index
        ? shape.lineTo(p.x - cx, cy - p.y)
        : shape.moveTo(p.x - cx, cy - p.y));
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 10 });
      geometry.translate(0, 0, -thickness / 2);
      global.PacVuWhitePaperboard?.applyPhysicalUV(THREE, geometry, { offsetX: cx, offsetY: cy });
      Viewer.assignBoardFaceMaterials(geometry, thickness, 'interior');
      geometry.computeVertexNormals();
      return { geometry, cx, cy };
    }

    const viewer = Viewer.createModal({ id: 't0013dModal', badge: 'T001 · PacVu Tuck Box 3D Master' });
    const modal = viewer.modal;
    const stage = viewer.stage;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera = Viewer.createPerspectiveCamera(THREE, C);
    const renderer = Viewer.createRenderer(THREE);
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.prepend(renderer.domElement);
    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.45;
    controls.panSpeed = 0.65;
    controls.screenSpacePanning = true;
    controls.zoomSpeed = 0.75;
    controls.minDistance = Math.max(C.W, C.D, C.H) * 0.35;
    controls.maxDistance = Math.max(C.W, C.D, C.H) * 8;

    scene.add(new THREE.HemisphereLight(
      global.PacVu3DTheme.hemisphereLight.skyColor,
      global.PacVu3DTheme.hemisphereLight.groundColor,
      global.PacVu3DTheme.hemisphereLight.intensity
    ));
    const sun = new THREE.DirectionalLight(
      global.PacVu3DTheme.directionalLight.color,
      global.PacVu3DTheme.directionalLight.intensity
    );
    sun.position.fromArray(global.PacVu3DTheme.directionalLight.position);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -650; sun.shadow.camera.right = 650;
    sun.shadow.camera.top = 650; sun.shadow.camera.bottom = -650;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 1600;
    sun.shadow.bias = -0.00035; sun.shadow.normalBias = 1.5;
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), new THREE.ShadowMaterial({ color: 0x3f3933, opacity: 0.38 }));
    floor.receiveShadow = true; floor.position.z = -2; scene.add(floor);
    const grid = new THREE.GridHelper(
      global.PacVu3DTheme.grid.size,
      global.PacVu3DTheme.grid.divisions,
      global.PacVu3DTheme.grid.centerColor,
      global.PacVu3DTheme.grid.lineColor
    );
    grid.rotation.x = Math.PI / 2;
    grid.position.z = global.PacVu3DTheme.grid.z;
    scene.add(grid);
    Viewer.standardizeEnvironment({ renderer, scene, controls, floor, grid });

    const materials = Viewer.createBoardMaterials(THREE);
    // T001 is a continuous folded sheet. Keep hinge edges light so fold
    // boundaries do not look like separated dark-kraft panel cuts.
    materials[2].color.setHex(0xf2f0ed);
    materials[2].name = 'T001 light paper fold edge';
    const whitePaperboard = global.PacVuWhitePaperboard?.createMaterials(THREE, renderer, { sourceMaterials: materials });
    const materialSets = { existing: materials, white: whitePaperboard?.materials || materials };
    let materialMode = 'existing';
    const root = new THREE.Group();
    root.name = 'T001 3D Master';
    scene.add(root);
    const pieces = new Map();
    contract.panels.forEach(definition => {
      const made = panelGeometry(definition.polygon);
      const mesh = new THREE.Mesh(made.geometry, materialSets[materialMode]);
      mesh.name = definition.id;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(made.cx - center.x, center.y - made.cy, 0);
      pieces.set(definition.id, { mesh, flatCenter: mesh.position.clone() });
    });
    const gluePiece = pieces.get('glue');
    const sideRightPiece = pieces.get('sideRight');
    if (gluePiece && sideRightPiece) {
      gluePiece.mesh.position.z = thickness * 0.65;
      gluePiece.mesh.userData.adhesiveLayer = 'inside';
      sideRightPiece.mesh.userData.adhesiveLayer = 'outside';
    }

    const front = pieces.get('front');
    if (!front) throw new Error('T001 3D: front panel is unavailable.');
    addFrontBrand(front.mesh);
    const sheet = new THREE.Group();
    const standPoint = point({ x: contract.layout.grid.xFrontL, y: contract.layout.grid.yBodyBottom });
    const standHinge = new THREE.Group();
    standHinge.position.copy(standPoint);
    root.add(standHinge);
    sheet.position.copy(standPoint).multiplyScalar(-1);
    standHinge.add(sheet);
    sheet.add(front.mesh);

    const frames = new Map([['front', sheet]]);
    const hinges = [];
    contract.foldRelations.forEach(relation => {
      const parentFrame = frames.get(relation.parentId);
      const piece = pieces.get(relation.childId);
      if (!parentFrame || !piece) throw new Error('T001 3D: fold hierarchy failed at ' + relation.id);
      const a = point(relation.axis.a);
      const b = point(relation.axis.b);
      const hinge = new THREE.Group();
      hinge.name = relation.id;
      hinge.position.copy(a);
      parentFrame.add(hinge);
      const frame = new THREE.Group();
      frame.position.copy(a).multiplyScalar(-1);
      hinge.add(frame);
      frame.add(piece.mesh);
      frames.set(relation.childId, frame);
      const axis = b.clone().sub(a).normalize();
      const radial = piece.flatCenter.clone().sub(a);
      const geometricSign = new THREE.Vector3().crossVectors(axis, radial).z >= 0 ? 1 : -1;
      hinges.push({
        object: hinge,
        axis,
        radians: THREE.MathUtils.degToRad(relation.angle) * geometricSign,
        range: relation.phase,
        internal: relation.internal,
        relationId: relation.id,
        basePosition: hinge.position.clone()
      });
    });
    hinges.push({ object: standHinge, axis: new THREE.Vector3(1, 0, 0), radians: Math.PI / 2, range: [0.38, 0.50] });


    // T001-only Physical Paper presentation. Original remains the default.
    let physical=false,paperThickness=thickness,currentProgress=0;
    const originalPieces=new Map([...pieces].map(([id,p])=>[id,{geometry:p.mesh.geometry,position:p.mesh.position.clone()}]));
    const originalFrames=new Map([...frames].map(([id,frame])=>[id,frame.position.clone()]));
    const paperBridges=new THREE.Group();paperBridges.name='T001 physical crease surfaces';root.add(paperBridges);
    const paperMaterials={existing:(whitePaperboard?.materials||materials).map(m=>m.clone()),white:(whitePaperboard?.materials||materials).map(m=>m.clone())};
    paperMaterials.existing[0].color.copy(materials[0].color);
    paperMaterials.existing[1].color.copy(materials[1].color);
    paperMaterials.existing[2].color.copy(materials[1].color).multiplyScalar(.82);
    Object.values(paperMaterials).flat().forEach(m=>{if('roughness'in m)m.roughness=.98;if('bumpScale'in m)m.bumpScale=.016;});
    paperMaterials.existing[0].map=materials[0].map||null;
    if('bumpScale'in paperMaterials.existing[0])paperMaterials.existing[0].bumpScale=.008;
    const creaseData=contract.foldRelations.map(relation=>{
      const a=point(relation.axis.a),b=point(relation.axis.b),axis=b.clone().sub(a).normalize();
      const v=new THREE.Vector3(-axis.y,axis.x,0);
      if(v.dot(pieces.get(relation.childId).flatCenter.clone().sub(a))<0)v.negate();
      return {relation,a,b,axis,v,sourceV:{x:v.x,y:-v.y},length:a.distanceTo(b)};
    });
    function disposePhysicalGeometry(){
      pieces.forEach((piece,id)=>{
        const original=originalPieces.get(id);
        if(piece.mesh.geometry!==original.geometry)piece.mesh.geometry.dispose();
        piece.mesh.geometry=original.geometry;
      });
      while(paperBridges.children.length){const mesh=paperBridges.children[0];paperBridges.remove(mesh);mesh.geometry.dispose();}
    }
    function clipCrease(points,crease,child,distance){
      const a=crease.relation.axis.a,v=crease.sourceV,sign=child?1:-1;
      const value=p=>sign*((p.x-a.x)*v.x+(p.y-a.y)*v.y)-distance;
      return clipEdge(points,p=>value(p)>=-1e-7,(p,q)=>{const t=value(p)/(value(p)-value(q));return{x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t};});
    }
    function creaseIntervals(polygon,crease,child,distance){
      const a=crease.relation.axis.a,v=crease.sourceV,sign=child?1:-1,axis={x:crease.axis.x,y:-crease.axis.y};
      const along=p=>(p.x-a.x)*axis.x+(p.y-a.y)*axis.y;
      const on=p=>Math.abs(sign*((p.x-a.x)*v.x+(p.y-a.y)*v.y)-distance)<2e-5;
      const ranges=[];
      polygon.forEach((p,i)=>{const q=polygon[(i+1)%polygon.length];if(on(p)&&on(q)){
        const low=Math.min(along(p),along(q)),high=Math.max(along(p),along(q));
        if(high-low>EPSILON)ranges.push([low,high]);
      }});
      return ranges;
    }
    function paperPanelGeometry(id,polygon,trim){
      const original=pieces.get(id).flatCenter,cx=original.x+center.x,cy=center.y-original.y;
      const positions=[],normals=[],groups=[];
      const emit=(points,normal,material)=>{
        const start=positions.length/3;
        points.forEach(p=>{positions.push(p.x,p.y,p.z);normals.push(normal.x,normal.y,normal.z);});
        groups.push({start,count:points.length,materialIndex:material});
      };
      const local=(p,z)=>new THREE.Vector3(p.x-cx,cy-p.y,z);
      const contour=polygon.map(p=>new THREE.Vector2(p.x-cx,cy-p.y));
      THREE.ShapeUtils.triangulateShape(contour,[]).forEach(([a,b,c])=>{
        const p=contour[a],q=contour[b],r=contour[c];if((q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x)<0)[b,c]=[c,b];
        emit([a,b,c].map(i=>local(polygon[i],paperThickness/2)),new THREE.Vector3(0,0,1),1);
        emit([c,b,a].map(i=>local(polygon[i],-paperThickness/2)),new THREE.Vector3(0,0,-1),0);
      });
      let signed=0;polygon.forEach((p,i)=>{const q=polygon[(i+1)%polygon.length];signed+=p.x*q.y-q.x*p.y;});
      polygon.forEach((p,i)=>{
        const q=polygon[(i+1)%polygon.length];
        const hingeEdge=trim.some(({crease,child,distance})=>{
          const a=crease.relation.axis.a,v=crease.sourceV,sign=child?1:-1;
          const on=r=>Math.abs(sign*((r.x-a.x)*v.x+(r.y-a.y)*v.y)-distance)<2e-5;
          return on(p)&&on(q);
        });
        if(hingeEdge)return; // Source-shaped fold strips cover the bank boundary.
        let a=p,b=q;if(signed>0)[a,b]=[b,a];
        const a0=local(a,-paperThickness/2),b0=local(b,-paperThickness/2),a1=local(a,paperThickness/2),b1=local(b,paperThickness/2);
        const normal=new THREE.Vector3().crossVectors(b0.clone().sub(a0),b1.clone().sub(a0)).normalize();
        emit([a0,b0,b1,a0,b1,a1],normal,2);
      });
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
      groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));
      global.PacVuWhitePaperboard?.applyPhysicalUV(THREE,geometry,{offsetX:cx,offsetY:cy});
      return geometry;
    }
    function creaseBridge(crease,distance,parentDistance,childDistance,range,angle){
      const relation=crease.relation,parent=pieces.get(relation.parentId),child=pieces.get(relation.childId);
      const inverseRoot=new THREE.Matrix4().copy(root.matrixWorld).invert();
      const direction=(mesh,v)=>v.clone().transformDirection(mesh.matrixWorld).transformDirection(inverseRoot);
      const axis=direction(parent.mesh,crease.axis),normal=direction(parent.mesh,new THREE.Vector3(0,0,1));
      const tangent0=direction(parent.mesh,crease.v),tangent1=direction(child.mesh,crease.v);
      const sign=new THREE.Vector3().crossVectors(axis,tangent0).dot(normal)>=0?1:-1;
      const h=Math.abs(angle)<1e-5?distance*2/3:distance*(4/3)*Math.tan(Math.abs(angle)/4)/Math.tan(Math.abs(angle)/2);
      const from=(piece,s,radial)=>{
        const p=crease.a.clone().addScaledVector(crease.axis,s).addScaledVector(crease.v,radial).sub(piece.flatCenter);
        return piece.mesh.localToWorld(p).applyMatrix4(inverseRoot);
      };
      const positions=[],normals=[],uv=[],groups=[];
      function vertex(s,u,side){
        const p0=from(parent,s,-parentDistance),p3=from(child,s,childDistance),p1=p0.clone().addScaledVector(tangent0,h),p2=p3.clone().addScaledVector(tangent1,-h),v=1-u;
        const p=p0.clone().multiplyScalar(v*v*v).addScaledVector(p1,3*v*v*u).addScaledVector(p2,3*v*u*u).addScaledVector(p3,u*u*u);
        const tangent=p1.clone().sub(p0).multiplyScalar(3*v*v).addScaledVector(p2.clone().sub(p1),6*v*u).addScaledVector(p3.clone().sub(p2),3*u*u).normalize();
        const n=new THREE.Vector3().crossVectors(axis,tangent).multiplyScalar(sign).normalize();
        p.addScaledVector(n,side*paperThickness/2);
        const flat=crease.a.clone().addScaledVector(crease.axis,s).addScaledVector(crease.v,-parentDistance+(parentDistance+childDistance)*u);
        return{p,n:n.multiplyScalar(side),uv:[(flat.x+center.x)/32,(center.y-flat.y)/32]};
      }
      function triangle(a,b,c,material,overrideNormal){
        const n=overrideNormal||a.n;
        if(new THREE.Vector3().crossVectors(b.p.clone().sub(a.p),c.p.clone().sub(a.p)).dot(n)<0)[b,c]=[c,b];
        const start=positions.length/3;
        [a,b,c].forEach(v=>{positions.push(...v.p.toArray());normals.push(...(overrideNormal||v.n).toArray());uv.push(...v.uv);});
        groups.push({start,count:3,materialIndex:material});
      }
      // Tessellate the removed source-paper strip itself, including curved and
      // diagonal ends. A rectangular intersection of bank ranges loses these ends.
      const project=p=>({s:(p.x-relation.axis.a.x)*crease.axis.x-(p.y-relation.axis.a.y)*crease.axis.y,
        r:(p.x-relation.axis.a.x)*crease.sourceV.x+(p.y-relation.axis.a.y)*crease.sourceV.y});
      const total=parentDistance+childDistance;
      if(total<EPSILON)return;
      const segments=12;
      for(const id of [relation.parentId,relation.childId]) {
        const original=contract.panels.find(p=>p.id===id).polygon;
        for(let i=0;i<segments;i++) {
          const lo=-parentDistance+total*i/segments,hi=-parentDistance+total*(i+1)/segments;
          let poly=clipEdge(original,p=>project(p).r>=lo-1e-8,(a,b)=>{const t=(lo-project(a).r)/(project(b).r-project(a).r);return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};});
          poly=clipEdge(poly,p=>project(p).r<=hi+1e-8,(a,b)=>{const t=(hi-project(a).r)/(project(b).r-project(a).r);return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};});
          if(poly.length<3)continue;
          const mapped=p=>{const v=project(p);return{s:v.s,u:clamp((v.r+parentDistance)/total,0,1)};};
          const contour=poly.map(p=>new THREE.Vector2(p.x,p.y));
          for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(contour,[]))for(const side of [-1,1]) {
            const pts=[a,b,c].map(j=>{const v=mapped(poly[j]);return vertex(v.s,v.u,side);});
            triangle(...pts,side>0?1:0);
          }
          poly.forEach((p,j)=>{
            const q=poly[(j+1)%poly.length],pr=project(p).r,qr=project(q).r;
            // Slice banks and the parent/child seam are internal, not cut walls.
            if(Math.abs(pr-qr)<1e-7 && [lo,hi,0].some(r=>Math.abs(pr-r)<1e-7))return;
            const a=mapped(p),b=mapped(q),v0=vertex(a.s,a.u,-1),v1=vertex(b.s,b.u,-1),v2=vertex(b.s,b.u,1),v3=vertex(a.s,a.u,1);
            const n=new THREE.Vector3().crossVectors(v1.p.clone().sub(v0.p),v2.p.clone().sub(v0.p)).normalize();
            triangle(v0,v1,v2,2,n);triangle(v0,v2,v3,2,n);
          });
        }
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv1',new THREE.Float32BufferAttribute(uv,2));
      groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));
      const mesh=new THREE.Mesh(geometry,paperMaterials[materialMode]);mesh.name='T001 rounded paper '+relation.id;mesh.castShadow=true;mesh.receiveShadow=true;paperBridges.add(mesh);
    }
    function physicalPose(progress){
      const gap=paperThickness+.025;
      const layers={bottomSideLeft:1,bottomSideRight:1,bottomBack:2,lidSideLeft:1,lidSideRight:1,upperTuck:1};
      creaseData.forEach(crease=>{
        const id=crease.relation.childId,layer=layers[id]||0;
        const range=crease.relation.phase;
        if(layer)frames.get(id).position.z+=gap*layer*phase(progress,[range[0]+(range[1]-range[0])*.75,range[1]]);
      });
      pieces.get('glue').mesh.position.z=gap*phase(progress,[.30,.44]);
      const brand=pieces.get('front').mesh.children.find(c=>c.userData.pacvuBrand);
      if(brand)brand.position.z=-paperThickness/2-.012;
      root.position.z+=(floor.position.z+paperThickness/2)*phase(progress,[.74,.84]);
      root.updateMatrixWorld(true);
      disposePhysicalGeometry();
      const trims=new Map(contract.panels.map(p=>[p.id,[]]));
      const creases=creaseData.map(crease=>{
        const hinge=hinges.find(h=>h.relationId===crease.relation.id),angle=2*Math.acos(clamp(Math.abs(hinge.object.quaternion.w),0,1));
        const distance=paperThickness*.75*Math.tan(angle/2);
        let parentDistance=distance,childDistance=distance;
        if(Math.sin(angle)>1e-5){
          const parent=pieces.get(crease.relation.parentId),child=pieces.get(crease.relation.childId);
          const a=crease.v.clone().transformDirection(parent.mesh.matrixWorld),b=crease.v.clone().transformDirection(child.mesh.matrixWorld);
          const cosine=a.dot(b),sine=Math.sqrt(Math.max(0,1-cosine*cosine)),n=b.clone().addScaledVector(a,-cosine).normalize();
          const origin=p=>p.mesh.localToWorld(crease.a.clone().sub(p.flatCenter));
          const delta=origin(child).sub(origin(parent)),along=delta.dot(a),across=delta.dot(n);
          if(sine>1e-5){parentDistance+=-along+across*cosine/sine;childDistance-=across/sine;}
          parentDistance=Math.max(0,parentDistance);childDistance=Math.max(0,childDistance);
        }
        trims.get(crease.relation.parentId).push({crease,child:false,distance:parentDistance});trims.get(crease.relation.childId).push({crease,child:true,distance:childDistance});
        return{crease,distance,parentDistance,childDistance,angle};
      });
      const polygons=new Map();
      contract.panels.forEach(def=>{
        let polygon=def.polygon.slice();trims.get(def.id).forEach(t=>{polygon=clipCrease(polygon,t.crease,t.child,t.distance);});
        if(polygon.length<3)throw new Error('T001 paper: crease trim removed '+def.id);
        polygons.set(def.id,polygon);pieces.get(def.id).mesh.geometry=paperPanelGeometry(def.id,polygon,trims.get(def.id));
      });
      creases.forEach(({crease,distance,parentDistance,childDistance,angle})=>{
        if(distance<1e-5)return;
        const parent=creaseIntervals(polygons.get(crease.relation.parentId),crease,false,parentDistance),child=creaseIntervals(polygons.get(crease.relation.childId),crease,true,childDistance);
        creaseBridge(crease,distance,parentDistance,childDistance,null,angle);
      });
    }
    function pose(value) {
      currentProgress=clamp(value,0,1);
      frames.forEach((frame,id)=>frame.position.copy(originalFrames.get(id)));
      pieces.forEach((piece,id)=>piece.mesh.position.copy(originalPieces.get(id).position));
      const brand=pieces.get('front').mesh.children.find(c=>c.userData.pacvuBrand);
      if(brand)brand.position.z=-thickness/2-.012;
      if(!physical)disposePhysicalGeometry();
      const progress = clamp(value, 0, 1);
      hinges.forEach(hinge => {
        let foldAngle = hinge.radians * phase(progress, hinge.range);
        if (hinge.relationId === 'top.lid-tuck' && progress > 0.96) {
          const seatedAngle = Math.sign(hinge.radians) * THREE.MathUtils.degToRad(90);
          foldAngle = THREE.MathUtils.lerp(hinge.radians, seatedAngle, phase(progress, [0.96, 1.00]));
        } else if (hinge.relationId === 'bottom.back-bend' && progress > 0.76) {
          const seatedAngle = Math.sign(hinge.radians) * THREE.MathUtils.degToRad(90);
          foldAngle = THREE.MathUtils.lerp(hinge.radians, seatedAngle, phase(progress, [0.76, 0.82]));
        }
        hinge.object.quaternion.setFromAxisAngle(hinge.axis, foldAngle);
        if (hinge.basePosition) hinge.object.position.copy(hinge.basePosition);
      });
      const backTip = pieces.get('bottomBackTip');
      if (backTip) backTip.mesh.visible = true;
      const lift = phase(progress, [0.34, 0.44]);
      const lower = phase(progress, [0.72, 0.82]);
      root.position.z = Math.max(C.D, C.H) * 0.75 * lift * (1 - lower);
      if(physical)physicalPose(progress);
      modal.querySelector('.m001-3d-controls')?.style.setProperty('--progress', Math.round(progress * 100) + '%');
    }

    const whiteStudio = global.PacVuWhiteStudio?.create({ scene, camera, controls, renderer, root, sun, floor, grid }) || null;
    const originalShadow={type:renderer.shadowMap.type,size:sun.shadow.mapSize.clone(),radius:sun.shadow.radius,blurSamples:sun.shadow.blurSamples,bias:sun.shadow.bias,normalBias:sun.shadow.normalBias,
      camera:{left:sun.shadow.camera.left,right:sun.shadow.camera.right,top:sun.shadow.camera.top,bottom:sun.shadow.camera.bottom}};
    function setPaperShadows(){
      renderer.shadowMap.type=originalShadow.type;
      sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapPass?.dispose();sun.shadow.mapPass=null;
      // Preserve the approved studio's soft shadow profile. Physical contact
      // comes from actual layer spacing and floor placement, not harder light.
      sun.shadow.mapSize.copy(originalShadow.size);
      sun.shadow.radius=originalShadow.radius;sun.shadow.blurSamples=originalShadow.blurSamples;
      sun.shadow.bias=originalShadow.bias;sun.shadow.normalBias=originalShadow.normalBias;
      Object.assign(sun.shadow.camera,originalShadow.camera);sun.shadow.camera.updateProjectionMatrix();
      [...materials,...Object.values(paperMaterials).flat(),...(whitePaperboard?.materials||[])].forEach(m=>{m.needsUpdate=true;});
    }
    function setPaperMode(enabled){
      physical=Boolean(enabled);setPaperShadows();setMaterialMode(materialMode);pose(currentProgress);
      originalButton.setAttribute('aria-pressed',String(!physical));physicalButton.setAttribute('aria-pressed',String(physical));
      thicknessInput.disabled=!physical;thicknessLabel.style.opacity=physical?'1':'.5';
      modal.querySelector('.m001-3d-badge').textContent=physical?'T001 · Physical Paper POC':'T001 · PacVu Tuck Box 3D Master';
      if(physical)view('iso');
    }
    function setPaperThickness(value){
      paperThickness=Math.round(clamp(Number(value)||.45,.25,.8)*100)/100;
      thicknessInput.value=String(paperThickness);thicknessValue.textContent=paperThickness.toFixed(2)+' mm';
      if(physical){setPaperShadows();pose(currentProgress);}
    }
    function resize() {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    function view(type) {
      if(type==='bottom'){
        root.updateMatrixWorld(true);const box=new THREE.Box3();
        ['bottomFront','bottomSideLeft','bottomSideRight','bottomBack','bottomBackTip'].forEach(id=>box.expandByObject(pieces.get(id).mesh));
        const target=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());target.z=box.min.z+Math.min(3,paperThickness*3);
        const span=Math.max(size.x/Math.max(.5,camera.aspect),size.y),distance=span*.7/Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
        controls.target.copy(target);camera.position.copy(target).addScaledVector(new THREE.Vector3(1,-1,-1.4).normalize(),distance);
        camera.near=.05;camera.far=distance+Math.max(C.W,C.D,C.H)*5;camera.updateProjectionMatrix();controls.minDistance=span*.15;controls.update();return;
      }
      Viewer.fitObject(root, camera, controls, type);
      if (type === 'iso') whiteStudio?.view();
      if(physical||type==='bottom'){
        const offset=camera.position.clone().sub(controls.target).multiplyScalar(1.35);
        if(type==='bottom')offset.copy(new THREE.Vector3(1,-1,-1.4).normalize().multiplyScalar(offset.length()));
        camera.position.copy(controls.target).add(offset);camera.far*=1.35;camera.updateProjectionMatrix();controls.update();
      }
    }
    function setMaterialMode(mode) {
      materialMode = mode === 'white' ? 'white' : 'existing';
      pieces.forEach(piece => { piece.mesh.material = physical?paperMaterials[materialMode]:materialSets[materialMode]; });
      paperBridges.children.forEach(mesh=>{mesh.material=physical?paperMaterials[materialMode]:materialSets[materialMode];});
      modal.querySelectorAll('[data-material-mode]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.materialMode === materialMode));
      });
    }
    const materialControls = document.createElement('div');
    materialControls.className = 'm001-3d-views pacvu-viewer__views t001-material-controls';
    materialControls.style.right = '118px';
    materialControls.innerHTML = '<button type="button" class="btn light" data-material-mode="existing" aria-pressed="true">Existing Material</button><button type="button" class="btn light" data-material-mode="white" aria-pressed="false">White Paperboard</button>';
    stage.append(materialControls);
    materialControls.querySelectorAll('[data-material-mode]').forEach(button => {
      button.onclick = () => setMaterialMode(button.dataset.materialMode);
    });
    const paperControls=document.createElement('div');paperControls.className='m001-3d-views pacvu-viewer__views t001-paper-controls';
    paperControls.style.cssText='right:118px;top:102px;min-width:150px;gap:5px';
    const originalButton=document.createElement('button'),physicalButton=document.createElement('button'),bottomButton=document.createElement('button');
    originalButton.type=physicalButton.type=bottomButton.type='button';originalButton.className=physicalButton.className=bottomButton.className='btn light';
    originalButton.textContent='Original';physicalButton.textContent='Physical Paper POC';bottomButton.textContent='Bottom View';
    originalButton.setAttribute('aria-pressed','true');physicalButton.setAttribute('aria-pressed','false');
    originalButton.onclick=()=>setPaperMode(false);physicalButton.onclick=()=>setPaperMode(true);bottomButton.onclick=()=>view('bottom');
    const thicknessLabel=document.createElement('label'),thicknessValue=document.createElement('span'),thicknessInput=document.createElement('input');
    thicknessLabel.style.cssText='font-size:11px;background:#fff;padding:8px;border-radius:7px;display:grid;gap:5px;opacity:.5';
    const thicknessTitle=document.createElement('span');thicknessTitle.textContent='Paper thickness';thicknessValue.textContent='0.45 mm';
    thicknessInput.type='range';thicknessInput.min='.25';thicknessInput.max='.8';thicknessInput.step='.05';thicknessInput.value='.45';thicknessInput.disabled=true;thicknessInput.setAttribute('aria-label','T001 paper thickness');
    thicknessInput.oninput=()=>setPaperThickness(thicknessInput.value);
    thicknessLabel.append(thicknessTitle,thicknessValue,thicknessInput);paperControls.append(originalButton,physicalButton,bottomButton,thicknessLabel);stage.append(paperControls);
    const slider = modal.querySelector('.m001-3d-controls input');
    slider.oninput = () => {
      pose(Number(slider.value) / 100);
      const step = Number(slider.value) < 34 ? 0 : Number(slider.value) < 90 ? 1 : 2;
      modal.querySelectorAll('.assembly-track span,.assembly-labels span').forEach((node, index) => node.classList.toggle('active', index % 3 <= step));
    };
    modal.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => view(button.dataset.view); });
    let gridVisible = true;
    const gridButton = modal.querySelector('[data-grid]');
    gridButton.setAttribute('aria-pressed', 'true');
    gridButton.onclick = event => {
      gridVisible = !gridVisible;
      grid.visible = gridVisible;
      event.currentTarget.setAttribute('aria-pressed', String(gridVisible));
      event.currentTarget.textContent = gridVisible ? 'Grid On' : 'Grid Off';
    };
    modal.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
    let shadows = true;
    modal.querySelector('[data-shadow]').onclick = event => {
      shadows = !shadows; floor.visible = shadows; sun.castShadow = shadows;
      whiteStudio?.setShadows(shadows);
      event.currentTarget.textContent = shadows ? 'Shadows On' : 'Shadows Off';
    };
    const downloadCurrentView = () => {
      const hidden = [];
      const background = scene.background;
      const clearColor = renderer.getClearColor(new THREE.Color()).clone();
      const clearAlpha = renderer.getClearAlpha();
      scene.traverse(object => {
        if (object === floor || object.isGridHelper || object.type === 'GridHelper' || object.material?.isShadowMaterial) {
          hidden.push([object, object.visible]);
          object.visible = false;
        }
      });
      scene.background = null;
      renderer.setClearColor(0x000000, 0);
      renderer.render(scene, camera);
      renderer.domElement.toBlob(blob => {
        hidden.forEach(([object, visible]) => { object.visible = visible; });
        scene.background = background;
        renderer.setClearColor(clearColor, clearAlpha);
        renderer.render(scene, camera);
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'T001_3D_' + Math.round(Number(slider.value)) + '.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, 'image/png');
    };
    modal.querySelector('[data-download]').onclick = downloadCurrentView;
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize(); pose(0); view('iso');
    let live = true;
    let animationFrame = 0;
    (function animate() {
      if (!live) return;
      animationFrame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    })();

    return {
      contract,
      signature: [C.W, C.D, C.H].join(':'),
      open(state) {
        modal.classList.add('open');
        const target = state === 'flat' ? 0 : state === 'fold' ? contract.states.fold : state === 'closed' ? 1 : Number(slider.value) / 100;
        slider.value = String(Math.round(target * 100));
        pose(target); resize(); view('iso');
      },
      setState(state) {
        const target = state === 'flat' ? 0 : state === 'fold' ? contract.states.fold : 1;
        slider.value = String(Math.round(target * 100));
        pose(target);
      },
      setMaterialMode,
      setPaperMode,
      setPaperThickness,
      get paperMode(){return physical?'physical':'original';},
      get paperThickness(){return paperThickness;},
      get materialMode() { return materialMode; },
      destroy() {
        live = false;
        cancelAnimationFrame(animationFrame);
        observer.disconnect();
        controls.dispose?.();
        disposePhysicalGeometry();
        Object.values(paperMaterials).flat().forEach(material=>material.dispose());
        root.traverse(object => {
          object.geometry?.dispose();
          if (object.userData?.pacvuBrand) {
            object.material?.map?.dispose();
            object.material?.dispose();
          }
        });
        materials.forEach(material => material.dispose());
        whitePaperboard?.dispose();
        whiteStudio?.dispose();
        floor.geometry.dispose(); floor.material.dispose();
        grid.geometry.dispose();
        if (Array.isArray(grid.material)) grid.material.forEach(material => material.dispose());
        else grid.material.dispose();
        renderer.dispose();
        modal.remove();
      }
    };
  }

  let master = null;
  function open(state, input) {
    const cfg = input || (typeof global.getCfgT001 === 'function' ? global.getCfgT001() : { W: 57, D: 57, H: 177 });
    const signature = [cfg.W, cfg.D, cfg.H].join(':');
    if (!master || master.signature !== signature) {
      master?.destroy();
      master = createMaster(cfg);
    }
    master.open(state || 'flat');
    return master;
  }

  global.T001_3D_BUILD_CONTRACT = buildContract;
  global.T001_3D_MASTER = Object.freeze({ buildContract, create: createMaster, open });

  function attachTrigger() {
    const toolbar = document.querySelector('.toolbar') || document.body;
    if (document.getElementById('t001-3d-btn')) return;
    const button = document.createElement('button');
    button.id = 't001-3d-btn';
    button.type = 'button';
    button.textContent = '3D MOCKUP';
    button.style.display = 'none';
    button.onclick = () => open('flat');
    toolbar.appendChild(button);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachTrigger);
    else attachTrigger();
  }
})(window);
