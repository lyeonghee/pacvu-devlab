// ============================================================
// T004_layout.js - SVG-extracted T004 B-Type Tuck Box layout data
// Depends on T004_spec.js
// ============================================================

function T004_getLayout(W, D, H) {
  const spec = T004_getSpec({ W, D, H });

  const cutElements = [
    "\u003cpath d=\"M1416.232,997.507l-90.142,92.126h-47.258l-42.292-91.324c-.388-.845-1.162-1.444-2.077-1.608-.915-.164-1.849.13-2.506.787l-13.027,13.047,10.781,23.12-6.329,87.972\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M1212.073,1132.153c5.947,0,10.883-4.593,11.309-10.525\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"1212.073 1132.153 1184.358 1132.153 1141.838 1089.633 1048.295 1089.633 1049.145 1100.972 1012.295 1132.153 890.045 1132.153\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M878.747,1121.779c.501,5.868,5.408,10.374,11.297,10.374\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M878.747,1121.779l-10.463-122.529c-.094-1.103-.825-2.053-1.867-2.427-1.042-.374-2.21-.105-2.984.686l-90.099,92.124h-47.258l-42.292-91.324c-.388-.845-1.162-1.444-2.077-1.608-.915-.164-1.849.13-2.506.787l-13.027,13.047,10.781,23.12-6.329,87.972\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M659.317,1132.153c5.947,0,10.883-4.593,11.309-10.525\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"659.317 1132.153 631.602 1132.153 589.082 1089.633 495.539 1089.633 496.389 1100.972 459.539 1132.153 334.467 1132.153\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M323.168,1121.766c.495,5.873,5.404,10.387,11.299,10.387\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"323.168 1121.766 312.704 997.507 256.011 940.814\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cline x1=\"1416.232\" y1=\"997.507\" x2=\"1416.232\" y2=\"458.925\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M1406.877,345.539h-133.114c-3.846,0-7.219,2.589-8.214,6.303l-21.097,78.736-8.504,8.504v19.842h-372.472v-19.842l-8.504-8.504-21.097-78.736c-.995-3.714-4.369-6.303-8.214-6.303h-133.114\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"681.208 456.799 681.208 274.673 655.696 274.673 655.696 280.342\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M679.791,274.673v-17.008c0-21.906-17.779-39.685-39.685-39.685h-286.299c-21.906,0-39.685,17.779-39.685,39.685v17.008\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"338.216 280.342 338.216 274.673 312.704 274.673 312.704 458.925 256.011 474.115 256.011 940.814\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpath d=\"M681.208,456.799c0,.952.635,1.79,1.551,2.047.916.257,1.895-.128,2.39-.94\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"692.547 344.46 689.712 450.349 685.149 457.905\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cpolyline points=\"1406.877 345.539 1409.712 450.421 1416.232 458.925\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e",
    "\u003cline x1=\"1040.689\" y1=\"448.371\" x2=\"1040.549\" y2=\"448.371\" fill=\"none\" stroke=\"#e83312\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e"
  ];

  const foldElements = [
    "\u003cline x1=\"1416.232\" y1=\"997.507\" x2=\"1235.988\" y2=\"997.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"1231.94\" y1=\"997.507\" x2=\"867.484\" y2=\"997.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"863.436\" y1=\"997.507\" x2=\"683.232\" y2=\"997.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"679.184\" y1=\"997.507\" x2=\"312.704\" y2=\"997.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"1219.568\" y1=\"1011.903\" x2=\"1141.838\" y2=\"1089.633\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"666.813\" y1=\"1011.903\" x2=\"589.082\" y2=\"1089.633\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"1233.964\" y1=\"458.925\" x2=\"1233.964\" y2=\"996.657\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"681.208\" y1=\"457.507\" x2=\"681.208\" y2=\"996.657\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"865.46\" y1=\"458.925\" x2=\"865.46\" y2=\"996.657\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"312.704\" y1=\"458.925\" x2=\"312.704\" y2=\"997.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"1416.232\" y1=\"458.925\" x2=\"1235.948\" y2=\"458.925\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"863.476\" y1=\"458.925\" x2=\"683.334\" y2=\"458.925\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"681.208\" y1=\"457.507\" x2=\"312.704\" y2=\"457.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e",
    "\u003cline x1=\"655.696\" y1=\"277.507\" x2=\"338.216\" y2=\"277.507\" fill=\"none\" stroke=\"#3b4b9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e"
  ];

  const bleedElement = "\u003cpath d=\"M1423.354,1001.199c.085-.115.172-.229.251-.349.08-.121.151-.245.224-.369.067-.114.136-.227.198-.344.068-.129.128-.261.189-.393.056-.12.113-.239.163-.362.054-.132.099-.265.146-.399.045-.129.092-.257.131-.388.04-.135.072-.272.105-.408.032-.132.067-.264.093-.398.029-.149.047-.298.068-.447.017-.125.038-.249.05-.375.017-.177.021-.354.027-.531.003-.09.013-.177.013-.268V457.585c0-.075-.009-.147-.011-.222-.004-.164-.011-.327-.025-.491-.01-.122-.024-.243-.04-.364-.02-.154-.042-.307-.07-.46-.023-.127-.05-.253-.079-.379-.033-.142-.069-.283-.109-.424-.037-.131-.078-.26-.122-.389-.045-.131-.092-.262-.143-.391-.052-.133-.109-.264-.167-.394-.055-.12-.112-.239-.172-.358-.069-.135-.143-.267-.219-.398-.063-.108-.127-.216-.196-.323-.086-.134-.178-.265-.271-.394-.045-.062-.083-.128-.131-.189l-4.842-6.316-2.761-102.125c-.003-.11-.018-.217-.025-.326-.009-.142-.017-.284-.033-.424-.018-.156-.045-.309-.071-.463-.021-.121-.039-.242-.064-.361-.039-.182-.088-.359-.138-.536-.024-.083-.045-.168-.071-.25-.068-.216-.148-.426-.232-.634-.016-.038-.029-.077-.045-.114-.957-2.258-2.853-4-5.208-4.753-.04-.013-.08-.028-.12-.04-.198-.06-.401-.11-.606-.156-.081-.018-.161-.039-.244-.055-.171-.033-.345-.057-.52-.08-.117-.015-.233-.033-.352-.044-.153-.014-.308-.018-.463-.023-.104-.004-.205-.016-.31-.016h-133.113c-7.685,0-14.44,5.184-16.429,12.605l-20.507,76.536-6.894,6.893c-1.595,1.595-2.491,3.758-2.491,6.014v11.338h-355.464v-11.338c0-2.255-.896-4.419-2.49-6.014l-6.894-6.893-20.507-76.536c-1.989-7.422-8.745-12.605-16.429-12.605h-133.114c-.136,0-.269.014-.403.02-.102.005-.205.007-.307.016-.226.019-.448.05-.669.086-.047.008-.095.013-.142.022-.26.047-.516.107-.767.177-.008.002-.017.004-.025.007-.177.05-.35.107-.521.167v-62.856c0-1.737-.523-3.351-1.417-4.697v-12.311c0-26.571-21.618-48.188-48.189-48.188h-286.299c-26.571,0-48.189,21.617-48.189,48.188v12.311c-.894,1.346-1.417,2.96-1.417,4.697v177.727s-.695,492.595-.679,492.71c.022.16.97,56.212.97,56.212l10.203,121.159c.024.279.061.554.11.824,1.247,9.792,9.714,17.353,19.663,17.353h125.072c2.011,0,3.958-.713,5.493-2.012l36.851-31.181c2.08-1.761,3.191-4.411,2.987-7.128l-.165-2.199h80.855l40.029,40.029c1.595,1.595,3.758,2.49,6.013,2.49h27.716c10.355,0,19.048-8.09,19.791-18.418l6.33-87.973c.104-1.444-.163-2.892-.775-4.204l-8.266-17.728,3.082-3.087,38.881,83.959c1.392,3.007,4.404,4.931,7.717,4.931h47.257c2.288,0,4.48-.922,6.08-2.558l81.45-83.281,9.41,110.204c.884,10.35,9.384,18.154,19.771,18.154h122.25c2.012,0,3.958-.713,5.493-2.012l36.851-31.181c2.08-1.761,3.19-4.411,2.987-7.128l-.165-2.199h80.855l40.028,40.029c1.596,1.595,3.758,2.49,6.014,2.49h27.716c10.073,0,18.552-7.664,19.691-17.589.046-.272.08-.548.1-.829l6.33-87.973c.104-1.444-.163-2.892-.775-4.204l-8.267-17.728,3.081-3.086,38.882,83.958c1.393,3.007,4.403,4.931,7.717,4.931h47.258c2.287,0,4.479-.922,6.078-2.557l90.142-92.126c.068-.069.125-.144.19-.215.114-.125.23-.249.337-.38.085-.104.161-.213.24-.32Z\" fill=\"none\" stroke=\"#3b4b9e\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"/\u003e";

  const labels = [
    { name: 'lidTop', x: 496.7, y: 386 },
    { name: 'Glue', x: 284, y: 728 },
    { name: 'Front', x: 496.9, y: 728 },
    { name: 'Side(L)', x: 773.3, y: 728 },
    { name: 'Back', x: 1049.7, y: 728 },
    { name: 'Side(R)', x: 1325.1, y: 728 },
    { name: 'Upper-Tuck', x: 496.7, y: 258 },
    { name: 'bottomLock-A', x: 496.9, y: 1020 },
    { name: 'bottomLock(L)', x: 773.3, y: 1020 },
    { name: 'bottomLock-B', x: 1049.7, y: 1020 },
    { name: 'bottomLock(R)', x: 1325.1, y: 1020 },
    { name: 'lidSideFlap(L)', x: 773.3, y: 429 },
    { name: 'lidSideFlap(R)', x: 1049.7, y: 429 }
  ];

  return {
    spec,
    cutElements,
    foldElements,
    bleedElement,
    labels,
    bounds: spec.bounds,
    transform: spec.transform
  };
}

