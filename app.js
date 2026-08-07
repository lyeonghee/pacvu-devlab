// ============================================================
// app.js — PacVu Engine Lab
// UI 바인딩 + State + Render loop
// Engine dispatch: gbox -> M001, bbox -> T001, rbox -> R001
// ============================================================

// ============================================================
// STATE
// ============================================================
const state = {
  showSlots:  true,
  showHoles:  true,
  showPerforation: true,
  showRuler:  true,
  showCut:    true,
  showBleed:  true,
  showFolds:  true,
  showLabels: true,
  showDims:   true,
  zoom: 0.9, panX: 0, panY: 0,
  isDragging: false, dragStartX: 0, dragStartY: 0,
  startPanX: 0, startPanY: 0,
  currentSVGString: '', fitInitialized: false,
  baseVB: null
};

let selectedBoxMeta = {
  categoryKey: 'mailer',
  engineKey:   'gbox',
  variantKey:  'M001'
};

let BOX_LIBRARY = [];

function isSSeriesSelection(box = selectedBoxMeta) {
  return box.categoryKey === 'sleeve_slide' ||
    box.engineKey === 'sSeries' ||
    box.variantKey === 'S001' ||
    box.type === 'set';
}

function isS001Selection(box = selectedBoxMeta) {
  return box?.engineKey === 'sSeries' && /^S001(?:-[123])?$/.test(box?.variantKey || '');
}

function getS001ViewMode(box = selectedBoxMeta) {
  return box?.variantKey === 'S001-1' ? 'Outer Only'
    : box?.variantKey === 'S001-2' ? 'Inner Only'
    : box?.variantKey === 'S001-3' ? 'Insert Only'
    : 'All Parts';
}

function getSelectedProductDefaults(box = selectedBoxMeta) {
  const dims = box.defaultProductSize || box.defaultDims || {};
  return {
    W: dims.W ?? 298,
    D: dims.D ?? 61,
    H: dims.H ?? 292
  };
}

function isFixedDimensionsSelection(box = selectedBoxMeta) {
  return box?.sizeMode === 'fixed' || box?.allowResize === false;
}

function getFixedBakeryDimensions(engineKey) {
  if (engineKey === 'b001') return { W: 160, D: 110, H: 80 };
  if (engineKey === 'b002') return { W: 136, D: 67, H: 137 };
  return null;
}

// ============================================================
// INPUT / CONFIG
// ============================================================
function val(id, fb = 0) {
  const el = document.getElementById(id);
  if (!el) return fb;
  const n = parseFloat(el.value);
  return Number.isFinite(n) ? n : fb;
}

function dimensionVal(id, fallbackMm = 0) {
  const el = document.getElementById(id);
  if (!el) return fallbackMm;
  const storedMm = Number(el.dataset.valueMm);
  if (Number.isFinite(storedMm)) return storedMm;
  const valueMm = window.PacVuUnits
    ? window.PacVuUnits.toMillimeters(el.value)
    : parseFloat(el.value);
  return Number.isFinite(valueMm) ? valueMm : fallbackMm;
}

function setDimensionInputMm(input, valueMm) {
  if (!input) return;
  input.dataset.valueMm = String(valueMm);
  input.value = window.PacVuUnits
    ? window.PacVuUnits.formatNumber(valueMm)
    : String(valueMm);
}

// M001 (G-Type) config
function getCfg() {
  const D = dimensionVal('baseD', 229);
  const H = dimensionVal('panelH', 91);
  return {
    W: dimensionVal('baseW', 235), D, H,
    LH: D,
    FG: val('foldGap', 2),
    foldGap: val('foldGap', 2),
    BLW: H,
    BIH: val('backInsertH', 80),
    FIH: val('frontInsertH', 80),
    CR:  val('chamfer', 8),
    ni:  val('lockNeckInset', 10),
    td:  val('lockTabDepth', 12),
    th:  val('lockTabHeight', 18),
    SK:  val('insertSkew', 8),
    stringHoleEnabled: document.getElementById('stringHoleEnabled')?.checked !== false,
    holeDia:     val('holeDia', 6),
    holeGap:     val('holeGap', 70),
    holeOffsetY: val('holeOffsetY', 45)
  };
}

// T001 (B-Type) config
function getCfgT001() {
  return {
    W: dimensionVal('baseW', 57),
    D: dimensionVal('baseD', 57),
    H: dimensionVal('panelH', 177)
  };
}

function getCfgT002() {
  return {
    W: dimensionVal('baseW', 126),
    D: dimensionVal('baseD', 81),
    H: dimensionVal('panelH', 308),
    bottleTopHoleEnabled: document.getElementById('t002BottleTopHoleEnabled')?.checked !== false,
    bottleTopHoleDia: val('t002BottleTopHoleDia', 51),
    bottleTopHoleY: val('t002BottleTopHoleY', 38.5),
    neckHoleEnabled: document.getElementById('t002NeckHoleEnabled')?.checked !== false,
    neckHoleDia: val('t002NeckHoleDia', 20),
    neckHoleY: val('t002NeckHoleY', 0)
  };
}

function getCfgT003() {
  return {
    W: dimensionVal('baseW', 86.5),
    D: dimensionVal('baseD', 86.5),
    H: dimensionVal('panelH', 296),
    bottleNeckHoleEnabled: document.getElementById('t003BottleNeckHoleEnabled')?.checked !== false,
    bottleNeckHoleDia: val('t003BottleNeckHoleDia', 36)
  };
}

function getCfgT004() {
  return {
    W: dimensionVal('baseW', 130),
    D: dimensionVal('baseD', 65),
    H: dimensionVal('panelH', 190)
  };
}

function getCfgT005() {
  return {
    W: dimensionVal('baseW', 286),
    D: dimensionVal('baseD', 90),
    H: dimensionVal('panelH', 344),
    capsuleHoleEnabled: state.showHoles !== false
  };
}

function getCfgGA001() {
  return {
    W: dimensionVal('baseW', 241),
    D: dimensionVal('baseD', 127),
    H: dimensionVal('panelH', 127),
    handleHoleWidth: val('ga001HandleHoleWidth', 80),
    handleHoleHeight: val('ga001HandleHoleHeight', 25)
  };
}

// R001 (A-Type RSC) config
function getCfgR001() {
  return {
    W: dimensionVal('baseW', 285),
    D: dimensionVal('baseD', 170),
    H: dimensionVal('panelH', 120)
  };
}

function getCfgR002() {
  return {
    W: dimensionVal('baseW', 425),
    D: dimensionVal('baseD', 335),
    H: dimensionVal('panelH', 103)
  };
}

function getCfgM002() {
  return {
    W: dimensionVal('baseW', 400),
    D: dimensionVal('baseD', 308),
    H: dimensionVal('panelH', 80),
    handleHoleEnabled: document.getElementById('m002HandleHoleEnabled')?.checked !== false,
    handleHoleWidth: val('m002HandleHoleWidth', 50),
    handleHoleHeight: val('m002HandleHoleHeight', 25)
  };
}

function getCfgM003() {
  return {
    W: dimensionVal('baseW', 235),
    D: dimensionVal('baseD', 229),
    H: dimensionVal('panelH', 91),
    foldGap: val('foldGap', 2),
    stringHoleEnabled: document.getElementById('stringHoleEnabled')?.checked !== false,
    holeDia: val('holeDia', 6),
    holeGap: val('holeGap', 70),
    holeOffsetY: val('holeOffsetY', 45),
    bleed: 3
  };
}

function getCfgR003() {
  return {
    W: dimensionVal('baseW', 350),
    D: dimensionVal('baseD', 230),
    H: dimensionVal('panelH', 220)
  };
}

function getCfgR004() {
  return {
    W: dimensionVal('baseW', 280),
    D: dimensionVal('baseD', 220),
    H: dimensionVal('panelH', 190),
    handleHoleEnabled: document.getElementById('r004HandleHoleEnabled')?.checked !== false,
    handleHoleWidth: val('r004HandleHoleWidth', 75),
    handleHoleHeight: val('r004HandleHoleHeight', 25)
  };
}

function s001PresetValue(id, fallback) {
  const value = document.getElementById(id)?.value || 'Normal';
  const table = {
    Tight: fallback * 0.65,
    Normal: fallback,
    Loose: fallback * 1.6
  };
  return table[value] ?? fallback;
}

function getCfgS001() {
  const defaults = getSelectedProductDefaults();
  const base = typeof S001_getDefaultConfig === 'function' ? S001_getDefaultConfig() : {};
  return {
    W: dimensionVal('baseW', defaults.W),
    D: dimensionVal('baseD', defaults.D),
    H: dimensionVal('panelH', defaults.H),
    productW: dimensionVal('baseW', defaults.W),
    productD: dimensionVal('baseD', defaults.D),
    productH: dimensionVal('panelH', defaults.H),
    productGap: s001PresetValue('sProductPadPreset', base.productGap ?? 1.0),
    padGap: s001PresetValue('sPadTrayPreset', base.padGap ?? 1.0),
    trayGap: s001PresetValue('sTraySleevePreset', base.trayGap ?? 1.0),
    slideGap: s001PresetValue('sTraySleevePreset', base.slideGap ?? 1.5),
    paperThickness: base.paperThickness ?? 0.4,
    insertPadEnabled: true,
    showOuterSleeve: true,
    showInnerTray: true,
    showInsertPad: true,
    viewMode: getS001ViewMode(),
    outerStringHoleEnabled: document.getElementById('sOuterStringHoleEnabled')?.checked !== false,
    outerMainHoleDia: val('sOuterMainHoleDia', base.outerMainHoleDia ?? 22),
    outerSmallHoleDia: val('sOuterSmallHoleDia', base.outerSmallHoleDia ?? 6),
    outerHoleOffsetY: val('sOuterHoleOffsetY', base.outerHoleOffsetY ?? 0),
    productFitPreset: document.getElementById('sProductFitPreset')?.value || 'baseline',
    holeCount: 3
  };
}

function getCfgB001() {
  const fixed = getFixedBakeryDimensions('b001');
  return {
    W: fixed.W,
    D: fixed.D,
    H: fixed.H,
    sizeMode: 'fixed',
    allowResize: false
  };
}

function getCfgB002() {
  const fixed = getFixedBakeryDimensions('b002');
  return {
    W: fixed.W,
    D: fixed.D,
    H: fixed.H,
    sizeMode: 'fixed',
    allowResize: false,
    frontPunchEnabled: document.getElementById('b002FrontPunchEnabled')?.checked !== false
  };
}

function getCfgC001() {
  const preset = document.getElementById('c001Preset')?.value || selectedBoxMeta.defaultPreset || 'no3';
  const heightOption = document.getElementById('c001HeightOption')?.value || 'Standard';
  const customH = val('c001CustomH', 140);
  const windowMode = document.getElementById('c001Window')?.value || 'None';
  const handle = document.getElementById('c001Handle')?.value || 'Center Handle';
  const cfg = typeof C001_resolveConfig === 'function'
    ? C001_resolveConfig({ preset, heightOption, customH, windowMode, handle })
    : { preset, W: 277, D: 275, H: 140, boardW: 265, boardD: 265, boardH: 5, heightOption, windowMode, handle };

  syncC001SizeFields(cfg);
  return cfg;
}

