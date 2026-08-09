(function(root){
  'use strict';

  var STYLE=Object.freeze({cut:0.7,fold:0.3,bleed:0.7,dash:'2 1.6'});

  function n(v){return Number(v).toFixed(4).replace(/\.?0+$/,'');}
  function polygon(box){return [
    {x:box.x1,y:box.y1},{x:box.x2,y:box.y1},
    {x:box.x2,y:box.y2},{x:box.x1,y:box.y2}
  ];}
  function panels(panelBoxes,foldLines){
    var folds=foldLines||[];
    return Object.keys(panelBoxes).map(function(id){
      var box=panelBoxes[id],poly=polygon(box),ox=box.x1,oy=box.y1;
      return {
        id:id,name:box.name,polygon:poly,bounds:box,
        origin:{x:ox,y:oy},
        localPolygon:poly.map(function(p){return{x:p.x-ox,y:p.y-oy};}),
        sharedFolds:folds.filter(function(f){
          var vertical=Math.abs(f.x1-f.x2)<1e-4;
          var horizontal=Math.abs(f.y1-f.y2)<1e-4;
          return (vertical&&(Math.abs(f.x1-box.x1)<.05||Math.abs(f.x1-box.x2)<.05)) ||
            (horizontal&&(Math.abs(f.y1-box.y1)<.05||Math.abs(f.y1-box.y2)<.05));
        }).map(function(f){return f.id;}),
        glue:id==='glue'
      };
    });
  }
  function styleBlock(){return '.thomson,.cut{fill:none;stroke:#cc0000;stroke-width:'+STYLE.cut+';stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}.fold{fill:none;stroke:#1d6fe8;stroke-width:'+STYLE.fold+';stroke-dasharray:'+STYLE.dash+';vector-effect:non-scaling-stroke}.bleed{fill:none;stroke:#0055ff;stroke-width:'+STYLE.bleed+';stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}';}
  function mapPath(d,mapX,mapY){
    if(typeof document==='undefined')return d;
    var el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',d);
    var length;try{length=el.getTotalLength();}catch(e){return d;}
    var steps=Math.max(2,Math.ceil(length/2)),out=[];
    for(var i=0;i<=steps;i++){var p=el.getPointAtLength(length*i/steps);out.push((i?'L':'M')+n(mapX(p.x))+','+n(mapY(p.y)));}
    return out.join(' ');
  }
  function dxf(layout,extraCutPaths){
    var rows=root.PacVuDXFR12.createRows(['CUT','FOLD','BLEED']);
    function line(a,b,layer){rows.push('0','LINE','8',layer,'10',n(a.x),'20',n(-a.y),'30','0','11',n(b.x),'21',n(-b.y),'31','0');}
    function path(d,layer){
      if(!d||typeof document==='undefined')return;
      var el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',d);
      var length;try{length=el.getTotalLength();}catch(e){return;}
      if(!Number.isFinite(length)||length<=0)return;
      var steps=Math.max(1,Math.ceil(length/1)),prev=el.getPointAtLength(0);
      for(var i=1;i<=steps;i++){var p=el.getPointAtLength(length*i/steps);line(prev,p,layer);prev=p;}
    }
    var cuts=layout.cutPathsMm||layout.cutPaths||[];
    if(layout.outerPath)cuts=[layout.outerPath];
    cuts.concat(extraCutPaths||[]).forEach(function(d){path(d,'CUT');});
    (layout.foldLines||[]).forEach(function(f){line({x:f.x1,y:f.y1},{x:f.x2,y:f.y2},'FOLD');});
    path(layout.bleedPathDMm||layout.bleedPathD,'BLEED');
    return root.PacVuDXFR12.finish(rows);
  }
  root.PacVuShipping=Object.freeze({STYLE:STYLE,panels:panels,styleBlock:styleBlock,mapPath:mapPath,buildDXF:dxf,num:n});
})(window);
