// ============================================================
// T003_spec.js - E-Type Bottle Box / left PacVu Engine contract
// ============================================================

const T003_EXPORT_META = Object.freeze({
  code: 'T003',
  name: 'E-Type Bottle Box / Left',
  subtitle: 'Production-ready dieline information',
  material: 'TBD',
  dimensionBasis: 'Internal / External / Manufacturing',
  options: Object.freeze(['Bleed 3 mm', 'Glue flap', 'Bottom Lock Bend D × 50%', 'Inner bottle-neck hole']),
  status: '2D + 3D MASTER'
});

function T003_getSpec(input) {
  const W = Number(input && input.W) || 86.5;
  const D = Number(input && input.D) || 86.5;
  const H = Number(input && input.H) || 296;
  return {
    W, D, H,
    base: Object.freeze({
      W: 86.5, D: 86.5, H: 296,
      unitToMm: 25.4 / 72,
      sourceBounds: Object.freeze({ minX: 258.789, minY: 42.52, maxX: 1294.285, maxY: 1381.324 })
    }),
    transform: Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    rules: Object.freeze({
      generationOrder: Object.freeze(['cutPath', 'foldLine', 'bleedPath']),
      glueWidth: Math.min(25, D * (25 / 81)),
      bottomLockBend: D * 0.5,
      bleedOffset: 3,
      neckHolePanel: 'Inner',
      neckHoleSeminotch: false
    }),
    exportMeta: T003_EXPORT_META
  };
}

if (window.PacVuExportHeader) {
  window.PacVuExportHeader.register('T003', context => {
    const spec = T003_getSpec(context.cfg || {});
    const layout = typeof T003_getLayout === 'function' ? T003_getLayout(spec.W, spec.D, spec.H) : null;
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
