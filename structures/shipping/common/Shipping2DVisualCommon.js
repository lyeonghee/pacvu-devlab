(function(root){
  'use strict';

  function positive(value,fallback){
    const number=Number(value);
    return Number.isFinite(number)&&number>0?number:fallback;
  }

  function resolveContractProfile(profile){
    const internal=profile&&profile.internal;
    const source=internal&&internal.source;
    const target=positive(internal&&internal.referenceTargetPx,0);
    const sourceFont=positive(source&&source.font,0);
    if(!profile||!(target>0&&sourceFont>0))return profile;

    const ratio=value=>positive(value,0)/sourceFont*target;
    const panelSource=positive(profile.panelLabel&&profile.panelLabel.sourceFont,0);
    const panelTarget=panelSource>0?panelSource/sourceFont*target:0;
    return Object.assign({},profile,{
      panelLabel:Object.assign({},profile.panelLabel,panelTarget>0?{
        referenceTargetPx:panelTarget,
        minPx:positive(profile.panelLabel.minPx,panelTarget*.9),
        maxPx:positive(profile.panelLabel.maxPx,panelTarget*1.2)
      }:{}),
      internal:Object.assign({},internal,{
        font:{screenPx:target},
        line:{screenPx:ratio(source.line)},
        textGap:{screenPx:ratio(source.textGap)},
        marker:Object.assign({},internal.marker,{
          enabled:true,
          widthPx:ratio(source.markerWidth),
          heightPx:ratio(source.markerHeight)
        })
      })
    });
  }

  root.PacVuShipping2DVisualCommon=Object.freeze({resolveContractProfile});
})(typeof window!=='undefined'?window:globalThis);
