// ============================================================
// T001_renderer.js - T001 SVG rendering, labels, dimensions, and exports
// Depends on T001_spec.js and T001_layout.js.
// ============================================================

function T001_styleBlock() {
  return '<style>' +
    '.cut-area{fill:#ffffff;stroke:none;}' +
    '.glue-area{fill:#d4d4d4;opacity:0.72;stroke:none;}' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.75;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.75;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.5;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.label{fill:#333;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function T001_exportStyleBlock() {
  return '<style>' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.3;stroke-dasharray:2.5 2;}' +
    '</style>';
}

function T001_arrowMarkerDef(size, markerId, markerUnits) {
  const s = T001_num(size || 10);
  const mid = T001_num(s / 2);
  const id = markerId || 'arrow';
  const units = markerUnits ? ' markerUnits="' + markerUnits + '"' : '';
  return '<marker id="' + id + '" markerWidth="' + s + '" markerHeight="' + s + '" refX="' + s + '" refY="' + mid + '" orient="auto-start-reverse"' + units + '>' +
    '<path d="M0,0 L' + s + ',' + mid + ' L0,' + s + ' Z" fill="#111"/></marker>';
}

function T001_watermarkDef(style) {
  const wm = style || {};
  const fontSize = T001_num(wm.watermarkFontSize || 22);
  const opacity = T001_num(wm.watermarkOpacity || 0.12);
  const patternWidth = T001_num(wm.watermarkPatternWidth || 140);
  const patternHeight = T001_num(wm.watermarkPatternHeight || 100);
  const textX = T001_num(wm.watermarkTextX || 24);
  const textY = T001_num(wm.watermarkTextY || 60);
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="' + patternWidth + '" height="' + patternHeight + '" patternTransform="rotate(-25)">' +
    '<text x="' + textX + '" y="' + textY + '" font-size="' + fontSize + '" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="' + opacity + '">PacVu</text>' +
    '</pattern>';
}

function T001_clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function T001_visualStyle(layout) {
  const refW = 256.6;
  const refH = 304.1;
  const b = layout && (layout.renderBounds || layout.bounds) ? (layout.renderBounds || layout.bounds) : { width: refW, height: refH };
  const widthScale = refW / Math.max(b.width, 1);
  const heightScale = refH / Math.max(b.height, 1);
  const fitScale = Math.min(widthScale, heightScale);
  const uiScale = T001_clamp(0.82 * Math.pow(fitScale, 0.35), 0.62, 0.82);
  return {
    uiScale,
    labelFontSize: T001_num(4.5 * uiScale),
    dimensionFontSize: T001_num(4.6 * uiScale),
    dimensionLineStroke: T001_num(0.30 * uiScale),
    dimensionTextOffset: T001_num(5 * uiScale),
    dimensionVerticalTextOffset: T001_num(4.2 * uiScale),
    arrowMarkerSize: T001_num(7.5 * uiScale),
    watermarkFontSize: 22,
    watermarkOpacity: 0.12
  };
}

// Preserve the verified T001 on-screen readability when a larger dieline is
// fitted into the same viewer. All display metrics grow by one common factor.
function T001_masterVisualStyle(layout) {
  const refW = 256.6;
  const refH = 304.1;
  const bounds = layout && (layout.bleedBounds || layout.renderBounds || layout.bounds)
    ? (layout.bleedBounds || layout.renderBounds || layout.bounds)
    : { width: refW, height: refH };
  const base = T001_visualStyle({ bounds: { width: refW, height: refH } });
  const displayScale = Math.max(bounds.width / refW, bounds.height / refH, 1);
  return {
    uiScale: T001_num(base.uiScale * displayScale),
    labelFontSize: T001_num(base.labelFontSize * displayScale),
    dimensionFontSize: T001_num(base.dimensionFontSize * displayScale),
    dimensionLineStroke: T001_num(base.dimensionLineStroke * displayScale),
    dimensionTextOffset: T001_num(base.dimensionTextOffset * displayScale),
    dimensionVerticalTextOffset: T001_num(base.dimensionVerticalTextOffset * displayScale),
    arrowMarkerSize: T001_num(base.arrowMarkerSize * displayScale),
    watermarkFontSize: T001_num(base.watermarkFontSize * displayScale),
    watermarkPatternWidth: T001_num(140 * displayScale),
    watermarkPatternHeight: T001_num(100 * displayScale),
    watermarkTextX: T001_num(24 * displayScale),
    watermarkTextY: T001_num(60 * displayScale),
    watermarkOpacity: base.watermarkOpacity
  };
}