// ============================================================
// PacVu T004 master override: independent W / D / H geometry
// ============================================================
const T004_SOURCE_UNIT_TO_MM = 25.4 / 72;
const T004_SOURCE_GRID = Object.freeze({
  xOuterL: 256.011, xFrontL: 312.704, xFrontR: 681.208,
  xSideLR: 865.46, xBackR: 1233.964, xSideRR: 1416.232,
  yTop: 217.98, yLidFold: 277.507, yBodyTop: 458.925,
  yBodyBottom: 997.507, yBottomBend: 1089.633, yBottomMax: 1132.153
});

function T004_piecewise(value, source, target) {
  if (value <= source[0]) return target[0] + (value-source[0]) * (target[1]-target[0]) / (source[1]-source[0]);
  for (let i=0;i<source.length-1;i+=1) {
    if (value <= source[i+1]) return target[i] + (value-source[i]) * (target[i+1]-target[i]) / (source[i+1]-source[i]);
  }
  const n=source.length-1;
  return target[n] + (value-source[n]) * (target[n]-target[n-1]) / (source[n]-source[n-1]);
}

function T004_createGrid(W,D,H) {
  const s=T004_SOURCE_GRID;
  const glueWidth=Math.min(25,D*(25/81));
  const upperTuckRule=globalThis.PacVuUpperTuckRule.resolve('T004',D);
  const tuckDepth=upperTuckRule.depth;
  const topDepth=D;
  const xOuterL=0, xFrontL=glueWidth, xFrontR=xFrontL+W;
  const xSideLR=xFrontR+D, xBackR=xSideLR+W, xSideRR=xBackR+D;
  const yTop=0, yLidFold=tuckDepth, yBodyTop=tuckDepth+topDepth;
  const yBodyBottom=yBodyTop+H, yBottomBend=yBodyBottom+D*0.5;
  const yBottomMax=yBodyBottom+(s.yBottomMax-s.yBodyBottom)*T004_SOURCE_UNIT_TO_MM*(D/65);
  return {xOuterL,xFrontL,xFrontR,xSideLR,xBackR,xSideRR,yTop,yLidFold,yBodyTop,yBodyBottom,yBottomBend,yBottomMax,glueWidth,upperTuckRule};
}

