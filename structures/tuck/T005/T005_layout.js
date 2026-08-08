// ============================================================
// T005_layout.js - Opposite Tuck End Box 2D master geometry
// ============================================================

const T005_TOLERANCE = 0.05;

// One continuous production outline. The four short tuck relief cuts remain
// independent cut primitives and are never back-tracked into this polygon.
const T005_SOURCE_OUTLINE_D = [
  'M 1224.408 670.061','L 1224.408 420.392','L 1229.437 420.392','L 1229.437 391.644',
  'C 1229.437 366.898 1249.497 346.838 1274.243 346.838','L 1989.581 346.838',
  'C 2014.327 346.838 2034.387 366.898 2034.387 391.644','L 2034.387 420.392','L 2038.458 420.392','L 2038.458 670.061',
  'C 2038.458 672.692 2040.362 674.596 2042.71 674.596','C 2045.058 674.596 2046.962 672.692 2046.962 670.344',
  'L 2055.187 517.911','L 2232.216 517.911','C 2239.601 517.911 2246.079 522.721 2247.991 529.623',
  'L 2278.881 641.161','L 2291.947 653.802','L 2291.947 675.924','L 2291.375 677.105','L 2291.375 1651.565',
  'L 2286.477 1656.011','L 2286.086 1656.598','L 2277.981 1808.62','L 2103.533 1808.62',
  'C 2096.256 1808.62 2089.872 1803.81 2087.988 1796.908','L 2057.549 1685.37','L 2044.674 1672.729','L 2044.674 1650.607',
  'L 2043.309 1649.098','L 1216.593 1649.098','L 1216.167 1649.118','L 1216.167 1671.24','L 1203.101 1683.881',
  'L 1172.211 1795.419','C 1170.299 1802.321 1163.821 1807.131 1156.436 1807.131','L 979.407 1807.131','L 971.182 1655.109',
  'C 971.182 1653.194 969.278 1651.29 966.93 1651.29','C 964.582 1651.29 962.678 1653.194 962.678 1655.542',
  'L 962.502 1654.879','L 962.503 1904.548','L 959.949 1904.548','L 959.949 1933.296',
  'C 959.949 1958.042 939.889 1978.102 915.143 1978.102','L 199.805 1978.104',
  'C 175.059 1978.104 154.999 1958.044 154.999 1933.298','L 154.999 1904.55','L 151.927 1904.55','L 151.926 1654.879',
  'L 93.912 1638.503','L 93.912 694.054','L 93.913 692.82','L 151.926 676.444','L 153.324 676.444','L 970.919 676.443',
  'L 970.919 654.321','L 983.985 641.68','L 1014.875 530.142','C 1016.787 523.24 1023.265 518.43 1030.65 518.43',
  'L 1207.679 518.43','L 1215.904 670.452','C 1215.904 673.212 1217.808 675.116 1220.156 675.116',
  'C 1222.504 675.116 1224.408 673.212 1224.408 670.864','Z'
].join(' ');

const T005_SOURCE_SHORT_CUTS = Object.freeze([
  Object.freeze([[1224.408,420.392],[1248.753,420.392],[1248.753,430.255]]),
  Object.freeze([[2038.458,420.392],[2014.113,420.392],[2014.113,430.255]]),
  Object.freeze([[151.927,1904.55],[176.273,1904.55],[176.273,1894.686]]),
  Object.freeze([[962.503,1904.548],[938.158,1904.548],[938.157,1894.684]])
]);

function T005_createMapper(spec) {
  const s=spec.source,g=spec.grid;
  const sx=[s.xGlueL,s.xBackL,s.xBackR,s.xSideLR,s.xFrontR,s.xSideRR];
  const tx=[g.xGlueL,g.xBackL,g.xBackR,g.xSideLR,g.xFrontR,g.xSideRR];
  const sy=[s.yTop,s.yUpperFold,s.yBodyTop,s.yBodyBottom,s.yLowerFold,s.yBottom];
  const ty=[g.yTop,g.yUpperFold,g.yBodyTop,g.yBodyBottom,g.yLowerFold,g.yBottom];
  return {point(x,y){return{x:T001_piecewise(x,sx,tx),y:T001_piecewise(y,sy,ty)};},x(x){return T001_piecewise(x,sx,tx);},y(y){return T001_piecewise(y,sy,ty);}};
}

