(function (global) {
  'use strict';
  if (!global.T005_getLayout) return;
  const EPS = 0.001;

  function clipEdge(points, inside, intersect) {
    const result = [];
    if (!points.length) return result;
    let previous = points[points.length - 1], previousInside = inside(previous);
    points.forEach(current => {
      const currentInside = inside(current);
      if (currentInside !== previousInside) result.push(intersect(previous, current));
      if (currentInside) result.push(current);
      previous = current; previousInside = currentInside;
    });
    return result;
  }
  function atX(a, b, x) { const t = Math.abs(b.x-a.x)<1e-9?0:(x-a.x)/(b.x-a.x); return {x,y:a.y+(b.y-a.y)*t}; }
  function atY(a, b, y) { const t = Math.abs(b.y-a.y)<1e-9?0:(y-a.y)/(b.y-a.y); return {x:a.x+(b.x-a.x)*t,y}; }
  function clipRect(points, b) {
    let p=points.slice();
    p=clipEdge(p,q=>q.x>=b.minX-EPS,(a,c)=>atX(a,c,b.minX));
    p=clipEdge(p,q=>q.x<=b.maxX+EPS,(a,c)=>atX(a,c,b.maxX));
    p=clipEdge(p,q=>q.y>=b.minY-EPS,(a,c)=>atY(a,c,b.minY));
    return clipEdge(p,q=>q.y<=b.maxY+EPS,(a,c)=>atY(a,c,b.maxY));
  }
  function area(points) { let n=0; for(let i=0,j=points.length-1;i<points.length;j=i++)n+=points[j].x*points[i].y-points[i].x*points[j].y; return Math.abs(n/2); }
  const rect=(minX,minY,maxX,maxY)=>({minX,minY,maxX,maxY});
  const panel=(id,role,polygon,holes)=>Object.freeze({id,role,polygon:Object.freeze(polygon),holes:Object.freeze(holes||[])});
  const fold=(id,parentId,childId,a,b,angle,phase)=>Object.freeze({id,parentId,childId,axis:Object.freeze({a,b}),angle,phase:Object.freeze(phase)});
  function polylinePoints(element) {
    const value=global.T001_attr(element,'points')||'';
    const numbers=(value.match(/[-+]?\d*\.?\d+/g)||[]).map(Number),points=[];
    for(let index=0;index<numbers.length;index+=2)points.push({x:numbers[index],y:numbers[index+1]});
    return points;
  }
  function applyTuckRelief(polygon,leftCut,rightCut,isUpper) {
    const leftInner=leftCut[1],rightInner=rightCut[1];
    const reliefY=(leftCut[0].y+rightCut[0].y)/2;
    return polygon.map(point=>{
      const inReliefZone=isUpper?point.y>=reliefY-EPS:point.y<=reliefY+EPS;
      if(!inReliefZone)return{x:point.x,y:point.y};
      return{x:Math.max(leftInner.x,Math.min(rightInner.x,point.x)),y:point.y};
    });
  }

  function buildContract(input) {
    const W=Number(input&&input.W)||286,D=Number(input&&input.D)||90,H=Number(input&&input.H)||344;
    const layout=global.T005_getLayout(W,D,H),g=layout.grid;
    const outline=global.T001_flattenPathD(layout.fillPath);
    if(!outline||outline.length<3)throw new Error('T005 3D: approved Cut outline is unavailable.');
    const regions=[
      ['glue','adhesive',rect(g.xGlueL,g.yBodyTop,g.xBackL,g.yBodyBottom)],
      ['back','body',rect(g.xBackL,g.yBodyTop,g.xBackR,g.yBodyBottom)],
      ['sideLeft','body',rect(g.xBackR,g.yBodyTop,g.xSideLR,g.yBodyBottom)],
      ['front','body',rect(g.xSideLR,g.yBodyTop,g.xFrontR,g.yBodyBottom)],
      ['sideRight','body',rect(g.xFrontR,g.yBodyTop,g.xSideRR,g.yBodyBottom)],
      ['upperTuck','tuck',rect(g.xSideLR,g.yTop,g.xFrontR,g.yUpperFold)],
      ['upperLid','lid',rect(g.xSideLR,g.yUpperFold,g.xFrontR,g.yBodyTop)],
      ['upperDustLeft','dust',rect(g.xBackR,g.yUpperFold,g.xSideLR,g.yBodyTop)],
      ['upperDustRight','dust',rect(g.xFrontR,g.yUpperFold,g.xSideRR,g.yBodyTop)],
      ['lowerLid','lid',rect(g.xBackL,g.yBodyBottom,g.xBackR,g.yLowerFold)],
      ['lowerTuck','tuck',rect(g.xBackL,g.yLowerFold,g.xBackR,g.yBottom)],
      ['lowerDustLeft','dust',rect(g.xBackR,g.yBodyBottom,g.xSideLR,g.yLowerFold)],
      ['lowerDustRight','dust',rect(g.xFrontR,g.yBodyBottom,g.xSideRR,g.yLowerFold)]
    ];
    const capsuleHoleEnabled=input.capsuleHoleEnabled!==false;
    const capsule=capsuleHoleEnabled?global.T001_flattenPathD(layout.capsuleHole.path):[];
    const reliefCuts=layout.shortCutElements.map(polylinePoints);
    const panels=regions.map(def=>{
      let polygon=clipRect(outline,def[2]);
      if(def[0]==='upperTuck')polygon=applyTuckRelief(polygon,reliefCuts[0],reliefCuts[1],true);
      if(def[0]==='lowerTuck')polygon=applyTuckRelief(polygon,reliefCuts[2],reliefCuts[3],false);
      return panel(def[0],def[1],polygon,def[0]==='sideLeft'&&capsuleHoleEnabled?[capsule]:[]);
    })
      .filter(item=>item.polygon.length>=3&&area(item.polygon)>EPS);
    const v=x=>[{x,y:g.yBodyTop},{x,y:g.yBodyBottom}],h=(x1,x2,y)=>[{x:x1,y},{x:x2,y}];
    const folds=[
      fold('body.front-sideLeft','front','sideLeft',...v(g.xSideLR),90,[.04,.14]),
      fold('body.sideLeft-back','sideLeft','back',...v(g.xBackR),90,[.10,.20]),
      fold('body.back-glue','back','glue',...v(g.xBackL),90,[.16,.26]),
      fold('body.front-sideRight','front','sideRight',...v(g.xFrontR),90,[.12,.22]),
      fold('lower.sideLeft-dust','sideLeft','lowerDustLeft',...h(g.xBackR,g.xSideLR,g.yBodyBottom),90,[.42,.50]),
      fold('lower.sideRight-dust','sideRight','lowerDustRight',...h(g.xFrontR,g.xSideRR,g.yBodyBottom),90,[.42,.50]),
      fold('lower.back-lid','back','lowerLid',...h(g.xBackL,g.xBackR,g.yBodyBottom),90,[.56,.68]),
      fold('lower.lid-tuck','lowerLid','lowerTuck',...h(g.xBackL,g.xBackR,g.yLowerFold),110,[.50,.56]),
      fold('upper.sideLeft-dust','sideLeft','upperDustLeft',...h(g.xBackR,g.xSideLR,g.yBodyTop),90,[.72,.80]),
      fold('upper.sideRight-dust','sideRight','upperDustRight',...h(g.xFrontR,g.xSideRR,g.yBodyTop),90,[.72,.80]),
      fold('upper.front-lid','front','upperLid',...h(g.xSideLR,g.xFrontR,g.yBodyTop),90,[.86,.98]),
      fold('upper.lid-tuck','upperLid','upperTuck',...h(g.xSideLR,g.xFrontR,g.yUpperFold),110,[.80,.86])
    ];
    const ids=new Set(panels.map(item=>item.id));
    folds.forEach(item=>{if(!ids.has(item.parentId)||!ids.has(item.childId))throw new Error('T005 3D hierarchy failed: '+item.id);});
    return Object.freeze({code:'T005',dimensions:Object.freeze({W,D,H}),options:Object.freeze({capsuleHoleEnabled}),layout,panels:Object.freeze(panels),folds:Object.freeze(folds),
      adhesiveRelations:Object.freeze([Object.freeze({id:'body-glue-seam',from:'glue',to:'sideRight'})]),
      states:Object.freeze({flat:0,body:.27,stand:.40,lower:.68,upper:.86,closed:1})});
  }

  function createMaster(input) {
    const THREE=global.THREE,Viewer=global.PacVu3DViewer;
    if(!THREE||!Viewer||!global.PacVuOrbitControls)throw new Error('T005 3D viewer dependencies are unavailable.');
    const contract=buildContract(input),C=contract.dimensions,bounds=contract.layout.dielineBounds;
    const center={x:bounds.minX+bounds.width/2,y:bounds.minY+bounds.height/2},thickness=.45;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
    const phase=(v,r)=>smooth((v-r[0])/(r[1]-r[0]));
    const point=p=>new THREE.Vector3(p.x-center.x,center.y-p.y,0);

    function geometryFor(def) {
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      def.polygon.forEach(p=>{minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);});
      const cx=(minX+maxX)/2,cy=(minY+maxY)/2,shape=new THREE.Shape();
      def.polygon.forEach((p,i)=>i?shape.lineTo(p.x-cx,cy-p.y):shape.moveTo(p.x-cx,cy-p.y)); shape.closePath();
      def.holes.forEach(points=>{const hole=new THREE.Path();points.forEach((p,i)=>i?hole.lineTo(p.x-cx,cy-p.y):hole.moveTo(p.x-cx,cy-p.y));hole.closePath();shape.holes.push(hole);});
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:48});
      geometry.translate(0,0,-thickness/2);Viewer.assignBoardFaceMaterials(geometry,thickness,'interior');geometry.computeVertexNormals();
      return {geometry,cx,cy};
    }

    const viewer=Viewer.createModal({id:'t0053dModal',badge:'T005 · Opposite Tuck End Box 3D Workbench'}),modal=viewer.modal,stage=viewer.stage;
    const labels=modal.querySelector('.assembly-labels');labels.innerHTML='<span>Flat</span><span>Body</span><span>Stand</span><span>Lower</span><span>Upper</span><span>Closed</span>';labels.style.setProperty('grid-template-columns','repeat(6,1fr)','important');
    Array.from(labels.children).forEach((node,index)=>{node.style.setProperty('justify-self',index===0?'start':index===5?'end':'center','important');node.style.textAlign=index===0?'left':index===5?'right':'center';});
    const scene=new THREE.Scene();scene.background=new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera=Viewer.createPerspectiveCamera(THREE,C),renderer=Viewer.createRenderer(THREE);renderer.setPixelRatio(Math.min(global.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;stage.prepend(renderer.domElement);
    const controls=new global.PacVuOrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,global.PacVu3DTheme.hemisphereLight.groundColor,global.PacVu3DTheme.hemisphereLight.intensity));
    const sun=new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color,global.PacVu3DTheme.directionalLight.intensity);sun.position.fromArray(global.PacVu3DTheme.directionalLight.position);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    const extent=Math.max(C.W,C.D,C.H)*1.4;sun.shadow.camera.left=-extent;sun.shadow.camera.right=extent;sun.shadow.camera.top=extent;sun.shadow.camera.bottom=-extent;sun.shadow.camera.near=1;sun.shadow.camera.far=Math.max(1600,extent*6);sun.shadow.bias=-.00035;sun.shadow.normalBias=1.5;scene.add(sun);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.ShadowMaterial({color:0x3f3933,opacity:.34}));floor.receiveShadow=true;floor.position.z=-2;scene.add(floor);
    const grid=new THREE.GridHelper(global.PacVu3DTheme.grid.size,global.PacVu3DTheme.grid.divisions,global.PacVu3DTheme.grid.centerColor,global.PacVu3DTheme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=global.PacVu3DTheme.grid.z;scene.add(grid);Viewer.standardizeEnvironment({renderer,scene,controls,floor,grid});
    const materials=Viewer.createBoardMaterials(THREE);materials[2].color.setHex(0xf2f0ed);materials[2].name='T005 light paper fold edge';
    const root=new THREE.Group();root.name='T005 Opposite Tuck Master';scene.add(root);const pieces=new Map();
    contract.panels.forEach(def=>{const made=geometryFor(def),mesh=new THREE.Mesh(made.geometry,materials);mesh.name=def.id;mesh.castShadow=true;mesh.receiveShadow=true;mesh.position.set(made.cx-center.x,center.y-made.cy,0);pieces.set(def.id,{mesh,flatCenter:mesh.position.clone()});});
    const front=pieces.get('front');if(!front)throw new Error('T005 3D front panel is unavailable.');
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=480;const ctx=canvas.getContext('2d');ctx.fillStyle='rgb(72,67,62)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 250px Pretendard';ctx.fillText('PacVu',512,165);ctx.font='500 48px Pretendard';ctx.fillText('Packaging + View + Use',512,370);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;front.mesh.geometry.computeBoundingBox();const fb=front.mesh.geometry.boundingBox,fs=new THREE.Vector3();fb.getSize(fs);
    const brand=new THREE.Mesh(new THREE.PlaneGeometry(fs.x*.76,fs.x*.76*canvas.height/canvas.width),Viewer.createOverlayMaterial(THREE,{map:texture,transparent:true,opacity:.42,depthWrite:false,side:THREE.FrontSide,toneMapped:false}));brand.position.set((fb.min.x+fb.max.x)/2,fb.max.y-fs.y*.30,-thickness/2-.012);brand.rotation.y=Math.PI;brand.renderOrder=1000;front.mesh.add(brand);

    const standPoint=point({x:contract.layout.grid.xSideLR,y:contract.layout.grid.yBodyBottom}),standHinge=new THREE.Group();standHinge.position.copy(standPoint);root.add(standHinge);
    const sheet=new THREE.Group();sheet.position.copy(standPoint).multiplyScalar(-1);standHinge.add(sheet);sheet.add(front.mesh);
    const frames=new Map([['front',sheet]]),hinges=[];
    contract.folds.forEach(relation=>{const parent=frames.get(relation.parentId),piece=pieces.get(relation.childId);if(!parent||!piece)throw new Error('T005 3D fold hierarchy failed at '+relation.id);const a=point(relation.axis.a),b=point(relation.axis.b),hinge=new THREE.Group();hinge.name=relation.id;hinge.position.copy(a);parent.add(hinge);const frame=new THREE.Group();frame.position.copy(a).multiplyScalar(-1);hinge.add(frame);frame.add(piece.mesh);frames.set(relation.childId,frame);const axis=b.clone().sub(a).normalize(),radial=piece.flatCenter.clone().sub(a),sign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;hinges.push({object:hinge,axis,radians:THREE.MathUtils.degToRad(relation.angle)*sign,range:relation.phase,id:relation.id});});
    function pose(value){const progress=clamp(value,0,1);hinges.forEach(hinge=>{let angle=hinge.radians*phase(progress,hinge.range);if((hinge.id==='lower.lid-tuck'||hinge.id==='upper.lid-tuck')&&progress>.98)angle=THREE.MathUtils.lerp(hinge.radians,Math.sign(hinge.radians)*THREE.MathUtils.degToRad(90),phase(progress,[.98,1]));hinge.object.quaternion.setFromAxisAngle(hinge.axis,angle);});standHinge.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2*phase(progress,[.28,.40]));modal.querySelector('.assembly-fill').style.width=Math.round(progress*100)+'%';modal.querySelector('.m001-3d-controls').style.setProperty('--progress',Math.round(progress*100)+'%');const active=progress<.12?0:progress<.32?1:progress<.46?2:progress<.70?3:progress<.90?4:5;modal.querySelectorAll('.assembly-labels span').forEach((node,index)=>node.classList.toggle('active',index<=active));}
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}function view(type){Viewer.fitObject(root,camera,controls,type);}
    const slider=modal.querySelector('input');slider.oninput=()=>pose(Number(slider.value)/100);slider.onchange=()=>view('iso');modal.querySelectorAll('[data-view]').forEach(button=>{button.onclick=()=>view(button.dataset.view);});modal.querySelector('[data-close]').onclick=()=>modal.classList.remove('open');
    let shadows=true;const shadowButton=modal.querySelector('[data-shadow]');shadowButton.setAttribute('aria-pressed','true');shadowButton.onclick=event=>{shadows=!shadows;renderer.shadowMap.enabled=shadows;sun.castShadow=shadows;floor.visible=shadows;sun.shadow.needsUpdate=true;event.currentTarget.setAttribute('aria-pressed',String(shadows));event.currentTarget.textContent=shadows?'Shadows On':'Shadows Off';};
    modal.querySelector('[data-download]').onclick=()=>renderer.domElement.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='T005_3D_'+slider.value+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);});
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();pose(0);view('iso');let live=true,frameId=0;(function animate(){if(!live)return;frameId=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);})();
    return {contract,signature:[C.W,C.D,C.H,contract.options.capsuleHoleEnabled?1:0].join(':'),open(state){modal.classList.add('open');const target=contract.states[state]??Number(slider.value)/100;slider.value=String(Math.round(target*100));pose(target);resize();view('iso');},setState(state){const target=contract.states[state]??0;slider.value=String(Math.round(target*100));pose(target);view('iso');},destroy(){live=false;cancelAnimationFrame(frameId);observer.disconnect();if(controls.dispose)controls.dispose();renderer.dispose();modal.remove();}};
  }
  let master=null;
  function open(state,input){const cfg=input||(typeof global.getCfgT005==='function'?global.getCfgT005():{W:286,D:90,H:344,capsuleHoleEnabled:true}),signature=[cfg.W,cfg.D,cfg.H,cfg.capsuleHoleEnabled!==false?1:0].join(':');if(!master||master.signature!==signature){if(master)master.destroy();master=createMaster(cfg);}master.open(state||'flat');return master;}
  global.T005_3D_BUILD_CONTRACT=buildContract;global.T005_3D_MASTER=Object.freeze({buildContract,create:createMaster,open});
  function attachTrigger(){const toolbar=document.querySelector('.toolbar')||document.body;if(document.getElementById('t005-3d-btn'))return;const button=document.createElement('button');button.id='t005-3d-btn';button.type='button';button.style.display='none';button.onclick=()=>open('flat');toolbar.appendChild(button);}
  if(typeof document!=='undefined'&&typeof document.querySelector==='function'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();
  }
})(window);
