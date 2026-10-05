'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const adapter=require('../PacVu3DContractAdapter.js'),validator=require('../PacVu3DContract.js');
const {loadRuntime,originalSleeve,read}=require('./PacVu3DContractAdapter.special.runtime.cjs');
const r=loadRuntime(),copy=v=>JSON.parse(JSON.stringify(v)),U=.3527778112205911;
const defaults={T006:{W:100,D:40,H:220},T010:{W:80,D:72,H:190},GA001:{W:241,D:127,H:127},S001:{W:298,D:61,H:292}};
const clean=ps=>{const p=ps.filter((q,i)=>!i||Math.hypot(q.x-ps[i-1].x,q.y-ps[i-1].y)>1e-9);if(p.length>1&&Math.hypot(p[0].x-p.at(-1).x,p[0].y-p.at(-1).y)<1e-9)p.pop();return copy(p);};
const check=x=>{assert.equal(x.validation.ok,true,JSON.stringify(x.validation.errors));assert.equal(x.complete,false);return x.contract;};
const polygon=(c,pid,i=0)=>{const p=c.paths.find(p=>p.id===c.panels.find(p=>p.id===pid).regions[i].outerPathId);return clean([p.start,...p.segments.map(s=>s.to)]);};
function snapshot(id,cfg){if(id==='T006'||id==='T010')return r[id+'_3D_BUILD_CONTRACT'](cfg);const layout=r[id+'_getLayout'](cfg,cfg),spec=id==='GA001'?layout.config:layout.specs.outer;return {code:id,dimensions:{W:spec.W,D:spec.D,H:spec.H},layout,options:cfg};}
function pathsMatch(c){
  for(const path of c.paths.filter(p=>p.source?.original)){
    const e=path.source.original;if(typeof e==='object'&&!e.d)continue;
    const d=typeof e==='string'?r.T001_elementToPathD(e):e.d,unit=c.source.sourceUnitToMm,p=r.T001_parseAbsolutePath(r.T001_transformPathD(d,{point:(x,y)=>({x,y})})),point=q=>({x:q.x*unit,y:q.y*unit});
    assert.deepEqual(path.start,point(p.start),path.id);
    p.segments.forEach((s,i)=>{assert.deepEqual(path.segments[i].to,point(s.to));if(s.type==='C'){assert.deepEqual(path.segments[i].control1,point(s.c1));assert.deepEqual(path.segments[i].control2,point(s.c2));}});
  }
}
for(const id of Object.keys(defaults))for(const [label,scale] of [['default',[1,1,1]],['W only',[1.15,1,1]],['D only',[1,1.15,1]],['H only',[1,1,1.15]],['combined',[.9,1.1,.9]]])test(id+' '+label+': Contract and all original coordinates/regions',()=>{
  const cfg=Object.fromEntries(['W','D','H'].map((k,i)=>[k,defaults[id][k]*scale[i]])),s=snapshot(id,cfg),before=JSON.stringify(s),c=check(adapter.fromLegacy(id,s,cfg,r));assert.equal(JSON.stringify(s),before);pathsMatch(c);
  for(const k of ['W','D','H'])assert.equal(c.parameters.dimensions[k],s.dimensions[k]);
  if(id==='T006'||id==='T010')s.panels.forEach(p=>{const regions=id==='T006'?(p.topology?p.topology.cells.map(cell=>cell.points):[p.polygon]):p.polygons;assert.equal(c.panels.find(q=>q.id==='sheet.'+p.id).regions.length,regions.length);regions.forEach((poly,i)=>assert.deepEqual(polygon(c,'sheet.'+p.id,i),clean(poly)));});
  else if(id==='GA001')Object.entries(s.layout.panels).forEach(([name,poly])=>assert.deepEqual(polygon(c,'sheet.'+name),clean(poly.map(q=>({x:q.x*(25.4/72),y:q.y*(25.4/72)})))));
  else for(const pid of ['outerSleeve','innerTray','insertPad']){
    const old=originalSleeve(r,s.layout,pid);for(const [name,polys] of Object.entries(old.contours)){const ps=pid==='innerTray'?polys:[polys];assert.equal(c.panels.find(p=>p.id===pid+'.'+name).regions.length,ps.length);ps.forEach((poly,i)=>assert.deepEqual(polygon(c,pid+'.'+name,i),clean(poly.map(q=>({x:q.x*U,y:q.y*U}))),pid+'.'+name));}
    old.axes.forEach(f=>{const x=c.folds.find(x=>x.childPanelId===pid+'.'+f.child),a=Array.isArray(f.a)?f.a:[f.a.x,f.a.y],b=Array.isArray(f.b)?f.b:[f.b.x,f.b.y],ma=old.mp(...a),mb=old.mp(...b);assert.equal(x.parentPanelId,pid+'.'+f.parent);assert.deepEqual(x.axis.a,{x:ma.x*U,y:ma.y*U});assert.deepEqual(x.axis.b,{x:mb.x*U,y:mb.y*U});});
  }
  assert.deepEqual(c.glues,[]);assert.deepEqual(c.insertions,[]);assert.deepEqual(c.bonds,[]);assert.equal(validator.validate(JSON.parse(JSON.stringify(c))).ok,true);
});
test('T006 slit banks / continuous edges / perforation / tear ligaments never become fake Fold',()=>{
  const s=snapshot('T006',{}),c=check(adapter.convert('T006',{},r)),t=s.panels.find(p=>p.id==='frontLock').topology,p=c.panels.find(p=>p.id==='sheet.frontLock');
  assert.equal(c.folds.length,12);assert.equal(c.slits.length,2);assert.equal(c.holes.length,1);assert.equal(p.regions.length,3);assert.equal(c.perforations.length,0);
  assert.deepEqual(c.source.frontLockTopology.junctions,copy(t.junctions));assert.equal(c.source.unresolvedFeatures.filter(f=>f.kind==='perforation').length,4);assert.equal(c.source.previewOnly.hatchElements.length,16);
  assert.ok(p.regions.flatMap(g=>g.boundaryBindings).some(b=>b.kind==='slit'));assert.ok(p.regions.flatMap(g=>g.boundaryBindings).some(b=>b.kind==='continuous'&&b.source.kind==='source-tessellation'));
  assert.ok(!c.folds.some(f=>/tear|slit|tongue|continuous/.test(f.id)));assert.equal(c.source.tearTopology.manufacturingCut,false);assert.equal(c.source.tearTopology.behaviorImplemented,false);
  const lower=c.source.tearTopology.residualLigaments[1];assert.ok(Math.abs(Math.hypot(lower.a.x-lower.b.x,lower.a.y-lower.b.y)-.434975)<.001);
  s.folds.forEach((f,i)=>{assert.deepEqual(c.folds[i].axis.a,copy(f.a));assert.deepEqual(c.folds[i].axis.b,copy(f.b));});
});
test('T010 every provided polygon becomes a region, including multiple polygons in one panel',()=>{
  const s=snapshot('T010',{}),first=s.panels[0],updated={...s,panels:s.panels.map((p,i)=>i?p:{...p,polygons:[...p.polygons,p.polygons[0].map(q=>({x:q.x+.1,y:q.y+.1}))]})},c=check(adapter.fromLegacy('T010',updated,{},r));assert.equal(c.panels[0].regions.length,2);assert.deepEqual(polygon(c,'sheet.'+first.id,1),clean(updated.panels[0].polygons[1]));
});
test('T010 source U-cut, punch paths, return folds and 3D material bridges remain separate',()=>{
  const c=check(adapter.convert('T010',{},r));assert.equal(c.cuts.length,24);assert.equal(c.slits.length,1);assert.equal(c.holes.length,0);assert.equal(c.folds.length,14);assert.equal(c.folds.filter(f=>f.profile.kind==='returnFold').length,6);assert.equal(c.source.unresolvedFeatures.filter(f=>f.kind==='punch-perforation').length,16);assert.equal(c.source.displayOutline.manufacturingCut,false);
  assert.ok(!c.cuts.some(k=>k.pathId.includes('guide')));const split=c.paths.filter(p=>p.id.startsWith('sheet.fold.10.segment'));assert.equal(split.length,2);assert.deepEqual(split[0].start,split[1].segments[0].to);assert.deepEqual(c.source.relationships[1].pairs,[{wing:'bottomBackWing',receiver:'bottomSideLeft'},{wing:'bottomFrontWing',receiver:'bottomSideRight'}]);
});
for(const input of [{handleHoleWidth:65,handleHoleHeight:18},{handleHoleWidth:100,handleHoleHeight:30},{W:80,D:90,H:127},{handleHoleWidth:0,handleHoleHeight:-1}])test('GA001 source handle/minimum options '+JSON.stringify(input),()=>{
  const l=r.GA001_getLayout(input),c=check(adapter.convert('GA001',input,r));assert.equal(c.parameters.dimensions.W,l.config.W);assert.equal(c.parameters.dimensions.D,l.config.D);assert.equal(c.parameters.options.handleHoleWidth,l.config.handleHoleWidth);assert.equal(c.parameters.options.handleHoleHeight,l.config.handleHoleHeight);pathsMatch(c);assert.deepEqual(c.holes.map(h=>h.panelIds),[['sheet.handleBack'],['sheet.gableA'],['sheet.gableB'],['sheet.handleFront']]);
});
test('GA001 original 3D parent-child axes match source-transformed Layout, once to mm',()=>{
  const l=r.GA001_getLayout({W:260,D:140,H:155}),src=read('structures/gable/GA001/GA001_3d_test.js'),axes=[],ctx=vm.createContext({g:l.grid,backSplit:l.foldLines[10].y1,frontSplit:l.foldLines[13].y1,sheet:'back',THREE:{MathUtils:{degToRad:n=>n*Math.PI/180}},attach:(parent,child,a,b)=>{axes.push({parent,child,a,b});return child;}});
  const start=src.indexOf("    attach(sheet,'glue'"),end=src.indexOf('    function pose',start);vm.runInContext(src.slice(start,end),ctx);const c=check(adapter.convert('GA001',{W:260,D:140,H:155},r));
  axes.forEach(f=>{const x=c.folds.find(x=>x.childPanelId==='sheet.'+f.child);assert.equal(x.parentPanelId,'sheet.'+f.parent);for(const k of ['a','b'])assert.deepEqual(x.axis[k],{x:f[k].x*25.4/72,y:f[k].y*25.4/72});});assert.equal(axes.length,14);
});
for(const options of [{outerStringHoleEnabled:false},{outerMainHoleDia:28,outerSmallHoleDia:8,outerHoleOffsetY:5},{paperThickness:.6,slideGap:2,trayGap:1.5,padGap:1.3,productGap:1.4},...['baseline','bottle3','jar3','bottle1Jar2'].map(productFitPreset=>({productFitPreset})),{viewMode:'Outer Only',showInnerTray:false,showInsertPad:false,insertPadEnabled:false},{viewMode:'Insert Only'}, {holeCount:1}])test('S001 original option rules '+JSON.stringify(options),()=>{
  const c=check(adapter.convert('S001',options,r)),l=r.S001_getLayout(options,options);assert.equal(c.parts.length,3);assert.deepEqual(c.parts.map(p=>p.id),['outerSleeve','innerTray','insertPad']);assert.equal(c.holes.length,l.rawParts.outerSleeve.holeElements.length);assert.equal(c.source.unresolvedFeatures.filter(f=>f.kind==='product-cut-guide').length,l.rawParts.insertPad.holeElements.length);assert.deepEqual(c.source.partSpecs,copy(l.specs));pathsMatch(c);
  c.folds.forEach(f=>{const pa=c.panels.find(p=>p.id===f.parentPanelId),ch=c.panels.find(p=>p.id===f.childPanelId);assert.equal(pa.partId,ch.partId);assert.equal(f.axis.partId,pa.partId);});
  assert.equal(c.holes.filter(h=>h.partId==='insertPad').length,0);assert.equal(c.folds.filter(f=>f.axis.partId==='insertPad').length,4);
});
test('S001 preview placement/visibility cannot move, remove or merge local Parts',()=>{
  const a=check(adapter.convert('S001',{},r)),b=check(adapter.convert('S001',{viewMode:'Inner Only',showOuterSleeve:false,showInsertPad:false},r));assert.deepEqual(a.paths,b.paths);assert.deepEqual(a.panels,b.panels);assert.deepEqual(a.folds,b.folds);assert.ok(a.source.partPlacement.some(p=>p.translation.x!==0||p.translation.y!==0));assert.equal(a.panels.length,40);assert.equal(a.folds.length,37);assert.ok(a.panels.some(p=>p.regions.length>1));
});
for(const id of Object.keys(defaults))test(id+' source builder/Layout called once, round trip and failure diagnostics',()=>{
  const name=id==='T006'||id==='T010'?id+'_3D_BUILD_CONTRACT':id+'_getLayout',runtime={...r},fn=r[name];let calls=0;runtime[name]=(...args)=>{calls++;return fn(...args);};check(adapter.convert(id,{},runtime));assert.equal(calls,1);
  const s=snapshot(id,{});assert.deepEqual(check(adapter.fromLegacy(id,s,{},r)),check(adapter.convert(id,{},r)));assert.throws(()=>adapter.convert(id,{W:NaN},r),/invalid dimension/);assert.throws(()=>adapter.convert(id,{},{}),/missing source/);assert.throws(()=>adapter.fromLegacy(id,{...s,dimensions:{...s.dimensions,W:1}},{},r),/mismatch|recipe/);
});
test('unconfirmed S001 product-fit dependency fails explicitly rather than silently using another insert',()=>{
  const runtime={...r,S001_runProductFitPreset:undefined};
  assert.throws(()=>adapter.convert('S001',{productFitPreset:'jar3'},runtime),/missing source dependency S001_runProductFitPreset/);
});