function T004_createMapper(grid,W,D,H) {
  const s=T004_SOURCE_GRID;
  const sx=[s.xOuterL,s.xFrontL,s.xFrontR,s.xSideLR,s.xBackR,s.xSideRR];
  const tx=[grid.xOuterL,grid.xFrontL,grid.xFrontR,grid.xSideLR,grid.xBackR,grid.xSideRR];
  const sy=[s.yTop,s.yLidFold,s.yBodyTop,s.yBodyBottom,s.yBottomBend,s.yBottomMax];
  const ty=[grid.yTop,grid.yLidFold,grid.yBodyTop,grid.yBodyBottom,grid.yBottomBend,grid.yBottomMax];
  const x=(value,yValue)=>{
    if(yValue<=280.342&&value>=s.xFrontL&&value<=s.xFrontR){
      return globalThis.PacVuUpperTuckRule.mapX(value,s.xFrontL,s.xFrontR,grid.xFrontL,grid.xFrontR,T004_SOURCE_UNIT_TO_MM,1);
    }
    return T004_piecewise(value,sx,tx);
  };
  const y=value=>{
    if(value<=s.yLidFold){
      const sourceCurveBottom=257.665;
      const sourceCurveHeight=(sourceCurveBottom-s.yTop)*T004_SOURCE_UNIT_TO_MM;
      const curveHeight=Math.min(sourceCurveHeight,grid.yLidFold-grid.yTop);
      if(value<=sourceCurveBottom){
        return grid.yTop+(value-s.yTop)*curveHeight/(sourceCurveBottom-s.yTop);
      }
      return grid.yTop+curveHeight+(value-sourceCurveBottom)*
        (grid.yLidFold-grid.yTop-curveHeight)/(s.yLidFold-sourceCurveBottom);
    }
    return T004_piecewise(value,sy,ty);
  };
  return {x(value){return x(value);},y,point(px,py){return {x:x(px,py),y:y(py)};}};
}

