/* Static M001/M002/M003 mapping used ONLY by PacVu3DContractAdapter.
 * No THREE, rendering, file I/O, animation, glue/insertion/bond solver or UI.
 * Original Layout functions supply geometry/options. Private 3D clipping masks
 * and hierarchy declarations are mirrored here with source provenance and tests.
 * M003 needs the same SVG measurement API as its existing 3D; curves are sampled
 * using its exact count rule. Raw source paths remain available as metadata.
 * This is a 3D mapping snapshot, NOT an export replacement. Legacy fill bridges
 * and clipping boundaries must never be promoted to manufactured cuts.
 * Unknown contact faces/frames remain source.unresolvedRelations, as in the
 * existing Adapter. Thickness is unknown (render thickness is not stock data).
 * Browser load order: Contract -> this mapping -> Adapter; no app registration.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./PacVu3DContract.js'));
  else root.PacVu3DContractMailerMapping = factory(root.PacVu3DContract);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (validator) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const P = (x, y) => ({ x, y });
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const EPS = 0.002;
  const rect = (x1, y1, x2, y2) => [P(x1, y1), P(x2, y1), P(x2, y2), P(x1, y2)];
  function clean(points, epsilon = 1e-9, removeClosingPoint = true) {
    const out = points.filter((p, i) => !i || Math.abs(p.x - points[i - 1].x) > epsilon || Math.abs(p.y - points[i - 1].y) > epsilon).map(p => P(p.x, p.y));
    if (removeClosingPoint && out.length > 1 && Math.abs(out[0].x - out.at(-1).x) < epsilon && Math.abs(out[0].y - out.at(-1).y) < epsilon) out.pop();
    if (out.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error('Mailer mapping: nonfinite polygon.');
    return out;
  }
  function clipAt(points, coordinate, value, greater) {
    const inside = p => greater ? p[coordinate] >= value - .0001 : p[coordinate] <= value + .0001;
    const out = [];
    points.forEach((q, i) => {
      const p = points[(i + points.length - 1) % points.length];
      if (inside(p) !== inside(q)) {
        const delta = q[coordinate] - p[coordinate];
        const t = Math.abs(delta) < .0001 ? 0 : (value - p[coordinate]) / delta;
        out.push(P(coordinate === 'x' ? value : p.x + (q.x - p.x) * t, coordinate === 'y' ? value : p.y + (q.y - p.y) * t));
      }
      if (inside(q)) out.push(P(q.x, q.y));
    });
    return out;
  }
  // M001_3d_test.shapeGeometry / buildExactFlatPanelPolygon / untanglePolygon.
  function m001Panels(layout) {
    const x = id => layout.fold.find(f => f.id === id).a.x;
    const y = id => layout.fold.find(f => f.id === id).a.y;
    const regions = {
      lidFront: { minX: x('f-1L'), maxX: x('f-1R'), maxY: y('f-2') },
      lidDustFlapLeft: { maxX: x('f-1L'), maxY: y('f-2') }, lidDustFlapRight: { minX: x('f-1R'), maxY: y('f-2') },
      lid: { minX: x('f-3L'), maxX: x('f-3R'), minY: y('f-2'), maxY: y('f-4') },
      lidSideFlapLeft: { maxX: x('f-3L'), minY: y('f-2'), maxY: y('f-4') }, lidSideFlapRight: { minX: x('f-3R'), minY: y('f-2'), maxY: y('f-4') },
      back: { minX: x('f-5L'), maxX: x('f-5R'), minY: y('f-4'), maxY: y('f-6') },
      backInsertFlapLeft: { maxX: x('f-5L'), minY: y('f-4'), maxY: y('f-6') }, backInsertFlapRight: { minX: x('f-5R'), minY: y('f-4'), maxY: y('f-6') },
      base: { minX: x('f-7L-3'), maxX: x('f-7R-3'), minY: y('f-6'), maxY: y('f-8') },
      sidePanelLeft: { minX: x('f-7L-2'), maxX: x('f-7L-3'), minY: y('f-6'), maxY: y('f-8') },
      sidePanelRight: { minX: x('f-7R-3'), maxX: x('f-7R-2'), minY: y('f-6'), maxY: y('f-8') },
      front: { minX: x('f-9L'), maxX: x('f-9R'), minY: y('f-8') },
      frontInsertFlapLeft: { maxX: x('f-9L'), minY: y('f-8') }, frontInsertFlapRight: { minX: x('f-9R'), minY: y('f-8') }
    };
    const outline = clean(layout.cut.flatMap(s => s.points), .0001);
    return layout.panels.map(panel => {
      const region = regions[panel.id]; let polygon = copy(panel.polygon);
      if (region) {
        polygon = outline;
        for (const [key, axis, greater] of [['minX', 'x', true], ['maxX', 'x', false], ['minY', 'y', true], ['maxY', 'y', false]]) {
          if (Number.isFinite(region[key])) polygon = clipAt(polygon, axis, region[key], greater);
        }
        polygon = clean(polygon, .0001);
      } else {
        if (panel.id === 'bottomLockFlapLeft') {
          const edge = Math.max(...polygon.map(p => p.x));
          polygon = polygon.map(p => P(Math.abs(p.x - edge) < .0001 ? x('f-7L-1') : p.x, p.y));
        } else if (panel.id === 'bottomLockFlapRight') polygon = clipAt(polygon, 'x', x('f-7R-1'), true);
        else throw new Error('Mailer mapping: M001 panel recipe changed: ' + panel.id);
        polygon = untangle(polygon);
      }
      return { id: panel.id, polygon, source: { field: 'shapeGeometry', layoutPolygon: copy(panel.polygon) } };
    });
  }
  function untangle(source) {
    const points = source.filter((p, i) => {
      const prev = source[(i + source.length - 1) % source.length];
      return Math.abs(p.x - prev.x) > .0001 || Math.abs(p.y - prev.y) > .0001;
    }).map(p => P(p.x, p.y));
    const orient = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    for (let pass = 0; pass < points.length * points.length; pass++) {
      let changed = false;
      for (let i = 0; i < points.length && !changed; i++) for (let j = i + 2; j < points.length; j++) {
        if (i === 0 && j === points.length - 1) continue;
        const a = points[i], b = points[(i + 1) % points.length], c = points[j], d = points[(j + 1) % points.length];
        if (orient(a, b, c) * orient(a, b, d) < -.0001 && orient(c, d, a) * orient(c, d, b) < -.0001) {
          points.splice(i + 1, j - i, ...points.slice(i + 1, j + 1).reverse()); changed = true; break;
        }
      }
      if (!changed) break;
    }
    return points;
  }
  // M001/M002 buildHierarchy: BFS rooted at base, then buildSideLockChain.
  function lockMailer(layout, id) {
    if (layout.panels.length !== 17) throw new Error('Mailer mapping: source panel recipe changed.');
    const panels = id === 'M001' ? m001Panels(layout) : layout.panels.map(p => ({ id: p.id, polygon: copy(p.polygon), source: { field: 'layout.panels' } }));
    const pending = layout.foldRelations.filter(r => !r.foldIds.some(f => /^f-7[LR]-[12]$/.test(f)));
    const visited = new Set(['base']), queue = ['base'], folds = [], doubleFolds = [];
    while (queue.length) {
      const parent = queue.shift();
      pending.filter(r => [r.parentPanelId, r.childPanelId].includes(parent)).forEach(r => {
        const child = r.parentPanelId === parent ? r.childPanelId : r.parentPanelId;
        if (visited.has(child)) return;
        visited.add(child); queue.push(child);
        folds.push({ id: r.id, parent, child, axis: copy(r.axis), foldIds: copy(r.foldIds), source: { field: 'buildHierarchy', layoutRelationId: r.id } });
      });
    }
    for (const side of ['L', 'R']) {
      const suffix = side === 'L' ? 'Left' : 'Right', spine = 'lockSpine' + side;
      const outer = layout.foldRelations.find(r => r.foldIds.includes('f-7' + side + '-2'));
      const inner = layout.foldRelations.find(r => r.foldIds.includes('f-7' + side + '-1'));
      if (!outer || !inner) throw new Error('Mailer mapping: missing double-fold source.');
      const y1 = Math.max(outer.axis.a.y, inner.axis.a.y), y2 = Math.min(outer.axis.b.y, inner.axis.b.y);
      // M002 stores these axes bottom-to-top; retain the original traversal.
      if (Math.abs(y2 - y1) < 1e-9 || outer.axis.a.x === inner.axis.a.x) throw new Error('Mailer mapping: degenerate spine.');
      panels.push({ id: spine, polygon: rect(outer.axis.a.x, y1, inner.axis.a.x, y2), source: { field: 'buildSideLockChain', kind: '3d-only-panel' } });
      folds.push({ id: outer.id, parent: 'sidePanel' + suffix, child: spine, axis: copy(outer.axis), foldIds: copy(outer.foldIds), source: { field: 'buildSideLockChain' } });
      folds.push({ id: inner.id, parent: spine, child: 'bottomLockFlap' + suffix, axis: copy(inner.axis), foldIds: copy(inner.foldIds), source: { field: 'buildSideLockChain' } });
      visited.add('bottomLockFlap' + suffix);
      doubleFolds.push({ id: 'doubleFold' + side, panelIds: ['sidePanel' + suffix, spine, 'bottomLockFlap' + suffix], spinePanelId: spine,
        foldIds: [outer.id, inner.id], spacingMm: Math.abs(outer.axis.a.x - inner.axis.a.x), source: 'buildSideLockChain' });
    }
    if (visited.size !== 17 || folds.length !== 18) throw new Error('Mailer mapping: disconnected/changed hierarchy.');
    return { panels, folds, doubleFolds };
  }
  // M003_3d_test.build regionMesh masks in SOURCE coordinates, not mm.
  const M003_MASKS = {
    base: rect(612.623,1096.199,1193.726,1681.553), back: rect(613.482,917.453,1194.585,1096.199),
    'B-Glue-out-L': rect(475,917.453,613.482,1096.199), 'B-Glue-out-R': rect(1194.585,917.453,1335,1096.199),
    'side-panel-L': [P(612.623,1100.76),P(612.633,1681.553),P(428.494,1681.553),P(428.494,1275.03)],
    'side-panel-R': [P(1193.716,1098.325),P(1380.79,1278.28),P(1380.79,1681.553),P(1193.726,1681.553)],
    'B-Glue-in-L': [P(428.494,1100.451),P(612.623,1100.76),P(428.494,1275.03)],
    'B-Glue-in-R': [P(1193.716,1098.325),P(1380.79,1100.451),P(1380.79,1278.28)],
    'f-7-inner-fold-L': rect(360,1096.199,428.494,1681.553), 'f-7-inner-fold-R': rect(1380.79,1096.199,1445,1681.553),
    front: rect(613.573,1681.553,1194.675,1870), lid: rect(611.12,323.485,1197.892,917.453), dustFront: rect(611.614,140,1198.293,323.485),
    lidSideFlapLeft: [P(611.12,326.436),P(611.12,917.453),P(425.075,917.453),P(425.075,510.825)],
    lidSideFlapRight: [P(1197.892,326.436),P(1384.208,510.828),P(1384.208,917.453),P(1197.892,917.453)],
    'A-Glue-in-L': [P(425.075,326.436),P(611.12,326.436),P(425.075,510.825)],
    'A-Glue-in-R': [P(1197.892,326.436),P(1384.208,326.436),P(1384.208,510.828)],
    'A-Glue-out-L': rect(470,140,611.614,323.485), 'A-Glue-out-R': rect(1198.293,140,1340,323.485)
  };
  // [source fold ID, parent, child, optional 3D axis override]. f-7 axes in
  // 3D run opposite to Layout. f-11 3D gusset axes differ from visible creases;
  // preserve BOTH, never silently replace Layout folding lines with rig axes.
  const M003_FOLDS = [
    ['f-6','base','back'], ['f-4','back','lid'], ['f-8L','base','side-panel-L'], ['f-8R','base','side-panel-R'],
    ['f-11L','side-panel-L','B-Glue-in-L',[612.623,1100.76,428.494,1275.03]],
    ['f-11R','side-panel-R','B-Glue-in-R',[1193.716,1098.325,1380.79,1278.28]],
    ['f-7L','side-panel-L','f-7-inner-fold-L',[428.494,1100.451,428.494,1681.553]],
    ['f-7R','side-panel-R','f-7-inner-fold-R',[1380.79,1100.451,1380.79,1681.553]],
    ['f-9','base','front'], ['f-5L','back','B-Glue-out-L'], ['f-5R','back','B-Glue-out-R'],
    ['f-2','lid','dustFront'], ['f-3L','lid','lidSideFlapLeft'], ['f-3R','lid','lidSideFlapRight'],
    ['f-10L','lidSideFlapLeft','A-Glue-in-L'], ['f-10R','lidSideFlapRight','A-Glue-in-R'],
    ['f-1L','dustFront','A-Glue-out-L'], ['f-1R','dustFront','A-Glue-out-R']
  ];
  function m003Warp(cfg) {
    const xL = 612.284, xR = 1195.645, ys = [141.565,323.485,917.453,1096.199,1681.553,1865.805];
    const scale = 205 / (1193.726 - 612.623), sxC = cfg.W / 205, sxS = cfg.H / 65;
    const x = n => n < xL ? xL + (n - xL) * sxS : n <= xR ? xL + (n - xL) * sxC : xL + (xR - xL) * sxC + (n - xR) * sxS;
    const targets = [cfg.H,cfg.D,cfg.H,cfg.D,cfg.H], ratios = targets.map((v,i) => v / (scale * (ys[i+1] - ys[i]))), starts = [ys[0]];
    for (let i = 0; i < 5; i++) starts.push(starts[i] + (ys[i+1] - ys[i]) * ratios[i]);
    const y = n => { let i=0; if(n>=ys[5])i=4;else while(i<4&&n>=ys[i+1])i++; return starts[i]+(n-ys[i])*ratios[i]; };
    return { scale, point: p => P(x(p.x), y(p.y)), mm: p => P(p.x * scale, p.y * scale) };
  }
  function sample(d, runtime, closed) {
    if (!runtime.document?.createElementNS) throw new Error('Mailer mapping: M003 requires SVG path measurement.');
    const path = runtime.document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', d);
    const length = path.getTotalLength(), count = Math.max(24, Math.ceil(length / 2)), points = [];
    if (!(length > 0) || !Number.isFinite(length)) throw new Error('Mailer mapping: invalid SVG length.');
    for (let i = 0; i < count + (closed ? 0 : 1); i++) { const p = path.getPointAtLength(length * i / count); points.push(P(p.x, p.y)); }
    return points;
  }
  function clipMask(subject, mask) {
    const area = mask.reduce((sum,p,i) => { const q=mask[(i+1)%mask.length];return sum+p.x*q.y-q.x*p.y; },0), sign = area >= 0 ? 1 : -1;
    let output = subject.slice();
    mask.forEach((a,i) => {
      const b=mask[(i+1)%mask.length], input=output; output=[];
      const inside=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))>=-.01;
      const cross=(p,q)=>{const rx=q.x-p.x,ry=q.y-p.y,sx=b.x-a.x,sy=b.y-a.y,den=rx*sy-ry*sx;if(Math.abs(den)<1e-9)return q;const t=((a.x-p.x)*sy-(a.y-p.y)*sx)/den;return P(p.x+t*rx,p.y+t*ry);};
      for(let j=0;j<input.length;j++){const p=input[(j+input.length-1)%input.length],q=input[j];if(inside(p)!==inside(q))output.push(cross(p,q));if(inside(q))output.push(q);}
    });
    return output;
  }
  function covers(a,b,edges) {
    const length=distance(a,b); if(length<1e-9)return false;
    const project=p=>((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/length;
    const on=p=>Math.abs((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))/length<=EPS;
    const intervals=edges.filter(e=>on(e.a)&&on(e.b)).map(e=>[project(e.a),project(e.b)].sort((x,y)=>x-y)).sort((x,y)=>x[0]-y[0]);
    let end=0;for(const interval of intervals){if(interval[0]>end+EPS)break;end=Math.max(end,interval[1]);}return end>=length-EPS;
  }
  function convert(id, input, runtime, legacy) {
    if (!['M001','M002','M003'].includes(id)) throw new Error('Mailer mapping: unsupported structure.');
    if (!validator?.validate) throw new Error('Mailer mapping: PacVu3DContract is required.');
    for (const key of ['W','D','H']) if(input[key]!==undefined&&(!Number.isFinite(Number(input[key]))||Number(input[key])<=0))throw new Error('Mailer mapping: invalid dimension '+key);
    if (!legacy && typeof runtime[id+'_getLayout'] !== 'function') throw new Error('Mailer mapping: missing source Layout '+id);
    const layout = legacy ? legacy.layout : id === 'M002' ? runtime.M002_getLayout(input.W ?? 400,input.D ?? 308,input.H ?? 80) : runtime[id+'_getLayout'](copy(input));
    if (!layout || layout.meta?.id !== id || (legacy && legacy.code !== id)) throw new Error('Mailer mapping: source structure/layout mismatch.');
    const cfg = layout.config, dimensions = { W: cfg.W, D: cfg.D, H: cfg.H };
    if(legacy&&['W','D','H'].some(k=>legacy.dimensions?.[k]!==cfg[k]||(input[k]!==undefined&&Number(input[k])!==cfg[k])))throw new Error('Mailer mapping: input and source dimensions differ.');
    const diagnostics = [], unresolvedRelations = [], notice = (code,path,message) => diagnostics.push({code,path,message});
    const c = { schemaVersion: validator.SCHEMA_VERSION, structureId:id, units:'mm',
      coordinates:{space:'part-local-2d',x:'right',y:'down',origin:'source-defined'},
      parameters:{dimensions,options:copy(Object.fromEntries(Object.entries(cfg).filter(([k])=>!['W','D','H'].includes(k))))},
      materials:[{id:'paper',kind:'unspecified',thicknessMm:null}], parts:[{id:'sheet',materialId:'paper',panelIds:[]}],
      paths:[],panels:[],cuts:[],folds:[],holes:[],slits:[],perforations:[],layers:[],glues:[],insertions:[],bonds:[],
      source:{builder:id+'_getLayout',geometry:'existing-layout-and-private-3d-mapping',assemblyOwner:'structures/mailer/'+id+'/'+id+(id==='M002'?'_3d.js':'_3d_test.js'),
        mappingOnly:true,unresolvedRelations:[],doubleFolds:[],lockFeatures:copy(layout.locks||[])} };
    const edges = new Map();
    function polyPath(pathId, points, closed, source) {
      const pts = clean(points, 1e-9, closed);
      // M001 can collapse a named cut segment when a lock is removed at short
      // depth. Retain that source point and warn; do not invent a finite cut.
      if(pts.length===1&&!closed&&points.length>1){pts.push(P(pts[0].x,pts[0].y));notice('DEGENERATE_SOURCE_CUT',pathId,'Source segment collapses to a point at this size; retained without repair.');}
      if(pts.length<2)throw new Error('Mailer mapping: empty path '+pathId);
      if(closed)pts.push(P(pts[0].x,pts[0].y));
      const path={id:pathId,partId:'sheet',closed,start:pts[0],segments:pts.slice(1).map((to,i)=>({id:'s'+i,type:'line',to})),source};
      c.paths.push(path);edges.set(pathId,pts.slice(1).map((b,i)=>({a:pts[i],b})));return path;
    }
    function cutPath(path, kind) { const cut={id:'cut.'+path.id,partId:'sheet',pathId:path.id,kind};c.cuts.push(cut);return cut; }
    function addHole(h, path) {
      c.holes.push({id:h.id,partId:'sheet',boundaryPathId:path.id,panelIds:[h.panelId],source:copy(h)});cutPath(path,'internal');
    }
    // Exact source circle/rounded rectangle parameters. A finite-width slot is
    // a Hole, never a zero-width Slit. Preserve M001 arcs vs M002 quadratics.
    function opening(h) {
      let start, segments=[];
      const arc=to=>({type:'arc',rx:h.r,ry:h.r,rotationDeg:0,largeArc:false,sweep:true,to});
      if(h.r){start=P(h.cx+h.r,h.cy);segments=[arc(P(h.cx-h.r,h.cy)),arc(start)];}
      else {
        const x=Number.isFinite(h.x)?h.x:h.cx-h.width/2,y=Number.isFinite(h.y)?h.y:h.cy-h.height/2,w=h.width,ht=h.height,r=Math.min(h.radius,w/2,ht/2);
        start=P(x+r,y);
        const line=to=>segments.push({type:'line',to});
        const corner=(control,to)=>segments.push(id==='M001'?{type:'arc',rx:r,ry:r,rotationDeg:0,largeArc:false,sweep:true,to}:{type:'quadratic',control,to});
        line(P(x+w-r,y));corner(P(x+w,y),P(x+w,y+r));line(P(x+w,y+ht-r));corner(P(x+w,y+ht),P(x+w-r,y+ht));
        line(P(x+r,y+ht));corner(P(x,y+ht),P(x,y+ht-r));line(P(x,y+r));corner(P(x,y),start);
      }
      const path={id:'opening.'+h.id,partId:'sheet',closed:true,start,segments:segments.map((s,i)=>({id:'s'+i,...s})),source:{field: h.id.startsWith('slot_')?'layout.slots':'layout.holes',original:copy(h)}};
      c.paths.push(path);addHole(h,path);
    }
    let mapped, sourceFoldPoints;
    if(id!=='M003') {
      mapped=lockMailer(layout,id); c.source.doubleFolds=copy(mapped.doubleFolds);
      layout.cut.forEach(s=>cutPath(polyPath('source.cut.'+s.id,s.points,!!s.closed,{field:'layout.cut',original:copy(s)}),'outer'));
      sourceFoldPoints=new Map(layout.fold.map(f=>[f.id,[f.a,f.b]]));
      [...layout.holes,...layout.slots].forEach(opening);
      if(id==='M001')notice('LEGACY_OPENINGS_NOT_RENDERED','source','Layout holes/slots are mapped; the existing M001 shapeGeometry does not subtract them. Original geometry is unchanged.');
      (layout.insertionRelations||[]).forEach(r=>unresolvedRelations.push({kind:'insertion',source:copy(r),
        mapping:{movingPanelId:r.movingPanelId,targetPanelId:r.targetPanelId,lockId:r.lockId,targetHoleId:r.slotId},missing:['targetPanelLocalEntryFrame','thicknessClearance']}));
    } else {
      if(layout.fold.length!==18||layout.panels.length||layout.holes.length||layout.slots.length)throw new Error('Mailer mapping: M003 source recipe changed; mapping review required.');
      const warp=m003Warp(cfg), map=p=>warp.mm(warp.point(p));
      c.source.coordinateMapping={field:'coordinateWarper + model.scale',sourceUnit:layout.meta.unit,modelScale:warp.scale};
      const out=sample(layout.cutFillPath,runtime,true).map(warp.point);
      polyPath('source.fill',out.map(warp.mm),true,{field:'layout.cutFillPath',d:layout.cutFillPath,role:'fill-only-not-manufacturing-cut'});
      layout.cut.forEach(s=>{
        const points=s.type==='line'?[P(s.x1,s.y1),P(s.x2,s.y2)]:sample(s.d,runtime,false);
        cutPath(polyPath('source.cut.'+s.id,points.map(map),false,{field:'layout.cut',original:copy(s),representation:'legacy-sampled'}),'outer');
      });
      mapped={panels:Object.entries(M003_MASKS).map(([panelId,mask])=>({id:panelId,polygon:clipMask(out,mask.map(warp.point)).map(warp.mm),source:{field:'build.regionMesh',mask:copy(mask),maskUnits:'source'}})),folds:[]};
      sourceFoldPoints=new Map(layout.fold.map(f=>[f.id,[map(P(f.x1,f.y1)),map(P(f.x2,f.y2))]]));
      M003_FOLDS.forEach(([foldId,parent,child,override])=>{
        const points=override?[map(P(override[0],override[1])),map(P(override[2],override[3]))]:sourceFoldPoints.get(foldId);
        mapped.folds.push({id:foldId,parent,child,axis:{a:points[0],b:points[1]},foldIds:[foldId],source:{field:'build.attach',role:/^f-1[01]/.test(foldId)?'storage-fold':'assembly-fold',axisBasis:override?'3d-axis-override':'layout.fold'}});
        if(/^f-11/.test(foldId))notice('LEGACY_AXIS_DIFFERS_FROM_CREASE','folds.'+foldId,'Existing 3D gusset axis differs from Layout crease; both are preserved for review.');
      });
      (layout.cutFillVoids||[]).forEach((d,i)=>addHole({id:'cutFillVoid.'+i,panelId:'base',d},polyPath('source.void.'+i,sample(d,runtime,true).map(map),true,{field:'layout.cutFillVoids',d,representation:'legacy-sampled'})));
      c.source.glueAreas=layout.glue.map(g=>({id:g.id,panelId:g.id.replace('_','-'),pathId:polyPath('glue.area.'+g.id,rect(g.x,g.y,g.x+g.width,g.y+g.height).map(map),true,{field:'layout.glue',original:copy(g)}).id}));
      for(const group of ['A','B'])for(const side of ['L','R']) {
        const leader=group+'-Glue-out-'+side,follower=group+'-Glue-in-'+side;
        unresolvedRelations.push({kind:'bond',source:{id:'bond.'+group+'.'+side,field:'build.registerBond',leaderPanelId:leader,followerPanelId:follower},
          mapping:{leaderPanelId:leader,followerPanelId:follower,leaderFoldId:'f-'+(group==='A'?'1':'5')+side,followerFoldId:'f-'+(group==='A'?'10':'11')+side,
            leaderGlueAreaId:group+'_Glue-out-'+side,followerGlueAreaId:group+'_Glue-in-'+side},missing:['confirmedFaceSides','glueContract','structureSuppliedReferenceTransform']});
      }
      notice('SAMPLED_LEGACY_GEOMETRY','source','M003 retains the existing SVG sample/warp/mask recipe. Curves are sampled, not exact manufacturing export curves.');
    }
    sourceFoldPoints.forEach((points,foldId)=>polyPath('source.fold.'+foldId,points,false,{field:'layout.fold',id:foldId}));
    mapped.folds.forEach(f=>c.folds.push({id:f.id,parentPanelId:f.parent,childPanelId:f.child,axis:{partId:'sheet',...copy(f.axis)},
      segments:f.foldIds.map(foldId=>({pathId:'source.fold.'+foldId})),orientation:{positiveRotation:'right-hand-about-a-to-b'},
      profile:{kind:'crease',thicknessAware:true,neutralAxis:'material-defined'},source:copy(f.source)}));
    c.parts[0].panelIds=mapped.panels.map(p=>p.id);
    mapped.panels.forEach(p=>{
      // Split only on collinear crease endpoints. This preserves polygon shape
      // while distinguishing interrupted folds from the slot gaps between them.
      const raw=clean(p.polygon), split=[];
      raw.forEach((a,i)=>{
        const b=raw[(i+1)%raw.length],length=distance(a,b);split.push(a);if(length<1e-9)return;
        const candidates=[...sourceFoldPoints.values()].flat().map(q=>({q,t:((q.x-a.x)*(b.x-a.x)+(q.y-a.y)*(b.y-a.y))/(length*length)}))
          .filter(({q,t})=>t>1e-8&&t<1-1e-8&&Math.abs((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))/length<1e-7).sort((u,v)=>u.t-v.t);
        for(const {t} of candidates){const q=P(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);if(distance(split.at(-1),q)>1e-9)split.push(q);}
      });
      const path=polyPath('panel.'+p.id,split,true,{...copy(p.source),geometryOwner:c.source.assemblyOwner});
      const bindings=edges.get(path.id).map((e,i)=>{
        const binding={segmentIds:['s'+i]};
        const fold=c.folds.find(f=>[f.parentPanelId,f.childPanelId].includes(p.id)&&covers(e.a,e.b,f.segments.flatMap(s=>edges.get(s.pathId))));
        const cut=c.cuts.find(k=>edges.has(k.pathId)&&covers(e.a,e.b,edges.get(k.pathId)));
        if(fold)return {...binding,kind:'fold',featureId:fold.id};
        if(cut)return {...binding,kind:'cut',featureId:cut.id};
        // Known 3D mask/clip partition: not a fabricated manufacturing feature.
        notice('LEGACY_PARTITION_BOUNDARY','panels.'+p.id+'.s'+i,'3D clip/fill boundary has no complete source cut/crease coverage; mechanical mapping remains unresolved.');
        return {...binding,kind:'continuous',source:{kind:'legacy-clipping-partition',mechanicalMapping:'unresolved'}};
      });
      c.panels.push({id:p.id,partId:'sheet',faceConvention:{outside:'negativeZ',inside:'positiveZ'},regions:[{id:'main',outerPathId:path.id,
        holeIds:c.holes.filter(h=>h.panelIds.includes(p.id)).map(h=>h.id),boundaryBindings:bindings}]});
    });
    // Validate the extra non-executable relationship references too. The v1
    // validator deliberately ignores source metadata, so do not rely on it here.
    const hasPanel=id=>c.parts[0].panelIds.includes(id);
    for(const lock of c.source.lockFeatures)if(!hasPanel(lock.panelId))throw new Error('Mailer mapping: invalid lock panel.');
    for(const area of c.source.glueAreas||[])if(!hasPanel(area.panelId))throw new Error('Mailer mapping: invalid glue area panel.');
    for(const r of unresolvedRelations){
      const m=r.mapping;
      if(r.kind==='insertion'&&(!hasPanel(m.movingPanelId)||!hasPanel(m.targetPanelId)||!c.holes.some(h=>h.id===m.targetHoleId&&h.panelIds.includes(m.targetPanelId))||!c.source.lockFeatures.some(l=>l.id===m.lockId&&l.panelId===m.movingPanelId)))throw new Error('Mailer mapping: disconnected insertion relation.');
      if(r.kind==='bond'&&(!hasPanel(m.leaderPanelId)||!hasPanel(m.followerPanelId)||!c.folds.some(f=>f.id===m.leaderFoldId&&f.childPanelId===m.leaderPanelId)||!c.folds.some(f=>f.id===m.followerFoldId&&f.childPanelId===m.followerPanelId)||![m.leaderGlueAreaId,m.followerGlueAreaId].every(id=>c.source.glueAreas.some(a=>a.id===id))))throw new Error('Mailer mapping: disconnected bond relation.');
      notice('UNRESOLVED_RELATION',r.kind+'.'+r.source.id,'Source relation retained without assembly behavior; missing '+r.missing.join(', ')+'.');
    }
    c.source.unresolvedRelations=copy(unresolvedRelations);
    const validation=validator.validate(c);
    return {contract:c,validation,diagnostics,unresolvedRelations,complete:validation.ok&&diagnostics.length===0&&validation.warnings.length===0};
  }
  return Object.freeze({convert});
});
