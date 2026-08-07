// M003 flat glue mailer renderer — phase 1 cutPath verification.
(function(root){
  'use strict';
  const SOURCE_UNITS_PER_MM=72/25.4;
  const esc=v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  function warpers(cfg){
    const xL=612.284,xR=1195.645,ys=[141.565,323.485,917.453,1096.199,1681.553,1865.805];
    const sxC=cfg.W/205,sxS=cfg.H/65;
    const x=n=>n<xL?xL+(n-xL)*sxS:n<=xR?xL+(n-xL)*sxC:xL+(xR-xL)*sxC+(n-xR)*sxS;
    const ratios=[cfg.H/65,cfg.D/205,cfg.H/65,cfg.D/205,cfg.H/65];
    const starts=[ys[0]];for(let i=0;i<5;i++)starts.push(starts[i]+(ys[i+1]-ys[i])*ratios[i]);
    const y=n=>{let i=0;if(n>=ys[5])i=4;else while(i<4&&n>=ys[i+1])i++;return starts[i]+(n-ys[i])*ratios[i];};
    return {x,y};
  }
  function warpPath(d,w){
    const t=d.match(/[A-Za-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi)||[];let i=0,cmd='',cx=0,cy=0,sx=0,sy=0,lastC=null,out=[];
    const num=()=>Number(t[i++]),emit=(c,a)=>out.push(c+a.map(n=>Number(n.toFixed(3))).join(','));
    while(i<t.length){if(/[A-Za-z]/.test(t[i]))cmd=t[i++];const rel=cmd===cmd.toLowerCase(),u=cmd.toUpperCase();if(u==='Z'){out.push('Z');cx=sx;cy=sy;lastC=null;continue;}
      if(u==='M'||u==='L'){let x=num(),y=num();if(rel){x+=cx;y+=cy;}emit(u,[w.x(x),w.y(y)]);cx=x;cy=y;if(u==='M'){sx=x;sy=y;cmd=rel?'l':'L';}lastC=null;}
      else if(u==='H'){let x=num();if(rel)x+=cx;emit('L',[w.x(x),w.y(cy)]);cx=x;lastC=null;}
      else if(u==='V'){let y=num();if(rel)y+=cy;emit('L',[w.x(cx),w.y(y)]);cy=y;lastC=null;}
      else if(u==='C'){let x1=num(),y1=num(),x2=num(),y2=num(),x=num(),y=num();if(rel){x1+=cx;y1+=cy;x2+=cx;y2+=cy;x+=cx;y+=cy;}emit('C',[w.x(x1),w.y(y1),w.x(x2),w.y(y2),w.x(x),w.y(y)]);cx=x;cy=y;lastC=[x2,y2];}
      else if(u==='S'){let x2=num(),y2=num(),x=num(),y=num();if(rel){x2+=cx;y2+=cy;x+=cx;y+=cy;}const x1=lastC?2*cx-lastC[0]:cx,y1=lastC?2*cy-lastC[1]:cy;emit('C',[w.x(x1),w.y(y1),w.x(x2),w.y(y2),w.x(x),w.y(y)]);cx=x;cy=y;lastC=[x2,y2];}
      else throw new Error('Unsupported M003 path command: '+cmd);
    }return out.join('');
  }
  function cutMarkup(layout,w){
    return layout.cut.map(s=>s.type==='line'
      ? `<line data-cut-id="${esc(s.id)}" x1="${w.x(s.x1)}" y1="${w.y(s.y1)}" x2="${w.x(s.x2)}" y2="${w.y(s.y2)}"/>`
      : `<path data-cut-id="${esc(s.id)}" d="${esc(warpPath(s.d,w))}"/>`).join('');
  }
  const lines=(items,w)=>items.map(s=>`<line data-fold-id="${esc(s.id)}" x1="${w.x(s.x1)}" y1="${w.y(s.y1)}" x2="${w.x(s.x2)}" y2="${w.y(s.y2)}"/>`).join('');
  const n=v=>Number(Number(v).toFixed(3));
  function displayName(text){
    return ({'Dust Front':'Lid Front',lid:'Lid',back:'Back',base:'Base',front:'Front',DustFlapLeft:'Lid Dust Flap(L)',DustFlapRight:'Lid Dust Flap(R)',lidSideFlapLeft:'Lid Side Flap(L)',lidSideFlapRight:'Lid Side Flap(R)',backFlapLeft:'Back Flap(L)',backFlapRight:'Back Flap(R)',sidePanelLeft:'Side Panel(L)',sidePanelRight:'Side Panel(R)'})[text]||text;
  }
  function M003_getDisplayMetrics(input){
    const layout=input&&input.cut?input:root.M003_getLayout(input),w=warpers(layout.config),b=layout.bounds;
    const coordinate={minX:w.x(b.minX),minY:w.y(b.minY),maxX:w.x(b.maxX),maxY:w.y(b.maxY)};
    coordinate.width=coordinate.maxX-coordinate.minX;coordinate.height=coordinate.maxY-coordinate.minY;
    const width=coordinate.width/SOURCE_UNITS_PER_MM,height=coordinate.height/SOURCE_UNITS_PER_MM,bleed=Number(layout.config.bleed)||3;
    return {coordinateBounds:coordinate,renderBounds:{minX:coordinate.minX-58,minY:coordinate.minY-58,maxX:coordinate.maxX+58,maxY:coordinate.maxY+58,width:coordinate.width+116,height:coordinate.height+116},dielineBounds:{minX:0,minY:0,maxX:width,maxY:height,width,height},bleedBounds:{minX:-bleed,minY:-bleed,maxX:width+bleed,maxY:height+bleed,width:width+bleed*2,height:height+bleed*2}};
  }
  function labelMarkup(layout,w){
    const cfg=layout.config;
    return layout.labels.map(l=>{
      const central=/^(Dust Front|lid|back|base|front)$/.test(l.text),side=/^(lidSide|sidePanel)/.test(l.text);
      const panelWidth=central?cfg.W:(side?cfg.H:Math.max(cfg.H,42)),panelHeight=central?(/^(lid|base)$/.test(l.text)?cfg.D:cfg.H):(side?cfg.D:cfg.H);
      return `<text class="label" x="${w.x(l.x)}" y="${w.y(l.y)}" data-panel-width="${panelWidth*SOURCE_UNITS_PER_MM}" data-panel-height="${panelHeight*SOURCE_UNITS_PER_MM}" text-anchor="middle" dominant-baseline="middle">${esc(displayName(l.text))}</text>`;
    }).join('');
  }
  function dimensionMarkup(layout,w,visual){
    const cfg=layout.config;
    return layout.dimensions.map(d=>{
      const vertical=Math.abs(d.y2-d.y1)>Math.abs(d.x2-d.x1),x1=w.x(d.x1),y1=w.y(d.y1),x2=w.x(d.x2),y2=w.y(d.y2),mx=(x1+x2)/2,my=(y1+y2)/2;
      const axis=d.id.slice(-1),value=axis==='W'?cfg.W:axis==='D'?cfg.D:cfg.H,label=typeof root.T001_formatDimension==='function'?root.T001_formatDimension(axis,value):`${axis} ${value} mm`;
      const tx=vertical?mx+visual.dimensionVerticalTextOffset:mx,ty=vertical?my:my+visual.dimensionTextOffset;
      return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" marker-start="url(#m003-pacvu-internal-arrow-start)" marker-end="url(#m003-pacvu-internal-arrow-end)"/><text class="dim" style="paint-order:normal;stroke:none" data-screen-dimension="1" data-anchor-x="${n(mx)}" data-anchor-y="${n(my)}" data-offset-axis="${vertical?'x':'y'}" x="${n(tx)}" y="${n(ty)}"${vertical?` transform="rotate(-90 ${n(tx)} ${n(ty)})"`:''} text-anchor="middle">${esc(label)}</text>`;
    }).join('');
  }
  function overallMarkup(layout){
    const m=M003_getDisplayMetrics(layout),b=m.coordinateBounds,off=38,ext=10,y=b.minY-off,x=b.maxX+off;
    const widthLabel=typeof root.T001_formatLength==='function'?root.T001_formatLength(m.dielineBounds.width):`${n(m.dielineBounds.width)} mm`,heightLabel=typeof root.T001_formatLength==='function'?root.T001_formatLength(m.dielineBounds.height):`${n(m.dielineBounds.height)} mm`;
    return `<g id="layer-overall-dimensions"><line class="overall-ext" x1="${b.minX}" y1="${y-ext}" x2="${b.minX}" y2="${y+ext}"/><line class="overall-ext" x1="${b.maxX}" y1="${y-ext}" x2="${b.maxX}" y2="${y+ext}"/><line class="overall-dim" x1="${b.minX}" y1="${y}" x2="${b.maxX}" y2="${y}" marker-start="url(#m003-pacvu-overall-arrow-start)" marker-end="url(#m003-pacvu-overall-arrow-end)"/><text class="overall-text" data-overall-axis="horizontal" style="paint-order:normal;stroke:none" x="${(b.minX+b.maxX)/2}" y="${y-8}" text-anchor="middle">${esc(widthLabel)}</text><line class="overall-ext" x1="${x-ext}" y1="${b.minY}" x2="${x+ext}" y2="${b.minY}"/><line class="overall-ext" x1="${x-ext}" y1="${b.maxY}" x2="${x+ext}" y2="${b.maxY}"/><line class="overall-dim" x1="${x}" y1="${b.minY}" x2="${x}" y2="${b.maxY}" marker-start="url(#m003-pacvu-overall-arrow-start)" marker-end="url(#m003-pacvu-overall-arrow-end)"/><text class="overall-text" data-overall-axis="vertical" style="paint-order:normal;stroke:none" x="${x+13}" y="${(b.minY+b.maxY)/2}" text-anchor="middle" transform="rotate(-90 ${x+13} ${(b.minY+b.maxY)/2})">${esc(heightLabel)}</text></g>`;
  }
  function svg(layout,state,exportMode){
    state=state||{};
    const b=layout.bounds,w=warpers(layout.config),pad=18,minX=w.x(b.minX),minY=w.y(b.minY),maxX=w.x(b.maxX),maxY=w.y(b.maxY),v=`${minX-pad} ${minY-pad} ${maxX-minX+pad*2} ${maxY-minY+pad*2}`;
    const show=(key)=>exportMode||state[key]!==false;
    const glue=layout.glue.map(g=>{
      const cx=w.x(g.x+g.width/2),cy=w.y(g.y+g.height/2);
      return `<g><rect x="${cx-g.width/2}" y="${cy-g.height/2}" width="${g.width}" height="${g.height}"/><text x="${cx}" y="${cy}">${esc(g.id.replace(/_/g,' ').replace(/-/g,' '))}</text></g>`;
    }).join('');
    const visual=typeof root.T001_internalDimensionStyle==='function'?root.T001_internalDimensionStyle():{dimensionLineStroke:.3,dimensionFontSize:3.7,dimensionTextOffset:4,dimensionVerticalTextOffset:3.4,arrowMarkerSize:6};
    const labels=labelMarkup(layout,w);
    const holes=layout.holes.map(h=>`<circle cx="${w.x(h.cx)}" cy="${w.y(h.cy)}" r="${h.r}"/>`).join('');
    const dims=dimensionMarkup(layout,w,visual),overall=overallMarkup(layout);
    const rawSilhouette=warpPath(layout.bleedPath,w),silhouette=esc(rawSilhouette);
    const cutFill=esc([warpPath(layout.cutFillPath,w),...layout.cutFillVoids.map(path=>warpPath(path,w))].join(''));
    return `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="${v}"${exportMode?'': ' width="100%" height="100%"'}><defs><marker id="internal-dimension-arrow" markerWidth="${visual.arrowMarkerSize}" markerHeight="${visual.arrowMarkerSize}" refX="${visual.arrowMarkerSize}" refY="${visual.arrowMarkerSize/2}" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L${visual.arrowMarkerSize},${visual.arrowMarkerSize/2} L0,${visual.arrowMarkerSize} Z" fill="#111"/></marker><marker id="m003-overall-arrow-start" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M8,0 L0,4 L8,8 Z" fill="#111"/></marker><marker id="m003-overall-arrow-end" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 Z" fill="#111"/></marker><pattern id="m003-watermark" patternUnits="userSpaceOnUse" width="396.85" height="283.465" patternTransform="rotate(-25)"><text x="68.031" y="170.079" font-family="Arial,sans-serif" font-size="62.362" font-weight="700" fill="#999" opacity=".11">PacVu</text></pattern></defs><style>.cut,.fold,.bleed,.hole{fill:none;vector-effect:non-scaling-stroke}.sheet-fill{fill:#fff;fill-rule:evenodd;clip-rule:evenodd;stroke:none}.cut{stroke:#c00;stroke-width:1.276;stroke-linecap:round;stroke-linejoin:round}.cut [data-cut-id="1-16L"],.cut [data-cut-id="1-16R"]{stroke-linecap:butt}.fold{stroke:#1d6fe8;stroke-width:.992;stroke-dasharray:5.669 4.535}.bleed{stroke:#1d6fe8;stroke-width:1}.glue rect{fill:#9b9b9b;fill-opacity:.42;stroke:#777;stroke-width:.45}.glue text,#layer-labels text,#layer-dimensions text,.overall-text{font-family:"Arial Rounded MT Bold",Pretendard,"Noto Sans KR",Arial,sans-serif;fill:#25282d;text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:2px;stroke-opacity:.8}.glue text{font-size:11px;font-weight:650}#layer-labels text{font-size:17px;font-weight:500}#layer-dimensions line{fill:none;stroke:#20242b;stroke-width:${visual.dimensionLineStroke}}#layer-dimensions text{font-size:${visual.dimensionFontSize};font-weight:600}.overall-dim,.overall-ext{fill:none;stroke:#111;stroke-width:.7;vector-effect:non-scaling-stroke}.overall-text{font-size:15px;font-weight:650}.hole{stroke:#038725;stroke-width:1}</style><g id="mainGroup"><path class="sheet-fill" d="${cutFill}"/>${show('showBleed')?`<path class="bleed" d="${silhouette}"/>`:''}<g class="glue">${glue}</g><g class="cut">${cutMarkup(layout,w)}</g>${show('showFolds')?`<g class="fold">${lines(layout.fold,w)}</g>`:''}${show('showHoles')?`<g class="hole">${holes}</g>`:''}${show('showLabels')?`<g id="layer-labels">${labels}</g>`:''}${show('showDims')?`<g id="layer-dimensions">${dims}</g>${overall}`:''}<rect id="layer-watermark" x="-5000" y="-5000" width="10000" height="10000" fill="url(#m003-watermark)" pointer-events="none"/></g></svg>`;
  }
  function M003_renderSVG(cfg,state){return svg(root.M003_getLayout(cfg),state,false);}
  function M003_buildExportSVG(cfg){return svg(root.M003_getLayout(cfg),{},true);}
  root.M003_renderSVG=M003_renderSVG;
  root.M003_buildExportSVG=M003_buildExportSVG;
  root.M003_getDisplayMetrics=M003_getDisplayMetrics;
  root.M003_buildDXF=()=>'';
  root.M003_buildPDF=()=>'';
})(typeof window!=='undefined'?window:globalThis);
