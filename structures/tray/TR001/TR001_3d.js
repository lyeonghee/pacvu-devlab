// TR001 EB Tray Box 3D assembly preview.
(function(root){
  'use strict';
  const T=.22,hinges=[];
  let modal,stage,range,renderer,scene,camera,orbit,model,raf=0,rebuildTimer=0,boardMaterials=null,shadowOn=true;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const clamp=value=>Math.max(0,Math.min(1,value));
  const smooth=value=>{const n=clamp(value);return n*n*(3-2*n);};

  function install(){
    if(document.getElementById('tr001-3d-btn'))return;
    const toolbar=document.querySelector('.toolbar');if(!toolbar)return;
    const button=el('button','btn m001-3d-button','3D MOCKUP');button.id='tr001-3d-btn';toolbar.append(button);
    const viewer=root.PacVu3DViewer.createModal({id:'tr001-3d-modal',badge:'TR001 · EB Tray Box'});
    modal=viewer.modal;stage=viewer.stage;range=viewer.range;
    const close=modal.querySelector('[data-close]'),download=modal.querySelector('[data-download]'),shadow=modal.querySelector('[data-shadow]'),views=modal.querySelector('.m001-3d-views');
    button.onclick=open;close.onclick=closeView;modal.onclick=event=>{if(event.target===modal)closeView();};
    range.oninput=pose;range.onchange=fit;
    views.onclick=event=>{if(event.target.dataset.view)setView(event.target.dataset.view);};
    shadow.onclick=()=>toggleShadow(shadow);download.onclick=downloadPng;
    document.addEventListener('input',event=>{
      if(!['baseW','baseD','panelH','tr001FrontBackHoleCount','tr001LeftRightHoleCount'].includes(event.target?.id)||!modal.classList.contains('open'))return;
      clearTimeout(rebuildTimer);rebuildTimer=setTimeout(()=>build(false),80);
    });
    document.addEventListener('change',event=>{if(event.target?.id==='boxType')setTimeout(sync,0);});sync();
  }

  function sync(){
    const button=document.getElementById('tr001-3d-btn');if(!button)return;
    const active=typeof selectedBoxMeta!=='undefined'&&selectedBoxMeta.engineKey==='tr001';
    button.style.display=active?'inline-flex':'none';if(!active)closeView();
  }
  function open(){modal.classList.add('open');ensureScene();build(true);resize();animate();}
  function closeView(){modal?.classList.remove('open');if(raf)cancelAnimationFrame(raf);raf=0;}

  function ensureScene(){
    if(renderer)return;
    const THREE=root.THREE,theme=root.PacVu3DTheme;
    renderer=root.PacVu3DViewer.createRenderer(THREE);stage.prepend(renderer.domElement);
    scene=new THREE.Scene();camera=root.PacVu3DViewer.createPerspectiveCamera(THREE,typeof getCfg==='function'?getCfg():null);
    scene.add(new THREE.HemisphereLight(theme.hemisphereLight.skyColor,theme.hemisphereLight.groundColor,theme.hemisphereLight.intensity));
    const key=new THREE.DirectionalLight(theme.directionalLight.color,theme.directionalLight.intensity);key.position.fromArray(theme.directionalLight.position);key.castShadow=true;key.shadow.mapSize.set(theme.directionalLight.shadowMapSize,theme.directionalLight.shadowMapSize);scene.add(key);
    const fill=new THREE.DirectionalLight(theme.fillLight.color,theme.fillLight.intensity);fill.position.fromArray(theme.fillLight.position);scene.add(fill);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(2500,2500),new THREE.ShadowMaterial({color:0x48433e,opacity:.11}));floor.position.z=-2;floor.receiveShadow=true;scene.add(floor);
    const grid=new THREE.GridHelper(theme.grid.size,theme.grid.divisions,theme.grid.centerColor,theme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=theme.grid.z;scene.add(grid);
    orbit=new root.PacVuOrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.enablePan=false;orbit.minPolarAngle=.08;orbit.maxPolarAngle=Math.PI*.72;
    root.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls:orbit,floor,grid});
    scene.traverse(object=>{
      if(object.isHemisphereLight)object.intensity=theme.hemisphereLight.intensity*.68;
      if(object.isDirectionalLight&&object!==key)object.intensity=theme.fillLight.intensity*.45;
    });
    window.addEventListener('resize',resize);
  }

  function materials(){
    if(!boardMaterials){
      const THREE=root.THREE,theme=root.PacVu3DTheme;
      boardMaterials=root.PacVu3DViewer.createBoardMaterials(THREE);
      boardMaterials[2].color.set(theme.colors.exterior);
      boardMaterials[2].name='TR001 folded paper edge';
    }
    return boardMaterials;
  }
  function samplePath(d){
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);
    const length=path.getTotalLength(),count=Math.max(48,Math.ceil(length/2)),points=[];
    for(let index=0;index<count;index+=1){const point=path.getPointAtLength(length*index/count);points.push({x:point.x,y:point.y});}
    return points;
  }
  function clipPolygon(subject,mask){
    const area=mask.reduce((sum,p,index)=>{const q=mask[(index+1)%mask.length];return sum+p.x*q.y-q.x*p.y;},0),sign=area>=0?1:-1;let output=subject.slice();
    mask.forEach((a,index)=>{const b=mask[(index+1)%mask.length],input=output;output=[];const inside=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))>=-.01;const cross=(p,q)=>{const rx=q.x-p.x,ry=q.y-p.y,sx=b.x-a.x,sy=b.y-a.y,den=rx*sy-ry*sx;if(Math.abs(den)<1e-9)return q;const t=((a.x-p.x)*sy-(a.y-p.y)*sx)/den;return{x:p.x+t*rx,y:p.y+t*ry};};for(let i=0;i<input.length;i+=1){const p=input[(i+input.length-1)%input.length],q=input[i],pi=inside(p),qi=inside(q);if(pi!==qi)output.push(cross(p,q));if(qi)output.push(q);}});return output;
  }
  function roundedRectHole(THREE,bounds){
    const x1=bounds.x1,x2=bounds.x2,y1=bounds.y1,y2=bounds.y2,r=Math.min(bounds.r||0,(x2-x1)/2,(y2-y1)/2),path=new THREE.Path();
    path.moveTo(x1+r,-y1);path.lineTo(x2-r,-y1);path.quadraticCurveTo(x2,-y1,x2,-(y1+r));path.lineTo(x2,-(y2-r));path.quadraticCurveTo(x2,-y2,x2-r,-y2);path.lineTo(x1+r,-y2);path.quadraticCurveTo(x1,-y2,x1,-(y2-r));path.lineTo(x1,-(y1+r));path.quadraticCurveTo(x1,-y1,x1+r,-y1);path.closePath();return path;
  }
  function regionMesh(name,outline,mask,holes,cutouts=[]){
    const THREE=root.THREE,polygon=clipPolygon(outline,mask),shape=new THREE.Shape();
    polygon.forEach((point,index)=>index?shape.lineTo(point.x,-point.y):shape.moveTo(point.x,-point.y));shape.closePath();
    holes.filter(hole=>hole.cx>=mask[0].x&&hole.cx<=mask[2].x&&hole.cy>=mask[0].y&&hole.cy<=mask[2].y).forEach(hole=>{const path=new THREE.Path();path.absarc(hole.cx,-hole.cy,hole.r,0,Math.PI*2,false);shape.holes.push(path);});
    cutouts.forEach(cutout=>shape.holes.push(roundedRectHole(THREE,cutout)));
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false,curveSegments:18});geometry.translate(0,0,-T/2);root.PacVu3DViewer.assignBoardFaceMaterials(geometry,T,'interior');
    const mesh=new THREE.Mesh(geometry,materials());mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }
  function regionGroup(name,outline,holes,masks){
    const group=new root.THREE.Group();group.name=name;
    masks.forEach((mask,index)=>group.add(regionMesh(`${name}-${index+1}`,outline,mask,holes)));
    return group;
  }
  function tabMesh(name,bounds,roundAtStart){
    const THREE=root.THREE,x1=bounds.x1,x2=bounds.x2,y1=bounds.y1,y2=bounds.y2,r=Math.min(bounds.r||0,(x2-x1)/2,(y2-y1)/2),shape=new THREE.Shape();
    if(roundAtStart){shape.moveTo(x1,-y2);shape.lineTo(x1,-(y1+r));shape.quadraticCurveTo(x1,-y1,x1+r,-y1);shape.lineTo(x2-r,-y1);shape.quadraticCurveTo(x2,-y1,x2,-(y1+r));shape.lineTo(x2,-y2);}
    else{shape.moveTo(x1,-y1);shape.lineTo(x2,-y1);shape.lineTo(x2,-(y2-r));shape.quadraticCurveTo(x2,-y2,x2-r,-y2);shape.lineTo(x1+r,-y2);shape.quadraticCurveTo(x1,-y2,x1,-(y2-r));}
    shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false,curveSegments:18});geometry.translate(0,0,-T/2);root.PacVu3DViewer.assignBoardFaceMaterials(geometry,T,'interior');
    const mesh=new THREE.Mesh(geometry,materials());mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }
  function rect(x1,y1,x2,y2){return[{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}];}
  function attach(parent,mesh,a,b,start,end,turns=1){
    const THREE=root.THREE,p=new THREE.Vector3(a.x,-a.y,0),q=new THREE.Vector3(b.x,-b.y,0),hinge=new THREE.Group();hinge.position.copy(p);parent.add(hinge);
    const frame=new THREE.Group();frame.position.copy(p).multiplyScalar(-1);hinge.add(frame);frame.add(mesh);
    const axis=q.sub(p).normalize(),box=new THREE.Box3().setFromObject(mesh),center=box.getCenter(new THREE.Vector3()),radial=center.sub(p),inward=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;
    hinges.push({hinge,axis,radians:Math.PI/2*turns*inward,start,end});return frame;
  }

  function build(reset){
    const cfg=typeof getCfgTR001==='function'?getCfgTR001():{W:282,D:368,H:140,frontBackHoleCount:3,leftRightHoleCount:4},layout=root.TR001_getLayout(cfg.W,cfg.D,cfg.H,cfg),p=layout.params;
    if(model){scene.remove(model);model.traverse(object=>object.geometry?.dispose());}
    hinges.length=0;model=new root.THREE.Group();scene.add(model);
    const d=(layout.cutFillElement.match(/d="([^"]+)"/)||[])[1];if(!d)throw new Error('TR001 cutPath is unavailable');
    const outline=samplePath(d),holes=layout.holes||[],sx=cfg.W/282,sy=cfg.H/140,sl=layout.spec.lip/60,mid=(p.x1+p.x2)/2;
    const upperTab={x1:mid-34*sx,x2:mid+34*sx,y1:p.y1-10*sl,y2:p.y1+1*sy,r:5*Math.min(sx,sl)};
    const upperCut={x1:mid-35*sx,x2:mid+35*sx,y1:p.y2-10*sy,y2:p.y2+5*sy};
    const lowerCut={x1:mid-35*sx,x2:mid+35*sx,y1:p.y3-5*sy,y2:p.y3+10*sy};
    const lowerTab={x1:mid-34*sx,x2:mid+34*sx,y1:p.y4-1*sy,y2:p.y4+10*sl,r:5*Math.min(sx,sl)};
    const base=regionGroup('base',outline,holes,[
      rect(p.x1,upperCut.y2,p.x2,lowerCut.y1),
      rect(p.x1,p.y2,upperCut.x1,upperCut.y2),rect(upperCut.x2,p.y2,p.x2,upperCut.y2),
      rect(p.x1,lowerCut.y1,lowerCut.x1,p.y3),rect(lowerCut.x2,lowerCut.y1,p.x2,p.y3)
    ]);model.add(base);
    const back=regionGroup('panel-1-back',outline,holes,[
      rect(p.x1,p.y1,p.x2,upperCut.y1),rect(p.x1,upperCut.y1,upperCut.x1,p.y2),rect(upperCut.x2,upperCut.y1,p.x2,p.y2)
    ]);
    const front=regionGroup('panel-1-front',outline,holes,[
      rect(p.x1,lowerCut.y2,p.x2,p.y4),rect(p.x1,p.y3,lowerCut.x1,lowerCut.y2),rect(lowerCut.x2,p.y3,p.x2,lowerCut.y2)
    ]);
    const backFrame=attach(model,back,{x:p.x2,y:p.y2},{x:p.x1,y:p.y2},.04,.22),frontFrame=attach(model,front,{x:p.x1,y:p.y3},{x:p.x2,y:p.y3},.04,.22);
    const tab2BL=regionMesh('panel-2-back-left',outline,rect(p.x0,p.y1,p.x1,p.y2),holes),tab2BR=regionMesh('panel-2-back-right',outline,rect(p.x2,p.y1,p.x3,p.y2),holes);
    const tab2FL=regionMesh('panel-2-front-left',outline,rect(p.x0,p.y3,p.x1,p.y4),holes),tab2FR=regionMesh('panel-2-front-right',outline,rect(p.x2,p.y3,p.x3,p.y4),holes);
    attach(backFrame,tab2BL,{x:p.x1,y:p.y2},{x:p.x1,y:p.y1},.22,.42);attach(backFrame,tab2BR,{x:p.x2,y:p.y1},{x:p.x2,y:p.y2},.22,.42);
    attach(frontFrame,tab2FL,{x:p.x1,y:p.y3},{x:p.x1,y:p.y4},.22,.42);attach(frontFrame,tab2FR,{x:p.x2,y:p.y4},{x:p.x2,y:p.y3},.22,.42);
    const sideL=regionMesh('panel-3-left',outline,rect(p.x0,p.y2,p.x1,p.y3),holes),sideR=regionMesh('panel-3-right',outline,rect(p.x2,p.y2,p.x3,p.y3),holes);
    attach(model,sideL,{x:p.x1,y:p.y2},{x:p.x1,y:p.y3},.42,.62);attach(model,sideR,{x:p.x2,y:p.y3},{x:p.x2,y:p.y2},.42,.62);
    const lipBack=regionMesh('panel-4-back',outline,rect(p.x1,p.y0,p.x2,p.y1),holes,[upperTab]),lipFront=regionMesh('panel-4-front',outline,rect(p.x1,p.y4,p.x2,p.y5),holes,[lowerTab]);
    const lipBackFrame=attach(backFrame,lipBack,{x:p.x1,y:p.y1},{x:p.x2,y:p.y1},.62,.80),lipFrontFrame=attach(frontFrame,lipFront,{x:p.x2,y:p.y4},{x:p.x1,y:p.y4},.62,.80);
    backFrame.add(tabMesh('upper-u-cut-tab',upperTab,true));frontFrame.add(tabMesh('lower-u-cut-tab',lowerTab,false));
    const tab5BL=regionMesh('panel-5-back-left',outline,rect(p.x0,p.y0,p.x1,p.y1),holes),tab5BR=regionMesh('panel-5-back-right',outline,rect(p.x2,p.y0,p.x3,p.y1),holes);
    const tab5FL=regionMesh('panel-5-front-left',outline,rect(p.x0,p.y4,p.x1,p.y5),holes),tab5FR=regionMesh('panel-5-front-right',outline,rect(p.x2,p.y4,p.x3,p.y5),holes);
    [tab5BL,tab5BR,tab5FL,tab5FR].forEach(panel=>panel.position.z=-T*.9);
    attach(lipBackFrame,tab5BL,{x:p.x1,y:p.y1},{x:p.x1,y:p.y0},.80,1);attach(lipBackFrame,tab5BR,{x:p.x2,y:p.y0},{x:p.x2,y:p.y1},.80,1);
    attach(lipFrontFrame,tab5FL,{x:p.x1,y:p.y4},{x:p.x1,y:p.y5},.80,1);attach(lipFrontFrame,tab5FR,{x:p.x2,y:p.y5},{x:p.x2,y:p.y4},.80,1);
    model.position.set(-(p.x1+p.x2)/2,(p.y2+p.y3)/2,0);
    if(reset)range.value='0';pose();fit();
  }

  function pose(){
    const progress=clamp(Number(range.value)/100);
    hinges.forEach(item=>{const amount=smooth((progress-item.start)/(item.end-item.start));item.hinge.quaternion.setFromAxisAngle(item.axis,item.radians*amount);});
    root.PacVu3DViewer.syncProgress({controls:modal.querySelector('.m001-3d-controls')},progress*100,'Assembly Stage');
  }
  function fit(){root.PacVu3DViewer.fitObject(model,camera,orbit,'iso');}
  function setView(view){root.PacVu3DViewer.fitObject(model,camera,orbit,view);}
  function toggleShadow(button){shadowOn=!shadowOn;scene.traverse(object=>{if(object.material?.isShadowMaterial)object.visible=shadowOn;if(object.isDirectionalLight)object.castShadow=shadowOn;});button.textContent=shadowOn?'Shadows On':'Shadows Off';}
  function downloadPng(){const canvas=renderer?.domElement;if(!canvas)return;canvas.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`TR001_3D_${Math.round(Number(range.value))}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);},'image/png');}
  function resize(){if(!renderer||!stage)return;const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
  function animate(){if(!modal.classList.contains('open'))return;orbit.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);}

  root.TR001_3D_syncAvailability=sync;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})(typeof window!=='undefined'?window:globalThis);
