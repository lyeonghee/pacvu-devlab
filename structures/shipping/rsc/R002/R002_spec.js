// ============================================================
// R002_spec.js - A-Type RSC Shipping Box 2
// Source SVG base: R002_425_335_103_(cutpath, bleed path, folding line).svg
// Base size: W 425 / D 335 / H 103
// ============================================================

function R002_getSpec(W, D, H) {
  var base = {
    W: 425,
    D: 335,
    H: 103,
    unitToMm: 25.4 / 72,
    originX: 887.762,
    originY: 203.594,
    sourceGlueL:788.549, sourceFrontL:887.762, sourceFrontR:2092.486,
    sourceSideLR:3042.092, sourceBackR:4246.817, sourceSideRR:5190.754,
    sourceTop:203.594, sourceFoldTop:678.397, sourceFoldBot:984.539, sourceBot:1459.341,
    sourceBounds: {
      minX: 788.549,
      minY: 196.223,
      maxX: 5198.911,
      maxY: 1473.576
    }
  };

  var glueW=(base.sourceFrontL-base.sourceGlueL)*base.unitToMm;
  var targetSideRR = W + D + W + (D - 2);
  var targetBot = D + H;
  var xs=[base.sourceGlueL,base.sourceFrontL,base.sourceFrontR,base.sourceSideLR,base.sourceBackR,base.sourceSideRR];
  var xt=[-glueW,0,W,W+D,W+D+W,targetSideRR];
  var ys=[base.sourceTop,base.sourceFoldTop,base.sourceFoldBot,base.sourceBot];
  var yt=[0,D/2,D/2+H,targetBot];
  function map(v,s,t){var i;if(v<=s[0])i=0;else if(v>=s[s.length-1])i=s.length-2;else for(i=0;i<s.length-1;i++)if(v<=s[i+1])break;return t[i]+(v-s[i])*(t[i+1]-t[i])/(s[i+1]-s[i]);}
  function mapX(v){return map(v,xs,xt);} function mapY(v){return map(v,ys,yt);}

  var bounds = {
    minX:mapX(base.sourceBounds.minX),minY:mapY(base.sourceBounds.minY),
    maxX:mapX(base.sourceBounds.maxX),maxY:mapY(base.sourceBounds.maxY)
  };
  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxY - bounds.minY;

  return {
    W: W,
    D: D,
    H: H,
    base: base,
    transform:{a:1,b:0,c:0,d:1,e:0,f:0},mapX:mapX,mapY:mapY,xMap:{source:xs,target:xt},yMap:{source:ys,target:yt},
    xFrontL: 0,
    xFrontR: W,
    xSideLR: W + D,
    xBackR: W + D + W,
    xSideRR: targetSideRR,
    yTop: 0,
    yFoldTop: D / 2,
    yFoldTopArc: D / 2,
    yFoldBotArc: D / 2 + H,
    yFoldBot: D / 2 + H,
    yBot: targetBot,
    bounds: bounds
  };
}
