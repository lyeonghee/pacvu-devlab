/* Read-only B001/B002/C001 source mapping. No viewer, physical solver or poses.
 * Browser: load Contract, BakeryCakeSource, original Spec/Layout (plus C001
 * Renderer and T001 path helpers), this file, then Adapter. No app registration.
 * Manufacturing paths stay separate from sampled legacy display regions.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./PacVu3DContract.js'),require('./PacVu3DContractBakeryCakeSource.js'));
  else root.PacVu3DContractBakeryCakeMapping=factory(root.PacVu3DContract,root.PacVu3DContractBakeryCakeSource);
})(typeof globalThis!=='undefined'?globalThis:this,function(validator,source){
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v)),P=(x,y)=>({x,y}),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const clean=pts=>{const a=pts.filter((p,i)=>!i||dist(p,pts[i-1])>1e-9).map(p=>P(p.x,p.y));if(a.length>1&&dist(a[0],a.at(-1))<1e-9)a.pop();return a;};
  const attr=(el,key)=>{const m=el.match(new RegExp('\\b'+key+'="([^"]*)"'));return m?m[1]:null;};
  function elementD(el,r){
    if(/^<rect\b/.test(el)){
      const x=+attr(el,'x'),y=+attr(el,'y'),w=+attr(el,'width'),h=+attr(el,'height'),rx=+(attr(el,'rx')||0),ry=+(attr(el,'ry')||rx);
      if(rx||ry)return `M${x+rx} ${y} L${x+w-rx} ${y} A${rx} ${ry} 0 0 1 ${x+w} ${y+ry} L${x+w} ${y+h-ry} A${rx} ${ry} 0 0 1 ${x+w-rx} ${y+h} L${x+rx} ${y+h} A${rx} ${ry} 0 0 1 ${x} ${y+h-ry} L${x} ${y+ry} A${rx} ${ry} 0 0 1 ${x+rx} ${y} Z`;
      return `M${x} ${y} L${x+w} ${y} L${x+w} ${y+h} L${x} ${y+h} Z`;
    }
    const d=r.T001_elementToPathD(el);if(!d)throw new Error('Bakery/cake mapping: unsupported source element.');return d;
  }
  // Normalize smooth/relative cubic commands with the existing T001 helper.
  // B001 rounded slots use absolute arcs, retained without polygonizing them.
  function parse(d,r,map=p=>p){
    if(!/[Aa]/.test(d))d=r.T001_transformPathD(d,{point:(x,y)=>P(x,y)});
    const t=d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)||[];
    let i=0,cmd,start,at,closed=false;const segments=[];
    const n=()=>{const v=Number(t[i++]);if(!Number.isFinite(v))throw new Error('Bakery/cake mapping: malformed path.');return v;},pt=()=>map(P(n(),n()));
    while(i<t.length){
      if(/^[a-zA-Z]$/.test(t[i]))cmd=t[i++];
      if(cmd==='M'){if(start)throw new Error('Bakery/cake mapping: compound feature.');start=at=pt();cmd='L';continue;}
      let s;
      if(cmd==='L')s={type:'line',to:pt()};
      else if(cmd==='C')s={type:'cubic',control1:pt(),control2:pt(),to:pt()};
      else if(cmd==='A'){const rx=n(),ry=n(),rotationDeg=n(),large=n(),sweep=n();const zero=map(P(0,0)),radius=map(P(rx,ry));s={type:'arc',rx:Math.abs(radius.x-zero.x),ry:Math.abs(radius.y-zero.y),rotationDeg,largeArc:!!large,sweep:!!sweep,to:pt()};}
      else if(cmd==='Z'){closed=true;if(dist(at,start)>1e-9)segments.push({type:'line',to:copy(start)});at=start;cmd=null;continue;}
      else throw new Error('Bakery/cake mapping: unsupported path command '+cmd);
      if(!start)throw new Error('Bakery/cake mapping: missing start.');segments.push(s);at=s.to;
    }
    return {start,segments,closed:closed||!!start&&!!at&&segments.length>0&&dist(start,at)<1e-9};
  }
  function sample(d,r,count){
    const p=r.document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);const len=p.getTotalLength();
    if(!(len>0))throw new Error('Bakery/cake mapping: empty display contour.');
    const at=t=>{const q=p.getPointAtLength(t);return P(q.x,q.y);};
    if(count)return Array.from({length:count},(_,i)=>at(len*i/count));
    // Original C001 flattenPath: .05mm deviation, depth16, 20mm arc seeds.
    const pts=[],deviation=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,nn=dx*dx+dy*dy,t=nn?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/nn)):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
    const split=(ta,a,tb,b,depth)=>{const tm=(ta+tb)/2,m=at(tm);if(depth<16&&deviation(m,a,b)>.05){split(ta,a,tm,m,depth+1);split(tm,m,tb,b,depth+1);}else pts.push(a);};
    const seeds=Math.max(8,Math.ceil(len/20));for(let i=0;i<seeds;i++)split(len*i/seeds,at(len*i/seeds),len*(i+1)/seeds,at(len*(i+1)/seeds),0);return pts;
  }
  function clipB001(pts,b){
    let out=pts.slice();
    for(const [key,value,sign] of [['x',b.x0,1],['x',b.x1,-1],['y',b.y0,1],['y',b.y1,-1]]){
      const input=out;out=[];if(!input.length)break;
      const inside=q=>sign*(q[key]-value)>=-.01,other=key==='x'?'y':'x';
      let a=input.at(-1);for(const q of input){if(inside(a)!==inside(q)){const t=(value-a[key])/(q[key]-a[key]);out.push({[key]:value,[other]:a[other]+(q[other]-a[other])*t});}if(inside(q))out.push(q);a=q;}
    }
    return clean(out.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
  }
  function clipC001(pts,b,r){
    const C=r.ClipperLib,s=10000,cv=ps=>ps.map(p=>({X:Math.round(p.x*s),Y:Math.round(p.y*s)})),op=new C.Clipper(),out=new C.Paths();
    op.AddPaths([cv(pts)],C.PolyType.ptSubject,true);op.AddPaths([cv([P(b.minX,b.minY),P(b.maxX,b.minY),P(b.maxX,b.maxY),P(b.minX,b.maxY)])],C.PolyType.ptClip,true);
    op.Execute(C.ClipType.ctIntersection,out,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero);out.sort((a,b)=>Math.abs(C.Clipper.Area(b))-Math.abs(C.Clipper.Area(a)));
    return (out[0]||[]).map(p=>P(p.X/s,p.Y/s));
  }
  function recipe(id,l,r){
    const panels=[],folds=[],continuousBends=[],materialExclusions=[];
    const panel=(id,polygon,regionId='paper',holeIds=[])=>{let p=panels.find(p=>p.id===id);if(!p){p={id,regions:[]};panels.push(p);}p.regions.push({id:regionId,polygon,holeIds});};
    const fold=(parent,child,a,b,refs)=>folds.push({id:'fold.'+child,parent,child,a,b,refs});
    if(id==='B001'){
      const xs=l.anchors.panelsX,top=l.anchors.bodyTopY,bottom=l.anchors.bodyBottomY,b=l.bounds,outline=sample(l.fillPath,r,2600),hy=Math.max(...sample(elementD(l.requiredCutElements[0],r),r,180).map(p=>p.y));
      const add=(name,x0,x1,y0,y1,regionId='paper',holes=[])=>panel(name,clipB001(outline,{x0,x1,y0,y1}),regionId,holes);
      add('glue',b.minX,xs[0],top,bottom);add('front',xs[0],xs[1],top,bottom);add('back',xs[2],xs[3],top,bottom);
      add('sideL',xs[1],xs[2],b.minY,bottom,'paper',['opening.2']);add('sideR',xs[3],xs[4],b.minY,bottom,'paper',['opening.3']);
      for(const [name,i,h] of [['front',0,0],['back',2,1]]){add(name+'Roof',xs[i],xs[i+1],hy,top,'roof');add(name+'Roof',xs[i],xs[i+1],b.minY,hy,'handle',['opening.'+h]);continuousBends.push({panelId:name+'Roof',regionIds:['roof','handle'],kind:'unscored-handle-neck',legacyVirtualAxis:{a:P(xs[i],hy),b:P(xs[i+1],hy)}});}
      ['front','sideL','back','sideR'].forEach((name,i)=>add(name+'Bottom',xs[i],xs[i+1],bottom,b.maxY));
      for(const [parent,child,x,ref] of [['front','sideL',xs[1],3],['sideL','back',xs[2],4],['back','sideR',xs[3],9]])fold(parent,child,P(x,top),P(x,bottom),[ref]);
      fold('front','glue',P(xs[0],bottom),P(xs[0],top),[0]);
      ['front','sideL','back','sideR'].forEach((name,i)=>fold(name,name+'Bottom',P(xs[i],bottom),P(xs[i+1],bottom),[[5,6,10,11][i]]));
      fold('front','frontRoof',P(xs[1],top),P(xs[0],top),[2]);fold('back','backRoof',P(xs[2],top),P(xs[3],top),[8]);
      for(const name of ['sideL','sideR'])continuousBends.push({panelId:name,regionIds:['paper'],kind:'continuous-slot-wing',sourceFunction:'curveSlotWing',datumY:top});
    }else if(id==='B002'){
      source.B002.panels.forEach(p=>panel(p.id,copy(p.polygon),'paper',p.id==='frontTop'?['opening.0']:p.id==='backHandle'?['opening.1']:[]));
      source.B002.folds.forEach(f=>{const n=+f.id.split('-').at(-1);fold(f.parent,f.child,copy(f.axis.a),copy(f.axis.b),n===14?[12,13]:n===17?[16,17]:n===20?[19,20]:[n-1]);});
    }else{
      const paths=r.C001_getPanelPaperPaths(),sources={glue:paths[0].d,base:paths[1],sideBack:paths[2],lidTop:paths[3],sideFront:paths[6]},raw={};
      Object.entries(sources).forEach(([key,d])=>raw[key]=sample(r.C001_transformPathD(d,l),r));
      const b=l.dielineBounds||l.bounds,top=l.mapPoint(0,487.016).y,bottom=l.mapPoint(0,1266.547).y;
      const band=(minY,maxY)=>({minX:b.minX-20,maxX:b.maxX+20,minY,maxY});panel('glue',raw.glue);
      for(const [key,main,upper,lower] of [['base','baseMain','slotTop','slotBottom'],['sideBack','sideBackMain','backFlapTop','backFlapBottom'],['lidTop','lidMain','lockTop','lockBottom'],['sideFront','sideFrontMain','frontFlapTop','frontFlapBottom']]){
        panel(main,clipC001(raw[key],band(top,bottom),r),'paper',main==='lidMain'?['opening.0','opening.1']:[]);panel(upper,clipC001(raw[key],band(b.minY-20,top),r));panel(lower,clipC001(raw[key],band(bottom,b.maxY+20),r));
      }
      source.C001.handlePaths.forEach((d,i)=>{const name=i?'handleRight':'handleLeft';panel(name,sample(r.C001_transformPathD(d,l),r));materialExclusions.push({panelId:'lidMain',excludedPanelId:name,regionId:'paper',manufacturingHole:false});});
      for(const [name,x1,x2] of [['lidMain',2411.179,2415.993],['sideFrontMain',2415.993,2420.245]])panel(name,[l.mapPoint(x1,491.5),l.mapPoint(x2,491.5),l.mapPoint(x2,1262),l.mapPoint(x1,1262)],'legacySeam');
      const f=(parent,child,x1,y1,x2,y2,refs)=>fold(parent,child,l.mapPoint(x1,y1),l.mapPoint(x2,y2),refs);
      f('lidMain','sideBackMain',1636.469,487.016,1636.469,1266.549,[15]);f('sideBackMain','baseMain',1239.618,487.016,1239.618,1266.547,[12]);f('baseMain','glue',460.09,487.02,460.09,1266.546,[16]);f('lidMain','sideFrontMain',2415.993,487.016,2415.993,1266.547,[14]);
      f('sideBackMain','backFlapTop',1239.618,487.016,1636.469,487.016,[1]);f('sideBackMain','backFlapBottom',1636.469,1266.547,1239.618,1266.547,[11]);
      f('sideFrontMain','frontFlapTop',2415.993,487.016,2810.064,487.016,[0]);f('sideFrontMain','frontFlapBottom',2810.064,1266.547,2415.993,1266.547,[10]);
      f('baseMain','slotTop',460.09,487.016,1239.618,487.016,[3]);f('baseMain','slotBottom',1239.618,1266.547,460.09,1266.547,[17]);
      f('lidMain','lockTop',1636.469,487.016,2415.993,487.016,[2]);f('lidMain','lockBottom',2415.993,1266.547,1636.469,1266.547,[13]);
      f('lidMain','handleLeft',1979.041,630.797,1979.041,1122.772,[4,5]);f('lidMain','handleRight',2073.419,1122.772,2073.419,630.797,[8,9]);
    }
    return {panels,folds,continuousBends,materialExclusions};
  }
  function convert(id,input={},r,legacy){
    if(!['B001','B002','C001'].includes(id)||!validator?.validate||!source)throw new Error('Bakery/cake mapping: missing mapping dependency.');
    for(const name of [id+'_getLayout','T001_transformPathD','T001_elementToPathD'])if(typeof r?.[name]!=='function')throw new Error('Bakery/cake mapping: missing source '+name);
    for(const k of ['W','D','H'])if(input[k]!==undefined&&(!Number.isFinite(+input[k])||+input[k]<=0))throw new Error('Bakery/cake mapping: invalid dimension.');
    const requested={...copy(legacy?.options||{}),...copy(input)},cfg=id==='C001'?r.C001_resolveConfig(requested):r[id+'_getSpec'](requested),dimensions=Object.fromEntries(['W','D','H'].map(k=>[k,cfg[k]]));
    if(Object.values(dimensions).some(v=>!Number.isFinite(v)||v<=0))throw new Error('Bakery/cake mapping: invalid resolved dimension.');
    if(id==='B002'&&['W','D','H'].some(k=>dimensions[k]!==source.B002.dimensions[k]))throw new Error('Bakery/cake mapping: fixed B002 source recipe changed.');
    const l=legacy?legacy.layout:id==='C001'?r.C001_getLayout(requested):r[id+'_getLayout'](cfg.W,cfg.D,cfg.H,requested);
    const lc=id==='C001'?l?.cfg:l?.spec;
    if(!l||legacy&&legacy.code!==id||['W','D','H'].some(k=>lc?.[k]!==dimensions[k]||legacy&&legacy.dimensions?.[k]!==dimensions[k]))throw new Error('Bakery/cake mapping: source/dimension mismatch.');
    if(l.cutElements.length!=={B001:16,B002:7,C001:56}[id]||l.foldElements.length!=={B001:12,B002:21,C001:19}[id])throw new Error('Bakery/cake mapping: source recipe changed.');
    if(id==='B002'&&legacy&&l.frontPunchEnabled!==(requested.frontPunchEnabled!==false))throw new Error('Bakery/cake mapping: source/option mismatch.');
    if(id==='C001'&&legacy&&['preset','heightOption','handle','windowMode'].some(k=>lc[k]!==cfg[k]))throw new Error('Bakery/cake mapping: source/option mismatch.');
    const diagnostics=[],notice=(code,path,message)=>diagnostics.push({code,path,message});
    const options=id==='C001'?{preset:cfg.preset,heightOption:cfg.heightOption,customH:requested.customH??null,handle:cfg.handle,windowMode:cfg.windowMode}:id==='B002'?{frontPunchEnabled:l.frontPunchEnabled}:{};
    const c={schemaVersion:validator.SCHEMA_VERSION,structureId:id,units:'mm',coordinates:{space:'part-local-2d',x:'right',y:'down',origin:'source-defined'},parameters:{dimensions,options},materials:[{id:'paper',kind:'unspecified',thicknessMm:null}],parts:[{id:'sheet',materialId:'paper',panelIds:[]}],paths:[],panels:[],cuts:[],folds:[],holes:[],slits:[],perforations:[],layers:[],glues:[],insertions:[],bonds:[],source:{mappingOnly:true,builder:id+'_getLayout',assemblyOwner:'structures/'+(id==='C001'?'cake':'bakery')+'/'+id+'/'+id+(id==='B001'?'_3d_test.js':'_3d.js'),sourceCuts:[],sourceFolds:[],unresolvedFeatures:[],excludedSourceElements:[],presentationOpenings:[],unresolvedRelations:[]}};
    if(['W','D','H'].some(k=>requested[k]!==undefined&&+requested[k]!==dimensions[k]))notice(id==='C001'?'DIMENSIONS_RESOLVED_BY_PRESET':'DIMENSIONS_FIXED','parameters.dimensions','Original Spec controls dimensions; requested W/D/H do not override its rules.');
    const edgeMap=new Map();
    const add=(name,shape,provenance)=>{if(!shape.start||!shape.segments.length){c.source.excludedSourceElements.push({id:name,reason:'point-only-no-edge',source:provenance});return null;}const p={id:name,partId:'sheet',...copy(shape),segments:shape.segments.map((s,i)=>({id:'s'+i,...copy(s)})),source:provenance};c.paths.push(p);let a=p.start;edgeMap.set(name,p.segments.map(s=>{const e={a,b:s.to,type:s.type};a=s.to;return e;}));return p;};
    const poly=(name,pts,provenance)=>{pts=clean(pts);if(pts.length<3)throw new Error('Bakery/cake mapping: empty source region '+name);return add(name,{start:pts[0],closed:true,segments:pts.slice(1).concat([pts[0]]).map(to=>({type:'line',to}))},provenance);};
    const shape=el=>{if(id==='C001')el=r.C001_transformElement(el,'',l);return parse(elementD(el,r),r,id==='B002'?p=>P(p.x*l.transform.a+l.transform.e,p.y*l.transform.d+l.transform.f):undefined);};
    const features=(els,kind)=>els.map((el,i)=>{if(id==='C001'&&r.C001_isSourceCallout(el)){c.source.excludedSourceElements.push({field:'layout.'+kind+'Elements',index:i,element:el,reason:'renderer-excluded-callout'});return null;}return add('source.'+kind+'.'+i,shape(el),{field:'layout.'+kind+'Elements',index:i,element:el});});
    const cuts=features(l.cutElements,'cut'),creases=features(l.foldElements,'fold');c.source.sourceCuts=cuts.filter(Boolean).map(p=>p.id);c.source.sourceFolds=creases.filter(Boolean).map(p=>p.id);
    cuts.forEach((p,i)=>{if(p)c.cuts.push({id:'cut.'+i,partId:'sheet',pathId:p.id,kind:id==='C001'&&(i<11||[15,16,23,24,37,38,42,43].includes(i))?'internal':'outer'});});
    if(id==='C001')r.C001_supplementCutElements().forEach((el,i)=>{const p=add('source.cut.supplement'+i,shape(el),{field:'C001_supplementCutElements',element:el});c.source.sourceCuts.push(p.id);c.cuts.push({id:'cut.supplement'+i,partId:'sheet',pathId:p.id,kind:'outer'});});
    const mapped=recipe(id,l,r);c.source.continuousBends=mapped.continuousBends;c.source.materialExclusions=mapped.materialExclusions;
    const owners=id==='B001'?[['frontRoof'],['backRoof'],['sideL'],['sideR']]:id==='B002'?[['frontTop'],['backHandle'],['backRoof','standingHandle']]:[['lidMain'],['lidMain']];
    const openings=id==='B001'?l.requiredCutElements:id==='B002'?l.requiredPunchElements:r.C001_getHandleCutoutPaths().map(d=>'<path d="'+d+'"/>');
    openings.forEach((el,i)=>{const p=add('source.opening.'+i,shape(el),{field:id==='B001'?'layout.requiredCutElements':id==='B002'?'layout.requiredPunchElements':'C001_getHandleCutoutPaths',index:i,element:el});if(!p?.closed)throw new Error('Bakery/cake mapping: open required hole.');c.holes.push({id:'opening.'+i,partId:'sheet',boundaryPathId:p.id,panelIds:owners[i],source:{kind:id==='B001'&&i>1||id==='B002'&&i===0?'slot':'handle',crossPanelNotch:id==='B002'&&i===2}});c.cuts.push({id:'cut.opening.'+i,partId:'sheet',pathId:p.id,kind:'internal'});});
    if(id==='B002')l.punchElements.forEach((el,i)=>{const p=add('source.perforation.'+i,shape(el),{field:'layout.punchElements',element:el});c.source.unresolvedFeatures.push({kind:'perforation',pathId:p.id,panelId:'front',missing:['cutMm','tieMm']});c.source.presentationOpenings.push({panelId:'front',pathId:p.id,manufacturingHole:false,kind:'legacy-optional-front-opening'});notice('UNRESOLVED_PERFORATION_PATTERN',p.id,'Original 2D perforation guide retained; optional legacy 3D removal is not a manufacturing hole.');});
    if(id==='C001'){
      for(const [panelId,indices] of [['slotTop',[37,38,42,43]],['slotBottom',[15,16,23,24]]]){indices.forEach(i=>c.slits.push({id:'slit.'+i,partId:'sheet',pathId:cuts[i].id,panelIds:[panelId],kerfMm:0,source:{kind:'slot-cut',sourceIndex:i}}));c.source.presentationOpenings.push({panelId,sourcePathIds:indices.map(i=>cuts[i].id),manufacturingHole:false,kind:'legacy-slot-ribbon',widthMm:.55,insetMm:.07});}
      c.source.unresolvedFeatures.push({kind:'window-option',value:cfg.windowMode,status:'unconfirmed-not-implemented'});notice('UNRESOLVED_WINDOW_OPTION','parameters.options.windowMode','Window option is not implemented by the original Layout; no Window geometry is invented.');
      notice('LEGACY_3D_CONFIG_DROPS_OPTIONS','source.assemblyOwner','Original C001 viewer passes W/D/H without preset/height options to Layout. Contract uses the actual resolved Layout options; viewer behavior is not changed.');
    }
    const used=new Set();
    mapped.folds.forEach(f=>{const segments=f.refs.map(i=>{if(!creases[i])throw new Error('Bakery/cake mapping: missing crease.');used.add(i);return {pathId:creases[i].id};});c.folds.push({id:f.id,parentPanelId:f.parent,childPanelId:f.child,axis:{partId:'sheet',a:f.a,b:f.b},segments,orientation:{positiveRotation:'right-hand-about-a-to-b'},profile:{kind:'crease',thicknessAware:true,neutralAxis:'material-defined'},source:{sourceIndices:f.refs,axisOwner:'original-3d'}});if(segments.some(s=>edgeMap.get(s.pathId).some(e=>[e.a,e.b].some(q=>Math.abs((f.b.x-f.a.x)*(q.y-f.a.y)-(f.b.y-f.a.y)*(q.x-f.a.x))/dist(f.a,f.b)>.002))))notice('LEGACY_AXIS_DIFFERS_FROM_CREASE',f.id,'Actual crease and legacy hinge axis differ; both are preserved.');});
    creases.forEach((p,i)=>{if(p&&!used.has(i)){c.source.unresolvedFeatures.push({kind:'unassigned-crease',pathId:p.id,sourceIndex:i});notice('UNASSIGNED_SOURCE_CREASE',p.id,'Real crease retained without inventing a new rigid panel/hinge.');}});
    const covers=(a,b,edges)=>{const len=dist(a,b);if(len<1e-9)return false;const on=q=>Math.abs((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))/len<=.002,proj=q=>((q.x-a.x)*(b.x-a.x)+(q.y-a.y)*(b.y-a.y))/len;const intervals=edges.filter(e=>e.type==='line'&&on(e.a)&&on(e.b)).map(e=>[proj(e.a),proj(e.b)].sort((x,y)=>x-y)).sort((x,y)=>x[0]-y[0]);let end=0;for(const q of intervals){if(q[0]>end+.002)break;end=Math.max(end,q[1]);}return end>=len-.002;};
    c.parts[0].panelIds=mapped.panels.map(p=>p.id);
    mapped.panels.forEach(panel=>{const regions=panel.regions.map(region=>{const path=poly('panel.'+panel.id+'.'+region.id,region.polygon,{role:'legacy-display-region',regionId:region.id}),unmatched=[];
      const boundaryBindings=edgeMap.get(path.id).map((e,i)=>{const base={segmentIds:['s'+i]};const slit=c.slits.find(s=>s.panelIds.includes(panel.id)&&covers(e.a,e.b,edgeMap.get(s.pathId)));if(slit)return {...base,kind:'slit',featureId:slit.id};const cut=c.cuts.find(s=>covers(e.a,e.b,edgeMap.get(s.pathId)));if(cut)return {...base,kind:'cut',featureId:cut.id};const fold=c.folds.find(f=>[f.parentPanelId,f.childPanelId].includes(panel.id)&&covers(e.a,e.b,f.segments.flatMap(s=>edgeMap.get(s.pathId))));if(fold)return {...base,kind:'fold',featureId:fold.id};unmatched.push('s'+i);return {...base,kind:'continuous',source:{mechanicalMapping:'unresolved',kind:'legacy-display-boundary-not-manufacturing-feature'}};});
      if(unmatched.length){c.source.unresolvedFeatures.push({kind:'display-boundary',pathId:path.id,segmentIds:unmatched});notice('UNRESOLVED_LEGACY_BOUNDARY',path.id,'Sampled/clipped display edges are not promoted to Cut/Fold features.');}
      return {id:region.id,outerPathId:path.id,holeIds:region.holeIds,boundaryBindings};});c.panels.push({id:panel.id,partId:'sheet',faceConvention:{outside:'negativeZ',inside:'positiveZ'},regions});});
    if(mapped.continuousBends.length)notice('CONTINUOUS_BEND_NOT_RIGID_FOLD','source.continuousBends','Unscored wings and handle-neck flex remain metadata, not fake Fold features.');
    notice('MAPPING_ONLY_NOT_PHYSICAL','materials.paper','Thickness, assembly/contact behavior and unresolved source/display differences are outside this mapping.');
    return {contract:c,validation:validator.validate(c),diagnostics,unresolvedRelations:[],complete:false};
  }
  return Object.freeze({convert});
});
