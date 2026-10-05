'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntime } = require('./PacVu3DContractAdapter.runtime.cjs');
const adapter = require('../PacVu3DContractAdapter.js');
const contract = require('../PacVu3DContract.js');
// Node SVG measurement substitute for R001's existing DOM path API. Production
// continues to use the real browser SVGPathElement; no source is monkey-patched.
const { svgPathProperties } = require(process.env.PACVU_SVG_PATH_PROPERTIES || 'svg-path-properties');
const runtime = loadRuntime({ extended: true, svgPathFactory() {
  let path;
  return { setAttribute(name, d) { assert.equal(name, 'd'); path = new svgPathProperties(d); }, getTotalLength() { return path.getTotalLength(); }, getPointAtLength(t) { return path.getPointAtLength(t); } };
} });
const plain = value => JSON.parse(JSON.stringify(value));
const sizes = { T003: [86.5, 86.5, 296], T004: [130, 65, 190], T005: [286, 90, 344], T007: [110, 80, 225], T008: [80, 52, 216], T009: [99, 59, 256], R001: [285, 170, 120] };
const build = (id, input) => id === 'R001' ? runtime.R001_3D_MASTER.buildContract(input) : runtime[id + '_3D_BUILD_CONTRACT'](input);
const area = points => Math.abs(points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p.x * q.y - q.x * p.y; }, 0) / 2);
function check(report) {
  assert.equal(report.validation.ok, true, JSON.stringify(report.validation.errors));
  assert.equal(contract.validate(plain(report.contract)).ok, true);
  assert.ok(!report.diagnostics.some(d => /UNMAPPED/.test(d.code)), JSON.stringify(report.diagnostics));
  assert.equal(report.complete, false); // physical properties/relations remain unresolved
  return report.contract;
}
for (const [id, size] of Object.entries(sizes)) {
  for (const scales of [[1, 1, 1], [1.1, 0.9, 1.2], [0.9, 1.1, 0.85]]) {
    const input = Object.fromEntries(['W', 'D', 'H'].map((key, i) => [key, size[i] * scales[i]]));
    test(id + ' source conversion ' + scales.join('/'), () => {
      const source = build(id, input), before = JSON.stringify(source);
      const report = adapter.fromLegacy(id, source, input, runtime), c = check(report);
      assert.equal(JSON.stringify(source), before);
      assert.equal(c.panels.length, source.panels.length);
      assert.equal(c.folds.length, (source.folds || source.foldRelations).length);
      source.panels.forEach(p => {
        const converted = c.panels.find(q => q.id === p.id);
        assert.equal(converted.regions.length, 1 + (p.patches || []).length);
        [p.polygon, ...(p.patches || [])].forEach((polygon, i) => {
          const path = c.paths.find(q => q.id === converted.regions[i].outerPathId);
          const points = [path.start, ...path.segments.map(s => s.to)];
          assert.ok(Math.abs(area(points) - area(polygon)) < 1e-5, p.id + ' source area changed');
          polygon.forEach(q => assert.ok(points.some(v => Math.hypot(v.x - q.x, v.y - q.y) < 1e-7), p.id + ' vertex lost'));
        });
      });
      (source.folds || source.foldRelations).forEach(f => {
        assert.deepEqual(c.folds.find(q => q.id === f.id).axis, { partId: 'sheet', ...plain(f.axis || { a: f.a, b: f.b }) });
      });
      assert.deepEqual(check(adapter.convert(id, input, runtime)), c);
    });
  }
}
test('T003 configurable hole and rigid relief panel ownership', () => {
  for (const cfg of [{ bottleNeckHoleEnabled: false }, { bottleNeckHoleEnabled: true, bottleNeckHoleDia: 28 }]) {
    const c = check(adapter.convert('T003', cfg, runtime));
    assert.equal(c.holes.length, cfg.bottleNeckHoleEnabled ? 1 : 0);
    if (cfg.bottleNeckHoleEnabled) assert.equal(c.paths.find(p => p.id === c.holes[0].boundaryPathId).segments[0].rx, 14);
    assert.equal(c.panels.find(p => p.id === 'upperTuckReliefLeft').rigidWith, 'lidTop');
  }
});
test('T005 capsule intact/open states do not fabricate perforation pattern', () => {
  for (const cfg of [{ capsulePunchEnabled: false }, { capsulePunchEnabled: true }, { capsulePunchEnabled: true, capsuleTorn: true }]) {
    const report = adapter.convert('T005', cfg, runtime), c = check(report);
    assert.equal(c.holes.length, cfg.capsuleTorn ? 1 : 0);
    assert.equal(c.perforations.length, 0);
    assert.equal(c.source.unresolvedFeatures.length, cfg.capsulePunchEnabled ? 1 : 0);
    assert.equal(c.source.unresolvedFeatures[0]?.kind, cfg.capsulePunchEnabled ? 'perforation' : undefined);
  }
});
test('T007 option combinations retain perforation and local fold source paths', () => {
  for (const tearOffEnabled of [false, true]) for (const liftTabsEnabled of [false, true]) {
    const cfg = { tearOffEnabled, liftTabsEnabled }, source = build('T007', cfg);
    const c = check(adapter.fromLegacy('T007', source, cfg, runtime));
    assert.equal(c.source.unresolvedFeatures.filter(f => f.kind === 'perforation').length, source.layout.perforationElements.length);
    assert.equal(c.source.unresolvedFeatures.filter(f => f.kind === 'fold').length, source.layout.liftFold.length);
    assert.equal(c.source.presentationOpenings.length, tearOffEnabled ? 1 : 0);
    assert.equal(c.holes.length, 0, 'renderer overlay hole is not removed manufacturing paper');
    assert.equal(c.panels.find(p => p.id === 'front').regions[0].holeIds.length, 0);
  }
});
test('T008 keeps rabbit cuts separate from stitched fill', () => {
  const c = check(adapter.convert('T008', {}, runtime));
  assert.equal(c.paths.find(p => p.id === 'cut.outline.path').source.kind, 'stitched-fill-only');
  assert.ok(!c.cuts.some(p => p.pathId === 'cut.outline.path'));
  assert.equal(c.cuts.length, build('T008', {}).layout.cutElements.length);
});
test('R001 retains true SVG arc parameters, not sampled manufacturing curves', () => {
  const c = check(adapter.convert('R001', {}, runtime));
  const arcs = c.paths.find(p => p.id === 'cut.outline.path').segments.filter(s => s.type === 'arc');
  assert.equal(arcs.length, 6); assert.ok(arcs.every(s => s.rx === 2.5 && s.ry === 2.5));
  assert.equal(c.source.builder, 'R001_3D_MASTER.buildContract');
});
test('additional panel patches map to separate regions without lost area', () => {
  const source = build('T005', {});
  const panels = source.panels.map((p, i) => i ? p : { ...p, patches: [p.polygon] });
  const c = check(adapter.fromLegacy('T005', { ...source, panels }, {}, runtime));
  assert.equal(c.panels[0].regions.length, 2);
});
test('only the 25 independent structures are registered; unknown IDs remain rejected', () => {
  const ids = ['T011', 'GA002', 'S002', 'RRP'];
  assert.equal(adapter.SUPPORTED.length, 25);
  ids.forEach(id => assert.throws(() => adapter.convert(id, {}, runtime), /unsupported structure/));
});
test('missing sources, recipe changes and nonfinite values are not silently accepted', () => {
  assert.throws(() => adapter.convert('T003', {}, { ...runtime, T003_resolveHoles: undefined }), /missing source dependency/);
  const source = build('T004', {});
  assert.throws(() => adapter.fromLegacy('T004', { ...source, folds: [] }, {}, runtime), /recipe changed/);
  assert.throws(() => adapter.convert('T008', { H: Infinity }, runtime), /invalid dimension/);
});