function T005_createTuckMapper(spec,mapper) {
  const s=spec.source,g=spec.grid,scale=spec.upperTuckRule.profileScale;
  const upperSource=[1224.408,1229.437,1274.243,1989.581,2034.387,2038.458];
  const upperEdge=((upperSource[1]-upperSource[0])+(upperSource[5]-upperSource[4]))*.5*s.unitToMm*scale;
  const upperShoulder=((upperSource[2]-upperSource[0])+(upperSource[5]-upperSource[3]))*.5*s.unitToMm*scale;
  const upperTarget=[g.xSideLR,g.xSideLR+upperEdge,g.xSideLR+upperShoulder,g.xFrontR-upperShoulder,g.xFrontR-upperEdge,g.xFrontR];
  const lowerSource=[151.927,154.999,199.805,915.143,959.949,962.503];
  const lowerTarget=[g.xBackL,g.xBackL+upperEdge,g.xBackL+upperShoulder,g.xBackR-upperShoulder,g.xBackR-upperEdge,g.xBackR];
  function x(value,y){
    if(y<=s.yUpperFold+T005_TOLERANCE&&value>=upperSource[0]&&value<=upperSource[upperSource.length-1])return T005_piecewiseLocal(value,upperSource,upperTarget);
    if(y>=s.yLowerFold-T005_TOLERANCE&&value>=lowerSource[0]&&value<=lowerSource[lowerSource.length-1])return T005_piecewiseLocal(value,lowerSource,lowerTarget);
    return mapper.x(value);
  }
  return {point(px,py){return{x:x(px,py),y:mapper.y(py)};},x(px){return mapper.x(px);},y:mapper.y};
}

function T005_piecewiseLocal(value,source,target) {
  if(value<=source[0])return target[0];
  for(let i=0;i<source.length-1;i+=1)if(value<=source[i+1])return target[i]+(value-source[i])*(target[i+1]-target[i])/(source[i+1]-source[i]);
  return target[target.length-1];
}

function T005_polylineElement(points) {
  return '<polyline points="'+points.map(p=>T005_num(p.x)+' '+T005_num(p.y)).join(' ')+'"/>';
}

function T005_buildSingleCut(spec,mapper) {
  const tuckMapper=T005_createTuckMapper(spec,mapper);
  const outline=T001_transformPathD(T005_SOURCE_OUTLINE_D,tuckMapper);
  const g=spec.grid,profileScale=spec.upperTuckRule.profileScale,heightScale=spec.upperTuckRule.scale;
  const upperH=8.5884*profileScale,upperV=3.4794*heightScale;
  const lowerH=upperH,lowerV=upperV;
  const anchor=T005_SOURCE_SHORT_CUTS.map(points=>tuckMapper.point(points[0][0],points[0][1]));
  const shortCuts=[
    [anchor[0],{x:anchor[0].x+upperH,y:anchor[0].y},{x:anchor[0].x+upperH,y:anchor[0].y+upperV}],
    [anchor[1],{x:anchor[1].x-upperH,y:anchor[1].y},{x:anchor[1].x-upperH,y:anchor[1].y+upperV}],
    [anchor[2],{x:anchor[2].x+lowerH,y:anchor[2].y},{x:anchor[2].x+lowerH,y:anchor[2].y-lowerV}],
    [anchor[3],{x:anchor[3].x-lowerH,y:anchor[3].y},{x:anchor[3].x-lowerH,y:anchor[3].y-lowerV}]
  ].map(T005_polylineElement);
  return {outline,shortCuts,cutElements:['<path d="'+outline+'"/>'].concat(shortCuts)};
}