// Shared master for in-box W / D / H dimensions. These are the approved T001
// reference metrics and must not be enlarged again from each structure's bounds.
function T001_internalDimensionStyle() {
  const visual = T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  return {
    uiScale: visual.uiScale,
    arrowMarkerSize: visual.arrowMarkerSize,
    dimensionLineStroke: visual.dimensionLineStroke,
    dimensionFontSize: visual.dimensionFontSize,
    dimensionTextOffset: visual.dimensionTextOffset,
    dimensionVerticalTextOffset: visual.dimensionVerticalTextOffset
  };
}

// T001-approved screen-space targets at the standard 90% viewer zoom.
// The DOM adapter converts these pixels back to SVG user units after fitting.
const T001_SCREEN_VISUAL_TARGET = Object.freeze({
  dimensionTextPx: 11.3,
  dimensionLinePx: 0.74,
  dimensionTextOffsetPx: 12.3,
  dimensionVerticalTextOffsetPx: 10.3,
  extensionLineOffsetPx: 0,
  internalArrowWidthPx: 4.55,
  internalArrowHeightPx: 4.55
});

const T001_PANEL_LABEL_SCREEN_STYLE = Object.freeze({
  screenPx: 11,
  minPx: 9,
  maxPx: 12,
  fontFamily: '"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif',
  fontWeight: 500
});

