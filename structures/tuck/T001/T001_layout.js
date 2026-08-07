// ============================================================
// T001_layout.js - T001 coordinate, panel, bounds, and resize calculations
// Depends on T001_spec.js.
// ============================================================

function T001_piecewise(value, sourceAnchors, targetAnchors) {
  if (value <= sourceAnchors[0]) {
    const s = (targetAnchors[1] - targetAnchors[0]) / (sourceAnchors[1] - sourceAnchors[0]);
    return targetAnchors[0] + (value - sourceAnchors[0]) * s;
  }
  for (let i = 0; i < sourceAnchors.length - 1; i += 1) {
    if (value <= sourceAnchors[i + 1]) {
      const s = (targetAnchors[i + 1] - targetAnchors[i]) / (sourceAnchors[i + 1] - sourceAnchors[i]);
      return targetAnchors[i] + (value - sourceAnchors[i]) * s;
    }
  }
  const n = sourceAnchors.length - 1;
  const s = (targetAnchors[n] - targetAnchors[n - 1]) / (sourceAnchors[n] - sourceAnchors[n - 1]);
  return targetAnchors[n] + (value - sourceAnchors[n]) * s;
}

function T001_createMapper(spec) {
  const src = spec.source;
  const grid = spec.grid;
  const sx = [src.xGlueL, src.xFrontL, src.xFrontR, src.xSideLR, src.xBackR, src.xSideRR];
  const tx = [grid.xGlueL, grid.xFrontL, grid.xFrontR, grid.xSideLR, grid.xBackR, grid.xSideRR];
  const sy = [src.yTop, src.yLidFold, src.yBodyTop, src.yBodyBottom, src.yBottomLockBend, src.yBottomLockEnd];
  const ty = [grid.yTop, grid.yLidFold, grid.yBodyTop, grid.yBodyBottom, grid.yBottomLockBend, grid.yBottomLockEnd];

  return {
    point(x, y) {
      return {
        x: T001_piecewise(x, sx, tx),
        y: T001_piecewise(y, sy, ty)
      };
    },
    x(x) {
      return T001_piecewise(x, sx, tx);
    },
    y(y) {
      return T001_piecewise(y, sy, ty);
    }
  };
}
const T001_COORDINATE_TOLERANCE = 0.001;

function T001_validateCoordinateContract(spec) {
  const g = spec.grid;
  const checks = [
    { id: 'frontWidth', actual: g.xFrontR - g.xFrontL, expected: spec.W },
    { id: 'sideLeftDepth', actual: g.xSideLR - g.xFrontR, expected: spec.D },
    { id: 'backWidth', actual: g.xBackR - g.xSideLR, expected: spec.W },
    { id: 'sideRightDepth', actual: g.xSideRR - g.xBackR, expected: spec.D },
    { id: 'bodyHeight', actual: g.yBodyBottom - g.yBodyTop, expected: spec.H },
    { id: 'bottomLockBendDepth', actual: g.yBottomLockBend - g.yBodyBottom, expected: spec.D * 0.5 }
  ].map(check => Object.assign({}, check, {
    error: Math.abs(check.actual - check.expected)
  }));
  const failures = checks.filter(check => check.error > T001_COORDINATE_TOLERANCE);

  if (failures.length) {
    const details = failures.map(check =>
      check.id + ': actual=' + T001_num(check.actual) +
      ', expected=' + T001_num(check.expected) +
      ', error=' + T001_num(check.error)
    ).join('; ');
    throw new Error('T001 coordinate contract failed (tolerance ' + T001_COORDINATE_TOLERANCE + 'mm): ' + details);
  }

  return {
    tolerance: T001_COORDINATE_TOLERANCE,
    valid: true,
    checks
  };
}

function T001_tokenizePath(d) {
  return d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
}

function T001_isCommand(token) {
  return /^[a-zA-Z]$/.test(token);
}

function T001_pathPoint(mapper, point) {
  const p = mapper.point(point.x, point.y);
  return T001_num(p.x) + ' ' + T001_num(p.y);
}

