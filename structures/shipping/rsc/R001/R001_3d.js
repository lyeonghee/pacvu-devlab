(function (global) {
  'use strict';

  if (!global.R001_getLayout) return;

  const EPS = 0.001;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = value => { const v = clamp(value, 0, 1); return v * v * (3 - 2 * v); };
  const phase = (value, range) => smooth((value - range[0]) / (range[1] - range[0]));

  function clipEdge(points, inside, intersect) {
    const result = [];
    if (!points.length) return result;
    let previous = points[points.length - 1];
    let previousInside = inside(previous);
    points.forEach(current => {
      const currentInside = inside(current);
      if (currentInside !== previousInside) result.push(intersect(previous, current));
      if (currentInside) result.push(current);
      previous = current;
      previousInside = currentInside;
    });
    return result;
  }

  function clipPolygon(points, bounds) {
    const atX = (a, b, x) => ({ x, y: a.y + (b.y - a.y) * (Math.abs(b.x - a.x) < 1e-9 ? 0 : (x - a.x) / (b.x - a.x)) });
    const atY = (a, b, y) => ({ x: a.x + (b.x - a.x) * (Math.abs(b.y - a.y) < 1e-9 ? 0 : (y - a.y) / (b.y - a.y)), y });
    let result = points.slice();
    result = clipEdge(result, p => p.x >= bounds.minX - EPS, (a, b) => atX(a, b, bounds.minX));
    result = clipEdge(result, p => p.x <= bounds.maxX + EPS, (a, b) => atX(a, b, bounds.maxX));
    result = clipEdge(result, p => p.y >= bounds.minY - EPS, (a, b) => atY(a, b, bounds.minY));
    return clipEdge(result, p => p.y <= bounds.maxY + EPS, (a, b) => atY(a, b, bounds.maxY));
  }

  function flattenPath(pathD) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    const length = path.getTotalLength();
    const count = Math.max(80, Math.ceil(length / 1.5));
    const points = [];
    for (let index = 0; index < count; index += 1) {
      const point = path.getPointAtLength(length * index / count);
      const previous = points[points.length - 1];
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > EPS) points.push({ x: point.x, y: point.y });
    }
    return points;
  }

  function buildContract(input) {
    const W = Number(input && input.W) || 285;
    const D = Number(input && input.D) || 170;
    const H = Number(input && input.H) || 120;
    const code = input && input.__code || 'R001';
    const layout = input && input.__layout || global.R001_getLayout(W, D, H);
    const s = input && input.__spec || layout.spec;
    const panelHoles = input && input.__panelHoles || {};
    const outline = flattenPath(input && input.__outerPath || layout.outerPath);
    const region = (id, parentId, minX, minY, maxX, maxY) => ({
      id, parentId, polygon: clipPolygon(outline, { minX, minY, maxX, maxY }), holes:panelHoles[id] || []
    });
    const panels = [
      region('glue', 'front', s.xGlueL, s.yFoldTop_arc, s.xFrontL, s.yFoldBot_arc),
      region('front', null, s.xFrontL, s.yFoldTop, s.xFrontR, s.yFoldBot),
      region('sideL', 'front', s.xFrontR, s.yFoldTop_arc, s.xSideLR, s.yFoldBot_arc),
      region('back', 'sideL', s.xSideLR, s.yFoldTop, s.xBackR, s.yFoldBot),
      region('sideR', 'back', s.xBackR, s.yFoldTop_arc, s.xSideRR, s.yFoldBot_arc),
      region('topFront', 'front', s.xFrontL, s.yTop, s.xFrontR, s.yFoldTop),
      region('topSideL', 'sideL', s.xFrontR, s.yTop, s.xSideLR, s.yFoldTop_arc),
      region('topBack', 'back', s.xSideLR, s.yTop, s.xBackR, s.yFoldTop),
      region('topSideR', 'sideR', s.xBackR, s.yTop, s.xSideRR, s.yFoldTop_arc),
      region('bottomFront', 'front', s.xFrontL, s.yFoldBot, s.xFrontR, s.yBot),
      region('bottomSideL', 'sideL', s.xFrontR, s.yFoldBot_arc, s.xSideLR, s.yBot),
      region('bottomBack', 'back', s.xSideLR, s.yFoldBot, s.xBackR, s.yBot),
      region('bottomSideR', 'sideR', s.xBackR, s.yFoldBot_arc, s.xSideRR, s.yBot)
    ].filter(panel => panel.polygon.length >= 3);
    const axisV = x => [{ x, y: s.yFoldTop_arc }, { x, y: s.yFoldBot_arc }];
    const axisH = (x1, x2, y) => [{ x: x1, y }, { x: x2, y }];
    const folds = [
      ['body-front-sideL', 'front', 'sideL', ...axisV(s.xFrontR), 90, [0.02, 0.16]],
      ['body-sideL-back', 'sideL', 'back', ...axisV(s.xSideLR), 90, [0.04, 0.18]],
      ['body-back-sideR', 'back', 'sideR', ...axisV(s.xBackR), 90, [0.06, 0.20]],
      ['body-front-glue', 'front', 'glue', ...axisV(s.xFrontL), 90, [0.02, 0.16]],
      ['bottom-sideL', 'sideL', 'bottomSideL', ...axisH(s.xFrontR, s.xSideLR, s.yFoldBot_arc), 90, [0.20, 0.32]],
      ['bottom-sideR', 'sideR', 'bottomSideR', ...axisH(s.xBackR, s.xSideRR, s.yFoldBot_arc), 90, [0.20, 0.32]],
      ['bottom-front', 'front', 'bottomFront', ...axisH(s.xFrontL, s.xFrontR, s.yFoldBot), 90, [0.34, 0.46]],
      ['bottom-back', 'back', 'bottomBack', ...axisH(s.xSideLR, s.xBackR, s.yFoldBot), 90, [0.36, 0.48]],
      ['top-sideL', 'sideL', 'topSideL', ...axisH(s.xFrontR, s.xSideLR, s.yFoldTop_arc), 90, [0.62, 0.74]],
      ['top-sideR', 'sideR', 'topSideR', ...axisH(s.xBackR, s.xSideRR, s.yFoldTop_arc), 90, [0.62, 0.74]],
      ['top-front', 'front', 'topFront', ...axisH(s.xFrontL, s.xFrontR, s.yFoldTop), 90, [0.76, 0.90]],
      ['top-back', 'back', 'topBack', ...axisH(s.xSideLR, s.xBackR, s.yFoldTop), 90, [0.80, 0.94]]
    ].map(item => ({ id:item[0], parentId:item[1], childId:item[2], a:item[3], b:item[4], angle:item[5], range:item[6] }));
    return Object.freeze({ code, dimensions:Object.freeze({ W, D, H }), layout, panels:Object.freeze(panels), folds:Object.freeze(folds) });
  }

  function createMaster(input) {
    const THREE = global.THREE;
    const Viewer = global.PacVu3DViewer;
    if (!THREE || !Viewer || !global.PacVuOrbitControls) throw new Error('R001 3D viewer dependencies are unavailable.');
    const contract = buildContract(input);
    const C = contract.dimensions;
    const bounds = contract.layout.dielineBounds;
    const center = { x:bounds.minX + bounds.width / 2, y:bounds.minY + bounds.height / 2 };
    const thickness = 0.7;
    const point = p => new THREE.Vector3(p.x - center.x, center.y - p.y, 0);

    function geometryFor(definition) {
      const polygon=definition.polygon;
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      polygon.forEach(p => { minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x); minY=Math.min(minY,p.y); maxY=Math.max(maxY,p.y); });
      const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
      const shape=new THREE.Shape();
      polygon.forEach((p,index) => index ? shape.lineTo(p.x-cx,cy-p.y) : shape.moveTo(p.x-cx,cy-p.y));
      shape.closePath();
      (definition.holes || []).forEach(hole => {
        const points=[];
        const radius=Math.min(hole.radius,hole.width/2,hole.height/2);
        const corners=[
          [hole.cx+hole.width/2-radius,hole.cy-hole.height/2+radius,-Math.PI/2,0],
          [hole.cx+hole.width/2-radius,hole.cy+hole.height/2-radius,0,Math.PI/2],
          [hole.cx-hole.width/2+radius,hole.cy+hole.height/2-radius,Math.PI/2,Math.PI],
          [hole.cx-hole.width/2+radius,hole.cy-hole.height/2+radius,Math.PI,Math.PI*1.5]
        ];
        corners.forEach(corner => { for(let step=0;step<=6;step+=1){const angle=corner[2]+(corner[3]-corner[2])*step/6;points.push(new THREE.Vector2(corner[0]+Math.cos(angle)*radius-cx,cy-(corner[1]+Math.sin(angle)*radius)));} });
        const contour=polygon.map(p=>new THREE.Vector2(p.x-cx,cy-p.y));
        if(THREE.ShapeUtils.isClockWise(points)===THREE.ShapeUtils.isClockWise(contour))points.reverse();
        const path=new THREE.Path(); points.forEach((p,index)=>index?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y)); path.closePath(); shape.holes.push(path);
      });
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:8});
      geometry.translate(0,0,-thickness/2);
      Viewer.assignBoardFaceMaterials(geometry,thickness,'interior');
      geometry.computeVertexNormals();
      return { geometry,cx,cy };
    }

    function addBackBrand(mesh) {
      const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=420;
      const context=canvas.getContext('2d'); context.clearRect(0,0,1024,420);
      context.fillStyle='rgb(72,67,62)'; context.textAlign='center'; context.textBaseline='middle';
      context.font='700 220px Pretendard,Arial'; context.fillText('PacVu',512,150);
      context.font='500 44px Pretendard,Arial'; context.fillText('Packaging + View + Use',512,325);
      const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; texture.minFilter=THREE.LinearFilter; texture.generateMipmaps=false;
      mesh.geometry.computeBoundingBox(); const box=mesh.geometry.boundingBox; const size=new THREE.Vector3(); box.getSize(size);
      const width=size.x*.68, height=width*canvas.height/canvas.width;
      const logo=new THREE.Mesh(new THREE.PlaneGeometry(width,height),Viewer.createOverlayMaterial(THREE,{map:texture,transparent:true,opacity:.52,depthWrite:false,side:THREE.FrontSide,toneMapped:false}));
      logo.name='PacVu back panel logo'; logo.position.set((box.min.x+box.max.x)/2,(box.min.y+box.max.y)/2,-thickness/2-.02); logo.rotation.y=Math.PI; logo.renderOrder=1000; logo.userData.pacvuBrand=true; mesh.add(logo);
    }

    const code=contract.code;
    const viewer=Viewer.createModal({id:code.toLowerCase()+'3dModal',badge:code+' · Standard Shipping Box'});
    const {modal,stage,range,controls:controlPanel}=viewer;
    const labels=controlPanel.querySelector('.assembly-labels');
    labels.innerHTML='<span class="active">Flat</span><span>Glue</span><span>Bottom Side</span><span>Bottom Long</span><span>Stand</span><span>Top Side</span><span>Top Long</span>';
    const scene=new THREE.Scene(); scene.background=new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera=Viewer.createPerspectiveCamera(THREE,C); const renderer=Viewer.createRenderer(THREE,{preserveDrawingBuffer:true}); stage.prepend(renderer.domElement);
    const orbit=new global.PacVuOrbitControls(camera,renderer.domElement); orbit.enableDamping=true; orbit.dampingFactor=.075;
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,global.PacVu3DTheme.hemisphereLight.groundColor,global.PacVu3DTheme.hemisphereLight.intensity));
    const sun=new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color,global.PacVu3DTheme.directionalLight.intensity); sun.position.fromArray(global.PacVu3DTheme.directionalLight.position); sun.castShadow=true;
    const shadowExtent=Math.max(C.W,C.D,C.H)*3; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-shadowExtent; sun.shadow.camera.right=shadowExtent; sun.shadow.camera.top=shadowExtent; sun.shadow.camera.bottom=-shadowExtent; sun.shadow.camera.near=.1; sun.shadow.camera.far=shadowExtent*8; sun.shadow.bias=-0.00015; sun.shadow.normalBias=.02; scene.add(sun);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(2200,2200),new THREE.ShadowMaterial({color:0x3f3933,opacity:.34})); floor.receiveShadow=true; floor.position.z=-2; scene.add(floor);
    const grid=new THREE.GridHelper(global.PacVu3DTheme.grid.size,global.PacVu3DTheme.grid.divisions,global.PacVu3DTheme.grid.centerColor,global.PacVu3DTheme.grid.lineColor); grid.rotation.x=Math.PI/2; grid.position.z=global.PacVu3DTheme.grid.z; scene.add(grid);
    Viewer.standardizeEnvironment({renderer,scene,controls:orbit,floor,grid});
    const materials=Viewer.createBoardMaterials(THREE); materials[2].color.setHex(0xf0ede8);
    const root=new THREE.Group(); root.name=code+' Assembly'; scene.add(root);
    const pieces=new Map();
    contract.panels.forEach(definition => { const made=geometryFor(definition); const mesh=new THREE.Mesh(made.geometry,materials); mesh.name=definition.id; mesh.castShadow=true; mesh.receiveShadow=true; mesh.position.set(made.cx-center.x,center.y-made.cy,0); pieces.set(definition.id,{mesh,flatCenter:mesh.position.clone()}); });
    addBackBrand(pieces.get('back').mesh);
    const front=pieces.get('front'); const sheet=new THREE.Group(); root.add(sheet); sheet.add(front.mesh);
    const frames=new Map([['front',sheet]]); const hinges=[];
    contract.folds.forEach(relation => { const parent=frames.get(relation.parentId), piece=pieces.get(relation.childId); if(!parent||!piece) throw new Error('R001 fold hierarchy failed: '+relation.id); const a=point(relation.a),b=point(relation.b); const hinge=new THREE.Group(); hinge.name=relation.id; hinge.position.copy(a); parent.add(hinge); const frame=new THREE.Group(); frame.position.copy(a).multiplyScalar(-1); hinge.add(frame); frame.add(piece.mesh); frames.set(relation.childId,frame); const axis=b.clone().sub(a).normalize(); const radial=piece.flatCenter.clone().sub(a); const sign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1; hinges.push({object:hinge,axis,radians:THREE.MathUtils.degToRad(relation.angle)*sign,range:relation.range}); });
    const standAxis=point({x:contract.layout.spec.xFrontL,y:contract.layout.spec.yFoldBot}); const stand=new THREE.Group(); stand.position.copy(standAxis); root.remove(sheet); root.add(stand); sheet.position.copy(standAxis).multiplyScalar(-1); stand.add(sheet);
    const stageNames=['Flat','Glue','Bottom Side','Bottom Long','Stand','Top Side','Top Long'];
    function pose(value) { const progress=clamp(value,0,1); hinges.forEach(h => h.object.quaternion.setFromAxisAngle(h.axis,h.radians*phase(progress,h.range))); stand.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2*phase(progress,[.50,.60])); const step=progress<.02?0:progress<.20?1:progress<.34?2:progress<.50?3:progress<.62?4:progress<.76?5:6; Viewer.syncProgress(viewer,progress*100,'Assembly · '+stageNames[step]); labels.querySelectorAll('span').forEach((node,index)=>node.classList.toggle('active',index<=step)); }
    function resize(){const width=stage.clientWidth,height=stage.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
    function view(type){Viewer.fitObject(root,camera,orbit,type||'iso');}
    range.oninput=()=>pose(Number(range.value)/100); range.onchange=()=>view('iso');
    modal.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>view(button.dataset.view)); modal.querySelector('[data-close]').onclick=()=>modal.classList.remove('open');
    let shadows=true; modal.querySelector('[data-shadow]').onclick=event=>{shadows=!shadows;floor.visible=shadows;sun.castShadow=shadows;event.currentTarget.textContent=shadows?'Shadows On':'Shadows Off';};
    modal.querySelector('[data-download]').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=code+'_3D_'+range.value+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);},'image/png');};
    const observer=new ResizeObserver(resize); observer.observe(stage); resize(); pose(0); view('iso'); let live=true;
    (function animate(){if(!live)return;requestAnimationFrame(animate);orbit.update();renderer.render(scene,camera);})();
    return {signature:[C.W,C.D,C.H].join(':'),open(){modal.classList.add('open');resize();view('iso');},destroy(){live=false;observer.disconnect();orbit.dispose?.();renderer.dispose();modal.remove();}};
  }

  let master=null;
  function open(input){const cfg=input||(typeof global.getCfgR001==='function'?global.getCfgR001():{W:285,D:170,H:120});const signature=[cfg.W,cfg.D,cfg.H].join(':');if(!master||master.signature!==signature){master?.destroy();master=createMaster(cfg);}master.open();return master;}
  global.R001_3D_MASTER=Object.freeze({buildContract,create:createMaster,open});
  function attachTrigger(){const toolbar=document.querySelector('.toolbar')||document.body;if(document.getElementById('r001-3d-btn'))return;const button=document.createElement('button');button.id='r001-3d-btn';button.type='button';button.textContent='3D MOCKUP';button.style.display='none';button.onclick=()=>open();toolbar.appendChild(button);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();
})(window);
