/* Read-only bridge for the explicitly supported structures below.
 * No viewer, meshes, poses, UI registration or I/O.
 * convert(id, input, runtime?) calls the EXISTING source builder once
 * (*_3D_BUILD_CONTRACT, or R001_3D_MASTER.buildContract).
 * fromLegacy(id, legacy, input, runtime?) also accepts an already-built snapshot.
 * Returns {contract, validation, diagnostics, unresolvedRelations, complete}.
 * Validation success is not physical/assembly completeness. Missing contact
 * areas, insertion frames and glue faces are reported, never fabricated.
 * Load PacVu3DContract and the original source scripts before using in browser.
 * M001/M002/M003 additionally require PacVu3DContractMailerMapping.js (no UI
 * registration). Their snapshots use {code, dimensions, layout}; private 3D
 * panel recipes are mapped separately, not rendered or assembled.
 * R002/R003/R004 also load PacVu3DContractShippingMapping.js before Adapter;
 * the original R001 builder still owns their panels and fold hierarchy.
 * TR001/TR002/TR003 also load PacVu3DContractTrayMapping.js before Adapter;
 * their private 3D regions are mapped separately from exact Layout features.
 * B001/B002/C001 load BakeryCakeSource and BakeryCakeMapping before Adapter;
 * fixed-size rules and C001 preset resolution remain owned by original Spec.
 * T006/T010/GA001/S001 load SpecialRecipes and SpecialMapping before Adapter;
 * S001 maps all three rawParts, independent of preview visibility/placement.
 * Runtime supplies T001 path helpers, T002/T003 hole resolvers, and SVG path
 * measurement for R001. No new connection to PacVuPhysicalPaper3D is made here.
 * Unspecified perforation patterns stay in source.unresolvedFeatures, not fake
 * cut/tie values. T007's renderer-overlay openings remain solid manufacturing
 * paper; their original contours are preserved in source.presentationOpenings.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root, require('./PacVu3DContract.js'), require('./PacVu3DContractMailerMapping.js'), require('./PacVu3DContractShippingMapping.js'), require('./PacVu3DContractTrayMapping.js'), require('./PacVu3DContractBakeryCakeMapping.js'), require('./PacVu3DContractSpecialMapping.js'));
  else root.PacVu3DContractAdapter = factory(root, root.PacVu3DContract, root.PacVu3DContractMailerMapping, root.PacVu3DContractShippingMapping, root.PacVu3DContractTrayMapping, root.PacVu3DContractBakeryCakeMapping, root.PacVu3DContractSpecialMapping);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root, validator, mailerMapping, shippingMapping, trayMapping, bakeryCakeMapping, specialMapping) {
  'use strict';
  const SUPPORTED = Object.freeze(['T001', 'T002', 'T003', 'T004', 'T005', 'T007', 'T008', 'T009', 'R001', 'M001', 'M002', 'M003', 'R002', 'R003', 'R004', 'TR001', 'TR002', 'TR003', 'B001', 'B002', 'C001', 'T006', 'T010', 'GA001', 'S001']);
  const isShippingVariant = id => /^R00[234]$/.test(id);
  const TOLERANCE_MM = 0.002; // Source layout emits 4-decimal coordinates.
  // Source fold indices are intentionally structure-specific, not guessed by proximity.
  const FOLD_SOURCE = {
    T001: { 'body.front-sideLeft': [5], 'body.sideLeft-back': [6], 'body.back-sideRight': [4], 'body.front-glue': [7],
      'top.sideLeft-dust': [9], 'top.sideRight-dust': [8], 'top.front-lid': [10], 'top.lid-tuck': [11],
      'bottom.front': [3], 'bottom.sideLeft': [2], 'bottom.sideRight': [0], 'bottom.back': [1], 'bottom.back-bend': [] },
    T002: { 'body.front-sideLeft': [7], 'body.sideLeft-back': [8], 'body.back-sideRight': [6], 'body.front-glue': [9],
      'bottom.A': [3], 'bottom.B': [1], 'bottom.L': [2], 'bottom.R': [0], 'bottom.triangleL': [5], 'bottom.triangleR': [4],
      'top.back-bottleLower': [16, 17], 'top.bottleLower-upper': [15], 'top.left-dust': [11, 12], 'top.right-dust': [10],
      'top.front-lid': [13], 'top.lid-tuck': [14] }
  };
  FOLD_SOURCE.T003 = { ...FOLD_SOURCE.T002, 'body.front-sideLeft': [8], 'body.sideLeft-back': [7],
    'top.back-bottleLower': [14], 'top.bottleLower-upper': [15], 'top.left-dust': [11], 'top.front-lid': [12], 'top.lid-tuck': [13] };
  FOLD_SOURCE.T004 = Object.fromEntries(Object.entries({ ...FOLD_SOURCE.T002, 'top.left-dust': [11], 'top.front-lid': [12], 'top.lid-tuck': [13] })
    .filter(([key]) => !['top.back-bottleLower', 'top.bottleLower-upper'].includes(key)));
  FOLD_SOURCE.T009 = Object.fromEntries(Object.entries(FOLD_SOURCE.T001).filter(([key]) => key !== 'bottom.back-bend'));
  FOLD_SOURCE.T005 = { 'body.front-sideLeft': [5], 'body.sideLeft-back': [4], 'body.back-glue': [6], 'body.front-sideRight': [7],
    'lower.sideLeft-dust': [10], 'lower.sideRight-dust': [9], 'lower.back-lid': [2], 'lower.lid-tuck': [3],
    'upper.sideLeft-dust': [11], 'upper.sideRight-dust': [8], 'upper.front-lid': [1], 'upper.lid-tuck': [0] };
  FOLD_SOURCE.T007 = { 'body.front-sideLeft': [6], 'body.sideLeft-back': [5], 'body.back-glue': [7], 'body.front-sideRight': [4],
    'bottom.sideLeft': [2], 'bottom.sideRight': [0], 'bottom.back': [3], 'bottom.glue': [1],
    'top.sideLeft': [9], 'top.sideRight': [8], 'top.back': [10], 'top.glue': [11] };
  FOLD_SOURCE.T008 = { 'body.front-sideLeft': [1], 'body.sideLeft-back': [2], 'body.front-sideRight': [0], 'body.back-glue': [3],
    'bottom.A': [11], 'bottom.B': [9], 'bottom.L': [10], 'bottom.R': [8], 'bottom.f13-outward': [13], 'bottom.f14-outward': [12],
    'top.left-dust': [5], 'top.right-dust': [4], 'top.front-lid': [6], 'top.lid-tuck': [7] };
  FOLD_SOURCE.R001 = { 'body-front-sideL': [1], 'body-sideL-back': [2], 'body-back-sideR': [3], 'body-front-glue': [0],
    'bottom-sideL': [10], 'bottom-sideR': [11], 'bottom-front': [8], 'bottom-back': [9],
    'top-sideL': [6], 'top-sideR': [7], 'top-front': [4], 'top-back': [5] };
  const FOLD_COUNTS = { T001: 12, T002: 18, T003: 16, T004: 14, T005: 12, T008: 14, T009: 12, R001: 12 };
  const clone = v => JSON.parse(JSON.stringify(v));
  const point = p => {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error('Adapter: nonfinite source point.');
    return { x: p.x, y: p.y };
  };
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lineDistance = (p, a, b) => Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / distance(a, b);
  const collinear = (a, b, x, y) => distance(x, y) > 1e-9 && lineDistance(a, x, y) <= TOLERANCE_MM && lineDistance(b, x, y) <= TOLERANCE_MM;
  function segmentDistance(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length2)) : 0;
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
  }
  function covers(a, b, edges) {
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    if (length < 1e-9) return false;
    const project = p => ((p.x - a.x) * dx + (p.y - a.y) * dy) / length;
    const intervals = edges.filter(e => collinear(e.a, e.b, a, b)).map(e => [project(e.a), project(e.b)].sort((x, y) => x - y)).sort((x, y) => x[0] - y[0]);
    let end = 0;
    for (const interval of intervals) { if (interval[0] > end + TOLERANCE_MM) break; end = Math.max(end, interval[1]); }
    return end >= length - TOLERANCE_MM;
  }
  const edgesOf = points => points.slice(1).map((b, i) => ({ a: points[i], b }));
  function inside(point, polygon) {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result = !result;
    }
    return result;
  }
  function requireSupported(id) { if (!SUPPORTED.includes(id)) throw new Error('Adapter: unsupported structure ' + id + '. Supported: ' + SUPPORTED.join(', ')); }
  function requireRuntime(runtime, id) {
    for (const name of ['T001_parseAbsolutePath', 'T001_elementToPathD', 'T001_flattenPathD', ...(['T002', 'T003'].includes(id) ? [id + '_resolveHoles'] : [])]) {
      if (typeof runtime[name] !== 'function') throw new Error('Adapter: missing source dependency ' + name);
    }
    if (!validator?.validate) throw new Error('Adapter: PacVu3DContract is required.');
  }
  function checkInput(input) {
    for (const key of ['W', 'D', 'H']) if (input[key] !== undefined && (!Number.isFinite(Number(input[key])) || Number(input[key]) <= 0)) {
      throw new Error('Adapter: invalid dimension ' + key);
    }
  }
  // R001 emits absolute M/L/A/Z. Preserve its SVG arc parameters exactly;
  // fail on other commands rather than approximate a manufacturing outline.
  function shippingPath(d, pathId = 'cut.outline.path', source = { field: 'layout.outerPath' }, closed = true) {
    const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
    let i = 0, start, current; const segments = [];
    const read = () => { const n = Number(tokens[i++]); if (!Number.isFinite(n)) throw new Error('Adapter: malformed R001 path.'); return n; };
    while (i < tokens.length) {
      const cmd = tokens[i++];
      if (cmd === 'M') { if (start) throw new Error('Adapter: compound R001 outline is unsupported.'); start = current = { x: read(), y: read() }; }
      else if (cmd === 'L') { current = { x: read(), y: read() }; segments.push({ type: 'line', to: current }); }
      else if (cmd === 'H' && current) { current = { x: read(), y: current.y }; segments.push({ type: 'line', to: current }); }
      else if (cmd === 'V' && current) { current = { x: current.x, y: read() }; segments.push({ type: 'line', to: current }); }
      else if (cmd === 'A') {
        const rx = read(), ry = read(), rotationDeg = read(), large = read(), sweep = read();
        if (![0, 1].includes(large) || ![0, 1].includes(sweep)) throw new Error('Adapter: invalid arc flags.');
        current = { x: read(), y: read() }; segments.push({ type: 'arc', rx, ry, rotationDeg, largeArc: !!large, sweep: !!sweep, to: current });
      } else if (cmd === 'Z' && start) { if (distance(current, start) > 0) segments.push({ type: 'line', to: point(start) }); }
      else throw new Error('Adapter: unsupported R001 path command ' + cmd);
    }
    return { id: pathId, partId: 'sheet', closed, start, segments: segments.map((s, index) => ({ id: 's' + index, ...s })), source };
  }
  function sampleShippingPath(d, runtime) {
    if (!runtime.document?.createElementNS) throw new Error('Adapter: R001 requires an SVG path measurement runtime.');
    const path = runtime.document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', d);
    const length = path.getTotalLength(), count = Math.max(80, Math.ceil(length / 1.5)), points = [];
    for (let i = 0; i < count; i++) { const p = point(path.getPointAtLength(length * i / count)); if (!points.length || distance(p, points.at(-1)) > 0.001) points.push(p); }
    return points;
  }
  function convert(id, input = {}, runtime = root) {
    if (['T006', 'T010', 'GA001', 'S001'].includes(id)) {
      if (!specialMapping) throw new Error('Adapter: load SpecialRecipes and SpecialMapping before Adapter.');
      return specialMapping.convert(id, input, runtime);
    }
    if (['B001', 'B002', 'C001'].includes(id)) {
      if (!bakeryCakeMapping) throw new Error('Adapter: load BakeryCakeSource and BakeryCakeMapping before Adapter.');
      return bakeryCakeMapping.convert(id, input, runtime);
    }
    requireSupported(id); checkInput(input);
    if (/^TR00[123]$/.test(id)) {
      if (!trayMapping) throw new Error('Adapter: PacVu3DContractTrayMapping is required.');
      return trayMapping.convert(id, input, runtime);
    }
    if (/^M00[123]$/.test(id)) {
      if (!mailerMapping) throw new Error('Adapter: PacVu3DContractMailerMapping is required.');
      return mailerMapping.convert(id, input, runtime);
    }
    requireRuntime(runtime, id);
    if (isShippingVariant(id)) {
      if (!shippingMapping) throw new Error('Adapter: PacVu3DContractShippingMapping is required.');
      return fromLegacy(id, shippingMapping.build(id, input, runtime), input, runtime);
    }
    const build = id === 'R001' ? runtime.R001_3D_MASTER?.buildContract : runtime[id + '_3D_BUILD_CONTRACT'];
    if (typeof build !== 'function') throw new Error('Adapter: missing source builder ' + id);
    return fromLegacy(id, build(clone(input)), input, runtime);
  }
  function fromLegacy(id, legacy, input = {}, runtime = root) {
    if (['T006', 'T010', 'GA001', 'S001'].includes(id)) {
      if (!specialMapping) throw new Error('Adapter: load SpecialRecipes and SpecialMapping before Adapter.');
      return specialMapping.convert(id, input, runtime, legacy);
    }
    if (['B001', 'B002', 'C001'].includes(id)) {
      if (!bakeryCakeMapping) throw new Error('Adapter: load BakeryCakeSource and BakeryCakeMapping before Adapter.');
      return bakeryCakeMapping.convert(id, input, runtime, legacy);
    }
    requireSupported(id); checkInput(input);
    if (/^TR00[123]$/.test(id)) {
      if (!trayMapping) throw new Error('Adapter: PacVu3DContractTrayMapping is required.');
      return trayMapping.convert(id, input, runtime, legacy);
    }
    if (/^M00[123]$/.test(id)) {
      if (!mailerMapping) throw new Error('Adapter: PacVu3DContractMailerMapping is required.');
      return mailerMapping.convert(id, input, runtime, legacy);
    }
    requireRuntime(runtime, id);
    if (legacy?.code !== id || !legacy.layout || !Array.isArray(legacy.panels)) throw new Error('Adapter: source structure/layout mismatch.');
    for (const key of ['W', 'D', 'H']) if (input[key] !== undefined && Number(input[key]) !== legacy.dimensions[key]) throw new Error('Adapter: input and source dimensions differ.');
    const layout = legacy.layout, sourceFolds = legacy.foldRelations || legacy.folds;
    const variant = isShippingVariant(id), shipping = id === 'R001' || variant;
    if (variant && !shippingMapping) throw new Error('Adapter: PacVu3DContractShippingMapping is required.');
    const shippingSource = variant ? shippingMapping.describe(id, legacy, { ...(legacy.options || {}), ...input }, runtime) : null;
    const foldSource = variant ? shippingSource.foldIndices : FOLD_SOURCE[id];
    const foldElements = shipping ? layout.foldLines.map(f => '<line x1="' + f.x1 + '" y1="' + f.y1 + '" x2="' + f.x2 + '" y2="' + f.y2 + '"/>') : layout.foldElements;
    const fillPath = variant ? shippingSource.outerPath : id === 'R001' ? layout.outerPath : layout.fillPath;
    const outline = shipping ? sampleShippingPath(fillPath, runtime) : runtime.T001_flattenPathD(fillPath);
    const expectedFoldCount = variant ? 12 : id === 'T007' ? 12 + (layout.liftFold || []).length : FOLD_COUNTS[id];
    if (!Array.isArray(sourceFolds) || sourceFolds.length !== Object.keys(foldSource).length || foldElements.length !== expectedFoldCount) throw new Error('Adapter: source fold recipe changed; mapping review required.');
    const diagnostics = [], unresolvedRelations = [];
    const notice = (code, path, message) => diagnostics.push({ code, path, message });
    const c = {
      schemaVersion: validator.SCHEMA_VERSION, structureId: id, units: 'mm',
      coordinates: { space: 'part-local-2d', x: 'right', y: 'down', origin: 'source-defined' },
      parameters: { dimensions: clone(legacy.dimensions), options: clone({ ...(legacy.options || {}), ...Object.fromEntries(Object.entries(input).filter(([k]) => !['W', 'D', 'H'].includes(k))) }) },
      materials: [{ id: 'paper', kind: 'unspecified', thicknessMm: null }],
      parts: [{ id: 'sheet', materialId: 'paper', panelIds: Array.from(legacy.panels, p => p.id) }],
      paths: [], panels: [], cuts: [], folds: [], holes: [], slits: [], perforations: [], layers: [], glues: [], insertions: [], bonds: [],
      source: { builder: shipping ? 'R001_3D_MASTER.buildContract' : id + '_3D_BUILD_CONTRACT', geometry: 'existing-layout-and-3d-polygons', assemblyOwner: id + '_3D_MASTER' }
    };
    const pathMap = new Map(), edgeMap = new Map();
    function addPath(path, edges) { c.paths.push(path); pathMap.set(path.id, path); if (edges) edgeMap.set(path.id, edges); return path; }
    function svgPath(pathId, d, source, closed = false) {
      const parsed = runtime.T001_parseAbsolutePath(d);
      if (!parsed.start || !parsed.segments.length) throw new Error('Adapter: empty path ' + pathId);
      const segments = parsed.segments.map((s, i) => {
        if (!['L', 'C'].includes(s.type)) throw new Error('Adapter: unsupported source segment ' + s.type);
        return { id: 's' + i, type: s.type === 'L' ? 'line' : 'cubic', to: point(s.to), ...(s.type === 'C' ? { control1: point(s.c1), control2: point(s.c2) } : {}) };
      });
      return addPath({ id: pathId, partId: 'sheet', closed, start: point(parsed.start), segments, source }, edgesOf(runtime.T001_flattenPathD(d)));
    }
    function ring(pathId, polygon, source) {
      let points = polygon.map(point).filter((p, i, all) => !i || distance(p, all[i - 1]) > 1e-9);
      if (points.length > 1 && distance(points[0], points.at(-1)) < 1e-9) points.pop();
      if (points.length < 3) throw new Error('Adapter: degenerate panel ' + pathId);
      // Split mixed cut/partition edges at projected source endpoints, preserving
      // the legacy polygon exactly (no coordinate snapping or silhouette repair).
      const candidates = outline.concat(c.slits.flatMap(s => edgeMap.get(s.pathId).flatMap(e => [e.a, e.b])));
      points = points.flatMap((a, i, all) => {
        const b = all[(i + 1) % all.length], dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy;
        const values = candidates.filter(p => lineDistance(p, a, b) <= TOLERANCE_MM)
          .map(p => ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2)
          .filter(t => t > 1e-7 && t < 1 - 1e-7).sort((x, y) => x - y)
          .filter((t, k, ts) => !k || (t - ts[k - 1]) * Math.sqrt(len2) > TOLERANCE_MM);
        return [a, ...values.map(t => ({ x: a.x + t * dx, y: a.y + t * dy }))];
      });
      const loop = points.concat([points[0]]);
      return addPath({ id: pathId, partId: 'sheet', closed: true, start: points[0], segments: loop.slice(1).map((to, i) => ({ id: 's' + i, type: 'line', to })), source }, edgesOf(loop));
    }
    if (shipping) addPath(shippingPath(fillPath), edgesOf(outline.concat([outline[0]])));
    else svgPath('cut.outline.path', fillPath, { field: 'layout.fillPath' }, true);
    if (variant) {
      pathMap.get('cut.outline.path').source = { field: id + '_3d.inputFor.__outerPath', kind: 'legacy-3d-silhouette-only', d: fillPath };
      c.source.shippingMapping = clone(shippingSource);
      notice('LEGACY_3D_SILHOUETTE', 'cut.outline.path', 'Original 3D silhouette retained for panel clipping; manufacturing cuts remain the original layout.cutPathsMm.');
      layout.cutPathsMm.forEach((d, i) => {
        const pathId = 'cut.source.path.' + i;
        // Mapped R002/R003/R004 cut paths already use absolute M/L; retain
        // every original point and subpath endpoint without another sampling.
        const path = shippingPath(d, pathId, { field: 'layout.cutPathsMm', index: i, d, original: layout.cutPaths[i] }, /[zZ]\s*$/.test(d));
        addPath(path, edgesOf([path.start, ...path.segments.map(s => s.to)]));
        c.cuts.push({ id: 'cut.source.' + i, partId: 'sheet', pathId, kind: 'outer' });
      });
      shippingSource.handleFeatures.forEach(h => {
        const pathId = 'hole.path.' + h.id;
        addPath(shippingPath(h.pathD, pathId, { field: 'layout.handleCutPaths', index: h.index, d: h.pathD }));
        c.holes.push({ id: h.id, partId: 'sheet', boundaryPathId: pathId, panelIds: [h.panelId], source: { legacyGeometry: clone(h.legacyGeometry) } });
        c.cuts.push({ id: 'cut.' + h.id, partId: 'sheet', pathId, kind: 'internal' });
      });
      if (id === 'R004') c.parameters.options.handleHoleEnabled = shippingSource.handleHoleEnabled;
    } else if (id === 'T008') {
      pathMap.get('cut.outline.path').source.kind = 'stitched-fill-only';
      notice('STITCHED_FILL_PATH', 'cut.outline.path', 'T008 fill joins independent cuts; only original cutElements are manufacturing cuts.');
    } else c.cuts.push({ id: 'cut.outline', partId: 'sheet', pathId: 'cut.outline.path', kind: 'outer' });
    foldElements.forEach((el, i) => {
      if (variant) {
        // Shipping Layout keeps full-precision numeric Fold coordinates. Do
        // not round-trip these through T001's four-decimal SVG serializer.
        const f = layout.foldLines[i], a = point({ x: f.x1, y: f.y1 }), b = point({ x: f.x2, y: f.y2 });
        addPath({ id: 'source.fold.' + i, partId: 'sheet', closed: false, start: a,
          segments: [{ id: 's0', type: 'line', to: b }], source: { field: 'layout.foldLines', index: i, id: f.id } }, [{ a, b }]);
      } else svgPath('source.fold.' + i, runtime.T001_elementToPathD(el), { field: shipping ? 'layout.foldLines' : 'layout.foldElements', index: i });
    });
    // Original cuts also preserve relief slits and cut islands which fillPath
    // alone cannot distinguish (notably T008's stitched rabbit-ear outline).
    if (!['T001', 'T002', 'R001'].includes(id)) (layout.cutElements || []).forEach((el, i) => {
      const d = runtime.T001_elementToPathD(el), pathId = 'cut.source.path.' + i;
      svgPath(pathId, d, { field: 'layout.cutElements', index: i }, /[zZ]\s*$/.test(d));
      c.cuts.push({ id: 'cut.source.' + i, partId: 'sheet', pathId, kind: 'internal' });
    });
    // These four open cuts are slits, not artificial closed holes.
    const slitElements = layout.upperTuckSideCuts || layout.shortCutElements || [];
    slitElements.forEach((el, i) => {
      const pathId = 'slit.path.' + i;
      svgPath(pathId, runtime.T001_elementToPathD(el), { field: 'layout.upperTuckSideCuts', index: i });
      c.slits.push({ id: 'slit.' + i, partId: 'sheet', pathId, panelIds: [], kerfMm: 0, source: { kerf: 'ideal-zero-width-layout-line' } });
    });
    const holes = ['T002', 'T003'].includes(id) ? runtime[id + '_resolveHoles'](layout, clone(input)) : [];
    holes.forEach(h => {
      if (![h.cx, h.cy, h.r].every(Number.isFinite) || h.r <= 0) throw new Error('Adapter: invalid hole ' + h.id);
      const left = { x: h.cx - h.r, y: h.cy }, right = { x: h.cx + h.r, y: h.cy };
      const pathId = 'hole.path.' + h.id;
      addPath({ id: pathId, partId: 'sheet', closed: true, start: right, segments: [left, right].map((to, i) => ({ id: 's' + i, type: 'arc', to, rx: h.r, ry: h.r, rotationDeg: 0, largeArc: false, sweep: true })), source: { resolver: id + '_resolveHoles', id: h.id } });
      const panelIds = legacy.panels.filter(p => p.holes?.some(x => x.id === h.id)).map(p => p.id);
      // Existing T002 builder represents hole_2 as two boundary notches.
      if (h.id === 'hole_2') panelIds.push('back', 'bottleTopLower');
      c.holes.push({ id: h.id, partId: 'sheet', boundaryPathId: pathId, panelIds: [...new Set(panelIds)], source: { representation: h.id === 'hole_2' ? 'boundary-notches' : 'interior-hole' } });
      c.cuts.push({ id: 'cut.' + h.id, partId: 'sheet', pathId, kind: 'internal' });
      if (h.id === 'hole_2' && Math.abs(h.cy - layout.grid.yBodyTop) > TOLERANCE_MM) notice('SOURCE_HOLE_MISMATCH', 'holes.' + h.id, 'Existing 3D notch is anchored to body top, while the 2D hole Y option moves its centre. Both source representations are retained.');
    });
    c.source.unresolvedFeatures = [];
    const unresolvedFeature = (kind, pathId, panelId, missing) => {
      c.source.unresolvedFeatures.push({ kind, pathId, panelId, missing });
      notice('UNRESOLVED_FEATURE', pathId, 'Source feature retained; missing ' + missing.join(', ') + '.');
    };
    if (id === 'T005' && legacy.options.capsulePunchEnabled) {
      const capsule = layout.capsuleHole;
      svgPath('capsule.cut', capsule.cutPath, { field: 'layout.capsuleHole.cutPath' });
      c.cuts.push({ id: 'capsule.cut', partId: 'sheet', pathId: 'capsule.cut', kind: 'internal' });
      svgPath('capsule.punch', capsule.punchPath, { field: 'layout.capsuleHole.punchPath' });
      unresolvedFeature('perforation', 'capsule.punch', 'sideLeft', ['cutMm', 'tieMm']);
    }
    if (id === 'T007') {
      (layout.perforationElements || []).forEach((el, i) => {
        const pathId = 'perforation.source.' + i;
        svgPath(pathId, runtime.T001_elementToPathD(el), { field: 'layout.perforationElements', index: i });
        unresolvedFeature('perforation', pathId, i < (layout.tearPerf || []).length ? 'front' : 'back', ['cutMm', 'tieMm']);
      });
      (layout.liftFold || []).forEach((_, i) => unresolvedFeature('fold', 'source.fold.' + (12 + i), 'back', ['childPanelId']));
      // The old renderer punches a hole then overlays the detachable tissue
      // patch. In the un-torn manufacturing contract this is still solid paper.
      c.source.presentationOpenings = [];
    }
    sourceFolds.forEach(f => {
      const indices = foldSource[f.id];
      if (!indices) throw new Error('Adapter: unmapped fold ' + f.id);
      const a = point(f.axis?.a || f.a), b = point(f.axis?.b || f.b);
      let segments = indices.map(i => ({ pathId: 'source.fold.' + i }));
      if (!indices.length) {
        if (!f.internal) throw new Error('Adapter: missing manufacturing fold ' + f.id);
        const pathId = 'assembly.axis.' + f.id;
        addPath({ id: pathId, partId: 'sheet', closed: false, start: a, segments: [{ id: 's0', type: 'line', to: b }], source: { kind: 'assembly-only', manufactured: false } });
        segments = [{ pathId }];
        notice('ASSEMBLY_ONLY_AXIS', 'folds.' + f.id, 'Existing internal bend has no manufactured 2D crease; it is explicitly marked assembly-only.');
      } else if (indices.some(i => edgeMap.get('source.fold.' + i).some(e => !collinear(e.a, e.b, a, b)))) {
        notice('SOURCE_AXIS_MISMATCH', 'folds.' + f.id, 'Existing 3D axis and 2D fold do not coincide. Neither has been moved.');
      }
      c.folds.push({ id: f.id, parentPanelId: f.parentId, childPanelId: f.childId, axis: { partId: 'sheet', a, b }, segments,
        orientation: { positiveRotation: 'right-hand-about-a-to-b' },
        profile: { kind: Math.abs(f.angle) >= 179 ? 'returnFold' : 'crease', thicknessAware: true, neutralAxis: 'material-defined' },
        source: { kind: f.internal ? 'assembly-only' : 'manufactured', field: legacy.foldRelations ? 'foldRelations' : 'folds', id: f.id, profileBasis: 'legacy-angle-magnitude-not-assembly-timing' } });
    });
    const rigid = ['T002', 'T003', 'T004'].includes(id) ? { upperTuckReliefLeft: 'lidTop', upperTuckReliefRight: 'lidTop' } : {};
    legacy.panels.forEach(p => {
      const holeIds = [];
      if (variant) holeIds.push(...shippingSource.handleFeatures.filter(h => h.panelId === p.id).map(h => h.id));
      (p.holes || []).forEach((h, i) => {
        if (variant) return; // Exact Layout handle paths were mapped above.
        if (!Array.isArray(h)) { holeIds.push(h.id); return; }
        const holeId = 'hole.' + p.id + '.' + i, pathId = 'hole.path.' + p.id + '.' + i;
        ring(pathId, h, { field: 'panels.holes', panelId: p.id, index: i });
        if (id === 'T007') { c.source.presentationOpenings.push({ panelId: p.id, pathId, state: 'renderer-overlay-not-manufacturing-hole' }); return; }
        c.holes.push({ id: holeId, partId: 'sheet', boundaryPathId: pathId, panelIds: [p.id], source: { state: 'legacy-opened-hole' } });
        c.cuts.push({ id: 'cut.' + holeId, partId: 'sheet', pathId, kind: 'internal' }); holeIds.push(holeId);
      });
      const regions = [p.polygon, ...(p.patches || [])].map((polygon, i) => {
        const path = ring('panel.' + p.id + (i ? '.patch.' + i : ''), polygon, { field: i ? 'panels.patches' : 'panels.polygon', panelId: p.id });
        return { id: i ? 'patch.' + i : 'main', outerPathId: path.id, holeIds: i ? [] : holeIds, boundaryBindings: [] };
      });
      c.panels.push({ id: p.id, partId: 'sheet', ...(p.role ? { role: p.role } : {}), faceConvention: { outside: 'negativeZ', inside: 'positiveZ' },
        ...(rigid[p.id] ? { rigidWith: rigid[p.id] } : {}),
        regions });
    });
    const unresolvedEdges = [];
    c.panels.forEach(p => {
      p.regions.forEach(region => {
      const edges = edgeMap.get(region.outerPathId);
      edges.forEach((e, i) => {
        const binding = { segmentIds: ['s' + i] };
        const slit = c.slits.find(s => covers(e.a, e.b, edgeMap.get(s.pathId)));
        const fold = c.folds.find(f => [f.parentPanelId, f.childPanelId].includes(p.id) && collinear(e.a, e.b, f.axis.a, f.axis.b));
        const hole = holes.find(h => h.id === 'hole_2' && ['back', 'bottleTopLower'].includes(p.id) && [e.a, e.b].every(v => Math.abs(Math.hypot(v.x - h.cx, v.y - layout.grid.yBodyTop) - h.r) < TOLERANCE_MM));
        if (slit) { Object.assign(binding, { kind: 'slit', featureId: slit.id }); if (!slit.panelIds.includes(p.id)) slit.panelIds.push(p.id); }
        else if (hole) Object.assign(binding, { kind: 'cut', featureId: 'cut.' + hole.id });
        else if (fold) Object.assign(binding, { kind: 'fold', featureId: fold.id });
        else if (c.cuts.some(cut => edgeMap.has(cut.pathId) && covers(e.a, e.b, edgeMap.get(cut.pathId)))) {
          const cut = c.cuts.find(cut => edgeMap.has(cut.pathId) && covers(e.a, e.b, edgeMap.get(cut.pathId)));
          Object.assign(binding, { kind: 'cut', featureId: cut.id });
        }
        else if (id === 'R001' && edgeMap.get('cut.outline.path').some(s => segmentDistance(e.a, s.a, s.b) <= TOLERANCE_MM && segmentDistance(e.b, s.a, s.b) <= TOLERANCE_MM)) {
          Object.assign(binding, { kind: 'cut', featureId: 'cut.outline', source: { toleranceMm: TOLERANCE_MM, kind: 'legacy-sampled-boundary' } });
          notice('SAMPLED_BOUNDARY_TOLERANCE', 'panels.' + p.id + '.s' + i, 'Both endpoints lie within 0.002 mm of the same legacy sampled cut segment. Coordinates were preserved.');
        }
        else if (variant && edgeMap.get('cut.outline.path').some(s => segmentDistance(e.a, s.a, s.b) <= TOLERANCE_MM && segmentDistance(e.b, s.a, s.b) <= TOLERANCE_MM)) {
          // A legacy sampled corner/bridge not covered by an original Cut is
          // not evidence of a new manufacturing edge. Keep its provenance and
          // unresolved mechanical status; do not replace the source Cut.
          binding.kind = 'continuous'; binding.source = { kind: 'legacy-silhouette-partition', mechanicalMapping: 'unresolved' };
          notice('LEGACY_SILHOUETTE_BOUNDARY', 'panels.' + p.id + '.s' + i, 'Legacy 3D silhouette edge is not fully covered by original Cut coordinates; preserved without manufacturing repair.');
        }
        else {
          const sameRigid = c.panels.filter(q => q.id !== p.id && (rigid[p.id] === q.id || rigid[q.id] === p.id || (rigid[p.id] && rigid[p.id] === rigid[q.id])));
          if (p.regions.some(r => r !== region && covers(e.a, e.b, edgeMap.get(r.outerPathId))) || sameRigid.some(q => q.regions.some(r => covers(e.a, e.b, edgeMap.get(r.outerPathId))))) binding.kind = 'continuous';
          else {
            const midpoint = { x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2 };
            if (inside(midpoint, outline)) {
              // This is an existing polygon partition INSIDE uncut source paper,
              // not a new physical edge. Keep it continuous and explicitly flag
              // its incomplete mechanical mapping; do not invent a crease/cut.
              binding.kind = 'continuous'; binding.source = { kind: 'legacy-clipping-partition', mechanicalMapping: 'unresolved' };
              notice('LEGACY_PARTITION_BOUNDARY', 'panels.' + p.id + '.s' + i, 'Polygon partition lies inside uncut source paper; continuous boundary retained, mechanical mapping requires review.');
            } else { unresolvedEdges.push({ panelId: p.id, segmentId: 's' + i, a: e.a, b: e.b }); binding.kind = 'unresolved'; }
          }
        }
        region.boundaryBindings.push(binding);
      });
      });
    });
    // Some source slits extend past polygon boundaries; keep their associated
    // panel IDs by endpoint contact, without altering the original slit length.
    c.slits.forEach(s => {
      if (!s.panelIds.length) notice('UNMAPPED_SLIT', 'slits.' + s.id, 'No legacy panel boundary covers this source slit.');
    });
    unresolvedEdges.forEach(e => notice('UNMAPPED_BOUNDARY', 'panels.' + e.panelId + '.' + e.segmentId, 'Legacy edge is neither a proven Cut/Fold/Slit nor a rigid shared boundary.'));
    // Legacy relations lack contract-required contact patches/entry frames.
    // Preserve evidence separately, instead of silently claiming complete mapping.
    (legacy.adhesiveRelations || []).forEach(r => unresolvedRelations.push({ kind: 'glue', source: clone(r), missing: ['contactRegions', 'adhesiveThicknessMm', ...(r.fromFace === undefined ? ['faceSides'] : [])] }));
    (legacy.insertionRelations || []).forEach(r => unresolvedRelations.push({ kind: 'insertion', source: clone(r), missing: ['targetGeometry', 'entryFrame', 'clearance', 'seatDepth'] }));
    unresolvedRelations.forEach(r => notice('UNRESOLVED_RELATION', r.kind + '.' + r.source.id, 'Source relation retained outside executable contract; missing ' + r.missing.join(', ') + '.'));
    c.source.unresolvedRelations = clone(unresolvedRelations);
    const validation = validator.validate(c);
    return { contract: c, validation, diagnostics, unresolvedRelations, complete: validation.ok && diagnostics.length === 0 && validation.warnings.length === 0 };
  }
  return Object.freeze({ SUPPORTED, convert, fromLegacy });
});
