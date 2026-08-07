(function (global) {
  'use strict';
  const THREE = global.THREE;
  if (!THREE || !global.PacVu3DViewer || !global.S001_getLayout) return;
  const PAPER = 0.4;
  const UNIT_TO_MM = 0.3527778112205911;
  const TOLERANCE_MM = 0.05;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  const phase = (v, a, b) => smooth((v - a) / (b - a));

  function cfg() {
    const value = typeof getCfgS001 === 'function' ? getCfgS001() : {};
    return Object.assign({}, value, { W: +value.W || 298, D: +value.D || 61, H: +value.H || 292, viewMode: 'Inner Only' });
  }
  function flatten(d) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d); svg.append(path); document.body.append(svg);
    const length = path.getTotalLength(); const out = [];
    const at = n => { const p = path.getPointAtLength(n); return { x: p.x, y: p.y }; };
    const dev = (p, a, b) => { const dx = b.x-a.x, dy=b.y-a.y, ll=dx*dx+dy*dy; if(!ll)return Math.hypot(p.x-a.x,p.y-a.y); const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/ll,0,1); return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t); };
    function split(da,a,db,b,depth){const dm=(da+db)/2,m=at(dm);if(depth<18&&dev(m,a,b)>TOLERANCE_MM/UNIT_TO_MM){split(da,a,dm,m,depth+1);split(dm,m,db,b,depth+1);return;}out.push(a);}
    const seeds=Math.max(10,Math.ceil(length/18)); for(let i=0;i<seeds;i++){const a=length*i/seeds,b=length*(i+1)/seeds;split(a,at(a),b,at(b),0);} svg.remove(); return out;
  }
  function clip(contour, box) {
    const k=10000, cv=p=>p.map(q=>({X:Math.round(q.x*k),Y:Math.round(q.y*k)}));
    const solution=new global.ClipperLib.Paths(), op=new global.ClipperLib.Clipper();
    op.AddPath(cv(contour),global.ClipperLib.PolyType.ptSubject,true);
    op.AddPath(cv([{x:box[0],y:box[1]},{x:box[2],y:box[1]},{x:box[2],y:box[3]},{x:box[0],y:box[3]}]),global.ClipperLib.PolyType.ptClip,true);
    op.Execute(global.ClipperLib.ClipType.ctIntersection,solution,global.ClipperLib.PolyFillType.pftNonZero,global.ClipperLib.PolyFillType.pftNonZero);
    return solution.filter(p=>Math.abs(global.ClipperLib.Clipper.Area(p))>2).map(p=>p.map(q=>({x:q.X/k,y:q.Y/k})));
  }
  function build() {
    const config=cfg(), layout=global.S001_getLayout(config,config), part=layout.rawParts.innerTray, spec=part.spec;
    const signature=[config.W,config.D,config.H].join(':');
    const piecewise=(v,s,t)=>{let i=0;if(v>=s[s.length-1])i=s.length-2;else while(i<s.length-2&&v>s[i+1])i++;const a=(v-s[i])/(s[i+1]-s[i]);return t[i]+(t[i+1]-t[i])*a;};
    const mp=(x,y)=>({x:piecewise(x,spec.sourceX,spec.targetX),y:piecewise(y,spec.sourceY,spec.targetY)});
    const X=x=>mp(x,2304.303).x,Y=y=>mp(429.694,y).y,b=part.bounds,pad=.06;
    const sx={oL:X(106.544),l0:X(163.237),l1:X(256.78),l2:X(273.788),baseL:X(429.694),baseR:X(1251.741),r2:X(1407.646),r1:X(1424.654),r0:X(1518.197),oR:X(1574.89)};
    const sy={top:Y(1750.172),t1:Y(1829.5),t2:Y(1985.406),t3:Y(2061.941),baseT:Y(2223.516),lockT:Y(2226.351),lockT2:Y(2295.799),baseB:Y(3039.894),lockB2:Y(3027.138),lockB:Y(3037.059),b1:Y(3201.468),b2:Y(3218.477),bottom:Y(3382.927)};
    const boxes={
      base:[sx.baseL-pad,sy.baseT-pad,sx.baseR+pad,sy.baseB+pad],
      sideL1:[sx.l2-pad,sy.lockT,sx.baseL+pad,sy.lockB], sideL2:[sx.l1-pad,sy.lockT,sx.l2+pad,sy.lockB], sideL3:[sx.oL-pad,sy.lockT2,sx.l1+pad,sy.lockB2],
      sideR1:[sx.baseR-pad,sy.lockT,sx.r2+pad,sy.lockB], sideR2:[sx.r2-pad,sy.lockT,sx.r1+pad,sy.lockB], sideR3:[sx.r1-pad,sy.lockT2,sx.oR+pad,sy.lockB2],
      topLockL:[sx.l2,sy.top,sx.baseL,sy.lockT], topHookL:[sx.oL,sy.top,sx.l1,sy.lockT2],
      topLockR:[sx.baseR,sy.top,sx.r2,sy.lockT], topHookR:[sx.r1,sy.top,sx.oR,sy.lockT2],
      top6:[sx.baseL,sy.t3,sx.baseR,sy.baseT], top7:[sx.baseL,sy.t2,sx.baseR,sy.t3], top8:[X(449.536),sy.t1,X(1231.898),sy.t2], top9:[X(449.536),sy.top,X(1231.898),sy.t1],
      bottomLockL:[sx.l2,sy.lockB,sx.baseL,sy.bottom], bottomHookL:[sx.oL,sy.lockB2,sx.l1,sy.bottom],
      bottomLockR:[sx.baseR,sy.lockB,sx.r2,sy.bottom], bottomHookR:[sx.r1,sy.lockB2,sx.oR,sy.bottom],
      bottom12:[sx.baseL,sy.baseB,sx.baseR,sy.b1], bottom13:[sx.baseL,sy.b1,sx.baseR,sy.b2], bottom14:[X(449.536),sy.b2,X(1231.898),sy.bottom]
    };
    const sources=part.fillPaths.map(flatten), contours={};
    Object.entries(boxes).forEach(([name,box])=>{contours[name]=sources.flatMap(c=>clip(c,box));});
    const center={x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2}, world=p=>new THREE.Vector2((p.x-center.x)*UNIT_TO_MM,(center.y-p.y)*UNIT_TO_MM);
    const viewer=global.PacVu3DViewer.createModal({id:'s001Inner3dModal',badge:'S001 · Inner Tray · Stage 1'}),{modal,stage}=viewer;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera=global.PacVu3DViewer.createPerspectiveCamera(THREE,{W:spec.W,D:spec.D,H:spec.H}),renderer=global.PacVu3DViewer.createRenderer(THREE);stage.prepend(renderer.domElement);
    const controls=new global.PacVuOrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.screenSpacePanning=true;
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,global.PacVu3DTheme.hemisphereLight.groundColor,global.PacVu3DTheme.hemisphereLight.intensity));
    const sun=new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color,global.PacVu3DTheme.directionalLight.intensity);sun.position.fromArray(global.PacVu3DTheme.directionalLight.position);sun.castShadow=true;scene.add(sun);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.ShadowMaterial({color:0x3f3933,opacity:.3}));floor.receiveShadow=true;floor.position.z=-spec.D-8;scene.add(floor);
    const grid=new THREE.GridHelper(global.PacVu3DTheme.grid.size,global.PacVu3DTheme.grid.divisions,global.PacVu3DTheme.grid.centerColor,global.PacVu3DTheme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=floor.position.z+.02;scene.add(grid);global.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls,floor,grid});
    const materials=global.PacVu3DViewer.createBoardMaterials(THREE);materials[2]=materials[2].clone();materials[2].color.copy(materials[0].color);
    const root=new THREE.Group();
    scene.add(root);const pieces=new Map(),hinges=[];
    function make(name){const group=new THREE.Group();let count=0,cx=0,cy=0;contours[name].forEach(poly=>{if(poly.length<3)return;let outline=poly.map(world);if(!THREE.ShapeUtils.isClockWise(outline))outline.reverse();const shape=new THREE.Shape(outline),g=new THREE.ExtrudeGeometry(shape,{depth:PAPER,bevelEnabled:false,steps:1,curveSegments:1});g.translate(0,0,-PAPER/2);global.PacVu3DViewer.assignBoardFaceMaterials(g,PAPER,'interior');const mesh=new THREE.Mesh(g,materials);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);poly.forEach(p=>{cx+=p.x;cy+=p.y;count++;});});pieces.set(name,{mesh:group,center:new THREE.Vector3((cx/count-center.x)*UNIT_TO_MM,(center.y-cy/count)*UNIT_TO_MM,0)});return group;}
    Object.keys(contours).forEach(make);const point=(x,y)=>{const p=mp(x,y);return new THREE.Vector3((p.x-center.x)*UNIT_TO_MM,(center.y-p.y)*UNIT_TO_MM,0);};
    function attach(parent,name,a,q,start,end,direction=1){const item=pieces.get(name),p=point(a[0],a[1]),r=point(q[0],q[1]),h=new THREE.Group();h.position.copy(p);parent.add(h);const frame=new THREE.Group();frame.position.copy(p).multiplyScalar(-1);h.add(frame);frame.add(item.mesh);const axis=r.clone().sub(p).normalize(),radial=item.center.clone().sub(p),natural=new THREE.Vector3().crossVectors(axis,radial).z>=0?-1:1;hinges.push({object:h,axis,angle:-Math.PI/2*natural*direction,start,end});return frame;}
    const sheet=new THREE.Group();root.add(sheet);sheet.add(pieces.get('base').mesh);
    const l1=attach(sheet,'sideL1',[429.694,2223.516],[429.694,3039.894],.02,.09),r1=attach(sheet,'sideR1',[1251.741,3039.894],[1251.741,2223.516],.02,.09);
    const l2=attach(l1,'sideL2',[273.788,3037.059],[273.788,2226.351],.09,.15),r2=attach(r1,'sideR2',[1407.646,2226.351],[1407.646,3037.059],.09,.15);
    const l3=attach(l2,'sideL3',[256.78,3027.138],[256.78,2295.799],.15,.21),r3=attach(r2,'sideR3',[1424.654,2295.799],[1424.654,3027.138],.15,.21);
    attach(l1,'topLockL',[273.788,2226.351],[424.024,2226.351],.22,.28);attach(r1,'topLockR',[1257.41,2226.351],[1407.646,2226.351],.22,.28);
    // Step 5 closes toward the tray cavity and meets over step 4.
    attach(l3,'topHookL',[163.237,2295.799],[256.78,2295.799],.28,.34,-1);attach(r3,'topHookR',[1518.197,2295.799],[1424.654,2295.799],.28,.34,-1);
    const t6=attach(sheet,'top6',[429.694,2223.516],[1251.741,2223.516],.35,.42),t7=attach(t6,'top7',[429.694,2061.941],[1251.741,2061.941],.42,.49),t8=attach(t7,'top8',[449.536,1985.406],[1231.898,1985.406],.49,.56);attach(t8,'top9',[1231.898,1829.5],[449.536,1829.5],.56,.63,-1);
    // Step 10 also closes toward the cavity before steps 12-14 wrap it.
    attach(l1,'bottomLockL',[424.024,3037.059],[273.788,3037.059],.64,.70);attach(r1,'bottomLockR',[1407.646,3037.059],[1259.481,3037.059],.64,.70);
    attach(l3,'bottomHookL',[256.78,3027.138],[163.237,3027.138],.70,.76,-1);attach(r3,'bottomHookR',[1424.654,3027.138],[1518.197,3027.138],.70,.76,-1);
    const b12=attach(sheet,'bottom12',[1251.741,3039.894],[429.694,3039.894],.77,.84),b13=attach(b12,'bottom13',[1251.741,3201.468],[429.694,3201.468],.84,.91);attach(b13,'bottom14',[1231.898,3218.477],[449.536,3218.477],.91,1);
    function pose(v){global.PacVu3DViewer.syncProgress(viewer,v*100,'Inner Tray Assembly');hinges.forEach(h=>h.object.quaternion.setFromAxisAngle(h.axis,h.angle*phase(v,h.start,h.end)));}
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}const fit=t=>global.PacVu3DViewer.fitObject(root,camera,controls,t);
    viewer.range.oninput=()=>pose(+viewer.range.value/100);viewer.range.onchange=()=>fit('iso');modal.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>fit(b.dataset.view));modal.querySelector('[data-close]').onclick=()=>modal.classList.remove('open');modal.querySelector('[data-shadow]').onclick=e=>{floor.visible=!floor.visible;sun.castShadow=floor.visible;e.currentTarget.textContent=floor.visible?'Shadows On':'Shadows Off';};
    modal.querySelector('[data-download]').onclick=()=>renderer.domElement.toBlob(blob=>{if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='S001_INNER_TRAY.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
    // BASE interior is the approved upward-facing assembly side.
    root.userData.s001InteriorUp=true;
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();pose(0);fit('top');let live=true;(function loop(){if(!live)return;requestAnimationFrame(loop);controls.update();renderer.render(scene,camera);}());
    global.S001_INNER_3D_DEBUG={tolerance:TOLERANCE_MM,panels:Object.fromEntries(Object.entries(contours).map(([k,v])=>[k,v.reduce((n,p)=>n+p.length,0)])),pose};
    return{signature,root,pose,open(){modal.classList.add('open');resize();fit('top');},destroy(){live=false;observer.disconnect();controls.dispose?.();root.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());renderer.dispose();modal.remove();}};
  }
  let app;
  global.S001Inner3D={open(){const value=cfg(),signature=[value.W,value.D,value.H].join(':');if(!app||app.signature!==signature){app?.destroy();app=build();}app.open();},getCompleted(){const value=cfg(),signature=[value.W,value.D,value.H].join(':');if(!app||app.signature!==signature){app?.destroy();app=build();}app.pose(1);return app.root;}};
}(window));
