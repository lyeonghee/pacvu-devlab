(function(root){
  'use strict';
  const MM_PER_SOURCE=25.4/72, BLEED_MM=3;
  const num=value=>Number(Number(value).toFixed(3));
  const positive=(value,fallback)=>Number(value)>0?Number(value):fallback;

  function getDisplayMetrics(layout){
    if(!layout||!layout.bounds)return null;
    const bleed={width:layout.bounds.width*MM_PER_SOURCE,height:layout.bounds.height*MM_PER_SOURCE};
    return {dielineBounds:{width:bleed.width-BLEED_MM*2,height:bleed.height-BLEED_MM*2},bleedBounds:bleed};
  }
  function overallLayer(layout){
    const metrics=getDisplayMetrics(layout);if(!metrics)return '';
    const inset=BLEED_MM/MM_PER_SOURCE,b=layout.bounds;
    const left=b.minX+inset,right=b.minX+b.width-inset,top=b.minY+inset,bottom=b.minY+b.height-inset,offset=42;
    return `<g id="layer-overall-dimensions">`+
      `<g class="overall-measure dimension" data-overall-axis="horizontal"><line class="overall-dim" x1="${num(left)}" y1="${num(top-offset)}" x2="${num(right)}" y2="${num(top-offset)}"/><path/><path/><text class="overall-text" data-overall-axis="horizontal">${num(metrics.dielineBounds.width)} mm</text></g>`+
      `<g class="overall-measure dimension" data-overall-axis="vertical" data-text-side="right"><line class="overall-dim" x1="${num(right+offset)}" y1="${num(top)}" x2="${num(right+offset)}" y2="${num(bottom)}"/><path/><path/><text class="overall-text" data-overall-axis="vertical">${num(metrics.dielineBounds.height)} mm</text></g></g>`;
  }
  function scaleOf(svg){
    const ctm=svg.getScreenCTM&&svg.getScreenCTM();if(!ctm)return null;
    const x=Math.hypot(ctm.a,ctm.b),y=Math.hypot(ctm.c,ctm.d);
    return x>0&&y>0?{x,y,mean:Math.sqrt(x*y)}:null;
  }
  function positionDimension(group,style,scale){
    const line=group.querySelector('line'),text=group.querySelector('text'),paths=[...group.querySelectorAll(':scope > path')];
    if(!line||!text)return;
    const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');
    const vertical=Math.abs(y2-y1)>Math.abs(x2-x1);
    const length=style.arrowWidthPx/(vertical?scale.y:scale.x),half=style.arrowHeightPx/(vertical?scale.x:scale.y)/2;
    if(paths[0]&&paths[1]){
      paths[0].setAttribute('d',vertical?`M${x1},${y1} L${x1-half},${y1+length} L${x1+half},${y1+length} Z`:`M${x1},${y1} L${x1+length},${y1-half} L${x1+length},${y1+half} Z`);
      paths[1].setAttribute('d',vertical?`M${x2},${y2} L${x2-half},${y2-length} L${x2+half},${y2-length} Z`:`M${x2},${y2} L${x2-length},${y2-half} L${x2-length},${y2+half} Z`);
    }
    const midX=(x1+x2)/2,midY=(y1+y2)/2;
    if(vertical){const side=group.dataset.textSide==='right'?1:-1;const x=x1+side*(style.fontPx/2+style.gapPx)/scale.x;text.setAttribute('x',num(x));text.setAttribute('y',num(midY));text.setAttribute('transform',`rotate(-90 ${num(x)} ${num(midY)})`);}
    else{text.setAttribute('x',num(midX));text.setAttribute('y',num(y1-(style.fontPx/2+style.gapPx)/scale.y));text.removeAttribute('transform');}
    line.style.strokeWidth=`${num(style.linePx)}px`;line.style.vectorEffect='non-scaling-stroke';
    text.setAttribute('font-size',num(style.fontPx/scale.y));
  }
  function applyScreenVisual(svg,profile){
    if(!svg||!profile)return false;const scale=scaleOf(svg);if(!scale)return false;
    const responsive=positive(svg.dataset.pacvuVisualResponsiveScale,1),internal=profile.internal||{},marker=internal.marker||{};
    const style={fontPx:positive(internal.font&&internal.font.screenPx,12.5)*responsive,linePx:positive(internal.line&&internal.line.screenPx,.5)*responsive,arrowWidthPx:positive(marker.widthPx,4.975)*responsive,arrowHeightPx:positive(marker.heightPx,4.065)*responsive,gapPx:positive(internal.textGap&&internal.textGap.screenPx,4)*responsive};
    svg.querySelectorAll('#layer-labels .panel-label').forEach(label=>label.setAttribute('font-size',num(positive(profile.panelLabel&&profile.panelLabel.referenceTargetPx,12)*responsive/scale.y)));
    svg.querySelectorAll('#layer-dimensions .dimension').forEach(group=>positionDimension(group,style,scale));
    const overall={fontPx:13*responsive,linePx:1*responsive,arrowWidthPx:6*responsive,arrowHeightPx:4*responsive,gapPx:3*responsive};
    svg.querySelectorAll('#layer-overall-dimensions .overall-measure').forEach(group=>positionDimension(group,overall,scale));
    return true;
  }
  root.PacVuGable2DVisualCommon=Object.freeze({getDisplayMetrics,overallLayer,applyScreenVisual});
})(typeof window!=='undefined'?window:globalThis);
