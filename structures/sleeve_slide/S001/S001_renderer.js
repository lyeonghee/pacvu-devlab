// ============================================================
// S001_renderer.js - S-Series SVG renderer
// Uses PacVu layer/class rules: bleed, cut, fold, hole.
// ============================================================

function S001_styleBlock() {
  return '<style>' +
    '.panel{fill:#ffffff;stroke:none;}' +
    '.thomson,.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.35;stroke-dasharray:2 1.6;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.45;stroke-linejoin:round;stroke-linecap:round;}' +
    '.hole{fill:none;stroke:#1f8f4f;stroke-width:0.45;}' +
    '.part-label{fill:#333;font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function S001_arrowMarkerDef(size) {
  const s = S001_num(size || S001_dimensionArrowSize());
  const mid = S001_num((size || S001_dimensionArrowSize()) / 2);
  return '<marker id="arrow" markerWidth="' + s + '" markerHeight="' + s + '" refX="' + s + '" refY="' + mid + '" orient="auto-start-reverse">' +
    '<path d="M0,0 L' + s + ',' + mid + ' L0,' + s + ' Z" fill="#111"/></marker>';
}

function S001_viewUnitsPerMm() {
  return typeof S001_UNIT_PER_MM !== 'undefined' ? S001_UNIT_PER_MM : 1;
}

function S001_watermarkDef() {
  const k = S001_viewUnitsPerMm();
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="' + S001_num(140 * k) + '" height="' + S001_num(100 * k) + '" patternTransform="rotate(-25)">' +
    '<text x="' + S001_num(24 * k) + '" y="' + S001_num(60 * k) + '" font-size="' + S001_num(22 * k) + '" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>' +
    '</pattern>';
}

function S001_dimensionFontSize() {
  return 11.5;
}

function S001_labelFontSize() {
  return 7 * S001_viewUnitsPerMm();
}

function S001_dimensionStrokeWidth() {
  return 0.46;
}

function S001_dimensionTextOffset() {
  return 12;
}

function S001_dimensionArrowSize() {
  return 16;
}

function S001_dimensionValue(value) {
  const n = Number(value) || 0;
  return Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : S001_num(n);
}

function S001_mapSpecPoint(spec, x, y) {
  if (typeof S001_createMapper !== 'function') return { x, y };
  return S001_createMapper(spec).point(x, y);
}

function S001_renderPathElements(elements, className) {
  return (elements || []).map(element =>
    '<path class="' + className + '" d="' + element.d + '"/>'
  ).join('');
}

const S001_INNER_LABEL_Y_OFFSET = 1481.306;

