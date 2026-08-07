// M003_spec.js - Flat Glue Mailer Box
(function(root){
  'use strict';
  const M003_SPEC=Object.freeze({
    id:'M003',name:'Flat Glue Mailer Box',unit:'mm',
    reference:Object.freeze({W:205,D:205,H:65,file:'M003_gbox_flat_205x205x65mm.svg'}),
    defaults:Object.freeze({W:205,D:205,H:65,bleed:3}),
    limits:Object.freeze({W:20,D:20,H:10})
  });
  const finite=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
  function M003_normalizeConfig(input){
    input=input||{};const d=M003_SPEC.defaults;
    return Object.freeze({
      W:Math.max(M003_SPEC.limits.W,finite(input.W,d.W)),
      D:Math.max(M003_SPEC.limits.D,finite(input.D,d.D)),
      H:Math.max(M003_SPEC.limits.H,finite(input.H,d.H)),
      bleed:Math.max(0,finite(input.bleed,d.bleed))
    });
  }
  root.M003_SPEC=M003_SPEC;
  root.M003_normalizeConfig=M003_normalizeConfig;
})(typeof window!=='undefined'?window:globalThis);
