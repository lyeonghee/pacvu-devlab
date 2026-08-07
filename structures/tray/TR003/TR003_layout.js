// ============================================================
// TR003_layout.js - parametric layout for TR003 EB Tray Box
// Reference SVG coordinates are converted through W/D/H formulas.
// Base: x-axis W, y-axis D. Side/front/back panels fold to H.
// ============================================================

const TR003_REF_PATH = './structures/tray/TR003/reference/TR003 317x496x133_(cutpath, bleedpath, foldingline).svg';

let TR003_SOURCE_CACHE = null;

function TR003_n(value) {
  return Number.isFinite(+value) ? (+value).toFixed(4) : '0';
}

function TR003_path(d) {
  return '<path d="' + d + '"/>';
}

function TR003_loadReferenceSvg() {
  if (TR003_SOURCE_CACHE) return TR003_SOURCE_CACHE;

  let text = '';
  if (typeof XMLHttpRequest !== 'undefined') {
    const req = new XMLHttpRequest();
    req.open('GET', TR003_REF_PATH, false);
    req.send(null);
    text = req.responseText || '';
  } else if (typeof require === 'function') {
    text = require('fs').readFileSync('structures/tray/TR003/reference/TR003 317x496x133_(cutpath, bleedpath, foldingline).svg', 'utf8');
  }

  const elements = (text.match(/<(?:path|line|polyline|rect)\b[^>]*\/>/g) || []);
  const cutElements = elements.filter(el =>
    el.includes('stroke="#e63f29"') && el.includes('stroke-width="2"')
  );
  const foldElements = elements.filter(el =>
    el.includes('stroke="#3f4f9f"') && el.includes('stroke-dasharray="3"')
  );
  const bleedElement = elements.find(el =>
    el.startsWith('<rect') &&
    el.includes('stroke="#3f4f9f"') &&
    !el.includes('stroke-dasharray')
  );

  TR003_SOURCE_CACHE = {
    cutElements,
    foldElements,
    bleedElement,
    staticPerforationElements: []
  };
  return TR003_SOURCE_CACHE;
}

function TR003_attr(el, name) {
  const match = el.match(new RegExp(name + '="([^"]*)"'));
  return match ? match[1] : '';
}

