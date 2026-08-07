// ============================================================
// TR001_renderer.js - TR001 EB Tray Box
// Depends on: TR001_spec.js, TR001_layout.js
// ============================================================

function TR001_num(value) {
  return Number.isFinite(+value) ? (+value).toFixed(4) : '0';
}

function TR001_matrix(t) {
  return 'matrix(' + [t.a, t.b, t.c, t.d, t.e, t.f].map(TR001_num).join(' ') + ')';
}

function TR001_restyleElement(el, className) {
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

function TR001_styleBlock() {
  return '<style>' +
    '.panel{fill:#fff;stroke:none;}' +
    '.cut{fill:none;stroke:#e63a27;stroke-width:0.65;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.45;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.55;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.perforation,.hole{fill:none;stroke:#147139;stroke-width:0.55;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.label,.dim{fill:#333;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function TR001_arrowMarkerDef() {
  return '<marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 Z" fill="#111"/></marker>';
}

function TR001_watermarkDef() {
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">' +
    '<text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>' +
    '</pattern>';
}

function TR001_circlePath(cx, cy, r) {
  return [
    'M' + TR001_num(cx + r) + ' ' + TR001_num(cy),
    'A' + TR001_num(r) + ' ' + TR001_num(r) + ' 0 1 0 ' + TR001_num(cx - r) + ' ' + TR001_num(cy),
    'A' + TR001_num(r) + ' ' + TR001_num(r) + ' 0 1 0 ' + TR001_num(cx + r) + ' ' + TR001_num(cy)
  ].join(' ');
}

function TR001_holeElements(layout) {
  return layout.holes.map(hole =>
    '<path id="' + hole.id + '" class="hole" d="' + TR001_circlePath(hole.cx, hole.cy, hole.r) + '"/>'
  ).join('');
}

function TR001_renderSVG(cfg, appState) {
  const layout = TR001_getLayout(cfg.W, cfg.D, cfg.H, cfg);
  const matrix = TR001_matrix(layout.transform);
  const pad = 80;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    TR001_num(vbX) + ' ' + TR001_num(vbY) + ' ' + TR001_num(vbW) + ' ' + TR001_num(vbH) +
    '" width="' + TR001_num(vbW) + 'mm" height="' + TR001_num(vbH) + 'mm">\n';
  svg += '<defs>' + TR001_arrowMarkerDef() + TR001_watermarkDef() + TR001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + TR001_num(vbX) + '" y="' + TR001_num(vbY) + '" width="' + TR001_num(vbW) + '" height="' + TR001_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '<g id="layer-panel-fill" transform="' + matrix + '">' + TR001_restyleElement(layout.cutFillElement, 'panel') + '</g>\n';
  if (!appState || appState.showBleed) {
    svg += '<g id="layer-bleed" transform="' + matrix + '">' + TR001_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  }
  if (!appState || appState.showCut) {
    svg += '<g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.map(el => TR001_restyleElement(el, 'cut')).join('') + '</g>\n';
  }
  if (!appState || appState.showFolds) {
    svg += '<g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(el => TR001_restyleElement(el, 'fold')).join('') + '</g>\n';
  }
  if (!appState || appState.showPerforation) {
    svg += '<g id="layer-perforation" transform="' + matrix + '">' +
      layout.staticPerforationElements.map(el => TR001_restyleElement(el, 'perforation')).join('') +
      TR001_holeElements(layout) + '</g>\n';
  }
  if (!appState || appState.showLabels) {
    svg += TR001_labelLayer(layout);
  }
  if (!appState || appState.showDims) {
    svg += TR001_dimensionLayer(cfg, layout.transform);
    if (window.PacVuTray2DVisualCommon) svg += window.PacVuTray2DVisualCommon.overallLayer(layout);
  }
  svg += '<rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function TR001_labelLayer(layout) {
  const t = layout.transform;
  let out = '<g id="layer-labels">\n';
  layout.labels.forEach(label => {
    out += '<text class="label" x="' + TR001_num(label.x * t.a) + '" y="' + TR001_num(label.y * t.d) +
      '" font-size="5.2" text-anchor="middle" dominant-baseline="middle">' + label.name + '</text>\n';
  });
  out += '</g>\n';
  return out;
}

function TR001_dimensionLayer(cfg, t) {
  const p = TR001_getLayout(cfg.W, cfg.D, cfg.H, cfg).params;
  const originalDimXRatio = (1570.045 - 852.963) / (1652.333 - 852.963);
  const originalWDimYRatio = (1729.758 - 805.061) / (1848.211 - 805.061);
  const dimX = p.x1 + cfg.W * originalDimXRatio;
  const wDimY = p.y2 + cfg.D * originalWDimYRatio;
  function tx(x) { return x * t.a; }
  function ty(y) { return y * t.d; }
  function line(x1, y1, x2, y2, label, labelOffsetY) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const textY = midY + (labelOffsetY ?? -5);
    return '<line x1="' + TR001_num(x1) + '" y1="' + TR001_num(y1) + '" x2="' + TR001_num(x2) + '" y2="' + TR001_num(y2) + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + TR001_num(midX) + '" y="' + TR001_num(textY) + '" font-size="5.5" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vline(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const textX = x + 6;
    return '<line x1="' + TR001_num(x) + '" y1="' + TR001_num(y1) + '" x2="' + TR001_num(x) + '" y2="' + TR001_num(y2) + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + TR001_num(textX) + '" y="' + TR001_num(mid) + '" font-size="5.5" font-weight="600" transform="rotate(-90 ' + TR001_num(textX) + ' ' + TR001_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }
  return '<g id="layer-dimensions">' +
    line(tx(p.x1), ty(wDimY), tx(p.x2), ty(wDimY), window.PacVuUnits.formatDimension('W', cfg.W), 8) +
    vline(tx(dimX), ty(p.y2), ty(p.y3), window.PacVuUnits.formatDimension('D', cfg.D)) +
    vline(tx(dimX), ty(p.y1), ty(p.y2), window.PacVuUnits.formatDimension('H', cfg.H)) +
    '</g>\n';
}

