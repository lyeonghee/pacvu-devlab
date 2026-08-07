// B002_renderer.js - PacVu 2D renderer and SVG export.

function B002_restyle(element, className) {
  const cleaned = element.replace(/\sfill="[^"]*"/g, '').replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '').replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '').replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '');
  return cleaned.replace(/\/>$/, ' class="' + className + '"/>');
}

function B002_resolveFixedConfig(cfg) {
  return Object.assign({}, cfg || {}, {
    W: B002_DEVELOPMENT_DATA.dimensions.W,
    D: B002_DEVELOPMENT_DATA.dimensions.D,
    H: B002_DEVELOPMENT_DATA.dimensions.H,
    sizeMode: B002_DEVELOPMENT_DATA.sizeMode,
    allowResize: B002_DEVELOPMENT_DATA.allowResize
  });
}

function B002_defs() {
  return '<style>' + [
    '.panel-fill{fill:#fff;fill-rule:evenodd;stroke:none}',
    '.cut{fill:none;stroke:#e11;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}',
    '.required-punch{fill:none;stroke:#e11;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}',
    '.bleed{fill:none;stroke:#3478ff;stroke-width:.6;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}',
    '.fold{fill:none;stroke:#3478ff;stroke-width:.45;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke}',
    '.punch{fill:#fff;stroke:#337f0a;stroke-width:.55;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}',
    '.label,.dim{fill:#222;font-family:Arial,"Noto Sans KR",sans-serif;pointer-events:none}'
  ].join('') + '</style>' +
  '<pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)"><text x="24" y="60" font-size="22" font-family="Arial" font-weight="700" fill="#999" opacity=".12">PacVu</text></pattern>';
}

function B002_matrix(transform) {
  return 'matrix(' + [transform.a, 0, 0, transform.d, 0, 0].map(B002_num).join(' ') + ')';
}

function B002_labels(layout) {
  const labels = [
    // Exact panel-name positions from reference/B002_pannel.svg, translated
    // to the B002.svg source coordinate system (+8.562, +105.675).
    ['front', 821.549, 689.62, 0],
    ['back', 304.102, 689.621, 21.881],
    ['Glue', 123.351, 627.016, 24.28],
    ['lidTop', 820.756, 460.952, 0],
    ['lidInsert', 377.217, 468.485, 18.142],
    ['bottomLock-A', 203.77, 931.103, 18.142],
    ['bottomLock-B', 789.297, 1028.666, 0],
    ['bottomLock(L)', 486.506, 991.357, 8.6],
    ['bottomLock(R)', 1098.984, 1008.6, -10.021],
    ['lidSideFlap(L)', 573.708, 533.776, 8.6],
    ['SidePanel(L)', 534.11, 800.918, 8.6],
    ['SidePanel(R)', 1065.253, 799.143, -10.021],
    ['lidSideFlap(R)', 1021.892, 542.046, -7.43],
    ['Lock', 825.165, 368.717, 0],
    ['LockSlot', 359.579, 526.059, 18.142],
    ['Handle', 424.097, 346.037, 18.142]
  ];
  let out = '<g id="layer-labels">';
  labels.forEach(([name, x, y, rotation]) => {
    const point = B002_transformPoint({ x, y }, layout.transform);
    const transform = 'translate(' + B002_num(point.x) + ' ' + B002_num(point.y) + ')' +
      (rotation ? ' rotate(' + B002_num(rotation) + ')' : '');
    out += '<text class="label" transform="' + transform + '" font-size="4.2" font-weight="700">' + name + '</text>';
  });
  return out + '</g>';
}

function B002_dimensions(layout, cfg) {
  const displayCfg = layout.referenceOnly ? layout.spec.base : cfg;
  // Exact dimension-arrow geometry from reference/B002_pannel.svg, translated
  // to the B002.svg source coordinate system (+8.562, +105.675).
  const point = (x, y) => B002_transformPoint({ x, y }, layout.transform);
  const line = (x1, y1, x2, y2) => {
    const a = point(x1, y1), b = point(x2, y2);
    return '<line x1="' + B002_num(a.x) + '" y1="' + B002_num(a.y) +
      '" x2="' + B002_num(b.x) + '" y2="' + B002_num(b.y) +
      '" stroke="#231916" stroke-width=".35"/>';
  };
  const polygon = sourcePoints => {
    const points = sourcePoints.map(([x, y]) => {
      const p = point(x, y);
      return B002_num(p.x) + ',' + B002_num(p.y);
    }).join(' ');
    return '<polygon points="' + points + '" fill="#231916"/>';
  };
  const text = (label, x, y, rotation) => {
    const p = point(x, y);
    const transform = 'translate(' + B002_num(p.x) + ' ' + B002_num(p.y) + ')' +
      (rotation ? ' rotate(' + B002_num(rotation) + ')' : '');
    return '<text class="dim" transform="' + transform + '" font-size="4.2" font-weight="500">' + label + '</text>';
  };
  let out = '<g id="layer-dimensions">';
  out += line(656.656, 947.639, 1021.263, 947.639);
  out += polygon([[649.725, 947.639], [659.493, 951.705], [657.175, 947.639], [659.493, 943.575]]);
  out += polygon([[1028.194, 947.639], [1018.427, 951.705], [1020.745, 947.639], [1018.427, 943.575]]);
  out += text(window.PacVuUnits.formatDimension('W', displayCfg.W), 814.453, 940.815, 0);

  out += line(944.304, 592.648, 944.304, 966.874);
  out += polygon([[944.304, 585.588], [940.239, 595.537], [944.304, 593.176], [948.369, 595.537]]);
  out += polygon([[944.304, 973.934], [940.239, 963.985], [944.304, 966.346], [948.369, 963.985]]);
  out += text(window.PacVuUnits.formatDimension('H', displayCfg.H), 948.37, 818.164, 0);

  out += line(498.169, 726.306, 674.143, 754.249);
  out += polygon([[491.195, 725.199], [500.384, 730.774], [498.69, 726.389], [501.659, 722.745]]);
  out += polygon([[681.117, 755.356], [670.653, 757.811], [673.622, 754.166], [671.928, 749.782]]);
  out += text(window.PacVuUnits.formatDimension('D', displayCfg.D), 590.652, 730.775, 8.6);
  return out + '</g>';
}

