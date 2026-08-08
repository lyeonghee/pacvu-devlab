// ============================================================
// T003_layout.js - SVG-extracted T003 Bottle Box / left layout data
// Depends on T003_spec.js
// ============================================================

function T003_getLayout(W, D, H) {
  const spec = T003_getSpec({ W, D, H });

  const neckHalfArcElement = spec.useNeckLine
    ? '<line x1="404.065" y1="42.52" x2="472.096" y2="42.52" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>'
    : '<path d="M404.065,41.894c0,18.777,15.239,34.642,34.016,34.642s34.016-15.865,34.016-34.642" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>';

  const cutElements = [
    '<polyline points="1294.285 1216.063 1173.813 1338.803 1119.07 1338.803" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1106.217,1330.602c2.321,4.996,7.345,8.201,12.854,8.201" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1106.217,1330.602l-53.341-114.8c-.268-.584-.801-1.001-1.433-1.121-.632-.12-1.28.072-1.744.518l-14.06,13.493,9.765,20.94-5.669,131.692h-68.882l-41.953-41.953v-.567,7.087l-35.433,35.433h-74.268l-11.343-164.829c-.054-.779-.561-1.456-1.293-1.726-.732-.27-1.558-.084-2.104.473l-121.039,123.562h-54.743" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M615.823,1330.602c2.321,4.996,7.345,8.201,12.854,8.201" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M615.823,1330.602l-53.341-114.8c-.268-.584-.801-1.001-1.433-1.121-.632-.12-1.28.072-1.744.518l-14.06,13.493,9.765,20.94-5.669,131.692h-68.882l-42.52-42.52h.567v7.087l-35.433,35.433h-76.252l-11.339-165.26-56.693-56.693" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="1294.285" y1="1216.063" x2="1294.285" y2="377.008" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1294.285,377.008l-.428-16.553-10.627-11.793-19.971-74.534c-1.659-6.191-7.281-10.505-13.69-10.505" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="1250.419 263.622 1063.916 263.622 1058.155 373.65" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1051.073,373.465c0,1.92,1.531,3.492,3.451,3.542,1.92.05,3.531-1.439,3.631-3.357" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="1051.073 373.465 1051.073 134.646 1025.561 134.646 1025.561 140.598" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1048.522,134.646v-21.26c0-11.735-9.524-21.26-21.26-21.26h-197.575c-11.736,0-21.26,9.524-21.26,21.26v21.26" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="831.388 140.598 831.388 134.646 805.876 134.646 805.876 373.465" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M798.794,373.65c.101,1.918,1.711,3.407,3.631,3.357,1.92-.05,3.451-1.622,3.451-3.542" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M798.794,373.65l-5.761-110.028h-182.534c-6.409,0-12.031,4.314-13.69,10.505l-19.971,74.534-8.504,8.504v19.843h-13.323V56.693c0-7.823-6.35-14.173-14.173-14.173" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="321.152" y1="56.693" x2="321.152" y2="377.008" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M335.325,42.52c-7.824,0-14.173,6.35-14.173,14.173" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="321.152 377.008 315.482 377.008 258.789 392.199 258.789 1159.37" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="540.837" y1="42.52" x2="472.096" y2="42.52" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="404.065" y1="42.52" x2="335.325" y2="42.52" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M489.104,162.992c0-28.165-22.859-51.024-51.024-51.024s-51.024,22.859-51.024,51.024,22.859,51.024,51.024,51.024,51.024-22.859,51.024-51.024" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    neckHalfArcElement
  ];

  const foldElements = [
    '<line x1="1294.285" y1="1216.063" x2="1052.997" y2="1216.063" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1048.798" y1="1216.063" x2="807.777" y2="1216.063" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="803.654" y1="1216.063" x2="562.604" y2="1216.063" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="558.404" y1="1216.063" x2="315.482" y2="1216.063" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1036.531" y1="1230.604" x2="928.333" y2="1338.803" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="546.138" y1="1230.604" x2="437.939" y2="1338.803" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1051.073" y1="373.465" x2="1051.073" y2="1214.646" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="805.876" y1="373.465" x2="805.876" y2="1214.646" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="560.679" y1="377.008" x2="560.679" y2="1214.646" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="315.482" y1="377.008" x2="315.482" y2="1216.063" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1291.734" y1="377.008" x2="1054.616" y2="377.008" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="802.333" y1="377.008" x2="568.333" y2="377.008" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1051.073" y1="375.591" x2="805.876" y2="375.591" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1025.561" y1="137.764" x2="831.388" y2="137.764" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="555.01" y1="377.008" x2="321.152" y2="377.008" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="555.01" y1="283.465" x2="321.152" y2="283.465" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>'
  ];

  const bleedElement = '<path d="M307.785,1214.646l.259,4.198,10.4,170.935h89.831l33.285-33.666,33.406,33.019,81.564.637,5.222-140.321-7.922-18.843,2.111-2.488c1.027-1.21,2.962-.947,3.628.493l48.354,104.455s1.528,2.492,1.848,3.102c3.959,7.542,12.785,11.859,21.302,11.767l55.659-.338,112.864-115.035c1.567-1.597,4.285-.586,4.428,1.647l7.114,154.404,87.41.388,29.177-31.334,4.362-4.666,35.482,34.964h77.827l5.676-138.302-8.525-17.871,3.751-3.76c1.633-1.637,3.857-2.118,4.774.005l46.382,102.564s.661,1.486,1.9,3.479c3.875,6.234,12.376,11.734,19.716,11.798l59.319-.518,125.741-127.248V356.311l-12.396-13.64-19.46-68.547s-6.561-19.165-18.993-19.165h-193.64l.777-124.403h-3.885l-.259-21.755s.12-17.596-15.25-23.145c-1.842-.665-3.802-.939-5.761-.936l-205.134.34s-16.673-.34-24.306,12.827c-1.688,2.912-2.956,8.106-2.939,11.471l.097,19.731-3.499.172-.689,126.906-186.951-2.112s-17.612-2.291-22.014,17.911l-17.871,68.633-9.065,8.288V68.656s.813-6.574-.264-14.106c-1.587-11.092-11.145-19.304-22.351-19.304h-75.802s2.067,31.235-21.928,33.151c-.697.056-1.638.161-2.331.259-4.684.664-27.561,1.16-32.201-33.41h-72.691s-19.843-.19-21.583,15.799l-.667,313.899-6.844,5.415,1.554,844.286Z" fill="none" stroke="#4257a6" stroke-miterlimit="10"/>';

  const labels = [
    { name: 'lidTop', x: 928.5, y: 278.6 },
    { name: 'Glue', x: 285, y: 814 },
    { name: 'Front', x: 438.08, y: 830 },
    { name: 'Side(L)', x: 683.28, y: 830 },
    { name: 'Back', x: 928.47, y: 830 },
    { name: 'Side(R)', x: 1172.68, y: 830 },
    { name: 'Upper-Tuck', x: 928.5, y: 127.8 },
    { name: 'Inner', x: 438.08, y: 244.2 },
    { name: 'bottomLock-A', x: 438.08, y: 1262.7 },
    { name: 'bottomLock(L)', x: 683.28, y: 1262.7 },
    { name: 'bottomLock-B', x: 928.47, y: 1262.7 },
    { name: 'bottomLock(R)', x: 1172.68, y: 1262.7 }
  ];

  return {
    spec,
    cutElements,
    foldElements,
    bleedElement,
    labels,
    bounds: spec.bounds,
    transform: spec.transform
  };
}

