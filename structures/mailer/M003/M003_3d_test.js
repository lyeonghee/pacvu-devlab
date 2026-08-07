// M003 flat glue mailer 3D fold preview.
(function(root){
  'use strict';
  let modal,stage,range,storageRange,assemblyModeButton,storageModeButton,storageMode=false,renderer,scene,camera,orbit,model,raf=0,bonds=[],rebuildTimer=0,boardMaterials=null,shadowOn=true,storageRig=null;
  const T=.18,hinges=[];
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};

  function pacvuBrand(panel,rotationZ=0){
    if(!panel)return null;
    const THREE=root.THREE,canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;
    const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
    context.fillStyle='rgb(72,67,62)';context.textAlign='center';context.textBaseline='middle';
    context.font='700 260px Arial, sans-serif';context.fillText('PacVu',512,105);
    context.font='500 42px Arial, sans-serif';context.letterSpacing='2px';context.fillText('Packaging + View + Use',512,262);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
    panel.geometry.computeBoundingBox();const bounds=panel.geometry.boundingBox,size=new THREE.Vector3();bounds.getSize(size);
    const width=size.x*.44,height=width*(canvas.height/canvas.width),brand=new THREE.Mesh(
      new THREE.PlaneGeometry(width,height),
      root.PacVu3DViewer.createOverlayMaterial(THREE,{map:texture,transparent:true,opacity:.46,depthWrite:false,side:THREE.FrontSide,toneMapped:false})
    );
    brand.name='PacVu front branding';brand.position.set((bounds.min.x+bounds.max.x)/2,(bounds.min.y+bounds.max.y)/2,-T/2-.012);
    brand.rotation.y=Math.PI;brand.rotation.z=rotationZ;brand.renderOrder=1000;brand.castShadow=false;brand.receiveShadow=false;brand.userData.pacvuBrand=true;
    panel.add(brand);return brand;
  }

  function install(){
    if(document.getElementById('m0033dBtn'))return;
    const toolbar=document.querySelector('.toolbar');if(!toolbar)return;
    const button=el('button','btn m001-3d-button','3D MOCKUP');button.id='m0033dBtn';toolbar.append(button);
    const viewer=root.PacVu3DViewer.createModal({id:'m0033dModal',badge:'M003 · Flat Glue Mailer'});
    modal=viewer.modal;stage=viewer.stage;range=viewer.range;
    const controls=viewer.controls,views=modal.querySelector('.m001-3d-views');
    const shadow=modal.querySelector('[data-shadow]'),download=modal.querySelector('[data-download]'),close=modal.querySelector('[data-close]');
    range.max='100';
    const modeSwitch=el('div','m003-pose-modes');
    assemblyModeButton=el('button','active','Assembly');assemblyModeButton.type='button';
    storageModeButton=el('button','','Storage Flat');storageModeButton.type='button';
    modeSwitch.append(assemblyModeButton,storageModeButton);controls.prepend(modeSwitch);
    // Storage Flat is paused. Keep the implementation intact, but hide its
    // mode switch from the user interface until work resumes.
    modeSwitch.style.display='none';
    storageRange=range.cloneNode();storageRange.max='125';storageRange.value='0';storageRange.setAttribute('aria-label','Storage flat progress');storageRange.className='m003-storage-range';storageRange.hidden=true;range.classList.add('m003-assembly-range');
    range.after(storageRange);
    const scopedStyle=el('style');scopedStyle.textContent='#m0033dModal .m003-pose-modes{display:grid;width:100%;grid-template-columns:1fr 1fr;gap:4px;padding:3px;border-radius:10px;background:#ececef}#m0033dModal .m003-pose-modes button{position:relative;z-index:3;padding:6px 10px;border:0;border-radius:8px;background:transparent;color:#6d7078;font:700 11px Arial,sans-serif;cursor:pointer}#m0033dModal .m003-pose-modes button.active{background:#fff;color:#17191d;box-shadow:0 1px 3px rgba(0,0,0,.14)}#m0033dModal .m001-3d-controls{padding-top:10px!important}';modal.append(scopedStyle);
    const labels=controls.querySelector('.assembly-labels');
    if(labels){labels.innerHTML='<span class="active">Flat</span><span>Fold</span><span>3D Mockup</span>';labels.style.gridTemplateColumns='repeat(3,1fr)';}
    const syncAssembly=()=>{const value=Number(range.value),step=value<34?0:value<90?1:2;controls.querySelectorAll('.assembly-labels span').forEach((node,index)=>node.classList.toggle('active',index<=step));};
    const setPoseMode=storage=>{storageMode=storage;assemblyModeButton.classList.toggle('active',!storage);storageModeButton.classList.toggle('active',storage);range.hidden=storage;storageRange.hidden=!storage;controls.querySelector('.assembly-title').textContent=storage?'Storage Flat · Step 5':'Assembly Stage';const labels=controls.querySelector('.assembly-labels');labels.innerHTML=storage?'<span class="active">Complete Box</span><span>Sides In</span><span>Side Panels Restored</span>':'<span class="active">Flat</span><span>Fold</span><span>3D Mockup</span>';
      if(storage)range.value='100';pose();if(!storage)syncAssembly();};
    assemblyModeButton.onclick=()=>setPoseMode(false);storageModeButton.onclick=()=>setPoseMode(true);button.onclick=open;shadow.onclick=()=>toggleShadow(shadow);download.onclick=()=>downloadTransparentPng('M003');close.onclick=closeView;modal.onclick=e=>{if(e.target===modal)closeView();};range.oninput=()=>{pose();syncAssembly();};range.onchange=fit;storageRange.oninput=pose;storageRange.onchange=fit;
    views.onclick=e=>{if(e.target.dataset.view)setView(e.target.dataset.view);};
    document.addEventListener('input',e=>{
      if(!['baseW','baseD','panelH'].includes(e.target?.id)||!modal.classList.contains('open'))return;
      clearTimeout(rebuildTimer);rebuildTimer=setTimeout(()=>build(false),80);
    });
    document.addEventListener('change',e=>{if(e.target?.id==='boxType')setTimeout(sync,0);});sync();
  }
  function sync(){const b=document.getElementById('m0033dBtn');if(!b)return;const active=typeof selectedBoxMeta!=='undefined'&&selectedBoxMeta.engineKey==='gbox3';b.style.display=active?'inline-flex':'none';if(!active)closeView();}
  function open(){modal.classList.add('open');ensureScene();build(true);resize();animate();}
  function closeView(){modal?.classList.remove('open');if(raf)cancelAnimationFrame(raf);raf=0;}
  function ensureScene(){
    if(renderer)return;const THREE=root.THREE,theme=root.PacVu3DTheme;renderer=root.PacVu3DViewer.createRenderer(THREE);renderer.setClearColor(theme.colors.background,1);stage.prepend(renderer.domElement);
    scene=new THREE.Scene();camera=root.PacVu3DViewer.createPerspectiveCamera(THREE,typeof getCfg==='function'?getCfg():null);
    scene.add(new THREE.HemisphereLight(theme.hemisphereLight.skyColor,theme.hemisphereLight.groundColor,theme.hemisphereLight.intensity));
    const light=new THREE.DirectionalLight(theme.directionalLight.color,theme.directionalLight.intensity);light.position.fromArray(theme.directionalLight.position);light.castShadow=true;light.shadow.mapSize.set(theme.directionalLight.shadowMapSize,theme.directionalLight.shadowMapSize);light.shadow.camera.left=-theme.directionalLight.shadowBounds;light.shadow.camera.right=theme.directionalLight.shadowBounds;light.shadow.camera.top=theme.directionalLight.shadowBounds;light.shadow.camera.bottom=-theme.directionalLight.shadowBounds;light.shadow.camera.near=theme.directionalLight.shadowNear;light.shadow.camera.far=theme.directionalLight.shadowFar;light.shadow.bias=theme.directionalLight.shadowBias;light.shadow.normalBias=theme.directionalLight.shadowNormalBias;scene.add(light);
    const fill=new THREE.DirectionalLight(theme.fillLight.color,theme.fillLight.intensity);fill.position.fromArray(theme.fillLight.position);scene.add(fill);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(2500,2500),new THREE.ShadowMaterial({color:0x48433e,opacity:.11}));floor.position.z=-2;floor.receiveShadow=true;scene.add(floor);
    const grid=new THREE.GridHelper(theme.grid.size,theme.grid.divisions,theme.grid.centerColor,theme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=theme.grid.z;grid.material.transparent=true;grid.material.opacity=theme.grid.opacity;scene.add(grid);
    orbit=new root.PacVuOrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.enablePan=false;orbit.minPolarAngle=.08;orbit.maxPolarAngle=Math.PI*.72;
    root.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls:orbit,floor,grid});
    window.addEventListener('resize',resize);
  }
  function downloadTransparentPng(code){
    if(!renderer||!scene||!camera)return;const hidden=[],brands=[];
    scene.traverse(object=>{if(object.userData?.pacvuBrand){brands.push([object.material,object.material.opacity]);object.material.opacity=.78;}if(object.isGridHelper||object.type==='GridHelper'||object.material?.isShadowMaterial){hidden.push([object,object.visible]);object.visible=false;}});
    const background=scene.background,clearColor=renderer.getClearColor(new root.THREE.Color()).clone(),clearAlpha=renderer.getClearAlpha();scene.background=null;renderer.setClearColor(0x000000,0);renderer.render(scene,camera);
    renderer.domElement.toBlob(blob=>{hidden.forEach(([object,visible])=>{object.visible=visible;});brands.forEach(([material,opacity])=>{material.opacity=opacity;});scene.background=background;renderer.setClearColor(clearColor,clearAlpha);renderer.render(scene,camera);if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${code}_3D_${Math.round(Number(range.value))}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);},'image/png');
  }
  function toggleShadow(button){shadowOn=!shadowOn;scene?.traverse(object=>{if(object.material?.isShadowMaterial)object.visible=shadowOn;if(object.isDirectionalLight)object.castShadow=shadowOn;});button.textContent=shadowOn?'Shadows On':'Shadows Off';}
  function materials(){
    if(boardMaterials)return boardMaterials;
    boardMaterials=root.PacVu3DViewer.createBoardMaterials(root.THREE);
    return boardMaterials;
  }
  function assignFaceMaterials(geometry){
    return root.PacVu3DViewer.assignBoardFaceMaterials(geometry,T,'interior');
  }
  function coordinateWarper(cfg){
    const xL=612.284,xR=1195.645,ys=[141.565,323.485,917.453,1096.199,1681.553,1865.805];
    const sourceW=1193.726-612.623,modelScale=205/sourceW,sxC=cfg.W/205,sxS=cfg.H/65;
    const x=n=>n<xL?xL+(n-xL)*sxS:n<=xR?xL+(n-xL)*sxC:xL+(xR-xL)*sxC+(n-xR)*sxS;
    const targets=[cfg.H,cfg.D,cfg.H,cfg.D,cfg.H];
    const ratios=targets.map((target,index)=>target/(modelScale*(ys[index+1]-ys[index]))),starts=[ys[0]];
    for(let i=0;i<5;i+=1)starts.push(starts[i]+(ys[i+1]-ys[i])*ratios[i]);
    const y=n=>{let i=0;if(n>=ys[5])i=4;else while(i<4&&n>=ys[i+1])i+=1;return starts[i]+(n-ys[i])*ratios[i];};
    return {x,y,point:(xValue,yValue)=>({x:x(xValue),y:y(yValue)})};
  }
  function sampleSvgPath(d){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);const length=path.getTotalLength(),count=Math.max(24,Math.ceil(length/2)),points=[];for(let index=0;index<count;index+=1){const p=path.getPointAtLength(length*index/count);points.push({x:p.x,y:p.y});}return points;}
  function clipPolygon(subject,mask){
    const area=mask.reduce((sum,p,index)=>{const q=mask[(index+1)%mask.length];return sum+p.x*q.y-q.x*p.y;},0),sign=area>=0?1:-1;
    let output=subject.slice();
    mask.forEach((a,index)=>{const b=mask[(index+1)%mask.length],input=output;output=[];const inside=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))>=-.01;const cross=(p,q)=>{const rx=q.x-p.x,ry=q.y-p.y,sx=b.x-a.x,sy=b.y-a.y,den=rx*sy-ry*sx;if(Math.abs(den)<1e-9)return q;const t=((a.x-p.x)*sy-(a.y-p.y)*sx)/den;return{x:p.x+t*rx,y:p.y+t*ry};};for(let i=0;i<input.length;i+=1){const p=input[(i+input.length-1)%input.length],q=input[i],pi=inside(p),qi=inside(q);if(pi!==qi)output.push(cross(p,q));if(qi)output.push(q);}});
    return output;
  }
  function regionGeometry(outline,mask,holes=[]){
    const THREE=root.THREE,polygon=clipPolygon(outline,mask),shape=new THREE.Shape();
    polygon.forEach((p,index)=>index?shape.lineTo(p.x,-p.y):shape.moveTo(p.x,-p.y));shape.closePath();
    holes.forEach(item=>{if(item.r){const hole=new THREE.Path();hole.absarc(item.cx,-item.cy,item.r,0,Math.PI*2,false);shape.holes.push(hole);}else{const hole=new THREE.Path(),points=item.points||sampleSvgPath(item.d||item);points.forEach((p,index)=>index?hole.lineTo(p.x,-p.y):hole.moveTo(p.x,-p.y));hole.closePath();shape.holes.push(hole);}});
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false,curveSegments:12});geometry.translate(0,0,-T/2);return assignFaceMaterials(geometry);
  }
  function regionMesh(id,out,mask,holes){const mesh=new root.THREE.Mesh(regionGeometry(out,mask,holes),materials());mesh.name=id;mesh.castShadow=true;mesh.receiveShadow=false;return mesh;}
  function attach(parentFrame,childMesh,a,b,start,end,angle=90,collapseAt=null,hingeOffset=0){
    const THREE=root.THREE,p=new THREE.Vector3(a.x,-a.y,hingeOffset),q=new THREE.Vector3(b.x,-b.y,hingeOffset),hinge=new THREE.Group();hinge.position.copy(p);parentFrame.add(hinge);const frame=new THREE.Group();frame.position.copy(p).multiplyScalar(-1);hinge.add(frame);frame.add(childMesh);
    const axis=q.sub(p).normalize(),box=new THREE.Box3().setFromObject(childMesh),center=box.getCenter(new THREE.Vector3()),radial=center.sub(p),inward=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;
    const hingeState={g:hinge,axis,angle:angle*inward,inward,start,end,fixed:false,collapseAt};
    hinges.push(hingeState);
    frame.userData.hinge=hinge;
    frame.userData.hingeState=hingeState;
    return frame;
  }
  function localHome(object){return {position:object.position.clone(),quaternion:object.quaternion.clone(),scale:object.scale.clone()};}
  function restoreLocal(object,home){object.position.copy(home.position);object.quaternion.copy(home.quaternion);object.scale.copy(home.scale);object.updateMatrix();}
  function registerBond(source,target,leaderHinge,drivenHinge,threshold,reference){
    bonds.push({source,target,leaderHinge,drivenHinge,threshold,reference,sourceHome:localHome(source),drivenHome:localHome(drivenHinge),bondedTarget:null});
  }
  function restoreBondHomes(){
    bonds.forEach(bond=>{
      restoreLocal(bond.source,bond.sourceHome);
      restoreLocal(bond.drivenHinge,bond.drivenHome);
      bond.source.visible=true;
      bond.target.visible=true;
      if(bond.bondedTarget)bond.bondedTarget.visible=false;
    });
  }
  function applyHingePose(p){hinges.forEach(h=>{const q=h.angle===0?0:h.fixed?1:smooth((p-h.start)/(h.end-h.start));h.g.quaternion.setFromAxisAngle(h.axis,root.THREE.MathUtils.degToRad(h.angle*q));});}
  function captureBonds(){
    bonds.forEach(bond=>{
      restoreBondHomes();
      applyHingePose(bond.reference);
      model.updateMatrixWorld(true);
      bond.contactMatrix=bond.source.matrixWorld.clone().invert().multiply(bond.target.matrixWorld.clone());
      const bondedTarget=bond.target.clone();
      bondedTarget.name=`${bond.target.name}-bonded`;
      bondedTarget.userData.pacvuBondCopy=true;
      bond.target.parent.add(bondedTarget);
      bondedTarget.position.copy(bond.target.position);
      bondedTarget.quaternion.copy(bond.target.quaternion);
      bondedTarget.scale.copy(bond.target.scale);
      model.updateMatrixWorld(true);
      // Same rule as T002: hand the pressed glue face to the receiving
      // assembly while preserving the exact world transform at contact.
      bond.leaderHinge.attach(bondedTarget);
      bondedTarget.visible=false;
      bond.bondedTarget=bondedTarget;
    });
    restoreBondHomes();
  }
  function enforceBonds(p){
    bonds.forEach(bond=>{
      const bonded=p>=bond.threshold&&!!bond.bondedTarget;
      bond.source.visible=true;
      bond.target.visible=!bonded;
      if(bond.bondedTarget)bond.bondedTarget.visible=bonded;
    });
  }
  function exactSheetGeometry(layout){
    const THREE=root.THREE;
    const sample=d=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);const length=path.getTotalLength(),count=Math.max(24,Math.ceil(length/2)),points=[];for(let index=0;index<count;index+=1)points.push(path.getPointAtLength(length*index/count));return points;};
    const outline=sample(layout.cutFillPath),shape=new THREE.Shape();
    outline.forEach((point,index)=>index?shape.lineTo(point.x,-point.y):shape.moveTo(point.x,-point.y));
    shape.closePath();
    (layout.cutFillVoids||[]).forEach(d=>{const hole=new THREE.Path();sample(d).forEach((point,index)=>index?hole.lineTo(point.x,-point.y):hole.moveTo(point.x,-point.y));hole.closePath();shape.holes.push(hole);});
    (layout.holes||[]).forEach(hole=>{
      const path=new THREE.Path();
      path.absarc(hole.cx,-hole.cy,hole.r,0,Math.PI*2,false);
      shape.holes.push(path);
    });
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false,curveSegments:12});
    geometry.translate(0,0,-T/2);
    return assignFaceMaterials(geometry);
  }
  function build(resetPose){
    const THREE=root.THREE,cfg=typeof getCfgM003==='function'?getCfgM003():{W:205,D:205,H:65};
    if(model){scene.remove(model);model.traverse(o=>{o.geometry?.dispose();if(o.material){if(o.userData?.pacvuBrand)o.material.map?.dispose();o.material.dispose?.();}});}
    hinges.length=0;bonds=[];storageRig=null;model=new THREE.Group();scene.add(model);
    const layout=root.M003_getLayout(cfg),warp=coordinateWarper(cfg),point=warp.point;
    const polygon=points=>points.map(p=>point(p.x,p.y));
    const out=polygon(sampleSvgPath(layout.cutFillPath));
    const rect=(x1,y1,x2,y2)=>[point(x1,y1),point(x2,y1),point(x2,y2),point(x1,y2)];
    const base=regionMesh('base',out,rect(612.623,1096.199,1193.726,1681.553),[...(layout.cutFillVoids||[]).map(d=>({points:polygon(sampleSvgPath(d))}))]);model.add(base);
    const back=regionMesh('back',out,rect(613.482,917.453,1194.585,1096.199));
    const backL=regionMesh('B-Glue-out-L',out,rect(475,917.453,613.482,1096.199));
    const backR=regionMesh('B-Glue-out-R',out,rect(1194.585,917.453,1335,1096.199));
    const sideLMask=polygon([{x:612.623,y:1100.76},{x:612.633,y:1681.553},{x:428.494,y:1681.553},{x:428.494,y:1275.03}]);
    const sideRMask=polygon([{x:1193.716,y:1098.325},{x:1380.79,y:1278.28},{x:1380.79,y:1681.553},{x:1193.726,y:1681.553}]);
    const sideL=regionMesh('side-panel-L',out,sideLMask),sideR=regionMesh('side-panel-R',out,sideRMask);
    const bGlueInLPoints=polygon([{x:428.494,y:1100.451},{x:612.623,y:1100.76},{x:428.494,y:1275.03}]);
    const bGlueInRPoints=polygon([{x:1193.716,y:1098.325},{x:1380.79,y:1100.451},{x:1380.79,y:1278.28}]);
    const bGlueInL=regionMesh('B-Glue-in-L',out,bGlueInLPoints);
    const bGlueInR=regionMesh('B-Glue-in-R',out,bGlueInRPoints);
    const f7L=regionMesh('f-7-inner-fold-L',out,rect(360,1096.199,428.494,1681.553));
    const f7R=regionMesh('f-7-inner-fold-R',out,rect(1380.79,1096.199,1445,1681.553));
    const front=regionMesh('front',out,rect(613.573,1681.553,1194.675,1870),layout.holes.filter(h=>h.cy>1681));
    const lid=regionMesh('lid',out,rect(611.12,323.485,1197.892,917.453));
    pacvuBrand(lid,Math.PI);
    const dust=regionMesh('dustFront',out,rect(611.614,140,1198.293,323.485),layout.holes.filter(h=>h.cy<323));
    const leftMainMask=polygon([{x:611.12,y:326.436},{x:611.12,y:917.453},{x:425.075,y:917.453},{x:425.075,y:510.825}]);
    const rightMainMask=polygon([{x:1197.892,y:326.436},{x:1384.208,y:510.828},{x:1384.208,y:917.453},{x:1197.892,y:917.453}]);
    const lidL=regionMesh('lidSideFlapLeft',out,leftMainMask),lidR=regionMesh('lidSideFlapRight',out,rightMainMask);
    const glueInL=regionMesh('A-Glue-in-L',out,polygon([{x:425.075,y:326.436},{x:611.12,y:326.436},{x:425.075,y:510.825}]));
    const glueInR=regionMesh('A-Glue-in-R',out,polygon([{x:1197.892,y:326.436},{x:1384.208,y:326.436},{x:1384.208,y:510.828}]));
    const dustL=regionMesh('A-Glue-out-L',out,rect(470,140,611.614,323.485)),dustR=regionMesh('A-Glue-out-R',out,rect(1198.293,140,1340,323.485));
    const backFrame=attach(model,back,point(615.978,1096.199),point(1196.363,1096.199),.56,.66,90,.95);
    const lidFrame=attach(backFrame,lid,point(614.113,917.453),point(1195.215,917.453),.78,.88,90,.88,-T/2);
    const sideLFrame=attach(model,sideL,point(612.623,1100.76),point(612.633,1681.862),.56,.66,90,.95);
    const sideRFrame=attach(model,sideR,point(1193.716,1098.325),point(1193.726,1679.427),.56,.66,90,.95);
    // f-11 is reserved for the optional storage-flat action. The standard
    // close sequence keeps the bonded B Glue-in gussets fixed.
    const bGlueInLFrame=attach(sideLFrame,bGlueInL,point(612.623,1100.76),point(428.494,1275.03),0,1,0);
    const bGlueInRFrame=attach(sideRFrame,bGlueInR,point(1193.716,1098.325),point(1380.79,1278.28),0,1,0);
    const f7LFrame=attach(sideLFrame,f7L,point(428.494,1100.451),point(428.494,1681.553),.66,.72,90,.95);
    const f7RFrame=attach(sideRFrame,f7R,point(1380.79,1100.451),point(1380.79,1681.553),.66,.72,90,.95);
    const frontFrame=attach(model,front,point(615.26,1681.553),point(1195.645,1681.553),.72,.78,90,.92);
    const backLFrame=attach(backFrame,backL,point(613.482,920.455),point(613.483,1090.561),.45,.56,90,.95);
    const backRFrame=attach(backFrame,backR,point(1194.584,920.454),point(1194.585,1090.56),.45,.56,90,.95);
    const dustFrame=attach(lidFrame,dust,point(612.284,323.485),point(1199.056,323.485),.18,.45,90,.95,-T/2);
    const lidLFrame=attach(lidFrame,lidL,point(611.129,326.436),point(611.12,913.208),.18,.45,90,.95,-T/2);
    const lidRFrame=attach(lidFrame,lidR,point(1197.892,326.436),point(1197.883,913.208),.18,.45,90,.95,-T/2);
    // f-10 is also a storage-flat fold, not part of the normal lid closure.
    const glueInLFrame=attach(lidLFrame,glueInL,point(425.075,510.825),point(609.327,326.436),0,1,0);
    const glueInRFrame=attach(lidRFrame,glueInR,point(1384.208,510.828),point(1199.956,326.439),0,1,0);
    // A Glue out tabs fold inward first. The three lid walls rise only after
    // the tabs are inside, bringing their out faces onto the A Glue in faces.
    const dustLFrame=attach(dustFrame,dustL,point(611.615,142.677),point(611.614,320.518),0,.18);
    const dustRFrame=attach(dustFrame,dustR,point(1198.293,140.577),point(1198.292,318.417),0,.18);
    const bounds=layout.bounds,sourceW=1193.726-612.623,scale=205/sourceW;
    const minX=warp.x(bounds.minX),maxX=warp.x(bounds.maxX),minY=warp.y(bounds.minY),maxY=warp.y(bounds.maxY);
    model.scale.setScalar(scale);
    model.position.set(-(minX+maxX)*scale/2,(minY+maxY)*scale/2,0);
    // The glue constraint belongs to the diagonal gusset hinges (f-10/f-11),
    // never to the full side-panel hinges. This keeps the glued paper closed
    // while allowing the assembled walls to collapse along their diagonals.
    registerBond(dustL,glueInL,dustLFrame.userData.hinge,glueInLFrame.userData.hinge,.45,.45);
    registerBond(dustR,glueInR,dustRFrame.userData.hinge,glueInRFrame.userData.hinge,.45,.45);
    registerBond(backL,bGlueInL,backLFrame.userData.hinge,bGlueInLFrame.userData.hinge,.66,.66);
    registerBond(backR,bGlueInR,backRFrame.userData.hinge,bGlueInRFrame.userData.hinge,.66,.66);
    storageRig={
      backFrame,lidFrame,frontFrame,sideLFrame,sideRFrame,lidLFrame,lidRFrame,
      f7LFrame,f7RFrame,dustFrame,
      aDiagLFrame:glueInLFrame,aDiagRFrame:glueInRFrame,
      bDiagLFrame:bGlueInLFrame,bDiagRFrame:bGlueInRFrame,
      aGlueOutLFrame:dustLFrame,aGlueOutRFrame:dustRFrame,
      bGlueOutLFrame:backLFrame,bGlueOutRFrame:backRFrame
    };
    captureBonds();
    if(resetPose){range.value='0';storageRange.value='0';storageMode=false;assemblyModeButton.click();}else pose();fit();
  }
  function smooth(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}
  function rotateFromAssembly(frame,turns,amount){
    if(!frame)return;
    const state=frame.userData.hingeState;
    state.g.quaternion.multiply(new root.THREE.Quaternion().setFromAxisAngle(
      state.axis,
      root.THREE.MathUtils.degToRad(state.angle*turns*amount)
    ));
  }
  function solveStorageBond(bond,amount){
    const THREE=root.THREE,diagonalFrame=bond.target.parent.parent,backFlapFrame=bond.source.parent.parent;
    const diagonal=diagonalFrame.userData.hingeState,backFlap=backFlapFrame.userData.hingeState;
    const diagonalHome=diagonal.g.quaternion.clone(),backFlapHome=backFlap.g.quaternion.clone();
    const expected=new THREE.Matrix4(),actualPosition=new THREE.Vector3(),expectedPosition=new THREE.Vector3();
    const actualQuaternion=new THREE.Quaternion(),expectedQuaternion=new THREE.Quaternion();
    const actualScale=new THREE.Vector3(),expectedScale=new THREE.Vector3();
    const diagonalTurn=new THREE.Quaternion(),backFlapTurn=new THREE.Quaternion();
    const evaluate=(diagonalAngle,backFlapAngle)=>{
      diagonal.g.quaternion.copy(diagonalHome).multiply(diagonalTurn.setFromAxisAngle(diagonal.axis,diagonalAngle));
      backFlap.g.quaternion.copy(backFlapHome).multiply(backFlapTurn.setFromAxisAngle(backFlap.axis,backFlapAngle));
      model.updateMatrixWorld(true);
      expected.multiplyMatrices(bond.source.matrixWorld,bond.contactMatrix);
      bond.target.matrixWorld.decompose(actualPosition,actualQuaternion,actualScale);
      expected.decompose(expectedPosition,expectedQuaternion,expectedScale);
      const positionError=actualPosition.distanceToSquared(expectedPosition);
      const orientationError=1-Math.abs(actualQuaternion.dot(expectedQuaternion));
      return positionError+orientationError*25000;
    };
    const direction=diagonal.inward,backDirection=backFlap.inward;
    let bestDiagonal=direction*Math.PI*.5*amount,bestBack=backDirection*Math.PI*.5*amount;
    let span=Math.PI*.75,bestError=Infinity;
    for(let pass=0;pass<4;pass+=1){
      const centerDiagonal=bestDiagonal,centerBack=bestBack;
      for(let row=-4;row<=4;row+=1)for(let column=-4;column<=4;column+=1){
        const diagonalAngle=centerDiagonal+span*row/4,backFlapAngle=centerBack+span*column/4;
        const error=evaluate(diagonalAngle,backFlapAngle);
        if(error<bestError){bestError=error;bestDiagonal=diagonalAngle;bestBack=backFlapAngle;}
      }
      span*=.25;
    }
    evaluate(bestDiagonal,bestBack);
  }




  
  function applyStorageStep2(value){
    if(!storageRig)return;
    const step1=smooth(value/45),step2=smooth((value-45)/25),test1=smooth((value-70)/30),step5=smooth((value-100)/25);
    // Step 1: open the completed lid by 45 degrees and lower the front.
    rotateFromAssembly(storageRig.lidFrame,-.5,step1);
    rotateFromAssembly(storageRig.frontFrame,-1,step1);
    // Steps 2-3: unfold the arrow-marked panels while the lid opens
    // another 25 degrees, stopping at 70 degrees total.
    rotateFromAssembly(storageRig.lidFrame,-25/90,step2);
    rotateFromAssembly(storageRig.f7LFrame,-1,step2);
    rotateFromAssembly(storageRig.f7RFrame,-1,step2);
    // Step 4: fold the side walls first, then solve the two closed B-glue
    // linkages so their original bonded faces remain coincident throughout.
    rotateFromAssembly(storageRig.sideLFrame,1,test1);
    rotateFromAssembly(storageRig.sideRFrame,1,test1);
    if(test1>0){
      const storageBonds=bonds.filter(bond=>bond.target.name.startsWith('B-Glue-in'));
      solveStorageBond(storageBonds[0],test1);
      solveStorageBond(storageBonds[1],test1);
    }
    // Step 5: return the existing diagonal regions to zero degrees so each
    // side reads as one continuous panel; no new triangle mesh is introduced.
    if(step5>0){
      bonds.filter(bond=>bond.target.name.startsWith('B-Glue-in')).forEach(bond=>{
        const foldedQuaternion=bond.drivenHinge.quaternion.clone();
        restoreLocal(bond.drivenHinge,bond.drivenHome);
        bond.drivenHinge.quaternion.copy(foldedQuaternion).slerp(bond.drivenHome.quaternion,step5);
        bond.source.visible=true;bond.target.visible=true;
        if(bond.bondedTarget)bond.bondedTarget.visible=false;
      });
    }
  }
  function pose(){
    const value=storageMode?Number(storageRange.value):Number(range.value),p=storageMode?1:Math.min(value,100)/100;
    modal?.querySelector('.m001-3d-controls')?.style.setProperty('--progress',`${storageMode?value/1.25:value}%`);
    const fill=modal?.querySelector('.assembly-fill');if(fill)fill.style.width=`${value}%`;
    model.visible=true;
    // Storage Flat remains on the verified complete-box endpoint until a true
    // stacked final hierarchy is built and approved from the physical sample.
    restoreBondHomes();applyHingePose(p);model.updateMatrixWorld(true);enforceBonds(p);
    if(storageMode)applyStorageStep2(value);
  }
  function bounds(){model.updateMatrixWorld(true);return new root.THREE.Box3().setFromObject(model);}
  function fit(){root.PacVu3DViewer.fitObject(model,camera,orbit,'iso');}
  function setView(v){root.PacVu3DViewer.fitObject(model,camera,orbit,v);}
  function resize(){if(!renderer||!stage)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function animate(){if(!modal.classList.contains('open'))return;orbit.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);}
  root.M003_3D_syncAvailability=sync;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})(typeof window!=='undefined'?window:globalThis);
