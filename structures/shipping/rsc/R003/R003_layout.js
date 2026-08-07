// ============================================================
// R003_layout.js - SVG-based layout for RSC Shipping Box 3
// The source geometry is kept from the supplied R003 SVG.
// ============================================================

function R003_getLayout(W, D, H) {
  var spec = R003_getSpec(W, D, H);

  var cutPaths = [
    'M1839.416,499.955 L1839.416,173.971 L847.290,173.971 L847.290,499.955',
    'M847.273,499.971 L745.897,499.971 L745.897,1123.563 L847.273,1123.563',
    'M1839.357,499.955 L1839.357,173.971 L2491.326,173.971 L2491.326,499.955',
    'M847.290,1123.831 L847.290,1449.815 L1839.416,1449.815 L1839.416,1123.831',
    'M2491.326,1123.831 L2491.326,1449.815 L1839.357,1449.815 L1839.357,1123.831',
    'M4135.441,499.971 L4135.441,1123.563',
    'M3484.882,499.955 L3484.882,173.971 L2489.921,173.971',
    'M3483.477,173.971 L4135.445,173.971 L4135.445,499.955',
    'M2491.338,1123.831 L2491.338,1449.815 L3483.464,1449.815 L3483.464,1123.831',
    'M4135.445,1123.831 L4135.445,1449.815 L3483.477,1449.815 L3483.477,1123.831'
  ];

  var bleedPathD = 'M838.723,165.468 H4143.920 V1458.066 H838.723 Z';
  var glueFillPathD = 'M847.273,499.971 L745.897,499.971 L745.897,1123.563 L847.273,1123.563 Z';
  var panelFillPaths = [
    'M847.290,173.971 H1839.416 V1449.815 H847.290 Z',
    'M1839.357,173.971 H2491.326 V1449.815 H1839.357 Z',
    'M2491.338,173.971 H3483.464 V1449.815 H2491.338 Z',
    'M3483.477,173.971 H4135.445 V1449.815 H3483.477 Z'
  ];

  var foldLines = [
    { id:'f-2',  x1:847.290,  y1:499.956,  x2:847.290,  y2:1123.578 },
    { id:'f-4',  x1:1839.416, y1:499.956,  x2:1839.416, y2:1123.578 },
    { id:'f-7',  x1:2491.322, y1:499.971,  x2:2491.322, y2:1123.563 },
    { id:'f-10', x1:3483.481, y1:499.971,  x2:3483.481, y2:1123.563 },
    { id:'f-1',  x1:847.290,  y1:499.971,  x2:1839.416, y2:499.971 },
    { id:'f-3',  x1:847.290,  y1:1123.578, x2:1839.416, y2:1123.578 },
    { id:'f-5',  x1:1840.613, y1:499.759,  x2:2492.581, y2:500.759 },
    { id:'f-6',  x1:1839.357, y1:1123.831, x2:2491.326, y2:1123.831 },
    { id:'f-8',  x1:2491.322, y1:499.971,  x2:3483.481, y2:499.971 },
    { id:'f-9',  x1:2491.338, y1:1123.831, x2:3483.464, y2:1123.831 },
    { id:'f-11', x1:3483.481, y1:499.971,  x2:4135.441, y2:499.971 },
    { id:'f-12', x1:3483.481, y1:1123.563, x2:4135.441, y2:1123.563 }
  ];

  function pt(x, y) {
    return { x: spec.mapX(x), y: spec.mapY(y) };
  }

  function transformPathD(d) {
    var currentX = 0;
    var currentY = 0;
    var tokens = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+(?:e[-+]?\d+)?/ig) || [];
    var out = [];
    var i = 0;

    function isCommand(token) {
      return /^[MLHVZmlhvz]$/.test(token);
    }

    function n(value) {
      return (+value).toFixed(4).replace(/\.?0+$/, '');
    }

    while (i < tokens.length) {
      var cmd = tokens[i++];

      if (!isCommand(cmd)) {
        throw new Error('R003 path command expected near token: ' + cmd);
      }

      if (cmd === 'M' || cmd === 'L') {
        var isMove = cmd === 'M';
        while (i + 1 < tokens.length && !isCommand(tokens[i])) {
          currentX = parseFloat(tokens[i++]);
          currentY = parseFloat(tokens[i++]);
          var p = pt(currentX, currentY);
          out.push((isMove ? 'M' : 'L') + n(p.x) + ',' + n(p.y));
          isMove = false;
        }
      } else if (cmd === 'H') {
        while (i < tokens.length && !isCommand(tokens[i])) {
          currentX = parseFloat(tokens[i++]);
          out.push('L' + n(spec.mapX(currentX)) + ',' + n(spec.mapY(currentY)));
        }
      } else if (cmd === 'V') {
        while (i < tokens.length && !isCommand(tokens[i])) {
          currentY = parseFloat(tokens[i++]);
          out.push('L' + n(spec.mapX(currentX)) + ',' + n(spec.mapY(currentY)));
        }
      } else if (cmd === 'Z') {
        out.push('Z');
      } else {
        throw new Error('Unsupported R003 path command: ' + cmd);
      }
    }

    return out.join(' ');
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

  var panelBoxes = {
    glue: box('Glue', 745.897, 499.971, 847.273, 1123.563),
    front: box('front', 847.290, 499.971, 1839.416, 1123.578),
    sideL: box('sideL', 1839.357, 499.971, 2491.326, 1123.831),
    back: box('back', 2491.338, 499.971, 3483.464, 1123.831),
    sideR: box('sideR', 3483.481, 499.971, 4135.441, 1123.563),
    topFlapFront: box('topFlap-front', 847.290, 173.971, 1839.416, 499.955),
    topFlapSideL: box('topFlap-sideL', 1839.357, 173.971, 2491.326, 499.955),
    topFlapBack: box('topFlap-back', 2491.326, 173.971, 3484.882, 499.955),
    topFlapSideR: box('topFlap-sideR', 3483.477, 173.971, 4135.445, 499.955),
    botFlapFront: box('botFlap-front', 847.290, 1123.831, 1839.416, 1449.815),
    botFlapSideL: box('botFlap-sideL', 1839.357, 1123.831, 2491.326, 1449.815),
    botFlapBack: box('botFlap-back', 2491.338, 1123.831, 3483.464, 1449.815),
    botFlapSideR: box('botFlap-sideR', 3483.477, 1123.831, 4135.445, 1449.815)
  };

  var labels = Object.keys(panelBoxes).map(function(key) {
    var b = panelBoxes[key];
    return { name:b.name, cx:b.cx, cy:b.cy, box:b };
  });
  var dielineBounds={minX:spec.mapX(spec.base.sourceGlueL),minY:spec.yTop,maxX:spec.xSideRR,maxY:spec.yBot};
  dielineBounds.width=dielineBounds.maxX-dielineBounds.minX;dielineBounds.height=dielineBounds.maxY-dielineBounds.minY;

  return {
    cutPaths: cutPaths,
    cutPathsMm: cutPaths.map(transformPathD),
    bleedPathD: bleedPathD,
    bleedPathDMm: transformPathD(bleedPathD),
    glueFillPathD: glueFillPathD,
    glueFillPathDMm: transformPathD(glueFillPathD),
    panelFillPaths: panelFillPaths,
    panelFillPathsMm: panelFillPaths.map(transformPathD),
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
