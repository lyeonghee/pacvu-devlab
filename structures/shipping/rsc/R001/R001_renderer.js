// ============================================================
// R001_renderer.js — A-Type Regular Slotted Container (RSC)
// Depends on: R001_spec.js, R001_layout.js
// 스타일 기준: M001 완전 동일 (변경 금지)
// ============================================================

function R001_buildOverallDimensionLayer(layout, style) {
  var visual = style || T001_masterVisualStyle(layout);
  var bounds = layout.bleedBounds || layout.dielineBounds || layout.bounds;
  var s = visual.uiScale || 1;
  var arrowY = bounds.minY - 12 * s;
  var arrowX = bounds.maxX + 12 * s;
  var guideHalf = 5 * s;
  var N = function(v) { return (+v).toFixed(4); };
  var widthLabel = T001_formatLength(bounds.width);
  var heightLabel = T001_formatLength(bounds.height);
  var markerStart = 'url(#arrow)';
  var markerEnd = 'url(#arrow)';

  return '  <g id="layer-overall-dimensions">' +
    '<line class="overall-dim" x1="' + N(bounds.minX) + '" y1="' + N(arrowY) + '" x2="' + N(bounds.maxX) + '" y2="' + N(arrowY) + '" stroke="#111" marker-start="' + markerStart + '" marker-end="' + markerEnd + '"/>' +
    '<line class="overall-ext" x1="' + N(bounds.minX) + '" y1="' + N(arrowY-guideHalf) + '" x2="' + N(bounds.minX) + '" y2="' + N(arrowY+guideHalf) + '" stroke="#111"/>' +
    '<line class="overall-ext" x1="' + N(bounds.maxX) + '" y1="' + N(arrowY-guideHalf) + '" x2="' + N(bounds.maxX) + '" y2="' + N(arrowY+guideHalf) + '" stroke="#111"/>' +
    '<text class="dim overall-text" data-overall-axis="horizontal" x="' + N((bounds.minX+bounds.maxX)/2) + '" y="' + N(arrowY-1.5*s) + '" font-weight="600" text-anchor="middle">' + widthLabel + '</text>' +
    '<line class="overall-dim" x1="' + N(arrowX) + '" y1="' + N(bounds.minY) + '" x2="' + N(arrowX) + '" y2="' + N(bounds.maxY) + '" stroke="#111" marker-start="' + markerStart + '" marker-end="' + markerEnd + '"/>' +
    '<line class="overall-ext" x1="' + N(arrowX-guideHalf) + '" y1="' + N(bounds.minY) + '" x2="' + N(arrowX+guideHalf) + '" y2="' + N(bounds.minY) + '" stroke="#111"/>' +
    '<line class="overall-ext" x1="' + N(arrowX-guideHalf) + '" y1="' + N(bounds.maxY) + '" x2="' + N(arrowX+guideHalf) + '" y2="' + N(bounds.maxY) + '" stroke="#111"/>' +
    '<text class="dim overall-text" data-overall-axis="vertical" x="' + N(arrowX+visual.dimensionVerticalTextOffset) + '" y="' + N((bounds.minY+bounds.maxY)/2) + '" font-weight="600" transform="rotate(-90 ' + N(arrowX+visual.dimensionVerticalTextOffset) + ' ' + N((bounds.minY+bounds.maxY)/2) + ')" text-anchor="middle">' + heightLabel + '</text>' +
    '</g>\n';
}

