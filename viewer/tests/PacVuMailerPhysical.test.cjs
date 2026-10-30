'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require(process.env.PACVU_THREE_PATH||'three'),ClipperLib=require(process.env.PACVU_CLIPPER_PATH||'clipper-lib');
const context=vm.createContext({window:{THREE,ClipperLib},THREE,console});
for(const file of ['PacVu3DTheme.js','PacVu3DViewer.js','PacVuWhitePaperboard.js','PacVuPhysicalPaper3D.js'])vm.runInContext(fs.readFileSync(require.resolve('../'+file),'utf8'),context);
const api=context.window.PacVuPhysicalPaper3D;
function rig(scale=1,withHole=true,declared=false,closure=false){
 const model=new THREE.Group();model.scale.setScalar(scale);const mats=[0,1,2].map(()=>new THREE.MeshStandardMaterial({side:THREE.DoubleSide}));
 function mesh(id,left,right){const s=new THREE.Shape([new THREE.Vector2(left,-10),new THREE.Vector2(right,-10),new THREE.Vector2(right,10),new THREE.Vector2(left,10)]);
  if(withHole){const h=new THREE.Path();h.absarc(0,0,2,0,Math.PI*2);s.holes.push(h);}
  const g=new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:false,curveSegments:24});g.translate(0,0,-.09);const m=new THREE.Mesh(g,mats);m.name=id;return m;}
 const a=mesh('base',-10,0),b=mesh('child',0,10),hinge=new THREE.Group(),frame=new THREE.Group();model.add(a,hinge);hinge.add(frame);frame.add(b);
 const original=[a.geometry,b.geometry],owner={object:hinge,frame,parentMesh:a,childMesh:b,a:{x:0,y:-10},b:{x:0,y:10}};
 if(declared)b.position.set(-10,0,-3/scale);
 const paper=api.createAssemblyAdapter({THREE,model,panels:new Map([['base',a],['child',b]]),hinges:[owner],anchoredPanels:declared?['base']:[],layerConstraints:declared?[{outer:'base',inner:'child'}]:[],closureClearances:closure?[{lid:'child',contents:['base'],phase:[0,1]}]:[]});
 return {model,a,b,hinge,frame,paper,original,scale};
}
function capContains(g,x,y){const uv=g.attributes.uv1,indices=g.index;assert.ok(uv);for(const group of g.groups){if(group.materialIndex===2)continue;for(let k=group.start;k<group.start+group.count;k+=3){const p=[0,1,2].map(j=>indices?indices.getX(k+j):k+j).map(i=>({x:uv.getX(i)*32,y:uv.getY(i)*32}));const cross=(a,b)=>(b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x),c=p.map((v,i)=>cross(v,p[(i+1)%3]));if(c.every(v=>v>1e-6)||c.every(v=>v< -1e-6))return true;}}return false;}
for(const scale of [1,205/581.103])for(const t of [.15,.45,.8])test(`slot crossing bend retained, scale ${scale}, ${t}mm`,()=>{
 const r=rig(scale);r.paper.setThickness(t);r.paper.setEnabled(true);
 for(const angle of [0,30,60,90]){r.hinge.rotation.y=THREE.MathUtils.degToRad(angle);r.paper.update(angle/90);
  r.model.traverse(m=>{if(!m.isMesh)return;assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));
   for(const x of [-.7,.7])assert.equal(capContains(m.geometry,x*scale,0),false,'void filled by cap or bend');});
  for(const m of [r.a,r.b]){m.geometry.computeBoundingBox();assert.ok(Math.abs((m.geometry.boundingBox.max.z-m.geometry.boundingBox.min.z)*scale-t)<1e-5);}
 }
 r.paper.setEnabled(false);assert.equal(r.a.geometry,r.original[0]);assert.equal(r.b.geometry,r.original[1]);assert.equal(r.hinge.rotation.y,Math.PI/2);r.paper.dispose();
});
test('same pose and thickness never accumulate panel/hinge offsets',()=>{const r=rig();r.hinge.rotation.y=Math.PI/2;r.paper.setEnabled(true);r.paper.update(1);r.model.updateMatrixWorld(true);const before=r.b.matrixWorld.toArray();for(let i=0;i<10;i++)r.paper.update(1);assert.deepEqual(r.b.matrixWorld.toArray(),before);r.paper.dispose();});
test('invalid thickness is rejected, original source geometry is retained',()=>{const r=rig();assert.throws(()=>r.paper.setThickness(NaN),/finite/);r.paper.dispose();assert.equal(r.a.geometry,r.original[0]);});
test('declared inner layer cannot escape distance filtering as thickness changes',()=>{
 const r=rig(205/581.103,false,true),home=r.b.position.clone();r.paper.setEnabled(true);
 for(let i=3;i<=16;i++){
  const t=i/20;r.paper.setThickness(t);r.paper.update(1);
  const contact=r.paper.getDiagnostics().find(d=>d.from==='base'&&d.to==='child');
  assert.ok(contact,'declared contact missing');assert.ok(Math.abs(contact.gapMm)<1e-6);
  assert.ok(Math.abs(r.b.getWorldPosition(new THREE.Vector3()).z-t)<1e-6);
 }
 r.paper.setEnabled(false);assert.deepEqual(r.b.position,home);assert.equal(r.b.geometry,r.original[1]);r.paper.dispose();
});
for(const scale of [1,205/581.103])test(`closure clearance moves assembly frame, not paper shape, scale ${scale}`,()=>{
 const r=rig(scale,false,false,true);r.paper.setEnabled(true);
 for(const thickness of [.15,.5,.8]){
  r.paper.setThickness(thickness);r.paper.update(0);assert.equal(r.frame.position.z,0);
  r.paper.update(.5);const halfway=r.frame.position.z*scale;
  r.paper.update(1);assert.ok(Math.abs(r.frame.position.z*scale-thickness-.01)<1e-6);
  assert.ok(Math.abs(halfway-(thickness+.01)/2)<1e-6);
  assert.equal(r.a.position.z,0);assert.equal(r.b.position.z,0);
  const stable=r.frame.position.z;r.paper.update(1);assert.equal(r.frame.position.z,stable);
  const contact=r.paper.getDiagnostics().find(d=>d.kind==='closure');assert.ok(Math.abs(contact.clearanceMm-.01)<1e-6);
 }
 r.paper.setEnabled(false);assert.equal(r.frame.position.z,0);assert.equal(r.b.geometry,r.original[1]);r.paper.dispose();
});