const S001_PART_LABELS = {
  outerSleeve: [
    { sourceLabel: 'back', label: 'BK', x: 892.266, y: 849.976 },
    { sourceLabel: 'front', label: 'FR', x: 1909.903, y: 883.992 },
    { sourceLabel: 'Glue', label: 'GL', x: 445.5, y: 849.976 },
    { sourceLabel: 'lidBackFlap', label: 'LBF', x: 892.266, y: 372.337 },
    { sourceLabel: 'lidFrontFlap', label: 'LFF', x: 1909.903, y: 440.133 },
    { sourceLabel: 'lidSideFlap(L)', label: 'LSF-L', x: 1402.5, y: 425 },
    { sourceLabel: 'lidSideFlap(R)', label: 'LSF-R', x: 2416, y: 455 },
    { sourceLabel: 'bottomLock-A', label: 'BL-A', x: 892.266, y: 1328 },
    { sourceLabel: 'bottomLock-B', label: 'BL-B', x: 1909.903, y: 1328 },
    { sourceLabel: 'bottomLock(L)', label: 'BL-L', x: 1401.085, y: 1328 },
    { sourceLabel: 'bottomLock(R)', label: 'BL-R', x: 2416.596, y: 1328 }
  ],
  innerTray: [
    { sourceLabel: 'base', label: 'BASE', x: 840.718, y: 2633.123 },
    { sourceLabel: 'top_bend', label: 'T-BD', x: 840.718, y: 1794.067 },
    { sourceLabel: 'top_in', label: 'T-IN', x: 840.718, y: 1907.453 },
    { sourceLabel: 'top_upper', label: 'T-UP', x: 840.718, y: 2023.674 },
    { sourceLabel: 'top_out', label: 'T-OUT', x: 840.718, y: 2144.146 },
    { sourceLabel: 'bottom_out', label: 'B-OUT', x: 840.718, y: 3129.186 },
    { sourceLabel: 'bottom_upper', label: 'B-UP', x: 840.718, y: 3262.953 },
    { sourceLabel: 'bottom_in', label: 'B-IN', x: 840.718, y: 3334.43 },
    { sourceLabel: 'side-left-upper', label: 'SL-UP', x: 272.563, y: 1300.668 + S001_INNER_LABEL_Y_OFFSET, rotate: -90.001 },
    { sourceLabel: 'side-Right-upper', label: 'SR-UP', x: 1410.646, y: 1148.981 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.998 },
    { sourceLabel: 'SideInsertFlapLeft', label: 'SI-FL-L', x: 189.212, y: 1323.292 + S001_INNER_LABEL_Y_OFFSET, rotate: -90.001 },
    { sourceLabel: 'SideInsertFlapRight', label: 'SI-FL-R', x: 1502.607, y: 1151.355 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.998 },
    { sourceLabel: 'SidePanelLeft', label: 'SP-L', x: 359.936, y: 1295.292 + S001_INNER_LABEL_Y_OFFSET, rotate: -90.001 },
    { sourceLabel: 'SidePanelRight', label: 'SP-R', x: 1327.954, y: 1175.739 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.998 },
    { sourceLabel: 'topLockFlapLeft', label: 'T-LK-L', x: 191.716, y: 683.966 + S001_INNER_LABEL_Y_OFFSET, rotate: -90 },
    { sourceLabel: 'topInsertFlapLeft', label: 'T-IN-FL-L', x: 344.056, y: 683.504 + S001_INNER_LABEL_Y_OFFSET, rotate: -90.001 },
    { sourceLabel: 'topLockFlapRight', label: 'T-LK-R', x: 1499.772, y: 504.1 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.999 },
    { sourceLabel: 'topInsertFlapRight', label: 'T-IN-FL-R', x: 1334.91, y: 490.34 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.998 },
    { sourceLabel: 'bottomOuterTuckLeft', label: 'B-OT-L', x: 191.716, y: 1840.047 + S001_INNER_LABEL_Y_OFFSET, rotate: -90 },
    { sourceLabel: 'bottomInnerTuckLeft', label: 'B-IT-L', x: 348.918, y: 1844.631 + S001_INNER_LABEL_Y_OFFSET, rotate: -90.001 },
    { sourceLabel: 'bottomOuterTuckRight', label: 'B-OT-R', x: 1494.751, y: 1608.786 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.999 },
    { sourceLabel: 'bottomInnerTuckRight', label: 'B-IT-R', x: 1337.548, y: 1608.786 + S001_INNER_LABEL_Y_OFFSET, rotate: 89.998 }
  ]
};

function S001_renderTextLabel(spec, item) {
  const p = S001_mapSpecPoint(spec, item.x, item.y);
  const x = S001_num(p.x);
  const y = S001_num(p.y);
  const fontSize = S001_num(S001_labelFontSize());
  const transform = Number.isFinite(item.rotate)
    ? ' transform="rotate(' + S001_num(item.rotate) + ' ' + x + ' ' + y + ')"'
    : '';
  return '<text class="part-label" data-source-label="' + item.sourceLabel + '" x="' + x + '" y="' + y + '" font-size="' + fontSize + '" text-anchor="middle" dominant-baseline="middle"' + transform + '>' + item.label + '</text>';
}

function S001_buildLabelLayer(part) {
  const labels = S001_PART_LABELS[part.key] || [];
  if (!labels.length) return '';
  let out = '    <g id="s001-' + part.key + '-labels">\n';
  labels.forEach(item => {
    out += S001_renderTextLabel(part.spec || {}, item) + '\n';
  });
  out += '    </g>\n';
  return out;
}

