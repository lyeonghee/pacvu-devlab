(function(root){
  'use strict';
  const BLEED_MM=3,SUPPORTED=Object.freeze({B001:true,B002:true}),num=value=>Number(Number(value).toFixed(3));
  function getDisplayMetrics(layout){
    if(!layout||!layout.bounds)return null;
    const bleed={width:Number(layout.bounds.width),height:Number(layout.bounds.height)};
    return {dielineBounds:{width:bleed.width-BLEED_MM*2,height:bleed.height-BLEED_MM*2},bleedBounds:bleed};
  }
  function overallLayer(layout,templateId){
    if(!SUPPORTED[String(templateId||'').toUpperCase()])return '';
    const metrics=getDisplayMetrics(layout);if(!metrics)return '';
    const b=layout.bounds,left=b.minX+BLEED_MM,right=b.maxX-BLEED_MM,top=b.minY+BLEED_MM,bottom=b.maxY-BLEED_MM,offset=34;
    const length=value=>root.PacVuUnits?.formatLength?.(value)||`${num(value)} mm`;
    return `<g id="layer-overall-dimensions"><g class="overall-measure" data-overall-axis="horizontal"><line class="overall-ext"/><line class="overall-ext"/><line class="overall-dim" x1="${num(left)}" y1="${num(top-offset)}" x2="${num(right)}" y2="${num(top-offset)}"/><path/><path/><text class="overall-text">${length(metrics.dielineBounds.width)}</text></g><g class="overall-measure" data-overall-axis="vertical"><line class="overall-ext"/><line class="overall-ext"/><line class="overall-dim" x1="${num(right+offset)}" y1="${num(top)}" x2="${num(right+offset)}" y2="${num(bottom)}"/><path/><path/><text class="overall-text">${length(metrics.dielineBounds.height)}</text></g></g>`;
  }
  function scaleOf(svg){
    const ctm=(svg.querySelector('#viewportGroup')||svg).getScreenCTM?.();if(!ctm)return null;
    const x=Math.hypot(ctm.a,ctm.b),y=Math.hypot(ctm.c,ctm.d);return x>0&&y>0?{x,y}:null;
  }
  function applyScreenVisual(svg,profile){
    if(!svg||!SUPPORTED[String(profile?.templateId||'').toUpperCase()])return false;
    const scale=scaleOf(svg);if(!scale)return false;
    const responsive=Number(svg.dataset.pacvuVisualResponsiveScale)||1;
    const style={fontPx:13*responsive,linePx:1*responsive,arrowWidthPx:6*responsive,arrowHeightPx:4*responsive,gapPx:5*responsive,guideHalfPx:5*responsive};
    svg.querySelectorAll('#layer-overall-dimensions .overall-measure').forEach(group=>{
      const line=group.querySelector('.overall-dim'),extensions=[...group.querySelectorAll('.overall-ext')],paths=[...group.querySelectorAll(':scope > path')],label=group.querySelector('.overall-text');
      if(!line||extensions.length<2||paths.length<2||!label)return;
      const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');
      const vertical=Math.abs(y2-y1)>Math.abs(x2-x1),halfGuide=style.guideHalfPx/(vertical?scale.x:scale.y);
      if(vertical){
        extensions[0].setAttribute('x1',num(x1-halfGuide));extensions[0].setAttribute('y1',num(y1));extensions[0].setAttribute('x2',num(x1+halfGuide));extensions[0].setAttribute('y2',num(y1));
        extensions[1].setAttribute('x1',num(x2-halfGuide));extensions[1].setAttribute('y1',num(y2));extensions[1].setAttribute('x2',num(x2+halfGuide));extensions[1].setAttribute('y2',num(y2));
      }else{
        extensions[0].setAttribute('x1',num(x1));extensions[0].setAttribute('y1',num(y1-halfGuide));extensions[0].setAttribute('x2',num(x1));extensions[0].setAttribute('y2',num(y1+halfGuide));
        extensions[1].setAttribute('x1',num(x2));extensions[1].setAttribute('y1',num(y2-halfGuide));extensions[1].setAttribute('x2',num(x2));extensions[1].setAttribute('y2',num(y2+halfGuide));
      }
      const arrowLength=style.arrowWidthPx/(vertical?scale.y:scale.x),arrowHalf=style.arrowHeightPx/(vertical?scale.x:scale.y)/2;
      paths[0].setAttribute('d',vertical?`M${x1},${y1} L${x1-arrowHalf},${y1+arrowLength} L${x1+arrowHalf},${y1+arrowLength} Z`:`M${x1},${y1} L${x1+arrowLength},${y1-arrowHalf} L${x1+arrowLength},${y1+arrowHalf} Z`);
      paths[1].setAttribute('d',vertical?`M${x2},${y2} L${x2-arrowHalf},${y2-arrowLength} L${x2+arrowHalf},${y2-arrowLength} Z`:`M${x2},${y2} L${x2-arrowLength},${y2-arrowHalf} L${x2-arrowLength},${y2+arrowHalf} Z`);
      group.querySelectorAll('.overall-ext,.overall-dim').forEach(item=>{item.style.stroke='#111';item.style.strokeWidth=`${num(style.linePx)}px`;item.style.vectorEffect='non-scaling-stroke';});
      paths.forEach(path=>{path.style.fill='#111';path.style.stroke='none';});
      const midX=(x1+x2)/2,midY=(y1+y2)/2;label.setAttribute('font-size',num(style.fontPx/scale.y));label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','middle');label.style.fill='#111';label.style.fontFamily='Pretendard, Arial, sans-serif';label.style.fontWeight='600';
      if(vertical){const x=x1+(style.fontPx/2+style.gapPx)/scale.x;label.setAttribute('x',num(x));label.setAttribute('y',num(midY));label.setAttribute('transform',`rotate(-90 ${num(x)} ${num(midY)})`);}else{const y=y1-(style.fontPx/2+style.gapPx)/scale.y;label.setAttribute('x',num(midX));label.setAttribute('y',num(y));label.removeAttribute('transform');}
    });
    return true;
  }
  root.PacVuBakery2DVisualCommon=Object.freeze({getDisplayMetrics,overallLayer,applyScreenVisual});
})(typeof window!=='undefined'?window:globalThis);
