// ============================================================
// R003_spec.js - A-Type RSC Shipping Box 3
// Source SVG base: R003_350x230x220(cutpath,bleedpath,foldingline).svg
// Base size: W 350 / D 230 / H 220
// ============================================================

function R003_getSpec(W, D, H) {
  var base = {
    W: 350,
    D: 230,
    H: 220,
    unitToMm: 25.4 / 72,
    originX: 847.29,
    originY: 173.971,
    sourceGlueL: 745.897,
    sourceBleedL: 838.723,
    sourceFrontR: 1839.416,
    sourceSideLR: 2491.326,
    sourceBackR: 3483.464,
    sourceSideRR: 4135.441,
    sourceBleedR: 4143.920,
    sourceBleedT: 165.468,
    sourceFoldTop: 499.971,
    sourceFoldBot: 1123.831,
    sourceBot: 1449.815,
    sourceBleedB: 1458.066,
    sourceBounds: {
      minX: 745.897,
      minY: 165.468,
      maxX: 4143.920,
      maxY: 1458.066
    }
  };

  var glueW = (base.originX - base.sourceGlueL) * base.unitToMm;
  var targetSideRR = W + D + W + D;
  var targetBot = D + H;

  var xMap = {
    source: [
      base.sourceGlueL,
      base.sourceBleedL,
      base.originX,
      base.sourceFrontR,
      base.sourceSideLR,
      base.sourceBackR,
      base.sourceSideRR,
      base.sourceBleedR
    ],
    target: [
      -glueW,
      -3,
      0,
      W,
      W + D,
      W + D + W,
      targetSideRR,
      targetSideRR + 3
    ]
  };

  var yMap = {
    source: [
      base.sourceBleedT,
      base.originY,
      base.sourceFoldTop,
      base.sourceFoldBot,
      base.sourceBot,
      base.sourceBleedB
    ],
    target: [
      -3,
      0,
      D / 2,
      D / 2 + H,
      targetBot,
      targetBot + 3
    ]
  };

  function mapAxis(value, source, target) {
    var last = source.length - 1;
    var i;

    if (value <= source[0]) {
      return target[0] + (value - source[0]) * ((target[1] - target[0]) / (source[1] - source[0]));
    }

    for (i = 0; i < last; i++) {
      if (value <= source[i + 1]) {
        return target[i] + (value - source[i]) * ((target[i + 1] - target[i]) / (source[i + 1] - source[i]));
      }
    }

    return target[last] + (value - source[last]) * ((target[last] - target[last - 1]) / (source[last] - source[last - 1]));
  }

  function mapX(x) {
    return mapAxis(x, xMap.source, xMap.target);
  }

  function mapY(y) {
    return mapAxis(y, yMap.source, yMap.target);
  }

  var bounds = {
    minX: mapX(base.sourceBounds.minX),
    minY: mapY(base.sourceBounds.minY),
    maxX: mapX(base.sourceBounds.maxX),
    maxY: mapY(base.sourceBounds.maxY)
  };
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;

  return {
    W: W,
    D: D,
    H: H,
    base: base,
    transform: {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0
    },
    mapX: mapX,
    mapY: mapY,
    xMap: xMap,
    yMap: yMap,
    xFrontL: 0,
    xFrontR: W,
    xSideLR: W + D,
    xBackR: W + D + W,
    xSideRR: targetSideRR,
    yTop: 0,
    yFoldTop: D / 2,
    yFoldBot: D / 2 + H,
    yBot: targetBot,
    bounds: bounds
  };
}
