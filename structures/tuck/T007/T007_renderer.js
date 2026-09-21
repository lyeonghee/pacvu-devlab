// T007_renderer.js - shared PacVu 2D visual layer

function T007_restyle(el, c) {
  return el
    .replace(/\sfill="[^"]*"/g, '')
    .replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '')
    .replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '')
    .replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '')
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\/>$/, ' class="' + c + '"/>');
}

function T007_dimensions(cfg, g, v) {
  const fs = v.dimensionFontSize;

  const h = (a, b, y, t) =>
    '<line ' +
      'class="overall-dim t007-internal-dim" ' +
      'stroke="#111" ' +
      'stroke-width="' + v.dimensionLineStroke + '" ' +
      'x1="' + T007_num(a) + '" ' +
      'y1="' + T007_num(y) + '" ' +
      'x2="' + T007_num(b) + '" ' +
      'y2="' + T007_num(y) + '" ' +
      'marker-start="url(#internal-dimension-arrow)" ' +
      'marker-end="url(#internal-dimension-arrow)"/>' +
    '<text ' +
      'class="dim overall-text" ' +
      'font-size="' + fs + '" ' +
      'font-weight="600" ' +
      'x="' + T007_num((a + b) / 2) + '" ' +
      'y="' + T007_num(y - 1.75) + '" ' +
      'text-anchor="middle">' +
    
      t +
    '</text>';

  const z = (x, a, b, t) =>
    '<line ' +
      'class="overall-dim t007-internal-dim" ' +
      'stroke="#111" ' +
      'stroke-width="' + v.dimensionLineStroke + '" ' +
      'x1="' + T007_num(x) + '" ' +
      'y1="' + T007_num(a) + '" ' +
      'x2="' + T007_num(x) + '" ' +
      'y2="' + T007_num(b) + '" ' +
      'marker-start="url(#internal-dimension-arrow)" ' +
      'marker-end="url(#internal-dimension-arrow)"/>' +
    '<text ' +
      'class="dim overall-text" ' +
      'font-size="' + fs + '" ' +
      'font-weight="600" ' +
      'x="' + T007_num(x + 5) + '" ' +
      'y="' + T007_num((a + b) / 2) + '" ' +
      'transform="rotate(-90 ' +
        T007_num(x + 5) +
        ' ' +
        T007_num((a + b) / 2) +
      ')" ' +
      'text-anchor="middle">' +
      t +
    '</text>';

  const y = g.yBodyBottom - Math.min(15, cfg.H * 0.08);
  const heightX = g.xBackL + Math.min(22, cfg.W * 0.2);

  return (
    '<g id="layer-dimensions">' +
      h(
        g.xBackL,
        g.xBackR,
        y,
        T001_formatDimension('W', cfg.W)
      ) +
      h(
        g.xBackR,
        g.xSideLR,
        y,
        T001_formatDimension('D', cfg.D)
      ) +
      z(
        heightX,
        g.yBodyTop,
        g.yBodyBottom,
        T001_formatDimension('H', cfg.H)
      ) +
    '</g>'
  );
}

