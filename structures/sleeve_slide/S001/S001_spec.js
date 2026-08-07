// S001_spec.js - S-Series Sleeve & Slide set specification
// This file is not connected to the active PacVu app yet.

const S001_SPEC = {
  code: 'S001',
  name: 'Slide Box Set with 3Hole Insert',
  koreanName: 'S001 슬라이드 세트박스 / 3구 인서트형',
  categoryKey: 'sleeve_slide',
  type: 'set',
  engineKey: 'sSeries',
  variantKey: 'S001',

  defaultProductSize: {
    W: 298,
    D: 61,
    H: 292
  },

  product: {
    W: 298,
    D: 61,
    H: 292,
    quantity: 3
  },

  material: {
    paperThickness: 0.4
  },

  clearance: {
    productGap: 1.0,
    padGap: 1.0,
    trayGap: 1.0,
    slideGap: 1.5
  },

  parts: [
    {
      key: 'outerSleeve',
      label: 'Outer Sleeve',
      koreanLabel: '겉 슬리브',
      required: true,
      visible: true
    },
    {
      key: 'innerTray',
      label: 'Inner Tray',
      koreanLabel: '속 트레이',
      required: true,
      visible: true
    },
    {
      key: 'insertPad',
      label: 'Insert Pad',
      koreanLabel: '인서트 패드',
      required: true,
      visible: true,
      option: false
    }
  ],

  insertPad: {
    enabled: true,
    holeType: 'circle',
    holeCount: 3,
    holeGapMode: 'auto',
    edgeMarginMode: 'auto'
  }
};

if (typeof window !== 'undefined') {
  window.S001_SPEC = S001_SPEC;
}
