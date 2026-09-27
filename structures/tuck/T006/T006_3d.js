// T006_3d.js - source-cut panel assembly in the shared PacVu 3D Viewer.
(function (global) {
'use strict';
const scale = 1000;
const vec = (x, y) => ({ x, y });
function clipPanel(outline, box) {
  const lib = global.ClipperLib;
  if (!lib) throw new Error('T006 3D requires ClipperLib.');
  const c = new lib.Clipper();
  const toPath = points => points.map(p => ({ X: Math.round(p.x * scale), Y: Math.round(p.y * scale) }));
  const [x1, y1, x2, y2] = box;
  c.AddPath(toPath(outline), lib.PolyType.ptSubject, true);
  c.AddPath(toPath([vec(x1,y1),vec(x2,y1),vec(x2,y2),vec(x1,y2)]), lib.PolyType.ptClip, true);
  const result = new lib.Paths();
  c.Execute(lib.ClipType.ctIntersection, result, lib.PolyFillType.pftNonZero, lib.PolyFillType.pftNonZero);
  if (!result.length) throw new Error('T006 3D source-cut panel missing.');
  const polygon = result.reduce((best, next) => Math.abs(lib.Clipper.Area(next)) > Math.abs(lib.Clipper.Area(best)) ? next : best, result[0]);
  return polygon.map(p => vec(p.X / scale, p.Y / scale));
}

// Flat precision POC: explicit source references, never the White Fill contour.
// CUT[29].end -> CUT[30]'s last line is the user-approved A/B junction.
// CUT[30].end (C) remains an independent slit tip. The lower junction only
// resolves the source's 0.00019 mm rounding residual, not a nearest-path search.
function frontLockTopology(layout) {
  const identity={point:(x,y)=>({x,y}),x:x=>x,y:y=>y};
  const read=index=>global.T001_parseAbsolutePath(global.T001_transformPathD(
    global.T001_elementToPathD(T006_SOURCE_CUT_ELEMENTS[index]),identity));
  const lower=read(28),upper=read(29),tongue=read(30);
  const signature=p=>p.segments.map(s=>s.type).join('');
  if(signature(upper)!=='LCLL'||signature(lower)!=='LCLL'||signature(tongue)!=='LCLCL')
    throw new Error('T006 FrontLock: source Cut references changed; review topology.');
  function junction(tip,segment,maxMm,name) {
    const dx=segment.to.x-segment.from.x,dy=segment.to.y-segment.from.y;
    const t=((tip.x-segment.from.x)*dx+(tip.y-segment.from.y)*dy)/(dx*dx+dy*dy);
    const point=vec(segment.from.x+t*dx,segment.from.y+t*dy);
    const gapMm=Math.hypot(tip.x-point.x,tip.y-point.y)*25.4/72;
    if(!(t>0&&t<1)||gapMm>maxMm)throw new Error('T006 FrontLock '+name+': source junction out of tolerance.');
    return {point,sourceTip:tip,gapMm,sourceParameter:t};
  }
  const top=junction(upper.end,tongue.segments[4],.145,'A/B');
  const bottom=junction(lower.end,tongue.segments[0],.001,'lower');
  // Reuse the approved W/D/H mapper. Curves are sampled AFTER transforming
  // their control points, matching the existing 2D SVG transform convention.
  const mapped=new Map();
  const map=p=>{if(!mapped.has(p))mapped.set(p,layout.mapper.point(p.x,p.y));return mapped.get(p);};
  function sample(p) {
    const result=[map(p.start)];
    function curve(a,b,c,d,depth=0) {
      const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y;return Math.abs(dy*p.x-dx*p.y+b.x*a.y-b.y*a.x)/Math.max(1e-12,Math.hypot(dx,dy));};
      if(Math.max(distance(b,a,d),distance(c,a,d))<=.005){result.push(d);return;}
      if(depth>=18)throw new Error('T006 FrontLock curve sampling failed.');
      const mid=(a,b)=>vec((a.x+b.x)/2,(a.y+b.y)/2);
      const ab=mid(a,b),bc=mid(b,c),cd=mid(c,d),abc=mid(ab,bc),bcd=mid(bc,cd),m=mid(abc,bcd);
      curve(a,ab,abc,m,depth+1);curve(m,bcd,cd,d,depth+1);
    }
    p.segments.forEach(s=>{if(s.type==='L')result.push(map(s.to));else curve(map(s.from),map(s.c1),map(s.c2),map(s.to));});
    return result;
  }
  const u=sample(upper),l=sample(lower),t=sample(tongue),B=map(top.point),J=map(bottom.point);
  const C=t[t.length-1],D=t[0];
  u[u.length-1]=B;l[l.length-1]=J;
  // Split ONLY the two explicitly identified tongue line segments.
  const rim=[J,...t.slice(1,-1),B].reverse();
  const leftC=vec(u[0].x,C.y),leftD=vec(l[0].x,D.y);
  if(Math.abs(u[0].x-l[0].x)>1e-8||!(u[0].y<C.y&&C.y<D.y&&D.y<l[0].y))
    throw new Error('T006 FrontLock: invalid source region ordering.');
  const cells=[
    {id:'upper',points:[...u,C,leftC]},
    {id:'tongue',points:[leftC,C,...rim,D,leftD]},
    {id:'lower',points:[leftD,D,...l.slice().reverse()]}
  ];
  return {polygon:[...u,...rim.slice(1),...l.slice().reverse().slice(1)],cells,
    slits:[{id:'upper-cut',a:B,b:C},{id:'lower-cut',a:J,b:D}],
    junctions:{top:{...top,point:B},bottom:{...bottom,point:J}},
    // These are interior tessellation edges, NOT cuts/hinges: no side walls.
    continuousEdges:[[C,leftC],[D,leftD]],sourceCuts:[28,29,30]};
}
function frontLockGeometry(THREE,topology,cx,cy,thickness) {
  const vertices=[],indices=[],ids=new Map(),pointIds=new Map(),surfaceTriangles=[];
  const junctions=[topology.slits[0].a,topology.slits[1].a];
  function vertex(p,side,cellId) {
    if(!pointIds.has(p))pointIds.set(p,pointIds.size);
    // Two distinct banks at each cut mouth; the slit tips and the material
    // behind them remain connected. No kerf or fabricated opening is added.
    const bank=junctions.includes(p)?cellId:'shared';
    const key=pointIds.get(p)+':'+side+':'+bank;
    if(!ids.has(key)){ids.set(key,vertices.length/3);vertices.push(p.x-cx,cy-p.y,side*thickness/2);}
    return ids.get(key);
  }
  const sameEdge=(a,b,e)=>(a===e[0]&&b===e[1])||(a===e[1]&&b===e[0]);
  const area=points=>points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p.x*q.y-q.x*p.y;},0)/2;
  topology.cells.forEach(cell=>{
    const points=cell.points,contour=points.map(p=>new THREE.Vector2(p.x-cx,cy-p.y));
    const triangles=THREE.ShapeUtils.triangulateShape(contour,[]);
    let covered=0;
    triangles.forEach(tri=>{
      let [a,b,c]=tri;const p=contour[a],q=contour[b],r=contour[c];
      const signed=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
      if(Math.abs(signed)<1e-10)throw new Error('T006 FrontLock: degenerate triangle.');
      covered+=Math.abs(signed)/2;if(signed<0)[b,c]=[c,b];
      indices.push(vertex(points[a],1,cell.id),vertex(points[b],1,cell.id),vertex(points[c],1,cell.id));
      indices.push(vertex(points[c],-1,cell.id),vertex(points[b],-1,cell.id),vertex(points[a],-1,cell.id));
      surfaceTriangles.push([points[a],points[b],points[c]]);
    });
    if(Math.abs(covered-Math.abs(area(points)))>1e-6)
      throw new Error('T006 FrontLock: incomplete constrained surface.');
    const positive=area(points)>0;
    points.forEach((p,i)=>{
      const q=points[(i+1)%points.length];
      if(topology.continuousEdges.some(e=>sameEdge(p,q,e)))return;
      let a=p,b=q;if(positive)[a,b]=[b,a];
      const a0=vertex(a,-1,cell.id),b0=vertex(b,-1,cell.id),a1=vertex(a,1,cell.id),b1=vertex(b,1,cell.id);
      indices.push(a0,b0,b1,a0,b1,a1);
    });
  });
  const indexed=new THREE.BufferGeometry();
  indexed.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));indexed.setIndex(indices);
  const geometry=indexed.toNonIndexed();indexed.dispose();geometry.computeVertexNormals();
  geometry.userData={sourceCuts:topology.sourceCuts,slits:topology.slits,surfaceTriangles,
    continuousEdges:topology.continuousEdges,indexedVertexCount:vertices.length/3};
  return geometry;
}

