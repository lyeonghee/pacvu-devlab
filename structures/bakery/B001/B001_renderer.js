// ============================================================
// B001_renderer.js - Bakery Box renderer/exporter
// Depends on B001_spec.js, B001_layout.js
// ============================================================

function B001_num(value) {
  return +(+value).toFixed(4);
}

function B001_resolveFixedConfig(cfg) {
  return Object.assign({}, cfg || {}, {
    W: B001_DEVELOPMENT_DATA.dimensions.W,
    D: B001_DEVELOPMENT_DATA.dimensions.D,
    H: B001_DEVELOPMENT_DATA.dimensions.H,
    sizeMode: B001_DEVELOPMENT_DATA.sizeMode,
    allowResize: B001_DEVELOPMENT_DATA.allowResize
  });
}

function B001_attr(el, name) {
  const re = new RegExp(name + '="([^"]*)"');
  const match = el.match(re);
  return match ? match[1] : '';
}

function B001_tag(el) {
  const match = el.match(/^<([a-z]+)/i);
  return match ? match[1].toLowerCase() : '';
}

function B001_matrix(t) {
  return 'matrix(' + [t.a, t.b, t.c, t.d, t.e, t.f].map(B001_num).join(' ') + ')';
}

function B001_restyleElement(el, className) {
  const out = el
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\sfill="[^"]*"/g, '')
    .replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '')
    .replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '')
    .replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '');

  if (/\/>$/.test(out)) return out.replace(/\/>$/, ' class="' + className + '"/>');
  return out.replace(/>$/, ' class="' + className + '>');
}

