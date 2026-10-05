'use strict';
// Read-only contract examples, NOT adapters or complete structure reconstructions.
// T001: two adjacent body patches around a real source crease (spec fold #5).
// T002: two patches around the real diagonal auto-lock hinge (3D a1/a2).
// Sample crop boundaries are continuous, not invented manufacturing cuts.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
function source(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function context(files) {
  const ctx = vm.createContext({ window: {} });
  files.forEach(file => vm.runInContext(source(file), ctx, { filename: file }));
  return ctx;
}
function example(structureId) {
  let a, b, dimensions, provenance;
  if (structureId === 'T001') {
    const file = 'structures/tuck/T001/T001_spec.js';
    const ctx = context([file]);
    const data = JSON.parse(vm.runInContext('JSON.stringify({spec:T001_getSpec({W:57,D:57,H:177}),line:T001_SOURCE_ELEMENTS.foldElements[5]})', ctx));
    const attr = key => Number(data.line.match(new RegExp(key + '="([^"]+)"'))[1]);
    const s = data.spec.source;
    const map = (x, y) => ({ x: (x - s.xGlueL) * s.unitToMm, y: (y - s.yTop) * s.unitToMm });
    a = map(attr('x1'), attr('y1')); b = map(attr('x2'), attr('y2'));
    dimensions = { W: data.spec.W, D: data.spec.D, H: data.spec.H };
    provenance = { file, symbol: 'T001_SOURCE_ELEMENTS.foldElements[5]', scope: 'body-crease-patches-only' };
  } else if (structureId === 'T002') {
    const file = 'structures/tuck/T002/T002_layout.js';
    const ctx = context([file]);
    const original3D = source('structures/tuck/T002/T002_3d.js');
    const readPoint = name => {
      const match = original3D.match(new RegExp('const ' + name + ' = mapper\\.point\\(([-\\d.]+), ([-\\d.]+)\\)'));
      if (!match) throw new Error('T002 source hinge not found: ' + name);
      return JSON.parse(vm.runInContext('JSON.stringify(T002_createReferenceMapper().point(' + Number(match[1]) + ',' + Number(match[2]) + '))', ctx));
    };
    a = readPoint('a1'); b = readPoint('a2');
    dimensions = JSON.parse(vm.runInContext('JSON.stringify(T002_REFERENCE_SIZE)', ctx));
    provenance = { file: 'structures/tuck/T002/T002_3d.js', symbol: 'buildContract: a1/a2', mapper: file, scope: 'diagonal-lock-crease-patches-only' };
  } else throw new Error('Unsupported fixture');
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const normal = { x: -(b.y - a.y) / length * 2, y: (b.x - a.x) / length * 2 };
  const offset = (p, sign) => ({ x: p.x + sign * normal.x, y: p.y + sign * normal.y });
  const ring = (id, points) => ({ id, partId: 'sheet', closed: true, start: points[0], segments: points.slice(1).concat([points[0]]).map((to, i) => ({ id: 'e' + i, type: 'line', to })) });
  const panel = (id, pathId) => ({ id, partId: 'sheet', faceConvention: { outside: 'negativeZ', inside: 'positiveZ' }, regions: [{ id: 'patch', outerPathId: pathId, holeIds: [], boundaryBindings: [
    { segmentIds: ['e0'], kind: 'fold', featureId: 'hinge' },
    { segmentIds: ['e1', 'e2', 'e3'], kind: 'continuous' }
  ] }] });
  return {
    schemaVersion: '1.0', structureId, units: 'mm',
    coordinates: { space: 'part-local-2d', x: 'right', y: 'down', origin: 'source-defined' },
    parameters: { dimensions, options: {} }, source: provenance,
    materials: [{ id: 'paper', kind: 'unspecified', thicknessMm: null }],
    parts: [{ id: 'sheet', materialId: 'paper', panelIds: ['parent', 'child'], source: provenance }],
    paths: [ring('parent-outline', [a, b, offset(b, 1), offset(a, 1)]), ring('child-outline', [b, a, offset(a, -1), offset(b, -1)]),
      { id: 'crease', partId: 'sheet', closed: false, start: a, segments: [{ id: 'axis', type: 'line', to: b }], source: provenance }],
    panels: [panel('parent', 'parent-outline'), panel('child', 'child-outline')],
    folds: [{ id: 'hinge', parentPanelId: 'parent', childPanelId: 'child', axis: { partId: 'sheet', a, b },
      segments: [{ pathId: 'crease' }], orientation: { positiveRotation: 'right-hand-about-a-to-b' },
      profile: { kind: structureId === 'T002' ? 'returnFold' : 'crease', thicknessAware: true, neutralAxis: 'material-defined' } }],
    cuts: [], holes: [], slits: [], perforations: [], layers: [], glues: [], insertions: [], bonds: []
  };
}
module.exports = { example };
