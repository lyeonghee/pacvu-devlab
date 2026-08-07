// ============================================================
// TR003_spec.js - TR003 Tray Box
// Reference/target assembled size: W 317.5 / D 496.8875 / H 133.35
// Geometry is generated parametrically in millimeters.
// ============================================================

function TR003_getSpec(W, D, H) {
  const bleed = 3;
  const bounds = {
    minX: -bleed,
    minY: -bleed,
    maxX: W + 2 * H + bleed,
    maxY: D + 2 * H + bleed
  };
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;

  return {
    W,
    D,
    H,
    bleed,
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    bounds
  };
}
