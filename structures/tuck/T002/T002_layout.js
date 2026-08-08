// ============================================================
// T002_layout.js - SVG-extracted T002 Bottle Box layout data
// Depends on T002_spec.js
// ============================================================

const T002_SOURCE_UNIT_TO_MM = 25.4 / 72;
const T002_SOURCE_GRID = Object.freeze({
  xOuterL: 319.9, xFrontL: 390.767, xFrontR: 747.932,
  xSideLR: 977.538, xBackR: 1334.703, xSideRR: 1560.058,
  yTop: 301.241, yUpperFold: 378.344, yBodyTop: 601.714,
  yBodyBottom: 1474.784, yBottomBend: 1589.588, yBottomMax: 1660.455
});
const T002_REFERENCE_SIZE = Object.freeze({ W: 126, D: 81, H: 308 });

function T002_isReferenceSize(W, D, H) {
  return Math.abs(W - T002_REFERENCE_SIZE.W) < 0.000001 &&
    Math.abs(D - T002_REFERENCE_SIZE.D) < 0.000001 &&
    Math.abs(H - T002_REFERENCE_SIZE.H) < 0.000001;
}

function T002_createReferenceGrid() {
  const s = T002_SOURCE_GRID;
  const x = value => (value - s.xOuterL) * T002_SOURCE_UNIT_TO_MM;
  const y = value => (value - s.yTop) * T002_SOURCE_UNIT_TO_MM;
  return {
    xOuterL: x(s.xOuterL), xFrontL: x(s.xFrontL), xFrontR: x(s.xFrontR),
    xSideLR: x(s.xSideLR), xBackR: x(s.xBackR), xSideRR: x(s.xSideRR),
    yTop: y(s.yTop), yUpperFold: y(s.yUpperFold), yBodyTop: y(s.yBodyTop),
    yBodyBottom: y(s.yBodyBottom), yBottomBend: y(s.yBottomBend), yBottomMax: y(s.yBottomMax),
    glueWidth: x(s.xFrontL)
  };
}

function T002_createReferenceMapper() {
  const s = T002_SOURCE_GRID;
  return {
    x(value) { return (value - s.xOuterL) * T002_SOURCE_UNIT_TO_MM; },
    y(value) { return (value - s.yTop) * T002_SOURCE_UNIT_TO_MM; },
    point(x, y) { return { x: this.x(x), y: this.y(y) }; }
  };
}

function T002_piecewise(value, sourceStops, targetStops) {
  let index = 0;
  while (index < sourceStops.length - 2 && value > sourceStops[index + 1]) index += 1;
  const sourceA = sourceStops[index], sourceB = sourceStops[index + 1];
  const targetA = targetStops[index], targetB = targetStops[index + 1];
  const ratio = sourceB === sourceA ? 0 : (value - sourceA) / (sourceB - sourceA);
  return targetA + ratio * (targetB - targetA);
}

function T002_createRuleGrid(W, D, H) {
  const source = T002_SOURCE_GRID;
  const glueWidth = Math.min(25, D * (25 / 81));
  const upperTuckRule = globalThis.PacVuUpperTuckRule.resolve('T002', D);
  const upperFoldDepth = upperTuckRule.depth;
  const topDepth = upperFoldDepth + D;
  const bottomMaxDepth = D * ((source.yBottomMax - source.yBodyBottom) / (source.yBottomBend - source.yBodyBottom) * 0.5);
  const grid = {
    xOuterL: 0,
    xFrontL: glueWidth,
    xFrontR: glueWidth + W,
    xSideLR: glueWidth + W + D,
    xBackR: glueWidth + W + D + W,
    xSideRR: glueWidth + W + D + W + D,
    yTop: 0,
    yUpperFold: upperFoldDepth,
    yBodyTop: topDepth,
    yBodyBottom: topDepth + H,
    yBottomBend: topDepth + H + D * 0.5,
    yBottomMax: topDepth + H + bottomMaxDepth,
    glueWidth,
    upperTuckRule
  };
  return grid;
}

