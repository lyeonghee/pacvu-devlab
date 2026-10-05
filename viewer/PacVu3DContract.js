/* PacVu static manufacturing contract v1. No rendering or assembly sequencing.
 * Coordinates: mm, part-local XY (right/down), right-handed XYZ; +Z = X cross Y.
 * Face direction is explicit, independent of polygon winding or material index.
 * Closed paths include an explicit final segment back to start (no hidden edge).
 * Region boundaries cover every outer segment exactly once. Hole rims are cuts.
 * continuous means an internal patch boundary, never a cut wall or a crease.
 * Fold profile describes a hinge, not an animation angle/order or a physics solver.
 * Unknown physical values use null and produce warnings, never invented defaults.
 * validate() checks data/references, NOT intersections, collision, hole containment,
 * manufacturability, or whether a particular renderer supports a valid contract.
 *
 * Required root arrays: materials/parts/paths/cuts/folds/holes/slits/perforations/
 * panels/layers/glues/insertions/bonds (unused collections are []). IDs are unique
 * within each collection; region IDs are panel-local, segment IDs are path-local.
 * Panel.regions[] = {id, outerPathId, holeIds:[], boundaryBindings:[]}; regions
 * belong to the same rigid panel. Different moving patches need separate panels.
 * Boundary binding = {segmentIds:[], kind, featureId}; only continuous omits ID.
 * Panel.faceConvention = {outside:'negativeZ', inside:'positiveZ'} or the inverse.
 * Face = {panelId, side:'inside'|'outside'|'edge'}; edge also needs regionId and
 * segmentId. Winding never changes the semantic side. Hole edge faces are not v1.
 * Fold.profile = {kind, thicknessAware:boolean, neutralAxis:'material-defined'|
 * 'midplane'}; score/doubleScore require scoreDepthMm (null means unresolved),
 * doubleScore also needs spacingMm > 0. Source segments remain separate paths;
 * profile spacing must not be interpreted as permission to erase a spine panel.
 * Part is a sheet; cross-sheet Glue/Bond/Layer is legal, cross-sheet Fold is not.
 * Insertion endpoint kind = panel|hole|slit|pocket|gap. Hole/slit reference a
 * featureId; pocket/gap use an opposingFace, not a fabricated manufacturing cut.
 * Layer.members are ordered Face references, not rendering material indices.
 * Extra JSON metadata is retained/ignored; it cannot extend supported enum values.
 * Assembly timing, final pose, lock ordering and activation remain structure-owned.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PacVu3DContract = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '1.0';
  const COLLECTIONS = Object.freeze(['materials', 'parts', 'paths', 'cuts', 'folds',
    'holes', 'slits', 'perforations', 'panels', 'layers', 'glues', 'insertions', 'bonds']);
  const BOUNDARY_KINDS = Object.freeze(['cut', 'fold', 'slit', 'continuous']);
  const FACE_SIDES = Object.freeze(['inside', 'outside', 'edge']);
  const FOLD_PROFILES = Object.freeze(['crease', 'returnFold', 'score', 'doubleScore']);
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  const sequence = v => Array.isArray(v) ? v : [];
  const EPSILON = 1e-6;

  function validate(input) {
    const errors = [], warnings = [];
    const error = (path, code, message) => errors.push({ path, code, message });
    const warn = (path, code, message) => warnings.push({ path, code, message });
    const result = () => ({ ok: errors.length === 0, errors, warnings });
    // Reject non-JSON values before traversing the schema; never mutate the input.
    const ancestors = new Set();
    function json(v, p) {
      if (v === null || typeof v === 'string' || typeof v === 'boolean' || finite(v)) return;
      if (!object(v) && !Array.isArray(v)) return error(p, 'NON_JSON', 'Expected finite JSON data.');
      if (ancestors.has(v)) return error(p, 'CYCLE', 'Cyclic data is not serializable.');
      if (!Array.isArray(v) && Object.prototype.toString.call(v) !== '[object Object]') {
        return error(p, 'NON_JSON', 'Expected a plain data object.');
      }
      const proto = Object.getPrototypeOf(v);
      if (!Array.isArray(v) && proto && Object.getPrototypeOf(proto) !== null) {
        return error(p, 'NON_JSON', 'Class instances are not contract data.');
      }
      ancestors.add(v);
      Reflect.ownKeys(v).forEach(k => {
        if (Array.isArray(v) && k === 'length') return;
        const d = Object.getOwnPropertyDescriptor(v, k);
        if (typeof k === 'symbol' || !d.enumerable || !('value' in d)) error(p, 'NON_JSON', 'No symbols, accessors or hidden fields.');
        else json(d.value, p + '.' + k);
      });
      if (Array.isArray(v)) for (let i = 0; i < v.length; i++) {
        if (!Object.hasOwn(v, i)) error(p + '[' + i + ']', 'NON_JSON', 'Sparse arrays are not supported.');
      }
      ancestors.delete(v);
    }
    json(input, '$');
    if (errors.length) return result();
    if (!object(input)) { error('$', 'TYPE', 'Expected a contract object.'); return result(); }
    const c = input, maps = {}, lists = {};
    const enumValue = (v, values, p) => {
      if (!values.includes(v)) error(p, 'ENUM', 'Expected ' + values.join(' | ') + '.');
    };
    const number = (v, p, min = 0, exclusive = false) => {
      if (!finite(v) || (exclusive ? v <= min : v < min)) error(p, 'NUMBER', 'Invalid numeric value.');
    };
    const point = (v, p, dims = ['x', 'y']) => {
      if (!object(v) || dims.some(k => !finite(v[k]))) { error(p, 'POINT', 'Expected finite coordinates: ' + dims.join(', ') + '.'); return false; }
      return true;
    };
    const array = (v, p, nonempty = false) => {
      if (!Array.isArray(v) || (nonempty && !v.length)) { error(p, 'ARRAY', 'Expected ' + (nonempty ? 'nonempty ' : '') + 'array.'); return []; }
      return v;
    };
    const ref = (group, id, p) => {
      const v = typeof id === 'string' && maps[group].get(id);
      if (!v) error(p, 'REFERENCE', 'Unknown ' + group + ' ID: ' + String(id));
      return v;
    };
    const samePart = (a, b, p) => { if (a && b && a.partId !== b.partId) error(p, 'PART_MISMATCH', 'References must belong to the same part.'); };
    const unique = (values, p) => { if (new Set(values).size !== values.length) error(p, 'DUPLICATE', 'Duplicate reference.'); };
    enumValue(c.schemaVersion, [VERSION], '$.schemaVersion');
    if (typeof c.structureId !== 'string' || !c.structureId.trim()) error('$.structureId', 'ID', 'Structure ID is required.');
    enumValue(c.units, ['mm'], '$.units');
    const coords = c.coordinates || {};
    enumValue(coords.space, ['part-local-2d'], '$.coordinates.space');
    enumValue(coords.x, ['right'], '$.coordinates.x');
    enumValue(coords.y, ['down'], '$.coordinates.y');
    enumValue(coords.origin, ['source-defined'], '$.coordinates.origin');
    if (!object(c.parameters)) error('$.parameters', 'TYPE', 'Parameters are required.');
    else ['W', 'D', 'H'].forEach(k => number(c.parameters.dimensions?.[k], '$.parameters.dimensions.' + k, 0, true));
    COLLECTIONS.forEach(group => {
      maps[group] = new Map();
      lists[group] = array(c[group], '$.' + group, ['materials', 'parts', 'paths', 'panels'].includes(group));
      lists[group].forEach((v, i) => {
        const p = '$.' + group + '[' + i + ']';
        if (!object(v) || typeof v.id !== 'string' || !v.id.trim()) error(p, 'ID', 'Object with nonempty ID required.');
        else if (maps[group].has(v.id)) error(p + '.id', 'DUPLICATE_ID', 'Duplicate ID within collection.');
        else maps[group].set(v.id, v);
      });
    });
    const each = (group, fn) => lists[group].forEach((v, i) => { if (object(v)) fn(v, '$.' + group + '[' + i + ']'); });
    each('materials', (v, p) => {
      enumValue(v.kind, ['paperboard', 'corrugated', 'unspecified'], p + '.kind');
      if (v.thicknessMm === null) warn(p + '.thicknessMm', 'UNRESOLVED', 'Thickness remains unknown.');
      else number(v.thicknessMm, p + '.thicknessMm', 0, true);
    });
    each('parts', (v, p) => {
      ref('materials', v.materialId, p + '.materialId');
      const ids = array(v.panelIds, p + '.panelIds', true); unique(ids, p + '.panelIds');
      ids.forEach((id, i) => { const panel = ref('panels', id, p + '.panelIds[' + i + ']'); if (panel && panel.partId !== v.id) error(p, 'PART_MISMATCH', 'Panel belongs to a different part.'); });
    });
    const endEqual = (a, b) => a && b && Math.hypot(a.x - b.x, a.y - b.y) <= EPSILON;
    each('paths', (v, p) => {
      ref('parts', v.partId, p + '.partId'); point(v.start, p + '.start');
      if (typeof v.closed !== 'boolean') error(p + '.closed', 'TYPE', 'Boolean required.');
      const segments = array(v.segments, p + '.segments', true), ids = [];
      segments.forEach((s, i) => {
        const q = p + '.segments[' + i + ']';
        if (!object(s)) { error(q, 'TYPE', 'Segment object required.'); return; }
        if (typeof s.id !== 'string' || !s.id.trim()) error(q + '.id', 'ID', 'Segment ID required.');
        ids.push(s.id); point(s.to, q + '.to');
        enumValue(s.type, ['line', 'quadratic', 'cubic', 'arc'], q + '.type');
        if (s.type === 'quadratic') point(s.control, q + '.control');
        if (s.type === 'cubic') { point(s.control1, q + '.control1'); point(s.control2, q + '.control2'); }
        if (s.type === 'arc') {
          number(s.rx, q + '.rx', 0, true); number(s.ry, q + '.ry', 0, true);
          if (!finite(s.rotationDeg)) error(q + '.rotationDeg', 'NUMBER', 'Finite SVG arc rotation required.');
          ['largeArc', 'sweep'].forEach(k => { if (typeof s[k] !== 'boolean') error(q + '.' + k, 'TYPE', 'Boolean required.'); });
        }
      });
      unique(ids, p + '.segments');
      if (v.closed && !endEqual(segments.at(-1)?.to, v.start)) error(p, 'OPEN_RING', 'Closed path must explicitly end at start.');
      if (v.closed && segments.every(s => s?.type === 'line') && object(v.start)) {
        const points = [v.start, ...segments.map(s => s.to)];
        if (points.every(a => object(a) && finite(a.x) && finite(a.y))) {
          const area = points.slice(1).reduce((sum, b, i) => sum + points[i].x * b.y - b.x * points[i].y, 0);
          if (Math.abs(area) <= EPSILON * EPSILON) error(p, 'DEGENERATE_RING', 'Linear region has zero signed area.');
        }
      }
    });
    const featurePath = (v, p, key, closed) => {
      ref('parts', v.partId, p + '.partId');
      const path = ref('paths', v[key], p + '.' + key); samePart(v, path, p);
      if (path && closed !== undefined && path.closed !== closed) error(p + '.' + key, 'PATH_KIND', closed ? 'Closed path required.' : 'Open path required.');
      return path;
    };
    each('cuts', (v, p) => { enumValue(v.kind, ['outer', 'internal'], p + '.kind'); featurePath(v, p, 'pathId'); });
    ['holes', 'slits', 'perforations'].forEach(group => each(group, (v, p) => {
      featurePath(v, p, group === 'holes' ? 'boundaryPathId' : 'pathId', group === 'holes' ? true : group === 'slits' ? false : undefined);
      array(v.panelIds, p + '.panelIds', true).forEach(id => samePart(v, ref('panels', id, p + '.panelIds'), p));
      if (group === 'slits') number(v.kerfMm, p + '.kerfMm');
      if (group === 'perforations') {
        number(v.pattern?.cutMm, p + '.pattern.cutMm', 0, true);
        number(v.pattern?.tieMm, p + '.pattern.tieMm', 0, true);
      }
    }));
    const face = (v, p) => {
      if (!object(v)) { error(p, 'FACE', 'Face reference required.'); return; }
      const panel = ref('panels', v.panelId, p + '.panelId');
      enumValue(v.side, FACE_SIDES, p + '.side');
      // Edge faces identify a specific region boundary, never a material index.
      if (v.side === 'edge') {
        const region = sequence(panel?.regions).find(r => r?.id === v.regionId);
        const path = region && maps.paths.get(region.outerPathId);
        if (!sequence(path?.segments).some(s => s?.id === v.segmentId)) error(p, 'EDGE_REFERENCE', 'Edge face requires regionId and outer segmentId.');
      }
    };
    each('panels', (v, p) => {
      const part = ref('parts', v.partId, p + '.partId');
      if (part && !sequence(part.panelIds).includes(v.id)) error(p, 'PART_MEMBERSHIP', 'Part must list this panel.');
      const f = v.faceConvention || {};
      enumValue(f.outside, ['positiveZ', 'negativeZ'], p + '.faceConvention.outside');
      enumValue(f.inside, ['positiveZ', 'negativeZ'], p + '.faceConvention.inside');
      if (f.outside === f.inside) error(p + '.faceConvention', 'FACE_DIRECTION', 'Inside and outside must oppose each other.');
      const regions = array(v.regions, p + '.regions', true);
      unique(regions.map(r => r?.id), p + '.regions');
      regions.forEach((r, i) => {
        const q = p + '.regions[' + i + ']';
        if (!object(r)) { error(q, 'TYPE', 'Region object required.'); return; }
        if (typeof r.id !== 'string' || !r.id.trim()) error(q + '.id', 'ID', 'Region ID required.');
        const path = ref('paths', r.outerPathId, q + '.outerPathId'); samePart(v, path, q);
        if (path && !path.closed) error(q, 'PATH_KIND', 'Region outer path must be closed.');
        const holes = array(r.holeIds, q + '.holeIds'); unique(holes, q + '.holeIds');
        holes.forEach(id => {
          const h = ref('holes', id, q + '.holeIds'); samePart(v, h, q);
          if (h && !sequence(h.panelIds).includes(v.id)) error(q, 'HOLE_MEMBERSHIP', 'Hole must reference its panel.');
        });
        const covered = [];
        array(r.boundaryBindings, q + '.boundaryBindings', true).forEach((b, j) => {
          const z = q + '.boundaryBindings[' + j + ']';
          if (!object(b)) { error(z, 'TYPE', 'Boundary binding required.'); return; }
          enumValue(b.kind, BOUNDARY_KINDS, z + '.kind');
          array(b.segmentIds, z + '.segmentIds', true).forEach(id => {
            covered.push(id);
            if (!sequence(path?.segments).some(s => s?.id === id)) error(z, 'SEGMENT_REFERENCE', 'Unknown outer boundary segment.');
          });
          if (b.kind === 'continuous') {
            if (b.featureId !== undefined) error(z, 'CONTINUOUS_FEATURE', 'Continuous boundaries have no manufacturing feature.');
          } else if (BOUNDARY_KINDS.includes(b.kind)) {
            const feature = ref({ cut: 'cuts', fold: 'folds', slit: 'slits' }[b.kind], b.featureId, z + '.featureId');
            if (b.kind === 'fold') {
              if (feature && ![feature.parentPanelId, feature.childPanelId].includes(v.id)) error(z, 'FOLD_MEMBERSHIP', 'Fold does not connect this panel.');
            } else {
              samePart(v, feature, z);
              if (b.kind === 'slit' && feature && !sequence(feature.panelIds).includes(v.id)) error(z, 'FEATURE_MEMBERSHIP', 'Slit does not belong to this panel.');
            }
          }
        });
        unique(covered, q + '.boundaryBindings');
        if (sequence(path?.segments).some(s => !covered.includes(s?.id))) error(q, 'UNCOVERED_BOUNDARY', 'Every outer segment needs one boundary kind.');
      });
      if (v.rigidWith !== undefined) { const other = ref('panels', v.rigidWith, p + '.rigidWith'); samePart(v, other, p); if (v.rigidWith === v.id) error(p, 'SELF_REFERENCE', 'Panel cannot be rigid with itself.'); }
    });
    const parents = new Map();
    each('folds', (v, p) => {
      const parent = ref('panels', v.parentPanelId, p + '.parentPanelId');
      const child = ref('panels', v.childPanelId, p + '.childPanelId'); samePart(parent, child, p);
      if (v.parentPanelId === v.childPanelId) error(p, 'SELF_REFERENCE', 'Fold must connect distinct panels.');
      if (parents.has(v.childPanelId)) error(p, 'MULTIPLE_PARENTS', 'Panel has more than one fold parent.');
      parents.set(v.childPanelId, v.parentPanelId);
      const a = v.axis || {};
      ref('parts', a.partId, p + '.axis.partId'); samePart(a, parent, p + '.axis');
      const pa = point(a.a, p + '.axis.a'), pb = point(a.b, p + '.axis.b');
      if (pa && pb && endEqual(a.a, a.b)) error(p + '.axis', 'ZERO_AXIS', 'Fold axis must have length.');
      enumValue(v.orientation?.positiveRotation, ['right-hand-about-a-to-b'], p + '.orientation.positiveRotation');
      const profile = v.profile || {};
      enumValue(profile.kind, FOLD_PROFILES, p + '.profile.kind');
      if (typeof profile.thicknessAware !== 'boolean') error(p + '.profile.thicknessAware', 'TYPE', 'Boolean required.');
      enumValue(profile.neutralAxis, ['material-defined', 'midplane'], p + '.profile.neutralAxis');
      if (profile.kind === 'doubleScore') number(profile.spacingMm, p + '.profile.spacingMm', 0, true);
      if (['score', 'doubleScore'].includes(profile.kind)) {
        if (profile.scoreDepthMm === null) warn(p + '.profile.scoreDepthMm', 'UNRESOLVED', 'Score depth remains unknown.');
        else number(profile.scoreDepthMm, p + '.profile.scoreDepthMm');
      }
      array(v.segments, p + '.segments', true).forEach((s, i) => {
        const path = ref('paths', s?.pathId, p + '.segments[' + i + '].pathId'); samePart(a, path, p);
        if (path?.closed) error(p + '.segments', 'PATH_KIND', 'Fold source segment must be open.');
      });
    });
    parents.forEach((_, child) => {
      const seen = new Set(); let id = child;
      while (parents.has(id)) { if (seen.has(id)) { error('$.folds', 'FOLD_CYCLE', 'Fold graph contains a cycle.'); break; } seen.add(id); id = parents.get(id); }
    });
    each('layers', (v, p) => {
      enumValue(v.kind, ['stack', 'laminate'], p + '.kind');
      const members = array(v.members, p + '.members', true); members.forEach((f, i) => face(f, p + '.members[' + i + ']'));
      face(v.referenceFace, p + '.referenceFace'); number(v.clearanceMm, p + '.clearanceMm');
    });
    each('glues', (v, p) => {
      face(v.from, p + '.from'); face(v.to, p + '.to'); enumValue(v.joint, ['lap', 'butt', 'laminate'], p + '.joint');
      ['from', 'to'].forEach(k => {
        const region = v.regions?.[k]; enumValue(region?.kind, ['whole-face', 'path'], p + '.regions.' + k + '.kind');
        if (region?.kind === 'path') {
          const path = ref('paths', region.pathId, p + '.regions.' + k + '.pathId');
          samePart(path, maps.panels.get(v[k]?.panelId), p);
          if (path && !path.closed) error(p, 'PATH_KIND', 'Glue area must be closed.');
        }
      });
      if (v.adhesiveThicknessMm === null) warn(p + '.adhesiveThicknessMm', 'UNRESOLVED', 'Adhesive thickness remains unknown.');
      else number(v.adhesiveThicknessMm, p + '.adhesiveThicknessMm');
    });
    each('insertions', (v, p) => {
      ['moving', 'target'].forEach(k => {
        const endpoint = v[k] || {}, panel = ref('panels', endpoint.panelId, p + '.' + k + '.panelId');
        enumValue(endpoint.kind, ['panel', 'hole', 'slit', 'pocket', 'gap'], p + '.' + k + '.kind');
        if (['hole', 'slit'].includes(endpoint.kind)) {
          const feature = ref(endpoint.kind === 'hole' ? 'holes' : 'slits', endpoint.featureId, p + '.' + k + '.featureId'); samePart(panel, feature, p);
          if (feature && !sequence(feature.panelIds).includes(endpoint.panelId)) error(p, 'FEATURE_MEMBERSHIP', 'Insertion feature does not belong to panel.');
        }
        if (['pocket', 'gap'].includes(endpoint.kind)) face(endpoint.opposingFace, p + '.' + k + '.opposingFace');
      });
      enumValue(v.entryFrame?.space, ['target-panel-local'], p + '.entryFrame.space');
      point(v.entryFrame?.origin, p + '.entryFrame.origin', ['x', 'y', 'z']);
      const d = v.entryFrame?.direction;
      if (point(d, p + '.entryFrame.direction', ['x', 'y', 'z']) && Math.abs(Math.hypot(d.x, d.y, d.z) - 1) > EPSILON) error(p, 'DIRECTION', 'Insertion direction must be a unit vector.');
      number(v.clearance?.lateralMm, p + '.clearance.lateralMm'); number(v.clearance?.thicknessMm, p + '.clearance.thicknessMm'); number(v.seat?.depthMm, p + '.seat.depthMm');
    });
    each('bonds', (v, p) => {
      const glue = ref('glues', v.glueId, p + '.glueId');
      ref('panels', v.leader?.panelId, p + '.leader.panelId'); ref('panels', v.follower?.panelId, p + '.follower.panelId');
      if (v.leader?.panelId === v.follower?.panelId) error(p, 'SELF_REFERENCE', 'Bond endpoints must differ.');
      if (glue && ![v.leader?.panelId, v.follower?.panelId].every(id => [glue.from?.panelId, glue.to?.panelId].includes(id))) error(p, 'BOND_ENDPOINTS', 'Bond endpoints must match glue endpoints.');
      enumValue(v.constraint?.kind, ['fixed-relative-transform'], p + '.constraint.kind');
      enumValue(v.constraint?.reference, ['structure-supplied'], p + '.constraint.reference');
    });
    return result();
  }

  function assertValid(contract) {
    const result = validate(contract);
    if (!result.ok) {
      const error = new Error('Invalid PacVu3DContract: ' + result.errors.map(e => e.path + ' ' + e.code).join('; '));
      error.name = 'PacVu3DContractValidationError'; error.result = result; throw error;
    }
    return contract;
  }
  return Object.freeze({ SCHEMA_VERSION: VERSION, COLLECTIONS, BOUNDARY_KINDS, FACE_SIDES, FOLD_PROFILES, validate, assertValid });
});
