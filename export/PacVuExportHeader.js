(function (root) {
  'use strict';

  const STANDARD = Object.freeze({
    id: 'PacVu Export Standard V1',
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    colors: Object.freeze({ ink: '#171b24', muted: '#7d899b', rule: '#dfe4eb', ready: '#159a61' }),
    layout: Object.freeze({ headerToPageWidth: 0.12, minHeaderHeight: 36, pageMinWidth: 297 }),
    labels: Object.freeze({
      eyebrow: 'PACVU \u00B7 EXPORT SPECIFICATION',
      subtitle: 'Production-ready dieline information',
      structure: 'STRUCTURE CODE & NAME',
      dimensions: 'WIDTH \u00D7 DEPTH \u00D7 HEIGHT',
      material: 'MATERIAL & THICKNESS',
      basis: 'DIMENSION BASIS',
      dieline: 'DIELINE SIZE',
      bleedSize: 'BLEED SIZE',
      options: 'SELECTED OPTIONS',
      ready: 'READY'
    }),
    legend: Object.freeze([
      { key: 'cut', label: 'CUT PATH', color: '#ef3e36' },
      { key: 'bleed', label: 'BLEED PATH', color: '#2867bd' },
      { key: 'fold', label: 'FOLD PATH', color: '#2867bd', dash: '5 4' },
      { key: 'punch', label: 'PUNCH PATH', color: '#299554' }
    ])
  });

  const registry = new Map();
  const number = value => Number.isFinite(+value) ? +value : 0;
  const round = value => String(Math.round(number(value) * 100) / 100);
  const escape = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function register(templateKey, resolver) {
    if (templateKey && typeof resolver === 'function') registry.set(String(templateKey).toUpperCase(), resolver);
  }

  function firstValue() {
    for (let index = 0; index < arguments.length; index += 1) {
      const value = arguments[index];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  function activeUnit(source) {
    return source && source.unit
      ? source.unit
      : (root.PacVuUnits ? root.PacVuUnits.getUnit() : 'mm');
  }

  function formatDimensions(cfg, unit) {
    if (root.PacVuUnits) {
      return [
        root.PacVuUnits.formatNumber(cfg.W, unit),
        root.PacVuUnits.formatNumber(cfg.D, unit),
        root.PacVuUnits.formatNumber(cfg.H, unit)
      ].join(' \u00D7 ') + ' ' + root.PacVuUnits.normalizeUnit(unit);
    }
    return [round(cfg.W), round(cfg.D), round(cfg.H)].join(' \u00D7 ') + ' mm';
  }

  function formatDielineSize(size, unit) {
    if (!Number.isFinite(+size.width) || !Number.isFinite(+size.height)) return '';
    if (root.PacVuUnits) return root.PacVuUnits.formatSize(size.width, size.height, unit);
    return [round(size.width), round(size.height)].join(' \u00D7 ') + ' mm';
  }

  function resolve(context) {
    const source = context || {};
    const cfg = source.cfg || {};
    const meta = source.meta || {};
    const code = String(meta.variantKey || meta.fefcoCode || source.templateKey || source.engineKey || '—').toUpperCase();
    const custom = registry.get(code);
    const bound = custom ? custom(source) || {} : {};
    const exportMeta = Object.assign({}, meta.export || {}, bound);
    const unit = activeUnit(source);
    const name = firstValue(exportMeta.name, meta.exportName, meta.label, meta.koreanName, code);
    const size = firstValue(exportMeta.dielineSize, source.dielineSize) || {};
    const bleedSize = firstValue(exportMeta.bleedSize, source.bleedSize) || {};
    const options = Array.isArray(exportMeta.options) ? exportMeta.options : [];
    return {
      standard: STANDARD.id,
      code,
      name,
      title: firstValue(exportMeta.title, code + ' / ' + name),
      subtitle: firstValue(exportMeta.subtitle, STANDARD.labels.subtitle),
      unit,
      dimensions: firstValue(exportMeta.dimensions, formatDimensions(cfg, unit)),
      material: firstValue(exportMeta.material, meta.material, '—'),
      dimensionBasis: firstValue(exportMeta.dimensionBasis, meta.dimensionBasis, '—'),
      dielineSize: firstValue(exportMeta.dielineSizeText, formatDielineSize(size, unit), '—'),
      bleedSize: firstValue(exportMeta.bleedSizeText, formatDielineSize(bleedSize, unit), '—'),
      options: options.length ? options.join('  \u00B7  ') : '—',
      status: firstValue(exportMeta.status, meta.exportStatus, STANDARD.labels.ready),
      extensions: Object.assign({
        version: '', generatedDate: '', generatedBy: '', qrCode: '', revision: '', release: ''
      }, exportMeta.extensions || {})
    };
  }

  function text(x, y, value, size, weight, fill, anchor, maxWidth) {
    const content = String(value == null ? '' : value);
    const baseSize = number(size);
    const estimatedWidth = Array.from(content).reduce((total, character) => {
      return total + baseSize * (/^[\x00-\x7F]$/.test(character) ? .53 : .95);
    }, 0);
    const fittedSize = maxWidth && estimatedWidth > maxWidth
      ? Math.max(baseSize * .68, baseSize * maxWidth / estimatedWidth)
      : baseSize;
    const fittedWidth = estimatedWidth * fittedSize / baseSize;
    const fit = maxWidth && fittedWidth > maxWidth
      ? ' textLength="' + round(maxWidth) + '" lengthAdjust="spacingAndGlyphs"'
      : '';
    return '<text x="' + round(x) + '" y="' + round(y) + '" font-size="' + round(fittedSize) + '" font-weight="' + weight +
      '" fill="' + fill + '" text-anchor="' + (anchor || 'start') + '"' + fit + '>' + escape(value) + '</text>';
  }

  function renderSVG(data, box) {
    const x = number(box.x), y = number(box.y), w = number(box.width), h = number(box.height);
    const s = h / 42;
    const pad = 6 * s;
    const c1 = x + w * .26;
    const c2 = x + w * .62;
    const left = x + pad, middle = c1 + 7 * s, right = c2 + 7 * s;
    const rightAvailable = x + w - pad - right;
    const rightSizeSplit = right + rightAvailable * .52;
    const ink = STANDARD.colors.ink, muted = STANDARD.colors.muted;
    const labelSize = 2.1 * s, valueSize = 3.35 * s;
    let out = '<g id="pacvu-export-header" data-standard="' + escape(STANDARD.id) + '" data-template="' + escape(data.code) + '" font-family="' + STANDARD.fontFamily + '">';
    out += '<rect x="' + round(x) + '" y="' + round(y) + '" width="' + round(w) + '" height="' + round(h) + '" rx="' + round(4 * s) + '" fill="#fff" stroke="' + ink + '" stroke-width="' + round(.42 * s) + '"/>';
    out += '<line x1="' + round(c1) + '" y1="' + round(y + 4*s) + '" x2="' + round(c1) + '" y2="' + round(y + h - 4*s) + '" stroke="' + STANDARD.colors.rule + '" stroke-width="' + round(.3*s) + '"/>';
    out += '<line x1="' + round(c2) + '" y1="' + round(y + 4*s) + '" x2="' + round(c2) + '" y2="' + round(y + h - 4*s) + '" stroke="' + STANDARD.colors.rule + '" stroke-width="' + round(.3*s) + '"/>';
    out += text(left, y + 6*s, STANDARD.labels.eyebrow, labelSize, 700, '#617087');
    out += text(left, y + 13*s, data.title, 4.65*s, 700, ink, 'start', c1-left-pad);
    out += text(left, y + 17.5*s, data.subtitle, 2.55*s, 400, '#6d7890');
    STANDARD.legend.forEach((item, index) => {
      const ly = y + (24.5 + index * 4.2) * s;
      const dash = item.dash ? item.dash.split(' ').map(value => round(number(value) * s)).join(' ') : '';
      out += '<line x1="' + round(left) + '" y1="' + round(ly) + '" x2="' + round(left + 13*s) + '" y2="' + round(ly) + '" stroke="' + item.color + '" stroke-width="' + round(.55*s) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
      out += text(left + 16*s, ly + .75*s, item.label, 2.05*s, 700, item.color);
    });
    out += text(middle, y + 7*s, STANDARD.labels.structure, labelSize, 700, muted);
    out += text(middle, y + 12*s, data.code + ' \u00B7 ' + data.name, valueSize, 650, ink, 'start', c2-middle-5*s);
    out += text(middle, y + 20*s, STANDARD.labels.dimensions, labelSize, 700, muted);
    out += text(middle, y + 25*s, data.dimensions, valueSize, 650, ink);
    out += text(middle, y + 33*s, STANDARD.labels.material, labelSize, 700, muted);
    out += text(middle, y + 38*s, data.material, valueSize, 650, ink, 'start', c2-middle-5*s);
    out += text(right, y + 7*s, STANDARD.labels.basis, labelSize, 700, muted);
    out += text(right, y + 12*s, data.dimensionBasis, valueSize, 650, ink, 'start', x+w-pad-right);
    out += text(right, y + 20*s, STANDARD.labels.dieline, labelSize, 700, muted);
    out += text(right, y + 25*s, data.dielineSize, valueSize, 650, ink, 'start', rightSizeSplit-right-2*s);
    out += text(rightSizeSplit, y + 20*s, STANDARD.labels.bleedSize, labelSize, 700, muted);
    out += text(rightSizeSplit, y + 25*s, data.bleedSize, valueSize, 650, ink, 'start', x+w-pad-rightSizeSplit);
    out += text(right, y + 33*s, STANDARD.labels.options, labelSize, 700, muted);
    out += text(right, y + 38*s, data.options, valueSize, 650, ink, 'start', x+w-pad-right);
    out += '<circle cx="' + round(x+w-pad-8*s) + '" cy="' + round(y+5.2*s) + '" r="' + round(.85*s) + '" fill="' + STANDARD.colors.ready + '"/>';
    out += text(x+w-pad, y+6*s, data.status, 2.05*s, 700, STANDARD.colors.ready, 'end');
    return out + '</g>';
  }

  function parseSvg(svg) {
    const open = svg.match(/<svg\b([^>]*)>/i);
    if (!open) return null;
    const attr = open[1];
    const viewBox = (attr.match(/viewBox="([^"]+)"/i) || [])[1];
    const values = viewBox ? viewBox.trim().split(/[\s,]+/).map(Number) : [];
    if (values.length !== 4 || values.some(value => !Number.isFinite(value))) return null;
    return { open: open[0], x: values[0], y: values[1], width: values[2], height: values[3] };
  }

  function wrapSVG(svg, context) {
    const parsed = parseSvg(svg);
    if (!parsed) return svg;
    const margin = Math.max(6, parsed.width * .025);
    const pageWidth = Math.max(parsed.width + margin * 2, STANDARD.layout.pageMinWidth);
    const headerHeight = Math.max(STANDARD.layout.minHeaderHeight, pageWidth * STANDARD.layout.headerToPageWidth);
    const headerY = margin;
    const contentY = margin + headerHeight + margin;
    const pageHeight = contentY + parsed.height + margin;
    const contentX = (pageWidth - parsed.width) / 2;
    const data = resolve(Object.assign({}, context, { dielineSize: { width: parsed.width, height: parsed.height } }));
    const nested = svg.replace(/^\s*<\?xml[^>]*>\s*/i, '').replace(parsed.open,
      '<svg x="' + round(contentX) + '" y="' + round(contentY) + '" width="' + round(parsed.width) + '" height="' + round(parsed.height) + '" viewBox="' + [parsed.x, parsed.y, parsed.width, parsed.height].join(' ') + '">');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + round(pageWidth) + ' ' + round(pageHeight) + '" width="' + round(pageWidth) + 'mm" height="' + round(pageHeight) + 'mm">\n' +
      '<metadata data-standard="' + escape(STANDARD.id) + '" data-template="' + escape(data.code) + '"/>\n' +
      renderSVG(data, { x: margin, y: headerY, width: pageWidth - margin * 2, height: headerHeight }) + '\n' + nested + '\n</svg>';
  }

  async function svgToPDF(svg) {
    const parsed = parseSvg(svg);
    const JsPDF = root.jspdf && root.jspdf.jsPDF;
    if (!parsed || !JsPDF) throw new Error('PacVu PDF vector renderer is not ready.');
    const documentNode = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const svgNode = documentNode.documentElement;
    const pdf = new JsPDF({
      unit: 'mm',
      format: [parsed.width, parsed.height],
      orientation: parsed.width >= parsed.height ? 'landscape' : 'portrait',
      compress: true,
      putOnlyUsedFonts: true
    });
    if (typeof pdf.svg !== 'function') throw new Error('PacVu SVG-to-PDF renderer is not ready.');
    await pdf.svg(svgNode, { x: 0, y: 0, width: parsed.width, height: parsed.height });
    return pdf.output('arraybuffer');
  }

  root.PacVuExportHeader = Object.freeze({ STANDARD, register, resolve, renderSVG, wrapSVG, svgToPDF });
})(window);