function getCfgTR001() {
  return {
    W: dimensionVal('baseW', 282),
    D: dimensionVal('baseD', 368),
    H: dimensionVal('panelH', 140),
    frontBackHoleCount: val('tr001FrontBackHoleCount', 3),
    leftRightHoleCount: val('tr001LeftRightHoleCount', 4)
  };
}

function getCfgTR002() {
  return {
    W: dimensionVal('baseW', 200),
    D: dimensionVal('baseD', 280),
    H: dimensionVal('panelH', 100),
    frontBackHoleCount: val('tr002FrontBackHoleCount', 1),
    frontBackHoleWidth: val('tr002FrontBackHoleWidth', 30),
    frontBackHoleHeight: val('tr002FrontBackHoleHeight', 16),
    leftRightHoleCount: val('tr002LeftRightHoleCount', 1),
    leftRightHoleDiameter: val('tr002LeftRightHoleDiameter', 15)
  };
}

function getCfgTR003() {
  return {
    W: dimensionVal('baseW', 317.5),
    D: dimensionVal('baseD', 496.8875),
    H: dimensionVal('panelH', 133.35)
  };
}

// ============================================================
// DIMENSION VALIDATE (M001용)
// ============================================================
function validateDimensions(W, D, H) {
  const minBase = Math.min(W, D);
  const ratio   = H / minBase;

  let warningBox = document.getElementById('dimensionWarning');
  const hInput   = document.getElementById('panelH');

  if (!warningBox) {
    warningBox = document.createElement('div');
    warningBox.id = 'dimensionWarning';
    Object.assign(warningBox.style, {
      marginTop: '8px', padding: '6px 4px', background: 'transparent',
      border: 'none', fontSize: '11px', lineHeight: '1.5',
      fontWeight: '400', width: '100%', display: 'block', whiteSpace: 'nowrap'
    });
    const section =
      hInput?.closest('.option-card') || hInput?.closest('.setting-card') ||
      hInput?.closest('.control-card') || hInput?.closest('.panel-card') ||
      hInput?.closest('.panel-section') || hInput?.parentElement;
    section?.appendChild(warningBox);
  }

  if (ratio > 0.8) {
    warningBox.style.display = 'block';
    warningBox.style.color   = '#d93025';
    warningBox.textContent   = '⚠️비율 초과: H를 낮추거나 W/D를 높혀주세요.';
    if (hInput) hInput.style.border = '1px solid #d93025';
    return false;
  }
  if (ratio > 0.65) {
    warningBox.style.display = 'block';
    warningBox.style.color   = '#e37400';
    warningBox.textContent   = '주의: 비율이 높아 형태가 변형될 수 있습니다.';
    if (hInput) hInput.style.border = '1px solid #e37400';
    return true;
  }
  warningBox.style.display = 'none';
  warningBox.textContent   = '';
  if (hInput) hInput.style.border = '1px solid #ddd';
  return true;
}

// ============================================================
// RENDER LOOP
// ============================================================
let renderTimer = null;

function render(forceFit = false, visualReason = 'initial-render') {
  let svgStr = '';
  const eng = selectedBoxMeta.engineKey;
  if (eng !== 'gbox' && eng !== 'gbox2' && eng !== 'gbox3' && eng !== 'bbox' && eng !== 'bbox2' && eng !== 'bbox3' && eng !== 'bbox4' && eng !== 'bbox5' && eng !== 'tr001' && eng !== 'tr002' && eng !== 'tr003') updateT001DielineSizeInfo(null);

  if (eng === 'gbox') {
    const cfg = getCfg();
    validateDimensions(cfg.W, cfg.D, cfg.H);
    svgStr = M001_renderSVG(cfg, state);
    updateT001DielineSizeInfo(M001_getLayout(cfg));

  } else if (eng === 'gbox2') {
    const cfg = getCfgM002();
    svgStr = M002_renderSVG(cfg, state);
    const layout = M002_getLayout(cfg.W, cfg.D, cfg.H);
    updateT001DielineSizeInfo({
      dielineBounds: layout.dielineBounds || layout.bounds,
      bleedBounds: layout.bounds
    });

  } else if (eng === 'gbox3') {
    const cfg = getCfgM003();
    svgStr = M003_renderSVG(cfg, state);
    if (typeof M003_getDisplayMetrics === 'function') updateT001DielineSizeInfo(M003_getDisplayMetrics(cfg));

  } else if (eng === 'bbox') {
    const c = getCfgT001();
    svgStr = T001_renderSVG(c, state);
    updateT001DielineSizeInfo(T001_getLayout(c.W, c.D, c.H));

  } else if (eng === 'bbox2') {
    const c = getCfgT002();
    svgStr = T002_renderSVG(c, state);
    updateT001DielineSizeInfo(T002_getLayout(c.W, c.D, c.H));

  } else if (eng === 'bbox3') {
    const c = getCfgT003();
    svgStr = T003_renderSVG(c, state);
    updateT001DielineSizeInfo(T003_getLayout(c.W, c.D, c.H));

  } else if (eng === 'bbox4') {
    const c = getCfgT004();
    svgStr = T004_renderSVG(c, state);
    updateT001DielineSizeInfo(T004_getLayout(c.W, c.D, c.H));

  } else if (eng === 'bbox5') {
    const c = getCfgT005();
    svgStr = T005_renderSVG(c, state);
    updateT001DielineSizeInfo(T005_getLayout(c.W, c.D, c.H));

  } else if (eng === 'gable1') {
    const c = getCfgGA001();
    const layout = GA001_getLayout(c);
    svgStr = GA001_renderSVG(c, state);
    if (typeof window.PacVuGable2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuGable2DVisualCommon.getDisplayMetrics(layout));
    }

  } else if (eng === 'rbox') {
    // ── R001 A-Type RSC ──────────────────────────────────────
    const c = getCfgR001();
    svgStr = R001_renderSVG(c, state);
    updateT001DielineSizeInfo(R001_getLayout(c.W,c.D,c.H));

  } else if (eng === 'rbox2') {
    const c = getCfgR002();
    svgStr = R002_renderSVG(c, state);
    updateT001DielineSizeInfo(R002_getLayout(c.W,c.D,c.H));

  } else if (eng === 'rbox3') {
    const c = getCfgR003();
    svgStr = R003_renderSVG(c, state);
    updateT001DielineSizeInfo(R003_getLayout(c.W,c.D,c.H));

  } else if (eng === 'rbox4') {
    const c = getCfgR004();
    svgStr = R004_renderSVG(c, state);
    updateT001DielineSizeInfo(R004_getLayout(c.W,c.D,c.H,c));

  } else if (isS001Selection()) {
    const c = getCfgS001();
    svgStr = S001_renderSVG(c, state);
    updateT001DielineSizeInfo(S001_getLayout(c, state));

  } else if (eng === 'b001') {
    const c = getCfgB001();
    const layout = B001_getLayout(c.W, c.D, c.H);
    svgStr = B001_renderSVG(c, state);
    if (typeof window.PacVuBakery2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuBakery2DVisualCommon.getDisplayMetrics(layout));
    }

  } else if (eng === 'b002') {
    const c = getCfgB002();
    const layout = B002_getLayout(c.W, c.D, c.H, c);
    svgStr = B002_renderSVG(c, state);
    if (typeof window.PacVuBakery2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuBakery2DVisualCommon.getDisplayMetrics(layout));
    }

  } else if (eng === 'c001') {
    const c = getCfgC001();
    const layout = C001_getLayout(c);
    svgStr = C001_renderSVG(c, state);
    if (typeof window.PacVuCake2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuCake2DVisualCommon.getDisplayMetrics(layout));
    }

  } else if (eng === 'tr001') {
    const c = getCfgTR001();
    const layout = TR001_getLayout(c.W, c.D, c.H, c);
    svgStr = TR001_renderSVG(c, state);
    if (typeof window.PacVuTray2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuTray2DVisualCommon.getDisplayMetrics(layout));
    }

  } else if (eng === 'tr002') {
    const c = getCfgTR002();
    const layout = TR002_getLayout(c.W, c.D, c.H, c);
    svgStr = TR002_renderSVG(c, state);
    if (typeof window.PacVuTray2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuTray2DVisualCommon.getDisplayMetrics(layout));
    }

  } else if (eng === 'tr003') {
    const c = getCfgTR003();
    const layout = TR003_getLayout(c.W, c.D, c.H, c);
    svgStr = TR003_renderSVG(c, state);
    if (typeof window.PacVuTray2DVisualCommon?.getDisplayMetrics === 'function') {
      updateT001DielineSizeInfo(window.PacVuTray2DVisualCommon.getDisplayMetrics(layout));
    }

  } else {
    // 준비 중
    svgStr = `<svg id="mainSvg" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 200" width="400mm" height="200mm">
      <rect width="400" height="200" fill="#d0d0d0"/>
      <text x="200" y="100" text-anchor="middle" font-size="16" fill="#999"
            font-family="Arial,sans-serif">준비 중</text>
    </svg>`;
  }

  state.currentSVGString = svgStr;
  const host = document.getElementById('svgHost');
  if (!host) return;

  host.innerHTML = svgStr;
  state.baseVB = null;

  if (forceFit || !state.fitInitialized) {
    state.panX = 0; state.panY = 0;
    fitToScreen(visualReason);
    state.fitInitialized = true;
  } else {
    applyTransform(visualReason);
  }
}

function scheduleRender(visualReason = 'initial-render') {
  if (typeof visualReason !== 'string') visualReason = 'initial-render';
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => render(true, visualReason), 180);
}

// ============================================================
// VIEWPORT / PAN / ZOOM
// ============================================================
function applyTransform(visualReason = 'zoom') {
  const sv = document.getElementById('mainSvg');
  if (!sv || !state.baseVB) return;
  const b  = state.baseVB;
  const nw = b.w / state.zoom, nh = b.h / state.zoom;
  const nx = b.cx - nw / 2 - state.panX;
  const ny = b.cy - nh / 2 - state.panY;
  sv.setAttribute('viewBox', `${nx} ${ny} ${nw} ${nh}`);
  const g = document.getElementById('mainGroup') ||
            document.getElementById('viewportGroup') ||
            document.querySelector('#mainSvg g');
  if (g) g.removeAttribute('transform');
  const sb = document.getElementById('statusBox');
  if (sb) sb.textContent = `Zoom ${Math.round(state.zoom * 100)}%`;
  scheduleScreenVisualStyle(visualReason);
}

let screenVisualStyleFrame = null;
function scheduleScreenVisualStyle(reason = 'initial-render') {
  if (screenVisualStyleFrame) cancelAnimationFrame(screenVisualStyleFrame);
  screenVisualStyleFrame = requestAnimationFrame(() => {
    screenVisualStyleFrame = null;
    const svg = document.getElementById('mainSvg');
    if (!svg || typeof window.PacVu2DVisualEngine?.apply !== 'function') return;
    window.PacVu2DVisualEngine.apply({
      templateId: selectedBoxMeta.variantKey,
      engineKey: selectedBoxMeta.engineKey,
      svg,
      reason
    });
  });
}

