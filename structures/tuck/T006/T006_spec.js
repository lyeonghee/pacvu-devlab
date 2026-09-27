// T006_spec.js - T006 source geometry and template specification.
// W100 x D40 x H220 mm source; fold and cut elements remain separate.
const T006_EXPORT_META = Object.freeze({ code: "T006", name: "Tear-Open Tuck Box", options: Object.freeze(["Bleed 3 mm", "Glue tab", "Tear-Open"]), status: "CUT + FOLD REVIEW" });
function T006_getSpec(input = {}) {
  const W = Number(input.W ?? 100), D = Number(input.D ?? 40), H = Number(input.H ?? 220);
  return { W, D, H, base: Object.freeze({ W: 100, D: 40, H: 220, unitToMm: 25.4 / 72 }), exportMeta: T006_EXPORT_META };
}
const T006_SOURCE_CUT_ELEMENTS = Object.freeze([
  "\u003cpath d=\"M149.063,703.179h0c1.504,0,2.725,1.221,2.725,2.725v141.952c0,1.504-1.221,2.725-2.725,2.725h0c-1.505,0-2.726-1.221-2.726-2.726v-141.95c0-1.505,1.221-2.726,2.726-2.726Z\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"872.916 460.962 872.916 346.596 841.026 346.596 841.026 353.245\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M869.373,346.596l-.416-14.754c-.455-16.123-21.742-29.054-47.828-29.054h-179.891c-26.085,0-47.373,12.931-47.828,29.054l-.416,14.754\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"621.34 353.245 621.34 346.596 589.45 346.596 589.45 460.962\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M582.913,461.14c.092,1.841,1.58,3.284,3.352,3.222,1.772-.048,3.185-1.557,3.185-3.401\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"582.913 461.14 579.423 391.796 504.54 391.796\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"495.95\" y1=\"399.292\" x2=\"489.147\" y2=\"439.419\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M495.95,399.292c.734-4.334,4.358-7.496,8.589-7.496\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"480.053\" y1=\"464.235\" x2=\"192.597\" y2=\"464.235\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"489.147 439.419 480.053 448.49 480.053 464.364\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"504.327 1160.295 579.211 1160.295 582.701 1090.951\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"488.934\" y1=\"1112.672\" x2=\"495.737\" y2=\"1152.799\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M504.327,1160.295c-4.232,0-7.855-3.162-8.589-7.496\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"479.84 1087.727 479.84 1103.602 488.934 1112.672\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"78.932\" y1=\"465.066\" x2=\"80.372\" y2=\"1087.727\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"168.11 390.887 93.227 390.887 89.737 460.23 79.211 465.066\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"183.503\" y1=\"438.509\" x2=\"176.7\" y2=\"398.383\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M168.111,390.887c4.232,0,7.855,3.162,8.589,7.496\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"192.597 463.454 192.597 447.58 183.503 438.509\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"80.547 1087.727 90.948 1092.564 94.397 1161.907 168.399 1161.907\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"176.887\" y1=\"1154.411\" x2=\"183.61\" y2=\"1114.284\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M176.887,1154.411c-.726,4.334-4.306,7.496-8.488,7.496\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"183.61 1114.284 192.597 1105.214 192.597 1087.857\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"840.814 1198.847 840.814 1205.495 872.704 1205.495 872.704 1087.99\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M592.782,1205.495l.416,14.754c.455,16.123,21.743,29.054,47.828,29.054h179.891c26.085,0,47.373-12.931,47.828-29.054l.416-14.754\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpolyline points=\"589.238 1091.129 589.238 1205.495 621.128 1205.495 621.128 1198.847\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M589.238,1091.13c0-1.844-1.413-3.353-3.185-3.401-1.772-.062-3.259,1.382-3.352,3.222\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"479.84\" y1=\"1087.857\" x2=\"192.597\" y2=\"1087.857\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M872.916,1087.99h99.213c7.828,0,14.173-6.346,14.173-14.173v-220.694l-17.535-13.752\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M872.916,460.962h99.213c7.828,0,14.173,6.346,14.173,14.173v224.145l-17.324,13.986\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M944.612,847.745l26.357-9.138c9.128-3.165,15.248-11.765,15.248-21.426v-81.334c0-9.55-5.983-18.077-14.964-21.325l-26.641-9.636\" fill=\"none\" stroke=\"#c00\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e"
]);

// Fold lines from the source drawing, excluding the legend sample.
const T006_SOURCE_FOLD_ELEMENTS = Object.freeze([
  "\u003cpolyline points=\"190.777 464.364 178.114 464.364 77.391 464.364\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"586.179\" y1=\"464.364\" x2=\"480.425\" y2=\"464.364\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cpolyline points=\"190.169 1087.884 177.506 1087.884 76.784 1087.884\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"872.916\" y1=\"460.962\" x2=\"872.916\" y2=\"1085.102\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"589.45\" y1=\"460.962\" x2=\"589.238\" y2=\"1087.727\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"478.583\" y1=\"464.364\" x2=\"478.583\" y2=\"1085.102\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"193.417\" y1=\"464.364\" x2=\"193.417\" y2=\"1087.99\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"872.916\" y1=\"463.232\" x2=\"589.45\" y2=\"463.232\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"841.026\" y1=\"350.977\" x2=\"621.34\" y2=\"350.977\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"866.543\" y1=\"1086.854\" x2=\"589.238\" y2=\"1086.592\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"581.18\" y1=\"1087.99\" x2=\"479.84\" y2=\"1087.99\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e",
  "\u003cline x1=\"621.128\" y1=\"1201.114\" x2=\"840.814\" y2=\"1201.114\" fill=\"none\" stroke=\"#1d6fe8\" stroke-dasharray=\"7.087 5.669\" stroke-miterlimit=\"11.339\" /\u003e"
]);

