// ============================================================
// dxfExport.js - DXF export
// M-series DXF uses shared geometry collection so M002/M003 can
// attach the same way. Curved cut/bleed path DXF conversion is TODO.
// ============================================================

function _dxfNum(v) {
  return Number.isFinite(+v) ? (+v).toFixed(4) : '0';
}

function M_buildDXF(cfg, builders) {
  const geo = M_buildExportGeometry(cfg, builders);
  const arr = [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$INSUNITS',
    '70', '4',
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'ENTITIES'
  ];

  const addLine = (x1, y1, x2, y2, layer) => {
    arr.push(
      '0', 'LINE',
      '8', layer,
      '10', _dxfNum(x1),
      '20', _dxfNum(-y1),
      '30', '0',
      '11', _dxfNum(x2),
      '21', _dxfNum(-y2),
      '31', '0'
    );
  };

  const addCircle = (cx, cy, r, layer) => {
    arr.push(
      '0', 'CIRCLE',
      '8', layer,
      '10', _dxfNum(cx),
      '20', _dxfNum(-cy),
      '30', '0',
      '40', _dxfNum(r)
    );
  };

  // TODO: Convert M-series cutPath and bleedPath curves to DXF
  // polylines or SPLINE entities. For now this preserves the existing
  // non-empty DXF behavior for foldLine, slot, and hole.
  geo.foldLines.forEach(line => addLine(line.x1, line.y1, line.x2, line.y2, 'FOLD'));
  geo.slots.forEach(slot => {
    addLine(slot.x, slot.y, slot.x + slot.w, slot.y, 'SLOT');
    addLine(slot.x + slot.w, slot.y, slot.x + slot.w, slot.y + slot.h, 'SLOT');
    addLine(slot.x + slot.w, slot.y + slot.h, slot.x, slot.y + slot.h, 'SLOT');
    addLine(slot.x, slot.y + slot.h, slot.x, slot.y, 'SLOT');
  });
  geo.holes.forEach(hole => addCircle(hole.cx, hole.cy, hole.r, 'HOLE'));

  arr.push('0', 'ENDSEC', '0', 'EOF');
  return arr.join('\n');
}

function buildDXF_M001(cfg) {
  return M_buildDXF(cfg, {
    getGrid: M001_getGrid,
    buildOuterPath,
    buildFoldLines,
    buildSlots,
    buildHoles,
    buildBleedPath,
    getBounds,
    bleedOffset: 4
  });
}

function _buildT001DXF(cfg) {
  return typeof T001_buildDXF === 'function' ? T001_buildDXF(cfg) : '';
}

function buildDXF(cfg, engineKey) {
  if (engineKey === 'gbox') return buildDXF_M001(cfg);
  if (engineKey === 'bbox') return _buildT001DXF(cfg);
  return '';
}

window.M_buildDXF = M_buildDXF;
window.buildDXF_M001 = buildDXF_M001;
