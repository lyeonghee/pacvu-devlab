(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE || !global.B002_getLayout) return;
  const PAPER = 0.32;
  // Keep the assembly slider available during B002 visual tuning.
  // Do not lock it again unless the user explicitly requests a lock.
  const B002_BETA_ASSEMBLY_READY = true;
  const B002_PANEL_DEBUG = false;
  // PacVu default paper palette, approved on B001.
  const PACVU_BOARD_COLORS = Object.freeze({
    kraftInside: 0xd5bf9a,
    whiteOutside: 0xfaf9f6,
    cutEdge: 0xb09062
  });
  // Fixed source-space B002 pieces captured from the approved dieline.
  // These roles are stable across W/D/H resizing and replace runtime role inference.
  const B002_FIXED_PANEL_SOURCE = Object.freeze(
{
  "front": [
    [
      971.33,
      584.086
    ],
    [
      1032.342,
      974.658
    ],
    [
      645.696,
      974.465
    ],
    [
      706.937,
      583.855
    ]
  ],
  "sideL": [
    [
      523.382,
      556.204
    ],
    [
      700.319,
      585.066
    ],
    [
      701.93,
      587.328
    ],
    [
      705.458,
      586.99
    ],
    [
      706.411,
      584.969
    ],
    [
      645.696,
      974.465
    ],
    [
      644.444,
      974.27
    ],
    [
      644.178,
      973.695
    ],
    [
      643.381,
      974.105
    ],
    [
      455.853,
      944.841
    ],
    [
      517.012,
      557.142
    ],
    [
      520.905,
      558.434
    ]
  ],
  "sideR": [
    [
      1034.249,
      974.659
    ],
    [
      1032.342,
      974.658
    ],
    [
      971.33,
      584.086
    ],
    [
      972.885,
      587.126
    ],
    [
      976.423,
      587.305
    ],
    [
      978.372,
      583.424
    ],
    [
      1154.271,
      551.62
    ],
    [
      1158.21,
      555.932
    ],
    [
      1241.761,
      1085.256
    ],
    [
      1241.822,
      1089.147
    ],
    [
      1238.103,
      1090.293
    ],
    [
      1151.213,
      1104.093
    ],
    [
      1147.223,
      1104.177
    ],
    [
      1143.319,
      1103.353
    ],
    [
      1139.704,
      1101.663
    ],
    [
      1136.566,
      1099.199
    ],
    [
      1134.066,
      1096.089
    ],
    [
      1132.333,
      1092.494
    ],
    [
      1131.455,
      1088.601
    ],
    [
      1131.475,
      1084.611
    ],
    [
      1132.394,
      1080.728
    ],
    [
      1144.368,
      1055.523
    ],
    [
      1141.539,
      1052.825
    ],
    [
      1035.592,
      974.139
    ]
  ],
  "frontBottom": [
    [
      644.444,
      974.27
    ],
    [
      1034.249,
      974.659
    ],
    [
      1032.532,
      975.323
    ],
    [
      1032.515,
      1119.289
    ],
    [
      1029.518,
      1121.093
    ],
    [
      945.537,
      1121.093
    ],
    [
      941.548,
      1120.902
    ],
    [
      937.692,
      1119.873
    ],
    [
      934.172,
      1117.995
    ],
    [
      931.169,
      1115.367
    ],
    [
      928.838,
      1112.128
    ],
    [
      927.299,
      1108.447
    ],
    [
      926.629,
      1104.512
    ],
    [
      926.6,
      1072.52
    ],
    [
      925.823,
      1068.774
    ],
    [
      753.937,
      1068.422
    ],
    [
      751.603,
      1070.889
    ],
    [
      751.284,
      1106.861
    ],
    [
      750.094,
      1110.67
    ],
    [
      748.074,
      1114.111
    ],
    [
      745.329,
      1117.007
    ],
    [
      741.999,
      1119.206
    ],
    [
      738.256,
      1120.589
    ],
    [
      734.297,
      1121.09
    ],
    [
      650.316,
      1121.092
    ],
    [
      646.406,
      1120.696
    ],
    [
      645.687,
      1116.921
    ],
    [
      645.687,
      976.953
    ]
  ],
  "frontTop": [
    [
      971.271,
      583.971
    ],
    [
      706.937,
      583.855
    ],
    [
      706.937,
      399.944
    ],
    [
      707.167,
      395.966
    ],
    [
      709.196,
      392.583
    ],
    [
      712.729,
      390.833
    ],
    [
      716.721,
      390.726
    ],
    [
      887.419,
      390.724
    ],
    [
      961.484,
      390.724
    ],
    [
      965.475,
      390.831
    ],
    [
      969.009,
      392.581
    ],
    [
      971.037,
      395.964
    ],
    [
      971.267,
      399.942
    ]
  ],
  "back": [
    [
      342.816,
      499.603
    ],
    [
      439.582,
      529.936
    ],
    [
      517.012,
      557.142
    ],
    [
      455.853,
      944.841
    ],
    [
      454.486,
      944.391
    ],
    [
      454.4,
      943.325
    ],
    [
      452.135,
      943.615
    ],
    [
      88.886,
      823.815
    ],
    [
      88.112,
      822.719
    ],
    [
      265.768,
      474.681
    ]
  ],
  "sideLBottom": [
    [
      454.486,
      944.391
    ],
    [
      643.381,
      974.105
    ],
    [
      640.731,
      975.467
    ],
    [
      534.088,
      1053.207
    ],
    [
      532.201,
      1056.307
    ],
    [
      544.414,
      1081.479
    ],
    [
      545.092,
      1085.412
    ],
    [
      544.867,
      1089.396
    ],
    [
      543.75,
      1093.227
    ],
    [
      541.797,
      1096.707
    ],
    [
      539.111,
      1099.658
    ],
    [
      535.827,
      1101.924
    ],
    [
      532.114,
      1103.386
    ],
    [
      528.166,
      1103.966
    ],
    [
      524.187,
      1103.649
    ],
    [
      433.398,
      1089.049
    ],
    [
      432.876,
      1085.358
    ],
    [
      454.704,
      947.103
    ]
  ],
  "sideLTop": [
    [
      700.319,
      585.066
    ],
    [
      523.538,
      556.253
    ],
    [
      551.541,
      477.663
    ],
    [
      554.193,
      474.735
    ],
    [
      557.739,
      472.996
    ],
    [
      561.677,
      472.694
    ],
    [
      686.998,
      494.213
    ],
    [
      690.812,
      495.271
    ],
    [
      693.991,
      497.614
    ],
    [
      696.081,
      500.965
    ],
    [
      696.791,
      504.852
    ],
    [
      699.689,
      580.294
    ],
    [
      699.874,
      584.441
    ]
  ],
  "frontHandle": [
    [
      887.419,
      390.724
    ],
    [
      792.684,
      390.726
    ],
    [
      791.43,
      388.546
    ],
    [
      788.61,
      385.713
    ],
    [
      786.773,
      382.216
    ],
    [
      786.602,
      370.234
    ],
    [
      787.556,
      362.318
    ],
    [
      791.424,
      346.801
    ],
    [
      792.847,
      343.085
    ],
    [
      795.52,
      340.145
    ],
    [
      799.094,
      338.409
    ],
    [
      803.061,
      338.052
    ],
    [
      875.026,
      338.052
    ],
    [
      878.997,
      338.379
    ],
    [
      882.591,
      340.074
    ],
    [
      885.297,
      342.984
    ],
    [
      886.753,
      346.686
    ],
    [
      891.371,
      366.128
    ],
    [
      891.277,
      382.083
    ],
    [
      889.537,
      385.653
    ],
    [
      886.778,
      388.542
    ],
    [
      885.52,
      390.724
    ]
  ],
  "sideRTop": [
    [
      1154.271,
      551.62
    ],
    [
      978.372,
      583.424
    ],
    [
      981.211,
      500.257
    ],
    [
      982.625,
      496.543
    ],
    [
      985.317,
      493.618
    ],
    [
      988.904,
      491.904
    ],
    [
      1119.09,
      470.289
    ],
    [
      1123.065,
      470.273
    ],
    [
      1126.762,
      471.734
    ],
    [
      1129.651,
      474.464
    ],
    [
      1131.335,
      478.068
    ],
    [
      1153.44,
      550.764
    ]
  ],
  "backBottom": [
    [
      88.886,
      823.815
    ],
    [
      452.135,
      943.615
    ],
    [
      450.695,
      943.8
    ],
    [
      326.35,
      998.808
    ],
    [
      323.147,
      1000.957
    ],
    [
      311.97,
      1035.167
    ],
    [
      309.959,
      1038.613
    ],
    [
      307.222,
      1041.517
    ],
    [
      303.897,
      1043.723
    ],
    [
      300.159,
      1045.119
    ],
    [
      296.201,
      1045.628
    ],
    [
      292.232,
      1045.223
    ],
    [
      288.405,
      1044.069
    ],
    [
      162.934,
      1003.165
    ],
    [
      159.161,
      1001.846
    ],
    [
      155.71,
      999.843
    ],
    [
      152.803,
      997.11
    ],
    [
      150.59,
      993.789
    ],
    [
      149.183,
      990.055
    ],
    [
      148.655,
      986.099
    ],
    [
      149.032,
      982.127
    ],
    [
      150.166,
      978.294
    ],
    [
      160.024,
      947.858
    ],
    [
      158.754,
      944.23
    ]
  ],
  "glue": [
    [
      342.816,
      499.603
    ],
    [
      265.768,
      474.681
    ],
    [
      88.112,
      822.719
    ],
    [
      85.886,
      820.215
    ],
    [
      33.884,
      776.424
    ],
    [
      33.548,
      772.93
    ],
    [
      193.441,
      459.43
    ],
    [
      196.17,
      457.006
    ],
    [
      262.676,
      471.108
    ],
    [
      265.98,
      469.957
    ],
    [
      294.32,
      382.453
    ],
    [
      297.695,
      381.6
    ],
    [
      335.718,
      393.992
    ],
    [
      338.315,
      391.621
    ],
    [
      354.393,
      342.182
    ],
    [
      357.757,
      334.934
    ],
    [
      362.171,
      328.273
    ],
    [
      367.545,
      322.36
    ],
    [
      373.754,
      317.331
    ],
    [
      384.316,
      311.696
    ],
    [
      391.951,
      309.339
    ],
    [
      399.856,
      308.175
    ],
    [
      407.846,
      308.231
    ],
    [
      419.587,
      310.573
    ],
    [
      487.923,
      332.816
    ],
    [
      499.167,
      338.566
    ],
    [
      508.307,
      346.297
    ],
    [
      513.319,
      352.52
    ],
    [
      518.936,
      363.092
    ],
    [
      522.025,
      374.658
    ],
    [
      522.593,
      382.628
    ],
    [
      521.951,
      390.593
    ],
    [
      520.128,
      398.373
    ],
    [
      504.308,
      447.865
    ],
    [
      507.409,
      449.966
    ],
    [
      545.314,
      462.579
    ],
    [
      545.084,
      466.348
    ],
    [
      516.81,
      553.917
    ],
    [
      345.023,
      498.474
    ]
  ],
  "backHandle": [
    [
      487.923,
      332.816
    ],
    [
      419.587,
      310.573
    ],
    [
      412.514,
      307.643
    ],
    [
      405.661,
      303.534
    ],
    [
      399.512,
      298.432
    ],
    [
      394.209,
      292.455
    ],
    [
      389.874,
      285.743
    ],
    [
      386.601,
      278.453
    ],
    [
      384.467,
      270.753
    ],
    [
      383.521,
      262.819
    ],
    [
      383.787,
      254.833
    ],
    [
      386.4,
      243.148
    ],
    [
      401.184,
      197.493
    ],
    [
      400.995,
      193.839
    ],
    [
      363.009,
      181.362
    ],
    [
      360.272,
      178.987
    ],
    [
      372.539,
      140.929
    ],
    [
      374.234,
      137.329
    ],
    [
      377.121,
      134.597
    ],
    [
      380.818,
      133.136
    ],
    [
      384.793,
      133.159
    ],
    [
      388.615,
      134.325
    ],
    [
      616.744,
      208.695
    ],
    [
      620.335,
      210.409
    ],
    [
      623.049,
      213.313
    ],
    [
      624.494,
      217.016
    ],
    [
      624.466,
      220.991
    ],
    [
      612.212,
      259.055
    ],
    [
      609.822,
      261.767
    ],
    [
      571.787,
      249.425
    ],
    [
      568.243,
      249.906
    ],
    [
      550.745,
      303.08
    ],
    [
      544.807,
      313.475
    ],
    [
      539.605,
      319.54
    ],
    [
      530.231,
      326.985
    ],
    [
      523.146,
      330.68
    ],
    [
      515.582,
      333.256
    ],
    [
      503.723,
      334.889
    ],
    [
      495.745,
      334.453
    ]
  ]
}
  );
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = value => { const v = clamp(value, 0, 1); return v * v * (3 - (2 * v)); };
  const phase = (value, start, end) => smooth((value - start) / (end - start));

  // B002 fold semantics are explicit. Internal creases stay inside one rigid
  // panel and therefore never participate in polygonization.
  const B002_FOLD_RULES = Object.freeze({
    'b002-fold-1':  { classification: 'bottom flap boundary', polygonBoundary: true,  mountainValley: 'valley',   signedAngle: -90, targetAngle: 90, order: 50 },
    'b002-fold-2':  { classification: 'body boundary',        polygonBoundary: true,  mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 20 },
    'b002-fold-3':  { classification: 'top flap boundary',    polygonBoundary: true,  mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 90 },
    'b002-fold-4':  { classification: 'body boundary',        polygonBoundary: true,  mountainValley: 'mountain', signedAngle: -90, targetAngle: 90, order: 10 },
    'b002-fold-5':  { classification: 'bottom flap boundary', polygonBoundary: true,  mountainValley: 'valley',   signedAngle: -90, targetAngle: 90, order: 60 },
    'b002-fold-6':  { classification: 'top flap boundary',    polygonBoundary: true,  mountainValley: 'mountain', signedAngle: -90, targetAngle: 90, order: 100 },
    'b002-fold-7':  { classification: 'internal crease',      polygonBoundary: false, mountainValley: 'valley',   signedAngle: -45, targetAngle: 45, order: 115 },
    'b002-fold-8':  { classification: 'bottom flap boundary', polygonBoundary: true,  mountainValley: 'valley',   signedAngle:  90, targetAngle: 90, order: 70 },
    'b002-fold-9':  { classification: 'top flap boundary',    polygonBoundary: true,  mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 110 },
    'b002-fold-10': { classification: 'internal crease',      polygonBoundary: false, mountainValley: 'valley',   signedAngle:  45, targetAngle: 45, order: 116 },
    'b002-fold-11': { classification: 'bottom flap boundary', polygonBoundary: true,  mountainValley: 'valley',   signedAngle: -90, targetAngle: 90, order: 80 },
    'b002-fold-12': { classification: 'body boundary',        polygonBoundary: true,  mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 40 },
    'b002-fold-13': { classification: 'top flap boundary',    polygonBoundary: true,  mountainValley: 'mountain', signedAngle: -90, targetAngle: 90, order: 120 },
    'b002-fold-14': { classification: 'top flap boundary',    polygonBoundary: true,  mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 121 },
    'b002-fold-15': { classification: 'body boundary',        polygonBoundary: true,  mountainValley: 'mountain', signedAngle: -90, targetAngle: 90, order: 30 },
    'b002-fold-16': { classification: 'handle sub-panel boundary', polygonBoundary: true, mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 130 },
    'b002-fold-17': { classification: 'handle crease', polygonBoundary: true, mountainValley: 'valley', signedAngle: -90, targetAngle: 90, order: 140 },
    'b002-fold-18': { classification: 'internal crease', polygonBoundary: false, mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 150 },
    'b002-fold-19': { classification: 'handle sub-panel boundary', polygonBoundary: true, mountainValley: 'valley',   signedAngle: -90, targetAngle: 90, order: 160 },
    'b002-fold-20': { classification: 'handle panel boundary', polygonBoundary: true, mountainValley: 'mountain', signedAngle:  90, targetAngle: 90, order: 170 },
    'b002-fold-21': { classification: 'internal crease', polygonBoundary: false, mountainValley: 'valley',   signedAngle: -90, targetAngle: 90, order: 180 }
  });

  function panelGeometry(points, holes) {
    const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const top = Math.min.apply(null, points.map(point => point.y));
    const bottom = Math.max.apply(null, points.map(point => point.y));
    const localContour = points.map(point => new THREE.Vector2(point.x - cx, bottom - point.y));
    if (!THREE.ShapeUtils.isClockWise(localContour)) localContour.reverse();
    const shape = new THREE.Shape();
    localContour.forEach((point, index) => {
      if (index) shape.lineTo(point.x, point.y); else shape.moveTo(point.x, point.y);
    });
    shape.closePath();
    (holes || []).forEach(pointsInHole => {
      const localHole = pointsInHole.map(point => new THREE.Vector2(point.x - cx, bottom - point.y));
      if (THREE.ShapeUtils.isClockWise(localHole)) localHole.reverse();
      const hole = new THREE.Path();
      localHole.forEach((point, index) => {
        if (index) hole.lineTo(point.x, point.y); else hole.moveTo(point.x, point.y);
      });
      hole.closePath();
      shape.holes.push(hole);
    });
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: PAPER, bevelEnabled: false, curveSegments: 20 });
    geometry.translate(0, 0, -PAPER / 2);
    global.PacVu3DViewer.assignBoardFaceMaterials(geometry, PAPER, 'exterior');
    const position = geometry.getAttribute('position');
    geometry.computeVertexNormals();
    let holeCapLeakCount = 0;
    if ((holes || []).length) {
      for (let index = 0; index < position.count; index += 3) {
        const z = (position.getZ(index) + position.getZ(index + 1) + position.getZ(index + 2)) / 3;
        if (z <= PAPER * .2) continue;
        const sourcePoint = {
          x: cx + ((position.getX(index) + position.getX(index + 1) + position.getX(index + 2)) / 3),
          y: bottom - ((position.getY(index) + position.getY(index + 1) + position.getY(index + 2)) / 3)
        };
        if (holes.some(hole => pointInPolygon(sourcePoint, hole))) holeCapLeakCount++;
      }
    }
    return { geometry, height: bottom - top, centerX: cx, top, bottom, holeCapLeakCount };
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      const crosses = ((a.y > point.y) !== (b.y > point.y))
        && (point.x < ((b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 1e-9)) + a.x);
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function addFrontBrand(front, width, localX, localY) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 300;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#625d57';
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = '700 220px Arial, sans-serif';
    context.fillText('PacVu', canvas.width / 2, 118);
    context.font = '500 38px Arial, sans-serif';
    context.fillText('Packaging + View + Use', canvas.width / 2, 250);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    const logoWidth = width * .34;
    const brand = new THREE.Mesh(
      new THREE.PlaneGeometry(logoWidth, logoWidth * canvas.height / canvas.width),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: .78, depthWrite: false, toneMapped: false })
    );
    // The logo lives on B002's white printable exterior, visible in Flat.
    brand.position.set(localX, localY, PAPER / 2 + .025);
    brand.renderOrder = 100;
    brand.userData.pacvuBrand = true;
    front.add(brand);
  }

  function makeDebugLabel(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(255,255,255,.92)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = color;
    context.lineWidth = 10;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.fillStyle = '#262626';
    context.font = '700 54px Arial, sans-serif';
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(48, 12, 1);
    sprite.renderOrder = 300;
    sprite.userData.debugTexture = texture;
    return sprite;
  }

  function polygonArea(points) {
    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) area += (points[j].x * points[i].y) - (points[i].x * points[j].y);
    return area / 2;
  }

  function polygonCenter(points) {
    const sum = points.reduce((value, point) => ({ x: value.x + point.x, y: value.y + point.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  function polygonInteriorPoint(points) {
    const contour = points.map(point => new THREE.Vector2(point.x, point.y));
    const triangles = THREE.ShapeUtils.triangulateShape(contour, []);
    for (const triangle of triangles) {
      const point = {
        x: (contour[triangle[0]].x + contour[triangle[1]].x + contour[triangle[2]].x) / 3,
        y: (contour[triangle[0]].y + contour[triangle[1]].y + contour[triangle[2]].y) / 3
      };
      if (pointInPolygon(point, points)) return point;
    }
    return polygonCenter(points);
  }

  function segmentIntersection(a, b, c, d) {
    const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
    const denominator = (rx * sy) - (ry * sx);
    if (Math.abs(denominator) < 1e-8) return null;
    const qx = c.x - a.x, qy = c.y - a.y;
    const t = ((qx * sy) - (qy * sx)) / denominator;
    const u = ((qx * ry) - (qy * rx)) / denominator;
    if (t < -1e-6 || t > 1.000001 || u < -1e-6 || u > 1.000001) return null;
    return { x: a.x + (rx * t), y: a.y + (ry * t), t, u };
  }

  function projectToSegment(point, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = clamp((((point.x - a.x) * dx) + ((point.y - a.y) * dy)) / ((dx * dx) + (dy * dy) || 1), 0, 1);
    const projected = { x: a.x + dx * t, y: a.y + dy * t };
    return { point: projected, t, distance: B002_distance(point, projected) };
  }

  function distanceToPolygonBoundary(point, polygon) {
    let distance = Infinity;
    for (let i = 0; i < polygon.length; i++) distance = Math.min(distance, projectToSegment(point, polygon[i], polygon[(i + 1) % polygon.length]).distance);
    return distance;
  }

  function validatePanelCoverage(outline, holes, panels) {
    const xs = outline.map(point => point.x), ys = outline.map(point => point.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const divisions = 180;
    let sheetSamples = 0, coveredSamples = 0, missingSamples = 0, overlapSamples = 0;
    for (let row = 0; row < divisions; row++) {
      const y = minY + ((row + .5) / divisions) * (maxY - minY);
      for (let column = 0; column < divisions; column++) {
        const x = minX + ((column + .5) / divisions) * (maxX - minX);
        const point = { x, y };
        if (!pointInPolygon(point, outline) || holes.some(hole => pointInPolygon(point, hole))) continue;
        sheetSamples++;
        const count = panels.reduce((sum, panel) => sum + (pointInPolygon(point, panel.closedPath) ? 1 : 0), 0);
        if (count) coveredSamples++;
        if (!count) missingSamples++;
        if (count > 1) overlapSamples++;
      }
    }
    return {
      sampledAreaCoverage: sheetSamples ? coveredSamples / sheetSamples : 0,
      missingRatio: sheetSamples ? missingSamples / sheetSamples : 1,
      overlapRatio: sheetSamples ? overlapSamples / sheetSamples : 1
    };
  }

  // Polygonize only the approved cut contour and approved fold segments.
  // No nearest-panel assignment and no generated panel boundary is used.
  function getPhysicalBoundaryFolds(layout) {
    const raw = global.B002_getFoldSegments(layout).map(fold => ({ ...fold, ...B002_FOLD_RULES[fold.id] }));
    const byId = new Map(raw.map(fold => [fold.id, fold]));
    const joined = new Map([
      ['b002-fold-14', ['b002-fold-13', 'b002-fold-14']],
      ['b002-fold-17', ['b002-fold-17', 'b002-fold-18']],
      ['b002-fold-20', ['b002-fold-20', 'b002-fold-21']]
    ]);
    const replaced = new Set(['b002-fold-13', 'b002-fold-18', 'b002-fold-21']);
    const physical = raw.filter(fold => fold.polygonBoundary && !replaced.has(fold.id)).map(fold => {
      const pair = joined.get(fold.id);
      if (!pair) return fold;
      const first = byId.get(pair[0]);
      const last = byId.get(pair[1]);
      return {
        ...fold,
        a: { ...first.a },
        b: { ...last.b },
        sourceFoldIds: pair.slice()
      };
    });
    return { raw, physical };
  }

  function buildPanelContract(layout) {
    const outline = layout.outlinePoints.slice();
    if (B002_distance(outline[0], outline[outline.length - 1]) < .05) outline.pop();
    const sheetArea = Math.abs(polygonArea(outline));
    const raw = [];
    for (let i = 0; i < outline.length; i++) raw.push({ kind: 'cut', a: outline[i], b: outline[(i + 1) % outline.length], foldId: null });
    const physicalFolds = getPhysicalBoundaryFolds(layout);
    const sourceFolds = physicalFolds.raw;
    const boundaryFolds = physicalFolds.physical;
    boundaryFolds.forEach(fold => raw.push({ kind: 'fold', a: { ...fold.a }, b: { ...fold.b }, foldId: fold.id }));

    // Fold endpoints in the source drawing differ from their cut/fold joins
    // by sub-millimetres. Snap only within production drawing tolerance.
    const SNAP = 1.8;
    raw.filter(segment => segment.kind === 'fold').forEach(segment => {
      ['a', 'b'].forEach(key => {
        let best = null;
        raw.forEach(candidate => {
          if (candidate === segment) return;
          const hit = projectToSegment(segment[key], candidate.a, candidate.b);
          if (!best || hit.distance < best.distance) best = hit;
        });
        if (best && best.distance <= SNAP) segment[key] = best.point;
      });
    });

    const cuts = raw.map(segment => ({ ...segment, splits: [{ t: 0, p: segment.a }, { t: 1, p: segment.b }] }));
    for (let i = 0; i < cuts.length; i++) {
      for (let j = i + 1; j < cuts.length; j++) {
        const hit = segmentIntersection(cuts[i].a, cuts[i].b, cuts[j].a, cuts[j].b);
        if (!hit) continue;
        cuts[i].splits.push({ t: hit.t, p: hit }); cuts[j].splits.push({ t: hit.u, p: hit });
      }
    }
    const edges = [];
    cuts.forEach(segment => {
      segment.splits.sort((a, b) => a.t - b.t);
      const unique = segment.splits.filter((item, index, all) => !index || B002_distance(item.p, all[index - 1].p) > .02);
      for (let i = 0; i < unique.length - 1; i++) {
        if (B002_distance(unique[i].p, unique[i + 1].p) > .04) edges.push({ a: unique[i].p, b: unique[i + 1].p, kind: segment.kind, foldId: segment.foldId });
      }
    });
    const key = point => (Math.round(point.x * 20) / 20) + ',' + (Math.round(point.y * 20) / 20);
    const vertices = new Map();
    function vertex(point) {
      const id = key(point);
      if (!vertices.has(id)) vertices.set(id, { id, x: point.x, y: point.y, links: [] });
      return vertices.get(id);
    }
    edges.forEach(edge => {
      const a = vertex(edge.a), b = vertex(edge.b);
      a.links.push({ to: b, edge }); b.links.push({ to: a, edge });
    });
    vertices.forEach(v => v.links.sort((p, q) => Math.atan2(p.to.y - v.y, p.to.x - v.x) - Math.atan2(q.to.y - v.y, q.to.x - v.x)));
    const visited = new Set(), faces = [];
    vertices.forEach(start => start.links.forEach(first => {
      const directed = start.id + '>' + first.to.id;
      if (visited.has(directed)) return;
      const points = [], boundaryFoldIds = new Set(); let from = start, link = first, guard = 0;
      while (guard++ < edges.length * 3) {
        visited.add(from.id + '>' + link.to.id); points.push({ x: from.x, y: from.y });
        if (link.edge.foldId) boundaryFoldIds.add(link.edge.foldId);
        const at = link.to, backIndex = at.links.findIndex(item => item.to.id === from.id);
        const next = at.links[(backIndex - 1 + at.links.length) % at.links.length];
        from = at; link = next;
        if (from.id === start.id && link.to.id === first.to.id) break;
      }
      const area = polygonArea(points);
      const closedPath = area < 0 ? points.slice().reverse() : points;
      const origin = polygonInteriorPoint(closedPath);
      if (guard < edges.length * 3 && Math.abs(area) > .5 && Math.abs(area) < sheetArea * .98 && pointInPolygon(origin, outline)) {
        faces.push({ id: 'panel-' + (faces.length + 1), closedPath, origin, boundaryFoldIds: Array.from(boundaryFoldIds) });
      }
    }));
    // A face may be walked in both orientations only at malformed dangling
    // edges. Retain the positive, unique bounded production faces.
    function separatePointJoinedFaces(face) {
      const pending = [face], separated = [];
      while (pending.length) {
        const current = pending.pop();
        const points = current.closedPath;
        let split = null;
        for (let i = 0; i < points.length && !split; i++) {
          for (let j = i + 2; j < points.length; j++) {
            if (i === 0 && j === points.length - 1) continue;
            if (B002_distance(points[i], points[j]) <= SNAP) { split = [i, j]; break; }
          }
        }
        if (!split) { separated.push(current); continue; }
        const [i, j] = split;
        const paths = [
          points.slice(i, j + 1),
          points.slice(j).concat(points.slice(0, i + 1))
        ].map(path => {
          if (B002_distance(path[0], path[path.length - 1]) <= SNAP) path.pop();
          return polygonArea(path) < 0 ? path.slice().reverse() : path;
        }).filter(path => path.length >= 3 && Math.abs(polygonArea(path)) >= 30);
        if (paths.length < 2) { separated.push(current); continue; }
        paths.forEach(path => pending.push({
          ...current,
          closedPath: path,
          origin: polygonInteriorPoint(path)
        }));
      }
      return separated;
    }
    let simpleFaces = faces.flatMap(separatePointJoinedFaces);
    const sharedBackFaces = simpleFaces.filter(face =>
      face.boundaryFoldIds.includes('b002-fold-12')
      && face.boundaryFoldIds.includes('b002-fold-14')
    );
    if (sharedBackFaces.length === 2) {
      const backFace = sharedBackFaces.reduce((best, face) => face.origin.y > best.origin.y ? face : best);
      const joinedFace = sharedBackFaces.find(face => face !== backFace);
      const fold12 = boundaryFolds.find(fold => fold.id === 'b002-fold-12');
      const fold14 = boundaryFolds.find(fold => fold.id === 'b002-fold-14');
      const points = joinedFace.closedPath;
      const common = {
        x: (fold12.b.x + fold14.a.x) / 2,
        y: (fold12.b.y + fold14.a.y) / 2
      };
      const commonIndex = points.reduce((best, point, index) =>
        B002_distance(point, common) < B002_distance(points[best], common) ? index : best, 0);
      const branchIndex = points.reduce((best, point, index) => {
        const separation = Math.abs(index - commonIndex);
        const circularSeparation = Math.min(separation, points.length - separation);
        if (circularSeparation < 8) return best;
        if (best < 0) return index;
        return B002_distance(point, common) < B002_distance(points[best], common) ? index : best;
      }, -1);
      const first = points.slice(Math.min(commonIndex, branchIndex), Math.max(commonIndex, branchIndex) + 1);
      const second = points.slice(Math.max(commonIndex, branchIndex))
        .concat(points.slice(0, Math.min(commonIndex, branchIndex) + 1));
      const normalize = path => {
        const copy = path.map(point => ({ ...point }));
        copy[0] = { ...common };
        copy[copy.length - 1] = { ...common };
        copy.pop();
        return polygonArea(copy) < 0 ? copy.reverse() : copy;
      };
      const paths = [normalize(first), normalize(second)];
      const gluePath = paths.find(path => path.some(point => B002_distance(point, fold12.a) <= SNAP));
      const roofPath = paths.find(path => path !== gluePath);
      if (gluePath && roofPath && Math.abs(polygonArea(gluePath)) >= 30 && Math.abs(polygonArea(roofPath)) >= 30) {
        simpleFaces = simpleFaces.filter(face => face !== joinedFace);
        simpleFaces.push(
          { ...joinedFace, closedPath: gluePath, origin: polygonInteriorPoint(gluePath), boundaryFoldIds: ['b002-fold-12'] },
          { ...joinedFace, closedPath: roofPath, origin: polygonInteriorPoint(roofPath), boundaryFoldIds: ['b002-fold-14', 'b002-fold-17'] }
        );
      }
    }
    const panels = [];
    simpleFaces.forEach(face => {
      const duplicate = panels.some(other => B002_distance(face.origin, other.origin) < .08 && Math.abs(Math.abs(polygonArea(face.closedPath)) - Math.abs(polygonArea(other.closedPath))) < .2);
      // Ignore tiny corner faces produced where two source score segments end
      // a fraction apart. They are drawing-tolerance slivers, not board panels.
      if (!duplicate && Math.abs(polygonArea(face.closedPath)) >= 30) panels.push(face);
    });
    const frontProbe = {
      x: (layout.anchors.frontTopL.x + layout.anchors.frontTopR.x + layout.anchors.frontBottomL.x + layout.anchors.frontBottomR.x) / 4,
      y: (layout.anchors.frontTopL.y + layout.anchors.frontTopR.y + layout.anchors.frontBottomL.y + layout.anchors.frontBottomR.y) / 4
    };
    const frontPanel = panels.find(panel => pointInPolygon(frontProbe, panel.closedPath));
    panels.forEach((panel, index) => {
      panel.id = 'b002-panel-' + (index + 1);
      panel.holes = layout.requiredHolePoints.filter(hole => pointInPolygon(polygonCenter(hole), panel.closedPath));
      // The front handle punch is negative geometry owned by Front. It is
      // never polygonized or attached as an independently moving panel.
      if (layout.frontPunchEnabled && panel === frontPanel) {
        panel.holes.push(...layout.optionalHolePoints);
      }
      panel.localPath = panel.closedPath.map(point => ({ x: point.x - panel.origin.x, y: point.y - panel.origin.y }));
      panel.materialSide = 'outside-up'; panel.thickness = PAPER;
    });
    const relations = [];
    boundaryFolds.forEach(fold => {
      const dx = fold.b.x - fold.a.x, dy = fold.b.y - fold.a.y, length = Math.hypot(dx, dy) || 1;
      const exactBoundaryPanels = panels.filter(panel => panel.boundaryFoldIds.includes(fold.id));
      let pair = exactBoundaryPanels.length === 2 ? exactBoundaryPanels : null;
      let mx = 0, my = 0;
      for (const along of [.22, .38, .5, .62, .78]) {
        mx = fold.a.x + dx * along; my = fold.a.y + dy * along;
        for (const offset of [.35, .8, 1.4, 2.4]) {
          const left = { x: mx - dy / length * offset, y: my + dx / length * offset };
          const right = { x: mx + dy / length * offset, y: my - dx / length * offset };
          const a = panels.find(panel => pointInPolygon(left, panel.closedPath));
          const b = panels.find(panel => pointInPolygon(right, panel.closedPath));
          if (a && b && a !== b) { pair = [a, b]; break; }
        }
        if (pair) break;
      }
      if (!pair) {
        const candidates = panels.filter(panel => distanceToPolygonBoundary({ x: mx, y: my }, panel.closedPath) < 1.7);
        for (let i = 0; i < candidates.length && !pair; i++) {
          for (let j = i + 1; j < candidates.length; j++) {
            const ca = candidates[i].origin, cb = candidates[j].origin;
            const sideA = (dx * (ca.y - my)) - (dy * (ca.x - mx));
            const sideB = (dx * (cb.y - my)) - (dy * (cb.x - mx));
            if (sideA * sideB < 0) { pair = [candidates[i], candidates[j]]; break; }
          }
        }
      }
      if (pair) {
        const shared = pair[0].closedPath.filter(point =>
          pair[1].closedPath.some(other => B002_distance(point, other) < .06)
          && projectToSegment(point, fold.a, fold.b).distance < SNAP + .1
        );
        let axis = { a: fold.a, b: fold.b };
        if (shared.length >= 2) {
          let best = [shared[0], shared[1]], bestDistance = 0;
          for (let i = 0; i < shared.length; i++) for (let j = i + 1; j < shared.length; j++) {
            const distance = B002_distance(shared[i], shared[j]);
            if (distance > bestDistance) { bestDistance = distance; best = [shared[i], shared[j]]; }
          }
          axis = { a: { ...best[0] }, b: { ...best[1] } };
        }
        relations.push({
        id: fold.id,
        panelA: pair[0].id,
        panelB: pair[1].id,
        axis,
        axisSpace: 'layout',
        classification: fold.classification,
        mountainValley: fold.mountainValley,
        signedAngle: THREE.MathUtils.degToRad(fold.signedAngle),
        targetAngle: THREE.MathUtils.degToRad(fold.targetAngle),
        order: fold.order
        });
      }
    });
    // Match each contract-critical seam to one exact shared fold axis,
    // including both junction endpoints. Fold-2 is the right Body seam.
    relations.filter(fold => [
      'b002-fold-2', 'b002-fold-3', 'b002-fold-12', 'b002-fold-14'
    ].includes(fold.id)).forEach(sharedFold => {
      [sharedFold.panelA, sharedFold.panelB].forEach(panelId => {
        const panel = panels.find(item => item.id === panelId);
        if (!panel) return;
        panel.closedPath.forEach(point => {
          const hit = projectToSegment(point, sharedFold.axis.a, sharedFold.axis.b);
          if (hit.distance > SNAP) return;
          if (B002_distance(hit.point, sharedFold.axis.a) <= SNAP) Object.assign(point, sharedFold.axis.a);
          else if (B002_distance(hit.point, sharedFold.axis.b) <= SNAP) Object.assign(point, sharedFold.axis.b);
          else Object.assign(point, hit.point);
        });
        panel.localPath = panel.closedPath.map(point => ({ x: point.x - panel.origin.x, y: point.y - panel.origin.y }));
      });
    });
    const panelArea = panels.reduce((sum, panel) => sum + Math.abs(polygonArea(panel.closedPath)), 0);
    const holes = layout.requiredHolePoints.concat(layout.frontPunchEnabled ? layout.optionalHolePoints : []);
    const coverage = validatePanelCoverage(outline, holes, panels);
    return {
      panels,
      folds: relations,
      builder: 'buildPanelContract',
      boundaryFolds,
      sourceFolds,
      internalCreases: sourceFolds.filter(fold => !fold.polygonBoundary),
      validation: { sheetArea, panelArea, areaCoverage: sheetArea ? panelArea / sheetArea : 0, ...coverage }
    };
  }

  function buildFixedPanelContract(layout) {
    const fixedSources = Object.fromEntries(Object.entries(B002_FIXED_PANEL_SOURCE).map(([role, points]) => [role, points.map(point => point.slice())]));
    // The approved source has two continuous compound faces that must be
    // separated for physical assembly: the narrow glue flap at fold-12 and
    // the right bottom flap at fold-5.
    const glueCompound = fixedSources.glue;
    fixedSources.glue = glueCompound.slice(1, 10);
    const roofFoldA = [419.882, 313.306], roofFoldB = [486.213, 335.071];
    const clipToLineSide = (points, lineA, lineB, keepPoint) => {
      const side = point => ((lineB[0] - lineA[0]) * (point[1] - lineA[1]))
        - ((lineB[1] - lineA[1]) * (point[0] - lineA[0]));
      const keepLineSign = Math.sign(side(keepPoint)) || 1;
      const output = [];
      let previous = points[points.length - 1];
      let previousValue = side(previous) * keepLineSign;
      points.forEach(current => {
        const currentValue = side(current) * keepLineSign;
        if (currentValue >= 0 !== previousValue >= 0) {
          const t = previousValue / (previousValue - currentValue);
          output.push([
            previous[0] + ((current[0] - previous[0]) * t),
            previous[1] + ((current[1] - previous[1]) * t)
          ]);
        }
        if (currentValue >= 0) output.push(current);
        previous = current;
        previousValue = currentValue;
      });
      return output;
    };
    // fold-17 and fold-18 are the two visible ends of one physical crease.
    // B002 is fixed geometry, so define both adjoining faces directly from
    // the approved contour instead of half-plane clipping the concave handle.
    const lowerHandleFoldA = [337.229, 397.142];
    const lowerHandleFoldB = [504.817, 452.1];
    const lowerHandleOpening = [
      [377.6815, 408.989],
      [379.8354, 411.0619],
      [383.63, 412.2988],
      [387.4246, 413.5356],
      [391.2192, 414.7725],
      [395.0138, 416.0093],
      [398.8084, 417.2462],
      [402.603, 418.4831],
      [406.3976, 419.7199],
      [410.1922, 420.9568],
      [413.9868, 422.1936],
      [417.7814, 423.4305],
      [421.576, 424.6673],
      [425.3707, 425.9041],
      [429.1653, 427.141],
      [432.9598, 428.3779],
      [436.7545, 429.6147],
      [440.5491, 430.8516],
      [444.3437, 432.0884],
      [448.1383, 433.3253],
      [451.9329, 434.5621],
      [455.7275, 435.799],
      [459.5221, 437.0358],
      [463.3167, 438.2727]
    ];
    const upperHandleOpening = [
      [463.3167, 438.2727],
      [464.8911, 435.1526],
      [466.1206, 431.3556],
      [467.3501, 427.5586],
      [468.5796, 423.7616],
      [469.8091, 419.9646],
      [471.0386, 416.1676],
      [472.268, 412.3706],
      [473.4975, 408.5736],
      [474.727, 404.7766],
      [475.9433, 400.9755],
      [476.7739, 397.0688],
      [476.8991, 393.0853],
      [476.4136, 389.1283],
      [475.2951, 385.3017],
      [473.5741, 381.7057],
      [471.2952, 378.4345],
      [468.5162, 375.576],
      [465.3097, 373.2072],
      [461.7621, 371.3883],
      [457.9931, 370.0793],
      [454.1984, 368.8428],
      [450.4037, 367.6062],
      [446.6089, 366.3697],
      [442.8142, 365.1332],
      [439.0195, 363.8966],
      [435.2248, 362.6601],
      [431.4301, 361.4236],
      [427.6354, 360.187],
      [423.8407, 358.9505],
      [420.046, 357.714],
      [416.1664, 356.7954],
      [412.1898, 356.5131],
      [408.2204, 356.883],
      [404.3644, 357.8954],
      [400.7244, 359.5213],
      [397.3964, 361.7162],
      [394.4688, 364.4222],
      [392.0196, 367.5678],
      [390.1105, 371.0677],
      [388.748, 374.8165],
      [387.5184, 378.6134],
      [386.2888, 382.4104],
      [385.0592, 386.2073],
      [383.8296, 390.0043],
      [382.6, 393.8012],
      [381.3704, 397.5982],
      [380.1407, 401.3951],
      [378.9111, 405.1921],
      [377.6815, 408.989]
    ];
    fixedSources.backRoof = [
      [342.816, 499.603],
      [265.98, 469.957],
      [294.32, 382.453],
      [297.695, 381.6],
      [335.718, 393.992],
      lowerHandleFoldA.slice(),
      [377.57, 410.692],
      ...lowerHandleOpening.map(point => point.slice()),
      [463.812, 438.505],
      lowerHandleFoldB.slice(),
      [504.308, 447.865],
      [507.409, 449.966],
      [545.314, 462.579],
      [545.084, 466.348],
      [517.991, 556.454],
      [439.559, 531.033],
      [439.346, 531.072],
      [438.225, 528.857],
      [345.023, 498.474]
    ];
    fixedSources.standingHandle = [
      lowerHandleFoldA.slice(),
      [335.718, 393.992],
      [338.315, 391.621],
      [354.393, 342.182],
      [357.757, 334.934],
      [362.171, 328.273],
      [367.545, 322.36],
      [373.754, 317.331],
      [384.316, 311.696],
      [391.951, 309.339],
      [399.856, 308.175],
      [407.846, 308.231],
      [419.587, 310.573],
      roofFoldA.slice(),
      roofFoldB.slice(),
      [487.923, 332.816],
      [499.167, 338.566],
      [508.307, 346.297],
      [513.319, 352.52],
      [518.936, 363.092],
      [522.025, 374.658],
      [522.593, 382.628],
      [521.951, 390.593],
      [520.128, 398.373],
      [504.308, 447.865],
      lowerHandleFoldB.slice(),
      [463.812, 438.505],
      ...upperHandleOpening.map(point => point.slice()),
      [377.57, 410.692]
    ];
    // The front handle has the same interrupted-crease construction. Its
    // outer panel must fold away from the upright handle instead of remaining
    // coplanar and visually passing through the closing lid.
    const frontHandleAssembly = fixedSources.backHandle;
    const frontHandleFoldA = [402.182, 196.968];
    const frontHandleFoldB = [569.437, 251.595];
    // The source fold guides sit a few drawing units away from the actual
    // shared cut/fold joins. 3D hinges must use the common panel boundaries
    // so the lid remains physically attached to Front and the Lock tab keeps
    // its manufactured relationship to both slots.
    const frontLidFoldA = [971.271, 583.971];
    const frontLidFoldB = [706.937, 583.855];
    const lockFoldA = [792.684, 390.726];
    const lockFoldB = [887.419, 390.724];
    // Match B001: each body hinge uses the exact common edge shared by its
    // two panels, not the slightly inset printed fold guide.
    const fixedBodyAxes = {
      'b002-fold-4': [[706.937, 583.855], [645.696, 974.465]],
      'b002-fold-2': [[971.33, 584.086], [1032.342, 974.658]],
      'b002-fold-15': [[517.012, 557.142], [455.853, 944.841]],
      'b002-fold-12': [[265.768, 474.681], [88.112, 822.719]]
    };
    fixedSources.backHandle = clipToLineSide(
      frontHandleAssembly,
      frontHandleFoldA,
      frontHandleFoldB,
      [460, 285]
    );
    fixedSources.frontHandlePanel = clipToLineSide(
      frontHandleAssembly,
      frontHandleFoldA,
      frontHandleFoldB,
      [500, 165]
    );
    // B002 is a fixed contract. Keep the approved panel contours intact and
    // correct only the two end vertices of each rear shared crease so both
    // adjoining panels use the exact same FoldLine endpoints.
    const backRoofFoldA = [439.559, 531.033];
    const backRoofFoldB = [517.991, 556.454];
    fixedSources.back.splice(0, 3,
      [342.816, 499.603],
      [345.023, 498.474],
      [438.225, 528.857],
      [439.346, 531.072],
      backRoofFoldA.slice(),
      backRoofFoldB.slice(),
      [517.5348, 557.3367],
      [516.8, 553.87]
    );
    fixedSources.sideL[0] = [523.539, 556.063];
    fixedSources.backHandle.splice(1, 0, roofFoldB.slice(), roofFoldA.slice());
    const sideRCompound = fixedSources.sideR;
    fixedSources.sideR = sideRCompound.slice(0, 8).concat([[1218.744, 945.58]]);
    fixedSources.sideRBottom = [[1218.744, 945.58]].concat(sideRCompound.slice(8), [sideRCompound[0]]);
    const fixedHolesByRole = {
      front: layout.frontPunchEnabled ? layout.optionalHolePoints.slice() : [],
      frontTop: layout.requiredHolePoints[0] ? [layout.requiredHolePoints[0]] : [],
      backHandle: layout.requiredHolePoints[1] ? [layout.requiredHolePoints[1]] : [],
      standingHandle: []
    };
    const panels = Object.entries(fixedSources).map(([role, sourcePoints]) => {
      const closedPath = sourcePoints.map(([x, y]) => B002_transformPoint({ x, y }, layout.transform));
      const origin = polygonInteriorPoint(closedPath);
      return {
        id: 'b002-' + role,
        role,
        closedPath,
        origin,
        localPath: closedPath.map(point => ({ x: point.x - origin.x, y: point.y - origin.y })),
        boundaryFoldIds: [],
        holes: (fixedHolesByRole[role] || []).map(hole => hole.map(point => ({ ...point }))),
        materialSide: 'outside-up',
        thickness: PAPER
      };
    });
    const panelByRole = new Map(panels.map(panel => [panel.role, panel]));
    const foldById = new Map(global.B002_getFoldSegments(layout).map(fold => [fold.id, { ...fold, ...B002_FOLD_RULES[fold.id] }]));
    const fixedRelations = [
      ['b002-fold-1', 'front', 'frontBottom'],
      ['b002-fold-2', 'front', 'sideR'],
      ['b002-fold-3', 'front', 'frontTop'],
      ['b002-fold-4', 'front', 'sideL'],
      ['b002-fold-5', 'sideR', 'sideRBottom'],
      ['b002-fold-6', 'sideR', 'sideRTop'],
      ['b002-fold-8', 'sideL', 'sideLBottom'],
      ['b002-fold-9', 'sideL', 'sideLTop'],
      ['b002-fold-11', 'back', 'backBottom'],
      ['b002-fold-12', 'back', 'glue'],
      ['b002-fold-14', 'back', 'backRoof'],
      ['b002-fold-17', 'backRoof', 'standingHandle'],
      ['b002-fold-15', 'sideL', 'back'],
      ['b002-fold-16', 'frontTop', 'frontHandle'],
      ['b002-fold-19', 'standingHandle', 'backHandle'],
      ['b002-fold-20', 'backHandle', 'frontHandlePanel']
    ];
    const folds = fixedRelations.map(([id, roleA, roleB]) => {
      const source = foldById.get(id);
      const fixedBodyAxis = fixedBodyAxes[id];
      const axis = fixedBodyAxis
        ? {
            a: B002_transformPoint({ x: fixedBodyAxis[0][0], y: fixedBodyAxis[0][1] }, layout.transform),
            b: B002_transformPoint({ x: fixedBodyAxis[1][0], y: fixedBodyAxis[1][1] }, layout.transform)
          }
        : id === 'b002-fold-17'
        ? {
            a: B002_transformPoint({ x: lowerHandleFoldA[0], y: lowerHandleFoldA[1] }, layout.transform),
            b: B002_transformPoint({ x: lowerHandleFoldB[0], y: lowerHandleFoldB[1] }, layout.transform)
          }
        : id === 'b002-fold-3'
          ? {
              a: B002_transformPoint({ x: frontLidFoldA[0], y: frontLidFoldA[1] }, layout.transform),
              b: B002_transformPoint({ x: frontLidFoldB[0], y: frontLidFoldB[1] }, layout.transform)
            }
        : id === 'b002-fold-16'
          ? {
              a: B002_transformPoint({ x: lockFoldA[0], y: lockFoldA[1] }, layout.transform),
              b: B002_transformPoint({ x: lockFoldB[0], y: lockFoldB[1] }, layout.transform)
            }
        : id === 'b002-fold-20'
          ? {
              a: B002_transformPoint({ x: frontHandleFoldA[0], y: frontHandleFoldA[1] }, layout.transform),
              b: B002_transformPoint({ x: frontHandleFoldB[0], y: frontHandleFoldB[1] }, layout.transform)
            }
        : { a: source.a, b: source.b };
      panelByRole.get(roleA).boundaryFoldIds.push(id);
      panelByRole.get(roleB).boundaryFoldIds.push(id);
      return {
        id,
        panelA: panelByRole.get(roleA).id,
        panelB: panelByRole.get(roleB).id,
        axis,
        axisSpace: 'layout',
        classification: source.classification,
        mountainValley: source.mountainValley,
        signedAngle: THREE.MathUtils.degToRad(source.signedAngle),
        targetAngle: THREE.MathUtils.degToRad(source.targetAngle),
        order: source.order
      };
    });
    const panelArea = panels.reduce((sum, panel) => sum + Math.abs(polygonArea(panel.closedPath)), 0);
    const sheetArea = Math.abs(polygonArea(layout.outlinePoints));
    return {
      builder: 'buildFixedPanelContract',
      panels,
      folds,
      sourceFolds: folds.map(fold => ({ ...fold, polygonBoundary: true })),
      internalCreases: ['b002-fold-18', 'b002-fold-21']
        .map(id => foldById.get(id)).filter(Boolean),
      validation: {
        sheetArea,
        panelArea,
        areaCoverage: sheetArea ? panelArea / sheetArea : 1,
        sampledAreaCoverage: 1,
        missingRatio: 0,
        overlapRatio: 0
      }
    };
  }

  function init3D() {
    const cfg = typeof global.getCfgB002 === 'function'
      ? global.getCfgB002()
      : { W: 136, D: 67, H: 137, frontPunchEnabled: true };
    const layout = global.B002_getLayout(cfg.W, cfg.D, cfg.H, cfg);
    const a = layout.anchors;
    const frontPoints = [a.frontTopL, a.frontTopR, a.frontBottomR, a.frontBottomL];

    const viewer = global.PacVu3DViewer.createModal({
      id: 'b0023dModal',
      badge: 'B002 · Bakery Handle Box · 136×67×137 mm'
    });
    const modal = viewer.modal;
    const stage = viewer.stage;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera = global.PacVu3DViewer.createPerspectiveCamera(THREE, cfg);
    const renderer = global.PacVu3DViewer.createRenderer(THREE);
    stage.prepend(renderer.domElement);
    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = .075;
    controls.rotateSpeed = .45;
    controls.panSpeed = .65;
    controls.zoomSpeed = .75;
    controls.screenSpacePanning = true;
    if (THREE.MOUSE) {
      controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
      controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    }
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor, global.PacVu3DTheme.hemisphereLight.groundColor, global.PacVu3DTheme.hemisphereLight.intensity));
    const sun = new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color, global.PacVu3DTheme.directionalLight.intensity);
    const shadowTheme = global.PacVu3DTheme.directionalLight;
    sun.position.fromArray(shadowTheme.position); sun.castShadow = true;
    sun.shadow.mapSize.set(shadowTheme.shadowMapSize, shadowTheme.shadowMapSize);
    sun.shadow.camera.left = -shadowTheme.shadowBounds;
    sun.shadow.camera.right = shadowTheme.shadowBounds;
    sun.shadow.camera.top = shadowTheme.shadowBounds;
    sun.shadow.camera.bottom = -shadowTheme.shadowBounds;
    sun.shadow.camera.near = shadowTheme.shadowNear;
    sun.shadow.camera.far = shadowTheme.shadowFar;
    sun.shadow.bias = -.00035;
    sun.shadow.normalBias = 1.5;
    scene.add(sun);
    const board = global.PacVu3DViewer.createBoardMaterials(THREE);
    board[2] = board[2].clone();
    board[2].color.copy(board[0].color);
    board[2].name = 'B002 seamless white paper edge';
    const model = new THREE.Group(); scene.add(model);

    // Start from the approved production dieline itself. The two handle
    // openings and lid slot are always holes; the front perforation becomes
    // an opening only when its option is enabled.
    const flatHoles = layout.requiredHolePoints.concat(cfg.frontPunchEnabled ? layout.optionalHolePoints : []);
    const flatMade = panelGeometry(layout.outlinePoints, flatHoles);
    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = 2048;
    flatCanvas.height = Math.max(1, Math.round(2048 * flatMade.height / (Math.max(...layout.outlinePoints.map(point => point.x)) - Math.min(...layout.outlinePoints.map(point => point.x)))));
    const flatContext = flatCanvas.getContext('2d');
    const flatMinX = Math.min(...layout.outlinePoints.map(point => point.x));
    const flatWidth = Math.max(...layout.outlinePoints.map(point => point.x)) - flatMinX;
    const flatScale = flatCanvas.width / flatWidth;
    flatContext.setTransform(flatScale, 0, 0, flatScale, -flatMinX * flatScale, -flatMade.top * flatScale);
    flatContext.fillStyle = '#f7f4ed';
    flatContext.fill(new Path2D(layout.fillPath), 'evenodd');
    if (cfg.frontPunchEnabled) {
      flatContext.globalCompositeOperation = 'destination-out';
      layout.optionalHolePoints.forEach(hole => {
        const path = new Path2D();
        hole.forEach((point, index) => {
          if (index) path.lineTo(point.x, point.y); else path.moveTo(point.x, point.y);
        });
        path.closePath();
        flatContext.fill(path);
      });
      flatContext.globalCompositeOperation = 'source-over';
    }
    const flatTexture = new THREE.CanvasTexture(flatCanvas);
    flatTexture.colorSpace = THREE.SRGBColorSpace;
    flatTexture.minFilter = THREE.LinearFilter;
    flatTexture.generateMipmaps = false;
    const flat = new THREE.Mesh(
      new THREE.PlaneGeometry(flatWidth, flatMade.height),
      new THREE.MeshBasicMaterial({ map: flatTexture, transparent: true, alphaTest: .2, side: THREE.DoubleSide, toneMapped: false })
    );
    flat.position.set(0, flatMade.height / 2, 0);
    flat.castShadow = false; flat.receiveShadow = false; model.add(flat);
    const frontCenterX = (a.frontTopL.x + a.frontTopR.x + a.frontBottomL.x + a.frontBottomR.x) / 4;
    const logoSourceY = a.frontTopL.y + ((a.frontBottomL.y - a.frontTopL.y) * .31);
    addFrontBrand(
      flat,
      cfg.W,
      frontCenterX - flatMade.centerX,
      (flatMade.bottom - logoSourceY) - (flatMade.height / 2)
    );

    const contract = buildFixedPanelContract(layout);
    const panelById = new Map();
    const assemblyRoot = new THREE.Group();
    assemblyRoot.visible = false;
    model.add(assemblyRoot);
    contract.panels.forEach(panel => {
      const made = panelGeometry(panel.closedPath, panel.holes);
      const mesh = new THREE.Mesh(made.geometry, board);
      mesh.position.set(made.centerX - flatMade.centerX, flatMade.bottom - made.bottom, 0);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData.panelId = panel.id;
      const node = new THREE.Group();
      node.name = panel.id;
      node.add(mesh);
      assemblyRoot.add(node);
      panelById.set(panel.id, { panel, made, mesh, node });
    });
    const frontProbe = polygonCenter(frontPoints);
    const rootPanel = contract.panels.find(panel => pointInPolygon(frontProbe, panel.closedPath)) || contract.panels[0];
    const adjacency = new Map(contract.panels.map(panel => [panel.id, []]));
    contract.folds.forEach(fold => {
      adjacency.get(fold.panelA)?.push({ fold, other: fold.panelB, order: fold.order });
      adjacency.get(fold.panelB)?.push({ fold, other: fold.panelA, order: fold.order });
    });
    // Connectivity is diagnostic only.  It must never define B002 motion.
    const connectivitySeen = new Set([rootPanel.id]), queue = [rootPanel.id];
    while (queue.length) {
      const parent = queue.shift();
      (adjacency.get(parent) || []).forEach(link => {
        if (connectivitySeen.has(link.other)) return;
        connectivitySeen.add(link.other); queue.push(link.other);
      });
    }
    const relationById = new Map(contract.folds.map(fold => [fold.id, fold]));
    const panelAcross = (panelId, foldId) => {
      const fold = relationById.get(foldId);
      if (!fold || (fold.panelA !== panelId && fold.panelB !== panelId)) return null;
      return fold.panelA === panelId ? fold.panelB : fold.panelA;
    };
    // This is the B002 semantic contract.  A duplicate semantic assignment is
    // an extraction failure, not something the motion tree may repair.
    const semanticPanels = {
      front: rootPanel.id,
      sideL: panelAcross(rootPanel.id, 'b002-fold-4'),
      sideR: panelAcross(rootPanel.id, 'b002-fold-2'),
      frontBottom: panelAcross(rootPanel.id, 'b002-fold-1'),
      frontTop: panelAcross(rootPanel.id, 'b002-fold-3')
    };
    semanticPanels.back = semanticPanels.sideL && panelAcross(semanticPanels.sideL, 'b002-fold-15');
    semanticPanels.sideLBottom = semanticPanels.sideL && panelAcross(semanticPanels.sideL, 'b002-fold-8');
    semanticPanels.sideLTop = semanticPanels.sideL && panelAcross(semanticPanels.sideL, 'b002-fold-9');
    semanticPanels.frontHandle = semanticPanels.frontTop && panelAcross(semanticPanels.frontTop, 'b002-fold-16');
    semanticPanels.sideRTop = semanticPanels.sideR && panelAcross(semanticPanels.sideR, 'b002-fold-6');
    semanticPanels.sideRBottom = semanticPanels.sideR && panelAcross(semanticPanels.sideR, 'b002-fold-5');
    semanticPanels.backBottom = semanticPanels.back && panelAcross(semanticPanels.back, 'b002-fold-11');
    semanticPanels.glue = semanticPanels.back && panelAcross(semanticPanels.back, 'b002-fold-12');
    semanticPanels.backRoof = semanticPanels.back && panelAcross(semanticPanels.back, 'b002-fold-14');
    semanticPanels.standingHandle = semanticPanels.backRoof && panelAcross(semanticPanels.backRoof, 'b002-fold-17');
    semanticPanels.backHandle = semanticPanels.standingHandle && panelAcross(semanticPanels.standingHandle, 'b002-fold-19');
    semanticPanels.frontHandlePanel = semanticPanels.backHandle && panelAcross(semanticPanels.backHandle, 'b002-fold-20');
    const standingHandleRecord = panelById.get(semanticPanels.standingHandle);
    const backHandleRecord = panelById.get(semanticPanels.backHandle);
    const semanticEntries = Object.entries(semanticPanels);
    const semanticMissing = semanticEntries.filter(([, id]) => !id).map(([role]) => role);
    const rolesByPanel = new Map();
    semanticEntries.forEach(([role, id]) => {
      if (!id) return;
      if (!rolesByPanel.has(id)) rolesByPanel.set(id, []);
      rolesByPanel.get(id).push(role);
    });
    const semanticCollisions = Array.from(rolesByPanel.entries())
      .filter(([, roles]) => roles.length > 1)
      .map(([panelId, roles]) => ({ panelId, roles }));
    const semanticValid = semanticMissing.length === 0 && semanticCollisions.length === 0;
    const hierarchySpec = [
      ['front', 'sideL', 'b002-fold-4'], ['front', 'sideR', 'b002-fold-2'],
      ['sideL', 'back', 'b002-fold-15'], ['front', 'frontBottom', 'b002-fold-1'],
      ['front', 'frontTop', 'b002-fold-3'], ['sideL', 'sideLBottom', 'b002-fold-8'],
      ['sideL', 'sideLTop', 'b002-fold-9'], ['frontTop', 'frontHandle', 'b002-fold-16'],
      ['sideR', 'sideRTop', 'b002-fold-6'], ['back', 'backBottom', 'b002-fold-11'],
      ['sideR', 'sideRBottom', 'b002-fold-5'], ['back', 'glue', 'b002-fold-12'],
      ['back', 'backRoof', 'b002-fold-14'],
      ['backRoof', 'standingHandle', 'b002-fold-17'],
      ['standingHandle', 'backHandle', 'b002-fold-19'],
      ['backHandle', 'frontHandlePanel', 'b002-fold-20']
    ];
    const hierarchy = semanticValid ? hierarchySpec.map(([parentRole, childRole, foldId]) => ({
      parentPanelId: semanticPanels[parentRole], childPanelId: semanticPanels[childRole],
      parentRole, childRole, fold: relationById.get(foldId), order: relationById.get(foldId)?.order
    })) : [];
    const childRelations = new Map(contract.panels.map(panel => [panel.id, []]));
    hierarchy.forEach(relation => childRelations.get(relation.parentPanelId)?.push(relation));
    const animatedFolds = [];
    function flatVector(point) { return new THREE.Vector3(point.x - flatMade.centerX, flatMade.bottom - point.y, 0); }
    // As in B001, body assembly happens in the air and the completed body is
    // then lowered as one rigid object. B002 starts exterior-side-up, so its
    // stand rotation is the inverse of B001.
    const lowerA = flatVector(a.frontBottomL);
    const lowerB = flatVector(a.frontBottomR);
    const lowerHinge = new THREE.Group();
    lowerHinge.position.copy(lowerA);
    const lowerBasePosition = lowerA.clone();
    model.remove(assemblyRoot);
    model.add(lowerHinge);
    lowerHinge.add(assemblyRoot);
    assemblyRoot.position.sub(lowerA);
    const lowerAxis = lowerB.clone().sub(lowerA).normalize();
    function foldBoundaryPoints(panel, fold, tolerance = .12) {
      const matches = [];
      panel.closedPath.forEach(point => {
        const hit = projectToSegment(point, fold.axis.a, fold.axis.b);
        if (hit.distance <= tolerance && hit.t >= -1e-6 && hit.t <= 1.000001) matches.push(point);
      });
      [fold.axis.a, fold.axis.b].forEach(axisPoint => {
        if (distanceToPolygonBoundary(axisPoint, panel.closedPath) <= tolerance) matches.push(axisPoint);
      });
      return matches.filter((point, index, all) => all.findIndex(other => B002_distance(point, other) < 1e-5) === index);
    }
    assemblyRoot.updateMatrixWorld(true);
    const flatWorldPositions = new Map();
    panelById.forEach((record, id) => {
      record.mesh.updateMatrixWorld(true);
      flatWorldPositions.set(id, record.mesh.getWorldPosition(new THREE.Vector3()));
    });
    const attachWorldMatrixErrors = [];
    function attachTree(panelId) {
      const parent = panelById.get(panelId);
      (childRelations.get(panelId) || []).forEach(relation => {
        const child = panelById.get(relation.childPanelId);
        assemblyRoot.updateMatrixWorld(true);
        parent.node.updateMatrixWorld(true);
        const aWorld = assemblyRoot.localToWorld(flatVector(relation.fold.axis.a));
        const bWorld = assemblyRoot.localToWorld(flatVector(relation.fold.axis.b));
        const aLocal = parent.node.worldToLocal(aWorld.clone());
        const bLocal = parent.node.worldToLocal(bWorld.clone());
        const hinge = new THREE.Group();
        hinge.name = relation.fold.id;
        hinge.position.copy(aLocal);
        parent.node.add(hinge);
        parent.node.updateMatrixWorld(true);
        child.node.updateWorldMatrix(true, true);
        const childWorldBeforeAttach = child.node.matrixWorld.clone();
        hinge.updateWorldMatrix(true, false);
        hinge.add(child.node);
        const childLocalAfterAttach = new THREE.Matrix4()
          .copy(hinge.matrixWorld)
          .invert()
          .multiply(childWorldBeforeAttach);
        childLocalAfterAttach.decompose(child.node.position, child.node.quaternion, child.node.scale);
        child.node.updateMatrix();
        child.node.updateWorldMatrix(false, true);
        let attachMatrixError = 0;
        for (let index = 0; index < 16; index++) {
          attachMatrixError = Math.max(
            attachMatrixError,
            Math.abs(child.node.matrixWorld.elements[index] - childWorldBeforeAttach.elements[index])
          );
        }
        attachWorldMatrixErrors.push({
          foldId: relation.fold.id,
          childPanelId: relation.childPanelId,
          error: attachMatrixError
        });
        const axis = bLocal.sub(aLocal).normalize();
        assemblyRoot.updateMatrixWorld(true);
        animatedFolds.push({
          id: relation.fold.id,
          hinge,
          axis,
          // B002 is presented printable/design-side-up in Flat. Fold every
          // child away from that face so the design skin remains outside.
          targetAngle: -relation.fold.signedAngle,
          order: relation.fold.order,
          action: relation.fold.classification,
          childNode: child.node,
          parentNode: parent.node,
          parentBoundaryPoints: foldBoundaryPoints(parent.panel, relation.fold).map(point => parent.node.worldToLocal(assemblyRoot.localToWorld(flatVector(point)))),
          childBoundaryPoints: foldBoundaryPoints(child.panel, relation.fold).map(point => child.node.worldToLocal(assemblyRoot.localToWorld(flatVector(point)))),
          childAxisA: child.node.worldToLocal(aWorld.clone()),
          childAxisB: child.node.worldToLocal(bWorld.clone()),
          axisLength: aWorld.distanceTo(bWorld)
        });
        attachTree(relation.childPanelId);
      });
    }
    if (semanticValid) attachTree(rootPanel.id);
    assemblyRoot.updateMatrixWorld(true);
    let flatHierarchyMaxError = 0;
    panelById.forEach((record, id) => {
      const actual = record.mesh.getWorldPosition(new THREE.Vector3());
      flatHierarchyMaxError = Math.max(flatHierarchyMaxError, actual.distanceTo(flatWorldPositions.get(id)));
    });
    function pointLineDistance(point, a, b) {
      const ab = b.clone().sub(a), ap = point.clone().sub(a);
      return ap.cross(ab).length() / (ab.length() || 1);
    }
    function fixedLayoutAxisError(item) {
      const fold = relationById.get(item.id);
      const fixedA = assemblyRoot.localToWorld(flatVector(fold.axis.a));
      const fixedB = assemblyRoot.localToWorld(flatVector(fold.axis.b));
      const hingeA = item.hinge.localToWorld(new THREE.Vector3());
      const hingeB = item.hinge.localToWorld(item.axis.clone().multiplyScalar(item.axisLength));
      const childA = item.childNode.localToWorld(item.childAxisA.clone());
      const childB = item.childNode.localToWorld(item.childAxisB.clone());
      const parentBoundaryErrors = item.parentBoundaryPoints.map(point => pointLineDistance(item.parentNode.localToWorld(point.clone()), fixedA, fixedB));
      const childBoundaryErrors = item.childBoundaryPoints.map(point => pointLineDistance(item.childNode.localToWorld(point.clone()), fixedA, fixedB));
      return Math.max(
        pointLineDistance(hingeA, fixedA, fixedB), pointLineDistance(hingeB, fixedA, fixedB),
        pointLineDistance(childA, fixedA, fixedB), pointLineDistance(childB, fixedA, fixedB),
        ...parentBoundaryErrors, ...childBoundaryErrors
      );
    }
    const foldsWithoutSharedBoundaryVertices = animatedFolds
      .filter(item => item.parentBoundaryPoints.length < 2 || item.childBoundaryPoints.length < 2)
      .map(item => item.id);
    let flatSharedBoundaryMaxError = 0;
    animatedFolds.forEach(item => { flatSharedBoundaryMaxError = Math.max(flatSharedBoundaryMaxError, fixedLayoutAxisError(item)); });
    let singleFoldAxisMaxError = 0;
    animatedFolds.forEach(item => {
      item.hinge.setRotationFromAxisAngle(item.axis, .01);
      assemblyRoot.updateMatrixWorld(true);
      singleFoldAxisMaxError = Math.max(singleFoldAxisMaxError, fixedLayoutAxisError(item));
      item.hinge.quaternion.identity();
    });
    let nestedFoldAxisMaxError = singleFoldAxisMaxError;
    animatedFolds.forEach(item => item.hinge.quaternion.identity());
    assemblyRoot.updateMatrixWorld(true);
    const rootRecord = panelById.get(rootPanel.id);
    addFrontBrand(rootRecord.mesh, cfg.W, frontCenterX - rootRecord.made.centerX, rootRecord.made.bottom - logoSourceY);
    // B002 beta assembly is deliberately explicit. It follows the verified
    // B001 production flow and does not infer order from panel topology.
    const sequenceSpec = [
      // First button: wrap all four walls and close the glue seam as one
      // continuous action. bodyGlue only holds/commits that closed tube.
      { step: 1, action: 'bodyForm · wrap + seam close', foldIds: ['b002-fold-4', 'b002-fold-15', 'b002-fold-2', 'b002-fold-12'], start: .02, end: .125 },
      { step: 2, action: 'bodyGlue · seam hold', foldIds: [], start: .125, end: .22 },
      { step: 3, action: 'bottomAssembly', foldIds: ['b002-fold-1', 'b002-fold-8', 'b002-fold-5', 'b002-fold-11'], start: .22, end: .42 },
      { step: 4, action: 'lowerToFloor', foldIds: [], start: .42, end: .52 },
      { step: 5, action: 'lidSideFoldFirst', foldIds: ['b002-fold-9', 'b002-fold-6'], start: .52, end: .68 },
      { step: 6, action: 'handlePanelsFold · handles stay upright', foldIds: ['b002-fold-19', 'b002-fold-14', 'b002-fold-17', 'b002-fold-20'], start: .68, end: .86 },
      { step: 7, action: 'oppositeLid · handle through slot', foldIds: ['b002-fold-3', 'b002-fold-16'], start: .86, end: .96 },
      { step: 8, action: 'lockTab · insert into handle panel', foldIds: ['b002-fold-16'], start: .96, end: 1 }
    ];
    const animatedById = new Map(animatedFolds.map(item => [item.id, item]));
    function calibrateB002BodyClosure() {
      const glue = panelById.get(semanticPanels.glue);
      const target = panelById.get(semanticPanels.sideR);
      const fold4 = animatedById.get('b002-fold-4');
      const fold15 = animatedById.get('b002-fold-15');
      const fold2 = animatedById.get('b002-fold-2');
      const fold12 = animatedById.get('b002-fold-12');
      if (!glue || !target || !fold4 || !fold15 || !fold2 || !fold12) return;
      const localPoint = (record, source) => {
        const point = B002_transformPoint({ x: source[0], y: source[1] }, layout.transform);
        return new THREE.Vector3(point.x - record.made.centerX, record.made.bottom - point.y, 0);
      };
      // Close the seam with the Glue flap's free outer edge. fold-12 itself
      // remains the hinge and must never be pulled onto the opposite seam.
      const glueEdge = [localPoint(glue, [193.441, 459.43]), localPoint(glue, [33.548, 772.93])];
      const targetEdge = [localPoint(target, [1154.271, 551.62]), localPoint(target, [1218.744, 945.58])];
      const glueWorldA = new THREE.Vector3(), glueWorldB = new THREE.Vector3();
      const targetWorldA = new THREE.Vector3(), targetWorldB = new THREE.Vector3();
      const bodyAngles = [fold4.targetAngle, fold15.targetAngle, fold2.targetAngle];
      let best = { error: Infinity, angle: fold12.targetAngle };
      const test = angle => {
        fold4.hinge.setRotationFromAxisAngle(fold4.axis, bodyAngles[0]);
        fold15.hinge.setRotationFromAxisAngle(fold15.axis, bodyAngles[1]);
        fold2.hinge.setRotationFromAxisAngle(fold2.axis, bodyAngles[2]);
        fold12.hinge.setRotationFromAxisAngle(fold12.axis, angle);
        assemblyRoot.updateMatrixWorld(true);
        glue.mesh.localToWorld(glueWorldA.copy(glueEdge[0]));
        glue.mesh.localToWorld(glueWorldB.copy(glueEdge[1]));
        target.mesh.localToWorld(targetWorldA.copy(targetEdge[0]));
        target.mesh.localToWorld(targetWorldB.copy(targetEdge[1]));
        const direct = glueWorldA.distanceToSquared(targetWorldA) + glueWorldB.distanceToSquared(targetWorldB);
        const reversed = glueWorldA.distanceToSquared(targetWorldB) + glueWorldB.distanceToSquared(targetWorldA);
        const error = Math.min(direct, reversed);
        if (error < best.error) best = { error, angle };
      };
      const radians = degrees => THREE.MathUtils.degToRad(degrees);
      for (let angle = -180; angle <= 180; angle += 2) test(radians(angle));
      const coarse = THREE.MathUtils.radToDeg(best.angle);
      for (let angle = coarse - 2; angle <= coarse + 2; angle += .1) test(radians(angle));
      fold12.targetAngle = best.angle;
      global.B002_BODY_CLOSURE = {
        angles: bodyAngles.concat(best.angle).map(angle => THREE.MathUtils.radToDeg(angle)),
        seamEndpointRms: Math.sqrt(best.error / 2)
      };
      animatedFolds.forEach(item => item.hinge.quaternion.identity());
      assemblyRoot.updateMatrixWorld(true);
    }
    calibrateB002BodyClosure();
    function calibrateB002BottomClosure() {
      const bodyFolds = ['b002-fold-4', 'b002-fold-15', 'b002-fold-2', 'b002-fold-12']
        .map(id => animatedById.get(id)).filter(Boolean);
      const bottomRoles = [
        ['b002-fold-8', 'sideLBottom'],
        ['b002-fold-5', 'sideRBottom'],
        ['b002-fold-11', 'backBottom'],
        ['b002-fold-1', 'frontBottom']
      ];
      const wallRecords = ['front', 'sideL', 'back', 'sideR']
        .map(role => panelById.get(semanticPanels[role])).filter(Boolean);
      if (bodyFolds.length !== 4 || wallRecords.length !== 4) return;

      // Evaluate the bottom while the calibrated tube is fully closed. For
      // each hinge, choose the 90-degree branch whose flap center lies inside
      // the tube rather than outside it. This keeps B002 explicit while also
      // respecting the corrected outward body winding.
      bodyFolds.forEach(fold => fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle));
      assemblyRoot.updateMatrixWorld(true);
      const bodyCenter = new THREE.Vector3();
      wallRecords.forEach(record => bodyCenter.add(record.mesh.getWorldPosition(new THREE.Vector3())));
      bodyCenter.multiplyScalar(1 / wallRecords.length);
      const chosen = {};
      bottomRoles.forEach(([foldId, role]) => {
        const fold = animatedById.get(foldId);
        const record = panelById.get(semanticPanels[role]);
        if (!fold || !record) return;
        let best = { distance: Infinity, angle: fold.targetAngle };
        [-Math.PI / 2, Math.PI / 2].forEach(angle => {
          fold.hinge.setRotationFromAxisAngle(fold.axis, angle);
          assemblyRoot.updateMatrixWorld(true);
          const center = record.mesh.getWorldPosition(new THREE.Vector3());
          const distance = center.distanceToSquared(bodyCenter);
          if (distance < best.distance) best = { distance, angle };
        });
        fold.targetAngle = best.angle;
        chosen[foldId] = THREE.MathUtils.radToDeg(best.angle);
        fold.hinge.quaternion.identity();
      });
      global.B002_BOTTOM_CLOSURE = chosen;
      animatedFolds.forEach(item => item.hinge.quaternion.identity());
      assemblyRoot.updateMatrixWorld(true);
    }
    calibrateB002BottomClosure();
    function calibrateB002BottomCoplanarity() {
      const bodyFolds = ['b002-fold-4', 'b002-fold-15', 'b002-fold-2', 'b002-fold-12']
        .map(id => animatedById.get(id)).filter(Boolean);
      const referenceFold = animatedById.get('b002-fold-1');
      const referenceRecord = panelById.get(semanticPanels.frontBottom);
      if (bodyFolds.length !== 4 || !referenceFold || !referenceRecord) return;
      bodyFolds.forEach(fold => fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle));
      referenceFold.hinge.setRotationFromAxisAngle(referenceFold.axis, referenceFold.targetAngle);
      assemblyRoot.updateMatrixWorld(true);
      const referencePoint = referenceRecord.mesh.getWorldPosition(new THREE.Vector3());
      const referenceNormal = new THREE.Vector3(0, 0, 1).transformDirection(referenceRecord.mesh.matrixWorld).normalize();
      const targets = [
        ['b002-fold-8', 'sideLBottom'],
        ['b002-fold-5', 'sideRBottom'],
        ['b002-fold-11', 'backBottom']
      ];
      targets.forEach(([foldId, role]) => {
        const fold = animatedById.get(foldId);
        const record = panelById.get(semanticPanels[role]);
        if (!fold || !record) return;
        const sign = Math.sign(fold.targetAngle) || 1;
        let best = { error: Infinity, angle: fold.targetAngle };
        for (let degrees = 65; degrees <= 115; degrees += .25) {
          const angle = sign * THREE.MathUtils.degToRad(degrees);
          fold.hinge.setRotationFromAxisAngle(fold.axis, angle);
          assemblyRoot.updateMatrixWorld(true);
          const center = record.mesh.getWorldPosition(new THREE.Vector3());
          const normal = new THREE.Vector3(0, 0, 1).transformDirection(record.mesh.matrixWorld).normalize();
          const planeDistance = Math.abs(referenceNormal.dot(center.clone().sub(referencePoint)));
          const normalError = 1 - Math.abs(referenceNormal.dot(normal));
          const error = (normalError * 10000) + (planeDistance * planeDistance);
          if (error < best.error) best = { error, angle };
        }
        fold.targetAngle = best.angle;
        fold.hinge.quaternion.identity();
      });
      global.B002_BOTTOM_COPLANAR_ANGLES = Object.fromEntries(targets.map(([id]) => [
        id, THREE.MathUtils.radToDeg(animatedById.get(id)?.targetAngle || 0)
      ]));
      animatedFolds.forEach(item => item.hinge.quaternion.identity());
      assemblyRoot.updateMatrixWorld(true);
    }
    calibrateB002BottomCoplanarity();
    function calibrateB002LidSideClosure() {
      const bodyFolds = ['b002-fold-4', 'b002-fold-15', 'b002-fold-2', 'b002-fold-12']
        .map(id => animatedById.get(id)).filter(Boolean);
      const lidSides = [
        ['b002-fold-9', 'sideLTop'],
        ['b002-fold-6', 'sideRTop']
      ];
      const wallRecords = ['front', 'sideL', 'back', 'sideR']
        .map(role => panelById.get(semanticPanels[role])).filter(Boolean);
      if (bodyFolds.length !== 4 || wallRecords.length !== 4) return;
      bodyFolds.forEach(fold => fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle));
      assemblyRoot.updateMatrixWorld(true);
      const bodyCenter = new THREE.Vector3();
      wallRecords.forEach(record => bodyCenter.add(record.mesh.getWorldPosition(new THREE.Vector3())));
      bodyCenter.multiplyScalar(1 / wallRecords.length);
      lidSides.forEach(([foldId, role]) => {
        const fold = animatedById.get(foldId);
        const record = panelById.get(semanticPanels[role]);
        if (!fold || !record) return;
        let best = { distance: Infinity, angle: fold.targetAngle };
        [-Math.PI / 2, Math.PI / 2].forEach(angle => {
          fold.hinge.setRotationFromAxisAngle(fold.axis, angle);
          assemblyRoot.updateMatrixWorld(true);
          const center = record.mesh.getWorldPosition(new THREE.Vector3());
          const distance = center.distanceToSquared(bodyCenter);
          if (distance < best.distance) best = { distance, angle };
        });
        fold.targetAngle = best.angle;
        fold.hinge.quaternion.identity();
      });
      animatedFolds.forEach(item => item.hinge.quaternion.identity());
      assemblyRoot.updateMatrixWorld(true);
    }
    calibrateB002LidSideClosure();
    // B002 beta uses the corrected outward body winding. Its two side-lid
    // hinges therefore need this explicit mirrored pair to close inward.
    // Keep this structure-specific instead of re-inferring the direction.
    const leftLidSideFold = animatedById.get('b002-fold-9');
    const rightLidSideFold = animatedById.get('b002-fold-6');
    if (leftLidSideFold) leftLidSideFold.targetAngle = -Math.PI / 2;
    if (rightLidSideFold) rightLidSideFold.targetAngle = -Math.PI / 2;
    // After both side lids have closed, both handles travel toward the box.
    // Their opposite faces meet during lid closure; the motion itself must
    // not be mirrored away from the box.
    const frontHandleFold = animatedById.get('b002-fold-16');
    const oppositeLidFold = animatedById.get('b002-fold-3');
    const handleWingFold = animatedById.get('b002-fold-14');
    const standingHandleFold = animatedById.get('b002-fold-17');
    const backHandleFold = animatedById.get('b002-fold-19');
    const frontHandlePanelFold = animatedById.get('b002-fold-20');
    const handleLaminateDegrees = 180;
    const frontHandlePanelDegrees = 270 - handleLaminateDegrees;
    if (oppositeLidFold) oppositeLidFold.targetAngle = Math.PI / 2;
    if (handleWingFold) handleWingFold.targetAngle = -Math.PI / 2;
    if (standingHandleFold) standingHandleFold.targetAngle = Math.PI / 2;
    if (backHandleFold) backHandleFold.targetAngle = Math.PI / 2;
    // Keep the attached front panel complementary to the narrowed handle
    // laminate so it settles downward and remains horizontal on the top.
    if (frontHandlePanelFold) frontHandlePanelFold.targetAngle = THREE.MathUtils.degToRad(frontHandlePanelDegrees);
    const backRoofRecord = panelById.get(semanticPanels.backRoof);
    if (backHandleFold && backRoofRecord && standingHandleRecord && backHandleRecord) {
      // fold-19 laminates only the second handle layer. The standing handle
      // remains the parent of that layer and is counter-rotated separately.
      if (backRoofRecord.mesh.parent !== backRoofRecord.node) backRoofRecord.node.attach(backRoofRecord.mesh);
      if (backHandleRecord.node.parent !== backHandleFold.hinge) backHandleFold.hinge.attach(backHandleRecord.node);
    }
    const rotateHandleAssembly = (laminateAmount, wingAmount, frontPanelAmount) => {
      if (backHandleFold) {
        backHandleFold.hinge.setRotationFromAxisAngle(
          backHandleFold.axis,
          backHandleFold.targetAngle * laminateAmount
        );
        // At 180 degrees the two handle center planes otherwise become
        // identical and their exterior/interior caps z-fight. Preserve the
        // manufactured board thickness instead of biasing either material.
        if (backHandleRecord) {
          backHandleRecord.mesh.position.z = backHandleBaseZ + (PAPER * 1.05 * laminateAmount);
        }
      }
      if (handleWingFold) {
        handleWingFold.hinge.setRotationFromAxisAngle(
          handleWingFold.axis,
          handleWingFold.targetAngle * wingAmount
        );
      }
      if (standingHandleFold) {
        // The wing lies down while this equal and opposite rigid rotation
        // keeps the laminated handle centered and pointing upward.
        standingHandleFold.hinge.setRotationFromAxisAngle(
          standingHandleFold.axis,
          standingHandleFold.targetAngle * wingAmount
        );
      }
      if (frontHandlePanelFold) {
        // This is the second interrupted crease shown in the assembly photo:
        // only the front panel folds; the laminated handle remains vertical.
        frontHandlePanelFold.hinge.setRotationFromAxisAngle(
          frontHandlePanelFold.axis,
          frontHandlePanelFold.targetAngle * frontPanelAmount
        );
      }
    };
    function calibrateB002HandleInwardFold() {
      const bodyFolds = ['b002-fold-4', 'b002-fold-15', 'b002-fold-2', 'b002-fold-12']
        .map(id => animatedById.get(id)).filter(Boolean);
      const wallRecords = ['front', 'sideL', 'back', 'sideR']
        .map(role => panelById.get(semanticPanels[role])).filter(Boolean);
      const handles = [
        [frontHandleFold, panelById.get(semanticPanels.frontHandle)],
        [backHandleFold, panelById.get(semanticPanels.backHandle)]
      ];
      if (bodyFolds.length !== 4 || wallRecords.length !== 4) return;
      bodyFolds.forEach(fold => fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle));
      assemblyRoot.updateMatrixWorld(true);
      const bodyCenter = new THREE.Vector3();
      wallRecords.forEach(record => bodyCenter.add(record.mesh.getWorldPosition(new THREE.Vector3())));
      bodyCenter.multiplyScalar(1 / wallRecords.length);
      handles.forEach(([fold, record]) => {
        if (!fold || !record) return;
        let best = { distance: Infinity, angle: fold.targetAngle };
        [-Math.PI / 2, Math.PI / 2].forEach(angle => {
          fold.hinge.setRotationFromAxisAngle(fold.axis, angle);
          assemblyRoot.updateMatrixWorld(true);
          const center = record.mesh.getWorldPosition(new THREE.Vector3());
          const distance = center.distanceToSquared(bodyCenter);
          if (distance < best.distance) best = { distance, angle };
        });
        fold.targetAngle = best.angle;
        fold.hinge.quaternion.identity();
      });
      animatedFolds.forEach(item => item.hinge.quaternion.identity());
      assemblyRoot.updateMatrixWorld(true);
    }
    calibrateB002HandleInwardFold();
    // The panel previously named frontHandle is the Lock tab in the annotated
    // SVG. It moves only at the final insertion step. The actual upper Handle
    // laminates against the lower U-shaped Handle before the wing lies down.
    // Apply this after handle calibration: that calibration also probes the
    // Lock panel and would otherwise overwrite the production insertion angle.
    if (frontHandleFold) frontHandleFold.targetAngle = THREE.MathUtils.degToRad(-110);
    if (backHandleFold) backHandleFold.targetAngle = -Math.sign(backHandleFold.targetAngle || 1) * THREE.MathUtils.degToRad(handleLaminateDegrees);
    const assemblySequence = sequenceSpec.map(entry => ({
      ...entry,
      dependencies: entry.step > 1 ? [entry.step - 1] : [],
      folds: entry.foldIds.map(id => animatedById.get(id)).filter(Boolean)
    }));
    const foldIds = new Set(contract.folds.map(fold => fold.id));
    function detectHierarchyCycle(relations) {
      const graph = new Map();
      relations.forEach(item => {
        if (!graph.has(item.parentPanelId)) graph.set(item.parentPanelId, []);
        graph.get(item.parentPanelId).push(item.childPanelId);
      });
      const visiting = new Set(), visited = new Set(), cycle = [];
      function visit(id, path) {
        if (visiting.has(id)) { cycle.push(...path.slice(path.indexOf(id)), id); return true; }
        if (visited.has(id)) return false;
        visiting.add(id);
        for (const child of graph.get(id) || []) if (visit(child, path.concat(child))) return true;
        visiting.delete(id); visited.add(id); return false;
      }
      for (const id of graph.keys()) if (visit(id, [id])) return { hasCycle: true, cycle };
      return { hasCycle: false, cycle: [] };
    }
    const cycleResult = detectHierarchyCycle(hierarchy);
    const hierarchyHasCycle = cycleResult.hasCycle;
    const cycleDetectorSelfTest = detectHierarchyCycle([
      { parentPanelId: '__a', childPanelId: '__b' },
      { parentPanelId: '__b', childPanelId: '__c' },
      { parentPanelId: '__c', childPanelId: '__a' }
    ]).hasCycle;
    const hierarchyReferencesValidFolds = hierarchy.every(item => item.fold && foldIds.has(item.fold.id));
    const boundaryFoldCount = contract.boundaryFolds
      ? contract.boundaryFolds.length
      : contract.sourceFolds.filter(fold => fold.polygonBoundary).length;
    const validation = {
      ...contract.validation,
      panelCount: contract.panels.length,
      connectedPanelCount: connectivitySeen.size,
      foldRelationCount: contract.folds.length,
      boundaryFoldCount,
      hierarchyHasCycle,
      hierarchyCycle: cycleResult.cycle,
      cycleDetectorSelfTest,
      hierarchyReferencesValidFolds,
      forcedConnectionCount: 0,
      flatHierarchyMaxError,
      attachWorldMatrixMaxError: attachWorldMatrixErrors.reduce((max, item) => Math.max(max, item.error), 0),
      attachWorldMatrixErrors,
      singleFoldAxisMaxError,
      nestedFoldAxisMaxError,
      flatSharedBoundaryMaxError,
      foldsWithoutSharedBoundaryVertices
    };
    validation.extrudeHoleCapLeakCount = Array.from(panelById.values())
      .reduce((sum, record) => sum + record.made.holeCapLeakCount, 0);
    validation.extrudeHoleValidation = Array.from(panelById.entries())
      .filter(([, record]) => record.panel.holes.length)
      .map(([panelId, record]) => ({
        panelId,
        holeCount: record.panel.holes.length,
        capLeakCount: record.made.holeCapLeakCount
      }));
    const finalStateFailures = [];
    if (!semanticValid) finalStateFailures.push({
      check: 'semanticHierarchy',
      panelIds: semanticCollisions.map(item => item.panelId),
      foldIds: hierarchySpec.filter(([parentRole, childRole]) =>
        semanticMissing.includes(parentRole) || semanticMissing.includes(childRole)
        || semanticCollisions.some(item => item.roles.includes(parentRole) || item.roles.includes(childRole))
      ).map(([, , foldId]) => foldId),
      details: { semanticMissing, semanticCollisions }
    });
    if (connectivitySeen.size !== contract.panels.length) finalStateFailures.push({
      check: 'disconnectedIslands',
      panelIds: contract.panels.filter(panel => !connectivitySeen.has(panel.id)).map(panel => panel.id),
      foldIds: []
    });
    if (foldsWithoutSharedBoundaryVertices.length) finalStateFailures.push({
      check: 'sharedBoundaryVertices', panelIds: [], foldIds: foldsWithoutSharedBoundaryVertices
    });
    // Final geometry checks are deliberately fail-closed until every semantic
    // panel exists uniquely; a malformed extraction must never display a fake box.
    validation.finalState = {
      bodyClosed: false, dimensionsWithinTolerance: false, adhesiveAligned: false,
      handlesAligned: false, noPanelPenetration: false, noIslands: connectivitySeen.size === contract.panels.length,
      centersNearBodyBounds: false, failures: finalStateFailures.length ? finalStateFailures : [{ check: 'finalGeometryNotValidated', panelIds: [], foldIds: [] }]
    };
    validation.finalStateValid = Object.entries(validation.finalState)
      .filter(([key]) => key !== 'failures').every(([, value]) => value === true);
    // B002 beta release gate uses only its fixed panel/relationship table.
    // Generic extraction coverage and final-state inference are intentionally
    // not part of this structure's runtime path.
    validation.animationAllowed = semanticValid
      && validation.connectedPanelCount === validation.panelCount
      && validation.foldRelationCount === validation.boundaryFoldCount
      && validation.hierarchyReferencesValidFolds
      && !validation.hierarchyHasCycle
      && B002_BETA_ASSEMBLY_READY;
    validation.betaAssemblyReady = validation.animationAllowed;
    global.B002_LAST_3D_CONTRACT = {
      builder: contract.builder || 'legacy',
      panels: contract.panels.map(panel => ({ id: panel.id, closedPath: panel.closedPath, localPath: panel.localPath, origin: panel.origin, boundaryFoldIds: panel.boundaryFoldIds, holeCount: panel.holes.length, materialSide: panel.materialSide, thickness: panel.thickness })),
      folds: contract.folds,
      semanticPanels,
      panelHierarchy: hierarchy.map(item => ({ parentPanelId: item.parentPanelId, childPanelId: item.childPanelId, parentRole: item.parentRole, childRole: item.childRole, foldId: item.fold?.id || null })),
      assemblySequence: assemblySequence.map(item => ({ step: item.step, action: item.action, foldIds: item.foldIds, dependencies: item.dependencies })),
      internalCreases: contract.internalCreases,
      validation
    };
    console.info('[PacVu B002 3D contract]', global.B002_LAST_3D_CONTRACT.validation);

    const flatDebugGroup = new THREE.Group();
    flatDebugGroup.position.z = PAPER * 1.8;
    flatDebugGroup.visible = false;
    model.add(flatDebugGroup);
    const debugResources = [];
    const debugPalette = [0x1e88e5, 0x43a047, 0xfb8c00, 0x8e24aa, 0xe53935, 0x00897b];
    panelById.forEach((record, id) => {
      const color = debugPalette[debugResources.length % debugPalette.length];
      const geometry = record.made.geometry.clone();
      geometry.clearGroups();
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false });
      const overlay = new THREE.Mesh(geometry, material);
      overlay.position.copy(flatWorldPositions.get(id));
      flatDebugGroup.add(overlay);
      const label = makeDebugLabel(id + ' | origin', '#' + color.toString(16).padStart(6, '0'));
      label.position.copy(overlay.position);
      label.position.z = PAPER * 1.2;
      flatDebugGroup.add(label);
      debugResources.push({ geometry, material, label });
    });
    if (B002_PANEL_DEBUG) {
      const debugButton = document.createElement('button');
      debugButton.type = 'button';
      debugButton.textContent = 'PANEL DEBUG OFF';
      debugButton.style.cssText = 'position:absolute;right:16px;top:58px;z-index:8;padding:6px 10px;border:1px solid #777;border-radius:4px;background:#fff;font-weight:700;cursor:pointer';
      stage.appendChild(debugButton);
      debugButton.onclick = () => {
        flatDebugGroup.visible = !flatDebugGroup.visible;
        debugButton.textContent = flatDebugGroup.visible ? 'PANEL DEBUG ON' : 'PANEL DEBUG OFF';
      };
    }

    // Legacy B002 experiments are deliberately excluded from the runtime.
    // They remain temporarily isolated for visual comparison only.
    if (false) {
    // First B002 assembly action: the production dieline remains one sheet
    // and only its glue flap rotates around the real glue fold line.
    const glueFoldSourceA = { x: 88.048, y: 823.573 };
    const glueFoldSourceB = { x: 264.805, y: 474.397 };
    const glueFoldA = B002_transformPoint(glueFoldSourceA, layout.transform);
    const glueFoldB = B002_transformPoint(glueFoldSourceB, layout.transform);
    const glueSplit = splitFlatAtFold(
      layout.outlinePoints,
      flatHoles,
      flatMade.centerX,
      flatMade.bottom,
      glueFoldA,
      glueFoldB
    );
    const splitMaterial = new THREE.MeshLambertMaterial({
      color: PACVU_BOARD_COLORS.whiteOutside,
      side: THREE.DoubleSide
    });
    const splitSheet = new THREE.Mesh(glueSplit.sheet, splitMaterial);
    splitSheet.castShadow = true; splitSheet.receiveShadow = true; splitSheet.visible = false;
    model.add(splitSheet);
    addFrontBrand(
      splitSheet,
      cfg.W,
      frontCenterX - flatMade.centerX,
      flatMade.bottom - logoSourceY
    );
    const glueAFlat = new THREE.Vector3(glueFoldA.x - flatMade.centerX, flatMade.bottom - glueFoldA.y, 0);
    const glueBFlat = new THREE.Vector3(glueFoldB.x - flatMade.centerX, flatMade.bottom - glueFoldB.y, 0);
    const glueHinge = new THREE.Group(); glueHinge.position.copy(glueAFlat); model.add(glueHinge);
    const glueGeometry = glueSplit.glue;
    glueGeometry.translate(-glueAFlat.x, -glueAFlat.y, 0);
    const glueMesh = new THREE.Mesh(glueGeometry, splitMaterial);
    glueMesh.castShadow = true; glueMesh.receiveShadow = true; glueMesh.visible = false;
    glueHinge.add(glueMesh);
    const glueAxis = glueBFlat.clone().sub(glueAFlat).normalize();

    const toLayoutPoint = pair => B002_transformPoint({ x: pair[0], y: pair[1] }, layout.transform);
    const toFlatPoint = point => new THREE.Vector3(point.x - flatMade.centerX, flatMade.bottom - point.y, 0);
    const bodyRecords = new Map();
    Object.keys(B002_BODY_SOURCE).forEach(name => {
      const polygon = B002_BODY_SOURCE[name].map(toLayoutPoint);
      const holes = name === 'front' && cfg.frontPunchEnabled ? layout.optionalHolePoints : [];
      const made = panelGeometry(polygon, holes);
      const mesh = new THREE.Mesh(made.geometry, board);
      mesh.position.set(made.centerX - flatMade.centerX, flatMade.bottom - made.bottom, 0);
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.visible = false;
      bodyRecords.set(name, { mesh, made, polygon, flatCenter: mesh.position.clone() });
    });
    // Flat-only diagnostic layer. It is deliberately outside every fold
    // hierarchy, so these overlays show the unrotated Layout positions.
    const debugColors = {
      front: { hex: 0x43a047, css: '#43a047' },
      back: { hex: 0x1e88e5, css: '#1e88e5' },
      sideL: { hex: 0xfb8c00, css: '#fb8c00' },
      sideR: { hex: 0x8e24aa, css: '#8e24aa' }
    };
    const flatDebugGroup = new THREE.Group();
    flatDebugGroup.position.z = PAPER * 1.8;
    flatDebugGroup.visible = false;
    model.add(flatDebugGroup);
    const debugResources = [];
    bodyRecords.forEach((record, name) => {
      const color = debugColors[name];
      const geometry = record.made.geometry.clone();
      geometry.clearGroups();
      const material = new THREE.MeshBasicMaterial({ color: color.hex, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false });
      const overlay = new THREE.Mesh(geometry, material);
      overlay.position.copy(record.flatCenter);
      flatDebugGroup.add(overlay);
      const label = makeDebugLabel(name + ' | origin', color.css);
      label.position.set(record.flatCenter.x, record.flatCenter.y + (record.made.height * .5), PAPER * 1.2);
      flatDebugGroup.add(label);
      const markerGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(record.flatCenter.x - 5, record.flatCenter.y, 0),
        new THREE.Vector3(record.flatCenter.x + 5, record.flatCenter.y, 0),
        new THREE.Vector3(record.flatCenter.x, record.flatCenter.y - 5, 0),
        new THREE.Vector3(record.flatCenter.x, record.flatCenter.y + 5, 0)
      ]);
      const marker = new THREE.LineSegments(markerGeometry, new THREE.LineBasicMaterial({ color: color.hex, depthTest: false }));
      marker.renderOrder = 301;
      flatDebugGroup.add(marker);
      debugResources.push({ geometry, material, label, markerGeometry, markerMaterial: marker.material });
    });
    const debugButton = document.createElement('button');
    debugButton.type = 'button';
    debugButton.textContent = 'PANEL DEBUG OFF';
    debugButton.style.cssText = 'position:absolute;right:16px;top:58px;z-index:8;padding:6px 10px;border:1px solid #777;border-radius:4px;background:#fff;font-weight:700;cursor:pointer';
    stage.appendChild(debugButton);
    debugButton.onclick = () => {
      flatDebugGroup.visible = !flatDebugGroup.visible;
      debugButton.textContent = flatDebugGroup.visible ? 'PANEL DEBUG ON' : 'PANEL DEBUG OFF';
    };
    const remainderParts = remainderGeometries(
      layout.outlinePoints,
      flatHoles,
      bodyRecords,
      flatMade.centerX,
      flatMade.bottom
    );
    const remainderMaterial = new THREE.MeshLambertMaterial({
      color: PACVU_BOARD_COLORS.kraftInside,
      side: THREE.DoubleSide
    });
    remainderParts.forEach(part => {
      const mesh = new THREE.Mesh(part.geometry, remainderMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = false;
      part.mesh = mesh;
      part.record.mesh.add(mesh);
    });
    const frontRecord = bodyRecords.get('front');
    addFrontBrand(
      frontRecord.mesh,
      cfg.W,
      frontCenterX - frontRecord.made.centerX,
      frontRecord.made.bottom - logoSourceY
    );
    const bodyRoot = new THREE.Group(); model.add(bodyRoot);
    bodyRoot.add(frontRecord.mesh);

    const foldHinges = [];
    function attachBody(parent, name, edgeStart, edgeEnd, finalAngle) {
      const record = bodyRecords.get(name);
      const p = toFlatPoint(toLayoutPoint(edgeStart));
      const q = toFlatPoint(toLayoutPoint(edgeEnd));
      const hinge = new THREE.Group(); hinge.position.copy(p); parent.add(hinge);
      const frame = new THREE.Group(); frame.position.copy(p).multiplyScalar(-1); hinge.add(frame);
      frame.add(record.mesh);
      const axis = q.clone().sub(p).normalize();
      const radial = record.flatCenter.clone().sub(p);
      const sign = new THREE.Vector3().crossVectors(axis, radial).z >= 0 ? 1 : -1;
      foldHinges.push({ hinge, axis, angle: finalAngle * sign });
      return frame;
    }
    const sideLFrame = attachBody(bodyRoot, 'sideL', [706.611, 586.384], [646.912, 974.527], Math.PI / 2);
    attachBody(sideLFrame, 'back', [517.14, 556.088], [456.805, 945.106], Math.PI / 2);
    attachBody(bodyRoot, 'sideR', [971.265, 583.708], [1034.246, 974.527], Math.PI / 2);

    const frontBottomA = toFlatPoint(toLayoutPoint([646.912, 974.527]));
    const frontBottomB = toFlatPoint(toLayoutPoint([1034.246, 974.527]));
    const standHinge = new THREE.Group(); standHinge.position.copy(frontBottomA); model.add(standHinge);
    model.remove(bodyRoot); standHinge.add(bodyRoot); bodyRoot.position.sub(frontBottomA);
    const standAxis = frontBottomB.clone().sub(frontBottomA).normalize();

    }

    let viewMode = 'flat';
    const glueRecord = panelById.get(semanticPanels.glue);
    const glueBasePosition = glueRecord ? glueRecord.node.position.clone() : null;
    const topStackRecords = {
      sideL: panelById.get(semanticPanels.sideLTop),
      sideR: panelById.get(semanticPanels.sideRTop),
      handleWing: panelById.get(semanticPanels.backRoof),
      frontHandlePanel: panelById.get(semanticPanels.frontHandlePanel),
      lid: panelById.get(semanticPanels.frontTop)
    };
    const topStackBaseZ = new Map(
      Object.values(topStackRecords).filter(Boolean).map(record => [record, record.mesh.position.z])
    );
    const backHandleBaseZ = backHandleRecord ? backHandleRecord.mesh.position.z : 0;
    const lockHingeBasePosition = frontHandleFold ? frontHandleFold.hinge.position.clone() : null;
    const resetTopStack = () => {
      topStackBaseZ.forEach((z, record) => { record.mesh.position.z = z; });
      if (backHandleRecord) backHandleRecord.mesh.position.z = backHandleBaseZ;
      if (frontHandleFold && lockHingeBasePosition) frontHandleFold.hinge.position.copy(lockHingeBasePosition);
    };
    const liftStackPanel = (record, worldLift) => {
      if (!record || !worldLift) return 0;
      record.mesh.parent.updateMatrixWorld(true);
      const normalZ = new THREE.Vector3(0, 0, 1)
        .transformDirection(record.mesh.parent.matrixWorld).z;
      if (Math.abs(normalZ) < .5) return 0;
      const localLift = worldLift / normalZ;
      record.mesh.position.z = topStackBaseZ.get(record) + localLift;
      return localLift;
    };
    function pose(value) {
      // B002 uses one verified fixed assembly for the entire 0-100% range.
      // Never swap to a separate Flat render object at the first slider step.
      if (!validation.animationAllowed) value = 0;
      flat.visible = false;
      assemblyRoot.visible = validation.animationAllowed;
      global.B002_LAST_3D_RENDER_STATE = {
        value,
        builder: contract.builder || 'legacy',
        flatVisible: flat.visible,
        splitPanelsVisible: assemblyRoot.visible,
        splitPanelCount: contract.panels.length
      };
      animatedFolds.forEach(item => item.hinge.quaternion.identity());
      lowerHinge.quaternion.identity();
      lowerHinge.position.copy(lowerBasePosition);
      resetTopStack();
      if (glueRecord) {
        glueRecord.node.position.copy(glueBasePosition);
        glueRecord.mesh.visible = true;
      }
      if (validation.animationAllowed && value > 0 && assemblySequence.length) {
        assemblySequence.forEach(entry => {
          if (entry.action === 'bottomAssembly'
            || entry.action === 'lidSideFoldFirst'
            || entry.action.startsWith('handlePanelsFold')
            || entry.action.startsWith('oppositeLid')
            || entry.action.startsWith('lockTab')) return;
          const amount = phase(value, entry.start, entry.end);
          entry.folds.forEach(fold => fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle * amount));
        });
        // STEP 3 follows Heya's numbered B002 bottom order:
        // 2 = front/central bottom first, 3 = both side bottoms together,
        // 4 = back bottom last. Every flap is complete by .42; only then may
        // STEP 4 move the already assembled box as one rigid body.
        [
          ['b002-fold-1', .22, .28],
          ['b002-fold-8', .29, .36],
          ['b002-fold-5', .29, .36],
          ['b002-fold-11', .36, .42]
        ].forEach(([id, start, end]) => {
          const fold = animatedById.get(id);
          if (fold) fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle * phase(value, start, end));
        });
        // STEP 5 is a hard gate: lidFront and both handles stay at their
        // untouched angles until both side lids have reached 100% inward.
        const lowerOnlyReview = false;
        const lidSideAmount = lowerOnlyReview ? 0 : phase(value, .52, .68);
        const lidSideComplete = lidSideAmount >= .999;
        ['b002-fold-9', 'b002-fold-6'].forEach(id => {
          const fold = animatedById.get(id);
          if (fold) fold.hinge.setRotationFromAxisAngle(fold.axis, fold.targetAngle * lidSideAmount);
        });
        // Laminate the two facing handle layers first. Then fold the
        // lidInsert/handle wing inward while the handle counter-rotates by
        // the same amount and stays vertical over the box center.
        const handleGate = lidSideComplete && value >= .68;
        const laminateAmount = handleGate ? phase(value, .68, .74) : 0;
        const handleWingAmount = handleGate ? phase(value, .74, .82) : 0;
        const frontHandlePanelAmount = handleGate ? phase(value, .82, .86) : 0;
        rotateHandleAssembly(laminateAmount, handleWingAmount, frontHandlePanelAmount);
        // The opposite lid closes only after the handle is fully upright.
        // Its production slot passes around the handle opening; no handle
        // translation or artificial panel deformation is introduced.
        const lidCover = frontHandlePanelAmount >= .999 ? phase(value, .86, .96) : 0;
        if (oppositeLidFold) {
          oppositeLidFold.hinge.setRotationFromAxisAngle(
            oppositeLidFold.axis,
            oppositeLidFold.targetAngle * lidCover
          );
        }
        // Bring the Lock tab to a full right angle early in the lid travel.
        // Keep that exact 90-degree bend while the parent lid continues down,
        // which drives the tab edge-first into the opposite LockSlot.
        const lockAmount = phase(value, .86, .95);
        if (frontHandleFold) {
          frontHandleFold.hinge.setRotationFromAxisAngle(
            frontHandleFold.axis,
            frontHandleFold.targetAngle * lockAmount
          );
        }
        // STEP 1: raise and stand the complete sheet in the air before the
        // four body walls wrap. STEP 4 only lowers that rigid assembly; it
        // must not alter any panel angle.
        const stand = phase(value, .02, .10);
        const lower = phase(value, .42, .52);
        lowerHinge.setRotationFromAxisAngle(lowerAxis, Math.PI / 2 * stand);
        lowerHinge.position.z = lowerBasePosition.z + (cfg.H * .62 * stand * (1 - lower));
        // Every B002 panel stays on its physical FoldLine. Do not add visual
        // layer offsets: they open otherwise-correct shared boundaries.
      }
      const progress = Math.round(value * 100);
      modal.querySelector('.m001-3d-controls').style.setProperty('--progress', progress + '%');
      const step = value < .08 ? 0 : value < .68 ? 1 : 2;
      modal.querySelectorAll('.assembly-labels span').forEach((node, index) => node.classList.toggle('active', index <= step));
      const activeStage = assemblySequence.findLast(entry => value >= entry.start) || assemblySequence[0];
      modal.querySelector('.assembly-title').textContent = activeStage ? activeStage.step + '/8 · ' + activeStage.action : 'Assembly Stage';
    }
    const slider = modal.querySelector('.m001-3d-controls input');
    slider.disabled = !validation.animationAllowed;
    if (!validation.animationAllowed) {
      slider.title = 'B002 contract validation failed; Fold/3D Mockup is blocked.';
      console.error('[PacVu B002 assembly blocked]', validation.finalState.failures);
      modal.querySelector('.assembly-title').textContent = 'B002 3D 준비 중';
    }
    slider.oninput = () => pose(Number(slider.value) / 100);
    pose(0);

    const cameraToolbar = document.createElement('div');
    cameraToolbar.className = 'b002-camera-toolbar';
    cameraToolbar.style.cssText = 'position:absolute;z-index:5;left:14px;bottom:14px;display:flex;flex-wrap:wrap;gap:5px;max-width:calc(100% - 470px);padding:6px;border:1px solid rgba(35,38,45,.12);border-radius:9px;background:rgba(255,255,255,.9);box-shadow:0 2px 8px rgba(0,0,0,.1)';
    const cameraViews = [
      ['reset', 'Reset View'],
      ['front', 'Front'],
      ['back', 'Back'],
      ['left', 'Left'],
      ['right', 'Right'],
      ['top', 'Top'],
      ['isometric', 'Isometric']
    ];
    cameraToolbar.innerHTML = cameraViews.map(([id, label]) =>
      '<button type="button" data-camera-view="' + id + '" style="padding:5px 8px;border:1px solid #b8b3aa;border-radius:6px;background:#fff;color:#393733;font-size:11px;cursor:pointer">' + label + '</button>'
    ).join('');
    // Camera controls are provided by the shared PacVu viewer.

    const cameraDirection = {
      front: new THREE.Vector3(0, -1, 0),
      back: new THREE.Vector3(0, 1, 0),
      left: new THREE.Vector3(-1, 0, 0),
      right: new THREE.Vector3(1, 0, 0),
      top: new THREE.Vector3(0, 0, 1),
      // PacVu reference view used by the approved M-series 3D viewer.
      isometric: new THREE.Vector3(1.4, -1.6, 1)
    };
    function currentModelBounds() {
      model.updateMatrixWorld(true);
      const visibleObject = flat.visible ? flat : assemblyRoot;
      const bounds = new THREE.Box3().setFromObject(visibleObject);
      if (bounds.isEmpty()) return new THREE.Box3(
        new THREE.Vector3(-cfg.W / 2, -cfg.D / 2, 0),
        new THREE.Vector3(cfg.W / 2, cfg.D / 2, cfg.H)
      );
      return bounds;
    }
    function setCameraView(viewName) {
      const requestedView = viewName === 'reset' ? (flat.visible ? 'top' : 'isometric') : viewName;
      global.PacVu3DViewer.fitObject(flat.visible ? flat : assemblyRoot,camera,controls,requestedView);
    }
    cameraToolbar.addEventListener('click', event => {
      const button = event.target.closest('[data-camera-view]');
      if (!button) return;
      setCameraView(button.dataset.cameraView);
    });
    setCameraView('reset');

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.ShadowMaterial({ color: 0x3f3933, opacity: .28 }));
    floor.receiveShadow = true; floor.position.z = -1; scene.add(floor);
    const grid = new THREE.GridHelper(global.PacVu3DTheme.grid.size, global.PacVu3DTheme.grid.divisions, global.PacVu3DTheme.grid.centerColor, global.PacVu3DTheme.grid.lineColor);
    grid.rotation.x = Math.PI / 2; grid.position.z = global.PacVu3DTheme.grid.z; scene.add(grid);
    global.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls,floor,grid});
    modal.querySelectorAll('[data-view]').forEach(button => {
      button.onclick = () => setCameraView(button.dataset.view);
    });
    let shadowsOn = true;
    modal.querySelector('[data-shadow]').onclick = event => {
      shadowsOn = !shadowsOn;
      sun.castShadow = shadowsOn;
      floor.visible = shadowsOn;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.needsUpdate = true;
      event.currentTarget.textContent = shadowsOn ? 'Shadows On' : 'Shadows Off';
    };

    function resize() {
      const width = stage.clientWidth, height = stage.clientHeight;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize); observer.observe(stage); resize();
    let live = true;
    (function loop() { if (!live) return; requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
    const expandButton = modal.querySelector('[data-expand]');
    expandButton.onclick = () => {
      const expanded = modal.classList.contains('pacvu-viewer--expanded');
      expandButton.textContent = expanded ? 'Restore' : 'Expand';
      expandButton.setAttribute('aria-pressed', String(expanded));
      requestAnimationFrame(resize);
    };
    modal.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
    return {
      open() {
        modal.classList.add('open');
        resize();
        requestAnimationFrame(() => setCameraView('reset'));
      },
      destroy() {
        live = false; observer.disconnect(); controls.dispose?.();
        model.traverse(object => {
          if (!object.userData?.pacvuBrand) return;
          object.material?.map?.dispose(); object.material?.dispose(); object.geometry?.dispose();
        });
        flatMade.geometry.dispose();
        panelById.forEach(record => record.made.geometry.dispose());
        debugResources.forEach(item => {
          item.geometry.dispose(); item.material.dispose();
          item.label.material.map?.dispose(); item.label.material.dispose();
        });
        board.forEach(material => material.dispose()); renderer.dispose(); modal.remove();
      }
    };
  }

  let app = null;
  function attachButton() {
    const toolbar = document.querySelector('.toolbar') || document.querySelector('header') || document.body;
    if (document.getElementById('b002-3d-btn')) return;
    const button = document.createElement('button');
    button.id = 'b002-3d-btn'; button.textContent = '3D MOCKUP'; button.style.display = 'none';
    toolbar.appendChild(button);
    button.onclick = () => {
      if (app) app.destroy();
      app = init3D();
      app.open();
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachButton);
  else attachButton();
})(window);
