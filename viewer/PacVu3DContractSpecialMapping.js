/* T006/T010/GA001/S001 read-only Contract adapters. No THREE, poses, viewer or
 * Physical Paper. Source Cut/Crease paths remain authoritative. Display masks,
 * tear ligaments and unspecified punch patterns are explicitly not new cuts.
 * Browser: Contract + SpecialRecipes + original source dependencies before this.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./PacVu3DContract.js'),require('./PacVu3DContractSpecialRecipes.js'));
  else root.PacVu3DContractSpecialMapping=factory(root.PacVu3DContract,root.PacVu3DContractSpecialRecipes);
})(typeof globalThis!=='undefined'?globalThis:this,function(validator,recipes){
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v)),P=(x,y)=>({x,y}),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const defaults={T006:{W:100,D:40,H:220},T010:{W:80,D:72,H:190},GA001:{W:241,D:127,H:127},S001:{W:298,D:61,H:292}};
  const clean=ps=>{const p=ps.filter((q,i)=>!i||distance(q,ps[i-1])>1e-9).map(q=>P(q.x,q.y));if(p.length>1&&distance(p[0],p.at(-1))<1e-9)p.pop();return p;};
  const pathData=(e,r)=>typeof e==='object'?e.d:r.T001_elementToPathD(e);
  function parsed(d,r,unit){
    const normalized=r.T001_transformPathD(d,{point:(x,y)=>P(x,y)}),p=r.T001_parseAbsolutePath(normalized),m=q=>P(q.x*unit,q.y*unit);
    if((normalized.match(/\bM\b/g)||[]).length>1)throw new Error('Special mapping: compound manufacturing feature needs explicit mapping.');
    const segments=p.segments.map(s=>s.type==='L'?{type:'line',to:m(s.to)}:{type:'cubic',control1:m(s.c1),control2:m(s.c2),to:m(s.to)});
    const closed=/Z\s*$/i.test(normalized)||segments.length>0&&distance(m(p.start),segments.at(-1).to)<1e-9;
    if(closed&&segments.length&&distance(segments.at(-1).to,m(p.start))>1e-9)segments.push({type:'line',to:m(p.start)});
    return {start:m(p.start),closed,segments};
  }
  function convert(id,input={},r,legacy){
    if(!defaults[id]||!validator?.validate||!recipes)throw new Error('Special mapping: missing mapping dependency.');
    for(const name of ['T001_transformPathD','T001_parseAbsolutePath','T001_elementToPathD'])if(typeof r?.[name]!=='function')throw new Error('Special mapping: missing source dependency '+name);
    if(id==='S001'&&typeof r.S001_runProductFitPreset!=='function')throw new Error('Special mapping: missing source dependency S001_runProductFitPreset.');
    const requested={...copy(legacy?.options||{}),...copy(input)};
    for(const k of ['W','D','H'])if(requested[k]!==undefined&&(!Number.isFinite(+requested[k])||+requested[k]<=0))throw new Error('Special mapping: invalid dimension '+k);
    const cfg={...defaults[id],...legacy?.dimensions,...requested};let original,layout,dimensions;
    if(id==='T006'||id==='T010'){
      if(!legacy&&typeof r[id+'_3D_BUILD_CONTRACT']!=='function')throw new Error('Special mapping: missing original builder.');
      original=legacy||r[id+'_3D_BUILD_CONTRACT'](cfg);layout=original.layout;dimensions=copy(original.dimensions);
      if(['W','D','H'].some(k=>layout?.spec?.[k]!==dimensions[k]))throw new Error('Special mapping: source/dimension mismatch.');
    }else{
      if(typeof r[id+'_getLayout']!=='function')throw new Error('Special mapping: missing original Layout.');
      layout=legacy?.layout||r[id+'_getLayout'](cfg,cfg);const s=id==='GA001'?layout.config:layout.specs.outer;
      dimensions=Object.fromEntries(['W','D','H'].map(k=>[k,s[k]]));
    }
    const resolved=id==='GA001'?r.GA001_getConfig(cfg):cfg;
    if(!layout||legacy&&legacy.code!==id||['W','D','H'].some(k=>!Number.isFinite(dimensions[k])||dimensions[k]<=0||dimensions[k]!==Number(resolved[k])||legacy&&legacy.dimensions[k]!==dimensions[k]))throw new Error('Special mapping: source/dimension mismatch.');
    if(id==='S001'&&legacy){const expected=r.S001_getLayout(cfg,cfg);if(JSON.stringify(layout.rawParts)!==JSON.stringify(expected.rawParts))throw new Error('Special mapping: source/option mismatch.');}
    if(id==='GA001'&&legacy&&['handleHoleWidth','handleHoleHeight'].some(k=>layout.config[k]!==resolved[k]))throw new Error('Special mapping: source/option mismatch.');
    const diagnostics=[],notice=(code,path,message)=>diagnostics.push({code,path,message}),unresolved=[];
    const options=id==='GA001'?{handleHoleWidth:resolved.handleHoleWidth,handleHoleHeight:resolved.handleHoleHeight}:Object.fromEntries(Object.entries(id==='S001'?{...r.S001_getDefaultConfig(),...cfg}:cfg).filter(([k,v])=>!['W','D','H'].includes(k)&&v!==undefined));
    const c={schemaVersion:validator.SCHEMA_VERSION,structureId:id,units:'mm',coordinates:{space:'part-local-2d',x:'right',y:'down',origin:'source-defined'},parameters:{dimensions,options:copy(options)},materials:[{id:'paper',kind:'unspecified',thicknessMm:null}],parts:[],paths:[],panels:[],cuts:[],folds:[],holes:[],slits:[],perforations:[],layers:[],glues:[],insertions:[],bonds:[],source:{mappingOnly:true,builder:id==='T006'||id==='T010'?id+'_3D_BUILD_CONTRACT':id+'_getLayout',unresolvedFeatures:unresolved,sourceCuts:[],sourceFolds:[],presentationOpenings:[],relationships:[],sourceUnitToMm:id==='GA001'?25.4/72:id==='S001'?recipes.unitToMm:1}};
    if(id==='GA001'&&['W','D'].some(k=>Number(cfg[k])!==dimensions[k]))notice('SOURCE_DIMENSION_CLAMP','parameters.dimensions','Original GA001 minimum W/D rule preserved.');
    const paths=new Map(),edges=new Map(),mappedPanels=[],mappedFolds=[],partInfo=new Map();
    const add=(pid,name,shape,source)=>{if(!shape.segments.length)throw new Error('Special mapping: empty source path '+name);const p={id:name,partId:pid,...copy(shape),segments:shape.segments.map((s,i)=>({id:'s'+i,...copy(s)})),source};c.paths.push(p);paths.set(name,p);let a=p.start;edges.set(name,p.segments.map(s=>{const e={a,b:s.to,type:s.type};a=s.to;return e;}));return p;};
    const line=(pid,name,a,b,source)=>add(pid,name,{start:a,closed:false,segments:[{type:'line',to:b}]},source);
    const polygon=(pid,name,ps,source)=>{const pts=clean(ps);if(pts.length<3)throw new Error('Special mapping: original region empty '+name);return add(pid,name,{start:pts[0],closed:true,segments:pts.slice(1).concat([pts[0]]).map(to=>({type:'line',to}))},source);};
    const part=(pid,unit,cuts,creases)=>{
      c.parts.push({id:pid,materialId:'paper',panelIds:[]});
      const features=(list,kind)=>list.map((e,i)=>add(pid,pid+'.'+kind+'.'+i,parsed(pathData(e,r),r,unit),{field:pid+'.'+kind+'Elements',index:i,original:copy(e),sourceUnitToMm:unit}));
      const cp=features(cuts,'cut'),fp=features(creases,'fold');c.source.sourceCuts.push(...cp.map(p=>p.id));c.source.sourceFolds.push(...fp.map(p=>p.id));cp.forEach((p,i)=>c.cuts.push({id:pid+'.cutFeature.'+i,partId:pid,pathId:p.id,kind:'outer'}));partInfo.set(pid,{unit,cuts:cp,creases:fp});return {cp,fp};
    };
    const panel=(pid,name,polys,unit=1,extra={})=>{const panelId=pid+'.'+name;const regions=polys.map((poly,i)=>({id:'region'+i,polygon:poly.map(p=>P(p.x*unit,p.y*unit)),holeIds:[]}));if(!regions.length)throw new Error('Special mapping: original panel has no regions '+panelId);mappedPanels.push({id:panelId,partId:pid,regions,...extra});return panelId;};
    const fold=(pid,parent,child,a,b,refs,profile='crease')=>mappedFolds.push({id:pid+'.foldFeature.'+child,pid,parent:pid+'.'+parent,child:pid+'.'+child,a,b,refs,profile});
    const hole=(pid,index,path,panelIds,source={})=>{if(!path.closed)throw new Error('Special mapping: open hole cannot be fabricated.');const h={id:pid+'.hole.'+index,partId:pid,boundaryPathId:path.id,panelIds,source};c.holes.push(h);return h;};
    const slit=(pid,name,path,panelIds,source)=>{if(path.closed)throw new Error('Special mapping: closed source is not a Slit.');const s={id:pid+'.slit.'+name,partId:pid,pathId:path.id,panelIds,kerfMm:0,source};c.slits.push(s);return s;};
    const guide=(pid,e,i,kind,panelIds)=>{const p=add(pid,pid+'.guide.'+i,parsed(pathData(e,r),r,partInfo.get(pid).unit),{field:kind,index:i,original:copy(e)});unresolved.push({kind,pathId:p.id,panelIds,closed:p.closed,missing:['manufacturing interpretation','cut/tie pattern']});return p;};
    if(id==='T006'||id==='T010'){
      const {cp}=part('sheet',1,layout.cutElements,layout.foldElements),expected=id==='T006'?[31,12,4,13]:[24,16,16,15];
      if(layout.cutElements.length!==expected[0]||layout.foldElements.length!==expected[1]||layout.punchElements.length!==expected[2]||original.panels.length!==expected[3])throw new Error('Special mapping: source recipe changed.');
      original.panels.forEach(p=>panel('sheet',p.id,id==='T006'?(p.topology?p.topology.cells.map(cell=>cell.points):[p.polygon]):p.polygons,1,{sourceRole:p.role??p.id}));
      if(id==='T006'){
        const refs=[6,5,4,3,1,0,10,2,7,8,9,11];original.folds.forEach((f,i)=>fold('sheet',f.parentId,f.childId,copy(f.a),copy(f.b),[[refs[i]]]));
        const h=hole('sheet',0,cp[0],['sheet.sideRight'],{kind:'slot',sourceIndex:0});c.cuts[0].kind='internal';mappedPanels.find(p=>p.id==='sheet.sideRight').regions[0].holeIds.push(h.id);
        const t=original.panels.find(p=>p.id==='frontLock').topology;if(!t||t.cells.length!==3||t.slits.length!==2||t.continuousEdges.length!==2)throw new Error('Special mapping: T006 topology changed.');
        t.slits.forEach((s,i)=>slit('sheet',s.id,line('sheet','sheet.topology.slit.'+i,copy(s.a),copy(s.b),{sourceCutIndex:30,role:'approved-source-cut-subsegment'}),['sheet.frontLock'],{sourceCutIndex:30,kind:'slit-bank'}));
        c.source.continuousEdges=t.continuousEdges.map(([a,b])=>({panelId:'sheet.frontLock',a:copy(a),b:copy(b),kind:'tessellation-not-cut-or-fold'}));
        c.source.frontLockTopology={panelId:'sheet.frontLock',cellRegions:t.cells.map((cell,i)=>({cellId:cell.id,regionId:'region'+i})),junctions:copy(t.junctions),sourceCutIndices:copy(t.sourceCuts)};
        const punch=layout.punchElements.map((e,i)=>guide('sheet',e,i,'perforation',i%2?['sheet.frontLock']:['sheet.front']));
        const punchPolys=layout.punchElements.map(e=>r.T001_flattenPathD(pathData(e,r))),tip=punchPolys[3].at(-1),s=t.slits[0],dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,amount=((tip.x-s.a.x)*dx+(tip.y-s.a.y)*dy)/(dx*dx+dy*dy);
        if(!(amount>=0&&amount<=1))throw new Error('Special mapping: T006 tear ligament no longer meets slit.');
        c.source.tearTopology={panelIds:['sheet.front','sheet.frontLock'],perforationPathIds:punch.map(p=>p.id),slitIds:c.slits.map(s=>s.id),residualLigaments:[{a:copy(tip),b:P(s.a.x+amount*dx,s.a.y+amount*dy)},{a:copy(t.slits[1].b),b:copy(punchPolys[1][0])}],manufacturingCut:false,partitionOwner:'T006_3d.js:centralTearPartition',behaviorImplemented:false};
        c.source.previewOnly={hatchElements:copy(layout.previewHatchElements)};notice('TEAR_TOPOLOGY_NOT_NEW_CUT','source.tearTopology','Original cells, slit banks, continuous edges and residual ligaments preserved; no tear solver or invented crease.');
      }else{
        const g=layout.grid;
        [['back','glue',g.xBackL,8,true],['back','sideLeft',g.xBackR,6],['sideLeft','front',g.xSideLR,7],['front','sideRight',g.xFrontR,5]].forEach(([pa,ch,x,ref,reverse])=>fold('sheet',pa,ch,P(x,reverse?g.yBodyBottom:g.yBodyTop),P(x,reverse?g.yBodyTop:g.yBodyBottom),[[ref]]));
        [['back','topBack',g.xBackL,g.xBackR,[[12]]],['sideLeft','topSideLeft',g.xBackR,g.xSideLR,[[10,0,'left'],[11]]],['front','topFront',g.xSideLR,g.xFrontR,[[10,0,'right'],[13],[14]]],['sideRight','topSideRight',g.xFrontR,g.xSideRR,[[9]]]].forEach(([pa,ch,a,b,refs])=>fold('sheet',pa,ch,P(a,g.yBodyTop),P(b,g.yBodyTop),refs));
        [['back','bottomBack',g.xBackL,g.xBackR,3],['sideLeft','bottomSideLeft',g.xBackR,g.xSideLR,2],['front','bottomFront',g.xSideLR,g.xFrontR,1],['sideRight','bottomSideRight',g.xFrontR,g.xSideRR,0]].forEach(([pa,ch,a,b,ref])=>fold('sheet',pa,ch,P(a,g.yBodyBottom),P(b,g.yBodyBottom),[[ref]],'returnFold'));
        for(const name of ['back','front']){const f=original.bottomLock[name];fold('sheet',f.main,f.wing,copy(f.a),copy(f.b),[[f.foldIndex]],'returnFold');}
        slit('sheet','lid-slot',cp[22],['sheet.topFront'],{kind:'u-cut',sourceIndex:22});c.cuts.find(k=>k.pathId===cp[22].id).kind='internal';
        layout.punchElements.forEach((e,i)=>guide('sheet',e,i,'punch-perforation',['sheet.topFront']));c.source.relationships.push({kind:'body-seam',...copy(original.bodySeam)},{kind:'bottom-contact-pairs',pairs:copy(original.bottomLock.contacts),behaviorImplemented:false});
        c.source.displayOutline={builder:'T010_3d.js:sourceCutOutline',includesPunchIndex:0,bridgesTearStrip:true,manufacturingCut:false};notice('PUNCH_NOT_CUT','source.displayOutline','Legacy fill uses a punch path and material bridges; manufacturing Cut remains the original cutElements only.');
      }
      notice('UNRESOLVED_PERFORATION_PATTERN','source.unresolvedFeatures','Original punch/perforation geometry retained without inventing cut/tie dimensions.');
    }else if(id==='GA001'){
      const unit=25.4/72,m=q=>P(q.x*unit,q.y*unit),g=layout.grid;
      if(layout.foldLines.length!==14||layout.holePaths.length!==4||Object.keys(layout.panels).length!==15)throw new Error('Special mapping: GA001 source recipe changed.');
      const {cp}=part('sheet',unit,layout.cutPaths.map(d=>({d})),layout.foldLines.map(f=>({d:`M ${f.x1} ${f.y1} L ${f.x2} ${f.y2}`})));
      Object.entries(layout.panels).forEach(([name,points])=>panel('sheet',name,[points],unit));
      ['handleBack','gableA','gableB','handleFront'].forEach((name,i)=>{const h=hole('sheet',i,cp[i],['sheet.'+name],{kind:i===0||i===3?'handle':'gable-slot'});c.cuts[i].kind='internal';mappedPanels.find(p=>p.id==='sheet.'+name).regions[0].holeIds.push(h.id);});
      const f=(pa,ch,a,b,ref)=>fold('sheet',pa,ch,m(a),m(b),[[ref]]);
      [['back','glue',g.xBackL,7],['back','sideA',g.xBackR,5],['sideA','front',g.xSideL,6],['front','sideB',g.xFrontR,4]].forEach(([pa,ch,x,ref])=>f(pa,ch,P(x,g.yBodyTop),P(x,g.yBodyBottom),ref));
      [['sideA','bottomA',g.xBackR,g.xSideL,2],['sideB','bottomB',g.xFrontR,g.xSideR,0],['back','bottomBack',g.xBackL,g.xBackR,3],['front','bottomFront',g.xSideL,g.xFrontR,1]].forEach(([pa,ch,a,b,ref])=>f(pa,ch,P(a,g.yBodyBottom),P(b,g.yBodyBottom),ref));
      [['back','roofBack',g.xBackL,g.xBackR,9],['front','roofFront',g.xSideL,g.xFrontR,12],['sideA','gableA',g.xBackR,g.xSideL,8],['sideB','gableB',g.xFrontR,g.xSideR,11]].forEach(([pa,ch,a,b,ref])=>f(pa,ch,P(a,g.yBodyTop),P(b,g.yBodyTop),ref));
      f('roofBack','handleBack',P(g.xBackL,layout.foldLines[10].y1),P(g.xBackR,layout.foldLines[10].y1),10);f('roofFront','handleFront',P(g.xSideL,layout.foldLines[13].y1),P(g.xFrontR,layout.foldLines[13].y1),13);
      notice('LEGACY_HANDLE_OPTION_NOT_FORWARDED','parameters.options','Original GA001 viewer cfg() returns W/D/H only. Mapping preserves Layout handle options without modifying the viewer.');
    }else{
      const unit=recipes.unitToMm,sleeve=recipes.sleeve(layout,r);
      c.source.partPlacement=layout.parts.map(p=>({partId:p.key,role:'2d-preview-only',sourceUnitToMm:unit,translation:copy(p.transform)}));c.source.partSpecs=copy(layout.specs);
      c.source.legacyGeometryThicknessMm=.4;
      if(Number.isFinite(layout.clearance.paperThickness)&&layout.clearance.paperThickness>0)c.materials[0].thicknessMm=layout.clearance.paperThickness;
      if(layout.clearance.paperThickness!==.4)notice('LEGACY_THICKNESS_FIXED','materials.paper','Spec thickness affects the original clearance rules; existing 3D still uses 0.4mm. Neither geometry nor physics is changed.');
      for(const [pid,p] of Object.entries(layout.rawParts)){
        const mapped=sleeve[pid];if(!mapped)throw new Error('Special mapping: unknown S001 Part.');
        part(pid,unit,p.cutElements,p.foldElements);Object.entries(mapped.contours).forEach(([name,ps])=>panel(pid,name,ps,unit));
        if(pid==='outerSleeve')p.holeElements.forEach((e,i)=>{
          const path=add(pid,pid+'.opening.'+i,parsed(e.d,r,unit),{field:'rawParts.outerSleeve.holeElements',index:i,original:copy(e)}),owners=[],patches=[];
          Object.keys(mapped.regions).forEach(name=>{const clipped=mapped.clip(mapped.holes[i],mapped.regions[name]);if(clipped.length>=3){owners.push(pid+'.'+name);patches.push({panelId:pid+'.'+name,polygon:clipped.map(q=>P(q.x*unit,q.y*unit))});}});
          if(!owners.length)throw new Error('Special mapping: S001 source hole has no owner.');
          const h=hole(pid,i,path,owners,{kind:'string-hole',clippedRegions:patches});c.cuts.push({id:pid+'.openingCut.'+i,partId:pid,pathId:path.id,kind:'internal'});
          if(owners.length===1)mappedPanels.find(p=>p.id===owners[0]).regions[0].holeIds.push(h.id);
          else notice('CROSS_PANEL_HOLE',h.id,'Original full hole plus per-panel clipped contours retained; do not subtract whole hole twice.');
        });
        else if(pid==='insertPad'){
          p.holeElements.forEach((e,i)=>guide(pid,e,i,'product-cut-guide',[pid+'.center']));
          notice('INSERT_GUIDE_NOT_CONFIRMED_HOLE',pid,'Original Renderer/3D keep insert material and draw these paths as green guides; no through Hole or Fold is inferred.');
        }
      }
      const f=(pid,pa,ch,a,b,refs,profile)=>{const mp=sleeve[pid].mp,aa=mp(a[0],a[1]),bb=mp(b[0],b[1]);fold(pid,pa,ch,P(aa.x*unit,aa.y*unit),P(bb.x*unit,bb.y*unit),refs,profile);};
      const outer=[
        ['front','sideLeft',[1487.541,504.149],[1487.541,1263.834],[[5]]],['sideLeft','back',[1314.628,1263.834],[1314.628,436.117],[[4]]],['back','glue',[469.903,436.117],[469.903,1263.834],[[3]]],['front','sideRight',[2332.265,1263.834],[2332.265,504.149],[[6]]],
        ['sideRight','bottomRight',[2500.927,1263.834],[2332.265,1263.834],[[8,0]]],['sideLeft','bottomLeft',[1487.541,1263.834],[1314.628,1263.834],[[8,2]]],['front','bottomB',[2332.265,1263.834],[1487.541,1263.834],[[8,1]]],['back','bottomA',[1314.628,1263.834],[469.903,1263.834],[[8,3]]],
        ['sideLeft','lidSideLeft',[1314.628,436.117],[1487.541,504.149],[[0]],'returnFold'],['sideRight','lidSideRight',[2332.265,504.149],[2500.927,437.79],[[9]],'returnFold'],['back','lidBack',[469.903,436.117],[1314.628,436.117],[[1],[2]],'returnFold'],['front','lidFront',[1487.541,504.149],[2332.265,504.149],[[7]],'returnFold']
      ];outer.forEach(row=>f('outerSleeve',...row));
      const inner=[
        ['base','sideL1',[429.694,2223.516],[429.694,3039.894],18],['base','sideR1',[1251.741,3039.894],[1251.741,2223.516],10],['sideL1','sideL2',[273.788,3037.059],[273.788,2226.351],19],['sideR1','sideR2',[1407.646,2226.351],[1407.646,3037.059],11],['sideL2','sideL3',[256.78,3027.138],[256.78,2295.799],20],['sideR2','sideR3',[1424.654,2295.799],[1424.654,3027.138],12],
        ['sideL1','topLockL',[273.788,2226.351],[424.024,2226.351],3],['sideR1','topLockR',[1257.41,2226.351],[1407.646,2226.351],1],['sideL3','topHookL',[163.237,2295.799],[256.78,2295.799],2],['sideR3','topHookR',[1518.197,2295.799],[1424.654,2295.799],0],
        ['base','top6',[429.694,2223.516],[1251.741,2223.516],7],['top6','top7',[429.694,2061.941],[1251.741,2061.941],6],['top7','top8',[449.536,1985.406],[1231.898,1985.406],5],['top8','top9',[1231.898,1829.5],[449.536,1829.5],4],
        ['sideL1','bottomLockL',[424.024,3037.059],[273.788,3037.059],14],['sideR1','bottomLockR',[1407.646,3037.059],[1259.481,3037.059],9],['sideL3','bottomHookL',[256.78,3027.138],[163.237,3027.138],13],['sideR3','bottomHookR',[1424.654,3027.138],[1518.197,3027.138],8],
        ['base','bottom12',[1251.741,3039.894],[429.694,3039.894],17],['bottom12','bottom13',[1251.741,3201.468],[429.694,3201.468],16],['bottom13','bottom14',[1231.898,3218.477],[449.536,3218.477],15]
      ];inner.forEach(([pa,ch,a,b,i])=>f('innerTray',pa,ch,a,b,[[i]]));
      [['top',[1894.283,2215.047],[2670.976,2215.047],[[1]]],['right',[2670.976,2215.047],[2670.976,2923.709],[[2]]],['bottom',[2670.976,2923.709],[1894.283,2923.709],[[0,0]]],['left',[1894.283,2923.709],[1894.283,2215.047],[[0,1]]]].forEach(([ch,a,b,refs])=>f('insertPad','center',ch,a,b,refs));
      notice('INDEPENDENT_PARTS','parts','Outer Sleeve, Inner Tray and Insert Pad retain local source frames. Preview visibility/arrangement does not merge or remove Parts.');
    }
    const used=new Set();
    mappedFolds.forEach(f=>{
      const fp=partInfo.get(f.pid).creases,segments=f.refs.map(([i,j,side])=>{
        const p=fp[i];if(!p)throw new Error('Special mapping: missing original crease.');
        if(j===undefined){p.segments.forEach((_,k)=>used.add(p.id+':'+k));return {pathId:p.id};}
        const e=edges.get(p.id)[j];if(!e||e.type!=='line')throw new Error('Special mapping: missing linear crease segment.');used.add(p.id+':'+j);let a=copy(e.a),b=copy(e.b);
        if(side){const x=layout.grid.xSideLR,t=(x-a.x)/(b.x-a.x),q=P(x,a.y+(b.y-a.y)*t);if(!(t>0&&t<1))throw new Error('Special mapping: T010 crease split changed.');if((a.x<x)===(side==='left'))b=q;else a=q;}
        return {pathId:line(f.pid,p.id+'.segment'+j+(side?'.'+side:''),a,b,{sourcePathId:p.id,segmentId:'s'+j,role:'actual-crease-subsegment'}).id};
      });
      c.folds.push({id:f.id,parentPanelId:f.parent,childPanelId:f.child,axis:{partId:f.pid,a:f.a,b:f.b},segments,orientation:{positiveRotation:'right-hand-about-a-to-b'},profile:{kind:f.profile,thicknessAware:true,neutralAxis:'material-defined'},source:{sourceRefs:copy(f.refs),axisOwner:'original-3d'}});
      if(segments.some(s=>edges.get(s.pathId).some(e=>[e.a,e.b].some(q=>Math.abs((f.b.x-f.a.x)*(q.y-f.a.y)-(f.b.y-f.a.y)*(q.x-f.a.x))/distance(f.a,f.b)>.002))))notice('LEGACY_AXIS_DIFFERS_FROM_CREASE',f.id,'Original 3D axis and manufacturing crease differ; both are preserved, not repaired.');
    });
    for(const {creases} of partInfo.values())creases.forEach(p=>p.segments.forEach((s,i)=>{if(!used.has(p.id+':'+i)){unresolved.push({kind:'unassigned-crease',pathId:p.id,segmentId:s.id});notice('UNASSIGNED_SOURCE_CREASE',p.id,'No new parent-child Fold is inferred.');}}));
    const covers=(a,b,es)=>{const len=distance(a,b);if(len<1e-9)return false;const on=q=>Math.abs((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))/len<=.002,proj=q=>((q.x-a.x)*(b.x-a.x)+(q.y-a.y)*(b.y-a.y))/len,intervals=es.filter(e=>e.type==='line'&&on(e.a)&&on(e.b)).map(e=>[proj(e.a),proj(e.b)].sort((x,y)=>x-y)).sort((x,y)=>x[0]-y[0]);let end=0;for(const q of intervals){if(q[0]>end+.002)break;end=Math.max(end,q[1]);}return end>=len-.002;};
    mappedPanels.forEach(p=>{
      c.parts.find(part=>part.id===p.partId).panelIds.push(p.id);
      const regions=p.regions.map(region=>{const path=polygon(p.partId,'panel.'+p.id+'.'+region.id,region.polygon,{role:'legacy-display-region',sourceRole:p.sourceRole??null}),unknown=[];
        const boundaryBindings=edges.get(path.id).map((e,i)=>{const base={segmentIds:['s'+i]},continuous=c.source.continuousEdges?.some(s=>s.panelId===p.id&&covers(e.a,e.b,[{a:s.a,b:s.b,type:'line'}]));if(continuous)return {...base,kind:'continuous',source:{kind:'source-tessellation'}};
          const slit=c.slits.find(s=>s.partId===p.partId&&s.panelIds.includes(p.id)&&covers(e.a,e.b,edges.get(s.pathId)));if(slit)return {...base,kind:'slit',featureId:slit.id};
          const cut=c.cuts.find(k=>k.partId===p.partId&&covers(e.a,e.b,edges.get(k.pathId)));if(cut)return {...base,kind:'cut',featureId:cut.id};
          const fold=c.folds.find(f=>[f.parentPanelId,f.childPanelId].includes(p.id)&&covers(e.a,e.b,f.segments.flatMap(s=>edges.get(s.pathId))));if(fold)return {...base,kind:'fold',featureId:fold.id};
          unknown.push('s'+i);return {...base,kind:'continuous',source:{mechanicalMapping:'unresolved',kind:'display-boundary-not-manufacturing-feature'}};});
        if(unknown.length){unresolved.push({kind:'display-boundary',pathId:path.id,segmentIds:unknown});notice('UNRESOLVED_LEGACY_BOUNDARY',path.id,'Sampled/clip-mask edges are not fabricated Cut/Fold features.');}
        return {id:region.id,outerPathId:path.id,holeIds:region.holeIds,boundaryBindings};});
      c.panels.push({id:p.id,partId:p.partId,faceConvention:{outside:'negativeZ',inside:'positiveZ'},regions});
    });
    notice('MAPPING_ONLY_NOT_PHYSICAL','materials.paper','Material thickness and assembly/contact behavior are not implemented by this mapping.');
    return {contract:c,validation:validator.validate(c),diagnostics,unresolvedRelations:[],complete:false};
  }
  return Object.freeze({convert});
});