function T001_applyScreenVisualStyle(svg, profile) {
  if (!svg || typeof svg.querySelector !== 'function') return false;
  const viewport = svg.querySelector('#viewportGroup') || svg;
  const ctm = viewport.getScreenCTM && viewport.getScreenCTM();
  if (!ctm) return false;
  const scaleX = Math.hypot(ctm.a, ctm.b);
  const scaleY = Math.hypot(ctm.c, ctm.d);
  if (!(scaleX > 0) || !(scaleY > 0)) return false;
  const familyResolver = profile && /^M\d+$/i.test(profile.templateId||'')
    ? window.PacVuMailer2DVisualCommon
    : window.PacVuTuck2DVisualCommon;
  const resolved = familyResolver
    ? familyResolver.resolveScreenStyle(profile,T001_SCREEN_VISUAL_TARGET,T001_PANEL_LABEL_SCREEN_STYLE,svg)
    : {internal:T001_SCREEN_VISUAL_TARGET,panelLabel:T001_PANEL_LABEL_SCREEN_STYLE};
  const target = resolved.internal;

  svg.querySelectorAll('#layer-labels .label').forEach(function(label) {
    const panelStyle = resolved.panelLabel;
    const panelWidthPx = Number(label.getAttribute('data-panel-width')) * scaleX;
    const panelHeightPx = Number(label.getAttribute('data-panel-height')) * scaleY;
    const estimatedTextPx = Math.max(1, (label.textContent || '').length * panelStyle.screenPx * 0.56);
    let calculatedSize = panelStyle.screenPx;
    if (panelWidthPx > 0 && panelHeightPx > 0) {
      const widthFit = panelStyle.screenPx * (panelWidthPx * 0.84 / estimatedTextPx);
      const heightFit = panelHeightPx * 0.42;
      const areaFit = panelStyle.screenPx * Math.min(1, Math.sqrt((panelWidthPx * panelHeightPx) / 2400));
      calculatedSize = Math.min(panelStyle.screenPx, widthFit, heightFit, areaFit);
    }
    const screenSize = Math.max(panelStyle.minPx, Math.min(panelStyle.maxPx, calculatedSize));
    label.setAttribute('font-size', T001_num(screenSize / scaleY));
    label.setAttribute('font-family', panelStyle.fontFamily);
    label.setAttribute('font-weight', String(panelStyle.fontWeight));
  });
  svg.querySelectorAll('#layer-dimensions line').forEach(function(line) {
    line.setAttribute('stroke-width', T001_num(target.dimensionLinePx / Math.sqrt(scaleX * scaleY)));
  });
  svg.querySelectorAll('#layer-dimensions text[data-screen-dimension]').forEach(function(text) {
    text.setAttribute('font-size', T001_num(target.dimensionTextPx / scaleY));
    if (target.preserveRendererPosition) return;
    const baseX = Number(text.getAttribute('data-anchor-x'));
    const baseY = Number(text.getAttribute('data-anchor-y'));
    const axis = text.getAttribute('data-offset-axis');
    if (axis === 'x') {
      const x = baseX + target.dimensionVerticalTextOffsetPx / scaleX;
      text.setAttribute('x', T001_num(x));
      text.setAttribute('y', T001_num(baseY));
      text.setAttribute('transform', 'rotate(-90 ' + T001_num(x) + ' ' + T001_num(baseY) + ')');
    } else {
      text.setAttribute('x', T001_num(baseX));
      text.setAttribute('y', T001_num(baseY + target.dimensionTextOffsetPx / scaleY));
      text.removeAttribute('transform');
    }
  });

  const marker = svg.querySelector('#internal-dimension-arrow');
  if (marker) {
    const width = target.internalArrowWidthPx / scaleX;
    const height = target.internalArrowHeightPx / scaleY;
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    marker.setAttribute('markerWidth', T001_num(width));
    marker.setAttribute('markerHeight', T001_num(height));
    marker.setAttribute('refX', T001_num(width));
    marker.setAttribute('refY', T001_num(height / 2));
    const path = marker.querySelector('path');
    if (path) path.setAttribute('d', 'M0,0 L' + T001_num(width) + ',' + T001_num(height / 2) + ' L0,' + T001_num(height) + ' Z');
  }
  return true;
}

// Overall dimensions follow the same bounded visual rule used by T002.
// This is intentionally separate from T001's large-dieline master scaling.
function T001_overallVisualStyle(layout) {
  const base = T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  const bounds = layout.bleedBounds || layout.bounds;
  const fit = Math.min(bounds.width / 256.6, bounds.height / 304.1);
  const displayScale = T001_clamp(fit, 1, 2.05);
  return {
    uiScale: T001_num(base.uiScale * displayScale),
    dimensionFontSize: T001_num(base.dimensionFontSize * displayScale),
    dimensionLineStroke: T001_num(base.dimensionLineStroke * displayScale),
    dimensionTextOffset: T001_num(base.dimensionTextOffset * displayScale),
    dimensionVerticalTextOffset: T001_num(base.dimensionVerticalTextOffset * displayScale),
    arrowMarkerSize: T001_num(base.arrowMarkerSize * displayScale)
  };
}

function T001_overallArrowMarkerDefs(size) {
  const s = T001_num(size || 10);
  const mid = T001_num(s / 2);
  return '<marker id="overall-arrow-start" markerWidth="' + s + '" markerHeight="' + s + '" refX="0" refY="' + mid + '" orient="auto">' +
    '<path d="M' + s + ',0 L0,' + mid + ' L' + s + ',' + s + ' Z" fill="#111"/></marker>' +
    '<marker id="overall-arrow-end" markerWidth="' + s + '" markerHeight="' + s + '" refX="' + s + '" refY="' + mid + '" orient="auto">' +
    '<path d="M0,0 L' + s + ',' + mid + ' L0,' + s + ' Z" fill="#111"/></marker>';
}

