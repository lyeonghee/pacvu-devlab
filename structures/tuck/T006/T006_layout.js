// T006_layout.js - source-anchored 2D geometry; uses the existing T001 SVG helpers.
// The nominal 100 x 40 x 220 mm layout maps the approved SVG without reshaping it.
const T006_SOURCE_GRID = Object.freeze({
  x: Object.freeze([78.932, 193.417, 478.583, 589.45, 872.916, 986.217]),
  y: Object.freeze([302.788, 350.977, 463.232, 1086.854, 1201.114, 1249.054]),
  unitToMm: 25.4 / 72
});

function T006_getLayout(W = 100, D = 40, H = 220) {
  const input = typeof W === 'object' ? W : { W, D, H };
  const spec = T006_getSpec(input);
  if (![spec.W, spec.D, spec.H].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError('T006 dimensions must be positive finite millimetres.');
  }
  const source = T006_SOURCE_GRID;
  const dw = spec.W - spec.base.W;
  const dd = spec.D - spec.base.D;
  const dh = spec.H - spec.base.H;
  const tuckRatio = (source.y[1] - source.y[0]) / (source.y[2] - source.y[1]);
  const sourceX = source.x;
  const sourceY = source.y;
  const targetX = [0, spec.D, spec.D + spec.W, 2 * spec.D + spec.W,
    2 * spec.D + 2 * spec.W, 3 * spec.D + 2 * spec.W];
  const targetY = sourceY.map((y, i) => (y - sourceY[0]) * source.unitToMm +
    [0, tuckRatio * dd, (1 + tuckRatio) * dd,
      (1 + tuckRatio) * dd + dh, (2 + tuckRatio) * dd + dh,
      (2 + 2 * tuckRatio) * dd + dh][i]);
  const mapper = {
    x: value => T001_piecewise(value, sourceX, targetX),
    y: value => T001_piecewise(value, sourceY, targetY),
    point(x, y) {
      return { x: this.x(x), y: this.y(y) };
    }
  };
  const transform = element => T001_transformElement(element, mapper);
  const cutElements = T006_SOURCE_CUT_ELEMENTS.map(transform);
  const foldElements = T006_SOURCE_FOLD_ELEMENTS.map(transform);
  const punchElements = T006_SOURCE_PUNCH_ELEMENTS.map(transform);
  const previewHatchElements = T006_PREVIEW_HATCH_ELEMENTS.map(transform);
  const fillPath = T001_buildCutFillPath(cutElements.slice(1));
  const sourceSize = Math.abs(dw) < 1e-9 && Math.abs(dd) < 1e-9 && Math.abs(dh) < 1e-9;
  let bleedPath;
  let bleedElement;
  if (sourceSize) {
    bleedElement = transform(T006_SOURCE_BLEED_ELEMENT);
    bleedPath = T001_attr(bleedElement, 'd');
  } else {
    const outline = T001_flattenPathD(fillPath);
    const offset = T001_offsetPolygonWithClipper(outline, 3);
    if (!offset || offset.length < 3) throw new Error('T006 3 mm bleed generation failed.');
    bleedPath = T001_polygonToPath(offset);
    bleedElement = '<path d="' + bleedPath + '"/>';
  }
  const cutPoints = cutElements.flatMap(element => T001_flattenPathD(T001_elementToPathD(element)));
  const bleedPoints = T001_flattenPathD(bleedPath);
  const boundsOf = points => {
    const b = T001_polygonBounds(points);
    return { ...b, width: b.maxX - b.minX, height: b.maxY - b.minY };
  };
  const dielineBounds = boundsOf(cutPoints);
  const bleedBounds = boundsOf(bleedPoints);
  const grid = {
    xSideLeft: targetX[0], xBackLeft: targetX[1], xBackRight: targetX[2],
    xSideMid: targetX[3], xFrontRight: targetX[4], xSideRight: targetX[5],
    yTuckTop: targetY[0], yLidFold: targetY[1], yBodyTop: targetY[2],
    yBodyBottom: targetY[3], yBottomFold: targetY[4], yTuckBottom: targetY[5]
  };
  const centerY = (grid.yBodyTop + grid.yBodyBottom) / 2;
  const labels = [
    ['Side(R)', (targetX[0] + targetX[1]) / 2, centerY],
    ['Back', (targetX[1] + targetX[2]) / 2, centerY],
    ['Side(L)', (targetX[2] + targetX[3]) / 2, centerY],
    ['Front', (targetX[3] + targetX[4]) / 2, centerY],
    ['FrontLock', (targetX[4] + targetX[5]) / 2, centerY],
    ['LidTop', (targetX[3] + targetX[4]) / 2, (targetY[1] + targetY[2]) / 2]
  ].map(([name, x, y]) => ({ name, x, y }));
  return {
    spec, mapper, grid, labels, cutElements, foldElements,
    punchElements, perforationElements: punchElements, previewHatchElements,
    bleedElement, bleedPath, previewFillPath: bleedPath, fillPath, dielineBounds, bleedBounds, bounds: dielineBounds
  };
}

