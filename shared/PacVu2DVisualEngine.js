(function(root){
  'use strict';

  const ROUTING=Object.freeze({
    T001:'legacy-t001',T002:'renderer',T003:'renderer',T004:'renderer',T005:'renderer',
    M001:'legacy-t001',M002:'legacy-t001',M003:'contract',
    B001:'renderer',B002:'renderer',
    R001:'contract',R002:'contract',R003:'contract',R004:'contract',
    GA001:'renderer',S001:'contract',
    TR001:'renderer',TR002:'renderer',TR003:'renderer',C001:'contract'
  });
  const ENGINE_TEMPLATE=Object.freeze({
    bbox:'T001',bbox2:'T002',bbox3:'T003',bbox4:'T004',bbox5:'T005',
    gbox:'M001',gbox2:'M002',gbox3:'M003',
    b001:'B001',b002:'B002',rbox:'R001',rbox2:'R002',rbox3:'R003',rbox4:'R004',
    gable1:'GA001',sSeries:'S001',tr001:'TR001',tr002:'TR002',tr003:'TR003',c001:'C001'
  });
  const APPLY_COUNTS=new WeakMap();
  let svgSequence=0;

  function scaleOf(svg){
    const helper=root.PacVu2DVisualContract?.scaleOf;
    if(typeof helper==='function')return helper(svg);
    const viewport=svg?.querySelector?.('#viewportGroup')||svg?.querySelector?.('#mainGroup')||svg;
    const ctm=viewport?.getScreenCTM?.();
    if(!ctm)return null;
    const x=Math.hypot(ctm.a,ctm.b),y=Math.hypot(ctm.c,ctm.d);
    return x>0&&y>0?{x,y,mean:Math.sqrt(x*y)}:null;
  }
  function prepareResponsiveScale(svg,reason){
    const scale=scaleOf(svg);if(!scale)return 1;
    const current=scale.mean;
    let reference=Number(svg.dataset.pacvuVisualReferenceScale);
    if(!(reference>0)||reason==='initial-render'){
      reference=current;
      svg.dataset.pacvuVisualReferenceScale=String(reference);
    }
    // A restrained square-root response keeps annotations readable without
    // making them grow linearly with the dieline/viewer zoom.
    const factor=Math.sqrt(current/reference);
    svg.dataset.pacvuVisualResponsiveScale=String(factor);
    return factor;
  }
  function markerSnapshot(svg){
    const markers=[...svg.querySelectorAll('marker')];
    return {count:markers.length,ids:markers.map(marker=>marker.id).filter(Boolean)};
  }
  function svgIdentifier(svg){
    if(!svg.dataset.pacvuVisualSvgId)svg.dataset.pacvuVisualSvgId=`pacvu-svg-${++svgSequence}`;
    return svg.dataset.pacvuVisualSvgId;
  }
  function contractPrefix(templateId){
    if(templateId==='M003')return 'm003-pacvu';
    if(templateId==='R001')return 'r001-pacvu';
    if(templateId==='C001')return 'c001-pacvu';
    if(templateId==='S001')return 's001-pacvu';
    return 'shipping-pacvu';
  }
  function debug(payload){
    if(root.PACVU_2D_VISUAL_DEBUG!==true)return;
    root.console?.info?.('[PacVu2DVisualEngine]',payload);
  }
  function ensureProfileMarker(svg,defs,sourceId,targetId){
    let marker=svg.querySelector(`#${targetId}`);
    if(marker)return {marker,created:false};
    const source=svg.querySelector(`#${sourceId}`);
    if(!source||!defs)return {marker:null,created:false};
    marker=source.cloneNode(true);
    marker.id=targetId;
    marker.dataset.pacvuProfileMarker='true';
    defs.appendChild(marker);
    return {marker,created:true};
  }
  function applyProfileMarkerRouting(svg,profile){
    const marker=profile?.internal?.marker;
    const lineSelector=profile?.selectors?.internalLines;
    if(!marker?.enabled||!marker.sourceId||!marker.startId||!marker.endId||!lineSelector){
      return {applied:false,created:0,reused:0};
    }
    const defs=svg.querySelector(profile.selectors.defs||'defs');
    const start=ensureProfileMarker(svg,defs,marker.sourceId,marker.startId);
    const end=ensureProfileMarker(svg,defs,marker.sourceId,marker.endId);
    if(!start.marker||!end.marker)return {applied:false,created:0,reused:0};
    const lines=[...svg.querySelectorAll(lineSelector)];
    lines.forEach(line=>{
      line.setAttribute('marker-start',`url(#${marker.startId})`);
      line.setAttribute('marker-end',`url(#${marker.endId})`);
    });
    const created=Number(start.created)+Number(end.created);
    return {applied:lines.length>0,created,reused:2-created,lineCount:lines.length};
  }
  function apply(options){
    const requestedId=String(options?.templateId||'').toUpperCase();
    const templateId=ROUTING[requestedId]?requestedId:(ENGINE_TEMPLATE[options?.engineKey]||requestedId);
    const svg=options?.svg;
    const reason=options?.reason||'initial-render';
    if(!svg||typeof svg.querySelector!=='function')return false;

    const route=ROUTING[templateId]||'renderer';
    const profile=root.PacVu2DVisualProfiles?.get?.(templateId)||null;
    const responsiveScale=prepareResponsiveScale(svg,reason);
    const before=markerSnapshot(svg);
    const count=(APPLY_COUNTS.get(svg)||0)+1;
    APPLY_COUNTS.set(svg,count);
    let writer='renderer-style';
    let applied=false;
    let profileMarkers={applied:false,created:0,reused:0};

    if(route==='contract'){
      writer='PacVu2DVisualContract.apply';
      svg.dataset.pacvuVisualPrefix=contractPrefix(templateId);
      const runtimeProfile=/^R00[1-4]$/.test(templateId)&&typeof root.PacVuShipping2DVisualCommon?.resolveContractProfile==='function'
        ?root.PacVuShipping2DVisualCommon.resolveContractProfile(profile)
        :profile;
      if(typeof root.PacVu2DVisualContract?.apply==='function')applied=root.PacVu2DVisualContract.apply(svg,runtimeProfile)===true;
    }else if(route==='legacy-t001'){
      writer='T001_applyScreenVisualStyle';
      if(typeof root.T001_applyScreenVisualStyle==='function')applied=root.T001_applyScreenVisualStyle(svg,profile)===true;
    }else{
      profileMarkers=applyProfileMarkerRouting(svg,profile);
      applied=profileMarkers.applied;
      if(applied)writer='renderer-style + PacVu2DVisualEngine.marker-routing';
      if(/^T00[2-5]$/.test(templateId)&&typeof root.PacVuTuck2DVisualCommon?.applyRendererResponsive==='function'){
        applied=root.PacVuTuck2DVisualCommon.applyRendererResponsive(svg,profile)===true||applied;
        writer='renderer-style + PacVuTuck2DVisualCommon.applyRendererResponsive';
      }
      if(templateId==='GA001'&&typeof root.PacVuGable2DVisualCommon?.applyScreenVisual==='function'){
        applied=root.PacVuGable2DVisualCommon.applyScreenVisual(svg,profile)===true||applied;
        writer='renderer-style + PacVuGable2DVisualCommon.applyScreenVisual';
      }
      if(/^TR00[1-3]$/.test(templateId)&&typeof root.PacVuTray2DVisualCommon?.applyScreenVisual==='function'){
        applied=root.PacVuTray2DVisualCommon.applyScreenVisual(svg,profile)===true||applied;
        writer='renderer-style + PacVuTray2DVisualCommon.applyScreenVisual';
      }
      if(/^B00[12]$/.test(templateId)&&typeof root.PacVuBakery2DVisualCommon?.applyScreenVisual==='function'){
        applied=root.PacVuBakery2DVisualCommon.applyScreenVisual(svg,profile)===true||applied;
        writer='renderer-style + PacVuBakery2DVisualCommon.applyScreenVisual';
      }
    }

    const after=markerSnapshot(svg);
    const duplicateIds=after.ids.filter((id,index,ids)=>ids.indexOf(id)!==index);
    debug({
      templateId,route,finalWriter:writer,reason,applyCount:count,
      svgId:svgIdentifier(svg),renderScale:scaleOf(svg),
      responsiveScale,
      profileFound:!!profile,profileMarkers,
      markers:{before:before.count,after:after.count,created:Math.max(0,after.count-before.count),reused:after.count<=before.count,duplicateIds},
      duplicateApplyBlocked:count>1&&after.count===before.count,
      applied
    });
    return route==='renderer'?true:applied;
  }

  if(typeof root.PACVU_2D_VISUAL_DEBUG!=='boolean')root.PACVU_2D_VISUAL_DEBUG=false;
  root.PACVU_2D_VISUAL_ROUTING=ROUTING;
  root.PacVu2DVisualEngine=Object.freeze({apply,routing:ROUTING});
})(typeof window!=='undefined'?window:globalThis);
