(function (global) {
  'use strict';

  if (!global.T003_getLayout) return;
  const EPS = 0.001;

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

  function atX(a, b, x) {
    const t = Math.abs(b.x - a.x) < 1e-9 ? 0 : (x - a.x) / (b.x - a.x);
    return { x, y: a.y + (b.y - a.y) * t };
  }

  function atY(a, b, y) {
    const t = Math.abs(b.y - a.y) < 1e-9 ? 0 : (y - a.y) / (b.y - a.y);
    return { x: a.x + (b.x - a.x) * t, y };
  }

  function clipRect(points, bounds) {
    let polygon = points.slice();
    polygon = clipEdge(polygon, p => p.x >= bounds.minX - EPS, (a, b) => atX(a, b, bounds.minX));
    polygon = clipEdge(polygon, p => p.x <= bounds.maxX + EPS, (a, b) => atX(a, b, bounds.maxX));
    polygon = clipEdge(polygon, p => p.y >= bounds.minY - EPS, (a, b) => atY(a, b, bounds.minY));
    polygon = clipEdge(polygon, p => p.y <= bounds.maxY + EPS, (a, b) => atY(a, b, bounds.maxY));
    return polygon;
  }

  function clipLine(points, a, b, keepPositive) {
    const side = p => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    return clipEdge(points, p => keepPositive ? side(p) >= -EPS : side(p) <= EPS, (p, q) => {
      const sp = side(p), sq = side(q);
      const t = Math.abs(sp - sq) < 1e-9 ? 0 : sp / (sp - sq);
      return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
    });
  }

  function splitLockPanel(points, a, b) {
    const positive = clipLine(points, a, b, true);
    const negative = clipLine(points, a, b, false);
    return area(positive) <= area(negative)
      ? { triangle: positive, main: negative }
      : { triangle: negative, main: positive };
  }

  function area(points) {
    let value = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      value += points[j].x * points[i].y - points[i].x * points[j].y;
    }
    return Math.abs(value / 2);
  }

  function rect(minX, minY, maxX, maxY) { return { minX, minY, maxX, maxY }; }
  function contains(points, point) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i], b = points[j];
      if (((a.y > point.y) !== (b.y > point.y)) &&
          point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }

  // Cut a smooth semicircular notch into a horizontal panel boundary. This
  // is used for the neck hole that straddles the straight top/back fold.
  // A full THREE.Path hole touching two polygon edges causes triangulation
  // spikes; a real boundary notch preserves both the circle and fold axis.
  function horizontalSemicircleNotch(points, hole, edgeY, interiorBelow) {
    const left = hole.cx - hole.r;
    const right = hole.cx + hole.r;
    const steps = 32;
    const result = [];
    for (let index = 0; index < points.length; index += 1) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      result.push(a);
      if (Math.abs(a.y - edgeY) > EPS || Math.abs(b.y - edgeY) > EPS) continue;
      const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
      if (minX > left + EPS || maxX < right - EPS) continue;
      const forward = b.x > a.x;
      const startX = forward ? left : right;
      const endX = forward ? right : left;
      result.push({ x: startX, y: edgeY });
      for (let step = 1; step < steps; step += 1) {
        const ratio = step / steps;
        const x = startX + (endX - startX) * ratio;
        const depth = Math.sqrt(Math.max(0, hole.r * hole.r - (x - hole.cx) * (x - hole.cx)));
        result.push({ x, y: edgeY + (interiorBelow ? depth : -depth) });
      }
      result.push({ x: endX, y: edgeY });
    }
    return result;
  }
  function panel(id, role, polygon, holes) {
    return Object.freeze({ id, role, polygon: Object.freeze(polygon), holes: Object.freeze(holes || []) });
  }
  function fold(id, parentId, childId, a, b, angle, phase) {
    return Object.freeze({ id, parentId, childId, axis: Object.freeze({ a, b }), angle, phase: Object.freeze(phase) });
  }

  function buildContract(input) {
    const W = Number(input && input.W) || 86.5;
    const D = Number(input && input.D) || 86.5;
    const H = Number(input && input.H) || 296;
    const layout = global.T003_getLayout(W, D, H);
    const g = layout.grid;
    const outline = global.T001_flattenPathD(layout.fillPath);
    const mapper = layout.mapper;
    if (!outline || outline.length < 3) throw new Error('T003 3D: approved Cut outline is unavailable.');

    const source = global.T003_SOURCE_GRID;
    const topMidY = g.yInnerFold;
    // Extract bottomLock-A from its own continuous Final Cut run. Clipping the
    // complete dieline leaves the triangulator free to bridge this narrow
    // centre junction to unrelated curved vertices elsewhere in the outline.
    const bottomASourcePath = [
      'M560.679 1216.063',
      'L562.482 1215.802',
      'C562.214 1215.218 561.681 1214.801 561.049 1214.681',
      'C560.417 1214.561 559.769 1214.753 559.305 1215.199',
      'L545.245 1228.692',
      'L555.010 1249.632',
      'L549.341 1381.324',
      'L480.459 1381.324',
      'L437.939 1338.804',
      'L438.506 1338.804',
      'L438.506 1345.891',
      'L403.073 1381.324',
      'L326.821 1381.324',
      'L315.482 1216.064',
      'L315.482 1216.063',
      'Z'
    ].join(' ');
    const bottomAPolygon = clipRect(
      global.T001_flattenPathD(bottomASourcePath).map(point => mapper.point(point.x, point.y)),
      rect(g.xFrontL, g.yBodyBottom, g.xFrontR, g.yBottomMax)
    );
    const upperLeftShoulder = mapper.point(805.876, 134.646);
    const upperLeftCut = mapper.point(831.388, 134.646);
    const upperLeftFold = mapper.point(831.388, 137.764);
    const upperRightCut = mapper.point(1025.561, 134.646);
    const upperRightShoulder = mapper.point(1051.073, 134.646);
    const upperRightFold = mapper.point(1025.561, 137.764);
    const upperLeftFoldShoulder = mapper.point(805.876, 137.764);
    const upperRightFoldShoulder = mapper.point(1051.073, 137.764);
    const upperTuckPolygon = global.PacVuUpperTuckRule.boundaryFrom2D(
      outline,
      [upperLeftFold, upperLeftCut, upperLeftShoulder],
      [upperRightShoulder, upperRightCut, upperRightFold]
    );
    const upperTuckReliefLeft = [upperLeftShoulder, upperLeftCut, upperLeftFold, upperLeftFoldShoulder];
    const upperTuckReliefRight = [upperRightCut, upperRightShoulder, upperRightFoldShoulder, upperRightFold];
    const regions = [
      ['glue', 'adhesive', rect(g.xOuterL, g.yBodyTop, g.xFrontL, g.yBodyBottom)],
      ['front', 'body', rect(g.xFrontL, g.yBodyTop, g.xFrontR, g.yBodyBottom)],
      ['sideLeft', 'body', rect(g.xFrontR, g.yBodyTop, g.xSideLR, g.yBodyBottom)],
      ['back', 'body', rect(g.xSideLR, g.yBodyTop, g.xBackR, g.yBodyBottom)],
      ['sideRight', 'body', rect(g.xBackR, g.yBodyTop, g.xSideRR, g.yBodyBottom)],
      ['bottleTopUpper', 'bottleTop', rect(g.xFrontL, g.yTop, g.xFrontR, topMidY)],
      ['bottleTopLower', 'bottleTop', rect(g.xFrontL, topMidY, g.xFrontR, g.yBodyTop)],
      ['dustLeft', 'dust', rect(g.xFrontR, g.yTop, g.xSideLR, g.yBodyTop)],
      ['upperTuck', 'topTuck', rect(g.xSideLR, g.yTop, g.xBackR, g.yLidFold)],
      ['lidTop', 'top', rect(g.xSideLR, g.yLidFold, g.xBackR, g.yBodyTop)],
      ['dustRight', 'dust', rect(g.xBackR, g.yTop, g.xSideRR, g.yBodyTop)],
      ['bottomA', 'bottomLock', rect(g.xFrontL, g.yBodyBottom, g.xFrontR, g.yBottomMax)],
      ['bottomL', 'bottomLock', rect(g.xFrontR, g.yBodyBottom, g.xSideLR, g.yBottomMax)],
      ['bottomB', 'bottomLock', rect(g.xSideLR, g.yBodyBottom, g.xBackR, g.yBottomMax)],
      ['bottomR', 'bottomLock', rect(g.xBackR, g.yBodyBottom, g.xSideRR, g.yBottomMax)]
    ];
    const holeCuts = typeof global.T003_resolveHoles === 'function'
      ? global.T003_resolveHoles(layout, input || {})
      : [];
    let panels = regions.map(def => {
      const polygon = def[0] === 'bottomA'
        ? bottomAPolygon.slice()
        : def[0] === 'upperTuck'
          ? upperTuckPolygon.slice()
          : clipRect(outline, def[2]);
      const holes = holeCuts.filter(hole => {
        if (hole.id === 'hole_1') return def[0] === 'bottleTopUpper';
        return contains(polygon, hole);
      });
      return panel(def[0], def[1], polygon, holes);
    })
      .filter(item => item.polygon.length >= 3 && area(item.polygon) > EPS);
    panels.push(panel('upperTuckReliefLeft', 'topTuckRelief', upperTuckReliefLeft));
    panels.push(panel('upperTuckReliefRight', 'topTuckRelief', upperTuckReliefRight));

    const a1 = mapper.point(546.138, 1230.604);
    const a2 = mapper.point(437.939, 1338.803);
    const b1 = mapper.point(1036.531, 1230.604);
    const b2 = mapper.point(928.333, 1338.803);
    const panelA = panels.find(item => item.id === 'bottomA');
    const panelB = panels.find(item => item.id === 'bottomB');
    const splitA = splitLockPanel(panelA.polygon, a1, a2);
    const splitB = splitLockPanel(panelB.polygon, b1, b2);
    panels = panels.filter(item => item.id !== 'bottomA' && item.id !== 'bottomB');
    panels.push(panel('bottomA', 'bottomLock', splitA.main));
    panels.push(panel('bottomB', 'bottomLock', splitB.main));
    panels.push(panel('lockTriangleL', 'adhesiveLock', splitA.triangle));
    panels.push(panel('lockTriangleR', 'adhesiveLock', splitB.triangle));

    const v = x => [{ x, y: g.yBodyTop }, { x, y: g.yBodyBottom }];
    const h = (x1, x2, y) => [{ x: x1, y }, { x: x2, y }];
    const folds = [
      fold('body.front-sideLeft', 'front', 'sideLeft', ...v(g.xFrontR), 90, [0.05, 0.18]),
      fold('body.sideLeft-back', 'sideLeft', 'back', ...v(g.xSideLR), 90, [0.10, 0.23]),
      fold('body.back-sideRight', 'back', 'sideRight', ...v(g.xBackR), 90, [0.15, 0.28]),
      fold('body.front-glue', 'front', 'glue', ...v(g.xFrontL), 90, [0.02, 0.15]),
      // Correct T003 source-panel order: the diagonal adhesive portions are
      // part of A/B. Bend them outward, insert A/B by 180 degrees, and only
      // then insert the waiting L/R panels by 180 degrees.
      fold('bottom.A', 'front', 'bottomA', ...h(g.xFrontL, g.xFrontR, g.yBodyBottom), 180, [0.48, 0.55]),
      fold('bottom.B', 'back', 'bottomB', ...h(g.xSideLR, g.xBackR, g.yBodyBottom), 180, [0.56, 0.63]),
      fold('bottom.L', 'sideLeft', 'bottomL', ...h(g.xFrontR, g.xSideLR, g.yBodyBottom), 180, [0.64, 0.71]),
      fold('bottom.R', 'sideRight', 'bottomR', ...h(g.xBackR, g.xSideRR, g.yBodyBottom), 180, [0.72, 0.79]),
      // The diagonal glue faces must lie completely flat against L/R before
      // the tube is pressed and reopened.  A partial 165-degree bend leaves
      // each adhesive face 15 degrees proud; once transferred to L/R that
      // error makes the bonded triangle appear to spring outside the box.
      fold('bottom.triangleL', 'bottomA', 'lockTriangleL', a1, a2, -180, [0.34, 0.40]),
      fold('bottom.triangleR', 'bottomB', 'lockTriangleR', b1, b2, -180, [0.42, 0.48]),
      // T003 top order confirmed from the physical sample:
      // 1) turn the lower bottle panel 180 degrees against the inside back,
      // 2) bend its upper perforated panel 90 degrees to form the shelf,
      // 3) fold both lid-side dust flaps inward,
      // 4-6) pre-fold, close and seat the front tuck exactly like T001.
      // Stop a fraction inside 180 degrees so the renderer preserves the
      // inward folding side; +180 and -180 otherwise become the same plane.
      fold('top.back-bottleLower', 'front', 'bottleTopLower', ...h(g.xFrontL, g.xFrontR, g.yBodyTop), 179.5, [0.76, 0.82]),
      // Fold the perforated shelf toward the box cavity, not out through the
      // back opening. The lower 179.5-degree inside fold remains unchanged.
      fold('top.bottleLower-upper', 'bottleTopLower', 'bottleTopUpper', ...h(g.xFrontL, g.xFrontR, topMidY), -90, [0.82, 0.88]),
      fold('top.left-dust', 'sideLeft', 'dustLeft', ...h(g.xFrontR, g.xSideLR, g.yBodyTop), 90, [0.88, 0.92]),
      fold('top.right-dust', 'sideRight', 'dustRight', ...h(g.xBackR, g.xSideRR, g.yBodyTop), 90, [0.88, 0.92]),
      // Parent relation is declared first; phase ranges still animate the
      // child tuck before its lid parent, as in T001.
      fold('top.front-lid', 'back', 'lidTop', ...h(g.xSideLR, g.xBackR, g.yBodyTop), 90, [0.96, 1.00]),
      fold(
        'top.lid-tuck', 'lidTop', 'upperTuck',
        upperLeftFold, upperRightFold,
        110, [0.92, 0.96]
      )
    ];
    const ids = new Set(panels.map(item => item.id));
    folds.forEach(item => {
      if (!ids.has(item.parentId) || !ids.has(item.childId)) throw new Error('T003 3D hierarchy failed: ' + item.id);
    });

    return Object.freeze({
      code: 'T003', dimensions: Object.freeze({ W, D, H }), layout,
      panels: Object.freeze(panels), folds: Object.freeze(folds),
      adhesiveRelations: Object.freeze([
        Object.freeze({ id: 'body-glue-seam', from: 'glue', to: 'sideRight' }),
        Object.freeze({ id: 'lock-A-to-L', from: 'lockTriangleL', to: 'bottomL' }),
        Object.freeze({ id: 'lock-B-to-R', from: 'lockTriangleR', to: 'bottomR' })
      ]),
      states: Object.freeze({
        flat: 0, body: 0.19, bottomHalf: 0.43, bottomGluedFlat: 0.54,
        bottomLocked: 0.68, standing: 0.75, topFolding: 0.90, closed: 1
      })
    });
  }

  function createMaster(input) {
    const THREE = global.THREE;
    const Viewer = global.PacVu3DViewer;
    if (!THREE || !Viewer || !global.PacVuOrbitControls) throw new Error('T003 3D viewer dependencies are unavailable.');
    const contract = buildContract(input);
    const C = contract.dimensions;
    const bounds = contract.layout.dielineBounds;
    const center = { x: bounds.minX + bounds.width / 2, y: bounds.minY + bounds.height / 2 };
    const thickness = 0.45;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const smooth = value => { const v = clamp(value, 0, 1); return v * v * (3 - 2 * v); };
    const phase = (value, range) => range[0] === range[1] ? 0 : smooth((value - range[0]) / (range[1] - range[0]));
    const point = (p, z) => new THREE.Vector3(p.x - center.x, center.y - p.y, z || 0);

    function geometryFor(definition) {
      const polygon = definition.polygon;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      polygon.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      const shape = new THREE.Shape();
      polygon.forEach((p, i) => i ? shape.lineTo(p.x - cx, cy - p.y) : shape.moveTo(p.x - cx, cy - p.y));
      shape.closePath();
      definition.holes.forEach(hole => {
        const cutout = new THREE.Path();
        cutout.absarc(hole.cx - cx, cy - hole.cy, hole.r, 0, Math.PI * 2, false);
        shape.holes.push(cutout);
      });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 48 });
      geometry.translate(0, 0, -thickness / 2);
      Viewer.assignBoardFaceMaterials(geometry, thickness, 'interior');
      geometry.computeVertexNormals();
      return { geometry, cx, cy };
    }

    const viewer = Viewer.createModal({ id: 't0033dModal', badge: 'T003 · Bottle Box Left 3D Master' });
    const { modal, stage } = viewer;
    const labels = modal.querySelector('.assembly-labels');
    labels.innerHTML = '<span>Flat</span><span>Body</span><span>Bottom</span><span>Locked</span><span>Stand</span><span>Top</span><span>Closed</span>';
    labels.style.setProperty('grid-template-columns', 'repeat(7,1fr)', 'important');
    Array.from(labels.children).forEach((node, index) => {
      node.style.setProperty('justify-self', index === 0 ? 'start' : index === 6 ? 'end' : 'center', 'important');
      node.style.textAlign = index === 0 ? 'left' : index === 6 ? 'right' : 'center';
    });
    const viewButtons = modal.querySelector('.m001-3d-views');
    const bottomViewButton = document.createElement('button');
    bottomViewButton.type = 'button'; bottomViewButton.className = 'btn light';
    bottomViewButton.dataset.view = 'bottom'; bottomViewButton.textContent = 'Bottom';
    viewButtons.insertBefore(bottomViewButton, viewButtons.querySelector('[data-shadow]'));
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
    controls.enableDamping = true; controls.dampingFactor = 0.075;
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor, global.PacVu3DTheme.hemisphereLight.groundColor, global.PacVu3DTheme.hemisphereLight.intensity));
    const sun = new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color, global.PacVu3DTheme.directionalLight.intensity);
    sun.position.fromArray(global.PacVu3DTheme.directionalLight.position);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const shadowExtent = Math.max(C.W, C.D, C.H) * 1.35;
    sun.shadow.camera.left = -shadowExtent;
    sun.shadow.camera.right = shadowExtent;
    sun.shadow.camera.top = shadowExtent;
    sun.shadow.camera.bottom = -shadowExtent;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = Math.max(1600, shadowExtent * 6);
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 1.5;
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), new THREE.ShadowMaterial({ color: 0x3f3933, opacity: 0.34 }));
    floor.receiveShadow = true; floor.position.z = -2; scene.add(floor);
    const grid = new THREE.GridHelper(global.PacVu3DTheme.grid.size, global.PacVu3DTheme.grid.divisions, global.PacVu3DTheme.grid.centerColor, global.PacVu3DTheme.grid.lineColor);
    grid.rotation.x = Math.PI / 2; grid.position.z = global.PacVu3DTheme.grid.z; scene.add(grid);
    Viewer.standardizeEnvironment({ renderer, scene, controls, floor, grid });

    // Keep T003 branding identical to the approved T001 front-panel mark.
    function addFrontBrand(mesh) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024; canvas.height = 480;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgb(72,67,62)';
      context.textAlign = 'center'; context.textBaseline = 'middle';
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
          map: texture, transparent: true, opacity: 0.42,
          depthWrite: false, side: THREE.FrontSide, toneMapped: false
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

    const materials = Viewer.createBoardMaterials(THREE);
    // These tuck-box panels are one continuous sheet. A dark extruded edge
    // at every hinge reads as a physical gap, so use a light paper edge for
    // T003 while retaining the real panel geometry and folding axes.
    materials[2].color.setHex(0xf2f0ed);
    materials[2].name = 'T003 light paper fold edge';
    function materialsFor(definition) {
      if (definition.role !== 'bottomLock' && definition.role !== 'adhesiveLock') return materials;
      const layered = materials.map(material => material.clone());
      // A 180-degree bottom fold creates intentional paper-on-paper contact.
      // Bias the matte exterior face toward the camera and the kraft interior
      // face away from it so coplanar faces never flicker or reveal kraft on
      // the package exterior. This is render depth only, not 2D/3D geometry.
      layered[0].polygonOffset = true;
      layered[0].polygonOffsetFactor = -8;
      layered[0].polygonOffsetUnits = -8;
      layered[1].polygonOffset = true;
      layered[1].polygonOffsetFactor = 8;
      layered[1].polygonOffsetUnits = 8;
      // At an exact glued contact, kraft must never win an equal-depth test
      // against the white outside face. This removes the remaining stipple
      // without moving the panel or changing paper thickness.
      layered[1].depthFunc = THREE.LessDepth;
      return layered;
    }
    const root = new THREE.Group(); root.name = 'T003 Bottom Lock Master'; scene.add(root);
    const pieces = new Map();
    contract.panels.forEach(def => {
      const made = geometryFor(def);
      const mesh = new THREE.Mesh(made.geometry, materialsFor(def));
      const isBottomLayer = def.role === 'bottomLock' || def.role === 'adhesiveLock';
      mesh.name = def.id;
      // Coplanar paper layers should receive the box/environment shadow but
      // must not cast zero-distance shadows onto each other.
      mesh.castShadow = !isBottomLayer;
      // Bottom lock layers intentionally sit flush after the 180-degree fold.
      // Let the body/floor keep normal shadows, but prevent those coplanar
      // layers from receiving each other's zero-distance shadow pattern.
      mesh.receiveShadow = !isBottomLayer;
      mesh.position.set(made.cx - center.x, center.y - made.cy, def.role === 'adhesiveLock' ? thickness * 0.55 : 0);
      pieces.set(def.id, { mesh, flatCenter: mesh.position.clone(), role: def.role });
    });
    const front = pieces.get('front');
    if (!front) throw new Error('T003 3D front panel is unavailable.');
    addFrontBrand(front.mesh);
    const standPoint = point({ x: contract.layout.grid.xFrontL, y: contract.layout.grid.yBodyBottom });
    const standHinge = new THREE.Group(); standHinge.position.copy(standPoint); root.add(standHinge);
    const sheet = new THREE.Group(); sheet.position.copy(standPoint).multiplyScalar(-1); standHinge.add(sheet); sheet.add(front.mesh);
    const frames = new Map([['front', sheet]]);
    const hinges = [];
    contract.folds.forEach(relation => {
      const parent = frames.get(relation.parentId), piece = pieces.get(relation.childId);
      if (!parent || !piece) throw new Error('T003 3D fold hierarchy failed at ' + relation.id);
      const a = point(relation.axis.a), b = point(relation.axis.b);
      const hinge = new THREE.Group(); hinge.name = relation.id; hinge.position.copy(a); parent.add(hinge);
      const frame = new THREE.Group(); frame.position.copy(a).multiplyScalar(-1); hinge.add(frame); frame.add(piece.mesh);
      frames.set(relation.childId, frame);
      const axis = b.clone().sub(a).normalize();
      const radial = piece.flatCenter.clone().sub(a);
      const sign = new THREE.Vector3().crossVectors(axis, radial).z >= 0 ? 1 : -1;
      hinges.push({ object: hinge, axis, radians: THREE.MathUtils.degToRad(relation.angle) * sign, range: relation.phase, id: relation.id });
    });
    // The relief ears have no Fold line of their own. Keep them rigidly on
    // lidTop while only the central upperTuck rotates around the crease.
    const lidTopFrame = frames.get('lidTop');
    ['upperTuckReliefLeft', 'upperTuckReliefRight'].forEach(id => {
      const piece = pieces.get(id);
      if (!lidTopFrame || !piece) throw new Error('T003 3D relief hierarchy failed at ' + id);
      lidTopFrame.add(piece.mesh);
      frames.set(id, lidTopFrame);
    });
    const frameBases = new Map();
    ['bottomA', 'bottomB', 'bottomL', 'bottomR'].forEach(id => {
      const frame = frames.get(id);
      if (frame) frameBases.set(id, frame.position.clone());
    });
    const bondCopies = new Map();
    [
      ['lockTriangleL', 'bottomL'],
      ['lockTriangleR', 'bottomR']
    ].forEach(([triangleId, receiverId]) => {
      const original = pieces.get(triangleId)?.mesh;
      const receiver = frames.get(receiverId);
      const receiverPiece = pieces.get(receiverId);
      if (!original || !receiver || !receiverPiece) return;
      const copy = original.clone();
      copy.name = triangleId + '.bonded-to-' + receiverId;
      copy.visible = false;
      original.parent.add(copy);
      copy.position.copy(original.position);
      copy.quaternion.copy(original.quaternion);
      copy.scale.copy(original.scale);
      bondCopies.set(triangleId, { original, copy, receiver, receiverPiece, bonded: false });
    });

    function setBonded(active) {
      bondCopies.forEach(link => {
        if (active && !link.bonded) {
          // Capture the exact pressed contact transform, then transfer that
          // transform to the receiving L/R frame. From this point the glued
          // triangle follows L/R during reopening instead of springing out
          // with its former A/B parent.
          link.original.updateWorldMatrix(true, false);
          link.original.parent.add(link.copy);
          link.copy.position.copy(link.original.position);
          link.copy.quaternion.copy(link.original.quaternion);
          link.copy.scale.copy(link.original.scale);
          root.updateMatrixWorld(true);
          // `attach` preserves the complete pressed world transform.  The
          // adhesive triangle is therefore glued to the exact L/R contact
          // face instead of being re-created from a centre point with its
          // rotation discarded.  When the tube reopens it follows L/R as a
          // single bonded assembly and cannot spring out independently.
          link.receiver.attach(link.copy);
          // A tiny receiver-local clearance represents the adhesive layer
          // and avoids equal-depth shimmer.  It is toward the box interior;
          // approved 2D coordinates and the exterior silhouette are intact.
          link.copy.position.z = link.receiverPiece.mesh.position.z - thickness * 0.18;
          link.bonded = true;
        }
        link.original.visible = !active;
        // Keep the bonded face visible for bottom-structure inspection.  It
        // is hidden only while physically sandwiched in the full press.
        link.copy.visible = active;
      });
    }
    // T003 is intentionally kept on the assembly table until the automatic
    // lock is fully built, pressed and reopened. Standing is a later phase.

    function pose(value) {
      const progress = clamp(value, 0, 1);
      // Preserve the approved bottom-lock sequence in the first 68% of the
      // master timeline, then stand the bonded package and close its top.
      const bottomProgress = clamp(progress / 0.68, 0, 1);
      const press = phase(bottomProgress, [0.80, 0.90]);
      const release = phase(bottomProgress, [0.90, 1.00]);
      const pressCycle = press * (1 - release);
      hinges.forEach(hinge => {
        const isTop = hinge.id.indexOf('top.') === 0;
        let amount = phase(isTop ? progress : bottomProgress, hinge.range);
        const radians = hinge.radians;
        // Bottom insertion is a hard checkpoint. Once a flap reaches its
        // inward 90-degree pose it must stay there; flatten/reopen must never
        // unwind the flap back through the exterior wall.
        if (hinge.id.indexOf('bottom.triangle') === 0) {
          const bendOut = hinge.id === 'bottom.triangleL'
            ? phase(bottomProgress, [0.34, 0.40])
            : phase(bottomProgress, [0.42, 0.48]);
          const bonded = phase(bottomProgress, [0.64, 0.70]);
          amount = Math.max(bendOut, bonded);
        }
        let angle = radians * amount;
        // T001 closing contract: the tuck is over-bent for insertion, then
        // relaxes to 90 degrees as the lid reaches its fully seated state.
        if (hinge.id === 'top.lid-tuck' && progress > 0.98) {
          const seated = Math.sign(radians) * THREE.MathUtils.degToRad(90);
          angle = THREE.MathUtils.lerp(radians, seated, phase(progress, [0.98, 1.00]));
        }
        // Once A/B and L/R are completely inside, collapse the glued tube on
        // the table. The opposite body folds move as an accordion while the
        // glue seam remains closed. Release reopens the tube; it never stands
        // the package or changes the bottom insertion angles.
        if (hinge.id === 'body.front-sideLeft' || hinge.id === 'body.back-sideRight') {
          angle += radians * pressCycle;
        } else if (hinge.id === 'body.sideLeft-back' || hinge.id === 'body.front-glue') {
          angle *= (1 - pressCycle);
        }
        if (hinge.id === 'bottom.A' || hinge.id === 'bottom.B' || hinge.id === 'bottom.L' || hinge.id === 'bottom.R') {
          // The bonded automatic lock is pulled from its 180-degree storage
          // pose as the flattened tube reopens. All four modules finish on
          // the common 90-degree bottom plane.
          angle *= (1 - 0.5 * release);
        }
        hinge.object.quaternion.setFromAxisAngle(hinge.axis, angle);
      });
      // A 180-degree insertion places several paper faces on the same
      // mathematical plane. Give each folded layer its real paper-stack
      // clearance only after insertion; the offset is local to the 3D mesh
      // and never changes the approved 2D geometry.
      const layerPhases = {
        bottomA: phase(bottomProgress, [0.48, 0.55]),
        bottomB: phase(bottomProgress, [0.56, 0.63]),
        bottomL: phase(bottomProgress, [0.64, 0.71]),
        bottomR: phase(bottomProgress, [0.72, 0.79])
      };
      Object.entries(layerPhases).forEach(([id, amount], index) => {
        const frame = frames.get(id), base = frameBases.get(id);
        if (!frame || !base) return;
        // Move the complete hinge frame. A/B therefore carry their diagonal
        // adhesive children with them and the crease can never split open.
        // Keep the cut/fold edge visually closed. This is only a sub-pixel
        // depth bias, not a board-thickness translation that would split the
        // panel away from its crease.
        const stack = id === 'bottomA' || id === 'bottomB' ? 0.012 : 0.024;
        frame.position.z = base.z - stack * amount;
        // At full press these pieces are physically sandwiched between the
        // two outer walls. Occlude them instead of asking the depth buffer to
        // resolve several sub-millimetre coplanar layers.
        pieces.get(id).mesh.visible = pressCycle < 0.98;
      });
      const bondPhase = phase(bottomProgress, [0.88, 0.90]);
      ['lockTriangleL', 'lockTriangleR'].forEach(id => {
        const piece = pieces.get(id);
        if (!piece) return;
        piece.mesh.visible = bondPhase < 0.999 && pressCycle < 0.98;
      });
      if (bondPhase >= 0.999) setBonded(true);
      else if (bottomProgress < 0.88) setBonded(false);
      bondCopies.forEach(link => {
        // The bonded triangles may be inspected while the locked bottom is
        // still lying down, but they are physically sandwiched inside L/R.
        // Hide them as soon as the package begins to stand so they can never
        // appear as brown triangles on the exterior bottom corners.
        if (link.bonded) link.copy.visible = pressCycle < 0.98 && progress <= 0.68;
      });
      // During the press the four wall faces also become coplanar. Stack
      // them by one board thickness in their local frames, then remove that
      // temporary clearance as the glued tube reopens.
      ['sideLeft', 'back', 'sideRight', 'glue'].forEach((id, index) => {
        const piece = pieces.get(id);
        if (!piece) return;
        piece.mesh.position.z = piece.flatCenter.z - thickness * (index + 1) * pressCycle;
      });
      // Open top structures travel with their parent walls during the same
      // press, so keep those loose flaps in the corresponding paper stack as
      // well. They remain visible; only their coincident depth is separated.
      ['upperTuck', 'lidTop', 'dustLeft', 'bottleTopUpper', 'bottleTopLower', 'dustRight'].forEach((id, index) => {
        const piece = pieces.get(id);
        if (!piece) return;
        piece.mesh.position.z = piece.flatCenter.z - thickness * (index + 1.25) * pressCycle;
      });
      const stand = phase(progress, [0.68, 0.75]);
      standHinge.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2 * stand);
      root.position.z = 0;
      modal.querySelector('.assembly-fill').style.width = Math.round(progress * 100) + '%';
      modal.querySelector('.m001-3d-controls').style.setProperty('--progress', Math.round(progress * 100) + '%');
      const stateIndex = progress < 0.12 ? 0 : progress < 0.34 ? 1 : progress < 0.54 ? 2 :
        progress < 0.68 ? 3 : progress < 0.76 ? 4 : progress < 0.93 ? 5 : 6;
      modal.querySelectorAll('.assembly-labels span').forEach((node, index) => node.classList.toggle('active', index <= stateIndex));
    }

    function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    function view(type) {
      if (type !== 'bottom') { Viewer.fitObject(root, camera, controls, type); return; }
      root.updateMatrixWorld(true);
      const bottomMeshes = ['bottomA', 'bottomB', 'bottomL', 'bottomR']
        .map(id => pieces.get(id)?.mesh).filter(Boolean);
      const box = new THREE.Box3();
      bottomMeshes.forEach(mesh => box.expandByObject(mesh));
      const target = box.getCenter(new THREE.Vector3());
      const reference = pieces.get('bottomA')?.mesh;
      const normal = new THREE.Vector3(0, 0, -1);
      const up = new THREE.Vector3(0, 1, 0);
      if (reference) {
        const worldQuaternion = reference.getWorldQuaternion(new THREE.Quaternion());
        normal.applyQuaternion(worldQuaternion).normalize();
        up.applyQuaternion(worldQuaternion).normalize();
      }
      const footprint = Math.max(C.W, C.D, 1);
      controls.target.copy(target);
      camera.up.copy(up);
      camera.position.copy(target).add(normal.multiplyScalar(footprint * 2.35));
      camera.near = Math.max(0.05, footprint * 0.02); camera.far = Math.max(C.H * 5, footprint * 12);
      camera.updateProjectionMatrix(); controls.update();
    }
    const slider = modal.querySelector('input');
    slider.oninput = () => pose(Number(slider.value) / 100);
    slider.onchange = () => view('iso');
    modal.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => view(button.dataset.view); });
    modal.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
    let shadows = true;
    const shadowButton = modal.querySelector('[data-shadow]');
    shadowButton.setAttribute('aria-pressed', 'true');
    shadowButton.onclick = event => {
      shadows = !shadows;
      renderer.shadowMap.enabled = shadows;
      sun.castShadow = shadows;
      floor.visible = shadows;
      sun.shadow.needsUpdate = true;
      event.currentTarget.setAttribute('aria-pressed', String(shadows));
      event.currentTarget.textContent = shadows ? 'Shadows On' : 'Shadows Off';
    };
    modal.querySelector('[data-download]').onclick = () => renderer.domElement.toBlob(blob => {
      if (!blob) return; const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'T003_3D_' + slider.value + '.png'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    });
    const observer = new ResizeObserver(resize); observer.observe(stage);
    resize(); pose(0); view('iso');
    let live = true, frameId = 0;
    (function animate() { if (!live) return; frameId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); })();
    return {
      contract, signature: [C.W, C.D, C.H].join(':'),
      open(state) {
        modal.classList.add('open');
        const target = contract.states[state] ?? Number(slider.value) / 100;
        slider.value = String(Math.round(target * 100));
        if (target > 0.90) pose(0.90);
        pose(target); resize(); view('iso');
      },
      setState(state) { const target = contract.states[state] ?? 0; slider.value = String(Math.round(target * 100)); if (target > 0.90) pose(0.90); pose(target); view('iso'); },
      destroy() { live = false; cancelAnimationFrame(frameId); observer.disconnect(); controls.dispose?.(); renderer.dispose(); modal.remove(); }
    };
  }

  let master = null;
  function open(state, input) {
    const cfg = input || (typeof global.getCfgT003 === 'function' ? global.getCfgT003() : { W: 86.5, D: 86.5, H: 296 });
    const signature = [cfg.W, cfg.D, cfg.H].join(':');
    if (!master || master.signature !== signature) { master?.destroy(); master = createMaster(cfg); }
    master.open(state || 'flat');
    return master;
  }

  global.T003_3D_BUILD_CONTRACT = buildContract;
  global.T003_3D_MASTER = Object.freeze({ buildContract, create: createMaster, open });
  function attachTrigger() {
    const toolbar = document.querySelector('.toolbar') || document.body;
    if (document.getElementById('t003-3d-btn')) return;
    const button = document.createElement('button'); button.id = 't003-3d-btn'; button.type = 'button'; button.style.display = 'none';
    button.onclick = () => open('flat'); toolbar.appendChild(button);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachTrigger); else attachTrigger();
})(window);
