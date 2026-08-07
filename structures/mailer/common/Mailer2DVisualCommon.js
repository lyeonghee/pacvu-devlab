(function(root){
  'use strict';
  function positive(value,fallback){const number=Number(value);return Number.isFinite(number)&&number>0?number:fallback;}
  function finite(value,fallback){const number=Number(value);return Number.isFinite(number)?number:fallback;}
  function resolveScreenStyle(profile,fallbackInternal,fallbackPanelLabel,svg){
    const internal=profile&&profile.internal||{},panel=profile&&profile.panelLabel||{};
    const marker=internal.marker||{},font=internal.font||{},line=internal.line||{},textGap=internal.textGap||{};
    const responsive=positive(svg&&svg.dataset&&svg.dataset.pacvuVisualResponsiveScale,1);
    return {
      internal:Object.assign({},fallbackInternal,{
        dimensionTextPx:positive(font.screenPx,fallbackInternal.dimensionTextPx)*responsive,
        dimensionLinePx:positive(line.screenPx,fallbackInternal.dimensionLinePx)*responsive,
        dimensionTextOffsetPx:finite(textGap.horizontalOffsetPx,fallbackInternal.dimensionTextOffsetPx)*responsive,
        dimensionVerticalTextOffsetPx:finite(textGap.verticalOffsetPx,fallbackInternal.dimensionVerticalTextOffsetPx)*responsive,
        internalArrowWidthPx:positive(marker.widthPx,fallbackInternal.internalArrowWidthPx)*responsive,
        internalArrowHeightPx:positive(marker.heightPx,fallbackInternal.internalArrowHeightPx)*responsive,
        preserveRendererPosition:textGap.preserveRenderer===true
      }),
      panelLabel:Object.assign({},fallbackPanelLabel,{
        screenPx:positive(panel.referenceTargetPx,fallbackPanelLabel.screenPx)*responsive,
        minPx:positive(panel.minPx,fallbackPanelLabel.minPx)*responsive,
        maxPx:positive(panel.maxPx,fallbackPanelLabel.maxPx)*responsive
      })
    };
  }
  root.PacVuMailer2DVisualCommon=Object.freeze({resolveScreenStyle});
})(typeof window!=='undefined'?window:globalThis);
