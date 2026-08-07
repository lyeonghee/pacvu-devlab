// ============================================================
// M002_renderer.js - G-style Mailer Box 2
// SVG geometry is M002-specific; visual style follows M001.
// Depends on: M002_spec.js, M002_layout.js
// ============================================================

function M002_num(v) {
  return (+v).toFixed(4);
}

function M002_matrix(t) {
  return 'matrix(' + [t.a, t.b, t.c, t.d, t.e, t.f].map(M002_num).join(' ') + ')';
}

function M002_restyleElement(el, className) {
  var out = el
    .replace(/\sfill="[^"]*"/g, '')
    .replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '')
    .replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '')
    .replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '');
  return out.replace(/\/>$/, ' class="' + className + '"/>');
}

function M002_isHoleElement(el) {
  return /785\.248|856\.114|1468\.398|1397\.532|1351\.13|1280\.264/.test(el);
}

function M002_labelName(name) {
  var displayNames = {
    lidFront:'Lid Front', lid:'Lid', back:'Back', base:'Base', front:'Front',
    lidDustFlapLeft:'Lid Dust Flap(L)', lidDustFlapRight:'Lid Dust Flap(R)',
    lidSideFlapLeft:'Lid Side Flap(L)', lidSideFlapRight:'Lid Side Flap(R)',
    backInsertFlapLeft:'Back Insert(L)', backInsertFlapRight:'Back Insert(R)',
    bottomLockFlapLeft:'Lock Flap(L)', bottomLockFlapRight:'Lock Flap(R)',
    frontInsertFlapLeft:'Front Insert(L)', frontInsertFlapRight:'Front Insert(R)',
    sidePanelLeft:'Side Panel(L)', sidePanelRight:'Side Panel(R)'
  };
  return displayNames[name] || name;
}

function M002_labelPanelSize(name, spec) {
  var W = spec.W, D = spec.D, H = spec.H;
  if (name === 'lid' || name === 'base') return { width:W, height:D };
  if (name === 'lidFront' || name === 'back' || name === 'front') return { width:W, height:H };
  if (name === 'sidePanelLeft' || name === 'sidePanelRight') return { width:H, height:D };
  if (/InsertFlap/.test(name)) return { width:Math.max(H, 28), height:H };
  if (/LockFlap/.test(name)) return { width:Math.max(H, 28), height:D };
  if (/DustFlap/.test(name)) return { width:Math.max(D * .45, H), height:H };
  if (/SideFlap/.test(name)) return { width:H, height:D };
  return { width:W, height:H };
}

function M002_visualScale(cfg) {
  var avg = (cfg.W / 400 + cfg.D / 308 + cfg.H / 80) / 3;
  return Math.max(0.9, Math.min(1.2, avg));
}

function M002_arrowMarkerDef(scale) {
  var size = 10 * (scale || 1);
  return '<marker id="arrow" markerWidth="' + M002_num(size) + '" markerHeight="' + M002_num(size) + '" refX="10" refY="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 Z" fill="#111"/></marker>';
}

function M002_overallArrowDefs(size) {
  var s = Number(size) || 6.15;
  var mid = s / 2;
  return '<marker id="m002-overall-arrow-start" markerUnits="userSpaceOnUse" markerWidth="' + M002_num(s) + '" markerHeight="' + M002_num(s) + '" refX="0" refY="' + M002_num(mid) + '" orient="auto">' +
    '<path d="M' + M002_num(s) + ',0 L0,' + M002_num(mid) + ' L' + M002_num(s) + ',' + M002_num(s) + ' Z" fill="#111"/></marker>' +
    '<marker id="m002-overall-arrow-end" markerUnits="userSpaceOnUse" markerWidth="' + M002_num(s) + '" markerHeight="' + M002_num(s) + '" refX="' + M002_num(s) + '" refY="' + M002_num(mid) + '" orient="auto">' +
    '<path d="M0,0 L' + M002_num(s) + ',' + M002_num(mid) + ' L0,' + M002_num(s) + ' Z" fill="#111"/></marker>';
}