// ============================================================
// PacVu Engine override - T002 master rules with T003 source mapping
// ============================================================
const T003_SOURCE_UNIT_TO_MM = 25.4 / 72;
const T003_SOURCE_GRID = Object.freeze({
  xOuterL: 258.789, xFrontL: 315.482, xFrontR: 560.679,
  xSideLR: 805.876, xBackR: 1051.073, xSideRR: 1294.285,
  yTop: 42.52, yUpperTuckTop: 92.126, yLidFold: 137.764, yInnerFold: 283.465,
  yBodyTop: 377.008, yBodyBottom: 1216.063,
  yBottomBend: 1338.803, yBottomMax: 1381.324
});

function T003_piecewise(value, sourceStops, targetStops) {
  let index = 0;
  while (index < sourceStops.length - 2 && value > sourceStops[index + 1]) index += 1;
  const a = sourceStops[index], b = sourceStops[index + 1];
  const ratio = b === a ? 0 : (value - a) / (b - a);
  return targetStops[index] + ratio * (targetStops[index + 1] - targetStops[index]);
}

function T003_createGrid(W, D, H) {
  const s = T003_SOURCE_GRID;
  const depthScale = D / 86.5;
  const sourceMm = value => value * T003_SOURCE_UNIT_TO_MM * depthScale;
  const upperTuckRule = globalThis.PacVuUpperTuckRule.resolve('T003', D);
  const glueWidth = Math.min(25, D * (25 / 81));
  const topDepth = upperTuckRule.depth + D;
  return {
    xOuterL: 0, xFrontL: glueWidth, xFrontR: glueWidth + W,
    xSideLR: glueWidth + W + D, xBackR: glueWidth + W + D + W,
    xSideRR: glueWidth + W + D + W + D,
    yTop: 0,
    yLidFold: upperTuckRule.depth,
    yInnerFold: sourceMm(s.yInnerFold - s.yTop),
    yBodyTop: topDepth,
    yBodyBottom: topDepth + H,
    yBottomBend: topDepth + H + D * 0.5,
    yBottomMax: topDepth + H + sourceMm(s.yBottomMax - s.yBodyBottom),
    glueWidth,
    upperTuckRule
  };
}

