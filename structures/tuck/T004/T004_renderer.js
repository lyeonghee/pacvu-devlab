// ============================================================
// T004_renderer.js - B-Type Tuck Box renderer
// Visual style follows T002/T003.
// Depends on T004_spec.js, T004_layout.js
// ============================================================

function T004_num(value) {
  return +(+value).toFixed(4);
}

function T004_matrix(t) {
  return 'matrix(' + [t.a, t.b, t.c, t.d, t.e, t.f].map(T004_num).join(' ') + ')';
}

function T004_restyleElement(el, className) {
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

function T004_attr(el, name) {
  const re = new RegExp(name + '="([^"]*)"');
  const match = el.match(re);
  return match ? match[1] : '';
}

function T004_styleBlock() {
  return '<style>' +
    '.cut-area{fill:#ffffff;stroke:none;}' +
    '.glue-area{fill:#d4d4d4;opacity:0.72;stroke:none;}' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.45;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.label{fill:#333;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function T004_arrowMarkerDef() {
  return '<marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 Z" fill="#111"/></marker>';
}

function T004_watermarkDef() {
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">' +
    '<text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>' +
    '</pattern>';
}

function T004_bleedPath(layout) {
  return T004_attr(layout.bleedElement, 'd');
}

function T004_cutFillPath() {
  return [
    'M1416.232 997.507',
    'L1326.090 1089.633',
    'L1278.832 1089.633',
    'L1236.540 998.309',
    'C1236.152 997.464 1235.378 996.865 1234.463 996.701',
    'C1233.548 996.537 1232.614 996.831 1231.957 997.488',
    'L1218.930 1010.535',
    'L1229.711 1033.655',
    'L1223.382 1121.627',
    'C1222.956 1127.560 1218.020 1132.153 1212.073 1132.153',
    'L1184.358 1132.153',
    'L1141.838 1089.633',
    'L1048.295 1089.633',
    'L1049.145 1100.972',
    'L1012.295 1132.153',
    'L890.045 1132.153',
    'C884.156 1132.153 879.248 1127.647 878.747 1121.779',
    'L868.284 999.250',
    'C868.190 998.147 867.459 997.197 866.417 996.823',
    'C865.375 996.449 864.207 996.718 863.433 997.509',
    'L773.334 1089.633',
    'L726.076 1089.633',
    'L683.784 998.309',
    'C683.396 997.464 682.622 996.865 681.707 996.701',
    'C680.792 996.537 679.858 996.831 679.201 997.488',
    'L666.174 1010.535',
    'L676.955 1033.655',
    'L670.626 1121.627',
    'C670.200 1127.560 665.264 1132.153 659.317 1132.153',
    'L631.602 1132.153',
    'L589.082 1089.633',
    'L495.539 1089.633',
    'L496.389 1100.972',
    'L459.539 1132.153',
    'L334.467 1132.153',
    'C328.572 1132.153 323.663 1127.639 323.168 1121.766',
    'L312.704 997.507',
    'L256.011 940.814',
    'L256.011 474.115',
    'L312.704 458.925',
    'L312.704 274.673',
    'L314.122 274.673',
    'L314.122 257.665',
    'C314.122 235.759 331.901 217.980 353.807 217.980',
    'L640.106 217.980',
    'C662.012 217.980 679.791 235.759 679.791 257.665',
    'L679.791 274.673',
    'L681.208 274.673',
    'L681.208 456.799',
    'C681.208 457.751 681.843 458.589 682.759 458.846',
    'C683.675 459.103 684.654 458.718 685.149 457.905',
    'L689.712 450.349',
    'L692.547 345.539',
    'L825.661 345.539',
    'C829.506 345.539 832.880 348.128 833.875 351.842',
    'L854.972 430.578',
    'L863.476 439.082',
    'L863.476 458.924',
    'L1235.948 458.924',
    'L1235.948 439.082',
    'L1244.452 430.578',
    'L1265.549 351.842',
    'C1266.544 348.128 1269.917 345.539 1273.763 345.539',
    'L1406.877 345.539',
    'L1409.712 450.421',
    'L1416.232 458.925',
    'Z'
  ].join(' ');
}

function T004_glueFillPath() {
  return [
    'M312.704 458.925',
    'L256.011 474.115',
    'L256.011 940.814',
    'L312.704 997.507',
    'Z'
  ].join(' ');
}

function T004_renderSVG(cfg, appState) {
  const layout = T004_getLayout(cfg.W, cfg.D, cfg.H);
  const t = layout.transform;
  const matrix = T004_matrix(t);
  const pad = 80;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    T004_num(vbX) + ' ' + T004_num(vbY) + ' ' + T004_num(vbW) + ' ' + T004_num(vbH) +
    '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg += '<defs>' + T004_arrowMarkerDef() + T004_watermarkDef() + T004_styleBlock() + '</defs>\n';
  svg += '<rect x="' + T004_num(vbX) + '" y="' + T004_num(vbY) + '" width="' + T004_num(vbW) + '" height="' + T004_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '  <g id="layer-fill" transform="' + matrix + '"><path class="cut-area" d="' + T004_cutFillPath() + '"/></g>\n';
  svg += '  <g id="layer-glue-fill" transform="' + matrix + '"><path class="glue-area" d="' + T004_glueFillPath() + '"/></g>\n';
  if (!appState || appState.showBleed) {
    svg += '  <g id="layer-bleed" transform="' + matrix + '">' + T004_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  }
  if (!appState || appState.showCut) {
    svg += '  <g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.map(el => T004_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  }
  if (!appState || appState.showFolds) {
    svg += '  <g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(el => T004_restyleElement(el, 'fold')).join('') + '</g>\n';
  }
  if (!appState || appState.showLabels) {
    svg += T004_buildLabelLayer(layout);
  }
  if (!appState || appState.showDims) {
    svg += T004_buildDimensionLayer(cfg, t);
  }
  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function T004_buildLabelLayer(layout) {
  const t = layout.transform;
  let out = '  <g id="layer-labels">\n';
  layout.labels.forEach(label => {
    out += '    <text class="label" x="' + T004_num(label.x * t.a) + '" y="' + T004_num(label.y * t.d) +
      '" font-size="4.5" text-anchor="middle" dominant-baseline="middle">' + label.name + '</text>\n';
  });
  out += '  </g>\n';
  return out;
}

function T004_buildDimensionLayer(cfg, t) {
  function tx(x) { return x * t.a; }
  function ty(y) { return y * t.d; }
  function line(x1, y1, x2, y2, label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return '<line x1="' + T004_num(x1) + '" y1="' + T004_num(y1) + '" x2="' + T004_num(x2) + '" y2="' + T004_num(y2) + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + T004_num(midX) + '" y="' + T004_num(midY + 6) + '" font-size="5.5" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vline(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const textX = x + 5;
    return '<line x1="' + T004_num(x) + '" y1="' + T004_num(y1) + '" x2="' + T004_num(x) + '" y2="' + T004_num(y2) + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + T004_num(textX) + '" y="' + T004_num(mid) + '" font-size="5.5" font-weight="600" transform="rotate(-90 ' + T004_num(textX) + ' ' + T004_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }
  return '  <g id="layer-dimensions">' +
    line(tx(312.704), ty(825), tx(681.208), ty(825), window.PacVuUnits.formatDimension('W', cfg.W)) +
    line(tx(681.208), ty(825), tx(865.46), ty(825), window.PacVuUnits.formatDimension('D', cfg.D)) +
    vline(tx(577.942), ty(458.925), ty(997.507), window.PacVuUnits.formatDimension('H', cfg.H)) +
    '</g>\n';
}

function T004_buildExportSVG(cfg) {
  const layout = T004_getLayout(cfg.W, cfg.D, cfg.H);
  const matrix = T004_matrix(layout.transform);
  const pad = 5;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + T004_num(vbX) + ' ' + T004_num(vbY) + ' ' + T004_num(vbW) + ' ' + T004_num(vbH) + '" width="' + T004_num(vbW) + 'mm" height="' + T004_num(vbH) + 'mm">\n';
  out += '<defs>' + T004_styleBlock() + '</defs>\n';
  out += '<g id="layer-bleed" transform="' + matrix + '">' + T004_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  out += '<g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.map(el => T004_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  out += '<g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(el => T004_restyleElement(el, 'fold')).join('') + '</g>\n';
  out += '</svg>';
  return out;
}

function T004_buildDXF() {
  return '';
}

// ============================================================
// PacVu T004 master renderer/export override
// ============================================================
function T004_renderSVG(cfg, appState) {
  const layout=T004_getLayout(cfg.W,cfg.D,cfg.H), visual=T002_displayVisualStyle(layout), pad=80;
  const vbX=layout.bounds.minX-pad,vbY=layout.bounds.minY-pad,vbW=layout.bounds.width+pad*2,vbH=layout.bounds.height+pad*2;
  let svg='<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="'+[vbX,vbY,vbW,vbH].map(T004_num).join(' ')+'" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg+='<defs>'+T001_arrowMarkerDef(visual.arrowMarkerSize)+T001_overallArrowMarkerDefs(visual.arrowMarkerSize)+T001_watermarkDef(visual)+T001_styleBlock()+'</defs>\n';
  svg+='<rect x="'+T004_num(vbX)+'" y="'+T004_num(vbY)+'" width="'+T004_num(vbW)+'" height="'+T004_num(vbH)+'" fill="#d0d0d0"/>\n<g id="viewportGroup">\n';
  svg+='<g id="layer-fill"><path class="cut-area" d="'+layout.fillPath+'"/></g>\n';
  svg+='<g id="layer-glue-fill"><path class="glue-area" d="'+layout.glueFillPath+'"/></g>\n';
  if(!appState||appState.showBleed) svg+='<g id="layer-bleed">'+T004_restyleElement(layout.bleedElement,'bleed')+'</g>\n';
  if(!appState||appState.showCut) svg+='<g id="layer-cut">'+layout.cutElements.map(el=>T004_restyleElement(el,'cut-fill')).join('')+'</g>\n';
  if(!appState||appState.showFolds) svg+='<g id="layer-fold">'+layout.foldElements.map(el=>T004_restyleElement(el,'fold')).join('')+'</g>\n';
  if(!appState||appState.showLabels) svg+=T001_buildLabelLayer(layout,visual);
  if(!appState||appState.showDims){svg+=T001_buildAdaptiveDimensionLayer(cfg,layout.grid,visual);svg+=T001_buildOverallDimensionLayer(layout,visual);}
  svg+='<rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/></g></svg>';
  return svg;
}

function T004_buildExportSVG(cfg) {
  const layout=T004_getLayout(cfg.W,cfg.D,cfg.H),pad=5;
  const vbX=layout.bounds.minX-pad,vbY=layout.bounds.minY-pad,vbW=layout.bounds.width+pad*2,vbH=layout.bounds.height+pad*2;
  return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[vbX,vbY,vbW,vbH].map(T004_num).join(' ')+'" width="'+T004_num(vbW)+'mm" height="'+T004_num(vbH)+'mm">'+
    '<defs>'+T004_styleBlock()+'</defs><g id="layer-bleed">'+T004_restyleElement(layout.bleedElement,'bleed')+'</g><g id="layer-cut">'+layout.cutElements.map(el=>T004_restyleElement(el,'cut-fill')).join('')+'</g><g id="layer-fold">'+layout.foldElements.map(el=>T004_restyleElement(el,'fold')).join('')+'</g></svg>';
}

function T004_buildDXF(cfg) {
  const layout=T004_getLayout(cfg.W,cfg.D,cfg.H);
  const rows=window.PacVuDXFR12.createRows(['CUT','FOLD','BLEED']);
  const line=(x1,y1,x2,y2,layer)=>rows.push('0','LINE','8',layer,'10',String(T004_num(x1)),'20',String(T004_num(-y1)),'30','0','11',String(T004_num(x2)),'21',String(T004_num(-y2)),'31','0');
  const path=(d,layer)=>{const p=T001_flattenPathD(d);for(let i=0;i<p.length-1;i+=1)line(p[i].x,p[i].y,p[i+1].x,p[i+1].y,layer);};
  path(layout.fillPath,'CUT');
  layout.foldElements.forEach(el=>line(Number(T001_attr(el,'x1')),Number(T001_attr(el,'y1')),Number(T001_attr(el,'x2')),Number(T001_attr(el,'y2')),'FOLD'));
  path(layout.bleedPath,'BLEED');return window.PacVuDXFR12.finish(rows);
}