function T002_createRuleMapper(grid, W, D, H) {
  const source = T002_SOURCE_GRID;
  const depthScale = D / 81;
  const baseBodyHeight = source.yBodyBottom - source.yBodyTop;

  function featureX(local, sourceWidth, targetWidth, uniform) {
    if (uniform) return local * targetWidth / sourceWidth;
    const ratio = local / sourceWidth;
    // W panels grow through their middle span. Edge features (corner radii,
    // tuck shoulders and lock profiles) retain their D-derived dimensions.
    if (ratio <= 0.5) return local * T002_SOURCE_UNIT_TO_MM * depthScale;
    return targetWidth - (sourceWidth - local) * T002_SOURCE_UNIT_TO_MM * depthScale;
  }

  function mapX(value, y) {
    if (value <= source.xFrontL) {
      return T002_piecewise(value, [source.xOuterL, source.xFrontL], [grid.xOuterL, grid.xFrontL]);
    }
    if (value <= source.xFrontR) {
      if (y <= source.yUpperFold) {
        return globalThis.PacVuUpperTuckRule.mapX(
          value, source.xFrontL, source.xFrontR, grid.xFrontL, grid.xFrontR,
          T002_SOURCE_UNIT_TO_MM, grid.upperTuckRule.profileScale
        );
      }
      if (y > source.yBodyBottom) {
        return grid.xFrontL + (value - source.xFrontL) * W / (source.xFrontR - source.xFrontL);
      }
      return grid.xFrontL + featureX(value - source.xFrontL, source.xFrontR - source.xFrontL, W, false);
    }
    if (value <= source.xSideLR) {
      return grid.xFrontR + featureX(value - source.xFrontR, source.xSideLR - source.xFrontR, D, true);
    }
    if (value <= source.xBackR) {
      if (y > source.yBodyBottom) {
        return grid.xSideLR + (value - source.xSideLR) * W / (source.xBackR - source.xSideLR);
      }
      return grid.xSideLR + featureX(value - source.xSideLR, source.xBackR - source.xSideLR, W, false);
    }
    return grid.xBackR + featureX(value - source.xBackR, source.xSideRR - source.xBackR, D, true);
  }

  function mapY(value) {
    if (value <= source.yUpperFold) {
      return grid.yTop + (value - source.yTop) * T002_SOURCE_UNIT_TO_MM * grid.upperTuckRule.scale;
    }
    if (value <= source.yBodyTop) {
      return grid.yUpperFold + (value - source.yUpperFold) *
        (grid.yBodyTop - grid.yUpperFold) / (source.yBodyTop - source.yUpperFold);
    }
    if (value <= source.yBodyBottom) return grid.yBodyTop + (value - source.yBodyTop) * H / baseBodyHeight;
    return grid.yBodyBottom + (value - source.yBodyBottom) * T002_SOURCE_UNIT_TO_MM * depthScale;
  }
  return {
    x(value) { return mapX(value); },
    y(value) { return mapY(value); },
    point(x, y) { return { x: mapX(x, y), y: this.y(y) }; }
  };
}

function T002_similarityPoint(point, sourceStart, sourceEnd, targetStart, targetEnd) {
  const sourceDx = sourceEnd.x - sourceStart.x, sourceDy = sourceEnd.y - sourceStart.y;
  const targetDx = targetEnd.x - targetStart.x, targetDy = targetEnd.y - targetStart.y;
  const denominator = sourceDx * sourceDx + sourceDy * sourceDy;
  if (denominator < 0.000001) return { x: targetStart.x, y: targetStart.y };
  const real = (targetDx * sourceDx + targetDy * sourceDy) / denominator;
  const imag = (targetDy * sourceDx - targetDx * sourceDy) / denominator;
  const px = point.x - sourceStart.x, py = point.y - sourceStart.y;
  return { x: targetStart.x + real * px - imag * py, y: targetStart.y + imag * px + real * py };
}

