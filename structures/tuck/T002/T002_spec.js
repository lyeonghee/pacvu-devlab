// ============================================================
// T002_spec.js - B-Type Bottle Box source-SVG geometry
// Base source: T002_126x81x308_(cutpath, bleedpath, foldingline).svg
// ============================================================

const T002_EXPORT_META = Object.freeze({
  code: 'T002',
  name: 'B-Type Bottle Box',
  subtitle: 'Production-ready dieline information',
  material: 'TBD',
  dimensionBasis: 'Internal / External / Manufacturing',
  options: Object.freeze(['Bleed 3 mm', 'Glue flap', 'Bottom Lock Bend D × 50%']),
  status: 'DIELINE SETUP'
});

function T002_getSpec(input) {
  const W = Number(input && input.W) || 126;
  const D = Number(input && input.D) || 81;
  const H = Number(input && input.H) || 308;

  const base = {
    W: 126,
    D: 81,
    H: 308,
    unitToMm: 25.4 / 72,
    sourceBounds: {
      minX: 300,
      minY: 290,
      maxX: 1570,
      maxY: 1670
    }
  };

  return {
    W,
    D,
    H,
    base,
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    rules: Object.freeze({
      generationOrder: Object.freeze(['cutPath', 'foldLine', 'bleedPath']),
      bottomLockBend: D * 0.5,
      bleedOffset: 3,
      thumbNotch: false
    }),
    exportMeta: T002_EXPORT_META
  };
}

if (window.PacVuExportHeader) {
  window.PacVuExportHeader.register('T002', context => {
    const spec = T002_getSpec(context.cfg || {});
    const layout = typeof T002_getLayout === 'function' ? T002_getLayout(spec.W, spec.D, spec.H) : null;
    return {
      name: spec.exportMeta.name,
      subtitle: spec.exportMeta.subtitle,
      material: spec.exportMeta.material,
      dimensionBasis: spec.exportMeta.dimensionBasis,
      dielineSize: layout ? layout.dielineBounds : null,
      bleedSize: layout ? layout.bleedBounds : null,
      options: spec.exportMeta.options.slice(),
      status: spec.exportMeta.status
    };
  });
}
