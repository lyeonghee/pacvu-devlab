// ============================================================
// M001_renderer.js - display/export adapter only
// All geometry comes from M001_getLayout().
// ============================================================

(function (root) {
  'use strict';
  const num = v => Number(v).toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const M001_PANEL_LABELS = Object.freeze({
    lidFront:'Lid Front', lid:'Lid', back:'Back', base:'Base', front:'Front',
    sidePanelLeft:'Side Panel(L)', sidePanelRight:'Side Panel(R)',
    lidDustFlapLeft:'Lid Dust Flap(L)', lidDustFlapRight:'Lid Dust Flap(R)',
    lidSideFlapLeft:'Lid Side Flap(L)', lidSideFlapRight:'Lid Side Flap(R)',
    backInsertFlapLeft:'Back Insert(L)', backInsertFlapRight:'Back Insert(R)',
    bottomLockFlapLeft:'Lock Flap(L)', bottomLockFlapRight:'Lock Flap(R)',
    frontInsertFlapLeft:'Front Insert(L)', frontInsertFlapRight:'Front Insert(R)'
  });

  function panelLabelElement(panel) {
    const label=M001_PANEL_LABELS[panel.id]||panel.id,b=panel.bounds;
    const fitWidth=b.width/Math.max(1,label.length*.62),fitHeight=b.height*.32;
    const fontSize=Math.min(5.5,fitWidth,fitHeight);
    if(fontSize<2.25)return '';
    return `<text class="label" style="font-size:${num(fontSize)}px" x="${num(b.x+b.width/2)}" y="${num(b.y+b.height/2)}" text-anchor="middle" dominant-baseline="middle">${esc(label)}</text>`;
  }

  function sharedLabelLayer(layout, visual) {
    if (typeof root.T001_buildLabelLayer !== 'function') return '<g id="layer-labels">' + layout.panels.map(panelLabelElement).join('') + '</g>';
    const labels=layout.panels.map(panel=>({
      name:M001_PANEL_LABELS[panel.id]||panel.id,
      x:panel.bounds.x+panel.bounds.width/2,
      y:panel.bounds.y+panel.bounds.height/2,
      panelWidth:panel.bounds.width,
      panelHeight:panel.bounds.height
    }));
    return root.T001_buildLabelLayer({labels},visual);
  }

  function sharedDimensionLayer(layout, cfg, visual) {
    const format=(axis,value)=>root.T001_formatDimension?root.T001_formatDimension(axis,value):axis+' '+num(value)+' mm';
    return '<g id="layer-dimensions">'+layout.dimensions.map(d=>{
      const axis=d.id==='dim-W'?'W':d.id==='dim-D'?'D':'H',value=axis==='W'?cfg.W:axis==='D'?cfg.D:cfg.H;
      const vertical=Math.abs(d.a.x-d.b.x)<.0001,midX=(d.a.x+d.b.x)/2,midY=(d.a.y+d.b.y)/2;
      const textX=vertical?midX+visual.dimensionVerticalTextOffset:midX;
      const textY=vertical?midY:midY+visual.dimensionTextOffset;
      const transform=vertical?' transform="rotate(-90 '+num(textX)+' '+num(textY)+')"':'';
      return '<line id="'+esc(d.id)+'" class="dimension" x1="'+num(d.a.x)+'" y1="'+num(d.a.y)+'" x2="'+num(d.b.x)+'" y2="'+num(d.b.y)+'" stroke-width="'+visual.dimensionLineStroke+'" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/><text class="dimension-text dim" data-screen-dimension="1" data-anchor-x="'+num(midX)+'" data-anchor-y="'+num(midY)+'" data-offset-axis="'+(vertical?'x':'y')+'" x="'+num(textX)+'" y="'+num(textY)+'" font-size="'+visual.dimensionFontSize+'" text-anchor="middle"'+transform+'>'+esc(format(axis,value))+'</text>';
    }).join('')+'</g>';
  }

  function watermarkDef() {
    return '<pattern id="m001-watermark" patternUnits="userSpaceOnUse" width="140" height="100" patternTransform="rotate(-25)"><text x="24" y="60" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#999" opacity=".11">PacVu</text></pattern>';
  }

  function overallArrowDefs(size) {
    const s=Number(size)||6.15,mid=s/2;
    return '<marker id="m001-overall-arrow-start" markerUnits="userSpaceOnUse" markerWidth="'+num(s)+'" markerHeight="'+num(s)+'" refX="0" refY="'+num(mid)+'" orient="auto"><path d="M'+num(s)+',0 L0,'+num(mid)+' L'+num(s)+','+num(s)+' Z" fill="#111"/></marker>'+
      '<marker id="m001-overall-arrow-end" markerUnits="userSpaceOnUse" markerWidth="'+num(s)+'" markerHeight="'+num(s)+'" refX="'+num(s)+'" refY="'+num(mid)+'" orient="auto"><path d="M0,0 L'+num(s)+','+num(mid)+' L0,'+num(s)+' Z" fill="#111"/></marker>';
  }

  function overallDimensionLayer(layout, visual) {
    if(typeof root.T001_buildOverallDimensionLayer!=='function')return '';
    return root.T001_buildOverallDimensionLayer(layout,visual)
      .replace(/marker-start="url\(#arrow\)"/g,'marker-start="url(#m001-overall-arrow-start)"')
      .replace(/marker-end="url\(#arrow\)"/g,'marker-end="url(#m001-overall-arrow-end)"')
      .replace(/url\(#overall-arrow-start\)/g,'url(#m001-overall-arrow-start)')
      .replace(/url\(#overall-arrow-end\)/g,'url(#m001-overall-arrow-end)');
  }

  function styles() { return '<style>.panel{fill:#fff}.cut{fill:none;stroke:#c00;stroke-width:.45}.fold{fill:none;stroke:#1d6fe8;stroke-width:.35;stroke-dasharray:2 1.6}.bleed{fill:none;stroke:#05f;stroke-width:.45;stroke-linejoin:round}.slot{fill:none;stroke:#e53935;stroke-width:.45}.hole{fill:none;stroke:#1f8f4f;stroke-width:.45}.glue{fill:#999;fill-opacity:.25;stroke:#777;stroke-width:.25}.label{fill:#333}.dimension{fill:none;stroke:#111}.dimension-text{font-family:Pretendard,Arial,sans-serif;font-weight:600;fill:#111;paint-order:stroke;stroke:#fff;stroke-width:2px}</style>'; }

  function geometryLayers(layout, state, includePanel) {
    state = state || {};
    const show = (key, fallback=true) => state[key] === undefined ? fallback : !!state[key];
    let out = '';
    if (includePanel) out += `<g id="layer-panel-fill"><path class="panel" d="${layout.cutPath}"/></g>`;
    if (show('showBleed')) out += `<g id="layer-bleed"><path class="bleed" d="${layout.bleedPath}"/></g>`;
    if (show('showCut')) out += '<g id="layer-cut">' + layout.cut.map(segment => `<path id="cut-${esc(segment.id)}" data-cut-id="${esc(segment.id)}" class="cut" d="${segment.d}"/>`).join('') + '</g>';
    if (show('showFolds')) out += '<g id="layer-fold">' + layout.fold.map(f => `<line id="${esc(f.id)}" class="fold" x1="${num(f.a.x)}" y1="${num(f.a.y)}" x2="${num(f.b.x)}" y2="${num(f.b.y)}"/>`).join('') + '</g>';
    if (show('showPerforation')) out += '<g id="layer-slots">' + layout.slots.map(s => `<path id="${esc(s.id)}" class="slot" d="${s.d}"/>`).join('') + '</g>';
    if (show('showPerforation')) out += '<g id="layer-holes">' + layout.holes.map(h => `<circle id="${esc(h.id)}" class="hole" cx="${num(h.cx)}" cy="${num(h.cy)}" r="${num(h.r)}"/>`).join('') + '</g>';
    if (show('showDims',false)) out += '<g id="layer-dimensions">' + layout.dimensions.map(d => `<line id="${esc(d.id)}" class="dimension" x1="${num(d.a.x)}" y1="${num(d.a.y)}" x2="${num(d.b.x)}" y2="${num(d.b.y)}"/><text class="dimension-text" x="${num((d.a.x+d.b.x)/2)}" y="${num((d.a.y+d.b.y)/2-2)}" text-anchor="middle">${esc(d.label)}</text>`).join('') + '</g>';
    return out;
  }

  function M001_renderSVG(cfg, state) {
    const layout = root.M001_getLayout(cfg);
    const visual=root.T001_masterVisualStyle?root.T001_masterVisualStyle(layout):{labelFontSize:5,dimensionFontSize:6,dimensionLineStroke:.3,dimensionTextOffset:5,dimensionVerticalTextOffset:4,arrowMarkerSize:7,uiScale:1};
    const internalDimensionVisual=root.T001_internalDimensionStyle?root.T001_internalDimensionStyle(layout):visual;
    const b=layout.bounds, pad=30;
    const internalArrowDefs=root.T001_arrowMarkerDef?root.T001_arrowMarkerDef(internalDimensionVisual.arrowMarkerSize,'internal-dimension-arrow','userSpaceOnUse'):'';
    const overallDefs=overallArrowDefs(internalDimensionVisual.arrowMarkerSize);
    let out=`<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="${num(b.minX-pad)} ${num(b.minY-pad)} ${num(b.width+pad*2)} ${num(b.height+pad*2)}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><defs>${internalArrowDefs}${overallDefs}${styles()}${watermarkDef()}</defs><rect x="${num(b.minX-pad)}" y="${num(b.minY-pad)}" width="${num(b.width+pad*2)}" height="${num(b.height+pad*2)}" fill="#d0d0d0"/><g id="viewportGroup">`;
    out += geometryLayers(layout,Object.assign({},state,{showDims:false}),true);
    if (state && state.showLabels) out += sharedLabelLayer(layout,visual);
    if (!state || state.showDims) {
      out += sharedDimensionLayer(layout,layout.config,internalDimensionVisual);
      out += overallDimensionLayer(layout,visual);
    }
    out += '<rect id="layer-watermark" x="-5000" y="-5000" width="10000" height="10000" fill="url(#m001-watermark)" pointer-events="none"/>';
    return out + '</g></svg>';
  }

  function M001_buildExportSVG(cfg) {
    const layout=root.M001_getLayout(cfg), b=layout.bounds, pad=5;
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${num(b.minX-pad)} ${num(b.minY-pad)} ${num(b.width+pad*2)} ${num(b.height+pad*2)}" width="${num(b.width+pad*2)}mm" height="${num(b.height+pad*2)}mm"><defs>${styles()}</defs>${geometryLayers(layout,{showBleed:true,showCut:true,showFolds:true,showPerforation:true},false)}</svg>`;
  }

  // Exporters receive the already-computed layout; they do not rebuild geometry.
  function M001_buildDXF(cfg) {
    const l=root.M001_getLayout(cfg), a=root.PacVuDXFR12.createRows(['CUT','FOLD','BLEED','SLOT','HOLE']);
    const addLine=(x1,y1,x2,y2,layer)=>a.push('0','LINE','8',layer,'10',num(x1),'20',num(-y1),'30','0','11',num(x2),'21',num(-y2),'31','0');
    const addArc=(arc,layer)=>a.push('0','ARC','8',layer,'10',num(arc.center.x),'20',num(-arc.center.y),'30','0','40',num(arc.r),'50',num((360-arc.endAngle)%360),'51',num((360-arc.startAngle)%360));
    const addPolyline=(points,layer)=>{for(let i=1;i<points.length;i++)addLine(points[i-1].x,points[i-1].y,points[i].x,points[i].y,layer);};
    l.cut.forEach(segment=>addPolyline(segment.points,'CUT'));
    l.bleed.forEach(segment=>addPolyline(segment.points,'BLEED'));
    l.fold.forEach(f=>addLine(f.a.x,f.a.y,f.b.x,f.b.y,'FOLD'));
    l.slots.forEach(s=>s.segments.forEach(segment=>segment.type==='arc'?addArc(segment,'SLOT'):addLine(segment.a.x,segment.a.y,segment.b.x,segment.b.y,'SLOT')));
    l.holes.forEach(h=>a.push('0','CIRCLE','8','HOLE','10',num(h.cx),'20',num(-h.cy),'30','0','40',num(h.r)));
    return root.PacVuDXFR12.finish(a);
  }

  function M001_buildPDF(cfg) {
    const l=root.M001_getLayout(cfg),b=l.bounds,pad=5,pt=72/25.4;
    const pageW=(b.width+pad*2)*pt,pageH=(b.height+pad*2)*pt;
    const pdfNum=v=>Number.isFinite(+v)?(+v).toFixed(3):'0';
    const map=p=>({x:(p.x-b.minX+pad)*pt,y:pageH-(p.y-b.minY+pad)*pt});
    const polylineOps=(points,close)=>{
      if(!points||points.length<2)return '';
      const first=map(points[0]);
      let out=pdfNum(first.x)+' '+pdfNum(first.y)+' m';
      for(let i=1;i<points.length;i++){const p=map(points[i]);out+=' '+pdfNum(p.x)+' '+pdfNum(p.y)+' l';}
      return out+(close?' h S':' S');
    };
    const lineOps=(a,b)=>polylineOps([a,b],false);
    const arcPoints=arc=>{
      const sweep=arc.endAngle-arc.startAngle,steps=Math.max(4,Math.ceil(Math.abs(sweep)/15)),points=[];
      for(let i=0;i<=steps;i++){
        const angle=(arc.startAngle+sweep*i/steps)*Math.PI/180;
        points.push({x:arc.center.x+Math.cos(angle)*arc.r,y:arc.center.y+Math.sin(angle)*arc.r});
      }
      return points;
    };
    const content=['0.6 w','1 J 1 j'];
    content.push('% BLEED','0 0.333 1 RG','[] 0 d');
    l.bleed.forEach(s=>content.push(polylineOps(s.points,true)));
    content.push('% CUT','0.902 0.227 0.153 RG','[] 0 d');
    l.cut.forEach(s=>content.push(polylineOps(s.points,false)));
    content.push('% FOLD','0.114 0.435 0.91 RG','[2.5 2] 0 d');
    l.fold.forEach(f=>content.push(lineOps(f.a,f.b)));
    content.push('% SLOT','0.902 0.227 0.153 RG','[] 0 d');
    l.slots.forEach(s=>s.segments.forEach(segment=>content.push(segment.type==='arc'?polylineOps(arcPoints(segment),false):lineOps(segment.a,segment.b))));
    content.push('% HOLE','0.08 0.443 0.224 RG','[] 0 d');
    l.holes.forEach(h=>{
      const points=[];
      for(let i=0;i<=32;i++){const angle=Math.PI*2*i/32;points.push({x:h.cx+Math.cos(angle)*h.r,y:h.cy+Math.sin(angle)*h.r});}
      content.push(polylineOps(points,true));
    });
    const stream=content.filter(Boolean).join('\n');
    const objects=[
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pdfNum(pageW)+' '+pdfNum(pageH)+'] /Contents 4 0 R >>',
      '<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream'
    ];
    let pdf='%PDF-1.4\n'; const offsets=[0];
    objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=(index+1)+' 0 obj\n'+object+'\nendobj\n';});
    const xref=pdf.length;
    pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    return pdf;
  }

  root.M001_renderSVG=M001_renderSVG;
  root.M001_buildExportSVG=M001_buildExportSVG;
  root.M001_buildDXF=M001_buildDXF;
  root.M001_buildPDF=M001_buildPDF;
})(typeof window !== 'undefined' ? window : globalThis);