function S001_dimensionLine(x1, y1, x2, y2, label, options) {
  const opt = options || {};
  const fontSize = opt.fontSize || S001_dimensionFontSize();
  const strokeWidth = opt.strokeWidth || S001_dimensionStrokeWidth();
  const isVertical = Math.abs(x1 - x2) < Math.abs(y1 - y2);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const textOffset = opt.textOffset || S001_dimensionTextOffset();
  if (isVertical) {
    const textX = midX + textOffset;
    return '<line x1="' + S001_num(x1) + '" y1="' + S001_num(y1) + '" x2="' + S001_num(x2) + '" y2="' + S001_num(y2) +
      '" stroke="#111" stroke-width="' + S001_num(strokeWidth) + '" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" x="' + S001_num(textX) + '" y="' + S001_num(midY) + '" font-size="' + S001_num(fontSize) +
      '" font-weight="600" transform="rotate(-90 ' + S001_num(textX) + ' ' + S001_num(midY) + ')" text-anchor="middle">' + label + '</text>';
  }
  return '<line x1="' + S001_num(x1) + '" y1="' + S001_num(y1) + '" x2="' + S001_num(x2) + '" y2="' + S001_num(y2) +
    '" stroke="#111" stroke-width="' + S001_num(strokeWidth) + '" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
    '<text class="dim" x="' + S001_num(midX) + '" y="' + S001_num(midY + textOffset) + '" font-size="' + S001_num(fontSize) +
    '" font-weight="600" text-anchor="middle">' + label + '</text>';
}

function S001_partDimensionGuides(part) {
  const spec = part.spec || {};
  const x = spec.targetX || [];
  const y = spec.targetY || [];
  const k = S001_viewUnitsPerMm();
  const W = Number(spec.W) || 0;
  const D = Number(spec.D) || 0;
  const H = Number(spec.H) || 0;
  const labelW = window.PacVuUnits.formatDimension('W', W);
  const labelD = window.PacVuUnits.formatDimension('D', D);
  const labelH = window.PacVuUnits.formatDimension('H', H);
  const inset = 22 * k;
  const topGap = 24 * k;
  const sideGap = 26 * k;

  if (part.key === 'outerSleeve' && x.length >= 5 && y.length >= 4) {
    const frontH = Math.abs(y[3] - y[2]) / k;
    const labelFrontH = window.PacVuUnits.formatDimension('H', frontH);
    return [
      { x1: x[1], y1: y[1] + topGap, x2: x[2], y2: y[1] + topGap, label: labelW },
      { x1: x[2], y1: y[2] + topGap, x2: x[3], y2: y[2] + topGap, label: labelD },
      { x1: x[1] + sideGap, y1: y[1], x2: x[1] + sideGap, y2: y[3], label: labelH },
      { x1: x[3], y1: y[2] + topGap, x2: x[4], y2: y[2] + topGap, label: labelW },
      { x1: x[4] - sideGap, y1: y[2], x2: x[4] - sideGap, y2: y[3], label: labelFrontH }
    ];
  }

  if (part.key === 'innerTray' && x.length >= 6 && y.length >= 7) {
    const sourceW1 = S001_mapSpecPoint(spec, 436.754, 2763.114);
    const sourceW2 = S001_mapSpecPoint(spec, 1244.679, 2763.114);
    const sourceD1 = S001_mapSpecPoint(spec, 1251.741, 2763.114);
    const sourceD2 = S001_mapSpecPoint(spec, 1407.646, 2763.114);
    const sourceH1 = S001_mapSpecPoint(spec, 1131.173, 2233.654);
    const sourceH2 = S001_mapSpecPoint(spec, 1131.173, 3031.668);
    return [
      { x1: sourceW1.x, y1: sourceW1.y, x2: sourceW2.x, y2: sourceW2.y, label: labelW },
      { x1: sourceD1.x, y1: sourceD1.y, x2: sourceD2.x, y2: sourceD2.y, label: labelD },
      { x1: sourceH1.x, y1: sourceH1.y, x2: sourceH2.x, y2: sourceH2.y, label: labelH }
    ];
  }

  if (part.key === 'insertPad' && x.length >= 11 && y.length >= 8) {
    const sourceW1 = S001_mapSpecPoint(spec, 1894.283, 2884.1);
    const sourceW2 = S001_mapSpecPoint(spec, 2670.976, 2884.106);
    const sourceH1 = S001_mapSpecPoint(spec, 2403.772, 2215.047);
    const sourceH2 = S001_mapSpecPoint(spec, 2403.762, 2923.709);
    const sourceD1 = S001_mapSpecPoint(spec, 2670.976, 2597.724);
    const sourceD2 = S001_mapSpecPoint(spec, 2750.346, 2597.724);
    const dEndInset = Math.min(Math.abs(sourceD2.x - sourceD1.x) * 0.08, S001_dimensionArrowSize() * 0.55);
    return [
      { x1: sourceW1.x, y1: sourceW1.y, x2: sourceW2.x, y2: sourceW2.y, label: labelW },
      { x1: sourceD1.x, y1: sourceD1.y, x2: sourceD2.x - dEndInset, y2: sourceD2.y, label: labelD },
      { x1: sourceH1.x, y1: sourceH1.y, x2: sourceH2.x, y2: sourceH2.y, label: labelH }
    ];
  }

  const b = part.bounds;
  return [
    { x1: b.minX + inset, y1: b.minY + topGap, x2: b.minX + inset + W * k, y2: b.minY + topGap, label: labelW },
    { x1: b.maxX - inset - D * k, y1: b.minY + topGap * 2, x2: b.maxX - inset, y2: b.minY + topGap * 2, label: labelD },
    { x1: b.minX + sideGap, y1: b.minY + topGap, x2: b.minX + sideGap, y2: b.minY + topGap + H * k, label: labelH }
  ];
}

