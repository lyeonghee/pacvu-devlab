/* Static TR001/TR002/TR003 mapping, not a renderer or assembly solver.
 * Load after Contract and before Adapter in a browser. No app registration.
 * Layout owns all manufacturing coordinates. Private 3D masks/rig declarations
 * are mirrored below and tested against the original source without editing it.
 * Source cuts/creases remain exact; sampled display polygons, tolerance bridges,
 * artificial slot widths and unmatched boundaries are explicitly distinguished.
 * Contract validation does NOT certify manufacturing/physical completeness.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./PacVu3DContract.js'));
  else root.PacVu3DContractTrayMapping=factory(root.PacVu3DContract);
})(typeof globalThis!=='undefined'?globalThis:this,function(validator){
  'use strict';
  const copy=v=>JSON.parse(JSON.stringify(v)), P=(x,y)=>({x,y});
  const defaults={TR001:{W:282,D:368,H:140},TR002:{W:200,D:280,H:100},TR003:{W:317.5,D:496.8875,H:133.35}};
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), rect=(a,b,c,d)=>[P(a,b),P(c,b),P(c,d),P(a,d)];
  const dOf=el=>{const m=el?.match(/\bd="([^"]+)"/);if(!m)throw new Error('Tray mapping: missing path data.');return m[1];};
  const clean=pts=>{const out=pts.filter((p,i)=>!i||dist(p,pts[i-1])>1e-9).map(p=>P(p.x,p.y));if(out.length>1&&dist(out[0],out.at(-1))<1e-9)out.pop();return out;};
  // Layout emits absolute M/L paths and absolute M/L/C/A/Z opening paths.
  // Reject unknown commands instead of silently flattening or dropping features.
  function parse(d){
    const t=d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)||[];
    let i=0,cmd,start,at,closed=false;const segments=[];
    const n=()=>{const v=Number(t[i++]);if(!Number.isFinite(v))throw new Error('Tray mapping: malformed path.');return v;},point=()=>P(n(),n());
    while(i<t.length){
      if(/^[a-zA-Z]$/.test(t[i]))cmd=t[i++];
      if(cmd==='M'){if(start)throw new Error('Tray mapping: unexpected compound path.');start=at=point();cmd='L';continue;}
      let s;
      if(cmd==='L')s={type:'line',to:point()};
      else if(cmd==='C')s={type:'cubic',control1:point(),control2:point(),to:point()};
      else if(cmd==='A'){const rx=n(),ry=n(),rotationDeg=n(),large=n(),sweep=n();if(![0,1].includes(large)||![0,1].includes(sweep))throw new Error('Tray mapping: invalid arc.');s={type:'arc',rx,ry,rotationDeg,largeArc:!!large,sweep:!!sweep,to:point()};}
      else if(cmd==='Z'){closed=true;if(dist(at,start)>1e-9)segments.push({type:'line',to:copy(start)});cmd=null;continue;}
      else throw new Error('Tray mapping: unsupported path command '+cmd);
      if(!start)throw new Error('Tray mapping: missing start.');segments.push(s);at=s.to;
    }
    if(!start||!segments.length)throw new Error('Tray mapping: empty path.');
    return {start,segments,closed:closed||dist(start,segments.at(-1).to)<1e-9};
  }
  function sample(d,runtime,min){
    if(!runtime.document?.createElementNS)throw new Error('Tray mapping: SVG measurement required.');
    const path=runtime.document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);
    const length=path.getTotalLength();if(!(length>0)||!Number.isFinite(length))throw new Error('Tray mapping: invalid fill.');
    const count=Math.max(min,Math.ceil(length/2));return Array.from({length:count},(_,i)=>{const p=path.getPointAtLength(length*i/count);return P(p.x,p.y);});
  }
  function clip(subject,mask){
    const area=mask.reduce((s,p,i)=>{const q=mask[(i+1)%mask.length];return s+p.x*q.y-q.x*p.y;},0),sign=area>=0?1:-1;let out=subject.slice();
    mask.forEach((a,i)=>{const b=mask[(i+1)%mask.length],input=out;out=[];const inside=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))>=-.01;
      const cross=(p,q)=>{const rx=q.x-p.x,ry=q.y-p.y,sx=b.x-a.x,sy=b.y-a.y,den=rx*sy-ry*sx;if(Math.abs(den)<1e-9)return q;const t=((a.x-p.x)*sy-(a.y-p.y)*sx)/den;return P(p.x+t*rx,p.y+t*ry);};
      input.forEach((q,j)=>{const p=input[(j+input.length-1)%input.length];if(inside(p)!==inside(q))out.push(cross(p,q));if(inside(q))out.push(q);});});return clean(out);
  }
  // TR002 outerFace: it uses the ORIGINAL source cut+fold planar graph, not
  // layout.cutFillElement. The 1.1mm node weld belongs to legacy display only.
  function outerFace(runtime,layout){
    const s=runtime.TR002_loadReferenceSvg(),tr=runtime.TR002_transformer(layout.spec);
    const raw=[...s.cutElements,...s.foldElements].flatMap(el=>runtime.TR002_sourceElementSegments(el,tr)),nodes=[];
    const node=(x,y)=>{let best=-1,d=1.1;nodes.forEach((n,i)=>{const next=Math.hypot(n.x-x,n.y-y);if(next<d){best=i;d=next;}});if(best>=0)return best;nodes.push({x,y,links:[]});return nodes.length-1;};
    raw.forEach(s=>{const a=node(s[0],s[1]),b=node(s[2],s[3]);if(a===b||nodes[a].links.includes(b))return;nodes[a].links.push(b);nodes[b].links.push(a);});
    nodes.forEach(n=>n.links.sort((a,b)=>Math.atan2(nodes[a].y-n.y,nodes[a].x-n.x)-Math.atan2(nodes[b].y-n.y,nodes[b].x-n.x)));
    const visited=new Set(),faces=[];
    nodes.forEach((n,a)=>n.links.forEach(b=>{const start=a+':'+b;if(visited.has(start))return;const face=[];let from=a,to=b,closed=false;
      for(let guard=0;guard<raw.length*4;guard++){const key=from+':'+to;if(visited.has(key)){closed=key===start;break;}visited.add(key);face.push(P(nodes[from].x,nodes[from].y));const links=nodes[to].links,index=links.indexOf(from);if(index<0||links.length<2)break;const next=links[(index-1+links.length)%links.length];from=to;to=next;if(from+':'+to===start){closed=true;break;}}
      if(closed&&face.length>2)faces.push(face);}));
    const area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p.x*q.y-q.x*p.y;},0));
    const face=faces.sort((a,b)=>area(b)-area(a))[0];if(!face)throw new Error('Tray mapping: missing outer face.');return face;
  }
  function tab(bounds,top){
    const {x1,x2,y1,y2}=bounds,r=Math.min(bounds.r,(x2-x1)/2,(y2-y1)/2),segments=[];
    const L=(x,y)=>segments.push({type:'line',to:P(x,y)}),Q=(x,y,a,b)=>segments.push({type:'quadratic',control:P(x,y),to:P(a,b)});
    const start=P(x1,top?y2:y1);
    if(top){L(x1,y1+r);Q(x1,y1,x1+r,y1);L(x2-r,y1);Q(x2,y1,x2,y1+r);L(x2,y2);}
    else{L(x2,y1);L(x2,y2-r);Q(x2,y2,x2-r,y2);L(x1+r,y2);Q(x1,y2,x1,y2-r);}
    segments.push({type:'line',to:start});return {start,segments,closed:true};
  }
  function recipe(id,l,cfg,runtime){
    const p=l.params,panels=[],folds=[],presentationOpenings=[];
    const outline=id==='TR002'?outerFace(runtime,l):sample(dOf(id==='TR003'?runtime.TR003_buildPanelFill(p,l.spec):l.cutFillElement),runtime,id==='TR003'?64:48);
    function panel(name,masks,direct=false){const regions=masks.map((mask,i)=>({id:'region'+i,polygon:direct?clean(mask):clip(outline,mask),mask:copy(mask)}));panels.push({id:name,regions});return name;}
    const fold=(parent,child,a,b,refs)=>folds.push({id:'fold.'+child,parent,child,a,b,refs});
    if(id!=='TR003'){
      const sx=cfg.W/defaults[id].W,sy=cfg.H/defaults[id].H,sl=id==='TR001'?l.spec.lip/60:l.spec.dustFlap/50,mid=(p.x1+p.x2)/2;
      const upperTab={x1:mid-34*sx,x2:mid+34*sx,y1:p.y1-10*sl,y2:p.y1+sy,r:5*Math.min(sx,sl)},lowerTab={x1:mid-34*sx,x2:mid+34*sx,y1:p.y4-sy,y2:p.y4+10*sl,r:5*Math.min(sx,sl)};
      const u={x1:mid-35*sx,x2:mid+35*sx,y1:p.y2-10*sy,y2:p.y2+5*sy},b={x1:mid-35*sx,x2:mid+35*sx,y1:p.y3-5*sy,y2:p.y3+10*sy};
      panel('base',[rect(p.x1,u.y2,p.x2,b.y1),rect(p.x1,p.y2,u.x1,u.y2),rect(u.x2,p.y2,p.x2,u.y2),rect(p.x1,b.y1,b.x1,p.y3),rect(b.x2,b.y1,p.x2,p.y3)]);
      panel('panel-1-back',[rect(p.x1,p.y1,p.x2,u.y1),rect(p.x1,u.y1,u.x1,p.y2),rect(u.x2,u.y1,p.x2,p.y2)]);
      panel('panel-1-front',[rect(p.x1,b.y2,p.x2,p.y4),rect(p.x1,p.y3,b.x1,b.y2),rect(b.x2,p.y3,p.x2,b.y2)]);
      const one=id==='TR001';
      fold('base','panel-1-back',P(p.x2,p.y2),P(p.x1,p.y2),[[1],[2]]);
      fold('base','panel-1-front',P(p.x1,p.y3),P(p.x2,p.y3),one?[[6],[7]]:[[8],[9]]);
      for(const [end,y1,y2] of [['back',p.y1,p.y2],['front',p.y3,p.y4]])for(const [side,x1,x2] of [['left',p.x0,p.x1],['right',p.x2,p.x3]])panel('panel-2-'+end+'-'+side,[rect(x1,y1,x2,y2)]);
      fold('panel-1-back','panel-2-back-left',P(p.x1,p.y2),P(p.x1,p.y1),one?[[4,1]]:[[6]]);
      fold('panel-1-back','panel-2-back-right',P(p.x2,p.y1),P(p.x2,p.y2),one?[[12]]:[[14]]);
      fold('panel-1-front','panel-2-front-left',P(p.x1,p.y3),P(p.x1,p.y4),one?[[9,1]]:[[11]]);
      fold('panel-1-front','panel-2-front-right',P(p.x2,p.y4),P(p.x2,p.y3),one?[[14]]:[[16]]);
      panel('panel-3-left',[rect(p.x0,p.y2,p.x1,p.y3)]);panel('panel-3-right',[rect(p.x2,p.y2,p.x3,p.y3)]);
      fold('base','panel-3-left',P(p.x1,p.y2),P(p.x1,p.y3),one?[[0]]:[[5]]);
      fold('base','panel-3-right',P(p.x2,p.y3),P(p.x2,p.y2),one?[[11]]:[[13]]);
      panel('panel-4-back',[rect(p.x1,p.y0,p.x2,p.y1)]);panel('panel-4-front',[rect(p.x1,p.y4,p.x2,p.y5)]);
      fold('panel-1-back','panel-4-back',P(p.x1,p.y1),P(p.x2,p.y1),one?[[3],[4,0]]:[[3],[4]]);
      fold('panel-1-front','panel-4-front',P(p.x2,p.y4),P(p.x1,p.y4),one?[[8],[9,0]]:[[10],[17]]);
      for(const [end,bounds,top] of [['back',upperTab,true],['front',lowerTab,false]]){
        panels.find(p=>p.id==='panel-1-'+end).regions.push({id:top?'upper-u-cut-tab':'lower-u-cut-tab',shape:tab(bounds,top),source:{field:'tabMesh',bounds:copy(bounds)}});
        presentationOpenings.push({panelId:'panel-4-'+end,kind:'legacy-rounded-rectangle-cutout',bounds:copy(bounds),manufacturingHole:false});
      }
      for(const [end,y1,y2] of [['back',p.y0,p.y1],['front',p.y4,p.y5]])for(const [side,x1,x2] of [['left',p.x0,p.x1],['right',p.x2,p.x3]])panel('panel-5-'+end+'-'+side,[rect(x1,y1,x2,y2)]);
      fold('panel-4-back','panel-5-back-left',P(p.x1,p.y1),P(p.x1,p.y0),one?[[5]]:[[0]]);
      fold('panel-4-back','panel-5-back-right',P(p.x2,p.y0),P(p.x2,p.y1),one?[[13]]:[[12]]);
      fold('panel-4-front','panel-5-front-left',P(p.x1,p.y4),P(p.x1,p.y5),one?[[10]]:[[7]]);
      fold('panel-4-front','panel-5-front-right',P(p.x2,p.y5),P(p.x2,p.y4),one?[[15]]:[[15]]);
    }else{
      const H=cfg.H,sourceH=555.203-177.751,ci=H*(555.203-547.535)/sourceH,si=H*(565.335-555.203)/sourceH;
      const tu=p.y1-ci,tl=p.y1+si,tm=(tu+tl)/2,bu=p.y2-si,bl=p.y2+ci,bm=(bu+bl)/2,r=Math.max(.8,(tl-tu)/2),ro=Math.max(2,H*(594.787-555.281)/(930.768-555.281));
      const arc=(pts,x,y,rad,a,b)=>{for(let i=0;i<=10;i++){const t=a+(b-a)*i/10;pts.push(P(x+Math.cos(t)*rad,y+Math.sin(t)*rad));}};
      const mx=pts=>pts.map(q=>P(p.x0+p.x3-q.x,q.y)).reverse(),my=pts=>pts.map(q=>P(q.x,p.y0+p.y3-q.y)).reverse();
      const fl=[P(p.x0+ro,p.y0),P(p.x1,p.y0),P(p.x1,tm)];arc(fl,p.x1-r,tm,r,0,-Math.PI/2);fl.push(P(p.x0,tu),P(p.x0,p.y0+ro));arc(fl,p.x0+ro,p.y0+ro,ro,Math.PI,Math.PI*1.5);
      const left=[P(p.x0,tl),P(p.x1-r,tl)];arc(left,p.x1-r,tm,r,Math.PI/2,0);left.push(P(p.x1,bm));arc(left,p.x1-r,bm,r,0,-Math.PI/2);left.push(P(p.x0,bu));
      panel('base',[rect(p.x1,p.y1,p.x2,p.y2)]);
      panel('panel-1-left',[left],true);panel('panel-1-right',[mx(left)],true);
      fold('base','panel-1-left',P(p.x1,p.y1),P(p.x1,p.y2),[[6]]);fold('base','panel-1-right',P(p.x2,p.y2),P(p.x2,p.y1),[[3]]);
      panel('panel-2-front',[rect(p.x1,p.y0,p.x2,p.y1)]);panel('panel-2-back',[rect(p.x1,p.y2,p.x2,p.y3)]);
      fold('base','panel-2-front',P(p.x2,p.y1),P(p.x1,p.y1),[[5]]);fold('base','panel-2-back',P(p.x1,p.y2),P(p.x2,p.y2),[[1]]);
      panel('panel-3-front-left',[fl],true);panel('panel-3-front-right',[mx(fl)],true);panel('panel-3-back-left',[my(fl)],true);panel('panel-3-back-right',[mx(my(fl))],true);
      fold('panel-2-front','panel-3-front-left',P(p.x1,p.y1),P(p.x1,p.y0),[[7]]);fold('panel-2-front','panel-3-front-right',P(p.x2,p.y0),P(p.x2,p.y1),[[4]]);
      fold('panel-2-back','panel-3-back-left',P(p.x1,p.y2),P(p.x1,p.y3),[[2]]);fold('panel-2-back','panel-3-back-right',P(p.x2,p.y3),P(p.x2,p.y2),[[0]]);
      const w=Math.max(8,H*.5),t=Math.max(1.1,H*.012),v=Math.max(8,H*.34);
      for(const side of ['left','right'])for(const [y,direction] of [[p.y1+cfg.D*.14,1],[p.y2-cfg.D*.14,-1]])presentationOpenings.push({panelId:'panel-1-'+side,kind:'legacy-l-cut-width',bounds:{type:'l-cut',x1:side==='left'?p.x1-w:p.x2+.6,x2:side==='left'?p.x1-.6:p.x2+w,y,thickness:t,vertical:v,direction,end:side},manufacturingHole:false});
      const length=H*((744.98-555.281)/(930.768-555.281));
      for(const [end,y] of [['front',p.y0+H*(373.146-177.751)/(555.203-177.751)],['back',p.y2+H*(2136.315-1954.076)/(2331.528-1954.076)]])for(const side of ['left','right'])presentationOpenings.push({panelId:'panel-3-'+end+'-'+side,kind:'legacy-slit-width',bounds:{x1:side==='left'?p.x0+.25:p.x3-length,x2:side==='left'?p.x0+length:p.x3-.25,y1:y-t/2,y2:y+t/2,r:t/2},manufacturingHole:false});
    }
    return {panels,folds,presentationOpenings,outline};
  }
  function convert(id,input={},runtime,legacy){
    if(!defaults[id]||!validator?.validate)throw new Error('Tray mapping: unsupported structure/validator.');
    const dimensions=Object.fromEntries(['W','D','H'].map(k=>[k,Number(input[k]??legacy?.dimensions?.[k]??defaults[id][k])])),cfg={...copy(legacy?.options||{}),...copy(input),...dimensions};
    if(Object.values(dimensions).some(n=>!Number.isFinite(n)||n<=0))throw new Error('Tray mapping: invalid dimension.');
    if(!runtime||typeof runtime[id+'_getLayout']!=='function')throw new Error('Tray mapping: missing original Layout.');
    const l=legacy?legacy.layout:runtime[id+'_getLayout'](cfg.W,cfg.D,cfg.H,cfg);
    if(!l||legacy&&legacy.code!==id||['W','D','H'].some(k=>l.spec?.[k]!==dimensions[k]||legacy&&legacy.dimensions?.[k]!==dimensions[k]))throw new Error('Tray mapping: source/dimension mismatch.');
    if(l.cutElements?.length!=={TR001:98,TR002:91,TR003:26}[id]||l.foldElements?.length!=={TR001:17,TR002:18,TR003:8}[id]||l.holes.length!==l.holeElements.length)throw new Error('Tray mapping: source recipe changed.');
    const diagnostics=[],notice=(code,path,message)=>diagnostics.push({code,path,message});
    const c={schemaVersion:validator.SCHEMA_VERSION,structureId:id,units:'mm',coordinates:{space:'part-local-2d',x:'right',y:'down',origin:'source-defined'},parameters:{dimensions,options:copy(Object.fromEntries(Object.entries(cfg).filter(([k])=>!['W','D','H'].includes(k))))},materials:[{id:'paper',kind:'unspecified',thicknessMm:null}],parts:[{id:'sheet',materialId:'paper',panelIds:[]}],paths:[],panels:[],cuts:[],folds:[],holes:[],slits:[],perforations:[],layers:[],glues:[],insertions:[],bonds:[],source:{mappingOnly:true,builder:id+'_getLayout',assemblyOwner:'structures/tray/'+id+'/'+id+'_3d.js',unresolvedFeatures:[],unresolvedRelations:[],sourceCuts:[],sourceFolds:[],presentationOpenings:[],insertLidRounded:l.insertLidRounded??null}};
    const edges=new Map(),paths=new Map();
    function add(pathId,shape,source){const path={id:pathId,partId:'sheet',...copy(shape),segments:shape.segments.map((s,i)=>({id:'s'+i,...copy(s)})),source};c.paths.push(path);paths.set(pathId,path);let a=path.start;edges.set(pathId,path.segments.map(s=>{const e={a,b:s.to,type:s.type};a=s.to;return e;}));return path;}
    function poly(pathId,pts,closed,source){const points=closed?clean(pts):pts.map(p=>P(p.x,p.y));if(points.length<2)throw new Error('Tray mapping: empty region '+pathId);if(closed)points.push(points[0]);return add(pathId,{closed,start:points[0],segments:points.slice(1).map(to=>({type:'line',to}))},source);}
    const cutPaths=l.cutElements.map((el,i)=>add('source.cut.'+i,parse(dOf(el)),{field:'layout.cutElements',index:i,element:el}));
    c.source.sourceCuts=cutPaths.map(p=>p.id);
    const foldPaths=l.foldElements.map((el,i)=>add('source.fold.'+i,parse(dOf(el)),{field:'layout.foldElements',index:i,element:el}));c.source.sourceFolds=foldPaths.map(p=>p.id);
    const mapped=recipe(id,l,cfg,runtime);c.source.presentationOpenings=copy(mapped.presentationOpenings);
    poly('source.legacyFill',mapped.outline,true,{role:'legacy-display-fill-not-manufacturing-cut'});
    const grouped=new Set();
    // Preserve each original cut segment, including tiny endpoint discrepancies.
    // A composite contour additionally exposes topology; bridges are labelled,
    // never added to the manufacturing Cut collection.
    function group(name,indices,closed,panelIds,kind){
      const pending=indices.map(i=>({i,pts:[cutPaths[i].start,...cutPaths[i].segments.map(s=>s.to)]}));
      const eps=.01*Math.max(1,cfg.W/defaults[id].W,cfg.D/defaults[id].D,cfg.H/defaults[id].H);
      let first=pending[0],reverse=false;
      if(!closed){outer:for(const q of pending)for(const end of [0,q.pts.length-1])if(!pending.some(v=>v!==q&&[v.pts[0],v.pts.at(-1)].some(p=>dist(p,q.pts[end])<=eps))){first=q;reverse=end!==0;break outer;}}
      pending.splice(pending.indexOf(first),1);const pts=reverse?first.pts.slice().reverse():first.pts.slice(),bridges=[];
      while(pending.length){let best,rev=false,d=Infinity;pending.forEach(q=>{for(const r of [false,true]){const dd=dist(pts.at(-1),r?q.pts.at(-1):q.pts[0]);if(dd<d){best=q;rev=r;d=dd;}}});if(d>eps)throw new Error('Tray mapping: disconnected feature '+name);const next=rev?best.pts.slice().reverse():best.pts; if(d>1e-9)bridges.push({a:copy(pts.at(-1)),b:copy(next[0]),lengthMm:d});pts.push(...next);pending.splice(pending.indexOf(best),1);}
      if(closed){const d=dist(pts.at(-1),pts[0]);if(d>eps)throw new Error('Tray mapping: open hole '+name);if(d>1e-9)bridges.push({a:copy(pts.at(-1)),b:copy(pts[0]),lengthMm:d});}
      const path=poly('feature.'+name,pts,closed,{sourcePathIds:indices.map(i=>cutPaths[i].id),kind,toleranceBridges:bridges,role:bridges.length?'topology-contour-with-explicit-source-gaps':'source-contour'});
      indices.forEach(i=>grouped.add(i));
      indices.forEach(i=>c.cuts.push({id:'cut.'+i,partId:'sheet',pathId:cutPaths[i].id,kind:'internal'}));
      if(closed)c.holes.push({id:name,partId:'sheet',boundaryPathId:path.id,panelIds,source:{kind,sourcePathIds:path.source.sourcePathIds,toleranceBridges:bridges}});
      else {c.slits.push({id:name,partId:'sheet',pathId:path.id,panelIds,kerfMm:0,source:{kind,sourcePathIds:path.source.sourcePathIds}});}
      if(bridges.length)notice('SOURCE_ENDPOINT_GAPS',path.id,'Composite topology has explicit sub-tolerance bridges; original Cut coordinates remain unmodified.');
      return path;
    }
    if(id!=='TR003'){
      group('upper-u-cut',id==='TR001'?[0,1,2,3,4]:[8,9,10,14,15],false,['panel-1-back','panel-4-back'],'u-cut');
      group('lower-u-cut',id==='TR001'?[30,31,32,33,34]:[35,36,37,41,42],false,['panel-1-front','panel-4-front'],'u-cut');
      group('upper-lock-opening',id==='TR001'?[5,6,7,8,9]:[6,7,12,13,20],true,['base','panel-1-back'],'closed-cutout');
      group('lower-lock-opening',id==='TR001'?[10,11,12,13,14]:[32,33,34,39,40,46],true,['base','panel-1-front'],'closed-cutout');
      if(id==='TR002'){group('source-short-slit',[90],false,['base'],'unresolved-short-cut');notice('UNRESOLVED_SHORT_CUT','slits.source-short-slit','Original short cut retained; no insertion purpose is inferred.');}
    }else{
      for(const [i,panel,kind] of [[5,'panel-1-right','l-cut'],[11,'panel-1-left','l-cut'],[13,'panel-1-left','l-cut'],[20,'panel-1-right','l-cut'],[6,'panel-3-back-right','slit'],[12,'panel-3-back-left','slit'],[14,'panel-3-front-left','slit'],[21,'panel-3-front-right','slit']])group('cut-slit-'+i,[i],false,[panel],kind);
    }
    cutPaths.forEach((path,i)=>{if(!grouped.has(i))c.cuts.push({id:'cut.'+i,partId:'sheet',pathId:path.id,kind:'outer'});});
    l.holes.forEach((h,i)=>{
      const p=l.params,panelId=h.cx<p.x1?'panel-3-left':h.cx>p.x2?'panel-3-right':h.cy<p.y2?'panel-1-back':'panel-1-front';
      const path=add('opening.'+h.id,parse(dOf(l.holeElements[i])),{field:'layout.holeElements',element:l.holeElements[i],original:copy(h)});
      if(!path.closed)throw new Error('Tray mapping: open parametric hole.');
      c.holes.push({id:h.id,partId:'sheet',boundaryPathId:path.id,panelIds:[panelId],source:{field:'layout.holes',original:copy(h)}});c.cuts.push({id:'cut.hole.'+h.id,partId:'sheet',pathId:path.id,kind:'internal'});
    });
    const used=new Set();
    mapped.folds.forEach(f=>{
      const segments=f.refs.map(([i,j])=>{const original=foldPaths[i];if(!original)throw new Error('Tray mapping: missing crease.');
        if(j===undefined){original.segments.forEach((_,k)=>used.add(i+':'+k));return {pathId:original.id};}
        const edge=edges.get(original.id)[j];if(!edge)throw new Error('Tray mapping: missing crease segment.');used.add(i+':'+j);return {pathId:poly(original.id+'.segment'+j,[edge.a,edge.b],false,{field:'layout.foldElements',index:i,segmentIndex:j}).id};});
      c.folds.push({id:f.id,parentPanelId:f.parent,childPanelId:f.child,axis:{partId:'sheet',a:copy(f.a),b:copy(f.b)},segments,orientation:{positiveRotation:'right-hand-about-a-to-b'},profile:{kind:'crease',thicknessAware:true,neutralAxis:'material-defined'},source:{field:'build.attach',sourceRefs:copy(f.refs)}});
      if(segments.some(s=>edges.get(s.pathId).some(e=>[e.a,e.b].some(q=>Math.abs((f.b.x-f.a.x)*(q.y-f.a.y)-(f.b.y-f.a.y)*(q.x-f.a.x))/dist(f.a,f.b)>.002))))notice('LEGACY_AXIS_DIFFERS_FROM_CREASE',f.id,'Actual source crease and existing 3D hinge axis differ; both are retained, not conflated.');
    });
    foldPaths.forEach((p,i)=>p.segments.forEach((s,j)=>{if(!used.has(i+':'+j)){c.source.unresolvedFeatures.push({kind:'unassigned-crease',pathId:p.id,segmentId:s.id});notice('UNASSIGNED_SOURCE_CREASE',p.id,'Source crease has no existing 3D parent-child relation; no false hinge is created.');}}));
    l.staticPerforationElements.forEach((el,i)=>{const path=add('source.perforation.'+i,parse(dOf(el)),{field:'layout.staticPerforationElements',element:el});c.source.unresolvedFeatures.push({kind:'perforation',pathId:path.id,missing:['cutMm','tieMm']});notice('UNRESOLVED_PERFORATION_PATTERN',path.id,'Source contour retained without inventing manufacturing cut/tie lengths.');});
    // A source cut/crease must cover a full edge before binding. Clip seams and
    // unmatched display approximations stay distinct and are never new cuts.
    const covers=(a,b,es)=>{const len=dist(a,b);if(len<1e-9)return false;const on=q=>Math.abs((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))/len<=.002,project=q=>((q.x-a.x)*(b.x-a.x)+(q.y-a.y)*(b.y-a.y))/len;
      const intervals=es.filter(e=>e.type==='line'&&on(e.a)&&on(e.b)).map(e=>[project(e.a),project(e.b)].sort((x,y)=>x-y)).sort((x,y)=>x[0]-y[0]);let end=0;for(const interval of intervals){if(interval[0]>end+.002)break;end=Math.max(end,interval[1]);}return end>=len-.002;};
    const endpoints=[...cutPaths,...foldPaths].flatMap(p=>[p.start,...p.segments.map(s=>s.to)]);
    c.parts[0].panelIds=mapped.panels.map(p=>p.id);
    mapped.panels.forEach(panel=>{
      const regions=panel.regions.map(region=>{
        let path;
        if(region.shape)path=add('panel.'+panel.id+'.'+region.id,region.shape,region.source);
        else{
          if(region.polygon.length<3)throw new Error('Tray mapping: original 3D region is empty: '+panel.id+'.'+region.id+'. Source fill/clipping needs review; no substitute geometry was created.');
          const split=[];region.polygon.forEach((a,i)=>{const b=region.polygon[(i+1)%region.polygon.length],len=dist(a,b);split.push(a);if(len<1e-9)return;
            const ts=endpoints.map(q=>({q,t:((q.x-a.x)*(b.x-a.x)+(q.y-a.y)*(b.y-a.y))/(len*len)})).filter(({q,t})=>t>1e-8&&t<1-1e-8&&Math.abs((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))/len<1e-7).sort((x,y)=>x.t-y.t);
            ts.forEach(({t})=>{const q=P(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);if(dist(split.at(-1),q)>1e-9)split.push(q);});});
          path=poly('panel.'+panel.id+'.'+region.id,split,true,{field:'build.region/clip-mask',mask:region.mask,role:'legacy-3d-region'});
        }
        const bindings=edges.get(path.id).map((e,i)=>{
          const binding={segmentIds:['s'+i]};
          if(e.type==='line'){
            const slit=c.slits.find(s=>s.panelIds.includes(panel.id)&&covers(e.a,e.b,s.source.sourcePathIds.flatMap(p=>edges.get(p))));if(slit)return {...binding,kind:'slit',featureId:slit.id};
            const cut=c.cuts.find(k=>covers(e.a,e.b,edges.get(k.pathId)));if(cut)return {...binding,kind:'cut',featureId:cut.id};
            const fold=c.folds.find(f=>[f.parentPanelId,f.childPanelId].includes(panel.id)&&covers(e.a,e.b,f.segments.flatMap(s=>edges.get(s.pathId))));if(fold)return {...binding,kind:'fold',featureId:fold.id};
          }
          const partition=e.type==='line'&&panel.regions.some(other=>other!==region&&other.polygon&&covers(e.a,e.b,other.polygon.map((a,j)=>({a,b:other.polygon[(j+1)%other.polygon.length],type:'line'}))));
          if(!partition)notice('UNRESOLVED_LEGACY_BOUNDARY',path.id+'.s'+i,'Display boundary has no exact source feature coverage; retained as unresolved, not a manufactured cut/fold.');
          return {...binding,kind:'continuous',source:{kind:partition?'same-panel-region-partition':'legacy-display-boundary',mechanicalMapping:partition?'continuous':'unresolved'}};
        });
        // Central openings cross panels and are already removed by legacy masks;
        // retain owner references without subtracting a whole hole in every patch.
        const holeIds=c.holes.filter(h=>h.panelIds.includes(panel.id)&&h.source.field==='layout.holes'&&region.mask&&h.source.original.cx>=region.mask[0].x&&h.source.original.cx<=region.mask[2].x&&h.source.original.cy>=region.mask[0].y&&h.source.original.cy<=region.mask[2].y).map(h=>h.id);
        return {id:region.id,outerPathId:path.id,holeIds,boundaryBindings:bindings};
      });
      c.panels.push({id:panel.id,partId:'sheet',faceConvention:{outside:'negativeZ',inside:'positiveZ'},regions});
    });
    for(const f of [...c.holes,...c.slits])if(f.panelIds.some(p=>!c.parts[0].panelIds.includes(p)))throw new Error('Tray mapping: invalid feature owner.');
    notice('LEGACY_DISPLAY_NOT_MANUFACTURING','source.presentationOpenings','Legacy sampled/masked regions and artificial cutout widths are display data, not physical geometry; original feature paths are authoritative.');
    const validation=validator.validate(c);return {contract:c,validation,diagnostics,unresolvedRelations:[],complete:false};
  }
  return Object.freeze({convert});
});