function T005_buildFoldElements(spec,mapper) {
  const g=spec.grid;
  const tuckMapper=T005_createTuckMapper(spec,mapper);
  const line=(x1,y1,x2,y2)=>T002_lineElement(x1,y1,x2,y2);
  const p=(x,y)=>mapper.point(x,y);
  const mapped=(x1,y1,x2,y2)=>{const a=p(x1,y1),b=p(x2,y2);return line(a.x,a.y,b.x,b.y);};
  const tuckMapped=(x1,y1,x2,y2)=>{const a=tuckMapper.point(x1,y1),b=tuckMapper.point(x2,y2);return line(a.x,a.y,b.x,b.y);};
  return [
    tuckMapped(1248.782,428.817,2004.523,428.815),
    mapped(1221.872,673.992,2029.376,673.98),
    mapped(152.908,1652.718,963.46,1652.707),
    tuckMapped(179.863,1896.126,935.604,1896.122),
    line(g.xBackR,g.yBodyTop,g.xBackR,g.yBodyBottom),
    line(g.xSideLR,g.yBodyTop,g.xSideLR,g.yBodyBottom),
    line(g.xBackL,g.yBodyTop,g.xBackL,g.yBodyBottom),
    line(g.xFrontR,g.yBodyTop,g.xFrontR,g.yBodyBottom),
    mapped(2036.714,675.431,2291.989,675.923),
    mapped(2039.858,1650.55,2289.496,1650.55),
    mapped(976.628,1651.935,1219.145,1651.935),
    mapped(973.915,675.44,1216.433,675.44)
  ];
}

function T005_capsulePrimitive(spec) {
  const g=spec.grid,scale=spec.capsuleScale;
  const width=46*scale,height=240*scale,rx=22.0772*scale;
  const cx=(g.xBackR+g.xSideLR)/2,cy=(g.yBodyTop+g.yBodyBottom)/2;
  const x=cx-width/2,y=cy-height/2;
  const k=.5522847498,ry=rx;
  const d=[`M ${x+rx} ${y}`,`L ${x+width-rx} ${y}`,`C ${x+width-rx+rx*k} ${y} ${x+width} ${y+ry-ry*k} ${x+width} ${y+ry}`,`L ${x+width} ${y+height-ry}`,`C ${x+width} ${y+height-ry+ry*k} ${x+width-rx+rx*k} ${y+height} ${x+width-rx} ${y+height}`,`L ${x+rx} ${y+height}`,`C ${x+rx-rx*k} ${y+height} ${x} ${y+height-ry+ry*k} ${x} ${y+height-ry}`,`L ${x} ${y+ry}`,`C ${x} ${y+ry-ry*k} ${x+rx-rx*k} ${y} ${x+rx} ${y}`,'Z'].join(' ');
  return Object.freeze({id:'capsuleHole',panel:'Side(L)',cx,cy,x,y,width,height,rx,ry,path:d,ratio:width/height,element:'<path d="'+d+'"/>'});
}

function T005_segmentIntersection(a,b,c,d) {
  const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);
  return ((ab1>T005_TOLERANCE&&ab2<-T005_TOLERANCE)||(ab1<-T005_TOLERANCE&&ab2>T005_TOLERANCE))&&((cd1>T005_TOLERANCE&&cd2<-T005_TOLERANCE)||(cd1<-T005_TOLERANCE&&cd2>T005_TOLERANCE));
}

function T005_hasSelfIntersection(points) {
  const n=points.length;
  for(let i=0;i<n-1;i+=1) for(let j=i+2;j<n-1;j+=1){if(i===0&&j===n-2)continue;if(T005_segmentIntersection(points[i],points[i+1],points[j],points[j+1]))return true;}
  return false;
}

