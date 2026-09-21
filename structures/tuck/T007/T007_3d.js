(function (global) {
  'use strict';
  if (!global.T007_getLayout) return;
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
  function joinContour(elements) {
    const segments=elements.map(element=>global.T001_flattenPathD(global.T001_elementToPathD(element))).filter(points=>points.length>1);
    if(!segments.length)return [];
    const contour=segments.shift().slice();
    while(segments.length){
      const end=contour[contour.length-1];let choice=null;
      segments.forEach((points,index)=>{
        const first=points[0],last=points[points.length-1];
        const forward=Math.hypot(end.x-first.x,end.y-first.y),reverse=Math.hypot(end.x-last.x,end.y-last.y);
        const option=forward<=reverse?{distance:forward,reverse:false,index}:{distance:reverse,reverse:true,index};
        if(!choice||option.distance<choice.distance)choice=option;
      });
      const points=segments.splice(choice.index,1)[0];
      contour.push(...(choice.reverse?points.slice().reverse():points).slice(1));
    }
    return cleanFace(contour);
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
        guard+=1;if(guard>edges.length+1)throw new Error('T007 3D: Cut/Fold face traversal failed.');
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
    if(missing.length)throw new Error('T007 3D: Cut/Fold panels are unavailable: '+missing.join(', '));
    return named;
  }

  function buildContract(input) {
    const spec=global.T007_getSpec(input||{W:110,D:80,H:225});
    const W=spec.W,D=spec.D,H=spec.H;
    const layout=global.T007_getLayout(spec);
    const outline=global.T001_flattenPathD(layout.fillPath);
    if(!outline||outline.length<3)throw new Error('T007 3D: approved Cut outline is unavailable.');
    const definitions=new Map([
      ['Glue',['glue','adhesive']],['Back',['back','body']],['Side(L)',['sideLeft','body']],['Front',['front','body']],['Side(R)',['sideRight','body']],
      ['topBack',['topBack','end']],['topSideLeft',['topSideLeft','dust']],['topGlue',['topGlue','adhesive']],['topSideRight',['topSideRight','dust']],
      ['bottomBack',['bottomBack','end']],['bottomSideLeft',['bottomSideLeft','dust']],['bottomGlue',['bottomGlue','adhesive']],['bottomSideRight',['bottomSideRight','dust']]
    ]);
    const sourceLabel=(name,x,y)=>{const point=layout.mapper.point(x,y);return{name,x:point.x,y:point.y};};
    const labels=layout.labels.concat([
      sourceLabel('topBack',248,365),sourceLabel('topSideLeft',520,380),sourceLabel('topGlue',788,360),sourceLabel('topSideRight',1057,380),
      sourceLabel('bottomBack',248,1150),sourceLabel('bottomSideLeft',520,1140),sourceLabel('bottomGlue',788,1150),sourceLabel('bottomSideRight',1057,1140)
    ]);
    const tearOuter=spec.tearOffEnabled?joinContour([
      layout.tearCut[0],layout.tearPerf[0],layout.tearCut[1],layout.tearPerf[1]
    ].filter(Boolean)):[];
    const fingerOpening=spec.tearOffEnabled?joinContour([
      layout.tearCut[2],layout.tearPerf[2]
    ].filter(Boolean)):[];
    const groups=buildPanelFaces(outline,[],layout.foldElements,labels);
    const panels=groups.map(group=>{
      const definition=definitions.get(group.label.name);
      if(!definition)throw new Error('T007 3D: unknown Cut/Fold panel '+group.label.name);
      const faces=group.faces.slice().sort((first,second)=>area(second)-area(first));
      const holes=definition[0]==='front'&&tearOuter.length?[tearOuter]:[];
      return panel(definition[0],definition[1],faces[0],holes,[]);
    });
    const axis=index=>{const values=linePoints(layout.foldElements[index]);return [{x:values[0],y:values[1]},{x:values[2],y:values[3]}];};
    const folds=[
      fold('body.front-sideLeft','front','sideLeft',...axis(6),90,[.04,.14]),
      fold('body.sideLeft-back','sideLeft','back',...axis(5),90,[.10,.20]),
      fold('body.back-glue','back','glue',...axis(7),90,[.16,.26]),
      fold('body.front-sideRight','front','sideRight',...axis(4),90,[.12,.22]),
      fold('bottom.sideLeft','sideLeft','bottomSideLeft',...axis(2),90,[.36,.44]),
      fold('bottom.sideRight','sideRight','bottomSideRight',...axis(0),90,[.36,.44]),
      fold('bottom.back','back','bottomBack',...axis(3),90,[.46,.56]),
      fold('bottom.glue','front','bottomGlue',...axis(1),90,[.58,.68]),
      fold('top.sideLeft','sideLeft','topSideLeft',...axis(9),90,[.72,.80]),
      fold('top.sideRight','sideRight','topSideRight',...axis(8),90,[.72,.80]),
      fold('top.back','back','topBack',...axis(10),90,[.82,.90]),
      fold('top.glue','front','topGlue',...axis(11),90,[.92,1])
    ];
    const ids=new Set(panels.map(item=>item.id));
    folds.forEach(item=>{if(!ids.has(item.parentId)||!ids.has(item.childId))throw new Error('T007 3D hierarchy failed: '+item.id);});
    return Object.freeze({code:'T007',dimensions:Object.freeze({W,D,H}),options:Object.freeze({tearOffEnabled:spec.tearOffEnabled,liftTabsEnabled:spec.liftTabsEnabled}),layout,panels:Object.freeze(panels),folds:Object.freeze(folds),tearOff:Object.freeze({outer:Object.freeze(tearOuter),finger:Object.freeze(fingerOpening)}),
      adhesiveRelations:Object.freeze([
        Object.freeze({id:'body-glue-seam',from:'glue',to:'sideRight'}),
        Object.freeze({id:'bottom-glue',from:'bottomGlue',to:'bottomBack'}),
        Object.freeze({id:'top-glue',from:'topGlue',to:'topBack'})
      ]),
      states:Object.freeze({flat:0,body:.30,bottom:.70,top:.98,closed:1})});
  }

  function createMaster(input) {
    const THREE=global.THREE,Viewer=global.PacVu3DViewer;
    if(!THREE||!Viewer||!global.PacVuOrbitControls)throw new Error('T007 3D viewer dependencies are unavailable.');
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

    const viewer=Viewer.createModal({id:'t0073dModal',badge:'T007 · Tissue Dispensing Tuck Box 3D Workbench'}),modal=viewer.modal,stage=viewer.stage;
    const labels=modal.querySelector('.assembly-labels');labels.innerHTML='<span>Flat</span><span>Body</span><span>Bottom</span><span>Top</span><span>Closed</span>';labels.style.setProperty('grid-template-columns','repeat(5,1fr)','important');
    Array.from(labels.children).forEach((node,index)=>{node.style.setProperty('justify-self',index===0?'start':index===4?'end':'center','important');node.style.textAlign=index===0?'left':index===4?'right':'center';});
    const scene=new THREE.Scene();scene.background=new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera=Viewer.createPerspectiveCamera(THREE,C),renderer=Viewer.createRenderer(THREE);renderer.setPixelRatio(Math.min(global.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;stage.prepend(renderer.domElement);
    const controls=new global.PacVuOrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,global.PacVu3DTheme.hemisphereLight.groundColor,global.PacVu3DTheme.hemisphereLight.intensity));
    const sun=new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color,global.PacVu3DTheme.directionalLight.intensity);sun.position.fromArray(global.PacVu3DTheme.directionalLight.position);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    const extent=Math.max(C.W,C.D,C.H)*1.4;sun.shadow.camera.left=-extent;sun.shadow.camera.right=extent;sun.shadow.camera.top=extent;sun.shadow.camera.bottom=-extent;sun.shadow.camera.near=1;sun.shadow.camera.far=Math.max(1600,extent*6);sun.shadow.bias=-.00035;sun.shadow.normalBias=1.5;scene.add(sun);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.ShadowMaterial({color:0x3f3933,opacity:.34}));floor.receiveShadow=true;floor.position.z=global.PacVu3DTheme.floor.z;scene.add(floor);
    const grid=new THREE.GridHelper(global.PacVu3DTheme.grid.size,global.PacVu3DTheme.grid.divisions,global.PacVu3DTheme.grid.centerColor,global.PacVu3DTheme.grid.lineColor);grid.rotation.x=Math.PI/2;grid.position.z=global.PacVu3DTheme.grid.z;scene.add(grid);Viewer.standardizeEnvironment({renderer,scene,controls,floor,grid});
    const materials=Viewer.createBoardMaterials(THREE);materials[2].color.setHex(0xf2f0ed);materials[2].name='T007 light paper fold edge';
    const root=new THREE.Group();root.name='T007 Opposite Tuck Master';root.rotation.x=Math.PI;scene.add(root);const pieces=new Map();
    contract.panels.forEach(def=>{const made=geometryFor(def),mesh=new THREE.Mesh(made.geometry,materials);mesh.name=def.id;mesh.castShadow=true;mesh.receiveShadow=true;mesh.position.set(made.cx-center.x,center.y-made.cy,0);pieces.set(def.id,{mesh,flatCenter:mesh.position.clone(),cx:made.cx,cy:made.cy});});

    const front=pieces.get('front');if(!front)throw new Error('T007 3D front panel is unavailable.');
    const glue=pieces.get('glue');
    if(contract.tearOff.outer.length>2){
      const scaled=(points,factor)=>{
        const center=points.reduce((sum,p)=>({x:sum.x+p.x,y:sum.y+p.y}),{x:0,y:0});
        center.x/=points.length;center.y/=points.length;
        return points.map(p=>({x:center.x+(p.x-center.x)*factor,y:center.y+(p.y-center.y)*factor}));
      };
      const shapeOf=(points,holes)=>{
        const shape=new THREE.Shape();
        points.forEach((p,index)=>index
          ?shape.lineTo(p.x-front.cx,front.cy-p.y)
          :shape.moveTo(p.x-front.cx,front.cy-p.y));
        shape.closePath();
        (holes||[]).forEach(points=>{
          const hole=new THREE.Path();
          points.forEach((p,index)=>index
            ?hole.lineTo(p.x-front.cx,front.cy-p.y)
            :hole.moveTo(p.x-front.cx,front.cy-p.y));
          hole.closePath();
          shape.holes.push(hole);
        });
        return shape;
      };
      const meshOf=(name,shape,pieceThickness,positionZ)=>{
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:pieceThickness,bevelEnabled:false,curveSegments:48});
        geometry.translate(0,0,-pieceThickness/2);
        Viewer.assignBoardFaceMaterials(geometry,pieceThickness,'interior');
        geometry.computeVertexNormals();
        const mesh=new THREE.Mesh(geometry,materials);
        mesh.name=name;mesh.position.z=positionZ;mesh.castShadow=true;mesh.receiveShadow=true;
        front.mesh.add(mesh);
      };
      const backingThickness=thickness*.28;
      const insertThickness=thickness*.58;
      const insertZ=(thickness-insertThickness)/2-.055;
      const outerInset=scaled(contract.tearOff.outer,.994);
      const fingerBoundary=contract.tearOff.finger.length>2?scaled(contract.tearOff.finger,.994):[];
      meshOf('T007 tear-off groove backing',shapeOf(contract.tearOff.outer),backingThickness,(thickness-backingThickness)/2-.14);
      meshOf('T007 tear-off panel',shapeOf(outerInset),insertThickness,insertZ);
      if(fingerBoundary.length){
        const groovePoints=scaled(fingerBoundary,.985).map(p=>new THREE.Vector3(
          p.x-front.cx,
          front.cy-p.y,
          insertZ-insertThickness/2-.01
        ));
        const grooveCurve=new THREE.CatmullRomCurve3(groovePoints,true,'centripetal');
        const grooveGeometry=new THREE.TubeGeometry(grooveCurve,Math.max(48,groovePoints.length*2),.11,6,true);
        const grooveMaterial=new THREE.MeshLambertMaterial({color:0xc5c1bb,side:THREE.DoubleSide});
        const groove=new THREE.Mesh(grooveGeometry,grooveMaterial);
        groove.name='T007 finger shallow border groove';
        groove.castShadow=true;groove.receiveShadow=true;
        front.mesh.add(groove);
      }
    }
    const sheet=new THREE.Group();root.add(sheet);sheet.add(front.mesh);
    const frames=new Map([['front',sheet]]),hinges=[];
    contract.folds.forEach(relation=>{const parent=frames.get(relation.parentId),piece=pieces.get(relation.childId);if(!parent||!piece)throw new Error('T007 3D fold hierarchy failed at '+relation.id);const a=point(relation.axis.a),b=point(relation.axis.b),hinge=new THREE.Group();hinge.name=relation.id;hinge.position.copy(a);parent.add(hinge);const frame=new THREE.Group();frame.position.copy(a).multiplyScalar(-1);hinge.add(frame);frame.add(piece.mesh);frames.set(relation.childId,frame);const axis=b.clone().sub(a).normalize(),radial=piece.flatCenter.clone().sub(a),sign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;hinges.push({object:hinge,axis,radians:THREE.MathUtils.degToRad(relation.angle)*sign,range:relation.phase,id:relation.id});});
    function pose(value){
      const progress=clamp(value,0,1);
      hinges.forEach(hinge=>{
        const angle=hinge.radians*phase(progress,hinge.range);
        hinge.object.quaternion.setFromAxisAngle(hinge.axis,angle);
      });

      if(glue){
        const seamSeating=phase(progress,[.16,.26]);
        glue.mesh.position.z=glue.flatCenter.z+thickness*.9*seamSeating;
      }

      root.position.z=0;
      root.updateMatrixWorld(true);
      const modelBounds=new THREE.Box3().setFromObject(root);
      if(!modelBounds.isEmpty())root.position.z=grid.position.z+thickness/2-modelBounds.min.z;

      modal.querySelector('.assembly-fill').style.width=Math.round(progress*100)+'%';
      modal.querySelector('.m001-3d-controls').style.setProperty('--progress',Math.round(progress*100)+'%');
      const active=progress<.14?0:progress<.36?1:progress<.74?2:progress<.99?3:4;
      modal.querySelectorAll('.assembly-labels span').forEach((node,index)=>node.classList.toggle('active',index<=active));
    }
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}function view(type){Viewer.fitObject(root,camera,controls,type);}
    const slider=modal.querySelector('input');slider.oninput=()=>pose(Number(slider.value)/100);slider.onchange=()=>view('iso');modal.querySelectorAll('[data-view]').forEach(button=>{button.onclick=()=>view(button.dataset.view);});modal.querySelector('[data-close]').onclick=()=>modal.classList.remove('open');
    let shadows=true;const shadowButton=modal.querySelector('[data-shadow]');shadowButton.setAttribute('aria-pressed','true');shadowButton.onclick=event=>{shadows=!shadows;renderer.shadowMap.enabled=shadows;sun.castShadow=shadows;floor.visible=shadows;sun.shadow.needsUpdate=true;event.currentTarget.setAttribute('aria-pressed',String(shadows));event.currentTarget.textContent=shadows?'Shadows On':'Shadows Off';};
    modal.querySelector('[data-download]').onclick=()=>renderer.domElement.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='T007_3D_'+slider.value+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);});
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();pose(0);view('iso');let live=true,frameId=0;(function animate(){if(!live)return;frameId=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);})();
    return {contract,signature:[C.W,C.D,C.H,contract.options.tearOffEnabled?1:0,contract.options.liftTabsEnabled?1:0].join(':'),open(state){modal.classList.add('open');const target=contract.states[state]??Number(slider.value)/100;slider.value=String(Math.round(target*100));pose(target);resize();view('iso');},setState(state){const target=contract.states[state]??0;slider.value=String(Math.round(target*100));pose(target);view('iso');},destroy(){live=false;cancelAnimationFrame(frameId);observer.disconnect();if(controls.dispose)controls.dispose();renderer.dispose();modal.remove();}};
  }
  let master=null;
  function open(state,input){const cfg=input||(typeof global.getCfgT007==='function'?global.getCfgT007():{W:110,D:80,H:225,tearOffEnabled:true,liftTabsEnabled:true}),signature=[cfg.W,cfg.D,cfg.H,cfg.tearOffEnabled!==false?1:0,cfg.liftTabsEnabled!==false?1:0].join(':');if(!master||master.signature!==signature){if(master)master.destroy();master=createMaster(cfg);}master.open(state||'flat');return master;}
  global.T007_3D_BUILD_CONTRACT=buildContract;global.T007_3D_MASTER=Object.freeze({buildContract,create:createMaster,open});
  function attachTrigger(){const toolbar=document.querySelector('.toolbar')||document.body;if(document.getElementById('t007-3d-btn'))return;const button=document.createElement('button');button.id='t007-3d-btn';button.type='button';button.style.display='none';button.onclick=()=>open('flat');toolbar.appendChild(button);}
  if(typeof document!=='undefined'&&typeof document.querySelector==='function'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();
  }
})(window);
