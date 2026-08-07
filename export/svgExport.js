// ============================================================
// svgExport.js - clean SVG export
// Screen-only layers such as background, watermark, labels,
// dimensions, arrows, legend, viewportGroup, pan/zoom are excluded.
// ============================================================

function downloadFile(name, content, type) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type })),
    download: name
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function _exportNum(v) {
  return Number.isFinite(+v) ? (+v).toFixed(4) : '0';
}

function _hasExportContent(content) {
  return typeof content === 'string' && content.trim().length > 0;
}

function M_buildExportGeometry(cfg, builders) {
  const g = builders.getGrid(cfg);
  const cutPath = builders.buildOuterPath(cfg, g);
  const foldLines = builders.buildFoldLines(cfg, g);
  const slots = builders.buildSlots(cfg, g);
  const holes = builders.buildHoles(cfg, g);
  const bleedPath = builders.buildBleedPath(cfg, g, builders.bleedOffset || 4);
  const bounds = builders.getBounds(cutPath, foldLines, slots, holes);

  return { g, cutPath, bleedPath, foldLines, slots, holes, bounds };
}

function M_buildCleanExportSVG(cfg, builders) {
  const geo = M_buildExportGeometry(cfg, builders);
  const pad = builders.pad == null ? 10 : builders.pad;
  const vbX = geo.bounds.minX - pad;
  const vbY = geo.bounds.minY - pad;
  const vbW = geo.bounds.width + pad * 2;
  const vbH = geo.bounds.height + pad * 2;
  const slotRadius = builders.slotRadius == null ? 2.5 : builders.slotRadius;
  const styles = {
    cut: 'fill:#ffffff;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;',
    bleed: 'fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;',
    fold: 'fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;',
    slot: 'fill:none;stroke:#e53935;stroke-width:0.45;',
    hole: 'fill:none;stroke:#1f8f4f;stroke-width:0.45;'
  };

  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${_exportNum(vbX)} ${_exportNum(vbY)} ${_exportNum(vbW)} ${_exportNum(vbH)}" width="${_exportNum(vbW)}mm" height="${_exportNum(vbH)}mm">\n`;
  out += '  <g id="layer-bleed">\n';
  out += `    <path style="${styles.bleed}" d="${geo.bleedPath}"/>\n`;
  out += '  </g>\n';
  out += '  <g id="layer-cut">\n';
  out += `    <path style="${styles.cut}" d="${geo.cutPath}"/>\n`;
  out += '  </g>\n';
  out += '  <g id="layer-fold">\n';
  geo.foldLines.forEach(line => {
    out += `    <line style="${styles.fold}" x1="${_exportNum(line.x1)}" y1="${_exportNum(line.y1)}" x2="${_exportNum(line.x2)}" y2="${_exportNum(line.y2)}"/>\n`;
  });
  out += '  </g>\n';

  if (geo.slots && geo.slots.length) {
    out += '  <g id="layer-slots">\n';
    geo.slots.forEach(slot => {
      out += `    <path style="${styles.slot}" d="${roundRectPath(slot.x, slot.y, slot.w, slot.h, slotRadius)}"/>\n`;
    });
    out += '  </g>\n';
  }

  if (geo.holes && geo.holes.length) {
    out += '  <g id="layer-holes">\n';
    geo.holes.forEach(hole => {
      out += `    <path style="${styles.hole}" d="${circlePath(hole.cx, hole.cy, hole.r)}"/>\n`;
    });
    out += '  </g>\n';
  }

  out += '</svg>';
  return _hasExportContent(out) ? out : '';
}

function M001_buildExportSVG(cfg) {
  return M_buildCleanExportSVG(cfg, {
    getGrid: M001_getGrid,
    buildOuterPath,
    buildFoldLines,
    buildSlots,
    buildHoles,
    buildBleedPath,
    getBounds,
    bleedOffset: 4,
    slotRadius: 2.5,
    pad: 10
  });
}

function _buildT001ExportSVG(cfg) {
  return typeof T001_buildExportSVG === 'function' ? T001_buildExportSVG(cfg) : '';
}

function buildExportSVG(cfg, engineKey) {
  if (engineKey === 'gbox') return M001_buildExportSVG(cfg);
  if (engineKey === 'bbox') return _buildT001ExportSVG(cfg);
  return '';
}

window.M_buildExportGeometry = M_buildExportGeometry;
window.M_buildCleanExportSVG = M_buildCleanExportSVG;
window.M001_buildExportSVG = M001_buildExportSVG;