function T003_createMapper(grid, W, D, H) {
  const s = T003_SOURCE_GRID;
  const sourceX = [s.xOuterL, s.xFrontL, s.xFrontR, s.xSideLR, s.xBackR, s.xSideRR];
  const targetX = [grid.xOuterL, grid.xFrontL, grid.xFrontR, grid.xSideLR, grid.xBackR, grid.xSideRR];
  function mapX(value, y) {
    if (y <= s.yLidFold && value >= s.xSideLR && value <= s.xBackR) {
      return globalThis.PacVuUpperTuckRule.mapX(
        value, s.xSideLR, s.xBackR, grid.xSideLR, grid.xBackR,
        T003_SOURCE_UNIT_TO_MM, 1
      );
    }
    if (y <= s.yBodyTop && value >= s.xFrontL && value <= s.xFrontR) {
      const targetCenter = (grid.xFrontL + grid.xFrontR) / 2;
      const fixedScale = T003_SOURCE_UNIT_TO_MM;
      const notchHalfWidth = (472.096 - 404.065) * fixedScale / 2;
      const sourceAnchors = [s.xFrontL, 335.325, 404.065, 472.096, 540.837, s.xFrontR];
      const targetAnchors = [
        grid.xFrontL,
        grid.xFrontL + (335.325 - s.xFrontL) * fixedScale,
        targetCenter - notchHalfWidth,
        targetCenter + notchHalfWidth,
        grid.xFrontR - (s.xFrontR - 540.837) * fixedScale,
        grid.xFrontR
      ];
      return T003_piecewise(value, sourceAnchors, targetAnchors);
    }
    return T003_piecewise(value, sourceX, targetX);
  }
  function mapY(value, x) {
    if (Number.isFinite(x) && x >= s.xFrontL && x <= s.xFrontR && value <= s.yInnerFold) {
      const fixedProfileBottom = 76.536;
      const fixedProfileHeight = (fixedProfileBottom - s.yTop) * T003_SOURCE_UNIT_TO_MM;
      if (value <= fixedProfileBottom) return grid.yTop + (value - s.yTop) * T003_SOURCE_UNIT_TO_MM;
      return grid.yTop + fixedProfileHeight + (value - fixedProfileBottom) *
        (grid.yInnerFold - grid.yTop - fixedProfileHeight) / (s.yInnerFold - fixedProfileBottom);
    }
    if (value <= s.yLidFold) {
      const sourceCurveBottom = 113.386;
      const fixedCurveHeight = (sourceCurveBottom - s.yUpperTuckTop) * T003_SOURCE_UNIT_TO_MM;
      if (value <= sourceCurveBottom) {
        return grid.yTop + (value - s.yUpperTuckTop) * T003_SOURCE_UNIT_TO_MM;
      }
      return grid.yTop + fixedCurveHeight + (value - sourceCurveBottom) *
        (grid.yLidFold - grid.yTop - fixedCurveHeight) / (s.yLidFold - sourceCurveBottom);
    }
    if (value <= s.yBodyTop) {
      return grid.yLidFold + (value - s.yLidFold) *
        (grid.yBodyTop - grid.yLidFold) / (s.yBodyTop - s.yLidFold);
    }
    if (value <= s.yBodyBottom) {
      return grid.yBodyTop + (value - s.yBodyTop) * H / (s.yBodyBottom - s.yBodyTop);
    }
    return grid.yBodyBottom + (value - s.yBodyBottom) * (D / 86.5) * T003_SOURCE_UNIT_TO_MM;
  }
  return {
    x(value) { return mapX(value); },
    y(value) { return mapY(value, NaN); },
    point(x, y) { return { x: mapX(x, y), y: mapY(y, x) }; }
  };
}