function M002_overallDimensionLayer(layout, visual) {
  if (typeof T001_buildOverallDimensionLayer !== 'function') return '';
  return T001_buildOverallDimensionLayer({ dielineBounds:layout.dielineBounds || layout.bounds, bleedBounds:layout.bounds }, visual)
    .replace(/marker-start="url\(#arrow\)"/g, 'marker-start="url(#m002-overall-arrow-start)"')
    .replace(/marker-end="url\(#arrow\)"/g, 'marker-end="url(#m002-overall-arrow-end)"')
    .replace(/url\(#overall-arrow-start\)/g, 'url(#m002-overall-arrow-start)')
    .replace(/url\(#overall-arrow-end\)/g, 'url(#m002-overall-arrow-end)');
}

function M002_styleBlock() {
  return '<style>' +
    '.thomson{fill:none;stroke:#cc0000;stroke-width:0.6;stroke-opacity:1;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.panel{fill:#ffffff;stroke:none;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.45;stroke-opacity:1;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.slot{fill:none;stroke:#e53935;stroke-width:0.6;stroke-opacity:1;vector-effect:non-scaling-stroke;}' +
    '.hole{fill:none;stroke:#1f8f4f;stroke-width:0.6;stroke-opacity:1;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.6;stroke-opacity:1;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    'text{font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function M002_exportStyleBlock() {
  return '<style>' +
    '.thomson{fill:none;stroke:#cc0000;stroke-width:1.276;stroke-linejoin:round;stroke-linecap:round;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.992;stroke-dasharray:5.669 4.535;}' +
    '.slot{fill:none;stroke:#e53935;stroke-width:1.276;}' +
    '.hole{fill:none;stroke:#1f8f4f;stroke-width:1.276;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:1.276;stroke-linejoin:round;stroke-linecap:round;}' +
    '</style>';
}

function M002_watermarkDef(visual) {
  visual = visual || {};
  return '<pattern id="m002-watermark" patternUnits="userSpaceOnUse" width="' + M002_num(visual.watermarkPatternWidth || 140) +
    '" height="' + M002_num(visual.watermarkPatternHeight || 100) + '" patternTransform="rotate(-25)">' +
    '<text x="' + M002_num(visual.watermarkTextX || 24) + '" y="' + M002_num(visual.watermarkTextY || 60) +
    '" font-size="' + M002_num(visual.watermarkFontSize || 22) + '" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="' +
    M002_num(visual.watermarkOpacity || .12) + '">PacVu</text></pattern>';
}

function M002_sharedLabelLayer(layout, visual) {
  var labels = layout.labels.map(function(label) {
    var size = M002_labelPanelSize(label.name, layout.spec);
    return {
      name:M002_labelName(label.name),
      x:label.x,
      y:label.y,
      panelWidth:size.width,
      panelHeight:size.height
    };
  });
  if (typeof T001_buildLabelLayer === 'function') return T001_buildLabelLayer({ labels:labels }, visual);
  return '<g id="layer-labels">' + labels.map(function(label) {
    return '<text class="label" x="' + M002_num(label.x) + '" y="' + M002_num(label.y) + '" text-anchor="middle" dominant-baseline="middle">' + label.name + '</text>';
  }).join('') + '</g>';
}

function M002_panelFillElements(layout) {
  var d = [
    'M566.981 99.634',
    'L1686.666 99.634',
    'L1686.666 105.303',
    'C1778.264 105.303 1859.564 165.076 1886.883 252.506',
    'C1891.461 267.159 1888.805 283.055 1879.712 295.423',
    'C1870.619 307.791 1856.238 315.067 1840.887 315.067',
    'L1686.665 315.067',
    'C1683.108 315.067 1680.103 317.702 1679.639 321.229',
    'C1679.175 324.755 1681.396 328.079 1684.831 328.999',
    'L1870.850 378.843',
    'C1885.089 382.658 1895.012 395.590 1895.012 410.330',
    'L1895.012 1115.552',
    'C1895.012 1130.293 1885.090 1143.225 1870.851 1147.040',
    'L1684.832 1196.884',
    'C1681.397 1197.805 1679.176 1201.128 1679.640 1204.654',
    'C1680.104 1208.180 1683.109 1210.815 1686.666 1210.815',
    'L2073.595 1210.815',
    'C2088.460 1210.815 2100.524 1222.879 2100.524 1237.744',
    'L2100.524 1412.075',
    'L1695.170 1417.744',
    'C1692.040 1417.744 1689.501 1420.284 1689.501 1423.413',
    'C1689.501 1426.543 1692.040 1429.083 1695.170 1429.083',
    'L1914.854 1429.083',
    'L1929.028 1434.752',
    'L2144.461 1434.752',
    'L2144.461 1562.311',
    'L2158.634 1566.109',
    'L2158.634 1714.419',
    'L2144.461 1718.217',
    'L2144.461 2013.019',
    'L2158.634 2016.817',
    'L2158.634 2165.128',
    'L2144.461 2168.926',
    'L2144.461 2296.484',
    'L1929.028 2296.484',
    'L1914.854 2302.154',
    'L1689.500 2302.154',
    'C1686.370 2302.154 1683.831 2304.694 1683.831 2307.823',
    'C1683.831 2310.953 1686.370 2313.492 1689.500 2313.492',
    'L2094.854 2319.161',
    'L2094.854 2496.327',
    'C2094.854 2511.192 2082.790 2523.256 2067.925 2523.256',
    'L1692.335 2523.256',
    'L1683.831 2526.090',
    'L569.815 2526.090',
    'L561.311 2523.256',
    'L185.721 2523.256',
    'C170.856 2523.256 158.792 2511.192 158.792 2496.327',
    'L158.792 2319.161',
    'L564.146 2313.492',
    'C567.275 2313.492 569.815 2310.952 569.815 2307.823',
    'C569.815 2304.694 567.275 2302.154 564.146 2302.154',
    'L338.792 2302.154',
    'L324.619 2296.484',
    'L109.185 2296.484',
    'L108.504 2296.484',
    'L108.504 2169.051',
    'L94.331 2165.257',
    'L94.331 2017.092',
    'L108.504 2013.298',
    'L108.504 1718.785',
    'L94.331 1714.991',
    'L94.331 1566.826',
    'L108.504 1563.032',
    'L108.504 1435.599',
    'L109.185 1434.752',
    'L324.619 1434.752',
    'L338.792 1429.083',
    'L558.477 1429.083',
    'C561.606 1429.083 564.146 1426.543 564.146 1423.414',
    'C564.146 1420.284 561.606 1417.744 558.477 1417.744',
    'L153.123 1412.075',
    'L153.123 1237.744',
    'C153.122 1222.879 165.186 1210.815 180.051 1210.815',
    'L566.981 1210.815',
    'C570.538 1210.815 573.543 1208.180 574.007 1204.654',
    'C574.471 1201.128 572.250 1197.805 568.815 1196.884',
    'L382.796 1147.040',
    'C368.557 1143.224 358.634 1130.293 358.634 1115.552',
    'L358.634 410.330',
    'C358.635 395.589 368.557 382.657 382.796 378.842',
    'L568.815 328.998',
    'C572.250 328.078 574.471 324.754 574.007 321.228',
    'C573.543 317.702 570.538 315.067 566.981 315.067',
    'L412.759 315.067',
    'C397.408 315.067 383.027 307.791 373.934 295.423',
    'C364.841 283.055 362.185 267.159 366.763 252.506',
    'C394.083 165.076 475.382 105.303 566.981 105.303',
    'Z'
  ].join(' ');
  return '<path d="' + d + '" class="panel"/>';
}

function M002_roundRectPath(x, y, w, h, r) {
  var rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    'M' + M002_num(x + rr) + ' ' + M002_num(y),
    'L' + M002_num(x + w - rr) + ' ' + M002_num(y),
    'Q' + M002_num(x + w) + ' ' + M002_num(y) + ' ' + M002_num(x + w) + ' ' + M002_num(y + rr),
    'L' + M002_num(x + w) + ' ' + M002_num(y + h - rr),
    'Q' + M002_num(x + w) + ' ' + M002_num(y + h) + ' ' + M002_num(x + w - rr) + ' ' + M002_num(y + h),
    'L' + M002_num(x + rr) + ' ' + M002_num(y + h),
    'Q' + M002_num(x) + ' ' + M002_num(y + h) + ' ' + M002_num(x) + ' ' + M002_num(y + h - rr),
    'L' + M002_num(x) + ' ' + M002_num(y + rr),
    'Q' + M002_num(x) + ' ' + M002_num(y) + ' ' + M002_num(x + rr) + ' ' + M002_num(y),
    'Z'
  ].join(' ');
}

function M002_handleHolePaths(layout, cfg) {
  if (cfg && cfg.handleHoleEnabled === false) return [];
  return layout.holes.map(function(hole) {
    return {
      id: hole.id,
      d: M002_roundRectPath(hole.cx-hole.width/2,hole.cy-hole.height/2,hole.width,hole.height,hole.radius)
    };
  });
}

function M002_renderSVG(cfg, state) {
  var layout = M002_getLayout(cfg.W, cfg.D, cfg.H);
  var visual = typeof T001_masterVisualStyle === 'function' ? T001_masterVisualStyle(layout) : null;
  var internalDimensionVisual = typeof T001_internalDimensionStyle === 'function'
    ? T001_internalDimensionStyle(layout)
    : visual;
  // Panel labels and internal W / D / H dimensions are normalized after DOM
  // fitting by the shared T001 screen-space adapter. Overall stays separate.
  if (visual) {
    visual.dimensionFontSize = 9.1875;
    visual.dimensionLineStroke = 0.5992;
    visual.arrowMarkerSize = 7;
  }
  var visualScale = visual ? Number(visual.uiScale) : M002_visualScale(cfg);
  var pad = 80;
  var vbX = layout.bounds.minX - pad;
  var vbY = layout.bounds.minY - pad;
  var vbW = layout.bounds.width + pad * 2;
  var vbH = layout.bounds.height + pad * 2;

  var svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    M002_num(vbX) + ' ' + M002_num(vbY) + ' ' + M002_num(vbW) + ' ' + M002_num(vbH) +
    '" width="' + M002_num(vbW) + 'mm" height="' + M002_num(vbH) + 'mm">\n';
  var internalArrowDef = typeof T001_arrowMarkerDef === 'function' && internalDimensionVisual
    ? T001_arrowMarkerDef(internalDimensionVisual.arrowMarkerSize, 'internal-dimension-arrow', 'userSpaceOnUse')
    : '';
  var overallDefs = M002_overallArrowDefs(internalDimensionVisual ? internalDimensionVisual.arrowMarkerSize : visualScale);
  svg += '<defs>' + internalArrowDef + overallDefs + M002_styleBlock() + M002_watermarkDef(visual) + '</defs>\n';
  svg += '<rect x="' + M002_num(vbX) + '" y="' + M002_num(vbY) + '" width="' + M002_num(vbW) + '" height="' + M002_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '<g id="layer-panel-fill"><path class="panel" d="' + layout.cutPath + '"/></g>\n';
  if (!state || state.showBleed) {
    svg += '<g id="layer-bleed"><path class="bleed" d="' + layout.bleedPath + '"/></g>\n';
  }
  if (!state || state.showCut) {
    svg += '<g id="layer-cut"><path class="thomson" d="' + layout.cutPath + '"/></g>\n';
  }

  if (state.showFolds) {
    svg += '<g id="layer-fold">' + layout.fold.map(function(f){return '<line id="'+f.id+'" class="fold" x1="'+M002_num(f.a.x)+'" y1="'+M002_num(f.a.y)+'" x2="'+M002_num(f.b.x)+'" y2="'+M002_num(f.b.y)+'"/>';}).join('') + '</g>\n';
  }
  if (state.showPerforation) {
    svg += '<g id="layer-slot">' + layout.slots.map(function(slot){return '<path id="'+slot.id+'" class="slot" d="'+slot.d+'"/>';}).join('') + '</g>\n';
  }
  if (state.showPerforation) {
    svg += '<g id="layer-hole">' + M002_handleHolePaths(layout, cfg).map(function(hole) {
      return '<path id="' + hole.id + '" class="hole" d="' + hole.d + '"/>';
    }).join('') + '</g>\n';
  }
  if (state.showLabels) {
    svg += M002_sharedLabelLayer(layout, visual);
  }
  if (state.showDims) {
    svg += M002_dimensionLayer(layout, cfg, internalDimensionVisual || visual || visualScale);
    svg += M002_overallDimensionLayer(layout, visual);
  }
  svg += '<rect id="layer-watermark" x="-5000" y="-5000" width="10000" height="10000" fill="url(#m002-watermark)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function M002_dimensionLayer(layout, cfg, scale) {
  var visual = typeof scale === 'object' ? scale : null;
  scale = visual ? Number(visual.uiScale) : (scale || 1);
  var textSize = visual ? Number(visual.dimensionFontSize) : Math.max(5.5, Math.min(7.2, 6.0 * scale));
  var strokeW = visual ? Number(visual.dimensionLineStroke) : 0.35;
  var format = function(axis, value) { return typeof T001_formatDimension === 'function' ? T001_formatDimension(axis, value) : axis + ' ' + value + ' mm'; };
  function line(x1, y1, x2, y2, label) {
    var midX = (x1 + x2) / 2;
    var midY = (y1 + y2) / 2;
    return '<line x1="' + M002_num(x1) + '" y1="' + M002_num(y1) + '" x2="' + M002_num(x2) + '" y2="' + M002_num(y2) + '" stroke="#111" stroke-width="' + M002_num(strokeW) + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text data-screen-dimension="1" data-anchor-x="' + M002_num(midX) + '" data-anchor-y="' + M002_num(midY) + '" data-offset-axis="y" x="' + M002_num(midX) + '" y="' + M002_num(midY + (visual ? visual.dimensionTextOffset : -2 * scale)) + '" font-size="' + M002_num(textSize) + '" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vline(x, y1, y2, label) {
    var mid = (y1 + y2) / 2;
    var textX = x + (visual ? visual.dimensionVerticalTextOffset : -5 * scale);
    return '<line x1="' + M002_num(x) + '" y1="' + M002_num(y1) + '" x2="' + M002_num(x) + '" y2="' + M002_num(y2) + '" stroke="#111" stroke-width="' + M002_num(strokeW) + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text data-screen-dimension="1" data-anchor-x="' + M002_num(x) + '" data-anchor-y="' + M002_num(mid) + '" data-offset-axis="x" x="' + M002_num(textX) + '" y="' + M002_num(mid) + '" font-size="' + M002_num(textSize) + '" font-weight="600" transform="rotate(-90 ' + M002_num(textX) + ' ' + M002_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }
  return '<g id="layer-dimensions">' +
    layout.dimensions.map(function(d){return d.axis==='horizontal'?line(d.a.x,d.a.y,d.b.x,d.b.y,d.label):vline(d.a.x,d.a.y,d.b.y,d.label);}).join('') +
    '</g>';
}

function M002_buildExportSVG(cfg) {
  var layout = M002_getLayout(cfg.W, cfg.D, cfg.H);
  var pad = 5;
  var vbX = layout.bounds.minX - pad;
  var vbY = layout.bounds.minY - pad;
  var vbW = layout.bounds.width + pad * 2;
  var vbH = layout.bounds.height + pad * 2;
  var out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + M002_num(vbX) + ' ' + M002_num(vbY) + ' ' + M002_num(vbW) + ' ' + M002_num(vbH) + '" width="' + M002_num(vbW) + 'mm" height="' + M002_num(vbH) + 'mm">\n';
  out += '<defs>' + M002_exportStyleBlock() + '</defs>\n';
  out += '<g id="layer-bleed"><path class="bleed" d="' + layout.bleedPath + '"/></g>\n';
  out += '<g id="layer-cut"><path class="thomson" d="' + layout.cutPath + '"/></g>\n';
  out += '<g id="layer-fold">' + layout.fold.map(function(f){return '<line id="'+f.id+'" class="fold" x1="'+M002_num(f.a.x)+'" y1="'+M002_num(f.a.y)+'" x2="'+M002_num(f.b.x)+'" y2="'+M002_num(f.b.y)+'"/>';}).join('') + '</g>\n';
  out += '<g id="layer-slot">' + layout.slots.map(function(slot){return '<path id="'+slot.id+'" class="slot" d="'+slot.d+'"/>';}).join('') + '</g>\n';
  out += '<g id="layer-hole">' + M002_handleHolePaths(layout, cfg).map(function(hole) {
    return '<path id="' + hole.id + '" class="hole" d="' + hole.d + '"/>';
  }).join('') + '</g>\n';
  out += '</svg>';
  return out;
}

function M002_roundRectPoints(item, steps) {
  var points=[],count=steps||5,corners=[
    {cx:item.x+item.width-item.radius,cy:item.y+item.radius,a0:-90,a1:0},
    {cx:item.x+item.width-item.radius,cy:item.y+item.height-item.radius,a0:0,a1:90},
    {cx:item.x+item.radius,cy:item.y+item.height-item.radius,a0:90,a1:180},
    {cx:item.x+item.radius,cy:item.y+item.radius,a0:180,a1:270}
  ];
  corners.forEach(function(corner){for(var i=0;i<=count;i++){var angle=(corner.a0+(corner.a1-corner.a0)*i/count)*Math.PI/180;points.push({x:corner.cx+Math.cos(angle)*item.radius,y:corner.cy+Math.sin(angle)*item.radius});}});
  points.push(points[0]);return points;
}

function M002_buildDXF(cfg) {
  var l=M002_getLayout(cfg.W,cfg.D,cfg.H),out=['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES'];
  function line(a,b,layer){out.push('0','LINE','8',layer,'10',M002_num(a.x),'20',M002_num(-a.y),'30','0','11',M002_num(b.x),'21',M002_num(-b.y),'31','0');}
  function poly(points,layer){for(var i=1;i<points.length;i++)line(points[i-1],points[i],layer);}
  l.cut.forEach(function(item){poly(item.points,'CUT');});l.bleed.forEach(function(item){poly(item.points,'BLEED');});l.fold.forEach(function(item){line(item.a,item.b,'FOLD');});
  l.slots.forEach(function(item){poly(M002_roundRectPoints(item,5),'SLOT');});l.holes.forEach(function(item){poly(M002_roundRectPoints({x:item.cx-item.width/2,y:item.cy-item.height/2,width:item.width,height:item.height,radius:item.radius},8),'HOLE');});
  out.push('0','ENDSEC','0','EOF');return out.join('\n');
}

function M002_buildPDF(cfg) {
  var l=M002_getLayout(cfg.W,cfg.D,cfg.H),b=l.bounds,pad=5,pt=72/25.4,pageW=(b.width+pad*2)*pt,pageH=(b.height+pad*2)*pt;
  function n(v){return Number(v).toFixed(3);}function map(p){return{x:(p.x-b.minX+pad)*pt,y:pageH-(p.y-b.minY+pad)*pt};}
  function poly(points,close){if(!points||points.length<2)return'';var first=map(points[0]),s=n(first.x)+' '+n(first.y)+' m';for(var i=1;i<points.length;i++){var p=map(points[i]);s+=' '+n(p.x)+' '+n(p.y)+' l';}return s+(close?' h S':' S');}
  var content=['0.6 w','1 J 1 j','0 0.333 1 RG'];l.bleed.forEach(function(x){content.push(poly(x.points,true));});content.push('0.902 0.227 0.153 RG');l.cut.forEach(function(x){content.push(poly(x.points,false));});content.push('0.114 0.435 0.91 RG','[2.5 2] 0 d');l.fold.forEach(function(x){content.push(poly([x.a,x.b],false));});content.push('0.902 0.227 0.153 RG','[] 0 d');l.slots.forEach(function(x){content.push(poly(M002_roundRectPoints(x,5),true));});content.push('0.08 0.443 0.224 RG');l.holes.forEach(function(x){content.push(poly(M002_roundRectPoints({x:x.cx-x.width/2,y:x.cy-x.height/2,width:x.width,height:x.height,radius:x.radius},8),true));});
  var stream=content.filter(Boolean).join('\n'),objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+n(pageW)+' '+n(pageH)+'] /Contents 4 0 R >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream'];
  var pdf='%PDF-1.4\n',offsets=[0];objects.forEach(function(object,index){offsets.push(pdf.length);pdf+=(index+1)+' 0 obj\n'+object+'\nendobj\n';});var xref=pdf.length;pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';for(var i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';return pdf;
}
