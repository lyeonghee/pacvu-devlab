/* Layout-neutral rendering/Contract services extracted from the existing source mailer. */
(function(root){'use strict';
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
  function renderSVG(l,state){
    const b=l.bounds,s=state||{};
    const visual=root.T001_internalDimensionStyle(),overall=root.T001_overallVisualStyle(l);
    const defs=root.T001_arrowMarkerDef(visual.arrowMarkerSize,'internal-dimension-arrow','userSpaceOnUse')+root.T001_overallArrowMarkerDefs(overall.arrowMarkerSize);
    const labels=l.panels.filter(p=>!p.id.startsWith('spine')).map(p=>({name:p.label||p.id.replace(/-([LR])$/,' ($1)').replace(/\b[a-z]/g,c=>c.toUpperCase()).replace(/-/g,' '),x:(p.bounds.minX+p.bounds.maxX)/2,y:(p.bounds.minY+p.bounds.maxY)/2,panelWidth:p.bounds.width,panelHeight:p.bounds.height}));
    const cfg=l.config,dimensions=l.dimensions||[{axis:'W',a:{x:0,y:cfg.D-12},b:{x:cfg.W,y:cfg.D-12}},{axis:'D',a:{x:cfg.W-14,y:0},b:{x:cfg.W-14,y:cfg.D}},{axis:'H',a:{x:cfg.W-28,y:-cfg.H},b:{x:cfg.W-28,y:0}}];
    // Structure-owned placement, styled by the existing screen Visual Contract.
    const dims='<g id="layer-dimensions">'+dimensions.map(d=>{
      const vertical=d.axis!=='W'&&!d.horizontal,mx=(d.a.x+d.b.x)/2,my=(d.a.y+d.b.y)/2,tx=vertical?mx-3:mx,ty=vertical?my:my-3;
      return '<line x1="'+d.a.x+'" y1="'+d.a.y+'" x2="'+d.b.x+'" y2="'+d.b.y+'" stroke="#111" stroke-width="'+visual.dimensionLineStroke+'" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/><text class="dim" data-screen-dimension="1" data-anchor-x="'+mx+'" data-anchor-y="'+my+'" data-offset-axis="'+(vertical?'x':'y')+'" x="'+tx+'" y="'+ty+'" text-anchor="middle" font-size="'+visual.dimensionFontSize+'"'+(vertical?' transform="rotate(-90 '+tx+' '+ty+')"':'')+'>'+root.T001_formatDimension(d.axis,cfg[d.axis])+'</text>';
    }).join('')+'</g>';
    const paths=l.cut.map((p,i)=>'<path data-source-index="'+i+'" class="cut" d="'+p.d+'"/>').join('')+l.cutLines.map(p=>`<path class="cut" data-source-line="${p.id}" d="M ${p.a.x} ${p.a.y} L ${p.b.x} ${p.b.y}"/>`).join('')+l.cutRects.map(r=>`<path class="cut" data-source-rect="${r.id}" d="${rectPath(r)}"/>`).join('');
    const line=f=>'<line class="fold" x1="'+f.a.x+'" y1="'+f.a.y+'" x2="'+f.b.x+'" y2="'+f.b.y+'"/>';
    const holePaths=l.holes.map(h=>'M '+(h.cx-h.r)+' '+h.cy+' a '+h.r+' '+h.r+' 0 1 0 '+2*h.r+' 0 a '+h.r+' '+h.r+' 0 1 0 '+(-2*h.r)+' 0 Z');
    const fill=l.bleed.join(' ')+' '+l.slots.map(p=>p.d).join(' ')+' '+holePaths.join(' ')+' '+l.cutRects.map(rectPath).join(' ');
    const show=(key)=>s[key]===false?'display="none"':'';
    return '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="'+[b.minX-20,b.minY-20,b.width+40,b.height+40].join(' ')+'" width="100%" height="100%"><defs>'+defs+'</defs><style>.cut{fill:none;stroke:#d33;stroke-width:.25}.fold{stroke:#2196f3;stroke-width:.2;stroke-dasharray:2 1;fill:none}.bleed{fill:none;stroke:#1462ff;stroke-width:.25}.hole{fill:none;stroke:#159447;stroke-width:.25}.label,.dim{font-family:Arial;fill:#333}</style><g id="viewportGroup">'+
      '<path fill="white" fill-rule="evenodd" d="'+fill+'"/>'+ 
      '<g id="layer-bleed" '+show('showBleed')+'>'+l.bleed.map(d=>'<path class="bleed" d="'+d+'"/>').join('')+'</g>'+ 
      '<g id="layer-cut" '+show('showCut')+'>'+paths+'</g><g id="layer-slots" '+show('showSlots')+'>'+l.slots.map(p=>'<path class="cut" d="'+p.d+'"/>').join('')+'</g>'+ 
      '<g id="layer-fold" '+show('showFolds')+'>'+l.fold.map(line).join('')+'</g>'+ 
      '<g id="layer-holes" '+show('showHoles')+'>'+l.holes.map(h=>'<circle class="hole" cx="'+h.cx+'" cy="'+h.cy+'" r="'+h.r+'"/>').join('')+'</g>'+ 
      (s.showLabels===false?'':root.T001_buildLabelLayer({labels},root.T001_masterVisualStyle(l)))+
      (s.showDims===false?'':dims+root.T001_buildOverallDimensionLayer(l,overall,true))+'</g></svg>';
  }
  function buildExportSVG(l){
    const b=l.bleedBounds;
    const path=(p,style)=>'<path d="'+p.d+'" fill="none" '+style+'/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+b.width+'mm" height="'+b.height+'mm" viewBox="'+[b.minX,b.minY,b.width,b.height].join(' ')+'">'+
      '<g id="CUT" stroke="#c00" stroke-width=".25">'+l.cut.concat(l.slots,l.cutLines.map(p=>({d:`M ${p.a.x} ${p.a.y} L ${p.b.x} ${p.b.y}`})),l.cutRects.map(r=>({d:rectPath(r)}))).map(p=>path(p,'')).join('')+'</g>'+ 
      '<g id="FOLD" fill="none" stroke="#1d6fe8" stroke-width=".25" stroke-dasharray="2 1">'+l.fold.map(f=>'<path d="M '+f.a.x+' '+f.a.y+' L '+f.b.x+' '+f.b.y+'"/>').join('')+'</g>'+ 
      '<g id="BLEED" stroke="#04c" stroke-width=".25">'+l.bleed.map(d=>path({d},'')).join('')+'</g>'+ 
      '<g id="HOLE" fill="none" stroke="#159447" stroke-width=".25">'+l.holes.map(h=>'<circle cx="'+h.cx+'" cy="'+h.cy+'" r="'+h.r+'"/>').join('')+'</g></svg>';
  }
  function getContract(l){
    const id=l.meta.id;
    const c={schemaVersion:'1.0',structureId:id,units:'mm',coordinates:{space:'part-local-2d',x:'right',y:'down',origin:'source-defined'},parameters:{dimensions:l.config},materials:[{id:'board',kind:'unspecified',thicknessMm:null}],parts:[{id:'sheet',materialId:'board',panelIds:l.panels.map(p=>p.id)}],paths:[],cuts:[],folds:[],holes:[],slits:[],perforations:[],panels:[],layers:[],glues:[],insertions:[],bonds:[],source:{file:l.meta.source,meshJoinToleranceMm:l.outline.maxGapMm}};
    function addPath(id,d,closed){
      const p=root.T001_parseAbsolutePath(d);
      const result={id,partId:'sheet',closed,start:p.start,segments:p.segments.map((s,i)=>s.type==='C'?{id:'s'+i,type:'cubic',to:s.to,control1:s.c1,control2:s.c2}:{id:'s'+i,type:'line',to:s.to})};
      if(closed&&distance(result.segments.at(-1).to,result.start)>1e-7)result.segments.push({id:'s'+result.segments.length,type:'line',to:result.start});
      c.paths.push(result);return result;
    }
    l.cut.forEach((p,i)=>{const path=addPath('source.cut.'+i,p.d,false);c.cuts.push({id:'cut.'+i,partId:'sheet',pathId:path.id,kind:/25L[23]$/.test(p.id)?'internal':'outer'});});
    l.cutLines.forEach(p=>{const path=addPath(p.id,`M ${p.a.x} ${p.a.y} L ${p.b.x} ${p.b.y}`,false);c.cuts.push({id:p.id,partId:'sheet',pathId:path.id,kind:'internal'});});
    l.fold.forEach(f=>addPath(f.id,'M '+f.a.x+' '+f.a.y+' L '+f.b.x+' '+f.b.y,false));
    l.relations.forEach(r=>c.folds.push({id:r.id,partId:'sheet',parentPanelId:r.parent,childPanelId:r.child,axis:{partId:'sheet',...r.axis},segments:r.foldIds.map(pathId=>({pathId})),orientation:{positiveRotation:'right-hand-about-a-to-b'},profile:{kind:'crease',thicknessAware:true,neutralAxis:'midplane'}}));
    const holes=[];
    l.slots.forEach(p=>holes.push({id:p.id,d:p.d,panelIds:['base']}));
    l.holes.forEach(h=>{const points=Array.from({length:64},(_,i)=>({x:h.cx+h.r*Math.cos(i*Math.PI/32),y:h.cy+h.r*Math.sin(i*Math.PI/32)}));holes.push({id:h.id,d:pathD(points),panelIds:['front']});});
    holes.forEach(h=>{const path=addPath(h.id+'.path',h.d,true);c.holes.push({id:h.id,partId:'sheet',boundaryPathId:path.id,panelIds:h.panelIds});});
    l.cutRects.forEach(r=>{
      const {x,y,width:w,height:h,rx,ry}=r,start={x:x+rx,y};
      const ends=[{x:x+w-rx,y},{x:x+w,y:y+ry},{x:x+w,y:y+h-ry},{x:x+w-rx,y:y+h},{x:x+rx,y:y+h},{x,y:y+h-ry},{x,y:y+ry},start];
      const path={id:r.id+'.path',partId:'sheet',closed:true,start,segments:ends.map((to,i)=>i%2?{id:'s'+i,type:'arc',to,rx,ry,rotationDeg:0,largeArc:false,sweep:true}:{id:'s'+i,type:'line',to})};
      c.paths.push(path);c.holes.push({id:r.id,partId:'sheet',boundaryPathId:path.id,panelIds:['lid-front']});
    });
    l.panels.forEach(panel=>{
      const path=addPath('panel.'+panel.id,pathD(panel.points),true);
      const bindings=path.segments.map((s,i)=>{
        const a=i?path.segments[i-1].to:path.start,b=s.to;
        const hinge=l.relations.find(r=>(r.parent===panel.id||r.child===panel.id)&&[a,b].every(p=>{
          const u=r.axis.a,v=r.axis.b;return Math.abs((p.x-u.x)*(v.y-u.y)-(p.y-u.y)*(v.x-u.x))/Math.max(1,distance(u,v))<.002;
        }));
        if(hinge)return {segmentIds:[s.id],kind:'fold',featureId:hinge.id};
        const cutId='edge.'+panel.id+'.'+i;c.cuts.push({id:cutId,partId:'sheet',pathId:path.id,kind:'outer'});
        return {segmentIds:[s.id],kind:'cut',featureId:cutId};
      });
      c.panels.push({id:panel.id,partId:'sheet',faceConvention:{outside:'negativeZ',inside:'positiveZ'},regions:[{id:'main',outerPathId:path.id,holeIds:c.holes.filter(h=>h.panelIds.includes(panel.id)).map(h=>h.id),boundaryBindings:bindings}]});
    });
    return c;
  }

root.PacVuSourceMailerCommon=Object.freeze({renderSVG,buildExportSVG,getContract,bounds,pathD});
})(typeof window!=="undefined"?window:globalThis);
