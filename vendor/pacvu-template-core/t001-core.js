/* Generated from the PacVu UserApp T001 Core. Do not edit. */
(function installPacVuT001Core(root) {
  const window = { ClipperLib: root.ClipperLib };
  const globalThis = window;
  const ClipperLib = root.ClipperLib;

/* export/PacVuExportHeader.js */
(function (root) {
  'use strict';

  const STANDARD = Object.freeze({
    id: 'PacVu Export Standard V1',
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    colors: Object.freeze({ ink: '#171b24', muted: '#7d899b', rule: '#dfe4eb', ready: '#159a61' }),
    layout: Object.freeze({ headerToPageWidth: 0.12, minHeaderHeight: 36, pageMinWidth: 297 }),
    labels: Object.freeze({
      eyebrow: 'PACVU \u00B7 EXPORT SPECIFICATION',
      subtitle: 'Production-ready dieline information',
      structure: 'STRUCTURE CODE & NAME',
      dimensions: 'WIDTH \u00D7 DEPTH \u00D7 HEIGHT',
      material: 'MATERIAL & THICKNESS',
      basis: 'DIMENSION BASIS',
      dieline: 'DIELINE SIZE',
      bleedSize: 'BLEED SIZE',
      options: 'SELECTED OPTIONS',
      ready: 'READY'
    }),
    legend: Object.freeze([
      { key: 'cut', label: 'CUT PATH', color: '#ef3e36' },
      { key: 'bleed', label: 'BLEED PATH', color: '#2867bd' },
      { key: 'fold', label: 'FOLD PATH', color: '#2867bd', dash: '5 4' },
      { key: 'punch', label: 'PUNCH PATH', color: '#299554' }
    ])
  });

  const registry = new Map();
  const number = value => Number.isFinite(+value) ? +value : 0;
  const round = value => String(Math.round(number(value) * 100) / 100);
  const escape = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function register(templateKey, resolver) {
    if (templateKey && typeof resolver === 'function') registry.set(String(templateKey).toUpperCase(), resolver);
  }

  function firstValue() {
    for (let index = 0; index < arguments.length; index += 1) {
      const value = arguments[index];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  function activeUnit(source) {
    return source && source.unit
      ? source.unit
      : (root.PacVuUnits ? root.PacVuUnits.getUnit() : 'mm');
  }

  function formatDimensions(cfg, unit) {
    if (root.PacVuUnits) {
      return [
        root.PacVuUnits.formatNumber(cfg.W, unit),
        root.PacVuUnits.formatNumber(cfg.D, unit),
        root.PacVuUnits.formatNumber(cfg.H, unit)
      ].join(' \u00D7 ') + ' ' + root.PacVuUnits.normalizeUnit(unit);
    }
    return [round(cfg.W), round(cfg.D), round(cfg.H)].join(' \u00D7 ') + ' mm';
  }

  function formatDielineSize(size, unit) {
    if (!Number.isFinite(+size.width) || !Number.isFinite(+size.height)) return '';
    if (root.PacVuUnits) return root.PacVuUnits.formatSize(size.width, size.height, unit);
    return [round(size.width), round(size.height)].join(' \u00D7 ') + ' mm';
  }

  function resolve(context) {
    const source = context || {};
    const cfg = source.cfg || {};
    const meta = source.meta || {};
    const code = String(meta.variantKey || meta.fefcoCode || source.templateKey || source.engineKey || '—').toUpperCase();
    const custom = registry.get(code);
    const bound = custom ? custom(source) || {} : {};
    const exportMeta = Object.assign({}, meta.export || {}, bound);
    const unit = activeUnit(source);
    const name = firstValue(exportMeta.name, meta.exportName, meta.label, meta.koreanName, code);
    const size = firstValue(exportMeta.dielineSize, source.dielineSize) || {};
    const bleedSize = firstValue(exportMeta.bleedSize, source.bleedSize) || {};
    const options = Array.isArray(exportMeta.options) ? exportMeta.options : [];
    return {
      standard: STANDARD.id,
      code,
      name,
      title: firstValue(exportMeta.title, code + ' / ' + name),
      subtitle: firstValue(exportMeta.subtitle, STANDARD.labels.subtitle),
      unit,
      dimensions: firstValue(exportMeta.dimensions, formatDimensions(cfg, unit)),
      material: firstValue(exportMeta.material, meta.material, '—'),
      dimensionBasis: firstValue(exportMeta.dimensionBasis, meta.dimensionBasis, '—'),
      dielineSize: firstValue(exportMeta.dielineSizeText, formatDielineSize(size, unit), '—'),
      bleedSize: firstValue(exportMeta.bleedSizeText, formatDielineSize(bleedSize, unit), '—'),
      options: options.length ? options.join('  \u00B7  ') : '—',
      status: firstValue(exportMeta.status, meta.exportStatus, STANDARD.labels.ready),
      extensions: Object.assign({
        version: '', generatedDate: '', generatedBy: '', qrCode: '', revision: '', release: ''
      }, exportMeta.extensions || {})
    };
  }

  function text(x, y, value, size, weight, fill, anchor, maxWidth) {
    const content = String(value == null ? '' : value);
    const baseSize = number(size);
    const estimatedWidth = Array.from(content).reduce((total, character) => {
      return total + baseSize * (/^[\x00-\x7F]$/.test(character) ? .53 : .95);
    }, 0);
    const fittedSize = maxWidth && estimatedWidth > maxWidth
      ? Math.max(baseSize * .68, baseSize * maxWidth / estimatedWidth)
      : baseSize;
    const fittedWidth = estimatedWidth * fittedSize / baseSize;
    const fit = maxWidth && fittedWidth > maxWidth
      ? ' textLength="' + round(maxWidth) + '" lengthAdjust="spacingAndGlyphs"'
      : '';
    return '<text x="' + round(x) + '" y="' + round(y) + '" font-size="' + round(fittedSize) + '" font-weight="' + weight +
      '" fill="' + fill + '" text-anchor="' + (anchor || 'start') + '"' + fit + '>' + escape(value) + '</text>';
  }

  function renderSVG(data, box) {
    const x = number(box.x), y = number(box.y), w = number(box.width), h = number(box.height);
    const s = h / 42;
    const pad = 6 * s;
    const c1 = x + w * .26;
    const c2 = x + w * .62;
    const left = x + pad, middle = c1 + 7 * s, right = c2 + 7 * s;
    const rightAvailable = x + w - pad - right;
    const rightSizeSplit = right + rightAvailable * .52;
    const ink = STANDARD.colors.ink, muted = STANDARD.colors.muted;
    const labelSize = 2.1 * s, valueSize = 3.35 * s;
    let out = '<g id="pacvu-export-header" data-standard="' + escape(STANDARD.id) + '" data-template="' + escape(data.code) + '" font-family="' + STANDARD.fontFamily + '">';
    out += '<rect x="' + round(x) + '" y="' + round(y) + '" width="' + round(w) + '" height="' + round(h) + '" rx="' + round(4 * s) + '" fill="#fff" stroke="' + ink + '" stroke-width="' + round(.42 * s) + '"/>';
    out += '<line x1="' + round(c1) + '" y1="' + round(y + 4*s) + '" x2="' + round(c1) + '" y2="' + round(y + h - 4*s) + '" stroke="' + STANDARD.colors.rule + '" stroke-width="' + round(.3*s) + '"/>';
    out += '<line x1="' + round(c2) + '" y1="' + round(y + 4*s) + '" x2="' + round(c2) + '" y2="' + round(y + h - 4*s) + '" stroke="' + STANDARD.colors.rule + '" stroke-width="' + round(.3*s) + '"/>';
    out += text(left, y + 6*s, STANDARD.labels.eyebrow, labelSize, 700, '#617087');
    out += text(left, y + 13*s, data.title, 4.65*s, 700, ink, 'start', c1-left-pad);
    out += text(left, y + 17.5*s, data.subtitle, 2.55*s, 400, '#6d7890');
    STANDARD.legend.forEach((item, index) => {
      const ly = y + (24.5 + index * 4.2) * s;
      const dash = item.dash ? item.dash.split(' ').map(value => round(number(value) * s)).join(' ') : '';
      out += '<line x1="' + round(left) + '" y1="' + round(ly) + '" x2="' + round(left + 13*s) + '" y2="' + round(ly) + '" stroke="' + item.color + '" stroke-width="' + round(.55*s) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
      out += text(left + 16*s, ly + .75*s, item.label, 2.05*s, 700, item.color);
    });
    out += text(middle, y + 7*s, STANDARD.labels.structure, labelSize, 700, muted);
    out += text(middle, y + 12*s, data.code + ' \u00B7 ' + data.name, valueSize, 650, ink, 'start', c2-middle-5*s);
    out += text(middle, y + 20*s, STANDARD.labels.dimensions, labelSize, 700, muted);
    out += text(middle, y + 25*s, data.dimensions, valueSize, 650, ink);
    out += text(middle, y + 33*s, STANDARD.labels.material, labelSize, 700, muted);
    out += text(middle, y + 38*s, data.material, valueSize, 650, ink, 'start', c2-middle-5*s);
    out += text(right, y + 7*s, STANDARD.labels.basis, labelSize, 700, muted);
    out += text(right, y + 12*s, data.dimensionBasis, valueSize, 650, ink, 'start', x+w-pad-right);
    out += text(right, y + 20*s, STANDARD.labels.dieline, labelSize, 700, muted);
    out += text(right, y + 25*s, data.dielineSize, valueSize, 650, ink, 'start', rightSizeSplit-right-2*s);
    out += text(rightSizeSplit, y + 20*s, STANDARD.labels.bleedSize, labelSize, 700, muted);
    out += text(rightSizeSplit, y + 25*s, data.bleedSize, valueSize, 650, ink, 'start', x+w-pad-rightSizeSplit);
    out += text(right, y + 33*s, STANDARD.labels.options, labelSize, 700, muted);
    out += text(right, y + 38*s, data.options, valueSize, 650, ink, 'start', x+w-pad-right);
    out += '<circle cx="' + round(x+w-pad-8*s) + '" cy="' + round(y+5.2*s) + '" r="' + round(.85*s) + '" fill="' + STANDARD.colors.ready + '"/>';
    out += text(x+w-pad, y+6*s, data.status, 2.05*s, 700, STANDARD.colors.ready, 'end');
    return out + '</g>';
  }

  function parseSvg(svg) {
    const open = svg.match(/<svg\b([^>]*)>/i);
    if (!open) return null;
    const attr = open[1];
    const viewBox = (attr.match(/viewBox="([^"]+)"/i) || [])[1];
    const values = viewBox ? viewBox.trim().split(/[\s,]+/).map(Number) : [];
    if (values.length !== 4 || values.some(value => !Number.isFinite(value))) return null;
    return { open: open[0], x: values[0], y: values[1], width: values[2], height: values[3] };
  }

  function wrapSVG(svg, context) {
    const parsed = parseSvg(svg);
    if (!parsed) return svg;
    const margin = Math.max(6, parsed.width * .025);
    const pageWidth = Math.max(parsed.width + margin * 2, STANDARD.layout.pageMinWidth);
    const headerHeight = Math.max(STANDARD.layout.minHeaderHeight, pageWidth * STANDARD.layout.headerToPageWidth);
    const headerY = margin;
    const contentY = margin + headerHeight + margin;
    const pageHeight = contentY + parsed.height + margin;
    const contentX = (pageWidth - parsed.width) / 2;
    const data = resolve(Object.assign({}, context, { dielineSize: { width: parsed.width, height: parsed.height } }));
    const nested = svg.replace(/^\s*<\?xml[^>]*>\s*/i, '').replace(parsed.open,
      '<svg x="' + round(contentX) + '" y="' + round(contentY) + '" width="' + round(parsed.width) + '" height="' + round(parsed.height) + '" viewBox="' + [parsed.x, parsed.y, parsed.width, parsed.height].join(' ') + '">');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + round(pageWidth) + ' ' + round(pageHeight) + '" width="' + round(pageWidth) + 'mm" height="' + round(pageHeight) + 'mm">\n' +
      '<metadata data-standard="' + escape(STANDARD.id) + '" data-template="' + escape(data.code) + '"/>\n' +
      renderSVG(data, { x: margin, y: headerY, width: pageWidth - margin * 2, height: headerHeight }) + '\n' + nested + '\n</svg>';
  }

  async function svgToPDF(svg) {
    const parsed = parseSvg(svg);
    const JsPDF = root.jspdf && root.jspdf.jsPDF;
    if (!parsed || !JsPDF) throw new Error('PacVu PDF vector renderer is not ready.');
    const documentNode = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const svgNode = documentNode.documentElement;
    const pdf = new JsPDF({
      unit: 'mm',
      format: [parsed.width, parsed.height],
      orientation: parsed.width >= parsed.height ? 'landscape' : 'portrait',
      compress: true,
      putOnlyUsedFonts: true
    });
    if (typeof pdf.svg !== 'function') throw new Error('PacVu SVG-to-PDF renderer is not ready.');
    await pdf.svg(svgNode, { x: 0, y: 0, width: parsed.width, height: parsed.height });
    return pdf.output('arraybuffer');
  }

  root.PacVuExportHeader = Object.freeze({ STANDARD, register, resolve, renderSVG, wrapSVG, svgToPDF });
})(window);


/* structures/tuck/common/Tuck2DVisualCommon.js */
(function(root){
  'use strict';

  function positive(value,fallback){
    const number=Number(value);
    return Number.isFinite(number)&&number>0?number:fallback;
  }

  function finite(value,fallback){
    const number=Number(value);
    return Number.isFinite(number)?number:fallback;
  }

  function responsiveOf(svg){
    return positive(svg&&svg.dataset&&svg.dataset.pacvuVisualResponsiveScale,1);
  }

  function resolveScreenStyle(profile,fallbackInternal,fallbackPanelLabel,svg){
    const internal=profile&&profile.internal||{};
    const panel=profile&&profile.panelLabel||{};
    const marker=internal.marker||{};
    const font=internal.font||{};
    const line=internal.line||{};
    const textGap=internal.textGap||{};
    const responsive=responsiveOf(svg);
    return {
      internal:Object.assign({},fallbackInternal,{
        dimensionTextPx:positive(font.screenPx,fallbackInternal.dimensionTextPx)*responsive,
        dimensionLinePx:positive(line.screenPx,fallbackInternal.dimensionLinePx)*responsive,
        dimensionTextOffsetPx:finite(textGap.horizontalOffsetPx,fallbackInternal.dimensionTextOffsetPx)*responsive,
        dimensionVerticalTextOffsetPx:finite(textGap.verticalOffsetPx,fallbackInternal.dimensionVerticalTextOffsetPx)*responsive,
        internalArrowWidthPx:positive(marker.widthPx,fallbackInternal.internalArrowWidthPx)*responsive,
        internalArrowHeightPx:positive(marker.heightPx,fallbackInternal.internalArrowHeightPx)*responsive
      },{preserveRendererPosition:textGap.preserveRenderer===true}),
      panelLabel:Object.assign({},fallbackPanelLabel,{
        screenPx:positive(panel.referenceTargetPx,fallbackPanelLabel.screenPx)*responsive,
        minPx:positive(panel.minPx,fallbackPanelLabel.minPx)*responsive,
        maxPx:positive(panel.maxPx,fallbackPanelLabel.maxPx)*responsive
      })
    };
  }

  function applyRendererResponsive(svg,profile){
    if(!svg||!profile)return false;
    const viewport=svg.querySelector(profile.selectors.viewport)||svg;
    const ctm=viewport.getScreenCTM&&viewport.getScreenCTM();
    if(!ctm)return false;
    const sx=Math.hypot(ctm.a,ctm.b),sy=Math.hypot(ctm.c,ctm.d),sm=Math.sqrt(sx*sy);
    if(!(sx>0&&sy>0))return false;
    const responsive=responsiveOf(svg);
    const lines=[...svg.querySelectorAll(profile.selectors.internalLines)];
    const texts=[...svg.querySelectorAll(profile.selectors.internalTexts)];
    const labels=[...svg.querySelectorAll(profile.selectors.panelLabels)];

    lines.forEach(line=>{
      if(!line.dataset.pacvuBaseStrokeScreen){
        const raw=parseFloat(line.getAttribute('stroke-width'))||parseFloat(getComputedStyle(line).strokeWidth)||.35;
        line.dataset.pacvuBaseStrokeScreen=String(raw*sm);
      }
      line.setAttribute('stroke-width',String(Number(line.dataset.pacvuBaseStrokeScreen)*responsive/sm));
      line.style.removeProperty('stroke-width');
      line.style.removeProperty('vector-effect');
    });
    texts.forEach((text,index)=>{
      if(!text.dataset.pacvuBaseFontScreen){
        const raw=parseFloat(text.getAttribute('font-size'))||parseFloat(getComputedStyle(text).fontSize)||5.5;
        text.dataset.pacvuBaseFontScreen=String(raw*sy);
      }
      text.setAttribute('font-size',String(Number(text.dataset.pacvuBaseFontScreen)*responsive/sy));
      const line=lines[index];if(!line)return;
      const vertical=Math.abs(+line.getAttribute('y2')-+line.getAttribute('y1'))>Math.abs(+line.getAttribute('x2')-+line.getAttribute('x1'));
      const anchor=vertical?(+line.getAttribute('x1')):(+line.getAttribute('y1'));
      const coordinate=vertical?(+text.getAttribute('x')):(+text.getAttribute('y'));
      const scale=vertical?sx:sy;
      if(!text.dataset.pacvuBaseGapScreen)text.dataset.pacvuBaseGapScreen=String((coordinate-anchor)*scale);
      const next=anchor+Number(text.dataset.pacvuBaseGapScreen)*responsive/scale;
      if(vertical){
        text.setAttribute('x',String(next));
        const y=+text.getAttribute('y');
        text.setAttribute('transform',`rotate(-90 ${next} ${y})`);
      }else text.setAttribute('y',String(next));
    });
    labels.forEach(label=>{
      if(!label.dataset.pacvuBaseFontScreen){
        const raw=parseFloat(label.getAttribute('font-size'))||parseFloat(getComputedStyle(label).fontSize)||4.5;
        label.dataset.pacvuBaseFontScreen=String(raw*sy);
      }
      label.setAttribute('font-size',String(Number(label.dataset.pacvuBaseFontScreen)*responsive/sy));
    });

    // T002-T005 markers intentionally keep each renderer's native
    // markerUnits="strokeWidth" geometry. Their visible size already follows
    // the responsive dimension-line stroke, so rewriting markerWidth/Height or
    // markerUnits here would apply the scale twice.
    return true;
  }

  const upperTuckProfiles=Object.freeze({
    T001:Object.freeze({ratio:23/57,sourceDepth:23}),
    T002:Object.freeze({ratio:((378.344-301.241)*(25.4/72))/81,sourceDepth:(378.344-301.241)*(25.4/72)}),
    T003:Object.freeze({ratio:((137.764-92.126)*(25.4/72))/86.5,sourceDepth:(137.764-92.126)*(25.4/72)}),
    T004:Object.freeze({ratio:((277.507-217.98)*(25.4/72))/65,sourceDepth:(277.507-217.98)*(25.4/72),min:15}),
    T005:Object.freeze({ratio:28.92/90,sourceDepth:28.92}),
    T008:Object.freeze({ratio:((288.04-225.677)*(25.4/72))/52,sourceDepth:(288.04-225.677)*(25.4/72)}),
    T009:Object.freeze({ratio:((374.589-297.487)*(25.4/72))/59,sourceDepth:(374.589-297.487)*(25.4/72)})
  });
  const upperTuckLimits=Object.freeze({min:8,max:45});
  const upperTuckState=Object.create(null);

  function clampUpperTuckDepth(value,min=upperTuckLimits.min,max=upperTuckLimits.max){
    return Math.max(min,Math.min(max,Math.round(Number(value)||min)));
  }

  function resolveUpperTuck(templateId,D,override){
    const profile=upperTuckProfiles[templateId];
    if(!profile)throw new Error('Unknown UpperTuck profile: '+templateId);
    const state=override||upperTuckState[templateId]||{mode:'auto',depth:null};
    const min=profile.min||upperTuckLimits.min,max=profile.max||upperTuckLimits.max;
    const autoDepth=clampUpperTuckDepth(Number(D)*profile.ratio,min,max);
    const custom=state.mode==='custom'&&Number.isFinite(Number(state.depth));
    const depth=custom?clampUpperTuckDepth(state.depth,min,max):autoDepth;
    return Object.freeze({
      templateId,mode:custom?'custom':'auto',profile:'auto',depth,autoDepth,
      min,max,
      relief:templateId!=='T001',scale:depth/profile.sourceDepth,
      profileScale:autoDepth/profile.sourceDepth
    });
  }

  function setUpperTuckState(templateId,next){
    const mode=next&&next.mode==='custom'?'custom':'auto';
    upperTuckState[templateId]={mode,depth:mode==='custom'?clampUpperTuckDepth(next.depth):null};
    return Object.freeze({mode,depth:upperTuckState[templateId].depth});
  }

  function getUpperTuckState(templateId){
    const state=upperTuckState[templateId]||{mode:'auto',depth:null};
    return Object.freeze({mode:state.mode,depth:state.depth});
  }

  // Preserve a source tuck's edge profiles and let only its middle span absorb W.
  // This is the T005 mapping principle expressed without copying T005 coordinates.
  function mapUpperTuckX(value,sourceLeft,sourceRight,targetLeft,targetRight,unitToMm,profileScale){
    const sourceMid=(sourceLeft+sourceRight)/2;
    if(value<=sourceMid)return targetLeft+(value-sourceLeft)*unitToMm*profileScale;
    return targetRight-(sourceRight-value)*unitToMm*profileScale;
  }

  function upperTuckBoundaryFrom2D(outline,leftCut,rightCut){
    const leftOuter=leftCut[leftCut.length-1],rightOuter=rightCut[0];
    const nearestIndex=target=>outline.reduce((best,point,index)=>{
      const distance=(point.x-target.x)**2+(point.y-target.y)**2;
      return distance<best.distance?{index,distance}:best;
    },{index:0,distance:Infinity}).index;
    const leftIndex=nearestIndex(leftOuter),rightIndex=nearestIndex(rightOuter);
    const route=(from,to,step)=>{
      const points=[];let index=from;
      while(true){points.push(outline[index]);if(index===to)break;index=(index+step+outline.length)%outline.length;}
      return points;
    };
    const forward=route(leftIndex,rightIndex,1),backward=route(leftIndex,rightIndex,-1);
    const topRoute=Math.min(...forward.map(point=>point.y))<=Math.min(...backward.map(point=>point.y))?forward:backward;
    return [leftCut[0],leftCut[1]].concat(topRoute,[rightCut[1],rightCut[rightCut.length-1]]);
  }

  root.PacVuUpperTuckRule=Object.freeze({
    limits:upperTuckLimits,profiles:upperTuckProfiles,resolve:resolveUpperTuck,
    setState:setUpperTuckState,getState:getUpperTuckState,mapX:mapUpperTuckX,
    boundaryFrom2D:upperTuckBoundaryFrom2D
  });
  root.PacVuTuck2DVisualCommon=Object.freeze({resolveScreenStyle,applyRendererResponsive});
})(typeof window!=='undefined'?window:globalThis);


/* structures/tuck/T001/T001_spec.js */
// ============================================================

const T001_EXPORT_META = Object.freeze({
  code: 'T001',
  name: 'Straight Tuck End Box',
  subtitle: 'Production-ready dieline information',
  material: 'SBS 350 gsm \u00B7 0.45 mm',
  dimensionBasis: 'Internal / External / Manufacturing',
  options: Object.freeze(['Bleed 3 mm', 'Glue flap', 'Dust flap']),
  status: 'READY'
});
// T001_spec.js - T001 structure constants and defaults
// Split from the current working T001 layout without geometry changes.
// ============================================================

const T001_SOURCE_ELEMENTS = {
  "cutElements": [
    "<polyline points=\"890.995 811.27 810.208 863.712 815.798 880.928\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M807.71,892.058c2.725,0,5.276-1.3,6.879-3.504,1.602-2.205,2.051-5.033,1.209-7.626\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"807.71 892.058 738.878 892.058 738.078 819.951 733.672 811.27 681.232 892.058 681.232 923.239\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M669.893,934.578c6.259,0,11.339-5.08,11.339-11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<line x1=\"669.893\" y1=\"934.578\" x2=\"635.877\" y2=\"934.578\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M624.538,923.239c0,6.259,5.08,11.339,11.339,11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"624.538 923.239 624.538 892.058 572.098 811.27 567.679 819.719 567.252 892.058 498.248 892.058\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M490.135,881.008c-.811,2.587-.346,5.395,1.259,7.579,1.604,2.186,4.144,3.471,6.854,3.471\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"490.135 881.008 495.562 863.712 410.523 811.27 405.351 819.156 405.468 934.578 372.255 934.578\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M358.081,923.239c0,6.259,6.252,11.759,14.173,11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<polyline points=\"358.081 923.239 358.081 892.058 301.389 892.058 301.389 923.239\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M287.216,934.578c7.921.42,14.173-5.08,14.173-11.339\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M890.995,811.27v-501.732l-7.087-7.086-3.788-72.284h-105.652c-6.409,0-12.031,4.314-13.69,10.505l-10.098,37.685-11.338,11.339v19.842h-60.945\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M627.373,309.538c1.527,12.936,12.486,22.678,25.512,22.678s23.984-9.742,25.512-22.678\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M627.373,309.538h-60.945v-19.842l-11.338-11.339-10.098-37.685c-1.659-6.19-7.281-10.505-13.69-10.505h-105.578l-3.87,73.997\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M410.523,303.869c0,3.072,2.449,5.587,5.521,5.667,3.071.08,5.648-2.303,5.809-5.371\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<path d=\"M287.216,934.578h-32.751v-114.746l-5.518-8.562-70.865-18.988v-463.755l70.865-18.989v-161.574l1.799-34.305c.907-17.317,15.212-30.893,32.554-30.893h92.871c17.341,0,31.646,13.575,32.554,30.893l1.798,34.305v155.905\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\"/>",
    "<line x1=\"296.234\" y1=\"928.909\" x2=\"300.415\" y2=\"955.799\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"677.166\" y1=\"931.086\" x2=\"693.693\" y2=\"952.707\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"814.385\" y1=\"889.985\" x2=\"831.822\" y2=\"910.878\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"363.236\" y1=\"930.842\" x2=\"359.055\" y2=\"957.733\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"626.317\" y1=\"929.43\" x2=\"612.246\" y2=\"952.723\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"491.144\" y1=\"888.003\" x2=\"475.697\" y2=\"910.408\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"541.876\" y1=\"234.463\" x2=\"555.65\" y2=\"228.51\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"10\" stroke-width=\".5\"/>",
    "<line x1=\"764.885\" y1=\"233.737\" x2=\"751.112\" y2=\"227.783\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"10\" stroke-width=\".5\"/>",
    "<line x1=\"243.462\" y1=\"309.538\" x2=\"121.212\" y2=\"309.538\" fill=\"none\" stroke=\"#ee3924\" stroke-miterlimit=\"2.613\" stroke-width=\".75\"/>"
  ],
  "foldElements": [
    "<line x1=\"890.145\" y1=\"811.27\" x2=\"734.523\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"732.822\" y1=\"811.27\" x2=\"572.949\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"571.247\" y1=\"811.27\" x2=\"411.373\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"409.672\" y1=\"811.27\" x2=\"249.798\" y2=\"811.27\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"733.672\" y1=\"310.389\" x2=\"733.672\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"410.523\" y1=\"310.389\" x2=\"410.523\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"572.098\" y1=\"310.389\" x2=\"572.098\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"248.948\" y1=\"310.389\" x2=\"248.948\" y2=\"810.42\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"890.145\" y1=\"309.538\" x2=\"740.192\" y2=\"309.538\" fill=\"none\" stroke=\"#3b53a4\" stroke-dasharray=\"3\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"565.578\" y1=\"309.538\" x2=\"417.042\" y2=\"309.538\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"409.672\" y1=\"306.704\" x2=\"249.798\" y2=\"306.704\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>",
    "<line x1=\"409.672\" y1=\"147.964\" x2=\"249.798\" y2=\"147.964\" fill=\"none\" stroke=\"#3b53a4\" stroke-dasharray=\"3\" stroke-miterlimit=\"2.613\" stroke-width=\".5\"/>",
    "<line x1=\"243.653\" y1=\"471.222\" x2=\"124.631\" y2=\"471.222\" fill=\"none\" stroke=\"#263aed\" stroke-dasharray=\"3 3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/>"
  ],
  "bleedElement": "<path d=\"M482.148,878.464c-1.613,5.146-.671,10.813,2.518,15.154,3.191,4.348,8.316,6.943,13.71,6.943l2.22.002v-.002h-2.22,73.85l-.694-73.59,1.417-1.165,43.214,68.769v28.663c0,10.942,8.901,19.844,19.843,19.844h34.016c10.941,0,19.843-8.901,19.843-19.844v-28.663l42.957-68.683.979.996v73.673h74.038c5.423,0,10.566-2.619,13.759-7.01,3.19-4.389,4.093-10.091,2.417-15.25h0l-3.575-11.01,75.314-48.89,3.874-2.769v-509.618l-7.27-7.268-4.04-77.083h-113.722c-10.245,0-19.252,6.912-21.904,16.808l-9.508,35.484-12.218,12.218v14.86h-52.441l-8.115.103-.331,7.403c-1.021,8.649-8.359,15.172-17.067,15.172s-16.045-6.522-17.066-15.171l-.233-7.216-8.212-.292h-52.441v-14.86l-12.217-12.219-9.508-35.484c-2.652-9.896-11.659-16.808-21.904-16.808h-112.275v-73.699l-1.81-34.75c-1.146-21.842-19.175-38.952-41.046-38.952h-92.871c-21.873,0-39.902,17.11-41.046,38.952l-1.811,34.527.16,179.37.844,127.423-.691,240.863-.446,120.984,8.637,6.914v119.786h38.269c10.941,0,19.842-8.901,19.842-19.844h0v-22.677h45.354v22.677c0,10.942,8.901,19.844,19.843,19.844h38.268v-119.786l1.259-1.259,73.686,45.44-3.446,10.984\" fill=\"none\" stroke=\"#263aed\" stroke-miterlimit=\"10\"/>"
};

const T001_BLEED_OFFSET = 3;

function T001_num(value) {
  return +(+value).toFixed(4);
}

function T001_getSpec(input) {
  const W = Number(input && input.W) || 57;
  const D = Number(input && input.D) || 57;
  const H = Number(input && input.H) || 177;
  const glueWidth = 15;

  const source = {
    unitToMm: 25.4 / 72,
    xGlueL: 178.082,
    xFrontL: 248.948,
    xFrontR: 410.523,
    xSideLR: 572.098,
    xBackR: 733.672,
    xSideRR: 890.995,
    yTop: 82.766,
    yLidFold: 147.964,
    yBodyTop: 309.538,
    yBodyBottom: 811.27,
    yBottomLockBend: 892.058,
    yBottomLockEnd: 934.578
  };

  const upperTuckRule = globalThis.PacVuUpperTuckRule
    ? globalThis.PacVuUpperTuckRule.resolve('T001', D)
    : { depth: Math.max(8, Math.min(45, D * (23 / 57))), mode: 'auto', profile: 'auto', relief: false, scale: D / 57, profileScale: D / 57 };
  const tuckDepth = upperTuckRule.depth;
  const grid = {
    xGlueL: 0,
    xFrontL: glueWidth,
    xFrontR: glueWidth + W,
    xSideLR: glueWidth + W + D,
    xBackR: glueWidth + W + D + W,
    xSideRR: glueWidth + W + D + W + D,
    yTop: 0,
    yLidFold: tuckDepth,
    yBodyTop: tuckDepth + D,
    yBodyBottom: tuckDepth + D + H,
    yBottomLockBend: tuckDepth + D + H + D * 0.5,
    yBottomLockEnd: tuckDepth + D + H + D * (43.5 / 57)
  };
  grid.glueWidth = glueWidth;

  return { W, D, H, glueWidth, source, grid, upperTuckRule, exportMeta: T001_EXPORT_META };
}

function T001_hasThumbNotch(spec) {
  return spec.W < 100;
}
if (window.PacVuExportHeader) {
  window.PacVuExportHeader.register('T001', context => {
    const spec = T001_getSpec(context.cfg || {});
    const layout = typeof T001_getLayout === 'function'
      ? T001_getLayout(spec.W, spec.D, spec.H)
      : null;
    return {
      name: spec.exportMeta.name,
      subtitle: spec.exportMeta.subtitle,
      material: spec.exportMeta.material,
      dimensionBasis: spec.exportMeta.dimensionBasis,
      dielineSize: layout ? layout.dielineBounds : null,
      bleedSize: layout ? layout.bleedBounds : null,
      options: spec.exportMeta.options.slice(),
      status: spec.exportMeta.status
    };
  });
}


/* structures/tuck/T001/T001_layout.js */
// ============================================================
// T001_layout.js - T001 coordinate, panel, bounds, and resize calculations
// Depends on T001_spec.js.
// ============================================================

function T001_piecewise(value, sourceAnchors, targetAnchors) {
  if (value <= sourceAnchors[0]) {
    const s = (targetAnchors[1] - targetAnchors[0]) / (sourceAnchors[1] - sourceAnchors[0]);
    return targetAnchors[0] + (value - sourceAnchors[0]) * s;
  }
  for (let i = 0; i < sourceAnchors.length - 1; i += 1) {
    if (value <= sourceAnchors[i + 1]) {
      const s = (targetAnchors[i + 1] - targetAnchors[i]) / (sourceAnchors[i + 1] - sourceAnchors[i]);
      return targetAnchors[i] + (value - sourceAnchors[i]) * s;
    }
  }
  const n = sourceAnchors.length - 1;
  const s = (targetAnchors[n] - targetAnchors[n - 1]) / (sourceAnchors[n] - sourceAnchors[n - 1]);
  return targetAnchors[n] + (value - sourceAnchors[n]) * s;
}

function T001_createMapper(spec) {
  const src = spec.source;
  const grid = spec.grid;
  const notchHalfWidth = (678.397 - 627.373) * src.unitToMm / 2;
  const panelCenter = (grid.xSideLR + grid.xBackR) / 2;
  const sx = T001_hasThumbNotch(spec)
    ? [src.xGlueL, src.xFrontL, src.xFrontR, src.xSideLR, 627.373, 678.397, src.xBackR, src.xSideRR]
    : [src.xGlueL, src.xFrontL, src.xFrontR, src.xSideLR, src.xBackR, src.xSideRR];
  const tx = T001_hasThumbNotch(spec)
    ? [grid.xGlueL, grid.xFrontL, grid.xFrontR, grid.xSideLR, panelCenter - notchHalfWidth, panelCenter + notchHalfWidth, grid.xBackR, grid.xSideRR]
    : [grid.xGlueL, grid.xFrontL, grid.xFrontR, grid.xSideLR, grid.xBackR, grid.xSideRR];
  const sy = [src.yTop, src.yLidFold, src.yBodyTop, src.yBodyBottom, src.yBottomLockBend, src.yBottomLockEnd];
  const ty = [grid.yTop, grid.yLidFold, grid.yBodyTop, grid.yBodyBottom, grid.yBottomLockBend, grid.yBottomLockEnd];

  function mapX(x, y) {
    if (y <= src.yLidFold && x >= src.xFrontL && x <= src.xFrontR && globalThis.PacVuUpperTuckRule) {
      return globalThis.PacVuUpperTuckRule.mapX(
        x, src.xFrontL, src.xFrontR, grid.xFrontL, grid.xFrontR,
        src.unitToMm, spec.upperTuckRule.profileScale
      );
    }
    return T001_piecewise(x, sx, tx);
  }
  return {
    point(x, y) {
      return {
        x: mapX(x, y),
        y: T001_piecewise(y, sy, ty)
      };
    },
    x(x) {
      return T001_piecewise(x, sx, tx);
    },
    y(y) {
      return T001_piecewise(y, sy, ty);
    }
  };
}
const T001_COORDINATE_TOLERANCE = 0.001;

function T001_validateCoordinateContract(spec) {
  const g = spec.grid;
  const checks = [
    { id: 'frontWidth', actual: g.xFrontR - g.xFrontL, expected: spec.W },
    { id: 'sideLeftDepth', actual: g.xSideLR - g.xFrontR, expected: spec.D },
    { id: 'backWidth', actual: g.xBackR - g.xSideLR, expected: spec.W },
    { id: 'sideRightDepth', actual: g.xSideRR - g.xBackR, expected: spec.D },
    { id: 'bodyHeight', actual: g.yBodyBottom - g.yBodyTop, expected: spec.H },
    { id: 'bottomLockBendDepth', actual: g.yBottomLockBend - g.yBodyBottom, expected: spec.D * 0.5 }
  ].map(check => Object.assign({}, check, {
    error: Math.abs(check.actual - check.expected)
  }));
  const failures = checks.filter(check => check.error > T001_COORDINATE_TOLERANCE);

  if (failures.length) {
    const details = failures.map(check =>
      check.id + ': actual=' + T001_num(check.actual) +
      ', expected=' + T001_num(check.expected) +
      ', error=' + T001_num(check.error)
    ).join('; ');
    throw new Error('T001 coordinate contract failed (tolerance ' + T001_COORDINATE_TOLERANCE + 'mm): ' + details);
  }

  return {
    tolerance: T001_COORDINATE_TOLERANCE,
    valid: true,
    checks
  };
}

function T001_tokenizePath(d) {
  return d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
}

function T001_isCommand(token) {
  return /^[a-zA-Z]$/.test(token);
}

function T001_pathPoint(mapper, point) {
  const p = mapper.point(point.x, point.y);
  return T001_num(p.x) + ' ' + T001_num(p.y);
}

function T001_transformPathD(d, mapper) {
  const tokens = T001_tokenizePath(d);
  const out = [];
  let i = 0;
  let cmd = '';
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let previousC2 = null;

  function read() {
    return Number(tokens[i++]);
  }

  function hasNumber() {
    return i < tokens.length && !T001_isCommand(tokens[i]);
  }

  while (i < tokens.length) {
    if (T001_isCommand(tokens[i])) {
      cmd = tokens[i++];
    }

    const lower = cmd.toLowerCase();
    const relative = cmd === lower;

    if (lower === 'z') {
      out.push('Z');
      current = { x: start.x, y: start.y };
      previousC2 = null;
      continue;
    }

    if (lower === 'm') {
      let first = true;
      while (hasNumber()) {
        const x = read();
        const y = read();
        const next = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        out.push((first ? 'M ' : 'L ') + T001_pathPoint(mapper, next));
        current = next;
        if (first) {
          start = { x: current.x, y: current.y };
        }
        first = false;
        previousC2 = null;
      }
      cmd = relative ? 'l' : 'L';
      continue;
    }

    if (lower === 'l') {
      while (hasNumber()) {
        const x = read();
        const y = read();
        const next = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        out.push('L ' + T001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'h') {
      while (hasNumber()) {
        const x = read();
        const next = { x: relative ? current.x + x : x, y: current.y };
        out.push('L ' + T001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'v') {
      while (hasNumber()) {
        const y = read();
        const next = { x: current.x, y: relative ? current.y + y : y };
        out.push('L ' + T001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'c') {
      while (hasNumber()) {
        const c1 = { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const end = { x: read(), y: read() };
        const a1 = relative ? { x: current.x + c1.x, y: current.y + c1.y } : c1;
        const a2 = relative ? { x: current.x + c2.x, y: current.y + c2.y } : c2;
        const ae = relative ? { x: current.x + end.x, y: current.y + end.y } : end;
        out.push('C ' + T001_pathPoint(mapper, a1) + ' ' + T001_pathPoint(mapper, a2) + ' ' + T001_pathPoint(mapper, ae));
        current = ae;
        previousC2 = a2;
      }
      continue;
    }

    if (lower === 's') {
      while (hasNumber()) {
        const c1 = previousC2 ? {
          x: current.x * 2 - previousC2.x,
          y: current.y * 2 - previousC2.y
        } : { x: current.x, y: current.y };
        const c2 = { x: read(), y: read() };
        const end = { x: read(), y: read() };
        const a2 = relative ? { x: current.x + c2.x, y: current.y + c2.y } : c2;
        const ae = relative ? { x: current.x + end.x, y: current.y + end.y } : end;
        out.push('C ' + T001_pathPoint(mapper, c1) + ' ' + T001_pathPoint(mapper, a2) + ' ' + T001_pathPoint(mapper, ae));
        current = ae;
        previousC2 = a2;
      }
      continue;
    }

    throw new Error('Unsupported SVG path command for T001 template: ' + cmd);
  }

  return out.join(' ');
}

function T001_attr(el, name) {
  const match = el.match(new RegExp('\\s' + name + '="([^"]*)"'));
  return match ? match[1] : '';
}

function T001_transformElement(el, mapper) {
  if (/^<path\b/.test(el)) {
    const d = T001_attr(el, 'd');
    return el.replace(/d="[^"]*"/, 'd="' + T001_transformPathD(d, mapper) + '"');
  }

  if (/^<polyline\b/.test(el)) {
    const nums = T001_attr(el, 'points').match(/-?\d+(?:\.\d+)?/g) || [];
    const mapped = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      const p = mapper.point(Number(nums[i]), Number(nums[i + 1]));
      mapped.push(T001_num(p.x) + ',' + T001_num(p.y));
    }
    return el.replace(/points="[^"]*"/, 'points="' + mapped.join(' ') + '"');
  }

  if (/^<line\b/.test(el)) {
    const p1 = mapper.point(Number(T001_attr(el, 'x1')), Number(T001_attr(el, 'y1')));
    const p2 = mapper.point(Number(T001_attr(el, 'x2')), Number(T001_attr(el, 'y2')));
    return el
      .replace(/x1="[^"]*"/, 'x1="' + T001_num(p1.x) + '"')
      .replace(/y1="[^"]*"/, 'y1="' + T001_num(p1.y) + '"')
      .replace(/x2="[^"]*"/, 'x2="' + T001_num(p2.x) + '"')
      .replace(/y2="[^"]*"/, 'y2="' + T001_num(p2.y) + '"');
  }

  return el;
}

function T001_restyleElement(el, className) {
  const out = el
    .replace(/\sfill="[^"]*"/g, '')
    .replace(/\sstroke="[^"]*"/g, '')
    .replace(/\sstroke-width="[^"]*"/g, '')
    .replace(/\sstroke-dasharray="[^"]*"/g, '')
    .replace(/\sstroke-miterlimit="[^"]*"/g, '')
    .replace(/\sstroke-linecap="[^"]*"/g, '')
    .replace(/\sstroke-linejoin="[^"]*"/g, '');
  return out.replace(/\/>$/, ' class="' + className + '"/>');
}

function T001_elementToPathD(el) {
  if (/^<path\b/.test(el)) {
    return T001_attr(el, 'd');
  }
  if (/^<polyline\b/.test(el)) {
    const nums = T001_attr(el, 'points').match(/-?\d+(?:\.\d+)?/g) || [];
    const parts = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      parts.push((i === 0 ? 'M ' : 'L ') + T001_num(nums[i]) + ' ' + T001_num(nums[i + 1]));
    }
    return parts.join(' ');
  }
  if (/^<line\b/.test(el)) {
    return [
      'M ' + T001_num(T001_attr(el, 'x1')) + ' ' + T001_num(T001_attr(el, 'y1')),
      'L ' + T001_num(T001_attr(el, 'x2')) + ' ' + T001_num(T001_attr(el, 'y2'))
    ].join(' ');
  }
  return '';
}

function T001_parseAbsolutePath(d) {
  const tokens = T001_tokenizePath(d);
  const segments = [];
  let i = 0;
  let cmd = '';
  let current = null;
  let start = null;

  function read() {
    return Number(tokens[i++]);
  }

  function hasNumber() {
    return i < tokens.length && !T001_isCommand(tokens[i]);
  }

  while (i < tokens.length) {
    if (T001_isCommand(tokens[i])) {
      cmd = tokens[i++];
    }
    const upper = cmd.toUpperCase();

    if (upper === 'M') {
      while (hasNumber()) {
        const point = { x: read(), y: read() };
        if (!current) {
          current = point;
          start = point;
        } else {
          segments.push({ type: 'L', from: current, to: point });
          current = point;
        }
        cmd = 'L';
      }
    } else if (upper === 'L') {
      while (hasNumber()) {
        const point = { x: read(), y: read() };
        segments.push({ type: 'L', from: current, to: point });
        current = point;
      }
    } else if (upper === 'C') {
      while (hasNumber()) {
        const c1 = { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const point = { x: read(), y: read() };
        segments.push({ type: 'C', from: current, c1, c2, to: point });
        current = point;
      }
    } else if (upper === 'Z') {
      if (current && start) {
        segments.push({ type: 'L', from: current, to: start });
        current = start;
      }
    } else {
      throw new Error('Unsupported absolute path command for T001 fill: ' + cmd);
    }
  }

  return {
    start,
    end: current,
    segments
  };
}

function T001_distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function T001_segmentsToD(start, segments) {
  const out = ['M ' + T001_num(start.x) + ' ' + T001_num(start.y)];
  segments.forEach(segment => {
    if (segment.type === 'L') {
      out.push('L ' + T001_num(segment.to.x) + ' ' + T001_num(segment.to.y));
    } else if (segment.type === 'C') {
      out.push(
        'C ' +
        T001_num(segment.c1.x) + ' ' + T001_num(segment.c1.y) + ' ' +
        T001_num(segment.c2.x) + ' ' + T001_num(segment.c2.y) + ' ' +
        T001_num(segment.to.x) + ' ' + T001_num(segment.to.y)
      );
    }
  });
  out.push('Z');
  return out.join(' ');
}

function T001_cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
  };
}

function T001_flattenPathD(d) {
  const parsed = T001_parseAbsolutePath(d);
  if (!parsed.start) return [];
  const points = [{ x: parsed.start.x, y: parsed.start.y }];
  parsed.segments.forEach(segment => {
    if (segment.type === 'L') {
      points.push({ x: segment.to.x, y: segment.to.y });
    } else if (segment.type === 'C') {
      const chord = T001_distance(segment.from, segment.to);
      const control = T001_distance(segment.from, segment.c1) +
        T001_distance(segment.c1, segment.c2) +
        T001_distance(segment.c2, segment.to);
      const steps = Math.max(8, Math.min(32, Math.ceil((control + chord) / 8)));
      for (let i = 1; i <= steps; i += 1) {
        points.push(T001_cubicPoint(segment.from, segment.c1, segment.c2, segment.to, i / steps));
      }
    }
  });
  return points.filter((point, index) => {
    if (index === 0) return true;
    return T001_distance(point, points[index - 1]) > 0.01;
  });
}

function T001_polygonBounds(points) {
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

function T001_polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function T001_polygonToPath(points) {
  if (!points.length) return '';
  return points.map((point, index) =>
    (index === 0 ? 'M ' : 'L ') + T001_num(point.x) + ' ' + T001_num(point.y)
  ).join(' ') + ' Z';
}

function T001_lineIntersection(a1, a2, b1, b2) {
  const x1 = a1.x;
  const y1 = a1.y;
  const x2 = a2.x;
  const y2 = a2.y;
  const x3 = b1.x;
  const y3 = b1.y;
  const x4 = b2.x;
  const y4 = b2.y;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 0.000001) return null;
  return {
    x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den,
    y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den
  };
}

function T001_offsetPolygonFallback(points, offset) {
  if (points.length < 3) return null;
  const baseBounds = T001_polygonBounds(points);

  function offsetWithSide(side) {
    const shifted = [];
    for (let i = 0; i < points.length; i += 1) {
      const prev = points[(i - 1 + points.length) % points.length];
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const pDx = curr.x - prev.x;
      const pDy = curr.y - prev.y;
      const nDx = next.x - curr.x;
      const nDy = next.y - curr.y;
      const pLen = Math.sqrt(pDx * pDx + pDy * pDy) || 1;
      const nLen = Math.sqrt(nDx * nDx + nDy * nDy) || 1;
      const pNormal = { x: (-pDy / pLen) * side, y: (pDx / pLen) * side };
      const nNormal = { x: (-nDy / nLen) * side, y: (nDx / nLen) * side };
      const a1 = { x: prev.x + pNormal.x * offset, y: prev.y + pNormal.y * offset };
      const a2 = { x: curr.x + pNormal.x * offset, y: curr.y + pNormal.y * offset };
      const b1 = { x: curr.x + nNormal.x * offset, y: curr.y + nNormal.y * offset };
      const b2 = { x: next.x + nNormal.x * offset, y: next.y + nNormal.y * offset };
      let point = T001_lineIntersection(a1, a2, b1, b2);
      if (!point || T001_distance(point, curr) > 24) {
        const mx = pNormal.x + nNormal.x;
        const my = pNormal.y + nNormal.y;
        const mLen = Math.sqrt(mx * mx + my * my) || 1;
        point = { x: curr.x + (mx / mLen) * offset, y: curr.y + (my / mLen) * offset };
      }
      shifted.push(point);
    }
    return shifted;
  }

  function expansionScore(candidate) {
    const bounds = T001_polygonBounds(candidate);
    return (baseBounds.minX - bounds.minX) +
      (baseBounds.minY - bounds.minY) +
      (bounds.maxX - baseBounds.maxX) +
      (bounds.maxY - baseBounds.maxY);
  }

  const a = offsetWithSide(1);
  const b = offsetWithSide(-1);
  return expansionScore(a) >= expansionScore(b) ? a : b;
}

function T001_offsetPolygonWithClipper(points, offset) {
  if (typeof ClipperLib === 'undefined' || !points.length) {
    return T001_offsetPolygonFallback(points, offset);
  }
  const scale = 1000;
  const baseBounds = T001_polygonBounds(points);
  const source = points.map(point => ({
    X: Math.round(point.x * scale),
    Y: Math.round(point.y * scale)
  }));

  function run(delta) {
    const co = new ClipperLib.ClipperOffset(2, 0.25 * scale);
    co.AddPath(source, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
    const solution = new ClipperLib.Paths();
    co.Execute(solution, delta * scale);
    if (!solution.length) return null;
    const largest = solution.reduce((best, path) =>
      Math.abs(ClipperLib.Clipper.Area(path)) > Math.abs(ClipperLib.Clipper.Area(best)) ? path : best
    , solution[0]);
    return largest.map(point => ({ x: point.X / scale, y: point.Y / scale }));
  }

  let result = run(offset);
  if (!result) return null;
  let resultBounds = T001_polygonBounds(result);
  const expands = resultBounds.minX <= baseBounds.minX - 1 &&
    resultBounds.minY <= baseBounds.minY - 1 &&
    resultBounds.maxX >= baseBounds.maxX + 1 &&
    resultBounds.maxY >= baseBounds.maxY + 1;
  if (!expands) {
    result = run(-offset);
    resultBounds = result ? T001_polygonBounds(result) : resultBounds;
  }
  if (result && T001_polygonArea(result) > 0) {
    result = result.slice().reverse();
  }
  return result;
}

function T001_buildBleedPathFromCut(fillPath) {
  const points = T001_flattenPathD(fillPath);
  const offsetPoints = T001_offsetPolygonWithClipper(points, T001_BLEED_OFFSET);
  return offsetPoints ? T001_polygonToPath(offsetPoints) : '';
}

function T001_reverseParsedPath(parsed) {
  const reversed = parsed.segments.slice().reverse().map(segment => {
    if (segment.type === 'L') {
      return { type: 'L', from: segment.to, to: segment.from };
    }
    return {
      type: 'C',
      from: segment.to,
      c1: segment.c2,
      c2: segment.c1,
      to: segment.from
    };
  });
  return {
    start: parsed.end,
    end: parsed.start,
    segments: reversed
  };
}

function T001_buildCutFillPath(cutElements) {
  const paths = cutElements
    .map(el => T001_parseAbsolutePath(T001_elementToPathD(el)))
    .filter(path => path.start && path.end && path.segments.length);
  if (!paths.length) return '';

  const ordered = [paths.shift()];
  while (paths.length) {
    const currentEnd = ordered[ordered.length - 1].end;
    let bestIndex = 0;
    let bestReverse = false;
    let bestDistance = Infinity;
    paths.forEach((path, index) => {
      const startDistance = T001_distance(currentEnd, path.start);
      const endDistance = T001_distance(currentEnd, path.end);
      if (startDistance < bestDistance) {
        bestDistance = startDistance;
        bestIndex = index;
        bestReverse = false;
      }
      if (endDistance < bestDistance) {
        bestDistance = endDistance;
        bestIndex = index;
        bestReverse = true;
      }
    });
    const next = paths.splice(bestIndex, 1)[0];
    ordered.push(bestReverse ? T001_reverseParsedPath(next) : next);
  }

  const start = ordered[0].start;
  const segments = [];
  ordered.forEach((path, index) => {
    if (index > 0 && T001_distance(segments[segments.length - 1].to, path.start) > 0.02) {
      segments.push({ type: 'L', from: segments[segments.length - 1].to, to: path.start });
    }
    path.segments.forEach(segment => segments.push(segment));
  });
  return T001_segmentsToD(start, segments);
}

function T001_extractSourceElements(sourceSvg) {
  if (!sourceSvg) return T001_SOURCE_ELEMENTS;
  const elements = sourceSvg.match(/<(?:path|line|polyline)\b[^>]*>/g) || [];
  const cutElements = elements.filter(el =>
    /stroke="#ee3924"/.test(el) &&
    !/d="M890\.995,303\.869"/.test(el)
  );
  const foldElements = elements.filter(el =>
    /stroke="#(?:263aed|3b53a4)"/.test(el) &&
    /stroke-dasharray/.test(el)
  );
  const bleedElements = elements.filter(el =>
    /^<path\b/.test(el) &&
    /stroke="#263aed"/.test(el) &&
    !/stroke-dasharray/.test(el)
  );

  if (!cutElements.length || !foldElements.length || !bleedElements.length) {
    throw new Error('T001 source SVG layer extraction failed.');
  }

  return { cutElements, foldElements, bleedElement: bleedElements[0] };
}

function T001_isAuxiliaryCutElement(el) {
  return /stroke-width="\.5"/.test(el) ||
    /x1="243\.462"\s+y1="309\.538"/.test(el);
}

function T001_isAuxiliaryFoldElement(el) {
  return /x1="243\.653"\s+y1="471\.222"/.test(el);
}

function T001_isThumbNotchCutElement(el) {
  return /d="M627\.373,309\.538c1\.527,12\.936/.test(el);
}

function T001_transformThumbNotchElement(el, mapper, spec) {
  const fixedMapper = {
    point(x, y) {
      return {
        x: mapper.x(x),
        y: spec.grid.yBodyTop + (y - spec.source.yBodyTop) * spec.source.unitToMm
      };
    }
  };
  return '<path d="' + T001_transformPathD(T001_attr(el, 'd'), fixedMapper) + '"/>';
}

function T001_noNotchCutBridgeElement() {
  return '<line x1="627.373" y1="309.538" x2="678.397" y2="309.538" fill="none" stroke="#ee3924" stroke-miterlimit="2.613"/>';
}

function T001_noNotchBleedElement(el) {
  const d = T001_attr(el, 'd');
  const noNotchD = d.replace(
    'h-52.441l-8.115.103-.331,7.403c-1.021,8.649-8.359,15.172-17.067,15.172s-16.045-6.522-17.066-15.171l-.233-7.216-8.212-.292h-52.441',
    'h-156.036'
  );
  return el.replace(/d="[^"]*"/, 'd="' + noNotchD + '"');
}

function T001_numbersForBounds(el) {
  if (/^<path\b/.test(el)) {
    return T001_attr(el, 'd').match(/-?\d+(?:\.\d+)?/g) || [];
  }
  if (/^<polyline\b/.test(el)) {
    return T001_attr(el, 'points').match(/-?\d+(?:\.\d+)?/g) || [];
  }
  if (/^<line\b/.test(el)) {
    return [
      T001_attr(el, 'x1'),
      T001_attr(el, 'y1'),
      T001_attr(el, 'x2'),
      T001_attr(el, 'y2')
    ];
  }
  return [];
}

function T001_boundsFromElements(elements) {
  const xs = [];
  const ys = [];
  elements.forEach(el => {
    const nums = T001_numbersForBounds(el);
    for (let i = 0; i < nums.length - 1; i += 2) {
      xs.push(Number(nums[i]));
      ys.push(Number(nums[i + 1]));
    }
  });
  return {
    minX: T001_num(Math.min(...xs)),
    minY: T001_num(Math.min(...ys)),
    maxX: T001_num(Math.max(...xs)),
    maxY: T001_num(Math.max(...ys)),
    width: T001_num(Math.max(...xs) - Math.min(...xs)),
    height: T001_num(Math.max(...ys) - Math.min(...ys))
  };
}

function T001_getLayout(W, D, H, sourceSvg) {
  const spec = T001_getSpec({ W, D, H });
  const coordinateContract = T001_validateCoordinateContract(spec);
  const mapper = T001_createMapper(spec);
  const sourceElements = T001_extractSourceElements(sourceSvg);
  const sourceCutElements = sourceElements.cutElements
    .filter(el => !T001_isAuxiliaryCutElement(el))
    .filter(el => T001_hasThumbNotch(spec) || !T001_isThumbNotchCutElement(el));
  if (!T001_hasThumbNotch(spec)) {
    sourceCutElements.push(T001_noNotchCutBridgeElement());
  }
  const sourceBleedElement = T001_hasThumbNotch(spec)
    ? sourceElements.bleedElement
    : T001_noNotchBleedElement(sourceElements.bleedElement);
  const cutElements = sourceCutElements.map(el => T001_isThumbNotchCutElement(el)
    ? T001_transformThumbNotchElement(el, mapper, spec)
    : T001_transformElement(el, mapper));
  const foldElements = sourceElements.foldElements
    .filter(el => !T001_isAuxiliaryFoldElement(el))
    .map(el => T001_transformElement(el, mapper));
  const fillPath = T001_buildCutFillPath(cutElements);
  const offsetBleedPath = T001_buildBleedPathFromCut(fillPath);
  const bleedElement = offsetBleedPath
    ? '<path d="' + offsetBleedPath + '" fill="none" stroke="#263aed" stroke-miterlimit="10"/>'
    : T001_transformElement(sourceBleedElement, mapper);
  const allElements = [bleedElement].concat(cutElements, foldElements);
  const dielineBounds = T001_boundsFromElements(cutElements);
  const bleedBounds = T001_boundsFromElements([bleedElement]);
  const renderBounds = T001_boundsFromElements(allElements);

  return {
    spec,
    grid: spec.grid,
    coordinateContract,
    cutElements,
    foldElements,
    fillPath,
    bleedElement,
    labels: T001_buildLabels(spec),
    bounds: dielineBounds,
    dielineBounds,
    bleedBounds,
    renderBounds
  };
}

function T001_buildLabels(spec) {
  const g = spec.grid;
  const lidSideY = g.yBodyTop - spec.D * (28 / 57);
  return [
    { name: 'Glue', x: (g.xGlueL + g.xFrontL) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Front', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Side(L)', x: (g.xFrontR + g.xSideLR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Back', x: (g.xSideLR + g.xBackR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Side(R)', x: (g.xBackR + g.xSideRR) / 2, y: (g.yBodyTop + g.yBodyBottom) / 2 },
    { name: 'Upper Tuck', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yTop + g.yLidFold) / 2 },
    { name: 'Lid Top', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yLidFold + g.yBodyTop) / 2 },
    { name: 'Lid Side Flap(L)', x: (g.xFrontR + g.xSideLR) / 2, y: (lidSideY + g.yBodyTop) / 2 },
    { name: 'Lid Side Flap(R)', x: (g.xBackR + g.xSideRR) / 2, y: (lidSideY + g.yBodyTop) / 2 },
    { name: 'Bottom Lock A', x: (g.xFrontL + g.xFrontR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 },
    { name: 'Bottom Lock(L)', x: (g.xFrontR + g.xSideLR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 },
    { name: 'Bottom Lock B', x: (g.xSideLR + g.xBackR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 },
    { name: 'Bottom Lock(R)', x: (g.xBackR + g.xSideRR) / 2, y: (g.yBodyBottom + g.yBottomLockEnd) / 2 }
  ].concat(T001_hasThumbNotch(spec)
    ? [{ name: 'Thumb Notch', x: (g.xSideLR + g.xBackR) / 2, y: g.yBodyTop + spec.D * (5 / 57) }]
    : []);
}


/* structures/tuck/T001/T001_renderer.js */
// ============================================================
// T001_renderer.js - T001 SVG rendering, labels, dimensions, and exports
// Depends on T001_spec.js and T001_layout.js.
// ============================================================

function T001_styleBlock() {
  return '<style>' +
    '.cut-area{fill:#ffffff;stroke:none;}' +
    '.glue-area{fill:#d4d4d4;opacity:0.72;stroke:none;}' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.75;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.75;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.5;stroke-dasharray:2.5 2;vector-effect:non-scaling-stroke;}' +
    '.label{fill:#333;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '.dim{fill:#111;font-family:"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif;pointer-events:none;}' +
    '</style>';
}

function T001_exportStyleBlock() {
  return '<style>' +
    '.cut-fill{fill:none;stroke:#cc0000;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;}' +
    '.bleed{fill:none;stroke:#0055ff;stroke-width:0.7;stroke-linejoin:round;stroke-linecap:round;}' +
    '.fold{fill:none;stroke:#1d6fe8;stroke-width:0.3;stroke-dasharray:2.5 2;}' +
    '</style>';
}

function T001_arrowMarkerDef(size, markerId, markerUnits) {
  const s = T001_num(size || 10);
  const mid = T001_num(s / 2);
  const id = markerId || 'arrow';
  const units = markerUnits ? ' markerUnits="' + markerUnits + '"' : '';
  return '<marker id="' + id + '" markerWidth="' + s + '" markerHeight="' + s + '" refX="' + s + '" refY="' + mid + '" orient="auto-start-reverse"' + units + '>' +
    '<path d="M0,0 L' + s + ',' + mid + ' L0,' + s + ' Z" fill="#111"/></marker>';
}

function T001_watermarkDef(style) {
  const wm = style || {};
  const fontSize = T001_num(wm.watermarkFontSize || 22);
  const opacity = T001_num(wm.watermarkOpacity || 0.12);
  const patternWidth = T001_num(wm.watermarkPatternWidth || 140);
  const patternHeight = T001_num(wm.watermarkPatternHeight || 100);
  const textX = T001_num(wm.watermarkTextX || 24);
  const textY = T001_num(wm.watermarkTextY || 60);
  return '<pattern id="wm" patternUnits="userSpaceOnUse" width="' + patternWidth + '" height="' + patternHeight + '" patternTransform="rotate(-25)">' +
    '<text x="' + textX + '" y="' + textY + '" font-size="' + fontSize + '" font-family="Arial,sans-serif" font-weight="700" fill="#999" opacity="' + opacity + '">PacVu</text>' +
    '</pattern>';
}

function T001_clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function T001_visualStyle(layout) {
  const refW = 256.6;
  const refH = 304.1;
  const b = layout && (layout.renderBounds || layout.bounds) ? (layout.renderBounds || layout.bounds) : { width: refW, height: refH };
  const widthScale = refW / Math.max(b.width, 1);
  const heightScale = refH / Math.max(b.height, 1);
  const fitScale = Math.min(widthScale, heightScale);
  const uiScale = T001_clamp(0.82 * Math.pow(fitScale, 0.35), 0.62, 0.82);
  return {
    uiScale,
    labelFontSize: T001_num(4.5 * uiScale),
    dimensionFontSize: T001_num(4.6 * uiScale),
    dimensionLineStroke: T001_num(0.30 * uiScale),
    dimensionTextOffset: T001_num(5 * uiScale),
    dimensionVerticalTextOffset: T001_num(4.2 * uiScale),
    arrowMarkerSize: T001_num(7.5 * uiScale),
    watermarkFontSize: 22,
    watermarkOpacity: 0.12
  };
}

// Preserve the verified T001 on-screen readability when a larger dieline is
// fitted into the same viewer. All display metrics grow by one common factor.
function T001_masterVisualStyle(layout) {
  const refW = 256.6;
  const refH = 304.1;
  const bounds = layout && (layout.bleedBounds || layout.renderBounds || layout.bounds)
    ? (layout.bleedBounds || layout.renderBounds || layout.bounds)
    : { width: refW, height: refH };
  const base = T001_visualStyle({ bounds: { width: refW, height: refH } });
  const displayScale = Math.max(bounds.width / refW, bounds.height / refH, 1);
  return {
    uiScale: T001_num(base.uiScale * displayScale),
    labelFontSize: T001_num(base.labelFontSize * displayScale),
    dimensionFontSize: T001_num(base.dimensionFontSize * displayScale),
    dimensionLineStroke: T001_num(base.dimensionLineStroke * displayScale),
    dimensionTextOffset: T001_num(base.dimensionTextOffset * displayScale),
    dimensionVerticalTextOffset: T001_num(base.dimensionVerticalTextOffset * displayScale),
    arrowMarkerSize: T001_num(base.arrowMarkerSize * displayScale),
    watermarkFontSize: T001_num(base.watermarkFontSize * displayScale),
    watermarkPatternWidth: T001_num(140 * displayScale),
    watermarkPatternHeight: T001_num(100 * displayScale),
    watermarkTextX: T001_num(24 * displayScale),
    watermarkTextY: T001_num(60 * displayScale),
    watermarkOpacity: base.watermarkOpacity
  };
}

// Shared master for in-box W / D / H dimensions. These are the approved T001
// reference metrics and must not be enlarged again from each structure's bounds.
function T001_internalDimensionStyle() {
  const visual = T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  return {
    uiScale: visual.uiScale,
    arrowMarkerSize: visual.arrowMarkerSize,
    dimensionLineStroke: visual.dimensionLineStroke,
    dimensionFontSize: visual.dimensionFontSize,
    dimensionTextOffset: visual.dimensionTextOffset,
    dimensionVerticalTextOffset: visual.dimensionVerticalTextOffset
  };
}

// T001-approved screen-space targets at the standard 90% viewer zoom.
// The DOM adapter converts these pixels back to SVG user units after fitting.
const T001_SCREEN_VISUAL_TARGET = Object.freeze({
  dimensionTextPx: 11.3,
  dimensionLinePx: 0.74,
  dimensionTextOffsetPx: 12.3,
  dimensionVerticalTextOffsetPx: 10.3,
  extensionLineOffsetPx: 0,
  internalArrowWidthPx: 4.55,
  internalArrowHeightPx: 4.55
});

const T001_PANEL_LABEL_SCREEN_STYLE = Object.freeze({
  screenPx: 11,
  minPx: 9,
  maxPx: 12,
  fontFamily: '"Arial Rounded MT Bold","Pretendard","Noto Sans KR",Arial,sans-serif',
  fontWeight: 500
});

function T001_applyScreenVisualStyle(svg, profile) {
  if (!svg || typeof svg.querySelector !== 'function') return false;
  const viewport = svg.querySelector('#viewportGroup') || svg;
  const ctm = viewport.getScreenCTM && viewport.getScreenCTM();
  if (!ctm) return false;
  const scaleX = Math.hypot(ctm.a, ctm.b);
  const scaleY = Math.hypot(ctm.c, ctm.d);
  if (!(scaleX > 0) || !(scaleY > 0)) return false;
  const familyResolver = profile && /^M\d+$/i.test(profile.templateId||'')
    ? window.PacVuMailer2DVisualCommon
    : window.PacVuTuck2DVisualCommon;
  const resolved = familyResolver
    ? familyResolver.resolveScreenStyle(profile,T001_SCREEN_VISUAL_TARGET,T001_PANEL_LABEL_SCREEN_STYLE,svg)
    : {internal:T001_SCREEN_VISUAL_TARGET,panelLabel:T001_PANEL_LABEL_SCREEN_STYLE};
  const target = resolved.internal;

  svg.querySelectorAll('#layer-labels .label').forEach(function(label) {
    const panelStyle = resolved.panelLabel;
    const panelWidthPx = Number(label.getAttribute('data-panel-width')) * scaleX;
    const panelHeightPx = Number(label.getAttribute('data-panel-height')) * scaleY;
    const estimatedTextPx = Math.max(1, (label.textContent || '').length * panelStyle.screenPx * 0.56);
    let calculatedSize = panelStyle.screenPx;
    if (panelWidthPx > 0 && panelHeightPx > 0) {
      const widthFit = panelStyle.screenPx * (panelWidthPx * 0.84 / estimatedTextPx);
      const heightFit = panelHeightPx * 0.42;
      const areaFit = panelStyle.screenPx * Math.min(1, Math.sqrt((panelWidthPx * panelHeightPx) / 2400));
      calculatedSize = Math.min(panelStyle.screenPx, widthFit, heightFit, areaFit);
    }
    const screenSize = Math.max(panelStyle.minPx, Math.min(panelStyle.maxPx, calculatedSize));
    label.setAttribute('font-size', T001_num(screenSize / scaleY));
    label.setAttribute('font-family', panelStyle.fontFamily);
    label.setAttribute('font-weight', String(panelStyle.fontWeight));
  });
  svg.querySelectorAll('#layer-dimensions line').forEach(function(line) {
    line.setAttribute('stroke-width', T001_num(target.dimensionLinePx / Math.sqrt(scaleX * scaleY)));
  });
  svg.querySelectorAll('#layer-dimensions text[data-screen-dimension]').forEach(function(text) {
    text.setAttribute('font-size', T001_num(target.dimensionTextPx / scaleY));
    if (target.preserveRendererPosition) return;
    const baseX = Number(text.getAttribute('data-anchor-x'));
    const baseY = Number(text.getAttribute('data-anchor-y'));
    const axis = text.getAttribute('data-offset-axis');
    if (axis === 'x') {
      const x = baseX + target.dimensionVerticalTextOffsetPx / scaleX;
      text.setAttribute('x', T001_num(x));
      text.setAttribute('y', T001_num(baseY));
      text.setAttribute('transform', 'rotate(-90 ' + T001_num(x) + ' ' + T001_num(baseY) + ')');
    } else {
      text.setAttribute('x', T001_num(baseX));
      text.setAttribute('y', T001_num(baseY + target.dimensionTextOffsetPx / scaleY));
      text.removeAttribute('transform');
    }
  });

  const marker = svg.querySelector('#internal-dimension-arrow');
  if (marker) {
    const width = target.internalArrowWidthPx / scaleX;
    const height = target.internalArrowHeightPx / scaleY;
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    marker.setAttribute('markerWidth', T001_num(width));
    marker.setAttribute('markerHeight', T001_num(height));
    marker.setAttribute('refX', T001_num(width));
    marker.setAttribute('refY', T001_num(height / 2));
    const path = marker.querySelector('path');
    if (path) path.setAttribute('d', 'M0,0 L' + T001_num(width) + ',' + T001_num(height / 2) + ' L0,' + T001_num(height) + ' Z');
  }
  return true;
}

// Overall dimensions follow the same bounded visual rule used by T002.
// This is intentionally separate from T001's large-dieline master scaling.
function T001_overallVisualStyle(layout) {
  const base = T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  const bounds = layout.bleedBounds || layout.bounds;
  const fit = Math.min(bounds.width / 256.6, bounds.height / 304.1);
  const displayScale = T001_clamp(fit, 1, 2.05);
  return {
    uiScale: T001_num(base.uiScale * displayScale),
    dimensionFontSize: T001_num(base.dimensionFontSize * displayScale),
    dimensionLineStroke: T001_num(base.dimensionLineStroke * displayScale),
    dimensionTextOffset: T001_num(base.dimensionTextOffset * displayScale),
    dimensionVerticalTextOffset: T001_num(base.dimensionVerticalTextOffset * displayScale),
    arrowMarkerSize: T001_num(base.arrowMarkerSize * displayScale)
  };
}

function T001_overallArrowMarkerDefs(size) {
  const s = T001_num(size || 10);
  const mid = T001_num(s / 2);
  return '<marker id="overall-arrow-start" markerWidth="' + s + '" markerHeight="' + s + '" refX="0" refY="' + mid + '" orient="auto">' +
    '<path d="M' + s + ',0 L0,' + mid + ' L' + s + ',' + s + ' Z" fill="#111"/></marker>' +
    '<marker id="overall-arrow-end" markerWidth="' + s + '" markerHeight="' + s + '" refX="' + s + '" refY="' + mid + '" orient="auto">' +
    '<path d="M0,0 L' + s + ',' + mid + ' L0,' + s + ' Z" fill="#111"/></marker>';
}

function T001_formatDimension(axis, valueMm) {
  return window.PacVuUnits
    ? window.PacVuUnits.formatDimension(axis, valueMm)
    : axis + ' ' + T001_num(valueMm) + ' mm';
}

function T001_formatSize(widthMm, heightMm) {
  return window.PacVuUnits
    ? window.PacVuUnits.formatSize(widthMm, heightMm)
    : T001_num(widthMm) + ' \u00D7 ' + T001_num(heightMm) + ' mm';
}

function T001_formatLength(valueMm) {
  return window.PacVuUnits
    ? window.PacVuUnits.formatLength(valueMm)
    : T001_num(valueMm) + ' mm';
}

function T001_glueFillPath(grid) {
  return [
    'M ' + T001_num(grid.xGlueL) + ' ' + T001_num(grid.yBodyTop),
    'L ' + T001_num(grid.xFrontL) + ' ' + T001_num(grid.yBodyTop),
    'L ' + T001_num(grid.xFrontL) + ' ' + T001_num(grid.yBodyBottom),
    'L ' + T001_num(grid.xGlueL) + ' ' + T001_num(grid.yBodyBottom),
    'Z'
  ].join(' ');
}

function T001_buildLabelLayer(layout, style) {
  const visual = style || T001_visualStyle(layout);
  let out = '  <g id="layer-labels">\n';
  layout.labels.forEach(label => {
    out += '    <text class="label" x="' + T001_num(label.x) + '" y="' + T001_num(label.y) +
      '" font-size="' + visual.labelFontSize + '" text-anchor="middle" dominant-baseline="middle"' +
      (label.panelWidth ? ' data-panel-width="' + T001_num(label.panelWidth) + '"' : '') +
      (label.panelHeight ? ' data-panel-height="' + T001_num(label.panelHeight) + '"' : '') +
      '>' + label.name + '</text>\n';
  });
  out += '  </g>\n';
  return out;
}

function T001_buildDimensionLayer(cfg, grid, style) {
  const visual = style || T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  function line(x1, y1, x2, y2, label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return '<line x1="' + T001_num(x1) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x2) + '" y2="' + T001_num(y2) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num(midX) + '" data-anchor-y="' + T001_num(midY) + '" data-offset-axis="y" x="' + T001_num(midX) + '" y="' + T001_num(midY + visual.dimensionTextOffset) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vline(x, y1, y2, label) {
    const mid = (y1 + y2) / 2;
    const textX = x + visual.dimensionVerticalTextOffset;
    return '<line x1="' + T001_num(x) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x) + '" y2="' + T001_num(y2) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num(x) + '" data-anchor-y="' + T001_num(mid) + '" data-offset-axis="x" x="' + T001_num(textX) + '" y="' + T001_num(mid) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" transform="rotate(-90 ' + T001_num(textX) + ' ' + T001_num(mid) + ')" text-anchor="middle">' + label + '</text>';
  }
  const dimY = grid.yBodyTop + cfg.H * 0.65;
  return '  <g id="layer-dimensions">' +
    line(grid.xFrontL, dimY, grid.xFrontR, dimY, T001_formatDimension('W', cfg.W)) +
    line(grid.xFrontR, dimY, grid.xSideLR, dimY, T001_formatDimension('D', cfg.D)) +
    vline(grid.xFrontR - Math.min(12, cfg.W * 0.15), grid.yBodyTop, grid.yBodyBottom, T001_formatDimension('H', cfg.H)) +
    '</g>\n';
}

function T001_buildAdaptiveDimensionLayer(cfg, grid, style) {
  const visual = style || T001_visualStyle({ bounds: { width: 256.6, height: 304.1 } });
  function horizontal(x1, x2, y, label) {
    const span = Math.abs(x2 - x1);
    const estimated = Math.max(1, String(label).length * visual.dimensionFontSize * 0.56);
    const available = Math.max(1, span - visual.arrowMarkerSize * 2.4);
    const fontSize = T001_num(visual.dimensionFontSize * Math.max(0.62, Math.min(1, available / estimated)));
    return '<line x1="' + T001_num(x1) + '" y1="' + T001_num(y) + '" x2="' + T001_num(x2) + '" y2="' + T001_num(y) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num((x1 + x2) / 2) + '" data-anchor-y="' + T001_num(y) + '" data-offset-axis="y" x="' + T001_num((x1 + x2) / 2) + '" y="' + T001_num(y + visual.dimensionTextOffset) + '" font-size="' + fontSize + '" font-weight="600" text-anchor="middle">' + label + '</text>';
  }
  function vertical(x, y1, y2, label) {
    const textX = x - visual.dimensionVerticalTextOffset;
    return '<line x1="' + T001_num(x) + '" y1="' + T001_num(y1) + '" x2="' + T001_num(x) + '" y2="' + T001_num(y2) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#internal-dimension-arrow)" marker-end="url(#internal-dimension-arrow)"/>' +
      '<text class="dim" data-screen-dimension="1" data-anchor-x="' + T001_num(x) + '" data-anchor-y="' + T001_num((y1 + y2) / 2) + '" data-offset-axis="x" x="' + T001_num(textX) + '" y="' + T001_num((y1 + y2) / 2) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" transform="rotate(-90 ' + T001_num(textX) + ' ' + T001_num((y1 + y2) / 2) + ')" text-anchor="middle">' + label + '</text>';
  }
  const dimY = grid.yBodyTop + cfg.H * 0.65;
  const hInset = Math.min(cfg.W * 0.25, Math.max(12, visual.arrowMarkerSize * 2.2));
  return '  <g id="layer-dimensions">' +
    horizontal(grid.xFrontL, grid.xFrontR, dimY, T001_formatDimension('W', cfg.W)) +
    horizontal(grid.xFrontR, grid.xSideLR, dimY, T001_formatDimension('D', cfg.D)) +
    vertical(grid.xFrontR - hInset, grid.yBodyTop, grid.yBodyBottom, T001_formatDimension('H', cfg.H)) +
    '</g>\n';
}

function T001_buildOverallDimensionLayer(layout, style, useDedicatedMarkers) {
  const visual = style || T001_visualStyle(layout);
  const dieline = layout.dielineBounds || layout.bounds;
  const bounds = layout.bleedBounds || dieline;
  const s = visual.uiScale || 1;
  const arrowY = bounds.minY - 12 * s;
  const arrowX = bounds.maxX + 12 * s;
  const widthLabel = T001_formatLength(bounds.width);
  const heightLabel = T001_formatLength(bounds.height);
  const guideHalf = 5 * s;
  const markerStart = useDedicatedMarkers ? 'overall-arrow-start' : 'arrow';
  const markerEnd = useDedicatedMarkers ? 'overall-arrow-end' : 'arrow';
  return '  <g id="layer-overall-dimensions">' +
    '<line class="overall-ext" x1="' + T001_num(bounds.minX) + '" y1="' + T001_num(arrowY - guideHalf) + '" x2="' + T001_num(bounds.minX) + '" y2="' + T001_num(arrowY + guideHalf) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-ext" x1="' + T001_num(bounds.maxX) + '" y1="' + T001_num(arrowY - guideHalf) + '" x2="' + T001_num(bounds.maxX) + '" y2="' + T001_num(arrowY + guideHalf) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-dim" x1="' + T001_num(bounds.minX) + '" y1="' + T001_num(arrowY) + '" x2="' + T001_num(bounds.maxX) + '" y2="' + T001_num(arrowY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#' + markerStart + ')" marker-end="url(#' + markerEnd + ')"/>' +
    '<text class="dim overall-text" data-overall-axis="horizontal" x="' + T001_num((bounds.minX + bounds.maxX) / 2) + '" y="' + T001_num(arrowY - 1.5 * s) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" text-anchor="middle">' + widthLabel + '</text>' +
    '<line class="overall-ext" x1="' + T001_num(arrowX - guideHalf) + '" y1="' + T001_num(bounds.minY) + '" x2="' + T001_num(arrowX + guideHalf) + '" y2="' + T001_num(bounds.minY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-ext" x1="' + T001_num(arrowX - guideHalf) + '" y1="' + T001_num(bounds.maxY) + '" x2="' + T001_num(arrowX + guideHalf) + '" y2="' + T001_num(bounds.maxY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '"/>' +
    '<line class="overall-dim" x1="' + T001_num(arrowX) + '" y1="' + T001_num(bounds.minY) + '" x2="' + T001_num(arrowX) + '" y2="' + T001_num(bounds.maxY) + '" stroke="#111" stroke-width="' + visual.dimensionLineStroke + '" marker-start="url(#' + markerStart + ')" marker-end="url(#' + markerEnd + ')"/>' +
    '<text class="dim overall-text" data-overall-axis="vertical" x="' + T001_num(arrowX + visual.dimensionVerticalTextOffset) + '" y="' + T001_num((bounds.minY + bounds.maxY) / 2) + '" font-size="' + visual.dimensionFontSize + '" font-weight="600" transform="rotate(-90 ' + T001_num(arrowX + visual.dimensionVerticalTextOffset) + ' ' + T001_num((bounds.minY + bounds.maxY) / 2) + ')" text-anchor="middle">' + heightLabel + '</text>' +
    '</g>\n';
}

function T001_renderSVG(cfg, appState) {
  const layout = T001_getLayout(cfg.W, cfg.D, cfg.H);
  const visual = T001_masterVisualStyle(layout);
  const renderBounds = layout.renderBounds || layout.bounds;
  const pad = 80;
  const vbX = renderBounds.minX - pad;
  const vbY = renderBounds.minY - pad;
  const vbW = renderBounds.width + pad * 2;
  const vbH = renderBounds.height + pad * 2;

  let svg = '<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg" viewBox="' +
    T001_num(vbX) + ' ' + T001_num(vbY) + ' ' + T001_num(vbW) + ' ' + T001_num(vbH) +
    '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">\n';
  const internalVisual = T001_internalDimensionStyle();
  const overallVisual = T001_overallVisualStyle(layout);
  svg += '<defs>' + T001_arrowMarkerDef(visual.arrowMarkerSize) + T001_arrowMarkerDef(internalVisual.arrowMarkerSize, 'internal-dimension-arrow', 'userSpaceOnUse') + T001_overallArrowMarkerDefs(overallVisual.arrowMarkerSize) + T001_watermarkDef(visual) + T001_styleBlock() + '</defs>\n';
  svg += '<rect x="' + T001_num(vbX) + '" y="' + T001_num(vbY) + '" width="' + T001_num(vbW) + '" height="' + T001_num(vbH) + '" fill="#d0d0d0" stroke="none"/>\n';
  svg += '<g id="viewportGroup">\n';
  svg += '  <g id="layer-fill"><path class="cut-area" d="' + layout.fillPath + '"/></g>\n';
  svg += '  <g id="layer-glue-fill"><path class="glue-area" d="' + T001_glueFillPath(layout.grid) + '"/></g>\n';
  svg += '  <g id="layer-bleed">' + T001_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  svg += '  <g id="layer-cut">' + layout.cutElements.map(el => T001_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  if (!appState || appState.showFolds) {
    svg += '  <g id="layer-fold">' + layout.foldElements.map(el => T001_restyleElement(el, 'fold')).join('') + '</g>\n';
  }
  if (!appState || appState.showLabels) {
    svg += T001_buildLabelLayer(layout, visual);
  }
  if (!appState || appState.showDims) {
    svg += T001_buildAdaptiveDimensionLayer(cfg, layout.grid, visual);
    svg += T001_buildOverallDimensionLayer(layout, overallVisual, true);
  }
  svg += '  <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#wm)" pointer-events="none"/>\n';
  svg += '</g></svg>';
  return svg;
}

function T001_buildExportSVG(cfg) {
  const layout = T001_getLayout(cfg.W, cfg.D, cfg.H);
  const renderBounds = layout.renderBounds || layout.bounds;
  const pad = 5;
  const vbX = renderBounds.minX - pad;
  const vbY = renderBounds.minY - pad;
  const vbW = renderBounds.width + pad * 2;
  const vbH = renderBounds.height + pad * 2;
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
  out += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + T001_num(vbX) + ' ' + T001_num(vbY) + ' ' + T001_num(vbW) + ' ' + T001_num(vbH) + '" width="' + T001_num(vbW) + 'mm" height="' + T001_num(vbH) + 'mm">\n';
  out += '<defs>' + T001_exportStyleBlock() + '</defs>\n';
  out += '<g id="layer-bleed">' + T001_restyleElement(layout.bleedElement, 'bleed') + '</g>\n';
  out += '<g id="layer-cut">' + layout.cutElements.map(el => T001_restyleElement(el, 'cut-fill')).join('') + '</g>\n';
  out += '<g id="layer-fold">' + layout.foldElements.map(el => T001_restyleElement(el, 'fold')).join('') + '</g>\n';
  out += '</svg>';
  return out;
}

function T001_buildDXF(cfg) {
  const layout = T001_getLayout(cfg.W, cfg.D, cfg.H);
  const rows = [
    '0', 'SECTION', '2', 'HEADER',
    '9', '$ACADVER', '1', 'AC1009',
    '0', 'ENDSEC',
    '0', 'SECTION', '2', 'TABLES',
    '0', 'TABLE', '2', 'LTYPE', '70', '1',
    '0', 'LTYPE', '2', 'CONTINUOUS', '70', '0', '3', 'Solid line', '72', '65', '73', '0', '40', '0.0',
    '0', 'ENDTAB',
    '0', 'TABLE', '2', 'LAYER', '70', '4',
    '0', 'LAYER', '2', '0', '70', '0', '62', '7', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'CUT', '70', '0', '62', '1', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'FOLD', '70', '0', '62', '5', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'BLEED', '70', '0', '62', '5', '6', 'CONTINUOUS',
    '0', 'ENDTAB',
    '0', 'ENDSEC',
    '0', 'SECTION', '2', 'ENTITIES'
  ];
  const addLine = (a, b, layer) => rows.push(
    '0', 'LINE', '8', layer,
    '10', String(T001_num(a.x)), '20', String(T001_num(-a.y)), '30', '0',
    '11', String(T001_num(b.x)), '21', String(T001_num(-b.y)), '31', '0'
  );
  const addPath = (d, layer) => {
    const points = T001_flattenPathD(d || '');
    for (let index = 1; index < points.length; index += 1) {
      addLine(points[index - 1], points[index], layer);
    }
  };

  layout.cutElements.forEach(element => addPath(T001_elementToPathD(element), 'CUT'));
  layout.foldElements.forEach(element => addPath(T001_elementToPathD(element), 'FOLD'));
  addPath(T001_elementToPathD(layout.bleedElement), 'BLEED');
  rows.push('0', 'ENDSEC', '0', 'EOF');
  return rows.join('\r\n') + '\r\n';
}

  root.PacVuTemplateCore = root.PacVuTemplateCore || {};
  root.PacVuTemplateCore.T001 = Object.freeze({
    revision: "20260921-notch-fixed1",
    getSpec: T001_getSpec,
    getLayout: T001_getLayout,
    renderSVG: T001_renderSVG,
    buildExportSVG: T001_buildExportSVG,
    buildDXF: T001_buildDXF,
    upperTuckRule: window.PacVuUpperTuckRule
  });
})(window);
