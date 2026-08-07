(function(root){
  'use strict';

  const BLEED_MM=3;
  const num=value=>Number(Number(value).toFixed(3));
  const positive=(value,fallback)=>Number(value)>0?Number(value):fallback;

  function getDisplayMetrics(layout){
    if(!layout||!layout.bounds)return null;
    const bleed={width:layout.bounds.width,height:layout.bounds.height};
    return {
      dielineBounds:{width:bleed.width-BLEED_MM*2,height:bleed.height-BLEED_MM*2},
      bleedBounds:bleed
    };
  }

  function overallLayer(layout){
    const metrics=getDisplayMetrics(layout);if(!metrics)return '';
    const b=layout.bounds,left=b.minX+BLEED_MM,right=b.maxX-BLEED_MM;
    const top=b.minY+BLEED_MM,bottom=b.maxY-BLEED_MM,offset=34;
    return `<g id="layer-overall-dimensions">`+
      `<g class="overall-measure" data-overall-axis="horizontal"><line class="overall-ext" data-end="start"/><line class="overall-ext" data-end="end"/><line class="overall-dim" x1="${num(left)}" y1="${num(top-offset)}" x2="${num(right)}" y2="${num(top-offset)}"/><path/><path/><text class="overall-text">${num(metrics.dielineBounds.width)} mm</text></g>`+
      `<g class="overall-measure" data-overall-axis="vertical" data-text-side="right"><line class="overall-ext" data-end="start"/><line class="overall-ext" data-end="end"/><line class="overall-dim" x1="${num(right+offset)}" y1="${num(top)}" x2="${num(right+offset)}" y2="${num(bottom)}"/><path/><path/><text class="overall-text">${num(metrics.dielineBounds.height)} mm</text></g></g>`;
  }

  function scaleOf(svg){
    const viewport=svg.querySelector('#viewportGroup')||svg;
    const ctm=viewport.getScreenCTM&&viewport.getScreenCTM();if(!ctm)return null;
    const x=Math.hypot(ctm.a,ctm.b),y=Math.hypot(ctm.c,ctm.d);
    return x>0&&y>0?{x,y,mean:Math.sqrt(x*y)}:null;
  }

  function trianglePaths(group,style,scale){
    const line=group.querySelector('.overall-dim'),paths=[...group.querySelectorAll(':scope > path')];
    if(!line||paths.length<2)return;
    const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');
    const vertical=Math.abs(y2-y1)>Math.abs(x2-x1);
    const length=style.arrowWidthPx/(vertical?scale.y:scale.x),half=style.arrowHeightPx/(vertical?scale.x:scale.y)/2;
    paths[0].setAttribute('d',vertical?`M${x1},${y1} L${x1-half},${y1+length} L${x1+half},${y1+length} Z`:`M${x1},${y1} L${x1+length},${y1-half} L${x1+length},${y1+half} Z`);
    paths[1].setAttribute('d',vertical?`M${x2},${y2} L${x2-half},${y2-length} L${x2+half},${y2-length} Z`:`M${x2},${y2} L${x2-length},${y2-half} L${x2-length},${y2+half} Z`);
  }

  function positionExtensionLines(group,style,scale){
    const line=group.querySelector('.overall-dim'),extensions=[...group.querySelectorAll('.overall-ext')];
    if(!line||extensions.length<2)return;
    const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');
    const vertical=Math.abs(y2-y1)>Math.abs(x2-x1);
    const half=style.guideHalfPx/(vertical?scale.x:scale.y);
    if(vertical){
      extensions[0].setAttribute('x1',num(x1-half));extensions[0].setAttribute('y1',num(y1));extensions[0].setAttribute('x2',num(x1+half));extensions[0].setAttribute('y2',num(y1));
      extensions[1].setAttribute('x1',num(x2-half));extensions[1].setAttribute('y1',num(y2));extensions[1].setAttribute('x2',num(x2+half));extensions[1].setAttribute('y2',num(y2));
    }else{
      extensions[0].setAttribute('x1',num(x1));extensions[0].setAttribute('y1',num(y1-half));extensions[0].setAttribute('x2',num(x1));extensions[0].setAttribute('y2',num(y1+half));
      extensions[1].setAttribute('x1',num(x2));extensions[1].setAttribute('y1',num(y2-half));extensions[1].setAttribute('x2',num(x2));extensions[1].setAttribute('y2',num(y2+half));
    }
    extensions.forEach(extension=>{extension.style.stroke='#111';extension.style.strokeWidth=`${num(style.linePx)}px`;extension.style.vectorEffect='non-scaling-stroke';});
  }

  function positionText(line,text,style,scale,side){
    const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');
    const vertical=Math.abs(y2-y1)>Math.abs(x2-x1),midX=(x1+x2)/2,midY=(y1+y2)/2;
    text.setAttribute('dominant-baseline','middle');
    if(vertical){
      const x=x1+(side||1)*(style.fontPx/2+style.gapPx)/scale.x;
      text.setAttribute('x',num(x));text.setAttribute('y',num(midY));
      text.setAttribute('transform',`rotate(-90 ${num(x)} ${num(midY)})`);
    }else{
      const y=y1+(side||1)*(style.fontPx/2+style.gapPx)/scale.y;
      text.setAttribute('x',num(midX));text.setAttribute('y',num(y));text.removeAttribute('transform');
    }
  }

  function updateMarker(svg,style,scale){
    const marker=svg.querySelector('#arrow'),path=marker&&marker.querySelector('path');if(!marker||!path)return;
    const width=style.arrowWidthPx/scale.mean,height=style.arrowHeightPx/scale.mean;
    marker.setAttribute('markerUnits','userSpaceOnUse');marker.setAttribute('viewBox',`0 0 ${num(width)} ${num(height)}`);
    marker.setAttribute('markerWidth',num(width));marker.setAttribute('markerHeight',num(height));
    marker.setAttribute('refX',num(width));marker.setAttribute('refY',num(height/2));
    marker.setAttribute('orient','auto-start-reverse');marker.setAttribute('overflow','visible');
    path.setAttribute('d',`M0,0 L${num(width)},${num(height/2)} L0,${num(height)} Z`);
  }

  function applyScreenVisual(svg,profile){
    if(!svg||!profile)return false;const scale=scaleOf(svg);if(!scale)return false;
    const responsive=positive(svg.dataset.pacvuVisualResponsiveScale,1);
    const internal=profile.internal||{},marker=internal.marker||{},gap=internal.textGap||{};
    const style={
      fontPx:positive(internal.font&&internal.font.screenPx,12.5)*responsive,
      linePx:positive(internal.line&&internal.line.screenPx,.8)*responsive,
      arrowWidthPx:positive(marker.widthPx,4.6)*responsive,
      arrowHeightPx:positive(marker.heightPx,3.8)*responsive,
      gapPx:positive(gap.screenPx,4)*responsive
    };
    svg.querySelectorAll('#layer-labels .label').forEach(label=>label.setAttribute('font-size',num(positive(profile.panelLabel&&profile.panelLabel.referenceTargetPx,12)*responsive/scale.y)));
    const lines=[...svg.querySelectorAll('#layer-dimensions line')],texts=[...svg.querySelectorAll('#layer-dimensions text')];
    updateMarker(svg,style,scale);
    lines.forEach((line,index)=>{
      line.style.strokeWidth=`${num(style.linePx)}px`;line.style.vectorEffect='non-scaling-stroke';
      const text=texts[index];if(!text)return;
      text.setAttribute('font-size',num(style.fontPx/scale.y));
      positionText(line,text,style,scale,1);
    });
    const overall={fontPx:13*responsive,linePx:1*responsive,arrowWidthPx:6*responsive,arrowHeightPx:4*responsive,gapPx:5*responsive,guideHalfPx:5*responsive};
    svg.querySelectorAll('#layer-overall-dimensions .overall-measure').forEach(group=>{
      const line=group.querySelector('.overall-dim'),text=group.querySelector('text');if(!line||!text)return;
      trianglePaths(group,overall,scale);positionExtensionLines(group,overall,scale);
      line.style.stroke='#111';line.style.strokeWidth=`${num(overall.linePx)}px`;line.style.vectorEffect='non-scaling-stroke';
      group.querySelectorAll(':scope > path').forEach(path=>{path.style.fill='#111';path.style.stroke='none';});
      text.setAttribute('font-size',num(overall.fontPx/scale.y));
      text.setAttribute('text-anchor','middle');text.setAttribute('dominant-baseline','middle');text.style.fill='#111';
      positionText(line,text,overall,scale,group.dataset.overallAxis==='vertical'?1:-1);
    });
    return true;
  }

  root.PacVuTray2DVisualCommon=Object.freeze({getDisplayMetrics,overallLayer,applyScreenVisual});
})(typeof window!=='undefined'?window:globalThis);
