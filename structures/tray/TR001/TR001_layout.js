// ============================================================
// TR001_layout.js - parametric layout for TR001 EB Tray Box
// Reference SVG coordinates are converted through W/D/H formulas.
// Base: x-axis W, y-axis D. Side/front/back panels fold to H.
// ============================================================

const TR001_REF_PATH = './structures/tray/TR001/reference/TR001 368x282x140_(cutpath, bleedpath, foldingline).svg';

let TR001_SOURCE_CACHE = null;

function TR001_n(value) {
  return Number.isFinite(+value) ? (+value).toFixed(4) : '0';
}

function TR001_path(d) {
  return '<path d="' + d + '"/>';
}

function TR001_loadReferenceSvg() {
  if (TR001_SOURCE_CACHE) return TR001_SOURCE_CACHE;

  let text = '';
  if (typeof XMLHttpRequest !== 'undefined') {
    const req = new XMLHttpRequest();
    req.open('GET', TR001_REF_PATH, false);
    req.send(null);
    text = req.responseText || '';
  } else if (typeof require === 'function') {
    text = require('fs').readFileSync('structures/tray/TR001/reference/TR001 368x282x140_(cutpath, bleedpath, foldingline).svg', 'utf8');
  }

  const elements = (text.match(/<(?:path|line|polyline)\b[^>]*\/>/g) || []);
  const cutElements = elements.filter(el =>
    el.includes('stroke="#e63a27"') && el.includes('stroke-width="2"')
  );
  const outerCutElements = cutElements.filter((_, index) =>
    index >= 15 && (index < 30 || index > 34)
  );
  const foldElements = elements.filter(el =>
    el.includes('stroke="#3d4d9e"') &&
    el.includes('stroke-dasharray') &&
    !el.includes('x1="690.734"')
  );
  const bleedElement = elements.find(el =>
    el.startsWith('<path') &&
    el.includes('stroke="#3d4d9e"') &&
    !el.includes('stroke-dasharray')
  );
  const greenElements = elements.filter(el => el.includes('stroke="#147139"'));

  TR001_SOURCE_CACHE = {
    cutElements,
    outerCutElements,
    foldElements,
    bleedElement,
    staticPerforationElements: greenElements.slice(14)
  };
  return TR001_SOURCE_CACHE;
}

function TR001_attr(el, name) {
  const match = el.match(new RegExp(name + '="([^"]*)"'));
  return match ? match[1] : '';
}

