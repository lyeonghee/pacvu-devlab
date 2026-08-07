// ============================================================
// M001_layout.js - PacVu Master G Box geometry source of truth
// Origin (0,0): reference cutpath point 1-2L.
// ============================================================

(function (root) {
  'use strict';

  const n = v => Math.round(v * 10000) / 10000;
  const pt = (x, y) => ({ x: n(x), y: n(y) });
  const line = (id, a, b, panelIds) => ({ id, type: 'line', a: pt(a.x, a.y), b: pt(b.x, b.y), panelIds: panelIds || [] });
  const path = (id, d, panelIds) => ({ id, type: 'path', d, panelIds: panelIds || [] });
  const N = v => n(v);

  const M001_REFERENCE_CUT = 'M572.599,148.056v-6.491h666.142v6.491c129.066,0,233.816,76.849,233.816,171.539,0,35.34-6.965,73.774-54.011,73.774l-179.804-.558c-3.704,0-6.707,3.003-6.707,6.707,0,3.105,2.132,5.805,5.153,6.524l218.492,52.031c17.752,4.792,41.014,18.5,41.014,36.887v458.249c0,23.904-17.937,30.658-41.014,36.887l-218.492,52.031c-3.603.858-5.829,4.475-4.971,8.078.719,3.021,3.419,5.153,6.524,5.153h195.786c14.816,0,26.827,12.011,26.827,26.827v211.779l-222.613,4.127c-2.351.006-4.251,1.916-4.246,4.267.006,2.342,1.903,4.24,4.246,4.246h257.953l14.173,5.669h257.953v99.213l14.173,4.252v90.709l-14.173,4.252v240.945l14.173,4.252v90.709l-14.173,4.252v99.213h-257.953l-14.173,5.669h-257.953c-2.351.006-4.251,1.916-4.246,4.267.006,2.342,1.903,4.24,4.246,4.246l222.613,4.127v215.648c0,14.816-12.011,26.827-26.827,26.827h-195.786l-4.256,2.837h-657.629l-4.256-2.837h-195.786c-14.816,0-26.827-12.011-26.827-26.827h0v-215.649l222.613-4.127c2.351-.006,4.251-1.916,4.246-4.267-.006-2.342-1.903-4.24-4.246-4.246h-257.953l-14.173-5.669H42.52v-99.213l-14.173-4.252v-90.709l14.173-4.252v-240.945l-14.173-4.252v-90.709l14.173-4.252v-99.213h257.953l14.173-5.669h257.953c2.351-.006,4.251-1.916,4.246-4.267-.006-2.342-1.903-4.24-4.246-4.246l-222.613-4.127v-211.779c0-14.816,12.011-26.827,26.827-26.827h195.786c3.704,0,6.707-3.003,6.707-6.707,0-3.105-2.132-5.805-5.153-6.524l-218.492-52.031c-23.078-6.229-41.014-12.984-41.014-36.887v-458.249c0-18.387,23.262-32.096,41.014-36.887l218.492-52.031c3.603-.858,5.829-4.475,4.971-8.078-.719-3.021-3.419-5.153-6.524-5.153h-179.804c-47.047,0-54.011-37.877-54.011-73.216,0-94.689,104.749-171.539,233.816-171.539h-.002Z';


  function buildReferenceCut(W, D, H, source, assignNumbers) {
    const sx0=572.599, sx1=1238.74, refW=sx1-sx0, refH=257.953;
    const sy=[148.056,399.517,1048.651,1306.604,1955.738,2213.69];
    const topInset=H*(6.491/refH);
    const ty=[0,H-topInset,H-topInset+D,2*H-topInset+D,2*H-topInset+2*D,3*H-topInset+2*D];
    const mapX=value=>value<sx0?(value-sx0)/refH*H:value>sx1?W+(value-sx1)/refH*H:(value-sx0)/refW*W;
    const mapY=value=>{
      if(value<=sy[0])return (value-sy[0])/refH*H;
      for(let k=1;k<sy.length;k++)if(value<=sy[k])return ty[k-1]+(value-sy[k-1])/(sy[k]-sy[k-1])*(ty[k]-ty[k-1]);
      return ty[ty.length-1]+(value-sy[sy.length-1])/refH*H;
    };
    const tokens=(source||M001_REFERENCE_CUT).match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[];
    let i=0,cmd='',cx=0,cy=0,startX=0,startY=0; const raw=[];
    const isCmd=v=>/^[A-Za-z]$/.test(v||'');
    const addLine=(ex,ey)=>{if(Math.hypot(ex-cx,ey-cy)>1e-7)raw.push({type:'line',a:pt(mapX(cx),mapY(cy)),b:pt(mapX(ex),mapY(ey))});cx=ex;cy=ey;};
    while(i<tokens.length){
      if(isCmd(tokens[i]))cmd=tokens[i++];
      const rel=cmd===cmd.toLowerCase(),op=cmd.toUpperCase();
      if(op==='M'){const px=+tokens[i++],py=+tokens[i++];cx=rel?cx+px:px;cy=rel?cy+py:py;startX=cx;startY=cy;}
      else if(op==='H'){const v=+tokens[i++];addLine(rel?cx+v:v,cy);}
      else if(op==='V'){const v=+tokens[i++];addLine(cx,rel?cy+v:v);}
      else if(op==='L'){const px=+tokens[i++],py=+tokens[i++];addLine(rel?cx+px:px,rel?cy+py:py);}
      else if(op==='C'){
        const v=[+tokens[i++],+tokens[i++],+tokens[i++],+tokens[i++],+tokens[i++],+tokens[i++]];
        const c1x=rel?cx+v[0]:v[0],c1y=rel?cy+v[1]:v[1],c2x=rel?cx+v[2]:v[2],c2y=rel?cy+v[3]:v[3],ex=rel?cx+v[4]:v[4],ey=rel?cy+v[5]:v[5];
        raw.push({type:'cubic',a:pt(mapX(cx),mapY(cy)),c1:pt(mapX(c1x),mapY(c1y)),c2:pt(mapX(c2x),mapY(c2y)),b:pt(mapX(ex),mapY(ey))});cx=ex;cy=ey;
      } else if(op==='Z'){addLine(startX,startY);cmd='';}
      else throw new Error('Unsupported M001 reference command: '+cmd);
    }
    if((source||M001_REFERENCE_CUT)===M001_REFERENCE_CUT && D<=120){
      const outerX=raw[23].b.x,tabX=outerX+5,topY=raw[23].b.y,bottomY=raw[32].b.y;
      const length=Math.min(35,Math.max(1,D-6)),slope=Math.min(1.5,length*0.2);
      const center=(topY+bottomY)/2,a=center-length/2,b=center+length/2;
      const setLine=(index,p1,p2)=>{raw[index]={type:'line',a:pt(p1.x,p1.y),b:pt(p2.x,p2.y)};};
      setLine(24,pt(outerX,topY),pt(outerX,a));
      setLine(25,pt(outerX,a),pt(tabX,a+slope));
      setLine(26,pt(tabX,a+slope),pt(tabX,b-slope));
      setLine(27,pt(tabX,b-slope),pt(outerX,b));
      setLine(28,pt(outerX,b),pt(outerX,bottomY));
      for(let index=29;index<=32;index++)setLine(index,pt(outerX,bottomY),pt(outerX,bottomY));
      const mirror=p=>pt(W-p.x,p.y);
      for(let index=24;index<=32;index++){
        const leftIndex=86-index,right=raw[index];
        setLine(leftIndex,mirror(right.b),mirror(right.a));
      }
    }
    raw.forEach(segment=>{
      segment.d=segment.type==='cubic'
        ?`M ${N(segment.a.x)} ${N(segment.a.y)} C ${N(segment.c1.x)} ${N(segment.c1.y)} ${N(segment.c2.x)} ${N(segment.c2.y)} ${N(segment.b.x)} ${N(segment.b.y)}`
        :`M ${N(segment.a.x)} ${N(segment.a.y)} L ${N(segment.b.x)} ${N(segment.b.y)}`;
      segment.points=segment.type==='cubic'?flattenPath(segment.d,12):[segment.a,segment.b];
    });
    const fullD=`M ${N(raw[0].a.x)} ${N(raw[0].a.y)} `+raw.map(s=>s.d.replace(/^M [^ ]+ [^ ]+ /,'')).join(' ')+' Z';
    if(assignNumbers===false)return {segments:[{id:'bleedPath',type:'compound',parts:raw,points:raw.flatMap((part,index)=>index?part.points.slice(1):part.points),d:fullD}],d:fullD};
    const combine=(id,indexes)=>{
      const parts=indexes.map(index=>raw[index]);
      return {id,type:'compound',parts,points:parts.flatMap((part,index)=>index?part.points.slice(1):part.points),d:parts.map(part=>part.d).join(' ')};
    };
    // The reference numbers a two-cubic rounded join as one cut segment.
    // These groups follow the actual command order from 1-3R to 1-37R.
    const rightGroups=[[3],[4],[5],[6,7],[8],[9],[10],[11],[12],[13,14],[15],[16],[17],[18],[19,20],[21],[22],[23],[24],[25],[26],[27],[28],[29],[30],[31],[32],[33],[34],[35],[36,37],[38],[39],[40],[41,42]];
    const numbered=[combine('1-2L',[0]),combine('1-1',[1]),combine('1-2R',[2])];
    rightGroups.forEach((indexes,index)=>numbered.push(combine(`1-${index+3}R`,indexes)));
    numbered.push(combine('1-38',[43]));
    rightGroups.slice().reverse().forEach((indexes,index)=>{
      const leftIndexes=indexes.map(sourceIndex=>86-sourceIndex).sort((a,b)=>a-b);
      if(index===rightGroups.length-1)leftIndexes.push(84,85);
      numbered.push(combine(`1-${37-index}L`,[...new Set(leftIndexes)].sort((a,b)=>a-b)));
    });
    return {segments:numbered,d:fullD};
  }

  function roundedRectGeometry(id, x, y, width, height, radius, panelId) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    const d = [
      `M ${N(x + r)} ${N(y)}`, `L ${N(x + width - r)} ${N(y)}`,
      `A ${N(r)} ${N(r)} 0 0 1 ${N(x + width)} ${N(y + r)}`,
      `L ${N(x + width)} ${N(y + height - r)}`,
      `A ${N(r)} ${N(r)} 0 0 1 ${N(x + width - r)} ${N(y + height)}`,
      `L ${N(x + r)} ${N(y + height)}`,
      `A ${N(r)} ${N(r)} 0 0 1 ${N(x)} ${N(y + height - r)}`,
      `L ${N(x)} ${N(y + r)}`,
      `A ${N(r)} ${N(r)} 0 0 1 ${N(x + r)} ${N(y)}`, 'Z'
    ].join(' ');
    return {
      id, type: 'roundedRect', x: n(x), y: n(y), width: n(width), height: n(height), radius: n(r), d, panelId,
      segments: [
        { type: 'line', a: pt(x + r, y), b: pt(x + width - r, y) },
        { type: 'arc', center: pt(x + width - r, y + r), r: n(r), startAngle: -90, endAngle: 0 },
        { type: 'line', a: pt(x + width, y + r), b: pt(x + width, y + height - r) },
        { type: 'arc', center: pt(x + width - r, y + height - r), r: n(r), startAngle: 0, endAngle: 90 },
        { type: 'line', a: pt(x + width - r, y + height), b: pt(x + r, y + height) },
        { type: 'arc', center: pt(x + r, y + height - r), r: n(r), startAngle: 90, endAngle: 180 },
        { type: 'line', a: pt(x, y + height - r), b: pt(x, y + r) },
        { type: 'arc', center: pt(x + r, y + r), r: n(r), startAngle: 180, endAngle: 270 }
      ]
    };
  }

  // Layout-owned SVG curve flattening. DXF consumes these same computed
  // points, so it never derives another cut or bleed shape in the renderer.
  function flattenPath(d, curveSteps) {
    const tokens = d.match(/[MLHVQCAZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
    let i = 0, op = '', cur = pt(0, 0), start = pt(0, 0), points = [];
    const add = p => { cur = pt(p.x, p.y); points.push(cur); };
    while (i < tokens.length) {
      if (/^[a-z]$/i.test(tokens[i])) op = tokens[i++].toUpperCase();
      if (op === 'M') { add(pt(+tokens[i++], +tokens[i++])); start = cur; op = 'L'; }
      else if (op === 'L') add(pt(+tokens[i++], +tokens[i++]));
      else if (op === 'H') add(pt(+tokens[i++], cur.y));
      else if (op === 'V') add(pt(cur.x, +tokens[i++]));
      else if (op === 'Q') {
        const p0=cur, c=pt(+tokens[i++],+tokens[i++]), p1=pt(+tokens[i++],+tokens[i++]);
        for(let s=1;s<=curveSteps;s++){const t=s/curveSteps,u=1-t;add(pt(u*u*p0.x+2*u*t*c.x+t*t*p1.x,u*u*p0.y+2*u*t*c.y+t*t*p1.y));}
      } else if (op === 'C') {
        const p0=cur,c1=pt(+tokens[i++],+tokens[i++]),c2=pt(+tokens[i++],+tokens[i++]),p1=pt(+tokens[i++],+tokens[i++]);
        for(let s=1;s<=curveSteps;s++){const t=s/curveSteps,u=1-t;add(pt(u*u*u*p0.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*p1.x,u*u*u*p0.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*p1.y));}
      } else if (op === 'A') {
        // M001 cut currently has no SVG A command; slot arcs stay structured.
        i += 5; add(pt(+tokens[i++], +tokens[i++]));
      } else if (op === 'Z') { add(start); op = ''; }
      else break;
    }
    return points;
  }

  function polylinePath(points) {
    return points.length ? `M ${N(points[0].x)} ${N(points[0].y)} ` + points.slice(1).map(p => `L ${N(p.x)} ${N(p.y)}`).join(' ') : '';
  }

  function splitPolyline(points, count, idForIndex) {
    const lengths=[], cumulative=[0]; let total=0;
    for(let i=1;i<points.length;i++){const d=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lengths.push(d);total+=d;cumulative.push(total);}
    const at = distance => {
      distance=Math.max(0,Math.min(total,distance)); let k=1;
      while(k<cumulative.length && cumulative[k]<distance)k++;
      if(k>=points.length)return points[points.length-1];
      const span=lengths[k-1]||1,t=(distance-cumulative[k-1])/span,a=points[k-1],b=points[k];
      return pt(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
    };
    const result=[];
    for(let index=0;index<count;index++){
      const aD=total*index/count,bD=total*(index+1)/count, segPoints=[at(aD)];
      for(let k=1;k<points.length-1;k++)if(cumulative[k]>aD&&cumulative[k]<bD)segPoints.push(points[k]);
      segPoints.push(at(bD));
      result.push({id:idForIndex(index),type:'polyline',points:segPoints,d:polylinePath(segPoints)});
    }
    return result;
  }

  function cleanClosedPoints(points) {
    const clean=[];
    points.forEach(p=>{
      const q=pt(p.x,p.y),last=clean[clean.length-1];
      if(!last||Math.hypot(q.x-last.x,q.y-last.y)>0.0001)clean.push(q);
    });
    if(clean.length>1&&Math.hypot(clean[0].x-clean[clean.length-1].x,clean[0].y-clean[clean.length-1].y)<0.0001)clean.pop();
    return clean;
  }

  function lineIntersection(a,ad,b,bd) {
    const cross=ad.x*bd.y-ad.y*bd.x;
    if(Math.abs(cross)<1e-9)return null;
    const qx=b.x-a.x,qy=b.y-a.y,t=(qx*bd.y-qy*bd.x)/cross;
    return pt(a.x+ad.x*t,a.y+ad.y*t);
  }

  function offsetClosedPolyline(sourcePoints, distance) {
    const points=cleanClosedPoints(sourcePoints),count=points.length;
    if(count<3||distance<=0)return points;
    const ClipperLib=root.ClipperLib;
    if(ClipperLib&&ClipperLib.ClipperOffset){
      const scale=10000,path=points.map(p=>({X:Math.round(p.x*scale),Y:Math.round(p.y*scale)}));
      const offsetter=new ClipperLib.ClipperOffset(2,0.05*scale),solution=new ClipperLib.Paths();
      offsetter.AddPath(path,ClipperLib.JoinType.jtRound,ClipperLib.EndType.etClosedPolygon);
      offsetter.Execute(solution,distance*scale);
      if(solution.length){
        const selected=solution.reduce((largest,current)=>Math.abs(ClipperLib.Clipper.Area(current))>Math.abs(ClipperLib.Clipper.Area(largest))?current:largest,solution[0]);
        return cleanClosedPoints(selected.map(p=>pt(p.X/scale,p.Y/scale)));
      }
    }
    let area=0;
    for(let i=0;i<count;i++){const a=points[i],b=points[(i+1)%count];area+=a.x*b.y-b.x*a.y;}
    const outwardSign=area>0?1:-1;
    const edges=points.map((a,i)=>{
      const b=points[(i+1)%count],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      return {dir:pt(dx/len,dy/len),normal:pt(outwardSign*dy/len,-outwardSign*dx/len)};
    });
    const result=[];
    for(let i=0;i<count;i++){
      const p=points[i],prev=edges[(i-1+count)%count],next=edges[i];
      const pa=pt(p.x+prev.normal.x*distance,p.y+prev.normal.y*distance);
      const pb=pt(p.x+next.normal.x*distance,p.y+next.normal.y*distance);
      const hit=lineIntersection(pa,prev.dir,pb,next.dir);
      const miter=hit?Math.hypot(hit.x-p.x,hit.y-p.y):Infinity;
      if(hit&&miter<=distance*8)result.push(hit);
      else { result.push(pa); result.push(pb); }
    }
    return cleanClosedPoints(result);
  }

  function clipPolygonToRect(source, rect) {
    let polygon=cleanClosedPoints(source);
    const edges=[
      {inside:p=>p.x>=rect.minX-1e-7,intersect:(a,b)=>pt(rect.minX,a.y+(b.y-a.y)*(rect.minX-a.x)/((b.x-a.x)||1e-12))},
      {inside:p=>p.x<=rect.maxX+1e-7,intersect:(a,b)=>pt(rect.maxX,a.y+(b.y-a.y)*(rect.maxX-a.x)/((b.x-a.x)||1e-12))},
      {inside:p=>p.y>=rect.minY-1e-7,intersect:(a,b)=>pt(a.x+(b.x-a.x)*(rect.minY-a.y)/((b.y-a.y)||1e-12),rect.minY)},
      {inside:p=>p.y<=rect.maxY+1e-7,intersect:(a,b)=>pt(a.x+(b.x-a.x)*(rect.maxY-a.y)/((b.y-a.y)||1e-12),rect.maxY)}
    ];
    edges.forEach(edge=>{
      const input=polygon; polygon=[];
      if(!input.length)return;
      let a=input[input.length-1],aInside=edge.inside(a);
      input.forEach(b=>{
        const bInside=edge.inside(b);
        if(bInside!==aInside)polygon.push(edge.intersect(a,b));
        if(bInside)polygon.push(b);
        a=b;aInside=bInside;
      });
      polygon=cleanClosedPoints(polygon);
    });
    return polygon;
  }

  function polygonBounds(polygon) {
    if(!polygon.length)return {x:0,y:0,width:0,height:0};
    const xs=polygon.map(p=>p.x),ys=polygon.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    return {x:n(minX),y:n(minY),width:n(maxX-minX),height:n(maxY-minY)};
  }

  function M001_getLayout(input) {
    const cfg = root.M001_normalizeConfig(input);
    const R = root.M001_SPEC.ratios;
    const { W, D, H } = cfg;

    // Reference panel grid. Every coordinate is derived from W/D/H.
    const fg = Math.min(cfg.foldGap, H * 0.08);
    const x = {
      lockL: -2 * H,
      sideOuterL: -H,
      bodyL: 0,
      bodyR: W,
      sideOuterR: W + H,
      lockR: W + 2 * H
    };
    const y = {
      top: 0,
      lid: H,
      back: H + D,
      base: 2 * H + D,
      front: 2 * H + 2 * D,
      end: 3 * H + 2 * D
    };
    const refX = value => value < 572.599 ? (value - 572.599) / 257.953 * H
      : value > 1238.74 ? W + (value - 1238.74) / 257.953 * H
      : (value - 572.599) / (1238.74 - 572.599) * W;
    const refSY=[148.056,399.517,1048.651,1306.604,1955.738,2213.69];
    const refInset=H*(6.491/257.953);
    const refTY=[0,H-refInset,H-refInset+D,2*H-refInset+D,2*H-refInset+2*D,3*H-refInset+2*D];
    const refY = value => {
      if(value<=refSY[0])return (value-refSY[0])/257.953*H;
      for(let k=1;k<refSY.length;k++)if(value<=refSY[k])return refTY[k-1]+(value-refSY[k-1])/(refSY[k]-refSY[k-1])*(refTY[k]-refTY[k-1]);
      return refTY[5]+(value-refSY[5])/257.953*H;
    };

    const cr = Math.max(0.8, H * R.cornerRadius);
    const ir = Math.max(2, H * R.insertRadius);
    const dustW = Math.min(H * R.dustWidth, W * 0.42);
    const dustY = H * R.dustRise;
    const tipX = Math.min(H * R.lidFlapTipX, W * 0.42);
    const tipY = H * R.lidFlapTipY;
    const insertReach = Math.min(H * R.insertReach, W * 0.42);
    const frontInset = H * R.frontEdgeInset;
    const notch = Math.min(fg, H * 0.08);

    // One shared feature list drives locks, slots and interrupted fold lines.
    const baseFoldY = refY(1306.604);
    const frontFoldY = refY(1955.738);
    const featureCenters = cfg.lockCount === 1
      ? [{ key: 'C', y: baseFoldY + D / 2 }]
      : [
          { key: 'A', y: baseFoldY + D * (0.5 - R.lockCenterOffset) },
          { key: 'B', y: baseFoldY + D * (0.5 + R.lockCenterOffset) }
        ];
    // Preserve the reference 35 mm feature until the panel becomes too short.
    // A 3 mm edge clearance is shared by the lock cut and its linked slot.
    const featureEdgeClearance = 3;
    const featureGap = 3;
    const availableLengths = [
      2 * (featureCenters[0].y - baseFoldY - featureEdgeClearance),
      2 * (frontFoldY - featureCenters[featureCenters.length - 1].y - featureEdgeClearance)
    ];
    for (let i = 1; i < featureCenters.length; i++) {
      availableLengths.push(featureCenters[i].y - featureCenters[i - 1].y - featureGap);
    }
    const lockLength = Math.max(1, Math.min(35, ...availableLengths));
    const lockDepth = 5;
    const slotWidth = 5;
    const slotLength = lockLength;

    const locks = [];
    const slots = [];
    featureCenters.forEach(feature => {
      const y1 = feature.y - lockLength / 2;
      locks.push({ id: `lock_${feature.key}_L`, side: 'L', centerY: n(feature.y), y1: n(y1), y2: n(y1 + lockLength), depth: n(lockDepth), panelId: 'bottomLockFlapLeft' });
      locks.push({ id: `lock_${feature.key}_R`, side: 'R', centerY: n(feature.y), y1: n(y1), y2: n(y1 + lockLength), depth: n(lockDepth), panelId: 'bottomLockFlapRight' });
      slots.push(roundedRectGeometry(`slot_${feature.key}_L`, 0, y1, slotWidth, slotLength, slotWidth / 2, 'base'));
      slots.push(roundedRectGeometry(`slot_${feature.key}_R`, W - slotWidth, y1, slotWidth, slotLength, slotWidth / 2, 'base'));
    });

    function lockEdge(side, reverse) {
      const outer = side === 'L' ? x.lockL : x.lockR;
      const sign = side === 'L' ? -1 : 1;
      const ordered = reverse ? featureCenters.slice().reverse() : featureCenters;
      const parts = [];
      ordered.forEach(f => {
        const a = f.y - lockLength / 2;
        const b = f.y + lockLength / 2;
        if (reverse) {
          parts.push(`L ${N(outer)} ${N(b)}`);
          parts.push(`L ${N(outer + sign * lockDepth)} ${N(b - lockDepth * 0.3)}`);
          parts.push(`L ${N(outer + sign * lockDepth)} ${N(a + lockDepth * 0.3)}`);
          parts.push(`L ${N(outer)} ${N(a)}`);
        } else {
          parts.push(`L ${N(outer)} ${N(a)}`);
          parts.push(`L ${N(outer + sign * lockDepth)} ${N(a + lockDepth * 0.3)}`);
          parts.push(`L ${N(outer + sign * lockDepth)} ${N(b - lockDepth * 0.3)}`);
          parts.push(`L ${N(outer)} ${N(b)}`);
        }
      });
      return parts.join(' ');
    }

    // Clockwise cut boundary; cut numbering follows the supplied M001 reference.
    const formulaCutD = [
      `M 0 0`,
      `L 0 ${N(-frontInset)}`, `L ${N(W)} ${N(-frontInset)}`, `L ${N(W)} 0`,
      `C ${N(W + dustW * 0.62)} 0 ${N(W + dustW)} ${N(dustY * 0.35)} ${N(W + dustW)} ${N(dustY)}`,
      `C ${N(W + dustW)} ${N(H * 0.9)} ${N(W + dustW * 0.8)} ${N(H)} ${N(W + tipX)} ${N(H)}`,
      `L ${N(W + H)} ${N(H + tipY)}`,
      `C ${N(W + H)} ${N(y.back - tipY)} ${N(W + tipX)} ${N(y.back - tipY)} ${N(W)} ${N(y.back)}`,
      `L ${N(W + insertReach)} ${N(y.back + cr)}`,
      `Q ${N(W + insertReach)} ${N(y.base - cr)} ${N(W)} ${N(y.base)}`,
      `L ${N(x.sideOuterR)} ${N(y.base)}`, `L ${N(x.lockR)} ${N(y.base + notch)}`,
      lockEdge('R', false),
      `L ${N(x.sideOuterR)} ${N(y.front - notch)}`, `L ${N(W)} ${N(y.front)}`,
      `L ${N(W + insertReach)} ${N(y.front + cr)}`,
      `L ${N(W + insertReach)} ${N(y.end - ir)}`,
      `Q ${N(W + insertReach)} ${N(y.end)} ${N(W + insertReach - ir)} ${N(y.end)}`,
      `L ${N(W - frontInset)} ${N(y.end)}`, `L ${N(W - frontInset * 2)} ${N(y.end + frontInset)}`,
      `L ${N(frontInset * 2)} ${N(y.end + frontInset)}`, `L ${N(frontInset)} ${N(y.end)}`,
      `L ${N(-insertReach + ir)} ${N(y.end)}`,
      `Q ${N(-insertReach)} ${N(y.end)} ${N(-insertReach)} ${N(y.end - ir)}`,
      `L ${N(-insertReach)} ${N(y.front + cr)}`, `L 0 ${N(y.front)}`,
      `L ${N(x.sideOuterL)} ${N(y.front - notch)}`, `L ${N(x.lockL)} ${N(y.front - notch)}`,
      lockEdge('L', true),
      `L ${N(x.sideOuterL)} ${N(y.base + notch)}`, `L 0 ${N(y.base)}`,
      `L ${N(-insertReach)} ${N(y.base - cr)}`,
      `Q ${N(-insertReach)} ${N(y.back + cr)} 0 ${N(y.back)}`,
      `L ${N(-tipX)} ${N(y.back - tipY)}`,
      `C ${N(-H)} ${N(y.back - tipY)} ${N(-H)} ${N(H + tipY)} ${N(-tipX)} ${N(H)}`,
      `L ${N(-dustW * R.dustShoulder)} ${N(H)}`,
      `C ${N(-dustW)} ${N(H)} ${N(-dustW)} ${N(dustY * 0.35)} 0 0`,
      'Z'
    ].join(' ');

    const referenceCut = buildReferenceCut(W,D,H);
    const cutD = referenceCut.d;
    const cutPoints = flattenPath(cutD, 32);
    const maxCutY = Math.max(...cutPoints.map(p => p.y));
    const bottomIndexes = cutPoints.map((p,i)=>Math.abs(p.y-maxCutY)<0.0002?i:-1).filter(i=>i>=0);
    const bottomRightIndex = bottomIndexes[0];
    const bottomLeftIndex = bottomIndexes[bottomIndexes.length-1];
    const rightBranch = cutPoints.slice(3, bottomRightIndex + 1);
    const leftBranch = cutPoints.slice(bottomLeftIndex).reverse();
    const formulaCutSegments = [
      { id:'1-1', type:'line', points:[cutPoints[1],cutPoints[2]], d:polylinePath([cutPoints[1],cutPoints[2]]) },
      { id:'1-2L', type:'line', points:[cutPoints[0],cutPoints[1]], d:polylinePath([cutPoints[0],cutPoints[1]]) },
      ...splitPolyline(leftBranch,35,i=>`1-${i+3}L`),
      { id:'1-2R', type:'line', points:[cutPoints[2],cutPoints[3]], d:polylinePath([cutPoints[2],cutPoints[3]]) },
      ...splitPolyline(rightBranch,35,i=>`1-${i+3}R`),
      { id:'1-38', type:'line', points:[cutPoints[bottomRightIndex],cutPoints[bottomLeftIndex]], d:polylinePath([cutPoints[bottomRightIndex],cutPoints[bottomLeftIndex]]) }
    ];
    const cutSegments = referenceCut.segments;
    const cut = cutSegments;
    const fold = [];
    const F = (id, x1, y1, x2, y2, panels) => fold.push(line(id, pt(x1, y1), pt(x2, y2), panels));
    const RF=(id,x1,y1,x2,y2,panels)=>F(id,refX(x1),refY(y1),refX(x2),refY(y2),panels);
    RF('f-1L',572.599,148.056,572.599,392.81,['lidFront','lidDustFlapLeft']);
    RF('f-1R',1238.74,148.056,1238.74,392.81,['lidFront','lidDustFlapRight']);
    RF('f-2',578.268,399.517,1233.071,399.517,['lidFront','lid']);
    RF('f-3L',578.268,399.517,578.268,1048.651,['lid','lidSideFlapLeft']);
    RF('f-3R',1233.071,399.517,1233.071,1048.651,['lid','lidSideFlapRight']);
    RF('f-4',578.268,1048.651,1233.071,1048.651,['lid','back']);
    RF('f-5L',578.268,1048.651,578.268,1300.934,['back','backInsertFlapLeft']);
    RF('f-5R',1233.071,1048.651,1233.071,1300.934,['back','backInsertFlapRight']);
    RF('f-6',572.599,1306.604,1238.74,1306.604,['back','base']);
    RF('f-7L-1',300.473,1312.273,300.473,1950.068,['sidePanelLeft','bottomLockFlapLeft']);
    RF('f-7R-1',1510.866,1312.273,1510.866,1950.068,['sidePanelRight','bottomLockFlapRight']);
    RF('f-7L-2',314.646,1306.604,314.646,1955.738,['base','sidePanelLeft']);
    RF('f-7R-2',1496.693,1306.604,1496.693,1955.738,['base','sidePanelRight']);
    [refX(572.599), refX(1238.74)].forEach((xx, sideIndex) => {
      const side = sideIndex ? 'R' : 'L';
      const intervals = featureCenters.map(feature => ({ a:feature.y-slotLength/2, b:feature.y+slotLength/2 }));
      const spans=[]; let cursor=baseFoldY;
      intervals.forEach(interval=>{spans.push([cursor,interval.a]);cursor=interval.b;});
      spans.push([cursor,frontFoldY]);
      spans.forEach((span,i)=>F(`f-7${side}-${i+3}`,xx,span[0],xx,span[1],['base',sideIndex?'sidePanelRight':'sidePanelLeft']));
    });
    RF('f-8',572.599,1955.738,1238.74,1955.738,['base','front']);
    RF('f-9L',576.855,1955.738,576.855,2213.69,['front','frontInsertFlapLeft']);
    RF('f-9R',1234.484,1955.738,1234.484,2213.69,['front','frontInsertFlapRight']);

    const holeRadius=cfg.holeDiameter/2;
    const holeOffsetY=Math.max(holeRadius,Math.min(H-holeRadius,cfg.holeOffsetY));
    const holeCenterY=refY(1048.651)+holeOffsetY;
    const holeGapActual=Math.min(cfg.holeGap,Math.max(0,W-cfg.holeDiameter*2));
    const holes = cfg.holeEnabled ? [
      { id: 'hole_L', cx: n(W/2-holeGapActual/2), cy: n(holeCenterY), r: n(cfg.holeDiameter/2), panelId: 'back' },
      { id: 'hole_R', cx: n(W/2+holeGapActual/2), cy: n(holeCenterY), r: n(cfg.holeDiameter/2), panelId: 'back' }
    ] : [];

    const minCutX=Math.min(...cutPoints.map(p=>p.x)),maxCutX=Math.max(...cutPoints.map(p=>p.x));
    const minCutY=Math.min(...cutPoints.map(p=>p.y));
    const dielineBounds={minX:n(minCutX),minY:n(minCutY),maxX:n(maxCutX),maxY:n(maxCutY),width:n(maxCutX-minCutX),height:n(maxCutY-minCutY)};
    const panel = (id, x1, y1, width, height) => {
      const polygon=clipPolygonToRect(cutPoints,{minX:x1,minY:y1,maxX:x1+width,maxY:y1+height});
      const bounds=polygonBounds(polygon);
      const origin=pt(bounds.x,bounds.y);
      return {
        id, polygon, bounds, origin,
        localPolygon:polygon.map(p=>pt(p.x-origin.x,p.y-origin.y))
      };
    };
    const panels = [
      panel('lidFront',0,-refInset,W,H),panel('lid',0,refY(399.517),W,D),panel('back',0,refY(1048.651),W,H),
      panel('base',0,baseFoldY,W,D),panel('front',0,frontFoldY,W,H),
      panel('sidePanelLeft',-H,baseFoldY,H,D),panel('sidePanelRight',W,baseFoldY,H,D),
      panel('lidDustFlapLeft',minCutX,-refInset,-minCutX,H),panel('lidDustFlapRight',W,-refInset,maxCutX-W,H),
      panel('lidSideFlapLeft',minCutX,refY(399.517),-minCutX,D),panel('lidSideFlapRight',W,refY(399.517),maxCutX-W,D),
      panel('backInsertFlapLeft',minCutX,refY(1048.651),-minCutX,H),panel('backInsertFlapRight',W,refY(1048.651),maxCutX-W,H),
      panel('bottomLockFlapLeft',minCutX,baseFoldY,H,D),panel('bottomLockFlapRight',W+H,baseFoldY,maxCutX-W-H,D),
      panel('frontInsertFlapLeft',-H,frontFoldY,H,H),panel('frontInsertFlapRight',W,frontFoldY,H,H)
    ];

    const foldOrder=id=>id.startsWith('f-7')||id==='f-6'||id==='f-8'?1:id.startsWith('f-5')||id.startsWith('f-9')?2:id==='f-4'?3:id.startsWith('f-3')?4:id==='f-2'?5:6;
    const relationGroups=new Map();
    fold.filter(f=>f.panelIds.length===2).forEach(f=>{
      const vertical=Math.abs(f.a.x-f.b.x)<1e-6;
      const axisKey=vertical?`V:${N(f.a.x)}`:`H:${N(f.a.y)}`;
      const key=`${f.panelIds[0]}>${f.panelIds[1]}:${axisKey}`;
      if(!relationGroups.has(key))relationGroups.set(key,[]);
      relationGroups.get(key).push(f);
    });
    const foldRelations=[...relationGroups.values()].map(group=>{
      const first=group[0],vertical=Math.abs(first.a.x-first.b.x)<1e-6;
      const ordered=group.slice().sort((a,b)=>(vertical?a.a.y-b.a.y:a.a.x-b.a.x));
      const axis={a:ordered[0].a,b:ordered[ordered.length-1].b};
      const childId=first.panelIds[1];
      const signedAngle=/Left$|Left\b/.test(childId)?-90:90;
      return {
        id:`relation_${ordered.map(f=>f.id).join('_')}`,
        foldId:ordered[0].id,foldIds:ordered.map(f=>f.id),
        parentPanelId:first.panelIds[0],childPanelId:childId,axis,
        angle:Math.abs(signedAngle),direction:signedAngle<0?'negative':'positive',signedAngle,
        order:Math.min(...ordered.map(f=>foldOrder(f.id))),initialState:'flat',
        minAngle:Math.min(0,signedAngle),maxAngle:Math.max(0,signedAngle)
      };
    });
    const insertionRelations = featureCenters.flatMap(f => ['L', 'R'].map(side => {
      const slotId=`slot_${f.key}_${side}`;
      const targetSlot=slots.find(slot=>slot.id===slotId);
      return {
        id: `insert_${f.key}_${side}`,
        movingPanelId: side === 'L' ? 'bottomLockFlapLeft' : 'bottomLockFlapRight',
        targetPanelId: 'base',
        lockId: `lock_${f.key}_${side}`,
        slotId,
        insertionDirection: { x: side === 'L' ? 1 : -1, y: 0, z: 0 },
        targetPosition: {
          x:n(targetSlot.x+targetSlot.width/2),
          y:n(targetSlot.y+targetSlot.height/2),z:0
        },
        depth:n(lockDepth),tolerance:0.5,order:7
      };
    }));

    // Bleed is generated only after the final cut (including lock-count rules)
    // is complete. It has no independent W/D/H geometry.
    const bleedOffset=cfg.bleed;
    const bleedPoints=offsetClosedPolyline(cutPoints,bleedOffset);
    const bleedD=polylinePath(bleedPoints)+' Z';
    const bleedSegments=[{id:'bleedPath',type:'polyline',points:[...bleedPoints,bleedPoints[0]],closed:true,offset:bleedOffset,source:'cutPath',d:bleedD}];
    const allBoundaryPoints=bleedSegments.flatMap(segment=>segment.points);
    const actualMinX=Math.min(...allBoundaryPoints.map(p=>p.x)),actualMaxX=Math.max(...allBoundaryPoints.map(p=>p.x));
    const actualMinY=Math.min(...allBoundaryPoints.map(p=>p.y)),actualMaxY=Math.max(...allBoundaryPoints.map(p=>p.y));
    const bounds={minX:n(actualMinX),minY:n(actualMinY),maxX:n(actualMaxX),maxY:n(actualMaxY),width:n(actualMaxX-actualMinX),height:n(actualMaxY-actualMinY)};
    const bleedBounds=bounds;

    const cutLabels = cutSegments.map(segment=>segment.id);
    const dimensions=[
      {id:'dim-W',axis:'horizontal',a:pt(0,frontFoldY-18),b:pt(W,frontFoldY-18),label:`W ${N(W)} mm`},
      {id:'dim-D',axis:'vertical',a:pt(W-18,baseFoldY),b:pt(W-18,frontFoldY),label:`D ${N(D)} mm`},
      {id:'dim-H',axis:'vertical',a:pt(W-36,refY(1048.651)),b:pt(W-36,baseFoldY),label:`H ${N(H)} mm`}
    ];

    return Object.freeze({
      meta: { id: 'M001', unit: 'mm', origin: pt(0, 0), referenceSize: { W: 235, D: 229, H: 91 }, isGlueFree: true },
      config: cfg, anchors: { x, y }, cut, cutPath: cutD, cutLabels,
      fold, foldLines: fold, bleed: bleedSegments, bleedPath: bleedD,
      glue: [], holes, slots, locks, perforations: [], bounds, dielineBounds, bleedBounds, panels, dimensions,
      foldRelations, adhesiveRelations: [], insertionRelations
    });
  }

  root.M001_getLayout = M001_getLayout;
})(typeof window !== 'undefined' ? window : globalThis);
