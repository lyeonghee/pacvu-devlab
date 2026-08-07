// ============================================================
// C001_export.js - Cake Box export helpers
// Depends on C001_spec.js, C001_layout.js, C001_renderer.js
// ============================================================

function C001_exportCutElements(layout) {
  const extraCuts = typeof C001_supplementCutElements === 'function' ? C001_supplementCutElements() : [];
  return C001_visibleElements(layout.cutElements).concat(extraCuts);
}

function C001_isHandleCutoutElement(el) {
  const d = C001_attr(el, 'd');
  return !!d && (
    d.indexOf('M1940.') === 0 ||
    d.indexOf('M1906.') === 0 ||
    d.indexOf('M2112.') === 0 ||
    d.indexOf('M2145.') === 0 ||
    d.indexOf('M1979.') === 0 ||
    d.indexOf('M2073.') === 0
  );
}

function C001_exportOuterCutElements(layout) {
  return C001_exportCutElements(layout).filter(el => !C001_isHandleCutoutElement(el));
}

function C001_exportHandleCutoutElements(layout) {
  return C001_exportCutElements(layout).filter(C001_isHandleCutoutElement);
}

function C001_buildExportSVG(cfg, options) {
  const opts = options || {};
  const layout = C001_getLayout(cfg);
  const pad = 5;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
    C001_num(vbX) + ' ' + C001_num(vbY) + ' ' + C001_num(vbW) + ' ' + C001_num(vbH) +
    '" width="' + C001_num(vbW) + 'mm" height="' + C001_num(vbH) + 'mm">\n';
  out += '<defs>' + C001_styleBlock() + '</defs>\n';
  if (opts.includePanelFill) out += C001_buildPanelFillLayer(layout);
  out += '<g id="layer-bleed">' +
    C001_layerElements(C001_visibleElements(layout.bleedElements), 'bleed', layout) + '</g>\n';
  out += '<g id="layer-cut">' +
    C001_layerElements(C001_exportOuterCutElements(layout), 'cut-fill', layout) + '</g>\n';
  out += '<g id="layer-handle-cutout">' +
    C001_layerElements(C001_exportHandleCutoutElements(layout), 'cut-fill', layout) + '</g>\n';
  out += '<g id="layer-fold">' +
    C001_layerElements(C001_visibleElements(layout.foldElements), 'fold', layout) + '</g>\n';
  out += '</svg>';
  return out;
}

function C001_point(t, x, y) {
  if (t && typeof t.mapPoint === 'function') return t.mapPoint(x, y);
  return { x: x * t.a + t.e, y: y * t.d + t.f };
}

function C001_parsePoints(points, t, closePath) {
  const nums = (points.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  const out = [];
  for (let i = 0; i < nums.length - 1; i += 2) out.push(C001_point(t, nums[i], nums[i + 1]));
  if (closePath && out.length) out.push({ ...out[0] });
  return out;
}

function C001_pathSegments(d, t) {
  const tokens = d.match(/[a-zA-Z]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const segments = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
  const isCmd = v => /^[a-zA-Z]$/.test(v);
  const n = () => Number(tokens[i++]);
  const p = (px, py) => C001_point(t, px, py);
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

function C001_elementSegments(el, t) {
  const tag = C001_tag(el);
  if (tag === 'line') {
    const a = C001_point(t, Number(C001_attr(el, 'x1')), Number(C001_attr(el, 'y1')));
    const b = C001_point(t, Number(C001_attr(el, 'x2')), Number(C001_attr(el, 'y2')));
    return [[a.x, a.y, b.x, b.y]];
  }
  if (tag === 'polyline' || tag === 'polygon') {
    const pts = C001_parsePoints(C001_attr(el, 'points'), t, tag === 'polygon');
    return pts.slice(1).map((pt, i) => [pts[i].x, pts[i].y, pt.x, pt.y]);
  }
  if (tag === 'path') {
    return C001_pathSegments(C001_attr(el, 'd'), t);
  }
  if (tag === 'rect') {
    const x = Number(C001_attr(el, 'x'));
    const y = Number(C001_attr(el, 'y'));
    const w = Number(C001_attr(el, 'width'));
    const h = Number(C001_attr(el, 'height'));
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(p => C001_point(t, p[0], p[1]));
    return pts.slice(1).map((pt, i) => [pts[i].x, pts[i].y, pt.x, pt.y]);
  }
  return [];
}

function C001_buildDXF(cfg) {
  const layout = C001_getLayout(cfg);
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
      '10', C001_num(seg[0]),
      '20', C001_num(-seg[1]),
      '30', '0',
      '11', C001_num(seg[2]),
      '21', C001_num(-seg[3]),
      '31', '0'
    );
  };
  const addElements = (elements, layer) => {
    elements.forEach(el => C001_elementSegments(el, layout).forEach(seg => addLine(seg, layer)));
  };

  addElements(C001_visibleElements(layout.bleedElements), 'BLEED');
  addElements(C001_exportCutElements(layout), 'CUT');
  addElements(C001_visibleElements(layout.foldElements), 'FOLD');
  arr.push('0', 'ENDSEC', '0', 'EOF');
  return arr.join('\n');
}

function C001_pdfNum(value) {
  return Number.isFinite(+value) ? (+value).toFixed(3) : '0';
}

function C001_pdfLineOps(elements, layout, bounds, pad, color, dash) {
  const pt = 72 / 25.4;
  const pageH = (bounds.height + pad * 2) * pt;
  const ops = [color, dash || '[] 0 d'];

  elements.forEach(el => {
    C001_elementSegments(el, layout).forEach(seg => {
      const x1 = (seg[0] - bounds.minX + pad) * pt;
      const y1 = pageH - ((seg[1] - bounds.minY + pad) * pt);
      const x2 = (seg[2] - bounds.minX + pad) * pt;
      const y2 = pageH - ((seg[3] - bounds.minY + pad) * pt);
      ops.push(C001_pdfNum(x1) + ' ' + C001_pdfNum(y1) + ' m ' +
        C001_pdfNum(x2) + ' ' + C001_pdfNum(y2) + ' l S');
    });
  });

  return ops.join('\n');
}

function C001_buildPDF(cfg) {
  const layout = C001_getLayout(cfg);
  const bounds = layout.bounds;
  const pad = 5;
  const pt = 72 / 25.4;
  const pageW = (bounds.width + pad * 2) * pt;
  const pageH = (bounds.height + pad * 2) * pt;
  const content = [
    '0.6 w',
    '1 J 1 j',
    C001_pdfLineOps(C001_visibleElements(layout.bleedElements), layout, bounds, pad, '0 0.333 1 RG'),
    C001_pdfLineOps(C001_exportCutElements(layout), layout, bounds, pad, '0.8 0 0 RG'),
    C001_pdfLineOps(C001_visibleElements(layout.foldElements), layout, bounds, pad, '0.114 0.435 0.91 RG', '[2.5 2] 0 d')
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + C001_pdfNum(pageW) + ' ' + C001_pdfNum(pageH) + '] /Contents 4 0 R >>',
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