function T002_buildRuleCutPath(sourcePath, mapper, grid, D) {
  const parsed = T001_parseAbsolutePath(sourcePath);
  const start = mapper.point(parsed.start.x, parsed.start.y);
  const segments = parsed.segments.map(segment => {
    const from = mapper.point(segment.from.x, segment.from.y);
    const to = mapper.point(segment.to.x, segment.to.y);
    if (segment.type === 'L') return { type: 'L', from, to };
    return {
      type: 'C', from, to,
      c1: T002_similarityPoint(segment.c1, segment.from, segment.to, from, to),
      c2: T002_similarityPoint(segment.c2, segment.from, segment.to, from, to)
    };
  });
  if (grid && Number.isFinite(D)) {
    const source = T002_SOURCE_GRID;
    const sourceBoundaries = [source.xFrontR, source.xSideLR, source.xBackR];
    const targetBoundaries = [grid.xFrontR, grid.xSideLR, grid.xBackR];
    const scale = T002_SOURCE_UNIT_TO_MM * (D / 81);
    const localPoint = (point, sourceX, targetX) => ({
      x: targetX + (point.x - sourceX) * scale,
      y: grid.yBodyBottom + (point.y - source.yBodyBottom) * scale
    });
    for (let index = 0; index < parsed.segments.length - 1; index += 1) {
      const sourceIncoming = parsed.segments[index];
      const sourceOutgoing = parsed.segments[index + 1];
      if (sourceIncoming.type !== 'C' || sourceOutgoing.type !== 'C') continue;
      const boundaryIndex = sourceBoundaries.findIndex(x =>
        Math.abs(sourceIncoming.to.x - x) <= 10 &&
        Math.abs(sourceIncoming.to.y - source.yBodyBottom) <= 10
      );
      if (boundaryIndex < 0) continue;
      const sourceX = sourceBoundaries[boundaryIndex];
      const targetX = targetBoundaries[boundaryIndex];
      const incoming = segments[index];
      const outgoing = segments[index + 1];
      const startPoint = localPoint(sourceIncoming.from, sourceX, targetX);
      const joinPoint = localPoint(sourceIncoming.to, sourceX, targetX);
      const endPoint = localPoint(sourceOutgoing.to, sourceX, targetX);
      if (index > 0) segments[index - 1].to = startPoint;
      incoming.from = startPoint;
      incoming.c1 = localPoint(sourceIncoming.c1, sourceX, targetX);
      incoming.c2 = localPoint(sourceIncoming.c2, sourceX, targetX);
      incoming.to = joinPoint;
      outgoing.from = joinPoint;
      outgoing.c1 = localPoint(sourceOutgoing.c1, sourceX, targetX);
      outgoing.c2 = localPoint(sourceOutgoing.c2, sourceX, targetX);
      outgoing.to = endPoint;
      if (index + 2 < segments.length) segments[index + 2].from = endPoint;
      index += 1;
    }
  }
  return T001_segmentsToD(start, segments);
}

function T002_smoothBottomCubicJoins(pathD, grid) {
  const parsed = T001_parseAbsolutePath(pathD);
  const boundaries = [grid.xFrontR, grid.xSideLR, grid.xBackR];
  for (let index = 0; index < parsed.segments.length - 1; index += 1) {
    const incoming = parsed.segments[index];
    const outgoing = parsed.segments[index + 1];
    if (incoming.type !== 'C' || outgoing.type !== 'C') continue;
    const join = incoming.to;
    const nearBoundary = boundaries.some(x => Math.abs(join.x - x) <= 3);
    if (!nearBoundary || Math.abs(join.y - grid.yBodyBottom) > 3) continue;
    const inX = join.x - incoming.c2.x, inY = join.y - incoming.c2.y;
    const outX = outgoing.c1.x - join.x, outY = outgoing.c1.y - join.y;
    const inLength = Math.hypot(inX, inY), outLength = Math.hypot(outX, outY);
    if (inLength < 0.0001 || outLength < 0.0001) continue;
    let directionX = inX / inLength + outX / outLength;
    let directionY = inY / inLength + outY / outLength;
    const directionLength = Math.hypot(directionX, directionY);
    if (directionLength < 0.0001) continue;
    directionX /= directionLength;
    directionY /= directionLength;
    incoming.c2 = { x: join.x - directionX * inLength, y: join.y - directionY * inLength };
    outgoing.c1 = { x: join.x + directionX * outLength, y: join.y + directionY * outLength };
  }
  for (let index = 0; index < parsed.segments.length - 1; index += 1) {
    const incoming = parsed.segments[index];
    const outgoing = parsed.segments[index + 1];
    if (incoming.type !== 'L' || outgoing.type !== 'L') continue;
    const join = incoming.to;
    const isGlueBottomJoin = Math.abs(outgoing.to.x - grid.xOuterL) < 0.05 &&
      join.x > grid.xFrontL && join.x < grid.xFrontL + Math.max(8, grid.glueWidth) &&
      join.y > grid.yBodyBottom && join.y < grid.yBodyBottom + Math.max(8, grid.glueWidth);
    if (!isGlueBottomJoin) continue;
    const snapped = { x: grid.xFrontL, y: grid.yBodyBottom };
    incoming.to = snapped;
    outgoing.from = snapped;
    break;
  }
  return T001_segmentsToD(parsed.start, parsed.segments);
}

