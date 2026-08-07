(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE || !global.PacVu3DViewer || !global.S001_getLayout) return;

  const PAPER = 0.4;
  const TOLERANCE_MM = 0.05;
  const UNIT_TO_MM = 0.3527778112205911;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  const phase = (v, a, b) => smooth((v - a) / (b - a));

  function currentConfig() {
    const cfg = typeof getCfgS001 === 'function' ? getCfgS001() : {};
    return {
      W: +cfg.W || +cfg.productW || 298,
      D: +cfg.D || +cfg.productD || 61,
      H: +cfg.H || +cfg.productH || 292,
      viewMode: 'Outer Only',
      outerStringHoleEnabled: cfg.outerStringHoleEnabled !== false,
      outerMainHoleDia: +cfg.outerMainHoleDia || 22,
      outerSmallHoleDia: +cfg.outerSmallHoleDia || 6,
      outerHoleOffsetY: +cfg.outerHoleOffsetY || 0
    };
  }

  function flattenPath(d, tolerance) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const length = path.getTotalLength();
    const pointAt = distance => { const p = path.getPointAtLength(distance); return { x: p.x, y: p.y }; };
    const deviation = (p, a, b) => {
      const dx = b.x - a.x; const dy = b.y - a.y; const ll = dx * dx + dy * dy;
      if (!ll) return Math.hypot(p.x - a.x, p.y - a.y);
      const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / ll, 0, 1);
      return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
    };
    const points = [];
    function split(da, a, db, b, depth) {
      const dm = (da + db) / 2; const m = pointAt(dm);
      if (depth < 18 && deviation(m, a, b) > tolerance) {
        split(da, a, dm, m, depth + 1); split(dm, m, db, b, depth + 1); return;
      }
      points.push(a);
    }
    const seeds = Math.max(12, Math.ceil(length / 18));
    for (let i = 0; i < seeds; i += 1) {
      const da = length * i / seeds; const db = length * (i + 1) / seeds;
      split(da, pointAt(da), db, pointAt(db), 0);
    }
    svg.remove();
    return points;
  }

  function clip(contour, box) {
    if (!global.ClipperLib || !contour.length) return [];
    const k = 10000;
    const path = points => points.map(p => ({ X: Math.round(p.x * k), Y: Math.round(p.y * k) }));
    const solution = new global.ClipperLib.Paths();
    const operation = new global.ClipperLib.Clipper();
    operation.AddPath(path(contour), global.ClipperLib.PolyType.ptSubject, true);
    const clipPoints = box.points || [
      { x: box.minX, y: box.minY }, { x: box.maxX, y: box.minY },
      { x: box.maxX, y: box.maxY }, { x: box.minX, y: box.maxY }
    ];
    operation.AddPath(path(clipPoints), global.ClipperLib.PolyType.ptClip, true);
    operation.Execute(global.ClipperLib.ClipType.ctIntersection, solution,
      global.ClipperLib.PolyFillType.pftNonZero, global.ClipperLib.PolyFillType.pftNonZero);
    solution.sort((a, b) => Math.abs(global.ClipperLib.Clipper.Area(b)) - Math.abs(global.ClipperLib.Clipper.Area(a)));
    return (solution[0] || []).map(p => ({ x: p.X / k, y: p.Y / k }));
  }

  function init3D() {
    const cfg = currentConfig();
    const signature = [cfg.W, cfg.D, cfg.H, cfg.outerStringHoleEnabled, cfg.outerMainHoleDia, cfg.outerSmallHoleDia, cfg.outerHoleOffsetY].join(':');
    const layout = global.S001_getLayout(cfg, cfg);
    const part = layout.rawParts.outerSleeve;
    const spec = part.spec;
    const piecewise = (value, source, target) => {
      let index = 0;
      if (value <= source[0]) index = 0;
      else if (value >= source[source.length - 1]) index = source.length - 2;
      else while (index < source.length - 2 && value > source[index + 1]) index += 1;
      const amount = (value - source[index]) / (source[index + 1] - source[index]);
      return target[index] + (target[index + 1] - target[index]) * amount;
    };
    const mp = (x, y) => ({
      x: piecewise(x, spec.sourceX, spec.targetX),
      y: piecewise(y, spec.sourceY, spec.targetY)
    });
    const contour = flattenPath(part.fillPath, TOLERANCE_MM / UNIT_TO_MM);
    const holes = part.holeElements.map(item => flattenPath(item.d, TOLERANCE_MM / UNIT_TO_MM));
    const b = part.bounds;
    const x0 = mp(399.037, 0).x; const x1 = mp(469.903, 0).x;
    const x2 = mp(1314.628, 0).x; const x3 = mp(1487.541, 0).x;
    const x4 = mp(2332.265, 0).x; const x5 = mp(2500.927, 0).x;
    const yTopBack = mp(0, 436.117).y; const yTopFront = mp(0, 504.149).y;
    const yBottom = mp(0, 1263.834).y;
    const pad = 0.08;
    const regions = {
      glue: { minX: x0 - pad, maxX: x1 + pad, minY: yTopBack - pad, maxY: yBottom + pad },
      back: { minX: x1 - pad, maxX: x2 + pad, minY: yTopBack - pad, maxY: yBottom + pad },
      sideLeft: {
        minX: x2 - pad, maxX: x3 + pad, minY: yTopBack - pad, maxY: yBottom + pad,
        points: [
          { x: x2, y: yTopBack }, { x: x3, y: yTopFront },
          { x: x3, y: yBottom + pad }, { x: x2, y: yBottom + pad }
        ]
      },
      front: { minX: x3 - pad, maxX: x4 + pad, minY: yTopFront - pad, maxY: yBottom + pad },
      sideRight: {
        minX: x4 - pad, maxX: x5 + pad, minY: mp(0, 437.79).y - pad, maxY: yBottom + pad,
        points: [
          { x: x4, y: yTopFront }, { x: x5, y: mp(0, 437.79).y },
          { x: x5, y: yBottom + pad }, { x: x4, y: yBottom + pad }
        ]
      },
      lidBack: { minX: x1 - pad, maxX: x2 + pad, minY: b.minY - 2, maxY: yTopBack + pad },
      lidSideLeft: {
        minX: x2 - pad, maxX: x3 + pad, minY: b.minY - 2, maxY: yTopFront + pad,
        points: [
          { x: x2, y: b.minY - 2 }, { x: x3, y: b.minY - 2 },
          { x: x3, y: yTopFront }, { x: x2, y: yTopBack }
        ]
      },
      lidFront: { minX: x3 - pad, maxX: x4 + pad, minY: b.minY - 2, maxY: yTopFront + pad },
      lidSideRight: {
        minX: x4 - pad, maxX: x5 + 2, minY: b.minY - 2, maxY: yTopFront + pad,
        points: [
          { x: x4, y: b.minY - 2 }, { x: x5 + 2, y: b.minY - 2 },
          { x: x5, y: mp(0, 437.79).y }, { x: x4, y: yTopFront }
        ]
      },
      bottomA: { minX: x1 - pad, maxX: x2 + pad, minY: yBottom - pad, maxY: b.maxY + 2 },
      bottomLeft: { minX: x2 - pad, maxX: x3 + pad, minY: yBottom - pad, maxY: b.maxY + 2 },
      bottomB: { minX: x3 - pad, maxX: x4 + pad, minY: yBottom - pad, maxY: b.maxY + 2 },
      bottomRight: { minX: x4 - pad, maxX: x5 + 2, minY: yBottom - pad, maxY: b.maxY + 2 }
    };
    const contours = {};
    Object.keys(regions).forEach(name => { contours[name] = clip(contour, regions[name]); });

    const center = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
    const world = p => new THREE.Vector2((p.x - center.x) * UNIT_TO_MM, (center.y - p.y) * UNIT_TO_MM);
    const viewer = global.PacVu3DViewer.createModal({ id: 's0013dModal', badge: 'S001 · Outer Sleeve · Stage 1' });
    const { modal, stage } = viewer;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera = global.PacVu3DViewer.createPerspectiveCamera(THREE, cfg);
    const renderer = global.PacVu3DViewer.createRenderer(THREE);
    stage.prepend(renderer.domElement);
    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.075; controls.screenSpacePanning = true;
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,
      global.PacVu3DTheme.hemisphereLight.groundColor, global.PacVu3DTheme.hemisphereLight.intensity));
    const sun = new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color, global.PacVu3DTheme.directionalLight.intensity);
    sun.position.fromArray(global.PacVu3DTheme.directionalLight.position); sun.castShadow = true; scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), new THREE.ShadowMaterial({ color: 0x3f3933, opacity: 0.3 }));
    floor.receiveShadow = true; floor.position.z = -Math.max(cfg.D, 20) - 5; scene.add(floor);
    const grid = new THREE.GridHelper(global.PacVu3DTheme.grid.size, global.PacVu3DTheme.grid.divisions,
      global.PacVu3DTheme.grid.centerColor, global.PacVu3DTheme.grid.lineColor);
    grid.rotation.x = Math.PI / 2; grid.position.z = floor.position.z + 0.02; scene.add(grid);
    global.PacVu3DViewer.standardizeEnvironment({ renderer, scene, controls, floor, grid });
    const materials = global.PacVu3DViewer.createBoardMaterials(THREE);
    // S001 is white-board stock for this approved preview. Keep the kraft
    // interior, but remove the brown cut-edge lines around panels and holes.
    materials[2] = materials[2].clone();
    materials[2].color.copy(materials[0].color);
    materials[2].name = 'S001 white cut edge';
    const root = new THREE.Group(); scene.add(root);
    const pieces = new Map(); const hinges = [];

    function panelHoles(name) {
      const box = regions[name];
      return holes.flatMap(hole => {
        if (!hole.length) return [];
        const clipped = clip(hole, box);
        return clipped.length >= 3 ? [clipped] : [];
      });
    }
    function make(name) {
      const outline = contours[name].map(world);
      if (outline.length < 3) throw new Error('S001 panel contour missing: ' + name);
      if (!THREE.ShapeUtils.isClockWise(outline)) outline.reverse();
      const shape = new THREE.Shape(outline);
      panelHoles(name).forEach(points => {
        const hole = points.map(world); if (THREE.ShapeUtils.isClockWise(hole)) hole.reverse(); shape.holes.push(new THREE.Path(hole));
      });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: PAPER, bevelEnabled: false, steps: 1, curveSegments: 1 });
      geometry.translate(0, 0, -PAPER / 2);
      global.PacVu3DViewer.assignBoardFaceMaterials(geometry, PAPER, 'exterior');
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, materials); mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      const c = contours[name].reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
      pieces.set(name, { mesh, center: new THREE.Vector3(
        (c.x / contours[name].length - center.x) * UNIT_TO_MM,
        (center.y - c.y / contours[name].length) * UNIT_TO_MM, 0
      ) });
      return mesh;
    }
    Object.keys(contours).forEach(make);

    function addLogo() {
      const mesh = pieces.get('front').mesh;
      const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 300;
      const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 1024, 300); ctx.fillStyle = '#6c6761'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 176px Arial,sans-serif'; ctx.fillText('PacVu', 512, 105);
      ctx.font = '500 46px Arial,sans-serif'; ctx.fillText('Packaging + Viewer + Use', 512, 235);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false;
      const logo = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(cfg.W * 0.42, 125), Math.min(cfg.W * 0.42, 125) * 300 / 1024),
        global.PacVu3DViewer.createOverlayMaterial(THREE, { map: texture, transparent: true, opacity: 0.78, depthWrite: false, toneMapped: false }));
      const p = mp((1487.541 + 2332.265) / 2, (504.149 + 1263.834) / 2);
      logo.position.set((p.x - center.x) * UNIT_TO_MM, (center.y - p.y) * UNIT_TO_MM, PAPER / 2 + 0.015); logo.renderOrder = 1000; logo.userData.s001Brand = true; mesh.add(logo);
    }
    addLogo();

    const point = (x, y) => { const p = mp(x, y); return new THREE.Vector3((p.x - center.x) * UNIT_TO_MM, (center.y - p.y) * UNIT_TO_MM, 0); };
    function attach(parent, name, a, b2, start, end, angle, direction) {
      const item = pieces.get(name); const p = point(a.x, a.y); const q = point(b2.x, b2.y);
      const hinge = new THREE.Group(); hinge.position.copy(p); parent.add(hinge);
      const frame = new THREE.Group(); frame.position.copy(p).multiplyScalar(-1); hinge.add(frame); frame.add(item.mesh);
      const axis = q.clone().sub(p).normalize(); const radial = item.center.clone().sub(p);
      const natural = new THREE.Vector3().crossVectors(axis, radial).z >= 0 ? -1 : 1;
      hinges.push({ object: hinge, axis, angle: (angle || Math.PI / 2) * natural * (direction || 1), start, end });
      return frame;
    }
    const sheet = new THREE.Group(); root.add(sheet); sheet.add(pieces.get('front').mesh);
    const leftSide = attach(sheet, 'sideLeft', { x: 1487.541, y: 504.149 }, { x: 1487.541, y: 1263.834 }, 0.03, 0.18);
    const back = attach(leftSide, 'back', { x: 1314.628, y: 1263.834 }, { x: 1314.628, y: 436.117 }, 0.10, 0.25);
    attach(back, 'glue', { x: 469.903, y: 436.117 }, { x: 469.903, y: 1263.834 }, 0.19, 0.31);
    const rightSide = attach(sheet, 'sideRight', { x: 2332.265, y: 1263.834 }, { x: 2332.265, y: 504.149 }, 0.21, 0.34);

    // Step 2: both short bottom side locks move inward together.
    attach(rightSide, 'bottomRight', { x: 2500.927, y: 1263.834 }, { x: 2332.265, y: 1263.834 }, 0.36, 0.47);
    attach(leftSide, 'bottomLeft', { x: 1487.541, y: 1263.834 }, { x: 1314.628, y: 1263.834 }, 0.36, 0.47);
    attach(sheet, 'bottomB', { x: 2332.265, y: 1263.834 }, { x: 1487.541, y: 1263.834 }, 0.44, 0.56);
    attach(back, 'bottomA', { x: 1314.628, y: 1263.834 }, { x: 469.903, y: 1263.834 }, 0.62, 0.73);

    // Step 5: these are the two approved diagonal Fold lines, not horizontal approximations.
    attach(leftSide, 'lidSideLeft', { x: 1314.628, y: 436.117 }, { x: 1487.541, y: 504.149 }, 0.74, 0.82, Math.PI);
    attach(rightSide, 'lidSideRight', { x: 2332.265, y: 504.149 }, { x: 2500.927, y: 437.79 }, 0.74, 0.82, Math.PI);
    attach(back, 'lidBack', { x: 469.903, y: 436.117 }, { x: 1314.628, y: 436.117 }, 0.82, 0.91, Math.PI);
    attach(sheet, 'lidFront', { x: 1487.541, y: 504.149 }, { x: 2332.265, y: 504.149 }, 0.91, 1.0, Math.PI);

    function pose(value) {
      global.PacVu3DViewer.syncProgress(viewer, value * 100, 'Outer Sleeve Assembly');
      hinges.forEach(h => h.object.quaternion.setFromAxisAngle(h.axis, h.angle * phase(value, h.start, h.end)));
      pieces.get('front').mesh.position.z = -(PAPER + 0.025) * phase(value, 0.28, 0.34);
      // Steps 5/6/7 are 180-degree reinforcement folds. At their final pose
      // each flap is physically one paper layer above its parent panel; model
      // that thickness so the two surfaces never occupy the same depth.
      const layer = PAPER + 0.035;
      pieces.get('lidSideLeft').mesh.position.z = layer * phase(value, 0.74, 0.82);
      pieces.get('lidSideRight').mesh.position.z = layer * phase(value, 0.74, 0.82);
      pieces.get('lidBack').mesh.position.z = layer * phase(value, 0.82, 0.91);
      pieces.get('lidFront').mesh.position.z = layer * phase(value, 0.91, 1.0);
    }
    function resize() { const w = stage.clientWidth; const h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const fit = type => global.PacVu3DViewer.fitObject(root, camera, controls, type);
    viewer.range.oninput = () => pose(+viewer.range.value / 100);
    viewer.range.onchange = () => fit('iso');
    modal.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => fit(button.dataset.view); });
    modal.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
    modal.querySelector('[data-shadow]').onclick = event => { floor.visible = !floor.visible; sun.castShadow = floor.visible; event.currentTarget.textContent = floor.visible ? 'Shadows On' : 'Shadows Off'; };
    modal.querySelector('[data-download]').onclick = () => renderer.domElement.toBlob(blob => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'S001_OUTER_SLEEVE.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); });
    const observer = new ResizeObserver(resize); observer.observe(stage); resize(); pose(0); fit('top');
    let live = true; let animation = 0;
    (function loop() { if (!live) return; animation = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); }());
    global.S001_3D_DEBUG = { tolerance: TOLERANCE_MM, panelVertices: Object.fromEntries(Object.entries(contours).map(([k, v]) => [k, v.length])), pose };
    return { signature, root, pose, open() { modal.classList.add('open'); resize(); fit('top'); }, destroy() { live = false; cancelAnimationFrame(animation); observer.disconnect(); controls.dispose?.(); root.traverse(o => { o.geometry?.dispose(); if (o.userData?.s001Brand) { o.material?.map?.dispose(); o.material?.dispose(); } }); materials.forEach(m => m.dispose()); renderer.dispose(); modal.remove(); } };
  }

  let app;
  global.S001Outer3DModel = { getCompleted() { const cfg = currentConfig(); const signature = [cfg.W, cfg.D, cfg.H, cfg.outerStringHoleEnabled, cfg.outerMainHoleDia, cfg.outerSmallHoleDia, cfg.outerHoleOffsetY].join(':'); if (!app || app.signature !== signature) { app?.destroy(); app = init3D(); } app.pose(1); return app.root; } };
  function attachButton() {
    const bar = document.querySelector('.toolbar') || document.body;
    if (document.getElementById('s001-3d-btn')) return;
    const button = document.createElement('button'); button.id = 's001-3d-btn'; button.type = 'button'; button.style.display = 'none'; bar.appendChild(button);
    button.onclick = () => {
      const mode = typeof getS001ViewMode === 'function' ? String(getS001ViewMode()).toLowerCase() : '';
      if ((mode.includes('all') || mode.includes('assembly')) && global.S001Assembly3D) {
        global.S001Assembly3D.open();
        return;
      }
      if ((mode.includes('inner') || mode.includes('tray')) && global.S001Inner3D) {
        global.S001Inner3D.open();
        return;
      }
      if ((mode.includes('insert') || mode.includes('pad')) && global.S001Insert3D) {
        global.S001Insert3D.open();
        return;
      }
      const cfg = currentConfig();
      const signature = [cfg.W, cfg.D, cfg.H, cfg.outerStringHoleEnabled, cfg.outerMainHoleDia, cfg.outerSmallHoleDia, cfg.outerHoleOffsetY].join(':');
      if (!app || app.signature !== signature) { app?.destroy(); app = init3D(); }
      app.open();
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachButton); else attachButton();
}(window));
