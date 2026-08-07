// ============================================================
// R003_renderer.js - A-Type RSC Shipping Box 3
// Depends on: R003_spec.js, R003_layout.js
// ============================================================

function R003_renderSVG(cfg, appState) {
  var layout = R003_getLayout(cfg.W, cfg.D, cfg.H);
  var pad = 80;
  var vbX = layout.bounds.minX - pad;
  var vbY = layout.bounds.minY - pad;
  var vbW = layout.bounds.width + pad * 2;
  var vbH = layout.bounds.height + pad * 2;
  var N = function(v) { return (+v).toFixed(4); };

  var svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"' +
    ' viewBox="' + N(vbX) + ' ' + N(vbY) + ' ' + N(vbW) + ' ' + N(vbH) + '"' +
    ' width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';

  svg += '  <defs>\n';
  svg += R003_dimensionArrowMarkerDef();
  svg += '    <pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">\n';
  svg += '      <text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>\n';
  svg += '    </pattern>\n';
  svg += '    <style>\n';
  svg += '      .thomson { fill:none; stroke:#cc0000; stroke-width:1.05; stroke-opacity:1; stroke-linejoin:round; stroke-linecap:round; vector-effect:non-scaling-stroke; }\n';
  svg += '      .panel   { fill:#ffffff; stroke:none; }\n';
  svg += '      .glue    { fill:#d9d9d9; stroke:none; opacity:0.95; }\n';
  svg += '      .fold    { fill:none; stroke:#1d6fe8; stroke-width:0.65; stroke-opacity:1; stroke-dasharray:2 1.6; vector-effect:non-scaling-stroke; }\n';
  svg += '      .bleed   { fill:none; stroke:#0055ff; stroke-width:1.05; stroke-opacity:1; stroke-linejoin:round; stroke-linecap:round; vector-effect:non-scaling-stroke; }\n';
  svg += '      text     { font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif; pointer-events:none; }\n';
  svg += window.PacVuShipping.styleBlock();
  svg += '    </style>\n';
  svg += '  </defs>\n';

  svg += '  <rect x="' + N(vbX) + '" y="' + N(vbY) + '" width="' + N(vbW) + '" height="' + N(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '  <g id="viewportGroup">\n';
  svg += '    <g id="layer-panel-fill">\n';
  layout.panelFillPathsMm.forEach(function(d) {
    svg += '      <path class="panel" d="' + d + '"/>\n';
  });
  svg += '    </g>\n';
  svg += '    <g id="layer-glue"><path class="glue" d="' + layout.glueFillPathDMm + '"/></g>\n';
  svg += '    <g id="layer-bleed"><path class="bleed" d="' + layout.bleedPathDMm + '"/></g>\n';
  svg += '    <g id="layer-cut">\n';
  layout.cutPathsMm.forEach(function(d) {
    svg += '      <path class="thomson" d="' + d + '"/>\n';
  });
  svg += '    </g>\n';

  if (appState.showFolds) {
    svg += '    <g id="layer-fold">\n';
    layout.foldLines.forEach(function(f) {
      svg += '      <line class="fold" x1="' + N(f.x1) + '" y1="' + N(f.y1) + '" x2="' + N(f.x2) + '" y2="' + N(f.y2) + '"/>\n';
    });
    svg += '    </g>\n';
  }

  if (appState.showLabels) {
    svg += '    <g id="layer-labels">\n';
    layout.labels.forEach(function(l) {
      var panel = Object.keys(layout.panelBoxes).map(function(key) { return layout.panelBoxes[key]; })
        .find(function(item) { return item.name === l.name; });
      svg += '      <text class="label" data-panel-width="' + N(panel ? panel.width : 0) +
        '" data-panel-height="' + N(panel ? panel.height : 0) + '" x="' + N(l.cx) +
        '" y="' + N(l.cy) + '" fill="#333" text-anchor="middle" dominant-baseline="middle">' + l.name + '</text>\n';
    });
    svg += '    </g>\n';
  }

  svg += '    <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';

  if (appState.showDims) {
    var b = layout.panelBoxes;
    var dimOffset = 12;
    function hDimR(x1, x2, y, label) {
      var mid = (x1+x2)/2;
      return '    <line x1="'+N(x1)+'" y1="'+N(y)+'" x2="'+N(x2)+'" y2="'+N(y)+'" stroke="#111" marker-start="url(#arrow)" marker-end="url(#arrow)"/>\n' +
             '    <text data-screen-dimension="1" data-offset-axis="y" data-anchor-x="'+N(mid)+'" data-anchor-y="'+N(y)+'" data-line-y="'+N(y)+'" x="'+N(mid)+'" y="'+N(y+3)+'" font-weight="600" fill="#111" text-anchor="middle">'+label+'</text>\n';
    }
    function vDimR(x, y1, y2, label) {
      var mid = (y1+y2)/2;
      return '    <line x1="'+N(x)+'" y1="'+N(y1)+'" x2="'+N(x)+'" y2="'+N(y2)+'" stroke="#111" marker-start="url(#arrow)" marker-end="url(#arrow)"/>\n' +
             '    <text data-screen-dimension="1" data-offset-axis="x" data-anchor-x="'+N(x)+'" data-anchor-y="'+N(mid)+'" data-line-x="'+N(x)+'" x="'+N(x+3)+'" y="'+N(mid)+'" font-weight="600" fill="#111" transform="rotate(-90 '+N(x+3)+' '+N(mid)+')" text-anchor="middle">'+label+'</text>\n';
    }
    svg += '    <g id="layer-dimensions">\n';
    svg += hDimR(b.front.x1, b.front.x2, b.front.y2 - dimOffset, window.PacVuUnits.formatDimension('W', cfg.W));
    svg += hDimR(b.sideL.x1, b.sideL.x2, b.sideL.y2 - dimOffset, window.PacVuUnits.formatDimension('D', cfg.D));
    svg += hDimR(b.back.x1, b.back.x2, b.back.y2 - dimOffset, window.PacVuUnits.formatDimension('W', cfg.W));
    svg += hDimR(b.sideR.x1, b.sideR.x2, b.sideR.y2 - dimOffset, window.PacVuUnits.formatDimension('D', cfg.D));
    svg += vDimR(b.sideL.x1 + Math.min(36, b.sideL.width * 0.25), b.sideL.y1, b.sideL.y2, window.PacVuUnits.formatDimension('H', cfg.H));
    svg += '    </g>\n';
    svg += T001_buildOverallDimensionLayer(layout, T001_masterVisualStyle(layout));
  }

  svg += '  </g>\n</svg>';
  return svg;
}

function R003_buildExportSVG(cfg) {
  var layout = R003_getLayout(cfg.W, cfg.D, cfg.H);
  var pad = 5;
  var vbX = layout.bounds.minX - pad;
  var vbY = layout.bounds.minY - pad;
  var vbW = layout.bounds.width + pad * 2;
  var vbH = layout.bounds.height + pad * 2;
  var N = function(v) { return (+v).toFixed(4); };

  var out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + N(vbX) + ' ' + N(vbY) + ' ' + N(vbW) + ' ' + N(vbH) + '" width="' + N(vbW) + 'mm" height="' + N(vbH) + 'mm">\n';
  out += '  <g id="layer-panel-fill">\n';
  layout.panelFillPathsMm.forEach(function(d) {
    out += '    <path style="fill:#ffffff;stroke:none;" d="' + d + '"/>\n';
  });
  out += '  </g>\n';
  out += '  <g id="layer-glue"><path style="fill:#d9d9d9;stroke:none;opacity:0.95;" d="' + layout.glueFillPathDMm + '"/></g>\n';
  out += '  <g id="layer-bleed"><path style="fill:none;stroke:#0055ff;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;" d="' + layout.bleedPathDMm + '"/></g>\n';
  out += '  <g id="layer-cut">\n';
  layout.cutPathsMm.forEach(function(d) {
    out += '    <path style="fill:none;stroke:#cc0000;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;" d="' + d + '"/>\n';
  });
  out += '  </g>\n';
  out += '  <g id="layer-fold">\n';
  layout.foldLines.forEach(function(f) {
    out += '    <line style="fill:none;stroke:#1d6fe8;stroke-width:0.3;stroke-dasharray:2 1.6;" x1="' + N(f.x1) + '" y1="' + N(f.y1) + '" x2="' + N(f.x2) + '" y2="' + N(f.y2) + '"/>\n';
  });
  out += '  </g>\n</svg>';
  return out;
}

function R003_buildDXF(cfg) {
  return window.PacVuShipping.buildDXF(R003_getLayout(cfg.W,cfg.D,cfg.H));
}

function R003_dimensionArrowMarkerDef() {
  return '    <marker id="arrow" markerWidth="4" markerHeight="4" refX="10" refY="5" viewBox="0 0 10 10" markerUnits="userSpaceOnUse" orient="auto-start-reverse">\n' +
         '      <path d="M0,0 L10,5 L0,10 Z" fill="#111"/>\n' +
         '    </marker>\n';
}
