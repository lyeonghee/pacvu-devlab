// S001_export.js - S001 SVG export
// Production export keeps PacVu layers without watermark or dimensions.

function S001_buildExportSVG(cfg, options) {
  if (typeof S001_getLayout !== 'function') return '';
  const exportOptions = options || {};
  const partModes = {
    all: 'All Parts',
    outer: 'Outer Only',
    outerSleeve: 'Outer Only',
    inner: 'Inner Only',
    innerTray: 'Inner Only',
    insert: 'Insert Only',
    insertPad: 'Insert Only'
  };
  const viewMode = partModes[exportOptions.part] || exportOptions.viewMode || cfg?.viewMode || 'All Parts';
  const exportCfg = Object.assign({}, cfg || {}, {
    viewMode,
    productFitPreset: 'baseline',
    showOuterSleeve: true,
    showInnerTray: true,
    showInsertPad: true,
    insertPadEnabled: true
  });
  const layout = S001_getLayout(exportCfg, exportCfg);
  const bounds = layout.bounds || { minX: 0, minY: 0, width: 100, height: 100 };
  const pad = 5 * (typeof S001_UNIT_PER_MM !== 'undefined' ? S001_UNIT_PER_MM : 1);
  const vbX = bounds.minX - pad;
  const vbY = bounds.minY - pad;
  const vbW = bounds.width + pad * 2;
  const vbH = bounds.height + pad * 2;
  const unit = typeof S001_UNIT_PER_MM !== 'undefined' ? S001_UNIT_PER_MM : 1;
  const wMm = vbW / unit;
  const hMm = vbH / unit;

  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
    S001_num(vbX) + ' ' + S001_num(vbY) + ' ' + S001_num(vbW) + ' ' + S001_num(vbH) +
    '" width="' + S001_num(wMm) + 'mm" height="' + S001_num(hMm) + 'mm">\n';
  out += '<defs>' + S001_styleBlock() + '</defs>\n';

  layout.parts.forEach(part => {
    const tx = part.transform ? part.transform.x : 0;
    const ty = part.transform ? part.transform.y : 0;
    out += '  <g id="s001-' + part.key + '" transform="translate(' + S001_num(tx) + ' ' + S001_num(ty) + ')">\n';
    const fillPaths = S001_getExportPanelFillPaths(part, exportOptions);
    out += '    <g id="layer-panel-fill">' +
      fillPaths.map(path => '<path class="panel" d="' + path + '"/>').join('') +
      '</g>\n';
    if (part.bleedPath) {
      out += '    <g id="layer-bleed"><path class="bleed" d="' + part.bleedPath + '"/></g>\n';
    }
    if (part.cutElements && part.cutElements.length) {
      out += '    <g id="layer-cut">' + part.cutElements.map(element => '<path class="cut-fill" d="' + element.d + '"/>').join('') + '</g>\n';
    }
    if (part.foldElements && part.foldElements.length) {
      out += '    <g id="layer-fold">' + part.foldElements.map(element => '<path class="fold" d="' + element.d + '"/>').join('') + '</g>\n';
    }
    if (part.holeElements && part.holeElements.length) {
      out += '    <g id="layer-hole">' + part.holeElements.map(element => '<path class="hole" d="' + element.d + '"/>').join('') + '</g>\n';
    }
    out += '  </g>\n';
  });

  out += '</svg>';
  return out;
}

function S001_getExportPanelFillPaths(part, exportOptions) {
  // Panel fills are browser-preview helpers. Production SVG exports keep the layer
  // name but omit fill geometry so Illustrator does not expose hidden closure paths.
  if (!exportOptions || exportOptions.includePanelFill !== true) return [];
  const fillPaths = part.fillPaths && part.fillPaths.length ? part.fillPaths : (part.fillPath ? [part.fillPath] : []);
  if (part.key !== 'innerTray') return fillPaths;
  // The first inner tray fill is an automatic visual closure for the browser preview.
  // It looks correct on screen, but Illustrator exposes its hidden joining segment.
  return fillPaths.slice(1);
}

function S001_buildDXF(cfg, options) {
  const exportCfg = Object.assign({}, cfg || {}, { productFitPreset: 'baseline' });
  const layout = S001_getLayout(exportCfg, exportCfg);
  const unit = typeof S001_UNIT_PER_MM !== 'undefined' ? S001_UNIT_PER_MM : 1;
  const rows = window.PacVuDXFR12.createRows(['CUT','FOLD','BLEED']);
  const num = value => (Number(value) / unit).toFixed(4);
  const addPath = (d, part, layer) => {
    const points = S001_flattenPathD(d || '');
    const tx = part.transform?.x || 0;
    const ty = part.transform?.y || 0;
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1];
      const b = points[i];
      rows.push('0','LINE','8',layer,
        '10',num(a.x + tx),'20',num(-(a.y + ty)),'30','0',
        '11',num(b.x + tx),'21',num(-(b.y + ty)),'31','0');
    }
  };
  layout.parts.forEach(part => {
    if (part.bleedPath) addPath(part.bleedPath, part, 'BLEED');
    (part.cutElements || []).forEach(element => addPath(element.d, part, 'CUT'));
    (part.foldElements || []).forEach(element => addPath(element.d, part, 'FOLD'));
    (part.holeElements || []).forEach(element => addPath(element.d, part, 'CUT'));
  });
  return window.PacVuDXFR12.finish(rows);
}

if (typeof window !== 'undefined') {
  window.S001_buildExportSVG = S001_buildExportSVG;
  window.S001_buildDXF = S001_buildDXF;
}
