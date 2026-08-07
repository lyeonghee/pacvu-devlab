(function (global) {
  'use strict';

  global.PacVu3DTheme = Object.freeze({
    colors: Object.freeze({
      exterior: 0xffffff,
      interior: 0xc9ad7e,
      cutEdge: 0x8f6845,
      background: 0xbdb8b0
    }),
    grid: Object.freeze({
      size: 2400,
      divisions: 24,
      centerColor: 0x8f8a83,
      lineColor: 0xaaa59e,
      opacity: 0.34,
      z: -1.5
    }),
    material: Object.freeze({
      roughness: 1,
      metalness: 0
    }),
    renderer: Object.freeze({
      toneMapping: 'ACESFilmicToneMapping',
      exposure: 0.95,
      shadowMapType: 'PCFSoftShadowMap'
    }),
    hemisphereLight: Object.freeze({
      skyColor: 0xffffff,
      groundColor: 0x817b73,
      intensity: 1.25
    }),
    directionalLight: Object.freeze({
      color: 0xffffff,
      intensity: 1.55,
      position: Object.freeze([-300, -350, 500]),
      shadowMapSize: 1024,
      shadowBounds: 650,
      shadowNear: 1,
      shadowFar: 1600,
      shadowBias: -0.00005,
      shadowNormalBias: 0.35
    }),
    fillLight: Object.freeze({
      color: 0xf0f4f7,
      intensity: 0.35,
      position: Object.freeze([320, 180, 260])
    }),
    floor: Object.freeze({
      size: 2500,
      color: 0x48433e,
      opacity: 0.11,
      z: -2
    })
  });
})(window);
