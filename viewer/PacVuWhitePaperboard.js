(function (global) {
  'use strict';

  const PRESET = Object.freeze({
    id: 'white-board-punch.v1',
    seed: 38117,
    size: 1024,
    tileSize: 32,
    surface: Object.freeze({ color: 0xffffff, roughness: .98, metalness: 0, bumpScale: .028 }),
    edge: Object.freeze({ color: 0xffffff, roughness: 1, metalness: 0, bumpScale: .03 })
  });

  function createCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    return canvas;
  }

  function createTextureSet(THREE, renderer) {
    let seed = PRESET.seed;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const size = PRESET.size;
    const grain = createCanvas(size);
    const context = grain.getContext('2d');
    context.fillStyle = '#808080';
    context.fillRect(0, 0, size, size);
    const fields = [16, 48, 160].map(count => ({
      count,
      values: Float32Array.from({ length: count * count }, random)
    }));
    const noise = (field, x, y) => {
      const n = field.count;
      const xx = x * n / size;
      const yy = y * n / size;
      const ix = Math.floor(xx);
      const iy = Math.floor(yy);
      let u = xx - ix;
      let v = yy - iy;
      u = u * u * (3 - 2 * u);
      v = v * v * (3 - 2 * v);
      const at = (a, b) => field.values[((b % n) + n) % n * n + ((a % n) + n) % n];
      return (at(ix, iy) * (1 - u) + at(ix + 1, iy) * u) * (1 - v)
        + (at(ix, iy + 1) * (1 - u) + at(ix + 1, iy + 1) * u) * v;
    };
    const image = context.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = (y * size + x) * 4;
        const value = 128
          + (noise(fields[0], x, y) - .5) * 24
          + (noise(fields[1], x, y) - .5) * 40
          + (noise(fields[2], x, y) - .5) * 50
          + (random() - .5) * 22;
        image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    for (let index = 0; index < 15000; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const angle = random() * Math.PI * 2;
      const length = 3 + random() * 22;
      context.strokeStyle = index % 2 ? 'rgba(208,208,208,.26)' : 'rgba(63,63,63,.18)';
      context.lineWidth = .45 + random() * .65;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(
        x + Math.cos(angle + .3) * length * .5,
        y + Math.sin(angle + .3) * length * .5,
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length
      );
      context.stroke();
    }
    const colorCanvas = createCanvas(size);
    const roughnessCanvas = createCanvas(size);
    const colorData = context.getImageData(0, 0, size, size);
    const roughnessData = context.getImageData(0, 0, size, size);
    for (let index = 0; index < size * size; index += 1) {
      const grainValue = colorData.data[index * 4];
      const colorValue = 241 + (grainValue - 128) * .34;
      colorData.data[index * 4] = colorValue;
      colorData.data[index * 4 + 1] = colorValue;
      colorData.data[index * 4 + 2] = colorValue - 1;
      const roughnessValue = 235 + (grainValue - 128) * .4;
      roughnessData.data[index * 4] = roughnessValue;
      roughnessData.data[index * 4 + 1] = roughnessValue;
      roughnessData.data[index * 4 + 2] = roughnessValue;
    }
    colorCanvas.getContext('2d').putImageData(colorData, 0, 0);
    roughnessCanvas.getContext('2d').putImageData(roughnessData, 0, 0);
    const makeTexture = (canvas, srgb) => {
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };
    return {
      color: makeTexture(colorCanvas, true),
      bump: makeTexture(grain, false),
      roughness: makeTexture(roughnessCanvas, false)
    };
  }

  function applyPhysicalUV(THREE, geometry, options = {}) {
    const position = geometry?.getAttribute?.('position');
    if (!position) throw new Error('White Paperboard physical UV requires a position attribute.');
    const tileSize = Number(options.tileSize) || PRESET.tileSize;
    const offsetX = Number(options.offsetX) || 0;
    const offsetY = Number(options.offsetY) || 0;
    const uv = new Float32Array(position.count * 2);
    for (let index = 0; index < position.count; index += 1) {
      uv[index * 2] = (position.getX(index) + offsetX) / tileSize;
      uv[index * 2 + 1] = (offsetY - position.getY(index)) / tileSize;
    }
    geometry.setAttribute('uv1', new THREE.BufferAttribute(uv, 2));
    geometry.userData = Object.assign({}, geometry.userData, {
      pacvuWhitePaperboardUV: { channel: 1, tileSize, offsetX, offsetY }
    });
    return geometry;
  }

  function createMaterials(THREE, renderer, options = {}) {
    const textures = createTextureSet(THREE, renderer);
    textures.color.channel = 1;
    textures.bump.channel = 1;
    textures.roughness.channel = 1;
    const source = options.sourceMaterials || [];
    const artworkMaps = options.artworkMaps || [];
    const make = (index, edge) => {
      const values = edge ? PRESET.edge : PRESET.surface;
      const existingMap = artworkMaps[index] || source[index]?.map || null;
      const material = new THREE.MeshStandardMaterial({
        color: values.color,
        roughness: values.roughness,
        roughnessMap: textures.roughness,
        metalness: values.metalness,
        map: existingMap || textures.color,
        bumpMap: textures.bump,
        bumpScale: values.bumpScale,
        side: edge ? THREE.DoubleSide : THREE.FrontSide
      });
      material.name = edge ? 'PacVu White Paperboard edge' : 'PacVu White Paperboard surface';
      material.userData = Object.assign({}, source[index]?.userData, {
        pacvuMaterialPreset: PRESET.id,
        preservesArtworkMap: Boolean(existingMap)
      });
      return material;
    };
    const materials = [make(0, false), make(1, false), make(2, true)];
    return {
      materials,
      textures,
      setArtworkMap(index, map) {
        const material = materials[index];
        if (!material) return;
        material.map = map || textures.color;
        material.userData.preservesArtworkMap = Boolean(map);
        material.needsUpdate = true;
      },
      dispose() {
        materials.forEach(material => material.dispose());
        Object.values(textures).forEach(texture => texture.dispose());
      }
    };
  }

  global.PacVuWhitePaperboard = Object.freeze({ PRESET, createTextureSet, applyPhysicalUV, createMaterials });
})(window);
