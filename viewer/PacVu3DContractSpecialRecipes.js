/* S001 private 3D display masks, mirrored without viewer/assembly code.
 * Read-only source comparison tests guard these recipes against source drift.
 * Coordinates here retain the ORIGINAL source units; adapter converts to mm.
 * Owners: S001_3d.js, S001_inner_3d.js, S001_insert_3d.js.
 */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.PacVu3DContractSpecialRecipes=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const U=.3527778112205911,TOLERANCE_MM=.05,UNIT_TO_MM=U;
 function sample(d,r,seedsMin=12){
   const path=r.document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);
   const len=path.getTotalLength(),out=[],at=n=>{const p=path.getPointAtLength(n);return {x:p.x,y:p.y};};
   if(!(len>0))throw new Error('S001 mapping: empty source contour.');
   const dev=(p,a,b)=>{const x=b.x-a.x,y=b.y-a.y,ll=x*x+y*y,t=ll?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/ll)):0;return Math.hypot(p.x-a.x-x*t,p.y-a.y-y*t);};
   function split(da,a,db,b,depth){const dm=(da+db)/2,m=at(dm);if(depth<18&&dev(m,a,b)>.05/U){split(da,a,dm,m,depth+1);split(dm,m,db,b,depth+1);}else out.push(a);}
   const seeds=Math.max(seedsMin,Math.ceil(len/18));for(let i=0;i<seeds;i++)split(len*i/seeds,at(len*i/seeds),len*(i+1)/seeds,at(len*(i+1)/seeds),0);return out;
 }
 function intersect(contour,box,r,mode){
   const C=r.ClipperLib,k=10000,cv=ps=>ps.map(p=>({X:Math.round(p.x*k),Y:Math.round(p.y*k)}));
   const [x1,y1,x2,y2]=Array.isArray(box)?box:[box.minX,box.minY,box.maxX,box.maxY],mask=box.points||[{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}];
   const out=new C.Paths(),op=new C.Clipper();op.AddPath(cv(contour),C.PolyType.ptSubject,true);op.AddPath(cv(mask),C.PolyType.ptClip,true);
   op.Execute(C.ClipType.ctIntersection,out,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero);
   if(mode==='all')return out.filter(p=>Math.abs(C.Clipper.Area(p))>2).map(p=>p.map(q=>({x:q.X/k,y:q.Y/k})));
   if(mode==='largest')out.sort((a,b)=>Math.abs(C.Clipper.Area(b))-Math.abs(C.Clipper.Area(a)));
   return (out[0]||[]).map(q=>({x:q.X/k,y:q.Y/k}));
 }
 function outer(part,r){const flattenPath=d=>sample(d,r),clip=(p,b)=>intersect(p,b,r,'largest');
    const spec = part.spec;
    const piecewise = (value, source, target) => {
      let index = 0;
      if (value <= source[0]) index = 0;
      else if (value >= source[source.length - 1]) index = source.length - 2;
      else while (index < source.length - 2 && value > source[index + 1]) index += 1;
      const amount = (value - source[index]) / (source[index + 1] - source[index]);
      return target[index] + (target[index + 1] - target[index]) * amount;
    };
    const mp = (x, y) => ({
      x: piecewise(x, spec.sourceX, spec.targetX),
      y: piecewise(y, spec.sourceY, spec.targetY)
    });
    const contour = flattenPath(part.fillPath, TOLERANCE_MM / UNIT_TO_MM);
    const holes = part.holeElements.map(item => flattenPath(item.d, TOLERANCE_MM / UNIT_TO_MM));
    const b = part.bounds;
    const x0 = mp(399.037, 0).x; const x1 = mp(469.903, 0).x;
    const x2 = mp(1314.628, 0).x; const x3 = mp(1487.541, 0).x;
    const x4 = mp(2332.265, 0).x; const x5 = mp(2500.927, 0).x;
    const yTopBack = mp(0, 436.117).y; const yTopFront = mp(0, 504.149).y;
    const yBottom = mp(0, 1263.834).y;
    const pad = 0.08;
    const regions = {
      glue: { minX: x0 - pad, maxX: x1 + pad, minY: yTopBack - pad, maxY: yBottom + pad },
      back: { minX: x1 - pad, maxX: x2 + pad, minY: yTopBack - pad, maxY: yBottom + pad },
      sideLeft: {
        minX: x2 - pad, maxX: x3 + pad, minY: yTopBack - pad, maxY: yBottom + pad,
        points: [
          { x: x2, y: yTopBack }, { x: x3, y: yTopFront },
          { x: x3, y: yBottom + pad }, { x: x2, y: yBottom + pad }
        ]
      },
      front: { minX: x3 - pad, maxX: x4 + pad, minY: yTopFront - pad, maxY: yBottom + pad },
      sideRight: {
        minX: x4 - pad, maxX: x5 + pad, minY: mp(0, 437.79).y - pad, maxY: yBottom + pad,
        points: [
          { x: x4, y: yTopFront }, { x: x5, y: mp(0, 437.79).y },
          { x: x5, y: yBottom + pad }, { x: x4, y: yBottom + pad }
        ]
      },
      lidBack: { minX: x1 - pad, maxX: x2 + pad, minY: b.minY - 2, maxY: yTopBack + pad },
      lidSideLeft: {
        minX: x2 - pad, maxX: x3 + pad, minY: b.minY - 2, maxY: yTopFront + pad,
        points: [
          { x: x2, y: b.minY - 2 }, { x: x3, y: b.minY - 2 },
          { x: x3, y: yTopFront }, { x: x2, y: yTopBack }
        ]
      },
      lidFront: { minX: x3 - pad, maxX: x4 + pad, minY: b.minY - 2, maxY: yTopFront + pad },
      lidSideRight: {
        minX: x4 - pad, maxX: x5 + 2, minY: b.minY - 2, maxY: yTopFront + pad,
        points: [
          { x: x4, y: b.minY - 2 }, { x: x5 + 2, y: b.minY - 2 },
          { x: x5, y: mp(0, 437.79).y }, { x: x4, y: yTopFront }
        ]
      },
      bottomA: { minX: x1 - pad, maxX: x2 + pad, minY: yBottom - pad, maxY: b.maxY + 2 },
      bottomLeft: { minX: x2 - pad, maxX: x3 + pad, minY: yBottom - pad, maxY: b.maxY + 2 },
      bottomB: { minX: x3 - pad, maxX: x4 + pad, minY: yBottom - pad, maxY: b.maxY + 2 },
      bottomRight: { minX: x4 - pad, maxX: x5 + 2, minY: yBottom - pad, maxY: b.maxY + 2 }
    };
    const contours = {};
    Object.keys(regions).forEach(name => { contours[name] = clip(contour, regions[name]); });


 return {contours:Object.fromEntries(Object.entries(contours).map(([k,p])=>[k,[p]])),regions,mp,holes,clip};
 }
 function inner(part,r){const spec=part.spec,flatten=d=>sample(d,r,10),clip=(p,b)=>intersect(p,b,r,'all');
    const piecewise=(v,s,t)=>{let i=0;if(v>=s[s.length-1])i=s.length-2;else while(i<s.length-2&&v>s[i+1])i++;const a=(v-s[i])/(s[i+1]-s[i]);return t[i]+(t[i+1]-t[i])*a;};
    const mp=(x,y)=>({x:piecewise(x,spec.sourceX,spec.targetX),y:piecewise(y,spec.sourceY,spec.targetY)});
    const X=x=>mp(x,2304.303).x,Y=y=>mp(429.694,y).y,b=part.bounds,pad=.06;
    const sx={oL:X(106.544),l0:X(163.237),l1:X(256.78),l2:X(273.788),baseL:X(429.694),baseR:X(1251.741),r2:X(1407.646),r1:X(1424.654),r0:X(1518.197),oR:X(1574.89)};
    const sy={top:Y(1750.172),t1:Y(1829.5),t2:Y(1985.406),t3:Y(2061.941),baseT:Y(2223.516),lockT:Y(2226.351),lockT2:Y(2295.799),baseB:Y(3039.894),lockB2:Y(3027.138),lockB:Y(3037.059),b1:Y(3201.468),b2:Y(3218.477),bottom:Y(3382.927)};
    const boxes={
      base:[sx.baseL-pad,sy.baseT-pad,sx.baseR+pad,sy.baseB+pad],
      sideL1:[sx.l2-pad,sy.lockT,sx.baseL+pad,sy.lockB], sideL2:[sx.l1-pad,sy.lockT,sx.l2+pad,sy.lockB], sideL3:[sx.oL-pad,sy.lockT2,sx.l1+pad,sy.lockB2],
      sideR1:[sx.baseR-pad,sy.lockT,sx.r2+pad,sy.lockB], sideR2:[sx.r2-pad,sy.lockT,sx.r1+pad,sy.lockB], sideR3:[sx.r1-pad,sy.lockT2,sx.oR+pad,sy.lockB2],
      topLockL:[sx.l2,sy.top,sx.baseL,sy.lockT], topHookL:[sx.oL,sy.top,sx.l1,sy.lockT2],
      topLockR:[sx.baseR,sy.top,sx.r2,sy.lockT], topHookR:[sx.r1,sy.top,sx.oR,sy.lockT2],
      top6:[sx.baseL,sy.t3,sx.baseR,sy.baseT], top7:[sx.baseL,sy.t2,sx.baseR,sy.t3], top8:[X(449.536),sy.t1,X(1231.898),sy.t2], top9:[X(449.536),sy.top,X(1231.898),sy.t1],
      bottomLockL:[sx.l2,sy.lockB,sx.baseL,sy.bottom], bottomHookL:[sx.oL,sy.lockB2,sx.l1,sy.bottom],
      bottomLockR:[sx.baseR,sy.lockB,sx.r2,sy.bottom], bottomHookR:[sx.r1,sy.lockB2,sx.oR,sy.bottom],
      bottom12:[sx.baseL,sy.baseB,sx.baseR,sy.b1], bottom13:[sx.baseL,sy.b1,sx.baseR,sy.b2], bottom14:[X(449.536),sy.b2,X(1231.898),sy.bottom]
    };
    const sources=part.fillPaths.map(flatten), contours={};
    Object.entries(boxes).forEach(([name,box])=>{contours[name]=sources.flatMap(c=>clip(c,box));});

 return {contours,regions:boxes,mp};
 }
 function insert(part,r){const s=part.spec,flatten=d=>sample(d,r),clip=(p,b)=>intersect(p,b,r,'first');
    const pw=(v,a,b)=>{let i=0;if(v>=a[a.length-1])i=a.length-2;else while(i<a.length-2&&v>a[i+1])i++;const t=(v-a[i])/(a[i+1]-a[i]);return b[i]+(b[i+1]-b[i])*t;},mp=(x,y)=>({x:pw(x,s.sourceX,s.targetX),y:pw(y,s.sourceY,s.targetY)}),X=x=>mp(x,2500).x,Y=y=>mp(2200,y).y;
    const x0=X(1814.913),x1=X(1894.283),x2=X(2670.976),x3=X(2750.346),y0=Y(2135.677),y1=Y(2215.047),y2=Y(2923.709),y3=Y(3003.079),pad=.06;
    const regions={center:[x1-pad,y1-pad,x2+pad,y2+pad],top:[x1,y0,x2,y1+pad],bottom:[x1,y2-pad,x2,y3],left:[x0,y1,x1+pad,y2],right:[x2-pad,y1,x3,y2]};
    const outer=flatten(part.fillPath),contours=Object.fromEntries(Object.entries(regions).map(([n,b])=>[n,clip(outer,b)]));

 return {contours:Object.fromEntries(Object.entries(contours).map(([k,p])=>[k,[p]])),regions,mp};
 }
 return Object.freeze({sleeve:(layout,r)=>({outerSleeve:outer(layout.rawParts.outerSleeve,r),innerTray:inner(layout.rawParts.innerTray,r),insertPad:insert(layout.rawParts.insertPad,r)}),unitToMm:U});
});