function T007_renderSVG(cfg, state) {
  const l = T007_getLayout(cfg);
  const v = T002_displayVisualStyle(l);
  const b = l.bleedBounds;
  const p = 80;
  const x = b.minX - p;
  const y = b.minY - p;
  const w = b.width + p * 2;
  const h = b.height + p * 2;

  let o =
    '<svg ' +
      'id="mainSvg" ' +
      'xmlns="http://www.w3.org/2000/svg" ' +
      'viewBox="' + [x, y, w, h].map(T007_num).join(' ') + '" ' +
      'width="100%" ' +
      'height="100%" ' +
      'preserveAspectRatio="xMidYMid meet">' +

    '<defs>' +

      T001_arrowMarkerDef(
        Math.max(2.4, v.arrowMarkerSize * 0.42),
        'internal-dimension-arrow',
        'userSpaceOnUse'
      ) +
      T001_overallArrowMarkerDefs(v.arrowMarkerSize) +
      T001_watermarkDef(v) +
      T001_styleBlock() +

      '<style>' +
        '.cut-fill{' +
          'stroke-width:1.05' +
        '}' +

        '.fold{' +
          'stroke-width:.75' +
        '}' +

        '.bleed{' +
          'stroke-width:.9' +
        '}' +

        '.perf{' +
          'fill:none;' +
          'stroke:#169b45;' +
          'stroke-width:.8;' +
          'stroke-dasharray:2.5 2;' +
          'vector-effect:non-scaling-stroke' +
        '}' +

        '.glue-area{' +
          'fill:#c5c5c5;' +
          'opacity:.82' +
        '}' +

        '.t007-internal-dim{' +
          'fill:none' +
        '}' +
      '</style>' +

    '</defs>' +

    '<rect ' +
      'x="' + x + '" ' +
      'y="' + y + '" ' +
      'width="' + w + '" ' +
      'height="' + h + '" ' +
      'fill="#d0d0d0"/>' +

    '<g id="viewportGroup">' +

      '<g id="layer-fill">' +
        '<path class="cut-area" d="' + l.fillPath + '"/>' +
      '</g>' +

      '<g id="layer-glue-fill">' +
        '<path class="glue-area" d="' + l.glueFillPath + '"/>' +
      '</g>';

  if (!state || state.showBleed) {
    o +=
      '<g id="layer-bleed">' +
        T007_restyle(l.bleedElement, 'bleed') +
      '</g>';
  }

  if (!state || state.showCut) {
    o +=
      '<g id="layer-cut">' +
        l.cutElements
          .map((e) => T007_restyle(e, 'cut-fill'))
          .join('') +
      '</g>';
  }

  if (!state || state.showFolds) {
    o +=
      '<g id="layer-fold">' +
        l.foldElements
          .map((e) => T007_restyle(e, 'fold'))
          .join('') +
      '</g>';
  }

  if (!state || state.showPerforation) {
    o +=
      '<g id="layer-perforation">' +
        l.perforationElements
          .map((e) => T007_restyle(e, 'perf'))
          .join('') +
      '</g>';
  }

  if (!state || state.showLabels) {
    o += T001_buildLabelLayer(l, v);
  }

  if (!state || state.showDims) {
    o += T007_dimensions(cfg, l.grid, v);
    o += T001_buildOverallDimensionLayer(l, v, true);
  }

  return (
    o +
      '<rect ' +
        'x="-5000" ' +
        'y="-5000" ' +
        'width="10000" ' +
        'height="10000" ' +
        'fill="url(#wm)" ' +
        'pointer-events="none"/>' +
    '</g>' +
    '</svg>'
  );
}

function T007_buildExportSVG(cfg) {
  const l = T007_getLayout(cfg);
  const b = l.bleedBounds;
  const p = 5;
  const x = b.minX - p;
  const y = b.minY - p;
  const w = b.width + p * 2;
  const h = b.height + p * 2;

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg ' +
      'xmlns="http://www.w3.org/2000/svg" ' +
      'viewBox="' + [x, y, w, h].map(T007_num).join(' ') + '" ' +
      'width="' + T007_num(w) + 'mm" ' +
      'height="' + T007_num(h) + 'mm">' +

      '<defs>' +
        T001_styleBlock() +
      '</defs>' +

      '<g id="layer-bleed">' +
        T007_restyle(l.bleedElement, 'bleed') +
      '</g>' +

      '<g id="layer-cut">' +
        l.cutElements
          .map((e) => T007_restyle(e, 'cut-fill'))
          .join('') +
      '</g>' +

      '<g id="layer-fold">' +
        l.foldElements
          .map((e) => T007_restyle(e, 'fold'))
          .join('') +
      '</g>' +

      '<g id="layer-perforation">' +
        l.perforationElements
          .map((e) => T007_restyle(e, 'perf'))
          .join('') +
      '</g>' +

    '</svg>'
  );
}

function T007_buildDXF(cfg) {
  const l = T007_getLayout(cfg);

  const rows = window.PacVuDXFR12.createRows([
    'CUT',
    'FOLD',
    'PERF',
    'BLEED',
  ]);

  const line = (a, b, n) =>
    rows.push(
      '0', 'LINE',
      '8', n,
      '10', String(T007_num(a.x)),
      '20', String(T007_num(-a.y)),
      '30', '0',
      '11', String(T007_num(b.x)),
      '21', String(T007_num(-b.y)),
      '31', '0'
    );

  const path = (d, n) => {
    const q = T001_flattenPathD(d);

    for (let i = 0; i < q.length - 1; i++) {
      line(q[i], q[i + 1], n);
    }
  };

  l.cutElements.forEach((e) => {
    path(T001_elementToPathD(e), 'CUT');
  });

  l.foldElements.forEach((e) => {
    path(T001_elementToPathD(e), 'FOLD');
  });

  l.perforationElements.forEach((e) => {
    path(T001_elementToPathD(e), 'PERF');
  });

  path(l.bleedPath, 'BLEED');

  return window.PacVuDXFR12.finish(rows);
}
