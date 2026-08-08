(function(root){
  'use strict';

  function positive(value,fallback){
    const number=Number(value);
    return Number.isFinite(number)&&number>0?number:fallback;
  }

  function finite(value,fallback){
    const number=Number(value);
    return Number.isFinite(number)?number:fallback;
  }

  function responsiveOf(svg){
    return positive(svg&&svg.dataset&&svg.dataset.pacvuVisualResponsiveScale,1);
  }

  function resolveScreenStyle(profile,fallbackInternal,fallbackPanelLabel,svg){
    const internal=profile&&profile.internal||{};
    const panel=profile&&profile.panelLabel||{};
    const marker=internal.marker||{};
    const font=internal.font||{};
    const line=internal.line||{};
    const textGap=internal.textGap||{};
    const responsive=responsiveOf(svg);
    return {
      internal:Object.assign({},fallbackInternal,{
        dimensionTextPx:positive(font.screenPx,fallbackInternal.dimensionTextPx)*responsive,
        dimensionLinePx:positive(line.screenPx,fallbackInternal.dimensionLinePx)*responsive,
        dimensionTextOffsetPx:finite(textGap.horizontalOffsetPx,fallbackInternal.dimensionTextOffsetPx)*responsive,
        dimensionVerticalTextOffsetPx:finite(textGap.verticalOffsetPx,fallbackInternal.dimensionVerticalTextOffsetPx)*responsive,
        internalArrowWidthPx:positive(marker.widthPx,fallbackInternal.internalArrowWidthPx)*responsive,
        internalArrowHeightPx:positive(marker.heightPx,fallbackInternal.internalArrowHeightPx)*responsive
      },{preserveRendererPosition:textGap.preserveRenderer===true}),
      panelLabel:Object.assign({},fallbackPanelLabel,{
        screenPx:positive(panel.referenceTargetPx,fallbackPanelLabel.screenPx)*responsive,
        minPx:positive(panel.minPx,fallbackPanelLabel.minPx)*responsive,
        maxPx:positive(panel.maxPx,fallbackPanelLabel.maxPx)*responsive
      })
    };
  }

  function applyRendererResponsive(svg,profile){
    if(!svg||!profile)return false;
    const viewport=svg.querySelector(profile.selectors.viewport)||svg;
    const ctm=viewport.getScreenCTM&&viewport.getScreenCTM();
    if(!ctm)return false;
    const sx=Math.hypot(ctm.a,ctm.b),sy=Math.hypot(ctm.c,ctm.d),sm=Math.sqrt(sx*sy);
    if(!(sx>0&&sy>0))return false;
    const responsive=responsiveOf(svg);
    const lines=[...svg.querySelectorAll(profile.selectors.internalLines)];
    const texts=[...svg.querySelectorAll(profile.selectors.internalTexts)];
    const labels=[...svg.querySelectorAll(profile.selectors.panelLabels)];

    lines.forEach(line=>{
      if(!line.dataset.pacvuBaseStrokeScreen){
        const raw=parseFloat(line.getAttribute('stroke-width'))||parseFloat(getComputedStyle(line).strokeWidth)||.35;
        line.dataset.pacvuBaseStrokeScreen=String(raw*sm);
      }
      line.setAttribute('stroke-width',String(Number(line.dataset.pacvuBaseStrokeScreen)*responsive/sm));
      line.style.removeProperty('stroke-width');
      line.style.removeProperty('vector-effect');
    });
    texts.forEach((text,index)=>{
      if(!text.dataset.pacvuBaseFontScreen){
        const raw=parseFloat(text.getAttribute('font-size'))||parseFloat(getComputedStyle(text).fontSize)||5.5;
        text.dataset.pacvuBaseFontScreen=String(raw*sy);
      }
      text.setAttribute('font-size',String(Number(text.dataset.pacvuBaseFontScreen)*responsive/sy));
      const line=lines[index];if(!line)return;
      const vertical=Math.abs(+line.getAttribute('y2')-+line.getAttribute('y1'))>Math.abs(+line.getAttribute('x2')-+line.getAttribute('x1'));
      const anchor=vertical?(+line.getAttribute('x1')):(+line.getAttribute('y1'));
      const coordinate=vertical?(+text.getAttribute('x')):(+text.getAttribute('y'));
      const scale=vertical?sx:sy;
      if(!text.dataset.pacvuBaseGapScreen)text.dataset.pacvuBaseGapScreen=String((coordinate-anchor)*scale);
      const next=anchor+Number(text.dataset.pacvuBaseGapScreen)*responsive/scale;
      if(vertical){
        text.setAttribute('x',String(next));
        const y=+text.getAttribute('y');
        text.setAttribute('transform',`rotate(-90 ${next} ${y})`);
      }else text.setAttribute('y',String(next));
    });
    labels.forEach(label=>{
      if(!label.dataset.pacvuBaseFontScreen){
        const raw=parseFloat(label.getAttribute('font-size'))||parseFloat(getComputedStyle(label).fontSize)||4.5;
        label.dataset.pacvuBaseFontScreen=String(raw*sy);
      }
      label.setAttribute('font-size',String(Number(label.dataset.pacvuBaseFontScreen)*responsive/sy));
    });

    // T002-T005 markers intentionally keep each renderer's native
    // markerUnits="strokeWidth" geometry. Their visible size already follows
    // the responsive dimension-line stroke, so rewriting markerWidth/Height or
    // markerUnits here would apply the scale twice.
    return true;
  }

  const upperTuckProfiles=Object.freeze({
    T001:Object.freeze({ratio:23/57,sourceDepth:23}),
    T002:Object.freeze({ratio:((378.344-301.241)*(25.4/72))/81,sourceDepth:(378.344-301.241)*(25.4/72)}),
    T003:Object.freeze({ratio:((137.764-92.126)*(25.4/72))/86.5,sourceDepth:(137.764-92.126)*(25.4/72)}),
    T004:Object.freeze({ratio:((277.507-217.98)*(25.4/72))/65,sourceDepth:(277.507-217.98)*(25.4/72),min:15}),
    T005:Object.freeze({ratio:28.92/90,sourceDepth:28.92})
  });
  const upperTuckLimits=Object.freeze({min:8,max:45});
  const upperTuckState=Object.create(null);

  function clampUpperTuckDepth(value,min=upperTuckLimits.min,max=upperTuckLimits.max){
    return Math.max(min,Math.min(max,Math.round(Number(value)||min)));
  }

  function resolveUpperTuck(templateId,D,override){
    const profile=upperTuckProfiles[templateId];
    if(!profile)throw new Error('Unknown UpperTuck profile: '+templateId);
    const state=override||upperTuckState[templateId]||{mode:'auto',depth:null};
    const min=profile.min||upperTuckLimits.min,max=profile.max||upperTuckLimits.max;
    const autoDepth=clampUpperTuckDepth(Number(D)*profile.ratio,min,max);
    const custom=state.mode==='custom'&&Number.isFinite(Number(state.depth));
    const depth=custom?clampUpperTuckDepth(state.depth,min,max):autoDepth;
    return Object.freeze({
      templateId,mode:custom?'custom':'auto',profile:'auto',depth,autoDepth,
      min,max,
      relief:templateId!=='T001',scale:depth/profile.sourceDepth,
      profileScale:autoDepth/profile.sourceDepth
    });
  }

  function setUpperTuckState(templateId,next){
    const mode=next&&next.mode==='custom'?'custom':'auto';
    upperTuckState[templateId]={mode,depth:mode==='custom'?clampUpperTuckDepth(next.depth):null};
    return Object.freeze({mode,depth:upperTuckState[templateId].depth});
  }

  function getUpperTuckState(templateId){
    const state=upperTuckState[templateId]||{mode:'auto',depth:null};
    return Object.freeze({mode:state.mode,depth:state.depth});
  }

  // Preserve a source tuck's edge profiles and let only its middle span absorb W.
  // This is the T005 mapping principle expressed without copying T005 coordinates.
  function mapUpperTuckX(value,sourceLeft,sourceRight,targetLeft,targetRight,unitToMm,profileScale){
    const sourceMid=(sourceLeft+sourceRight)/2;
    if(value<=sourceMid)return targetLeft+(value-sourceLeft)*unitToMm*profileScale;
    return targetRight-(sourceRight-value)*unitToMm*profileScale;
  }

  function upperTuckBoundaryFrom2D(outline,leftCut,rightCut){
    const leftOuter=leftCut[leftCut.length-1],rightOuter=rightCut[0];
    const nearestIndex=target=>outline.reduce((best,point,index)=>{
      const distance=(point.x-target.x)**2+(point.y-target.y)**2;
      return distance<best.distance?{index,distance}:best;
    },{index:0,distance:Infinity}).index;
    const leftIndex=nearestIndex(leftOuter),rightIndex=nearestIndex(rightOuter);
    const route=(from,to,step)=>{
      const points=[];let index=from;
      while(true){points.push(outline[index]);if(index===to)break;index=(index+step+outline.length)%outline.length;}
      return points;
    };
    const forward=route(leftIndex,rightIndex,1),backward=route(leftIndex,rightIndex,-1);
    const topRoute=Math.min(...forward.map(point=>point.y))<=Math.min(...backward.map(point=>point.y))?forward:backward;
    return [leftCut[0],leftCut[1]].concat(topRoute,[rightCut[1],rightCut[rightCut.length-1]]);
  }

  root.PacVuUpperTuckRule=Object.freeze({
    limits:upperTuckLimits,profiles:upperTuckProfiles,resolve:resolveUpperTuck,
    setState:setUpperTuckState,getState:getUpperTuckState,mapX:mapUpperTuckX,
    boundaryFrom2D:upperTuckBoundaryFrom2D
  });
  root.PacVuTuck2DVisualCommon=Object.freeze({resolveScreenStyle,applyRendererResponsive});
})(typeof window!=='undefined'?window:globalThis);
