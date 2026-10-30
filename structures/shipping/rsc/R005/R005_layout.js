/* R005 owns source mapping and fold topology; shared services own rendering/meshes. */
(function(root){'use strict';
const MM=25.4/72,cache=new Map(),bounds=points=>root.PacVuSourceMailerCommon.bounds(points);
function normalize(input={}){const c={...root.R005_SPEC.defaults};for(const k of ['W','D','H']){if(input[k]!==undefined)c[k]=Number(input[k]);if(!(c[k]>0)||!Number.isFinite(c[k]))throw Error('R005 invalid '+k);}return c;}
function getLayout(input){
 const config=normalize(input),key=JSON.stringify(config);if(cache.has(key))return cache.get(key);
 const {W,D,H}=config,src=root.R005_SOURCE;
 const xs=[186.796,824.587,1385.844,2023.635,2579.222],tx=[-W-D,-D,0,W,W+D-2];
 const ys=[840.756,849.969,1044.142,1053.355],ty=[-H/2-9.213*MM,-H/2,H/2,H/2+9.213*MM];
 const x=v=>v<xs[0]?tx[0]+(v-xs[0])*MM:v>xs[4]?tx[4]+(v-xs[4])*MM:root.T001_piecewise(v,xs,tx);
 const y=v=>v<ys[0]?ty[0]+(v-ys[0])*MM*D/198:v>ys[3]?ty[3]+(v-ys[3])*MM*D/198:root.T001_piecewise(v,ys,ty);
 const point=(a,b)=>({x:x(a),y:y(b)}),transform=d=>root.T001_transformPathD(d,{point});
 // Approved R005 correction: inner Back flaps follow D with 0.8 mm clearance.
 // Keep the crease/root and the rounded free-end corners; change the straight span.
 const backFlapLength=D-.8;
 if(backFlapLength<=0)throw Error('R005 Depth must exceed 0.8 mm');
 function transformCut(d,index){
  if(index!==9&&index!==10)return transform(d);
  const top=index===9,hinge=top?ty[1]:ty[2],sign=top?-1:1;
  const sourceLength=sign*(y(top?280.457:1614.179)-hinge);
  const collar=Math.min(10,backFlapLength/4,sourceLength/4);
  return root.T001_transformPathD(d,{point(a,b){
   const p=point(a,b),distance=sign*(p.y-hinge);
   const blend=Math.max(0,Math.min(1,(distance-collar)/(sourceLength-2*collar)));
   p.y+=sign*(backFlapLength-sourceLength)*blend;return p;
  }});
 }
 const cut=src.cut.map((p,i)=>({...p,d:transformCut(p.d,i)}));
 const fold=src.fold.map(f=>({id:f.id,a:point(f.a.x,f.a.y),b:point(f.b.x,f.b.y)}));
 // The two red tear-entry strokes are incisions, not a removed triangular notch.
 // Preserve them in CUT; the uncut paper edge between their roots closes the mesh only.
 const outlineParts=src.cut.map(p=>p.d);
 outlineParts[12]=outlineParts[12].replace('M2010.986,367.52l12.649-5.494','M2023.635,362.026');
 outlineParts[13]='M2023.635,841.716 V362.026';
 const order=[8,10,15,1,7,14,5,3,2,4,13,12,11,6,0,16,9];
 const points=[],joins=[];
 for(const i of order){const ps=root.T001_flattenPathD(transformCut(outlineParts[i],i));if(points.length)joins.push(Math.hypot(points.at(-1).x-ps[0].x,points.at(-1).y-ps[0].y));points.push(...ps);}
 joins.push(Math.hypot(points.at(-1).x-points[0].x,points.at(-1).y-points[0].y));
 const outline={points,maxGapMm:Math.max(...joins)},dielineBounds=bounds(points),panels=[],relations=[];
 function panel(id,label,x0,x1,y0,y1,parent,foldIndex,stage){
  const poly=root.PacVuPhysicalPaper3D.cleanPolygon(root.PacVuPhysicalPaper3D.clipPolygon(points,{minX:x0,maxX:x1,minY:y0,maxY:y1}),.000001);
  if(poly.length<3)throw Error('R005 empty panel '+id);
  panels.push({id,label,points:poly,bounds:bounds(poly)});
  if(parent){const f=fold[foldIndex];relations.push({id:'hinge-'+id,parent,child:id,foldIds:[f.id],axis:{a:f.a,b:f.b},angle:90,stage});}
 }
 const lo=-10000,hi=10000;
 panel('base','Front',0,W,ty[0],ty[3]);
 // Pre-fold the internal glue tab before the body carries it into the seam.
 panel('sideL','Side (L)',-D,0,ty[1],ty[2],'base',2,[.08,.22]);
 panel('back','Back',-D-W,-D,ty[1],ty[2],'sideL',1,[.1,.24]);
 panel('sideR','Side (R)',W,hi,ty[1],ty[2],'base',3,[.22,.28]);
 panel('glue','Glue',lo,-D-W,ty[1],ty[2],'back',0,[0,.07]);
 for(const [id,label,x0,x1,yt,yb,fi,bi] of [
  ['base','Front',0,W,ty[0],ty[3],5,9],['back','Back',-D-W,-D,ty[1],ty[2],4,8],
  ['sideL','Side (L)',-D,0,ty[1],ty[2],6,10],['sideR','Side (R)',W,hi,ty[1],ty[2],7,11]]){
  const side=id.startsWith('side'),front=id==='base';
  panel('top-'+id,'Top flap · '+label,x0,x1,lo,yt,id,fi,side?[.28,.42]:front?[.72,.92]:[.46,.66]);
  panel('bottom-'+id,'Bottom flap · '+label,x0,x1,yb,hi,id,bi,side?[.28,.42]:front?[.72,.92]:[.46,.66]);
 }
 const C=root.ClipperLib,k=10000,offset=new C.ClipperOffset(2,.02*k),rings=new C.Paths();
 const ring=points.map(p=>({X:Math.round(p.x*k),Y:Math.round(p.y*k)}));if(!C.Clipper.Orientation(ring))ring.reverse();
 offset.AddPath(ring,C.JoinType.jtRound,C.EndType.etClosedPolygon);offset.Execute(rings,3*k);
 const bleed=rings.map(r=>root.PacVuSourceMailerCommon.pathD(r.map(p=>({x:p.X/k,y:p.Y/k}))));
 const bleedBounds=bounds(bleed.flatMap(d=>root.T001_flattenPathD(d)));
 const glue=src.glue.map((r,i)=>({id:'glue-'+i,panelId:i?'bottom-base':'top-base',d:transform(`M ${r.x} ${r.y} H ${r.x+r.width} V ${r.y+r.height} H ${r.x} Z`)}));
 const perforations=src.perforations.map(p=>({...p,panelId:'top-base',d:transform(p.d)}));
 const dimensions=[{axis:'W',a:{x:0,y:H/2-10},b:{x:W,y:H/2-10}},{axis:'D',horizontal:true,a:{x:-D,y:H/2-10},b:{x:0,y:H/2-10}},{axis:'H',a:{x:-D-15,y:ty[1]},b:{x:-D-15,y:ty[2]}}];
 const layout={meta:{id:'R005',source:src.file},config,bounds:bleedBounds,dielineBounds,bleedBounds,cut,fold,bleed,outline,panels,relations,dimensions,glue,perforations,cutLines:[],cutRects:[],slots:[],holes:[],presentation:{stand:{angle:Math.PI/2,height:ty[3]}}};
 cache.set(key,layout);if(cache.size>12)cache.delete(cache.keys().next().value);return layout;
}
root.R005_Layout=Object.freeze({normalize,getLayout});
})(window);