function fitToScreen(visualReason = 'fit') {
  requestAnimationFrame(() => {
    const sv   = document.getElementById('mainSvg');
    const host = document.getElementById('svgHost');
    if (!sv || !host) return;
    sv.setAttribute('width', '100%');
    sv.setAttribute('height', '100%');
    const hr = host.getBoundingClientRect();
    if (!hr.width || !hr.height) return;

    // bounds 계산 — engine별
    let bounds;
    const eng = selectedBoxMeta.engineKey;
    if (eng === 'gbox') {
      const layout = M001_getLayout(getCfg());
      bounds = layout.bounds;
    } else if (eng === 'gbox2') {
      const c = getCfgM002();
      const layout = M002_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'gbox3') {
      const cfg = getCfgM003();
      bounds = typeof M003_getDisplayMetrics === 'function'
        ? M003_getDisplayMetrics(cfg).renderBounds
        : M003_getLayout(cfg).bounds;
    } else if (eng === 'bbox') {
      const c = getCfgT001();
      const layout = T001_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'bbox2') {
      const c = getCfgT002();
      const layout = T002_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'bbox3') {
      const c = getCfgT003();
      const layout = T003_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'bbox4') {
      const c = getCfgT004();
      const layout = T004_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'bbox5') {
      const c = getCfgT005();
      const layout = T005_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'gable1') {
      const layout = GA001_getLayout(getCfgGA001());
      bounds = layout.bounds;
    } else if (eng === 'rbox') {
      // ── R001 bounds ─────────────────────────────────────────
      const c = getCfgR001();
      const layout = R001_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'rbox2') {
      const c = getCfgR002();
      const layout = R002_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'rbox3') {
      const c = getCfgR003();
      const layout = R003_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (eng === 'rbox4') {
      const c = getCfgR004();
      const layout = R004_getLayout(c.W, c.D, c.H);
      bounds = layout.bounds;
    } else if (isS001Selection()) {
      const c = getCfgS001();
      const layout = S001_getLayout(c, state);
      bounds = layout.bounds;
    } else if (eng === 'b001') {
      const c = getCfgB001();
      bounds = typeof B001_getDisplayMetrics === 'function'
        ? B001_getDisplayMetrics(c).renderBounds
        : B001_getLayout(c.W, c.D, c.H).bounds;
    } else if (eng === 'b002') {
      const c = getCfgB002();
      bounds = typeof B002_getDisplayMetrics === 'function'
        ? B002_getDisplayMetrics(c).renderBounds
        : B002_getLayout(c.W, c.D, c.H, c).bounds;
    } else if (eng === 'c001') {
      const c = getCfgC001();
      const layout = C001_getLayout(c);
      bounds = layout.bounds;
    } else if (eng === 'tr001') {
      const c = getCfgTR001();
      const layout = TR001_getLayout(c.W, c.D, c.H, c);
      bounds = layout.bounds;
    } else if (eng === 'tr002') {
      const c = getCfgTR002();
      const layout = TR002_getLayout(c.W, c.D, c.H, c);
      bounds = layout.bounds;
    } else if (eng === 'tr003') {
      const c = getCfgTR003();
      const layout = TR003_getLayout(c.W, c.D, c.H, c);
      bounds = layout.bounds;
    } else {
      bounds = { minX:0, minY:0, width:400, height:200 };
    }

    const pad   = 40;
    const scaleX = (hr.width  - pad*2) / bounds.width;
    const scaleY = (hr.height - pad*2) / bounds.height;
    const scale  = Math.min(scaleX, scaleY);
    const vbW    = hr.width  / scale;
    const vbH    = hr.height / scale;
    const contentCX = bounds.minX + bounds.width  / 2;
    const contentCY = bounds.minY + bounds.height / 2;
    const vbX    = contentCX - vbW / 2;
    const vbY    = contentCY - vbH / 2;
    sv.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    state.baseVB = { x:vbX, y:vbY, w:vbW, h:vbH, cx:contentCX, cy:contentCY };
    state.zoom = 0.9; state.panX = 0; state.panY = 0;
    const g = document.getElementById('mainGroup') ||
              document.getElementById('viewportGroup') ||
              document.querySelector('#mainSvg g');
    if (g) g.removeAttribute('transform');
    const sb = document.getElementById('statusBox');
    applyTransform(visualReason);
  });
}

const ZOOM_STEPS = [0.5, 0.9, 1.0, 1.5, 2.0];
function snapZoom(current, dir) {
  const i = ZOOM_STEPS.findIndex(z => Math.abs(z - current) < 0.001);
  if (dir > 0) {
    if (i >= 0) return ZOOM_STEPS[Math.min(i+1, ZOOM_STEPS.length-1)];
    return ZOOM_STEPS.find(z => z > current) ?? ZOOM_STEPS[ZOOM_STEPS.length-1];
  } else {
    if (i >= 0) return ZOOM_STEPS[Math.max(i-1, 0)];
    return [...ZOOM_STEPS].reverse().find(z => z < current) ?? ZOOM_STEPS[0];
  }
}
function zoomAt(nextZoom) {
  state.zoom = Math.max(0.5, Math.min(2.0, nextZoom));
  applyTransform();
}

// ============================================================
// EXPORT SVG / DXF
// ============================================================
function buildExportSVG(cfg, eng) {
  if (eng === 'gable1') {
    return typeof window.GA001_buildExportSVG === 'function'
      ? window.GA001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'gbox') {
    return typeof window.M001_buildExportSVG === 'function'
      ? window.M001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'gbox2') {
    return typeof M002_buildExportSVG === 'function'
      ? M002_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'gbox3') {
    return typeof M003_buildExportSVG === 'function'
      ? M003_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'bbox') {
    return typeof T001_buildExportSVG === 'function'
      ? T001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'bbox2') {
    return typeof T002_buildExportSVG === 'function'
      ? T002_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'bbox3') {
    return typeof T003_buildExportSVG === 'function'
      ? T003_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'bbox4') {
    return typeof T004_buildExportSVG === 'function'
      ? T004_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'bbox5') {
    return typeof T005_buildExportSVG === 'function'
      ? T005_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'rbox') {
    return typeof R001_buildExportSVG === 'function'
      ? R001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'rbox2') {
    return typeof R002_buildExportSVG === 'function'
      ? R002_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'rbox3') {
    return typeof R003_buildExportSVG === 'function'
      ? R003_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'rbox4') {
    return typeof R004_buildExportSVG === 'function'
      ? R004_buildExportSVG(cfg)
      : '';
  }

  if (isS001Selection()) {
    return typeof S001_buildExportSVG === 'function'
      ? S001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'b001') {
    return typeof B001_buildExportSVG === 'function'
      ? B001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'b002') {
    return typeof B002_buildExportSVG === 'function'
      ? B002_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'c001') {
    return typeof C001_buildExportSVG === 'function'
      ? C001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'tr001') {
    return typeof TR001_buildExportSVG === 'function'
      ? TR001_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'tr002') {
    return typeof TR002_buildExportSVG === 'function'
      ? TR002_buildExportSVG(cfg)
      : '';
  }

  if (eng === 'tr003') {
    return typeof TR003_buildExportSVG === 'function'
      ? TR003_buildExportSVG(cfg)
      : '';
  }

  return '';
}

function buildDXF(cfg, eng) {
  if (eng === 'gbox') return typeof M001_buildDXF === 'function' ? M001_buildDXF(cfg) : '';
  if (eng === 'gbox2') return typeof M002_buildDXF === 'function' ? M002_buildDXF(cfg) : '';
  if (eng === 'gbox3') return typeof M003_buildDXF === 'function' ? M003_buildDXF(cfg) : '';
  if (eng === 'bbox') return typeof T001_buildDXF === 'function' ? T001_buildDXF(cfg) : '';
  if (eng === 'bbox2') return typeof T002_buildDXF === 'function' ? T002_buildDXF(cfg) : '';
  if (eng === 'bbox3') return typeof T003_buildDXF === 'function' ? T003_buildDXF(cfg) : '';
  if (eng === 'bbox4') return typeof T004_buildDXF === 'function' ? T004_buildDXF(cfg) : '';
  if (eng === 'bbox5') return typeof T005_buildDXF === 'function' ? T005_buildDXF(cfg) : '';
  if (eng === 'rbox') return typeof R001_buildDXF === 'function' ? R001_buildDXF(cfg) : '';
  if (eng === 'rbox2') return typeof R002_buildDXF === 'function' ? R002_buildDXF(cfg) : '';
  if (eng === 'rbox3') return typeof R003_buildDXF === 'function' ? R003_buildDXF(cfg) : '';
  if (eng === 'rbox4') return typeof R004_buildDXF === 'function' ? R004_buildDXF(cfg) : '';
  if (isS001Selection()) return typeof S001_buildDXF === 'function' ? S001_buildDXF(cfg) : '';
  if (eng === 'b001') return typeof B001_buildDXF === 'function' ? B001_buildDXF(cfg) : '';
  if (eng === 'b002') return typeof B002_buildDXF === 'function' ? B002_buildDXF(cfg) : '';
  if (eng === 'c001') return typeof C001_buildDXF === 'function' ? C001_buildDXF(cfg) : '';
  if (eng === 'tr001') return typeof TR001_buildDXF === 'function' ? TR001_buildDXF(cfg) : '';
  if (eng === 'tr002') return typeof TR002_buildDXF === 'function' ? TR002_buildDXF(cfg) : '';
  if (eng === 'tr003') return typeof TR003_buildDXF === 'function' ? TR003_buildDXF(cfg) : '';
  return '';
}

function buildPDF(cfg, eng) {
  if (eng === 'gbox') return typeof M001_buildPDF === 'function' ? M001_buildPDF(cfg) : '';
  if (eng === 'gbox2') return typeof M002_buildPDF === 'function' ? M002_buildPDF(cfg) : '';
  if (eng === 'gbox3') return typeof M003_buildPDF === 'function' ? M003_buildPDF(cfg) : '';
  if (eng === 'b001') return typeof B001_buildPDF === 'function' ? B001_buildPDF(cfg) : '';
  if (eng === 'c001') return typeof C001_buildPDF === 'function' ? C001_buildPDF(cfg) : '';
  if (eng === 'tr001') return typeof TR001_buildPDF === 'function' ? TR001_buildPDF(cfg) : '';
  if (eng === 'tr002') return typeof TR002_buildPDF === 'function' ? TR002_buildPDF(cfg) : '';
  if (eng === 'tr003') return typeof TR003_buildPDF === 'function' ? TR003_buildPDF(cfg) : '';
  return '';
}

function downloadS001PartSVG(part, label) {
  if (!isSSeriesSelection() || selectedBoxMeta.variantKey !== 'S001') return;
  if (typeof S001_buildExportSVG !== 'function') return;
  const cfg = getCfgS001();
  const svgOut = S001_buildExportSVG(cfg, { part });

  if (!svgOut || !svgOut.trim()) {
    console.warn('[S001 part SVG export empty]', { part, cfg });
    return;
  }

  const dim = `${cfg.W}x${cfg.D}x${cfg.H}`;
  const name = `PacVu_S001_${label}_${dim}mm.svg`;
  downloadFile(name, svgOut, 'image/svg+xml');
}

// ============================================================
// BOX LIBRARY SELECT
// ============================================================
function initBoxLibrarySelect() {
  const categoryEl = document.getElementById('boxCategory');
  const typeEl     = document.getElementById('boxType');
  if (!categoryEl || !typeEl) return;

  categoryEl.innerHTML = '';
  BOX_LIBRARY.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.categoryKey;
    opt.textContent = cat.categoryLabel;
    categoryEl.appendChild(opt);
  });

  const fillTypeSelect = () => {
    const cat = BOX_LIBRARY.find(c => c.categoryKey === categoryEl.value) || BOX_LIBRARY[0];
    typeEl.innerHTML = '';
    if (!cat.items.length) {
      const empty = document.createElement('option');
      empty.value = ''; empty.textContent = '준비 중';
      typeEl.appendChild(empty);
      selectedBoxMeta = { categoryKey: cat.categoryKey, engineKey: '', variantKey: '', type: '' };
      updatePerforationSettings();
      updateSSetPanelMode();
      updateC001PanelMode();
      updateFixedDimensionsMode();
      return;
    }
    cat.items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = `${item.engineKey}:${item.variantKey}`;
      opt.textContent = item.label;
      opt.dataset.engine     = item.engineKey;
      opt.dataset.variant    = item.variantKey;
      opt.dataset.fefco      = item.fefcoCode;
      opt.dataset.koreanName = item.koreanName;
      opt.dataset.type       = item.type || '';
      opt.dataset.defaultW   = item.defaultDims?.W ?? 235;
      opt.dataset.defaultD   = item.defaultDims?.D ?? 229;
      opt.dataset.defaultH   = item.defaultDims?.H ?? 91;
      typeEl.appendChild(opt);
    });
    _applySelectedBox(cat.items[0], typeEl.options[0], cat);
  };

  categoryEl.addEventListener('change', () => { fillTypeSelect(); scheduleRender(); });
  typeEl.addEventListener('change', () => {
    const opt = typeEl.selectedOptions[0];
    const item = BOX_LIBRARY
      .find(c => c.categoryKey === categoryEl.value)?.items
      .find(i => `${i.engineKey}:${i.variantKey}` === opt?.value);
    const cat = BOX_LIBRARY.find(c => c.categoryKey === categoryEl.value);
    if (item) _applySelectedBox(item, opt, cat);
    scheduleRender();
  });

  // 초기값: mailer 카테고리
  categoryEl.value = 'mailer';
  fillTypeSelect();
}

