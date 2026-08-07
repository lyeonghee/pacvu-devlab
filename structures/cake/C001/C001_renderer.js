// ============================================================
// C001_renderer.js - Cake Box renderer
// Depends on C001_spec.js, C001_layout.js
// ============================================================

function C001_num(value) {
  return +(+value).toFixed(4);
}

function C001_attr(el, name) {
  if (!el) return '';
  const re = new RegExp(name + '="([^"]*)"');
  const match = el.match(re);
  return match ? match[1] : '';
}

function C001_findCutPath(prefix) {
  const el = C001_CUT_ELEMENTS.find(item => C001_attr(item, 'd').startsWith(prefix));
  return C001_attr(el, 'd');
}

function C001_tag(el) {
  const match = el.match(/^<([a-z]+)/i);
  return match ? match[1].toLowerCase() : '';
}

function C001_matrix(t) {
  return 'matrix(' + [t.a, t.b, t.c, t.d, t.e, t.f].map(C001_num).join(' ') + ')';
}

function C001_map(layout, x, y) {
  if (layout && typeof layout.mapPoint === 'function') return layout.mapPoint(x, y);
  const t = layout.transform;
  return { x: C001_num((x * t.a) + t.e), y: C001_num((y * t.d) + t.f) };
}

function C001_restyleElement(el, className) {
  const out = el
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\sfill="[^"]*"/g, '')
    .replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '')
    .replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '')
    .replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '');

  if (/\/>$/.test(out)) return out.replace(/\/>$/, ' class="' + className + '"/>');
  return out.replace(/>$/, ' class="' + className + '>');
}

function C001_isPathCommand(value) {
  return /^[a-zA-Z]$/.test(value);
}

function C001_pathTokens(d) {
  return d.match(/[a-zA-Z]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
}

function C001_pathPoint(layout, x, y) {
  const p = C001_map(layout, x, y);
  return C001_num(p.x) + ' ' + C001_num(p.y);
}

function C001_transformPathD(d, layout) {
  const tokens = C001_pathTokens(d);
  const out = [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;

  function n() {
    return Number(tokens[i++]);
  }

  function point(rel) {
    const px = (rel ? x : 0) + n();
    const py = (rel ? y : 0) + n();
    return { x: px, y: py };
  }

  while (i < tokens.length) {
    if (C001_isPathCommand(tokens[i])) cmd = tokens[i++];
    if (!cmd) break;
    const rel = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();

    if (c === 'M') {
      let first = true;
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        const p = point(rel);
        x = p.x;
        y = p.y;
        if (first) {
          sx = x;
          sy = y;
          out.push('M' + C001_pathPoint(layout, x, y));
          first = false;
        } else {
          out.push('L' + C001_pathPoint(layout, x, y));
        }
      }
    } else if (c === 'L' || c === 'T') {
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        const p = point(rel);
        x = p.x;
        y = p.y;
        out.push('L' + C001_pathPoint(layout, x, y));
      }
    } else if (c === 'H') {
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        x = (rel ? x : 0) + n();
        out.push('L' + C001_pathPoint(layout, x, y));
      }
    } else if (c === 'V') {
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        y = (rel ? y : 0) + n();
        out.push('L' + C001_pathPoint(layout, x, y));
      }
    } else if (c === 'C') {
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        const p1 = point(rel);
        const p2 = point(rel);
        const p3 = point(rel);
        x = p3.x;
        y = p3.y;
        out.push('C' + C001_pathPoint(layout, p1.x, p1.y) + ' ' +
          C001_pathPoint(layout, p2.x, p2.y) + ' ' +
          C001_pathPoint(layout, x, y));
      }
    } else if (c === 'S' || c === 'Q') {
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        const p1 = point(rel);
        const p2 = point(rel);
        x = p2.x;
        y = p2.y;
        out.push(c + C001_pathPoint(layout, p1.x, p1.y) + ' ' + C001_pathPoint(layout, x, y));
      }
    } else if (c === 'A') {
      while (i < tokens.length && !C001_isPathCommand(tokens[i])) {
        const rx = n() * layout.panelMap.unit;
        const ry = n() * layout.panelMap.unit;
        const rot = n();
        const large = n();
        const sweep = n();
        const p = point(rel);
        x = p.x;
        y = p.y;
        out.push('A' + C001_num(rx) + ' ' + C001_num(ry) + ' ' + rot + ' ' +
          large + ' ' + sweep + ' ' + C001_pathPoint(layout, x, y));
      }
    } else if (c === 'Z') {
      out.push('Z');
      x = sx;
      y = sy;
    } else {
      break;
    }
  }

  return out.join(' ');
}

