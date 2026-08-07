// M001 3D fold preview.
// Reads M001_getLayout() only; the approved 2D geometry/export path is untouched.
(function (root) {
  'use strict';

  let modal, stage, range, status, renderer, scene, camera, model, sheet, raf=0,playTimer=0,playButton,shadowOn=true;
  let layout=null, relations=[], hinges=[], panelMeshes=new Map(), orbit=null,paperMaterial=null,boardMaterials=null;
  const PAPER_THICKNESS=.18;
  const POCKET_OVERFOLD_DEGREES=3;
  let boxCenter=null,boxRadius=1;

  function pacvuBrand(panel){
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
    brand.name='PacVu lid branding';brand.position.set((bounds.min.x+bounds.max.x)/2,(bounds.min.y+bounds.max.y)/2,-PAPER_THICKNESS/2-.012);
    brand.rotation.y=Math.PI;
    brand.rotation.z=Math.PI;
    brand.renderOrder=1000;brand.castShadow=false;brand.receiveShadow=false;brand.userData.pacvuBrand=true;
    panel.add(brand);return brand;
  }

  const STAGES=['전개도','안쪽 날개 준비','앞·뒤 벽 세우기','좌·우 측벽 세우기','측면 잠금 결합','뚜껑 날개 접기','뚜껑 닫기','앞날개 잠금'];
  const MAX_STAGE=STAGES.length-1;

  function element(tag,className,text){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }

  function installUI(){
    if(document.getElementById('m0013dBtn'))return;
    const toolbar=document.querySelector('.toolbar');
    if(!toolbar)return;
    const button=element('button','btn m001-3d-button','3D MOCKUP');
    button.id='m0013dBtn';toolbar.appendChild(button);

    const viewer=root.PacVu3DViewer.createModal({id:'m0013dModal',badge:'M001 · Mailer Box'});
    modal=viewer.modal;stage=viewer.stage;range=viewer.range;
    /*
    const shell=element('div','m001-3d-shell');
    const head=element('div','m001-3d-head');
    const title=element('div','m001-3d-title');
    title.append(element('strong','', '3D Preview'));
    const views=element('div','m001-3d-views');
    [['Isometric','iso'],['Front','front'],['Back','back'],['Left','left'],['Right','right'],['Top','top'],['Bottom','bottom']].forEach(([label,name])=>{
      const control=element('button','btn light',label);control.dataset.view=name;views.append(control);
    });
    [...views.querySelectorAll('button')].forEach(control=>{if(!['iso','front','top'].includes(control.dataset.view))control.remove();});
    views.querySelector('[data-view="front"]').textContent='Front';
    views.querySelector('[data-view="top"]').textContent='Top';
    const shadow=element('button','btn light','Shadows On');shadow.dataset.action='shadow';views.append(shadow);
    const download=element('button','btn light','PNG Download');
    const close=element('button','btn light','Close');
    head.append(title,views,download,close);
    stage=element('div','m001-3d-stage');
    const badge=element('div','m001-3d-badge','M001 · 한 장 전개도');stage.append(badge);
    const controls=element('div','m001-3d-controls');
    controls.insertAdjacentHTML('beforeend','<div class="assembly-title">Assembly Stage</div><div class="assembly-track"><div class="assembly-fill"></div></div>');
    controls.append(element('label','', 'Open'));
    const transport=element('div','m001-3d-transport');
    const previous=element('button','btn light','이전');
    playButton=element('button','btn light','재생');
    const next=element('button','btn light','다음');
    transport.append(previous,playButton,next);controls.append(transport);
    range=document.createElement('input');range.type='range';range.min='0';range.max='100';range.step='1';range.value='0';controls.append(range);
    controls.insertAdjacentHTML('beforeend','<div class="assembly-labels"><span class="active">Flat</span><span>Fold</span><span>3D Mockup</span></div>');
    status=element('output','m001-3d-status','0% · 전개도');controls.append(status);
    const steps=element('div','m001-3d-steps');
    STAGES.forEach((label,index)=>{const step=element('button','',String(index));step.title=label;step.dataset.step=index;steps.append(step);});
    controls.append(steps);
    const zoomOut=element('button','btn light','−');zoomOut.title='축소';
    const zoomIn=element('button','btn light','+');zoomIn.title='확대';
    const fit=element('button','btn light','전체 보기');controls.append(zoomOut,zoomIn,fit);
    transport.style.display='none';status.textContent='Close';status.className='m001-3d-close-label';
    steps.style.display='none';zoomOut.style.display='none';zoomIn.style.display='none';fit.style.display='none';
    shell.append(head,stage,controls);modal.append(shell);document.body.append(modal);
    root.PacVu3DViewer.standardizeLegacy(modal,{badge:'M001 · Mailer Box'});
    */
    const views=modal.querySelector('.m001-3d-views');
    const download=modal.querySelector('[data-download]');
    const close=modal.querySelector('[data-close]');
    const controls=viewer.controls;
    const transport=element('div','m001-3d-transport');
    const previous=element('button','btn light','Previous');
    playButton=element('button','btn light','Play');
    const next=element('button','btn light','Next');
    status=element('output','m001-3d-status','0% · Flat');
    const steps=element('div','m001-3d-steps');
    const zoomOut=element('button','btn light','−');
    const zoomIn=element('button','btn light','+');
    const fit=element('button','btn light','Fit');

    button.addEventListener('click',open);
    close.addEventListener('click',closeView);
    download.addEventListener('click',()=>downloadTransparentPng('M001'));
    modal.addEventListener('click',event=>{if(event.target===modal)closeView();});
    range.addEventListener('input',()=>{stopPlayback();updatePose();});
    range.addEventListener('change',fitCamera);
    previous.addEventListener('click',()=>jumpStage(-1));
    next.addEventListener('click',()=>jumpStage(1));
    playButton.addEventListener('click',togglePlayback);
    fit.addEventListener('click',fitCamera);
    zoomOut.addEventListener('click',()=>zoomBy(1.18));
    zoomIn.addEventListener('click',()=>zoomBy(.84));
    views.addEventListener('click',event=>{if(event.target.dataset.view)setCameraView(event.target.dataset.view);if(event.target.dataset.action==='shadow')toggleShadow(event.target);});
    steps.addEventListener('click',event=>{if(event.target.dataset.step!==undefined){stopPlayback();range.value=String(Number(event.target.dataset.step)*100/MAX_STAGE);updatePose();}});
    ['baseW','baseD','panelH'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{if(modal.classList.contains('open'))buildModel();}));
    syncAvailability();
  }

  function syncAvailability(){
    const button=document.getElementById('m0013dBtn');if(!button)return;
    const active=typeof selectedBoxMeta!=='undefined'&&selectedBoxMeta.engineKey==='gbox';
    button.style.display=active?'inline-flex':'none';
    if(!active&&modal?.classList.contains('open'))closeView();
  }

  function open(){
    modal.classList.add('open');
    if(!root.THREE){stage.textContent='Three.js를 불러오지 못했어.';return;}
    ensureScene();buildModel();resize();animate();
  }

  function closeView(){modal?.classList.remove('open');stopPlayback();if(raf)cancelAnimationFrame(raf);raf=0;}

  function currentStage(){return Math.min(MAX_STAGE,Math.max(0,Math.round(Number(range.value)/100*MAX_STAGE)));}
  function jumpStage(direction){stopPlayback();const next=Math.max(0,Math.min(MAX_STAGE,currentStage()+direction));range.value=String(next*100/MAX_STAGE);updatePose();}
  function stopPlayback(){if(playTimer)clearInterval(playTimer);playTimer=0;if(playButton)playButton.textContent='재생';}
  function togglePlayback(){
    if(playTimer){stopPlayback();return;}
    if(Number(range.value)>=100)range.value='0';
    playButton.textContent='일시정지';
    playTimer=setInterval(()=>{const next=Math.min(100,Number(range.value)+1);range.value=String(next);updatePose();if(next>=100)stopPlayback();},35);
  }
  function distanceLimits(){return {min:Math.max(40,boxRadius*1.35),max:Math.max(1200,boxRadius*8)};}
  function clampOrbitDistance(value){const limits=distanceLimits();return Math.max(limits.min,Math.min(limits.max,value));}
  function zoomBy(factor){
    if(!orbit)return;
    const offset=camera.position.clone().sub(orbit.target).multiplyScalar(factor);
    camera.position.copy(orbit.target).add(offset);orbit.update();
  }

  function ensureScene(){
    if(renderer)return;
    const THREE=root.THREE;
    renderer=root.PacVu3DViewer.createRenderer(THREE);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(root.PacVu3DTheme.colors.background,1);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE[root.PacVu3DTheme.renderer.toneMapping];renderer.toneMappingExposure=root.PacVu3DTheme.renderer.exposure;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    stage.insertBefore(renderer.domElement,stage.firstChild);
    scene=new THREE.Scene();camera=root.PacVu3DViewer.createPerspectiveCamera(THREE,typeof getCfg==='function'?getCfg():null);
    scene.add(new THREE.HemisphereLight(root.PacVu3DTheme.hemisphereLight.skyColor,root.PacVu3DTheme.hemisphereLight.groundColor,root.PacVu3DTheme.hemisphereLight.intensity));
    const light=new THREE.DirectionalLight(root.PacVu3DTheme.directionalLight.color,root.PacVu3DTheme.directionalLight.intensity);light.position.fromArray(root.PacVu3DTheme.directionalLight.position);light.castShadow=true;light.shadow.mapSize.set(root.PacVu3DTheme.directionalLight.shadowMapSize,root.PacVu3DTheme.directionalLight.shadowMapSize);light.shadow.camera.left=-root.PacVu3DTheme.directionalLight.shadowBounds;light.shadow.camera.right=root.PacVu3DTheme.directionalLight.shadowBounds;light.shadow.camera.top=root.PacVu3DTheme.directionalLight.shadowBounds;light.shadow.camera.bottom=-root.PacVu3DTheme.directionalLight.shadowBounds;light.shadow.camera.near=root.PacVu3DTheme.directionalLight.shadowNear;light.shadow.camera.far=root.PacVu3DTheme.directionalLight.shadowFar;light.shadow.bias=root.PacVu3DTheme.directionalLight.shadowBias;light.shadow.normalBias=root.PacVu3DTheme.directionalLight.shadowNormalBias;scene.add(light);
    const fill=new THREE.DirectionalLight(root.PacVu3DTheme.fillLight.color,root.PacVu3DTheme.fillLight.intensity);fill.position.fromArray(root.PacVu3DTheme.fillLight.position);scene.add(fill);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(2500,2500),new THREE.ShadowMaterial({color:0x48433e,opacity:.11}));
    floor.position.z=-2;floor.receiveShadow=true;scene.add(floor);
    const grid=new THREE.GridHelper(root.PacVu3DTheme.grid.size,root.PacVu3DTheme.grid.divisions,root.PacVu3DTheme.grid.centerColor,root.PacVu3DTheme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=root.PacVu3DTheme.grid.z;grid.material.transparent=true;grid.material.opacity=root.PacVu3DTheme.grid.opacity;scene.add(grid);
    orbit=createOrbit(renderer.domElement);
    root.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls:orbit,floor,grid});
    window.addEventListener('resize',resize);
  }

  function toggleShadow(button){
    shadowOn=!shadowOn;button.textContent=shadowOn?'Shadows On':'Shadows Off';
    if(renderer){renderer.shadowMap.enabled=shadowOn;renderer.shadowMap.needsUpdate=true;}
    scene?.traverse(object=>{if(object.isDirectionalLight)object.castShadow=shadowOn;});
  }

  function downloadTransparentPng(code){
    if(!renderer||!scene||!camera)return;
    const hidden=[],brands=[];
    scene.traverse(object=>{if(object.userData?.pacvuBrand){brands.push([object.material,object.material.opacity]);object.material.opacity=.78;}if(object.isGridHelper||object.type==='GridHelper'||object.material?.isShadowMaterial){hidden.push([object,object.visible]);object.visible=false;}});
    const background=scene.background,clearColor=renderer.getClearColor(new root.THREE.Color()).clone(),clearAlpha=renderer.getClearAlpha();
    scene.background=null;renderer.setClearColor(0x000000,0);renderer.render(scene,camera);
    renderer.domElement.toBlob(blob=>{
      hidden.forEach(([object,visible])=>{object.visible=visible;});brands.forEach(([material,opacity])=>{material.opacity=opacity;});scene.background=background;renderer.setClearColor(clearColor,clearAlpha);renderer.render(scene,camera);
      if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${code}_3D_${Math.round(Number(range.value))}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    },'image/png');
  }

  function createOrbit(canvas){
    if(!root.PacVuOrbitControls)throw new Error('OrbitControls module is not ready.');
    camera.up.set(0,0,1);
    const controls=new root.PacVuOrbitControls(camera,canvas);
    controls.enableDamping=true;controls.dampingFactor=.08;
    controls.rotateSpeed=.45;controls.zoomSpeed=.8;
    controls.minDistance=.2;controls.maxDistance=30;
    controls.minPolarAngle=Math.PI/18;controls.maxPolarAngle=Math.PI*.65;
    controls.enablePan=false;controls.screenSpacePanning=false;
    controls.mouseButtons.LEFT=root.THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE=root.THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT=root.THREE.MOUSE.PAN;
    canvas.addEventListener('dblclick',fitCamera);
    controls.update();return controls;
  }

  function shapeGeometry(panel){
    const THREE=root.THREE,shape=new THREE.Shape();
    const exactFlatPolygon=buildExactFlatPanelPolygon(panel.id);
    let polygon=exactFlatPolygon||panel.polygon;
    // The user-UI rig gives the lid core and its hinged children exclusive
    // geometry on either side of each fold axis.  The layout polygons retain
    // cut-path turnaround points which are useful for 2D, but those points
    // produce overlapping/self-crossing caps when each 3D panel is extruded
    // independently.  Clean only this 3D lid assembly; the source layout and
    // approved 2D outline remain untouched.
    if(!exactFlatPolygon&&panel.id==='lid'){
      const left=layout.foldRelations.find(item=>item.foldIds.includes('f-3L')).axis.a.x;
      const right=layout.foldRelations.find(item=>item.foldIds.includes('f-3R')).axis.a.x;
      polygon=clipPolygonAtX(clipPolygonAtX(polygon,left,false),right,true);
    }else if(!exactFlatPolygon&&panel.id==='back'){
      const left=layout.foldRelations.find(item=>item.foldIds.includes('f-5L')).axis.a.x;
      const right=layout.foldRelations.find(item=>item.foldIds.includes('f-5R')).axis.a.x;
      polygon=clipPolygonAtX(clipPolygonAtX(polygon,left,false),right,true);
    }else if(!exactFlatPolygon&&(panel.id==='lidDustFlapLeft'||panel.id==='lidDustFlapRight')){
      polygon=cleanDustFlapPolygon(panel.id,polygon);
    }else if(!exactFlatPolygon&&(panel.id==='backInsertFlapLeft'||panel.id==='backInsertFlapRight')){
      polygon=cleanBackInsertPolygon(panel.id,polygon);
    }
    const foldAlignment={
      lidSideFlapLeft:['f-3L','max'],lidSideFlapRight:['f-3R','min'],
      frontInsertFlapLeft:['f-9L','max'],frontInsertFlapRight:['f-9R','min']
    }[panel.id];
    if(!exactFlatPolygon&&foldAlignment){
      const [foldId,edge]=foldAlignment;
      const foldX=layout.foldRelations.find(item=>item.foldIds.includes(foldId)).axis.a.x;
      const panelEdge=(edge==='max'?Math.max:Math.min)(...polygon.map(point=>point.x));
      const offsetX=foldX-panelEdge;
      polygon=polygon.map(point=>({x:point.x+offsetX,y:point.y}));
    }
    if(panel.id==='bottomLockFlapLeft'){
      const foldX=layout.foldRelations.find(item=>item.foldIds.includes('f-7L-1')).axis.a.x;
      const panelEdge=Math.max(...polygon.map(point=>point.x));
      polygon=polygon.map(point=>({x:Math.abs(point.x-panelEdge)<.0001?foldX:point.x,y:point.y}));
    }
    if(panel.id==='bottomLockFlapRight'){
      const foldX=layout.foldRelations.find(item=>item.foldIds.includes('f-7R-1')).axis.a.x;
      polygon=clipPolygonAtX(polygon,foldX,false);
    }
    // Rectangular panel clipping can leave the sampled M001 cut path in a
    // crossed traversal order. ExtrudeGeometry then triangulates overlapping
    // caps, which produces the moving diagonal "comb" (z-fighting). Untangle
    // only the temporary 3D polygon; the approved 2D cut path is unchanged.
    if(!exactFlatPolygon)polygon=untanglePolygon(polygon);
    polygon.forEach((p,index)=>index?shape.lineTo(p.x,-p.y):shape.moveTo(p.x,-p.y));shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:PAPER_THICKNESS,bevelEnabled:false,curveSegments:1});geometry.translate(0,0,-PAPER_THICKNESS/2);return assignFaceMaterials(geometry);
  }

  function buildExactFlatPanelPolygon(panelId){
    const fold=id=>layout.fold.find(item=>item.id===id);
    const x=id=>fold(id).a.x;
    const y=id=>fold(id).a.y;
    const regions={
      lidFront:{minX:x('f-1L'),maxX:x('f-1R'),maxY:y('f-2')},
      lidDustFlapLeft:{maxX:x('f-1L'),maxY:y('f-2')},
      lidDustFlapRight:{minX:x('f-1R'),maxY:y('f-2')},
      lid:{minX:x('f-3L'),maxX:x('f-3R'),minY:y('f-2'),maxY:y('f-4')},
      lidSideFlapLeft:{maxX:x('f-3L'),minY:y('f-2'),maxY:y('f-4')},
      lidSideFlapRight:{minX:x('f-3R'),minY:y('f-2'),maxY:y('f-4')},
      back:{minX:x('f-5L'),maxX:x('f-5R'),minY:y('f-4'),maxY:y('f-6')},
      backInsertFlapLeft:{maxX:x('f-5L'),minY:y('f-4'),maxY:y('f-6')},
      backInsertFlapRight:{minX:x('f-5R'),minY:y('f-4'),maxY:y('f-6')},
      base:{minX:x('f-7L-3'),maxX:x('f-7R-3'),minY:y('f-6'),maxY:y('f-8')},
      sidePanelLeft:{minX:x('f-7L-2'),maxX:x('f-7L-3'),minY:y('f-6'),maxY:y('f-8')},
      sidePanelRight:{minX:x('f-7R-3'),maxX:x('f-7R-2'),minY:y('f-6'),maxY:y('f-8')},
      front:{minX:x('f-9L'),maxX:x('f-9R'),minY:y('f-8')},
      frontInsertFlapLeft:{maxX:x('f-9L'),minY:y('f-8')},
      frontInsertFlapRight:{minX:x('f-9R'),minY:y('f-8')}
    };
    const region=regions[panelId];
    if(!region)return null;
    let polygon=finalCutPolygon();
    if(Number.isFinite(region.minX))polygon=clipFlatPolygon(polygon,'x',region.minX,true);
    if(Number.isFinite(region.maxX))polygon=clipFlatPolygon(polygon,'x',region.maxX,false);
    if(Number.isFinite(region.minY))polygon=clipFlatPolygon(polygon,'y',region.minY,true);
    if(Number.isFinite(region.maxY))polygon=clipFlatPolygon(polygon,'y',region.maxY,false);
    return removeDuplicateFlatPoints(polygon);
  }

  function finalCutPolygon(){
    const points=[];
    layout.cut.forEach(segment=>{
      (segment.points||[]).forEach(point=>{
        const previous=points[points.length-1];
        if(!previous||Math.abs(previous.x-point.x)>.0001||Math.abs(previous.y-point.y)>.0001){
          points.push({x:point.x,y:point.y});
        }
      });
    });
    const first=points[0],last=points[points.length-1];
    if(first&&last&&Math.abs(first.x-last.x)<.0001&&Math.abs(first.y-last.y)<.0001)points.pop();
    return points;
  }

  function clipFlatPolygon(source,coordinate,value,keepGreater){
    const output=[],epsilon=.0001;
    const inside=point=>keepGreater?point[coordinate]>=value-epsilon:point[coordinate]<=value+epsilon;
    for(let index=0;index<source.length;index+=1){
      const current=source[index],previous=source[(index+source.length-1)%source.length];
      const currentInside=inside(current),previousInside=inside(previous);
      if(currentInside!==previousInside){
        const delta=current[coordinate]-previous[coordinate];
        const amount=Math.abs(delta)<epsilon?0:(value-previous[coordinate])/delta;
        output.push({
          x:coordinate==='x'?value:previous.x+(current.x-previous.x)*amount,
          y:coordinate==='y'?value:previous.y+(current.y-previous.y)*amount
        });
      }
      if(currentInside)output.push({x:current.x,y:current.y});
    }
    return output;
  }

  function removeDuplicateFlatPoints(source){
    const epsilon=.0001;
    const points=source.filter((point,index,array)=>{
      if(!index)return true;
      const previous=array[index-1];
      return Math.abs(point.x-previous.x)>epsilon||Math.abs(point.y-previous.y)>epsilon;
    });
    if(points.length>1){
      const first=points[0],last=points[points.length-1];
      if(Math.abs(first.x-last.x)<epsilon&&Math.abs(first.y-last.y)<epsilon)points.pop();
    }
    return points;
  }

  function materials(){
    if(boardMaterials)return boardMaterials;
    boardMaterials=root.PacVu3DViewer.createBoardMaterials(root.THREE);
    // M001 is a continuous folded sheet.  A dark cut-edge material on every
    // separately animated panel reads as a false brown cut line at folds.
    // Keep the shared renderer untouched and make only this G-line model's
    // thin paper edge match the exterior stock colour.
    boardMaterials[2]=boardMaterials[2].clone();
    boardMaterials[2].color.copy(boardMaterials[0].color);
    boardMaterials[2].name='M001 continuous paper edge';
    return boardMaterials;
  }

  function assignFaceMaterials(geometry){
    return root.PacVu3DViewer.assignBoardFaceMaterials(geometry,PAPER_THICKNESS,'interior');
  }

  function reportMaterialBinding(mesh){
    const bound=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    console.table(bound.map((material,index)=>({
      materialIndex:index,
      name:material.name,
      color:`#${material.color.getHexString()}`,
      type:material.type,
      clonedLayer:material.userData.m001Layer===true
    })));
    console.info('[M001 geometry groups]',mesh.geometry.groups.map(group=>({
      start:group.start,
      count:group.count,
      materialIndex:group.materialIndex
    })));
  }

  function clipPolygonAtX(polygon,foldX,keepLeft){
    const output=[];
    for(let index=0;index<polygon.length;index+=1){
      const current=polygon[index],previous=polygon[(index+polygon.length-1)%polygon.length];
      const currentInside=keepLeft?current.x<=foldX+.0001:current.x>=foldX-.0001;
      const previousInside=keepLeft?previous.x<=foldX+.0001:previous.x>=foldX-.0001;
      if(currentInside!==previousInside){
        const amount=(foldX-previous.x)/(current.x-previous.x);
        output.push({x:foldX,y:previous.y+(current.y-previous.y)*amount});
      }
      if(currentInside)output.push({x:current.x,y:current.y});
    }
    return output;
  }

  function untanglePolygon(source){
    const epsilon=.0001;
    const points=source.filter((point,index,array)=>{
      const previous=array[(index+array.length-1)%array.length];
      return Math.abs(point.x-previous.x)>epsilon||Math.abs(point.y-previous.y)>epsilon;
    }).map(point=>({x:point.x,y:point.y}));
    const orientation=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    const crosses=(a,b,c,d)=>{
      const abC=orientation(a,b,c),abD=orientation(a,b,d);
      const cdA=orientation(c,d,a),cdB=orientation(c,d,b);
      return abC*abD<-epsilon&&cdA*cdB<-epsilon;
    };
    const limit=points.length*points.length;
    for(let pass=0;pass<limit;pass+=1){
      let repaired=false;
      for(let i=0;i<points.length&&!repaired;i+=1){
        const iNext=(i+1)%points.length;
        for(let j=i+2;j<points.length;j+=1){
          const jNext=(j+1)%points.length;
          if(i===0&&jNext===0)continue;
          if(!crosses(points[i],points[iNext],points[j],points[jNext]))continue;
          const reversed=points.slice(iNext,j+1).reverse();
          points.splice(iNext,reversed.length,...reversed);repaired=true;break;
        }
      }
      if(!repaired)break;
    }
    return points;
  }

  function cleanDustFlapPolygon(panelId,polygon){
    const left=panelId==='lidDustFlapLeft';
    const relation=layout.foldRelations.find(item=>item.foldIds.includes(left?'f-1L':'f-1R'));
    const foldX=relation.axis.a.x;
    const outer=polygon.filter(point=>left?point.x<foldX-.0001:point.x>foldX+.0001);
    // The left cut path is stored in the opposite traversal direction. Match
    // the user-UI ShapeGeometry winding before closing it on the hinge edge.
    if(left)outer.reverse();
    const topY=Math.min(...outer.map(point=>point.y),0);
    const neckY=Math.max(relation.axis.a.y,relation.axis.b.y);
    const lidJointY=layout.foldRelations.find(item=>item.foldIds.includes('f-2')).axis.a.y;
    return [
      {x:foldX,y:topY},
      ...outer,
      {x:foldX,y:neckY},
      {x:foldX,y:lidJointY}
    ];
  }

  function cleanBackInsertPolygon(panelId,polygon){
    const left=panelId==='backInsertFlapLeft';
    const relation=layout.foldRelations.find(item=>item.foldIds.includes(left?'f-5L':'f-5R'));
    const foldX=relation.axis.a.x;
    const seamX=left?Math.max(...polygon.map(point=>point.x)):Math.min(...polygon.map(point=>point.x));
    const shiftX=foldX-seamX;
    const topY=Math.min(relation.axis.a.y,relation.axis.b.y);
    const bottomY=Math.max(relation.axis.a.y,relation.axis.b.y);
    // The 2D panel polygon also contains the cut-path turnaround strip below
    // the insert. It is correct for the dieline, but closing that strip as an
    // independent 3D cap creates a self-crossing triangle at the back joint.
    // Keep only the true insert outline between the two ends of f-5.
    let outer=polygon.filter(point=>{
      const outside=left?point.x<seamX-.0001:point.x>seamX+.0001;
      return outside&&point.y>=topY-.0001&&point.y<=bottomY+.0001;
    });
    if(left)outer=outer.reverse();
    outer=outer.map(point=>({x:point.x+shiftX,y:point.y}));
    return [
      {x:foldX,y:topY},
      ...outer,
      {x:foldX,y:bottomY}
    ];
  }

  function buildModel(){
    const THREE=root.THREE;
    if(model){scene.remove(model);model.traverse(object=>{
      object.geometry?.dispose();
      const meshMaterials=Array.isArray(object.material)?object.material:[object.material];
      meshMaterials.forEach(item=>{
        if(object.userData?.pacvuBrand){item?.map?.dispose();item?.dispose();}
        else if(item?.userData?.m001Layer)item.dispose();
      });
    });}
    layout=root.M001_getLayout(typeof getCfg==='function'?getCfg():{});
    model=new THREE.Group();scene.add(model);panelMeshes=new Map();hinges=[];
    sheet=new THREE.Group();model.add(sheet);
    const material=materials();paperMaterial=material;
    const shadowCasters=new Set(['base','front','back','lid','lidFront','sidePanelLeft','sidePanelRight']);
    layout.panels.forEach((panel,index)=>{
      const mesh=new THREE.Mesh(shapeGeometry(panel),material);mesh.name=panel.id;mesh.renderOrder=index;
      // M001 has several thin locking flaps that travel almost coplanar to
      // neighbouring panels during assembly. Letting those flaps enter the
      // shadow map creates animated comb-like moire bands. The structural
      // outer panels still cast the complete floor silhouette.
      mesh.castShadow=shadowCasters.has(panel.id);mesh.receiveShadow=false;
      panelMeshes.set(panel.id,mesh);
    });
    const firstPanel=layout.panels[0]&&panelMeshes.get(layout.panels[0].id);
    if(firstPanel)reportMaterialBinding(firstPanel);
    pacvuBrand(panelMeshes.get('lid'));
    relations=selectRelations(layout.foldRelations);
    buildHierarchy();
    const b=layout.bounds;model.position.set(-(b.minX+b.maxX)/2,(b.minY+b.maxY)/2,0);
    range.value='0';updatePose();fitCamera();
  }

  function selectRelations(source){
    // Side locks are rebuilt as a continuous two-hinge paper chain.
    return source.filter(relation=>!relation.foldIds.some(id=>/^f-7[LR]-[12]$/.test(id)));
  }

  function assemblyOrder(relation){
    const ids=relation.foldIds;
    if(ids.some(id=>/^f-[59][LR]$/.test(id)))return 1;
    if(ids.some(id=>id==='f-6'||id==='f-8'))return 2;
    if(ids.some(id=>/^f-7[LR]-[3-5]$/.test(id)))return 3;
    if(ids.some(id=>/^f-7[LR]-1$/.test(id)))return 4;
    if(ids.some(id=>/^f-[13][LR]$/.test(id)))return 5;
    if(ids.includes('f-4'))return 6;
    if(ids.includes('f-2'))return 7;
    return relation.order;
  }

  function buildHierarchy(){
    const THREE=root.THREE,adjacent=new Map(),frames=new Map();
    relations.forEach(relation=>{
      [relation.parentPanelId,relation.childPanelId].forEach(id=>{if(!adjacent.has(id))adjacent.set(id,[]);adjacent.get(id).push(relation);});
    });
    sheet.add(panelMeshes.get('base'));frames.set('base',sheet);const visited=new Set(['base']),queue=[{id:'base',frame:sheet}];
    while(queue.length){
      const current=queue.shift();
      (adjacent.get(current.id)||[]).forEach(relation=>{
        const child=relation.parentPanelId===current.id?relation.childPanelId:relation.parentPanelId;if(visited.has(child))return;
        const orientation=relation.parentPanelId===current.id?1:-1;
        // The user UI treats the lid wings and dog-ear dust flaps as one sheet
        // joined to their parent along the inside paper surface.  Keep their
        // approved XY fold axis, but rotate around that shared surface instead
        // of the board centre plane.  The child frame cancels this Z offset in
        // the flat state, so neither the 2D outline nor its initial pose moves.
        const lidSideHinge=relation.foldIds.some(id=>/^f-3[LR]$/.test(id));
        const dustHinge=relation.foldIds.some(id=>/^f-1[LR]$/.test(id));
        const backInsertHinge=relation.foldIds.some(id=>/^f-5[LR]$/.test(id));
        // The lid side flaps live on the inside face of the lid.  Rotating
        // them from the exterior (+Z) face makes the motion look correct in
        // isolation, but puts the whole flap on the outside layer while the
        // lid closes, so it cuts through the double-folded side structure.
        // Keep the dog-ear hinge on the existing face and move only f-3 to
        // the inner paper surface.  The child frame cancels this offset in
        // the flat pose, so the approved 2D outline is unchanged.
        // These flap families continue from the same paper surface. Rotate
        // them around that surface so the thick cut edges stay closed through
        // intermediate fold angles. The child frame cancels the complete
        // hinge position, including Z, so the flat layout remains unchanged.
        const hingeZ=lidSideHinge||dustHinge||backInsertHinge?PAPER_THICKNESS/2:0;
        const a=new THREE.Vector3(relation.axis.a.x,-relation.axis.a.y,hingeZ),b=new THREE.Vector3(relation.axis.b.x,-relation.axis.b.y,hingeZ);
        const hinge=new THREE.Group();hinge.position.copy(a);current.frame.add(hinge);
        const frame=new THREE.Group();frame.position.set(-a.x,-a.y,-a.z);hinge.add(frame);
        const childMesh=panelMeshes.get(child);frame.add(childMesh);
        const axis=b.sub(a).normalize(),bounds=layout.panels.find(panel=>panel.id===child).bounds;
        const radial=new THREE.Vector3(bounds.x+bounds.width/2-a.x,-(bounds.y+bounds.height/2)-a.y,0);
        const inwardSign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;
        hinges.push({object:hinge,axis,relation,orientation,inwardSign});
        visited.add(child);frames.set(child,frame);queue.push({id:child,frame});
      });
    }
    buildSideLockChain('L',frames,visited);
    buildSideLockChain('R',frames,visited);
    layout.panels.forEach(panel=>{if(!visited.has(panel.id))sheet.add(panelMeshes.get(panel.id));});
  }

  function buildSideLockChain(side,frames,visited){
    const THREE=root.THREE,left=side==='L';
    const sideId=left?'sidePanelLeft':'sidePanelRight',lockId=left?'bottomLockFlapLeft':'bottomLockFlapRight';
    const outer=layout.foldRelations.find(item=>item.foldIds.includes(`f-7${side}-2`));
    const inner=layout.foldRelations.find(item=>item.foldIds.includes(`f-7${side}-1`));
    const parent=frames.get(sideId);if(!outer||!inner||!parent)return;
    const a1=new THREE.Vector3(outer.axis.a.x,-outer.axis.a.y,0),b1=new THREE.Vector3(outer.axis.b.x,-outer.axis.b.y,0);
    const a2=new THREE.Vector3(inner.axis.a.x,-inner.axis.a.y,0),b2=new THREE.Vector3(inner.axis.b.x,-inner.axis.b.y,0);
    const hinge1=new THREE.Group();hinge1.position.copy(a1);parent.add(hinge1);
    const spineFrame=new THREE.Group();spineFrame.position.copy(a1).multiplyScalar(-1);hinge1.add(spineFrame);
    const y1=Math.max(outer.axis.a.y,inner.axis.a.y),y2=Math.min(outer.axis.b.y,inner.axis.b.y);
    const spinePanel={id:`lockSpine${side}`,polygon:[
      {x:outer.axis.a.x,y:y1},{x:inner.axis.a.x,y:y1},
      {x:inner.axis.a.x,y:y2},{x:outer.axis.a.x,y:y2}
    ]};
    const spine=new THREE.Mesh(shapeGeometry(spinePanel),paperMaterial);spine.castShadow=false;spine.receiveShadow=false;spineFrame.add(spine);
    const axis1=b1.sub(a1).normalize(),radial1=new THREE.Vector3((a2.x-a1.x)/2,0,0);
    const sign1=new THREE.Vector3().crossVectors(axis1,radial1).z>=0?1:-1;
    hinges.push({object:hinge1,axis:axis1,relation:{foldIds:[`f-7${side}-2`],angle:90},inwardSign:sign1,assemblyOrder:4});
    const hinge2=new THREE.Group();hinge2.position.copy(a2);spineFrame.add(hinge2);
    const lockFrame=new THREE.Group();lockFrame.position.copy(a2).multiplyScalar(-1);hinge2.add(lockFrame);lockFrame.add(panelMeshes.get(lockId));
    const lockBounds=layout.panels.find(panel=>panel.id===lockId).bounds;
    const axis2=b2.sub(a2).normalize(),radial2=new THREE.Vector3(lockBounds.x+lockBounds.width/2-a2.x,-(lockBounds.y+lockBounds.height/2)-a2.y,0);
    const sign2=new THREE.Vector3().crossVectors(axis2,radial2).z>=0?1:-1;
    hinges.push({object:hinge2,axis:axis2,relation:{foldIds:[`f-7${side}-1`],angle:90},inwardSign:sign2,assemblyOrder:4});
    visited.add(lockId);frames.set(lockId,lockFrame);
  }

  function updatePose(){
    if(!layout||!root.THREE)return;
    const THREE=root.THREE,progress=Number(range.value)/100;
    modal?.querySelector('.m001-3d-controls')?.style.setProperty('--progress',`${Number(range.value)}%`);
    hinges.forEach(item=>{
      const amount=foldProgress(item.relation.foldIds,progress);
      // Every panel folds toward the same (inside) face of the one-piece sheet.
      const overfold=pocketOverfoldProgress(item.relation.foldIds,progress);
      const angle=THREE.MathUtils.degToRad(
        item.inwardSign*(item.relation.angle*amount+POCKET_OVERFOLD_DEGREES*overfold)
      );
      item.object.quaternion.setFromAxisAngle(item.axis,angle);
    });
    updateModelBounds();
    if(boxCenter&&orbit)orbit.target.copy(boxCenter);
    const stageIndex=Math.min(MAX_STAGE,Math.floor(progress*MAX_STAGE+1e-6));
    status.textContent='Close';
    document.querySelectorAll('.m001-3d-steps button').forEach((button,index)=>button.classList.toggle('active',index<=stageIndex));
  }

  function pocketOverfoldProgress(ids,progress){
    let riseStart,riseEnd,fallStart,fallEnd;
    if(ids.some(id=>/^f-3[LR]$/.test(id))){
      [riseStart,riseEnd,fallStart,fallEnd]=[.66,.74,.90,1];
    }else if(ids.some(id=>/^f-1[LR]$/.test(id))){
      [riseStart,riseEnd,fallStart,fallEnd]=[.76,.86,.94,1];
    }else return 0;
    const smooth=value=>value*value*(3-2*value);
    if(progress<=riseStart||progress>=fallEnd)return 0;
    if(progress<riseEnd)return smooth((progress-riseStart)/(riseEnd-riseStart));
    if(progress<=fallStart)return 1;
    return 1-smooth((progress-fallStart)/(fallEnd-fallStart));
  }

  function foldProgress(ids,progress){
    let start=.18,end=.38;
    if(ids.includes('f-6'))[start,end]=[0,.24];
    else if(ids.includes('f-8'))[start,end]=[.10,.34];
    else if(ids.some(id=>/^f-[59][LR]$/.test(id)))[start,end]=[.18,.38];
    else if(ids.some(id=>/^f-7[LR]-[3-5]$/.test(id)))[start,end]=[.28,.50];
    else if(ids.some(id=>/^f-7[LR]-[12]$/.test(id)))[start,end]=[.42,.56];
    // The double-folded side locks finish first; the lid wings then turn into
    // the open inner pockets instead of sweeping through those top folds.
    else if(ids.some(id=>/^f-3[LR]$/.test(id)))[start,end]=[.58,.70];
    // Fold the dog-ear flaps down before the lid-front turns in.
    else if(ids.some(id=>/^f-1[LR]$/.test(id)))[start,end]=[.62,.76];
    else if(ids.includes('f-4'))[start,end]=[.70,.90];
    else if(ids.includes('f-2'))[start,end]=[.86,1];
    const value=Math.max(0,Math.min(1,(progress-start)/(end-start)));
    return value*value*(3-2*value);
  }

  function updateModelBounds(){
    if(!model||!root.THREE)return;
    model.updateMatrixWorld(true);
    const bounds=new root.THREE.Box3().setFromObject(model);
    if(bounds.isEmpty())return;
    boxCenter=bounds.getCenter(new root.THREE.Vector3());
    boxRadius=Math.max(1,bounds.getBoundingSphere(new root.THREE.Sphere()).radius);
    if(orbit){const limits=distanceLimits();orbit.minDistance=limits.min;orbit.maxDistance=limits.max;}
  }

  function focusBox(){
    updateModelBounds();
    if(boxCenter&&orbit)orbit.target.copy(boxCenter);
  }

  function fitCamera(){
    if(!layout||!orbit||!model)return;
    root.PacVu3DViewer.fitObject(model,camera,orbit,'iso');
  }

  function setCameraView(view){
    if(!orbit||!model)return;
    root.PacVu3DViewer.fitObject(model,camera,orbit,view);
  }

  function resize(){if(!renderer||!stage)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function animate(){if(!modal.classList.contains('open'))return;orbit?.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);}

  root.M001_3D_syncAvailability=syncAvailability;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installUI);else installUI();
  document.addEventListener('change',event=>{if(event.target?.id==='boxType')setTimeout(syncAvailability,0);});
})(typeof window!=='undefined'?window:globalThis);
