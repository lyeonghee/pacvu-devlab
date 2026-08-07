'use strict';

const S001_productProfilesApi = typeof require === 'function'
  ? require('./S001_product_profiles')
  : window;
const S001_productCutPathsApi = typeof require === 'function'
  ? require('./S001_product_cut_paths')
  : window;

function S001_instantiateProducts(requests) {
  return requests.flatMap(request => {
    const profile = S001_productProfilesApi.S001_PRODUCT_PROFILES[request.profileId];
    if (!profile) throw new Error('Unknown product profile: ' + request.profileId);
    const quantity = Math.max(0, Math.floor(Number(request.quantity) || 0));
    return Array.from({ length: quantity }, (_, offset) => {
      const instanceIndex = offset + 1;
      const cut = S001_productProfilesApi.S001_resolveProductCut(profile);
      return {
        instanceId: (request.instanceIdPrefix || profile.type.toLowerCase()) + '-' + instanceIndex,
        instanceIndex,
        profileId: request.profileId,
        productType: profile.type,
        actualBounds: { x: 0, y: 0, width: profile.actual.width, height: profile.actual.height },
        cutProfile: profile.cutProfile,
        cutBounds: { x: 0, y: 0, width: cut.width, height: cut.height },
        cutPath: S001_productCutPathsApi.S001_createLocalProductCutPath(profile.cutProfile),
        cutAllowance: { ...profile.cutAllowance },
        rotation: Number(request.rotation) || 0,
        placement: null
      };
    });
  });
}

if (typeof module !== 'undefined' && module.exports) module.exports = { S001_instantiateProducts };
if (typeof window !== 'undefined') window.S001_instantiateProducts = S001_instantiateProducts;