function C001_transformPoints(points, layout) {
  const nums = (points.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  const mapped = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    const p = C001_map(layout, nums[i], nums[i + 1]);
    mapped.push(C001_num(p.x) + ',' + C001_num(p.y));
  }
  return mapped.join(' ');
}

function C001_transformElement(el, className, layout) {
  const tag = C001_tag(el);
  const cls = className ? ' class="' + className + '"' : '';

  if (tag === 'path') {
    return '<path d="' + C001_transformPathD(C001_attr(el, 'd'), layout) + '"' + cls + '/>';
  }
  if (tag === 'line') {
    const a = C001_map(layout, Number(C001_attr(el, 'x1')), Number(C001_attr(el, 'y1')));
    const b = C001_map(layout, Number(C001_attr(el, 'x2')), Number(C001_attr(el, 'y2')));
    return '<line x1="' + C001_num(a.x) + '" y1="' + C001_num(a.y) +
      '" x2="' + C001_num(b.x) + '" y2="' + C001_num(b.y) + '"' + cls + '/>';
  }
  if (tag === 'polyline' || tag === 'polygon') {
    return '<' + tag + ' points="' + C001_transformPoints(C001_attr(el, 'points'), layout) + '"' + cls + '/>';
  }
  return C001_restyleElement(el, className);
}

function C001_layerElements(elements, className, layout) {
  return elements.map(el => C001_transformElement(el, className, layout)).join('');
}

function C001_isSourceCallout(el) {
  return [
    'CutPath(0,0)',
    'Fold Line(0,-1)',
    'Bleed Line(-28.12,5.85)',
    'x1="449.166" y1="487.015"',
    'points="460.09 487.015 444.696 480.725',
    'x1="452.507" y1="479.577"',
    'points="460.09 484.026 451.725 469.593',
    'x1="375.51" y1="505.654"',
    'points="380.394 503.599 371.072 500.697',
    'x1="1255.999" y1="1001.638"',
    'points="1241.878 1001.638',
    'points="1634.617 1001.638',
    'translate(1409.945 982.371)'
  ].some(pattern => el.indexOf(pattern) !== -1);
}

function C001_visibleElements(elements) {
  return elements.filter(el => !C001_isSourceCallout(el));
}

function C001_supplementCutElements() {
  return [
    '<line x1="1632.217" y1="1270.799" x2="1632.217" y2="1537.256" fill="none" stroke="#e63725" stroke-miterlimit="2.613" stroke-width="2" />'
  ];
}

function C001_styleBlock() {
  return '<style>' +
    '.panel-fill{fill:#ffffff;stroke:none;fill-rule:nonzero;clip-rule:nonzero;}' +
    '.glue-fill{fill:#e6e6e6;stroke:none;fill-rule:nonzero;clip-rule:nonzero;}' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.6;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#3c4c9e;stroke-width:0.55;stroke-dasharray:3 3;stroke-linecap:butt;stroke-linejoin:miter;vector-effect:non-scaling-stroke;}' +
    '.label{fill:#333;font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;font-weight:500;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;font-weight:500;pointer-events:none;}' +
    '.overall-dim,.overall-ext{fill:none;stroke:#111;stroke-width:0.35;vector-effect:non-scaling-stroke;}' +
    '.overall-text{font-size:6.4px;font-weight:600;}' +
    '.guide text,.guide tspan{font-family:"Pretendard","Noto Sans KR",Arial,sans-serif;}' +
    '.guide{pointer-events:none;}' +
    '</style>';
}

