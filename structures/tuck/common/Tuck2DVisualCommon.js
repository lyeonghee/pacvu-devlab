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

  root.PacVuTuck2DVisualCommon=Object.freeze({resolveScreenStyle,applyRendererResponsive});
})(typeof window!=='undefined'?window:globalThis);
