'use strict';
// Real source builders in an isolated VM; no renderer, UI or source rewriting.
// Clipper is the existing Layout dependency, not an adapter dependency.
// Set PACVU_CLIPPER_PATH when clipper-lib is not installed next to the repository.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
function loadRuntime(options = {}) {
  const clipperPath = process.env.PACVU_CLIPPER_PATH || require.resolve('clipper-lib');
  const ctx = vm.createContext({ console, navigator: { userAgent: 'node-contract-test' }, document: { readyState: 'loading', addEventListener() {}, getElementById() { return null; } } });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(clipperPath, 'utf8'), ctx, { filename: clipperPath });
  for (const file of [
    'structures/tuck/T001/T001_spec.js', 'structures/tuck/T001/T001_layout.js',
    'structures/tuck/common/Tuck2DVisualCommon.js',
    'viewer/PacVuPhysicalPaper3D.js', // T001's existing polygon helper dependency only.
    'structures/tuck/T001/T001_3d_test.js',
    'structures/tuck/T002/T002_spec.js', 'structures/tuck/T002/T002_layout.js',
    'structures/tuck/T002/T002_renderer.js', 'structures/tuck/T002/T002_3d.js'
  ]) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
  if (options.extended) {
    for (const id of ['T003', 'T004', 'T005', 'T007', 'T008', 'T009']) {
      if (id === 'T007') vm.runInContext(fs.readFileSync(path.join(root, 'structures/tuck/T007/T007_source.js'), 'utf8'), ctx);
      for (const suffix of ['spec', 'layout', 'renderer', '3d']) {
        const file = 'structures/tuck/' + id + '/' + id + '_' + suffix + '.js';
        vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
      }
    }
    for (const file of ['shared/PacVuShippingCommon.js', 'structures/shipping/rsc/R001/R001_spec.js', 'structures/shipping/rsc/R001/R001_layout.js', 'structures/shipping/rsc/R001/R001_3d.js']) {
      vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
    }
    if (options.svgPathFactory) ctx.document.createElementNS = options.svgPathFactory;
  }
  return ctx;
}
module.exports = { loadRuntime };
