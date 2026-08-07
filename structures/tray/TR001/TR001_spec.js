// ============================================================
// TR001_spec.js - TR001 EB Tray Box
// Reference SVG base: W 282 / D 368 / H 140
// Geometry is generated parametrically in millimeters.
// ============================================================

function TR001_getSpec(W, D, H) {
  const lip = H * (60 / 140);
  const bleed = 3;
  const bounds = {
    minX: -bleed,
    minY: -bleed,
    maxX: W + 2 * H + bleed,
    maxY: D + 2 * H + 2 * lip + bleed
  };
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;

  return {
    W,
    D,
    H,
    lip,
    bleed,
    holeRadius: Math.max(4, Math.min(12.5, H * (12.5 / 140))),
    cornerRadius: Math.max(3, Math.min(9.5, H * (9.5 / 140))),
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    bounds
  };
}