function S001_buildDimensionLayer(part) {
  const guides = S001_partDimensionGuides(part);
  let out = '    <g id="s001-' + part.key + '-dimensions">\n';
  guides.forEach(guide => {
    out += S001_dimensionLine(guide.x1, guide.y1, guide.x2, guide.y2, guide.label) + '\n';
  });
  out += '    </g>\n';
  return out;
}

function S001_formatOverallLength(value) {
  const mm = value / S001_viewUnitsPerMm();
  return (Math.round(mm * 100) / 100).toString() + ' mm';
}

function S001_overallForBounds(bounds, suffix, offset) {
  if (!bounds) return '';
  const gap = offset || 24;
  const guideHalf = 7;
  const topY = bounds.minY - gap;
  const rightX = bounds.maxX + gap;
  const midX = (bounds.minX + bounds.maxX) / 2;
  const midY = (bounds.minY + bounds.maxY) / 2;
  return '<g data-overall-owner="' + suffix + '">' +
    '<line class="overall-ext" x1="' + S001_num(bounds.minX) + '" y1="' + S001_num(topY - guideHalf) + '" x2="' + S001_num(bounds.minX) + '" y2="' + S001_num(topY + guideHalf) + '"/>' +
    '<line class="overall-ext" x1="' + S001_num(bounds.maxX) + '" y1="' + S001_num(topY - guideHalf) + '" x2="' + S001_num(bounds.maxX) + '" y2="' + S001_num(topY + guideHalf) + '"/>' +
    '<line class="overall-dim" x1="' + S001_num(bounds.minX) + '" y1="' + S001_num(topY) + '" x2="' + S001_num(bounds.maxX) + '" y2="' + S001_num(topY) + '" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
    '<text class="dim overall-text" data-overall-axis="horizontal" x="' + S001_num(midX) + '" y="' + S001_num(topY - 4) + '" text-anchor="middle">' + S001_formatOverallLength(bounds.width) + '</text>' +
    '<line class="overall-ext" x1="' + S001_num(rightX - guideHalf) + '" y1="' + S001_num(bounds.minY) + '" x2="' + S001_num(rightX + guideHalf) + '" y2="' + S001_num(bounds.minY) + '"/>' +
    '<line class="overall-ext" x1="' + S001_num(rightX - guideHalf) + '" y1="' + S001_num(bounds.maxY) + '" x2="' + S001_num(rightX + guideHalf) + '" y2="' + S001_num(bounds.maxY) + '"/>' +
    '<line class="overall-dim" x1="' + S001_num(rightX) + '" y1="' + S001_num(bounds.minY) + '" x2="' + S001_num(rightX) + '" y2="' + S001_num(bounds.maxY) + '" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
    '<text class="dim overall-text" data-overall-axis="vertical" x="' + S001_num(rightX + 4) + '" y="' + S001_num(midY) + '" text-anchor="middle" transform="rotate(-90 ' + S001_num(rightX + 4) + ' ' + S001_num(midY) + ')">' + S001_formatOverallLength(bounds.height) + '</text>' +
    '</g>';
}