// Source bleed outline. Keep separate from foldLine and cutPath.
const T006_SOURCE_BLEED_ELEMENT = "\u003cpath d=\"M995.491,699.267v-224.146c0-12.504-10.173-22.677-22.677-22.677h-90.709v-105.862c0-2.93-1.483-5.514-3.739-7.044l-.224-7.951c-.591-20.926-25.333-37.317-56.328-37.317h-179.892c-30.996,0-55.738,16.392-56.328,37.317l-.225,7.951c-2.255,1.529-3.738,4.113-3.738,7.043v36.838c-.495-.09-1.003-.142-1.523-.142h-74.884c-8.384,0-15.506,6.103-16.962,14.52-.003.02-.01.038-.013.058l-6.349,37.447-7.169,7.151c-1.6,1.596-2.498,3.762-2.498,6.021v7.37H201.786v-8.28c0-2.259-.899-4.426-2.498-6.021l-7.169-7.151-6.349-37.448c-.002-.01-.005-.019-.006-.029-1.444-8.432-8.574-14.549-16.968-14.549h-74.884c-4.53,0-8.266,3.552-8.493,8.076l-3.231,64.196-4.84,2.224c-3.6.996-6.243,4.292-6.234,8.207l1.439,623.625c.011,4.69,3.815,8.484,8.503,8.484h.021c.106,0,.21-.013.315-.017l2.004.932,3.194,64.219c.225,4.526,3.961,8.081,8.493,8.081h74.002c8.362,0,15.459-6.139,16.875-14.596,0-.005,0-.01.002-.016l6.275-37.448,7.087-7.154c1.578-1.592,2.463-3.743,2.463-5.984v-8.982h270.235v7.371c0,2.259.899,4.426,2.498,6.021l7.169,7.151,6.349,37.448c.007.04.018.079.026.119,1.479,8.384,8.585,14.459,16.948,14.459h74.884c.52,0,1.028-.052,1.523-.142v36.839c0,2.93,1.483,5.514,3.739,7.044l.224,7.95c.591,20.926,25.334,37.318,56.329,37.318h179.891c30.996,0,55.738-16.393,56.328-37.318l.225-7.949c2.256-1.529,3.739-4.113,3.739-7.044v-109.002h90.921c12.504,0,22.677-10.173,22.677-22.677v-220.694c0-2.612-1.2-5.079-3.256-6.691l-7.432-5.829c6.597-5.803,10.603-14.27,10.603-23.421v-81.334c0-9.242-4.137-17.82-10.894-23.639l7.817-6.311c2-1.615,3.162-4.047,3.162-6.617v.002Z\" fill=\"none\" stroke=\"#1d6fe8\" stroke-miterlimit=\"11.339\" /\u003e";
// Four production tear-open punch paths; the hatch marks below are Preview only.
const T006_SOURCE_PUNCH_ELEMENTS = Object.freeze([
  "\u003cline x1=\"873.745\" y1=\"964.49\" x2=\"589.45\" y2=\"966.381\" fill=\"none\" stroke=\"#337f0a\" stroke-dasharray=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M944.612,848.978v77.894c0,20.776-16.842,37.618-37.618,37.618h-33.248\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"589.45\" y1=\"583.704\" x2=\"872.916\" y2=\"585.268\" fill=\"none\" stroke=\"#337f0a\" stroke-dasharray=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cpath d=\"M872.129,585.268h31.291c23.473,0,41.191,17.718,41.191,39.575v78.016c0,.203-.032.405-.094.598h0c-.406,1.263.537,2.556,1.864,2.556\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e"
]);
const T006_PREVIEW_HATCH_ELEMENTS = Object.freeze([
  "\u003cline x1=\"931.452\" y1=\"697.767\" x2=\"944.612\" y2=\"686.29\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"931.452\" y1=\"677.479\" x2=\"944.612\" y2=\"666.002\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"931.365\" y1=\"659.632\" x2=\"944.525\" y2=\"648.155\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"931.365\" y1=\"641.401\" x2=\"944.525\" y2=\"629.924\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"929.609\" y1=\"623.907\" x2=\"942.769\" y2=\"612.43\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"919.023\" y1=\"607.932\" x2=\"932.183\" y2=\"596.455\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"902.675\" y1=\"599.241\" x2=\"915.835\" y2=\"587.764\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"881.895\" y1=\"597.12\" x2=\"895.055\" y2=\"585.643\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"931.415\" y1=\"852.848\" x2=\"944.389\" y2=\"864.534\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"931.09\" y1=\"873.133\" x2=\"944.064\" y2=\"884.819\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"930.717\" y1=\"890.977\" x2=\"943.691\" y2=\"902.663\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"930.425\" y1=\"909.205\" x2=\"943.399\" y2=\"920.891\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"928.388\" y1=\"926.669\" x2=\"941.363\" y2=\"938.355\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"917.548\" y1=\"942.472\" x2=\"930.522\" y2=\"954.158\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"901.063\" y1=\"950.9\" x2=\"914.037\" y2=\"962.587\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e",
  "\u003cline x1=\"880.251\" y1=\"952.687\" x2=\"893.226\" y2=\"964.374\" fill=\"none\" stroke=\"#1d7005\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /\u003e"
]);