function B002_getDisplayMetrics(cfg) {
  const layout = B002_getLayout(cfg.W, cfg.D, cfg.H, cfg);
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

function B002_layers(layout, cfg, appState, exportOnly) {
  const matrix = B002_matrix(layout.transform);
  let out = '<g id="viewportGroup"><path class="panel-fill" d="' + layout.fillPath + '"/>';
  if (exportOnly || !appState || appState.showBleed) out += '<path id="layer-bleed" class="bleed" d="' + layout.bleedPath + '"/>';
  if (exportOnly || !appState || appState.showCut) out += '<g id="layer-cut" transform="' + matrix + '">' + layout.cutElements.map(element => B002_restyle(element, 'cut')).join('') + layout.requiredPunchElements.map(element => B002_restyle(element, 'required-punch')).join('') + '</g>';
  if (exportOnly || !appState || appState.showPerforation) out += '<g id="layer-perforation" transform="' + matrix + '">' + layout.punchElements.map(element => B002_restyle(element, 'punch')).join('') + '</g>';
  if (exportOnly || !appState || appState.showFolds) out += '<g id="layer-fold" transform="' + matrix + '">' + layout.foldElements.map(element => B002_restyle(element, 'fold')).join('') + '</g>';
  if (!exportOnly && (!appState || appState.showLabels)) out += B002_labels(layout);
  if (!exportOnly && (!appState || appState.showDims)) out += B002_dimensions(layout, cfg);
  if (!exportOnly && typeof window.PacVuBakery2DVisualCommon?.overallLayer === 'function') {
    out += window.PacVuBakery2DVisualCommon.overallLayer(layout, 'B002');
  }
  if (!exportOnly) out += '<rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>';
  return out + '</g>';
}

function B002_renderSVG(cfg, appState) {
  cfg = B002_resolveFixedConfig(cfg);
  const layout = B002_getLayout(cfg.W, cfg.D, cfg.H, cfg), pad = 26;
  const x = layout.bounds.minX - pad, y = layout.bounds.minY - pad, w = layout.bounds.width + pad * 2, h = layout.bounds.height + pad * 2;
  return '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' + [x, y, w, h].map(B002_num).join(' ') + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><defs>' + B002_defs() + '</defs><rect x="' + B002_num(x) + '" y="' + B002_num(y) + '" width="' + B002_num(w) + '" height="' + B002_num(h) + '" fill="#d0d0d0"/>' + B002_layers(layout, cfg, appState, false) + '</svg>';
}

function B002_buildExportSVG(cfg) {
  cfg = B002_resolveFixedConfig(cfg);
  const layout = B002_getLayout(cfg.W, cfg.D, cfg.H, cfg), pad = 5;
  const x = layout.bounds.minX - pad, y = layout.bounds.minY - pad, w = layout.bounds.width + pad * 2, h = layout.bounds.height + pad * 2;
  return '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [x, y, w, h].map(B002_num).join(' ') + '" width="' + B002_num(w) + 'mm" height="' + B002_num(h) + 'mm"><defs>' + B002_defs() + '</defs>' + B002_layers(layout, cfg, null, true) + '</svg>';
}

function B002_buildDXF(cfg) {
  cfg = B002_resolveFixedConfig(cfg);
  const layout = B002_getLayout(cfg.W, cfg.D, cfg.H, cfg);
  const rows = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'];
  const addLine = (a, b, layer) => rows.push(
    '0', 'LINE', '8', layer,
    '10', B002_num(a.x), '20', B002_num(-a.y), '30', '0',
    '11', B002_num(b.x), '21', B002_num(-b.y), '31', '0'
  );
  const addPath = (points, layer, closed) => {
    for (let index = 1; index < points.length; index += 1) addLine(points[index - 1], points[index], layer);
    if (closed && points.length > 2 && B002_distance(points[0], points[points.length - 1]) > .001) {
      addLine(points[points.length - 1], points[0], layer);
    }
  };
  addPath(layout.bleedPoints, 'BLEED', true);
  addPath(layout.outlinePoints, 'CUT', true);
  layout.requiredHolePoints.forEach(points => addPath(points, 'CUT', true));
  layout.optionalHolePoints.forEach(points => addPath(points, 'PERFORATION', true));
  layout.foldElements.forEach(element => {
    const points = B002_sampleElement(element).map(point => B002_transformPoint(point, layout.transform));
    addPath(points, 'FOLD', false);
  });
  rows.push('0', 'ENDSEC', '0', 'EOF');
  return rows.join('\n');
}