function T002_lineElement(x1, y1, x2, y2) {
  return '<line x1="' + T001_num(x1) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x2) + '" y2="' + T001_num(y2) + '"/>';
}

function T002_validateRuleLayout(layout) {
  const tolerance = 0.05;
  const g = layout.grid, spec = layout.spec;
  const checks = [
    ['frontWidth', g.xFrontR - g.xFrontL, spec.W],
    ['backWidth', g.xBackR - g.xSideLR, spec.W],
    ['sideLeftWidth', g.xSideLR - g.xFrontR, spec.D],
    ['sideRightWidth', g.xSideRR - g.xBackR, layout.templateOverride ? 79.5002361111 : spec.D],
    ['bodyHeight', g.yBodyBottom - g.yBodyTop, spec.H],
    ['bottomLockBend', g.yBottomBend - g.yBodyBottom, spec.D * 0.5],
    ['bleedWidth', layout.bleedBounds.width - layout.dielineBounds.width, 6],
    ['bleedHeight', layout.bleedBounds.height - layout.dielineBounds.height, 6]
  ];
  const failures = checks.filter(check => Math.abs(check[1] - check[2]) > tolerance)
    .map(check => ({ id: check[0], actual: check[1], expected: check[2] }));
  const expectedGlueWidth = Math.min(25, spec.D * (25 / 81));
  if (Math.abs(g.glueWidth - expectedGlueWidth) > tolerance) {
    failures.push({ id: 'glueWidth', actual: g.glueWidth, expected: expectedGlueWidth });
  }
  const expectedFoldCount = 18;
  if (layout.foldElements.length !== expectedFoldCount) failures.push({ id: 'foldCount', actual: layout.foldElements.length, expected: expectedFoldCount });
  const parsed = T001_parseAbsolutePath(layout.fillPath);
  if (!parsed.start || !parsed.end || T001_distance(parsed.start, parsed.end) > tolerance) {
    failures.push({ id: 'cutClosure', actual: parsed.end, expected: parsed.start });
  }
  return Object.freeze({ ok: failures.length === 0, checks: Object.freeze(checks), failures: Object.freeze(failures) });
}

