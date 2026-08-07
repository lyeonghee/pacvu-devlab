// ============================================================
// T005_renderer.js - Opposite Tuck End Box 2D master renderer
// ============================================================

function T005_restyle(element,className){
  const cleaned=element.replace(/\sfill="[^"]*"/g,'').replace(/\sstroke="[^"]*"/g,'').replace(/\sstroke-width="[^"]*"/g,'').replace(/\sstroke-dasharray="[^"]*"/g,'').replace(/\sstroke-miterlimit="[^"]*"/g,'').replace(/\sstroke-linecap="[^"]*"/g,'').replace(/\sstroke-linejoin="[^"]*"/g,'').replace(/\sclass="[^"]*"/g,'');
  return cleaned.replace(/\/>$/,' class="'+className+'"/>');
}

function T005_extraStyle(){return '<style>.punch{fill:none;stroke:#337f0a;stroke-width:.55;vector-effect:non-scaling-stroke}.cut-area{fill:#fff;stroke:none}.glue-area{fill:#d4d4d4;opacity:.72;stroke:none}</style>';}

function T005_buildDimensionLayer(cfg,g,visual){
  const h=(x1,x2,y,label)=>'<line x1="'+T005_num(x1)+'" y1="'+T005_num(y)+'" x2="'+T005_num(x2)+'" y2="'+T005_num(y)+'" stroke="#111" stroke-width="'+visual.dimensionLineStroke+'" marker-start="url(#arrow)" marker-end="url(#arrow)"/><text class="dim" x="'+T005_num((x1+x2)/2)+'" y="'+T005_num(y+visual.dimensionTextOffset)+'" font-size="'+visual.dimensionFontSize+'" font-weight="600" text-anchor="middle">'+label+'</text>';
  const v=(x,y1,y2,label)=>'<line x1="'+T005_num(x)+'" y1="'+T005_num(y1)+'" x2="'+T005_num(x)+'" y2="'+T005_num(y2)+'" stroke="#111" stroke-width="'+visual.dimensionLineStroke+'" marker-start="url(#arrow)" marker-end="url(#arrow)"/><text class="dim" x="'+T005_num(x-visual.dimensionVerticalTextOffset)+'" y="'+T005_num((y1+y2)/2)+'" font-size="'+visual.dimensionFontSize+'" font-weight="600" transform="rotate(-90 '+T005_num(x-visual.dimensionVerticalTextOffset)+' '+T005_num((y1+y2)/2)+')" text-anchor="middle">'+label+'</text>';
  const y=g.yBodyTop+cfg.H*.65;
  return '<g id="layer-dimensions">'+h(g.xSideLR,g.xFrontR,y,T001_formatDimension('W',cfg.W))+h(g.xFrontR,g.xSideRR,y,T001_formatDimension('D',cfg.D))+v(g.xFrontR-Math.min(30,cfg.W*.15),g.yBodyTop,g.yBodyBottom,T001_formatDimension('H',cfg.H))+'</g>';
}

function T005_renderSVG(cfg,appState){
  const layout=T005_getLayout(cfg.W,cfg.D,cfg.H),visual=T002_displayVisualStyle(layout),bounds=layout.bleedBounds,pad=80;
  const x=bounds.minX-pad,y=bounds.minY-pad,w=bounds.width+pad*2,h=bounds.height+pad*2;
  let svg='<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="'+[x,y,w,h].map(T005_num).join(' ')+'" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">';
  svg+='<defs>'+T001_arrowMarkerDef(visual.arrowMarkerSize)+T001_overallArrowMarkerDefs(visual.arrowMarkerSize)+T001_watermarkDef(visual)+T001_styleBlock()+T005_extraStyle()+'</defs>';
  svg+='<rect x="'+T005_num(x)+'" y="'+T005_num(y)+'" width="'+T005_num(w)+'" height="'+T005_num(h)+'" fill="#d0d0d0"/><g id="viewportGroup">';
  svg+='<g id="layer-fill"><path class="cut-area" d="'+layout.fillPath+'"/></g><g id="layer-glue-fill"><path class="glue-area" d="'+layout.glueFillPath+'"/></g>';
  if(!appState||appState.showBleed)svg+='<g id="layer-bleed">'+T005_restyle(layout.bleedElement,'bleed')+'</g>';
  if(!appState||appState.showCut)svg+='<g id="layer-cut">'+layout.cutElements.map(el=>T005_restyle(el,'cut-fill')).join('')+'</g>';
  if(!appState||appState.showHoles!==false)svg+='<g id="layer-punch">'+T005_restyle(layout.capsuleHole.element,'punch')+'</g>';
  if(!appState||appState.showFolds)svg+='<g id="layer-fold">'+layout.foldElements.map(el=>T005_restyle(el,'fold')).join('')+'</g>';
  if(!appState||appState.showLabels)svg+=T001_buildLabelLayer(layout,visual);
  if(!appState||appState.showDims){svg+=T005_buildDimensionLayer(cfg,layout.grid,visual);svg+=T001_buildOverallDimensionLayer(layout,visual);}
  svg+='<rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/></g></svg>';
  return svg;
}

function T005_buildExportSVG(cfg){
  const layout=T005_getLayout(cfg.W,cfg.D,cfg.H),b=layout.bleedBounds,pad=5;
  const x=b.minX-pad,y=b.minY-pad,w=b.width+pad*2,h=b.height+pad*2;
  return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[x,y,w,h].map(T005_num).join(' ')+'" width="'+T005_num(w)+'mm" height="'+T005_num(h)+'mm"><defs>'+T001_styleBlock()+T005_extraStyle()+'</defs><g id="layer-bleed">'+T005_restyle(layout.bleedElement,'bleed')+'</g><g id="layer-cut">'+layout.cutElements.map(el=>T005_restyle(el,'cut-fill')).join('')+'</g><g id="layer-punch">'+T005_restyle(layout.capsuleHole.element,'punch')+'</g><g id="layer-fold">'+layout.foldElements.map(el=>T005_restyle(el,'fold')).join('')+'</g></svg>';
}

function T005_buildDXF(cfg){
  const layout=T005_getLayout(cfg.W,cfg.D,cfg.H);
  const rows=['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES'];
  const line=(a,b,layer)=>rows.push('0','LINE','8',layer,'10',String(T005_num(a.x)),'20',String(T005_num(-a.y)),'30','0','11',String(T005_num(b.x)),'21',String(T005_num(-b.y)),'31','0');
  const path=(d,layer,close)=>{let p=T001_flattenPathD(d);for(let i=0;i<p.length-1;i+=1)line(p[i],p[i+1],layer);if(close&&p.length>2&&T001_distance(p[0],p[p.length-1])>.001)line(p[p.length-1],p[0],layer);};
  path(layout.fillPath,'CUT',true);
  layout.shortCutElements.forEach(el=>path(T001_elementToPathD(el),'CUT',false));
  layout.foldElements.forEach(el=>line({x:Number(T001_attr(el,'x1')),y:Number(T001_attr(el,'y1'))},{x:Number(T001_attr(el,'x2')),y:Number(T001_attr(el,'y2'))},'FOLD'));
  path(layout.capsuleHole.path,'PUNCH',true);path(layout.bleedPath,'BLEED',true);
  rows.push('0','ENDSEC','0','EOF');return rows.join('\n');
}
