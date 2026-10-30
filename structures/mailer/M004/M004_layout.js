/* M004 owns source mapping, U-cut ownership and folding topology. */
(function(root){'use strict';
function normalize(input={}){const cfg={...root.M004_SPEC.defaults};for(const k of ['W','D','H'])if(input[k]!==undefined){const n=Number(input[k]);if(!Number.isFinite(n)||n<=0)throw Error('M004 invalid '+k);cfg[k]=n;}return cfg;}
  const MM=25.4/72;
  const cache=new Map();
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const pathD=points=>'M '+points.map(p=>p.x+' '+p.y).join(' L ')+' Z';
  function rectPath(r){
    const {x,y,width:w,height:h,rx,ry}=r;
    return `M ${x+rx} ${y} H ${x+w-rx} A ${rx} ${ry} 0 0 1 ${x+w} ${y+ry} V ${y+h-ry} A ${rx} ${ry} 0 0 1 ${x+w-rx} ${y+h} H ${x+rx} A ${rx} ${ry} 0 0 1 ${x} ${y+h-ry} V ${y+ry} A ${rx} ${ry} 0 0 1 ${x+rx} ${y} Z`;
  }
  function bounds(points){
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    return {minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY};
  }
  // The source fragments stay exact in 2D. Only the mesh contour is sampled.
  // M004 includes two obsolete short right-hand fragments beneath its revised
  // long lock edge; omit those ONLY from contour chaining, not the cut layer.
  function contour(cut,id){
    const excluded=id==='M004'?['cut-1-21R','cut-1-29R','cut-1-25L2','cut-1-25L3']:[];
    const pending=cut.filter(p=>!excluded.includes(p.id)).map(p=>({id:p.id,points:root.T001_flattenPathD(p.d)}));
    const first=pending.shift(),points=first.points.slice(),joins=[];
    while(pending.length){
      const tail=points.at(-1);let best=Infinity,index=-1,reverse=false;
      pending.forEach((p,i)=>{for(const rev of [false,true]){const d=distance(tail,rev?p.points.at(-1):p.points[0]);if(d<best){best=d;index=i;reverse=rev;}}});
      const next=pending.splice(index,1)[0];if(reverse)next.points.reverse();
      joins.push({id:next.id,gapMm:best});points.push(...next.points);
    }
    joins.push({id:first.id,gapMm:distance(points.at(-1),points[0])});
    return {points,joins,maxGapMm:Math.max(...joins.map(j=>j.gapMm))};
  }
  function getLayout(input){
    const id='M004',source=root.M004_SOURCE,config=normalize(input),key=JSON.stringify(config);
    if(cache.has(key))return cache.get(key);
    const fs=Object.fromEntries(source.fold.map(f=>[f.id,f]));
    // Width is between side creases, NOT the shortened back crease endpoints.
    // At reference size every coordinate is the original SVG point in mm.
    const left=fs['f-7L-3'].a.x,right=fs['f-7R-3'].a.x,baseY=fs['f-6'].a.y;
    const ys=['f-2','f-4','f-6','f-8'].map(k=>fs[k].a.y);
    const h=config.H/100,dx=config.W-195,dy=config.D-195,dh=config.H-100;
    const x=v=>v<left?(v-left)*MM*h:v>right?(right-left)*MM+dx+(v-right)*MM*h:(v-left)*MM+dx*(v-left)/(right-left);
    const offsets=[-dy-dh,-dh,0,dy];
    const y=v=>(v-baseY)*MM+(v<ys[0]?offsets[0]+(v-ys[0])*MM*(h-1):v>ys[3]?dy+(v-ys[3])*MM*(h-1):root.T001_piecewise(v,ys,offsets));
    const ty=ys.map(y);
    const mapper={point:(a,b)=>({x:x(a),y:y(b)})};
    const transform=d=>root.T001_transformPathD(d,mapper);
    const cut=source.cut.map(p=>({...p,d:transform(p.d)}));
    const cutLines=(source.cutLines||[]).map((p,i)=>({id:'slot-cap-'+i,a:mapper.point(p.a.x,p.a.y),b:mapper.point(p.b.x,p.b.y)}));
    const cutRects=(source.cutRects||[]).map((r,i)=>({id:'handle-'+i,x:x(r.x),y:y(r.y),width:x(r.x+r.width)-x(r.x),height:y(r.y+r.height)-y(r.y),rx:x(r.x+r.rx)-x(r.x),ry:y(r.y+r.ry)-y(r.y)}));
    const fold=source.fold.map(f=>({id:f.id,a:mapper.point(f.a.x,f.a.y),b:mapper.point(f.b.x,f.b.y)}));
    const slots=source.slots.map(p=>({...p,d:transform(p.d)}));
    // Drilled holes remain circular; source center follows the FRONT panel.
    const holes=source.holes.map((p,i)=>({id:'hole-'+i,cx:x(p.cx),cy:y(p.cy),r:p.r*MM}));
    const outline=contour(cut,id),dielineBounds=bounds(outline.points);
    const F=Object.fromEntries(fold.map(f=>[f.id,f]));
    const panels=[],relations=[];
    function panel(name,minX,maxX,minY,maxY,parent,foldIds,angle=90,stage=[0,1]){
      const points=root.PacVuPhysicalPaper3D.cleanPolygon(root.PacVuPhysicalPaper3D.clipPolygon(outline.points,{minX,maxX,minY,maxY}),.00001);
      if(points.length<3)throw Error(id+': empty panel '+name);
      panels.push({id:name,points,bounds:bounds(points)});
      if(parent){const list=foldIds.map(k=>F[k]);relations.push({id:'hinge-'+name,parent,child:name,foldIds,axis:{a:list[0].a,b:list.at(-1).b},angle,stage});}
    }
    const lo=-10000,hi=10000;
    panel('base',0,x(right),0,ty[3]);
    panel('back',F['f-5L'].a.x,F['f-5R'].a.x,ty[1],0,'base',['f-6'],90,[0,.22]);
    panel('lid',F['f-3L'].a.x,F['f-3R'].a.x,ty[0],ty[1],'back',['f-4'],90,[.7,.9]);
    panel('lid-front',F['f-1L'].a.x,F['f-1R'].a.x,lo,ty[0],'lid',['f-2'],90,[.86,1]);
    panel('front',F['f-9L'].a.x,F['f-9R'].a.x,ty[3],hi,'base',['f-8'],90,[.08,.3]);
    for(const side of ['L','R']){
      const lr=side==='L',edge=(f)=>F[f+side].a.x;
      const wing=(name,f,y0,y1,parent,stage)=>panel(name+'-'+side,lr?lo:edge(f),lr?edge(f):hi,y0,y1,parent,[f+side],90,stage);
      wing('lid-dust','f-1',lo,ty[0],'lid-front',[.6,.76]);
      wing('lid-side','f-3',ty[0],ty[1],'lid',[.56,.7]);
      wing('back-insert','f-5',ty[1],0,'back',[.14,.34]);
      wing('front-insert','f-9',ty[3],hi,'front',[.14,.34]);
      const outer=F['f-7'+side+'-2'].a.x,spine=F['f-7'+side+'-1'].a.x;
      const foldIds=fold.filter(f=>new RegExp('^f-7'+side+'-[345]$').test(f.id)).map(f=>f.id);
      panel('side-'+side,lr?outer:x(right),lr?0:outer,0,ty[3],'base',foldIds,90,[.26,.48]);
      panel('spine-'+side,Math.min(spine,outer),Math.max(spine,outer),0,ty[3],'side-'+side,['f-7'+side+'-2'],90,[.4,.53]);
      panel('lock-'+side,lr?lo:spine,lr?spine:hi,0,ty[3],'spine-'+side,['f-7'+side+'-1'],90,[.45,.58]);
    }
    // U-cut tongues belong to the side walls, not the base. Preserve paper
    // area in Flat and expose the actual U opening when the walls fold up.
    if(id==='M004'){
      const C=root.ClipperLib,k=100000;
      const boolean=(subject,clip,type)=>{
        const convert=p=>p.map(v=>({X:Math.round(v.x*k),Y:Math.round(v.y*k)}));
        const operation=new C.Clipper(),result=new C.Paths();
        operation.AddPath(convert(subject),C.PolyType.ptSubject,true);operation.AddPath(convert(clip),C.PolyType.ptClip,true);
        operation.Execute(type,result,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero);
        if(result.length!==1)throw Error('Unresolved M004 tongue topology');
        return result[0].map(v=>({x:v.X/k,y:v.Y/k}));
      };
      for(const [side,suffix] of [['L','2'],['R','3']]){
        const p=root.T001_parseAbsolutePath(cut.find(p=>p.id==='cut-1-25L'+suffix).d),edge=side==='L'?0:x(right);
        const ends=[p.start,p.segments.at(-1).to].sort((a,b)=>a.y-b.y);
        const tongue=[{x:edge,y:ends[0].y},ends[0],ends[1],{x:edge,y:ends[1].y}];
        for(const [name,type] of [['base',C.ClipType.ctDifference],['side-'+side,C.ClipType.ctUnion]]){
          const panel=panels.find(p=>p.id===name);panel.points=boolean(panel.points,tongue,type);panel.bounds=bounds(panel.points);
        }
      }
    }
    let bleed;
    { // Generate 3 mm bleed from revised contour at ALL dimensions.
      const C=root.ClipperLib,k=10000,offset=new C.ClipperOffset(2,.02*k),result=new C.Paths();
      const ring=outline.points.map(p=>({X:Math.round(p.x*k),Y:Math.round(p.y*k)}));
      if(!C.Clipper.Orientation(ring))ring.reverse();
      offset.AddPath(ring,C.JoinType.jtRound,C.EndType.etClosedPolygon);offset.Execute(result,3*k);
      bleed=result.map(r=>pathD(r.map(p=>({x:p.X/k,y:p.Y/k}))));
    }
    const bleedBounds=bounds(bleed.flatMap(d=>root.T001_flattenPathD(d)));
    const layout={meta:{id,phase:'source-geometry',source:source.file},config,bounds:bleedBounds,dielineBounds,bleedBounds,cut,cutLines,cutRects,fold,slots,holes,bleed,outline,panels,relations};
    cache.set(key,layout);if(cache.size>12)cache.delete(cache.keys().next().value);return layout;
  }

root.M004_Layout=Object.freeze({normalize,getLayout});
})(typeof window!=='undefined'?window:globalThis);
