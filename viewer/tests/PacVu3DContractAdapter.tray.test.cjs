'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const adapter=require('../PacVu3DContractAdapter.js'),validator=require('../PacVu3DContract.js');
const {svgPathProperties}=require(process.env.PACVU_SVG_PATH_PROPERTIES||'svg-path-properties');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=v=>JSON.parse(JSON.stringify(v));
const document={createElementNS(){let p;return {setAttribute(k,d){assert.equal(k,'d');p=new svgPathProperties(d);},getTotalLength(){return p.getTotalLength();},getPointAtLength(n){return p.getPointAtLength(n);}};}};
const runtime=vm.createContext({console,document,require:name=>{assert.equal(name,'fs');return {readFileSync:(f,encoding)=>{assert.ok(/^structures\/tray\/TR00[123]\/reference\//.test(f));return fs.readFileSync(path.join(root,f),encoding);}};}});
for(const id of ['TR001','TR002','TR003'])for(const suffix of ['spec','layout'])vm.runInContext(read('structures/tray/'+id+'/'+id+'_'+suffix+'.js'),runtime);
const defaults={TR001:{W:282,D:368,H:140},TR002:{W:200,D:280,H:100},TR003:{W:317.5,D:496.8875,H:133.35}};
function fn(source,name){const start=source.indexOf('  function '+name+'('),end=source.indexOf('\n  function ',start+1);assert.ok(start>=0&&end>start,name);return source.slice(start,end);}
// Execute only the original private declaration slice with capturing stubs.
// Never evaluate install(), pose(), viewer lifecycle or assembly animation.
function original(id,cfg,layout){
  const source=read('structures/tray/'+id+'/'+id+'_3d.js'),panels=[],folds=[],openings=[];
  const clean=points=>{const a=points.filter((p,i)=>!i||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>1e-9).map(p=>({x:p.x,y:p.y}));if(a.length>1&&Math.hypot(a[0].x-a.at(-1).x,a[0].y-a.at(-1).y)<1e-9)a.pop();return a;};
  class Shape {constructor(){this.segments=[];}moveTo(x,y){this.start={x,y:-y};}lineTo(x,y){this.segments.push({type:'line',to:{x,y:-y}});}quadraticCurveTo(x,y,a,b){this.segments.push({type:'quadratic',control:{x,y:-y},to:{x:a,y:-b}});}closePath(){this.segments.push({type:'line',to:this.start});this.closed=true;}}
  class Geometry{constructor(shape){this.shape=shape;}translate(){}}
  class Mesh{constructor(geometry){this.geometry=geometry;}}
  const obj=id=>({id,name:id,position:{z:0},add(mesh){if(mesh.geometry)panels.find(p=>p.id===id).regions.push({shape:plain(mesh.geometry.shape)});}});
  const originalRoot={...runtime,THREE:{Shape,ExtrudeGeometry:Geometry,Mesh},PacVu3DViewer:{assignBoardFaceMaterials(){}}};
  const ctx=vm.createContext({cfg,layout,p:layout.params,root:originalRoot,document,T:.22,model:obj('base'),materials(){},...runtime});
  // runtime has document but not root, so capture stubs remain the only meshes.
  for(const name of ['samplePath','clipPolygon','rect',...(id==='TR002'?['outerFace']:[]),...(id==='TR003'?['arcPoints','leftTopCapMask','leftSideCapMask','mirrorX','mirrorY']:[])])vm.runInContext(fn(source,name),ctx);
  ctx.regionGroup=(name,outline,holes,masks)=>{panels.push({id:name,regions:masks.map(mask=>({polygon:plain(clean(ctx.clipPolygon(outline,mask)))}))});return obj(name);};
  ctx.regionMesh=(name,outline,mask,holes,cutouts=[])=>{panels.push({id:name,regions:[{polygon:plain(clean(ctx.clipPolygon(outline,mask)))}]});cutouts.forEach(bounds=>openings.push({panelId:name,bounds:plain(bounds)}));return obj(name);};
  ctx.polygonMesh=(name,polygon,cutouts=[])=>{panels.push({id:name,regions:[{polygon:plain(clean(polygon))}]});cutouts.forEach(bounds=>openings.push({panelId:name,bounds:plain(bounds)}));return obj(name);};
  ctx.mesh=(name,outline,mask,cutouts)=>ctx.polygonMesh(name,ctx.clipPolygon(outline,mask),cutouts);
  ctx.attach=(parent,mesh,a,b)=>{folds.push({parent:parent.id,child:mesh.name,a:plain(a),b:plain(b)});return obj(mesh.name);};
  if(id!=='TR003')vm.runInContext(fn(source,'tabMesh'),ctx);
  const token=id==='TR001'?'    const d=(layout.cutFillElement':id==='TR002'?'    const source=TR002_loadReferenceSvg()':'    const fill=TR003_buildPanelFill';
  const start=source.indexOf(token),end=source.indexOf('    model.position.set',start);assert.ok(start>=0&&end>start);
  vm.runInContext(source.slice(start,end),ctx);
  return {panels,folds,openings};
}
function check(report,id){
  assert.equal(report.validation.ok,true,JSON.stringify(report.validation.errors));assert.equal(validator.validate(plain(report.contract)).ok,true);
  assert.equal(report.complete,false);assert.deepEqual(report.validation.warnings.map(w=>w.path),['$.materials[0].thicknessMm']);
  const c=report.contract;assert.equal(c.panels.length,id==='TR003'?9:15);assert.equal(c.folds.length,id==='TR003'?8:14);
  assert.equal(c.panels.reduce((s,p)=>s+p.regions.length,0),id==='TR003'?9:25);
  for(const key of ['glues','insertions','bonds','layers','perforations'])assert.deepEqual(c[key],[]);
  assert.equal(c.source.mappingOnly,true);assert.ok(!JSON.stringify(c).includes('assemblyOrder'));
  const parents=new Map(c.folds.map(f=>[f.childPanelId,f.parentPanelId]));
  for(const p of c.panels){let at=p.id,steps=0;while(parents.has(at)){at=parents.get(at);assert.ok(++steps<20);}assert.equal(at,'base');assert.deepEqual(p.faceConvention,{outside:'negativeZ',inside:'positiveZ'});}
  return c;
}
const area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p.x*q.y-q.x*p.y;},0)/2);
function compare(c,expected){
  assert.equal(expected.panels.length,c.panels.length);
  for(const p of expected.panels){const actual=c.panels.find(q=>q.id===p.id);assert.ok(actual,p.id);assert.equal(actual.regions.length,p.regions.length,p.id);
    p.regions.forEach((region,i)=>{const shape=c.paths.find(p=>p.id===actual.regions[i].outerPathId);
      if(region.shape){assert.deepEqual({start:shape.start,segments:shape.segments.map(({id,...s})=>s),closed:shape.closed},region.shape);}
      else{const pts=[shape.start,...shape.segments.slice(0,-1).map(s=>s.to)];assert.ok(Math.abs(area(pts)-area(region.polygon))<1e-6,p.id+' area');for(const q of region.polygon)assert.ok(pts.some(p=>Math.hypot(p.x-q.x,p.y-q.y)<1e-7),p.id+' original vertex');}
    });
  }
  assert.deepEqual(c.folds.map(f=>({parent:f.parentPanelId,child:f.childPanelId,a:f.axis.a,b:f.axis.b})),expected.folds);
  assert.deepEqual(c.source.presentationOpenings.map(({panelId,bounds})=>({panelId,bounds})),expected.openings);
}
const changes=[['default',{}],['W only',{W:1.2}],['D only',{D:.8}],['H only',{H:1.3}],['combined',{W:.85,D:1.15,H:.75}]];
for(const [id,base] of Object.entries(defaults))for(const [label,multipliers] of changes){
  test(id+' '+label+(id==='TR001'&&label==='H only'?' original empty-region failure is explicitly rejected':' validation, source fidelity, private 3D regions/axes'),()=>{
    const cfg=Object.fromEntries(Object.entries(base).map(([k,v])=>[k,v*(multipliers[k]??1)])),layout=runtime[id+'_getLayout'](cfg.W,cfg.D,cfg.H,cfg),legacy={code:id,dimensions:cfg,options:{},layout},before=JSON.stringify(legacy);
    if(id==='TR001'&&label==='H only'){
      // Original build.regionMesh returns empty THREE.Group at H=182. Do not
      // fabricate panel paper merely to get a green schema validation result.
      const expected=original(id,cfg,layout);assert.equal(expected.panels.find(p=>p.id==='base').regions[0].polygon.length,0);
      assert.throws(()=>adapter.fromLegacy(id,legacy,cfg,runtime),/original 3D region is empty: base.region0/);
      assert.throws(()=>adapter.convert(id,cfg,runtime),/original 3D region is empty: base.region0/);
      assert.equal(JSON.stringify(legacy),before);return;
    }
    const report=adapter.fromLegacy(id,legacy,cfg,runtime),c=check(report,id);assert.equal(JSON.stringify(legacy),before);assert.deepEqual(c,adapter.convert(id,cfg,runtime).contract);assert.deepEqual(c.parameters.dimensions,cfg);
    for(const [field,prefix] of [['cutElements','source.cut.'],['foldElements','source.fold.']])layout[field].forEach((element,i)=>{const p=c.paths.find(p=>p.id===prefix+i);assert.equal(p.source.element,element);const numbers=element.match(/d="([^"]+)"/)[1].match(/-?\d*\.?\d+/g).map(Number);assert.deepEqual([p.start,...p.segments.map(s=>s.to)].flatMap(p=>[p.x,p.y]),plain(numbers));});
    compare(c,original(id,cfg,layout));
    c.folds.forEach(f=>assert.deepEqual(f.profile,{kind:'crease',thicknessAware:true,neutralAxis:'material-defined'}));
  });
}
test('TR001 U-cut stays open, lock cutouts closed, 25 regions retain two rigid tabs',()=>{
  const c=check(adapter.convert('TR001',{},runtime),'TR001');assert.equal(c.holes.length,16);assert.equal(c.slits.length,2);
  for(const s of c.slits){assert.equal(s.source.kind,'u-cut');assert.equal(s.kerfMm,0);assert.equal(c.paths.find(p=>p.id===s.pathId).closed,false);assert.equal(s.panelIds.length,2);}
  for(const id of ['upper-lock-opening','lower-lock-opening']){const h=c.holes.find(h=>h.id===id);assert.equal(c.paths.find(p=>p.id===h.boundaryPathId).closed,true);assert.ok(h.panelIds.includes('base'));}
  assert.equal(c.panels.find(p=>p.id==='base').regions.length,5);assert.equal(c.panels.find(p=>p.id==='panel-1-back').regions.length,4);assert.equal(c.panels.find(p=>p.id==='panel-1-front').regions.length,4);
  assert.ok(!c.folds.some(f=>f.childPanelId.includes('u-cut')));
});
test('TR002 actual 51mm lock cutout and 50mm U-cut are not 70/68mm display masks',()=>{
  const r=adapter.convert('TR002',{},runtime),c=check(r,'TR002');assert.equal(c.holes.length,6);assert.equal(c.slits.length,3);
  const width=id=>{const p=c.paths.find(p=>p.id===id),xs=[p.start,...p.segments.map(s=>s.to)].map(p=>p.x);return Math.max(...xs)-Math.min(...xs);};
  assert.ok(Math.abs(width(c.holes.find(h=>h.id==='upper-lock-opening').boundaryPathId)-51)<.001);
  assert.ok(Math.abs(width(c.slits.find(h=>h.id==='upper-u-cut').pathId)-50)<.001);
  assert.equal(c.source.presentationOpenings[0].bounds.x2-c.source.presentationOpenings[0].bounds.x1,68);
  assert.ok(r.diagnostics.some(d=>d.code==='SOURCE_ENDPOINT_GAPS'));assert.equal(c.holes.find(h=>h.id==='frontHole1').panelIds[0],'panel-1-back');
});
test('TR003 L-cuts and edge slits never become holes or horizontal corner folds',()=>{
  const c=check(adapter.convert('TR003',{},runtime),'TR003');assert.equal(c.holes.length,0);assert.equal(c.slits.length,8);
  assert.equal(c.slits.filter(s=>s.source.kind==='l-cut').length,4);assert.equal(c.slits.filter(s=>s.source.kind==='slit').length,4);
  c.slits.forEach(s=>{assert.equal(s.kerfMm,0);assert.equal(c.paths.find(p=>p.id===s.pathId).closed,false);});
  assert.equal(c.source.presentationOpenings.length,8);assert.ok(c.source.presentationOpenings.every(p=>p.manufacturingHole===false));
  assert.ok(c.folds.filter(f=>f.childPanelId.startsWith('panel-3')).every(f=>f.parentPanelId.startsWith('panel-2')));
  for(const index of [0,1,2,7,8,9,15,16,17,22,23,24])assert.ok(c.cuts.some(k=>k.pathId==='source.cut.'+index));
});
test('TR001 compound crease segments are separate; source orphan and perforations remain unresolved',()=>{
  const r=adapter.convert('TR001',{},runtime),c=check(r,'TR001');
  assert.deepEqual(c.folds.find(f=>f.childPanelId==='panel-2-back-left').segments,[{pathId:'source.fold.4.segment1'}]);
  assert.ok(c.folds.find(f=>f.childPanelId==='panel-4-back').segments.some(s=>s.pathId==='source.fold.4.segment0'));
  assert.equal(c.source.unresolvedFeatures.filter(f=>f.kind==='unassigned-crease').length,1);assert.equal(c.source.unresolvedFeatures.filter(f=>f.kind==='perforation').length,6);
  assert.ok(!c.folds.some(f=>f.segments.some(s=>s.pathId==='source.fold.16')));
});
for(const [id,input,holes] of [['TR001',{frontBackHoleCount:2,leftRightHoleCount:3},12],['TR001',{frontBackHoleCount:99,leftRightHoleCount:99},16],['TR002',{frontBackHoleCount:0,leftRightHoleCount:0},2],['TR002',{frontBackHoleCount:3,leftRightHoleCount:2,frontBackHoleWidth:38,frontBackHoleHeight:14,leftRightHoleDiameter:12},12],['TR002',{frontBackHoleCount:8,leftRightHoleCount:8,frontBackHoleWidth:999,frontBackHoleHeight:999,leftRightHoleDiameter:999},34],['TR003',{frontBackHoleCount:8,leftRightHoleCount:8},0]])test(id+' source Hole option '+JSON.stringify(input),()=>{
  const c=check(adapter.convert(id,input,runtime),id);assert.equal(c.holes.length,holes);
  const b=defaults[id],l=runtime[id+'_getLayout'](b.W,b.D,b.H,input);
  l.holes.forEach((h,i)=>{const feature=c.holes.find(f=>f.id===h.id);assert.deepEqual(feature.source.original,plain(h));assert.equal(c.paths.find(p=>p.id===feature.boundaryPathId).source.element,l.holeElements[i]);});
});
test('binding kind only follows exact source coverage; unmatched legacy edges remain explicit diagnostics',()=>{
  for(const id of Object.keys(defaults)){
    const r=adapter.convert(id,{},runtime),c=check(r,id);assert.ok(r.diagnostics.some(d=>d.code==='LEGACY_AXIS_DIFFERS_FROM_CREASE'));
    let unmatched=0,partition=0;
    for(const p of c.panels)for(const region of p.regions){const path=c.paths.find(p=>p.id===region.outerPathId);assert.equal(region.boundaryBindings.length,path.segments.length);
      for(const b of region.boundaryBindings)if(b.kind==='continuous'){assert.equal(b.featureId,undefined);if(b.source.mechanicalMapping==='unresolved')unmatched++;else{assert.equal(b.source.kind,'same-panel-region-partition');partition++;}}
    }
    assert.equal(unmatched,r.diagnostics.filter(d=>d.code==='UNRESOLVED_LEGACY_BOUNDARY').length);assert.ok(unmatched>0);if(id!=='TR003')assert.ok(partition>0);
    for(const slit of c.slits)for(const sourcePath of slit.source.sourcePathIds)assert.ok(c.cuts.some(k=>k.pathId===sourcePath&&k.kind==='internal'));
  }
});
test('bad dimensions, mismatched snapshots and missing dependencies fail loudly',()=>{
  for(const id of Object.keys(defaults)){
    for(const W of [0,-1,NaN,Infinity])assert.throws(()=>adapter.convert(id,{W},runtime),/invalid dimension/);
    assert.throws(()=>adapter.convert(id,{},{}),/missing original Layout/);
    const dims=defaults[id],l=runtime[id+'_getLayout'](dims.W,dims.D,dims.H,{}),snap={code:id,dimensions:dims,layout:l};
    assert.throws(()=>adapter.fromLegacy(id,{...snap,code:'BAD'},{},runtime),/mismatch/);
    assert.throws(()=>adapter.fromLegacy(id,snap,{W:dims.W+1},runtime),/mismatch/);
    assert.throws(()=>adapter.fromLegacy(id,{...snap,layout:{...l,foldElements:[]}},{},runtime),/recipe changed/);
  }
});
