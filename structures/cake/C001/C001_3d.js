(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE || !global.PacVu3DViewer || !global.C001_getLayout) return;

  const PAPER = 0.28;
  const FLATTEN_TOLERANCE_MM = 0.05;
  const SLOT_WIDTH_MM = 0.55;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = (value) => { value = clamp(value, 0, 1); return value * value * (3 - (2 * value)); };
  const phase = (value, start, end) => smooth((value - start) / (end - start));

  function config() {
    const value = typeof getCfgC001 === 'function' ? getCfgC001() : {};
    return { W: +value.W || 277, D: +value.D || 275, H: +value.H || 140 };
  }

  function flattenPath(d, tolerance) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const length = path.getTotalLength();
    const points = [];
    const pointAt = distance => {
      const point = path.getPointAtLength(distance);
      return { x: point.x, y: point.y };
    };
    const deviation = (point, a, b) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lengthSquared = (dx * dx) + (dy * dy);
      if (!lengthSquared) return Math.hypot(point.x - a.x, point.y - a.y);
      const amount = clamp((((point.x - a.x) * dx) + ((point.y - a.y) * dy)) / lengthSquared, 0, 1);
      return Math.hypot(point.x - (a.x + (dx * amount)), point.y - (a.y + (dy * amount)));
    };
    function subdivide(aDistance, a, bDistance, b, depth) {
      const middleDistance = (aDistance + bDistance) / 2;
      const middle = pointAt(middleDistance);
      if (depth < 16 && deviation(middle, a, b) > tolerance) {
        subdivide(aDistance, a, middleDistance, middle, depth + 1);
        subdivide(middleDistance, middle, bDistance, b, depth + 1);
        return;
      }
      points.push(a);
    }
    // Coarse arc-length seeds only locate SVG command/corner neighborhoods;
    // the resulting count is decided exclusively by the deviation test.
    const seeds = Math.max(8, Math.ceil(length / 20));
    for (let index = 0; index < seeds; index += 1) {
      const aDistance = (length * index) / seeds;
      const bDistance = (length * (index + 1)) / seeds;
      subdivide(aDistance, pointAt(aDistance), bDistance, pointAt(bDistance), 0);
    }
    svg.remove();
    return points;
  }

  function slotRibbon(layout, sourceA, sourceB) {
    const a = layout.mapPoint(sourceA.x, sourceA.y);
    const b = layout.mapPoint(sourceB.x, sourceB.y);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const nx = -uy * SLOT_WIDTH_MM * 0.5;
    const ny = ux * SLOT_WIDTH_MM * 0.5;
    const inset = Math.min(0.07, length * 0.08);
    const start = { x: a.x + (ux * inset), y: a.y + (uy * inset) };
    const end = { x: b.x - (ux * inset), y: b.y - (uy * inset) };
    return [
      { x: start.x + nx, y: start.y + ny },
      { x: end.x + nx, y: end.y + ny },
      { x: end.x - nx, y: end.y - ny },
      { x: start.x - nx, y: start.y - ny }
    ];
  }

  function baseSlotHoles(layout) {
    const segments = [
      [[763.422, 291.427], [763.422, 348.113]],
      [[936.336, 291.427], [936.336, 348.113]],
      [[752.084, 348.113], [947.674, 348.113]],
      [[737.911, 331.104], [752.084, 348.113]],
      [[947.674, 348.113], [961.848, 331.104]],
      [[763.422, 1405.449], [763.422, 1462.136]],
      [[936.336, 1405.449], [936.336, 1462.136]],
      [[752.084, 1405.449], [947.674, 1405.449]],
      [[737.911, 1422.458], [752.084, 1405.449]],
      [[947.674, 1405.449], [961.848, 1422.458]]
    ];
    const ribbons = segments.map(segment => slotRibbon(
      layout,
      { x: segment[0][0], y: segment[0][1] },
      { x: segment[1][0], y: segment[1][1] }
    ));
    if (!global.ClipperLib) return ribbons;
    const scale = 10000;
    const subject = ribbons.map(polygon => polygon.map(point => ({
      X: Math.round(point.x * scale),
      Y: Math.round(point.y * scale)
    })));
    const solution = new global.ClipperLib.Paths();
    const clipper = new global.ClipperLib.Clipper();
    clipper.AddPaths(subject, global.ClipperLib.PolyType.ptSubject, true);
    clipper.Execute(
      global.ClipperLib.ClipType.ctUnion,
      solution,
      global.ClipperLib.PolyFillType.pftNonZero,
      global.ClipperLib.PolyFillType.pftNonZero
    );
    return solution.map(polygon => polygon.map(point => ({
      x: point.X / scale,
      y: point.Y / scale
    })));
  }

  function clipContour(contour, rectangle) {
    const scale = 10000;
    const subject = [contour.map(point => ({ X: Math.round(point.x * scale), Y: Math.round(point.y * scale) }))];
    const clip = [[
      { X: Math.round(rectangle.minX * scale), Y: Math.round(rectangle.minY * scale) },
      { X: Math.round(rectangle.maxX * scale), Y: Math.round(rectangle.minY * scale) },
      { X: Math.round(rectangle.maxX * scale), Y: Math.round(rectangle.maxY * scale) },
      { X: Math.round(rectangle.minX * scale), Y: Math.round(rectangle.maxY * scale) }
    ]];
    const solution = new global.ClipperLib.Paths();
    const operation = new global.ClipperLib.Clipper();
    operation.AddPaths(subject, global.ClipperLib.PolyType.ptSubject, true);
    operation.AddPaths(clip, global.ClipperLib.PolyType.ptClip, true);
    operation.Execute(global.ClipperLib.ClipType.ctIntersection, solution,
      global.ClipperLib.PolyFillType.pftNonZero, global.ClipperLib.PolyFillType.pftNonZero);
    solution.sort((a, b) => Math.abs(global.ClipperLib.Clipper.Area(b)) - Math.abs(global.ClipperLib.Clipper.Area(a)));
    return (solution[0] || []).map(point => ({ x: point.X / scale, y: point.Y / scale }));
  }

  function handlePanelPaths() {
    const left = [
      'M1979.041 1122.772',
      'C1884.366 1105.302 1807.946 1034.847 1782.854 941.901',
      'C1777.13 920.64 1774.247 898.802 1774.258 876.784',
      'C1774.273 781.5 1828.555 694.324 1914.057 652.271',
      'C1934.665 642.15 1956.461 634.948 1979.041 630.797',
      'L1979.041 700.835',
      'L1964.734 705.329',
      'C1919.571 721.047 1882.396 753.864 1861.197 796.728',
      'V956.906',
      'C1882.398 999.768 1919.571 1032.584 1964.732 1048.305',
      'L1979.041 1052.203',
      'Z'
    ].join(' ');
    const right = [
      'M2073.419 1122.772',
      'C2168.094 1105.302 2244.514 1034.847 2269.606 941.901',
      'C2275.33 920.64 2278.213 898.802 2278.202 876.784',
      'C2278.187 781.5 2223.905 694.324 2138.403 652.271',
      'C2117.795 642.15 2095.999 634.948 2073.419 630.797',
      'L2073.419 700.835',
      'L2087.726 705.329',
      'C2132.889 721.047 2170.064 753.864 2191.263 796.728',
      'V956.907',
      'C2170.062 999.769 2132.889 1032.585 2087.728 1048.306',
      'L2073.419 1052.204',
      'Z'
    ].join(' ');
    return [left, right];
  }

  function init3D() {
    const size = config();
    const signature = [size.W, size.D, size.H].join(':');
    const layout = global.C001_getLayout(size);
    const paths = global.C001_getPanelPaperPaths();
    const source = {
      glue: paths[0].d,
      base: paths[1],
      sideBack: paths[2],
      lidTop: paths[3],
      sideFront: paths[6]
    };
    const bounds = layout.dielineBounds || layout.bounds;
    const center = { x: bounds.minX + (bounds.width / 2), y: bounds.minY + (bounds.height / 2) };
    const toWorld = point => new THREE.Vector2(point.x - center.x, center.y - point.y);
    const rawContours = {};
    Object.keys(source).forEach(name => {
      const mappedPath = global.C001_transformPathD(source[name], layout);
      rawContours[name] = flattenPath(mappedPath, FLATTEN_TOLERANCE_MM);
    });
    const handleHoles = global.C001_getHandleCutoutPaths().map(d => (
      flattenPath(global.C001_transformPathD(d, layout), FLATTEN_TOLERANCE_MM)
    ));
    const slotHoles = baseSlotHoles(layout);
    const topFold = layout.mapPoint(0, 487.016).y;
    const bottomFold = layout.mapPoint(0, 1266.547).y;
    const clipBounds = {
      minX: bounds.minX - 20,
      maxX: bounds.maxX + 20,
      minY: bounds.minY - 20,
      maxY: bounds.maxY + 20
    };
    const band = (minY, maxY) => ({ minX: clipBounds.minX, maxX: clipBounds.maxX, minY, maxY });
    const contours = {
      glue: rawContours.glue,
      baseMain: clipContour(rawContours.base, band(topFold, bottomFold)),
      slotTop: clipContour(rawContours.base, band(clipBounds.minY, topFold)),
      slotBottom: clipContour(rawContours.base, band(bottomFold, clipBounds.maxY)),
      sideBackMain: clipContour(rawContours.sideBack, band(topFold, bottomFold)),
      backFlapTop: clipContour(rawContours.sideBack, band(clipBounds.minY, topFold)),
      backFlapBottom: clipContour(rawContours.sideBack, band(bottomFold, clipBounds.maxY)),
      lidMain: clipContour(rawContours.lidTop, band(topFold, bottomFold)),
      lockTop: clipContour(rawContours.lidTop, band(clipBounds.minY, topFold)),
      lockBottom: clipContour(rawContours.lidTop, band(bottomFold, clipBounds.maxY)),
      sideFrontMain: clipContour(rawContours.sideFront, band(topFold, bottomFold)),
      frontFlapTop: clipContour(rawContours.sideFront, band(clipBounds.minY, topFold)),
      frontFlapBottom: clipContour(rawContours.sideFront, band(bottomFold, clipBounds.maxY))
    };
    const handlePanels = handlePanelPaths().map(d => (
      flattenPath(global.C001_transformPathD(d, layout), FLATTEN_TOLERANCE_MM)
    ));
    contours.handleLeft = handlePanels[0];
    contours.handleRight = handlePanels[1];
    const topSlotHoles = slotHoles.filter(hole => hole.reduce((sum, point) => sum + point.y, 0) / hole.length < topFold);
    const bottomSlotHoles = slotHoles.filter(hole => hole.reduce((sum, point) => sum + point.y, 0) / hole.length > bottomFold);
    const seamTop = 491.5;
    const seamBottom = 1262.0;
    const mappedRect = (x1, x2) => [
      layout.mapPoint(x1, seamTop),
      layout.mapPoint(x2, seamTop),
      layout.mapPoint(x2, seamBottom),
      layout.mapPoint(x1, seamBottom)
    ];
    // The approved Cut leaves a narrow relief channel around the fold axis.
    // In 3D each side reaches the same fold centre independently, so the two
    // pieces stay connected while retaining the curved relief at both ends.
    contours.lidFrontSeam = mappedRect(2411.179, 2415.993);
    contours.sideFrontSeam = mappedRect(2415.993, 2420.245);

    const viewer = global.PacVu3DViewer.createModal({ id: 'c0013dModal', badge: 'C001 · Cake Box · Stage 1' });
    const modal = viewer.modal;
    const stage = viewer.stage;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera = global.PacVu3DViewer.createPerspectiveCamera(THREE, size);
    const renderer = global.PacVu3DViewer.createRenderer(THREE);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.prepend(renderer.domElement);
    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.screenSpacePanning = true;
    controls.minDistance = Math.max(size.W, size.D, size.H) * 0.35;
    controls.maxDistance = Math.max(size.W, size.D, size.H) * 9;

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
    sun.shadow.camera.left = -700;
    sun.shadow.camera.right = 700;
    sun.shadow.camera.top = 700;
    sun.shadow.camera.bottom = -700;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 1800;
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 1.5;
    scene.add(sun);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1800),
      new THREE.ShadowMaterial({ color: 0x3f3933, opacity: 0.34 })
    );
    floor.receiveShadow = true;
    floor.position.z = -Math.max(size.H, 20) - 4;
    scene.add(floor);
    const grid = new THREE.GridHelper(
      global.PacVu3DTheme.grid.size,
      global.PacVu3DTheme.grid.divisions,
      global.PacVu3DTheme.grid.centerColor,
      global.PacVu3DTheme.grid.lineColor
    );
    grid.rotation.x = Math.PI / 2;
    grid.position.z = floor.position.z + 0.02;
    scene.add(grid);
    global.PacVu3DViewer.standardizeEnvironment({ renderer, scene, controls, floor, grid });

    const materials = global.PacVu3DViewer.createBoardMaterials(THREE);
    materials[1] = materials[1].clone();
    materials[1].color.copy(materials[0].color);
    materials[1].name = 'C001 white paper inside';
    materials[2] = materials[2].clone();
    materials[2].color.copy(materials[0].color);
    materials[2].name = 'C001 seamless paper edge';
    const root = new THREE.Group();
    scene.add(root);
    const pieceByName = new Map();
    const hinges = [];

    function makeGeometry(contour, holes) {
      const outline = contour.map(toWorld);
      if (!THREE.ShapeUtils.isClockWise(outline)) outline.reverse();
      const shape = new THREE.Shape(outline);
      (holes || []).forEach(holePoints => {
        const hole = holePoints.map(toWorld);
        if (THREE.ShapeUtils.isClockWise(hole)) hole.reverse();
        shape.holes.push(new THREE.Path(hole));
      });
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: PAPER,
        bevelEnabled: false,
        curveSegments: 1,
        steps: 1
      });
      geometry.translate(0, 0, -PAPER / 2);
      global.PacVu3DViewer.assignBoardFaceMaterials(geometry);
      geometry.computeVertexNormals();
      return geometry;
    }

    function add(name, holes) {
      const geometry = makeGeometry(contours[name], holes);
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.name = name;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const centroid = contours[name].reduce((total, point) => ({
        x: total.x + point.x,
        y: total.y + point.y
      }), { x: 0, y: 0 });
      centroid.x /= contours[name].length;
      centroid.y /= contours[name].length;
      pieceByName.set(name, { mesh, flatCenter: new THREE.Vector3(centroid.x - center.x, center.y - centroid.y, 0) });
      return mesh;
    }

    function addBrand(name, rotate) {
      const panel = pieceByName.get(name)?.mesh;
      if (!panel) return;
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 300;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#6c6761';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '700 176px Arial, sans-serif';
      context.fillText('PacVu', 512, 105);
      context.font = '500 46px Arial, sans-serif';
      context.fillText('Packaging + Viewer + Use', 512, 235);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      panel.geometry.computeBoundingBox();
      const box = panel.geometry.boundingBox;
      const width = Math.min(box.max.x - box.min.x, 115) * 0.67;
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(width, width * canvas.height / canvas.width),
        global.PacVu3DViewer.createOverlayMaterial(THREE, {
          map: texture, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false
        })
      );
      logo.position.set((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, PAPER / 2 + 0.012);
      logo.rotation.z = rotate || 0;
      logo.renderOrder = 1000;
      logo.userData.c001Brand = true;
      panel.add(logo);
    }

    add('glue');
    add('baseMain');
    add('slotTop', topSlotHoles);
    add('slotBottom', bottomSlotHoles);
    add('sideBackMain');
    add('backFlapTop');
    add('backFlapBottom');
    add('lidMain', handleHoles.concat(handlePanels));
    add('lockTop');
    add('lockBottom');
    add('handleLeft');
    add('handleRight');
    add('sideFrontMain');
    add('frontFlapTop');
    add('frontFlapBottom');
    add('lidFrontSeam');
    add('sideFrontSeam');
    addBrand('lockTop', Math.PI);
    addBrand('lockBottom', 0);

    const vector = (x, y, z = 0) => {
      const mapped = layout.mapPoint(x, y);
      return new THREE.Vector3(mapped.x - center.x, center.y - mapped.y, z);
    };
    const sheet = new THREE.Group();
    root.add(sheet);
    sheet.add(pieceByName.get('lidMain').mesh);
    sheet.add(pieceByName.get('lidFrontSeam').mesh);

    function attach(parent, name, sourceA, sourceB, start, end, angle) {
      const piece = pieceByName.get(name);
      const p = vector(sourceA.x, sourceA.y);
      const q = vector(sourceB.x, sourceB.y);
      const hinge = new THREE.Group();
      hinge.position.copy(p);
      parent.add(hinge);
      const frame = new THREE.Group();
      frame.position.copy(p).multiplyScalar(-1);
      hinge.add(frame);
      frame.add(piece.mesh);
      const axis = q.clone().sub(p).normalize();
      const radial = piece.flatCenter.clone().sub(p);
      const sign = new THREE.Vector3().crossVectors(axis, radial).z >= 0 ? 1 : -1;
      hinges.push({ object: hinge, axis, angle: -(angle || Math.PI / 2) * sign, start, end });
      return frame;
    }

    const sideBackFrame = attach(sheet, 'sideBackMain',
      { x: 1636.469, y: 487.016 }, { x: 1636.469, y: 1266.549 }, 0.03, 0.16);
    const baseFrame = attach(sideBackFrame, 'baseMain',
      { x: 1239.618, y: 487.016 }, { x: 1239.618, y: 1266.547 }, 0.12, 0.25);
    attach(baseFrame, 'glue',
      { x: 460.09, y: 487.02 }, { x: 460.09, y: 1266.546 }, 0.22, 0.33);
    const sideFrontFrame = attach(sheet, 'sideFrontMain',
      { x: 2415.993, y: 487.016 }, { x: 2415.993, y: 1266.547 }, 0.27, 0.40);
    sideFrontFrame.add(pieceByName.get('sideFrontSeam').mesh);

    // Four short flaps first: all fold into the box interior.
    attach(sideBackFrame, 'backFlapTop',
      { x: 1239.618, y: 487.016 }, { x: 1636.469, y: 487.016 }, 0.42, 0.52);
    attach(sideBackFrame, 'backFlapBottom',
      { x: 1636.469, y: 1266.547 }, { x: 1239.618, y: 1266.547 }, 0.42, 0.52);
    attach(sideFrontFrame, 'frontFlapTop',
      { x: 2415.993, y: 487.016 }, { x: 2810.064, y: 487.016 }, 0.42, 0.52);
    attach(sideFrontFrame, 'frontFlapBottom',
      { x: 2810.064, y: 1266.547 }, { x: 2415.993, y: 1266.547 }, 0.42, 0.52);

    // Slot panels fold inward next. Their U cuts remain real flexible openings.
    attach(baseFrame, 'slotTop',
      { x: 460.09, y: 487.016 }, { x: 1239.618, y: 487.016 }, 0.53, 0.64);
    attach(baseFrame, 'slotBottom',
      { x: 1239.618, y: 1266.547 }, { x: 460.09, y: 1266.547 }, 0.53, 0.64);

    // Curved locks close over the slot panels and finish with a small inward
    // travel that represents the tab being pushed through the three-cut slot.
    const lockTopFrame = attach(sheet, 'lockTop',
      { x: 1636.469, y: 487.016 }, { x: 2415.993, y: 487.016 }, 0.65, 0.78);
    const lockBottomFrame = attach(sheet, 'lockBottom',
      { x: 2415.993, y: 1266.547 }, { x: 1636.469, y: 1266.547 }, 0.65, 0.78);

    // The two handles are separate punched panels. They remain flat until all
    // side locks have engaged, then rise together as the final operation.
    attach(sheet, 'handleLeft',
      { x: 1979.041, y: 630.797 }, { x: 1979.041, y: 1122.772 }, 0.86, 0.98, -Math.PI / 2);
    attach(sheet, 'handleRight',
      { x: 2073.419, y: 1122.772 }, { x: 2073.419, y: 630.797 }, 0.86, 0.98, -Math.PI / 2);

    function pose(value) {
      modal.querySelector('.m001-3d-controls')?.style.setProperty('--progress', `${Math.round(value * 100)}%`);
      hinges.forEach(hinge => {
        const amount = phase(value, hinge.start, hinge.end);
        hinge.object.quaternion.setFromAxisAngle(hinge.axis, hinge.angle * amount);
      });
      // The side-front is the outside sheet at the glued seam. Move it by one
      // board thickness only during final contact so the trapezoid Glue edge
      // cannot z-fight through the covering panel.
      pieceByName.get('sideFrontMain').mesh.position.z = -(PAPER + 0.02) * phase(value, 0.34, 0.40);
    }

    function resize() {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    function view(type) { global.PacVu3DViewer.fitObject(root, camera, controls, type); }
    const slider = modal.querySelector('input');
    slider.oninput = () => pose(+slider.value / 100);
    slider.onchange = () => view('iso');
    modal.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => view(button.dataset.view); });
    modal.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
    let shadows = true;
    modal.querySelector('[data-shadow]').onclick = event => {
      shadows = !shadows;
      floor.visible = shadows;
      sun.castShadow = shadows;
      event.currentTarget.textContent = shadows ? 'Shadows On' : 'Shadows Off';
    };
    modal.querySelector('[data-download]').onclick = () => {
      renderer.domElement.toBlob(blob => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `C001_STAGE1_${Math.round(+slider.value)}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, 'image/png');
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();
    pose(0);
    view('top');
    let live = true;
    let animation = 0;
    (function loop() {
      if (!live) return;
      animation = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    }());

    const metrics = {};
    Object.keys(contours).forEach(name => { metrics[name] = contours[name].length; });
    global.C001_3D_DEBUG = {
      tolerance: FLATTEN_TOLERANCE_MM,
      panelVertices: metrics,
      handleHoleVertices: handleHoles.map(hole => hole.length),
      handlePanelVertices: handlePanels.map(panel => panel.length),
      slotHoleCount: slotHoles.length,
      pose
    };

    return {
      signature,
      open() { modal.classList.add('open'); resize(); view('top'); },
      destroy() {
        live = false;
        cancelAnimationFrame(animation);
        resizeObserver.disconnect();
        controls.dispose?.();
        root.traverse(object => {
          object.geometry?.dispose();
          if (object.userData?.c001Brand) {
            object.material?.map?.dispose();
            object.material?.dispose();
          }
        });
        materials.forEach(material => material.dispose());
        floor.geometry.dispose();
        floor.material.dispose();
        grid.geometry.dispose();
        if (Array.isArray(grid.material)) grid.material.forEach(material => material.dispose());
        else grid.material.dispose();
        renderer.dispose();
        modal.remove();
      }
    };
  }

  let app;
  function attachButton() {
    const bar = document.querySelector('.toolbar') || document.querySelector('header') || document.body;
    if (document.getElementById('c001-3d-btn')) return;
    const button = document.createElement('button');
    button.id = 'c001-3d-btn';
    button.textContent = '3D MOCKUP';
    button.style.display = 'none';
    bar.appendChild(button);
    button.onclick = () => {
      const size = config();
      const signature = [size.W, size.D, size.H].join(':');
      if (!app || app.signature !== signature) {
        app?.destroy();
        app = init3D();
      }
      app.open();
    };
    function active() {
      const enabled = typeof selectedBoxMeta !== 'undefined' && selectedBoxMeta?.engineKey === 'c001';
      button.style.display = enabled ? '' : 'none';
    }
    active();
    setInterval(active, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachButton);
  else attachButton();
}(window));
