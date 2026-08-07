// ============================================================
// T004_spec.js - T002/T003 bottom lock + T001 top PacVu contract
// ============================================================

const T004_EXPORT_META = Object.freeze({
  code: 'T004',
  name: 'B-Type Auto-Lock Tuck Box',
  subtitle: 'Production-ready dieline information',
  material: 'TBD',
  dimensionBasis: 'Internal / External / Manufacturing',
  options: Object.freeze(['Bleed 3 mm', 'Glue flap', 'Bottom Lock Bend D × 50%', 'Standard tuck top']),
  status: '2D + 3D MASTER'
});

function T004_getSpec(input) {
  const W = Number(input && input.W) || 130;
  const D = Number(input && input.D) || 65;
  const H = Number(input && input.H) || 190;
  return {
    W, D, H,
    base: Object.freeze({
      W: 130, D: 65, H: 190,
      unitToMm: 25.4 / 72,
      sourceBounds: Object.freeze({ minX: 256.011, minY: 217.98, maxX: 1416.232, maxY: 1132.153 })
    }),
    transform: Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    rules: Object.freeze({
      generationOrder: Object.freeze(['cutPath', 'foldLine', 'bleedPath']),
      glueWidth: Math.min(25, D * (25 / 81)),
      bottomLockBend: D * 0.5,
      bleedOffset: 3,
      topLogic: 'T001 standard tuck'
    }),
    exportMeta: T004_EXPORT_META
  };
}

if (window.PacVuExportHeader) {
  window.PacVuExportHeader.register('T004', context => {
    const spec = T004_getSpec(context.cfg || {});
    const layout = typeof T004_getLayout === 'function' ? T004_getLayout(spec.W, spec.D, spec.H) : null;
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