function TR001_buildExportSVG(cfg) {
  const layout = TR001_getLayout(cfg.W, cfg.D, cfg.H, cfg);
  const matrix = TR001_matrix(layout.transform);
  const pad = 5;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + TR001_num(vbX) + ' ' + TR001_num(vbY) + ' ' + TR001_num(vbW) + ' ' + TR001_num(vbH) + '" width="' + TR001_num(vbW) + 'mm" height="' + TR001_num(vbH) + 'mm">\n';
  out += '<defs>' + TR001_styleBlock() + '</defs>\n';
  out += '<g id="layer-bleed" transform="' + matrix + '">' + TR001_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  out += '<g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.map(el => TR001_restyleElement(el, 'cut')).join('') + '</g>\n';
  out += '<g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(el => TR001_restyleElement(el, 'fold')).join('') + '</g>\n';
  out += '<g id="layer-perforation" transform="' + matrix + '">' +
    layout.staticPerforationElements.map(el => TR001_restyleElement(el, 'perforation')).join('') +
    TR001_holeElements(layout) + '</g>\n';
  out += '</svg>';
  return out;
}

function TR001_parseAttrs(el) {
  const attrs = {};
  el.replace(/([a-zA-Z_:][-a-zA-Z0-9_:]*)="([^"]*)"/g, (_, k, v) => {
    attrs[k] = v;
    return '';
  });
  return attrs;
}

