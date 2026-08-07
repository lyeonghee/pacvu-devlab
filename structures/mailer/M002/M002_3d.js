// M002 3D preview — phase 1: Final Layout flat geometry validation.
(function(root){
  'use strict';
  var BUILD_ID='20260730-hierarchy2';
  var SCRIPT_URL=document.currentScript&&document.currentScript.src||'';
  var modal,stage,range,renderer,scene,camera,controls,model,sheet,layout,raf=0,shadowOn=true;
  var panelMeshes=new Map(),hinges=[],insertions=[],relations=[];
  var PAPER_THICKNESS=.18,POCKET_OVERFOLD_DEGREES=3;
  var buildSerial=0,previousModelUuid=null;

  function el(tag,className,text){var node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}

  function pacvuBrand(panel){
    if(!panel)return null;
    var THREE=root.THREE,canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;
    var context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
    context.fillStyle='rgb(72,67,62)';context.textAlign='center';context.textBaseline='middle';
    context.font='700 260px Arial, sans-serif';context.fillText('PacVu',512,105);
    context.font='500 42px Arial, sans-serif';context.letterSpacing='2px';context.fillText('Packaging + View + Use',512,262);
    var texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
    panel.geometry.computeBoundingBox();var bounds=panel.geometry.boundingBox,size=new THREE.Vector3();bounds.getSize(size);
    var width=size.x*.44,height=width*(canvas.height/canvas.width),brand=new THREE.Mesh(
      new THREE.PlaneGeometry(width,height),
      root.PacVu3DViewer.createOverlayMaterial(THREE,{map:texture,transparent:true,opacity:.46,depthWrite:false,side:THREE.FrontSide,toneMapped:false})
    );
    brand.name='PacVu lid branding';brand.position.set((bounds.min.x+bounds.max.x)/2,(bounds.min.y+bounds.max.y)/2,-PAPER_THICKNESS/2-.012);
    brand.rotation.y=Math.PI;brand.rotation.z=Math.PI;brand.renderOrder=1000;
    brand.castShadow=false;brand.receiveShadow=false;brand.userData.pacvuBrand=true;panel.add(brand);return brand;
  }

  function install(){
    if(document.getElementById('m0023dBtn'))return;
    var toolbar=document.querySelector('.toolbar');if(!toolbar)return;
    var button=el('button','btn m001-3d-button','3D MOCKUP');button.id='m0023dBtn';toolbar.appendChild(button);
    var viewer=root.PacVu3DViewer.createModal({id:'m0023dModal',badge:'M002 · Mailer Box'});
    modal=viewer.modal;stage=viewer.stage;range=viewer.range;range.value='0';range.disabled=false;
    viewer.controls.querySelector('.assembly-title').textContent='Assembly Stage';
    button.addEventListener('click',open);
    modal.querySelector('[data-close]').addEventListener('click',close);
    modal.querySelector('[data-download]').addEventListener('click',download);
    modal.addEventListener('click',function(event){if(event.target===modal)close();});
    range.addEventListener('input',updatePose);
    modal.querySelector('.m001-3d-views').addEventListener('click',function(event){
      if(event.target.dataset.view)fit(event.target.dataset.view);
      if(event.target.dataset.action==='shadow'||event.target.hasAttribute('data-shadow'))toggleShadow(event.target);
    });
    ['baseW','baseD','panelH'].forEach(function(id){var input=document.getElementById(id);if(input)input.addEventListener('input',function(){if(modal.classList.contains('open'))build();});});
    sync();
  }

  function sync(){
    var button=document.getElementById('m0023dBtn');if(!button)return;
    var active=typeof selectedBoxMeta!=='undefined'&&selectedBoxMeta.engineKey==='gbox2';
    button.style.display=active?'inline-flex':'none';if(!active&&modal&&modal.classList.contains('open'))close();
  }

  function config(){return typeof getCfgM002==='function'?getCfgM002():{W:400,D:308,H:80};}
  function open(){modal.classList.add('open');if(!root.THREE){stage.textContent='Three.js is not available.';return;}ensureScene();build();resize();animate();}
  function close(){if(modal)modal.classList.remove('open');if(raf)cancelAnimationFrame(raf);raf=0;}

  function ensureScene(){
    if(renderer)return;var THREE=root.THREE;
    renderer=root.PacVu3DViewer.createRenderer(THREE);renderer.setClearColor(root.PacVu3DTheme.colors.background,1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.insertBefore(renderer.domElement,stage.firstChild);
    scene=new THREE.Scene();camera=root.PacVu3DViewer.createPerspectiveCamera(THREE,config());
    scene.add(new THREE.HemisphereLight(root.PacVu3DTheme.hemisphereLight.skyColor,root.PacVu3DTheme.hemisphereLight.groundColor,root.PacVu3DTheme.hemisphereLight.intensity));
    var key=new THREE.DirectionalLight(root.PacVu3DTheme.directionalLight.color,root.PacVu3DTheme.directionalLight.intensity);key.position.fromArray(root.PacVu3DTheme.directionalLight.position);key.castShadow=true;key.shadow.mapSize.set(root.PacVu3DTheme.directionalLight.shadowMapSize,root.PacVu3DTheme.directionalLight.shadowMapSize);key.shadow.camera.left=-root.PacVu3DTheme.directionalLight.shadowBounds;key.shadow.camera.right=root.PacVu3DTheme.directionalLight.shadowBounds;key.shadow.camera.top=root.PacVu3DTheme.directionalLight.shadowBounds;key.shadow.camera.bottom=-root.PacVu3DTheme.directionalLight.shadowBounds;key.shadow.camera.near=root.PacVu3DTheme.directionalLight.shadowNear;key.shadow.camera.far=root.PacVu3DTheme.directionalLight.shadowFar;key.shadow.bias=root.PacVu3DTheme.directionalLight.shadowBias;key.shadow.normalBias=root.PacVu3DTheme.directionalLight.shadowNormalBias;key.shadow.camera.updateProjectionMatrix();scene.add(key);
    var fillLight=new THREE.DirectionalLight(root.PacVu3DTheme.fillLight.color,root.PacVu3DTheme.fillLight.intensity);fillLight.position.fromArray(root.PacVu3DTheme.fillLight.position);scene.add(fillLight);
    var floor=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.ShadowMaterial({color:0x48433e,opacity:.11}));floor.position.z=-2;floor.receiveShadow=true;scene.add(floor);
    var grid=new THREE.GridHelper(root.PacVu3DTheme.grid.size,root.PacVu3DTheme.grid.divisions,root.PacVu3DTheme.grid.centerColor,root.PacVu3DTheme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=root.PacVu3DTheme.grid.z;scene.add(grid);
    controls=new root.PacVuOrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=true;controls.screenSpacePanning=true;
    root.PacVu3DViewer.standardizeEnvironment({renderer:renderer,scene:scene,controls:controls,floor:floor,grid:grid});
    root.addEventListener('resize',resize);
  }

  function roundedHole(hole){
    var THREE=root.THREE,path=new THREE.Path(),w=hole.width,h=hole.height;
    var sourceX=Number.isFinite(hole.x)?hole.x:hole.cx-w/2,sourceY=Number.isFinite(hole.y)?hole.y:hole.cy-h/2;
    var x=sourceX,y=-(sourceY+h),r=Math.min(hole.radius,w/2,h/2);
    path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);path.closePath();return path;
  }

  function geometry(panel,layout){
    var THREE=root.THREE,shape=new THREE.Shape();panel.polygon.forEach(function(point,index){if(index)shape.lineTo(point.x,-point.y);else shape.moveTo(point.x,-point.y);});shape.closePath();
    layout.holes.filter(function(hole){return hole.panelId===panel.id;}).forEach(function(hole){shape.holes.push(roundedHole(hole));});
    layout.slots.filter(function(slot){return slot.panelId===panel.id;}).forEach(function(slot){shape.holes.push(roundedHole(slot));});
    var result=new THREE.ExtrudeGeometry(shape,{depth:PAPER_THICKNESS,bevelEnabled:false,curveSegments:12});result.translate(0,0,-PAPER_THICKNESS/2);return root.PacVu3DViewer.assignBoardFaceMaterials(result,PAPER_THICKNESS,'interior');
  }

  function build(){
    var THREE=root.THREE,cfg=config();layout=root.M002_getLayout(cfg.W,cfg.D,cfg.H);
    validateInsertionRelations();
    if(model){previousModelUuid=model.uuid;scene.remove(model);model.traverse(function(object){if(object.geometry)object.geometry.dispose();});}
    model=new THREE.Group();model.name='M002 Model build '+(++buildSerial);sheet=new THREE.Group();sheet.name='M002 Base Root';model.add(sheet);panelMeshes=new Map();hinges=[];insertions=layout.insertionRelations.slice();
    var materials=root.PacVu3DViewer.createBoardMaterials(THREE);materials[2]=materials[2].clone();materials[2].color.copy(materials[0].color);
    layout.panels.forEach(function(panel){var mesh=new THREE.Mesh(geometry(panel,layout),materials);mesh.name=panel.id;mesh.castShadow=true;mesh.receiveShadow=false;panelMeshes.set(panel.id,mesh);});
    pacvuBrand(panelMeshes.get('lid'));
    relations=selectRelations(layout.foldRelations);
    buildHierarchy();
    var b=layout.dielineBounds;model.position.set(-(b.minX+b.maxX)/2,(b.minY+b.maxY)/2,0);scene.add(model);
    range.value='0';updatePose();fit('iso');
  }

  function validateInsertionRelations(){
    var panelIds=new Set(layout.panels.map(function(panel){return panel.id;}));
    var lockIds=new Set(layout.locks.map(function(lock){return lock.id;}));
    var slotIds=new Set(layout.slots.map(function(slot){return slot.id;}));
    layout.insertionRelations.forEach(function(relation){
      if(!panelIds.has(relation.movingPanelId)||!panelIds.has(relation.targetPanelId)||!lockIds.has(relation.lockId)||!slotIds.has(relation.slotId)){
        throw new Error('M002 insertion relation is not connected: '+relation.id);
      }
    });
  }

  function selectRelations(source){
    // M001 master: f-7*-1/2 are rebuilt as the continuous double-fold chain.
    return source.filter(function(relation){
      return !relation.foldIds.some(function(id){return /^f-7[LR]-[12]$/.test(id);});
    });
  }

  function buildHierarchy(){
    var THREE=root.THREE,adjacent=new Map(),frames=new Map();
    relations.forEach(function(relation){
      [relation.parentPanelId,relation.childPanelId].forEach(function(id){if(!adjacent.has(id))adjacent.set(id,[]);adjacent.get(id).push(relation);});
    });
    sheet.add(panelMeshes.get('base'));frames.set('base',sheet);
    var visited=new Set(['base']),queue=[{id:'base',frame:sheet}];
    while(queue.length){
      var current=queue.shift();
      (adjacent.get(current.id)||[]).forEach(function(relation){
        var child=relation.parentPanelId===current.id?relation.childPanelId:relation.parentPanelId;if(visited.has(child))return;
        var surfaceHinge=relation.foldIds.some(function(id){return /^f-[135][LR]$/.test(id);});
        var hingeZ=surfaceHinge?PAPER_THICKNESS/2:0;
        var a=new THREE.Vector3(relation.axis.a.x,-relation.axis.a.y,hingeZ),b=new THREE.Vector3(relation.axis.b.x,-relation.axis.b.y,hingeZ);
        var hinge=new THREE.Group();hinge.name=current.id+' -> '+child+' hinge';hinge.position.copy(a);current.frame.add(hinge);
        var frame=new THREE.Group();frame.name=child+' frame';frame.position.set(-a.x,-a.y,-a.z);hinge.add(frame);frame.add(panelMeshes.get(child));
        var axis=b.sub(a).normalize(),bounds=layout.panels.find(function(panel){return panel.id===child;}).bounds;
        var radial=new THREE.Vector3(bounds.x+bounds.width/2-a.x,-(bounds.y+bounds.height/2)-a.y,0);
        var inwardSign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;
        hinges.push({object:hinge,axis:axis,relation:relation,orientation:relation.parentPanelId===current.id?1:-1,inwardSign:inwardSign,panelId:child});
        visited.add(child);frames.set(child,frame);queue.push({id:child,frame:frame});
      });
    }
    buildSideLockChain('L',frames,visited);
    buildSideLockChain('R',frames,visited);
    layout.panels.forEach(function(panel){if(!visited.has(panel.id))sheet.add(panelMeshes.get(panel.id));});
  }

  function buildSideLockChain(side,frames,visited){
    var THREE=root.THREE,left=side==='L';
    var sideId=left?'sidePanelLeft':'sidePanelRight',lockId=left?'bottomLockFlapLeft':'bottomLockFlapRight';
    var outer=layout.foldRelations.find(function(item){return item.foldIds.indexOf('f-7'+side+'-2')>=0;});
    var inner=layout.foldRelations.find(function(item){return item.foldIds.indexOf('f-7'+side+'-1')>=0;});
    var parent=frames.get(sideId);if(!outer||!inner||!parent)return;
    var a1=new THREE.Vector3(outer.axis.a.x,-outer.axis.a.y,0),b1=new THREE.Vector3(outer.axis.b.x,-outer.axis.b.y,0);
    var a2=new THREE.Vector3(inner.axis.a.x,-inner.axis.a.y,0),b2=new THREE.Vector3(inner.axis.b.x,-inner.axis.b.y,0);
    var hinge1=new THREE.Group();hinge1.name=sideId+' -> lock spine hinge';hinge1.position.copy(a1);parent.add(hinge1);
    var spineFrame=new THREE.Group();spineFrame.name='lockSpine'+side+' frame';spineFrame.position.copy(a1).multiplyScalar(-1);hinge1.add(spineFrame);
    var y1=Math.max(outer.axis.a.y,inner.axis.a.y),y2=Math.min(outer.axis.b.y,inner.axis.b.y);
    var spinePanel={id:'lockSpine'+side,polygon:[{x:outer.axis.a.x,y:y1},{x:inner.axis.a.x,y:y1},{x:inner.axis.a.x,y:y2},{x:outer.axis.a.x,y:y2}]};
    var spine=new THREE.Mesh(geometry(spinePanel,{holes:[],slots:[]}),panelMeshes.get(sideId).material);spine.name='lockSpine'+side;spine.castShadow=false;spine.receiveShadow=false;spineFrame.add(spine);
    var axis1=b1.sub(a1).normalize(),radial1=new THREE.Vector3((a2.x-a1.x)/2,0,0);
    var sign1=new THREE.Vector3().crossVectors(axis1,radial1).z>=0?1:-1;
    hinges.push({object:hinge1,axis:axis1,relation:{foldIds:['f-7'+side+'-2'],angle:90},inwardSign:sign1,panelId:'lockSpine'+side});
    var hinge2=new THREE.Group();hinge2.name='lockSpine'+side+' -> '+lockId+' hinge';hinge2.position.copy(a2);spineFrame.add(hinge2);
    var lockFrame=new THREE.Group();lockFrame.name=lockId+' frame';lockFrame.position.copy(a2).multiplyScalar(-1);hinge2.add(lockFrame);lockFrame.add(panelMeshes.get(lockId));
    var lockBounds=layout.panels.find(function(panel){return panel.id===lockId;}).bounds;
    var axis2=b2.sub(a2).normalize(),radial2=new THREE.Vector3(lockBounds.x+lockBounds.width/2-a2.x,-(lockBounds.y+lockBounds.height/2)-a2.y,0);
    var sign2=new THREE.Vector3().crossVectors(axis2,radial2).z>=0?1:-1;
    hinges.push({object:hinge2,axis:axis2,relation:{foldIds:['f-7'+side+'-1'],angle:90},inwardSign:sign2,panelId:lockId});
    visited.add(lockId);frames.set(lockId,lockFrame);
  }

  function smooth(value){value=Math.max(0,Math.min(1,value));return value*value*(3-2*value);}
  function foldProgress(ids,progress){
    var start=.18,end=.38;
    if(ids.indexOf('f-6')>=0){start=0;end=.24;}
    else if(ids.indexOf('f-8')>=0){start=.10;end=.34;}
    else if(ids.some(function(id){return /^f-[59][LR]$/.test(id);})){start=.18;end=.38;}
    else if(ids.some(function(id){return /^f-7[LR]-[3-5]$/.test(id);})){start=.28;end=.50;}
    else if(ids.some(function(id){return /^f-7[LR]-[12]$/.test(id);})){start=.42;end=.56;}
    else if(ids.some(function(id){return /^f-3[LR]$/.test(id);})){start=.58;end=.70;}
    else if(ids.some(function(id){return /^f-1[LR]$/.test(id);})){start=.62;end=.76;}
    else if(ids.indexOf('f-4')>=0){start=.70;end=.90;}
    else if(ids.indexOf('f-2')>=0){start=.86;end=1;}
    return smooth((progress-start)/(end-start));
  }

  function pocketOverfoldProgress(ids,progress){
    var riseStart,riseEnd,fallStart,fallEnd;
    if(ids.some(function(id){return /^f-3[LR]$/.test(id);})){
      riseStart=.66;riseEnd=.74;fallStart=.90;fallEnd=1;
    }else if(ids.some(function(id){return /^f-1[LR]$/.test(id);})){
      riseStart=.76;riseEnd=.86;fallStart=.94;fallEnd=1;
    }else return 0;
    if(progress<=riseStart||progress>=fallEnd)return 0;
    if(progress<riseEnd)return smooth((progress-riseStart)/(riseEnd-riseStart));
    if(progress<=fallStart)return 1;
    return 1-smooth((progress-fallStart)/(fallEnd-fallStart));
  }

  function updatePose(){
    if(!layout)return;var THREE=root.THREE,progress=Number(range.value)/100;
    hinges.forEach(function(item){
      var amount=foldProgress(item.relation.foldIds,progress),overfold=pocketOverfoldProgress(item.relation.foldIds,progress);
      var degrees=item.relation.angle*amount+POCKET_OVERFOLD_DEGREES*overfold;
      item.object.quaternion.setFromAxisAngle(item.axis,THREE.MathUtils.degToRad(item.inwardSign*degrees));
    });
    root.PacVu3DViewer.syncProgress({controls:modal.querySelector('.m001-3d-controls')},Number(range.value),'Assembly Stage');
  }

  function objectPath(object){
    var path=[];while(object){path.unshift(object.name||object.type);object=object.parent;}return path;
  }

  function runtimeSnapshot(){
    var resources=performance.getEntriesByType('resource').filter(function(entry){return entry.name.indexOf('/M002_3d.js')>=0;}).map(function(entry){return {name:entry.name,startTime:entry.startTime,duration:entry.duration,transferSize:entry.transferSize};});
    return {
      buildId:BUILD_ID,scriptUrl:SCRIPT_URL,resources:resources,buildSerial:buildSerial,
      modelUuid:model&&model.uuid,previousModelUuid:previousModelUuid,slider:range&&range.value,
      relationCount:relations.length,hingeCount:hinges.length,
      hierarchy:{
        base:objectPath(panelMeshes.get('base')),
        sidePanelLeft:objectPath(panelMeshes.get('sidePanelLeft')),
        bottomLockFlapLeft:objectPath(panelMeshes.get('bottomLockFlapLeft')),
        sidePanelRight:objectPath(panelMeshes.get('sidePanelRight')),
        bottomLockFlapRight:objectPath(panelMeshes.get('bottomLockFlapRight'))
      },
      lockHinges:hinges.filter(function(item){return /^bottomLockFlap/.test(item.panelId||'');}).map(function(item){return {panelId:item.panelId,group:item.object.name,parent:item.object.parent&&item.object.parent.name,foldIds:item.relation.foldIds.slice(),inwardSign:item.inwardSign,quaternion:item.object.quaternion.toArray()};})
    };
  }

  function fit(view){if(model&&controls)root.PacVu3DViewer.fitObject(model,camera,controls,view||'iso');}
  function toggleShadow(button){shadowOn=!shadowOn;renderer.shadowMap.enabled=shadowOn;renderer.shadowMap.needsUpdate=true;scene.traverse(function(object){if(object.isDirectionalLight)object.castShadow=shadowOn;});button.textContent=shadowOn?'Shadows On':'Shadows Off';}
  function resize(){if(!renderer||!stage)return;var w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function animate(){if(!modal.classList.contains('open'))return;controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);}
  function download(){if(!renderer)return;renderer.domElement.toBlob(function(blob){if(!blob)return;var link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='M002_3D_Flat.png';link.click();setTimeout(function(){URL.revokeObjectURL(link.href);},1000);},'image/png');}

  root.M002_3D_syncAvailability=sync;
  root.M002_3D_runtimeSnapshot=runtimeSnapshot;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  document.addEventListener('change',function(event){if(event.target&&event.target.id==='boxType')setTimeout(sync,0);});
})(typeof window!=='undefined'?window:globalThis);