function T003_sourceFoldElements() {
  return [
    [1294.285,1216.063,1052.997,1216.063], [1048.798,1216.063,807.777,1216.063],
    [803.654,1216.063,562.604,1216.063], [558.404,1216.063,315.482,1216.063],
    [1036.531,1230.604,928.333,1338.803], [546.138,1230.604,437.939,1338.803],
    [1051.073,373.465,1051.073,1214.646], [805.876,373.465,805.876,1214.646],
    [560.679,377.008,560.679,1214.646], [315.482,377.008,315.482,1216.063],
    [1291.734,377.008,1054.616,377.008], [802.333,377.008,568.333,377.008],
    [1051.073,375.591,805.876,375.591], [1025.561,137.764,831.388,137.764],
    [555.01,377.008,321.152,377.008], [555.01,283.465,321.152,283.465]
  ];
}

function T003_validateLayout(layout) {
  const g = layout.grid, s = layout.spec, tolerance = 0.05;
  const checks = [
    ['frontWidth', g.xFrontR - g.xFrontL, s.W], ['backWidth', g.xBackR - g.xSideLR, s.W],
    ['sideLeftWidth', g.xSideLR - g.xFrontR, s.D], ['sideRightWidth', g.xSideRR - g.xBackR, s.D],
    ['bodyHeight', g.yBodyBottom - g.yBodyTop, s.H],
    ['lidTopDepth', g.yBodyTop - g.yLidFold, s.D],
    ['glueWidth', g.glueWidth, Math.min(25, s.D * (25 / 81))],
    ['bottomLockBend', g.yBottomBend - g.yBodyBottom, s.D * 0.5],
    ['bleedWidth', layout.bleedBounds.width - layout.dielineBounds.width, 6],
    ['bleedHeight', layout.bleedBounds.height - layout.dielineBounds.height, 6]
  ];
  const failures = checks.filter(item => Math.abs(item[1] - item[2]) > tolerance)
    .map(item => ({ id: item[0], actual: item[1], expected: item[2] }));
  if (layout.foldElements.length !== 16) failures.push({ id: 'foldCount', actual: layout.foldElements.length, expected: 16 });
  return Object.freeze({ ok: failures.length === 0, checks: Object.freeze(checks), failures: Object.freeze(failures) });
}

