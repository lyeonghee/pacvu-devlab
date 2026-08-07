(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE || !global.GA001_getLayout) return;

  const U = 25.4 / 72;
  const PAPER = 0.18;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (v) => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  const phase = (v, a, b) => smooth((v - a) / (b - a));

  function pacvuBrand(panel) {
    if (!panel) return null;
    const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=320;
    const context=canvas.getContext('2d'); context.clearRect(0,0,canvas.width,canvas.height);
    context.fillStyle='rgb(72,67,62)'; context.textAlign='center'; context.textBaseline='middle';
    context.font='700 260px Arial, sans-serif'; context.fillText('PacVu',512,105);
    context.font='500 42px Arial, sans-serif'; context.letterSpacing='2px'; context.fillText('Packaging + View + Use',512,262);
    const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; texture.minFilter=THREE.LinearFilter; texture.generateMipmaps=false;
    panel.geometry.computeBoundingBox(); const bounds=panel.geometry.boundingBox,size=new THREE.Vector3(); bounds.getSize(size);
    const width=size.x*.44,height=width*(canvas.height/canvas.width);
    const brand=new THREE.Mesh(new THREE.PlaneGeometry(width,height),global.PacVu3DViewer.createOverlayMaterial(THREE,{map:texture,transparent:true,opacity:.46,depthWrite:false,side:THREE.FrontSide,toneMapped:false}));
    brand.name='PacVu front branding'; brand.position.set((bounds.min.x+bounds.max.x)/2,(bounds.min.y+bounds.max.y)/2,-PAPER/2-.012);
    brand.rotation.y=Math.PI; brand.renderOrder=1000; brand.castShadow=false; brand.receiveShadow=false; brand.userData.pacvuBrand=true;
    panel.add(brand); return brand;
  }

  function cfg() {
    const c = typeof getCfgGA001 === 'function'
      ? getCfgGA001()
      : (global.getCfgGA001 ? global.getCfgGA001() : {});
    return { W: +c.W || 241, D: +c.D || 127, H: +c.H || 127 };
  }

  function pointsFromPath(d, samples) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const len = path.getTotalLength();
    const pts = [];
    const n = samples || Math.max(90, Math.ceil(len / 7));
    for (let i = 0; i < n; i++) {
      const p = path.getPointAtLength(len * i / n);
      pts.push({ x: p.x, y: p.y });
    }
    svg.remove();
    return pts;
  }

  function appendSmoothOutline(shape, points) {
    const count = points.length;
    const hardCorner = points.map((point, index) => {
      if (index === 0 || index === count - 1) return true;
      const previous = points[index - 1];
      const next = points[index + 1];
      const ax = point.x - previous.x;
      const ay = point.y - previous.y;
      const bx = next.x - point.x;
      const by = next.y - point.y;
      const aLength = Math.hypot(ax, ay);
      const bLength = Math.hypot(bx, by);
      if (!aLength || !bLength) return true;
      const cosine = clamp((ax * bx + ay * by) / (aLength * bLength), -1, 1);
      return Math.acos(cosine) > Math.PI * 0.15;
    });

    shape.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < count; index += 1) {
      const point = points[index];
      if (hardCorner[index] || index === count - 1) {
        shape.lineTo(point.x, point.y);
        continue;
      }
      const next = points[index + 1];
      shape.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
    }
    shape.closePath();
  }

  function polygonArea(polygon) {
    let area = 0;
    for (let i = 0; i < polygon.length; i += 1) {
      const a = polygon[i];
      const b = polygon[(i + 1) % polygon.length];
      area += (a.x * b.y - b.x * a.y);
    }
    return area / 2;
  }

  function quadCurveSamples(start, control, end, segments) {
    const sampled = [];
    for (let index = 1; index < segments; index += 1) {
      const t = index / segments;
      const u = 1 - t;
      sampled.push({
        x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
        y: u * u * start.y + 2 * u * t * control.y + t * t * end.y
      });
    }
    return sampled;
  }

  function restoreVReliefArcs(name, polygon, grid) {
    const source = polygon.map(point => ({ x: point.x, y: point.y }));
    const reliefPanels = new Set([
      'gableA', 'gableB', 'roofBack', 'roofFront',
      'bottomA', 'bottomB', 'bottomBack', 'bottomFront'
    ]);
    if (!reliefPanels.has(name) || polygon.length < 3) return polygon;

    const junctions = [grid.xBackR, grid.xSideL, grid.xFrontR].flatMap(x => ([
      { x, y: grid.yBodyTop },
      { x, y: grid.yBodyBottom }
    ]));
    // Keep the relief renderer available, but do not carve the six shared
    // body junctions. These vertices already meet exactly in layout.panels;
    // rounding them per panel exposes a triangular hole after extrusion.
    const disabledReliefJunctions = junctions;
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const signedArea = polygonArea(source);
    const clockwise = signedArea < 0;
    const normalize = (vector) => {
      const length = Math.hypot(vector.x, vector.y);
      if (!length) return { x: 0, y: 0 };
      return { x: vector.x / length, y: vector.y / length };
    };

    const targetIndices = new Set();
    junctions.forEach((junction) => {
      if (disabledReliefJunctions.some(point => (
        Math.abs(point.x - junction.x) < 1e-6 &&
        Math.abs(point.y - junction.y) < 1e-6
      ))) return;
      let bestIndex = -1;
      let bestDistance = Infinity;
      source.forEach((point, index) => {
        const d = distance(point, junction);
        if (d < bestDistance) {
          bestDistance = d;
          bestIndex = index;
        }
      });
      if (bestDistance <= 22) targetIndices.add(bestIndex);
    });

    const inwards = source.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
    inwards.x /= source.length;
    inwards.y /= source.length;

    const result = [];
    const reliefRadius = 6.0;
    const skip = new Set();
    const rounded = new Map();

    source.forEach((corner, index) => {
      if (!targetIndices.has(index)) return;

      const previousIndex = (index - 1 + source.length) % source.length;
      const previousPreviousIndex = (index - 2 + source.length) % source.length;
      const nextIndex = (index + 1) % source.length;
      const nextNextIndex = (index + 2) % source.length;
      let previous = source[previousIndex];
      let next = source[nextIndex];

      const edgePrev = distance(corner, previous);
      const edgeNext = distance(corner, next);

      if (edgePrev < 5 && source[previousPreviousIndex]) {
        skip.add(previousIndex);
        previous = source[previousPreviousIndex];
      }
      if (edgeNext < 5 && source[nextNextIndex]) {
        skip.add(nextIndex);
        next = source[nextNextIndex];
      }

      const trimTowards = (from, to, ratio) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const t = clamp(Math.min(1, ratio), 0, 1);
        return {
          x: from.x + dx * t,
          y: from.y + dy * t
        };
      };

      const arcStart = trimTowards(corner, previous, Math.min(0.8, reliefRadius / (distance(corner, previous) || 1)));
      const arcEnd = trimTowards(corner, next, Math.min(0.8, reliefRadius / (distance(corner, next) || 1)));

      const edgeA = { x: corner.x - previous.x, y: corner.y - previous.y };
      const edgeB = { x: next.x - corner.x, y: next.y - corner.y };
      const normalA = clockwise
        ? { x: edgeA.y, y: -edgeA.x }
        : { x: -edgeA.y, y: edgeA.x };
      const normalB = clockwise
        ? { x: edgeB.y, y: -edgeB.x }
        : { x: -edgeB.y, y: edgeB.x };
      let inward = normalize({ x: normalA.x + normalB.x, y: normalA.y + normalB.y });
      if (!inward.x && !inward.y) {
        inward = normalize({ x: inwards.x - corner.x, y: inwards.y - corner.y });
      }
      const checkMid = {
        x: (arcStart.x + arcEnd.x) * 0.5,
        y: (arcStart.y + arcEnd.y) * 0.5
      };
      const probe = {
        x: checkMid.x + inward.x,
        y: checkMid.y + inward.y
      };
      const probeOutside = {
        x: checkMid.x - inward.x,
        y: checkMid.y - inward.y
      };
      if (distance(probeOutside, { x: inwards.x, y: inwards.y }) < distance(probe, { x: inwards.x, y: inwards.y })) {
        inward = { x: -inward.x, y: -inward.y };
      }

      const span = distance(arcStart, arcEnd);
      const reliefDepth = Math.min(
        Math.max(2.5, span * 0.45),
        Math.max(3.2, Math.min(edgePrev, edgeNext) * 0.65)
      );

      const control = {
        x: (arcStart.x + arcEnd.x) / 2 + inward.x * reliefDepth,
        y: (arcStart.y + arcEnd.y) / 2 + inward.y * reliefDepth
      };

      rounded.set(index, [
        arcStart,
        ...quadCurveSamples(arcStart, control, arcEnd, 22),
        arcEnd
      ]);
    });

    for (let index = 0; index < source.length; index += 1) {
      if (skip.has(index)) continue;
      const arc = rounded.get(index);
      if (arc) result.push(...arc);
      else result.push(source[index]);
    }
    return result;
  }

  function geometry(poly, holes, smoothOutline) {
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    poly.forEach(p=>{minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);});
    const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
    const shape = new THREE.Shape();
    const localPoly = poly.map(p => ({ x: (p.x-cx)*U, y: (cy-p.y)*U }));
    if (smoothOutline) appendSmoothOutline(shape, localPoly);
    else {
      localPoly.forEach((p,i)=>(i ? shape.lineTo(p.x,p.y) : shape.moveTo(p.x,p.y)));
      shape.closePath();
    }
    (holes||[]).forEach(h => {
      const hp = new THREE.Path();
      h.forEach((p,i)=>(i
        ? hp.lineTo((p.x-cx)*U,(cy-p.y)*U)
        : hp.moveTo((p.x-cx)*U,(cy-p.y)*U)));
      hp.closePath(); shape.holes.push(hp);
    });
    const g = new THREE.ExtrudeGeometry(shape,{depth:PAPER,bevelEnabled:false,curveSegments:smoothOutline?28:10});
    g.translate(0,0,-PAPER/2);
    global.PacVu3DViewer.assignBoardFaceMaterials(g,PAPER,'interior');
    g.computeVertexNormals();
    return { g, cx, cy };
  }

  function basisQuat(x,y) {
    const z = new THREE.Vector3().crossVectors(x,y).normalize();
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  }

  function init3D() {
    const C=cfg();
    const signature=[C.W,C.D,C.H].join(':');
    const layout=global.GA001_getLayout(C);
    const g=layout.grid, b=layout.bounds;
    const holes=layout.holePaths.map(d=>pointsFromPath(d,240));
    const center={x:b.minX+b.width/2,y:b.minY+b.height/2};
    const pieces=[];

    const viewer=global.PacVu3DViewer.createModal({id:'ga0013dModal',badge:'GA001 · Gable Lock Box'});
    const modal=viewer.modal;
    const stage=viewer.stage;
    const scene=new THREE.Scene(); scene.background=new THREE.Color(global.PacVu3DTheme.colors.background);
    const camera=global.PacVu3DViewer.createPerspectiveCamera(THREE,C);
    const renderer=global.PacVu3DViewer.createRenderer(THREE);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace;
    stage.prepend(renderer.domElement);
    const controls=new global.PacVuOrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;
    controls.dampingFactor=.075;
    controls.enableRotate=true;
    controls.rotateSpeed=.45;
    controls.enablePan=true;
    controls.panSpeed=.65;
    controls.screenSpacePanning=true;
    controls.enableZoom=true;
    controls.zoomSpeed=.75;
    controls.minDistance=Math.max(C.W,C.D,C.H)*.35;
    controls.maxDistance=Math.max(C.W,C.D,C.H)*8;
    controls.minPolarAngle=.03;
    controls.maxPolarAngle=Math.PI-.03;
    controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE=THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;
    if(controls.touches){
      controls.touches.ONE=THREE.TOUCH.ROTATE;
      controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
    }
    scene.add(new THREE.HemisphereLight(global.PacVu3DTheme.hemisphereLight.skyColor,global.PacVu3DTheme.hemisphereLight.groundColor,global.PacVu3DTheme.hemisphereLight.intensity));
    const sun=new THREE.DirectionalLight(global.PacVu3DTheme.directionalLight.color,global.PacVu3DTheme.directionalLight.intensity); sun.position.fromArray(global.PacVu3DTheme.directionalLight.position); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-650;sun.shadow.camera.right=650;
    sun.shadow.camera.top=650;sun.shadow.camera.bottom=-650;
    sun.shadow.camera.near=1;sun.shadow.camera.far=1600;
    sun.shadow.bias=-.00035;sun.shadow.normalBias=1.5;
    scene.add(sun);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.ShadowMaterial({color:0x3f3933,opacity:.38}));
    floor.receiveShadow=true; floor.position.z=-2; scene.add(floor);
    const grid=new THREE.GridHelper(global.PacVu3DTheme.grid.size,global.PacVu3DTheme.grid.divisions,global.PacVu3DTheme.grid.centerColor,global.PacVu3DTheme.grid.lineColor); grid.rotation.x=Math.PI/2; grid.position.z=global.PacVu3DTheme.grid.z; scene.add(grid);
    global.PacVu3DViewer.standardizeEnvironment({renderer,scene,controls,floor,grid});
    const mats=global.PacVu3DViewer.createBoardMaterials(THREE);
    mats[2]=mats[2].clone();
    mats[2].color.copy(mats[0].color);
    mats[2].name='GA001 seamless white paper edge';
    const root=new THREE.Group(); scene.add(root);
    const pieceByName=new Map(), hinges=[];

    function add(name,holeIds){
      const sourcePoly=layout.panels[name]; if(!sourcePoly||sourcePoly.length<3)return;
      const poly=sourcePoly;
      const hs=(holeIds||[]).map(i=>holes[i]);
      const made=geometry(poly,hs,name==='handleBack'||name==='handleFront');
      const mesh=new THREE.Mesh(made.g,mats); mesh.castShadow=true; mesh.receiveShadow=true; mesh.name=name;
      mesh.position.set((made.cx-center.x)*U,(center.y-made.cy)*U,0);
      pieceByName.set(name,{mesh,flatCenter:mesh.position.clone()});
      return mesh;
    }

    const backSplit=layout.foldLines[10].y1, frontSplit=layout.foldLines[13].y1;
    const V=(x,y,z)=>new THREE.Vector3(x,y,z), X=V(1,0,0);
    const W=C.W,D=C.D,H=C.H;
    add('glue',[]);
    add('back',[]);
    add('sideA',[]);
    const front=add('front',[]);
    pacvuBrand(front);
    add('sideB',[]);

    // Lock the four bottom flaps before raising the gable shoulders.
    // A slight stacking height preserves their physical overlap order.
    add('bottomA',[]);
    add('bottomB',[]);
    add('bottomBack',[]);
    add('bottomFront',[]);

    add('gableA',[1]);
    add('gableB',[2]);

    // The lower top sections fold horizontally to the centre; the handle
    // sections then stand back-to-back and lock through the slots.
    add('roofBack',[]);
    add('roofFront',[]);
    add('handleBack',[0]);
    add('handleFront',[3]);

    const point=(x,y,z=0)=>V((x-center.x)*U,(center.y-y)*U,z);
    const sheet=new THREE.Group();
    const standPivot=point(g.xBackL,g.yBodyBottom);
    const standHinge=new THREE.Group();standHinge.position.copy(standPivot);root.add(standHinge);
    sheet.position.copy(standPivot).multiplyScalar(-1);standHinge.add(sheet);
    sheet.add(pieceByName.get('back').mesh);
    hinges.push({object:standHinge,axis:X,angle:Math.PI/2,start:.44,end:.54});

    function attach(parentFrame,name,a,b,start,end,angle=Math.PI/2){
      const piece=pieceByName.get(name),p=point(a.x,a.y),q=point(b.x,b.y),hinge=new THREE.Group();
      hinge.position.copy(p);parentFrame.add(hinge);
      const frame=new THREE.Group();frame.position.copy(p).multiplyScalar(-1);hinge.add(frame);frame.add(piece.mesh);
      const axis=q.clone().sub(p).normalize(),radial=piece.flatCenter.clone().sub(p);
      const sign=new THREE.Vector3().crossVectors(axis,radial).z>=0?1:-1;
      hinges.push({object:hinge,axis,angle:angle*sign,start,end});
      return frame;
    }

    // Every panel remains a child of the panel sharing its fold line.
    attach(sheet,'glue',{x:g.xBackL,y:g.yBodyTop},{x:g.xBackL,y:g.yBodyBottom},.02,.12);
    const sideAFrame=attach(sheet,'sideA',{x:g.xBackR,y:g.yBodyTop},{x:g.xBackR,y:g.yBodyBottom},.12,.22);
    const frontFrame=attach(sideAFrame,'front',{x:g.xSideL,y:g.yBodyTop},{x:g.xSideL,y:g.yBodyBottom},.20,.30);
    const sideBFrame=attach(frontFrame,'sideB',{x:g.xFrontR,y:g.yBodyTop},{x:g.xFrontR,y:g.yBodyBottom},.28,.38);

    attach(sideAFrame,'bottomA',{x:g.xBackR,y:g.yBodyBottom},{x:g.xSideL,y:g.yBodyBottom},.54,.62);
    attach(sideBFrame,'bottomB',{x:g.xFrontR,y:g.yBodyBottom},{x:g.xSideR,y:g.yBodyBottom},.54,.62);
    attach(sheet,'bottomBack',{x:g.xBackL,y:g.yBodyBottom},{x:g.xBackR,y:g.yBodyBottom},.60,.68);
    attach(frontFrame,'bottomFront',{x:g.xSideL,y:g.yBodyBottom},{x:g.xFrontR,y:g.yBodyBottom},.64,.72);
    // Top closure order: bend the two neck folds, stand both handles, then
    // insert the left/right slot panels into the handle-side locks last.
    const roofBackFrame=attach(sheet,'roofBack',{x:g.xBackL,y:g.yBodyTop},{x:g.xBackR,y:g.yBodyTop},.80,.88);
    const roofFrontFrame=attach(frontFrame,'roofFront',{x:g.xSideL,y:g.yBodyTop},{x:g.xFrontR,y:g.yBodyTop},.80,.88);
    attach(roofBackFrame,'handleBack',{x:g.xBackL,y:backSplit},{x:g.xBackR,y:backSplit},.87,.94,-Math.PI/2);
    attach(roofFrontFrame,'handleFront',{x:g.xSideL,y:frontSplit},{x:g.xFrontR,y:frontSplit},.87,.94,-Math.PI/2);
    // The slot panels remain extensions of the side walls. They only flex
    // slightly inward at the very end to engage the locks beside the upright
    // handles; they must never fold 90° across and cover the handles.
    attach(sideAFrame,'gableA',{x:g.xBackR,y:g.yBodyTop},{x:g.xSideL,y:g.yBodyTop},.955,.995,THREE.MathUtils.degToRad(35));
    attach(sideBFrame,'gableB',{x:g.xFrontR,y:g.yBodyTop},{x:g.xSideR,y:g.yBodyTop},.955,.995,THREE.MathUtils.degToRad(35));

    function pose(v){
      modal.querySelector('.m001-3d-controls')?.style.setProperty('--progress',`${Math.round(v*100)}%`);
      hinges.forEach(h=>{const t=phase(v,h.start,h.end);h.object.quaternion.setFromAxisAngle(h.axis,h.angle*t);});
      // Glue-box assembly rule: after the glued body is formed, lift the
      // entire connected sheet, close the bottom in the air, then lower the
      // box onto the floor before folding its top and handle sections.
      const liftHeight=Math.max(D,H)*.9;
      const lifted=phase(v,.38,.46);
      const lowered=phase(v,.72,.80);
      root.position.z=liftHeight*lifted*(1-lowered);
    }
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    function view(type){global.PacVu3DViewer.fitObject(root,camera,controls,type);}
    const slider=modal.querySelector('input'); slider.oninput=()=>{pose(+slider.value/100);const step=+slider.value<34?0:+slider.value<90?1:2;modal.querySelectorAll('.assembly-track span,.assembly-labels span').forEach((node,index)=>node.classList.toggle('active',index%3<=step));};slider.onchange=()=>view('iso');
    modal.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>view(x.dataset.view));
    modal.querySelector('[data-close]').onclick=()=>modal.classList.remove('open');
    let shadowOn=true;
    modal.querySelector('[data-shadow]').onclick=event=>{shadowOn=!shadowOn;floor.visible=shadowOn;sun.castShadow=shadowOn;event.currentTarget.textContent=shadowOn?'Shadows On':'Shadows Off';};
    const downloadBox=()=>{
      const hidden=[],brands=[],background=scene.background,clearColor=renderer.getClearColor(new THREE.Color()).clone(),clearAlpha=renderer.getClearAlpha();
      scene.traverse(object=>{if(object.userData?.pacvuBrand){brands.push([object.material,object.material.opacity]);object.material.opacity=.78;}if(object===floor||object.isGridHelper||object.type==='GridHelper'||object.material?.isShadowMaterial){hidden.push([object,object.visible]);object.visible=false;}});
      scene.background=null;renderer.setClearColor(0x000000,0);renderer.render(scene,camera);
      renderer.domElement.toBlob(blob=>{hidden.forEach(([object,visible])=>{object.visible=visible;});brands.forEach(([material,opacity])=>{material.opacity=opacity;});scene.background=background;renderer.setClearColor(clearColor,clearAlpha);renderer.render(scene,camera);if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`GA001_3D_${Math.round(Number(slider.value))}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);},'image/png');
    };
    modal.querySelector('[data-download]').onclick=downloadBox;
    const ro=new ResizeObserver(resize);ro.observe(stage); resize();view('iso');pose(0);
    let live=true,raf=0;
    (function loop(){
      if(!live)return;
      raf=requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene,camera);
    })();
    return {
      signature,
      open(){modal.classList.add('open');resize();view('iso');},
      destroy(){
        live=false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        if(controls.dispose)controls.dispose();
        root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.userData?.pacvuBrand){o.material?.map?.dispose();o.material?.dispose();}});
        mats.forEach(m=>m.dispose());
        floor.geometry.dispose();floor.material.dispose();
        grid.geometry.dispose();
        if(Array.isArray(grid.material))grid.material.forEach(m=>m.dispose());
        else grid.material.dispose();
        renderer.dispose();
        modal.remove();
      }
    };
  }

  let app;
  function attach(){
    const bar=document.querySelector('.toolbar')||document.querySelector('header')||document.body;
    if(document.getElementById('ga001-3d-btn'))return;
    const btn=document.createElement('button');btn.id='ga001-3d-btn';btn.textContent='3D MOCKUP';btn.style.display='none';bar.appendChild(btn);
    btn.onclick=()=>{
      const c=cfg(),signature=[c.W,c.D,c.H].join(':');
      if(!app||app.signature!==signature){
        if(app)app.destroy();
        app=init3D();
      }
      app.open();
    };
    function active(){
      const ok=typeof selectedBoxMeta!=='undefined'&&selectedBoxMeta&&selectedBoxMeta.engineKey==='gable1';
      btn.style.display=ok?'':'none';
    }
    active();setInterval(active,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
})(window);