function TR001_numbers(value) {
  return (value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
}

function TR001_sourceFrame(spec) {
  const s = {
    x0: 456.113,
    x1: 852.963,
    x2: 1652.333,
    x3: 2049.184,
    y0: 238.132,
    y1: 408.211,
    y2: 805.061,
    y3: 1848.211,
    y4: 2245.061,
    y5: 2415.140
  };
  const p = {
    x0: 0,
    x1: spec.H,
    x2: spec.H + spec.W,
    x3: spec.H + spec.W + spec.H,
    y0: 0,
    y1: spec.lip,
    y2: spec.lip + spec.H,
    y3: spec.lip + spec.H + spec.D,
    y4: spec.lip + spec.H + spec.D + spec.H,
    y5: spec.lip + spec.H + spec.D + spec.H + spec.lip
  };
  return { s, p };
}

function TR001_piecewise(value, sourceStops, targetStops) {
  if (value <= sourceStops[0]) {
    const ratio = (value - sourceStops[0]) / (sourceStops[1] - sourceStops[0]);
    return targetStops[0] + ratio * (targetStops[1] - targetStops[0]);
  }

  for (let i = 0; i < sourceStops.length - 1; i++) {
    const a = sourceStops[i];
    const b = sourceStops[i + 1];
    if (value <= b || i === sourceStops.length - 2) {
      const ratio = (value - a) / (b - a);
      return targetStops[i] + ratio * (targetStops[i + 1] - targetStops[i]);
    }
  }

  return targetStops[targetStops.length - 1];
}

function TR001_transformer(spec) {
  const frame = TR001_sourceFrame(spec);
  return {
    x(value) {
      return TR001_piecewise(value, [frame.s.x0, frame.s.x1, frame.s.x2, frame.s.x3], [frame.p.x0, frame.p.x1, frame.p.x2, frame.p.x3]);
    },
    y(value) {
      return TR001_piecewise(value, [frame.s.y0, frame.s.y1, frame.s.y2, frame.s.y3, frame.s.y4, frame.s.y5], [frame.p.y0, frame.p.y1, frame.p.y2, frame.p.y3, frame.p.y4, frame.p.y5]);
    },
    source: frame.s,
    params: frame.p
  };
}

function TR001_linePath(x1, y1, x2, y2) {
  return 'M' + TR001_n(x1) + ' ' + TR001_n(y1) + ' L' + TR001_n(x2) + ' ' + TR001_n(y2);
}

function TR001_polylineToPath(points, tr) {
  const nums = TR001_numbers(points);
  if (nums.length < 4) return '';
  let out = 'M' + TR001_n(tr.x(nums[0])) + ' ' + TR001_n(tr.y(nums[1]));
  for (let i = 2; i < nums.length - 1; i += 2) {
    out += ' L' + TR001_n(tr.x(nums[i])) + ' ' + TR001_n(tr.y(nums[i + 1]));
  }
  return out;
}

function TR001_pathToPolyline(d, tr) {
  const segs = TR001_sourcePathSegments(d);
  if (!segs.length) return '';
  let out = '';
  segs.forEach((seg, index) => {
    const x1 = tr.x(seg[0]);
    const y1 = tr.y(seg[1]);
    const x2 = tr.x(seg[2]);
    const y2 = tr.y(seg[3]);
    if (index === 0) out += 'M' + TR001_n(x1) + ' ' + TR001_n(y1);
    out += ' L' + TR001_n(x2) + ' ' + TR001_n(y2);
  });
  return out;
}

function TR001_transformElement(el, tr) {
  if (el.startsWith('<line')) {
    return TR001_path(TR001_linePath(
      tr.x(+TR001_attr(el, 'x1')),
      tr.y(+TR001_attr(el, 'y1')),
      tr.x(+TR001_attr(el, 'x2')),
      tr.y(+TR001_attr(el, 'y2'))
    ));
  }
  if (el.startsWith('<polyline')) {
    return TR001_path(TR001_polylineToPath(TR001_attr(el, 'points'), tr));
  }
  return TR001_path(TR001_pathToPolyline(TR001_attr(el, 'd'), tr));
}

function TR001_sourceElementSegments(el, tr) {
  if (el.startsWith('<line')) {
    return [[
      tr.x(+TR001_attr(el, 'x1')),
      tr.y(+TR001_attr(el, 'y1')),
      tr.x(+TR001_attr(el, 'x2')),
      tr.y(+TR001_attr(el, 'y2'))
    ]];
  }

  if (el.startsWith('<polyline')) {
    const nums = TR001_numbers(TR001_attr(el, 'points'));
    const segs = [];
    for (let i = 0; i < nums.length - 3; i += 2) {
      segs.push([
        tr.x(nums[i]),
        tr.y(nums[i + 1]),
        tr.x(nums[i + 2]),
        tr.y(nums[i + 3])
      ]);
    }
    return segs;
  }

  return TR001_sourcePathSegments(TR001_attr(el, 'd')).map(seg => [
    tr.x(seg[0]),
    tr.y(seg[1]),
    tr.x(seg[2]),
    tr.y(seg[3])
  ]);
}

function TR001_buildCutFillElement(elements, tr) {
  const segments = elements.flatMap(el => TR001_sourceElementSegments(el, tr));
  const nodes = new Map();
  const edges = [];
  const unit = 0.01;
  const keyFor = (x, y) => Math.round(x / unit) + ',' + Math.round(y / unit);
  const getNode = (x, y) => {
    const key = keyFor(x, y);
    if (!nodes.has(key)) nodes.set(key, { key, x, y, links: [] });
    return nodes.get(key);
  };

  segments.forEach((seg, id) => {
    const a = getNode(seg[0], seg[1]);
    const b = getNode(seg[2], seg[3]);
    edges.push({ id, a: a.key, b: b.key });
    a.links.push({ id, to: b.key });
    b.links.push({ id, to: a.key });
  });

  const start = Array.from(nodes.values()).sort((a, b) =>
    Math.abs(a.y - b.y) > unit ? a.y - b.y : a.x - b.x
  )[0];
  if (!start) return TR001_path('');

  const used = new Set();
  const points = [{ x: start.x, y: start.y }];
  let current = start.key;
  let previous = '';

  for (let guard = 0; guard < edges.length + 2; guard++) {
    const node = nodes.get(current);
    const next = (node.links || []).find(link => !used.has(link.id) && link.to !== previous) ||
      (node.links || []).find(link => !used.has(link.id));
    if (!next) break;

    used.add(next.id);
    previous = current;
    current = next.to;
    const point = nodes.get(current);
    points.push({ x: point.x, y: point.y });
    if (current === start.key) break;
  }

  const d = points.map((point, index) =>
    (index === 0 ? 'M' : 'L') + TR001_n(point.x) + ' ' + TR001_n(point.y)
  ).join(' ') + ' Z';
  return TR001_path(d);
}

function TR001_sourcePathSegments(d) {
  const tokens = (d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []);
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let lastC2X = 0;
  let lastC2Y = 0;
  let prevCubic = false;
  const segs = [];
  const isCmd = value => /^[a-zA-Z]$/.test(value);
  const num = () => parseFloat(tokens[i++]);
  const add = (x1, y1, x2, y2) => segs.push([x1, y1, x2, y2]);
  const cubic = (x0, y0, x1, y1, x2, y2, x3, y3) => {
    let px = x0;
    let py = y0;
    for (let step = 1; step <= 12; step++) {
      const u = step / 12;
      const v = 1 - u;
      const nx = v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3;
      const ny = v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3;
      add(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  };

  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];

    if (cmd === 'M' || cmd === 'm') {
      x = cmd === 'm' ? x + num() : num();
      y = cmd === 'm' ? y + num() : num();
      sx = x;
      sy = y;
      cmd = cmd === 'm' ? 'l' : 'L';
      prevCubic = false;
    } else if (cmd === 'L' || cmd === 'l') {
      const nx = cmd === 'l' ? x + num() : num();
      const ny = cmd === 'l' ? y + num() : num();
      add(x, y, nx, ny);
      x = nx;
      y = ny;
      prevCubic = false;
    } else if (cmd === 'H' || cmd === 'h') {
      const nx = cmd === 'h' ? x + num() : num();
      add(x, y, nx, y);
      x = nx;
      prevCubic = false;
    } else if (cmd === 'V' || cmd === 'v') {
      const ny = cmd === 'v' ? y + num() : num();
      add(x, y, x, ny);
      y = ny;
      prevCubic = false;
    } else if (cmd === 'C' || cmd === 'c') {
      const x1 = cmd === 'c' ? x + num() : num();
      const y1 = cmd === 'c' ? y + num() : num();
      const x2 = cmd === 'c' ? x + num() : num();
      const y2 = cmd === 'c' ? y + num() : num();
      const x3 = cmd === 'c' ? x + num() : num();
      const y3 = cmd === 'c' ? y + num() : num();
      cubic(x, y, x1, y1, x2, y2, x3, y3);
      x = x3;
      y = y3;
      lastC2X = x2;
      lastC2Y = y2;
      prevCubic = true;
    } else if (cmd === 'S' || cmd === 's') {
      const x1 = prevCubic ? x * 2 - lastC2X : x;
      const y1 = prevCubic ? y * 2 - lastC2Y : y;
      const x2 = cmd === 's' ? x + num() : num();
      const y2 = cmd === 's' ? y + num() : num();
      const x3 = cmd === 's' ? x + num() : num();
      const y3 = cmd === 's' ? y + num() : num();
      cubic(x, y, x1, y1, x2, y2, x3, y3);
      x = x3;
      y = y3;
      lastC2X = x2;
      lastC2Y = y2;
      prevCubic = true;
    } else if (cmd === 'Z' || cmd === 'z') {
      add(x, y, sx, sy);
      x = sx;
      y = sy;
      prevCubic = false;
    } else {
      break;
    }
  }
  return segs;
}

function TR001_clampHoleCount(value, fallback, min, max) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function TR001_evenCenters(min, max, count) {
  const span = max - min;
  return Array.from({ length: count }, (_, i) => min + span * ((i + 1) / (count + 1)));
}

function TR001_insetCenters(min, max, count, insetRatio) {
  if (count <= 0) return [];
  if (count === 1) return [(min + max) / 2];
  const span = max - min;
  const start = min + span * insetRatio;
  const end = max - span * insetRatio;
  return Array.from({ length: count }, (_, i) => start + (end - start) * (i / (count - 1)));
}

function TR001_circlePath(cx, cy, r) {
  return [
    'M' + TR001_n(cx + r) + ' ' + TR001_n(cy),
    'A' + TR001_n(r) + ' ' + TR001_n(r) + ' 0 1 0 ' + TR001_n(cx - r) + ' ' + TR001_n(cy),
    'A' + TR001_n(r) + ' ' + TR001_n(r) + ' 0 1 0 ' + TR001_n(cx + r) + ' ' + TR001_n(cy)
  ].join(' ');
}

function TR001_buildHoles(p, spec, cfg) {
  const fbCount = TR001_clampHoleCount(cfg.frontBackHoleCount, 3, 2, 3);
  const lrCount = TR001_clampHoleCount(cfg.leftRightHoleCount, 4, 3, 4);
  const holes = [];
  const xCenters = TR001_evenCenters(p.x1, p.x2, fbCount);
  // Original TR001 reference coordinates:
  // left/right circle centers x=682.885 / 1822.412,
  // side-panel frame x=456.113..852.963 / 1652.333..2049.184.
  // The four y centers preserve a 24.4566% inset from both ends of D.
  // Keeping these folded-state ratios aligns the vents with the insert-lid
  // relief notches instead of centering them mechanically in each flap.
  const sideInsetRatio = (1060.18 - 805.061) / (1848.211 - 805.061);
  const sourceSideYRatios = [1060.18, 1237.345, 1415.927, 1593.093]
    .map(value => (value - 805.061) / (1848.211 - 805.061));
  const leftXRatio = (682.885 - 456.113) / (852.963 - 456.113);
  const rightXRatio = (1822.412 - 1652.333) / (2049.184 - 1652.333);
  const yCenters = lrCount === 4
    ? sourceSideYRatios.map(ratio => p.y2 + spec.D * ratio)
    : TR001_insetCenters(p.y2, p.y3, lrCount, sideInsetRatio);
  const leftX = p.x0 + spec.H * leftXRatio;
  const rightX = p.x2 + spec.H * rightXRatio;

  xCenters.forEach((cx, i) => holes.push({ id: 'backHole' + (i + 1), cx, cy: (p.y1 + p.y2) / 2, r: spec.holeRadius }));
  xCenters.forEach((cx, i) => holes.push({ id: 'frontHole' + (i + 1), cx, cy: (p.y3 + p.y4) / 2, r: spec.holeRadius }));
  yCenters.forEach((cy, i) => holes.push({ id: 'leftHole' + (i + 1), cx: leftX, cy, r: spec.holeRadius }));
  yCenters.forEach((cy, i) => holes.push({ id: 'rightHole' + (i + 1), cx: rightX, cy, r: spec.holeRadius }));
  return holes;
}

function TR001_layoutHoleElements(holes) {
  return holes.map(hole => TR001_path(TR001_circlePath(hole.cx, hole.cy, hole.r)));
}

function TR001_insertLidNeedsRound(frontBackHoleCount) {
  return TR001_clampHoleCount(frontBackHoleCount, 3, 2, 3) === 3;
}

function TR001_getLayout(W, D, H, cfg) {
  const spec = TR001_getSpec(W, D, H);
  const source = TR001_loadReferenceSvg();
  const tr = TR001_transformer(spec);
  const options = cfg || {};
  const holes = TR001_buildHoles(tr.params, spec, options);

  return {
    cutElements: source.cutElements.map(el => TR001_transformElement(el, tr)),
    cutFillElement: TR001_buildCutFillElement(source.outerCutElements, tr),
    foldElements: source.foldElements.map(el => TR001_transformElement(el, tr)),
    bleedElement: TR001_transformElement(source.bleedElement, tr),
    staticPerforationElements: source.staticPerforationElements.map(el => TR001_transformElement(el, tr)),
    holes,
    holeElements: TR001_layoutHoleElements(holes),
    insertLidRounded: TR001_insertLidNeedsRound(options.frontBackHoleCount),
    params: tr.params,
    labels: [
      { name: 'dust flap', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y0 + tr.params.y1) / 2 },
      { name: 'back', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y1 + tr.params.y2) / 2 },
      { name: 'base', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y2 + tr.params.y3) / 2 },
      { name: 'front', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y3 + tr.params.y4) / 2 },
      { name: 'dust flap', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y4 + tr.params.y5) / 2 },
      { name: 'lidSideFlap(L)', x: (tr.params.x0 + tr.params.x1) / 2, y: (tr.params.y2 + tr.params.y3) / 2 },
      { name: 'lidSideFlap(R)', x: (tr.params.x2 + tr.params.x3) / 2, y: (tr.params.y2 + tr.params.y3) / 2 }
    ],
    bounds: spec.bounds,
    transform: spec.transform,
    spec
  };
}