function _applySelectedBox(item, opt, cat) {
  selectedBoxMeta = {
    categoryKey: cat?.categoryKey || item.categoryKey || '',
    engineKey:   item.engineKey,
    variantKey:  item.variantKey,
    fefcoCode:   item.fefcoCode,
    label:       item.label,
    koreanName:  item.koreanName,
    export:      item.export || null,
    type:        item.type || '',
    defaultDims: item.defaultDims || null,
    sizeMode: item.sizeMode || 'resizable',
    allowResize: item.allowResize !== false,
    defaultPreset: item.defaultPreset || '',
    defaultProductSize: item.defaultProductSize || null
  };
  const defaults = isSSeriesSelection(selectedBoxMeta)
    ? getSelectedProductDefaults(selectedBoxMeta)
    : item.defaultDims;
  if (defaults) {
    const dW = document.getElementById('baseW');
    const dD = document.getElementById('baseD');
    const dH = document.getElementById('panelH');
    setDimensionInputMm(dW, defaults.W);
    setDimensionInputMm(dD, defaults.D);
    setDimensionInputMm(dH, defaults.H);
  }
  updatePerforationSettings();
  updateSSetPanelMode();
  updateC001PanelMode();
  updateFixedDimensionsMode();
  updatePacVuTemplateRule();
}

function legacySetupPanelUi() {
  const optionGrid = document.querySelector('.option-grid');
  const displayBody = optionGrid?.closest('.group-body');
  if (optionGrid && displayBody) {
    optionGrid.innerHTML = [
      '<label><span>눈금자</span><input id="showRuler" type="checkbox" checked></label>',
      '<label><span>치수선</span><input id="showDims" type="checkbox" checked></label>',
      '<label><span>패널명</span><input id="showLabels" type="checkbox" checked></label>',
      '<label><span>재단선</span><input id="showCut" type="checkbox" checked></label>',
      '<label><span>접힘선</span><input id="showFolds" type="checkbox" checked></label>',
      '<label><span>블리드</span><input id="showBleed" type="checkbox" checked></label>',
      '<label><span>타공 표시</span><input id="showPerforation" type="checkbox" checked></label>'
    ].join('');

    Array.from(displayBody.children).forEach(child => {
      if (child !== optionGrid) child.remove();
    });
  }

  const sidebarInner = document.querySelector('.sidebar-inner');
  const hint = document.querySelector('.hint');
  if (!sidebarInner || document.getElementById('perforationSettings')) {
    updateLegendUi();
    return;
  }

  const section = document.createElement('details');
  section.id = 'perforationSettings';
  section.className = 'group';
  section.open = true;
  section.hidden = true;
  section.innerHTML = [
    '<summary>타공 설정</summary>',
    '<div class="group-body">',
    '<details class="sub-group perforation-item" data-engines="gbox gbox3" open>',
    '<summary>끈구멍</summary>',
    '<div class="row"><label>사용</label><input id="stringHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>지름</label><input id="holeDia" type="number" step="0.5" value="6"></div>',
    '<div class="row"><label>간격</label><input id="holeGap" type="number" step="1" value="70"></div>',
    '<div class="row"><label>Y 위치</label><input id="holeOffsetY" type="number" step="0.5" value="45"></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="bbox3" open>',
    '<summary>병목홀 / Bottle Neck Hole</summary>',
    '<div class="row"><label>사용</label><input id="t003BottleNeckHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>지름</label><input id="t003BottleNeckHoleDia" type="number" step="0.5" value="36"></div>',
    '<div class="row"><label>기준 패널</label><input type="text" value="Inner" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="gbox2" open>',
    '<summary>손잡이 홀</summary>',
    '<div class="row"><label>사용</label><input id="m002HandleHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>가로</label><input id="m002HandleHoleWidth" type="number" step="0.5" value="50"></div>',
    '<div class="row"><label>세로</label><input id="m002HandleHoleHeight" type="number" step="0.5" value="25"></div>',
    '<div class="row"><label>패널</label><input type="text" value="Back Insert" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="rbox4" open>',
    '<summary>손잡이 홀</summary>',
    '<div class="row"><label>사용</label><input id="r004HandleHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>가로</label><input id="r004HandleHoleWidth" type="number" step="0.5" value="75"></div>',
    '<div class="row"><label>세로</label><input id="r004HandleHoleHeight" type="number" step="0.5" value="25"></div>',
    '<div class="row"><label>패널</label><input type="text" value="Side" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="b002" open>',
    '<summary>B002 전면 선택 타공</summary>',
    '<div class="row"><label>사용</label><input id="b002FrontPunchEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>필수 슬롯/손잡이</label><input type="text" value="항상 타공" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="bbox2" open>',
    '<summary>병상단 홀 / Bottle Top Hole</summary>',
    '<div class="row"><label>사용</label><input id="t002BottleTopHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>지름</label><input id="t002BottleTopHoleDia" type="number" step="0.5" value="51"></div>',
    '<div class="row"><label>기준 패널</label><input type="text" value="Bottle Top" readonly></div>',
    '<div class="row"><label>X 위치</label><input type="text" value="중앙" readonly></div>',
    '<div class="row"><label>Y 위치</label><input id="t002BottleTopHoleY" type="number" step="0.5" value="38.5"></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="bbox2" open>',
    '<summary>병목 홀 / Neck Hole</summary>',
    '<div class="row"><label>사용</label><input id="t002NeckHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>지름</label><input id="t002NeckHoleDia" type="number" step="0.5" value="20"></div>',
    '<div class="row"><label>기준 패널</label><input type="text" value="Back" readonly></div>',
    '<div class="row"><label>X 위치</label><input type="text" value="중앙" readonly></div>',
    '<div class="row"><label>Y 위치</label><input id="t002NeckHoleY" type="number" step="0.5" value="0"></div>',
    '</details>',
    '</div>'
  ].join('');

  sidebarInner.insertBefore(section, hint || null);
  updateLegendUi();
}

function legacyUpdateLegendUi() {
  const legend = document.querySelector('.legend');
  if (!legend) return;
  legend.innerHTML = [
    '<div><span class="ln fold-ln"></span>접힘선</div>',
    '<div><span class="ln cut-ln"></span>재단선</div>',
    '<div><span class="ln perf-ln"></span>타공선</div>',
    '<div><span class="ln bleed-ln"></span>블리드</div>'
  ].join('');
}

function updatePerforationSettings() {
  const section = document.getElementById('perforationSettings');
  if (!section) return;
  const eng = selectedBoxMeta.engineKey || '';
  let hasVisible = false;

  section.querySelectorAll('.perforation-item').forEach(item => {
    const engines = (item.dataset.engines || '').split(/\s+/).filter(Boolean);
    const visible = engines.includes(eng);
    item.hidden = !visible;
    if (visible) hasVisible = true;
  });

  section.hidden = !hasVisible;
}

function getSizePanelGroup() {
  return document.getElementById('baseW')?.closest('details.group') || null;
}

const PACVU_TEMPLATE_RULES = {
  sSeries: {
    ariaLabel: 'S001 assembly system structure rule',
    kicker: 'Structure Rule',
    name: 'Assembly System',
    descriptions: [
      'Assembly · Outer Sleeve · Inner Tray · Insert Pad',
      'All views share one approved geometry source.'
    ]
  },
  b001: {
    ariaLabel: 'B001 Bakery Box fixed structure rule',
    kicker: 'Structure Rule',
    name: 'Bakery Box · Fixed Dimensions',
    descriptions: [
      'Fixed dimensions: 160 × 110 × 80 mm',
      'This template does not support W · D · H resizing.'
    ]
  },
  b002: {
    ariaLabel: 'B002 Bakery Handle Box fixed structure rule',
    kicker: 'Structure Rule',
    name: 'Bakery Handle Box · Fixed Dimensions',
    descriptions: [
      'Fixed dimensions: 136 × 67 × 137 mm',
      'This template does not support W · D · H resizing.'
    ]
  },
  bbox: {
    ariaLabel: 'T001 Thumb Notch automatic rule',
    kicker: 'ⓘ Auto Rule',
    name: 'Thumb Notch',
    descriptions: [
      'Visible when W < 100 mm',
      'Hidden when W ≥ 100 mm'
    ]
  },
  gable1: {
    ariaLabel: 'GA001 Gable Box structure rule',
    kicker: 'ⓘ Structure Rule',
    name: 'Gable Handle Assembly',
    descriptions: [
      'Body follows W · D · H',
      'Handle Hole · Shoulder · Ear · Top Bridge · Side Slot move as one assembly'
    ]
  },
  tr001: {
    ariaLabel: 'TR001 Tray Box structure rule',
    kicker: 'Structure Rule',
    name: 'EB Tray Assembly',
    descriptions: [
      '기본 패널은 W·D·H에 따라 조절됩니다.',
      'Insert Lid·Dust Flap·Side Flap은 하나의 Tray 구조로 연결됩니다.'
    ]
  },
  tr002: {
    ariaLabel: 'TR002 Tray Box structure rule',
    kicker: 'Structure Rule',
    name: 'EB Tray Assembly',
    descriptions: [
      '기본 패널은 W·D·H에 따라 조절됩니다.',
      'Insert Lid·Dust Flap·Side Flap과 타공 옵션이 함께 적용됩니다.'
    ]
  },
  tr003: {
    ariaLabel: 'TR003 Tray Box structure rule',
    kicker: 'Structure Rule',
    name: 'Tray Assembly',
    descriptions: [
      '기본 패널은 W·D·H에 따라 조절됩니다.',
      'Insert Lid·Front·Back·Side Flap은 하나의 Tray 구조로 연결됩니다.'
    ]
  },
  c001: {
    ariaLabel: 'C001 Cake Box preset structure rule',
    kicker: 'Structure Rule',
    name: 'Cake Box · Size Preset',
    descriptions: [
      'Five approved presets: Mini · No.1 · No.2 · No.3 · No.4',
      'Board clearance: W +12 mm · D +10 mm'
    ]
  }
};

