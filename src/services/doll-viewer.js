import * as THREE from "three";

export function drawDollFace(context, mode = "open", lookYaw = 0, lookPitch = 0) {
  const isClosed = mode === true || mode === "closed";
  const isJoy = mode === "joy" || mode === "petting";
  const isSleep = mode === "sleep";
  const isHalf = mode === "half";

  context.clearRect(0, 0, 512, 512);
  context.fillStyle = "#f2d7b6";
  context.fillRect(0, 0, 512, 512);

  context.fillStyle = "#30261f";
  context.strokeStyle = "#30261f";

  if (isJoy) {
    // Joyful squinting curved eyes (^ ^)
    context.lineWidth = 16;
    context.lineCap = "round";
    context.beginPath();
    context.arc(166, 252, 28, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();
    context.beginPath();
    context.arc(346, 252, 28, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();

    // Rosy blushing cheeks
    context.fillStyle = "rgba(240, 115, 130, 0.45)";
    context.beginPath();
    context.arc(130, 285, 24, 0, Math.PI * 2);
    context.arc(382, 285, 24, 0, Math.PI * 2);
    context.fill();

    // Big happy smile
    context.strokeStyle = "#30261f";
    context.lineWidth = 18;
    context.beginPath();
    context.arc(256, 285, 90, 0.2, Math.PI - 0.2);
    context.stroke();
    return;
  }

  if (isSleep) {
    // Peaceful sleepy closed curves
    context.lineWidth = 13;
    context.lineCap = "round";
    context.beginPath();
    context.arc(166, 256, 24, Math.PI * 1.1, Math.PI * 1.9);
    context.stroke();
    context.beginPath();
    context.arc(346, 256, 24, Math.PI * 1.1, Math.PI * 1.9);
    context.stroke();

    // Small gentle peaceful smile
    context.lineWidth = 12;
    context.beginPath();
    context.arc(256, 305, 50, 0.25, Math.PI - 0.25);
    context.stroke();
    return;
  }

  if (isClosed) {
    context.lineWidth = 14;
    context.lineCap = "round";
    context.beginPath();
    context.arc(166, 246, 26, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();

    context.beginPath();
    context.arc(346, 246, 26, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();
  } else if (isHalf) {
    // Half-blink / dreamy sleepy gaze (squash eye oval)
    context.beginPath();
    context.ellipse(166, 240, 22, 10, 0, 0, Math.PI * 2);
    context.ellipse(346, 240, 22, 10, 0, 0, Math.PI * 2);
    context.fill();
  } else {
    // Open expressive eyes with gaze parallax and dual catchlights
    const gazeDx = Math.max(-7, Math.min(7, lookYaw * 22));
    const gazeDy = Math.max(-5, Math.min(5, -lookPitch * 20));

    // Outer pupil
    context.beginPath();
    context.arc(166 + gazeDx * 0.45, 235 + gazeDy * 0.45, 22, 0, Math.PI * 2);
    context.arc(346 + gazeDx * 0.45, 235 + gazeDy * 0.45, 22, 0, Math.PI * 2);
    context.fill();

    // Primary sparkling white catchlight (top-left offset by gaze)
    context.fillStyle = "rgba(255, 255, 255, 0.95)";
    context.beginPath();
    context.arc(166 + gazeDx * 0.7 - 6, 235 + gazeDy * 0.7 - 6, 6.5, 0, Math.PI * 2);
    context.arc(346 + gazeDx * 0.7 - 6, 235 + gazeDy * 0.7 - 6, 6.5, 0, Math.PI * 2);
    context.fill();

    // Secondary subtle micro-catchlight (bottom-right)
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.beginPath();
    context.arc(166 + gazeDx * 0.7 + 6, 235 + gazeDy * 0.7 + 4, 3, 0, Math.PI * 2);
    context.arc(346 + gazeDx * 0.7 + 6, 235 + gazeDy * 0.7 + 4, 3, 0, Math.PI * 2);
    context.fill();
  }

  // Smile
  context.fillStyle = "#30261f";
  context.strokeStyle = "#30261f";
  context.lineWidth = 18;
  context.lineCap = "round";
  context.beginPath();
  context.arc(256, 292, 85, 0.25, Math.PI - 0.25);
  context.stroke();
}

function createFaceBundle() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  drawDollFace(context, false);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { canvas, context, texture };
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

import { AFFINITY_AURAS, getUnlockedAura } from "../state/store.js";
export { AFFINITY_AURAS, getUnlockedAura };

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
    this.timerState = "idle";
    this.bounceStartTime = 0;
    this.celebrationStartTime = 0;
    this.onTap = null;
    this.pointerDownX = 0;
    this.pointerDownY = 0;
    this.pointerDownTime = 0;
    this.faceCanvas = null;
    this.faceContext = null;
    this.nextBlinkTime = performance.now() + 2500 + Math.random() * 2500;
    this.isBlinking = false;
    this.blinkEndTime = 0;
    this.pendingDoubleBlink = false;
    this.lastDrawnLookYaw = 0;
    this.lastDrawnLookPitch = 0;
    this.consecutiveTaps = 0;
    this.lastTapTime = 0;
    this.spinStartTime = 0;
    this.lastSpinAngle = 0;
    this.onJoySpin = null;
    this.currentEmote = null;
    this.onMicroEmote = null;
    this.isPetting = false;
    this.petEndTime = 0;
    this.petStrokeCount = 0;
    this.lastPetX = 0;
    this.isSleeping = false;
    this.lastFaceMode = "open";
    this.studyBook = null;
    this.targetLookYaw = 0;
    this.targetLookPitch = 0;
    this.currentLookYaw = 0;
    this.currentLookPitch = 0;
    this.onWindowPointerMove = null;
    this.onWindowPointerLeave = null;
    this.auraGroup = null;
    this.currentAura = "none";
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
      wizard: {
        skin: new THREE.MeshToonMaterial({ color: 0xf3d2b3 }),
        cloth: new THREE.MeshToonMaterial({ color: 0x2b2254 }),
        clothDark: new THREE.MeshToonMaterial({ color: 0x483a82 }),
        accent: new THREE.MeshToonMaterial({ color: 0xf7ca51 }),
        sole: new THREE.MeshToonMaterial({ color: 0x181432 }),
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

    const faceBundle = createFaceBundle();
    this.faceCanvas = faceBundle.canvas;
    this.faceContext = faceBundle.context;
    this.defaultTexture = faceBundle.texture;
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

    this.wizardAccessories = new THREE.Group();
    const wizard = this.materials.wizard;
    const wizardCone = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.25, 32), wizard.cloth);
    wizardCone.position.set(0.06, 2.18, -0.02);
    wizardCone.rotation.z = -0.12;

    const wizardBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.05, 32), wizard.clothDark);
    wizardBrim.position.set(0, 1.76, 0);
    wizardBrim.rotation.z = -0.05;

    const wizardBand = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.045, 8, 32), wizard.accent);
    wizardBand.rotation.x = Math.PI / 2;
    wizardBand.position.set(0.02, 1.82, 0);

    const starBrooch = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), wizard.accent);
    starBrooch.position.set(0.1, 1.95, 0.58);
    starBrooch.scale.set(1, 1, 0.4);

    const wandGroup = new THREE.Group();
    const wandHandle = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.65, 6, 10), wizard.sole);
    const wandStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), wizard.accent);
    wandStar.position.y = 0.42;
    wandGroup.add(wandHandle, wandStar);
    wandGroup.position.set(0.82, 0.22, 0.46);
    wandGroup.rotation.z = 0.42;
    wandGroup.rotation.x = -0.22;

    this.wizardAccessories.add(wizardCone, wizardBrim, wizardBand, starBrooch, wandGroup);
    [wizardCone, wizardBrim, wandHandle, wandStar].forEach((mesh) => this.addOutline(mesh, 1.055));
    this.wizardAccessories.visible = false;
    this.doll.add(this.wizardAccessories);

    // Custom Accessories (Glasses, Crown, Coffee, Cat)
    this.customAccessories = new THREE.Group();

    // 1. Glasses
    this.glassesGroup = new THREE.Group();
    const goldMetal = new THREE.MeshStandardMaterial({ color: 0xf1b65f, metalness: 0.85, roughness: 0.2 });
    const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 10, 24), goldMetal);
    ringL.position.set(-0.25, 1.25, 0.68);
    const ringR = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 10, 24), goldMetal);
    ringR.position.set(0.25, 1.25, 0.68);
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8), goldMetal);
    bridge.position.set(0, 1.25, 0.69);
    bridge.rotation.z = Math.PI / 2;
    this.glassesGroup.add(ringL, ringR, bridge);
    this.glassesGroup.visible = false;

    // 2. Golden Crown
    this.crownGroup = new THREE.Group();
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xf7ca51, metalness: 0.8, roughness: 0.25 });
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.14, 24, 1, true), crownMat);
    crownBase.position.set(0, 1.96, 0);
    this.crownGroup.add(crownBase);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const peak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), crownMat);
      peak.position.set(Math.cos(angle) * 0.46, 2.08, Math.sin(angle) * 0.46);
      this.crownGroup.add(peak);
    }
    const jewel = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08, 0),
      new THREE.MeshStandardMaterial({ color: 0xdc5858, roughness: 0.3 }),
    );
    jewel.position.set(0, 2.02, 0.5);
    this.crownGroup.add(jewel);
    this.crownGroup.visible = false;

    // 3. Coffee Mug
    this.coffeeGroup = new THREE.Group();
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: 0.4 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.26, 20), mugMat);
    mug.position.set(0.72, -0.92, 0.38);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 16, Math.PI), mugMat);
    handle.position.set(0.86, -0.92, 0.38);
    handle.rotation.z = Math.PI / 2;
    const coffeeLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: 0x3d2616, roughness: 0.8 }),
    );
    coffeeLiquid.position.set(0.72, -0.8, 0.38);
    this.coffeeGroup.add(mug, handle, coffeeLiquid);
    this.coffeeGroup.visible = false;

    // 4. Sleeping Kitten
    this.catGroup = new THREE.Group();
    const catMat = new THREE.MeshStandardMaterial({ color: 0xe89758, roughness: 0.7 });
    const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 14), catMat);
    catBody.scale.set(1.25, 0.8, 1.0);
    catBody.position.set(-0.68, -1.05, 0.35);
    const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), catMat);
    catHead.position.set(-0.52, -0.96, 0.42);
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), catMat);
    earL.position.set(-0.58, -0.84, 0.44);
    earL.rotation.z = -0.2;
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), catMat);
    earR.position.set(-0.46, -0.84, 0.44);
    earR.rotation.z = 0.2;
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 8, 20, Math.PI * 0.9), catMat);
    tail.position.set(-0.76, -1.06, 0.3);
    this.catGroup.add(catBody, catHead, earL, earR, tail);
    this.catGroup.visible = false;

    this.customAccessories.add(this.glassesGroup, this.crownGroup, this.coffeeGroup, this.catGroup);
    this.doll.add(this.customAccessories);

    // Procedural Study Book in doll's hands (visible during focus)
    this.studyBook = new THREE.Group();
    const bookCoverMat = new THREE.MeshStandardMaterial({ color: 0x2e4a6d, roughness: 0.6 });
    const bookPageMat = new THREE.MeshStandardMaterial({ color: 0xfffae6, roughness: 0.8 });
    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.035, 0.44), bookPageMat);
    leftPage.position.set(-0.16, 0, 0);
    leftPage.rotation.z = 0.18;
    const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.035, 0.44), bookPageMat);
    rightPage.position.set(0.16, 0, 0);
    rightPage.rotation.z = -0.18;
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.02, 0.46), bookCoverMat);
    spine.position.set(0, -0.02, 0);
    this.studyBook.add(leftPage, rightPage, spine);
    this.studyBook.position.set(0, 0.12, 0.58);
    this.studyBook.rotation.x = 0.62;
    this.studyBook.visible = false;
    this.doll.add(this.studyBook);

    this.scanMaterial = new THREE.MeshBasicMaterial({ color: 0xffe0a3, transparent: true, opacity: 0.75 });
    this.scanRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.025, 8, 64), this.scanMaterial);
    this.scanRing.rotation.x = Math.PI / 2;
    this.scanRing.visible = false;
    this.doll.add(this.scanRing);

    this.auraGroup = new THREE.Group();
    this.auraGroup.visible = false;
    this.doll.add(this.auraGroup);

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
      this.pointerDownX = event.clientX;
      this.pointerDownY = event.clientY;
      this.pointerDownTime = performance.now();
      this.petStrokeCount = 0;
      this.lastPetX = event.clientX;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.dragging) return;
      this.userRotation += (event.clientX - this.pointerX) * 0.018;
      this.targetRotation = this.userRotation;
      this.pointerX = event.clientX;
      this.lastInteraction = performance.now();

      // Petting detection: horizontal strokes on upper head area
      const rect = this.canvas.getBoundingClientRect();
      const relY = (event.clientY - rect.top) / rect.height;
      if (relY < 0.52) {
        const strokeDx = Math.abs(event.clientX - this.lastPetX);
        if (strokeDx > 12) {
          this.petStrokeCount = (this.petStrokeCount || 0) + 1;
          this.lastPetX = event.clientX;
          if (this.petStrokeCount >= 3) {
            this.petStrokeCount = 0;
            this.pet();
          }
        }
      }
    });
    const stop = (event) => {
      if (this.dragging) {
        this.dragging = false;
        const dx = event.clientX - this.pointerDownX;
        const dy = event.clientY - this.pointerDownY;
        const dt = performance.now() - this.pointerDownTime;
        if (Math.hypot(dx, dy) < 8 && dt < 450) {
          const now = performance.now();
          if (now - this.lastTapTime < 700) {
            this.consecutiveTaps += 1;
          } else {
            this.consecutiveTaps = 1;
          }
          this.lastTapTime = now;

          if (this.consecutiveTaps >= 3) {
            this.consecutiveTaps = 0;
            this.triggerJoySpin();
            this.onJoySpin?.();
          } else if (this.consecutiveTaps === 2) {
            const emoteType = Math.random() < 0.6 ? "wave" : "nod";
            if (emoteType === "wave") {
              this.triggerWave();
            } else {
              this.triggerNod();
            }
            this.onMicroEmote?.(emoteType);
          } else {
            this.triggerBounce();
            this.onTap?.();
          }
        }
      }
    };
    this.canvas.addEventListener("pointerup", stop);
    this.canvas.addEventListener("pointercancel", stop);

    const updatePointer = (clientX, clientY) => {
      if (this.reducedMotion) return;
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.4;
      const dx = (clientX - centerX) / (rect.width * 1.2);
      const dy = (clientY - centerY) / (rect.height * 1.2);
      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));
      this.targetLookYaw = clampedX * 0.32;
      this.targetLookPitch = -clampedY * 0.18;
    };

    this.onWindowPointerMove = (e) => {
      if (!this.dragging) {
        updatePointer(e.clientX, e.clientY);
      }
    };

    this.onWindowPointerLeave = () => {
      this.targetLookYaw = 0;
      this.targetLookPitch = 0;
    };

    window.addEventListener("pointermove", this.onWindowPointerMove);
    document.addEventListener("pointerleave", this.onWindowPointerLeave);
  }

  pet() {
    this.isPetting = true;
    this.petEndTime = performance.now() + 1400;
    this.triggerBounce();
    this.onPet?.();
  }

  setSleeping(isSleeping) {
    this.isSleeping = Boolean(isSleeping);
  }

  triggerBounce() {
    this.bounceStartTime = performance.now();
  }

  triggerJoySpin() {
    this.spinStartTime = performance.now();
    this.lastSpinAngle = 0;
    this.triggerBounce();
  }

  triggerWave({ side = "right", duration = 1300 } = {}) {
    this.currentEmote = {
      type: "wave",
      startTime: performance.now(),
      duration,
      side,
    };
    this.lastFaceMode = null;
  }

  triggerNod({ duration = 1100 } = {}) {
    this.currentEmote = {
      type: "nod",
      startTime: performance.now(),
      duration,
    };
    this.lastFaceMode = null;
  }

  triggerCheer({ duration = 1500 } = {}) {
    this.currentEmote = {
      type: "cheer",
      startTime: performance.now(),
      duration,
    };
    this.lastFaceMode = null;
    this.triggerBounce();
  }

  setTimerState(state) {
    this.timerState = state;
    if (this.studyBook) {
      this.studyBook.visible = state === "focusing";
    }
    if (state === "completed") {
      this.celebrationStartTime = performance.now();
      this.triggerBounce();
    } else {
      this.celebrationStartTime = 0;
      if (this.arms && this.arms.length === 2 && state !== "focusing" && state !== "resting") {
        this.arms[0].rotation.set(0, 0, -0.48);
        this.arms[1].rotation.set(0, 0, 0.48);
      }
      if (this.head && state !== "focusing" && state !== "resting") {
        this.head.rotation.x = 0;
      }
    }
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
    const nextStyle = ["detective", "wizard"].includes(style) ? style : "cozy";
    if (nextStyle === this.currentStyle) return;
    this.currentStyle = nextStyle;
    const isDetective = nextStyle === "detective";
    const isWizard = nextStyle === "wizard";
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
      ear.visible = !isDetective && !isWizard;
    });
    this.scarf.material = materials.accent;
    this.scarf.visible = !isDetective && !isWizard;

    if (isDetective || isWizard) {
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
      this.detectiveAccessories.visible = isDetective;
      if (this.wizardAccessories) this.wizardAccessories.visible = isWizard;
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
      if (this.wizardAccessories) this.wizardAccessories.visible = false;
      if (this.currentMode !== "standee") this.camera.position.set(0, 0.38, 5.9);
      this.scanRing.scale.setScalar(1);
    }
    this.outlines.forEach((outline) => {
      outline.visible = isDetective || isWizard;
    });
    this.camera.updateProjectionMatrix();
  }

  setAccessories({ glasses = false, crown = false, coffee = false, cat = false } = {}) {
    if (this.glassesGroup) this.glassesGroup.visible = Boolean(glasses);
    if (this.crownGroup) this.crownGroup.visible = Boolean(crown);
    if (this.coffeeGroup) this.coffeeGroup.visible = Boolean(coffee);
    if (this.catGroup) this.catGroup.visible = Boolean(cat);
  }

  setAffinityAura(auraType = "none") {
    this.currentAura = auraType;
    if (!this.auraGroup) return;

    while (this.auraGroup.children.length > 0) {
      const child = this.auraGroup.children[0];
      this.auraGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (!auraType || auraType === "none" || !AFFINITY_AURAS[auraType]) {
      this.auraGroup.visible = false;
      return;
    }

    this.auraGroup.visible = true;
    const config = AFFINITY_AURAS[auraType];

    if (auraType === "warm_glow") {
      const geo = new THREE.TorusGeometry(0.72, 0.032, 12, 48);
      const mat = new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.75 });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2.2;
      ring.position.set(0, 0.85, 0);
      this.auraGroup.add(ring);
    } else if (auraType === "starlight") {
      const geo = new THREE.TorusGeometry(0.55, 0.024, 12, 48);
      const mat = new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.85 });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2.3;
      ring.rotation.z = 0.2;
      ring.position.set(0, 2.15, 0);
      this.auraGroup.add(ring);

      const starGeo = new THREE.OctahedronGeometry(0.06, 0);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      for (let i = 0; i < 4; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        const angle = (i * Math.PI) / 2;
        star.position.set(Math.cos(angle) * 0.55, 2.15, Math.sin(angle) * 0.55);
        this.auraGroup.add(star);
      }
    } else if (auraType === "aurora") {
      const geo1 = new THREE.TorusGeometry(0.6, 0.026, 12, 48);
      const mat1 = new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.8 });
      const ring1 = new THREE.Mesh(geo1, mat1);
      ring1.rotation.x = Math.PI / 2.4;
      ring1.rotation.y = 0.3;
      ring1.position.set(0, 2.1, 0);

      const geo2 = new THREE.TorusGeometry(0.52, 0.022, 12, 48);
      const mat2 = new THREE.MeshBasicMaterial({
        color: config.secondaryColor,
        transparent: true,
        opacity: 0.75,
      });
      const ring2 = new THREE.Mesh(geo2, mat2);
      ring2.rotation.x = Math.PI / 1.9;
      ring2.rotation.z = -0.35;
      ring2.position.set(0, 2.18, 0);

      this.auraGroup.add(ring1, ring2);
    } else if (auraType === "crown") {
      const ringGeo = new THREE.TorusGeometry(0.58, 0.038, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.9 });
      const mainRing = new THREE.Mesh(ringGeo, ringMat);
      mainRing.rotation.x = Math.PI / 2;
      mainRing.position.set(0, 2.2, 0);
      this.auraGroup.add(mainRing);

      const rayGeo = new THREE.ConeGeometry(0.045, 0.16, 8);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      for (let i = 0; i < 6; i++) {
        const ray = new THREE.Mesh(rayGeo, rayMat);
        const angle = (i * Math.PI) / 3;
        ray.position.set(Math.cos(angle) * 0.58, 2.28, Math.sin(angle) * 0.58);
        this.auraGroup.add(ray);
      }
    } else if (auraType === "co_focus") {
      const geo1 = new THREE.TorusGeometry(0.58, 0.028, 12, 48);
      const mat1 = new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.9 });
      const ring1 = new THREE.Mesh(geo1, mat1);
      ring1.rotation.x = Math.PI / 2.2;
      ring1.rotation.z = 0.3;
      ring1.position.set(0, 2.18, 0);

      const geo2 = new THREE.TorusGeometry(0.52, 0.024, 12, 48);
      const mat2 = new THREE.MeshBasicMaterial({
        color: config.secondaryColor || 0xec4899,
        transparent: true,
        opacity: 0.85,
      });
      const ring2 = new THREE.Mesh(geo2, mat2);
      ring2.rotation.x = Math.PI / 1.8;
      ring2.rotation.z = -0.3;
      ring2.position.set(0, 2.22, 0);

      this.auraGroup.add(ring1, ring2);

      const starGeo = new THREE.OctahedronGeometry(0.065, 0);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      for (let i = 0; i < 6; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        const angle = (i * Math.PI) / 3;
        star.position.set(Math.cos(angle) * 0.58, 2.2, Math.sin(angle) * 0.58);
        this.auraGroup.add(star);
      }
    }
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
    const now = performance.now();

    // Head Tracking & Eye Contact
    const lerpFactor = 0.06;
    const lookTargetYaw = this.dragging ? 0 : this.targetLookYaw;
    const lookTargetPitch = this.dragging ? 0 : this.targetLookPitch;
    this.currentLookYaw += (lookTargetYaw - this.currentLookYaw) * lerpFactor;
    this.currentLookPitch += (lookTargetPitch - this.currentLookPitch) * lerpFactor;

    // Procedural facial expressions: micro-emote / petting / joy, sleeping, blinking, or open with gaze tracking
    if (!this.currentPhoto && this.faceContext && !this.reducedMotion) {
      if (this.currentEmote && now < this.currentEmote.startTime + this.currentEmote.duration) {
        if (this.lastFaceMode !== "joy") {
          drawDollFace(this.faceContext, "joy");
          this.defaultTexture.needsUpdate = true;
          this.lastFaceMode = "joy";
        }
      } else if (this.isPetting && now < this.petEndTime) {
        if (this.lastFaceMode !== "joy") {
          drawDollFace(this.faceContext, "joy");
          this.defaultTexture.needsUpdate = true;
          this.lastFaceMode = "joy";
        }
      } else if (this.isSleeping) {
        if (this.lastFaceMode !== "sleep") {
          drawDollFace(this.faceContext, "sleep");
          this.defaultTexture.needsUpdate = true;
          this.lastFaceMode = "sleep";
        }
      } else if (!this.isBlinking && now > this.nextBlinkTime) {
        this.isBlinking = true;
        this.blinkEndTime = now + 130;
        drawDollFace(this.faceContext, "closed");
        this.defaultTexture.needsUpdate = true;
        this.lastFaceMode = "closed";
      } else if (this.isBlinking && now > this.blinkEndTime) {
        this.isBlinking = false;
        if (!this.pendingDoubleBlink && Math.random() < 0.28) {
          this.pendingDoubleBlink = true;
          this.nextBlinkTime = now + 90;
        } else {
          this.pendingDoubleBlink = false;
          this.nextBlinkTime = now + 2800 + Math.random() * 3200;
        }
        drawDollFace(this.faceContext, "open", this.currentLookYaw, this.currentLookPitch);
        this.defaultTexture.needsUpdate = true;
        this.lastFaceMode = "open";
        this.lastDrawnLookYaw = this.currentLookYaw;
        this.lastDrawnLookPitch = this.currentLookPitch;
      } else if (this.lastFaceMode === "open") {
        const gazeDelta = Math.hypot(
          this.currentLookYaw - this.lastDrawnLookYaw,
          this.currentLookPitch - this.lastDrawnLookPitch,
        );
        if (gazeDelta > 0.035) {
          drawDollFace(this.faceContext, "open", this.currentLookYaw, this.currentLookPitch);
          this.defaultTexture.needsUpdate = true;
          this.lastDrawnLookYaw = this.currentLookYaw;
          this.lastDrawnLookPitch = this.currentLookPitch;
        }
      } else if (
        this.lastFaceMode !== "open" &&
        (!this.currentEmote || now >= this.currentEmote.startTime + this.currentEmote.duration) &&
        (!this.isPetting || now >= this.petEndTime) &&
        !this.isSleeping &&
        !this.isBlinking
      ) {
        this.isPetting = false;
        if (this.currentEmote && now >= this.currentEmote.startTime + this.currentEmote.duration) {
          this.currentEmote = null;
        }
        drawDollFace(this.faceContext, "open", this.currentLookYaw, this.currentLookPitch);
        this.defaultTexture.needsUpdate = true;
        this.lastFaceMode = "open";
        this.lastDrawnLookYaw = this.currentLookYaw;
        this.lastDrawnLookPitch = this.currentLookPitch;
      }
    }

    // Petting gentle body wiggle
    if (this.isPetting && now < this.petEndTime && !this.reducedMotion) {
      this.doll.rotation.z = Math.sin(now * 0.015) * 0.06;
    } else if (this.doll.rotation.z !== 0 && !this.spinStartTime) {
      this.doll.rotation.z = 0;
    }

    if (!this.dragging && now - this.lastInteraction > 5000) {
      this.targetRotation = this.reducedMotion ? 0 : Math.sin(elapsed * 0.45) * 0.16;
      this.userRotation = this.targetRotation;
    }

    this.doll.rotation.y += (this.targetRotation + this.currentLookYaw - this.doll.rotation.y) * 0.08;

    // Joy spin 360-degree acrobatic animation
    if (this.spinStartTime) {
      const dt = (now - this.spinStartTime) / 1000;
      if (dt < 0.72) {
        const p = dt / 0.72;
        const spinAngle = p * Math.PI * 2;
        this.doll.rotation.y += spinAngle - this.lastSpinAngle;
        this.lastSpinAngle = spinAngle;
      } else {
        this.spinStartTime = 0;
        this.lastSpinAngle = 0;
      }
    }

    const targetTilt = this.timerState === "focusing" ? -0.12 : -0.04;
    this.doll.rotation.x += (targetTilt + this.currentLookPitch - this.doll.rotation.x) * 0.06;

    const breatheSpeed = this.timerState === "focusing" ? 1.0 : 1.8;
    const breatheAmp = this.timerState === "focusing" ? 0.022 : 0.035;
    let basePosY = this.reducedMotion ? 0 : Math.sin(elapsed * breatheSpeed) * breatheAmp;

    if (this.spinStartTime) {
      const dt = (now - this.spinStartTime) / 1000;
      const p = Math.min(1, dt / 0.72);
      basePosY += Math.sin(p * Math.PI) * 0.24;
    }

    if (this.bounceStartTime) {
      const dt = (now - this.bounceStartTime) / 1000;
      if (dt < 0.5) {
        const progress = dt / 0.5;
        const jump = Math.sin(progress * Math.PI) * 0.16;
        const squash = 1 + Math.sin(progress * Math.PI * 2) * 0.08;
        basePosY += jump;
        this.doll.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
      } else {
        this.bounceStartTime = 0;
        this.doll.scale.set(1, 1, 1);
      }
    }
    this.doll.position.y = basePosY;

    if (this.currentEmote && now < this.currentEmote.startTime + this.currentEmote.duration && !this.reducedMotion) {
      const emote = this.currentEmote;
      const elapsedEmote = (now - emote.startTime) / 1000;
      if (emote.type === "wave") {
        const waveSwing = Math.sin(elapsedEmote * 16) * 0.42;
        const isRight = emote.side !== "left";
        const wavingArm = isRight ? this.arms?.[1] : this.arms?.[0];
        const idleArm = isRight ? this.arms?.[0] : this.arms?.[1];

        if (wavingArm) {
          wavingArm.rotation.z = (isRight ? 1.35 : -1.35) + waveSwing;
          wavingArm.rotation.x = 0.25;
        }
        if (idleArm) {
          idleArm.rotation.z = isRight ? -0.48 : 0.48;
          idleArm.rotation.x = 0;
        }
        if (this.head) {
          this.head.rotation.z = Math.sin(elapsedEmote * 8) * 0.08;
          this.head.rotation.x = -0.05;
        }
      } else if (emote.type === "nod") {
        const nodSwing = Math.sin(elapsedEmote * 12) * 0.22;
        if (this.head) {
          this.head.rotation.x = 0.14 + nodSwing;
          this.head.rotation.z = 0;
        }
        if (this.arms && this.arms.length === 2) {
          this.arms[0].rotation.set(0, 0, -0.48);
          this.arms[1].rotation.set(0, 0, 0.48);
        }
      } else if (emote.type === "cheer") {
        const cheerSwing = Math.sin(elapsedEmote * 14) * 0.25;
        if (this.arms && this.arms.length === 2) {
          this.arms[0].rotation.z = -1.25 + cheerSwing;
          this.arms[0].rotation.x = 0.3;
          this.arms[1].rotation.z = 1.25 - cheerSwing;
          this.arms[1].rotation.x = 0.3;
        }
        if (this.head) {
          this.head.rotation.x = -0.15;
          this.head.rotation.z = 0;
        }
      }
    } else if (this.celebrationStartTime && performance.now() - this.celebrationStartTime < 6000) {
      const wave = Math.sin(elapsed * 9) * 0.38;
      if (this.arms && this.arms.length === 2) {
        this.arms[0].rotation.z = -0.85 + wave;
        this.arms[1].rotation.z = 0.85 - wave;
      }
    } else if (this.timerState === "focusing" && !this.reducedMotion) {
      const writeJiggle = Math.sin(elapsed * 4.2) * 0.04;
      const breathe = Math.sin(elapsed * 1.8) * 0.02;
      if (this.arms && this.arms.length === 2) {
        this.arms[0].rotation.z = -0.22 + writeJiggle * 0.5;
        this.arms[0].rotation.x = 0.42 + breathe;
        this.arms[1].rotation.z = 0.22 - writeJiggle;
        this.arms[1].rotation.x = 0.46 + breathe;
      }
      if (this.head) {
        this.head.rotation.x = 0.14 + breathe * 0.5;
      }
    } else if (this.timerState === "resting" && !this.reducedMotion) {
      const stretch = Math.sin(elapsed * 1.2) * 0.06;
      if (this.arms && this.arms.length === 2) {
        this.arms[0].rotation.z = -0.72 - stretch;
        this.arms[0].rotation.x = -0.15;
        this.arms[1].rotation.z = 0.72 + stretch;
        this.arms[1].rotation.x = -0.15;
      }
      if (this.head) {
        this.head.rotation.x = -0.08 + stretch * 0.3;
      }
    } else {
      if (this.currentEmote && now >= this.currentEmote.startTime + this.currentEmote.duration) {
        this.currentEmote = null;
      }
      if (this.arms && this.arms.length === 2) {
        this.arms[0].rotation.z = -0.48;
        this.arms[0].rotation.x = 0;
        this.arms[1].rotation.z = 0.48;
        this.arms[1].rotation.x = 0;
      }
      if (this.head) {
        this.head.rotation.x = 0;
        this.head.rotation.z = 0;
      }
    }

    if (this.standee) {
      this.standee.rotation.y += (this.targetRotation + this.currentLookYaw * 0.6 - this.standee.rotation.y) * 0.08;
      this.standee.rotation.x = this.currentLookPitch * 0.4;
      this.standee.position.y = this.reducedMotion ? 0 : Math.sin(elapsed * 1.45) * 0.018;
    }
    if (this.generatedModel && !this.reducedMotion) {
      this.generatedModel.rotation.y = Math.sin(elapsed * 0.4) * 0.12 + this.currentLookYaw;
      this.generatedModel.rotation.x = this.currentLookPitch * 0.6;
    }
    if (this.scanRing.visible) {
      this.scanRing.position.y = Math.sin(elapsed * 2.7) * 1.15 + 0.18;
      this.scanMaterial.opacity = 0.45 + Math.sin(elapsed * 5) * 0.2;
    }
    if (this.auraGroup && this.auraGroup.visible && !this.reducedMotion) {
      this.auraGroup.rotation.y += 0.012;
      const breathe = Math.sin(elapsed * 2.4) * 0.035;
      this.auraGroup.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibility);
    if (this.onWindowPointerMove) {
      window.removeEventListener("pointermove", this.onWindowPointerMove);
    }
    if (this.onWindowPointerLeave) {
      document.removeEventListener("pointerleave", this.onWindowPointerLeave);
    }
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
