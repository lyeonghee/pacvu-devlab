'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadRuntime}=require('./PacVu3DContractAdapter.runtime.cjs');
const adapter=require('../PacVu3DContractAdapter.js'),mapping=require('../PacVu3DContractShippingMapping.js'),validator=require('../PacVu3DContract.js');
const {svgPathProperties}=require(process.env.PACVU_SVG_PATH_PROPERTIES||'svg-path-properties');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),plain=v=>JSON.parse(JSON.stringify(v));
const runtime=loadRuntime({extended:true,svgPathFactory(){let p;return{setAttribute(name,d){assert.equal(name,'d');p=new svgPathProperties(d);},getTotalLength(){return p.getTotalLength();},getPointAtLength(t){return p.getPointAtLength(t);}};}});
const defaults={R002:{W:425,D:335,H:103},R003:{W:350,D:230,H:220},R004:{W:280,D:220,H:190}};
const inputFor={};
for(const id of Object.keys(defaults)){
  for(const suffix of ['spec','layout'])vm.runInContext(read('structures/shipping/rsc/'+id+'/'+id+'_'+suffix+'.js'),runtime);
  // Evaluate only the ORIGINAL declaration block (SOURCE_OUTLINE/inputFor).
  // No source-file edits, UI creation, module rewriting or create/open calls.
  const source=read('structures/shipping/rsc/'+id+'/'+id+'_3d.js');
  const start=source.indexOf('  const SOURCE_OUTLINE'),end=source.indexOf('  let master=null',start);
  assert.ok(start>=0&&end>start);
  inputFor[id]=vm.runInNewContext(source.slice(start,end)+';inputFor',{global:runtime});
}
const area=points=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0)/2);
const expectedFolds={'body-front-sideL':'f-4','body-sideL-back':'f-7','body-back-sideR':'f-10','body-front-glue':'f-2','bottom-sideL':'f-6','bottom-sideR':'f-12','bottom-front':'f-3','bottom-back':'f-9','top-sideL':'f-5','top-sideR':'f-11','top-front':'f-1','top-back':'f-8'};
function check(report){
  assert.equal(report.validation.ok,true,JSON.stringify(report.validation.errors));
  assert.equal(validator.validate(plain(report.contract)).ok,true);
  assert.equal(report.contract.panels.length,13);assert.equal(report.contract.folds.length,12);
  assert.equal(report.complete,false);assert.ok(report.validation.warnings.some(w=>w.path==='$.materials[0].thicknessMm'));
  assert.ok(!report.diagnostics.some(d=>d.code==='UNMAPPED_BOUNDARY'));
  assert.equal(report.contract.materials[0].thicknessMm,null);
  assert.ok(report.contract.folds.every(f=>f.profile.kind==='crease'&&f.profile.scoreDepthMm===undefined));
  for(const key of ['glues','insertions','bonds'])assert.deepEqual(report.contract[key],[]);
  return report.contract;
}
function verifySource(id,cfg){
  const sourceInput=inputFor[id](cfg),legacy=runtime.R001_3D_MASTER.buildContract(sourceInput),before=JSON.stringify(legacy);
  const report=adapter.convert(id,cfg,runtime),c=check(report);
  assert.equal(JSON.stringify(legacy),before);
  const from=adapter.fromLegacy(id,legacy,cfg,runtime);
  assert.deepEqual(from.contract,c);
  assert.equal(c.source.builder,'R001_3D_MASTER.buildContract');
  assert.equal(c.source.shippingMapping.outerPath,sourceInput.__outerPath);
  assert.deepEqual(c.source.shippingMapping.coordinateMaps,{x:plain(legacy.layout.spec.xMap),y:plain(legacy.layout.spec.yMap)});
  const paths=new Map(c.paths.map(p=>[p.id,p]));
  legacy.panels.forEach(p=>{
    const panel=c.panels.find(v=>v.id===p.id),path=paths.get(panel.regions[0].outerPathId),points=[path.start,...path.segments.map(s=>s.to)];
    assert.ok(Math.abs(area(points)-area(p.polygon))<1e-6,p.id+' source area');
    for(const v of p.polygon)assert.ok(points.some(q=>Math.hypot(q.x-v.x,q.y-v.y)<1e-7),p.id+' source vertex');
    assert.deepEqual(panel.faceConvention,{outside:'negativeZ',inside:'positiveZ'});
  });
  legacy.folds.forEach(f=>{
    const converted=c.folds.find(v=>v.id===f.id),sourcePath=paths.get(converted.segments[0].pathId);
    assert.deepEqual(converted.axis,{partId:'sheet',a:plain(f.a),b:plain(f.b)});
    assert.equal(converted.parentPanelId,f.parentId);assert.equal(converted.childPanelId,f.childId);
    const crease=legacy.layout.foldLines.find(v=>v.id===expectedFolds[f.id]);
    assert.equal(sourcePath.source.id,crease.id);assert.deepEqual(sourcePath.start,{x:crease.x1,y:crease.y1});
    assert.deepEqual(sourcePath.segments[0].to,{x:crease.x2,y:crease.y2});
  });
  assert.equal(c.cuts.filter(k=>k.kind==='outer').length,10);
  assert.ok(!c.cuts.some(k=>k.pathId==='cut.outline.path'));
  legacy.layout.cutPathsMm.forEach((d,i)=>{
    const p=paths.get('cut.source.path.'+i),tokens=d.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g).map(Number);
    assert.equal(p.source.d,d);assert.equal(p.source.original,legacy.layout.cutPaths[i]);
    assert.deepEqual([p.start,...p.segments.map(s=>s.to)].flatMap(p=>[p.x,p.y]),tokens,'source Cut coordinates are unchanged');
  });
  const parents=new Map(c.folds.map(f=>[f.childPanelId,f.parentPanelId]));
  for(const p of c.panels){let node=p.id,n=0;while(parents.has(node)){node=parents.get(node);assert.ok(++n<14);}assert.equal(node,'front');}
  assert.equal(JSON.stringify(legacy),before);
  return {c,report,legacy};
}
for(const [id,base] of Object.entries(defaults)){
  for(const [label,overrides] of [['default',{}],['W only',{W:base.W*1.2}],['D only',{D:base.D*.8}],['H only',{H:base.H*1.3}],['combined',{W:base.W*.85,D:base.D*1.1,H:base.H*.75}]]){
    test(id+' original inputFor/R001 geometry, Cut/Fold coordinates and Contract: '+label,()=>verifySource(id,{...base,...overrides}));
  }
  test(id+' panel name correspondence and source discrepancies are explicit',()=>{
    const report=adapter.convert(id,defaults[id],runtime),c=check(report);
    assert.equal(c.source.shippingMapping.panelCorrespondence.length,13);
    assert.equal(c.source.shippingMapping.panelCorrespondence.find(p=>p.panelId==='topSideL').layoutPanelId,'topFlapSideL');
    assert.equal(c.source.shippingMapping.panelCorrespondence.find(p=>p.panelId==='bottomBack').layoutPanelId,'botFlapBack');
    assert.ok(report.diagnostics.some(d=>d.code==='SOURCE_AXIS_MISMATCH'));
  });
}
test('R002 preserves D-2 last wall and sampled source outline, not R001 outline',()=>{
  const {c}=verifySource('R002',defaults.R002);
  assert.equal(c.source.shippingMapping.coordinateMaps.x.target.at(-1),2*425+2*335-2);
  assert.ok(c.source.shippingMapping.sourceOutline.includes('c0,3.869'));
  assert.ok(c.source.shippingMapping.outerPath.startsWith('M-35.0001'));
});
for(const [label,options] of [['disabled',{handleHoleEnabled:false}],['custom',{handleHoleWidth:92,handleHoleHeight:31}],['clamped',{W:130,D:65,H:48,handleHoleWidth:200,handleHoleHeight:100}],['source defaults for zero',{handleHoleWidth:0,handleHoleHeight:0}]]){
  test('R004 Handle Hole exact arcs/side ownership: '+label,()=>{
    const {c,legacy}=verifySource('R004',{...defaults.R004,...options});
    assert.equal(c.holes.length,options.handleHoleEnabled===false?0:2);
    assert.equal(c.perforations.length,0,'renderer layer name is not a perforation pattern');
    assert.equal(c.source.shippingMapping.handleCutPaths.length,2,'disabled original paths remain source-only');
    for(const [i,panelId] of ['sideL','sideR'].entries()){
      const panel=c.panels.find(p=>p.id===panelId);
      if(options.handleHoleEnabled===false){assert.deepEqual(panel.regions[0].holeIds,[]);continue;}
      const hole=c.holes.find(h=>h.id==='handle.'+panelId),p=c.paths.find(p=>p.id===hole.boundaryPathId),old=legacy.panels.find(p=>p.id===panelId).holes[0];
      assert.deepEqual(hole.panelIds,[panelId]);assert.deepEqual(panel.regions[0].holeIds,[hole.id]);
      assert.equal(p.source.d,legacy.layout.handleCutPaths[i]);assert.equal(p.segments.filter(s=>s.type==='arc').length,4);
      const points=[p.start,...p.segments.map(s=>s.to)],xs=points.map(p=>p.x),ys=points.map(p=>p.y);
      assert.ok(Math.abs(Math.max(...xs)-Math.min(...xs)-old.width)<.0002);assert.ok(Math.abs(Math.max(...ys)-Math.min(...ys)-old.height)<.0002);
      assert.ok(Math.abs((Math.max(...xs)+Math.min(...xs))/2-old.cx)<.0001);assert.ok(Math.abs((Math.max(...ys)+Math.min(...ys))/2-old.cy)<.0001);
    }
    c.panels.filter(p=>!['sideL','sideR'].includes(p.id)).forEach(p=>assert.deepEqual(p.regions[0].holeIds,[]));
  });
}
test('R004 repeated option changes have no stale holes or source mutation',()=>{
  const enabled=adapter.convert('R004',{handleHoleWidth:85},runtime),saved=JSON.stringify(enabled.contract);
  const disabled=adapter.convert('R004',{handleHoleEnabled:false},runtime),again=adapter.convert('R004',{handleHoleWidth:85},runtime);
  assert.equal(disabled.contract.holes.length,0);assert.equal(JSON.stringify(enabled.contract),saved);assert.deepEqual(enabled.contract,again.contract);
});
test('R001 builder is reused exactly once, with no renderer/create call',()=>{
  let calls=0;const original=runtime.R001_3D_MASTER;
  const isolated={...runtime,R001_3D_MASTER:{buildContract(input){calls++;return original.buildContract(input);},create(){throw new Error('Viewer forbidden');}}};
  check(adapter.convert('R003',{},isolated));assert.equal(calls,1);
});
test('source recipe/ownership/option mismatches and invalid dimensions are rejected',()=>{
  const source=mapping.build('R004',{},runtime);
  const modified={...source,panels:source.panels.map(p=>({...p,holes:plain(p.holes)}))};
  modified.panels.find(p=>p.id==='front').holes.push(modified.panels.find(p=>p.id==='sideL').holes[0]);
  assert.throws(()=>adapter.fromLegacy('R004',modified,{},runtime),/ownership/);
  assert.throws(()=>adapter.fromLegacy('R004',source,{handleHoleEnabled:false},runtime),/option/);
  assert.throws(()=>adapter.fromLegacy('R004',source,{handleHoleWidth:120},runtime),/width option/);
  const bad={...source,layout:{...source.layout,foldLines:source.layout.foldLines.slice(1)}};
  assert.throws(()=>adapter.fromLegacy('R004',bad,{},runtime),/recipe changed/);
  assert.throws(()=>adapter.convert('R002',{D:-1},runtime),/dimension/);
  assert.throws(()=>adapter.convert('R004',{handleHoleWidth:-3},runtime),/invalid source handle/);
});
test('browser UMD mapping dependency is explicit; old shipping path stays independent',()=>{
  vm.runInContext(read('viewer/PacVu3DContract.js'),runtime);
  vm.runInContext(read('viewer/PacVu3DContractAdapter.js'),runtime);
  assert.throws(()=>runtime.PacVu3DContractAdapter.convert('R003',{}),/ShippingMapping is required/);
  vm.runInContext(read('viewer/PacVu3DContractShippingMapping.js'),runtime);
  vm.runInContext(read('viewer/PacVu3DContractAdapter.js'),runtime);
  assert.equal(runtime.PacVu3DContractAdapter.convert('R004',{}).validation.ok,true);
});
