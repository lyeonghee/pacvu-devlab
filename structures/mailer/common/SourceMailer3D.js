/* Shared viewer binding for source-defined mailers. No template IDs or geometry. */
(function(root){
  'use strict';
  function buildModel(api,input){
    const THREE=root.THREE,layout=api.getLayout(input),contract=api.getContract(input);
    const physical=root.PacVuPhysicalPaper3D.createContractGeometry({THREE,ClipperLib:root.ClipperLib,validator:root.PacVu3DContract,contract,thicknessByMaterial:{board:.18}});
    if(!physical.complete){physical.dispose();throw Error('Unresolved source mesh: '+api.id);}
    const model=new THREE.Group(),materials=root.PacVu3DViewer.createBoardMaterials(THREE),frames=new Map(),panels=new Map(),hinges=[];
    for(const p of physical.panels){
      const frame=new THREE.Group(),mesh=new THREE.Mesh(p.geometry,materials),points=p.regions.length===1?p.regions[0].outer:layout.panels.find(v=>v.id===p.id).points;
      // Source Shape metadata lets the existing PhysicalPaper adapter consume
      // the same polygon, without a second template-specific paper engine.
      const shape=new THREE.Shape(points.map(v=>new THREE.Vector2(v.x,-v.y)));
      for(const region of p.regions)for(const ring of region.holes||[])shape.holes.push(new THREE.Path(ring.map(v=>new THREE.Vector2(v.x,-v.y))));
      mesh.geometry.parameters={shapes:shape,options:{curveSegments:12}};
      mesh.name=p.id;mesh.castShadow=true;frame.add(mesh);frames.set(p.id,frame);panels.set(p.id,mesh);
    }
    model.add(frames.get('base'));
    for(const r of layout.relations){
      const a=new THREE.Vector3(r.axis.a.x,-r.axis.a.y,0),b=new THREE.Vector3(r.axis.b.x,-r.axis.b.y,0),axis=b.clone().sub(a).normalize();
      const p=layout.panels.find(p=>p.id===r.child),center=new THREE.Vector3((p.bounds.minX+p.bounds.maxX)/2,-(p.bounds.minY+p.bounds.maxY)/2,0);
      const sign=new THREE.Vector3().crossVectors(axis,center.sub(a)).z>=0?1:-1;
      const object=new THREE.Group();object.position.copy(a);frames.get(r.parent).add(object);
      const frame=frames.get(r.child);frame.position.copy(a).multiplyScalar(-1);object.add(frame);
      hinges.push({object,frame,axis,sign,relation:r,parentMesh:panels.get(r.parent),childMesh:panels.get(r.child),a:r.axis.a,b:r.axis.b});
    }
    function pose(t){
      for(const h of hinges){const [start,end]=h.relation.stage;let v=Math.max(0,Math.min(1,(t-start)/(end-start)));v=v*v*(3-2*v);h.object.quaternion.setFromAxisAngle(h.axis,h.sign*h.relation.angle*Math.PI/180*v);}
      // Optional source-owned stand orientation; no effect on existing mailers.
      if(layout.presentation?.stand){let v=Math.max(0,Math.min(1,(t-.92)/.08));v=v*v*(3-2*v);model.rotation.x=layout.presentation.stand.angle*v;model.position.z=layout.presentation.stand.height*v;}
      model.updateMatrixWorld(true);
    }
    pose(0);
    return {model,layout,contract,physical,panels,hinges,pose,dispose(){physical.dispose();materials.forEach(m=>m.dispose());}};
  }
  function create(api,assemblyOptions={}){
    let viewer,env,current,controls,raf=0;
    function fit(view='iso'){
      controls.fit(view);
      // Leave room for the shared side controls and assembly slider.
      env.camera.position.sub(env.controls.target).multiplyScalar(1.5).add(env.controls.target);
      env.camera.far*=1.5;env.camera.updateProjectionMatrix();env.controls.update();
    }
    function close(){if(!viewer)return;viewer.modal.classList.remove('open');cancelAnimationFrame(raf);}
    function open(input){
      if(!viewer){
        viewer=root.PacVu3DViewer.createModal({id:api.id.toLowerCase()+'3dModal',badge:api.spec.name});
        viewer.modal.querySelector('[data-close]').onclick=close;
        viewer.modal.addEventListener('click',e=>{if(e.target===viewer.modal)close();});
        viewer.range.addEventListener('input',()=>{const t=Number(viewer.range.value)/100;current.pose(t);controls.update(t);root.PacVu3DViewer.syncProgress(viewer,t*100);});
        viewer.modal.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>fit(b.dataset.view));
        viewer.modal.querySelector('[data-download]').onclick=()=>root.PacVu3DViewer.downloadPNG({...env,filename:api.id+'_3D.png'});
        viewer.modal.querySelector('[data-shadow]').onclick=e=>{env.setShadows(!env.sun.castShadow);e.currentTarget.textContent=env.sun.castShadow?'Shadows On':'Shadows Off';};
        window.addEventListener('resize',()=>{if(viewer.modal.classList.contains('open'))env.resize();});
      }
      viewer.modal.classList.add('open');
      if(!env){
        env=root.PacVu3DViewer.createEnvironment(viewer.stage,{dimensions:input});
        controls=root.PacVuMailer3DControls.create({id:api.id,modal:viewer.modal,stage:viewer.stage,...env,getModel:()=>current.model,getAssembly:()=>({panels:current.panels,hinges:current.hinges,sourceThickness:.18,...(typeof assemblyOptions==='function'?assemblyOptions(current):assemblyOptions)})});
      }
      controls.release();if(current){env.scene.remove(current.model);current.dispose();}
      current=buildModel(api,input);env.scene.add(current.model);controls.bind();
      viewer.range.value='0';current.pose(0);controls.update(0);root.PacVu3DViewer.syncProgress(viewer,0);env.resize();fit();
      cancelAnimationFrame(raf);
      const draw=()=>{if(!viewer.modal.classList.contains('open'))return;env.controls.update();env.renderer.render(env.scene,env.camera);raf=requestAnimationFrame(draw);};draw();
      return current;
    }
    return Object.freeze({open,close,buildModel:input=>buildModel(api,input),get current(){return current;}});
  }
  root.PacVuSourceMailer3D=Object.freeze({create,buildModel});
})(typeof window!=='undefined'?window:globalThis);
