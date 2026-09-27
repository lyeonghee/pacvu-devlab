(function (global) {
  'use strict';

  const PROFILE = Object.freeze({
    id: 'white-studio.v1',
    background: 0xecebe8,
    hemisphere: Object.freeze({ sky: 0xfffefa, ground: 0xe2e1df, intensity: .85 }),
    key: Object.freeze({ color: 0xfffcf7, intensity: 2.7, position: Object.freeze([-160, -220, 420]) }),
    fill: Object.freeze({ color: 0xf6f8ff, intensity: .8, position: Object.freeze([280, 220, 220]) }),
    rake: Object.freeze({ color: 0xfffdf9, intensity: .75, position: Object.freeze([450, -220, 160]) }),
    floor: Object.freeze({ color: 0x777570, opacity: .13, z: -2 }),
    reflection: Object.freeze({ size: 768, strength: .25, zOffset: -.02 }),
    camera: Object.freeze({ distanceMultiplier: .86, direction: Object.freeze([1.4, -1, .62]), targetZ: 3 })
  });

  function createGroundTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 660);
    gradient.addColorStop(0, '#f4f3ef');
    gradient.addColorStop(.55, '#f0efec');
    gradient.addColorStop(1, '#ecebe8');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function create(options) {
    const THREE = global.THREE;
    const { scene, camera, controls, renderer, root, sun, floor, grid } = options;
    if (!THREE || !scene || !camera || !controls || !renderer || !root || !sun || !floor || !grid) {
      throw new Error('PacVu White Studio requires a complete Viewer environment.');
    }

    scene.background = new THREE.Color(PROFILE.background);
    renderer.setClearColor(PROFILE.background, 1);
    renderer.toneMappingExposure = 1;
    scene.traverse(object => {
      if (object.isHemisphereLight) {
        object.color.set(PROFILE.hemisphere.sky);
        object.groundColor.set(PROFILE.hemisphere.ground);
        object.position.set(0, 0, 1);
        object.intensity = PROFILE.hemisphere.intensity;
      }
    });
    sun.color.set(PROFILE.key.color);
    sun.intensity = PROFILE.key.intensity;
    sun.position.fromArray(PROFILE.key.position);
    renderer.shadowMap.type = THREE.VSMShadowMap;
    sun.shadow.map?.dispose();
    sun.shadow.map = null;
    sun.shadow.mapPass?.dispose();
    sun.shadow.mapPass = null;
    scene.traverse(object => {
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => { material.needsUpdate = true; });
    });
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.radius = 12;
    sun.shadow.blurSamples = 16;
    sun.shadow.normalBias = .025;
    sun.shadow.bias = -.00003;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 1600;
    sun.shadow.camera.left = -260;
    sun.shadow.camera.right = 260;
    sun.shadow.camera.top = 260;
    sun.shadow.camera.bottom = -260;
    sun.shadow.camera.updateProjectionMatrix();

    const fill = new THREE.DirectionalLight(PROFILE.fill.color, PROFILE.fill.intensity);
    fill.position.fromArray(PROFILE.fill.position);
    scene.add(fill);
    const rake = new THREE.DirectionalLight(PROFILE.rake.color, PROFILE.rake.intensity);
    rake.position.fromArray(PROFILE.rake.position);
    scene.add(rake);

    floor.position.z = PROFILE.floor.z;
    floor.material.color.set(PROFILE.floor.color);
    floor.material.opacity = PROFILE.floor.opacity;
    floor.renderOrder = 2;
    const groundTexture = createGroundTexture(THREE);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1800, 1800),
      new THREE.MeshBasicMaterial({ map: groundTexture, toneMapped: false })
    );
    ground.name = 'PacVu White Studio horizon floor';
    ground.position.set(70, 0, floor.position.z - .25);
    scene.add(ground);

    const target = new THREE.WebGLRenderTarget(PROFILE.reflection.size, PROFILE.reflection.size, {
      depthBuffer: true,
      stencilBuffer: false
    });
    const mirrorCamera = camera.clone();
    const textureMatrix = new THREE.Matrix4();
    const reflectionMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        reflectionMap: { value: target.texture },
        textureMatrix: { value: textureMatrix },
        texel: { value: new THREE.Vector2(1 / PROFILE.reflection.size, 1 / PROFILE.reflection.size) },
        strength: { value: PROFILE.reflection.strength }
      },
      vertexShader: 'uniform mat4 textureMatrix; varying vec4 mirrorUV; void main(){vec4 world=modelMatrix*vec4(position,1.0);mirrorUV=textureMatrix*world;gl_Position=projectionMatrix*viewMatrix*world;}',
      fragmentShader: `uniform sampler2D reflectionMap;uniform vec2 texel;uniform float strength;varying vec4 mirrorUV;
        void main(){vec2 uv=mirrorUV.xy/mirrorUV.w;if(any(lessThan(uv,vec2(0.0)))||any(greaterThan(uv,vec2(1.0))))discard;
          vec4 total=vec4(0.0);float weightSum=0.0;
          for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++){float weight=exp(-float(x*x+y*y)*.45);vec4 s=texture2D(reflectionMap,uv+vec2(float(x),float(y))*texel*2.2);total+=vec4(s.rgb*s.a,s.a)*weight;weightSum+=weight;}
          total/=weightSum;if(total.a<.001)discard;gl_FragColor=vec4(total.rgb/max(total.a,.001),total.a*strength);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    });
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), reflectionMaterial);
    reflection.name = 'PacVu White Studio soft floor reflection';
    reflection.position.copy(ground.position);
    reflection.position.z = floor.position.z + PROFILE.reflection.zOffset;
    reflection.renderOrder = 1;
    scene.add(reflection);

    const previousRender = renderer.render.bind(renderer);
    const bias = new THREE.Matrix4().set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1);
    let active = false;
    renderer.render = function (currentScene, currentCamera) {
      if (active || currentScene !== scene || currentCamera !== camera) return previousRender(currentScene, currentCamera);
      active = true;
      const oldTarget = renderer.getRenderTarget();
      const background = scene.background;
      const oldAuto = renderer.shadowMap.autoUpdate;
      const oldClear = renderer.getClearColor(new THREE.Color());
      const oldAlpha = renderer.getClearAlpha();
      const hidden = [floor, ground, reflection, grid];
      const visibility = hidden.map(object => object.visible);
      try {
        const height = reflection.position.z;
        mirrorCamera.copy(camera);
        mirrorCamera.position.z = 2 * height - camera.position.z;
        const direction = camera.getWorldDirection(new THREE.Vector3());
        direction.z = -direction.z;
        mirrorCamera.up.copy(camera.up);
        mirrorCamera.up.z = -mirrorCamera.up.z;
        mirrorCamera.lookAt(mirrorCamera.position.clone().add(direction));
        mirrorCamera.updateMatrixWorld(true);
        textureMatrix.copy(bias).multiply(mirrorCamera.projectionMatrix).multiply(mirrorCamera.matrixWorldInverse);
        hidden.forEach(object => { object.visible = false; });
        scene.background = null;
        renderer.shadowMap.autoUpdate = false;
        renderer.setRenderTarget(target);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        previousRender(scene, mirrorCamera);
      } finally {
        hidden.forEach((object, index) => { object.visible = visibility[index]; });
        scene.background = background;
        renderer.shadowMap.autoUpdate = oldAuto;
        renderer.setRenderTarget(oldTarget);
        renderer.setClearColor(oldClear, oldAlpha);
        active = false;
      }
      return previousRender(currentScene, currentCamera);
    };

    function view() {
      const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
      const distance = camera.position.distanceTo(controls.target) * PROFILE.camera.distanceMultiplier;
      controls.target.copy(center).add(new THREE.Vector3(0, 0, PROFILE.camera.targetZ));
      camera.position.copy(controls.target).addScaledVector(new THREE.Vector3(...PROFILE.camera.direction).normalize(), distance);
      camera.near = .1;
      camera.updateProjectionMatrix();
      controls.update();
    }

    return {
      profile: PROFILE,
      ground,
      reflection,
      target,
      view,
      setShadows(enabled) {
        floor.visible = enabled;
        reflection.visible = enabled;
      },
      dispose() {
        renderer.render = previousRender;
        scene.remove(fill, rake, ground, reflection);
        ground.geometry.dispose();
        ground.material.dispose();
        groundTexture.dispose();
        reflection.geometry.dispose();
        reflectionMaterial.dispose();
        target.dispose();
      }
    };
  }

  global.PacVuWhiteStudio = Object.freeze({ PROFILE, create });
})(window);
