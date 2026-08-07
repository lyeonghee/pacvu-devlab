// TR003 Tray Box 3D assembly preview.
(function(root){
  'use strict';
  const T=.22,hinges=[];
  let modal,stage,range,renderer,scene,camera,orbit,model,raf=0,rebuildTimer=0,boardMaterials=null,shadowOn=true;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const clamp=value=>Math.max(0,Math.min(1,value));
  const smooth=value=>{const n=clamp(value);return n*n*(3-2*n);};

  function install(){
    if(document.getElementById('tr003-3d-btn'))return;
    const toolbar=document.querySelector('.toolbar');if(!toolbar)return;
    const button=el('button','btn m001-3d-button','3D MOCKUP');button.id='tr003-3d-btn';toolbar.append(button);
    const viewer=root.PacVu3DViewer.createModal({id:'tr003-3d-modal',badge:'TR003 · Tray Box'});
    modal=viewer.modal;stage=viewer.stage;range=viewer.range;
    button.onclick=open;modal.querySelector('[data-close]').onclick=closeView;modal.onclick=event=>{if(event.target===modal)closeView();};
    range.oninput=pose;range.onchange=fit;
    modal.querySelector('.m001-3d-views').onclick=event=>{if(event.target.dataset.view)setView(event.target.dataset.view);};
    modal.querySelector('[data-shadow]').onclick=event=>toggleShadow(event.target);
    modal.querySelector('[data-download]').onclick=downloadPng;
    document.addEventListener('input',event=>{if(!['baseW','baseD','panelH'].includes(event.target?.id)||!modal.classList.contains('open'))return;clearTimeout(rebuildTimer);rebuildTimer=setTimeout(()=>build(false),80);});
    document.addEventListener('change',event=>{if(event.target?.id==='boxType')setTimeout(sync,0);});sync();
  }
  function sync(){const button=document.getElementById('tr003-3d-btn');if(!button)return;const active=typeof selectedBoxMeta!=='undefined'&&selectedBoxMeta.engineKey==='tr003';button.style.display=active?'inline-flex':'none';if(!active)closeView();}
  function open(){modal.classList.add('open');ensureScene();build(true);resize();animate();}
  function closeView(){modal?.classList.remove('open');if(raf)cancelAnimationFrame(raf);raf=0;}
  function ensureScene(){
    if(renderer)return;const THREE=root.THREE,theme=root.PacVu3DTheme;
    renderer=root.PacVu3DViewer.createRenderer(THREE);stage.prepend(renderer.domElement);scene=new THREE.Scene();camera=root.PacVu3DViewer.createPerspectiveCamera(THREE,typeof getCfg==='function'?getCfg():null);
    const hemi=new THREE.HemisphereLight(theme.hemisphereLight.skyColor,theme.hemisphereLight.groundColor,theme.hemisphereLight.intensity*.68);scene.add(hemi);
    const key=new THREE.DirectionalLight(theme.directionalLight.color,theme.directionalLight.intensity);key.position.fromArray(theme.directionalLight.position);key.castShadow=true;key.shadow.mapSize.set(theme.directionalLight.shadowMapSize,theme.directionalLight.shadowMapSize);scene.add(key);
    const fill=new THREE.DirectionalLight(theme.fillLight.color,theme.fillLight.intensity*.45);fill.position.fromArray(theme.fillLight.position);scene.add(fill);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(2500,2500),new THREE.ShadowMaterial({color:0x48433e,opacity:.14}));floor.position.z=-2;floor.receiveShadow=true;scene.add(floor);
    const grid=new THREE.GridHelper(theme.grid.size,theme.grid.divisions,theme.grid.centerColor,theme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=theme.grid.z;scene.add(grid);
    orbit=new root.PacVuOrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.enablePan=false;orbit.minPolarAngle=.08;orbit.maxPolarAngle=Math.PI*.72;
    root.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls:orbit,floor,grid});window.addEventListener('resize',resize);
  }
  function materials(){if(!boardMaterials){boardMaterials=root.PacVu3DViewer.createBoardMaterials(root.THREE);boardMaterials[2].color.set(root.PacVu3DTheme.colors.exterior);boardMaterials[2].name='TR003 folded paper edge';}return boardMaterials;}
  function samplePath(d){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);const length=path.getTotalLength(),count=Math.max(64,Math.ceil(length/2)),points=[];for(let i=0;i<count;i+=1){const point=path.getPointAtLength(length*i/count);points.push({x:point.x,y:point.y});}return points;}
  function clipPolygon(subject,mask){const area=mask.reduce((sum,p,i)=>{const q=mask[(i+1)%mask.length];return sum+p.x*q.y-q.x*p.y;},0),sign=area>=0?1:-1;let output=subject.slice();mask.forEach((a,index)=>{const b=mask[(index+1)%mask.length],input=output;output=[];const inside=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))>=-.01;const cross=(p,q)=>{const rx=q.x-p.x,ry=q.y-p.y,sx=b.x-a.x,sy=b.y-a.y,den=rx*sy-ry*sx;if(Math.abs(den)<1e-9)return q;const t=((a.x-p.x)*sy-(a.y-p.y)*sx)/den;return{x:p.x+t*rx,y:p.y+t*ry};};for(let i=0;i<input.length;i+=1){const p=input[(i+input.length-1)%input.length],q=input[i],pi=inside(p),qi=inside(q);if(pi!==qi)output.push(cross(p,q));if(qi)output.push(q);}});return output;}
  function roundedHole(bounds){const THREE=root.THREE,x1=bounds.x1,x2=bounds.x2,y1=bounds.y1,y2=bounds.y2,r=Math.min(bounds.r||0,(x2-x1)/2,(y2-y1)/2),path=new THREE.Path();path.moveTo(x1+r,-y1);path.lineTo(x2-r,-y1);path.quadraticCurveTo(x2,-y1,x2,-(y1+r));path.lineTo(x2,-(y2-r));path.quadraticCurveTo(x2,-y2,x2-r,-y2);path.lineTo(x1+r,-y2);path.quadraticCurveTo(x1,-y2,x1,-(y2-r));path.lineTo(x1,-(y1+r));path.quadraticCurveTo(x1,-y1,x1+r,-y1);path.closePath();return path;}
  function lCutHole(cut){
    const THREE=root.THREE,t=cut.thickness,v=cut.vertical,base=cut.end==='left'
      ? [[cut.x1,-t/2],[cut.x2,-t/2],[cut.x2,t/2],[cut.x1+t,t/2],[cut.x1+t,v],[cut.x1,v]]
      : [[cut.x1,-t/2],[cut.x2,-t/2],[cut.x2,v],[cut.x2-t,v],[cut.x2-t,t/2],[cut.x1,t/2]];
    const points=base.map(([x,dy])=>({x,y:cut.y+dy*cut.direction})),path=new THREE.Path();
    points.forEach((point,index)=>index?path.lineTo(point.x,-point.y):path.moveTo(point.x,-point.y));path.closePath();return path;
  }
  function polygonMesh(name,polygon,cutouts=[]){const THREE=root.THREE,shape=new THREE.Shape();if(polygon.length<3){const empty=new THREE.Group();empty.name=name+'-empty';return empty;}polygon.forEach((point,index)=>index?shape.lineTo(point.x,-point.y):shape.moveTo(point.x,-point.y));shape.closePath();cutouts.forEach(cut=>shape.holes.push(cut.type==='l-cut'?lCutHole(cut):roundedHole(cut)));const geometry=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false,curveSegments:18});geometry.translate(0,0,-T/2);root.PacVu3DViewer.assignBoardFaceMaterials(geometry,T,'interior');const result=new THREE.Mesh(geometry,materials());result.name=name;result.castShadow=true;result.receiveShadow=true;return result;}
  function mesh(name,outline,mask,cutouts=[]){return polygonMesh(name,clipPolygon(outline,mask),cutouts);}
  function rect(x1,y1,x2,y2){return[{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}];}
  function roundedMask(x1,y1,x2,y2,r,corners={}){
    const radius=Math.max(0,Math.min(r,(x2-x1)/2,(y2-y1)/2)),points=[],arc=(cx,cy,a1,a2)=>{const steps=6;for(let i=0;i<=steps;i+=1){const a=a1+(a2-a1)*i/steps;points.push({x:cx+Math.cos(a)*radius,y:cy+Math.sin(a)*radius});}};
    corners.tr?arc(x2-radius,y1+radius,-Math.PI/2,0):points.push({x:x2,y:y1});
    corners.br?arc(x2-radius,y2-radius,0,Math.PI/2):points.push({x:x2,y:y2});
    corners.bl?arc(x1+radius,y2-radius,Math.PI/2,Math.PI):points.push({x:x1,y:y2});
    corners.tl?arc(x1+radius,y1+radius,Math.PI,Math.PI*1.5):points.push({x:x1,y:y1});
    return points;
  }
  function arcPoints(points,cx,cy,r,a1,a2){const steps=10;for(let i=0;i<=steps;i+=1){const a=a1+(a2-a1)*i/steps;points.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});}return points;}
  function leftTopCapMask(x0,y0,x1,edgeY,midY,r,outerR){const points=[{x:x0+outerR,y:y0},{x:x1,y:y0},{x:x1,y:midY}];arcPoints(points,x1-r,midY,r,0,-Math.PI/2);points.push({x:x0,y:edgeY},{x:x0,y:y0+outerR});arcPoints(points,x0+outerR,y0+outerR,outerR,Math.PI,Math.PI*1.5);return points;}
  function rightTopCapMask(x2,y0,x3,edgeY,midY,r,outerR){const points=[{x:x2,y:y0},{x:x3-outerR,y:y0}];arcPoints(points,x3-outerR,y0+outerR,outerR,-Math.PI/2,0);points.push({x:x3,y:edgeY},{x:x2+r,y:edgeY});arcPoints(points,x2+r,midY,r,-Math.PI/2,-Math.PI);return points;}
  function leftBottomCapMask(x0,y3,x1,edgeY,midY,r,outerR){const points=[{x:x0,y:edgeY},{x:x1-r,y:edgeY}];arcPoints(points,x1-r,midY,r,-Math.PI/2,0);points.push({x:x1,y:y3},{x:x0+outerR,y:y3});arcPoints(points,x0+outerR,y3-outerR,outerR,Math.PI/2,Math.PI);return points;}
  function rightBottomCapMask(x2,y3,x3,edgeY,midY,r,outerR){const points=[{x:x2,y:y3},{x:x3-outerR,y:y3}];arcPoints(points,x3-outerR,y3-outerR,outerR,Math.PI/2,0);points.push({x:x3,y:edgeY},{x:x2+r,y:edgeY});arcPoints(points,x2+r,midY,r,Math.PI/2,Math.PI);return points;}
  function leftSideCapMask(x0,x1,topEdge,topMid,bottomEdge,bottomMid,r){const points=[{x:x0,y:topEdge},{x:x1-r,y:topEdge}];arcPoints(points,x1-r,topMid,r,Math.PI/2,0);points.push({x:x1,y:bottomMid});arcPoints(points,x1-r,bottomMid,r,0,-Math.PI/2);points.push({x:x0,y:bottomEdge});return points;}
  function rightSideCapMask(x2,x3,topEdge,topMid,bottomEdge,bottomMid,r){const points=[{x:x2+r,y:topEdge},{x:x3,y:topEdge},{x:x3,y:bottomEdge},{x:x2+r,y:bottomEdge}];arcPoints(points,x2+r,bottomMid,r,Math.PI/2,Math.PI);points.push({x:x2,y:topMid});arcPoints(points,x2+r,topMid,r,Math.PI,Math.PI*1.5);return points;}
  function mirrorX(points,axis){return points.map(point=>({x:axis*2-point.x,y:point.y})).reverse();}
  function mirrorY(points,axis){return points.map(point=>({x:point.x,y:axis*2-point.y})).reverse();}
  function attach(parent,panel,a,b,start,end,turns=1){const THREE=root.THREE,p=new THREE.Vector3(a.x,-a.y,0),q=new THREE.Vector3(b.x,-b.y,0),hinge=new THREE.Group();hinge.position.copy(p);parent.add(hinge);const frame=new THREE.Group();frame.position.copy(p).multiplyScalar(-1);hinge.add(frame);frame.add(panel);const axis=q.sub(p).normalize(),box=new THREE.Box3().setFromObject(panel),center=box.getCenter(new THREE.Vector3()),radial=center.sub(p),inward=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;hinges.push({hinge,axis,radians:Math.PI/2*turns*inward,start,end});return frame;}
  function build(reset){
    const cfg=typeof getCfgTR003==='function'?getCfgTR003():{W:317.5,D:496.8875,H:133.35},layout=TR003_getLayout(cfg.W,cfg.D,cfg.H,cfg),p=layout.params;
    if(model){scene.remove(model);model.traverse(object=>object.geometry?.dispose());}hinges.length=0;model=new root.THREE.Group();scene.add(model);
    const fill=TR003_buildPanelFill(p,layout.spec),d=(fill.match(/d="([^"]+)"/)||[])[1],outline=samplePath(d),slotW=Math.max(8,cfg.H*.50),slotH=Math.max(1.1,cfg.H*.012),slotV=Math.max(8,cfg.H*.34);
    const slotY1=p.y1+cfg.D*.14,slotY2=p.y2-cfg.D*.14;
    const leftSlots=[
      {type:'l-cut',x1:p.x1-slotW,x2:p.x1-.6,y:slotY1,thickness:slotH,vertical:slotV,direction:1,end:'left'},
      {type:'l-cut',x1:p.x1-slotW,x2:p.x1-.6,y:slotY2,thickness:slotH,vertical:slotV,direction:-1,end:'left'}
    ];
    const rightSlots=[
      {type:'l-cut',x1:p.x2+.6,x2:p.x2+slotW,y:slotY1,thickness:slotH,vertical:slotV,direction:1,end:'right'},
      {type:'l-cut',x1:p.x2+.6,x2:p.x2+slotW,y:slotY2,thickness:slotH,vertical:slotV,direction:-1,end:'right'}
    ];
    // Source SVG: the four panel-3/panel-1 boundaries are independent cut
    // contours.  Their two edges sit at 547.535 and 565.335 around the
    // 555.203 fold datum, and terminate in a small arc at the inner axis.
    const sourceH=555.203-177.751;
    const cornerCutInset=cfg.H*((555.203-547.535)/sourceH);
    const sideCutInset=cfg.H*((565.335-555.203)/sourceH);
    const topCutUpper=p.y1-cornerCutInset,topCutLower=p.y1+sideCutInset,topCutMid=(topCutUpper+topCutLower)/2;
    const bottomCutUpper=p.y2-sideCutInset,bottomCutLower=p.y2+cornerCutInset,bottomCutMid=(bottomCutUpper+bottomCutLower)/2;
    const boundaryArc=Math.max(.8,(topCutLower-topCutUpper)/2);
    const outerCornerR=Math.max(2,cfg.H*((594.787-555.281)/(930.768-555.281)));
    const mirrorAxisX=(p.x0+p.x3)/2,mirrorAxisY=(p.y0+p.y3)/2;
    const panel3FrontLeftMask=leftTopCapMask(p.x0,p.y0,p.x1,topCutUpper,topCutMid,boundaryArc,outerCornerR);
    const panel3FrontRightMask=mirrorX(panel3FrontLeftMask,mirrorAxisX);
    const panel3BackLeftMask=mirrorY(panel3FrontLeftMask,mirrorAxisY);
    const panel3BackRightMask=mirrorX(panel3BackLeftMask,mirrorAxisX);
    const panel1LeftMask=leftSideCapMask(p.x0,p.x1,topCutLower,topCutMid,bottomCutUpper,bottomCutMid,boundaryArc);
    const panel1RightMask=mirrorX(panel1LeftMask,mirrorAxisX);
    const base=mesh('base',outline,rect(p.x1,p.y1,p.x2,p.y2));model.add(base);
    // These four horizontal boundaries are CUT lines in the source dieline,
    // not folds. Keep a physical gap between panel 1 and the four panel-3 tabs.
    const sideL=polygonMesh('panel-1-left',panel1LeftMask,leftSlots),sideR=polygonMesh('panel-1-right',panel1RightMask,rightSlots);
    attach(model,sideL,{x:p.x1,y:p.y1},{x:p.x1,y:p.y2},.04,.32);attach(model,sideR,{x:p.x2,y:p.y2},{x:p.x2,y:p.y1},.04,.32);
    const front=mesh('panel-2-front',outline,rect(p.x1,p.y0,p.x2,p.y1)),back=mesh('panel-2-back',outline,rect(p.x1,p.y2,p.x2,p.y3));
    const frontFrame=attach(model,front,{x:p.x2,y:p.y1},{x:p.x1,y:p.y1},.62,.92),backFrame=attach(model,back,{x:p.x1,y:p.y2},{x:p.x2,y:p.y2},.62,.92);
    const slitLength=cfg.H*((744.98-555.281)/(930.768-555.281)),slitThickness=Math.max(1.1,cfg.H*.012);
    const frontSlitY=p.y0+cfg.H*((373.146-177.751)/(555.203-177.751)),backSlitY=p.y2+cfg.H*((2136.315-1954.076)/(2331.528-1954.076));
    const cutFL={x1:p.x0+.25,x2:p.x0+slitLength,y1:frontSlitY-slitThickness/2,y2:frontSlitY+slitThickness/2,r:slitThickness/2};
    const cutFR={x1:p.x3-slitLength,x2:p.x3-.25,y1:frontSlitY-slitThickness/2,y2:frontSlitY+slitThickness/2,r:slitThickness/2};
    const cutBL={x1:p.x0+.25,x2:p.x0+slitLength,y1:backSlitY-slitThickness/2,y2:backSlitY+slitThickness/2,r:slitThickness/2};
    const cutBR={x1:p.x3-slitLength,x2:p.x3-.25,y1:backSlitY-slitThickness/2,y2:backSlitY+slitThickness/2,r:slitThickness/2};
    const fL=polygonMesh('panel-3-front-left',panel3FrontLeftMask,[cutFL]),fR=polygonMesh('panel-3-front-right',panel3FrontRightMask,[cutFR]);
    const bL=polygonMesh('panel-3-back-left',panel3BackLeftMask,[cutBL]),bR=polygonMesh('panel-3-back-right',panel3BackRightMask,[cutBR]);
    attach(frontFrame,fL,{x:p.x1,y:p.y1},{x:p.x1,y:p.y0},.32,.62);attach(frontFrame,fR,{x:p.x2,y:p.y0},{x:p.x2,y:p.y1},.32,.62);
    attach(backFrame,bL,{x:p.x1,y:p.y2},{x:p.x1,y:p.y3},.32,.62);attach(backFrame,bR,{x:p.x2,y:p.y3},{x:p.x2,y:p.y2},.32,.62);
    model.position.set(-(p.x1+p.x2)/2,(p.y1+p.y2)/2,0);if(reset)range.value='0';pose();fit();
  }
  function pose(){const progress=clamp(Number(range.value)/100);hinges.forEach(item=>{const amount=smooth((progress-item.start)/(item.end-item.start));item.hinge.quaternion.setFromAxisAngle(item.axis,item.radians*amount);});root.PacVu3DViewer.syncProgress({controls:modal.querySelector('.m001-3d-controls')},progress*100,'Assembly Stage');}
  function fit(){root.PacVu3DViewer.fitObject(model,camera,orbit,'iso');}function setView(view){root.PacVu3DViewer.fitObject(model,camera,orbit,view);}
  function toggleShadow(button){shadowOn=!shadowOn;scene.traverse(object=>{if(object.material?.isShadowMaterial)object.visible=shadowOn;if(object.isDirectionalLight)object.castShadow=shadowOn;});button.textContent=shadowOn?'Shadows On':'Shadows Off';}
  function downloadPng(){const canvas=renderer?.domElement;if(!canvas)return;canvas.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`TR003_3D_${Math.round(Number(range.value))}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);},'image/png');}
  function resize(){if(!renderer||!stage)return;const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
  function animate(){if(!modal.classList.contains('open'))return;orbit.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);}
  root.TR003_3D_syncAvailability=sync;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})(typeof window!=='undefined'?window:globalThis);
