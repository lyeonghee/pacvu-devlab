(function (global) {
  'use strict';

  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  const num = (value) => Number(value.toFixed(3));

  function labelLayer(layout) {
    return `<g id="layer-labels">${layout.labels.map((label) =>
      `<text x="${label.x}" y="${label.y}" class="panel-label">${esc(label.name)}</text>`
    ).join('')}</g>`;
  }

  function horizontalDimension(x1, x2, y, label) {
    const tip = 10;
    const half = 5;
    const mid = (x1 + x2) / 2;
    return `<g class="dimension"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>` +
      `<path d="M${x1},${y} L${x1 + tip},${y - half} L${x1 + tip},${y + half} Z"/>` +
      `<path d="M${x2},${y} L${x2 - tip},${y - half} L${x2 - tip},${y + half} Z"/>` +
      `<text x="${mid}" y="${y - 12}">${esc(label)}</text></g>`;
  }

  function verticalDimension(x, y1, y2, label) {
    const tip = 10;
    const half = 5;
    const mid = (y1 + y2) / 2;
    return `<g class="dimension"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>` +
      `<path d="M${x},${y1} L${x - half},${y1 + tip} L${x + half},${y1 + tip} Z"/>` +
      `<path d="M${x},${y2} L${x - half},${y2 - tip} L${x + half},${y2 - tip} Z"/>` +
      `<text x="${x - 14}" y="${mid}" transform="rotate(-90 ${x - 14} ${mid})">${esc(label)}</text></g>`;
  }

  function dimensionLayer(layout) {
    const cfg = layout.config;
    const g = layout.grid;
    const y = g.yBodyBottom - 54;
    return `<g id="layer-dimensions">` +
      horizontalDimension(g.xSideL, g.xFrontR, y, window.PacVuUnits.formatDimension('W', cfg.W)) +
      horizontalDimension(g.xBackR, g.xSideL, y, window.PacVuUnits.formatDimension('D', cfg.D)) +
      verticalDimension(g.xFrontR - 32, g.yBodyTop, g.yBodyBottom, window.PacVuUnits.formatDimension('H', cfg.H)) +
      `</g>`;
  }

  function glueFill(layout) {
    return layout.glueFillPath;
  }

  global.GA001_renderSVG = function GA001_renderSVG(config, state) {
    const layout = global.GA001_getLayout(config);
    const b = layout.bounds;
    const pad = 72;
    const view = `${b.minX - pad} ${b.minY - pad} ${b.width + pad * 2} ${b.height + pad * 2}`;
    const showCut = !state || state.showCut !== false;
    const showFolds = !state || state.showFolds !== false;
    const showBleed = !state || state.showBleed !== false;
    const showLabels = !state || !!state.showLabels;
    const showDims = !state || !!state.showDims;
    const holes = layout.holePaths.join('');
    const watermark = [];
    for (let y = b.minY; y < b.minY + b.height + 145; y += 145) {
      for (let x = b.minX - 40; x < b.minX + b.width + 260; x += 260) {
        watermark.push(`<text x="${x}" y="${y}" transform="rotate(-28 ${x} ${y})">PacVu</text>`);
      }
    }

    return `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <style>
        .panel-label,.dimension text{fill:#222;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;text-anchor:middle;dominant-baseline:middle;pointer-events:none}
        .panel-label{font-size:17px}
        .dimension line{stroke:#111;stroke-width:.28;vector-effect:non-scaling-stroke}.dimension path{fill:#111}.dimension text{font-size:15px;font-weight:700}
      </style>
      <rect x="${b.minX - pad}" y="${b.minY - pad}" width="${b.width + pad * 2}" height="${b.height + pad * 2}" fill="#d0d0d0"/>
      <path d="${esc(layout.outerFillPath + holes)}" fill="#fff" fill-rule="evenodd"/>
      <g fill="#b8b8b8" fill-opacity="0.18" font-family="Arial,sans-serif" font-size="44" font-weight="600" pointer-events="none">${watermark.join('')}</g>
      <path id="layer-glue-fill" d="${glueFill(layout)}" fill="#d4d4d4" fill-opacity="0.82"/>
      ${showBleed ? `<path id="layer-bleed" d="${esc(layout.bleedPath)}" fill="none" stroke="#0055ff" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` : ''}
      ${showFolds ? `<g id="layer-fold" fill="none" stroke="#1d6fe8" stroke-width="0.45" stroke-dasharray="2.5 2" vector-effect="non-scaling-stroke">${layout.foldLines.map((line) => `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"/>`).join('')}</g>` : ''}
      ${showCut ? `<g id="layer-cut" fill="none" stroke="#cc0000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">${layout.cutPaths.map((d) => `<path d="${esc(d)}"/>`).join('')}</g>` : ''}
      ${showLabels ? labelLayer(layout) : ''}
      ${showDims ? dimensionLayer(layout) : ''}
      ${showDims && global.PacVuGable2DVisualCommon ? global.PacVuGable2DVisualCommon.overallLayer(layout) : ''}
    </svg>`;
  };

  global.GA001_buildExportSVG = function GA001_buildExportSVG(config) {
    const layout = global.GA001_getLayout(config);
    const b = layout.bounds;
    const pad = 8;
    const view = `${b.minX - pad} ${b.minY - pad} ${b.width + pad * 2} ${b.height + pad * 2}`;
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="${num((b.width + pad * 2) * global.GA001_SPEC.mmPerSourceUnit)}mm" height="${num((b.height + pad * 2) * global.GA001_SPEC.mmPerSourceUnit)}mm">` +
      `<g id="layer-bleed" fill="none" stroke="#0055ff" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"><path d="${esc(layout.bleedPath)}"/></g>` +
      `<g id="layer-fold" fill="none" stroke="#1d6fe8" stroke-width="0.45" stroke-dasharray="2.5 2">${layout.foldLines.map((line) => `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"/>`).join('')}</g>` +
      `<g id="layer-cut" fill="none" stroke="#cc0000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round">${layout.cutPaths.map((d) => `<path d="${esc(d)}"/>`).join('')}</g></svg>`;
  };

  function flattenPath(d) {
    const tokens = d.match(/[A-Za-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi) || [];
    const points = [];
    let index = 0;
    let command = '';
    let current = { x: 0, y: 0 };
    let start = null;
    let lastControl = null;
    const read = () => Number(tokens[index++]);
    const isCommand = (value) => /[A-Za-z]/.test(value || '');
    const push = (point) => { current = point; points.push(point); };
    const cubic = (p0, p1, p2, p3, t) => {
      const m = 1 - t;
      return {
        x: m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x,
        y: m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y
      };
    };
    const quadratic = (p0, p1, p2, t) => {
      const m = 1 - t;
      return { x: m * m * p0.x + 2 * m * t * p1.x + t * t * p2.x, y: m * m * p0.y + 2 * m * t * p1.y + t * t * p2.y };
    };
    while (index < tokens.length) {
      if (isCommand(tokens[index])) command = tokens[index++];
      const upper = command.toUpperCase();
      if (upper === 'Z') { if (start) push({ x: start.x, y: start.y }); command = ''; lastControl = null; continue; }
      if (upper === 'M' || upper === 'L') {
        const point = { x: read(), y: read() };
        push(point); lastControl = null;
        if (upper === 'M') { start = point; command = 'L'; }
      } else if (upper === 'C' || upper === 'S') {
        const from = current;
        const c1 = upper === 'S'
          ? (lastControl ? { x: 2 * from.x - lastControl.x, y: 2 * from.y - lastControl.y } : { x: from.x, y: from.y })
          : { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const to = { x: read(), y: read() };
        for (let step = 1; step <= 24; step += 1) push(cubic(from, c1, c2, to, step / 24));
        lastControl = c2;
      } else if (upper === 'Q' || upper === 'T') {
        const from = current;
        const control = upper === 'T'
          ? (lastControl ? { x: 2 * from.x - lastControl.x, y: 2 * from.y - lastControl.y } : { x: from.x, y: from.y })
          : { x: read(), y: read() };
        const to = { x: read(), y: read() };
        for (let step = 1; step <= 20; step += 1) push(quadratic(from, control, to, step / 20));
        lastControl = control;
      } else throw new Error('Unsupported GA001 DXF path command: ' + command);
    }
    return points;
  }

  global.GA001_buildDXF = function GA001_buildDXF(config) {
    const layout = global.GA001_getLayout(config);
    const scale = global.GA001_SPEC.mmPerSourceUnit;
    const rows = global.PacVuDXFR12.createRows(['CUT', 'FOLD', 'BLEED']);
    const addLine = (a, b, layer) => rows.push(
      '0', 'LINE', '8', layer,
      '10', String(num(a.x * scale)), '20', String(num(-a.y * scale)), '30', '0',
      '11', String(num(b.x * scale)), '21', String(num(-b.y * scale)), '31', '0'
    );
    const addPath = (d, layer) => {
      const points = flattenPath(d);
      for (let index = 1; index < points.length; index += 1) addLine(points[index - 1], points[index], layer);
    };
    layout.cutPaths.forEach((path) => addPath(path, 'CUT'));
    layout.foldLines.forEach((line) => addLine({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }, 'FOLD'));
    addPath(layout.bleedPath, 'BLEED');
    return global.PacVuDXFR12.finish(rows);
  };
})(window);