function C001_arrowMarkerDef() {
  return '<marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 L7.6,5 Z" fill="#111"/></marker>';
}

function C001_watermarkDef() {
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="160" height="110" patternTransform="rotate(-25)">' +
    '<text x="24" y="66" font-size="24" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="0.12">PacVu</text>' +
    '</pattern>';
}

function C001_getPanelHolePaths() {
  return [];
}

function C001_getHandleCutoutPaths() {
  const handleLeftFill = [
    'M1862.26 797.521',
    'V956.782',
    'S1880.131 994.206 1907.066 1013.372',
    'C1907.066 1013.372 1931.541 975.818 1939.181 909.645',
    'C1939.181 909.645 1911.469 906.667 1909.915 876.747',
    'C1909.915 876.747 1908.757 850.983 1939.181 843.732',
    'C1939.181 843.732 1935.167 790.509 1907.145 739.746',
    'C1907.145 739.746 1880.217 759.107 1862.26 797.521',
    'Z'
  ].join(' ');

  const handleRightFill = [
    'M2190.395 797.443',
    'V956.704',
    'S2172.524 994.128 2145.589 1013.294',
    'C2145.589 1013.294 2121.114 975.74 2113.474 909.567',
    'C2113.474 909.567 2141.186 906.589 2142.74 876.669',
    'C2142.74 876.669 2143.898 850.905 2113.474 843.654',
    'C2113.474 843.654 2117.488 790.431 2145.51 739.668',
    'C2145.51 739.668 2172.438 759.029 2190.395 797.443',
    'Z'
  ].join(' ');

  return [handleLeftFill, handleRightFill];
}

function C001_getPanelPaperPaths() {
  const glue = [
    'M389.223 509.808',
    'L460.09 487.02',
    'L460.09 1266.546',
    'L389.223 1243.755',
    'Z'
  ].join(' ');

  const base = [
    'M474.264 95.835',
    'H1221.192',
    'C1229.016 95.835 1235.366 102.184 1235.366 110.008',
    'V483.019',
    'C1235.429 485.288 1237.321 487.079 1239.591 487.016',
    'C1240.687 486.986 1241.724 486.52 1242.474 485.721',
    'C1243.224 484.922 1243.624 483.858 1243.586 482.763',
    'V1270.8',
    'C1243.665 1268.531 1241.888 1266.626 1239.619 1266.547',
    'C1238.523 1266.509 1237.459 1266.909 1236.66 1267.66',
    'C1235.861 1268.41 1235.396 1269.448 1235.366 1270.543',
    'V1643.555',
    'C1235.366 1651.379 1229.016 1657.728 1221.192 1657.728',
    'H474.264',
    'C466.441 1657.728 460.093 1651.377 460.09 1643.554',
    'V1266.546',
    'V487.017',
    'V110.008',
    'C460.093 102.186 466.441 95.837 474.264 95.835',
    'Z'
  ].join(' ');

  const sideBack = [
    'M1257.76 202.133',
    'H1618.044',
    'C1625.868 202.133 1632.217 208.643 1632.217 216.467',
    'V482.764',
    'C1632.217 485.111 1634.122 487.016 1636.469 487.016',
    'V1266.549',
    'C1634.122 1266.548 1632.217 1268.452 1632.217 1270.799',
    'V1537.256',
    'C1632.217 1545.08 1625.868 1551.429 1618.044 1551.429',
    'H1257.76',
    'C1249.935 1551.429 1243.586 1545.08 1243.586 1537.256',
    'V1270.8',
    'V482.763',
    'V216.307',
    'C1243.586 208.483 1249.936 202.133 1257.76 202.133',
    'Z'
  ].join(' ');

  const sideBackMainCleanFill = [
    'M1239.618 492',
    'H1243.586',
    'V1261.5',
    'H1239.618',
    'Z'
  ].join(' ');

  const lidTopUpper = C001_findCutPath('M2411.585,484.187');
  const lidTopLower = C001_findCutPath('M1640.396,1270.806');
  const lidTop = [
    lidTopUpper,
    'C1640.721 483.891 1640.274 484.972 1639.476 485.77',
    'C1638.678 486.568 1637.597 487.016 1636.469 487.016',
    'L1636.469 1266.549',
    'C1638.817 1266.548 1640.396 1268.453 1640.396 1270.806',
    lidTopLower.replace(/^M[-\d.,]+/, ''),
    'L2411.585 484.187',
    'Z',

  ].join(' ');

  const sideFront = [
    'M2434.418 202.133',
    'H2795.89',
    'C2803.713 202.133 2810.064 208.483 2810.064 216.307',
    'V1537.256',
    'C2810.064 1545.08 2803.714 1551.429 2795.89 1551.429',
    'H2434.418',
    'C2426.594 1551.429 2420.245 1545.08 2420.245 1537.256',
    'V216.307',
    'C2420.245 208.483 2426.594 202.133 2434.418 202.133',
    'Z'
  ].join(' ');

  const sideFrontBody = [
    'M2411.179 487.016',
    'H2810.064',
    'V1266.547',
    'H2411.179',
    'Z'
  ].join(' ');

  return [
    { d: glue, className: 'glue-fill' },
    base,
    sideBack,
    lidTop,
    sideBackMainCleanFill,
    sideFrontBody,
    sideFront
  ];
}

