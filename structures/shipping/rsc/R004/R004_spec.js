// ============================================================
// R004_spec.js - A-Type RSC Shipping Box 4 with handle cuts
// Source SVG base: R004_280x220x190_(cutpath,bleedpath, folding line,handle hole).svg
// Base size: W 280 / D 220 / H 190
// ============================================================

function R004_getSpec(W, D, H) {
  var base = {
    W: 280,
    D: 220,
    H: 190,
    unitToMm: 25.4 / 72,
    originX: 605.467,
    originY: 246.5,
    sourceGlueL: 504.074,
    sourceBleedL: 596.963,
    sourceFrontR: 1399.168,
    sourceSideLR: 2022.790,
    sourceBackR: 2816.491,
    sourceSideRR: 3440.113,
    sourceBleedR: 3448.617,
    sourceBleedT: 237.996,
    sourceFoldTop: 558.311,
    sourceFoldBot: 1096.894,
    sourceBot: 1408.705,
    sourceBleedB: 1417.209,
    sourceBounds: {
      minX: 504.074,
      minY: 237.996,
      maxX: 3448.617,
      maxY: 1417.209
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
    handle: {
      width: 75,
      height: 25,
      radius: 10
    },
    bounds: bounds
  };
}
