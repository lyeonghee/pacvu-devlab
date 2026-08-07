'use strict';

const S001_productPlacementPathApi = typeof require === 'function'
  ? require('./S001_product_cut_paths')
  : window;

function S001_getRotatedBoundsSize(bounds, rotation) {
  const angle = (Number(rotation) || 0) * Math.PI / 180;
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  return {
    width: bounds.width * cos + bounds.height * sin,
    height: bounds.width * sin + bounds.height * cos
  };
}

function S001_placeProducts(products, rules) {
  if (!products.length) throw new Error('At least one product is required.');
  const footprints = products.map(product => S001_getRotatedBoundsSize(product.cutBounds, product.rotation));
  const maxCutHeight = Math.max(...footprints.map(footprint => footprint.height));
  const contentWidth = footprints.reduce((sum, footprint) => sum + footprint.width, 0) +
    rules.productCutGap * Math.max(0, products.length - 1);
  const insertWidth = rules.edgeMarginLeft + contentWidth + rules.edgeMarginRight;
  const insertHeight = rules.topMargin + maxCutHeight + rules.bottomMargin;

  let cursorX = rules.edgeMarginLeft;
  const placements = products.map((product, index) => {
    const footprint = footprints[index];
    const x = cursorX;
    const y = rules.alignment === 'bottom'
      ? insertHeight - rules.bottomMargin - footprint.height
      : rules.topMargin;
    const centerX = x + footprint.width / 2;
    const centerY = y + footprint.height / 2;
    cursorX += footprint.width + rules.productCutGap;
    return Object.assign({}, product, {
      cutBounds: { x, y, width: footprint.width, height: footprint.height },
      cutPath: S001_productPlacementPathApi.S001_placeProductCutPath(
        product.cutPath,
        centerX,
        centerY,
        product.cutBounds.width,
        product.cutBounds.height,
        product.rotation
      ),
      placement: {
        x,
        y,
        centerX,
        centerY,
        rotation: product.rotation
      }
    });
  });

  return {
    insert: { width: insertWidth, height: insertHeight },
    contentBounds: { width: contentWidth, height: maxCutHeight },
    placements
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { S001_placeProducts };
if (typeof window !== 'undefined') window.S001_placeProducts = S001_placeProducts;
