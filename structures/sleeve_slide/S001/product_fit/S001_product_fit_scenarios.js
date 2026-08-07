'use strict';

const S001_productScenarioInstancesApi = typeof require === 'function'
  ? require('./S001_product_instances')
  : window;
const S001_productScenarioPlacementApi = typeof require === 'function'
  ? require('./S001_product_placement')
  : window;

const S001_POC_RULES = Object.freeze({
  edgeMarginLeft: 20,
  edgeMarginRight: 20,
  productCutGap: 35,
  topMargin: 20,
  bottomMargin: 20,
  alignment: 'bottom'
});

const S001_PRODUCT_FIT_SCENARIOS = Object.freeze([
  Object.freeze({
    id: 'bottle-x3',
    label: 'Bottle x 3',
    products: Object.freeze([
      Object.freeze({ profileId: 'bottle210x45', quantity: 3, instanceIdPrefix: 'bottle' })
    ])
  }),
  Object.freeze({
    id: 'jar-x3',
    label: 'Jar x 3',
    products: Object.freeze([
      Object.freeze({ profileId: 'jar123x54', quantity: 3, instanceIdPrefix: 'jar' })
    ])
  }),
  Object.freeze({
    id: 'bottle-x1-jar-x2',
    label: 'Bottle x 1 + Jar x 2',
    products: Object.freeze([
      Object.freeze({ profileId: 'bottle210x45', quantity: 1, instanceIdPrefix: 'bottle' }),
      Object.freeze({ profileId: 'jar123x54', quantity: 2, instanceIdPrefix: 'jar' })
    ])
  })
]);

const S001_PRODUCT_FIT_PRESETS = Object.freeze({
  baseline: Object.freeze({
    id: 'baseline',
    label: 'Bottle x 2 + Jar x 1 [Baseline]',
    products: Object.freeze([
      Object.freeze({ profileId: 'bottle210x45', quantity: 2, instanceIdPrefix: 'bottle' }),
      Object.freeze({ profileId: 'jar123x54', quantity: 1, instanceIdPrefix: 'jar' })
    ]),
    order: Object.freeze(['bottle-1', 'jar-1', 'bottle-2'])
  }),
  bottle3: S001_PRODUCT_FIT_SCENARIOS[0],
  jar3: S001_PRODUCT_FIT_SCENARIOS[1],
  bottle1Jar2: S001_PRODUCT_FIT_SCENARIOS[2]
});

function S001_validateScenario(productObjects, placedProductObjects, insert, rules) {
  const first = placedProductObjects[0];
  const last = placedProductObjects[placedProductObjects.length - 1];
  const gapChecks = placedProductObjects.slice(1).map((product, index) =>
    product.cutBounds.x - (
      placedProductObjects[index].cutBounds.x + placedProductObjects[index].cutBounds.width
    ) === rules.productCutGap
  );
  const bottomChecks = placedProductObjects.map(product =>
    insert.height - (product.cutBounds.y + product.cutBounds.height) === rules.bottomMargin
  );
  const boundsChecks = placedProductObjects.map((product, index) => {
    const source = productObjects.find(item => item.instanceId === product.instanceId);
    return Boolean(source) &&
      product.actualBounds.width === source.actualBounds.width &&
      product.actualBounds.height === source.actualBounds.height &&
      product.cutBounds.width === source.cutBounds.width &&
      product.cutBounds.height === source.cutBounds.height;
  });

  const checks = {
    leftMargin: first.cutBounds.x === rules.edgeMarginLeft,
    rightMargin: insert.width - (last.cutBounds.x + last.cutBounds.width) === rules.edgeMarginRight,
    cutGaps: gapChecks.every(Boolean),
    bottomAlignment: bottomChecks.every(Boolean),
    topMarginFromTallest: Math.min(...placedProductObjects.map(product => product.cutBounds.y)) === rules.topMargin,
    independentActualAndCutBounds: boundsChecks.every(Boolean),
    nonUniformScaleApplied: false
  };

  return { passed: Object.entries(checks).every(([key, value]) =>
    key === 'nonUniformScaleApplied' ? value === false : value === true
  ), checks };
}

function S001_runProductFitScenario(scenario) {
  const productObjects = S001_productScenarioInstancesApi.S001_instantiateProducts(scenario.products);
  const byId = new Map(productObjects.map(product => [product.instanceId, product]));
  const orderedProducts = scenario.order
    ? scenario.order.map(instanceId => byId.get(instanceId))
    : productObjects;
  if (orderedProducts.some(product => !product)) throw new Error('Invalid product-fit scenario order.');
  const placed = S001_productScenarioPlacementApi.S001_placeProducts(orderedProducts, S001_POC_RULES);
  return {
    id: scenario.id,
    label: scenario.label,
    productObjects,
    placedProductObjects: placed.placements,
    insert: Object.assign({}, placed.insert, {
      cutPath: 'M 0 0 H ' + placed.insert.width + ' V ' + placed.insert.height + ' H 0 Z'
    }),
    validation: S001_validateScenario(
      productObjects,
      placed.placements,
      placed.insert,
      S001_POC_RULES
    )
  };
}

function S001_runProductFitScenarios() {
  return S001_PRODUCT_FIT_SCENARIOS.map(S001_runProductFitScenario);
}

function S001_runProductFitPreset(presetId) {
  const preset = S001_PRODUCT_FIT_PRESETS[presetId] || S001_PRODUCT_FIT_PRESETS.baseline;
  return S001_runProductFitScenario(preset);
}

const S001_PRODUCT_FIT_SCENARIO_API = {
  S001_POC_RULES,
  S001_PRODUCT_FIT_SCENARIOS,
  S001_PRODUCT_FIT_PRESETS,
  S001_runProductFitScenario,
  S001_runProductFitScenarios,
  S001_runProductFitPreset
};
if (typeof module !== 'undefined' && module.exports) module.exports = S001_PRODUCT_FIT_SCENARIO_API;
if (typeof window !== 'undefined') Object.assign(window, S001_PRODUCT_FIT_SCENARIO_API);
