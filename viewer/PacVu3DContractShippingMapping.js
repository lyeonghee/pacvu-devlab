/* Read-only R002/R003/R004 input mapping for the existing R001 buildContract.
 * The private inputFor/SOURCE_OUTLINE recipes in the original *_3d.js files
 * are mirrored as static data; Layout/Spec functions still own all dimensions.
 * No meshes, viewer calls, assembly timing, corrugated thickness or score solver.
 * Browser: load this before PacVu3DContractAdapter. No application registration.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.PacVu3DContractShippingMapping=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const DEFAULTS={R002:{W:425,D:335,H:103},R003:{W:350,D:230,H:220},R004:{W:280,D:220,H:190}};
  // Existing 3D silhouettes. These are NOT substitutes for layout.cutPathsMm.
  const OUTLINES={
    R002:'M788.549,712.068 L887.762,685.484 L887.762,203.594 L2092.486,203.594 '+
      'L2092.486,678.397 c0,3.869,3.106,7.025,6.975,7.086,3.869,.06,7.073-2.997,7.193-6.865 '+
      'L2120.832,203.594 L3013.746,203.594 L3027.923,678.618 '+
      'c.121,3.868,3.324,6.925,7.193,6.865,3.869-.061,6.976-3.216,6.976-7.086 '+
      'L3042.092,203.594 L4246.817,203.594 L4246.817,678.397 '+
      'c0,3.869,3.106,7.025,6.976,7.086,3.869,.06,7.073-2.997,7.193-6.865 '+
      'L4275.163,203.594 L5166.659,203.594 L5180.832,675.563 L5190.754,685.484 '+
      'L5190.754,977.452 l-9.922,9.921-14.173,471.968h-891.496l-14.177-475.025'+
      'c-.12-3.867-3.324-6.924-7.193-6.864-3.869.06-6.976,3.216-6.976,7.086v474.803'+
      'h-1204.726v-474.803c0-3.87-3.106-7.025-6.976-7.086-3.869-.06-7.073,2.997-7.193,6.864'+
      'l-14.177,475.025h-892.914l-14.177-475.025c-.12-3.867-3.324-6.924-7.193-6.864'+
      '-3.869.06-6.975,3.216-6.975,7.086v474.803H887.762v-481.89l-99.213-26.584Z',
    R003:'M745.897,499.971 L847.290,499.971 L847.290,173.971 L4135.445,173.971 L4135.445,1449.815 L847.290,1449.815 L847.290,1123.563 L745.897,1123.563 Z',
    R004:'M504.074,558.311 L605.467,558.311 L605.467,246.5 L3440.117,246.5 L3440.117,1408.705 L605.467,1408.705 L605.467,1096.662 L504.074,1096.662 Z'
  };
  // Shared R001 rig relationship names, resolved by ORIGINAL crease IDs,
  // never by the differing array order or geometric proximity.
  const FOLD_IDS={
    'body-front-sideL':'f-4','body-sideL-back':'f-7','body-back-sideR':'f-10','body-front-glue':'f-2',
    'bottom-sideL':'f-6','bottom-sideR':'f-12','bottom-front':'f-3','bottom-back':'f-9',
    'top-sideL':'f-5','top-sideR':'f-11','top-front':'f-1','top-back':'f-8'
  };
  const PANELS={glue:'glue',front:'front',sideL:'sideL',back:'back',sideR:'sideR',
    topFront:'topFlapFront',topSideL:'topFlapSideL',topBack:'topFlapBack',topSideR:'topFlapSideR',
    bottomFront:'botFlapFront',bottomSideL:'botFlapSideL',bottomBack:'botFlapBack',bottomSideR:'botFlapSideR'};
  function mappedOutline(id,layout,runtime){
    const s=layout.spec;
    if(typeof s?.mapX!=='function'||typeof s?.mapY!=='function')throw new Error('Shipping mapping: original Spec coordinate maps are required.');
    if(id==='R002'){
      if(typeof runtime.PacVuShipping?.mapPath!=='function'||!runtime.document?.createElementNS)throw new Error('Shipping mapping: R002 requires original mapPath and SVG measurement.');
      return runtime.PacVuShipping.mapPath(OUTLINES[id],s.mapX,s.mapY);
    }
    return OUTLINES[id].replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,(_,x,y)=>s.mapX(Number(x)).toFixed(4)+','+s.mapY(Number(y)).toFixed(4));
  }
  function describe(id,legacy,input,runtime){
    if(!DEFAULTS[id]||legacy?.code!==id||!legacy.layout)throw new Error('Shipping mapping: source structure mismatch.');
    const l=legacy.layout,s=l.spec;
    if(['W','D','H'].some(k=>s[k]!==legacy.dimensions[k]))throw new Error('Shipping mapping: source dimensions differ.');
    if(!Array.isArray(l.cutPathsMm)||l.cutPathsMm.length!==10||l.foldLines.length!==12||legacy.panels.length!==13)throw new Error('Shipping mapping: source recipe changed.');
    const foldIndices={};
    for(const [relation,crease] of Object.entries(FOLD_IDS)){
      const indices=l.foldLines.flatMap((f,i)=>f.id===crease?[i]:[]);
      if(indices.length!==1)throw new Error('Shipping mapping: missing/duplicate crease '+crease);
      foldIndices[relation]=indices;
    }
    const panelCorrespondence=Object.entries(PANELS).map(([panelId,layoutPanelId])=>{
      if(!legacy.panels.some(p=>p.id===panelId)||!l.panels.some(p=>p.id===layoutPanelId))throw new Error('Shipping mapping: missing panel '+panelId);
      return {panelId,layoutPanelId,layoutBounds:clone(l.panelBoxes[layoutPanelId])};
    });
    const handleFeatures=[];
    if(id==='R004'){
      if(l.handleCutPaths.length!==2)throw new Error('Shipping mapping: handle recipe changed.');
      for(const [index,panelId] of ['sideL','sideR'].entries()){
        const holes=legacy.panels.find(p=>p.id===panelId).holes||[];
        if(holes.length>1)throw new Error('Shipping mapping: unexpected handle count.');
        if(input.handleHoleEnabled===false&&holes.length)throw new Error('Shipping mapping: handle option and source snapshot differ.');
        if(input.handleHoleEnabled===true&&!holes.length)throw new Error('Shipping mapping: handle option and source snapshot differ.');
        holes.forEach(h=>{
          if(![h.cx,h.cy,h.width,h.height,h.radius].every(Number.isFinite)||h.width<=0||h.height<=0||h.radius<=0)throw new Error('Shipping mapping: invalid source handle.');
          if(h.cx!==l.panelBoxes[panelId].cx||h.cy!==l.panelBoxes[panelId].cy)throw new Error('Shipping mapping: handle centre and owner differ.');
          if(input.handleHoleWidth!==undefined&&h.width!==Math.min(Number(input.handleHoleWidth)||s.handle.width,Math.max(10,s.D-20)))throw new Error('Shipping mapping: handle width option and source differ.');
          if(input.handleHoleHeight!==undefined&&h.height!==Math.min(Number(input.handleHoleHeight)||s.handle.height,Math.max(8,s.H-20)))throw new Error('Shipping mapping: handle height option and source differ.');
          handleFeatures.push({id:'handle.'+panelId,panelId,index,pathD:l.handleCutPaths[index],legacyGeometry:clone(h)});
        });
      }
      if(legacy.panels.some(p=>!['sideL','sideR'].includes(p.id)&&(p.holes||[]).length)||![0,2].includes(handleFeatures.length))throw new Error('Shipping mapping: invalid handle ownership.');
    }
    return {outerPath:mappedOutline(id,l,runtime),sourceOutline:OUTLINES[id],foldIndices,panelCorrespondence,handleFeatures,
      coordinateMaps:{x:clone(s.xMap),y:clone(s.yMap)},cutPaths:clone(l.cutPaths),cutPathsMm:clone(l.cutPathsMm),
      handleCutPaths:id==='R004'?clone(l.handleCutPaths):[],handleHoleEnabled:id==='R004'?handleFeatures.length===2:null};
  }
  function build(id,input,runtime){
    if(!DEFAULTS[id]||typeof runtime[id+'_getLayout']!=='function'||typeof runtime.R001_3D_MASTER?.buildContract!=='function')throw new Error('Shipping mapping: missing original Layout/R001 builder.');
    const cfg={...clone(input),...Object.fromEntries(['W','D','H'].map(k=>[k,Number(input[k]??DEFAULTS[id][k])]))};
    if(['W','D','H'].some(k=>!Number.isFinite(cfg[k])||cfg[k]<=0))throw new Error('Shipping mapping: invalid dimension.');
    const layout=runtime[id+'_getLayout'](cfg.W,cfg.D,cfg.H,cfg),s=layout.spec;
    const holes={};
    if(id==='R004'&&cfg.handleHoleEnabled!==false){
      const width=Math.min(Number(cfg.handleHoleWidth)||s.handle.width,Math.max(10,cfg.D-20));
      const height=Math.min(Number(cfg.handleHoleHeight)||s.handle.height,Math.max(8,cfg.H-20));
      const radius=Math.min(s.handle.radius,width/2,height/2);
      for(const panelId of ['sideL','sideR'])holes[panelId]=[{cx:layout.panelBoxes[panelId].cx,cy:layout.panelBoxes[panelId].cy,width,height,radius}];
    }
    const sourceInput={W:cfg.W,D:cfg.D,H:cfg.H,__code:id,__layout:layout,__outerPath:mappedOutline(id,layout,runtime),__panelHoles:holes,
      __spec:{xGlueL:s.mapX(s.base.sourceGlueL),xFrontL:s.xFrontL,xFrontR:s.xFrontR,xSideLR:s.xSideLR,xBackR:s.xBackR,xSideRR:s.xSideRR,
        yTop:s.yTop,yFoldTop:s.yFoldTop,yFoldTop_arc:id==='R002'?s.yFoldTopArc:s.yFoldTop,
        yFoldBot:s.yFoldBot,yFoldBot_arc:id==='R002'?s.yFoldBotArc:s.yFoldBot,yBot:s.yBot}};
    const legacy=runtime.R001_3D_MASTER.buildContract(sourceInput);
    return {...legacy,options:Object.fromEntries(Object.entries(cfg).filter(([k])=>!['W','D','H'].includes(k)))};
  }
  return Object.freeze({build,describe});
});