function T001_formatDimension(axis, valueMm) {
  return window.PacVuUnits
    ? window.PacVuUnits.formatDimension(axis, valueMm)
    : axis + ' ' + T001_num(valueMm) + ' mm';
}

function T001_formatSize(widthMm, heightMm) {
  return window.PacVuUnits
    ? window.PacVuUnits.formatSize(widthMm, heightMm)
    : T001_num(widthMm) + ' \u00D7 ' + T001_num(heightMm) + ' mm';
}

function T001_formatLength(valueMm) {
  return window.PacVuUnits
    ? window.PacVuUnits.formatLength(valueMm)
    : T001_num(valueMm) + ' mm';
}

function T001_glueFillPath(grid) {
  return [
    'M ' + T001_num(grid.xGlueL) + ' ' + T001_num(grid.yBodyTop),
    'L ' + T001_num(grid.xFrontL) + ' ' + T001_num(grid.yBodyTop),
    'L ' + T001_num(grid.xFrontL) + ' ' + T001_num(grid.yBodyBottom),
    'L ' + T001_num(grid.xGlueL) + ' ' + T001_num(grid.yBodyBottom),
    'Z'
  ].join(' ');
}

function T001_buildLabelLayer(layout, style) {
  const visual = style || T001_visualStyle(layout);
  let out = '  <g id="layer-labels">\n';
  layout.labels.forEach(label => {
    out += '    <text class="label" x="' + T001_num(label.x) + '" y="' + T001_num(label.y) +
      '" font-size="' + visual.labelFontSize + '" text-anchor="middle" dominant-baseline="middle"' +
      (label.panelWidth ? ' data-panel-width="' + T001_num(label.panelWidth) + '"' : '') +
      (label.panelHeight ? ' data-panel-height="' + T001_num(label.panelHeight) + '"' : '') +
      '>' + label.name + '</text>\n';
  });
  out += '  </g>\n';
  return out;
}

function T001_buildDimensionLayer(cfg, grid, style) {
  const visual = style || T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  function line(x1, y1, x2, y2, label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return '<line x1="' + T001_num(x1) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x2) + '" y2="' + T001_num(y2) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num(midX) + '" data-anchor-y="' + T001_num(midY) + '" data-offset-axis="y" x="' + T001_num(midX) + '" y="' + T001_num(midY + visual.dimensionTextOffset) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vline(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const textX = x + visual.dimensionVerticalTextOffset;
    return '<line x1="' + T001_num(x) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x) + '" y2="' + T001_num(y2) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num(x) + '" data-anchor-y="' + T001_num(mid) + '" data-offset-axis="x" x="' + T001_num(textX) + '" y="' + T001_num(mid) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" transform="rotate(-90 ' + T001_num(textX) + ' ' + T001_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }
  const dimY = grid.yBodyTop + cfg.H * 0.65;
  return '  <g id="layer-dimensions">' +
    line(grid.xFrontL, dimY, grid.xFrontR, dimY, T001_formatDimension('W', cfg.W)) +
    line(grid.xFrontR, dimY, grid.xSideLR, dimY, T001_formatDimension('D', cfg.D)) +
    vline(grid.xFrontR - Math.min(12, cfg.W * 0.15), grid.yBodyTop, grid.yBodyBottom, T001_formatDimension('H', cfg.H)) +
    '</g>\n';
}

function T001_buildAdaptiveDimensionLayer(cfg, grid, style) {
  const visual = style || T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  function horizontal(x1, x2, y, label) {
    const span = Math.abs(x2 - x1);
    const estimated = Math.max(1, String(label).length * visual.dimensionFontSize * 0.56);
    const available = Math.max(1, span - visual.arrowMarkerSize * 2.4);
    const fontSize = T001_num(visual.dimensionFontSize * Math.max(0.62, Math.min(1, available / estimated)));
    return '<line x1="' + T001_num(x1) + '" y1="' + T001_num(y) + '" x2="' + T001_num(x2) + '" y2="' + T001_num(y) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num((x1 + x2) / 2) + '" data-anchor-y="' + T001_num(y) + '" data-offset-axis="y" x="' + T001_num((x1 + x2) / 2) + '" y="' + T001_num(y + visual.dimensionTextOffset) + '" font-size="' + fontSize + '" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vertical(x, y1, y2, label) {
    const textX = x - visual.dimensionVerticalTextOffset;
    return '<line x1="' + T001_num(x) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x) + '" y2="' + T001_num(y2) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num(x) + '" data-anchor-y="' + T001_num((y1 + y2) / 2) + '" data-offset-axis="x" x="' + T001_num(textX) + '" y="' + T001_num((y1 + y2) / 2) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" transform="rotate(-90 ' + T001_num(textX) + ' ' + T001_num((y1 + y2) / 2) + ')" text-anchor="middle">' + label + '</text>';
  }
  const dimY = grid.yBodyTop + cfg.H * 0.65;
  const hInset = Math.min(cfg.W * 0.25, Math.max(12, visual.arrowMarkerSize * 2.2));
  return '  <g id="layer-dimensions">' +
    horizontal(grid.xFrontL, grid.xFrontR, dimY, T001_formatDimension('W', cfg.W)) +
    horizontal(grid.xFrontR, grid.xSideLR, dimY, T001_formatDimension('D', cfg.D)) +
    vertical(grid.xFrontR - hInset, grid.yBodyTop, grid.yBodyBottom, T001_formatDimension('H', cfg.H)) +
    '</g>\n';
}

