// B002_layout.js - Bakery Handle Box layout, outline and 3 mm bleed.

function B002_attr(element, name) {
  const match = element.match(new RegExp(name + '="([^"]*)"'));
  return match ? match[1] : '';
}

function B002_pointPath(points, closePath) {
  if (!points.length) return '';
  return points.map((point, index) => (index ? 'L' : 'M') + B002_num(point.x) + ' ' + B002_num(point.y)).join(' ') + (closePath ? ' Z' : '');
}

function B002_transformPoint(point, transform) {
  return { x: point.x * transform.a + transform.e, y: point.y * transform.d + transform.f };
}

function B002_sampleElement(element) {
  if (element.startsWith('<line')) {
    return [
      { x: Number(B002_attr(element, 'x1')), y: Number(B002_attr(element, 'y1')) },
      { x: Number(B002_attr(element, 'x2')), y: Number(B002_attr(element, 'y2')) }
    ];
  }
  if (element.startsWith('<polyline')) {
    const values = (B002_attr(element, 'points').match(/[-+]?\d*\.?\d+/g) || []).map(Number);
    const points = [];
    for (let i = 0; i < values.length - 1; i += 2) points.push({ x: values[i], y: values[i + 1] });
    return points;
  }
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  node.setAttribute('d', B002_attr(element, 'd'));
  const length = node.getTotalLength();
  const steps = Math.max(2, Math.ceil(length / 4));
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const point = node.getPointAtLength(length * i / steps);
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

function B002_distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function B002_joinOutline(elements) {
  const segments = elements.map(B002_sampleElement).filter(points => points.length > 1);
  if (!segments.length) return [];
  let longestIndex = 0;
  segments.forEach((points, index) => { if (points.length > segments[longestIndex].length) longestIndex = index; });
  let outline = segments.splice(longestIndex, 1)[0].slice();
  while (segments.length) {
    const start = outline[0], end = outline[outline.length - 1];
    let best = { distance: Infinity, index: 0, mode: '' };
    segments.forEach((points, index) => {
      const first = points[0], last = points[points.length - 1];
      [[B002_distance(end, first), 'end-first'], [B002_distance(end, last), 'end-last'],
       [B002_distance(start, last), 'start-last'], [B002_distance(start, first), 'start-first']]
        .forEach(option => { if (option[0] < best.distance) best = { distance: option[0], index, mode: option[1] }; });
    });
    let next = segments.splice(best.index, 1)[0];
    if (best.mode === 'end-last' || best.mode === 'start-first') next.reverse();
    if (best.mode.startsWith('end')) outline = outline.concat(next.slice(1));
    else outline = next.slice(0, -1).concat(outline);
  }
  return outline;
}

function B002_bodyAnchor(id, x, y) {
  return { id, x: B002_num(x), y: B002_num(y) };
}

function B002_bodyOffset(point, vector, distance, id) {
  return B002_bodyAnchor(id, point.x + vector.x * distance, point.y + vector.y * distance);
}

function B002_bodyNormal(a, b, side) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return side === 'left'
    ? { x: -dy / length, y: dx / length }
    : { x: dy / length, y: -dx / length };
}

// Body-only W/D/H contract. Handle, Lock and Bottom intentionally remain
// outside this contract until the shared body folds are approved.
function B002_buildBodyGeometry(spec) {
  const W = spec.W;
  const D = spec.D;
  const H = spec.H;
  const topW = W * (spec.base.topW / spec.base.W);
  const taper = (W - topW) / 2;
  const unit = spec.base.unitToMm;
  const centerX = ((707.885 + 970.069) / 2) * unit;
  const topY = 586.523 * unit;

  const frontTopLeft = B002_bodyAnchor('frontTopLeft', centerX - topW / 2, topY);
  const frontTopRight = B002_bodyAnchor('frontTopRight', centerX + topW / 2, topY);
  const frontBottomLeft = B002_bodyAnchor('frontBottomLeft', centerX - W / 2, topY + H);
  const frontBottomRight = B002_bodyAnchor('frontBottomRight', centerX + W / 2, topY + H);

  const leftNormal = B002_bodyNormal(frontTopLeft, frontBottomLeft, 'left');
  const rightNormal = B002_bodyNormal(frontTopRight, frontBottomRight, 'right');
  const sideLeftTop = B002_bodyOffset(frontTopLeft, leftNormal, D, 'sideLeftTop');
  const sideLeftBottom = B002_bodyOffset(frontBottomLeft, leftNormal, D, 'sideLeftBottom');
  const sideRightTop = B002_bodyOffset(frontTopRight, rightNormal, D, 'sideRightTop');
  const sideRightBottom = B002_bodyOffset(frontBottomRight, rightNormal, D, 'sideRightBottom');
  const backOuterTop = B002_bodyOffset(sideLeftTop, leftNormal, W, 'backOuterTop');
  const backOuterBottom = B002_bodyOffset(sideLeftBottom, leftNormal, W, 'backOuterBottom');

  const folds = {
    frontSideLeft: { id: 'body-fold-front-side-left', a: frontTopLeft, b: frontBottomLeft },
    frontSideRight: { id: 'body-fold-front-side-right', a: frontTopRight, b: frontBottomRight },
    sideLeftBack: { id: 'body-fold-side-left-back', a: sideLeftTop, b: sideLeftBottom }
  };

  const panels = {
    front: [frontTopLeft, frontTopRight, frontBottomRight, frontBottomLeft],
    sideLeft: [sideLeftTop, frontTopLeft, frontBottomLeft, sideLeftBottom],
    sideRight: [frontTopRight, sideRightTop, sideRightBottom, frontBottomRight],
    back: [backOuterTop, sideLeftTop, sideLeftBottom, backOuterBottom]
  };

  return {
    dimensions: { W, D, H, topW },
    anchors: {
      frontTopLeft,
      frontTopRight,
      frontBottomLeft,
      frontBottomRight,
      sideLeftTop,
      sideLeftBottom,
      sideRightTop,
      sideRightBottom,
      backOuterTop,
      backOuterBottom
    },
    folds,
    panels,
    metrics: {
      frontBottomWidth: B002_distance(frontBottomLeft, frontBottomRight),
      frontHeight: frontBottomLeft.y - frontTopLeft.y,
      sideLeftDepth: B002_distance(frontTopLeft, sideLeftTop),
      sideRightDepth: B002_distance(frontTopRight, sideRightTop)
    }
  };
}