function C001_buildPanelFillLayer(layout) {
  const paths = C001_getPanelPaperPaths()
    .map(item => {
      const d = typeof item === 'string' ? item : item.d;
      const className = typeof item === 'string' ? 'panel-fill' : item.className;
      return '<path class="' + className + '" d="' + C001_transformPathD(d, layout) + '"/>';
    })
    .join('');
  return '  <g id="layer-panel-fill">' +
    paths +
    '</g>\n';
}

function C001_labelText(layout, x, y, text, size) {
  const p = C001_map(layout, x, y);
  return '<text class="label" x="' + p.x + '" y="' + p.y + '" font-size="' + size +
    '" text-anchor="middle" dominant-baseline="middle">' + text + '</text>\n';
}

function C001_buildLabelLayer(layout) {
  let out = '  <g id="layer-labels">\n';
  out += C001_labelText(layout, 425, 877, 'Glue', 7);
  out += C001_labelText(layout, 850, 877, 'base', 7.6);
  out += C001_labelText(layout, 1438, 877, 'Side-back', 7);
  out += C001_labelText(layout, 2613, 877, 'Side-front', 7);
  out += C001_labelText(layout, 850, 249, 'slot panel(L)', 7);
  out += C001_labelText(layout, 850, 1528, 'slot panel(R)', 7);
  out += C001_labelText(layout, 2026, 877, 'lidTop', 7.6);
  out += C001_labelText(layout, 1438, 345, 'lidSidebackFlap(L)', 6.4);
  out += C001_labelText(layout, 1438, 1409, 'lidSidebackFlap(R)', 6.4);
  out += C001_labelText(layout, 2026, 336, 'lidSidelock(L)', 6.4);
  out += C001_labelText(layout, 2026, 1418, 'lidSidelock(R)', 6.4);
  out += C001_labelText(layout, 2613, 345, 'lidSidefrontFlap(L)', 6.4);
  out += C001_labelText(layout, 2613, 1409, 'lidSidefrontFlap(R)', 6.4);
  out += '  </g>\n';
  return out;
}

