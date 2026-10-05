'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const a=require('../PacVu3DContractAdapter.js'),snapshot=require('../PacVu3DContractBakeryCakeSource.js');
const {loadRuntime,originalB001,originalB002,originalC001,originalC001Handles,functionText,read}=require('./PacVu3DContractAdapter.bakeryCake.runtime.cjs');
const r=loadRuntime(),copy=v=>JSON.parse(JSON.stringify(v));
const clean=ps=>{const p=ps.filter((q,i)=>!i||Math.hypot(q.x-ps[i-1].x,q.y-ps[i-1].y)>1e-9);if(p.length>1&&Math.hypot(p[0].x-p.at(-1).x,p[0].y-p.at(-1).y)<1e-9)p.pop();return copy(p);};
const check=x=>{assert.equal(x.validation.ok,true,JSON.stringify(x.validation.errors));assert.equal(x.complete,false);return x.contract;};
const polygon=(c,id,region='paper')=>{const p=c.paths.find(p=>p.id===c.panels.find(p=>p.id===id).regions.find(p=>p.id===region).outerPathId);return clean([p.start,...p.segments.map(s=>s.to)]);};
const defaults={B001:{W:160,D:110,H:80},B002:{W:136,D:67,H:137},C001:{W:277,D:275,H:140}};
const {svgPathProperties}=require(process.env.PACVU_SVG_PATH_PROPERTIES||'svg-path-properties');
const xy=p=>p.x+' '+p.y;
const pathD=p=>'M'+xy(p.start)+' '+p.segments.map(s=>s.type==='line'?'L'+xy(s.to):s.type==='cubic'?'C'+xy(s.control1)+' '+xy(s.control2)+' '+xy(s.to):'A'+[s.rx,s.ry,s.rotationDeg,+s.largeArc,+s.sweep,s.to.x,s.to.y].join(' ')).join(' ')+(p.closed?' Z':'');
for(const id of Object.keys(defaults))test(id+' every original Cut/Fold/Opening curve remains geometrically identical',()=>{
  const c=check(a.convert(id,{},r)),l=id==='C001'?r.C001_getLayout({}):r[id+'_getLayout'](defaults[id].W,defaults[id].D,defaults[id].H,{});
  for(const p of c.paths.filter(p=>p.source?.element)){
    let el=p.source.element;if(id==='C001')el=r.C001_transformElement(el,'',l);
    if(el.startsWith('<rect')){const values=k=>Number(el.match(new RegExp('\\b'+k+'="([^"]+)"'))?.[1]||0),rx=values('rx'),ry=values('ry')||rx;assert.equal(p.segments.filter(s=>s.type==='arc').length,4);assert.ok(p.segments.filter(s=>s.type==='arc').every(s=>s.rx===rx&&s.ry===ry));assert.deepEqual(p.start,{x:values('x')+rx,y:values('y')});continue;}
    const expected=new svgPathProperties(r.T001_elementToPathD(el)),actual=new svgPathProperties(pathD(p)),scale=id==='B002'?l.transform.a:1;
    assert.ok(Math.abs(expected.getTotalLength()*scale-actual.getTotalLength())<.002,p.id+' length');
    for(let i=0;i<=20;i++){const q=expected.getPointAtLength(expected.getTotalLength()*i/20),v=actual.getPointAtLength(actual.getTotalLength()*i/20);assert.ok(Math.hypot(q.x*scale-v.x,q.y*scale-v.y)<.002,p.id+' point '+i);}
  }
});
for(const id of Object.keys(defaults))test(id+' default validation; no physical/assembly operations or caller mutation',()=>{
  const input={},before=JSON.stringify(input),x=a.convert(id,input,r),c=check(x);assert.equal(JSON.stringify(input),before);assert.deepEqual(c.parameters.dimensions,defaults[id]);
  for(const name of ['glues','insertions','bonds','layers'])assert.deepEqual(c[name],[]);
  assert.equal(c.materials[0].thicknessMm,null);assert.equal(c.source.mappingOnly,true);assert.ok(c.panels.every(p=>p.regions.every(g=>g.boundaryBindings.length===c.paths.find(q=>q.id===g.outerPathId).segments.length)));
});
for(const id of ['B001','B002'])for(const input of [{W:210},{D:92},{H:190},{W:320,D:220,H:160}])test(id+' original fixed dimension rule '+JSON.stringify(input),()=>{
  const x=a.convert(id,input,r),base=check(a.convert(id,{},r)),c=check(x);assert.deepEqual(c.parameters.dimensions,defaults[id]);assert.deepEqual(c.paths,base.paths);assert.deepEqual(c.folds,base.folds);assert.ok(x.diagnostics.some(d=>d.code==='DIMENSIONS_FIXED'));
});
test('B001 all 13 original display patches retained as 11 panels, without two virtual handle folds',()=>{
  const c=check(a.convert('B001',{},r)),original=originalB001(r,r.B001_getLayout(160,110,80));
  for(const [name,data] of Object.entries(original)){const panel=name.endsWith('Handle')?name.replace('Handle','Roof'):name,region=name.endsWith('Handle')?'handle':name.endsWith('Roof')?'roof':'paper';assert.deepEqual(polygon(c,panel,region),clean(data.polygon),name);}
  assert.equal(c.panels.length,11);assert.equal(c.panels.reduce((s,p)=>s+p.regions.length,0),13);assert.equal(c.folds.length,10);assert.equal(c.source.continuousBends.length,4);assert.ok(!c.folds.some(f=>/Handle|wing/i.test(f.id)));
  assert.deepEqual(c.source.unresolvedFeatures.filter(f=>f.kind==='unassigned-crease').map(f=>f.sourceIndex),[1,7]);
  assert.deepEqual(c.holes.map(h=>h.panelIds),[['frontRoof'],['backRoof'],['sideL'],['sideR']]);assert.equal(c.holes.length,4);
  assert.ok(c.paths.filter(p=>p.id.startsWith('source.opening.')).some(p=>p.segments.some(s=>s.type==='arc')));
});
test('B002 declarative snapshot matches all original fixed panels and hinge axes',()=>{
  const l=r.B002_getLayout(136,67,137,{}),old=originalB002(r,l),c=check(a.convert('B002',{},r));
  for(const p of old.panels){assert.deepEqual(polygon(c,p.role),clean(p.closedPath),p.role);assert.deepEqual(snapshot.B002.panels.find(s=>s.id===p.role).polygon,copy(p.closedPath));}
  const byId=new Map(old.panels.map(p=>[p.id,p.role]));
  old.folds.forEach(f=>{const m=c.folds.find(m=>m.childPanelId===byId.get(f.panelB));assert.equal(m.parentPanelId,byId.get(f.panelA));assert.deepEqual({a:m.axis.a,b:m.axis.b},copy(f.axis));});
  assert.equal(c.panels.length,17);assert.equal(c.folds.length,16);
  assert.deepEqual(c.folds.find(f=>f.childPanelId==='standingHandle').source.sourceIndices,[16,17]);assert.deepEqual(c.folds.find(f=>f.childPanelId==='frontHandlePanel').source.sourceIndices,[19,20]);
  assert.deepEqual(c.holes.map(h=>h.panelIds),[['frontTop'],['backHandle'],['backRoof','standingHandle']]);
});
for(const enabled of [true,false])test('B002 frontPunchEnabled='+enabled+' retains perforation, never new manufacturing Hole',()=>{
  const x=a.convert('B002',{frontPunchEnabled:enabled},r),c=check(x);assert.equal(c.parameters.options.frontPunchEnabled,enabled);assert.equal(c.holes.length,3);assert.equal(c.perforations.length,0);assert.equal(c.source.unresolvedFeatures.filter(f=>f.kind==='perforation').length,enabled?1:0);assert.equal(c.source.presentationOpenings.length,enabled?1:0);
});
for(const preset of ['mini','no1','no2','no3','no4'])for(const heightOption of ['Standard','Tall','2-Tier','Custom'])test('C001 '+preset+'/'+heightOption+' source dimensions, paths, all original regions',()=>{
  const input={preset,heightOption,customH:181},cfg=r.C001_resolveConfig(input),l=r.C001_getLayout(input),old=originalC001(r,l),c=check(a.convert('C001',input,r));
  assert.deepEqual(c.parameters.dimensions,{W:cfg.W,D:cfg.D,H:cfg.H});
  for(const [id,pts] of Object.entries(old.contours)){const panel=id==='lidFrontSeam'?'lidMain':id==='sideFrontSeam'?'sideFrontMain':id,region=id.endsWith('Seam')?'legacySeam':'paper';assert.deepEqual(polygon(c,panel,region),clean(pts),id);}
  assert.equal(c.panels.length,15);assert.equal(c.panels.reduce((s,p)=>s+p.regions.length,0),17);assert.equal(c.folds.length,14);assert.equal(c.holes.length,2);assert.equal(c.slits.length,8);
  for(const i of [0,12,14,15]){const el=r.C001_transformElement(l.foldElements[i],'',l),d=r.T001_elementToPathD(el),actual=c.paths.find(p=>p.id==='source.fold.'+i),parsed=r.T001_parseAbsolutePath(r.T001_transformPathD(d,{point:(x,y)=>({x,y})}));assert.deepEqual(actual.start,copy(parsed.start));assert.deepEqual(actual.segments.at(-1).to,copy(parsed.end));}
});
test('C001 handle recipes match private source; two curved creases, slits and callouts stay distinct',()=>{
  assert.deepEqual(snapshot.C001.handlePaths,copy(originalC001Handles()));const c=check(a.convert('C001',{},r));
  assert.deepEqual(c.source.unresolvedFeatures.filter(f=>f.kind==='unassigned-crease').map(f=>f.sourceIndex),[6,7]);assert.equal(c.source.materialExclusions.length,2);assert.ok(c.source.materialExclusions.every(e=>e.manufacturingHole===false));assert.ok(c.slits.every(s=>s.kerfMm===0));
  assert.equal(c.source.excludedSourceElements.filter(e=>e.reason==='renderer-excluded-callout').length,2);assert.ok(c.cuts.some(k=>k.id==='cut.supplement0'));assert.ok(!c.paths.some(p=>p.id==='source.fold.18'||p.id==='source.cut.55'));
});
for(const windowMode of ['None','Guide Only','Cutout'])test('C001 unconfirmed Window '+windowMode+' diagnostic without invented geometry',()=>{
  const x=a.convert('C001',{windowMode},r),c=check(x),base=check(a.convert('C001',{},r));assert.deepEqual(c.paths,base.paths);assert.deepEqual(c.holes,base.holes);assert.equal(c.parameters.options.windowMode,windowMode);assert.ok(x.diagnostics.some(d=>d.code==='UNRESOLVED_WINDOW_OPTION'));
});
test('C001 existing viewer drops source option keys: diagnose only, do not reproduce in mapping',()=>{
  const cfg=r.C001_resolveConfig({preset:'mini',heightOption:'Tall'}),ctx=vm.createContext({getCfgC001:()=>cfg});vm.runInContext(functionText(read('structures/cake/C001/C001_3d.js'),'config'),ctx);const viewerLayout=r.C001_getLayout(ctx.config());assert.equal(viewerLayout.cfg.preset,'no3');const x=a.convert('C001',{preset:'mini',heightOption:'Tall'},r);assert.equal(check(x).parameters.dimensions.W,167);assert.ok(x.diagnostics.some(d=>d.code==='LEGACY_3D_CONFIG_DROPS_OPTIONS'));
});
test('C001 explicit W/D/H remains governed by original presets',()=>{
  const x=a.convert('C001',{W:300,D:300,H:300},r);assert.deepEqual(check(x).parameters.dimensions,defaults.C001);assert.ok(x.diagnostics.some(d=>d.code==='DIMENSIONS_RESOLVED_BY_PRESET'));
});
for(const id of Object.keys(defaults))test(id+' fromLegacy round trip, no source mutation; reject mismatch and missing source',()=>{
  const options=id==='C001'?{preset:'mini',heightOption:'Tall'}:id==='B002'?{frontPunchEnabled:false}:{},layout=id==='C001'?r.C001_getLayout(options):r[id+'_getLayout'](defaults[id].W,defaults[id].D,defaults[id].H,options),cfg=id==='C001'?layout.cfg:layout.spec;
  const legacy={code:id,dimensions:{W:cfg.W,D:cfg.D,H:cfg.H},layout,options},before=JSON.stringify(legacy),c=check(a.fromLegacy(id,legacy,{},r));assert.deepEqual(c,check(a.convert(id,options,r)));assert.equal(JSON.stringify(legacy),before);
  assert.throws(()=>a.fromLegacy(id,{...legacy,dimensions:{...legacy.dimensions,W:1}},{},r),/mismatch/);assert.throws(()=>a.convert(id,{W:NaN},r),/invalid dimension/);assert.throws(()=>a.convert(id,{},{}),/missing source/);
});
test('changed source recipe and stale options fail closed',()=>{
  const layout=r.B002_getLayout(136,67,137,{frontPunchEnabled:false}),legacy={code:'B002',dimensions:defaults.B002,layout,options:{frontPunchEnabled:false}};
  assert.throws(()=>a.fromLegacy('B002',legacy,{frontPunchEnabled:true},r),/option mismatch/);assert.throws(()=>a.fromLegacy('B002',{...legacy,layout:{...layout,foldElements:[]}},{},r),/recipe changed/);
});