function TR003_numbers(value) {
  return (value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
}

function TR003_sourceFrame(spec) {
  const s = {
    x0: 555.281,
    x1: 930.768,
    x2: 1832.282,
    x3: 2207.763,
    y0: 177.751,
    y1: 555.203,
    y2: 1954.076,
    y3: 2331.528
  };
  const p = {
    x0: 0,
    x1: spec.H,
    x2: spec.H + spec.W,
    x3: spec.H + spec.W + spec.H,
    y0: 0,
    y1: spec.H,
    y2: spec.H + spec.D,
    y3: spec.H + spec.D + spec.H
  };
  return { s, p };
}

function TR003_piecewise(value, sourceStops, targetStops) {
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

function TR003_transformer(spec) {
  const frame = TR003_sourceFrame(spec);
  return {
    x(value) {
      return TR003_piecewise(value, [frame.s.x0, frame.s.x1, frame.s.x2, frame.s.x3], [frame.p.x0, frame.p.x1, frame.p.x2, frame.p.x3]);
    },
    y(value) {
      return TR003_piecewise(value, [frame.s.y0, frame.s.y1, frame.s.y2, frame.s.y3], [frame.p.y0, frame.p.y1, frame.p.y2, frame.p.y3]);
    },
    source: frame.s,
    params: frame.p
  };
}

function TR003_linePath(x1, y1, x2, y2) {
  return 'M' + TR003_n(x1) + ' ' + TR003_n(y1) + ' L' + TR003_n(x2) + ' ' + TR003_n(y2);
}

function TR003_polylineToPath(points, tr) {
  const nums = TR003_numbers(points);
  if (nums.length < 4) return '';
  let out = 'M' + TR003_n(tr.x(nums[0])) + ' ' + TR003_n(tr.y(nums[1]));
  for (let i = 2; i < nums.length - 1; i += 2) {
    out += ' L' + TR003_n(tr.x(nums[i])) + ' ' + TR003_n(tr.y(nums[i + 1]));
  }
  return out;
}

function TR003_pathToPolyline(d, tr) {
  const segs = TR003_sourcePathSegments(d);
  if (!segs.length) return '';
  let out = '';
  segs.forEach((seg, index) => {
    const x1 = tr.x(seg[0]);
    const y1 = tr.y(seg[1]);
    const x2 = tr.x(seg[2]);
    const y2 = tr.y(seg[3]);
    if (index === 0) out += 'M' + TR003_n(x1) + ' ' + TR003_n(y1);
    out += ' L' + TR003_n(x2) + ' ' + TR003_n(y2);
  });
  return out;
}

function TR003_transformElement(el, tr) {
  if (el.startsWith('<line')) {
    return TR003_path(TR003_linePath(
      tr.x(+TR003_attr(el, 'x1')),
      tr.y(+TR003_attr(el, 'y1')),
      tr.x(+TR003_attr(el, 'x2')),
      tr.y(+TR003_attr(el, 'y2'))
    ));
  }
  if (el.startsWith('<polyline')) {
    return TR003_path(TR003_polylineToPath(TR003_attr(el, 'points'), tr));
  }
  if (el.startsWith('<rect')) {
    const x = +TR003_attr(el, 'x');
    const y = +TR003_attr(el, 'y');
    const right = x + +TR003_attr(el, 'width');
    const bottom = y + +TR003_attr(el, 'height');
    const leftOut = tr.x(x);
    const topOut = tr.y(y);
    const rightOut = tr.x(right);
    const bottomOut = tr.y(bottom);
    const rx = Math.min(
      Math.abs(tr.x(x + +TR003_attr(el, 'rx')) - leftOut),
      (rightOut - leftOut) / 2,
      (bottomOut - topOut) / 2
    );
    const k = rx * 0.5522847498;
    return TR003_path([
      'M' + TR003_n(leftOut + rx) + ' ' + TR003_n(topOut),
      'L' + TR003_n(rightOut - rx) + ' ' + TR003_n(topOut),
      'C' + TR003_n(rightOut - rx + k) + ' ' + TR003_n(topOut) + ' ' + TR003_n(rightOut) + ' ' + TR003_n(topOut + rx - k) + ' ' + TR003_n(rightOut) + ' ' + TR003_n(topOut + rx),
      'L' + TR003_n(rightOut) + ' ' + TR003_n(bottomOut - rx),
      'C' + TR003_n(rightOut) + ' ' + TR003_n(bottomOut - rx + k) + ' ' + TR003_n(rightOut - rx + k) + ' ' + TR003_n(bottomOut) + ' ' + TR003_n(rightOut - rx) + ' ' + TR003_n(bottomOut),
      'L' + TR003_n(leftOut + rx) + ' ' + TR003_n(bottomOut),
      'C' + TR003_n(leftOut + rx - k) + ' ' + TR003_n(bottomOut) + ' ' + TR003_n(leftOut) + ' ' + TR003_n(bottomOut - rx + k) + ' ' + TR003_n(leftOut) + ' ' + TR003_n(bottomOut - rx),
      'L' + TR003_n(leftOut) + ' ' + TR003_n(topOut + rx),
      'C' + TR003_n(leftOut) + ' ' + TR003_n(topOut + rx - k) + ' ' + TR003_n(leftOut + rx - k) + ' ' + TR003_n(topOut) + ' ' + TR003_n(leftOut + rx) + ' ' + TR003_n(topOut),
      'Z'
    ].join(' '));
  }
  return TR003_path(TR003_pathToPolyline(TR003_attr(el, 'd'), tr));
}

function TR003_sourceElementSegments(el, tr) {
  if (el.startsWith('<line')) {
    return [[
      tr.x(+TR003_attr(el, 'x1')),
      tr.y(+TR003_attr(el, 'y1')),
      tr.x(+TR003_attr(el, 'x2')),
      tr.y(+TR003_attr(el, 'y2'))
    ]];
  }

  if (el.startsWith('<polyline')) {
    const nums = TR003_numbers(TR003_attr(el, 'points'));
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

  return TR003_sourcePathSegments(TR003_attr(el, 'd')).map(seg => [
    tr.x(seg[0]),
    tr.y(seg[1]),
    tr.x(seg[2]),
    tr.y(seg[3])
  ]);
}

function TR003_buildCutFillElement(elements, tr) {
  const segments = elements.flatMap(el => TR003_sourceElementSegments(el, tr));
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

  // Illustrator exports the outer contour as separate elements with tiny
  // endpoint gaps. Bridge only matching open endpoints (<= 0.25 mm); the
  // visible cut elements remain untouched and internal cut slits stay open.
  const openNodes = Array.from(nodes.values()).filter(node => node.links.length === 1);
  const bridged = new Set();
  openNodes.forEach(node => {
    if (bridged.has(node.key)) return;
    let nearest = null;
    let nearestDistance = Infinity;
    openNodes.forEach(candidate => {
      if (candidate.key === node.key || bridged.has(candidate.key)) return;
      const distance = Math.hypot(candidate.x - node.x, candidate.y - node.y);
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    });
    if (!nearest || nearestDistance > 0.25) return;
    const id = edges.length;
    edges.push({ id, a: node.key, b: nearest.key });
    node.links.push({ id, to: nearest.key });
    nearest.links.push({ id, to: node.key });
    bridged.add(node.key);
    bridged.add(nearest.key);
  });

  const start = Array.from(nodes.values()).sort((a, b) =>
    Math.abs(a.y - b.y) > unit ? a.y - b.y : a.x - b.x
  )[0];
  if (!start) return TR003_path('');

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
    (index === 0 ? 'M' : 'L') + TR003_n(point.x) + ' ' + TR003_n(point.y)
  ).join(' ') + ' Z';
  return TR003_path(d);
}

function TR003_sourcePathSegments(d) {
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

function TR003_clamp(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function TR003_holeCount(value, fallback) {
  return Math.round(TR003_clamp(value, fallback, 0, 8));
}

function TR003_evenCenters(min, max, count) {
  if (!count) return [];
  const span = max - min;
  return Array.from({ length: count }, (_, index) => min + span * ((index + 1) / (count + 1)));
}

function TR003_roundedRectPath(cx, cy, width, height) {
  const k = 0.5522847498;
  const rx = Math.min(width / 2, height / 2);
  const left = cx - width / 2;
  const right = cx + width / 2;
  const top = cy - height / 2;
  const bottom = cy + height / 2;
  return [
    'M' + TR003_n(left + rx) + ' ' + TR003_n(top),
    'L' + TR003_n(right - rx) + ' ' + TR003_n(top),
    'C' + TR003_n(right - rx + k * rx) + ' ' + TR003_n(top) + ' ' + TR003_n(right) + ' ' + TR003_n(top + rx - k * rx) + ' ' + TR003_n(right) + ' ' + TR003_n(top + rx),
    'L' + TR003_n(right) + ' ' + TR003_n(bottom - rx),
    'C' + TR003_n(right) + ' ' + TR003_n(bottom - rx + k * rx) + ' ' + TR003_n(right - rx + k * rx) + ' ' + TR003_n(bottom) + ' ' + TR003_n(right - rx) + ' ' + TR003_n(bottom),
    'L' + TR003_n(left + rx) + ' ' + TR003_n(bottom),
    'C' + TR003_n(left + rx - k * rx) + ' ' + TR003_n(bottom) + ' ' + TR003_n(left) + ' ' + TR003_n(bottom - rx + k * rx) + ' ' + TR003_n(left) + ' ' + TR003_n(bottom - rx),
    'L' + TR003_n(left) + ' ' + TR003_n(top + rx),
    'C' + TR003_n(left) + ' ' + TR003_n(top + rx - k * rx) + ' ' + TR003_n(left + rx - k * rx) + ' ' + TR003_n(top) + ' ' + TR003_n(left + rx) + ' ' + TR003_n(top),
    'Z'
  ].join(' ');
}

function TR003_buildParametricHoles(p, spec, cfg) {
  const frontBackCount = TR003_holeCount(cfg.frontBackHoleCount, 1);
  const sideCount = TR003_holeCount(cfg.leftRightHoleCount, 1);
  const holeH = TR003_clamp(cfg.frontBackHoleHeight, 16, 4, spec.H * 0.72);
  const holeMaxW = frontBackCount ? Math.min(spec.W * 0.8, spec.W * 0.75 / frontBackCount) : spec.W;
  const holeW = TR003_clamp(cfg.frontBackHoleWidth, 30, 6, holeMaxW);
  const sideMaxDia = sideCount ? Math.min(spec.H * 0.72, spec.D * 0.75 / sideCount) : spec.H;
  const sideDia = TR003_clamp(cfg.leftRightHoleDiameter, 15, 4, sideMaxDia);
  const holes = [];
  const frontY = p.y1 + spec.H * ((402.3295 - 342.813) / (626.278 - 342.813));
  const backY = p.y3 + spec.H * ((1643.928 - 1419.979) / (1703.444 - 1419.979));
  const leftX = p.x0 + spec.H * ((517.076 - 325.734) / (609.201 - 325.734));
  const rightX = p.x2 + spec.H * ((1268.255 - 1176.131) / (1459.598 - 1176.131));

  TR003_evenCenters(p.x1, p.x2, frontBackCount).forEach((cx, index) => holes.push({
    id: 'frontHole' + (index + 1), shape: 'roundedRect', cx, cy: frontY, width: holeW, height: holeH
  }));
  TR003_evenCenters(p.x1, p.x2, frontBackCount).forEach((cx, index) => holes.push({
    id: 'backHole' + (index + 1), shape: 'roundedRect', cx, cy: backY, width: holeW, height: holeH
  }));
  TR003_evenCenters(p.y2, p.y3, sideCount).forEach((cy, index) => {
    holes.push({ id: 'leftHole' + (index + 1), shape: 'circle', cx: leftX, cy, width: sideDia, height: sideDia });
    holes.push({ id: 'rightHole' + (index + 1), shape: 'circle', cx: rightX, cy, width: sideDia, height: sideDia });
  });
  return holes;
}

function TR003_holePathElements(holes) {
  return holes.map(hole => TR003_path(TR003_roundedRectPath(hole.cx, hole.cy, hole.width, hole.height)));
}

function TR003_buildPanelFill(p, spec) {
  const left = p.x0;
  const top = p.y0;
  const right = p.x3;
  const bottom = p.y3;
  // Reference outer cut corner: 39.506 source units over a 375.487-unit H panel.
  // Keeping this ratio makes the white panel stop on the red cutPath at every size.
  const radius = spec.H * (39.506 / 375.487);
  const k = radius * 0.5522847498;
  return TR003_path([
    'M' + TR003_n(left + radius) + ' ' + TR003_n(top),
    'L' + TR003_n(right - radius) + ' ' + TR003_n(top),
    'C' + TR003_n(right - radius + k) + ' ' + TR003_n(top) + ' ' + TR003_n(right) + ' ' + TR003_n(top + radius - k) + ' ' + TR003_n(right) + ' ' + TR003_n(top + radius),
    'L' + TR003_n(right) + ' ' + TR003_n(bottom - radius),
    'C' + TR003_n(right) + ' ' + TR003_n(bottom - radius + k) + ' ' + TR003_n(right - radius + k) + ' ' + TR003_n(bottom) + ' ' + TR003_n(right - radius) + ' ' + TR003_n(bottom),
    'L' + TR003_n(left + radius) + ' ' + TR003_n(bottom),
    'C' + TR003_n(left + radius - k) + ' ' + TR003_n(bottom) + ' ' + TR003_n(left) + ' ' + TR003_n(bottom - radius + k) + ' ' + TR003_n(left) + ' ' + TR003_n(bottom - radius),
    'L' + TR003_n(left) + ' ' + TR003_n(top + radius),
    'C' + TR003_n(left) + ' ' + TR003_n(top + radius - k) + ' ' + TR003_n(left + radius - k) + ' ' + TR003_n(top) + ' ' + TR003_n(left + radius) + ' ' + TR003_n(top),
    'Z'
  ].join(' '));
}

function TR003_getLayout(W, D, H, cfg) {
  const spec = TR003_getSpec(W, D, H);
  const source = TR003_loadReferenceSvg();
  const tr = TR003_transformer(spec);
  const holes = [];

  return {
    cutElements: source.cutElements.map(el => TR003_transformElement(el, tr)),
    cutFillElement: TR003_buildCutFillElement(source.cutElements, tr),
    foldElements: source.foldElements.map(el => TR003_transformElement(el, tr)),
    bleedElement: TR003_transformElement(source.bleedElement, tr),
    staticPerforationElements: source.staticPerforationElements.map(el => TR003_transformElement(el, tr)),
    holes,
    holeElements: TR003_holePathElements(holes),
    params: tr.params,
    labels: [
      { name: 'front', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y0 + tr.params.y1) / 2 },
      { name: 'base', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y1 + tr.params.y2) / 2 },
      { name: 'back', x: (tr.params.x1 + tr.params.x2) / 2, y: (tr.params.y2 + tr.params.y3) / 2 },
      { name: 'lidSideFlap(L)', x: (tr.params.x0 + tr.params.x1) / 2, y: (tr.params.y1 + tr.params.y2) / 2 },
      { name: 'lidSideFlap(R)', x: (tr.params.x2 + tr.params.x3) / 2, y: (tr.params.y1 + tr.params.y2) / 2 }
    ],
    bounds: spec.bounds,
    transform: spec.transform,
    spec
  };
}

