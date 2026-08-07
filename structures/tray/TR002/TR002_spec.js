// ============================================================
// TR002_spec.js - TR002 EB Tray Box
// Reference SVG base: W 200 / D 280 / H 100
// Geometry is generated parametrically in millimeters.
// ============================================================

function TR002_getSpec(W, D, H) {
  const dustFlap = H * (50 / 100);
  const insertPanel = H * (50 / 100);
  const bleed = 3;
  const bounds = {
    minX: -bleed,
    minY: -bleed,
    maxX: W + 2 * H + bleed,
    maxY: D + 2 * H + 2 * dustFlap + bleed
  };
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;

  return {
    W,
    D,
    H,
    dustFlap,
    insertPanel,
    bleed,
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    bounds
  };
}