function R001_renderSVG(cfg, appState) {
  var { W, D, H } = cfg;
  var layout = R001_getLayout(W, D, H);
  var { outerPath, bleedPathD, gluePathD, foldLines, labels, bounds } = layout;

  var pad = 80;
  var vbX = bounds.minX - pad, vbY = bounds.minY - pad;
  var vbW = bounds.width  + pad * 2, vbH = bounds.height + pad * 2;
  var N = function(v) { return (+v).toFixed(4); };

  var svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"' +
    ' data-pacvu-template="R001"' +
    ' viewBox="' + N(vbX) + ' ' + N(vbY) + ' ' + N(vbW) + ' ' + N(vbH) + '"' +
    ' width="100%" height="100%"' +
    ' preserveAspectRatio="xMidYMid meet">\n';

  svg += '  <defs>\n';
  svg += '    <marker id="r001-pacvu-internal-arrow-start" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="4" viewBox="0 0 6 4" refX="6" refY="2" orient="auto-start-reverse" overflow="visible">\n';
  svg += '      <path d="M0,0 L6,2 L0,4 Z" fill="#111"/>\n';
  svg += '    </marker>\n';
  svg += '    <marker id="r001-pacvu-internal-arrow-end" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="4" viewBox="0 0 6 4" refX="6" refY="2" orient="auto" overflow="visible">\n';
  svg += '      <path d="M0,0 L6,2 L0,4 Z" fill="#111"/>\n';
  svg += '    </marker>\n';
  svg += '    <marker id="r001-pacvu-overall-arrow-start" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="4" viewBox="0 0 6 4" refX="0" refY="2" orient="auto" overflow="visible">\n';
  svg += '      <path d="M6,0 L0,2 L6,4 Z" fill="#111"/>\n';
  svg += '    </marker>\n';
  svg += '    <marker id="r001-pacvu-overall-arrow-end" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="4" viewBox="0 0 6 4" refX="6" refY="2" orient="auto" overflow="visible">\n';
  svg += '      <path d="M0,0 L6,2 L0,4 Z" fill="#111"/>\n';
  svg += '    </marker>\n';
  svg += T001_arrowMarkerDef(T001_internalDimensionStyle().arrowMarkerSize);
  svg += '    <pattern id="wm" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)">\n';
  svg += '      <text x="24" y="60" font-size="22" font-family="Arial,sans-serif" font-weight="700"' +
         ' fill="#999" opacity="0.12">PacVu</text>\n';
  svg += '    </pattern>\n';
  svg += '    <style>\n';
  svg += '      .thomson { fill:#ffffff; stroke:#cc0000; stroke-width:0.45; stroke-linejoin:round; stroke-linecap:round; }\n';
  svg += '      .panel   { fill:#ffffff; stroke:none; }\n';
  svg += '      .fold    { fill:none; stroke:#1d6fe8; stroke-width:0.35; stroke-dasharray:2 1.6; }\n';
  svg += '      .glue    { fill:#d9d9d9; stroke:none; opacity:0.95; }\n';
  svg += '      .bleed   { fill:none; stroke:#0055ff; stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round; }\n';
  svg += '      text     { font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif; pointer-events:none; }\n';
  svg += window.PacVuShipping.styleBlock();
  svg += '    </style>\n';
  svg += '  </defs>\n';

  svg += '  <rect x="' + N(vbX) + '" y="' + N(vbY) + '" width="' + N(vbW) + '" height="' + N(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '  <g id="viewportGroup">\n';

  // ① 외곽 Thomson path
  svg += '    <g id="layer-panel-fill"><path class="panel" d="' + outerPath + '"/></g>\n';
  if (!appState || appState.showCut) svg += '    <g id="layer-cut"><path class="thomson" d="' + outerPath + '"/></g>\n';

  // ② 풀칠면
  svg += '    <g id="layer-glue"><path class="glue" d="' + gluePathD + '"/></g>\n';

  // ③ bleed (칼선 위에 표시)
  if (bleedPathD && (!appState || appState.showBleed)) {
    svg += '    <g id="layer-bleed"><path class="bleed" d="' + bleedPathD + '"/></g>\n';
  }

  // ④ 접힘선
  if (appState.showFolds) {
    svg += '    <g id="layer-fold">\n';
    foldLines.forEach(function(f) {
      svg += '      <line class="fold"' +
        ' x1="' + N(f.x1) + '" y1="' + N(f.y1) + '"' +
        ' x2="' + N(f.x2) + '" y2="' + N(f.y2) + '"/>\n';
    });
    svg += '    </g>\n';
  }

  // ⑤ 라벨
  if (appState.showLabels) {
    svg += '    <g id="layer-labels">\n';
    labels.forEach(function(l) {
      var panel = Object.keys(layout.panelBoxes).map(function(key) { return layout.panelBoxes[key]; })
        .find(function(item) { return item.name === l.name; });
      svg += '      <text class="label" data-panel-width="' + N(panel ? panel.width : 0) +
        '" data-panel-height="' + N(panel ? panel.height : 0) +
        '" x="' + N(l.cx) + '" y="' + N(l.cy) + '"' +
        ' fill="#333" text-anchor="middle" dominant-baseline="middle">' +
        l.name + '</text>\n';
    });
    svg += '    </g>\n';
  }

  svg += '    <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';

  // ⑥ 사이즈 dimension lines (M001 방식)
  if (appState.showDims) {
    var { xGlueL, xFrontL, xFrontR, xSideLR, xBackR, xSideRR,
          yTop, yFoldTop, yFoldBot, yBot } = layout.spec;
    var yCB = (yFoldTop + yFoldBot) / 2;  // 본체 수직 중앙
    var dimY = yCB + H * 0.3;             // 하단 1/3 지점 (내부)
    function hDimR(x1, x2, y, label) {
      var mid = (x1+x2)/2;
      return '    <line x1="'+N(x1)+'" y1="'+N(y)+'" x2="'+N(x2)+'" y2="'+N(y)+'" stroke="#111" stroke-width="0.35" marker-start="url(#r001-pacvu-internal-arrow-start)" marker-end="url(#r001-pacvu-internal-arrow-end)"/>\n' +
             '    <text data-screen-dimension="1" data-offset-axis="y" data-anchor-x="'+N(mid)+'" data-anchor-y="'+N(y)+'" data-line-y="'+N(y)+'" x="'+N(mid)+'" y="'+N(y+3)+'" font-weight="600" fill="#111" text-anchor="middle">'+label+'</text>\n';
    }
    function vDimR(x, y1, y2, label) {
      var mid = (y1+y2)/2;
      return '    <line x1="'+N(x)+'" y1="'+N(y1)+'" x2="'+N(x)+'" y2="'+N(y2)+'" stroke="#111" stroke-width="0.35" marker-start="url(#r001-pacvu-internal-arrow-start)" marker-end="url(#r001-pacvu-internal-arrow-end)"/>\n' +
             '    <text data-screen-dimension="1" data-offset-axis="x" data-anchor-x="'+N(x)+'" data-anchor-y="'+N(mid)+'" data-line-x="'+N(x)+'" x="'+N(x+3)+'" y="'+N(mid)+'" font-weight="600" fill="#111" transform="rotate(-90 '+N(x+3)+' '+N(mid)+')" text-anchor="middle">'+label+'</text>\n';
    }
    svg += '    <g id="layer-dimensions">\n';
    svg += hDimR(xFrontL, xFrontR, dimY, window.PacVuUnits.formatDimension('W', W));
    svg += hDimR(xFrontR, xSideLR, dimY, window.PacVuUnits.formatDimension('D', D));
    svg += hDimR(xSideLR, xBackR,  dimY, window.PacVuUnits.formatDimension('W', W));
    svg += hDimR(xBackR,  xSideRR, dimY, 'D-2 '+(D-2)+'mm');
    var yFoldTop_arc = layout.spec.yFoldTop_arc || (yFoldTop + 2.5);
    var yFoldBot_arc = layout.spec.yFoldBot_arc || (yFoldBot - 2.5);
    svg += vDimR(xFrontR + (xSideLR-xFrontR)*0.35, yFoldTop_arc, yFoldBot_arc, window.PacVuUnits.formatDimension('H', H));
    svg += '    </g>\n';
    svg += T001_buildOverallDimensionLayer(layout, T001_masterVisualStyle(layout));
  }

  svg += '  </g>\n</svg>';
  return svg;
}

// ── Export SVG (Illustrator용, 워터마크 없음) ─────────────────
function R001_buildExportSVG(cfg) {
  var { W, D, H } = cfg;
  var layout = R001_getLayout(W, D, H);
  var { outerPath, bleedPathD, gluePathD, foldLines, bounds } = layout;
  var pad = 5;
  var vbX = bounds.minX-pad, vbY = bounds.minY-pad;
  var vbW = bounds.width+pad*2, vbH = bounds.height+pad*2;
  var N = function(v) { return (+v).toFixed(4); };

  var out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg"' +
    ' viewBox="' + N(vbX) + ' ' + N(vbY) + ' ' + N(vbW) + ' ' + N(vbH) + '"' +
    ' width="' + N(vbW) + 'mm" height="' + N(vbH) + 'mm">\n';
  out += '  <g id="layer-panel-fill">\n';
  out += '    <path style="fill:#ffffff;stroke:none;" d="' + outerPath + '"/>\n';
  out += '  </g>\n';
  out += '  <g id="layer-glue">\n';
  out += '    <path style="fill:#d9d9d9;stroke:none;" d="' + gluePathD + '"/>\n';
  out += '  </g>\n';
  if (bleedPathD) {
    out += '  <g id="layer-bleed">\n';
    out += '    <path style="fill:none;stroke:#0055ff;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;" d="' + bleedPathD + '"/>\n';
    out += '  </g>\n';
  }
  out += '  <g id="layer-cut">\n';
  out += '    <path style="fill:none;stroke:#cc0000;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;" d="' + outerPath + '"/>\n';
  out += '  </g>\n';
  out += '  <g id="layer-fold">\n';
  foldLines.forEach(function(f) {
    out += '    <line style="fill:none;stroke:#1d6fe8;stroke-width:0.3;stroke-dasharray:2 1.6;"' +
      ' x1="' + N(f.x1) + '" y1="' + N(f.y1) + '"' +
      ' x2="' + N(f.x2) + '" y2="' + N(f.y2) + '"/>\n';
  });
  out += '  </g>\n';
  out += '</svg>';
  return out;
}

function R001_buildDXF(cfg) {
  return window.PacVuShipping.buildDXF(R001_getLayout(cfg.W,cfg.D,cfg.H));
}
