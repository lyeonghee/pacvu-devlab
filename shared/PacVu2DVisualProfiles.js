(function(root){
  'use strict';

  function deepFreeze(value){
    Object.keys(value).forEach(key=>{
      if(value[key]&&typeof value[key]==='object'&&!Object.isFrozen(value[key]))deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }
  function createProfile(templateId,sourceFile,selectors,internalMarker,visualValues){
    const visual=visualValues||{};
    return deepFreeze({
      templateId,
      reference:{
        sourceFile:sourceFile||null,
        viewBox:null,
        referenceDielineBounds:null,
        referenceBleedBounds:null
      },
      selectors:{
        viewport:selectors.viewport||'#viewportGroup,#mainGroup',
        defs:'defs',
        cut:selectors.cut||null,
        fold:selectors.fold||'.fold',
        bleed:selectors.bleed||'.bleed',
        panelLabels:selectors.panelLabels||'#layer-labels .label',
        internalLayer:selectors.internalLayer||'#layer-dimensions',
        internalLines:selectors.internalLines||'#layer-dimensions line',
        internalTexts:selectors.internalTexts||'#layer-dimensions text',
        overallLayer:selectors.overallLayer||'#layer-overall-dimensions',
        overallLines:selectors.overallLines||'#layer-overall-dimensions .overall-dim',
        overallGuides:selectors.overallGuides||'#layer-overall-dimensions .overall-ext',
        overallTexts:selectors.overallTexts||'#layer-overall-dimensions .overall-text'
      },
      panelLabel:Object.assign({
        referenceTargetPx:null,minPx:null,maxPx:null,scaleCorrection:null
      },visual.panelLabel||{}),
      internal:Object.assign({
        referenceTargetPx:null,minPx:null,maxPx:null,scaleCorrection:null,
        font:null,line:null,textGap:null,
        marker:internalMarker||{enabled:false,sourceId:null,startId:null,endId:null}
      },visual.internal||{}),
      overall:Object.assign({
        preserveCurrent:true,
        referenceTargetPx:null,minPx:null,maxPx:null,scaleCorrection:null,
        font:null,line:null,textGap:null,guideLength:null,
        marker:{enabled:false,sourceId:null,startId:null,endId:null}
      },visual.overall||{}, {
        marker:Object.assign(
          {enabled:false,sourceId:null,startId:null,endId:null},
          visual.overall?.marker||{}
        )
      }),
      technicalLines:Object.assign({
        apply:false,cut:null,fold:null,bleed:null
      },visual.technicalLines||{})
    });
  }

  const basic={};
  const PROFILES={
    T001:createProfile('T001','structures/tuck/common/reference/T001/T001-1_57-57-177_(cutPath + foldLine+ BleedLine)_260727 bottom수정_final.svg',{cut:'.cut-fill'},null,{
      panelLabel:{referenceTargetPx:17,minPx:15,maxPx:18,scaleCorrection:1},
      internal:{
        referenceTargetPx:17,minPx:17,maxPx:17,scaleCorrection:1,
        font:{screenPx:17},line:{screenPx:1.2},
        textGap:{preserveRenderer:true},
        marker:{enabled:true,widthPx:10.65,heightPx:9}
      }
    }),
    T002:createProfile('T002','structures/tuck/common/reference/T002/T002_126x81x308_(cutpath, bleedpath, foldingline).svg',{cut:'.cut-fill'}, {enabled:true,sourceId:'arrow',startId:'t002-internal-arrow-start',endId:'t002-internal-arrow-end'}),
    T003:createProfile('T003','structures/tuck/common/reference/T003/T003_86.5x86.5x296_(cutpath,bleedpath,foldingline).svg',{cut:'.cut-fill'}, {enabled:true,sourceId:'arrow',startId:'t003-internal-arrow-start',endId:'t003-internal-arrow-end'}),
    T004:createProfile('T004','structures/tuck/common/reference/T004/T004_130x65x190_(cutpath,bleedpath,foldingline).svg',{cut:'.cut-fill'}, {enabled:true,sourceId:'arrow',startId:'t004-internal-arrow-start',endId:'t004-internal-arrow-end'}),
    T005:createProfile('T005','structures/tuck/common/reference/T005/T005_bbox_286x90x344mm.svg',{cut:'.cut-fill'},null),
    M001:createProfile('M001','structures/mailer/common/reference/M001/M001_gbox_235x229x91mm_master.svg',{cut:'.cut'},null,{
      panelLabel:{referenceTargetPx:12,minPx:11,maxPx:13,scaleCorrection:1},
      internal:{font:{screenPx:12},line:{screenPx:0.8},textGap:{horizontalOffsetPx:-4,verticalOffsetPx:-9},marker:{enabled:true,widthPx:5.5,heightPx:4.5}}
    }),
    M002:createProfile('M002','structures/mailer/common/reference/M002/M002_400x308x80_cutpath,bleedpath,folding line,slot,hole,mirror(left,right).svg',{cut:'.thomson'},null,{
      panelLabel:{referenceTargetPx:12,minPx:11,maxPx:13,scaleCorrection:1},
      internal:{font:{screenPx:12},line:{screenPx:0.8},textGap:{horizontalOffsetPx:-4.5,verticalOffsetPx:-9},marker:{enabled:true,widthPx:5.5,heightPx:4.5}}
    }),
    M003:createProfile('M003','structures/mailer/common/reference/M003/M003_gbox_flat_205x205x65mm.svg',{viewport:'#mainGroup',cut:'.cut'},null,{
      panelLabel:{referenceTargetPx:11.5,minPx:10.5,maxPx:12.5,scaleCorrection:1},
      internal:{font:{screenPx:12},line:{screenPx:0.8},textGap:{horizontalOffsetPx:-4,verticalOffsetPx:-9},marker:{enabled:true,widthPx:5.5,heightPx:4.5}}
    }),
    B001:createProfile('B001','structures/bakery/common/reference/B001/B001_160x110x80_final.svg',{cut:'.cut-fill'},null),
    B002:createProfile('B002','structures/bakery/B002/reference/B002_136x67x137_final.svg',{cut:'.cut'},null),
    R001:createProfile('R001','structures/shipping/common/reference/R001/R001_285x170x120_final.svg',{cut:'.thomson'},null,{
      panelLabel:{sourceFont:24,minPx:10.8,maxPx:14.4,scaleCorrection:1},
      internal:{
        referenceTargetPx:12.5,minPx:11,maxPx:15,scaleCorrection:.5,
        source:{font:25,line:1,markerWidth:9.95,markerHeight:8.13,textGap:8},
        marker:{enabled:true}
      }
    }),
    R002:createProfile('R002','structures/shipping/rsc/R002/reference/R002_425_335_103_(cutpath, bleed path, folding line).svg',{cut:'.thomson'},null),
    R003:createProfile('R003','structures/shipping/common/reference/R003/R003_350x230x220(cutpath,bleedpath,foldingline).svg',{cut:'.thomson'},null,{
      internal:{minPx:11,maxPx:15,font:{screenPx:12.5}}
    }),
    R004:createProfile('R004','structures/shipping/common/reference/R004/R004_280x220x190_(cutpath,bleedpath, folding line,handle hole).svg',{cut:'.thomson'},null,{
      internal:{minPx:11,maxPx:15,font:{screenPx:12.5}}
    }),
    GA001:createProfile('GA001','structures/gable/common/reference/GA001/GA001_241x127x127mm.svg',{viewport:'#mainSvg',cut:'#layer-cut',fold:'#layer-fold',bleed:'#layer-bleed',panelLabels:'#layer-labels .panel-label',internalLines:'#layer-dimensions .dimension line',internalTexts:'#layer-dimensions .dimension text'},null,{
      panelLabel:{referenceTargetPx:12,minPx:10.8,maxPx:14.4,scaleCorrection:.5,sourceFont:24},
      internal:{referenceTargetPx:12.5,minPx:11,maxPx:15,scaleCorrection:.5,font:{screenPx:12.5},line:{screenPx:.8},textGap:{screenPx:4},marker:{enabled:true,widthPx:6,heightPx:4.9},source:{font:25,line:1,markerWidth:9.95,markerHeight:8.13}},
      technicalLines:{apply:false,cut:{source:1.701},fold:{source:1.276},bleed:{source:1.559}}
    }),
    S001:createProfile('S001','structures/sleeve_slide/S001/reference/S001_298x61x292(cutpath,bleedpath,foldingline).svg',{cut:'.cut-fill',panelLabels:'#layer-labels .part-label'},null,{
      overall:{textGap:{screenPx:5}}
    }),
    TR001:createProfile('TR001','structures/tray/common/reference/TR001/TR001 368x282x140_(cutpath, bleedpath, foldingline).svg',{cut:'.cut'},null,{
      panelLabel:{referenceTargetPx:12,minPx:10.8,maxPx:14.4,scaleCorrection:.5,sourceFont:26},
      internal:{referenceTargetPx:12.5,minPx:11,maxPx:15,scaleCorrection:.5,font:{screenPx:12.5},line:{screenPx:.8},textGap:{screenPx:6},marker:{enabled:true,widthPx:4.6,heightPx:3.8},source:{font:27,line:.75,markerWidth:9.949,markerHeight:8.13}},
      technicalLines:{apply:false,cut:{source:2},fold:{source:.216},bleed:{source:2}}
    }),
    TR002:createProfile('TR002','structures/tray/common/reference/TR002/TR002  200x280x100_(cutpath, bleedpath, foldingline).svg',{cut:'.cut'},null,{
      panelLabel:{referenceTargetPx:12,minPx:10.8,maxPx:14.4,scaleCorrection:.5,sourceFont:20},
      internal:{referenceTargetPx:12.5,minPx:11,maxPx:15,scaleCorrection:.5,font:{screenPx:12.5},line:{screenPx:.8},textGap:{screenPx:6},marker:{enabled:true,widthPx:5.9,heightPx:4.8},source:{font:21,line:1,markerWidth:9.949,markerHeight:8.13}},
      technicalLines:{apply:false,cut:{source:2},fold:{source:.216},bleed:{source:2}}
    }),
    TR003:createProfile('TR003','structures/tray/common/reference/TR003/TR003 317x496x133_(cutpath, bleedpath, foldingline).svg',{cut:'.cut'},null,{
      panelLabel:{referenceTargetPx:12,minPx:10.8,maxPx:14.4,scaleCorrection:.5,sourceFont:27},
      internal:{referenceTargetPx:12.5,minPx:11,maxPx:15,scaleCorrection:.5,font:{screenPx:12.5},line:{screenPx:.8},textGap:{screenPx:6},marker:{enabled:true,widthPx:5,heightPx:4},source:{font:27.477,line:1,markerWidth:11.18,markerHeight:10.584}},
      technicalLines:{apply:false,cut:{source:2},fold:{source:.5},bleed:{source:2}}
    }),
    C001:createProfile('C001','structures/cake/common/reference/C001/C001_277x275x140_(cutpath,bleedpath,foldingline).svg',{cut:'.cut-fill'},null,{
      panelLabel:{referenceTargetPx:17,minPx:15,maxPx:18,scaleCorrection:1},
      internal:{
        referenceTargetPx:17,minPx:17,maxPx:17,scaleCorrection:1,
        font:{screenPx:17},line:{screenPx:1.2},textGap:{screenPx:1},
        marker:{enabled:true,widthPx:10.65,heightPx:9}
      },
      overall:{
        referenceTargetPx:17,minPx:17,maxPx:17,scaleCorrection:1,
        font:{screenPx:17},line:{screenPx:1.2},textGap:{screenPx:1},guideLength:{screenPx:12},
        marker:{enabled:true,widthPx:10.65,heightPx:9}
      }
    })
  };
  Object.keys(PROFILES).forEach(id=>{basic[id]=PROFILES[id];});
  const REGISTRY=Object.freeze(basic);

  root.PacVu2DVisualProfiles=Object.freeze({
    get(templateId){return REGISTRY[String(templateId||'').toUpperCase()]||null;},
    has(templateId){return !!REGISTRY[String(templateId||'').toUpperCase()];},
    ids(){return Object.keys(REGISTRY);},
    registry:REGISTRY
  });
})(typeof window!=='undefined'?window:globalThis);