function syncPacVuInfoPanelFrame() {
  const viewer = document.querySelector('.viewer-wrap');
  const toolbar = viewer?.querySelector('.toolbar');
  const panel = document.getElementById('pacvuInfoPanel');
  if (!viewer || !toolbar || !panel) return;
  const toolbarRect = toolbar.getBoundingClientRect();
  const viewerRect = viewer.getBoundingClientRect();
  panel.style.left = (toolbarRect.left - viewerRect.left) + 'px';
  panel.style.top = (toolbarRect.bottom - viewerRect.top + 6) + 'px';
  panel.style.width = Math.max(toolbarRect.width, isS001Selection() ? 390 : 280) + 'px';
}

function observePacVuInfoPanelFrame() {
  const toolbar = document.querySelector('.viewer-wrap .toolbar');
  if (!toolbar || toolbar.dataset.infoPanelObserved === 'true') return;
  toolbar.dataset.infoPanelObserved = 'true';
  if (window.ResizeObserver) {
    new ResizeObserver(syncPacVuInfoPanelFrame).observe(toolbar);
  }
  window.addEventListener('resize', syncPacVuInfoPanelFrame);
  requestAnimationFrame(syncPacVuInfoPanelFrame);
}

function ensurePacVuInfoPanel() {
  const viewer = document.querySelector('.viewer-wrap');
  if (!viewer) return null;
  let panel = document.getElementById('pacvuInfoPanel');
  if (panel) return panel;
  panel = document.createElement('aside');
  panel.id = 'pacvuInfoPanel';
  panel.className = 'pacvu-info-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'PacVu structure information');
  panel.innerHTML = [
    '<button type="button" id="pacvuInfoMockup3dBtn" class="pacvu-info-mockup-button">3D MOCKUP viewer</button>',
    '<div class="pacvu-unit-tabs" role="group" aria-label="Display unit">',
    '<button type="button" data-unit="mm">mm</button>',
    '<button type="button" data-unit="in">inch</button>',
    '</div>',
    '<div class="pacvu-info-sizes">',
    '<div><span>Dieline Size</span><strong id="pacvuDielineSizeValue"></strong></div>',
    '<div><span>Bleed Size</span><strong id="pacvuBleedSizeValue"></strong></div>',
    '</div>',
    '<div class="pacvu-component-sizes" id="pacvuComponentSizes" hidden></div>',
    '<div class="pacvu-components-section" id="pacvuComponentsSection" hidden>',
    '<div class="pacvu-template-rule-label">Components</div>',
    '<label><span>Outer Sleeve</span><input id="sShowOuterSleeve" data-variant="S001-1" type="checkbox" role="switch"></label>',
    '<label><span>Inner Tray</span><input id="sShowInnerTray" data-variant="S001-2" type="checkbox" role="switch"></label>',
    '<label><span>Insert Pad</span><input id="sShowInsertPad" data-variant="S001-3" type="checkbox" role="switch"></label>',
    '</div>',
    '<div class="pacvu-template-rule-section" id="pacvuTemplateRuleSection">',
    '<div class="pacvu-template-rule-label">Template Rule</div>',
    '<div class="pacvu-info-rule" id="pacvuTemplateRuleContent"></div>',
    '</div>'
  ].join('');
  panel.querySelector('#pacvuInfoMockup3dBtn')?.addEventListener('click', () => {
    const toolbarButton = document.getElementById('mockup3dBtn');
    if (toolbarButton && !toolbarButton.disabled) toolbarButton.click();
  });
  panel.querySelectorAll('#pacvuComponentsSection input[type=checkbox]').forEach(control => {
    control.addEventListener('change', () => {
      const variant = control.checked ? control.dataset.variant : 'S001';
      const optionValue = 'sSeries:' + variant;
      const boxTypeSelect = document.getElementById('boxType');
      if (boxTypeSelect && Array.from(boxTypeSelect.options).some(option => option.value === optionValue)) {
        boxTypeSelect.value = optionValue;
        boxTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
  viewer.appendChild(panel);
  window.PacVuSyncMockupButtons?.();
  observePacVuInfoPanelFrame();
  return panel;
}

function ensureDimensionUnitControl() {
  document.getElementById('dimensionUnitRow')?.remove();
  const panel = ensurePacVuInfoPanel();
  if (!panel || panel.dataset.unitBound === 'true') return panel;
  panel.dataset.unitBound = 'true';
  panel.querySelectorAll('[data-unit]').forEach(button => button.addEventListener('click', () => {
    const units = window.PacVuUnits;
    if (!units) return;
    const previousUnit = units.getUnit();
    const valuesMm = ['baseW', 'baseD', 'panelH'].map(id => {
      const input = document.getElementById(id);
      if (!input) return NaN;
      const storedMm = Number(input.dataset.valueMm);
      return Number.isFinite(storedMm) ? storedMm : units.toMillimeters(input.value, previousUnit);
    });
    units.setUnit(button.dataset.unit);
    ['baseW', 'baseD', 'panelH'].forEach((id, index) => {
      const input = document.getElementById(id);
      if (input) input.type = units.getUnit() === units.UNITS.IN ? 'text' : 'number';
      if (input && Number.isFinite(valuesMm[index])) setDimensionInputMm(input, valuesMm[index]);
      if (input) input.step = units.getUnit() === units.UNITS.IN ? '0.01' : '1';
    });
    panel.querySelectorAll('[data-unit]').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.unit === units.getUnit());
      tab.setAttribute('aria-pressed', String(tab.dataset.unit === units.getUnit()));
    });
    scheduleRender('unit-change');
  }));
  return panel;
}

function updateT001DielineSizeInfo(layout) {
  document.getElementById('t001DielineSizeInfo')?.remove();
  const info = ensurePacVuInfoPanel();
  if (!info) return;
  info.hidden = !layout;
  if (!layout) return;
  const units = window.PacVuUnits;
  const standardSizes = info.querySelector('.pacvu-info-sizes');
  const componentSizes = info.querySelector('#pacvuComponentSizes');
  const isS001Layout = layout.engineKey === 'sSeries' && layout.componentMetrics;
  const isS001Assembly = isS001Layout && selectedBoxMeta.variantKey === 'S001';
  const unitScale = isS001Layout && typeof S001_UNIT_PER_MM !== 'undefined' ? S001_UNIT_PER_MM : 1;
  if (standardSizes) standardSizes.hidden = isS001Assembly;
  if (componentSizes) componentSizes.hidden = !isS001Assembly;
  if (isS001Assembly && componentSizes) {
    const formatComponent = bounds => units
      ? units.formatSize(bounds.width / unitScale, bounds.height / unitScale)
      : `${bounds.width / unitScale} × ${bounds.height / unitScale} mm`;
    const rows = [
      ['Outer Sleeve', layout.componentMetrics.outerSleeve],
      ['Inner Tray', layout.componentMetrics.innerTray],
      ['Insert Pad', layout.componentMetrics.insertPad]
    ];
    componentSizes.innerHTML = rows.map(([label, metrics]) =>
      '<section><h4>' + label + '</h4>' +
      '<div><span>Dieline Size</span><strong>' + formatComponent(metrics.dieline) + '</strong></div>' +
      '<div><span>Bleed Size</span><strong>' + formatComponent(metrics.bleed) + '</strong></div></section>'
    ).join('');
  }
  const selectedMetricKey = selectedBoxMeta.variantKey === 'S001-1' ? 'outerSleeve'
    : selectedBoxMeta.variantKey === 'S001-2' ? 'innerTray'
    : selectedBoxMeta.variantKey === 'S001-3' ? 'insertPad'
    : null;
  const selectedMetrics = selectedMetricKey ? layout.componentMetrics?.[selectedMetricKey] : null;
  const dieline = selectedMetrics?.dieline || layout.dielineBounds || layout.bounds;
  const bleed = selectedMetrics?.bleed || layout.bleedBounds || dieline;
  const format = bounds => units
    ? units.formatSize(bounds.width / unitScale, bounds.height / unitScale)
    : `${bounds.width} × ${bounds.height} mm`;
  document.getElementById('pacvuDielineSizeValue').textContent = format(dieline);
  document.getElementById('pacvuBleedSizeValue').textContent = format(bleed);
  info.querySelectorAll('[data-unit]').forEach(tab => {
    const active = tab.dataset.unit === units?.getUnit();
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
}

function ensureFixedDimensionsBadge() {
  const group = getSizePanelGroup();
  const body = group?.querySelector(':scope > .group-body');
  if (!body) return null;
  let badge = document.getElementById('fixedDimensionsBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'fixedDimensionsBadge';
    badge.className = 'fixed-dimensions-badge';
    badge.hidden = true;
    body.insertBefore(badge, body.firstChild);
  }
  return badge;
}

function ensurePacVuTemplateRule() {
  return ensurePacVuInfoPanel()?.querySelector('#pacvuTemplateRuleContent') || null;
}

function updatePacVuTemplateRule() {
  const notice = ensurePacVuTemplateRule();
  const section = document.getElementById('pacvuTemplateRuleSection');
  const rule = PACVU_TEMPLATE_RULES[selectedBoxMeta.engineKey];
  if (notice && rule) {
    notice.setAttribute('aria-label', rule.ariaLabel);
    notice.innerHTML = [
      '<div class="pacvu-info-kicker">' + rule.kicker + '</div>',
      '<div class="pacvu-info-rule-name">' + rule.name + '</div>',
      ...rule.descriptions.map(description => '<div>' + description + '</div>')
    ].join('');
  }
  if (section) section.hidden = !rule;
  const panel = document.getElementById('pacvuInfoPanel');
  if (panel) panel.hidden = !rule;
}

function updateFixedDimensionsMode() {
  const fixed = isFixedDimensionsSelection();
  const dimensions = fixed
    ? (getFixedBakeryDimensions(selectedBoxMeta.engineKey) || selectedBoxMeta.defaultDims)
    : null;
  const badge = ensureFixedDimensionsBadge();

  ['baseW', 'baseD', 'panelH'].forEach((id, index) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.disabled = fixed;
    if (fixed && dimensions) {
      setDimensionInputMm(input, [dimensions.W, dimensions.D, dimensions.H][index]);
    }
  });

  if (badge) {
    badge.hidden = !fixed;
    badge.textContent = fixed && dimensions
      ? 'Fixed Dimensions · ' + dimensions.W + ' × ' + dimensions.D + ' × ' + dimensions.H + ' mm'
      : '';
  }
  var shippingLimits={
    rbox:[[60,2000],[50,1500],[40,1500]],rbox2:[[80,2000],[60,1500],[40,1500]],
    rbox3:[[60,2000],[50,1500],[40,1500]],rbox4:[[80,2000],[100,1500],[50,1500]]
  }[selectedBoxMeta.engineKey];
  var gableLimits=selectedBoxMeta.engineKey==='gable1'
    ? [[121,null],[121,null],[null,null]]
    : null;
  ['baseW','baseD','panelH'].forEach(function(id,index){
    var input=document.getElementById(id);if(!input)return;
    if(shippingLimits){input.min=shippingLimits[index][0];input.max=shippingLimits[index][1];}
    else if(gableLimits){
      if(gableLimits[index][0]!==null)input.min=gableLimits[index][0];else input.removeAttribute('min');
      if(gableLimits[index][1]!==null)input.max=gableLimits[index][1];else input.removeAttribute('max');
    }
    else{input.removeAttribute('min');input.removeAttribute('max');}
  });
}

function setSizePanelMode(isSSet) {
  const group = getSizePanelGroup();
  if (!group) return;
  const summary = group.querySelector(':scope > summary');
  const labels = {
    baseW: isSSet ? 'Outer W' : 'Width (W)',
    baseD: isSSet ? 'Outer D' : 'Depth (D)',
    panelH: isSSet ? 'Outer H' : 'Height (H)'
  };

  if (summary) {
    summary.textContent = isSSet ? 'Outer Box Size' : '박스 기본 치수';
  }

  Object.keys(labels).forEach(id => {
    const rowLabel = document.getElementById(id)?.closest('.row')?.querySelector('label');
    if (rowLabel) rowLabel.textContent = labels[id];
  });
}

function ensureSSetPanel() {
  let panel = document.getElementById('sSeriesSetPanel');
  if (panel) return panel;

  const sidebarInner = document.querySelector('.sidebar-inner');
  const sizePanel = getSizePanelGroup();
  if (!sidebarInner || !sizePanel) return null;

  panel = document.createElement('details');
  panel.id = 'sSeriesSetPanel';
  panel.className = 'group';
  panel.open = true;
  panel.hidden = true;
  panel.innerHTML = [
    '<summary>S-Series Set Control</summary>',
    '<div class="group-body">',
    '<div class="mini-title">S-Series Set Structure</div>',
    '<p class="hint">S라인은 세트형 구조입니다.<br>제품 사이즈를 입력하면 인서트 패드, 속트레이, 겉슬리브가 자동 계산됩니다.</p>',

    '<div class="mini-title">Set Parts / 구성 부품</div>',

    '<div class="mini-title">Clearance / 끼움 여유</div>',
    '<div class="row"><label>Product → Pad</label><select id="sProductPadPreset"><option>Tight</option><option selected>Normal</option><option>Loose</option></select></div>',
    '<div class="row"><label>Pad → Inner Tray</label><select id="sPadTrayPreset"><option>Tight</option><option selected>Normal</option><option>Loose</option></select></div>',
    '<div class="row"><label>Inner Tray → Outer Sleeve</label><select id="sTraySleevePreset"><option>Tight</option><option selected>Normal</option><option>Loose</option></select></div>',
    '<details class="sub-group">',
    '<summary>Advanced Clearance</summary>',
    '<div class="row"><label>Product Gap</label><input type="number" value="1.0" step="0.1" readonly></div>',
    '<div class="row"><label>Pad Gap</label><input type="number" value="1.0" step="0.1" readonly></div>',
    '<div class="row"><label>Tray Gap</label><input type="number" value="1.0" step="0.1" readonly></div>',
    '<div class="row"><label>Slide Gap</label><input type="number" value="1.5" step="0.1" readonly></div>',
    '<div class="row"><label>Paper Thickness</label><input type="number" value="0.4" step="0.1" readonly></div>',
    '</details>',

    '<div id="sOuterStringHoleSettings">',
    '<div class="mini-title">Outer / String Hole Settings</div>',
    '<div class="row"><label>Use String Hole</label><input id="sOuterStringHoleEnabled" type="checkbox" checked></div>',
    '<div class="row"><label>Main Hole Dia</label><input id="sOuterMainHoleDia" type="number" step="0.5" value="22"></div>',
    '<div class="row"><label>Small Hole Dia</label><input id="sOuterSmallHoleDia" type="number" step="0.5" value="6"></div>',
    '<div class="row"><label>Y Offset</label><input id="sOuterHoleOffsetY" type="number" step="0.5" value="0"></div>',
    '</div>',

    '<div id="sInsertPadSettings">',
    '<div class="mini-title">Insert / Pad Settings</div>',
    '<div class="row" hidden style="display:none"><label>Product Fit</label><select id="sProductFitPreset">' +
      '<option value="baseline" selected>Bottle × 2 + Jar × 1 [기준형]</option>' +
      '<option value="bottle3">Bottle × 3</option>' +
      '<option value="jar3">Jar × 3</option>' +
      '<option value="bottle1Jar2">Bottle × 1 + Jar × 2</option>' +
    '</select></div>',
    '<div class="row"><label>Hole Type</label><input type="text" value="Circle" readonly></div>',
    '<div class="row"><label>Hole Count</label><input type="text" value="3" readonly></div>',
    '<div class="row"><label>Hole Gap</label><input type="text" value="Auto" readonly></div>',
    '<div class="row"><label>Edge Margin</label><input type="text" value="Auto" readonly></div>',
    '</div>',


    '<div class="mini-title">Download Parts</div>',
    '<div class="row"><label>Download All</label><button id="sDownloadAllSvg" type="button" class="btn light">SVG</button></div>',
    '<div class="row"><label>Outer Sleeve</label><button id="sDownloadOuterSvg" type="button" class="btn light">SVG</button></div>',
    '<div class="row"><label>Inner Tray</label><button id="sDownloadInnerSvg" type="button" class="btn light">SVG</button></div>',
    '<div class="row"><label>Insert Pad</label><button id="sDownloadInsertSvg" type="button" class="btn light">SVG</button></div>',
    '</div>'
  ].join('');

  sizePanel.insertAdjacentElement('afterend', panel);

  panel.querySelectorAll('select, input[type=checkbox], input[type=number]').forEach(control => {
    control.addEventListener('change', () => render(true));
    control.addEventListener('input', () => render(true));
  });

  panel.querySelector('#sDownloadAllSvg')?.addEventListener('click', () => downloadS001PartSVG('all', 'All'));
  panel.querySelector('#sDownloadOuterSvg')?.addEventListener('click', () => downloadS001PartSVG('outerSleeve', 'OuterSleeve'));
  panel.querySelector('#sDownloadInnerSvg')?.addEventListener('click', () => downloadS001PartSVG('innerTray', 'InnerTray'));
  panel.querySelector('#sDownloadInsertSvg')?.addEventListener('click', () => downloadS001PartSVG('insertPad', 'InsertPad'));

  return panel;
}

function updateSSetPanelMode() {
  const isSSet = isSSeriesSelection();
  const panel = ensureSSetPanel();
  setSizePanelMode(isSSet);
  if (panel) panel.hidden = !isSSet;
  const components = ensurePacVuInfoPanel()?.querySelector('#pacvuComponentsSection');
  if (components) {
    components.hidden = !isSSet;
    components.querySelectorAll('input[data-variant]').forEach(control => {
      control.checked = selectedBoxMeta.variantKey === control.dataset.variant;
    });
  }
  syncPacVuInfoPanelFrame();

  if (isSSet) {
    const defaults = getSelectedProductDefaults();
    const dW = document.getElementById('baseW');
    const dD = document.getElementById('baseD');
    const dH = document.getElementById('panelH');
    if (dW && !dW.value) setDimensionInputMm(dW, defaults.W);
    if (dD && !dD.value) setDimensionInputMm(dD, defaults.D);
    if (dH && !dH.value) setDimensionInputMm(dH, defaults.H);
  }
}

function isC001Selection(meta = selectedBoxMeta) {
  return meta?.engineKey === 'c001' && meta?.variantKey === 'C001';
}

function ensureC001Panel() {
  let panel = document.getElementById('c001CakePanel');
  if (panel) return panel;

  const sizePanel = getSizePanelGroup();
  if (!sizePanel) return null;
  const options = typeof C001_getPresetOptions === 'function'
    ? C001_getPresetOptions()
    : [
      { key: 'mini', label: 'Mini' },
      { key: 'no1', label: 'No.1' },
      { key: 'no2', label: 'No.2' },
      { key: 'no3', label: 'No.3' },
      { key: 'no4', label: 'No.4' }
    ];

  panel = document.createElement('details');
  panel.id = 'c001CakePanel';
  panel.className = 'group';
  panel.open = true;
  panel.hidden = true;
  panel.innerHTML = [
    '<summary>C001 Cake Box Control</summary>',
    '<div class="group-body">',
    '<div class="mini-title">Size Preset / \ud638\uc218 \uc120\ud0dd</div>',
    '<div class="row"><label>Size Preset</label><select id="c001Preset">' +
      options.map(opt => '<option value="' + opt.key + '">' + opt.label + '</option>').join('') +
    '</select></div>',

    '<div class="mini-title">Cake Board Size / \ucf00\uc774\ud06c \ud558\ud310</div>',
    '<div class="row"><label>Board W</label><input id="c001BoardW" type="text" readonly></div>',
    '<div class="row"><label>Board D</label><input id="c001BoardD" type="text" readonly></div>',
    '<div class="row"><label>Board H</label><input id="c001BoardH" type="text" readonly></div>',

    '<div class="mini-title">Box Size / \ubc15\uc2a4 \uc644\uc131 \uc0ac\uc774\uc988</div>',
    '<div class="row"><label>Box W</label><input id="c001BoxW" type="text" readonly></div>',
    '<div class="row"><label>Box D</label><input id="c001BoxD" type="text" readonly></div>',
    '<div class="row"><label>Box H</label><input id="c001BoxH" type="text" readonly></div>',

    '<div class="mini-title">Height Option / \ub192\uc774 \uc635\uc158</div>',
    '<div class="row"><label>Height</label><select id="c001HeightOption"><option selected>Standard</option><option>Tall</option><option>2-Tier</option><option>Custom</option></select></div>',
    '<div class="row" id="c001CustomHeightRow" hidden><label>Custom H</label><input id="c001CustomH" type="number" step="1" value="140"></div>',

    '<div class="mini-title">Handle / \uc190\uc7a1\uc774</div>',
    '<div class="row"><label>Handle</label><select id="c001Handle"><option selected>Center Handle</option></select></div>',

    '<div class="mini-title">Window / \ucc3d\ubb38</div>',
    '<div class="row"><label>Window</label><select id="c001Window"><option selected>None</option><option>Guide Only</option><option>Cutout</option></select></div>',
    '</div>'
  ].join('');

  sizePanel.insertAdjacentElement('afterend', panel);

  panel.querySelectorAll('select, input[type=number]').forEach(control => {
    control.addEventListener('change', () => {
      syncC001PanelFromPreset();
      render(true);
    });
    control.addEventListener('input', () => {
      syncC001PanelFromPreset();
      render(true);
    });
  });

  return panel;
}

function syncC001SizeFields(cfg) {
  const dW = document.getElementById('baseW');
  const dD = document.getElementById('baseD');
  const dH = document.getElementById('panelH');
  setDimensionInputMm(dW, cfg.W);
  setDimensionInputMm(dD, cfg.D);
  setDimensionInputMm(dH, cfg.H);
}

function syncC001PanelDisplays(cfg) {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };
  setText('c001BoardW', cfg.boardW + ' mm');
  setText('c001BoardD', cfg.boardD + ' mm');
  setText('c001BoardH', cfg.boardH + ' mm');
  setText('c001BoxW', cfg.W + ' mm');
  setText('c001BoxD', cfg.D + ' mm');
  setText('c001BoxH', cfg.H + ' mm');
}

function syncC001PanelFromPreset() {
  const preset = document.getElementById('c001Preset')?.value || 'no3';
  const heightOption = document.getElementById('c001HeightOption')?.value || 'Standard';
  const customRow = document.getElementById('c001CustomHeightRow');
  const customInput = document.getElementById('c001CustomH');
  if (customRow) customRow.hidden = heightOption !== 'Custom';
  const cfg = typeof C001_resolveConfig === 'function'
    ? C001_resolveConfig({ preset, heightOption, customH: customInput?.value, windowMode: document.getElementById('c001Window')?.value })
    : { W: 277, D: 275, H: 140, boardW: 265, boardD: 265, boardH: 5 };
  if (customInput && heightOption !== 'Custom') customInput.value = cfg.H;
  syncC001PanelDisplays(cfg);
  syncC001SizeFields(cfg);
  return cfg;
}

function setC001BaseReadonly(readonly) {
  ['baseW', 'baseD', 'panelH'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.readOnly = !!readonly;
  });
}

function updateC001PanelMode() {
  const isC001 = isC001Selection();
  const panel = ensureC001Panel();
  if (panel) panel.hidden = !isC001;
  setC001BaseReadonly(isC001);
  if (!isC001) {
    if (panel) panel.dataset.activeKey = '';
    return;
  }

  const activeKey = selectedBoxMeta.engineKey + ':' + selectedBoxMeta.variantKey;
  if (panel && panel.dataset.activeKey !== activeKey) {
    const preset = document.getElementById('c001Preset');
    const heightOption = document.getElementById('c001HeightOption');
    const handle = document.getElementById('c001Handle');
    const windowMode = document.getElementById('c001Window');
    if (preset) preset.value = selectedBoxMeta.defaultPreset || 'no3';
    if (heightOption) heightOption.value = 'Standard';
    if (handle) handle.value = 'Center Handle';
    if (windowMode) windowMode.value = 'None';
    panel.dataset.activeKey = activeKey;
  }
  syncC001PanelFromPreset();
}

function setupPanelUi() {
  const optionGrid = document.querySelector('.option-grid');
  const displayBody = optionGrid?.closest('.group-body');
  if (optionGrid && displayBody) {
    optionGrid.innerHTML = [
      '<label><span>\ub208\uae08\uc790</span><input id="showRuler" type="checkbox" checked></label>',
      '<label><span>\uce58\uc218\uc120</span><input id="showDims" type="checkbox" checked></label>',
      '<label><span>\ud328\ub110\uba85</span><input id="showLabels" type="checkbox" checked></label>',
      '<label><span>\uc7ac\ub2e8\uc120</span><input id="showCut" type="checkbox" checked></label>',
      '<label><span>\uc811\ud798\uc120</span><input id="showFolds" type="checkbox" checked></label>',
      '<label><span>\ube14\ub9ac\ub4dc</span><input id="showBleed" type="checkbox" checked></label>',
      '<label><span>\ud0c0\uacf5 \ud45c\uc2dc</span><input id="showPerforation" type="checkbox" checked></label>'
    ].join('');

    Array.from(displayBody.children).forEach(child => {
      if (child !== optionGrid) child.remove();
    });
  }

  const sidebarInner = document.querySelector('.sidebar-inner');
  const hint = document.querySelector('.hint');
  let section = document.getElementById('perforationSettings');
  if (!sidebarInner) {
    updateLegendUi();
    return;
  }

  if (section) {
    section.remove();
  }

  section = document.createElement('details');
  section.id = 'perforationSettings';
  section.className = 'group';
  section.open = true;
  section.hidden = true;
  section.innerHTML = [
    '<summary>\ud0c0\uacf5 \uc124\uc815</summary>',
    '<div class="group-body">',
    '<details class="sub-group perforation-item" data-engines="gbox gbox3" open>',
    '<summary>\ub048\uad6c\uba4d</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="stringHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\uc9c0\ub984</label><input id="holeDia" type="number" step="0.5" value="6"></div>',
    '<div class="row"><label>\uac04\uaca9</label><input id="holeGap" type="number" step="1" value="70"></div>',
    '<div class="row"><label>Y \uc704\uce58</label><input id="holeOffsetY" type="number" step="0.5" value="45"></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="bbox3" open>',
    '<summary>\ubcd1\ubaa9\ud640 / Bottle Neck Hole</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="t003BottleNeckHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\uc9c0\ub984</label><input id="t003BottleNeckHoleDia" type="number" step="0.5" value="36"></div>',
    '<div class="row"><label>\uae30\uc900 \ud328\ub110</label><input type="text" value="Inner" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="gbox2" open>',
    '<summary>\uc190\uc7a1\uc774 \ud640</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="m002HandleHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\uac00\ub85c</label><input id="m002HandleHoleWidth" type="number" step="0.5" value="50"></div>',
    '<div class="row"><label>\uc138\ub85c</label><input id="m002HandleHoleHeight" type="number" step="0.5" value="25"></div>',
    '<div class="row"><label>\ud328\ub110</label><input type="text" value="Back Insert" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="rbox4" open>',
    '<summary>\uc190\uc7a1\uc774 \ud640</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="r004HandleHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\uac00\ub85c</label><input id="r004HandleHoleWidth" type="number" step="0.5" value="75"></div>',
    '<div class="row"><label>\uc138\ub85c</label><input id="r004HandleHoleHeight" type="number" step="0.5" value="25"></div>',
    '<div class="row"><label>\ud328\ub110</label><input type="text" value="Side" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="gable1" open>',
    '<summary>손잡이 홀</summary>',
    '<div class="row"><label>가로</label><input id="ga001HandleHoleWidth" type="number" min="1" step="0.5" value="80"></div>',
    '<div class="row"><label>세로</label><input id="ga001HandleHoleHeight" type="number" min="1" step="0.5" value="25"></div>',
    '<div class="row"><label>적용</label><input type="text" value="Front / Back" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="b002" open>',
    '<summary>B002 \uc804\uba74 \uc120\ud0dd \ud0c0\uacf5</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="b002FrontPunchEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\ud544\uc218 \uc2ac\ub86f/\uc190\uc7a1\uc774</label><input type="text" value="\ud56d\uc0c1 \ud0c0\uacf5" readonly></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="bbox2" open>',
    '<summary>\ubcd1\uc0c1\ub2e8 \ud640 / Bottle Top Hole</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="t002BottleTopHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\uc9c0\ub984</label><input id="t002BottleTopHoleDia" type="number" step="0.5" value="51"></div>',
    '<div class="row"><label>\uae30\uc900 \ud328\ub110</label><input type="text" value="Bottle Top" readonly></div>',
    '<div class="row"><label>X \uc704\uce58</label><input type="text" value="\uc911\uc559" readonly></div>',
    '<div class="row"><label>Y \uc704\uce58</label><input id="t002BottleTopHoleY" type="number" step="0.5" value="38.5"></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="bbox2" open>',
    '<summary>\ubcd1\ubaa9 \ud640 / Neck Hole</summary>',
    '<div class="row"><label>\uc0ac\uc6a9</label><input id="t002NeckHoleEnabled" type="checkbox" data-render-input checked></div>',
    '<div class="row"><label>\uc9c0\ub984</label><input id="t002NeckHoleDia" type="number" step="0.5" value="20"></div>',
    '<div class="row"><label>\uae30\uc900 \ud328\ub110</label><input type="text" value="Back" readonly></div>',
    '<div class="row"><label>X \uc704\uce58</label><input type="text" value="\uc911\uc559" readonly></div>',
    '<div class="row"><label>Y \uc704\uce58</label><input id="t002NeckHoleY" type="number" step="0.5" value="0"></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="" data-hidden-ui="true" open>',
    '<summary>TR001 \ud0c0\uacf5 \uac1c\uc218</summary>',
    '<div class="row"><label>Front/Back</label><input id="tr001FrontBackHoleCount" type="number" min="2" max="3" step="1" value="3"></div>',
    '<div class="row"><label>Left/Right</label><input id="tr001LeftRightHoleCount" type="number" min="3" max="4" step="1" value="4"></div>',
    '</details>',
    '<details class="sub-group perforation-item" data-engines="" data-hidden-ui="true" open>',
    '<summary>TR002 타공 옵션</summary>',
    '<div class="row"><label>Front/Back Count</label><input id="tr002FrontBackHoleCount" type="number" min="0" max="8" step="1" value="1"></div>',
    '<div class="row"><label>Hole Width</label><input id="tr002FrontBackHoleWidth" type="number" min="6" step="0.5" value="30"></div>',
    '<div class="row"><label>Hole Height</label><input id="tr002FrontBackHoleHeight" type="number" min="4" step="0.5" value="16"></div>',
    '<div class="row"><label>Left/Right Count</label><input id="tr002LeftRightHoleCount" type="number" min="0" max="8" step="1" value="1"></div>',
    '<div class="row"><label>Hole Diameter</label><input id="tr002LeftRightHoleDiameter" type="number" min="4" step="0.5" value="15"></div>',
    '</details>',
    '</div>'
  ].join('');

  sidebarInner.insertBefore(section, hint || null);
  ensureSSetPanel();
  ensureC001Panel();
  updateSSetPanelMode();
  updateC001PanelMode();
  updateLegendUi();
}

function updateLegendUi() {
  const legend = document.querySelector('.legend');
  if (!legend) return;
  legend.innerHTML = [
    '<div><span class="ln fold-ln"></span>\uc811\ud798\uc120</div>',
    '<div><span class="ln cut-ln"></span>\uc7ac\ub2e8\uc120</div>',
    '<div><span class="ln perf-ln"></span>\ud0c0\uacf5\uc120</div>',
    '<div><span class="ln bleed-ln"></span>\ube14\ub9ac\ub4dc</div>'
  ].join('');
}

// ============================================================
// UI BINDINGS
// ============================================================
function bindAll() {
  setupPanelUi();
  ensureDimensionUnitControl();

  fetch('./data/boxLibrary.json')
    .then(r => r.json())
    .then(data => {
      BOX_LIBRARY = data;
      initBoxLibrarySelect();
      render(true);
    })
    .catch(() => {
      BOX_LIBRARY = _fallbackLibrary();
      initBoxLibrarySelect();
      render(true);
    });

  document.querySelectorAll('input[type=number]').forEach(
    el => el.addEventListener('change', scheduleRender)
  );
  ['baseW', 'baseD', 'panelH'].forEach(id => {
    const input = document.getElementById(id);
    input?.addEventListener('change', () => {
      let valueMm = window.PacVuUnits
        ? window.PacVuUnits.toMillimeters(input.value)
        : parseFloat(input.value);
      if (selectedBoxMeta.engineKey === 'gable1' && (id === 'baseW' || id === 'baseD') && Number.isFinite(valueMm) && valueMm <= 120) {
        window.alert('Width와 Depth가 120mm 이하일 경우 손잡이 형태가 변형될 수 있습니다.\n121mm 이상 입력해 주세요.');
        valueMm = 121;
        setDimensionInputMm(input, valueMm);
      }
      if (Number.isFinite(valueMm)) input.dataset.valueMm = String(valueMm);
    });
  });
  document.querySelectorAll('input[type=checkbox][data-render-input]').forEach(
    el => el.addEventListener('change', scheduleRender)
  );

  const get = id => document.getElementById(id);

  get('showRuler')?.addEventListener('change', e => { state.showRuler = e.target.checked; render(true); });
  get('showDims')?.addEventListener('change',   e => { state.showDims   = e.target.checked; render(true); });
  get('showCut')?.addEventListener('change',    e => { state.showCut    = e.target.checked; render(true); });
  get('showBleed')?.addEventListener('change',  e => { state.showBleed  = e.target.checked; render(true); });
  get('showPerforation')?.addEventListener('change', e => {
    state.showPerforation = e.target.checked;
    state.showHoles = e.target.checked;
    state.showSlots = e.target.checked;
    render(true);
  });
  get('showFolds')?.addEventListener('change',  e => { state.showFolds  = e.target.checked; render(true); });
  get('showLabels')?.addEventListener('change', e => { state.showLabels = e.target.checked; render(true); });

  get('fitBtn')?.addEventListener('click',     () => fitToScreen());
  get('zoomInBtn')?.addEventListener('click',  () => zoomAt(snapZoom(state.zoom, +1)));
  get('zoomOutBtn')?.addEventListener('click', () => zoomAt(snapZoom(state.zoom, -1)));

  get('downloadSvgBtn')?.addEventListener('click', () => {
    const eng = selectedBoxMeta.engineKey;
    const cfg = eng === 'gbox' ? getCfg()
      : eng === 'gbox2' ? getCfgM002()
      : eng === 'gbox3' ? getCfgM003()
      : eng === 'bbox' ? getCfgT001()
      : eng === 'bbox2' ? getCfgT002()
      : eng === 'bbox3' ? getCfgT003()
      : eng === 'bbox4' ? getCfgT004()
      : eng === 'bbox5' ? getCfgT005()
      : eng === 'rbox' ? getCfgR001()
      : eng === 'rbox2' ? getCfgR002()
      : eng === 'rbox3' ? getCfgR003()
      : eng === 'rbox4' ? getCfgR004()
      : isS001Selection() ? getCfgS001()
      : eng === 'b001' ? getCfgB001()
      : eng === 'b002' ? getCfgB002()
      : eng === 'c001' ? getCfgC001()
      : eng === 'tr001' ? getCfgTR001()
      : eng === 'tr002' ? getCfgTR002()
      : eng === 'tr003' ? getCfgTR003()
      : getCfg();

    const dim  = `${cfg.W}x${cfg.D}x${cfg.H}`;
    const name = `PacVu_${eng}_${dim}mm.svg`;
    const rawSvgOut = buildExportSVG(cfg, eng);
    const svgOut = rawSvgOut && window.PacVuExportHeader
      ? window.PacVuExportHeader.wrapSVG(rawSvgOut, { cfg, meta: selectedBoxMeta, engineKey: eng })
      : rawSvgOut;

    if (!svgOut || !svgOut.trim()) {
      console.warn('[SVG export empty]', { eng, cfg });
      return;
    }

    downloadFile(name, svgOut, 'image/svg+xml');
  });

  get('downloadDxfBtn')?.addEventListener('click', () => {
    const eng = selectedBoxMeta.engineKey;
    const cfg = eng === 'gbox' ? getCfg()
      : eng === 'gbox2' ? getCfgM002()
      : eng === 'gbox3' ? getCfgM003()
      : eng === 'bbox' ? getCfgT001()
      : eng === 'bbox2' ? getCfgT002()
      : eng === 'bbox3' ? getCfgT003()
      : eng === 'bbox4' ? getCfgT004()
      : eng === 'bbox5' ? getCfgT005()
      : eng === 'rbox' ? getCfgR001()
      : eng === 'rbox2' ? getCfgR002()
      : eng === 'rbox3' ? getCfgR003()
      : eng === 'rbox4' ? getCfgR004()
      : isS001Selection() ? getCfgS001()
      : eng === 'b001' ? getCfgB001()
      : eng === 'b002' ? getCfgB002()
      : eng === 'c001' ? getCfgC001()
      : eng === 'tr001' ? getCfgTR001()
      : eng === 'tr002' ? getCfgTR002()
      : eng === 'tr003' ? getCfgTR003()
      : getCfg();

    const dim  = `${cfg.W}x${cfg.D}x${cfg.H}`;
    const name = `PacVu_${eng}_${dim}mm.dxf`;
    const dxfOut = buildDXF(cfg, eng);

    if (!dxfOut || !dxfOut.trim()) {
      console.warn('[DXF export empty]', { eng, cfg });
      return;
    }

    downloadFile(name, dxfOut, 'application/dxf');
  });

  get('downloadPdfBtn')?.addEventListener('click', async () => {
    const eng = selectedBoxMeta.engineKey;
    const cfg = eng === 'gbox' ? getCfg()
      : eng === 'gbox2' ? getCfgM002()
      : eng === 'gbox3' ? getCfgM003()
      : eng === 'bbox' ? getCfgT001()
      : eng === 'bbox2' ? getCfgT002()
      : eng === 'bbox3' ? getCfgT003()
      : eng === 'bbox4' ? getCfgT004()
      : eng === 'bbox5' ? getCfgT005()
      : eng === 'rbox' ? getCfgR001()
      : eng === 'rbox2' ? getCfgR002()
      : eng === 'rbox3' ? getCfgR003()
      : eng === 'rbox4' ? getCfgR004()
      : isS001Selection() ? getCfgS001()
      : eng === 'b001' ? getCfgB001()
      : eng === 'b002' ? getCfgB002()
      : eng === 'c001' ? getCfgC001()
      : eng === 'tr001' ? getCfgTR001()
      : eng === 'tr002' ? getCfgTR002()
      : eng === 'tr003' ? getCfgTR003()
      : getCfg();

    const dim  = `${cfg.W}x${cfg.D}x${cfg.H}`;
    const name = `PacVu_${eng}_${dim}mm.pdf`;
    const rawSvgOut = buildExportSVG(cfg, eng);
    const exportSvg = rawSvgOut && window.PacVuExportHeader
      ? window.PacVuExportHeader.wrapSVG(rawSvgOut, { cfg, meta: selectedBoxMeta, engineKey: eng })
      : '';
    const pdfOut = exportSvg && window.PacVuExportHeader
      ? await window.PacVuExportHeader.svgToPDF(exportSvg).catch(error => {
          console.error('[PDF export failed]', error);
          return null;
        })
      : buildPDF(cfg, eng);

    if (!pdfOut || (typeof pdfOut === 'string' && !pdfOut.trim())) {
      console.warn('[PDF export empty]', { eng, cfg });
      return;
    }

    downloadFile(name, pdfOut, 'application/pdf');
  });

  const sidebar = get('sidebar');
  get('toggleSidebarBtn')?.addEventListener('click', () => sidebar?.classList.add('collapsed'));
  get('showSidebarBtn')?.addEventListener('click',   () => sidebar?.classList.toggle('collapsed'));

  const host = get('svgHost');
  if (!host) return;

  host.addEventListener('mousedown', e => {
    state.isDragging = true;
    state.dragStartX = e.clientX; state.dragStartY = e.clientY;
    state.startPanX  = state.panX; state.startPanY = state.panY;
    host.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!state.isDragging) return;
    const sv = get('mainSvg'); if (!sv) return;
    const sr = sv.getBoundingClientRect(), vb = sv.viewBox.baseVal;
    const ppm = sr.width / vb.width;
    state.panX = state.startPanX + (e.clientX - state.dragStartX) / ppm;
    state.panY = state.startPanY + (e.clientY - state.dragStartY) / ppm;
    applyTransform();
  });
  window.addEventListener('mouseup', () => { state.isDragging = false; host.classList.remove('dragging'); });
  host.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(state.zoom * Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });
  host.addEventListener('dblclick', () => fitToScreen());
  window.addEventListener('resize',  () => fitToScreen('resize'));
}

