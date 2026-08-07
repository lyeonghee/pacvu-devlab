// ============================================================
// R002_layout.js - SVG-based layout for RSC Shipping Box 2
// The source paths are kept from the supplied SVG to protect the narrow
// flap gaps in the R002 experiment.
// ============================================================

function R002_getLayout(W, D, H) {
  var spec = R002_getSpec(W, D, H);

  var cutPaths = [
    'M5190.754,977.452l-9.922,9.921-14.173,471.968h-891.496l-14.177-475.025c-.12-3.867-3.324-6.924-7.193-6.864-3.869.06-6.976,3.216-6.976,7.086v474.803h-1204.726v-474.803c0-3.87-3.106-7.025-6.976-7.086-3.869-.06-7.073,2.997-7.193,6.864l-14.177,475.025h-892.914l-14.177-475.025c-.12-3.867-3.324-6.924-7.193-6.864-3.869.06-6.975,3.216-6.975,7.086v474.803H887.762v-481.89l-99.212-26.584',
    'M5190.754,977.452 L5190.754,685.484',
    'M788.549,950.868 L788.549,712.068',
    'M5190.754,685.484 L5180.832,675.563 L5166.659,203.594 L4275.163,203.594 L4260.986,678.618',
    'M4246.817,678.397c0,3.869,3.106,7.025,6.976,7.086,3.869.06,7.073-2.997,7.193-6.865',
    'M4246.817,678.397 L4246.817,203.594 L3042.092,203.594 L3042.092,678.397',
    'M3027.923,678.618c.121,3.868,3.324,6.925,7.193,6.865,3.869-.061,6.976-3.216,6.976-7.086',
    'M3027.923,678.618 L3013.746,203.594 L2120.832,203.594 L2106.655,678.618',
    'M2092.486,678.397c0,3.869,3.106,7.025,6.975,7.086,3.869.06,7.073-2.997,7.193-6.865',
    'M2092.486,678.397 L2092.486,203.594 L887.762,203.594 L887.762,685.484 L788.549,712.068'
  ];

  var bleedPathD = 'M5198.841,690.138l.07-2.605-.033-3.535-1.725-1.799-4.896-5.396-3.449-3.449-14.065-468.399-.264-8.732H877.841v483.984l.088,17.944.259,16.317-.318,42.475.037,72.709-.237,68.96.259,45.324-.088,42.059v483.984l856.319,3.597,337.813-2.504,22.446-.691,16.752-.403h885.925l18.645.253,16.431-.253,1131.946.403,87.885-.345,8.978-.173,4.53.115h908.971l14.328-477.132,5.258-5.258,2.827-3.078,1.956-2.248.029-1.81-.038-4.392v-285.923Z';

  var foldLines = [
    { id:'f-10', x1:4246.817, y1:984.539, x2:4246.817, y2:678.397 },
    { id:'f-7',  x1:3042.092, y1:984.539, x2:3042.092, y2:678.397 },
    { id:'f-4',  x1:2092.486, y1:984.539, x2:2092.486, y2:678.397 },
    { id:'f-2',  x1:887.762,  y1:977.452, x2:887.762,  y2:685.484 },
    { id:'f-12', x1:5190.754, y1:977.452, x2:4253.902, y2:977.452 },
    { id:'f-9',  x1:4246.817, y1:984.539, x2:3042.092, y2:984.539 },
    { id:'f-6',  x1:3035.005, y1:977.452, x2:2099.573, y2:977.452 },
    { id:'f-3',  x1:2092.486, y1:984.539, x2:887.762,  y2:984.539 },
    { id:'f-11', x1:5190.754, y1:685.484, x2:4253.902, y2:685.484 },
    { id:'f-8',  x1:4246.817, y1:678.397, x2:3042.092, y2:678.397 },
    { id:'f-5',  x1:3035.005, y1:685.484, x2:2099.573, y2:685.484 },
    { id:'f-1',  x1:2092.486, y1:678.397, x2:887.762,  y2:678.397 }
  ];

  function pt(x, y) {
    return {x:spec.mapX(x),y:spec.mapY(y)};
  }

  function box(name, x1, y1, x2, y2) {
    var p1 = pt(x1, y1);
    var p2 = pt(x2, y2);
    var minX = Math.min(p1.x, p2.x);
    var maxX = Math.max(p1.x, p2.x);
    var minY = Math.min(p1.y, p2.y);
    var maxY = Math.max(p1.y, p2.y);
    return {
      name: name,
      x1: minX,
      y1: minY,
      x2: maxX,
      y2: maxY,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  var transformedFoldLines = foldLines.map(function(line) {
    var p1 = pt(line.x1, line.y1);
    var p2 = pt(line.x2, line.y2);
    return { id:line.id, x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y };
  });
  var cutPathsMm=cutPaths.map(function(d){return window.PacVuShipping.mapPath(d,spec.mapX,spec.mapY);});
  var bleedPathDMm=window.PacVuShipping.mapPath(bleedPathD,spec.mapX,spec.mapY);

  var panelBoxes = {
    glue: box('Glue', 788.549, 685.484, 887.762, 977.452),
    front: box('front', 887.762, 678.397, 2092.486, 984.539),
    sideL: box('sideL', 2092.486, 678.397, 3042.092, 984.539),
    back: box('back', 3042.092, 678.397, 4246.817, 984.539),
    sideR: box('sideR', 4246.817, 685.484, 5190.754, 977.452),
    topFlapFront: box('topFlap-front', 887.762, 203.594, 2092.486, 678.397),
    topFlapSideL: box('topFlap-sideL', 2120.832, 203.594, 3013.746, 678.397),
    topFlapBack: box('topFlap-back', 3042.092, 203.594, 4246.817, 678.397),
    topFlapSideR: box('topFlap-sideR', 4275.163, 203.594, 5166.659, 685.484),
    botFlapFront: box('botFlap-front', 887.762, 984.539, 2092.486, 1459.341),
    botFlapSideL: box('botFlap-sideL', 2120.832, 984.539, 3013.746, 1459.341),
    botFlapBack: box('botFlap-back', 3042.092, 984.539, 4246.817, 1459.341),
    botFlapSideR: box('botFlap-sideR', 4275.163, 977.452, 5166.659, 1459.341)
  };

  var labels = Object.keys(panelBoxes).map(function(key) {
    var b = panelBoxes[key];
    return { name:b.name, cx:b.cx, cy:b.cy, box:b };
  });
  var dielineBounds={minX:spec.mapX(spec.base.sourceGlueL),minY:spec.yTop,maxX:spec.xSideRR,maxY:spec.yBot};
  dielineBounds.width=dielineBounds.maxX-dielineBounds.minX;dielineBounds.height=dielineBounds.maxY-dielineBounds.minY;

  return {
    cutPaths: cutPaths,
    cutPathsMm:cutPathsMm,
    bleedPathD: bleedPathD,
    bleedPathDMm:bleedPathDMm,
    foldLines: transformedFoldLines,
    labels: labels,
    panelBoxes: panelBoxes,
    panels: window.PacVuShipping.panels(panelBoxes, transformedFoldLines),
    bounds: spec.bounds,
    dielineBounds:dielineBounds,
    bleedBounds:spec.bounds,
    transform: spec.transform,
    spec: spec
  };
}
