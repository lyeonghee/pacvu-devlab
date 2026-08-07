(function(root) {
  'use strict';

  const num = value => Number(Number(value).toFixed(4));

  function formatLength(value) {
    const units = root.PacVuUnits;
    return units ? units.formatLength(value) : `${num(value)} mm`;
  }

  function getDisplayMetrics(layout) {
    if (!layout) return null;
    return {
      dielineBounds: layout.dielineBounds || layout.bounds,
      bleedBounds: layout.bleedBounds || layout.dielineBounds || layout.bounds
    };
  }

  function buildOverallDimensionLayer(layout) {
    const metrics = getDisplayMetrics(layout);
    if (!metrics) return '';
    const bounds = metrics.dielineBounds;
    const offset = 24;
    const guideHalf = 5;
    const arrowY = bounds.minY - offset;
    const arrowX = bounds.maxX + offset;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    return '  <g id="layer-overall-dimensions">' +
      '<line class="overall-ext" x1="' + num(bounds.minX) + '" y1="' + num(arrowY - guideHalf) + '" x2="' + num(bounds.minX) + '" y2="' + num(arrowY + guideHalf) + '"/>' +
      '<line class="overall-ext" x1="' + num(bounds.maxX) + '" y1="' + num(arrowY - guideHalf) + '" x2="' + num(bounds.maxX) + '" y2="' + num(arrowY + guideHalf) + '"/>' +
      '<line class="overall-dim" x1="' + num(bounds.minX) + '" y1="' + num(arrowY) + '" x2="' + num(bounds.maxX) + '" y2="' + num(arrowY) + '" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim overall-text" data-overall-axis="horizontal" x="' + num(centerX) + '" y="' + num(arrowY - 2) + '" text-anchor="middle">' + formatLength(bounds.width) + '</text>' +
      '<line class="overall-ext" x1="' + num(arrowX - guideHalf) + '" y1="' + num(bounds.minY) + '" x2="' + num(arrowX + guideHalf) + '" y2="' + num(bounds.minY) + '"/>' +
      '<line class="overall-ext" x1="' + num(arrowX - guideHalf) + '" y1="' + num(bounds.maxY) + '" x2="' + num(arrowX + guideHalf) + '" y2="' + num(bounds.maxY) + '"/>' +
      '<line class="overall-dim" x1="' + num(arrowX) + '" y1="' + num(bounds.minY) + '" x2="' + num(arrowX) + '" y2="' + num(bounds.maxY) + '" marker-start="url(#arrow)" marker-end="url(#arrow)"/>' +
      '<text class="dim overall-text" data-overall-axis="vertical" x="' + num(arrowX + 6) + '" y="' + num(centerY) + '" transform="rotate(-90 ' + num(arrowX + 6) + ' ' + num(centerY) + ')" text-anchor="middle">' + formatLength(bounds.height) + '</text>' +
      '</g>\n';
  }

  root.PacVuCake2DVisualCommon = Object.freeze({
    getDisplayMetrics,
    buildOverallDimensionLayer
  });
})(typeof window !== 'undefined' ? window : globalThis);
