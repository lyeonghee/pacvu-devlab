// ============================================================
// C001_spec.js - Cake Box preset rules
// Base source: C001_277x275x140_(cutpath,bleedpath,foldingline).svg
// ============================================================

const C001_BOARD_PRESETS = {
  mini: { label: 'Mini', boardW: 155, boardD: 155, boardH: 5 },
  no1: { label: 'No.1', boardW: 205, boardD: 205, boardH: 5 },
  no2: { label: 'No.2', boardW: 235, boardD: 235, boardH: 5 },
  no3: { label: 'No.3', boardW: 265, boardD: 265, boardH: 5 },
  no4: { label: 'No.4', boardW: 295, boardD: 295, boardH: 5 }
};

const C001_SIZE_RULES = {
  defaultPreset: 'no3',
  clearanceW: 12,
  clearanceD: 10,
  heightByPreset: {
    mini: 100,
    no1: 115,
    no2: 130,
    no3: 140,
    no4: 150
  }
};

function C001_round(value) {
  return +(+value).toFixed(3);
}

function C001_getPresetOptions() {
  return Object.keys(C001_BOARD_PRESETS).map(key => ({
    key,
    label: C001_BOARD_PRESETS[key].label
  }));
}

function C001_resolveConfig(input) {
  const source = input || {};
  const presetKey = C001_BOARD_PRESETS[source.preset]
    ? source.preset
    : C001_SIZE_RULES.defaultPreset;
  const board = C001_BOARD_PRESETS[presetKey];
  const baseH = C001_SIZE_RULES.heightByPreset[presetKey];
  const heightOption = source.heightOption || 'Standard';
  let H = baseH;

  if (heightOption === 'Tall') H = baseH + 30;
  if (heightOption === '2-Tier') H = baseH + 70;
  if (heightOption === 'Custom') H = Number(source.customH) || baseH;

  return {
    preset: presetKey,
    presetLabel: board.label,
    boardW: board.boardW,
    boardD: board.boardD,
    boardH: board.boardH,
    W: C001_round(board.boardW + C001_SIZE_RULES.clearanceW),
    D: C001_round(board.boardD + C001_SIZE_RULES.clearanceD),
    H: C001_round(H),
    heightOption,
    handle: source.handle || 'Center Handle',
    windowMode: source.windowMode || 'None',
    sizeRules: C001_SIZE_RULES
  };
}

function C001_getDefaultConfig() {
  return C001_resolveConfig({
    preset: C001_SIZE_RULES.defaultPreset,
    heightOption: 'Standard',
    handle: 'Center Handle',
    windowMode: 'None'
  });
}