// Derive the glue artwork directly from the final production Cut polygon.
// This keeps the glue fill on the same slanted/stepped boundary as Cut instead
// of rebuilding an approximate trapezoid from the body grid.
function T005_clipPolygonAtMaxX(points,maxX) {
  const input=points.slice();
  if(!input.length)return [];
  const output=[];
  const inside=point=>point.x<=maxX+T005_TOLERANCE;
  const intersect=(a,b)=>{
    const dx=b.x-a.x;
    if(Math.abs(dx)<1e-9)return{x:maxX,y:a.y};
    const ratio=(maxX-a.x)/dx;
    return{x:maxX,y:a.y+(b.y-a.y)*ratio};
  };
  for(let i=0;i<input.length;i+=1){
    const current=input[i],previous=input[(i+input.length-1)%input.length];
    const currentInside=inside(current),previousInside=inside(previous);
    if(currentInside){
      if(!previousInside)output.push(intersect(previous,current));
      output.push({x:current.x,y:current.y});
    }else if(previousInside)output.push(intersect(previous,current));
  }
  return output;
}

function T005_shortCutMetrics(elements) {
  return elements.map(element=>{
    const nums=(T001_attr(element,'points').match(/[-+]?\d*\.?\d+/g)||[]).map(Number),points=[];
    for(let i=0;i<nums.length;i+=2)points.push({x:nums[i],y:nums[i+1]});
    return Object.freeze({horizontal:Math.abs(points[1].x-points[0].x),vertical:Math.abs(points[2].y-points[1].y)});
  });
}

function T005_validateLayout(layout) {
  const g=layout.grid,s=layout.spec,c=layout.capsuleHole,t=T005_TOLERANCE;
  const checks=[
    ['backWidth',g.xBackR-g.xBackL,s.W],['frontWidth',g.xFrontR-g.xSideLR,s.W],
    ['sideLeftDepth',g.xSideLR-g.xBackR,s.D],['sideRightDepth',g.xSideRR-g.xFrontR,s.D],
    ['bodyHeight',g.yBodyBottom-g.yBodyTop,s.H],['upperLidDepth',g.yBodyTop-g.yUpperFold,s.D],
    ['lowerLidDepth',g.yLowerFold-g.yBodyBottom,s.D],['glueWidth',g.xBackL-g.xGlueL,Math.max(15,Math.min(25,s.D*.23132))],
    ['capsuleCenterX',c.cx,(g.xBackR+g.xSideLR)/2],['capsuleCenterY',c.cy,(g.yBodyTop+g.yBodyBottom)/2],
    ['capsuleRatio',c.ratio,46/240],['bleedWidth',layout.bleedBounds.width-layout.dielineBounds.width,6],
    ['bleedHeight',layout.bleedBounds.height-layout.dielineBounds.height,6]
  ];
  const failures=checks.filter(v=>Math.abs(v[1]-v[2])>t).map(v=>({id:v[0],actual:v[1],expected:v[2]}));
  if(layout.foldElements.length!==12)failures.push({id:'foldCount',actual:layout.foldElements.length,expected:12});
  if(layout.shortCutElements.length!==4)failures.push({id:'shortCutCount',actual:layout.shortCutElements.length,expected:4});
  const tm=layout.tuckMetrics;
  if(tm.length===4){
    [['upperHorizontalSymmetry',tm[0].horizontal,tm[1].horizontal],['upperVerticalSymmetry',tm[0].vertical,tm[1].vertical],['lowerHorizontalSymmetry',tm[2].horizontal,tm[3].horizontal],['lowerVerticalSymmetry',tm[2].vertical,tm[3].vertical]].forEach(v=>{if(Math.abs(v[1]-v[2])>t)failures.push({id:v[0],actual:v[1],expected:v[2]});});
  }
  if(layout.selfIntersection)failures.push({id:'cutSelfIntersection',actual:true,expected:false});
  if(c.x<g.xBackR-t||c.x+c.width>g.xSideLR+t||c.y<g.yBodyTop-t||c.y+c.height>g.yBodyBottom+t)failures.push({id:'capsuleContainment',actual:false,expected:true});
  return Object.freeze({ok:failures.length===0,tolerance:t,checks:Object.freeze(checks),failures:Object.freeze(failures),dustFlapInterference:false});
}

