(function (global) {
  'use strict';

  const THEME = global.PacVu3DTheme;
  const COLORS = THEME.colors;
  const continuousWheelControls = new WeakSet();

  function installContinuousWheelZoom(controls) {
    const element = controls?.domElement;
    if (!element || continuousWheelControls.has(controls)) return;
    continuousWheelControls.add(controls);
    controls.zoomSpeed = .35;
    element.addEventListener('wheel', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const offset = controls.object.position.clone().sub(controls.target);
      const distance = offset.length();
      if (distance < 1e-6) return;
      controls.zoomSpeed = .35;
      const normalizedDelta = Math.max(-120, Math.min(120, event.deltaY));
      const zoomFactor = Math.exp(normalizedDelta * .0015);
      const configuredMin = Number.isFinite(controls.minDistance) ? controls.minDistance : 0;
      const configuredMax = Number.isFinite(controls.maxDistance) ? controls.maxDistance : Infinity;
      const minDistance = Math.min(configuredMin, distance * .05);
      const maxDistance = Math.max(configuredMax, distance * 20);
      controls.minDistance = minDistance;
      controls.maxDistance = maxDistance;
      const nextDistance = Math.max(minDistance, Math.min(maxDistance, distance * zoomFactor));
      controls.object.position.copy(controls.target).add(offset.multiplyScalar(nextDistance / distance));
      controls.update();
    }, { capture: true, passive: false });
  }

  function sceneMaxDimension(dimensions, fallback = 500) {
    const values = Array.isArray(dimensions)
      ? dimensions
      : [dimensions?.W, dimensions?.D, dimensions?.H];
    const valid = values.map(Number).filter(Number.isFinite);
    return valid.length ? Math.max(1, ...valid) : fallback;
  }

  function createPerspectiveCamera(THREE, dimensions, options = {}) {
    const maxDim = sceneMaxDimension(dimensions, options.fallback || 500);
    const near = options.near || Math.max(1, maxDim * .01);
    const far = options.far || maxDim * 20;
    const camera = new THREE.PerspectiveCamera(options.fov || 35, options.aspect || 1, near, Math.max(near + 1, far));
    camera.up.set(0, 0, 1);
    return camera;
  }

  function createRenderer(THREE, options = {}) {
    const renderer = new THREE.WebGLRenderer({
      antialias: options.antialias !== false,
      alpha: options.alpha !== false,
      preserveDrawingBuffer: options.preserveDrawingBuffer === true,
      logarithmicDepthBuffer: true
    });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE[THEME.renderer.toneMapping];
    renderer.toneMappingExposure = THEME.renderer.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE[THEME.renderer.shadowMapType];
    return renderer;
  }

  function createOverlayMaterial(THREE, options = {}) {
    return new THREE.MeshBasicMaterial(Object.assign({}, options, {
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }));
  }

  function createBoardMaterials(THREE) {
    return [
      new THREE.MeshLambertMaterial({
        color: COLORS.exterior,
        side: THREE.FrontSide,
        name: 'PacVu exterior matte white'
      }),
      new THREE.MeshLambertMaterial({
        color: COLORS.interior,
        side: THREE.FrontSide,
        name: 'PacVu interior matte kraft'
      }),
      new THREE.MeshLambertMaterial({
        color: COLORS.cutEdge,
        side: THREE.DoubleSide,
        name: 'PacVu cut edge dark kraft'
      })
    ];
  }

  function assignBoardFaceMaterials(geometry, thickness, positiveZFace = 'interior') {
    const position = geometry.getAttribute('position');
    const edgeLimit = thickness * 0.25;
    geometry.clearGroups();
    for (let index = 0; index < position.count; index += 3) {
      const z = (
        position.getZ(index) +
        position.getZ(index + 1) +
        position.getZ(index + 2)
      ) / 3;
      let materialIndex = 2;
      if (z > edgeLimit) {
        materialIndex = positiveZFace === 'exterior' ? 0 : 1;
      } else if (z < -edgeLimit) {
        materialIndex = positiveZFace === 'exterior' ? 1 : 0;
      }
      geometry.addGroup(index, 3, materialIndex);
    }
    return geometry;
  }

  function createModal(options) {
    const modal = document.createElement('div');
    modal.className = 'm001-3d-modal pacvu-viewer';
    modal.id = options.id;
    modal.innerHTML = `
      <div class="m001-3d-shell pacvu-viewer__shell">
        <header class="m001-3d-head pacvu-viewer__header">
          <strong>3D Preview</strong>
          <button type="button" class="btn light pacvu-viewer__download" data-download>PNG Download</button>
          <div class="pacvu-viewer__actions">
            <button type="button" class="btn light" data-expand aria-pressed="false">Expand</button>
            <button type="button" class="btn light" data-close>Close</button>
          </div>
        </header>
        <div class="m001-3d-stage pacvu-viewer__stage">
          <div class="m001-3d-badge">${options.badge}</div>
          <div class="m001-3d-views pacvu-viewer__views">
            <button type="button" class="btn light" data-view="iso">Isometric</button>
            <button type="button" class="btn light" data-view="front">Front</button>
            <button type="button" class="btn light" data-view="top">Top</button>
            <button type="button" class="btn light" data-shadow data-action="shadow">Shadows On</button>
          </div>
          <div class="m001-3d-controls pacvu-viewer__controls">
            <div class="assembly-title">Assembly Stage</div>
            <div class="assembly-track"><div class="assembly-fill"></div></div>
            <input type="range" min="0" max="100" step="1" value="0" aria-label="Assembly progress">
            <div class="assembly-labels"><span class="active">Flat</span><span>Fold</span><span>3D Mockup</span></div>
          </div>
        </div>
      </div>`;
    document.body.append(modal);

    const shell = modal.querySelector('.m001-3d-shell');
    const stage = modal.querySelector('.m001-3d-stage');
    const range = modal.querySelector('input[type="range"]');
    const controls = modal.querySelector('.m001-3d-controls');
    const expand = modal.querySelector('[data-expand]');
    expand.addEventListener('click', () => {
      const expanded = modal.classList.toggle('pacvu-viewer--expanded');
      expand.textContent = expanded ? 'Restore' : 'Expand';
      expand.setAttribute('aria-pressed', String(expanded));
      requestAnimationFrame(() => global.dispatchEvent(new Event('resize')));
    });
    return { modal, shell, stage, range, controls };
  }

  function syncProgress(viewer, value, title) {
    const progress = Math.max(0, Math.min(100, Number(value) || 0));
    viewer.controls.style.setProperty('--progress', `${progress}%`);
    viewer.controls.querySelector('.assembly-fill').style.width = `${progress}%`;
    if (title) viewer.controls.querySelector('.assembly-title').textContent = title;
    const active = progress < 34 ? 0 : progress < 90 ? 1 : 2;
    viewer.controls.querySelectorAll('.assembly-labels span').forEach((node, index) => {
      node.classList.toggle('active', index <= active);
    });
  }

  function standardizeLegacy(modal, options = {}) {
    if (!modal) return null;
    modal.classList.add('pacvu-viewer');
    const head = modal.querySelector('.m001-3d-head');
    const stage = modal.querySelector('.m001-3d-stage');
    const controls = modal.querySelector('.m001-3d-controls');
    modal.querySelector('.m001-3d-shell')?.classList.add('pacvu-viewer__shell');
    head?.classList.add('pacvu-viewer__header');
    stage?.classList.add('pacvu-viewer__stage');
    controls?.classList.add('pacvu-viewer__controls');
    const badge = modal.querySelector('.m001-3d-badge');
    if (badge && options.badge) badge.textContent = options.badge;
    let download = head?.querySelector('[data-download]');
    let createdDownload = false;
    if (head && !download) {
      download = document.createElement('button');
      download.type = 'button';
      download.className = 'btn light';
      download.dataset.download = '';
      head.append(download);
      createdDownload = true;
    }
    const close = head?.querySelector('[data-close]');
    if (download) {
      download.textContent = 'PNG Download';
      download.classList.add('pacvu-viewer__download');
      if (createdDownload && !download.dataset.bound) {
        download.dataset.bound = 'true';
        download.addEventListener('click', () => {
          const canvas = stage?.querySelector('canvas');
          if (!canvas) return;
          canvas.toBlob(blob => {
            if (!blob) return;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${options.code || 'PacVu'}_3D.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          }, 'image/png');
        });
      }
    }
    if (close) close.textContent = 'Close';
    const existingExpand = head?.querySelector('[data-expand]');
    if (existingExpand) {
      existingExpand.textContent = 'Expand';
      existingExpand.closest('div')?.classList.add('pacvu-viewer__actions');
    }
    if (head && !existingExpand) {
      const actions = document.createElement('div');
      actions.className = 'pacvu-viewer__actions';
      const expand = document.createElement('button');
      expand.type = 'button';
      expand.className = 'btn light';
      expand.dataset.expand = '';
      expand.textContent = 'Expand';
      actions.append(expand);
      if (close) actions.append(close);
      head.append(actions);
    }
    let views = modal.querySelector('.m001-3d-views');
    if (!views && stage) {
      views = document.createElement('div');
      views.className = 'm001-3d-views pacvu-viewer__views';
      views.innerHTML = '<button type="button" class="btn light" data-view="iso">Isometric</button><button type="button" class="btn light" data-view="front">Front</button><button type="button" class="btn light" data-view="top">Top</button><button type="button" class="btn light" data-shadow>Shadows On</button>';
      stage.append(views);
    }
    if (views) {
      views.classList.add('pacvu-viewer__views');
      const labels = { iso: 'Isometric', front: 'Front', top: 'Top' };
      views.querySelectorAll('[data-view]').forEach(button => {
        button.textContent = labels[button.dataset.view] || button.textContent;
      });
      const shadow = views.querySelector('[data-shadow], [data-action="shadow"]');
      if (shadow) shadow.textContent = 'Shadows On';
      if (stage && views.parentElement !== stage) stage.append(views);
    }
    if (stage && controls && controls.parentElement !== stage) stage.append(controls);
    const expand = modal.querySelector('[data-expand]');
    if (expand && !expand.dataset.bound) {
      expand.dataset.bound = 'true';
      expand.addEventListener('click', () => {
        const expanded = modal.classList.toggle('pacvu-viewer--expanded');
        expand.textContent = expanded ? 'Restore' : 'Expand';
        expand.setAttribute('aria-pressed', String(expanded));
        requestAnimationFrame(() => global.dispatchEvent(new Event('resize')));
      });
    }
    return { modal, stage, controls, range: controls?.querySelector('input[type="range"]') };
  }

  function standardizeEnvironment({ renderer, scene, controls, floor, grid } = {}) {
    if (renderer) {
      renderer.setClearColor(COLORS.background, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE[THEME.renderer.toneMapping];
      renderer.toneMappingExposure = THEME.renderer.exposure;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE[THEME.renderer.shadowMapType];
    }
    if (scene) scene.background = new THREE.Color(COLORS.background);
    if (scene) {
      let directionalIndex = 0;
      scene.traverse(object => {
        if (object.isHemisphereLight) {
          object.color.set(THEME.hemisphereLight.skyColor);
          object.groundColor.set(THEME.hemisphereLight.groundColor);
          object.intensity = THEME.hemisphereLight.intensity;
        }
        if (object.isDirectionalLight) {
          object.intensity = directionalIndex === 0 ? THEME.directionalLight.intensity : THEME.fillLight.intensity;
          if (directionalIndex === 0) object.position.fromArray(THEME.directionalLight.position);
          directionalIndex += 1;
        }
      });
    }
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = .075;
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.rotateSpeed = .42;
      controls.panSpeed = .62;
      controls.zoomSpeed = .35;
      installContinuousWheelZoom(controls);
    }
    if (floor?.material?.isShadowMaterial) {
      floor.material.color.set(THEME.floor.color);
      floor.material.opacity = THEME.floor.opacity;
    }
    if (grid?.material) {
      grid.material.transparent = true;
      grid.material.opacity = THEME.grid.opacity;
    }
  }

  function fitObject(object, camera, controls, view = 'iso') {
    if (!object || !camera || !controls) return;
    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const radius = Math.max(1, bounds.getBoundingSphere(new THREE.Sphere()).radius);
    const target = center.clone();
    target.z += radius * .045;
    const directions = {
      iso: new THREE.Vector3(1.35, -1.55, 1.05),
      isometric: new THREE.Vector3(1.35, -1.55, 1.05),
      front: new THREE.Vector3(0, -1, .04),
      top: new THREE.Vector3(0, -.02, 1)
    };
    const direction = (directions[view] || directions.iso).normalize();
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = Math.max(radius * 2.4, Math.max(size.x / camera.aspect, size.y, size.z) * .6 / Math.tan(fov / 2));
    controls.target.copy(target);
    camera.position.copy(target).add(direction.multiplyScalar(distance));
    camera.near = Math.max(.05, distance - radius * 3);
    camera.far = distance + radius * 8;
    camera.updateProjectionMatrix();
    controls.minDistance = radius * .25;
    controls.maxDistance = radius * 24;
    controls.update();
  }

  function createEnvironment(stage, options = {}) {
    const THREE = global.THREE;
    const renderer = createRenderer(THREE, { preserveDrawingBuffer: true });
    renderer.setClearColor(COLORS.background, 1);
    stage.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);
    const camera = createPerspectiveCamera(THREE, options.dimensions, options);
    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .075;
    controls.enablePan = true;
    controls.rotateSpeed = .52;
    controls.panSpeed = .7;
    controls.zoomSpeed = .35;
    installContinuousWheelZoom(controls);
    controls.minPolarAngle = .08;
    controls.maxPolarAngle = Math.PI * .78;

    scene.add(new THREE.HemisphereLight(THEME.hemisphereLight.skyColor, THEME.hemisphereLight.groundColor, THEME.hemisphereLight.intensity));
    const sun = new THREE.DirectionalLight(THEME.directionalLight.color, THEME.directionalLight.intensity);
    sun.position.fromArray(THEME.directionalLight.position);
    sun.castShadow = true;
    sun.shadow.mapSize.set(THEME.directionalLight.shadowMapSize, THEME.directionalLight.shadowMapSize);
    sun.shadow.camera.left = -THEME.directionalLight.shadowBounds;
    sun.shadow.camera.right = THEME.directionalLight.shadowBounds;
    sun.shadow.camera.top = THEME.directionalLight.shadowBounds;
    sun.shadow.camera.bottom = -THEME.directionalLight.shadowBounds;
    sun.shadow.camera.near = THEME.directionalLight.shadowNear;
    sun.shadow.camera.far = THEME.directionalLight.shadowFar;
    sun.shadow.bias = THEME.directionalLight.shadowBias;
    sun.shadow.normalBias = THEME.directionalLight.shadowNormalBias;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(THEME.fillLight.color, THEME.fillLight.intensity);
    fill.position.fromArray(THEME.fillLight.position);
    scene.add(fill);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(THEME.floor.size, THEME.floor.size),
      new THREE.ShadowMaterial({ color: THEME.floor.color, opacity: THEME.floor.opacity })
    );
    floor.position.z = THEME.floor.z;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(THEME.grid.size, THEME.grid.divisions, THEME.grid.centerColor, THEME.grid.lineColor);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = THEME.grid.z;
    grid.material.transparent = true;
    grid.material.opacity = THEME.grid.opacity;
    scene.add(grid);

    const resize = () => {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const boundsOf = object => new THREE.Box3().setFromObject(object);
    const fitBounds = (bounds, view = 'iso') => {
      if (!bounds || bounds.isEmpty()) return;
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const radius = Math.max(1, bounds.getBoundingSphere(new THREE.Sphere()).radius);
      const target = center.clone();
      target.z += Math.max(size.z, radius) * .045;
      controls.target.copy(target);
      const directions = {
        iso: new THREE.Vector3(1.35, -1.55, 1.05),
        front: new THREE.Vector3(0, -1, .04),
        top: new THREE.Vector3(0, -.02, 1)
      };
      const direction = (directions[view] || directions.iso).normalize();
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distance = Math.max(radius * 2.35, (Math.max(size.x / camera.aspect, size.y, size.z) * .58) / Math.tan(fov / 2));
      camera.position.copy(target).add(direction.multiplyScalar(distance));
      camera.near = Math.max(.05, distance - radius * 3);
      camera.far = distance + radius * 8;
      camera.updateProjectionMatrix();
      controls.minDistance = radius * .25;
      controls.maxDistance = radius * 24;
      controls.update();
    };
    const fitObject = (object, view = 'iso') => fitBounds(boundsOf(object), view);
    const setShadows = enabled => {
      sun.castShadow = enabled;
      floor.visible = enabled;
    };
    const materials = () => createBoardMaterials(THREE);
    return { renderer, scene, camera, controls, sun, floor, grid, resize, boundsOf, fitBounds, fitObject, setShadows, materials };
  }

  global.PacVu3DViewer = Object.freeze({
    THEME,
    COLORS,
    createModal,
    createEnvironment,
    createRenderer,
    createPerspectiveCamera,
    createOverlayMaterial,
    syncProgress,
    createBoardMaterials,
    assignBoardFaceMaterials,
    standardizeLegacy,
    standardizeEnvironment,
    fitObject
  });
})(window);
