/* Opt-in presentation controls. The template retains geometry and pose ownership. */
(function(root){
  'use strict';
  function create({id,modal,stage,renderer,scene,camera,controls,getModel,getAssembly,createPaper,physicalUnavailableReason}){
    const THREE=root.THREE,originals=new Map(),sets=new Map(),hidden=new Map();
    let materialMode='existing',polarLimits=null,studio=null,paper=null,physicalMode=false,paperThickness=.45;
    const extraLights=[];
    // T001 has one key before White Studio adds its own fill/rake. Do not
    // double the legacy mailer fill, and do not modify other Viewer instances.
    let key=null,floor=null,grid=null;
    scene.traverse(o=>{if(o.isDirectionalLight){if(!key)key=o;else extraLights.push([o,o.visible]);}if(o.material?.isShadowMaterial)floor=o;if(o.type==='GridHelper')grid=o;});
    controls.minPolarAngle=.001;controls.maxPolarAngle=Math.PI-.001;
    const group=document.createElement('div');
    group.className='m001-3d-views pacvu-viewer__views';
    group.dataset.mailerControls=id;
    group.style.cssText='right:118px;top:12px;max-width:180px;gap:5px';
    function button(label,action){const b=document.createElement('button');b.type='button';b.className='btn light';b.textContent=label;b.dataset.mailerAction=action;group.append(b);return b;}
    const existing=button('Existing Material','existing'),white=button('White Paperboard','white');
    const original=button('Original','original'),physical=button('Physical Paper POC','physical'),bottom=button('Bottom View','bottom');
    original.setAttribute('aria-pressed','true');physical.setAttribute('aria-pressed','false');
    const label=document.createElement('label');label.style.cssText='font-size:11px;background:#fff;padding:8px;border-radius:7px;display:grid;gap:5px';
    const title=document.createElement('span');title.textContent='Paper thickness';
    const value=document.createElement('span');value.textContent='0.45 mm';
    const input=document.createElement('input');input.type='range';input.min='.15';input.max='.8';input.step='.05';input.value='.45';input.disabled=true;input.setAttribute('aria-label',id+' paper thickness');
    label.append(title,value,input);group.append(label);
    const note=document.createElement('span');note.textContent='Physical Paper · preview';note.style.cssText='font-size:10px;background:#fff;padding:6px;color:#555';group.append(note);
    if(!getAssembly&&!createPaper){physical.disabled=true;physical.title=physicalUnavailableReason||'Physical assembly is not connected';note.textContent='Physical Paper · not connected';note.title=physical.title;}
    stage.append(group);
    function restoreSurfaces(){hidden.forEach((visible,object)=>{object.visible=visible;});hidden.clear();if(polarLimits){[controls.minPolarAngle,controls.maxPolarAngle]=polarLimits;polarLimits=null;}}
    function release(){
      restoreSurfaces();
      paper?.dispose();paper=null;
      studio?.dispose();studio=null;extraLights.forEach(([o,v])=>{o.visible=v;});
      originals.forEach((record,mesh)=>{mesh.material=record.material;if(record.uv1)mesh.geometry.setAttribute('uv1',record.uv1);else mesh.geometry.deleteAttribute('uv1');});
      originals.clear();sets.forEach(set=>set.dispose());sets.clear();
    }
    function bind(){
      const model=getModel();if(!model)return;
      extraLights.forEach(([o])=>{o.visible=false;});
      studio=root.PacVuWhiteStudio.create({scene,camera,controls,renderer,root:model,sun:key,floor,grid});
      studio.ground.userData.pacvuStudioSurface=true;studio.reflection.userData.pacvuStudioSurface=true;
      grid.visible=modal.querySelector('[data-grid]').getAttribute('aria-pressed')!=='false';
      studio.setShadows(modal.querySelector('[data-shadow]').textContent.includes('On'));
      model.traverse(mesh=>{
        if(!mesh.isMesh||mesh.userData.pacvuBrand||!Array.isArray(mesh.material)||mesh.material.length!==3)return;
        originals.set(mesh,{material:mesh.material,uv1:mesh.geometry.getAttribute('uv1')});
      });
      paper=createPaper?createPaper():getAssembly?root.PacVuPhysicalPaper3D.createAssemblyAdapter({THREE,renderer,model,...getAssembly()}):null;
      // The template applies its pose immediately after bind. Do not build a
      // POC from M003's temporary adhesive-calibration pose during rebuild.
      paper?.setThickness(paperThickness);
      syncPaperControls();
      setMaterial(materialMode);
    }
    function setMaterial(mode){
      materialMode=mode==='white'?'white':'existing';
      paper?.setMaterialMode(materialMode);
      originals.forEach((record,mesh)=>{
        if(materialMode==='existing'){mesh.material=record.material;return;}
        let set=sets.get(record.material);
        if(!set){set=root.PacVuWhitePaperboard.createMaterials(THREE,renderer,{sourceMaterials:record.material});sets.set(record.material,set);}
        root.PacVuWhitePaperboard.applyPhysicalUV(THREE,mesh.geometry,{tileSize:32/getModel().scale.x});
        mesh.material=set.materials;
      });
      existing.setAttribute('aria-pressed',String(materialMode==='existing'));white.setAttribute('aria-pressed',String(materialMode==='white'));
    }
    function syncPaperControls(){original.setAttribute('aria-pressed',String(!physicalMode));physical.setAttribute('aria-pressed',String(physicalMode));input.disabled=!physicalMode;value.textContent=paperThickness.toFixed(2)+' mm';input.value=String(paperThickness);}
    function recover(error){physicalMode=false;paper?.setEnabled(false);syncPaperControls();setMaterial(materialMode);note.textContent='POC 오류 · Original 복원';note.title=error.message;console.error(id+' Physical Paper:',error);}
    function update(progress){try{paper?.update(progress);if(physicalMode&&paper&&!paper.enabled){paper.setEnabled(true);setMaterial(materialMode);}}catch(error){recover(error);}}
    function setPaperMode(enabled){if(!paper){note.textContent='Original';return;}try{paper.setEnabled(enabled);physicalMode=enabled;note.textContent=enabled?'Physical Paper · preview':'Original';syncPaperControls();setMaterial(materialMode);}catch(error){recover(error);}}
    function bottomView(){
      const model=getModel();if(!model)return;
      restoreSurfaces();
      scene.traverse(object=>{if(object.type==='GridHelper'||object.isMesh&&object.material?.isShadowMaterial||object===studio?.ground||object===studio?.reflection){hidden.set(object,object.visible);object.visible=false;}});
      root.PacVu3DViewer.fitObject(model,camera,controls,'top');
      polarLimits=[controls.minPolarAngle,controls.maxPolarAngle];controls.minPolarAngle=.01;controls.maxPolarAngle=Math.PI-.01;
      const distance=camera.position.distanceTo(controls.target)*1.8;
      camera.position.copy(controls.target).add(new THREE.Vector3(.25,-.35,-1).normalize().multiplyScalar(distance));
      camera.far=Math.max(camera.far,distance*3);
      camera.updateProjectionMatrix();controls.update();
    }
    function fit(view='iso'){
      restoreSurfaces();
      // Drain residual orbit damping before an explicit view change. Never
      // refit from the render loop or from a material/thickness input.
      const damping=controls.enableDamping;controls.enableDamping=false;controls.update();
      root.PacVu3DViewer.fitObject(getModel(),camera,controls,view);
      if(view==='iso')studio?.view();
      if(physicalMode){camera.position.sub(controls.target).multiplyScalar(1.35).add(controls.target);camera.far*=1.35;camera.updateProjectionMatrix();controls.update();}
      controls.enableDamping=damping;
    }
    const viewListener=event=>{if(event.target.closest('[data-view]'))restoreSurfaces();};
    const shadowListener=event=>{if(event.target.closest('[data-shadow]')){const on=event.target.textContent.includes('On');studio?.setShadows(on);for(const object of [floor,studio?.reflection])if(hidden.has(object)){hidden.set(object,on);object.visible=false;}}};
    const gridListener=event=>{const button=event.target.closest('[data-grid]');if(!button)return;const on=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(on));button.textContent=on?'Grid On':'Grid Off';if(hidden.has(grid))hidden.set(grid,on);else grid.visible=on;};
    modal.addEventListener('click',viewListener,true);
    modal.addEventListener('click',shadowListener);
    modal.addEventListener('click',gridListener);
    existing.onclick=()=>setMaterial('existing');white.onclick=()=>setMaterial('white');
    original.onclick=()=>setPaperMode(false);physical.onclick=()=>setPaperMode(true);bottom.onclick=bottomView;
    input.oninput=()=>{try{paperThickness=paper.setThickness(input.value);syncPaperControls();setMaterial(materialMode);}catch(error){recover(error);}};
    return Object.freeze({bind,release,restoreSurfaces,setMaterial,bottomView,fit,update,getDiagnostics:()=>paper?.getDiagnostics(),dispose(){release();modal.removeEventListener('click',viewListener,true);modal.removeEventListener('click',shadowListener);modal.removeEventListener('click',gridListener);group.remove();}});
  }
  root.PacVuMailer3DControls=Object.freeze({create});
})(window);