function B001_styleBlock() {
  return '<style>' +
    '.panel-fill{fill:#ffffff;stroke:none;}' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.required-cut{fill:#d0d0d0;stroke:#cc0000;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.required-cut-export{fill:none;stroke:#cc0000;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.45;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.perforation{fill:none;stroke:#1f8f4f;stroke-width:0.55;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.label{fill:#333;font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;font-weight:500;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;font-weight:500;pointer-events:none;}' +
    '.internal-dim-line{fill:none;stroke:#111;stroke-width:0.35;vector-effect:non-scaling-stroke;}' +
    '.internal-dim-arrow{fill:#111;stroke:none;}' +
    '.guide text,.guide tspan{font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;}' +
    '.guide{pointer-events:none;}' +
    '</style>';
}

function B001_arrowMarkerDef() {
  return '<marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 Z" fill="#111"/></marker>';
}

function B001_watermarkDef() {
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">' +
    '<text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>' +
    '</pattern>';
}

function B001_labelText(x, y, text, size) {
  return '<text class="label" x="' + B001_num(x) + '" y="' + B001_num(y) + '" font-size="' + size +
    '" text-anchor="middle" dominant-baseline="middle">' + text + '</text>\n';
}

function B001_buildLabelLayer(layout) {
  const a = layout.anchors;
  if (!a) return '';
  const x = a.panelsX;
  const bodyLabelY = a.bodyTopY + (a.bodyBottomY - a.bodyTopY) * 0.42;
  const topY = a.bodyTopY - Math.max(22, (a.bodyTopY - layout.bounds.minY) * 0.32);
  const bottomY = a.bodyBottomY + Math.max(24, (layout.bounds.maxY - a.bodyBottomY) * 0.28);
  const sideSize = Math.max(4.8, Math.min(6.2, (x[2] - x[1]) * 0.045));
  const mainSize = Math.max(5.2, Math.min(6.8, (x[1] - x[0]) * 0.038));
  let out = '  <g id="layer-labels">\n';

  out += B001_labelText((layout.bounds.minX + x[0]) / 2, bodyLabelY, 'Glue', 5.2);
  out += B001_labelText((x[0] + x[1]) / 2, bodyLabelY, 'Front', mainSize);
  out += B001_labelText((x[1] + x[2]) / 2, bodyLabelY, 'Side(L)', sideSize);
  out += B001_labelText((x[2] + x[3]) / 2, bodyLabelY, 'Back', mainSize);
  out += B001_labelText((x[3] + x[4]) / 2, bodyLabelY, 'Side(R)', sideSize);
  out += B001_labelText((x[0] + x[1]) / 2, topY, 'lidLeft', 5.6);
  out += B001_labelText((x[1] + x[2]) / 2, topY, 'lidSideFlap(L)', 5.6);
  out += B001_labelText((x[2] + x[3]) / 2, topY, 'lidRight', 5.6);
  out += B001_labelText((x[3] + x[4]) / 2, topY, 'lidSideFlap(R)', 5.6);
  out += B001_labelText((x[0] + x[1]) / 2, bottomY, 'bottomLock-A', 5.6);
  out += B001_labelText((x[1] + x[2]) / 2, bottomY, 'bottomLock(L)', 5.6);
  out += B001_labelText((x[2] + x[3]) / 2, bottomY, 'bottomLock-B', 5.6);
  out += B001_labelText((x[3] + x[4]) / 2, bottomY, 'bottomLock(R)', 5.6);
  out += '  </g>\n';
  return out;
}

function B001_buildDimensionLayer(cfg, layout) {
  const a = layout.anchors;
  if (!a) return '';
  const x = a.panelsX;
  // B001 fixed-size screen dimensions follow the positions and proportions
  // measured from B001_160x110x80_final.svg.
  const bodyHeight = a.bodyBottomY - a.bodyTopY;
  const dimY = a.bodyTopY + bodyHeight * ((825.152 - 672.303) / (899.217 - 672.303));
  const dimX = x[0] + cfg.W * ((646.446 - 296.959) / (749.165 - 296.959));
  const arrowLength = 12.259 * (25.4 / 72);
  const arrowHeight = 8.13 * (25.4 / 72);
  const horizontalInset = (305.526 - 296.959) * (25.4 / 72);
  const verticalInset = (679.067 - 672.303) * (25.4 / 72);
  const textGap = (825.152 - 815.713) * (25.4 / 72);
  // Keep the source-SVG anchor relationship, with a small screen legibility gap
  // so the rotated H label does not visually touch the dimension line.
  const verticalTextGap = (653.499 - 646.446) * (25.4 / 72) + 4;

  function hDim(x1, x2, y, label) {
    const mid = (x1 + x2) / 2;
    const halfArrow = arrowHeight / 2;
    return '<line class="internal-dim-line" x1="' + B001_num(x1 + horizontalInset) + '" y1="' + B001_num(y) + '" x2="' + B001_num(x2 - horizontalInset) + '" y2="' + B001_num(y) + '"/>' +
      '<path class="internal-dim-arrow" d="M' + B001_num(x1) + ',' + B001_num(y) + ' L' + B001_num(x1 + arrowLength) + ',' + B001_num(y - halfArrow) + ' L' + B001_num(x1 + arrowLength) + ',' + B001_num(y + halfArrow) + ' Z"/>' +
      '<path class="internal-dim-arrow" d="M' + B001_num(x2) + ',' + B001_num(y) + ' L' + B001_num(x2 - arrowLength) + ',' + B001_num(y - halfArrow) + ' L' + B001_num(x2 - arrowLength) + ',' + B001_num(y + halfArrow) + ' Z"/>' +
      '<text class="dim" x="' + B001_num(mid) + '" y="' + B001_num(y - textGap) + '" font-size="5.2" text-anchor="middle">' + label + '</text>';
  }

  function vDim(xPos, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const halfArrow = arrowHeight / 2;
    const textX = xPos + verticalTextGap;
    return '<line class="internal-dim-line" x1="' + B001_num(xPos) + '" y1="' + B001_num(y1 + verticalInset) + '" x2="' + B001_num(xPos) + '" y2="' + B001_num(y2 - verticalInset) + '"/>' +
      '<path class="internal-dim-arrow" d="M' + B001_num(xPos) + ',' + B001_num(y1) + ' L' + B001_num(xPos - halfArrow) + ',' + B001_num(y1 + arrowLength) + ' L' + B001_num(xPos + halfArrow) + ',' + B001_num(y1 + arrowLength) + ' Z"/>' +
      '<path class="internal-dim-arrow" d="M' + B001_num(xPos) + ',' + B001_num(y2) + ' L' + B001_num(xPos - halfArrow) + ',' + B001_num(y2 - arrowLength) + ' L' + B001_num(xPos + halfArrow) + ',' + B001_num(y2 - arrowLength) + ' Z"/>' +
      '<text class="dim" x="' + B001_num(textX) + '" y="' + B001_num(mid) + '" font-size="5.2" transform="rotate(-90 ' + B001_num(textX) + ' ' + B001_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }

  let out = '  <g id="layer-dimensions">\n';
  out += hDim(x[0], x[1], dimY, window.PacVuUnits.formatDimension('W', cfg.W));
  out += hDim(x[1], x[2], dimY, window.PacVuUnits.formatDimension('D', cfg.D));
  out += vDim(dimX, a.bodyTopY, a.bodyBottomY, window.PacVuUnits.formatDimension('H', cfg.H));
  out += '  </g>\n';
  return out;
}

function B001_getDisplayMetrics(cfg) {
  const layout = B001_getLayout(cfg.W, cfg.D, cfg.H);
  // Screen-only bounds include the Overall dimension offset and its labels.
  // Geometry and export bounds continue to use layout.bounds unchanged.
  const overallSafeArea = 45;
  return {
    layout,
    renderBounds: {
      minX: layout.bounds.minX - overallSafeArea,
      minY: layout.bounds.minY - overallSafeArea,
      width: layout.bounds.width + overallSafeArea * 2,
      height: layout.bounds.height + overallSafeArea * 2
    }
  };
}

function B001_renderSVG(cfg, appState) {
  cfg = B001_resolveFixedConfig(cfg);
  const layout = B001_getLayout(cfg.W, cfg.D, cfg.H);
  const matrix = B001_matrix(layout.transform);
  const pad = 80;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    B001_num(vbX) + ' ' + B001_num(vbY) + ' ' + B001_num(vbW) + ' ' + B001_num(vbH) +
    '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg += '<defs>' + B001_arrowMarkerDef() + B001_watermarkDef() + B001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + B001_num(vbX) + '" y="' + B001_num(vbY) + '" width="' + B001_num(vbW) + '" height="' + B001_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '  <g id="layer-panel-fill" transform="' + matrix + '"><path class="panel-fill" d="' +
    layout.fillPath + '"/></g>\n';
  if (!appState || appState.showBleed) {
    svg += '  <g id="layer-bleed" transform="' + matrix + '">' +
      layout.bleedElements.map(el => B001_restyleElement(el, 'bleed')).join('') + '</g>\n';
  }
  if (!appState || appState.showCut) {
    svg += '  <g id="layer-cut" transform="' + matrix + '">' +
      layout.cutElements.map(el => B001_restyleElement(el, 'cut-fill')).join('') +
      layout.requiredCutElements.map(el => B001_restyleElement(el, 'required-cut')).join('') + '</g>\n';
  }
  if (!appState || appState.showPerforation) {
    svg += '  <g id="layer-perforation" transform="' + matrix + '">' +
      layout.perforationElements.map(el => B001_restyleElement(el, 'perforation')).join('') + '</g>\n';
  }
  if (!appState || appState.showFolds) {
    svg += '  <g id="layer-fold" transform="' + matrix + '">' +
      layout.foldElements.map(el => B001_restyleElement(el, 'fold')).join('') + '</g>\n';
  }
  if (!appState || appState.showLabels) {
    svg += B001_buildLabelLayer(layout);
  }
  if (!appState || appState.showDims) {
    svg += B001_buildDimensionLayer(cfg, layout);
  }
  if (typeof window.PacVuBakery2DVisualCommon?.overallLayer === 'function') {
    svg += window.PacVuBakery2DVisualCommon.overallLayer(layout, 'B001');
  }
  if (appState && appState.showB001Guide) {
    svg += '  <g id="layer-guide" class="guide" transform="' + matrix + '">' +
      layout.guideElements.join('') + '</g>\n';
  }
  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function B001_buildExportSVG(cfg) {
  cfg = B001_resolveFixedConfig(cfg);
  const layout = B001_getLayout(cfg.W, cfg.D, cfg.H);
  const matrix = B001_matrix(layout.transform);
  const pad = 5;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
    B001_num(vbX) + ' ' + B001_num(vbY) + ' ' + B001_num(vbW) + ' ' + B001_num(vbH) +
    '" width="' + B001_num(vbW) + 'mm" height="' + B001_num(vbH) + 'mm">\n';
  out += '<defs>' + B001_styleBlock() + '</defs>\n';
  out += '<g id="layer-panel-fill" transform="' + matrix + '"><path class="panel-fill" d="' +
    layout.fillPath + '"/></g>\n';
  out += '<g id="layer-bleed" transform="' + matrix + '">' +
    layout.bleedElements.map(el => B001_restyleElement(el, 'bleed')).join('') + '</g>\n';
  out += '<g id="layer-cut" transform="' + matrix + '">' +
    layout.cutElements.map(el => B001_restyleElement(el, 'cut-fill')).join('') +
    layout.requiredCutElements.map(el => B001_restyleElement(el, 'required-cut-export')).join('') + '</g>\n';
  out += '<g id="layer-perforation" transform="' + matrix + '">' +
    layout.perforationElements.map(el => B001_restyleElement(el, 'perforation')).join('') + '</g>\n';
  out += '<g id="layer-fold" transform="' + matrix + '">' +
    layout.foldElements.map(el => B001_restyleElement(el, 'fold')).join('') + '</g>\n';
  out += '</svg>';
  return out;
}

function B001_point(t, x, y) {
  return { x: x * t.a + t.e, y: y * t.d + t.f };
}

function B001_parsePoints(points, t) {
  const nums = (points.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  const out = [];
  for (let i = 0; i < nums.length - 1; i += 2) out.push(B001_point(t, nums[i], nums[i + 1]));
  return out;
}

function B001_pathSegments(d, t) {
  const tokens = d.match(/[a-zA-Z]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const segments = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
  const isCmd = v => /^[a-zA-Z]$/.test(v);
  const n = () => Number(tokens[i++]);
  const p = (px, py) => B001_point(t, px, py);
  const lineTo = (nx, ny) => {
    const a = p(x, y);
    const b = p(nx, ny);
    segments.push([a.x, a.y, b.x, b.y]);
    x = nx; y = ny;
  };

  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();

    if (c === 'M') {
      x = (rel ? x : 0) + n(); y = (rel ? y : 0) + n(); sx = x; sy = y; cmd = rel ? 'l' : 'L';
    } else if (c === 'L') {
      lineTo((rel ? x : 0) + n(), (rel ? y : 0) + n());
    } else if (c === 'H') {
      lineTo((rel ? x : 0) + n(), y);
    } else if (c === 'V') {
      lineTo(x, (rel ? y : 0) + n());
    } else if (c === 'C') {
      n(); n(); n(); n();
      lineTo((rel ? x : 0) + n(), (rel ? y : 0) + n());
    } else if (c === 'S' || c === 'Q') {
      n(); n();
      lineTo((rel ? x : 0) + n(), (rel ? y : 0) + n());
    } else if (c === 'T') {
      lineTo((rel ? x : 0) + n(), (rel ? y : 0) + n());
    } else if (c === 'A') {
      n(); n(); n(); n(); n();
      lineTo((rel ? x : 0) + n(), (rel ? y : 0) + n());
    } else if (c === 'Z') {
      lineTo(sx, sy);
    } else {
      break;
    }
  }
  return segments;
}

function B001_elementSegments(el, t) {
  const tag = B001_tag(el);
  if (tag === 'line') {
    const a = B001_point(t, Number(B001_attr(el, 'x1')), Number(B001_attr(el, 'y1')));
    const b = B001_point(t, Number(B001_attr(el, 'x2')), Number(B001_attr(el, 'y2')));
    return [[a.x, a.y, b.x, b.y]];
  }
  if (tag === 'polyline') {
    const pts = B001_parsePoints(B001_attr(el, 'points'), t);
    return pts.slice(1).map((pt, i) => [pts[i].x, pts[i].y, pt.x, pt.y]);
  }
  if (tag === 'path') {
    return B001_pathSegments(B001_attr(el, 'd'), t);
  }
  if (tag === 'rect') {
    const x = Number(B001_attr(el, 'x'));
    const y = Number(B001_attr(el, 'y'));
    const w = Number(B001_attr(el, 'width'));
    const h = Number(B001_attr(el, 'height'));
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(p => B001_point(t, p[0], p[1]));
    return pts.slice(1).map((pt, i) => [pts[i].x, pts[i].y, pt.x, pt.y]);
  }
  return [];
}

function B001_buildDXF(cfg) {
  cfg = B001_resolveFixedConfig(cfg);
  const layout = B001_getLayout(cfg.W, cfg.D, cfg.H);
  const arr = [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$INSUNITS',
    '70', '4',
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'ENTITIES'
  ];
  const addLine = (seg, layer) => {
    arr.push(
      '0', 'LINE',
      '8', layer,
      '10', B001_num(seg[0]),
      '20', B001_num(-seg[1]),
      '30', '0',
      '11', B001_num(seg[2]),
      '21', B001_num(-seg[3]),
      '31', '0'
    );
  };
  const addElements = (elements, layer) => {
    elements.forEach(el => B001_elementSegments(el, layout.transform).forEach(seg => addLine(seg, layer)));
  };

  addElements(layout.bleedElements, 'BLEED');
  addElements(layout.cutElements, 'CUT');
  addElements(layout.requiredCutElements, 'CUT');
  addElements(layout.perforationElements, 'PERFORATION');
  addElements(layout.foldElements, 'FOLD');
  arr.push('0', 'ENDSEC', '0', 'EOF');
  return arr.join('\n');
}

function B001_pdfNum(value) {
  return Number.isFinite(+value) ? (+value).toFixed(3) : '0';
}

function B001_pdfLineOps(elements, layout, bounds, pad, color, dash) {
  const pt = 72 / 25.4;
  const pageH = (bounds.height + pad * 2) * pt;
  const ops = [color, dash || '[] 0 d'];

  elements.forEach(el => {
    B001_elementSegments(el, layout.transform).forEach(seg => {
      const x1 = (seg[0] - bounds.minX + pad) * pt;
      const y1 = pageH - ((seg[1] - bounds.minY + pad) * pt);
      const x2 = (seg[2] - bounds.minX + pad) * pt;
      const y2 = pageH - ((seg[3] - bounds.minY + pad) * pt);
      ops.push(B001_pdfNum(x1) + ' ' + B001_pdfNum(y1) + ' m ' +
        B001_pdfNum(x2) + ' ' + B001_pdfNum(y2) + ' l S');
    });
  });

  return ops.join('\n');
}

function B001_buildPDF(cfg) {
  cfg = B001_resolveFixedConfig(cfg);
  const layout = B001_getLayout(cfg.W, cfg.D, cfg.H);
  const bounds = layout.bounds;
  const pad = 5;
  const pt = 72 / 25.4;
  const pageW = (bounds.width + pad * 2) * pt;
  const pageH = (bounds.height + pad * 2) * pt;
  const content = [
    '0.6 w',
    '1 J 1 j',
    B001_pdfLineOps(layout.bleedElements, layout, bounds, pad, '0 0.333 1 RG'),
    B001_pdfLineOps(layout.cutElements.concat(layout.requiredCutElements), layout, bounds, pad, '0.8 0 0 RG'),
    B001_pdfLineOps(layout.perforationElements, layout, bounds, pad, '0.122 0.561 0.31 RG'),
    B001_pdfLineOps(layout.foldElements, layout, bounds, pad, '0.114 0.435 0.91 RG', '[2.5 2] 0 d')
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + B001_pdfNum(pageW) + ' ' + B001_pdfNum(pageH) + '] /Contents 4 0 R >>',
    '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += (i + 1) + ' 0 obj\n' + obj + '\nendobj\n';
  });
  const xref = pdf.length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
  pdf += 'startxref\n' + xref + '\n%%EOF';
  return pdf;
}
