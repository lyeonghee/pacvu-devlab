// ============================================================
// T003_renderer.js - Bottle Box / left renderer
// Visual style follows T002.
// Depends on T003_spec.js, T003_layout.js
// ============================================================

function T003_num(value) {
  return +(+value).toFixed(4);
}

function T003_matrix(t) {
  return 'matrix(' + [t.a, t.b, t.c, t.d, t.e, t.f].map(T003_num).join(' ') + ')';
}

function T003_restyleElement(el, className) {
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

function T003_isHoleElement(el) {
  return el.includes('M489.104,162.992');
}

function T003_getHoleValue(cfg, key, fallback) {
  const cfgValue = Number(cfg && cfg[key]);
  if (Number.isFinite(cfgValue) && cfgValue > 0) return cfgValue;

  if (typeof document !== 'undefined') {
    const el = document.getElementById(key);
    const domValue = Number(el && el.value);
    if (Number.isFinite(domValue) && domValue > 0) return domValue;
  }

  return fallback;
}

function T003_holeDefs(layout, cfg) {
  if (cfg && cfg.bottleNeckHoleEnabled === false) return [];
  const t = layout.transform;
  const unitToMm = layout.spec && layout.spec.base ? layout.spec.base.unitToMm : 25.4 / 72;
  const holes = [
    { id: 'hole_1', cx: 438.08, cy: 162.992, sourceR: 51.024 }
  ];

  return holes.map(hole => {
    const defaultDia = hole.sourceR * 2 * unitToMm;
    const dia = T003_getHoleValue(cfg, 'bottleNeckHoleDia', defaultDia);
    return {
      id: hole.id,
      cx: hole.cx * t.a,
      cy: hole.cy * t.d,
      r: dia / 2
    };
  });
}

function T003_holeFillCircles(layout, cfg) {
  return T003_holeDefs(layout, cfg).map(hole =>
    '<circle id="' + hole.id + '_fill" class="hole-area" cx="' + T003_num(hole.cx) +
    '" cy="' + T003_num(hole.cy) + '" r="' + T003_num(hole.r) + '"/>'
  ).join('');
}

function T003_holeCircles(layout, cfg) {
  return T003_holeDefs(layout, cfg).map(hole =>
    '<circle id="' + hole.id + '" class="cut-fill" cx="' + T003_num(hole.cx) +
    '" cy="' + T003_num(hole.cy) + '" r="' + T003_num(hole.r) + '"/>'
  ).join('');
}

function T003_styleBlock() {
  return '<style>' +
    '.cut-area{fill:#ffffff;stroke:none;}' +
    '.hole-area{fill:#d0d0d0;stroke:none;}' +
    '.glue-area{fill:#d4d4d4;opacity:0.72;stroke:none;}' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.45;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.label{fill:#333;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function T003_arrowMarkerDef() {
  return '<marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 Z" fill="#111"/></marker>';
}

function T003_watermarkDef() {
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">' +
    '<text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>' +
    '</pattern>';
}

function T003_cutFillPath(layout) {
  const hasStraightNeck = layout && layout.spec && layout.spec.useNeckLine;
  const neckPath = hasStraightNeck
    ? [
      'L540.837 42.520'
    ]
    : [
      'L404.065 42.520',
      'C404.065 61.297 419.304 77.162 438.081 77.162',
      'C456.858 77.162 472.097 61.297 472.097 42.520',
      'L540.837 42.520'
    ];

  return [
    'M1294.285 1216.063',
    'L1173.813 1338.803',
    'L1119.070 1338.803',
    'C1113.561 1338.803 1108.538 1335.598 1106.217 1330.602',
    'L1052.876 1215.802',
    'C1052.608 1215.218 1052.075 1214.801 1051.443 1214.681',
    'C1050.811 1214.561 1050.163 1214.753 1049.699 1215.199',
    'L1035.639 1228.692',
    'L1045.404 1249.632',
    'L1039.735 1381.324',
    'L970.853 1381.324',
    'L928.900 1339.371',
    'L928.900 1338.804',
    'L928.900 1345.891',
    'L893.467 1381.324',
    'L819.199 1381.324',
    'L807.856 1216.495',
    'C807.802 1215.716 807.295 1215.039 806.563 1214.769',
    'C805.831 1214.499 805.005 1214.685 804.459 1215.242',
    'L683.420 1338.804',
    'L628.677 1338.804',
    'C623.168 1338.804 618.144 1335.598 615.823 1330.602',
    'L562.482 1215.802',
    'C562.214 1215.218 561.681 1214.801 561.049 1214.681',
    'C560.417 1214.561 559.769 1214.753 559.305 1215.199',
    'L545.245 1228.692',
    'L555.010 1249.632',
    'L549.341 1381.324',
    'L480.459 1381.324',
    'L437.939 1338.804',
    'L438.506 1338.804',
    'L438.506 1345.891',
    'L403.073 1381.324',
    'L326.821 1381.324',
    'L315.482 1216.064',
    'L258.789 1159.370',
    'L258.789 392.199',
    'L315.482 377.008',
    'L321.152 377.008',
    'L321.152 56.693',
    'C321.152 48.870 327.502 42.520 335.325 42.520',
    'L404.065 42.520',
    ...neckPath,
    'C548.660 42.520 555.010 48.870 555.010 56.693',
    'L555.010 377.008',
    'L568.334 377.008',
    'L568.334 357.165',
    'L576.838 348.661',
    'L596.809 274.127',
    'C598.468 267.936 604.090 263.622 610.499 263.622',
    'L793.033 263.622',
    'L798.794 373.650',
    'C798.895 375.568 800.505 377.057 802.425 377.007',
    'C804.345 376.957 805.876 375.385 805.876 373.465',
    'L805.876 134.646',
    'L808.427 134.646',
    'L808.427 113.386',
    'C808.427 101.651 817.951 92.126 829.687 92.126',
    'L1027.262 92.126',
    'C1038.998 92.126 1048.522 101.650 1048.522 113.386',
    'L1048.522 134.646',
    'L1051.073 134.646',
    'L1051.073 373.465',
    'C1051.073 375.385 1052.604 376.957 1054.524 377.007',
    'C1056.444 377.057 1058.055 375.568 1058.155 373.650',
    'L1063.916 263.622',
    'L1250.419 263.622',
    'C1256.828 263.622 1262.450 267.936 1264.109 274.127',
    'L1284.080 348.661',
    'L1293.857 360.455',
    'L1294.285 377.008',
    'Z'
  ].join(' ');
}

function T003_glueFillPath() {
  return [
    'M315.482 377.008',
    'L258.789 392.199',
    'L258.789 1159.370',
    'L315.482 1216.063',
    'Z'
  ].join(' ');
}

function T003_renderSVG(cfg, appState) {
  const layout = T003_getLayout(cfg.W, cfg.D, cfg.H);
  const t = layout.transform;
  const matrix = T003_matrix(t);
  const pad = 80;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    T003_num(vbX) + ' ' + T003_num(vbY) + ' ' + T003_num(vbW) + ' ' + T003_num(vbH) +
    '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg += '<defs>' + T003_arrowMarkerDef() + T003_watermarkDef() + T003_styleBlock() + '</defs>\n';
  svg += '<rect x="' + T003_num(vbX) + '" y="' + T003_num(vbY) + '" width="' + T003_num(vbW) + '" height="' + T003_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '  <g id="layer-fill" transform="' + matrix + '"><path class="cut-area" fill-rule="evenodd" d="' + T003_cutFillPath(layout) + '"/></g>\n';
  if (!appState || appState.showPerforation) {
    svg += '  <g id="layer-hole-fill">' + T003_holeFillCircles(layout, cfg) + '</g>\n';
  }
  svg += '  <g id="layer-glue-fill" transform="' + matrix + '"><path class="glue-area" d="' + T003_glueFillPath() + '"/></g>\n';
  if (!appState || appState.showBleed) {
    svg += '  <g id="layer-bleed" transform="' + matrix + '">' + T003_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  }
  if (!appState || appState.showCut) {
    svg += '  <g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.filter(el => !T003_isHoleElement(el)).map(el => T003_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  }
  if (!appState || appState.showPerforation) {
    svg += '  <g id="layer-holes">' + T003_holeCircles(layout, cfg) + '</g>\n';
  }

  if (!appState || appState.showFolds) {
    svg += '  <g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(el => T003_restyleElement(el, 'fold')).join('') + '</g>\n';
  }
  if (!appState || appState.showLabels) {
    svg += T003_buildLabelLayer(layout);
  }
  if (!appState || appState.showDims) {
    svg += T003_buildDimensionLayer(cfg, t);
  }

  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function T003_buildLabelLayer(layout) {
  const t = layout.transform;
  let out = '  <g id="layer-labels">\n';
  layout.labels.forEach(label => {
    out += '    <text class="label" x="' + T003_num(label.x * t.a) + '" y="' + T003_num(label.y * t.d) +
      '" font-size="4.5" text-anchor="middle" dominant-baseline="middle">' + label.name + '</text>\n';
  });
  out += '  </g>\n';
  return out;
}

function T003_buildDimensionLayer(cfg, t) {
  function tx(x) { return x * t.a; }
  function ty(y) { return y * t.d; }
  function line(x1, y1, x2, y2, label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return '<line x1="' + T003_num(x1) + '" y1="' + T003_num(y1) + '" x2="' + T003_num(x2) + '" y2="' + T003_num(y2) + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + T003_num(midX) + '" y="' + T003_num(midY + 6) + '" font-size="5.5" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vline(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const textX = x + 5;
    return '<line x1="' + T003_num(x) + '" y1="' + T003_num(y1) + '" x2="' + T003_num(x) + '" y2="' + T003_num(y2) + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + T003_num(textX) + '" y="' + T003_num(mid) + '" font-size="5.5" font-weight="600" transform="rotate(-90 ' + T003_num(textX) + ' ' + T003_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }
  return '  <g id="layer-dimensions">' +
    line(tx(315.482), ty(874.418), tx(560.679), ty(874.418), window.PacVuUnits.formatDimension('W', cfg.W)) +
    line(tx(560.679), ty(874.301), tx(805.876), ty(874.301), window.PacVuUnits.formatDimension('D', cfg.D)) +
    vline(tx(506.466), ty(377.008), ty(1216.063), window.PacVuUnits.formatDimension('H', cfg.H)) +
    '</g>\n';
}

function T003_buildExportSVG(cfg) {
  const layout = T003_getLayout(cfg.W, cfg.D, cfg.H);
  const matrix = T003_matrix(layout.transform);
  const pad = 5;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + T003_num(vbX) + ' ' + T003_num(vbY) + ' ' + T003_num(vbW) + ' ' + T003_num(vbH) + '" width="' + T003_num(vbW) + 'mm" height="' + T003_num(vbH) + 'mm">\n';
  out += '<defs>' + T003_styleBlock() + '</defs>\n';
  out += '<g id="layer-bleed" transform="' + matrix + '">' + T003_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  out += '<g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.filter(el => !T003_isHoleElement(el)).map(el => T003_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  out += '<g id="layer-holes">' + T003_holeCircles(layout, cfg) + '</g>\n';
  out += '<g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(el => T003_restyleElement(el, 'fold')).join('') + '</g>\n';
  out += '</svg>';
  return out;
}

function T003_buildDXF() {
  return '';
}

// ============================================================
// PacVu Engine renderer override - T002 display/export contract
// ============================================================
function T003_resolveHoles(layout, cfg) {
  if (cfg && cfg.bottleNeckHoleEnabled === false) return [];
  const center = layout.mapper.point(438.08, 162.992);
  const diameter = T003_getHoleValue(cfg, 'bottleNeckHoleDia', 36);
  return [{ id: 'hole_1', name: 'Bottle Neck Hole', panelKey: 'inner', cx: center.x, cy: center.y, r: diameter / 2 }];
}

function T003_holeCircles(layout, cfg) {
  return T003_resolveHoles(layout, cfg).map(hole =>
    '<circle id="' + hole.id + '" class="cut-fill" cx="' + T003_num(hole.cx) +
    '" cy="' + T003_num(hole.cy) + '" r="' + T003_num(hole.r) + '"/>'
  ).join('');
}

function T003_holeFillCircles(layout, cfg) {
  return T003_resolveHoles(layout, cfg).map(hole =>
    '<circle class="hole-area" fill="#d0d0d0" cx="' + T003_num(hole.cx) + '" cy="' +
    T003_num(hole.cy) + '" r="' + T003_num(hole.r) + '"/>'
  ).join('');
}

function T003_renderSVG(cfg, appState) {
  const layout = T003_getLayout(cfg.W, cfg.D, cfg.H);
  const visual = T002_displayVisualStyle(layout);
  const pad = 80;
  const vbX = layout.bounds.minX - pad, vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2, vbH = layout.bounds.height + pad * 2;
  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    [vbX,vbY,vbW,vbH].map(T003_num).join(' ') + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg += '<defs>' + T001_arrowMarkerDef(visual.arrowMarkerSize) + T001_overallArrowMarkerDefs(visual.arrowMarkerSize) + T001_watermarkDef(visual) + T001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + T003_num(vbX) + '" y="' + T003_num(vbY) + '" width="' + T003_num(vbW) + '" height="' + T003_num(vbH) + '" fill="#d0d0d0"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '<g id="layer-fill"><path class="cut-area" d="' + layout.fillPath + '"/>' + T003_holeFillCircles(layout,cfg) + '</g>\n';
  svg += '<g id="layer-glue-fill"><path class="glue-area" d="' + layout.glueFillPath + '"/></g>\n';
  if (!appState || appState.showBleed) svg += '<g id="layer-bleed">' + T003_restyleElement(layout.bleedElement,'bleed') + '</g>\n';
  if (!appState || appState.showCut) svg += '<g id="layer-cut">' + layout.cutElements.map(el=>T003_restyleElement(el,'cut-fill')).join('') + T003_holeCircles(layout,cfg) + '</g>\n';
  if (!appState || appState.showFolds) svg += '<g id="layer-fold">' + layout.foldElements.map(el=>T003_restyleElement(el,'fold')).join('') + '</g>\n';
  if (!appState || appState.showLabels) svg += T001_buildLabelLayer(layout, visual);
  if (!appState || appState.showDims) {
    svg += T001_buildAdaptiveDimensionLayer(cfg, layout.grid, visual);
    svg += T001_buildOverallDimensionLayer(layout, visual);
  }
  svg += '<rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/></g></svg>';
  return svg;
}

function T003_buildExportSVG(cfg) {
  const layout = T003_getLayout(cfg.W,cfg.D,cfg.H), pad = 5;
  const vbX=layout.bounds.minX-pad, vbY=layout.bounds.minY-pad;
  const vbW=layout.bounds.width+pad*2, vbH=layout.bounds.height+pad*2;
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [vbX,vbY,vbW,vbH].map(T003_num).join(' ') + '" width="' + T003_num(vbW) + 'mm" height="' + T003_num(vbH) + 'mm">' +
    '<defs>' + T003_styleBlock() + '</defs>' +
    '<g id="layer-bleed">' + T003_restyleElement(layout.bleedElement,'bleed') + '</g>' +
    '<g id="layer-cut">' + layout.cutElements.map(el=>T003_restyleElement(el,'cut-fill')).join('') + T003_holeCircles(layout,cfg) + '</g>' +
    '<g id="layer-fold">' + layout.foldElements.map(el=>T003_restyleElement(el,'fold')).join('') + '</g></svg>';
}

function T003_buildDXF(cfg) {
  const layout=T003_getLayout(cfg.W,cfg.D,cfg.H);
  const rows=window.PacVuDXFR12.createRows(['CUT','FOLD','BLEED']);
  const line=(x1,y1,x2,y2,layer)=>rows.push('0','LINE','8',layer,'10',String(T003_num(x1)),'20',String(T003_num(-y1)),'30','0','11',String(T003_num(x2)),'21',String(T003_num(-y2)),'31','0');
  const path=(d,layer)=>{const p=T001_flattenPathD(d);for(let i=0;i<p.length-1;i++)line(p[i].x,p[i].y,p[i+1].x,p[i+1].y,layer);};
  path(layout.fillPath,'CUT');
  T003_resolveHoles(layout,cfg).forEach(h=>rows.push('0','CIRCLE','8','CUT','10',String(T003_num(h.cx)),'20',String(T003_num(-h.cy)),'30','0','40',String(T003_num(h.r))));
  layout.foldElements.forEach(el=>line(Number(T001_attr(el,'x1')),Number(T001_attr(el,'y1')),Number(T001_attr(el,'x2')),Number(T001_attr(el,'y2')),'FOLD'));
  path(layout.bleedPath,'BLEED'); return window.PacVuDXFR12.finish(rows);
}
