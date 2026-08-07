(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE || !global.PacVu3DViewer) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = v => {
    v = clamp(v, 0, 1);
    return v * v * (3 - 2 * v);
  };

  function signature() {
    const c = typeof getCfgS001 === 'function' ? getCfgS001() : {};
    return [
      +c.W || 298,
      +c.D || 61,
      +c.H || 292,
      c.productFitPreset || 'baseline',
    ].join(':');
  }

  function completed(api) {
    const source = api.getCompleted();
    const clone = source.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());

    clone.position.sub(center);
    clone.updateMatrixWorld(true);

    return {
      object: clone,
      box: new THREE.Box3().setFromObject(clone),
    };
  }

  function build() {
    const sig = signature();
    const outer = completed(global.S001Outer3DModel);
    const tray = completed(global.S001Inner3D);
    const insert = completed(global.S001Insert3D);
    const viewer = global.PacVu3DViewer.createModal({
      id: 's001ExactAssembly3dModal',
      badge: 'S001 · Approved Parts Assembly',
    });
    const { modal, stage } = viewer;
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(global.PacVu3DTheme.colors.background);

    const totalW = Math.max(
      300,
      outer.box.getSize(new THREE.Vector3()).x,
    );
    const camera = global.PacVu3DViewer.createPerspectiveCamera(THREE, {
      W: totalW,
      D: 100,
      H: 300,
    });
    const renderer = global.PacVu3DViewer.createRenderer(THREE);

    stage.prepend(renderer.domElement);

    const controls = new global.PacVuOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.screenSpacePanning = true;

    scene.add(
      new THREE.HemisphereLight(
        global.PacVu3DTheme.hemisphereLight.skyColor,
        global.PacVu3DTheme.hemisphereLight.groundColor,
        global.PacVu3DTheme.hemisphereLight.intensity,
      ),
    );

    const sun = new THREE.DirectionalLight(
      global.PacVu3DTheme.directionalLight.color,
      global.PacVu3DTheme.directionalLight.intensity,
    );
    sun.position.fromArray(global.PacVu3DTheme.directionalLight.position);
    sun.castShadow = true;
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1800),
      new THREE.ShadowMaterial({ color: 0x3f3933, opacity: .3 }),
    );
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(
      global.PacVu3DTheme.grid.size,
      global.PacVu3DTheme.grid.divisions,
      global.PacVu3DTheme.grid.centerColor,
      global.PacVu3DTheme.grid.lineColor,
    );
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    global.PacVu3DViewer.standardizeEnvironment({
      renderer,
      scene,
      controls,
      floor,
      grid,
    });

    const root = new THREE.Group();
    const sleeveGroup = new THREE.Group();
    const payload = new THREE.Group();
    const trayGroup = new THREE.Group();
    const insertGroup = new THREE.Group();

    scene.add(root);
    root.add(sleeveGroup, payload);
    sleeveGroup.add(outer.object);
    payload.add(trayGroup, insertGroup);
    trayGroup.add(tray.object);
    insertGroup.add(insert.object);

    const os = outer.box.getSize(new THREE.Vector3());
    const ts = tray.box.getSize(new THREE.Vector3());
    const is = insert.box.getSize(new THREE.Vector3());
    const assemblyTravel = os.y + ts.y / 2 + 75;
    const insertLift = Math.max(85, is.z + 55);
    const sleeveSupport = outer.object.getObjectByName('back');
    const sleeveSupportMin = sleeveSupport
      ? new THREE.Box3().setFromObject(sleeveSupport).min.z
      : outer.box.min.z;
    const sleeveFloorDrop = Math.max(0, os.z - ts.z);
    const sleeveGroundZ = -sleeveSupportMin - sleeveFloorDrop;
  const finalTrayZ = sleeveGroundZ + 9;
    const finalInsertZ =
      finalTrayZ + tray.box.min.z - insert.box.min.z + .8;

    sleeveGroup.position.z = sleeveGroundZ;
    trayGroup.position.z = finalTrayZ;
    insertGroup.position.z = finalInsertZ + insertLift;
    floor.position.z = 0;
    grid.position.z = .02;

    function pose(v) {
      global.PacVu3DViewer.syncProgress(
        viewer,
        v * 100,
        'S001 Approved Parts Assembly',
      );

      const drop = smooth((v - .04) / .34);
      const slide = smooth((v - .42) / .43);
   const stand = smooth((v - 0.94) / 0.06);

  const finalSlideY = -6; // 트레이를 20mm 더 깊게 삽입
payload.position.set(
  0,
  assemblyTravel * (1 - slide) + finalSlideY * slide,
  0
);
      payload.rotation.set(0, 0, 0);
      trayGroup.position.set(0, 0, finalTrayZ);
      trayGroup.rotation.set(0, 0, 0);
      insertGroup.position.set(
        0,
        0,
        finalInsertZ + insertLift * (1 - drop),
      );
      root.rotation.set(Math.PI / 2 * stand, 0, 0);
      root.position.z = 0;
      root.updateMatrixWorld(true);

      if (stand > 0) {
        const assembledBounds = new THREE.Box3().setFromObject(root);
        root.position.z = -assembledBounds.min.z;
      }
    }

    function resize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const fit = v =>
      global.PacVu3DViewer.fitObject(root, camera, controls, v);

    viewer.range.oninput = () => pose(+viewer.range.value / 100);
    viewer.range.onchange = () => fit('iso');

    modal.querySelectorAll('[data-view]').forEach(
      b => (b.onclick = () => fit(b.dataset.view)),
    );
    modal.querySelector('[data-close]').onclick = () =>
      modal.classList.remove('open');
    modal.querySelector('[data-shadow]').onclick = e => {
      floor.visible = !floor.visible;
      sun.castShadow = floor.visible;
      e.currentTarget.textContent = floor.visible
        ? 'Shadows On'
        : 'Shadows Off';
    };
    modal.querySelector('[data-download]').onclick = () =>
      renderer.domElement.toBlob(blob => {
        if (!blob) return;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'S001_APPROVED_PARTS_ASSEMBLY.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });

    const ob = new ResizeObserver(resize);
    ob.observe(stage);
    resize();
    pose(0);
    fit('iso');

    let live = true;
    (function loop() {
      if (!live) return;

      requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    }());

    return {
      signature: sig,
      open() {
        modal.classList.add('open');
        resize();
        fit('iso');
      },
      destroy() {
        live = false;
        ob.disconnect();
        controls.dispose?.();
        renderer.dispose();
        modal.remove();
      },
    };
  }

  let app;
  global.S001Assembly3D = {
    open() {
      if (
        !global.S001Outer3DModel?.getCompleted ||
        !global.S001Inner3D?.getCompleted ||
        !global.S001Insert3D?.getCompleted
      ) return;

      const sig = signature();
      if (!app || app.signature !== sig) {
        app?.destroy();
        app = build();
      }
      app.open();
    },
  };
}(window));