function buildContract(input) {
  const layout = global.T006_getLayout(input || {W:100,D:40,H:220});
  const g = layout.grid, outline = global.T001_flattenPathD(layout.fillPath);
  const X = [g.xSideLeft,g.xBackLeft,g.xBackRight,g.xSideMid,g.xFrontRight,g.xSideRight];
  const Y = [g.yTuckTop,g.yLidFold,g.yBodyTop,g.yBodyBottom,g.yBottomFold,g.yTuckBottom];
  const definitions = [
    ['sideRight',0,2],['back',1,2],['sideLeft',2,2],['front',3,2],['frontLock',4,2],
    ['topDustRight',0,1],['topDustLeft',2,1],['bottomDustRight',0,3],['bottomDustLeft',2,3],
    ['lidTop',3,1],['upperTuck',3,0],['bottomLid',3,3],['bottomTuck',3,4]
  ];
  const slot = global.T001_flattenPathD(global.T001_elementToPathD(layout.cutElements[0]));
  const frontLock=frontLockTopology(layout);
  const panels = definitions.map(([id,xi,yi]) => ({id,
    polygon:id==='frontLock'?frontLock.polygon:clipPanel(outline,[X[xi],Y[yi],X[xi+1],Y[yi+1]]),
    topology:id==='frontLock'?frontLock:null, holes:id==='sideRight'?[slot]:[]}));
  const fold = (id,parentId,childId,a,b,phase,angle = 90) => ({id,parentId,childId,a,b,phase,angle});
  const folds = [
    fold('back-punch-side','back','sideRight',vec(X[1],Y[2]),vec(X[1],Y[3]),[.04,.18],90),
    fold('back-side-left','back','sideLeft',vec(X[2],Y[3]),vec(X[2],Y[2]),[.18,.38]),
    fold('side-left-front','sideLeft','front',vec(X[3],Y[3]),vec(X[3],Y[2]),[.30,.50]),
    fold('front-lock','front','frontLock',vec(X[4],Y[2]),vec(X[4],Y[3]),[.52,.66]),
    fold('left-top-dust','sideLeft','topDustLeft',vec(X[2],Y[2]),vec(X[3],Y[2]),[.66,.76]),
    fold('right-top-dust','sideRight','topDustRight',vec(X[0],Y[2]),vec(X[1],Y[2]),[.66,.76]),
    fold('left-bottom-dust','sideLeft','bottomDustLeft',vec(X[2],Y[3]),vec(X[3],Y[3]),[.66,.76]),
    fold('right-bottom-dust','sideRight','bottomDustRight',vec(X[0],Y[3]),vec(X[1],Y[3]),[.66,.76]),
    fold('front-lid-top','front','lidTop',vec(X[3],Y[2]),vec(X[4],Y[2]),[.82,.98],90),
    fold('lid-upper-tuck','lidTop','upperTuck',vec(X[3],Y[1]),vec(X[4],Y[1]),[.74,.84],105),
    fold('front-bottom-lid','front','bottomLid',vec(X[3],Y[3]),vec(X[4],Y[3]),[.82,.98],90),
    fold('bottom-lid-tuck','bottomLid','bottomTuck',vec(X[3],Y[4]),vec(X[4],Y[4]),[.74,.84],105)
  ];
  return {code:'T006',dimensions:{W:layout.spec.W,D:layout.spec.D,H:layout.spec.H},layout,panels,folds,
    states:{flat:0,body:.55,stand:.75,closed:1}};
}function createMaster(input) {
  const THREE=global.THREE, Viewer=global.PacVu3DViewer;
  if (!THREE || !Viewer || !global.PacVuOrbitControls) throw new Error('T006 shared 3D Viewer unavailable.');
  const contract=buildContract(input), bounds=contract.layout.dielineBounds;
  const center=vec(bounds.minX+bounds.width/2,bounds.minY+bounds.height/2), thickness=.45;
  const to3=p=>new THREE.Vector3(p.x-center.x,center.y-p.y,0);
  const {modal,stage}=Viewer.createModal({id:'t0063dModal',badge:'T006 Tear-Open Tuck Box 3D'});
  const scene=new THREE.Scene(); scene.background=new THREE.Color(global.PacVu3DTheme.colors.background);
  const camera=Viewer.createPerspectiveCamera(THREE,contract.dimensions);
  const renderer=Viewer.createRenderer(THREE); renderer.setPixelRatio(Math.min(global.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace; stage.prepend(renderer.domElement);
  const controls=new global.PacVuOrbitControls(camera,renderer.domElement); controls.enableDamping=true;
  scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,
    global.PacVu3DTheme.hemisphereLight.groundColor,global.PacVu3DTheme.hemisphereLight.intensity));
  const sun=new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color,
    global.PacVu3DTheme.directionalLight.intensity);
  sun.position.fromArray(global.PacVu3DTheme.directionalLight.position); sun.castShadow=true; scene.add(sun);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.ShadowMaterial({color:0x3f3933,opacity:.3}));
  floor.receiveShadow=true; floor.position.z=-2; scene.add(floor);
  const grid=new THREE.GridHelper(global.PacVu3DTheme.grid.size,global.PacVu3DTheme.grid.divisions,
    global.PacVu3DTheme.grid.centerColor,global.PacVu3DTheme.grid.lineColor);
  grid.rotation.x=Math.PI/2; grid.position.z=global.PacVu3DTheme.grid.z; scene.add(grid);
  Viewer.standardizeEnvironment({renderer,scene,controls,floor,grid});
  const materials=Viewer.createBoardMaterials(THREE);
  materials[1].color.set(global.PacVu3DTheme.colors.exterior);
  materials[2].color.set(global.PacVu3DTheme.colors.exterior);
  const whitePaperboard=global.PacVuWhitePaperboard?.createMaterials(THREE,renderer,{sourceMaterials:materials});
  const materialSets={existing:materials,white:whitePaperboard?.materials||materials};
  let materialMode='existing';
  const root=new THREE.Group();root.name='T006 source-cut assembly';scene.add(root);
  const pieces=new Map();
  contract.panels.forEach(def=>{
    const xs=def.polygon.map(p=>p.x),ys=def.polygon.map(p=>p.y);
    const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
    const shape=new THREE.Shape();
    const panelPolygon=def.polygon;
    panelPolygon.forEach((p,i)=>i?shape.lineTo(p.x-cx,cy-p.y):shape.moveTo(p.x-cx,cy-p.y));shape.closePath();
    def.holes.forEach(points=>{const hole=new THREE.Path();points.forEach((p,i)=>i?hole.lineTo(p.x-cx,cy-p.y):hole.moveTo(p.x-cx,cy-p.y));hole.closePath();shape.holes.push(hole);});
    const geometry=def.topology?frontLockGeometry(THREE,def.topology,cx,cy,thickness)
      :new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:16});
    if(!def.topology)geometry.translate(0,0,-thickness/2);
    global.PacVuWhitePaperboard?.applyPhysicalUV(THREE,geometry,{offsetX:cx,offsetY:cy});
    Viewer.assignBoardFaceMaterials(geometry,thickness,'interior');
    const panelMaterial=materials;
    const mesh=new THREE.Mesh(geometry,panelMaterial);mesh.name=def.id;mesh.castShadow=true;mesh.receiveShadow=true;
    if(def.topology){
      // Edge accents expose the zero-width cuts in Flat view; the surfaces and
      // cut walls above are already split. These do not substitute for geometry.
      const edgePoints=[];
      [-1,1].forEach(side=>def.topology.slits.forEach(s=>[s.a,s.b].forEach(p=>edgePoints.push(new THREE.Vector3(p.x-cx,cy-p.y,side*(thickness/2+.002))))));
      const edgeGeometry=new THREE.BufferGeometry().setFromPoints(edgePoints);
      const edgeMaterial=new THREE.LineBasicMaterial({color:0x655a50,transparent:true,opacity:.7,depthTest:true});
      const edges=new THREE.LineSegments(edgeGeometry,edgeMaterial);edges.name='FrontLock physical slit boundaries';mesh.add(edges);
    }
    if(def.id==='front'||def.id==='frontLock'){
      const rect=def.id==='front'
        ?{left:contract.layout.grid.xSideMid,right:contract.layout.grid.xFrontRight}
        :{left:contract.layout.grid.xFrontRight,right:contract.layout.grid.xSideRight};
      contract.layout.punchElements.forEach((element,index)=>{
        const points=global.T001_flattenPathD(global.T001_elementToPathD(element));
        const segments=[];
        for(let i=1;i<points.length;i++){
          const a=points[i-1],b=points[i],midX=(a.x+b.x)/2;
          if(midX>=rect.left-.01&&midX<=rect.right+.01)segments.push(a,b);
        }
        if(!segments.length)return;
        [-1,1].forEach(face=>{
          const lineGeometry=new THREE.BufferGeometry().setFromPoints(segments.map(p=>new THREE.Vector3(p.x-cx,cy-p.y,face*(thickness/2+.03))));
          const lineMaterial=new THREE.LineBasicMaterial({color:0x666666,transparent:true,opacity:.32,depthTest:true});
          const line=new THREE.LineSegments(lineGeometry,lineMaterial);line.name='T006 punch '+index+' '+def.id+' face '+face;line.computeLineDistances();line.renderOrder=3;mesh.add(line);
        });
      });
    }    mesh.position.set(cx-center.x,center.y-cy,0);pieces.set(def.id,{mesh,flatCenter:mesh.position.clone()});
  });
  root.rotation.z=Math.PI;
  const sheet=new THREE.Group();root.add(sheet);sheet.add(pieces.get('back').mesh);
  const frames=new Map([['back',sheet]]),hinges=[];
  contract.folds.forEach(relation=>{
    const parent=frames.get(relation.parentId),piece=pieces.get(relation.childId);
    if(!parent||!piece)throw new Error('T006 3D fold hierarchy: '+relation.id);
    const a=to3(relation.a),b=to3(relation.b),hinge=new THREE.Group();hinge.position.copy(a);parent.add(hinge);
    const frame=new THREE.Group();frame.position.copy(a).multiplyScalar(-1);hinge.add(frame);frame.add(piece.mesh);frames.set(relation.childId,frame);
    const axis=b.clone().sub(a).normalize(),radial=piece.flatCenter.clone().sub(a);
    const sign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;
    hinges.push({hinge,axis,radians:THREE.MathUtils.degToRad(relation.angle)*sign,phase:relation.phase});
  });
  const slider=modal.querySelector('input'),clamp=v=>Math.max(0,Math.min(1,v));
  let whiteStudio=null;
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
  function pose(value){
    const p=clamp(value);
    hinges.forEach(h=>h.hinge.quaternion.setFromAxisAngle(h.axis,h.radians*smooth((p-h.phase[0])/(h.phase[1]-h.phase[0]))));
    pieces.get('frontLock').mesh.position.z=-thickness*smooth((p-.52)/(.66-.52));
    ['topDustLeft','topDustRight','bottomDustLeft','bottomDustRight'].forEach(id=>pieces.get(id).mesh.visible=p<.985);
    root.position.z=0;root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root);
    if(!box.isEmpty())root.position.z=grid.position.z+thickness/2-box.min.z;
    modal.querySelector('.assembly-fill').style.width=Math.round(p*100)+'%';
  }
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function view(type){if(type==='iso'&&whiteStudio){Viewer.fitObject(root,camera,controls,'iso');whiteStudio.view();}else Viewer.fitObject(root,camera,controls,type);}
  function setMaterialMode(mode){
    materialMode=mode==='white'?'white':'existing';
    pieces.forEach(piece=>{piece.mesh.material=materialSets[materialMode];});
    modal.querySelectorAll('[data-material-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.materialMode===materialMode)));
  }
  const materialControls=document.createElement('div');
  const viewControls=modal.querySelector('.m001-3d-views.pacvu-viewer__views');
  viewControls?.classList.add('t006-view-controls');
  materialControls.className='m001-3d-views pacvu-viewer__views t006-material-controls';
  materialControls.style.right='118px';
  materialControls.innerHTML='<button type="button" class="btn light" data-material-mode="existing" aria-pressed="true">Existing Material</button><button type="button" class="btn light" data-material-mode="white" aria-pressed="false">White Paperboard</button>';
  stage.append(materialControls);
  materialControls.querySelectorAll('[data-material-mode]').forEach(button=>{button.onclick=()=>setMaterialMode(button.dataset.materialMode);});
  slider.oninput=()=>pose(Number(slider.value)/100);
  modal.querySelectorAll('[data-view]').forEach(button=>{button.onclick=()=>view(button.dataset.view);});
  modal.querySelector('[data-close]').onclick=()=>modal.classList.remove('open');
  let gridVisible=grid.visible;const gridButton=modal.querySelector('[data-grid]');
  function syncGrid(){grid.visible=gridVisible;if(gridButton){gridButton.setAttribute('aria-pressed',String(gridVisible));gridButton.textContent=gridVisible?'Grid On':'Grid Off';}}
  if(gridButton)gridButton.onclick=()=>{gridVisible=!gridVisible;syncGrid();};
  syncGrid();
  let shadows=true;modal.querySelector('[data-shadow]').onclick=e=>{shadows=!shadows;renderer.shadowMap.enabled=shadows;sun.castShadow=shadows;floor.visible=shadows;whiteStudio?.setShadows(shadows);e.currentTarget.setAttribute('aria-pressed',String(shadows));e.currentTarget.textContent=shadows?'Shadows On':'Shadows Off';};
  modal.querySelector('[data-download]').onclick=()=>Viewer.downloadPNG({renderer,scene,camera,controls,filename:'T006_3D_'+slider.value+'.png'});
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();pose(0);Viewer.fitObject(root,camera,controls,'iso');
  whiteStudio=global.PacVuWhiteStudio?.create({scene,camera,controls,renderer,root,sun,floor,grid})||null;
  let hasInitialView=false;
  let live=true,frameId=0;(function animate(){if(!live)return;frameId=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);})();
  return {contract,signature:[contract.dimensions.W,contract.dimensions.D,contract.dimensions.H].join(':'),
    open(state){modal.classList.add('open');const value=contract.states[state]??Number(slider.value)/100;slider.value=String(Math.round(value*100));pose(value);resize();if(!hasInitialView){view('iso');hasInitialView=true;}},
    setState(state){const value=contract.states[state]??0;slider.value=String(Math.round(value*100));pose(value);},
    setMaterialMode,
    get materialMode(){return materialMode;},
    destroy(){live=false;cancelAnimationFrame(frameId);observer.disconnect();if(controls.dispose)controls.dispose();whiteStudio?.dispose();whitePaperboard?.dispose();renderer.dispose();modal.remove();}};
}
let master=null;
function open(state,input){const cfg=input||{W:100,D:40,H:220},signature=[cfg.W,cfg.D,cfg.H].join(':');if(!master||master.signature!==signature){if(master)master.destroy();master=createMaster(cfg);}master.open(state||'flat');return master;}
global.T006_3D_BUILD_CONTRACT=buildContract;
global.T006_3D_MASTER=Object.freeze({buildContract,create:createMaster,open});
function attachTrigger(){const toolbar=document.querySelector('.toolbar')||document.body;if(document.getElementById('t006-3d-btn'))return;const button=document.createElement('button');button.id='t006-3d-btn';button.type='button';button.style.display='none';button.onclick=()=>open('flat',typeof global.getCfgT006==='function'?global.getCfgT006():{W:100,D:40,H:220});toolbar.appendChild(button);}
if(typeof document!=='undefined'&&typeof document.querySelector==='function'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();}
})(window);

