function TR001_points(str) {
  return (str.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
}

function TR001_elementSegments(el, t) {
  const attrs = TR001_parseAttrs(el);
  const tag = (el.match(/^<([a-z]+)/i) || [])[1];
  const sx = x => x * t.a;
  const sy = y => y * t.d;
  const segs = [];
  if (tag === 'line') {
    segs.push([sx(+attrs.x1), sy(+attrs.y1), sx(+attrs.x2), sy(+attrs.y2)]);
  } else if (tag === 'polyline') {
    const nums = TR001_points(attrs.points || '');
    for (let i = 0; i < nums.length - 3; i += 2) {
      segs.push([sx(nums[i]), sy(nums[i + 1]), sx(nums[i + 2]), sy(nums[i + 3])]);
    }
  } else if (tag === 'path') {
    TR001_pathSegments(attrs.d || '', t).forEach(seg => segs.push(seg));
  }
  return segs;
}

function TR001_pathSegments(d, t) {
  const tokens = (d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []);
  let i = 0, cmd = '', x = 0, y = 0, sx0 = 0, sy0 = 0;
  const segs = [];
  const isCmd = value => /^[a-zA-Z]$/.test(value);
  const num = () => parseFloat(tokens[i++]);
  const tx = value => value * t.a;
  const ty = value => value * t.d;
  const add = (x1, y1, x2, y2) => segs.push([tx(x1), ty(y1), tx(x2), ty(y2)]);
  const cubic = (x0, y0, x1, y1, x2, y2, x3, y3) => {
    let px = x0, py = y0;
    for (let step = 1; step <= 10; step++) {
      const u = step / 10;
      const v = 1 - u;
      const nx = v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3;
      const ny = v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3;
      add(px, py, nx, ny);
      px = nx; py = ny;
    }
  };

  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'm') {
      x = cmd === 'm' ? x + num() : num();
      y = cmd === 'm' ? y + num() : num();
      sx0 = x; sy0 = y;
      cmd = cmd === 'm' ? 'l' : 'L';
    } else if (cmd === 'L' || cmd === 'l') {
      const nx = cmd === 'l' ? x + num() : num();
      const ny = cmd === 'l' ? y + num() : num();
      add(x, y, nx, ny);
      x = nx; y = ny;
    } else if (cmd === 'H' || cmd === 'h') {
      const nx = cmd === 'h' ? x + num() : num();
      add(x, y, nx, y);
      x = nx;
    } else if (cmd === 'V' || cmd === 'v') {
      const ny = cmd === 'v' ? y + num() : num();
      add(x, y, x, ny);
      y = ny;
    } else if (cmd === 'C' || cmd === 'c') {
      const x1 = cmd === 'c' ? x + num() : num();
      const y1 = cmd === 'c' ? y + num() : num();
      const x2 = cmd === 'c' ? x + num() : num();
      const y2 = cmd === 'c' ? y + num() : num();
      const x3 = cmd === 'c' ? x + num() : num();
      const y3 = cmd === 'c' ? y + num() : num();
      cubic(x, y, x1, y1, x2, y2, x3, y3);
      x = x3; y = y3;
    } else if (cmd === 'Z' || cmd === 'z') {
      add(x, y, sx0, sy0);
      x = sx0; y = sy0;
    } else {
      break;
    }
  }
  return segs;
}

function TR001_dxfAddLine(arr, seg, layer) {
  arr.push(
    '0', 'LINE',
    '8', layer,
    '10', TR001_num(seg[0]),
    '20', TR001_num(-seg[1]),
    '30', '0',
    '11', TR001_num(seg[2]),
    '21', TR001_num(-seg[3]),
    '31', '0'
  );
}

function TR001_dxfAddCircle(arr, hole, t, layer) {
  arr.push(
    '0', 'CIRCLE',
    '8', layer,
    '10', TR001_num(hole.cx * t.a),
    '20', TR001_num(-(hole.cy * t.d)),
    '30', '0',
    '40', TR001_num(hole.r * Math.max(t.a, t.d))
  );
}

function TR001_buildDXF(cfg) {
  const layout = TR001_getLayout(cfg.W, cfg.D, cfg.H, cfg);
  const arr = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'];
  const addElements = (elements, layer) => {
    elements.forEach(el => TR001_elementSegments(el, layout.transform).forEach(seg => TR001_dxfAddLine(arr, seg, layer)));
  };
  addElements([layout.bleedElement], 'BLEED');
  addElements(layout.cutElements, 'CUT');
  addElements(layout.foldElements, 'FOLD');
  addElements(layout.staticPerforationElements, 'PERFORATION');
  layout.holes.forEach(hole => TR001_dxfAddCircle(arr, hole, layout.transform, 'HOLE'));
  arr.push('0', 'ENDSEC', '0', 'EOF');
  return arr.join('\n');
}

function TR001_pdfNum(value) {
  return Number.isFinite(+value) ? (+value).toFixed(3) : '0';
}