function T004_sourceFoldElements() {
  return [
    [1416.232,997.507,1235.988,997.507],[1231.94,997.507,867.484,997.507],
    [863.436,997.507,683.232,997.507],[679.184,997.507,312.704,997.507],
    [1219.568,1011.903,1141.838,1089.633],[666.813,1011.903,589.082,1089.633],
    [1233.964,458.925,1233.964,996.657],[681.208,457.507,681.208,996.657],
    [865.46,458.925,865.46,996.657],[312.704,458.925,312.704,997.507],
    [1416.232,458.925,1235.948,458.925],[863.476,458.925,683.334,458.925],
    [681.208,457.507,312.704,457.507],[655.696,277.507,338.216,277.507]
  ];
}

function T004_validateLayout(layout) {
  const g=layout.grid,s=layout.spec,tolerance=0.05;
  const checks=[
    ['frontWidth',g.xFrontR-g.xFrontL,s.W],['backWidth',g.xBackR-g.xSideLR,s.W],
    ['sideLeftDepth',g.xSideLR-g.xFrontR,s.D],['sideRightDepth',g.xSideRR-g.xBackR,s.D],
    ['bodyHeight',g.yBodyBottom-g.yBodyTop,s.H],['lidTopDepth',g.yBodyTop-g.yLidFold,s.D],
    ['glueWidth',g.glueWidth,Math.min(25,s.D*(25/81))],
    ['bottomLockBend',g.yBottomBend-g.yBodyBottom,s.D*0.5],
    ['bleedWidth',layout.bleedBounds.width-layout.dielineBounds.width,6],
    ['bleedHeight',layout.bleedBounds.height-layout.dielineBounds.height,6]
  ];
  const failures=checks.filter(v=>Math.abs(v[1]-v[2])>tolerance).map(v=>({id:v[0],actual:v[1],expected:v[2]}));
  if(layout.foldElements.length!==14) failures.push({id:'foldCount',actual:layout.foldElements.length,expected:14});
  return Object.freeze({ok:failures.length===0,checks:Object.freeze(checks),failures:Object.freeze(failures)});
}