function B002_getLayout(W, D, H, options) {
  const spec = B002_getSpec({ W, D, H });
  // Preserve the approved 136 × 67 × 137 source while the body-only W/D/H
  // contract is reviewed. No Handle/Lock/Bottom coordinate is resized here.
  const transform = {
    a: spec.base.unitToMm, b: 0, c: 0, d: spec.base.unitToMm, e: 0, f: 0
  };
  const bodyGeometry = B002_buildBodyGeometry(spec);
  const frontPunchEnabled = !options || options.frontPunchEnabled !== false;
  const sourceOutline = B002_joinOutline(B002_SOURCE_ELEMENTS.cutElements);
  const outline = sourceOutline.map(point => B002_transformPoint(point, transform));
  const requiredHolePoints = B002_SOURCE_ELEMENTS.requiredPunchElements.map(element =>
    B002_sampleElement(element).map(point => B002_transformPoint(point, transform))
  );
  const optionalHolePoints = frontPunchEnabled
    ? B002_SOURCE_ELEMENTS.punchElements.map(element =>
        B002_sampleElement(element).map(point => B002_transformPoint(point, transform))
      )
    : [];
  const bleed = T001_offsetPolygonWithClipper(outline, 3);
  const boundsPoints = bleed.length ? bleed : outline;
  const xs = boundsPoints.map(point => point.x), ys = boundsPoints.map(point => point.y);
  const bounds = {
    minX: Math.min.apply(null, xs), minY: Math.min.apply(null, ys),
    maxX: Math.max.apply(null, xs), maxY: Math.max.apply(null, ys)
  };
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;
  return {
    spec, transform, bounds, bodyGeometry, referenceOnly: true,
    cutElements: B002_SOURCE_ELEMENTS.cutElements,
    requiredPunchElements: B002_SOURCE_ELEMENTS.requiredPunchElements,
    foldElements: B002_SOURCE_ELEMENTS.foldElements,
    punchElements: frontPunchEnabled ? B002_SOURCE_ELEMENTS.punchElements : [],
    frontPunchEnabled,
    outlinePoints: outline,
    bleedPoints: bleed,
    requiredHolePoints,
    optionalHolePoints,
    // Only the two handle openings and the lid slot are through-cuts.
    // The optional front trapezoid remains a green perforation guide in 2D;
    // 3D may interpret it as a removed opening when its option is enabled.
    fillPath: [B002_pointPath(outline, true)]
      .concat(requiredHolePoints.map(points => B002_pointPath(points, true)))
      .join(' '),
    bleedPath: B002_pointPath(bleed, true),
    anchors: {
      frontTopL: B002_transformPoint({ x: 706.611, y: 586.384 }, transform),
      frontTopR: B002_transformPoint({ x: 971.265, y: 583.708 }, transform),
      frontBottomL: B002_transformPoint({ x: 646.912, y: 974.527 }, transform),
      frontBottomR: B002_transformPoint({ x: 1034.246, y: 974.527 }, transform),
      sideBottomR: B002_transformPoint({ x: 1218.744, y: 945.58 }, transform)
    }
  };
}

// 3D contract input.  This deliberately exposes the approved layout-space
// fold geometry without changing any 2D path or export data.
function B002_getFoldSegments(layout) {
  return B002_SOURCE_ELEMENTS.foldElements.map((element, index) => {
    const points = B002_sampleElement(element).map(point => B002_transformPoint(point, layout.transform));
    return { id: 'b002-fold-' + (index + 1), a: points[0], b: points[1] };
  });
}
