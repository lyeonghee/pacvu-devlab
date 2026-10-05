'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const adapter = require('../PacVu3DContractAdapter.js');
const validator = require('../PacVu3DContract.js');
// Node-only stand-in for the SVGPathElement API used by M003's existing 3D.
const { svgPathProperties } = require(process.env.PACVU_SVG_PATH_PROPERTIES || 'svg-path-properties');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const svgDocument = { createElementNS() {
  let p;
  return { setAttribute(key, d) { assert.equal(key, 'd'); p = new svgPathProperties(d); }, getTotalLength() { return p.getTotalLength(); }, getPointAtLength(t) { return p.getPointAtLength(t); } };
} };
function runtime() {
  const r = vm.createContext({ console, document: svgDocument }); r.window = r;
  for (const id of ['M001','M002','M003']) for (const suffix of ['spec','layout']) {
    vm.runInContext(read('structures/mailer/'+id+'/'+id+'_'+suffix+'.js'), r);
  }
  return r;
}
const r = runtime();
const layoutFor = (id, cfg) => id==='M002' ? r.M002_getLayout(cfg.W??400,cfg.D??308,cfg.H??80) : r[id+'_getLayout'](cfg);
const source3D = id => read('structures/mailer/'+id+'/'+id+(id==='M002'?'_3d.js':'_3d_test.js'));
// Read-only test extraction of existing private pure functions. No on-disk
// source changes, UI loading, THREE renderer, runtime instrumentation or solver.
function functionText(source, name) {
  const start=source.indexOf('  function '+name+'(');assert.ok(start>=0,name);
  const next=source.indexOf('\n  function ',start+1);
  assert.ok(next>start,name);return source.slice(start,next);
}
function originalM001Polygons(layout, spinePanels) {
  class Shape { constructor(){this.points=[];} moveTo(x,y){this.points.push({x,y:-y});} lineTo(x,y){this.points.push({x,y:-y});} closePath(){} }
  class Geometry { constructor(shape){this.points=shape.points;} translate(){return this;} }
  const ctx=vm.createContext({layout,root:{THREE:{Shape,ExtrudeGeometry:Geometry}},PAPER_THICKNESS:.18,assignFaceMaterials:g=>g});
  const src=source3D('M001');
  for(const name of ['buildExactFlatPanelPolygon','finalCutPolygon','clipFlatPolygon','removeDuplicateFlatPoints','clipPolygonAtX','untanglePolygon','shapeGeometry'])vm.runInContext(functionText(src,name),ctx);
  return [...layout.panels,...spinePanels].map(p=>({id:p.id,polygon:ctx.shapeGeometry(p).points}));
}
function originalSpines(id,layout) {
  const src=functionText(source3D(id),'buildSideLockChain');
  const start=src.search(/(?:const|var) y1=/),end=src.indexOf(id==='M001'?'const spine=new':'var spine=new',start);
  assert.ok(start>=0&&end>start);
  return ['L','R'].map(side=>{
    const outer=layout.foldRelations.find(f=>f.foldIds.includes('f-7'+side+'-2')),inner=layout.foldRelations.find(f=>f.foldIds.includes('f-7'+side+'-1'));
    return vm.runInNewContext(src.slice(start,end)+';spinePanel',{outer,inner,side});
  });
}
function originalM003(layout) {
  const src=source3D('M003'),panels=[],folds=[],bonds=[];
  const ctx=vm.createContext({cfg:layout.config,root:{M003_getLayout:()=>layout},document:svgDocument,T:.5,
    model:{id:'base',add(){},scale:{setScalar(){}},position:{set(){}}},pacvuBrand(){},
    attach(parent,child,a,b){const hinge={id:child.name};folds.push({parent:parent.id,child:child.name,a,b});return{id:child.name,userData:{hinge}};},
    registerBond(source,target,leader,driven){bonds.push({leader:source.name,follower:target.name,leaderHinge:leader.id,drivenHinge:driven.id});}
  });
  for(const name of ['coordinateWarper','sampleSvgPath','clipPolygon'])vm.runInContext(functionText(src,name),ctx);
  ctx.regionMesh=(id,out,mask,holes=[])=>{panels.push({id,polygon:plain(ctx.clipPolygon(out,mask)),holes:plain(holes)});return{name:id};};
  const start=src.indexOf('    const layout=root.M003_getLayout(cfg)'),end=src.indexOf('    storageRig={',start);
  assert.ok(start>=0&&end>start);vm.runInContext(src.slice(start,end),ctx);
  const scale=205/(1193.726-612.623),mm=p=>({x:p.x*scale,y:p.y*scale});
  return {panels:panels.map(p=>({...p,polygon:p.polygon.map(mm)})),folds:folds.map(f=>({...f,a:mm(f.a),b:mm(f.b)})),bonds};
}
const area = points => Math.abs(points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p.x*q.y-q.x*p.y;},0)/2);
function contractPolygon(c,id) {const p=c.paths.find(p=>p.id==='panel.'+id);return [p.start,...p.segments.slice(0,-1).map(s=>s.to)];}
function samePolygon(actual,expected,id) {
  assert.ok(Math.abs(area(actual)-area(expected))<1e-6,id+' area');
  for(const p of expected)assert.ok(actual.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<1e-7),id+' original vertex');
}
function check(report) {
  assert.equal(report.validation.ok,true,JSON.stringify(report.validation.errors));
  assert.equal(validator.validate(plain(report.contract)).ok,true);
  assert.equal(report.contract.panels.length,19);assert.equal(report.contract.folds.length,18);
  assert.equal(report.complete,false);assert.equal(report.validation.warnings.length,1);
  assert.equal(report.validation.warnings[0].path,'$.materials[0].thicknessMm');
  for(const key of ['glues','insertions','bonds','layers'])assert.deepEqual(report.contract[key],[]);
  assert.ok(!JSON.stringify(report.contract).includes('assemblyOrder'));
  return report.contract;
}
const defaults={M001:{W:235,D:229,H:91},M002:{W:400,D:308,H:80},M003:{W:205,D:205,H:65}};
for(const id of Object.keys(defaults))for(const scale of [[1,1,1],[1.2,.85,1.15],[.85,1.15,.8]]) {
  const cfg=Object.fromEntries(['W','D','H'].map((k,i)=>[k,defaults[id][k]*scale[i]]));
  test(id+' validation, immutable snapshot, source geometry '+scale.join('/'),()=>{
    const layout=layoutFor(id,cfg),snapshot={code:id,dimensions:cfg,layout},before=JSON.stringify(snapshot);
    const result=adapter.fromLegacy(id,snapshot,cfg,r),c=check(result);
    assert.equal(JSON.stringify(snapshot),before);assert.deepEqual(c.parameters.dimensions,cfg);
    assert.deepEqual(adapter.convert(id,cfg,r).contract,c);
    const expected=id==='M003'?originalM003(layout).panels:id==='M001'?originalM001Polygons(layout,originalSpines(id,layout)):[...layout.panels,...originalSpines(id,layout)];
    assert.equal(expected.length,19);
    for(const p of expected)samePolygon(contractPolygon(c,p.id),p.polygon,p.id);
    const byChild=new Map(c.folds.map(f=>[f.childPanelId,f.parentPanelId]));
    for(const p of c.panels){let node=p.id,hops=0;while(byChild.has(node)){node=byChild.get(node);assert.ok(++hops<20);}assert.equal(node,'base');}
    for(const panel of c.panels)assert.deepEqual(panel.faceConvention,{outside:'negativeZ',inside:'positiveZ'});
  });
}
for(const id of ['M001','M002']) {
  test(id+' spine chain retains two creases and reversed source axes',()=>{
    const c=check(adapter.convert(id,{},r)),layout=layoutFor(id,{});
    for(const side of ['L','R']) {
      const group=c.source.doubleFolds.find(g=>g.spinePanelId==='lockSpine'+side);
      assert.equal(group.foldIds.length,2);assert.ok(group.spacingMm>0);
      group.foldIds.forEach((foldId,i)=>{
        const f=c.folds.find(f=>f.id===foldId),original=layout.foldRelations.find(r=>r.id===foldId);
        assert.deepEqual(f.axis,{partId:'sheet',...plain(original.axis)});assert.equal(f.parentPanelId,group.panelIds[i]);assert.equal(f.childPanelId,group.panelIds[i+1]);
        assert.equal(f.profile.kind,'crease');
      });
    }
    assert.equal(c.folds.filter(f=>f.segments.length>1).length,2);
    // Interrupted source segments must not be replaced with a full-length fold.
    for(const f of c.folds)for(const seg of f.segments){const p=c.paths.find(p=>p.id===seg.pathId),s=layout.fold.find(s=>s.id===p.source.id);assert.deepEqual(p.start,plain(s.a));assert.deepEqual(p.segments[0].to,plain(s.b));}
  });
  test(id+' slot/lock relationships retained without insertion implementation',()=>{
    const report=adapter.convert(id,{},r),c=check(report),layout=layoutFor(id,{});
    assert.equal(c.holes.length,layout.holes.length+layout.slots.length);assert.equal(c.slits.length,0);
    assert.deepEqual(c.source.lockFeatures,plain(layout.locks));
    for(const slot of layout.slots)assert.ok(c.holes.some(h=>h.id===slot.id&&h.panelIds.includes(slot.panelId)));
    assert.equal(report.unresolvedRelations.length,layout.insertionRelations.length);
    report.unresolvedRelations.forEach(rel=>{assert.deepEqual(rel.source,plain(layout.insertionRelations.find(v=>v.id===rel.source.id)));assert.equal(rel.mapping.targetHoleId,rel.source.slotId);});
  });
  test(id+' one-lock short depth transition and per-call resize',()=>{
    const short={...defaults[id],D:100};const a=check(adapter.convert(id,short,r)),b=check(adapter.convert(id,{},r));
    assert.equal(a.source.lockFeatures.length,2);assert.equal(b.source.lockFeatures.length,4);
    assert.notDeepEqual(a.paths,b.paths);
  });
}
test('M001 Hole option follows actual Layout without touching original renderer',()=>{
  const result=adapter.convert('M001',{holeEnabled:false},r),c=check(result);
  assert.equal(c.holes.length,4);assert.ok(!c.holes.some(h=>h.id==='hole_L'));
  assert.ok(result.diagnostics.some(d=>d.code==='LEGACY_OPENINGS_NOT_RENDERED'));
});
test('M003 all 18 original attach axes and four bond pairs preserved',()=>{
  const result=adapter.convert('M003',{},r),c=check(result),original=originalM003(layoutFor('M003',{}));
  for(const f of original.folds){const mapped=c.folds.find(v=>v.childPanelId===f.child);assert.equal(mapped.parentPanelId,f.parent);assert.deepEqual(mapped.axis,{partId:'sheet',a:plain(f.a),b:plain(f.b)});}
  assert.equal(c.source.glueAreas.length,8);assert.equal(result.unresolvedRelations.length,4);
  for(const bond of original.bonds)assert.ok(result.unresolvedRelations.some(v=>v.mapping.leaderPanelId===bond.leader&&v.mapping.followerPanelId===bond.follower));
  assert.equal(result.diagnostics.filter(d=>d.code==='LEGACY_AXIS_DIFFERS_FROM_CREASE').length,2);
  for(const id of ['f-11L','f-11R']){
    const f=c.folds.find(f=>f.id===id),p=c.paths.find(p=>p.id===f.segments[0].pathId);
    assert.notDeepEqual({a:p.start,b:p.segments[0].to},{a:f.axis.a,b:f.axis.b});
  }
});
test('M003 fill bridges are not promoted to manufacturing cuts',()=>{
  const c=check(adapter.convert('M003',{},r));
  assert.ok(!c.cuts.some(cut=>cut.pathId==='source.fill'));
  assert.equal(c.cuts.filter(cut=>cut.kind==='outer').length,layoutFor('M003',{}).cut.length);
  assert.equal(c.holes.length,2);
  assert.ok(c.panels.some(p=>p.regions[0].boundaryBindings.some(b=>b.kind==='continuous'&&b.source.mechanicalMapping==='unresolved')));
});
test('mapping rejects disconnected locks and changed source recipes',()=>{
  const layout=plain(layoutFor('M001',{}));layout.insertionRelations[0].slotId='missing';
  assert.throws(()=>adapter.fromLegacy('M001',{code:'M001',dimensions:defaults.M001,layout},{},r),/disconnected insertion/);
  const m003=plain(layoutFor('M003',{}));m003.fold.pop();
  assert.throws(()=>adapter.fromLegacy('M003',{code:'M003',dimensions:defaults.M003,layout:m003},{},r),/recipe changed/);
  assert.throws(()=>adapter.fromLegacy('M002',{code:'M001',layout}, {},r),/mismatch/);
  assert.throws(()=>adapter.convert('M003',{W:-1},r),/dimension/);
  assert.throws(()=>adapter.convert('M003',{}, {...r,document:{}}),/SVG path measurement/);
});
test('browser UMD loading and missing mapping dependency are explicit',()=>{
  const ctx=runtime();vm.runInContext(read('viewer/PacVu3DContract.js'),ctx);
  vm.runInContext(read('viewer/PacVu3DContractAdapter.js'),ctx);
  assert.throws(()=>ctx.PacVu3DContractAdapter.convert('M001',{}),/MailerMapping is required/);
  vm.runInContext(read('viewer/PacVu3DContractMailerMapping.js'),ctx);
  vm.runInContext(read('viewer/PacVu3DContractAdapter.js'),ctx);
  for(const id of ['M001','M002','M003'])assert.equal(ctx.PacVu3DContractAdapter.convert(id,{}).validation.ok,true);
});
