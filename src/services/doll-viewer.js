import * as THREE from "three";

function defaultFaceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f2d7b6";
  context.fillRect(0, 0, 512, 512);
  context.fillStyle = "#30261f";
  context.beginPath();
  context.arc(166, 235, 22, 0, Math.PI * 2);
  context.arc(346, 235, 22, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 18;
  context.lineCap = "round";
  context.beginPath();
  context.arc(256, 292, 85, 0.25, Math.PI - 0.25);
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function defaultStandeeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#d7edf0");
  gradient.addColorStop(1, "#f2dfb7");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(255, 255, 255, 0.58)";
  context.beginPath();
  context.arc(384, 340, 180, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#5b867d";
  context.beginPath();
  context.arc(330, 320, 17, 0, Math.PI * 2);
  context.arc(438, 320, 17, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 14;
  context.lineCap = "round";
  context.beginPath();
  context.arc(384, 370, 70, 0.25, Math.PI - 0.25);
  context.stroke();
  context.fillStyle = "#6d9e91";
  context.beginPath();
  context.roundRect(220, 545, 328, 330, 150);
  context.fill();
  context.fillStyle = "#fff3d4";
  context.font = "700 34px sans-serif";
  context.textAlign = "center";
  context.fillText("YOUR PHOTO", 384, 940);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class DollViewer {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.currentPhoto = null;
    this.currentStandeePhoto = null;
    this.currentModelUrl = "";
    this.generatedModel = null;
    this.modelLoadId = 0;
    this.photoTexture = null;
    this.standeeTexture = null;
    this.dragging = false;
    this.pointerX = 0;
    this.targetRotation = 0;
    this.userRotation = 0;
    this.lastInteraction = 0;
    this.currentStyle = null;
    this.currentMode = null;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.inViewport = true;
    this.pageVisible = !document.hidden;
    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    this.camera.position.set(0, 0.38, 5.9);
    this.doll = new THREE.Group();
    this.doll.rotation.x = -0.04;
    this.scene.add(this.doll);
    this.buildDoll();
    this.setMode("doll");
    this.buildLighting();
    this.bindControls();

    this.clock = new THREE.Timer();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.inViewport = entry.isIntersecting;
        this.updateAnimationLoop();
      },
      { rootMargin: "100px" },
    );
    this.intersectionObserver.observe(this.container);
    this.handleVisibility = () => {
      this.pageVisible = !document.hidden;
      this.updateAnimationLoop();
    };
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.resize();
    this.container.classList.add("viewer-ready");
    this.updateAnimationLoop();
  }

  buildDoll() {
    this.materials = {
      cozy: {
        skin: new THREE.MeshStandardMaterial({ color: 0xe6c9a2, roughness: 0.72 }),
        cloth: new THREE.MeshStandardMaterial({ color: 0x69c8bd, roughness: 0.62, metalness: 0.04 }),
        clothDark: new THREE.MeshStandardMaterial({ color: 0x4e8298, roughness: 0.68 }),
        accent: new THREE.MeshStandardMaterial({ color: 0xf1b65f, roughness: 0.55 }),
        sole: new THREE.MeshStandardMaterial({ color: 0x24384a, roughness: 0.8 }),
      },
      detective: {
        skin: new THREE.MeshToonMaterial({ color: 0xf0cfa8 }),
        cloth: new THREE.MeshToonMaterial({ color: 0x294b67 }),
        clothDark: new THREE.MeshToonMaterial({ color: 0xd8b875 }),
        accent: new THREE.MeshToonMaterial({ color: 0xe7a94e }),
        sole: new THREE.MeshToonMaterial({ color: 0x172638 }),
      },
    };
    const cozy = this.materials.cozy;

    this.body = new THREE.Mesh(new THREE.SphereGeometry(0.76, 40, 28), cozy.cloth);
    this.doll.add(this.body);

    this.belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 22), cozy.clothDark);
    this.doll.add(this.belly);

    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.73, 48, 34), cozy.skin);
    this.doll.add(this.head);

    const makeLimb = (x, y, rotation, material = cozy.cloth) => {
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.46, 8, 18), material);
      limb.position.set(x, y, 0);
      limb.rotation.z = rotation;
      this.doll.add(limb);
      return limb;
    };
    this.arms = [makeLimb(-0.73, 0.15, -0.48), makeLimb(0.73, 0.15, 0.48)];
    this.legs = [makeLimb(-0.35, -0.82, 0.04, cozy.sole), makeLimb(0.35, -0.82, -0.04, cozy.sole)];

    const earGeometry = new THREE.SphereGeometry(0.2, 24, 18);
    this.ears = [-1, 1].map((side) => {
      const ear = new THREE.Mesh(earGeometry, cozy.accent);
      ear.position.set(side * 0.58, 1.63, -0.05);
      ear.scale.set(1, 1.14, 0.65);
      this.doll.add(ear);
      return ear;
    });

    this.scarf = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.09, 12, 40), cozy.accent);
    this.scarf.rotation.x = Math.PI / 2;
    this.scarf.position.set(0, 0.57, 0.06);
    this.doll.add(this.scarf);

    this.defaultTexture = defaultFaceTexture();
    this.faceMaterial = new THREE.MeshBasicMaterial({ map: this.defaultTexture, transparent: true });
    this.face = new THREE.Mesh(new THREE.CircleGeometry(0.575, 64), this.faceMaterial);
    this.doll.add(this.face);

    this.outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x111923, side: THREE.BackSide });
    this.outlines = [];
    [this.body, this.belly, this.head, ...this.arms, ...this.legs].forEach((mesh) => this.addOutline(mesh));

    this.detectiveAccessories = new THREE.Group();
    const detective = this.materials.detective;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.82, 36, 18), detective.cloth);
    cap.scale.set(1, 0.42, 0.9);
    cap.position.set(0, 1.84, -0.01);
    this.detectiveAccessories.add(cap);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.07, 0.32), detective.clothDark);
    brim.position.set(0.16, 1.76, 0.56);
    brim.rotation.z = -0.04;
    this.detectiveAccessories.add(brim);
    const tie = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), detective.accent);
    tie.scale.set(0.7, 1.35, 0.4);
    tie.position.set(0, 0.28, 0.65);
    this.detectiveAccessories.add(tie);
    const magnifierRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 10, 32), detective.accent);
    magnifierRing.position.set(0.78, 0.15, 0.5);
    const magnifierHandle = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.25, 6, 10), detective.sole);
    magnifierHandle.position.set(0.88, -0.02, 0.5);
    magnifierHandle.rotation.z = -0.58;
    this.detectiveAccessories.add(magnifierRing, magnifierHandle);
    [cap, brim, tie, magnifierRing, magnifierHandle].forEach((mesh) => this.addOutline(mesh, 1.055));
    this.detectiveAccessories.visible = false;
    this.doll.add(this.detectiveAccessories);

    this.scanMaterial = new THREE.MeshBasicMaterial({ color: 0xffe0a3, transparent: true, opacity: 0.75 });
    this.scanRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.025, 8, 64), this.scanMaterial);
    this.scanRing.rotation.x = Math.PI / 2;
    this.scanRing.visible = false;
    this.doll.add(this.scanRing);

    this.pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.94, 0.16, 48),
      new THREE.MeshStandardMaterial({ color: 0x5a3828, roughness: 0.76 }),
    );
    this.pedestal.position.y = -1.22;
    this.scene.add(this.pedestal);
    this.setStyle("cozy");
  }

  buildStandee() {
    this.standee = new THREE.Group();
    this.standee.visible = false;

    this.defaultStandeeTexture = defaultStandeeTexture();
    this.standeeFaceMaterial = new THREE.MeshStandardMaterial({
      map: this.defaultStandeeTexture,
      roughness: 0.38,
      metalness: 0.02,
    });
    this.standeeBackMaterial = this.standeeFaceMaterial.clone();
    const edgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd7edf0,
      roughness: 0.18,
      metalness: 0.04,
      transparent: true,
      opacity: 0.82,
    });
    const panelMaterials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      this.standeeFaceMaterial,
      this.standeeBackMaterial,
    ];
    this.standeePanel = new THREE.Mesh(new THREE.BoxGeometry(1.82, 2.58, 0.09, 2, 2, 1), panelMaterials);
    this.standeePanel.position.y = 0.18;
    this.standee.add(this.standeePanel);

    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(1.94, 2.7, 0.055),
      new THREE.MeshPhysicalMaterial({
        color: 0xbfe3e4,
        transparent: true,
        opacity: 0.28,
        roughness: 0.12,
        side: THREE.DoubleSide,
      }),
    );
    rim.position.set(0, 0.18, -0.06);
    this.standee.add(rim);

    const wood = new THREE.MeshStandardMaterial({ color: 0x6c442e, roughness: 0.76 });
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.28), wood);
    slot.position.y = -1.16;
    this.standee.add(slot);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.98, 0.18, 48), wood);
    base.scale.z = 0.48;
    base.position.y = -1.31;
    this.standee.add(base);

    this.scene.add(this.standee);
    if (this.currentStandeePhoto) this.loadStandeeTexture(this.currentStandeePhoto);
  }

  addOutline(mesh, scale = 1.045) {
    const outline = new THREE.Mesh(mesh.geometry, this.outlineMaterial);
    outline.scale.setScalar(scale);
    outline.visible = false;
    mesh.add(outline);
    this.outlines.push(outline);
  }

  buildLighting() {
    this.scene.add(new THREE.HemisphereLight(0xffe0a3, 0x172437, 2.15));
    const key = new THREE.DirectionalLight(0xffd79a, 2.6);
    key.position.set(2.5, 4, 4);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x69c8bd, 2.2, 8);
    rim.position.set(-2.4, 1.5, 2);
    this.scene.add(rim);
  }

  bindControls() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.dragging = true;
      this.pointerX = event.clientX;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.dragging) return;
      this.userRotation += (event.clientX - this.pointerX) * 0.018;
      this.targetRotation = this.userRotation;
      this.pointerX = event.clientX;
      this.lastInteraction = performance.now();
    });
    const stop = () => {
      this.dragging = false;
    };
    this.canvas.addEventListener("pointerup", stop);
    this.canvas.addEventListener("pointercancel", stop);
  }

  setPhoto(dataUrl, standeeDataUrl = dataUrl) {
    if (dataUrl === this.currentPhoto && standeeDataUrl === this.currentStandeePhoto) return;
    this.currentPhoto = dataUrl;
    this.currentStandeePhoto = standeeDataUrl;
    if (!dataUrl) {
      this.photoTexture?.dispose();
      this.standeeTexture?.dispose();
      this.photoTexture = null;
      this.standeeTexture = null;
      this.faceMaterial.map = this.defaultTexture;
      this.faceMaterial.needsUpdate = true;
      if (this.standeeFaceMaterial) {
        this.standeeFaceMaterial.map = this.defaultStandeeTexture;
        this.standeeBackMaterial.map = this.defaultStandeeTexture;
        this.standeeFaceMaterial.needsUpdate = true;
        this.standeeBackMaterial.needsUpdate = true;
      }
      return;
    }
    const image = new Image();
    image.onload = () => {
      if (dataUrl !== this.currentPhoto) return;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 768;
      canvas.getContext("2d").drawImage(image, 0, 0, 768, 768);
      this.photoTexture?.dispose();
      this.photoTexture = new THREE.CanvasTexture(canvas);
      this.photoTexture.colorSpace = THREE.SRGBColorSpace;
      this.faceMaterial.map = this.photoTexture;
      this.faceMaterial.needsUpdate = true;
      this.standeeFaceMaterial.map = this.photoTexture;
      this.standeeBackMaterial.map = this.photoTexture;
      this.standeeFaceMaterial.needsUpdate = true;
      this.standeeBackMaterial.needsUpdate = true;
    };
    image.src = dataUrl;

    if (this.standee) this.loadStandeeTexture(standeeDataUrl);
  }

  loadStandeeTexture(dataUrl) {
    const standeeImage = new Image();
    standeeImage.onload = () => {
      if (dataUrl !== this.currentStandeePhoto || !this.standeeFaceMaterial) return;
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 1024;
      canvas.getContext("2d").drawImage(standeeImage, 0, 0, canvas.width, canvas.height);
      this.standeeTexture?.dispose();
      this.standeeTexture = new THREE.CanvasTexture(canvas);
      this.standeeTexture.colorSpace = THREE.SRGBColorSpace;
      this.standeeFaceMaterial.map = this.standeeTexture;
      this.standeeBackMaterial.map = this.standeeTexture;
      this.standeeFaceMaterial.needsUpdate = true;
      this.standeeBackMaterial.needsUpdate = true;
    };
    standeeImage.src = dataUrl;
  }

  async setModel(modelUrl) {
    if (modelUrl === this.currentModelUrl) return;
    this.currentModelUrl = modelUrl;
    const loadId = ++this.modelLoadId;
    if (this.generatedModel) {
      this.disposeObject(this.generatedModel);
      this.scene.remove(this.generatedModel);
      this.generatedModel = null;
    }
    this.updateModeVisibility();
    if (!modelUrl) return;

    try {
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      if (loadId !== this.modelLoadId) {
        this.disposeObject(gltf.scene);
        return;
      }
      const model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = 2.8 / Math.max(size.x, size.y, size.z, 0.001);
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -bounds.min.y * scale - 1.2, -center.z * scale);
      this.generatedModel = model;
      this.scene.add(model);
      this.updateModeVisibility();
    } catch {
      this.currentModelUrl = "";
      this.updateModeVisibility();
    }
  }

  setMode(mode) {
    const nextMode = mode === "standee" ? "standee" : "doll";
    if (nextMode === this.currentMode) return;
    if (nextMode === "standee" && !this.standee) this.buildStandee();
    this.currentMode = nextMode;
    this.targetRotation = 0;
    this.userRotation = 0;
    this.updateModeVisibility();
    this.camera.position.set(0, nextMode === "standee" ? 0.12 : this.currentStyle === "detective" ? 0.45 : 0.38, 5.9);
    this.camera.updateProjectionMatrix();
  }

  updateModeVisibility() {
    const standee = this.currentMode === "standee";
    const generated = Boolean(this.generatedModel) && !standee;
    if (this.standee) this.standee.visible = standee;
    this.doll.visible = !standee && !generated;
    this.pedestal.visible = !standee && !generated;
    if (this.generatedModel) this.generatedModel.visible = generated;
  }

  setGeneration(status) {
    this.scanRing.visible = status === "processing";
  }

  setStyle(style) {
    const nextStyle = style === "detective" ? "detective" : "cozy";
    if (nextStyle === this.currentStyle) return;
    this.currentStyle = nextStyle;
    const detective = nextStyle === "detective";
    const materials = this.materials[nextStyle];

    this.body.material = materials.cloth;
    this.belly.material = materials.clothDark;
    this.head.material = materials.skin;
    this.arms.forEach((arm) => {
      arm.material = materials.cloth;
    });
    this.legs.forEach((leg) => {
      leg.material = materials.sole;
    });
    this.ears.forEach((ear) => {
      ear.material = materials.accent;
      ear.visible = !detective;
    });
    this.scarf.material = materials.accent;
    this.scarf.visible = !detective;

    if (detective) {
      this.body.scale.set(0.78, 0.9, 0.64);
      this.body.position.set(0, -0.08, 0);
      this.belly.scale.set(0.86, 0.95, 0.38);
      this.belly.position.set(0, -0.1, 0.48);
      this.head.scale.set(1.18, 1.16, 1.04);
      this.head.position.set(0, 1.14, 0);
      this.face.scale.setScalar(1.18);
      this.face.position.set(0, 1.14, 0.78);
      this.arms[0].position.set(-0.63, 0.04, 0);
      this.arms[1].position.set(0.63, 0.04, 0);
      this.legs[0].position.set(-0.28, -0.8, 0);
      this.legs[1].position.set(0.28, -0.8, 0);
      this.detectiveAccessories.visible = true;
      if (this.currentMode !== "standee") this.camera.position.set(0, 0.45, 6.2);
      this.scanRing.scale.setScalar(1.12);
    } else {
      this.body.scale.set(0.9, 1.05, 0.7);
      this.body.position.set(0, 0.02, 0);
      this.belly.scale.set(1, 1.08, 0.36);
      this.belly.position.set(0, -0.04, 0.54);
      this.head.scale.set(1, 1.03, 0.92);
      this.head.position.set(0, 1.12, 0);
      this.face.scale.setScalar(1);
      this.face.position.set(0, 1.12, 0.69);
      this.arms[0].position.set(-0.73, 0.15, 0);
      this.arms[1].position.set(0.73, 0.15, 0);
      this.legs[0].position.set(-0.35, -0.82, 0);
      this.legs[1].position.set(0.35, -0.82, 0);
      this.detectiveAccessories.visible = false;
      if (this.currentMode !== "standee") this.camera.position.set(0, 0.38, 5.9);
      this.scanRing.scale.setScalar(1);
    }
    this.outlines.forEach((outline) => {
      outline.visible = detective;
    });
    this.camera.updateProjectionMatrix();
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateAnimationLoop() {
    const active = this.inViewport && this.pageVisible;
    this.renderer.setAnimationLoop(active ? () => this.render() : null);
  }

  render() {
    this.clock.update();
    const elapsed = this.clock.getElapsed();
    if (!this.dragging && performance.now() - this.lastInteraction > 5000) {
      this.targetRotation = this.reducedMotion ? 0 : Math.sin(elapsed * 0.45) * 0.16;
      this.userRotation = this.targetRotation;
    }
    this.doll.rotation.y += (this.targetRotation - this.doll.rotation.y) * 0.08;
    this.doll.position.y = this.reducedMotion ? 0 : Math.sin(elapsed * 1.8) * 0.035;
    if (this.standee) {
      this.standee.rotation.y += (this.targetRotation - this.standee.rotation.y) * 0.08;
      this.standee.position.y = this.reducedMotion ? 0 : Math.sin(elapsed * 1.45) * 0.018;
    }
    if (this.generatedModel && !this.reducedMotion) this.generatedModel.rotation.y = Math.sin(elapsed * 0.4) * 0.12;
    if (this.scanRing.visible) {
      this.scanRing.position.y = Math.sin(elapsed * 2.7) * 1.15 + 0.18;
      this.scanMaterial.opacity = 0.45 + Math.sin(elapsed * 5) * 0.2;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.clock.dispose();
    this.scene.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
    this.photoTexture?.dispose();
    this.standeeTexture?.dispose();
    this.defaultTexture.dispose();
    this.defaultStandeeTexture?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  disposeObject(root) {
    root.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
  }
}
