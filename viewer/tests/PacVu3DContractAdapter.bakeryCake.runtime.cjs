'use strict';
// Read-only source harness. It never loads a viewer or runs assembly behavior.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function functionText(source,name){const start=source.indexOf('  function '+name+'('),end=source.indexOf('\n  function ',start+1);if(start<0||end<0)throw new Error('Source function not found: '+name);return source.slice(start,end);}
function loadRuntime(){
  const {svgPathProperties}=require(process.env.PACVU_SVG_PATH_PROPERTIES||'svg-path-properties');
  const document={body:{appendChild(){}},createElementNS(ns,tag){let p;return {style:{},appendChild(){},remove(){},setAttribute(k,d){if(k==='d')p=new svgPathProperties(d);},getTotalLength(){return p.getTotalLength();},getPointAtLength(t){return p.getPointAtLength(t);}};}};
  const r=vm.createContext({console,document,navigator:{userAgent:'node-contract-test'}});r.window=r;
  vm.runInContext(fs.readFileSync(process.env.PACVU_CLIPPER_PATH||require.resolve('clipper-lib'),'utf8'),r);
  for(const file of ['structures/tuck/T001/T001_spec.js','structures/tuck/T001/T001_layout.js',...['B001','B002'].flatMap(id=>['spec','layout'].map(s=>'structures/bakery/'+id+'/'+id+'_'+s+'.js')), ...['spec','layout','renderer'].map(s=>'structures/cake/C001/C001_'+s+'.js')])vm.runInContext(read(file),r,{filename:file});
  return r;
}
function originalB002(r,layout){
  const src=read('structures/bakery/B002/B002_3d.js');
  const ctx=vm.createContext({...r,global:r,layout,PAPER:.32,THREE:{MathUtils:{degToRad:n=>n*Math.PI/180}},polygonInteriorPoint:pts=>pts[0]});
  // Origin is not consumed by the mapping. Only original closedPath/axis and
  // hole declarations are extracted; mesh creation and assembly never execute.
  const start=src.indexOf('  const B002_FIXED_PANEL_SOURCE'),end=src.indexOf('  function panelGeometry',start);
  vm.runInContext(src.slice(start,end)+functionText(src,'polygonArea')+functionText(src,'buildFixedPanelContract'),ctx);
  return ctx.buildFixedPanelContract(layout);
}
function originalC001Handles(){const src=read('structures/cake/C001/C001_3d.js'),ctx=vm.createContext({});vm.runInContext(functionText(src,'handlePanelPaths'),ctx);return ctx.handlePanelPaths();}
function originalB001(r,layout){
  const src=read('structures/bakery/B001/B001_3d_test.js');
  const ctx=vm.createContext({document:r.document,layout,regions:{}});
  vm.runInContext(functionText(src,'pointsFromPath')+functionText(src,'clipPolygon')+`
    const bounds=layout.bounds,xs=layout.anchors.panelsX,top=layout.anchors.bodyTopY,bottom=layout.anchors.bodyBottomY,minY=bounds.minY,maxY=bounds.minY+bounds.height;
    const outline=pointsFromPath(layout.fillPath,2600);
    const handleFoldY=Math.max(...pointsFromPath(layout.requiredCutElements[0].match(/d="([^"]+)"/)[1],180).map(p=>p.y));
    function addPiece(name,rect,holeIndexes){regions[name]={polygon:clipPolygon(outline,rect),holeIndexes:holeIndexes||[]};}
  `+src.split('\n').filter(line=>/^\s*(?:const back = )?addPiece\('/.test(line)).join('\n'),ctx);
  return ctx.regions;
}
function originalC001(r,layout){
  const src=read('structures/cake/C001/C001_3d.js'),ctx=vm.createContext({global:r,document:r.document,layout,FLATTEN_TOLERANCE_MM:.05,SLOT_WIDTH_MM:.55,clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
  const start=src.indexOf('    const paths = global.C001_getPanelPaperPaths();'),end=src.indexOf('    const viewer =',start);
  vm.runInContext(['flattenPath','slotRibbon','baseSlotHoles','clipContour','handlePanelPaths'].map(n=>functionText(src,n)).join('\n')+src.slice(start,end)+'\n globalThis.result={contours,handleHoles};',ctx);
  return ctx.result;
}
module.exports={loadRuntime,originalB001,originalB002,originalC001,originalC001Handles,functionText,read};