function TR001_pdfLineOps(elements, layout, bounds, pad, color, dash) {
  const pt = 72 / 25.4;
  const pageH = (bounds.height + pad * 2) * pt;
  const ops = [color, dash || '[] 0 d'];
  elements.forEach(el => {
    TR001_elementSegments(el, layout.transform).forEach(seg => {
      const x1 = (seg[0] - bounds.minX + pad) * pt;
      const y1 = pageH - ((seg[1] - bounds.minY + pad) * pt);
      const x2 = (seg[2] - bounds.minX + pad) * pt;
      const y2 = pageH - ((seg[3] - bounds.minY + pad) * pt);
      ops.push(TR001_pdfNum(x1) + ' ' + TR001_pdfNum(y1) + ' m ' + TR001_pdfNum(x2) + ' ' + TR001_pdfNum(y2) + ' l S');
    });
  });
  return ops.join('\n');
}

function TR001_pdfHoleOps(layout, bounds, pad) {
  const pt = 72 / 25.4;
  const pageH = (bounds.height + pad * 2) * pt;
  const ops = ['0.08 0.443 0.224 RG', '[] 0 d'];
  layout.holes.forEach(hole => {
    const cx = (hole.cx * layout.transform.a - bounds.minX + pad) * pt;
    const cy = pageH - ((hole.cy * layout.transform.d - bounds.minY + pad) * pt);
    const r = hole.r * Math.max(layout.transform.a, layout.transform.d) * pt;
    const k = 0.5522847498 * r;
    ops.push(
      TR001_pdfNum(cx + r) + ' ' + TR001_pdfNum(cy) + ' m ' +
      TR001_pdfNum(cx + r) + ' ' + TR001_pdfNum(cy + k) + ' ' + TR001_pdfNum(cx + k) + ' ' + TR001_pdfNum(cy + r) + ' ' + TR001_pdfNum(cx) + ' ' + TR001_pdfNum(cy + r) + ' c ' +
      TR001_pdfNum(cx - k) + ' ' + TR001_pdfNum(cy + r) + ' ' + TR001_pdfNum(cx - r) + ' ' + TR001_pdfNum(cy + k) + ' ' + TR001_pdfNum(cx - r) + ' ' + TR001_pdfNum(cy) + ' c ' +
      TR001_pdfNum(cx - r) + ' ' + TR001_pdfNum(cy - k) + ' ' + TR001_pdfNum(cx - k) + ' ' + TR001_pdfNum(cy - r) + ' ' + TR001_pdfNum(cx) + ' ' + TR001_pdfNum(cy - r) + ' c ' +
      TR001_pdfNum(cx + k) + ' ' + TR001_pdfNum(cy - r) + ' ' + TR001_pdfNum(cx + r) + ' ' + TR001_pdfNum(cy - k) + ' ' + TR001_pdfNum(cx + r) + ' ' + TR001_pdfNum(cy) + ' c S'
    );
  });
  return ops.join('\n');
}

function TR001_buildPDF(cfg) {
  const layout = TR001_getLayout(cfg.W, cfg.D, cfg.H, cfg);
  const bounds = layout.bounds;
  const pad = 5;
  const pt = 72 / 25.4;
  const pageW = (bounds.width + pad * 2) * pt;
  const pageH = (bounds.height + pad * 2) * pt;
  const content = [
    '0.6 w',
    '1 J 1 j',
    TR001_pdfLineOps([layout.bleedElement], layout, bounds, pad, '0 0.333 1 RG'),
    TR001_pdfLineOps(layout.cutElements, layout, bounds, pad, '0.902 0.227 0.153 RG'),
    TR001_pdfLineOps(layout.foldElements, layout, bounds, pad, '0.114 0.435 0.91 RG', '[2.5 2] 0 d'),
    TR001_pdfLineOps(layout.staticPerforationElements, layout, bounds, pad, '0.08 0.443 0.224 RG'),
    TR001_pdfHoleOps(layout, bounds, pad)
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + TR001_pdfNum(pageW) + ' ' + TR001_pdfNum(pageH) + '] /Contents 4 0 R >>',
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