function C001_buildDimensionLayer(cfg, layout) {
  function hDim(id, x1, x2, y, label, textDy) {
    const p1 = C001_map(layout, x1, y);
    const p2 = C001_map(layout, x2, y);
    const midX = (p1.x + p2.x) / 2;
    return '<line data-dimension-id="' + id + '" x1="' + C001_num(p1.x) + '" y1="' + p1.y + '" x2="' + C001_num(p2.x) + '" y2="' + p2.y + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" data-dimension-id="' + id + '" data-anchor-x="' + C001_num(midX) + '" data-anchor-y="' + C001_num(p1.y) + '" data-offset-axis="y" data-line-y="' + C001_num(p1.y) + '" x="' + C001_num(midX) + '" y="' + C001_num(p1.y + textDy) + '" font-size="6.4" text-anchor="middle">' + label + '</text>';
  }

  function vDim(id, x, y1, y2, label) {
    const p1 = C001_map(layout, x, y1);
    const p2 = C001_map(layout, x, y2);
    const midY = (p1.y + p2.y) / 2;
    const textX = p1.x + 8;
    return '<line data-dimension-id="' + id + '" x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" stroke="#111" stroke-width="0.35" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim" data-dimension-id="' + id + '" data-anchor-x="' + C001_num(p1.x) + '" data-anchor-y="' + C001_num(midY) + '" data-offset-axis="x" data-line-x="' + C001_num(p1.x) + '" x="' + C001_num(textX) + '" y="' + C001_num(midY) + '" font-size="6.4" transform="rotate(-90 ' + C001_num(textX) + ' ' + C001_num(midY) + ')" text-anchor="middle">W ' + label + 'mm</text>';
  }

  let out = '  <g id="layer-dimensions">\n';
  out += hDim('depth', 460.09, 1239.618, 1002, window.PacVuUnits.formatDimension('D', cfg.D), 4.8);
  out += vDim('width', 1091, 483, 1269, cfg.W);
  out += hDim('height', 1239.618, 1636.469, 1002, window.PacVuUnits.formatDimension('H', cfg.H), 4.8);
  out += '  </g>\n';
  return out;
}

function C001_renderSVG(cfg, appState) {
  const layout = C001_getLayout(cfg);
  const matrix = C001_matrix(layout.transform);
  const pad = 80;
  const vbX = layout.bounds.minX - pad;
  const vbY = layout.bounds.minY - pad;
  const vbW = layout.bounds.width + pad * 2;
  const vbH = layout.bounds.height + pad * 2;

  let svg = '<svg id="mainSvg" data-pacvu-preserve-dimension-ends="true" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    C001_num(vbX) + ' ' + C001_num(vbY) + ' ' + C001_num(vbW) + ' ' + C001_num(vbH) +
    '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  svg += '<defs>' + C001_arrowMarkerDef() + C001_watermarkDef() + C001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + C001_num(vbX) + '" y="' + C001_num(vbY) + '" width="' + C001_num(vbW) + '" height="' + C001_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += C001_buildPanelFillLayer(layout);
  if (appState && appState.showC001Guide) {
    svg += '  <g id="layer-guide" class="guide" transform="' + matrix + '">' +
      C001_visibleElements(layout.guideElements).join('') + '</g>\n';
  }
  if (!appState || appState.showBleed) {
    svg += '  <g id="layer-bleed">' +
      C001_layerElements(layout.bleedElements, 'bleed', layout) + '</g>\n';
  }
  if (!appState || appState.showCut) {
    const cutElements = C001_visibleElements(layout.cutElements).concat(C001_supplementCutElements());
    svg += '  <g id="layer-cut">' +
      C001_layerElements(cutElements, 'cut-fill', layout) + '</g>\n';
  }
  if (!appState || appState.showFolds) {
    svg += '  <g id="layer-fold">' +
      C001_layerElements(C001_visibleElements(layout.foldElements), 'fold', layout) + '</g>\n';
  }
  if (!appState || appState.showLabels) svg += C001_buildLabelLayer(layout);
  if (!appState || appState.showDims) {
    svg += C001_buildDimensionLayer(layout.cfg, layout);
    if (typeof window.PacVuCake2DVisualCommon?.buildOverallDimensionLayer === 'function') {
      svg += window.PacVuCake2DVisualCommon.buildOverallDimensionLayer(layout);
    }
  }
  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}
