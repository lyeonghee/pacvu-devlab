'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { loadRuntime } = require('./PacVu3DContractAdapter.runtime.cjs');
const adapter = require('../PacVu3DContractAdapter.js');
const validator = require('../PacVu3DContract.js');
const runtime = loadRuntime();
const plain = value => JSON.parse(JSON.stringify(value));
const pass = report => {
  assert.equal(report.validation.ok, true, JSON.stringify(report.validation));
  assert.equal(validator.validate(report.contract).ok, true);
  assert.ok(!report.diagnostics.some(d => ['UNMAPPED_BOUNDARY', 'UNMAPPED_SLIT'].includes(d.code)), JSON.stringify(report.diagnostics));
  return report.contract;
};
const area = points => Math.abs(points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p.x * q.y - q.x * p.y; }, 0) / 2);
for (const [id, sizes] of [
  ['T001', [{ W: 57, D: 57, H: 177 }, { W: 40, D: 40, H: 100 }, { W: 120, D: 80, H: 220 }]],
  ['T002', [{ W: 126, D: 81, H: 308 }, { W: 100, D: 60, H: 240 }, { W: 160, D: 100, H: 350 }]]
]) {
  sizes.forEach(input => test(id + ' complete source panel conversion ' + JSON.stringify(input), () => {
    const source = runtime[id + '_3D_BUILD_CONTRACT'](input), before = JSON.stringify(source);
    const report = adapter.fromLegacy(id, source, input, runtime), c = pass(report);
    assert.equal(JSON.stringify(source), before, 'legacy source must not mutate');
    assert.deepEqual(c.parameters.dimensions, input);
    assert.equal(c.panels.length, id === 'T001' ? 14 : 19);
    assert.equal(c.folds.length, id === 'T001' ? 13 : 16);
    assert.equal(c.paths.filter(p => p.id.startsWith('source.fold.')).length, source.layout.foldElements.length);
    source.panels.forEach(p => {
      const panel = c.panels.find(x => x.id === p.id), path = c.paths.find(x => x.id === panel.regions[0].outerPathId);
      const points = [path.start, ...path.segments.map(s => s.to)];
      assert.ok(Math.abs(area(points) - area(p.polygon)) < 1e-6, p.id + ' area changed');
      p.polygon.forEach(q => assert.ok(points.some(v => Math.hypot(v.x - q.x, v.y - q.y) < 1e-8), p.id + ' source vertex lost'));
      assert.equal(panel.regions[0].boundaryBindings.length, path.segments.length);
    });
    (source.foldRelations || source.folds).forEach(f => assert.deepEqual(c.folds.find(x => x.id === f.id).axis, { partId: 'sheet', ...plain(f.axis) }));
    assert.equal(report.complete, false, 'data validation is not physical completeness');
    assert.equal(report.validation.warnings[0].code, 'UNRESOLVED');
  }));
}
test('convert calls real builder once and leaves supplied input unchanged', () => {
  let calls = 0;
  const input = Object.freeze({ W: 57, D: 57, H: 177 });
  const bridge = { ...runtime, T001_3D_BUILD_CONTRACT(cfg) { calls++; assert.notEqual(cfg, input); return runtime.T001_3D_BUILD_CONTRACT(cfg); } };
  pass(adapter.convert('T001', input, bridge)); assert.equal(calls, 1);
});
test('source cubic outline preserved without polygon replacement', () => {
  for (const id of ['T001', 'T002']) {
    const source = runtime[id + '_3D_BUILD_CONTRACT']({}), c = pass(adapter.fromLegacy(id, source, {}, runtime));
    const original = runtime.T001_parseAbsolutePath(source.layout.fillPath), converted = c.paths.find(p => p.id === 'cut.outline.path');
    assert.equal(converted.segments.length, original.segments.length);
    original.segments.forEach((s, i) => {
      assert.deepEqual(converted.segments[i].to, plain(s.to));
      if (s.type === 'C') { assert.deepEqual(converted.segments[i].control1, plain(s.c1)); assert.deepEqual(converted.segments[i].control2, plain(s.c2)); }
    });
  }
});
test('T001 internal bend is never relabelled as a manufactured crease', () => {
  const report = adapter.convert('T001', {}, runtime), c = pass(report);
  const bend = c.folds.find(f => f.id === 'bottom.back-bend');
  assert.equal(bend.source.kind, 'assembly-only');
  assert.equal(c.paths.find(p => p.id === bend.segments[0].pathId).source.manufactured, false);
  assert.ok(report.diagnostics.some(d => d.code === 'ASSEMBLY_ONLY_AXIS'));
});
test('T002 diagonal return folds and two separated neck crease segments retained', () => {
  const c = pass(adapter.convert('T002', {}, runtime));
  for (const id of ['bottom.triangleL', 'bottom.triangleR', 'top.back-bottleLower']) assert.equal(c.folds.find(f => f.id === id).profile.kind, 'returnFold');
  const fold = c.folds.find(f => f.id === 'top.back-bottleLower');
  assert.equal(fold.segments.length, 2);
  assert.notEqual(fold.segments[0].pathId, fold.segments[1].pathId);
});
test('T002 upper relief panels remain rigid with lidTop and preserve actual slits', () => {
  const c = pass(adapter.convert('T002', {}, runtime));
  ['upperTuckReliefLeft', 'upperTuckReliefRight'].forEach(id => {
    assert.equal(c.panels.find(p => p.id === id).rigidWith, 'lidTop');
    assert.ok(!c.folds.some(f => f.childPanelId === id));
  });
  assert.equal(c.slits.length, 4);
  c.slits.forEach(s => { assert.equal(s.kerfMm, 0); assert.ok(s.panelIds.length); });
});
test('T002 default circular hole and boundary notch are not double-subtracted', () => {
  const c = pass(adapter.convert('T002', {}, runtime));
  assert.equal(c.holes.length, 2);
  assert.deepEqual(c.panels.find(p => p.id === 'bottleTopUpper').regions[0].holeIds, ['hole_1']);
  for (const id of ['back', 'bottleTopLower']) assert.deepEqual(c.panels.find(p => p.id === id).regions[0].holeIds, []);
  assert.equal(c.holes.find(h => h.id === 'hole_2').source.representation, 'boundary-notches');
  assert.ok(c.panels.find(p => p.id === 'back').regions[0].boundaryBindings.some(b => b.featureId === 'cut.hole_2'));
});
for (const input of [
  { bottleTopHoleEnabled: false, neckHoleEnabled: false },
  { bottleTopHoleEnabled: true, neckHoleEnabled: false, bottleTopHoleDia: 40 },
  { bottleTopHoleEnabled: false, neckHoleEnabled: true, neckHoleDia: 16 },
  { bottleTopHoleDia: 45, neckHoleDia: 18 }
]) test('T002 hole options ' + JSON.stringify(input), () => {
  const c = pass(adapter.convert('T002', input, runtime));
  const source = runtime.T002_3D_BUILD_CONTRACT(input);
  const holes = runtime.T002_resolveHoles(source.layout, input);
  assert.deepEqual(c.holes.map(h => h.id), plain(holes.map(h => h.id)));
  holes.forEach(h => assert.equal(c.paths.find(p => p.id === 'hole.path.' + h.id).segments[0].rx, h.r));
});
test('source 2D/3D axis discrepancy is reported, not repaired', () => {
  const report = adapter.convert('T002', {}, runtime); pass(report);
  assert.ok(report.diagnostics.some(d => d.code === 'SOURCE_AXIS_MISMATCH' && d.path === 'folds.top.front-lid'));
});
test('source neck Y discrepancy remains visible', () => {
  const report = adapter.convert('T002', { neckHoleY: 3 }, runtime); pass(report);
  assert.ok(report.diagnostics.some(d => d.code === 'SOURCE_HOLE_MISMATCH'));
});
test('missing glue and insertion information is not fabricated', () => {
  for (const id of ['T001', 'T002']) {
    const report = adapter.convert(id, {}, runtime), c = pass(report);
    assert.equal(c.glues.length, 0); assert.equal(c.insertions.length, 0);
    assert.equal(report.unresolvedRelations.length, 3);
    assert.equal(report.complete, false);
    assert.deepEqual(c.source.unresolvedRelations, report.unresolvedRelations);
    assert.ok(c.folds.every(f => !('phase' in f) && !('angle' in f)));
  }
});
test('JSON round trip validates and output edits cannot mutate original', () => {
  const original = runtime.T002_3D_BUILD_CONTRACT({}), before = JSON.stringify(original);
  const c = pass(adapter.fromLegacy('T002', original, {}, runtime));
  assert.equal(validator.validate(plain(c)).ok, true);
  c.paths[0].segments[0].to.x = -999; c.source.unresolvedRelations[0].source.from = 'changed';
  assert.equal(JSON.stringify(original), before);
});
test('unsupported structures/missing dependencies/bad input fail explicitly', () => {
  assert.throws(() => adapter.convert('T011', {}, runtime), /unsupported structure/);
  assert.throws(() => adapter.convert('T001', {}, {}), /missing source dependency/);
  assert.throws(() => adapter.convert('T002', {}, { ...runtime, T002_resolveHoles: undefined }), /T002_resolveHoles/);
  for (const W of [0, -1, Infinity, 'bad']) assert.throws(() => adapter.convert('T001', { W }, runtime), /invalid dimension/);
  assert.throws(() => adapter.fromLegacy('T001', runtime.T002_3D_BUILD_CONTRACT({}), {}, runtime), /mismatch/);
});
test('source recipe changes and dimension mismatch cannot silently pass', () => {
  const source = runtime.T001_3D_BUILD_CONTRACT({});
  assert.throws(() => adapter.fromLegacy('T001', { ...source, foldRelations: [] }, {}, runtime), /recipe changed/);
  assert.throws(() => adapter.fromLegacy('T001', source, { W: 100 }, runtime), /dimensions differ/);
});
test('browser API works without viewer creation or script registration', () => {
  vm.runInContext(fs.readFileSync(require.resolve('../PacVu3DContract.js'), 'utf8'), runtime);
  vm.runInContext(fs.readFileSync(require.resolve('../PacVu3DContractAdapter.js'), 'utf8'), runtime);
  assert.equal(runtime.THREE, undefined);
  pass(runtime.PacVu3DContractAdapter.convert('T001', {}));
  pass(runtime.PacVu3DContractAdapter.convert('T002', {}));
});
