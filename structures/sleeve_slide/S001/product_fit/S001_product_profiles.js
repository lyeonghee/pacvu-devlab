'use strict';

const S001_PRODUCT_PROFILES = Object.freeze({
  bottle210x45: Object.freeze({
    type: 'Bottle',
    cutProfile: 'bottle-standard-bounds',
    actual: Object.freeze({ width: 45, height: 210 }),
    cutAllowance: Object.freeze({ left: 5, right: 5, top: 0, bottom: 0 })
  }),
  jar123x54: Object.freeze({
    type: 'Jar',
    cutProfile: 'jar-standard-bounds',
    actual: Object.freeze({ width: 54, height: 123 }),
    cutAllowance: Object.freeze({ left: 0, right: 0, top: 0, bottom: 0 })
  })
});

function S001_resolveProductCut(profile) {
  const allowance = profile.cutAllowance;
  return {
    width: profile.actual.width + allowance.left + allowance.right,
    height: profile.actual.height + allowance.top + allowance.bottom
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { S001_PRODUCT_PROFILES, S001_resolveProductCut };
}
if (typeof window !== 'undefined') {
  window.S001_PRODUCT_PROFILES = S001_PRODUCT_PROFILES;
  window.S001_resolveProductCut = S001_resolveProductCut;
}
