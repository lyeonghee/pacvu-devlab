(function (global) {
  'use strict';
  if (!global.T005_getLayout) return;
  const EPS = 0.001;

  function area(points) { let n=0; for(let i=0,j=points.length-1;i<points.length;j=i++)n+=points[j].x*points[i].y-points[i].x*points[j].y; return Math.abs(n/2); }
  const panel=(id,role,polygon,holes,patches)=>Object.freeze({id,role,polygon:Object.freeze(polygon),holes:Object.freeze(holes||[]),patches:Object.freeze(patches||[])});
  const fold=(id,parentId,childId,a,b,angle,phase)=>Object.freeze({id,parentId,childId,axis:Object.freeze({a,b}),angle,phase:Object.freeze(phase)});
  function polylinePoints(element) {
    const value=global.T001_attr(element,'points')||'';
    const numbers=(value.match(/[-+]?\d*\.?\d+/g)||[]).map(Number),points=[];
    for(let index=0;index<numbers.length;index+=2)points.push({x:numbers[index],y:numbers[index+1]});
    return points;
  }
  function linePoints(element) {
    return ['x1','y1','x2','y2'].map(name=>Number(global.T001_attr(element,name)));
  }
  function signedArea(points) {
    let value=0;
    for(let index=0,previous=points.length-1;index<points.length;previous=index++)value+=points[previous].x*points[index].y-points[index].x*points[previous].y;
    return value/2;
  }
  function contains(points,point) {
    let inside=false;
    for(let index=0,previous=points.length-1;index<points.length;previous=index++){
      const a=points[index],b=points[previous];
      if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
    }
    return inside;
  }
  function intersection(first,second) {
    const rx=first.b.x-first.a.x,ry=first.b.y-first.a.y,sx=second.b.x-second.a.x,sy=second.b.y-second.a.y;
    const denominator=rx*sy-ry*sx;
    if(Math.abs(denominator)<1e-9)return null;
    const qx=second.a.x-first.a.x,qy=second.a.y-first.a.y;
    const t=(qx*sy-qy*sx)/denominator,u=(qx*ry-qy*rx)/denominator;
    return {t,u,point:{x:first.a.x+t*rx,y:first.a.y+t*ry}};
  }
  function extendFold(segment,barriers) {
    const length=Math.hypot(segment.b.x-segment.a.x,segment.b.y-segment.a.y),reach=Math.max(8,length*.025),margin=reach/length;
    const choices={start:{fold:null,cut:null},end:{fold:null,cut:null}};
    barriers.forEach(candidate=>{
      if(candidate===segment)return;
      const hit=intersection(segment,candidate);
      if(!hit)return;
      const candidateLength=Math.hypot(candidate.b.x-candidate.a.x,candidate.b.y-candidate.a.y);
      const candidateMargin=candidate.kind==='fold'?Math.max(8,candidateLength*.025)/candidateLength:EPS;
      if(hit.u<-candidateMargin||hit.u>1+candidateMargin)return;
      const startDistance=Math.abs(hit.t),endDistance=Math.abs(hit.t-1);
      const remember=(side,distance)=>{const current=choices[side][candidate.kind];if(!current||distance<current.distance)choices[side][candidate.kind]={point:hit.point,distance};};
      if(hit.t>=-margin&&hit.t<=.05)remember('start',startDistance);
      if(hit.t>=.95&&hit.t<=1+margin)remember('end',endDistance);
    });
    const start=choices.start.cut||choices.start.fold||{point:segment.a},end=choices.end.cut||choices.end.fold||{point:segment.b};
    return {a:start.point,b:end.point,kind:'fold'};
  }
  function cleanFace(points) {
    const result=[];
    points.forEach(point=>{
      if(!result.length||Math.hypot(point.x-result[result.length-1].x,point.y-result[result.length-1].y)>EPS)result.push(point);
    });
    let changed=true;
    while(changed&&result.length>3){
      changed=false;
      for(let index=0;index<result.length;index+=1){
        const before=result[(index+result.length-1)%result.length],after=result[(index+1)%result.length];
        if(Math.hypot(before.x-after.x,before.y-after.y)<=EPS){result.splice(index,1);changed=true;break;}
      }
    }
    return result;
  }
  function orderFoldBoundedContour(points,foldElement) {
    const values=linePoints(foldElement),a={x:values[0],y:values[1]},b={x:values[2],y:values[3]};
    const dx=b.x-a.x,dy=b.y-a.y,lengthSquared=dx*dx+dy*dy;
    const onFold=point=>{
      if(lengthSquared<1e-12)return false;
      const cross=Math.abs((point.x-a.x)*dy-(point.y-a.y)*dx)/Math.sqrt(lengthSquared);
      const projection=((point.x-a.x)*dx+(point.y-a.y)*dy)/lengthSquared;
      return cross<=EPS&&projection>=-EPS&&projection<=1+EPS;
    };
    const count=points.length;
    for(let index=0;index<count;index+=1){
      if(!onFold(points[index])||onFold(points[(index+1)%count]))continue;
      return points.slice(index).concat(points.slice(0,index));
    }
    return points;
  }
  function buildPanelFaces(outline,cutPolylines,foldElements,labels) {
    const boundary=outline.slice();
    if(boundary.length>1&&Math.hypot(boundary[0].x-boundary[boundary.length-1].x,boundary[0].y-boundary[boundary.length-1].y)<=EPS)boundary.pop();
    const cutSegments=[];
    for(let index=0;index<boundary.length;index+=1)cutSegments.push({a:boundary[index],b:boundary[(index+1)%boundary.length],kind:'cut'});
    cutPolylines.forEach(points=>{for(let index=0;index<points.length-1;index+=1)cutSegments.push({a:points[index],b:points[index+1],kind:'cut'});});
    const rawFolds=foldElements.map(element=>{const values=linePoints(element);return {a:{x:values[0],y:values[1]},b:{x:values[2],y:values[3]},kind:'fold'};});
    const barriers=cutSegments.concat(rawFolds),segments=cutSegments.concat(rawFolds.map(segment=>extendFold(segment,barriers)));
    const divisions=segments.map(()=>[0,1]);
    for(let first=0;first<segments.length;first+=1)for(let second=first+1;second<segments.length;second+=1){
      const hit=intersection(segments[first],segments[second]);
      if(!hit||hit.t<-EPS||hit.t>1+EPS||hit.u<-EPS||hit.u>1+EPS)continue;
      divisions[first].push(Math.max(0,Math.min(1,hit.t)));divisions[second].push(Math.max(0,Math.min(1,hit.u)));
    }
    const nodes=[],nodeMap=new Map(),edges=[],edgeMap=new Set();
    const nodeFor=point=>{
      const key=Math.round(point.x*10000)+','+Math.round(point.y*10000);
      if(nodeMap.has(key))return nodeMap.get(key);
      const node={id:nodes.length,x:point.x,y:point.y,out:[]};nodes.push(node);nodeMap.set(key,node);return node;
    };
    segments.forEach((segment,index)=>{
      const values=divisions[index].sort((a,b)=>a-b).filter((value,position,list)=>position===0||Math.abs(value-list[position-1])>1e-7);
      for(let part=0;part<values.length-1;part+=1){
        const start=values[part],finish=values[part+1];if(finish-start<1e-7)continue;
        const interpolate=t=>({x:segment.a.x+(segment.b.x-segment.a.x)*t,y:segment.a.y+(segment.b.y-segment.a.y)*t});
        const a=nodeFor(interpolate(start)),b=nodeFor(interpolate(finish));if(a===b)continue;
        const key=Math.min(a.id,b.id)+':'+Math.max(a.id,b.id);if(edgeMap.has(key))continue;edgeMap.add(key);
        const forward={from:a,to:b,used:false},reverse={from:b,to:a,used:false};forward.twin=reverse;reverse.twin=forward;a.out.push(forward);b.out.push(reverse);edges.push(forward,reverse);
      }
    });
    nodes.forEach(node=>node.out.sort((a,b)=>Math.atan2(a.to.y-node.y,a.to.x-node.x)-Math.atan2(b.to.y-node.y,b.to.x-node.x)));
    const faces=[];
    edges.forEach(start=>{
      if(start.used)return;
      const points=[];let current=start,guard=0;
      do{
        current.used=true;points.push({x:current.from.x,y:current.from.y});
        const outgoing=current.to.out,index=outgoing.indexOf(current.twin);
        current=outgoing[(index+outgoing.length-1)%outgoing.length];
        guard+=1;if(guard>edges.length+1)throw new Error('T005 3D: Cut/Fold face traversal failed.');
      }while(current!==start&&!current.used);
      const face=cleanFace(points),value=signedArea(face);
      if(face.length>=3&&value>EPS)faces.push({polygon:face,area:value});
    });
    const named=labels.map(label=>({label,faces:[]}));
    faces.forEach(face=>{
      const direct=named.filter(entry=>contains(face.polygon,entry.label));
      let owner=direct[0];
      if(!owner){
        const center=face.polygon.reduce((sum,point)=>({x:sum.x+point.x/face.polygon.length,y:sum.y+point.y/face.polygon.length}),{x:0,y:0});
        owner=named.reduce((best,entry)=>{
          const distance=(entry.label.x-center.x)**2+(entry.label.y-center.y)**2;
          return !best||distance<best.distance?{entry,distance}:best;
        },null).entry;
      }
      owner.faces.push(face.polygon);
    });
    const missing=named.filter(entry=>!entry.faces.length).map(entry=>entry.label.name);
    if(missing.length)throw new Error('T005 3D: Cut/Fold panels are unavailable: '+missing.join(', '));
    return named;
  }

  function buildContract(input) {
    const W=Number(input&&input.W)||286,D=Number(input&&input.D)||90,H=Number(input&&input.H)||344;
    const layout=global.T005_getLayout(W,D,H);
    const outline=global.T001_flattenPathD(layout.fillPath);
    if(!outline||outline.length<3)throw new Error('T005 3D: approved Cut outline is unavailable.');
    const capsuleHoleEnabled=!input||input.capsuleHoleEnabled!==false;
    const capsule=capsuleHoleEnabled?global.T001_flattenPathD(layout.capsuleHole.path):[];
    const definitions=new Map([
      ['Glue',['glue','adhesive']],['Back',['back','body']],['Side(L)',['sideLeft','body']],['Front',['front','body']],['Side(R)',['sideRight','body']],
      ['upperLid',['upperLid','lid']],['upperTuck',['upperTuck','tuck']],['lowerLid',['lowerLid','lid']],['lowerTuck',['lowerTuck','tuck']],
      ['upperDustFlap(L)',['upperDustLeft','dust']],['upperDustFlap(R)',['upperDustRight','dust']],
      ['lowerDustFlap(L)',['lowerDustLeft','dust']],['lowerDustFlap(R)',['lowerDustRight','dust']]
    ]);
    const groups=buildPanelFaces(outline,layout.shortCutElements.map(polylinePoints),layout.foldElements,layout.labels);
    const orderedFoldByPanel=new Map([
      ['lowerDustLeft',layout.foldElements[10]],
      ['upperDustLeft',layout.foldElements[11]],
      ['upperDustRight',layout.foldElements[8]]
    ]);
    const panels=groups.map(group=>{
      const definition=definitions.get(group.label.name);
      if(!definition)throw new Error('T005 3D: unknown Cut/Fold panel '+group.label.name);
      const faces=group.faces.slice().sort((first,second)=>area(second)-area(first));
      const foldElement=orderedFoldByPanel.get(definition[0]);
      const polygon=foldElement?orderFoldBoundedContour(faces[0],foldElement):faces[0];
      return panel(definition[0],definition[1],polygon,definition[0]==='sideLeft'&&capsuleHoleEnabled?[capsule]:[],faces.slice(1));
    });
    const axis=index=>{const values=linePoints(layout.foldElements[index]);return [{x:values[0],y:values[1]},{x:values[2],y:values[3]}];};
    const folds=[
      fold('body.front-sideLeft','front','sideLeft',...axis(5),90,[.04,.14]),
      fold('body.sideLeft-back','sideLeft','back',...axis(4),90,[.10,.20]),
      fold('body.back-glue','back','glue',...axis(6),90,[.16,.26]),
      fold('body.front-sideRight','front','sideRight',...axis(7),90,[.12,.22]),
      fold('lower.sideLeft-dust','sideLeft','lowerDustLeft',...axis(10),90,[.42,.50]),
      fold('lower.sideRight-dust','sideRight','lowerDustRight',...axis(9),90,[.42,.50]),
      fold('lower.back-lid','back','lowerLid',...axis(2),90,[.56,.68]),
      fold('lower.lid-tuck','lowerLid','lowerTuck',...axis(3),110,[.50,.56]),
      fold('upper.sideLeft-dust','sideLeft','upperDustLeft',...axis(11),90,[.72,.80]),
      fold('upper.sideRight-dust','sideRight','upperDustRight',...axis(8),90,[.72,.80]),
      fold('upper.front-lid','front','upperLid',...axis(1),90,[.86,.98]),
      fold('upper.lid-tuck','upperLid','upperTuck',...axis(0),110,[.80,.86])
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
      const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
      const makeShape=points=>{const shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(p.x-cx,cy-p.y):shape.moveTo(p.x-cx,cy-p.y));shape.closePath();return shape;};
      const shape=makeShape(def.polygon),shapes=[shape].concat(def.patches.map(makeShape));
      def.holes.forEach(points=>{const hole=new THREE.Path();points.forEach((p,i)=>i?hole.lineTo(p.x-cx,cy-p.y):hole.moveTo(p.x-cx,cy-p.y));hole.closePath();shape.holes.push(hole);});
      const geometry=new THREE.ExtrudeGeometry(shapes,{depth:thickness,bevelEnabled:false,curveSegments:48});
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