function T005_getLayout(W,D,H) {
  const spec=T005_getSpec({W,D,H}),mapper=T005_createMapper(spec),cut=T005_buildSingleCut(spec,mapper);
  const foldElements=T005_buildFoldElements(spec,mapper),capsuleHole=T005_capsulePrimitive(spec);
  let points=T001_flattenPathD(cut.outline).filter((p,i,a)=>i===0||T001_distance(p,a[i-1])>.001);
  if(points.length>1&&T001_distance(points[0],points[points.length-1])>.001)points.push({...points[0]});
  const raw=T001_polygonBounds(points),dielineBounds={minX:raw.minX,minY:raw.minY,maxX:raw.maxX,maxY:raw.maxY,width:raw.maxX-raw.minX,height:raw.maxY-raw.minY};
  const bleedPoints=T001_offsetPolygonWithClipper(points.slice(0,-1),3);
  if(!bleedPoints||!bleedPoints.length)throw new Error('T005 final Cut 3 mm bleed generation failed.');
  const bleedPath=T001_polygonToPath(bleedPoints),rb=T001_polygonBounds(bleedPoints),bleedBounds={minX:rb.minX,minY:rb.minY,maxX:rb.maxX,maxY:rb.maxY,width:rb.maxX-rb.minX,height:rb.maxY-rb.minY};
  const g=spec.grid,labelData=[
    ['Glue',(g.xGlueL+g.xBackL)/2,(g.yBodyTop+g.yBodyBottom)/2],['Back',(g.xBackL+g.xBackR)/2,(g.yBodyTop+g.yBodyBottom)/2],
    ['Side(L)',(g.xBackR+g.xSideLR)/2,(g.yBodyTop+g.yBodyBottom)/2],['Front',(g.xSideLR+g.xFrontR)/2,(g.yBodyTop+g.yBodyBottom)/2],
    ['Side(R)',(g.xFrontR+g.xSideRR)/2,(g.yBodyTop+g.yBodyBottom)/2],['upperLid',(g.xSideLR+g.xFrontR)/2,(g.yUpperFold+g.yBodyTop)/2],
    ['upperTuck',(g.xSideLR+g.xFrontR)/2,(g.yTop+g.yUpperFold)/2],['lowerLid',(g.xBackL+g.xBackR)/2,(g.yBodyBottom+g.yLowerFold)/2],
    ['lowerTuck',(g.xBackL+g.xBackR)/2,(g.yLowerFold+g.yBottom)/2],['upperDustFlap(L)',(g.xBackR+g.xSideLR)/2,(g.yUpperFold+g.yBodyTop)/2],
    ['upperDustFlap(R)',(g.xFrontR+g.xSideRR)/2,(g.yUpperFold+g.yBodyTop)/2],['lowerDustFlap(L)',(g.xBackR+g.xSideLR)/2,(g.yBodyBottom+g.yLowerFold)/2],
    ['lowerDustFlap(R)',(g.xFrontR+g.xSideRR)/2,(g.yBodyBottom+g.yLowerFold)/2]
  ];
  const labels=labelData.map(v=>({name:v[0],x:v[1],y:v[2]}));
  const glueFillPoints=T005_clipPolygonAtMaxX(points.slice(0,-1),g.xBackL);
  if(glueFillPoints.length<3)throw new Error('T005 final Cut glue fill extraction failed.');
  const glueFillPath=T001_polygonToPath(glueFillPoints);
  const layout={spec,grid:g,mapper,fillPath:cut.outline,cutElements:cut.cutElements,shortCutElements:cut.shortCuts,tuckMetrics:T005_shortCutMetrics(cut.shortCuts),foldElements,labels,capsuleHole,optionElements:[capsuleHole.element],glueFillPath,glueFillPoints,bleedPath,bleedElement:'<path d="'+bleedPath+'"/>',dielineBounds,bleedBounds,bounds:dielineBounds,selfIntersection:T005_hasSelfIntersection(points)};
  layout.validation=T005_validateLayout(layout);
  if(!layout.validation.ok)throw new Error('T005 Opposite Tuck contract failed: '+JSON.stringify(layout.validation.failures));
  return layout;
}