function T002_getLayout(W, D, H) {
  const spec = T002_getSpec({ W, D, H });
  const requestedRule = globalThis.PacVuUpperTuckRule.resolve('T002', spec.D);
  const templateOverride = false;

  const sourceCutElements = [
    '<polyline points="1560.058 1474.784 1449.507 1589.588 1405.284 1589.588" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1387.266,1578.055c3.238,7.022,10.286,11.533,18.019,11.533" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1387.266,1578.055l-47.392-102.761c-.784-1.744-2.391-2.973-4.279-3.274-1.888-.301-3.797.368-5.084,1.782l-11.843,13.008,10.366,22.23-4.954,132.313" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1304.251,1660.454c10.669,0,19.429-8.439,19.829-19.1" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1304.251,1660.454h0c-8.634,0-16.915-3.43-23.02-9.535l-61.331-61.331h-64.063v11.339l-59.528,59.528h-79.415" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M997.136,1642.433c.942,10.211,9.504,18.021,19.759,18.021" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M997.136,1642.433l-15.364-166.622c-.153-1.655-1.26-3.074-2.829-3.623-1.569-.549-3.32-.131-4.471,1.068l-111.737,116.331h-44.222" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M800.494,1578.055c3.238,7.022,10.286,11.533,18.019,11.533" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M800.494,1578.055l-47.392-102.761c-.784-1.744-2.39-2.973-4.279-3.274-1.888-.301-3.797.368-5.084,1.782l-11.843,13.008,10.366,22.23-4.954,132.313" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M717.48,1660.454c10.669,0,19.43-8.439,19.829-19.1" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M717.48,1660.454h-2.315c-7.152,0-14.011-2.841-19.068-7.898l-62.968-62.968h-64.063v11.339l-59.528,59.528h-79.443" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M410.34,1642.463c.956,10.198,9.513,17.99,19.756,17.99" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="410.34 1642.463 395.018 1479.036 319.9 1403.918" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1560.058,1474.784v-873.071l-7.087-7.087-7.057-134.646h-153.706c-6.409,0-12.031,4.314-13.69,10.505l-26.807,100.046-11.339,11.339v19.843h-11.339" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M971.869,601.714v-19.843l-11.339-11.339-26.807-100.046c-1.659-6.191-7.281-10.505-13.69-10.505h-153.631l-7.138,136.359" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M747.932,596.044c0,3.073,2.449,5.587,5.521,5.667,3.072.081,5.649-2.302,5.81-5.371" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="747.932 596.044 747.932 372.107 722.42 372.107 722.42 381.178" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M745.664,372.107l-1.813-34.601c-1.065-20.329-17.858-36.265-38.215-36.265h-272.573c-20.357,0-37.15,15.936-38.215,36.265l-1.813,34.601" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<polyline points="416.278 381.178 416.278 372.107 390.767 372.107 390.767 601.714 319.9 620.702 319.9 1403.918" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="983.207" y1="321.084" x2="983.207" y2="601.714" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M997.381,306.91c-7.824,0-14.173,6.35-14.173,14.173" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="1329.034" y1="363.805" x2="1329.034" y2="601.714" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="1272.14" y1="306.91" x2="997.381" y2="306.91" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="1272.14" y1="306.91" x2="1329.034" y2="363.805" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1184.467,601.714c0-15.647-12.699-28.346-28.346-28.346s-28.346,12.699-28.346,28.346,12.699,28.346,28.346,28.346,28.346-12.699,28.346-28.346" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<path d="M1228.404,416.044c0-39.9-32.383-72.283-72.283-72.283s-72.283,32.383-72.283,72.283,32.383,72.284,72.283,72.284,72.283-32.383,72.283-72.284" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>',
    '<line x1="971.869" y1="601.714" x2="983.207" y2="601.714" fill="none" stroke="#ef3c25" stroke-miterlimit="2.613" stroke-width="2"/>'
  ];

  const sourceFoldElements = [
    '<line x1="1559.207" y1="1474.784" x2="1340.464" y2="1474.784" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1328.943" y1="1474.784" x2="982.397" y2="1474.784" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="972.153" y1="1474.784" x2="753.692" y2="1474.784" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="742.172" y1="1474.784" x2="391.617" y2="1474.784" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1319.342" y1="1490.146" x2="1220.502" y2="1588.986" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="732.57" y1="1490.146" x2="633.73" y2="1588.986" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1334.703" y1="602.564" x2="1334.703" y2="1471.099" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="747.932" y1="602.564" x2="747.932" y2="1471.099" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="977.538" y1="602.564" x2="977.538" y2="1471.099" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="390.767" y1="602.564" x2="390.767" y2="1473.934" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1559.207" y1="601.714" x2="1341.223" y2="601.714" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<polyline points="983.207 601.714 971.869 601.714 754.451 601.714" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="747.081" y1="598.879" x2="391.617" y2="598.879" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="721.57" y1="378.344" x2="417.129" y2="378.344" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10" stroke-width="2"/>',
    '<line x1="1329.034" y1="525.178" x2="983.207" y2="525.178" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="983.207" y1="601.714" x2="1127.774" y2="601.714" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>',
    '<line x1="1184.467" y1="601.714" x2="1329.034" y2="601.714" fill="none" stroke="#4257a6" stroke-dasharray="3" stroke-miterlimit="10"/>'
  ];

  const bleedElement = '<path d="M1566.628,1479.313c.081-.112.163-.223.239-.338.081-.123.154-.248.228-.374.066-.113.132-.225.192-.34.069-.131.13-.264.191-.397.054-.119.109-.237.158-.358.054-.134.102-.27.149-.407.044-.126.087-.252.125-.38.041-.139.074-.279.108-.419.031-.129.062-.257.087-.388.028-.149.048-.299.069-.45.017-.124.035-.247.047-.373.015-.168.02-.336.025-.504.003-.089.013-.175.013-.264v-873.072c0-2.255-.896-4.417-2.49-6.012l-4.779-4.779-6.886-131.385c-.236-4.518-3.969-8.059-8.492-8.059h-153.706c-10.245,0-19.252,6.912-21.904,16.808l-26.218,97.846-6.549,6.549v-208.875c0-.28-.015-.56-.042-.839-.012-.125-.036-.247-.053-.371-.022-.151-.04-.302-.069-.452-.028-.141-.067-.277-.101-.415-.033-.131-.062-.263-.101-.393-.041-.134-.091-.264-.138-.395-.047-.131-.09-.262-.143-.391-.05-.12-.109-.236-.164-.353-.063-.135-.123-.27-.193-.402-.059-.11-.126-.214-.19-.321-.078-.131-.153-.264-.238-.392-.076-.114-.162-.221-.243-.331-.084-.113-.163-.228-.252-.338-.146-.178-.303-.347-.463-.512-.034-.035-.063-.073-.097-.108l-56.894-56.894c-.031-.031-.066-.058-.098-.089-.169-.164-.341-.323-.523-.472-.108-.089-.222-.167-.334-.25-.111-.083-.219-.169-.334-.246-.127-.085-.258-.159-.388-.236-.108-.065-.214-.133-.326-.193-.131-.07-.265-.13-.399-.192-.118-.056-.234-.115-.355-.165-.13-.054-.262-.097-.394-.144-.131-.047-.259-.097-.393-.137-.13-.039-.263-.068-.395-.102-.137-.035-.273-.073-.413-.101-.148-.029-.298-.047-.447-.068-.126-.018-.25-.042-.377-.054-.268-.026-.537-.04-.806-.041-.011,0-.021-.002-.032-.002h-274.759c-12.524,0-22.677,10.153-22.677,22.677v251.596l-6.55-6.549-26.217-97.846c-2.652-9.896-11.659-16.807-21.904-16.807h-159.908c-4.523,0-4.399,1.031-4.317-25.31l.077-24.344.551-29.716c0-2.39-.989-4.546-2.576-6.091l-1.517-28.956c-1.303-24.854-21.819-44.323-46.708-44.323h-272.573c-24.88,0-45.405,19.478-46.707,44.323l-1.518,28.957c-1.586,1.545-2.575,3.701-2.575,6.09v223.081l.454,196.239c-.189,115.512-2.593,464.865-2.565,465.144.012.126-.098,222.104,0,222.224.115.14,6.934,6.724,6.934,6.724l15.466,164.975c.695,7.415,12.828,18.463,27.544,18.463h79.443c2.255,0,4.418-.896,6.012-2.49l59.528-59.527c1.596-1.595,2.491-3.758,2.491-6.014v-2.835h52.036l63.206,62.827c1.218,1.211,2.678,2.142,4.286,2.744,1.658.621,6.544,3.809,7.694,4.067,2.032.455,4.053.925,6.134.998l6.554.23c15.311,0,27.753-11.985,28.326-27.286l4.954-132.312c.051-1.349-.221-2.689-.791-3.912l-7.973-17.099,5.151-5.658,45.623,98.927.659,1.264c4.874,9.348,14.541,15.21,25.083,15.21h44.222c2.314,0,4.529-.943,6.133-2.613l105.291-109.62,14.51,157.356.296,1.877c2.17,13.744,14.016,23.866,27.93,23.866h79.415c2.256,0,4.418-.896,6.014-2.49l59.527-59.527c1.595-1.596,2.49-3.758,2.49-6.014v-2.835h52.036l64.39,64.391c.499.498,4.862,3.064,6.148,3.629,3.598,1.582,5.856,2.141,9.776,2.429l5.661.417c15.085,0,28.686-12.278,30.225-27.284v-.002s4.954-132.312,4.954-132.312c.051-1.349-.221-2.689-.791-3.912l-7.972-17.099,5.151-5.659,45.623,98.928c4.616,10.008,14.72,16.475,25.741,16.475h44.222c2.312,0,4.522-.94,6.126-2.605l110.552-114.804c.07-.073.129-.151.196-.225.103-.114.206-.228.303-.348.087-.109.167-.221.249-.332Z" fill="none" stroke="#4257a6" stroke-miterlimit="10" stroke-width="2"/>';

  const sourceLabels = [
    { name: 'lidTop', x: 569.35, y: 499.65 },
    { name: 'Glue', x: 345, y: 1020.6 },
    { name: 'Front', x: 569.35, y: 1038 },
    { name: 'Side(L)', x: 862.7, y: 1038 },
    { name: 'Back', x: 1156.12, y: 1038 },
    { name: 'Side(R)', x: 1446.88, y: 1038 },
    { name: 'Upper-Tuck', x: 569.35, y: 359.8 },
    { name: 'Bottle Top', x: 1156.12, y: 416.04 },
    { name: 'bottomLock-A', x: 569.35, y: 1510.98 },
    { name: 'bottomLock(L)', x: 862.7, y: 1510.98 },
    { name: 'bottomLock-B', x: 1156.12, y: 1510.98 },
    { name: 'bottomLock(R)', x: 1446.88, y: 1510.98 }
  ];

  const grid = templateOverride ? T002_createReferenceGrid() : T002_createRuleGrid(spec.W, spec.D, spec.H);
  grid.upperTuckRule = requestedRule;
  spec.upperTuckRule = requestedRule;
  const mapper = templateOverride ? T002_createReferenceMapper() : T002_createRuleMapper(grid, spec.W, spec.D, spec.H);
  const sourcePath = typeof T002_cutFillPath === 'function'
    ? T002_cutFillPath()
    : T001_buildCutFillPath(sourceCutElements.filter(el => !/M(?:1184\.467,601\.714|1228\.404,416\.044)/.test(el)));
  const fillPath = T002_smoothBottomCubicJoins(T002_buildRuleCutPath(sourcePath, mapper, grid, spec.D), grid);
  const upperLeftShoulder = mapper.point(390.767, 372.107);
  const upperLeftCutA = mapper.point(416.278, 372.107);
  const upperLeftCutBSource = mapper.point(416.278, 381.178);
  const upperLeftCutB = { x: upperLeftCutA.x, y: upperLeftCutBSource.y };
  const upperRightCutA = mapper.point(722.42, 372.107);
  const upperRightCutBSource = mapper.point(722.42, 381.178);
  const upperRightCutB = { x: upperRightCutA.x, y: upperRightCutBSource.y };
  const upperRightShoulder = mapper.point(747.932, 372.107);
  const upperTuckSideCuts = [
    T002_lineElement(upperLeftShoulder.x, upperLeftShoulder.y, upperLeftCutA.x, upperLeftCutA.y),
    T002_lineElement(upperLeftCutA.x, upperLeftCutA.y, upperLeftCutB.x, upperLeftCutB.y),
    T002_lineElement(upperRightCutB.x, upperRightCutB.y, upperRightCutA.x, upperRightCutA.y),
    T002_lineElement(upperRightCutA.x, upperRightCutA.y, upperRightShoulder.x, upperRightShoulder.y)
  ];
  const cutElements = ['<path d="' + fillPath + '"/>'].concat(upperTuckSideCuts);

  // Every size uses the same source-calibrated fold recipe. The mapper makes
  // Y depend only on D/H, so changing W can never move f-2 or another top fold.
  const foldElements = sourceFoldElements.flatMap(element => {
    const transformed = T001_transformElement(element, mapper);
    const points = T001_flattenPathD(T001_elementToPathD(transformed));
    return points.slice(1).map((point, index) => T002_lineElement(
      points[index].x, points[index].y, point.x, point.y
    ));
  });

  const labelCenters = {
    'Upper-Tuck': (grid.xFrontL + grid.xFrontR) / 2,
    lidTop: (grid.xFrontL + grid.xFrontR) / 2,
    Front: (grid.xFrontL + grid.xFrontR) / 2,
    'bottomLock-A': (grid.xFrontL + grid.xFrontR) / 2,
    'Bottle Top': (grid.xSideLR + grid.xBackR) / 2,
    Back: (grid.xSideLR + grid.xBackR) / 2,
    'bottomLock-B': (grid.xSideLR + grid.xBackR) / 2,
    'Side(L)': (grid.xFrontR + grid.xSideLR) / 2,
    'bottomLock(L)': (grid.xFrontR + grid.xSideLR) / 2,
    'Side(R)': (grid.xBackR + grid.xSideRR) / 2,
    'bottomLock(R)': (grid.xBackR + grid.xSideRR) / 2,
    Glue: (grid.xOuterL + grid.xFrontL) / 2
  };
  const labels = sourceLabels.map(label => {
    const point = mapper.point(label.x, label.y);
    return { name: label.name, x: labelCenters[label.name] ?? point.x, y: point.y };
  });
  const cutPoints = T001_flattenPathD(fillPath);
  const cutBounds = T001_polygonBounds(cutPoints);
  const dielineBounds = {
    minX: cutBounds.minX, minY: cutBounds.minY, maxX: cutBounds.maxX, maxY: cutBounds.maxY,
    width: cutBounds.maxX - cutBounds.minX, height: cutBounds.maxY - cutBounds.minY
  };
  const bleedPoints = T001_offsetPolygonWithClipper(cutPoints, 3);
  if (!bleedPoints || !bleedPoints.length) throw new Error('T002 3 mm bleed generation failed.');
  const bleedPath = T001_polygonToPath(bleedPoints);
  const generatedBleedElement = '<path d="' + bleedPath + '"/>';
  const rawBleedBounds = T001_polygonBounds(bleedPoints);
  const bleedBounds = {
    minX: rawBleedBounds.minX, minY: rawBleedBounds.minY,
    maxX: rawBleedBounds.maxX, maxY: rawBleedBounds.maxY,
    width: rawBleedBounds.maxX - rawBleedBounds.minX,
    height: rawBleedBounds.maxY - rawBleedBounds.minY
  };
  const glueTop = mapper.point(319.9,620.702);
  const glueBottom = mapper.point(319.9,1403.918);
  const glueFillPath = 'M ' + grid.xFrontL + ' ' + grid.yBodyTop + ' L ' + glueTop.x + ' ' + glueTop.y +
    ' L ' + glueBottom.x + ' ' + glueBottom.y + ' L ' + grid.xFrontL + ' ' + grid.yBodyBottom + ' Z';

  const layout = {
    spec,
    templateOverride,
    cutElements,
    foldElements,
    bleedElement: generatedBleedElement,
    bleedPath,
    fillPath,
    glueFillPath,
    upperTuckSideCuts,
    grid,
    mapper,
    labels,
    bounds: dielineBounds,
    dielineBounds,
    bleedBounds,
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  };
  layout.validation = T002_validateRuleLayout(layout);
  if (!layout.validation.ok) throw new Error('T002 rule geometry contract failed: ' + JSON.stringify(layout.validation.failures));
  return layout;
}
