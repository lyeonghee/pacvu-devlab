// ============================================================

const T001_EXPORT_META = Object.freeze({
  code: 'T001',
  name: 'Straight Tuck End Box',
  subtitle: 'Production-ready dieline information',
  material: 'SBS 350 gsm \u00B7 0.45 mm',
  dimensionBasis: 'Internal / External / Manufacturing',
  options: Object.freeze(['Bleed 3 mm', 'Glue flap', 'Dust flap']),
  status: 'READY'
});
// T001_spec.js - T001 structure constants and defaults
// Split from the current working T001 layout without geometry changes.
// ============================================================

const T001_SOURCE_ELEMENTS = {
  "cutElements": [
    "<polyline points=\"890.995 811.27 810.208 863.712 815.798 880.928\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M807.71,892.058c2.725,0,5.276-1.3,6.879-3.504,1.602-2.205,2.051-5.033,1.209-7.626\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"807.71 892.058 738.878 892.058 738.078 819.951 733.672 811.27 681.232 892.058 681.232 923.239\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M669.893,934.578c6.259,0,11.339-5.08,11.339-11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<line x1=\"669.893\" y1=\"934.578\" x2=\"635.877\" y2=\"934.578\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M624.538,923.239c0,6.259,5.08,11.339,11.339,11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"624.538 923.239 624.538 892.058 572.098 811.27 567.679 819.719 567.252 892.058 498.248 892.058\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M490.135,881.008c-.811,2.587-.346,5.395,1.259,7.579,1.604,2.186,4.144,3.471,6.854,3.471\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"490.135 881.008 495.562 863.712 410.523 811.27 405.351 819.156 405.468 934.578 372.255 934.578\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M358.081,923.239c0,6.259,6.252,11.759,14.173,11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"358.081 923.239 358.081 892.058 301.389 892.058 301.389 923.239\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M287.216,934.578c7.921.42,14.173-5.08,14.173-11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M890.995,811.27v-501.732l-7.087-7.086-3.788-72.284h-105.652c-6.409,0-12.031,4.314-13.69,10.505l-10.098,37.685-11.338,11.339v19.842h-60.945\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M627.373,309.538c1.527,12.936,12.486,22.678,25.512,22.678s23.984-9.742,25.512-22.678\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M627.373,309.538h-60.945v-19.842l-11.338-11.339-10.098-37.685c-1.659-6.19-7.281-10.505-13.69-10.505h-105.578l-3.87,73.997\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M410.523,303.869c0,3.072,2.449,5.587,5.521,5.667,3.071.08,5.648-2.303,5.809-5.371\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M287.216,934.578h-32.751v-114.746l-5.518-8.562-70.865-18.988v-463.755l70.865-18.989v-161.574l1.799-34.305c.907-17.317,15.212-30.893,32.554-30.893h92.871c17.341,0,31.646,13.575,32.554,30.893l1.798,34.305v155.905\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<line x1=\"296.234\" y1=\"928.909\" x2=\"300.415\" y2=\"955.799\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"677.166\" y1=\"931.086\" x2=\"693.693\" y2=\"952.707\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"814.385\" y1=\"889.985\" x2=\"831.822\" y2=\"910.878\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"363.236\" y1=\"930.842\" x2=\"359.055\" y2=\"957.733\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"626.317\" y1=\"929.43\" x2=\"612.246\" y2=\"952.723\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"491.144\" y1=\"888.003\" x2=\"475.697\" y2=\"910.408\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"541.876\" y1=\"234.463\" x2=\"555.65\" y2=\"228.51\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"10\" stroke-width=\".5\"/>",
    "<line x1=\"764.885\" y1=\"233.737\" x2=\"751.112\" y2=\"227.783\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"10\" stroke-width=\".5\"/>",
    "<line x1=\"243.462\" y1=\"309.538\" x2=\"121.212\" y2=\"309.538\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".75\"/>"
  ],
  "foldElements": [
    "<line x1=\"890.145\" y1=\"811.27\" x2=\"734.523\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"732.822\" y1=\"811.27\" x2=\"572.949\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"571.247\" y1=\"811.27\" x2=\"411.373\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"409.672\" y1=\"811.27\" x2=\"249.798\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"733.672\" y1=\"310.389\" x2=\"733.672\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"410.523\" y1=\"310.389\" x2=\"410.523\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"572.098\" y1=\"310.389\" x2=\"572.098\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"248.948\" y1=\"310.389\" x2=\"248.948\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"890.145\" y1=\"309.538\" x2=\"740.192\" y2=\"309.538\" fill=\"none\" stroke=\"#3b53a4\" stroke-dasharray=\"3\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"565.578\" y1=\"309.538\" x2=\"417.042\" y2=\"309.538\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"409.672\" y1=\"306.704\" x2=\"249.798\" y2=\"306.704\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"409.672\" y1=\"147.964\" x2=\"249.798\" y2=\"147.964\" fill=\"none\" stroke=\"#3b53a4\" stroke-dasharray=\"3\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"243.653\" y1=\"471.222\" x2=\"124.631\" y2=\"471.222\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3 3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>"
  ],
  "bleedElement": "<path d=\"M482.148,878.464c-1.613,5.146-.671,10.813,2.518,15.154,3.191,4.348,8.316,6.943,13.71,6.943l2.22.002v-.002h-2.22,73.85l-.694-73.59,1.417-1.165,43.214,68.769v28.663c0,10.942,8.901,19.844,19.843,19.844h34.016c10.941,0,19.843-8.901,19.843-19.844v-28.663l42.957-68.683.979.996v73.673h74.038c5.423,0,10.566-2.619,13.759-7.01,3.19-4.389,4.093-10.091,2.417-15.25h0l-3.575-11.01,75.314-48.89,3.874-2.769v-509.618l-7.27-7.268-4.04-77.083h-113.722c-10.245,0-19.252,6.912-21.904,16.808l-9.508,35.484-12.218,12.218v14.86h-52.441l-8.115.103-.331,7.403c-1.021,8.649-8.359,15.172-17.067,15.172s-16.045-6.522-17.066-15.171l-.233-7.216-8.212-.292h-52.441v-14.86l-12.217-12.219-9.508-35.484c-2.652-9.896-11.659-16.808-21.904-16.808h-112.275v-73.699l-1.81-34.75c-1.146-21.842-19.175-38.952-41.046-38.952h-92.871c-21.873,0-39.902,17.11-41.046,38.952l-1.811,34.527.16,179.37.844,127.423-.691,240.863-.446,120.984,8.637,6.914v119.786h38.269c10.941,0,19.842-8.901,19.842-19.844h0v-22.677h45.354v22.677c0,10.942,8.901,19.844,19.843,19.844h38.268v-119.786l1.259-1.259,73.686,45.44-3.446,10.984\" fill=\"none\" stroke=\"#263aed\" stroke-miterlimit=\"10\"/>"
};

