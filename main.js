import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/aryanbaburajan/quaviz/main/public/models_compressed/";

class SizeOfViewer {
  constructor() {
    this.defaultEnabledModelNames = ["human"];
    this.modelsData = this.getModelData();
    this.models = [];
    this.boundingBoxes = new Map();
    this.sceneWidth = 0;

    this.setupRenderer();
    this.setupCamera();
    this.setupScene();
    this.setupControls();
    this.setupLights();
    this.populateControlMenu();
    this.setupPostProcessing();

    window.addEventListener("resize", () => this.onWindowResize());
    this.renderer.setAnimationLoop(() => this.render());
  }

  getModelData() {
    return [
      { name: "cat", path: "cat/scene.glb", height: 0.4 },
      { name: "tiger", path: "tiger/scene.glb", height: 1.1 },
      {
        name: "aventador",
        path: "lamborghini_aventador/scene.glb",
        height: 1.14,
      },
      {
        name: "delorean",
        path: "delorean_dmc/scene.glb",
        height: 1.2,
      },
      {
        name: "human",
        path: "genshin_impact_barbara/scene.glb",
        height: 1.7,
      },
      {
        name: "100 meter",
        path: "train/scene.glb",
        widthOverride: 100,
      },
      {
        name: "r/anythingbutmetric",
        path: "washing_machine/scene.glb",
        height: 0.85,
      },
      {
        name: "r/anythingbutmetric x2",
        path: "two_washing_machines/scene.glb",
        height: 1.7,
      },
      {
        name: "r/anythingbutmetric x3",
        path: "three_washing_machines/scene.glb",
        height: 2.5,
      },
      {
        name: "donald trump",
        path: "donald_trump/scene.glb",
        height: 1.9,
      },
      { name: "horse", path: "horse/scene.glb", height: 2 },
      {
        name: "elephant",
        path: "elephant/scene.glb",
        height: 2.8,
      },
      {
        name: "basketball hoop",
        path: "basketball_hoop/scene.glb",
        height: 3.05,
      },
      {
        name: "warthog",
        path: "halo_warthog/scene.glb",
        height: 3.2,
      },
      {
        name: "giraffe",
        path: "giraffe/scene.glb",
        height: 4.3,
      },
      {
        name: "blue whale",
        path: "blue_whale/scene.glb",
        height: 4.42,
      },
      {
        name: "banshee",
        path: "halo_banshee/scene.glb",
        height: 5.4,
      },
      {
        name: "argentinosaurus",
        path: "argentinosaurus/scene.glb",
        height: 7,
      },
      {
        name: "millennium falcon",
        path: "starwars_millenium_falcon/scene.glb",
        height: 7.8,
      },
      {
        name: "megalodon",
        path: "megalodon/scene.glb",
        height: 16,
      },
      {
        name: "boeing 747",
        path: "boeing_747/scene.glb",
        height: 19.33,
      },
      {
        name: "titanic",
        path: "titanic/scene.glb",
        height: 53.3,
      },
      {
        name: "colossal titan",
        path: "aot_colossal_titan/scene.glb",
        height: 60,
      },
      {
        name: "iss",
        path: "international_space_station/scene.glb",
        height: 73,
      },
      {
        name: "saturn v",
        path: "saturn_v/scene.glb",
        height: 110.6,
      },
      {
        name: "founding titan",
        path: "aot_founding_titan/scene.glb",
        height: 120,
      },
      {
        name: "godzilla",
        path: "godzilla/scene.glb",
        height: 120,
      },
      {
        name: "spacex starship",
        path: "spacex_starship/scene.glb",
        height: 120,
      },
      {
        name: "great pyramid of giza",
        path: "the_great_pyramid_of_giza/scene.glb",
        height: 138.8,
      },
      {
        name: "eiffel tower",
        path: "eiffel_tower/scene.glb",
        height: 312,
      },
      {
        name: "endurance",
        path: "interstellar_endurance/scene.glb",
        height: 347,
      },
      {
        name: "burj khalifa",
        path: "burj_khalifa/scene.glb",
        height: 830,
      },
      {
        name: "array",
        path: "halo_array/scene.glb",
        height: 5000,
        unit: 0.1,
      },
      {
        name: "mount everest",
        path: "mount_everest/scene.glb",
        height: 8849,
        unit: 0.1,
      },
      {
        name: "moon",
        path: "moon/scene.glb",
        height: 3474800,
        unit: 0.001,
      },
    ];
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1e8
    );
    this.camera.position.z = 5;
  }

  setupScene() {
    this.scene = new THREE.Scene();
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const shader = this.createLiquidGlassShader();
    this.liquidGlassPass = new ShaderPass(shader);
    this.liquidGlassPass.uniforms.uControlsUvRegion.value = new THREE.Vector4();
    this.liquidGlassPass.uniforms.uControlsUvRegion.value =
      this.getControlsDomUvRegion();
    this.composer.addPass(this.liquidGlassPass);
    this.composer.addPass(new OutputPass());
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = -2;
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambient);
  }

  populateControlMenu() {
    this.controlsDom = document.getElementById("sidebar");
    const list = document.getElementById("object-list");
    this.modelsData.forEach((model) => {
      const container = document.createElement("div");
      container.innerHTML = `
        <label>${model.name}</label>
        <label class="switch">
          <input type="checkbox" />
          <span class="slider"></span>
        </label>`;

      const checkbox = container.querySelector("input");
      checkbox.checked = this.defaultEnabledModelNames.includes(model.name);
      checkbox.addEventListener("change", () => this.toggleModel(model));
      list.appendChild(container);

      if (checkbox.checked) this.loadModel(model);
    });
  }

  loadModel(model) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    const fullPath = GITHUB_RAW_BASE + model.path;

    loader.load(fullPath, (gltf) => {
      const object = gltf.scene;
      object.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.side = THREE.DoubleSide;

          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if ("metalness" in mat) mat.metalness = 0;
              if ("specular" in mat) mat.specular.setScalar(0);
            });
          } else {
            if ("metalness" in child.material) {
              child.material.metalness = 0;
            }
            if ("specular" in child.material) {
              child.material.specular.setScalar(0);
            }
          }
        }
      });

      this.scene.add(object);
      model.object = object;
      this.models.push(model);

      // const boxHelper = new THREE.BoxHelper(object, 0xff0000);
      // this.scene.add(boxHelper);
      // this.boundingBoxes.set(model.name, boxHelper);

      this.updateModelTransforms();
    });
  }

  toggleModel(model) {
    if (!model.object) return this.loadModel(model);

    model.object.visible = !model.object.visible;
    const boxHelper = this.boundingBoxes.get(model.name);
    if (boxHelper) boxHelper.visible = model.object.visible;

    this.updateModelTransforms();
  }

  updateModelTransforms() {
    const visibleModels = this.modelsData.filter(
      (m) => m.object && m.object.visible
    );
    const units = visibleModels.map((m) => m.unit).filter(Boolean);
    const baseUnit = units.length ? Math.min(...units) : 1;

    this.sceneWidth = 0;
    visibleModels.forEach((model, index) => {
      model.object.scale.setScalar(1);

      const box = new THREE.Box3().setFromObject(model.object);
      const size = box.getSize(new THREE.Vector3());

      const useWidth = model.widthOverride !== undefined;
      const referenceDimension = useWidth ? size.x : size.y;
      const targetDimension = useWidth ? model.widthOverride : model.height;
      const scale = (targetDimension * baseUnit) / referenceDimension;

      model.object.scale.setScalar(scale);

      const gap = 0.5;
      const newBox = new THREE.Box3().setFromObject(model.object);
      const newSize = newBox.getSize(new THREE.Vector3());

      model.width = newSize.x;

      model.targetPosition = new THREE.Vector3(
        this.sceneWidth + model.width / 2,
        0,
        0
      );

      this.sceneWidth +=
        model.width + (index < visibleModels.length - 1 ? gap : 0);
    });
  }

  updateModelPositions() {
    this.models.forEach((model) => {
      if (model.object && model.object.visible && model.targetPosition) {
        model.object.position.lerp(model.targetPosition, 0.1);
        const boxHelper = this.boundingBoxes.get(model.name);
        if (boxHelper) boxHelper.update();
      }
    });

    this.controls.target.lerp(
      new THREE.Vector3(
        this.sceneWidth / 2,
        Math.max(this.controls.target.y, 0),
        0
      ),
      0.1
    );
  }

  render() {
    this.controls.update();
    this.updateModelPositions();
    this.composer.render();
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.liquidGlassPass.uniforms.uControlsUvRegion.value =
      this.getControlsDomUvRegion();
  }

  getControlsDomUvRegion() {
    const rect = this.controlsDom.getBoundingClientRect();
    const u0 = rect.left / window.innerWidth;
    const v0 = 1 - (rect.top + rect.height) / window.innerHeight;
    const u1 = (rect.left + rect.width) / window.innerWidth;
    const v1 = 1 - rect.top / window.innerHeight;
    return new THREE.Vector4(u0, v0, u1, v1);
  }

  createLiquidGlassShader() {
    return {
      uniforms: {
        tDiffuse: { value: null },
        uControlsUvRegion: { value: new THREE.Vector4() },
        uRadius: { value: 20.0 / window.innerWidth },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec4 uControlsUvRegion;
        uniform float uRadius;

        varying vec2 vUv;

        float sdfRoundedRect(vec2 uv, vec4 rect, float radius) {
          vec2 center = 0.5 * (rect.xy + rect.zw);
          vec2 size = rect.zw - rect.xy;
          vec2 halfSize = size * 0.5;

          vec2 local = uv - center;
          vec2 d = abs(local) - halfSize + vec2(radius);
          return length(max(d, 0.0)) - radius;
        }

        bool inRoundedRect(vec2 uv, vec4 rect, float radius) {
          return sdfRoundedRect(uv, rect, radius) < 0.0;
        }

        vec4 liquidGlass(vec2 regionMin, vec2 regionMax) {
          vec2 regionSize = regionMax - regionMin;
          vec2 localUv = (vUv - regionMin) / regionSize;

          vec2 centered = localUv - 0.5;
          float distance = length(centered);
          vec2 offset = centered * -distance * distance;

          vec2 distortedLocalUv = localUv + offset;
          vec2 distortedUv = regionMin + distortedLocalUv * regionSize;

          float r = texture2D(tDiffuse, distortedUv + vec2(offset * offset * 0.2)).x;
          float g = texture2D(tDiffuse, distortedUv).y;
          float b = texture2D(tDiffuse, distortedUv - vec2(offset * offset * 0.2)).z;
          vec3 color = vec3(r, g, b);

          return vec4(color, 1.0);
        }

        void main() {
          if (
            vUv.x >= uControlsUvRegion.x && vUv.x <= uControlsUvRegion.z &&
            vUv.y >= uControlsUvRegion.y && vUv.y <= uControlsUvRegion.w &&
            inRoundedRect(vUv, uControlsUvRegion, uRadius)
          ) {
            vec2 regionMin = uControlsUvRegion.xy;
            vec2 regionMax = uControlsUvRegion.zw;
            gl_FragColor = liquidGlass(regionMin, regionMax);
          } else {
            gl_FragColor = texture2D(tDiffuse, vUv);
          }
        }`,
    };
  }
}

const viewer = new SizeOfViewer();