function T001_buildOverallDimensionLayer(layout, style, useDedicatedMarkers) {
  const visual = style || T001_visualStyle(layout);
  const dieline = layout.dielineBounds || layout.bounds;
  const bounds = layout.bleedBounds || dieline;
  const s = visual.uiScale || 1;
  const arrowY = bounds.minY - 12 * s;
  const arrowX = bounds.maxX + 12 * s;
  const widthLabel = T001_formatLength(bounds.width);
  const heightLabel = T001_formatLength(bounds.height);
  const guideHalf = 5 * s;
  const markerStart = useDedicatedMarkers ? 'overall-arrow-start' : 'arrow';
  const markerEnd = useDedicatedMarkers ? 'overall-arrow-end' : 'arrow';
  return '  <g id="layer-overall-dimensions">' +
    '<line class="overall-ext" x1="' + T001_num(bounds.minX) + '" y1="' + T001_num(arrowY - guideHalf) + '" x2="' + T001_num(bounds.minX) + '" y2="' + T001_num(arrowY + guideHalf) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-ext" x1="' + T001_num(bounds.maxX) + '" y1="' + T001_num(arrowY - guideHalf) + '" x2="' + T001_num(bounds.maxX) + '" y2="' + T001_num(arrowY + guideHalf) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-dim" x1="' + T001_num(bounds.minX) + '" y1="' + T001_num(arrowY) + '" x2="' + T001_num(bounds.maxX) + '" y2="' + T001_num(arrowY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#' + markerStart + ')" marker-end="url(#' + markerEnd + ')"/>' +
    '<text class="dim overall-text" data-overall-axis="horizontal" x="' + T001_num((bounds.minX + bounds.maxX) / 2) + '" y="' + T001_num(arrowY - 1.5 * s) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" text-anchor="middle">' + widthLabel + '</text>' +
    '<line class="overall-ext" x1="' + T001_num(arrowX - guideHalf) + '" y1="' + T001_num(bounds.minY) + '" x2="' + T001_num(arrowX + guideHalf) + '" y2="' + T001_num(bounds.minY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-ext" x1="' + T001_num(arrowX - guideHalf) + '" y1="' + T001_num(bounds.maxY) + '" x2="' + T001_num(arrowX + guideHalf) + '" y2="' + T001_num(bounds.maxY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-dim" x1="' + T001_num(arrowX) + '" y1="' + T001_num(bounds.minY) + '" x2="' + T001_num(arrowX) + '" y2="' + T001_num(bounds.maxY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#' + markerStart + ')" marker-end="url(#' + markerEnd + ')"/>' +
    '<text class="dim overall-text" data-overall-axis="vertical" x="' + T001_num(arrowX + visual.dimensionVerticalTextOffset) + '" y="' + T001_num((bounds.minY + bounds.maxY) / 2) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" transform="rotate(-90 ' + T001_num(arrowX + visual.dimensionVerticalTextOffset) + ' ' + T001_num((bounds.minY + bounds.maxY) / 2) + ')" text-anchor="middle">' + heightLabel + '</text>' +
    '</g>\n';
}

function T001_renderSVG(cfg, appState) {
  const layout = T001_getLayout(cfg.W, cfg.D, cfg.H);
  const visual = T001_masterVisualStyle(layout);
  const renderBounds = layout.renderBounds || layout.bounds;
  const pad = 80;
  const vbX = renderBounds.minX - pad;
  const vbY = renderBounds.minY - pad;
  const vbW = renderBounds.width + pad * 2;
  const vbH = renderBounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    T001_num(vbX) + ' ' + T001_num(vbY) + ' ' + T001_num(vbW) + ' ' + T001_num(vbH) +
    '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  const internalVisual = T001_internalDimensionStyle();
  const overallVisual = T001_overallVisualStyle(layout);
  svg += '<defs>' + T001_arrowMarkerDef(visual.arrowMarkerSize) + T001_arrowMarkerDef(internalVisual.arrowMarkerSize, 'internal-dimension-arrow', 'userSpaceOnUse') + T001_overallArrowMarkerDefs(overallVisual.arrowMarkerSize) + T001_watermarkDef(visual) + T001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + T001_num(vbX) + '" y="' + T001_num(vbY) + '" width="' + T001_num(vbW) + '" height="' + T001_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '  <g id="layer-fill"><path class="cut-area" d="' + layout.fillPath + '"/></g>\n';
  svg += '  <g id="layer-glue-fill"><path class="glue-area" d="' + T001_glueFillPath(layout.grid) + '"/></g>\n';
  svg += '  <g id="layer-bleed">' + T001_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  svg += '  <g id="layer-cut">' + layout.cutElements.map(el => T001_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  if (!appState || appState.showFolds) {
    svg += '  <g id="layer-fold">' + layout.foldElements.map(el => T001_restyleElement(el, 'fold')).join('') + '</g>\n';
  }
  if (!appState || appState.showLabels) {
    svg += T001_buildLabelLayer(layout, visual);
  }
  if (!appState || appState.showDims) {
    svg += T001_buildAdaptiveDimensionLayer(cfg, layout.grid, visual);
    svg += T001_buildOverallDimensionLayer(layout, overallVisual, true);
  }
  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function T001_buildExportSVG(cfg) {
  const layout = T001_getLayout(cfg.W, cfg.D, cfg.H);
  const renderBounds = layout.renderBounds || layout.bounds;
  const pad = 5;
  const vbX = renderBounds.minX - pad;
  const vbY = renderBounds.minY - pad;
  const vbW = renderBounds.width + pad * 2;
  const vbH = renderBounds.height + pad * 2;
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + T001_num(vbX) + ' ' + T001_num(vbY) + ' ' + T001_num(vbW) + ' ' + T001_num(vbH) + '" width="' + T001_num(vbW) + 'mm" height="' + T001_num(vbH) + 'mm">\n';
  out += '<defs>' + T001_exportStyleBlock() + '</defs>\n';
  out += '<g id="layer-bleed">' + T001_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  out += '<g id="layer-cut">' + layout.cutElements.map(el => T001_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  out += '<g id="layer-fold">' + layout.foldElements.map(el => T001_restyleElement(el, 'fold')).join('') + '</g>\n';
  out += '</svg>';
  return out;
}

function T001_buildDXF() {
  return '';
}
