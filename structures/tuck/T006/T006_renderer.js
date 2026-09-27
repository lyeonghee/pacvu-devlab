// T006_renderer.js - PacVu template preview and production SVG/DXF.
// Preview hatching is deliberately excluded from every production export.
function T006_restyle(element, className) {
  return T001_restyleElement(element, className);
}

function T006_layer(elements, id, className) {
  return '<g id="' + id + '">' + elements.map(element => T006_restyle(element, className)).join('') + '</g>';
}

function T006_punchLayer(elements) {
  return '<g id="layer-perforation">' + elements.map(element =>
    T006_restyle(element, T001_attr(element, 'stroke-dasharray') ? 'perf-dash' : 'perf')
  ).join('') + '</g>';
}

function T006_viewBox(bounds, pad) {
  return [bounds.minX - pad, bounds.minY - pad,
    bounds.width + 2 * pad, bounds.height + 2 * pad].map(T001_num).join(' ');
}

function T006_dimensions(layout, visual) {
  const g = layout.grid;
  const dimensionGrid = {
    xFrontL: g.xBackLeft, xFrontR: g.xBackRight, xSideLR: g.xSideMid,
    yBodyTop: g.yBodyTop + 1, yBodyBottom: g.yBodyBottom - 1
  };
  return T001_buildAdaptiveDimensionLayer(layout.spec, dimensionGrid, visual) +
    T001_buildOverallDimensionLayer(layout, visual, true);
}

function T006_renderSVG(cfg, state) {
  const l = T006_getLayout(cfg || {}), b = l.bleedBounds, visual = T002_displayVisualStyle(l);
  const show = key => !state || state[key] !== false;
  const extra = '<style>.fold{stroke:#1d6fe8;stroke-width:.45;stroke-dasharray:2.5 2;opacity:1;vector-effect:non-scaling-stroke}' +
    '.perf{fill:none;stroke:#169b45;stroke-width:.65;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke}' +
    '.perf-dash{fill:none;stroke:#169b45;stroke-width:.65;stroke-dasharray:1.764 1.764;vector-effect:non-scaling-stroke}' +
    '.preview-hatch{fill:none;stroke:#1d7005;stroke-width:.4;opacity:.6;vector-effect:non-scaling-stroke}</style>';
  let out = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' + T006_viewBox(b, 25) + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">' +
    '<defs>' + T001_styleBlock() + extra + T001_arrowMarkerDef(visual.arrowMarkerSize) +
    T001_arrowMarkerDef(Math.max(2.4, visual.arrowMarkerSize * .42), 'internal-dimension-arrow', 'userSpaceOnUse') +
    T001_overallArrowMarkerDefs(visual.arrowMarkerSize) + '</defs>' +
    '<rect x="' + T001_num(b.minX - 25) + '" y="' + T001_num(b.minY - 25) + '" width="' + T001_num(b.width + 50) + '" height="' + T001_num(b.height + 50) + '" fill="#d0d0d0"/>' +
    '<g id="viewportGroup"><path class="cut-area" d="' + l.previewFillPath + '"/>';
  if (show('showBleed')) out += T006_layer([l.bleedElement], 'layer-bleed', 'bleed');
  if (show('showCut')) out += T006_layer(l.cutElements, 'layer-cut', 'cut-fill');
  if (show('showFolds')) out += T006_layer(l.foldElements, 'layer-fold', 'fold');
  if (show('showPerforation')) {
    out += T006_punchLayer(l.punchElements);
    out += T006_layer(l.previewHatchElements, 'layer-preview-hatch', 'preview-hatch');
  }
  if (show('showLabels')) out += T001_buildLabelLayer(l, visual);
  if (show('showDims')) out += T006_dimensions(l, visual);
  return out + '</g></svg>';
}

function T006_buildExportSVG(cfg) {
  const l = T006_getLayout(cfg || {}), b = l.bleedBounds;
  const width = T001_num(b.width + 10), height = T001_num(b.height + 10);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + T006_viewBox(b, 5) + '" width="' + width + 'mm" height="' + height + 'mm">' +
    '<defs>' + T001_exportStyleBlock() + '<style>.perf{fill:none;stroke:#169b45;stroke-width:.4}.perf-dash{fill:none;stroke:#169b45;stroke-width:.4;stroke-dasharray:1.764 1.764}</style></defs>' +
    T006_layer([l.bleedElement], 'layer-bleed', 'bleed') +
    T006_layer(l.cutElements, 'layer-cut', 'cut-fill') +
    T006_layer(l.foldElements, 'layer-fold', 'fold') +
    T006_punchLayer(l.punchElements) + '</svg>';
}

function T006_buildDXF(cfg) {
  const l = T006_getLayout(cfg || {});
  const rows = window.PacVuDXFR12.createRows(['CUT', 'FOLD', 'PERFORATION', 'BLEED']);
  const num = value => String(T001_num(value));
  const line = (a, b, layer) => rows.push('0', 'LINE', '8', layer,
    '10', num(a.x), '20', num(-a.y), '30', '0',
    '11', num(b.x), '21', num(-b.y), '31', '0');
  const path = (d, layer) => {
    const points = T001_flattenPathD(d);
    for (let i = 0; i < points.length - 1; i++) line(points[i], points[i + 1], layer);
  };
  l.cutElements.forEach(element => path(T001_elementToPathD(element), 'CUT'));
  l.foldElements.forEach(element => path(T001_elementToPathD(element), 'FOLD'));
  l.punchElements.forEach(element => {
    if (!T001_attr(element, 'stroke-dasharray')) {
      path(T001_elementToPathD(element), 'PERFORATION');
      return;
    }
    const a = { x: Number(T001_attr(element, 'x1')), y: Number(T001_attr(element, 'y1')) };
    const b = { x: Number(T001_attr(element, 'x2')), y: Number(T001_attr(element, 'y2')) };
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const pitch = 1.764;
    for (let start = 0; start < length; start += pitch * 2) {
      const end = Math.min(start + pitch, length);
      const point = distance => ({ x: a.x + (b.x - a.x) * distance / length,
        y: a.y + (b.y - a.y) * distance / length });
      line(point(start), point(end), 'PERFORATION');
    }
  });
  path(l.bleedPath, 'BLEED');
  return window.PacVuDXFR12.finish(rows);
}