function T001_transformPathD(d, mapper) {
  const tokens = T001_tokenizePath(d);
  const out = [];
  let i = 0;
  let cmd = '';
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let previousC2 = null;

  function read() {
    return Number(tokens[i++]);
  }

  function hasNumber() {
    return i < tokens.length && !T001_isCommand(tokens[i]);
  }

  while (i < tokens.length) {
    if (T001_isCommand(tokens[i])) {
      cmd = tokens[i++];
    }

    const lower = cmd.toLowerCase();
    const relative = cmd === lower;

    if (lower === 'z') {
      out.push('Z');
      current = { x: start.x, y: start.y };
      previousC2 = null;
      continue;
    }

    if (lower === 'm') {
      let first = true;
      while (hasNumber()) {
        const x = read();
        const y = read();
        const next = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        out.push((first ? 'M ' : 'L ') + T001_pathPoint(mapper, next));
        current = next;
        if (first) {
          start = { x: current.x, y: current.y };
        }
        first = false;
        previousC2 = null;
      }
      cmd = relative ? 'l' : 'L';
      continue;
    }

    if (lower === 'l') {
      while (hasNumber()) {
        const x = read();
        const y = read();
        const next = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        out.push('L ' + T001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'h') {
      while (hasNumber()) {
        const x = read();
        const next = { x: relative ? current.x + x : x, y: current.y };
        out.push('L ' + T001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'v') {
      while (hasNumber()) {
        const y = read();
        const next = { x: current.x, y: relative ? current.y + y : y };
        out.push('L ' + T001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'c') {
      while (hasNumber()) {
        const c1 = { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const end = { x: read(), y: read() };
        const a1 = relative ? { x: current.x + c1.x, y: current.y + c1.y } : c1;
        const a2 = relative ? { x: current.x + c2.x, y: current.y + c2.y } : c2;
        const ae = relative ? { x: current.x + end.x, y: current.y + end.y } : end;
        out.push('C ' + T001_pathPoint(mapper, a1) + ' ' + T001_pathPoint(mapper, a2) + ' ' + T001_pathPoint(mapper, ae));
        current = ae;
        previousC2 = a2;
      }
      continue;
    }

    if (lower === 's') {
      while (hasNumber()) {
        const c1 = previousC2 ? {
          x: current.x * 2 - previousC2.x,
          y: current.y * 2 - previousC2.y
        } : { x: current.x, y: current.y };
        const c2 = { x: read(), y: read() };
        const end = { x: read(), y: read() };
        const a2 = relative ? { x: current.x + c2.x, y: current.y + c2.y } : c2;
        const ae = relative ? { x: current.x + end.x, y: current.y + end.y } : end;
        out.push('C ' + T001_pathPoint(mapper, c1) + ' ' + T001_pathPoint(mapper, a2) + ' ' + T001_pathPoint(mapper, ae));
        current = ae;
        previousC2 = a2;
      }
      continue;
    }

    throw new Error('Unsupported SVG path command for T001 template: ' + cmd);
  }

  return out.join(' ');
}

function T001_attr(el, name) {
  const match = el.match(new RegExp('\\s' + name + '="([^"]*)"'));
  return match ? match[1] : '';
}

function T001_transformElement(el, mapper) {
  if (/^<path\b/.test(el)) {
    const d = T001_attr(el, 'd');
    return el.replace(/d="[^"]*"/, 'd="' + T001_transformPathD(d, mapper) + '"');
  }

  if (/^<polyline\b/.test(el)) {
    const nums = T001_attr(el, 'points').match(/-?\d+(?:\.\d+)?/g) || [];
    const mapped = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      const p = mapper.point(Number(nums[i]), Number(nums[i + 1]));
      mapped.push(T001_num(p.x) + ',' + T001_num(p.y));
    }
    return el.replace(/points="[^"]*"/, 'points="' + mapped.join(' ') + '"');
  }

  if (/^<line\b/.test(el)) {
    const p1 = mapper.point(Number(T001_attr(el, 'x1')), Number(T001_attr(el, 'y1')));
    const p2 = mapper.point(Number(T001_attr(el, 'x2')), Number(T001_attr(el, 'y2')));
    return el
      .replace(/x1="[^"]*"/, 'x1="' + T001_num(p1.x) + '"')
      .replace(/y1="[^"]*"/, 'y1="' + T001_num(p1.y) + '"')
      .replace(/x2="[^"]*"/, 'x2="' + T001_num(p2.x) + '"')
      .replace(/y2="[^"]*"/, 'y2="' + T001_num(p2.y) + '"');
  }

  return el;
}

function T001_restyleElement(el, className) {
  const out = el
    .replace(/\sfill="[^"]*"/g, '')
    .replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '')
    .replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '')
    .replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '');
  return out.replace(/\/>$/, ' class="' + className + '"/>');
}

function T001_elementToPathD(el) {
  if (/^<path\b/.test(el)) {
    return T001_attr(el, 'd');
  }
  if (/^<polyline\b/.test(el)) {
    const nums = T001_attr(el, 'points').match(/-?\d+(?:\.\d+)?/g) || [];
    const parts = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      parts.push((i === 0 ? 'M ' : 'L ') + T001_num(nums[i]) + ' ' + T001_num(nums[i + 1]));
    }
    return parts.join(' ');
  }
  if (/^<line\b/.test(el)) {
    return [
      'M ' + T001_num(T001_attr(el, 'x1')) + ' ' + T001_num(T001_attr(el, 'y1')),
      'L ' + T001_num(T001_attr(el, 'x2')) + ' ' + T001_num(T001_attr(el, 'y2'))
    ].join(' ');
  }
  return '';
}

function T001_parseAbsolutePath(d) {
  const tokens = T001_tokenizePath(d);
  const segments = [];
  let i = 0;
  let cmd = '';
  let current = null;
  let start = null;

  function read() {
    return Number(tokens[i++]);
  }

  function hasNumber() {
    return i < tokens.length && !T001_isCommand(tokens[i]);
  }

  while (i < tokens.length) {
    if (T001_isCommand(tokens[i])) {
      cmd = tokens[i++];
    }
    const upper = cmd.toUpperCase();

    if (upper === 'M') {
      while (hasNumber()) {
        const point = { x: read(), y: read() };
        if (!current) {
          current = point;
          start = point;
        } else {
          segments.push({ type: 'L', from: current, to: point });
          current = point;
        }
        cmd = 'L';
      }
    } else if (upper === 'L') {
      while (hasNumber()) {
        const point = { x: read(), y: read() };
        segments.push({ type: 'L', from: current, to: point });
        current = point;
      }
    } else if (upper === 'C') {
      while (hasNumber()) {
        const c1 = { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const point = { x: read(), y: read() };
        segments.push({ type: 'C', from: current, c1, c2, to: point });
        current = point;
      }
    } else if (upper === 'Z') {
      if (current && start) {
        segments.push({ type: 'L', from: current, to: start });
        current = start;
      }
    } else {
      throw new Error('Unsupported absolute path command for T001 fill: ' + cmd);
    }
  }

  return {
    start,
    end: current,
    segments
  };
}

function T001_distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function T001_segmentsToD(start, segments) {
  const out = ['M ' + T001_num(start.x) + ' ' + T001_num(start.y)];
  segments.forEach(segment => {
    if (segment.type === 'L') {
      out.push('L ' + T001_num(segment.to.x) + ' ' + T001_num(segment.to.y));
    } else if (segment.type === 'C') {
      out.push(
        'C ' +
        T001_num(segment.c1.x) + ' ' + T001_num(segment.c1.y) + ' ' +
        T001_num(segment.c2.x) + ' ' + T001_num(segment.c2.y) + ' ' +
        T001_num(segment.to.x) + ' ' + T001_num(segment.to.y)
      );
    }
  });
  out.push('Z');
  return out.join(' ');
}

function T001_cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
  };
}

function T001_flattenPathD(d) {
  const parsed = T001_parseAbsolutePath(d);
  if (!parsed.start) return [];
  const points = [{ x: parsed.start.x, y: parsed.start.y }];
  parsed.segments.forEach(segment => {
    if (segment.type === 'L') {
      points.push({ x: segment.to.x, y: segment.to.y });
    } else if (segment.type === 'C') {
      const chord = T001_distance(segment.from, segment.to);
      const control = T001_distance(segment.from, segment.c1) +
        T001_distance(segment.c1, segment.c2) +
        T001_distance(segment.c2, segment.to);
      const steps = Math.max(8, Math.min(32, Math.ceil((control + chord) / 8)));
      for (let i = 1; i <= steps; i += 1) {
        points.push(T001_cubicPoint(segment.from, segment.c1, segment.c2, segment.to, i / steps));
      }
    }
  });
  return points.filter((point, index) => {
    if (index === 0) return true;
    return T001_distance(point, points[index - 1]) > 0.01;
  });
}

function T001_polygonBounds(points) {
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

function T001_polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function T001_polygonToPath(points) {
  if (!points.length) return '';
  return points.map((point, index) =>
    (index === 0 ? 'M ' : 'L ') + T001_num(point.x) + ' ' + T001_num(point.y)
  ).join(' ') + ' Z';
}

function T001_lineIntersection(a1, a2, b1, b2) {
  const x1 = a1.x;
  const y1 = a1.y;
  const x2 = a2.x;
  const y2 = a2.y;
  const x3 = b1.x;
  const y3 = b1.y;
  const x4 = b2.x;
  const y4 = b2.y;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 0.000001) return null;
  return {
    x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den,
    y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den
  };
}

function T001_offsetPolygonFallback(points, offset) {
  if (points.length < 3) return null;
  const baseBounds = T001_polygonBounds(points);

  function offsetWithSide(side) {
    const shifted = [];
    for (let i = 0; i < points.length; i += 1) {
      const prev = points[(i - 1 + points.length) % points.length];
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const pDx = curr.x - prev.x;
      const pDy = curr.y - prev.y;
      const nDx = next.x - curr.x;
      const nDy = next.y - curr.y;
      const pLen = Math.sqrt(pDx * pDx + pDy * pDy) || 1;
      const nLen = Math.sqrt(nDx * nDx + nDy * nDy) || 1;
      const pNormal = { x: (-pDy / pLen) * side, y: (pDx / pLen) * side };
      const nNormal = { x: (-nDy / nLen) * side, y: (nDx / nLen) * side };
      const a1 = { x: prev.x + pNormal.x * offset, y: prev.y + pNormal.y * offset };
      const a2 = { x: curr.x + pNormal.x * offset, y: curr.y + pNormal.y * offset };
      const b1 = { x: curr.x + nNormal.x * offset, y: curr.y + nNormal.y * offset };
      const b2 = { x: next.x + nNormal.x * offset, y: next.y + nNormal.y * offset };
      let point = T001_lineIntersection(a1, a2, b1, b2);
      if (!point || T001_distance(point, curr) > 24) {
        const mx = pNormal.x + nNormal.x;
        const my = pNormal.y + nNormal.y;
        const mLen = Math.sqrt(mx * mx + my * my) || 1;
        point = { x: curr.x + (mx / mLen) * offset, y: curr.y + (my / mLen) * offset };
      }
      shifted.push(point);
    }
    return shifted;
  }

  function expansionScore(candidate) {
    const bounds = T001_polygonBounds(candidate);
    return (baseBounds.minX - bounds.minX) +
      (baseBounds.minY - bounds.minY) +
      (bounds.maxX - baseBounds.maxX) +
      (bounds.maxY - baseBounds.maxY);
  }

  const a = offsetWithSide(1);
  const b = offsetWithSide(-1);
  return expansionScore(a) >= expansionScore(b) ? a : b;
}

function T001_offsetPolygonWithClipper(points, offset) {
  if (typeof ClipperLib === 'undefined' || !points.length) {
    return T001_offsetPolygonFallback(points, offset);
  }
  const scale = 1000;
  const baseBounds = T001_polygonBounds(points);
  const source = points.map(point => ({
    X: Math.round(point.x * scale),
    Y: Math.round(point.y * scale)
  }));

  function run(delta) {
    const co = new ClipperLib.ClipperOffset(2, 0.25 * scale);
    co.AddPath(source, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
    const solution = new ClipperLib.Paths();
    co.Execute(solution, delta * scale);
    if (!solution.length) return null;
    const largest = solution.reduce((best, path) =>
      Math.abs(ClipperLib.Clipper.Area(path)) > Math.abs(ClipperLib.Clipper.Area(best)) ? path : best
    , solution[0]);
    return largest.map(point => ({ x: point.X / scale, y: point.Y / scale }));
  }

  let result = run(offset);
  if (!result) return null;
  let resultBounds = T001_polygonBounds(result);
  const expands = resultBounds.minX <= baseBounds.minX - 1 &&
    resultBounds.minY <= baseBounds.minY - 1 &&
    resultBounds.maxX >= baseBounds.maxX + 1 &&
    resultBounds.maxY >= baseBounds.maxY + 1;
  if (!expands) {
    result = run(-offset);
    resultBounds = result ? T001_polygonBounds(result) : resultBounds;
  }
  if (result && T001_polygonArea(result) > 0) {
    result = result.slice().reverse();
  }
  return result;
}

function T001_buildBleedPathFromCut(fillPath) {
  const points = T001_flattenPathD(fillPath);
  const offsetPoints = T001_offsetPolygonWithClipper(points, T001_BLEED_OFFSET);
  return offsetPoints ? T001_polygonToPath(offsetPoints) : '';
}

function T001_reverseParsedPath(parsed) {
  const reversed = parsed.segments.slice().reverse().map(segment => {
    if (segment.type === 'L') {
      return { type: 'L', from: segment.to, to: segment.from };
    }
    return {
      type: 'C',
      from: segment.to,
      c1: segment.c2,
      c2: segment.c1,
      to: segment.from
    };
  });
  return {
    start: parsed.end,
    end: parsed.start,
    segments: reversed
  };
}

function T001_buildCutFillPath(cutElements) {
  const paths = cutElements
    .map(el => T001_parseAbsolutePath(T001_elementToPathD(el)))
    .filter(path => path.start && path.end && path.segments.length);
  if (!paths.length) return '';

  const ordered = [paths.shift()];
  while (paths.length) {
    const currentEnd = ordered[ordered.length - 1].end;
    let bestIndex = 0;
    let bestReverse = false;
    let bestDistance = Infinity;
    paths.forEach((path, index) => {
      const startDistance = T001_distance(currentEnd, path.start);
      const endDistance = T001_distance(currentEnd, path.end);
      if (startDistance < bestDistance) {
        bestDistance = startDistance;
        bestIndex = index;
        bestReverse = false;
      }
      if (endDistance < bestDistance) {
        bestDistance = endDistance;
        bestIndex = index;
        bestReverse = true;
      }
    });
    const next = paths.splice(bestIndex, 1)[0];
    ordered.push(bestReverse ? T001_reverseParsedPath(next) : next);
  }

  const start = ordered[0].start;
  const segments = [];
  ordered.forEach((path, index) => {
    if (index > 0 && T001_distance(segments[segments.length - 1].to, path.start) > 0.02) {
      segments.push({ type: 'L', from: segments[segments.length - 1].to, to: path.start });
    }
    path.segments.forEach(segment => segments.push(segment));
  });
  return T001_segmentsToD(start, segments);
}

function T001_extractSourceElements(sourceSvg) {
  if (!sourceSvg) return T001_SOURCE_ELEMENTS;
  const elements = sourceSvg.match(/<(?:path|line|polyline)\b[^>]*>/g) || [];
  const cutElements = elements.filter(el =>
    /stroke="#ee3924"/.test(el) &&
    !/d="M890\.995,303\.869"/.test(el)
  );
  const foldElements = elements.filter(el =>
    /stroke="#(?:263aed|3b53a4)"/.test(el) &&
    /stroke-dasharray/.test(el)
  );
  const bleedElements = elements.filter(el =>
    /^<path\b/.test(el) &&
    /stroke="#263aed"/.test(el) &&
    !/stroke-dasharray/.test(el)
  );

  if (!cutElements.length || !foldElements.length || !bleedElements.length) {
    throw new Error('T001 source SVG layer extraction failed.');
  }

  return { cutElements, foldElements, bleedElement: bleedElements[0] };
}

function T001_isAuxiliaryCutElement(el) {
  return /stroke-width="\.5"/.test(el) ||
    /x1="243\.462"\s+y1="309\.538"/.test(el);
}

function T001_isAuxiliaryFoldElement(el) {
  return /x1="243\.653"\s+y1="471\.222"/.test(el);
}

function T001_isThumbNotchCutElement(el) {
  return /d="M627\.373,309\.538c1\.527,12\.936/.test(el);
}

function T001_noNotchCutBridgeElement() {
  return '<line x1="627.373" y1="309.538" x2="678.397" y2="309.538" fill="none" stroke="#ee3924" stroke-miterlimit="2.613"/>';
}

function T001_noNotchBleedElement(el) {
  const d = T001_attr(el, 'd');
  const noNotchD = d.replace(
    'h-52.441l-8.115.103-.331,7.403c-1.021,8.649-8.359,15.172-17.067,15.172s-16.045-6.522-17.066-15.171l-.233-7.216-8.212-.292h-52.441',
    'h-156.036'
  );
  return el.replace(/d="[^"]*"/, 'd="' + noNotchD + '"');
}

function T001_numbersForBounds(el) {
  if (/^<path\b/.test(el)) {
    return T001_attr(el, 'd').match(/-?\d+(?:\.\d+)?/g) || [];
  }
  if (/^<polyline\b/.test(el)) {
    return T001_attr(el, 'points').match(/-?\d+(?:\.\d+)?/g) || [];
  }
  if (/^<line\b/.test(el)) {
    return [
      T001_attr(el, 'x1'),
      T001_attr(el, 'y1'),
      T001_attr(el, 'x2'),
      T001_attr(el, 'y2')
    ];
  }
  return [];
}

function T001_boundsFromElements(elements) {
  const xs = [];
  const ys = [];
  elements.forEach(el => {
    const nums = T001_numbersForBounds(el);
    for (let i = 0; i < nums.length - 1; i += 2) {
      xs.push(Number(nums[i]));
      ys.push(Number(nums[i + 1]));
    }
  });
  return {
    minX: T001_num(Math.min(...xs)),
    minY: T001_num(Math.min(...ys)),
    maxX: T001_num(Math.max(...xs)),
    maxY: T001_num(Math.max(...ys)),
    width: T001_num(Math.max(...xs) - Math.min(...xs)),
    height: T001_num(Math.max(...ys) - Math.min(...ys))
  };
}

function T001_getLayout(W, D, H, sourceSvg) {
  const spec = T001_getSpec({ W, D, H });
  const coordinateContract = T001_validateCoordinateContract(spec);
  const mapper = T001_createMapper(spec);
  const sourceElements = T001_extractSourceElements(sourceSvg);
  const sourceCutElements = sourceElements.cutElements
    .filter(el => !T001_isAuxiliaryCutElement(el))
    .filter(el => T001_hasThumbNotch(spec) || !T001_isThumbNotchCutElement(el));
  if (!T001_hasThumbNotch(spec)) {
    sourceCutElements.push(T001_noNotchCutBridgeElement());
  }
  const sourceBleedElement = T001_hasThumbNotch(spec)
    ? sourceElements.bleedElement
    : T001_noNotchBleedElement(sourceElements.bleedElement);
  const cutElements = sourceCutElements.map(el => T001_transformElement(el, mapper));
  const foldElements = sourceElements.foldElements
    .filter(el => !T001_isAuxiliaryFoldElement(el))
    .map(el => T001_transformElement(el, mapper));
  const fillPath = T001_buildCutFillPath(cutElements);
  const offsetBleedPath = T001_buildBleedPathFromCut(fillPath);
  const bleedElement = offsetBleedPath
    ? '<path d="' + offsetBleedPath + '" fill="none" stroke="#263aed" stroke-miterlimit="10"/>'
    : T001_transformElement(sourceBleedElement, mapper);
  const allElements = [bleedElement].concat(cutElements, foldElements);
  const dielineBounds = T001_boundsFromElements(cutElements);
  const bleedBounds = T001_boundsFromElements([bleedElement]);
  const renderBounds = T001_boundsFromElements(allElements);

  return {
    spec,
    grid: spec.grid,
    coordinateContract,
    cutElements,
    foldElements,
    fillPath,
    bleedElement,
    labels: T001_buildLabels(spec),
    bounds: dielineBounds,
    dielineBounds,
    bleedBounds,
    renderBounds
  };
}

function T001_buildLabels(spec) {
  const g = spec.grid;
  const lidSideY = g.yBodyTop - spec.D * (28 / 57);
  return [
    { name: 'Glue', x: (g.xGlueL + g.xFrontL) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Front', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Side(L)', x: (g.xFrontR + g.xSideLR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Back', x: (g.xSideLR + g.xBackR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Side(R)', x: (g.xBackR + g.xSideRR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Upper Tuck', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yTop + g.yLidFold) / 2 },
    { name: 'Lid Top', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yLidFold + g.yBodyTop) / 2 },
    { name: 'Lid Side Flap(L)', x: (g.xFrontR + g.xSideLR) / 2, y: (lidSideY + g.yBodyTop) / 2 },
    { name: 'Lid Side Flap(R)', x: (g.xBackR + g.xSideRR) / 2, y: (lidSideY + g.yBodyTop) / 2 },
    { name: 'Bottom Lock A', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 },
    { name: 'Bottom Lock(L)', x: (g.xFrontR + g.xSideLR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 },
    { name: 'Bottom Lock B', x: (g.xSideLR + g.xBackR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 },
    { name: 'Bottom Lock(R)', x: (g.xBackR + g.xSideRR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 }
  ].concat(T001_hasThumbNotch(spec)
    ? [{ name: 'Thumb Notch', x: (g.xSideLR + g.xBackR) / 2, y: g.yBodyTop + spec.D * (5 / 57) }]
    : []);
}
