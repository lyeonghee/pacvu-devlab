// ============================================================
// TR002_layout.js - parametric layout for TR002 EB Tray Box
// Reference SVG coordinates are converted through W/D/H formulas.
// Base: x-axis W, y-axis D. Side/front/back panels fold to H.
// ============================================================

const TR002_REF_PATH = './structures/tray/TR002/reference/TR002  200x280x100_(cutpath, bleedpath, foldingline).svg';

let TR002_SOURCE_CACHE = null;

function TR002_n(value) {
  return Number.isFinite(+value) ? (+value).toFixed(4) : '0';
}

function TR002_path(d) {
  return '<path d="' + d + '"/>';
}

function TR002_loadReferenceSvg() {
  if (TR002_SOURCE_CACHE) return TR002_SOURCE_CACHE;

  let text = '';
  if (typeof XMLHttpRequest !== 'undefined') {
    const req = new XMLHttpRequest();
    req.open('GET', TR002_REF_PATH, false);
    req.send(null);
    text = req.responseText || '';
  } else if (typeof require === 'function') {
    text = require('fs').readFileSync('structures/tray/TR002/reference/TR002  200x280x100_(cutpath, bleedpath, foldingline).svg', 'utf8');
  }

  const elements = (text.match(/<(?:path|line|polyline)\b[^>]*\/>/g) || []);
  const cutElements = elements.filter(el =>
    el.includes('stroke="#e63d28"') && el.includes('stroke-width="2"')
  );
  const foldElements = elements.filter(el =>
    el.includes('stroke="#3e4e9e"') && el.includes('stroke-dasharray="3"')
  );
  const bleedElement = elements.find(el =>
    el.startsWith('<path') &&
    el.includes('stroke="#3e4e9e"') &&
    !el.includes('stroke-dasharray')
  );
  const greenElements = elements.filter(el => el.includes('stroke="#19723a"'));

  TR002_SOURCE_CACHE = {
    cutElements,
    foldElements,
    bleedElement,
    // Green artwork in the source mixes production samples with option-handle
    // annotations. TR002 holes are rebuilt parametrically below, so none of
    // those fixed examples are rendered.
    staticPerforationElements: []
  };
  return TR002_SOURCE_CACHE;
}

function TR002_attr(el, name) {
  const match = el.match(new RegExp(name + '="([^"]*)"'));
  return match ? match[1] : '';
}