function S001_buildOverallDimensionLayer(layout, previewVisibility) {
  if (!layout?.parts?.length) return '';
  let out = '<g id="layer-overall-dimensions" fill="#111" stroke="#111">';
  if (layout.viewMode === 'all') {
    layout.parts.forEach(part => {
      if (previewVisibility[part.key] !== false) out += S001_overallForBounds(part.placedBounds, part.key, 45);
    });
  } else {
    out += S001_overallForBounds(layout.parts[0].placedBounds, layout.parts[0].key, 45);
  }
  return out + '</g>\n';
}

function S001_renderPart(part, appState) {
  const state = appState || {};
  const tx = part.transform ? part.transform.x : 0;
  const ty = part.transform ? part.transform.y : 0;
  let out = '  <g id="s001-' + part.key + '" transform="translate(' + S001_num(tx) + ' ' + S001_num(ty) + ')">\n';
  const fillPaths = part.fillPaths && part.fillPaths.length ? part.fillPaths : (part.fillPath ? [part.fillPath] : []);
  if (fillPaths.length) {
    out += '    <g id="s001-' + part.key + '-panel-fill">' +
      fillPaths.map(path => '<path class="panel" d="' + path + '"/>').join('') +
      '</g>\n';
  }
  if (state.showBleed !== false && part.bleedPath) {
    out += '    <g id="s001-' + part.key + '-bleed"><path class="bleed" d="' + part.bleedPath + '"/></g>\n';
  }
  if (state.showCut !== false && part.cutElements && part.cutElements.length) {
    out += '    <g id="s001-' + part.key + '-cut">' + S001_renderPathElements(part.cutElements, 'cut-fill') + '</g>\n';
  }
  if (state.showFolds !== false && part.foldElements && part.foldElements.length) {
    out += '    <g id="s001-' + part.key + '-fold">' + S001_renderPathElements(part.foldElements, 'fold') + '</g>\n';
  }
  if (state.showPerforation !== false && state.showHoles !== false && part.holeElements && part.holeElements.length) {
    out += '    <g id="s001-' + part.key + '-holes">' + S001_renderPathElements(part.holeElements, 'hole') + '</g>\n';
  }
  if (state.showLabels !== false) {
    out += S001_buildLabelLayer(part);
  }
  if (state.showDims !== false) {
    out += S001_buildDimensionLayer(part);
  }
  out += '  </g>\n';
  return out;
}

function S001_renderSVG(cfg, appState) {
  const layout = S001_getLayout(cfg, appState);
  const previewVisibility = {
    outerSleeve: cfg?.showOuterSleeve !== false,
    innerTray: cfg?.showInnerTray !== false,
    insertPad: cfg?.showInsertPad !== false
  };
  const bounds = layout.bounds;
  const pad = 70;
  const vbX = bounds.minX - pad;
  const vbY = bounds.minY - pad;
  const vbW = bounds.width + pad * 2;
  const vbH = bounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"' +
    ' viewBox="' + S001_num(vbX) + ' ' + S001_num(vbY) + ' ' + S001_num(vbW) + ' ' + S001_num(vbH) + '"' +
    ' width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg += '<defs>' + S001_arrowMarkerDef() + S001_watermarkDef() + S001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + S001_num(vbX) + '" y="' + S001_num(vbY) + '" width="' + S001_num(vbW) + '" height="' + S001_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  layout.parts.forEach(part => {
    if (layout.viewMode === 'all' && previewVisibility[part.key] === false) return;
    svg += S001_renderPart(part, appState);
  });
  if (!appState || appState.showDims !== false) {
    svg += S001_buildOverallDimensionLayer(layout, previewVisibility);
  }
  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g>\n</svg>';
  return svg;
}

if (typeof window !== 'undefined') {
  window.S001_renderSVG = S001_renderSVG;
}
