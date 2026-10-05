'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('../PacVu3DContract.js');
const { example } = require('./PacVu3DContract.fixtures.cjs');
const valid = c => { const r = api.validate(c); assert.equal(r.ok, true, JSON.stringify(r.errors)); return r; };
const reject = (edit, code) => {
  const c = example('T001'); edit(c); const r = api.validate(c);
  assert.equal(r.ok, false); assert.ok(r.errors.some(e => e.code === code), JSON.stringify(r));
  assert.ok(r.errors.every(e => e.path && e.message));
};
for (const id of ['T001', 'T002']) test(id + ' real source hinge sample; input unchanged', () => {
  const c = example(id), before = JSON.stringify(c), r = valid(c);
  assert.equal(r.warnings.length, 1); assert.equal(r.warnings[0].code, 'UNRESOLVED');
  assert.equal(api.assertValid(c), c); assert.equal(JSON.stringify(c), before);
  if (id === 'T002') { assert.notEqual(c.folds[0].axis.a.x, c.folds[0].axis.b.x); assert.equal(c.folds[0].profile.kind, 'returnFold'); }
});
test('browser global export without DOM or THREE', () => {
  const ctx = vm.createContext({}); vm.runInContext(fs.readFileSync(require.resolve('../PacVu3DContract.js'), 'utf8'), ctx);
  assert.equal(ctx.PacVu3DContract.validate(example('T001')).ok, true);
});
test('multiple regions and reversed winding do not redefine face direction', () => {
  const c = example('T001'); const path = structuredClone(c.paths[0]); path.id = 'extra';
  const points = [path.start, ...path.segments.slice(0, -1).map(s => s.to)].reverse().map(p => ({ x: p.x + 10, y: p.y }));
  path.start = points[0]; path.segments = points.slice(1).concat([points[0]]).map((to, i) => ({ id: 'e' + i, type: 'line', to })); c.paths.push(path);
  c.panels[0].regions.push({ id: 'extra', outerPathId: 'extra', holeIds: [], boundaryBindings: [{ segmentIds: ['e0', 'e1', 'e2', 'e3'], kind: 'continuous' }] }); valid(c);
});
const cases = [
  ['empty physical contract', c => api.COLLECTIONS.forEach(k => c[k] = []), 'ARRAY'],
  ['missing regions', c => delete c.panels[0].regions, 'ARRAY'],
  ['empty regions', c => c.panels[0].regions = [], 'ARRAY'],
  ['open outer ring', c => c.paths[0].segments[3].to = { x: 0, y: 0 }, 'OPEN_RING'],
  ['unknown boundary kind', c => c.panels[0].regions[0].boundaryBindings[0].kind = 'perforation', 'ENUM'],
  ['uncovered boundary', c => c.panels[0].regions[0].boundaryBindings.pop(), 'UNCOVERED_BOUNDARY'],
  ['duplicate boundary', c => c.panels[0].regions[0].boundaryBindings[1].segmentIds.push('e0'), 'DUPLICATE'],
  ['unknown segment', c => c.panels[0].regions[0].boundaryBindings[0].segmentIds = ['absent'], 'SEGMENT_REFERENCE'],
  ['continuous cannot cut', c => c.panels[0].regions[0].boundaryBindings[1].featureId = 'cut', 'CONTINUOUS_FEATURE'],
  ['face sides must oppose', c => c.panels[0].faceConvention.inside = 'negativeZ', 'FACE_DIRECTION'],
  ['material index is not face direction', c => c.panels[0].faceConvention.outside = 0, 'ENUM'],
  ['unknown profile', c => c.folds[0].profile.kind = 'autoLock', 'ENUM'],
  ['thickness flag required', c => delete c.folds[0].profile.thicknessAware, 'TYPE'],
  ['unknown neutral axis', c => c.folds[0].profile.neutralAxis = 'guessed', 'ENUM'],
  ['double score spacing required', c => c.folds[0].profile = { kind: 'doubleScore', thicknessAware: true, neutralAxis: 'material-defined', scoreDepthMm: null }, 'NUMBER'],
  ['zero hinge', c => c.folds[0].axis.b = c.folds[0].axis.a, 'ZERO_AXIS'],
  ['rotation convention required', c => delete c.folds[0].orientation, 'ENUM'],
  ['broken reference', c => c.panels[0].partId = 'missing', 'REFERENCE'],
  ['duplicate ID', c => c.paths.push(c.paths[0]), 'DUPLICATE_ID'],
  ['fold cycle', c => c.folds.push({ ...c.folds[0], id: 'reverse', parentPanelId: 'child', childPanelId: 'parent' }), 'FOLD_CYCLE'],
  ['negative paper thickness', c => c.materials[0].thicknessMm = -1, 'NUMBER'],
  ['unsupported version', c => c.schemaVersion = '2.0', 'ENUM'],
  ['unsupported unit', c => c.units = 'px', 'ENUM'],
  ['zero size', c => c.parameters.dimensions.W = 0, 'NUMBER'],
  ['nonfinite coordinate', c => c.paths[0].start.x = Infinity, 'NON_JSON'],
  ['function data', c => c.assembly = () => {}, 'NON_JSON'],
  ['cyclic object', c => c.self = c, 'CYCLE'],
  ['class instance', c => c.extra = new (class Runtime {})(), 'NON_JSON'],
  ['getter never executed', c => Object.defineProperty(c, 'danger', { enumerable: true, get() { throw new Error('must not execute'); } }), 'NON_JSON']
];
cases.forEach(([name, edit, code]) => test(name, () => reject(edit, code)));
test('all four fold profiles', () => {
  for (const kind of api.FOLD_PROFILES) { const c = example('T001'); Object.assign(c.folds[0].profile, { kind, spacingMm: 1, scoreDepthMm: 0.1 }); valid(c); }
});
function features() {
  const c = example('T001');
  // Synthetic feature examples exercise schema only; not T001 manufacturing claims.
  c.materials[0] = { id: 'paper', kind: 'paperboard', thicknessMm: 0.45 };
  const ring = structuredClone(c.paths[0]); ring.id = 'hole-ring'; c.paths.push(ring);
  c.cuts.push({ id: 'cut', partId: 'sheet', pathId: 'parent-outline', kind: 'outer' });
  c.panels[0].regions[0].boundaryBindings[1] = { kind: 'cut', featureId: 'cut', segmentIds: ['e1', 'e2', 'e3'] };
  c.holes.push({ id: 'hole', partId: 'sheet', boundaryPathId: 'hole-ring', panelIds: ['parent'] }); c.panels[0].regions[0].holeIds.push('hole');
  c.slits.push({ id: 'slit', partId: 'sheet', pathId: 'crease', panelIds: ['child'], kerfMm: 0 });
  c.perforations.push({ id: 'perf', partId: 'sheet', pathId: 'crease', panelIds: ['parent'], pattern: { cutMm: 3, tieMm: 1 } });
  const from = { panelId: 'parent', side: 'outside' }, to = { panelId: 'child', side: 'inside' };
  c.layers.push({ id: 'stack', kind: 'stack', members: [from, to], referenceFace: from, clearanceMm: 0 });
  c.glues.push({ id: 'glue', from, to, joint: 'lap', regions: { from: { kind: 'whole-face' }, to: { kind: 'whole-face' } }, adhesiveThicknessMm: 0 });
  c.bonds.push({ id: 'bond', glueId: 'glue', leader: { panelId: 'parent' }, follower: { panelId: 'child' }, constraint: { kind: 'fixed-relative-transform', reference: 'structure-supplied' } });
  c.insertions.push({ id: 'insert', moving: { kind: 'panel', panelId: 'parent' }, target: { kind: 'slit', panelId: 'child', featureId: 'slit' }, entryFrame: { space: 'target-panel-local', origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 } }, clearance: { lateralMm: 0, thicknessMm: 0 }, seat: { depthMm: 1 } });
  return c;
}
test('Cut/Hole/Slit/Perforation/Layer/Glue/Insertion/Bond schema', () => valid(features()));
test('invalid feature/face/bond/insertion references rejected', () => {
  for (const edit of [c => c.glues[0].from.side = 0, c => c.holes[0].boundaryPathId = 'crease', c => c.slits[0].kerfMm = -1,
    c => c.perforations[0].pattern.tieMm = 0, c => c.bonds[0].glueId = 'missing', c => c.insertions[0].entryFrame.direction.y = 0,
    c => c.layers[0].members[0] = { panelId: 'parent', side: 'edge', regionId: 'patch', segmentId: 'missing' }]) {
    const c = features(); edit(c); assert.equal(api.validate(c).ok, false);
  }
});
test('malformed nested values return diagnostics rather than throw', () => {
  const base = features(), paths = [];
  function walk(v, p) { if (v && typeof v === 'object') Object.keys(v).forEach(k => { const next = p.concat(k); paths.push(next); walk(v[k], next); }); }
  walk(base, []);
  for (const path of paths) for (const replacement of [null, 3, 'bad', [], {}]) {
    const c = structuredClone(base); let target = c;
    for (const k of path.slice(0, -1)) target = target[k]; target[path.at(-1)] = replacement;
    assert.doesNotThrow(() => api.validate(c), path.join('.'));
  }
});
test('assertValid exposes diagnostics', () => {
  assert.throws(() => api.assertValid({}), e => e.name === 'PacVu3DContractValidationError' && e.result.ok === false);
});
test('cross-sheet bond is legal but cross-sheet fold is rejected', () => {
  const c = features(); c.folds = [];
  c.parts[0].panelIds = ['parent']; c.parts.push({ id: 'second-sheet', materialId: 'paper', panelIds: ['child'] });
  c.panels[1].partId = 'second-sheet'; c.paths[1].partId = 'second-sheet';
  c.panels.forEach(p => p.regions[0].boundaryBindings = [{ segmentIds: ['e0', 'e1', 'e2', 'e3'], kind: 'continuous' }]);
  c.slits = []; c.insertions = []; valid(c);
  const fold = example('T001').folds[0]; c.folds.push(fold);
  assert.ok(api.validate(c).errors.some(e => e.code === 'PART_MISMATCH'));
});
test('curved paths retain control data and arc flags', () => {
  for (const segment of [
    { type: 'quadratic', control: { x: 0, y: 0 } },
    { type: 'cubic', control1: { x: 0, y: 0 }, control2: { x: 1, y: 1 } },
    { type: 'arc', rx: 1, ry: 2, rotationDeg: 0, largeArc: false, sweep: true }
  ]) {
    const c = example('T001'); Object.assign(c.paths[0].segments[1], segment); valid(c);
    if (segment.type === 'arc') c.paths[0].segments[1].rx = 0;
    else if (segment.type === 'cubic') delete c.paths[0].segments[1].control1;
    else delete c.paths[0].segments[1].control;
    assert.equal(api.validate(c).ok, false);
  }
});