function TR002_numbers(value) {
  return (value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
}

function TR002_sourceFrame(spec) {
  const s = {
    x0: 325.734,
    x1: 609.201,
    x2: 1176.131,
    x3: 1459.598,
    y0: 201.081,
    y1: 342.813,
    y2: 626.278,
    y3: 1419.979,
    y4: 1703.444,
    y5: 1845.176
  };
  const p = {
    x0: 0,
    x1: spec.H,
    x2: spec.H + spec.W,
    x3: spec.H + spec.W + spec.H,
    y0: 0,
    y1: spec.dustFlap,
    y2: spec.dustFlap + spec.H,
    y3: spec.dustFlap + spec.H + spec.D,
    y4: spec.dustFlap + spec.H + spec.D + spec.H,
    y5: spec.dustFlap + spec.H + spec.D + spec.H + spec.dustFlap
  };
  return { s, p };
}

function TR002_piecewise(value, sourceStops, targetStops) {
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

function TR002_transformer(spec) {
  const frame = TR002_sourceFrame(spec);
  return {
    x(value) {
      return TR002_piecewise(value, [frame.s.x0, frame.s.x1, frame.s.x2, frame.s.x3], [frame.p.x0, frame.p.x1, frame.p.x2, frame.p.x3]);
    },
    y(value) {
      return TR002_piecewise(value, [frame.s.y0, frame.s.y1, frame.s.y2, frame.s.y3, frame.s.y4, frame.s.y5], [frame.p.y0, frame.p.y1, frame.p.y2, frame.p.y3, frame.p.y4, frame.p.y5]);
    },
    source: frame.s,
    params: frame.p
  };
}

function TR002_linePath(x1, y1, x2, y2) {
  return 'M' + TR002_n(x1) + ' ' + TR002_n(y1) + ' L' + TR002_n(x2) + ' ' + TR002_n(y2);
}

function TR002_polylineToPath(points, tr) {
  const nums = TR002_numbers(points);
  if (nums.length < 4) return '';
  let out = 'M' + TR002_n(tr.x(nums[0])) + ' ' + TR002_n(tr.y(nums[1]));
  for (let i = 2; i < nums.length - 1; i += 2) {
    out += ' L' + TR002_n(tr.x(nums[i])) + ' ' + TR002_n(tr.y(nums[i + 1]));
  }
  return out;
}

function TR002_pathToPolyline(d, tr) {
  const segs = TR002_sourcePathSegments(d);
  if (!segs.length) return '';
  let out = '';
  segs.forEach((seg, index) => {
    const x1 = tr.x(seg[0]);
    const y1 = tr.y(seg[1]);
    const x2 = tr.x(seg[2]);
    const y2 = tr.y(seg[3]);
    if (index === 0) out += 'M' + TR002_n(x1) + ' ' + TR002_n(y1);
    out += ' L' + TR002_n(x2) + ' ' + TR002_n(y2);
  });
  return out;
}

function TR002_transformElement(el, tr) {
  if (el.startsWith('<line')) {
    return TR002_path(TR002_linePath(
      tr.x(+TR002_attr(el, 'x1')),
      tr.y(+TR002_attr(el, 'y1')),
      tr.x(+TR002_attr(el, 'x2')),
      tr.y(+TR002_attr(el, 'y2'))
    ));
  }
  if (el.startsWith('<polyline')) {
    return TR002_path(TR002_polylineToPath(TR002_attr(el, 'points'), tr));
  }
  return TR002_path(TR002_pathToPolyline(TR002_attr(el, 'd'), tr));
}

function TR002_sourceElementSegments(el, tr) {
  if (el.startsWith('<line')) {
    return [[
      tr.x(+TR002_attr(el, 'x1')),
      tr.y(+TR002_attr(el, 'y1')),
      tr.x(+TR002_attr(el, 'x2')),
      tr.y(+TR002_attr(el, 'y2'))
    ]];
  }

  if (el.startsWith('<polyline')) {
    const nums = TR002_numbers(TR002_attr(el, 'points'));
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

  return TR002_sourcePathSegments(TR002_attr(el, 'd')).map(seg => [
    tr.x(seg[0]),
    tr.y(seg[1]),
    tr.x(seg[2]),
    tr.y(seg[3])
  ]);
}

function TR002_buildCutFillElement(elements, tr) {
  const segments = elements.flatMap(el => TR002_sourceElementSegments(el, tr));
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
  if (!start) return TR002_path('');

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
    (index === 0 ? 'M' : 'L') + TR002_n(point.x) + ' ' + TR002_n(point.y)
  ).join(' ') + ' Z';
  return TR002_path(d);
}

function TR002_sourcePathSegments(d) {
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

function TR002_clamp(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function TR002_holeCount(value, fallback) {
  return Math.round(TR002_clamp(value, fallback, 0, 8));
}

function TR002_evenCenters(min, max, count) {
  if (!count) return [];
  const span = max - min;
  return Array.from({ length: count }, (_, index) => min + span * ((index + 1) / (count + 1)));
}

function TR002_roundedRectPath(cx, cy, width, height) {
  const k = 0.5522847498;
  const rx = Math.min(width / 2, height / 2);
  const left = cx - width / 2;
  const right = cx + width / 2;
  const top = cy - height / 2;
  const bottom = cy + height / 2;
  return [
    'M' + TR002_n(left + rx) + ' ' + TR002_n(top),
    'L' + TR002_n(right - rx) + ' ' + TR002_n(top),
    'C' + TR002_n(right - rx + k * rx) + ' ' + TR002_n(top) + ' ' + TR002_n(right) + ' ' + TR002_n(top + rx - k * rx) + ' ' + TR002_n(right) + ' ' + TR002_n(top + rx),
    'L' + TR002_n(right) + ' ' + TR002_n(bottom - rx),
    'C' + TR002_n(right) + ' ' + TR002_n(bottom - rx + k * rx) + ' ' + TR002_n(right - rx + k * rx) + ' ' + TR002_n(bottom) + ' ' + TR002_n(right - rx) + ' ' + TR002_n(bottom),
    'L' + TR002_n(left + rx) + ' ' + TR002_n(bottom),
    'C' + TR002_n(left + rx - k * rx) + ' ' + TR002_n(bottom) + ' ' + TR002_n(left) + ' ' + TR002_n(bottom - rx + k * rx) + ' ' + TR002_n(left) + ' ' + TR002_n(bottom - rx),
    'L' + TR002_n(left) + ' ' + TR002_n(top + rx),
    'C' + TR002_n(left) + ' ' + TR002_n(top + rx - k * rx) + ' ' + TR002_n(left + rx - k * rx) + ' ' + TR002_n(top) + ' ' + TR002_n(left + rx) + ' ' + TR002_n(top),
    'Z'
  ].join(' ');
}

function TR002_buildParametricHoles(p, spec, cfg) {
  const frontBackCount = TR002_holeCount(cfg.frontBackHoleCount, 1);
  const sideCount = TR002_holeCount(cfg.leftRightHoleCount, 1);
  const holeH = TR002_clamp(cfg.frontBackHoleHeight, 16, 4, spec.H * 0.72);
  const holeMaxW = frontBackCount ? Math.min(spec.W * 0.8, spec.W * 0.75 / frontBackCount) : spec.W;
  const holeW = TR002_clamp(cfg.frontBackHoleWidth, 30, 6, holeMaxW);
  const sideMaxDia = sideCount ? Math.min(spec.H * 0.72, spec.D * 0.75 / sideCount) : spec.H;
  const sideDia = TR002_clamp(cfg.leftRightHoleDiameter, 15, 4, sideMaxDia);
  const holes = [];
  const frontY = p.y1 + spec.H * ((402.3295 - 342.813) / (626.278 - 342.813));
  const backY = p.y3 + spec.H * ((1643.928 - 1419.979) / (1703.444 - 1419.979));
  const leftX = p.x0 + spec.H * ((517.076 - 325.734) / (609.201 - 325.734));
  const rightX = p.x2 + spec.H * ((1268.255 - 1176.131) / (1459.598 - 1176.131));

  TR002_evenCenters(p.x1, p.x2, frontBackCount).forEach((cx, index) => holes.push({
    id: 'frontHole' + (index + 1), shape: 'roundedRect', cx, cy: frontY, width: holeW, height: holeH
  }));
  TR002_evenCenters(p.x1, p.x2, frontBackCount).forEach((cx, index) => holes.push({
    id: 'backHole' + (index + 1), shape: 'roundedRect', cx, cy: backY, width: holeW, height: holeH
  }));
  TR002_evenCenters(p.y2, p.y3, sideCount).forEach((cy, index) => {
    holes.push({ id: 'leftHole' + (index + 1), shape: 'circle', cx: leftX, cy, width: sideDia, height: sideDia });
    holes.push({ id: 'rightHole' + (index + 1), shape: 'circle', cx: rightX, cy, width: sideDia, height: sideDia });
  });
  return holes;
}

function TR002_holePathElements(holes) {
  return holes.map(hole => TR002_path(TR002_roundedRectPath(hole.cx, hole.cy, hole.width, hole.height)));
}

function TR002_getLayout(W, D, H, cfg) {
  const spec = TR002_getSpec(W, D, H);
  const source = TR002_loadReferenceSvg();
  const tr = TR002_transformer(spec);
  const holes = TR002_buildParametricHoles(tr.params, spec, cfg || {});

  return {
    cutElements: source.cutElements.map(el => TR002_transformElement(el, tr)),
    cutFillElement: TR002_buildCutFillElement(source.cutElements, tr),
    foldElements: source.foldElements.map(el => TR002_transformElement(el, tr)),
    bleedElement: TR002_transformElement(source.bleedElement, tr),
    staticPerforationElements: source.staticPerforationElements.map(el => TR002_transformElement(el, tr)),
    holes,
    holeElements: TR002_holePathElements(holes),
    params: tr.params,
    labels: [
      { name: 'dust flap', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y0 + tr.params.y1) / 2 },
      { name: 'front', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y1 + tr.params.y2) / 2 },
      { name: 'base', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y2 + tr.params.y3) / 2 },
      { name: 'back', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y3 + tr.params.y4) / 2 },
      { name: 'dust flap', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y4 + tr.params.y5) / 2 },
      { name: 'lidSideFlap(L)', x: (tr.params.x0 + tr.params.x1) / 2, y: (tr.params.y2 + tr.params.y3) / 2 },
      { name: 'lidSideFlap(R)', x: (tr.params.x2 + tr.params.x3) / 2, y: (tr.params.y2 + tr.params.y3) / 2 }
    ],
    bounds: spec.bounds,
    transform: spec.transform,
    spec
  };
}