const T001_BLEED_OFFSET = 3;

function T001_num(value) {
  return +(+value).toFixed(4);
}

function T001_getSpec(input) {
  const W = Number(input && input.W) || 57;
  const D = Number(input && input.D) || 57;
  const H = Number(input && input.H) || 177;
  const glueWidth = 15;

  const source = {
    unitToMm: 25.4 / 72,
    xGlueL: 178.082,
    xFrontL: 248.948,
    xFrontR: 410.523,
    xSideLR: 572.098,
    xBackR: 733.672,
    xSideRR: 890.995,
    yTop: 82.766,
    yLidFold: 147.964,
    yBodyTop: 309.538,
    yBodyBottom: 811.27,
    yBottomLockBend: 892.058,
    yBottomLockEnd: 934.578
  };

  const grid = {
    xGlueL: 0,
    xFrontL: glueWidth,
    xFrontR: glueWidth + W,
    xSideLR: glueWidth + W + D,
    xBackR: glueWidth + W + D + W,
    xSideRR: glueWidth + W + D + W + D,
    yTop: 0,
    yLidFold: D * (23 / 57),
    yBodyTop: D * (23 / 57) + D,
    yBodyBottom: D * (23 / 57) + D + H,
    yBottomLockBend: D * (23 / 57) + D + H + D * 0.5,
    yBottomLockEnd: D * (23 / 57) + D + H + D * (43.5 / 57)
  };
  grid.glueWidth = glueWidth;

  return { W, D, H, glueWidth, source, grid, exportMeta: T001_EXPORT_META };
}

function T001_hasThumbNotch(spec) {
  return spec.W < 100 && spec.D < 100;
}
if (window.PacVuExportHeader) {
  window.PacVuExportHeader.register('T001', context => {
    const spec = T001_getSpec(context.cfg || {});
    const layout = typeof T001_getLayout === 'function'
      ? T001_getLayout(spec.W, spec.D, spec.H)
      : null;
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