// This declaration intentionally replaces the preparation-stage scaler above.
function T003_getLayout(W, D, H) {
  const spec = T003_getSpec({ W, D, H });
  const grid = T003_createGrid(spec.W, spec.D, spec.H);
  spec.upperTuckRule = grid.upperTuckRule;
  const mapper = T003_createMapper(grid, spec.W, spec.D, spec.H);
  const sourcePath = T003_cutFillPath({ spec: { useNeckLine: false } });
  const fillPath = T002_buildRuleCutPath(sourcePath, mapper);
  const reliefWidth = (831.388 - 805.876) * T003_SOURCE_UNIT_TO_MM;
  const reliefTopY = mapper.point(831.388, 134.646).y;
  const reliefLegY = mapper.point(831.388, 140.598).y;
  const upperTuckLeft = [
    { x: grid.xSideLR + reliefWidth, y: reliefLegY },
    { x: grid.xSideLR + reliefWidth, y: reliefTopY },
    { x: grid.xSideLR, y: reliefTopY }
  ];
  const upperTuckRight = [
    { x: grid.xBackR, y: reliefTopY },
    { x: grid.xBackR - reliefWidth, y: reliefTopY },
    { x: grid.xBackR - reliefWidth, y: reliefLegY }
  ];
  const cutElements = [
    '<path d="' + fillPath + '"/>',
    '<polyline points="' + upperTuckLeft.map(point=>point.x+','+point.y).join(' ') + '"/>',
    '<polyline points="' + upperTuckRight.map(point=>point.x+','+point.y).join(' ') + '"/>'
  ];
  const foldElements = T003_sourceFoldElements().map(line => {
    const a = mapper.point(line[0], line[1]), b = mapper.point(line[2], line[3]);
    return T002_lineElement(a.x, a.y, b.x, b.y);
  });
  const cutPoints = T001_flattenPathD(fillPath);
  const rawBounds = T001_polygonBounds(cutPoints);
  const dielineBounds = {
    minX: rawBounds.minX, minY: rawBounds.minY, maxX: rawBounds.maxX, maxY: rawBounds.maxY,
    width: rawBounds.maxX - rawBounds.minX, height: rawBounds.maxY - rawBounds.minY
  };
  const bleedPoints = T001_offsetPolygonWithClipper(cutPoints, 3);
  if (!bleedPoints || !bleedPoints.length) throw new Error('T003 3 mm bleed generation failed.');
  const bleedPath = T001_polygonToPath(bleedPoints);
  const rawBleed = T001_polygonBounds(bleedPoints);
  const bleedBounds = {
    minX: rawBleed.minX, minY: rawBleed.minY, maxX: rawBleed.maxX, maxY: rawBleed.maxY,
    width: rawBleed.maxX - rawBleed.minX, height: rawBleed.maxY - rawBleed.minY
  };
  const labelSources = [
    ['Inner',438.08,244.2], ['lidTop',928.5,278.6], ['Upper-Tuck',928.5,127.8],
    ['Glue',285,814], ['Front',438.08,830], ['Side(L)',683.28,830],
    ['Back',928.47,830], ['Side(R)',1172.68,830],
    ['bottomLock-A',438.08,1262.7], ['bottomLock(L)',683.28,1262.7],
    ['bottomLock-B',928.47,1262.7], ['bottomLock(R)',1172.68,1262.7]
  ];
  const labels = labelSources.map(item => {
    if (item[0] === 'Upper-Tuck') {
      return { name: item[0], x: (grid.xSideLR + grid.xBackR) / 2, y: grid.yLidFold / 2 };
    }
    return { name: item[0], ...mapper.point(item[1], item[2]) };
  });
  const glueTop = mapper.point(258.789,392.199), glueBottom = mapper.point(258.789,1159.37);
  const glueFillPath = `M ${grid.xFrontL} ${grid.yBodyTop} L ${glueTop.x} ${glueTop.y} L ${glueBottom.x} ${glueBottom.y} L ${grid.xFrontL} ${grid.yBodyBottom} Z`;
  const layout = {
    spec, grid, mapper, fillPath, cutElements, foldElements, labels, glueFillPath,
    bleedPath, bleedElement: '<path d="' + bleedPath + '"/>',
    bounds: dielineBounds, dielineBounds, bleedBounds,
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  };
  layout.validation = T003_validateLayout(layout);
  if (!layout.validation.ok) throw new Error('T003 geometry contract failed: ' + JSON.stringify(layout.validation.failures));
  return layout;
}
