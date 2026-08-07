(function(root){
  'use strict';

  const CONTRACT=Object.freeze({
    PANEL_LABEL:Object.freeze({fontPx:11,minFontPx:9,maxFontPx:12,fontWeight:500}),
    INTERNAL_DIMENSION:Object.freeze({fontPx:11.3,fontWeight:600,linePx:0.74,arrowLengthPx:4.55,arrowWidthPx:4.55,textGapPx:1}),
    OVERALL_DIMENSION:Object.freeze({fontPx:13,fontWeight:600,linePx:1,arrowLengthPx:6,arrowWidthPx:4,textGapPx:1,guideLengthPx:10}),
    TECHNICAL_LINE:Object.freeze({cutPx:0.7,foldPx:0.3,bleedPx:0.7})
  });
  const FONT='"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif';
  const num=value=>Number(Number(value).toFixed(4));

  function scaleOf(svg){
    const viewport=svg.querySelector('#viewportGroup')||svg.querySelector('#mainGroup')||svg;
    const ctm=viewport.getScreenCTM&&viewport.getScreenCTM();
    if(!ctm)return null;
    const x=Math.hypot(ctm.a,ctm.b),y=Math.hypot(ctm.c,ctm.d);
    return x>0&&y>0?{x,y,mean:Math.sqrt(x*y)}:null;
  }
  function updateMarker(marker,style,scale,start){
    if(!marker)return;
    const length=style.arrowLengthPx/scale.x,width=style.arrowWidthPx/scale.y,half=width/2;
    marker.setAttribute('markerUnits','userSpaceOnUse');
    marker.setAttribute('markerWidth',num(length));
    marker.setAttribute('markerHeight',num(width));
    marker.setAttribute('viewBox',`0 0 ${num(length)} ${num(width)}`);
    marker.setAttribute('preserveAspectRatio','none');
    marker.setAttribute('refX',num(length));
    marker.setAttribute('refY',num(half));
    marker.setAttribute('orient',start?'auto-start-reverse':'auto');
    marker.setAttribute('overflow','visible');
    const path=marker.querySelector('path');
    const notchRatio=style.notchRatio==null?NaN:Number(style.notchRatio);
    if(path)path.setAttribute('d',Number.isFinite(notchRatio)
      ?`M0,0 L${num(length)},${num(half)} L0,${num(width)} L${num(length*notchRatio)},${num(half)} Z`
      :`M0,0 L${num(length)},${num(half)} L0,${num(width)} Z`);
  }
  function updateOverallMarker(marker,style,scale,start){
    if(!marker)return;
    const length=style.arrowLengthPx/scale.x,width=style.arrowWidthPx/scale.y,half=width/2;
    marker.setAttribute('markerUnits','userSpaceOnUse');
    marker.setAttribute('markerWidth',num(length));
    marker.setAttribute('markerHeight',num(width));
    marker.setAttribute('viewBox',`0 0 ${num(length)} ${num(width)}`);
    marker.setAttribute('preserveAspectRatio','none');
    marker.setAttribute('refX',start?'0':num(length));
    marker.setAttribute('refY',num(half));
    marker.setAttribute('orient','auto');
    marker.setAttribute('overflow','visible');
    const path=marker.querySelector('path');
    if(path)path.setAttribute('d',start
      ?`M${num(length)},0 L0,${num(half)} L${num(length)},${num(width)} Z`
      :`M0,0 L${num(length)},${num(half)} L0,${num(width)} Z`);
  }
  function ensureMarker(svg,id,role,start){
    let marker=svg.querySelector(`#${id}`);
    if(marker)return marker;
    const defs=svg.querySelector('defs');
    if(!defs)return null;
    marker=document.createElementNS('http://www.w3.org/2000/svg','marker');
    marker.id=id;
    marker.dataset.pacvuMarker=role;
    marker.setAttribute('markerUnits','userSpaceOnUse');
    marker.setAttribute('orient','auto');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('fill','#111');
    marker.appendChild(path);defs.appendChild(marker);
    return marker;
  }
  function resetTextToBase(text){
    if(!text.dataset.pacvuBaseX)text.dataset.pacvuBaseX=text.getAttribute('x')||'0';
    if(!text.dataset.pacvuBaseY)text.dataset.pacvuBaseY=text.getAttribute('y')||'0';
    if(!Object.prototype.hasOwnProperty.call(text.dataset,'pacvuBaseTransform')){
      text.dataset.pacvuBaseTransform=text.getAttribute('transform')||'';
    }
    text.setAttribute('x',text.dataset.pacvuBaseX);
    text.setAttribute('y',text.dataset.pacvuBaseY);
    if(text.dataset.pacvuBaseTransform)text.setAttribute('transform',text.dataset.pacvuBaseTransform);
    else text.removeAttribute('transform');
  }
  function apply(svg,profile){
    if(!svg||typeof svg.querySelector!=='function')return false;
    // Phase 2A: profiles are wired without changing current Contract values.
    // overall.preserveCurrent keeps the existing Contract result until 2B.
    const preserveOverall=profile?.overall?.preserveCurrent!==false;
    void preserveOverall;
    const scale=scaleOf(svg);if(!scale)return false;
    const responsiveScale=Number(svg.dataset.pacvuVisualResponsiveScale)||1;
    const profileInternal=profile?.internal||{},profileMarker=profileInternal.marker||{};
    const baseInternalFont=Number(profileInternal.font?.screenPx)||CONTRACT.INTERNAL_DIMENSION.fontPx;
    const requestedInternalFont=baseInternalFont*responsiveScale;
    const minInternalFont=Number(profileInternal.minPx)||0;
    const maxInternalFont=Number(profileInternal.maxPx)||Infinity;
    const responsiveInternalFont=Math.max(minInternalFont,Math.min(maxInternalFont,requestedInternalFont));
    const internalResponsiveScale=responsiveInternalFont/baseInternalFont;
    const internalStyle=Object.assign({},CONTRACT.INTERNAL_DIMENSION,{
      fontPx:responsiveInternalFont,
      linePx:(Number(profileInternal.line?.screenPx)||CONTRACT.INTERNAL_DIMENSION.linePx)*internalResponsiveScale,
      arrowLengthPx:(Number(profileMarker.widthPx)||CONTRACT.INTERNAL_DIMENSION.arrowLengthPx)*internalResponsiveScale,
      arrowWidthPx:(Number(profileMarker.heightPx)||CONTRACT.INTERNAL_DIMENSION.arrowWidthPx)*internalResponsiveScale,
      notchRatio:Number.isFinite(Number(profileMarker.notchRatio))?Number(profileMarker.notchRatio):null,
      textGapPx:(Number(profileInternal.textGap?.screenPx)||CONTRACT.INTERNAL_DIMENSION.textGapPx)*internalResponsiveScale
    });
    const profileOverall=profile?.overall||{},profileOverallMarker=profileOverall.marker||{};
    const baseOverallFont=Number(profileOverall.font?.screenPx)||CONTRACT.OVERALL_DIMENSION.fontPx;
    const requestedOverallFont=baseOverallFont*responsiveScale;
    const minOverallFont=Number(profileOverall.minPx)||0;
    const maxOverallFont=Number(profileOverall.maxPx)||Infinity;
    const responsiveOverallFont=Math.max(minOverallFont,Math.min(maxOverallFont,requestedOverallFont));
    const overallResponsiveScale=responsiveOverallFont/baseOverallFont;
    const overallStyle=Object.assign({},CONTRACT.OVERALL_DIMENSION,{
      fontPx:responsiveOverallFont,
      linePx:(Number(profileOverall.line?.screenPx)||CONTRACT.OVERALL_DIMENSION.linePx)*overallResponsiveScale,
      arrowLengthPx:(Number(profileOverallMarker.widthPx)||CONTRACT.OVERALL_DIMENSION.arrowLengthPx)*overallResponsiveScale,
      arrowWidthPx:(Number(profileOverallMarker.heightPx)||CONTRACT.OVERALL_DIMENSION.arrowWidthPx)*overallResponsiveScale,
      textGapPx:(Number(profileOverall.textGap?.screenPx)||CONTRACT.OVERALL_DIMENSION.textGapPx)*overallResponsiveScale,
      guideLengthPx:(Number(profileOverall.guideLength?.screenPx)||CONTRACT.OVERALL_DIMENSION.guideLengthPx)*overallResponsiveScale
    });
    const profilePanel=profile?.panelLabel||{};
    const panelStyle=Object.assign({},CONTRACT.PANEL_LABEL,{
      fontPx:(Number(profilePanel.referenceTargetPx)||CONTRACT.PANEL_LABEL.fontPx)*responsiveScale,
      minFontPx:(Number(profilePanel.minPx)||CONTRACT.PANEL_LABEL.minFontPx)*responsiveScale,
      maxFontPx:(Number(profilePanel.maxPx)||CONTRACT.PANEL_LABEL.maxFontPx)*responsiveScale
    });

    svg.querySelectorAll('#layer-labels .label').forEach(label=>{
      const style=panelStyle;
      const panelW=Number(label.dataset.panelWidth||0)*scale.x;
      const panelH=Number(label.dataset.panelHeight||0)*scale.y;
      const estimate=Math.max(1,(label.textContent||'').length*style.fontPx*.56);
      let px=style.fontPx;
      if(panelW>0&&panelH>0)px=Math.min(px,style.fontPx*(panelW*.84/estimate),panelH*.42,style.fontPx*Math.min(1,Math.sqrt(panelW*panelH/2400)));
      px=Math.max(style.minFontPx,Math.min(style.maxFontPx,px));
      label.setAttribute('font-size',num(px/scale.y));
      if(Number(profilePanel.referenceTargetPx))label.style.fontSize=`${num(px/scale.y)}px`;
      else label.style.removeProperty('font-size');
      label.style.fontFamily=FONT;
      label.style.fontWeight=style.fontWeight;
    });
    svg.querySelectorAll('#layer-dimensions line').forEach(line=>{
      line.setAttribute('stroke-width',num(internalStyle.linePx/scale.mean));
      if(Number(profileInternal.line?.screenPx)){
        line.style.strokeWidth=`${num(internalStyle.linePx)}px`;
        line.style.vectorEffect='non-scaling-stroke';
      }else{
        line.style.removeProperty('stroke-width');
      }
    });
    svg.querySelectorAll('#layer-dimensions text').forEach(text=>{
      text.setAttribute('font-size',num(internalStyle.fontPx/scale.y));
      text.style.removeProperty('font-size');
      text.style.fontWeight=internalStyle.fontWeight;
      text.style.fontFamily=FONT;
      text.style.paintOrder='normal';text.style.stroke='none';
    });
    const internal=svg.querySelector('#layer-dimensions');
    if(internal){
      const lines=[...internal.querySelectorAll('line')];
      [...internal.querySelectorAll('text[data-offset-axis]')].forEach((text,index)=>{
        const dimensionId=text.dataset.dimensionId;
        const line=dimensionId
          ? lines.find(candidate=>candidate.dataset.dimensionId===dimensionId)
          : lines[index];
        if(!line)return;
        resetTextToBase(text);
        const axis=text.dataset.offsetAxis;
        const rawHorizontal=Number(profileInternal.textGap?.horizontalOffsetPx);
        const rawVertical=Number(profileInternal.textGap?.verticalOffsetPx);
        const explicitHorizontal=Number.isFinite(rawHorizontal)?rawHorizontal*responsiveScale:NaN;
        const explicitVertical=Number.isFinite(rawVertical)?rawVertical*responsiveScale:NaN;
        if(axis==='y'&&Number.isFinite(explicitHorizontal)){
          const x=+text.dataset.anchorX;
          const y=+text.dataset.anchorY+explicitHorizontal/scale.y;
          text.setAttribute('x',num(x));text.setAttribute('y',num(y));text.removeAttribute('transform');
          return;
        }
        if(axis==='x'&&Number.isFinite(explicitVertical)){
          const x=+text.dataset.anchorX+explicitVertical/scale.x;
          const y=+text.dataset.anchorY;
          text.setAttribute('x',num(x));text.setAttribute('y',num(y));
          text.setAttribute('transform',`rotate(-90 ${num(x)} ${num(y)})`);
          return;
        }
        const rect=text.getBoundingClientRect();
        const ctm=svg.getScreenCTM();
        if(axis==='y'){
          const sourceY=Number.isFinite(+text.dataset.lineY)?+text.dataset.lineY:+line.getAttribute('y1');
          const lineY=new DOMPoint(+line.getAttribute('x1'),sourceY).matrixTransform(ctm).y;
          const anchor=+text.dataset.anchorY;
          const below=+text.getAttribute('y')>=anchor;
          const gap=below?rect.top-lineY:lineY-rect.bottom;
          const delta=(internalStyle.textGapPx-gap)/scale.y*(below?1:-1);
          const y=+text.getAttribute('y')+delta;
          text.setAttribute('y',num(y));
        }else if(axis==='x'){
          const sourceX=Number.isFinite(+text.dataset.lineX)?+text.dataset.lineX:+line.getAttribute('x1');
          const lineX=new DOMPoint(sourceX,+line.getAttribute('y1')).matrixTransform(ctm).x;
          const anchor=+text.dataset.anchorX;
          const right=+text.getAttribute('x')>=anchor;
          const gap=right?rect.left-lineX:lineX-rect.right;
          const delta=(internalStyle.textGapPx-gap)/scale.x*(right?1:-1);
          const x=+text.getAttribute('x')+delta;
          const y=+text.getAttribute('y');
          text.setAttribute('x',num(x));
          text.setAttribute('transform',`rotate(-90 ${num(x)} ${num(y)})`);
        }
      });
    }
    // Browser preview follows the verified T001 screen weight. Export keeps
    // the technical 0.3/0.7 mm weights in each renderer.
    svg.querySelectorAll('#layer-overall-dimensions .overall-dim,#layer-overall-dimensions .overall-ext').forEach(line=>{
      line.style.strokeWidth=`${num(overallStyle.linePx)}px`;
      line.style.vectorEffect='non-scaling-stroke';
    });
    svg.querySelectorAll('#layer-overall-dimensions .overall-text').forEach(text=>{
      text.setAttribute('font-size',num(overallStyle.fontPx/scale.y));
      text.style.fontSize=`${num(overallStyle.fontPx/scale.y)}px`;
      text.style.fontWeight=overallStyle.fontWeight;
      text.style.fontFamily=FONT;
      text.style.paintOrder='normal';text.style.stroke='none';
    });
    const overall=svg.querySelector('#layer-overall-dimensions');
    if(overall){
      overall.querySelectorAll('.overall-ext').forEach(line=>{
        const x1=+line.getAttribute('x1'),y1=+line.getAttribute('y1');
        const x2=+line.getAttribute('x2'),y2=+line.getAttribute('y2');
        if(Math.abs(x1-x2)<1e-8){
          const center=(y1+y2)/2,half=overallStyle.guideLengthPx/scale.y/2;
          line.setAttribute('y1',num(center-half));line.setAttribute('y2',num(center+half));
        }else{
          const center=(x1+x2)/2,half=overallStyle.guideLengthPx/scale.x/2;
          line.setAttribute('x1',num(center-half));line.setAttribute('x2',num(center+half));
        }
      });
      const ownerScopes=[...overall.querySelectorAll(':scope > [data-overall-owner]')];
      (ownerScopes.length?ownerScopes:[overall]).forEach(scope=>{
        const lines=[...scope.querySelectorAll('.overall-dim')];
        const horizontal=scope.querySelector('.overall-text[data-overall-axis="horizontal"]');
        const vertical=scope.querySelector('.overall-text[data-overall-axis="vertical"]');
        if(horizontal&&lines[0]){
          resetTextToBase(horizontal);
          const lineY=new DOMPoint(+lines[0].getAttribute('x1'),+lines[0].getAttribute('y1')).matrixTransform(svg.getScreenCTM()).y;
          const gap=lineY-horizontal.getBoundingClientRect().bottom;
          horizontal.setAttribute('y',num(+horizontal.getAttribute('y')-(overallStyle.textGapPx-gap)/scale.y));
        }
        if(vertical&&lines[1]){
          resetTextToBase(vertical);
          const lineX=new DOMPoint(+lines[1].getAttribute('x1'),+lines[1].getAttribute('y1')).matrixTransform(svg.getScreenCTM()).x;
          const gap=vertical.getBoundingClientRect().left-lineX;
          const x=+vertical.getAttribute('x')+(overallStyle.textGapPx-gap)/scale.x;
          const y=+vertical.getAttribute('y');
          vertical.setAttribute('x',num(x));
          vertical.setAttribute('transform',`rotate(-90 ${num(x)} ${num(y)})`);
        }
      });
    }
    const prefix=svg.dataset.pacvuVisualPrefix||'pacvu';
    const internalStartId=`${prefix}-internal-arrow-start`;
    const internalEndId=`${prefix}-internal-arrow-end`;
    const overallStartId=`${prefix}-overall-arrow-start`;
    const overallEndId=`${prefix}-overall-arrow-end`;
    updateMarker(ensureMarker(svg,internalStartId,'internal-start',true),internalStyle,scale,true);
    updateMarker(ensureMarker(svg,internalEndId,'internal-end',false),internalStyle,scale,false);
    updateOverallMarker(ensureMarker(svg,overallStartId,'overall-start',true),overallStyle,scale,true);
    updateOverallMarker(ensureMarker(svg,overallEndId,'overall-end',false),overallStyle,scale,false);
    const preserveDimensionEnds=svg.dataset.pacvuPreserveDimensionEnds==='true';
    svg.querySelectorAll('#layer-dimensions line').forEach(line=>{
      if(!preserveDimensionEnds||line.hasAttribute('marker-start'))line.setAttribute('marker-start',`url(#${internalStartId})`);
      if(!preserveDimensionEnds||line.hasAttribute('marker-end'))line.setAttribute('marker-end',`url(#${internalEndId})`);
    });
    if(svg.dataset.pacvuPreserveOverallMarkers==='true'){
      updateMarker(svg.querySelector('#arrow'),overallStyle,scale,true);
    }else{
      svg.querySelectorAll('#layer-overall-dimensions .overall-dim').forEach(line=>{
        line.setAttribute('marker-start',`url(#${overallStartId})`);
        line.setAttribute('marker-end',`url(#${overallEndId})`);
      });
    }
    if(prefix==='m003-pacvu'){
      ['internal-dimension-arrow','m003-overall-arrow-start','m003-overall-arrow-end'].forEach(id=>svg.querySelector(`#${id}`)?.remove());
    }
    svg.querySelectorAll('.cut').forEach(el=>{el.style.strokeWidth=num(CONTRACT.TECHNICAL_LINE.cutPx/scale.mean);});
    svg.querySelectorAll('.fold').forEach(el=>{
      el.style.strokeWidth='0.45px';
      el.style.vectorEffect='non-scaling-stroke';
      el.style.stroke='#1d6fe8';
      el.style.strokeDasharray='2.5 2';
    });
    svg.querySelectorAll('.bleed').forEach(el=>{el.style.strokeWidth=num(CONTRACT.TECHNICAL_LINE.bleedPx/scale.mean);});
    return true;
  }
  root.PacVu2DVisualContract=Object.freeze({values:CONTRACT,apply,scaleOf});
})(typeof window!=='undefined'?window:globalThis);
