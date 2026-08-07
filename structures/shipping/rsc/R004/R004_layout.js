// ============================================================
// R004_layout.js - SVG-based layout for RSC Shipping Box 4
// R004 follows R003 style, with fixed 75x25mm handle cut paths on side panels.
// ============================================================

function R004_getLayout(W, D, H, options) {
  var spec = R004_getSpec(W, D, H);
  var handle = {
    width: Math.min(Number(options && options.handleHoleWidth) || spec.handle.width, Math.max(10, D - 20)),
    height: Math.min(Number(options && options.handleHoleHeight) || spec.handle.height, Math.max(8, H - 20)),
    radius: Math.min(
      spec.handle.radius,
      (Number(options && options.handleHoleWidth) || spec.handle.width) / 2,
      (Number(options && options.handleHoleHeight) || spec.handle.height) / 2
    )
  };

  var cutPaths = [
    'M1399.168,558.296 V246.5 H605.467 V558.296',
    'M605.45,558.311 H504.074 V1096.662 H605.45',
    'M1399.121,558.296 V246.5 H2022.790 V558.296',
    'M605.467,1096.894 V1408.705 H1399.168 V1096.894',
    'M2022.790,1096.894 V1408.705 H1399.121 V1096.894',
    'M3440.113,558.311 V1096.662',
    'M2817.847,558.296 V246.5 H2021.446',
    'M2816.503,246.5 H3440.117 V558.296',
    'M2022.8,1096.894 V1408.705 H2816.491 V1096.894',
    'M3440.117,1096.894 V1408.705 H2816.503 V1096.894'
  ];

  var bleedPathD = 'M596.963,237.996 H3448.617 V1417.209 H596.963 Z';
  var glueFillPathD = 'M605.45,558.311 H504.074 V1096.662 H605.45 Z';
  var panelFillPaths = [
    'M605.467,246.5 H1399.168 V1408.705 H605.467 Z',
    'M1399.121,246.5 H2022.790 V1408.705 H1399.121 Z',
    'M2022.8,246.5 H2816.491 V1408.705 H2022.8 Z',
    'M2816.503,246.5 H3440.117 V1408.705 H2816.503 Z'
  ];

  var foldLines = [
    { id:'f-2',  x1:605.467,  y1:558.297,  x2:605.467,  y2:1096.675 },
    { id:'f-4',  x1:1399.168, y1:558.297,  x2:1399.168, y2:1096.675 },
    { id:'f-7',  x1:2022.786, y1:558.311,  x2:2022.786, y2:1096.662 },
    { id:'f-10', x1:2816.507, y1:558.311,  x2:2816.507, y2:1096.662 },
    { id:'f-1',  x1:605.467,  y1:558.311,  x2:1399.168, y2:558.311 },
    { id:'f-3',  x1:605.467,  y1:1096.675, x2:1399.168, y2:1096.675 },
    { id:'f-5',  x1:1400.313, y1:558.108,  x2:2023.794, y2:558.991 },
    { id:'f-6',  x1:1399.121, y1:1096.894, x2:2022.790, y2:1096.894 },
    { id:'f-8',  x1:2022.786, y1:558.311,  x2:2816.507, y2:558.311 },
    { id:'f-9',  x1:2022.8,   y1:1096.894, x2:2816.491, y2:1096.894 },
    { id:'f-11', x1:2816.507, y1:558.311,  x2:3440.113, y2:558.311 },
    { id:'f-12', x1:2816.507, y1:1096.662, x2:3440.113, y2:1096.662 }
  ];

  function pt(x, y) {
    return { x: spec.mapX(x), y: spec.mapY(y) };
  }

  function n(value) {
    return (+value).toFixed(4).replace(/\.?0+$/, '');
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

    while (i < tokens.length) {
      var cmd = tokens[i++];

      if (!isCommand(cmd)) {
        throw new Error('R004 path command expected near token: ' + cmd);
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
        throw new Error('Unsupported R004 path command: ' + cmd);
      }
    }

    return out.join(' ');
  }

  function roundedRectPath(cx, cy, width, height, radius) {
    var x1 = cx - width / 2;
    var x2 = cx + width / 2;
    var y1 = cy - height / 2;
    var y2 = cy + height / 2;
    var r = Math.min(radius, width / 2, height / 2);
    return [
      'M' + n(x1 + r) + ',' + n(y1),
      'H' + n(x2 - r),
      'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + n(x2) + ',' + n(y1 + r),
      'V' + n(y2 - r),
      'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + n(x2 - r) + ',' + n(y2),
      'H' + n(x1 + r),
      'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + n(x1) + ',' + n(y2 - r),
      'V' + n(y1 + r),
      'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + n(x1 + r) + ',' + n(y1),
      'Z'
    ].join(' ');
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
    glue: box('Glue', 504.074, 558.311, 605.45, 1096.662),
    front: box('front', 605.467, 558.311, 1399.168, 1096.675),
    sideL: box('sideL', 1399.121, 558.311, 2022.790, 1096.894),
    back: box('back', 2022.8, 558.311, 2816.491, 1096.894),
    sideR: box('sideR', 2816.507, 558.311, 3440.113, 1096.662),
    topFlapFront: box('topFlap-front', 605.467, 246.5, 1399.168, 558.296),
    topFlapSideL: box('topFlap-sideL', 1399.121, 246.5, 2022.790, 558.296),
    topFlapBack: box('topFlap-back', 2021.446, 246.5, 2817.847, 558.296),
    topFlapSideR: box('topFlap-sideR', 2816.503, 246.5, 3440.117, 558.296),
    botFlapFront: box('botFlap-front', 605.467, 1096.894, 1399.168, 1408.705),
    botFlapSideL: box('botFlap-sideL', 1399.121, 1096.894, 2022.790, 1408.705),
    botFlapBack: box('botFlap-back', 2022.8, 1096.894, 2816.491, 1408.705),
    botFlapSideR: box('botFlap-sideR', 2816.503, 1096.894, 3440.117, 1408.705)
  };

  var handleCutPaths = [
    roundedRectPath(panelBoxes.sideL.cx, panelBoxes.sideL.cy, handle.width, handle.height, handle.radius),
    roundedRectPath(panelBoxes.sideR.cx, panelBoxes.sideR.cy, handle.width, handle.height, handle.radius)
  ];

  var labels = Object.keys(panelBoxes).map(function(key) {
    var b = panelBoxes[key];
    return { name:b.name, cx:b.cx, cy:b.cy, box:b };
  });
  var dielineBounds={minX:spec.mapX(spec.base.sourceGlueL),minY:spec.yTop,maxX:spec.xSideRR,maxY:spec.yBot};
  dielineBounds.width=dielineBounds.maxX-dielineBounds.minX;dielineBounds.height=dielineBounds.maxY-dielineBounds.minY;

  return {
    cutPaths: cutPaths,
    cutPathsMm: cutPaths.map(transformPathD),
    handleCutPaths: handleCutPaths,
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