function _fallbackLibrary() {
  return [
    {
      categoryKey: 'tuck',
      categoryLabel: '01 Tuck Box',
      items: [
        {
          label: 'B형 타입 / 기본 칼라박스',
          koreanName: 'B형 타입',
          fefcoCode: '0471',
          engineKey: 'bbox',
          variantKey: 'default',
          defaultDims: { W: 57, D: 57, H: 177 }
        }
      ]
    },
    {
      categoryKey: 'mailer',
      categoryLabel: '02 Mailer Box',
      items: [
        {
          label: 'G-Type Standard',
          koreanName: 'G형 기본형',
          fefcoCode: '0427',
          engineKey: 'gbox',
          variantKey: 'default',
          defaultDims: { W: 235, D: 229, H: 91 }
        }
      ]
    },
    { categoryKey: 'shipping', categoryLabel: '03 Shipping Box', items: [] },
    { categoryKey: 'gable', categoryLabel: '04 Gable Box', items: [] },
    { categoryKey: 'rigid', categoryLabel: '05 Rigid Box', items: [] },
    {
      categoryKey: 'sleeve_slide',
      categoryLabel: '06 Sleeve & Slide',
      items: []
    },
    { categoryKey: 'bakery', categoryLabel: '07 Bakery Box', items: [] },
    { categoryKey: 'tray', categoryLabel: '08 Tray Box', items: [] },
    { categoryKey: 'cake', categoryLabel: '09 Cake Box', items: [] },
    {
      categoryKey: 'rrp_display',
      categoryLabel: '10 Display / RRP',
      items: []
    }
  ];
}

// ============================================================
// INIT
// ============================================================
bindAll();
if (window.innerWidth < 768) fitToScreen();
