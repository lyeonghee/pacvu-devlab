// ============================================================
// M001_spec.js - PacVu Master G Box
// Input contract and reference-derived design ratios only.
// Geometry is generated exclusively by M001_getLayout().
// ============================================================

(function (root) {
  'use strict';

  const M001_SPEC = Object.freeze({
    id: 'M001',
    name: 'G Box / Mailer Box',
    unit: 'mm',
    reference: Object.freeze({
      W: 235,
      D: 229,
      H: 91,
      origin: 'cutpath 1-2L start (0,0)',
      file: 'M001_gbox_235x229x91mm.svg'
    }),
    defaults: Object.freeze({
      W: 235,
      D: 229,
      H: 91,
      bleed: 3,
      foldGap: 2,
      holeEnabled: true,
      holeDiameter: 6,
      holeGap: 70,
      holeOffsetY: 45,
      lockThreshold: 120
    }),
    limits: Object.freeze({ W: 20, D: 20, H: 10 }),
    exportMeta: Object.freeze({
      name: 'Mailer Box',
      subtitle: 'M001 · G-style mailer structure',
      material: 'Paperboard',
      dimensionBasis: 'Front / Back = W · Base / Lid = D · Wall = H',
      options: Object.freeze(['String Hole', 'Side Lock']),
      status: 'READY'
    }),
    // Ratios measured from the supplied M001 reference.
    ratios: Object.freeze({
      lidFoldInset: 2 / 91,
      frontEdgeInset: 1.5 / 91,
      dustWidth: 75 / 91,
      dustShoulder: 0.766,
      dustRise: 0.663,
      lidFlapTipX: 78 / 91,
      lidFlapTipY: 20 / 91,
      insertReach: 77 / 91,
      cornerRadius: 2.37 / 91,
      insertRadius: 9.4 / 91,
      lockCenterOffset: 59 / 229,
      lockLength: 35 / 229,
      lockDepth: 5 / 91,
      lockShoulder: 5 / 91,
      slotWidth: 5 / 91,
      slotLength: 35 / 229
    })
  });

  function finite(value, fallback) {
    value = Number(value);
    return Number.isFinite(value) ? value : fallback;
  }

  function M001_normalizeConfig(input) {
    input = input || {};
    const d = M001_SPEC.defaults;
    const cfg = {
      W: Math.max(M001_SPEC.limits.W, finite(input.W, d.W)),
      D: Math.max(M001_SPEC.limits.D, finite(input.D, d.D)),
      H: Math.max(M001_SPEC.limits.H, finite(input.H, d.H)),
      bleed: Math.max(0, finite(input.bleed, d.bleed)),
      foldGap: Math.max(0, finite(input.foldGap, d.foldGap)),
      holeEnabled: input.holeEnabled !== false && input.stringHoleEnabled !== false,
      holeDiameter: Math.max(0, finite(input.holeDiameter ?? input.holeDia, d.holeDiameter)),
      holeGap: Math.max(0, finite(input.holeGap, d.holeGap)),
      holeOffsetY: finite(input.holeOffsetY, d.holeOffsetY),
      lockThreshold: Math.max(0, finite(input.lockThreshold, d.lockThreshold))
    };
    cfg.lockCount = cfg.D <= cfg.lockThreshold ? 1 : 2;
    return Object.freeze(cfg);
  }

  root.M001_SPEC = M001_SPEC;
  root.M001_normalizeConfig = M001_normalizeConfig;

  if (root.PacVuExportHeader) {
    root.PacVuExportHeader.register('M001', context => {
      const cfg = M001_normalizeConfig(context.cfg || {});
      const layout = typeof root.M001_getLayout === 'function' ? root.M001_getLayout(cfg) : null;
      const meta = M001_SPEC.exportMeta;
      return {
        name: meta.name,
        subtitle: meta.subtitle,
        material: meta.material,
        dimensionBasis: meta.dimensionBasis,
        dielineSize: layout ? layout.dielineBounds : null,
        bleedSize: layout ? layout.bleedBounds : null,
        options: meta.options.slice(),
        status: meta.status
      };
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
