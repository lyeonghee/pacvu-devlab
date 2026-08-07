(function (global) {
  'use strict';

  const SOURCE_UNITS_PER_MM = 72 / 25.4;

  global.GA001_SPEC = Object.freeze({
    code: 'GA001',
    name: 'Gable Lock Box',
    defaultDims: Object.freeze({ W: 241, D: 127, H: 127 }),
    minDims: Object.freeze({ W: 121, D: 121 }),
    defaultHandleHole: Object.freeze({ width: 80, height: 25 }),
    sourceUnitsPerMm: SOURCE_UNITS_PER_MM,
    mmPerSourceUnit: 1 / SOURCE_UNITS_PER_MM,
    sourceViewBox: Object.freeze({ minX: 0, minY: 150, width: 2224.063, height: 1000 })
  });

  global.GA001_getConfig = function GA001_getConfig(input) {
    const defaults = global.GA001_SPEC.defaultDims;
    const handleDefaults = global.GA001_SPEC.defaultHandleHole;
    const rawW = Number.isFinite(Number(input && input.W)) ? Number(input.W) : defaults.W;
    const rawD = Number.isFinite(Number(input && input.D)) ? Number(input.D) : defaults.D;
    const rawHandleWidth = Number(input && input.handleHoleWidth);
    const rawHandleHeight = Number(input && input.handleHoleHeight);
    return {
      W: Math.max(global.GA001_SPEC.minDims.W, rawW),
      D: Math.max(global.GA001_SPEC.minDims.D, rawD),
      H: Number.isFinite(Number(input && input.H)) ? Number(input.H) : defaults.H,
      handleHoleWidth: Number.isFinite(rawHandleWidth) && rawHandleWidth > 0 ? rawHandleWidth : handleDefaults.width,
      handleHoleHeight: Number.isFinite(rawHandleHeight) && rawHandleHeight > 0 ? rawHandleHeight : handleDefaults.height
    };
  };
})(window);