// This declaration replaces the preparation-stage average scaler above.
function T004_getLayout(W,D,H) {
  const spec=T004_getSpec({W,D,H}), grid=T004_createGrid(spec.W,spec.D,spec.H);
  spec.upperTuckRule=grid.upperTuckRule;
  const mapper=T004_createMapper(grid,spec.W,spec.D,spec.H);
  const fillPath=T002_buildRuleCutPath(T004_cutFillPath(),mapper);
  const reliefWidth=(338.216-312.704)*T004_SOURCE_UNIT_TO_MM;
  const reliefTopY=mapper.point(338.216,274.673).y;
  const reliefLegY=mapper.point(338.216,280.342).y;
  const upperTuckLeft=[
    {x:grid.xFrontL+reliefWidth,y:reliefLegY},
    {x:grid.xFrontL+reliefWidth,y:reliefTopY},
    {x:grid.xFrontL,y:reliefTopY}
  ];
  const upperTuckRight=[
    {x:grid.xFrontR,y:reliefTopY},
    {x:grid.xFrontR-reliefWidth,y:reliefTopY},
    {x:grid.xFrontR-reliefWidth,y:reliefLegY}
  ];
  const cutElements=[
    '<path d="'+fillPath+'"/>',
    '<polyline points="'+upperTuckLeft.map(point=>point.x+','+point.y).join(' ')+'"/>',
    '<polyline points="'+upperTuckRight.map(point=>point.x+','+point.y).join(' ')+'"/>'
  ];
  const foldElements=T004_sourceFoldElements().map(v=>{const a=mapper.point(v[0],v[1]),b=mapper.point(v[2],v[3]);return T002_lineElement(a.x,a.y,b.x,b.y);});
  const cutPoints=T001_flattenPathD(fillPath), raw=T001_polygonBounds(cutPoints);
  const dielineBounds={minX:raw.minX,minY:raw.minY,maxX:raw.maxX,maxY:raw.maxY,width:raw.maxX-raw.minX,height:raw.maxY-raw.minY};
  const bleedPoints=T001_offsetPolygonWithClipper(cutPoints,3);
  if(!bleedPoints||!bleedPoints.length) throw new Error('T004 3 mm bleed generation failed.');
  const bleedPath=T001_polygonToPath(bleedPoints), rb=T001_polygonBounds(bleedPoints);
  const bleedBounds={minX:rb.minX,minY:rb.minY,maxX:rb.maxX,maxY:rb.maxY,width:rb.maxX-rb.minX,height:rb.maxY-rb.minY};
  const sources=[
    ['Upper-Tuck',496.7,258],['lidTop',496.7,386],['lidSideFlap(L)',773.3,429],['lidSideFlap(R)',1325.1,429],
    ['Glue',284,728],['Front',496.9,728],['Side(L)',773.3,728],['Back',1049.7,728],['Side(R)',1325.1,728],
    ['bottomLock-A',496.9,1020],['bottomLock(L)',773.3,1020],['bottomLock-B',1049.7,1020],['bottomLock(R)',1325.1,1020]
  ];
  const labels=sources.map(v=>{
    if(v[0]==='Upper-Tuck') return {name:v[0],x:(grid.xFrontL+grid.xFrontR)/2,y:grid.yLidFold/2};
    return {name:v[0],...mapper.point(v[1],v[2])};
  });
  const gt=mapper.point(256.011,474.115),gb=mapper.point(256.011,940.814);
  const glueFillPath=`M ${grid.xFrontL} ${grid.yBodyTop} L ${gt.x} ${gt.y} L ${gb.x} ${gb.y} L ${grid.xFrontL} ${grid.yBodyBottom} Z`;
  const layout={spec,grid,mapper,fillPath,cutElements,foldElements,labels,glueFillPath,bleedPath,bleedElement:'<path d="'+bleedPath+'"/>',bounds:dielineBounds,dielineBounds,bleedBounds,transform:{a:1,b:0,c:0,d:1,e:0,f:0}};
  layout.validation=T004_validateLayout(layout);
  if(!layout.validation.ok) throw new Error('T004 geometry contract failed: '+JSON.stringify(layout.validation.failures));
  return layout;
}
