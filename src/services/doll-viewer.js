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
  context.arc(256, 292, 85, .25, Math.PI - .25);
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class DollViewer {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.currentPhoto = null;
    this.photoTexture = null;
    this.dragging = false;
    this.pointerX = 0;
    this.targetRotation = 0;
    this.userRotation = 0;
    this.lastInteraction = 0;
    this.currentStyle = null;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, .1, 20);
    this.camera.position.set(0, .38, 5.9);
    this.doll = new THREE.Group();
    this.doll.rotation.x = -.04;
    this.scene.add(this.doll);
    this.buildDoll();
    this.buildLighting();
    this.bindControls();

    this.clock = new THREE.Clock();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
    this.container.classList.add("viewer-ready");
    this.renderer.setAnimationLoop(() => this.render());
  }

  buildDoll() {
    this.materials = {
      cozy: {
        skin: new THREE.MeshStandardMaterial({ color: 0xe6c9a2, roughness: .72 }),
        cloth: new THREE.MeshStandardMaterial({ color: 0x69c8bd, roughness: .62, metalness: .04 }),
        clothDark: new THREE.MeshStandardMaterial({ color: 0x4e8298, roughness: .68 }),
        accent: new THREE.MeshStandardMaterial({ color: 0xf1b65f, roughness: .55 }),
        sole: new THREE.MeshStandardMaterial({ color: 0x24384a, roughness: .8 }),
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

    this.body = new THREE.Mesh(new THREE.SphereGeometry(.76, 40, 28), cozy.cloth);
    this.doll.add(this.body);

    this.belly = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 22), cozy.clothDark);
    this.doll.add(this.belly);

    this.head = new THREE.Mesh(new THREE.SphereGeometry(.73, 48, 34), cozy.skin);
    this.doll.add(this.head);

    const makeLimb = (x, y, rotation, material = cozy.cloth) => {
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(.18, .46, 8, 18), material);
      limb.position.set(x, y, 0);
      limb.rotation.z = rotation;
      this.doll.add(limb);
      return limb;
    };
    this.arms = [makeLimb(-.73, .15, -.48), makeLimb(.73, .15, .48)];
    this.legs = [makeLimb(-.35, -.82, .04, cozy.sole), makeLimb(.35, -.82, -.04, cozy.sole)];

    const earGeometry = new THREE.SphereGeometry(.2, 24, 18);
    this.ears = [-1, 1].map((side) => {
      const ear = new THREE.Mesh(earGeometry, cozy.accent);
      ear.position.set(side * .58, 1.63, -.05);
      ear.scale.set(1, 1.14, .65);
      this.doll.add(ear);
      return ear;
    });

    this.scarf = new THREE.Mesh(new THREE.TorusGeometry(.47, .09, 12, 40), cozy.accent);
    this.scarf.rotation.x = Math.PI / 2;
    this.scarf.position.set(0, .57, .06);
    this.doll.add(this.scarf);

    this.defaultTexture = defaultFaceTexture();
    this.faceMaterial = new THREE.MeshBasicMaterial({ map: this.defaultTexture, transparent: true });
    this.face = new THREE.Mesh(new THREE.CircleGeometry(.575, 64), this.faceMaterial);
    this.doll.add(this.face);

    this.outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x111923, side: THREE.BackSide });
    this.outlines = [];
    [this.body, this.belly, this.head, ...this.arms, ...this.legs].forEach((mesh) => this.addOutline(mesh));

    this.detectiveAccessories = new THREE.Group();
    const detective = this.materials.detective;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.82, 36, 18), detective.cloth);
    cap.scale.set(1, .42, .9);
    cap.position.set(0, 1.84, -.01);
    this.detectiveAccessories.add(cap);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(.92, .07, .32), detective.clothDark);
    brim.position.set(.16, 1.76, .56);
    brim.rotation.z = -.04;
    this.detectiveAccessories.add(brim);
    const tie = new THREE.Mesh(new THREE.OctahedronGeometry(.13, 0), detective.accent);
    tie.scale.set(.7, 1.35, .4);
    tie.position.set(0, .28, .65);
    this.detectiveAccessories.add(tie);
    const magnifierRing = new THREE.Mesh(new THREE.TorusGeometry(.15, .035, 10, 32), detective.accent);
    magnifierRing.position.set(.78, .15, .5);
    const magnifierHandle = new THREE.Mesh(new THREE.CapsuleGeometry(.035, .25, 6, 10), detective.sole);
    magnifierHandle.position.set(.88, -.02, .5);
    magnifierHandle.rotation.z = -.58;
    this.detectiveAccessories.add(magnifierRing, magnifierHandle);
    [cap, brim, tie, magnifierRing, magnifierHandle].forEach((mesh) => this.addOutline(mesh, 1.055));
    this.detectiveAccessories.visible = false;
    this.doll.add(this.detectiveAccessories);

    this.scanMaterial = new THREE.MeshBasicMaterial({ color: 0xffe0a3, transparent: true, opacity: .75 });
    this.scanRing = new THREE.Mesh(new THREE.TorusGeometry(.92, .025, 8, 64), this.scanMaterial);
    this.scanRing.rotation.x = Math.PI / 2;
    this.scanRing.visible = false;
    this.doll.add(this.scanRing);

    this.pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(.82, .94, .16, 48),
      new THREE.MeshStandardMaterial({ color: 0x5a3828, roughness: .76 }),
    );
    this.pedestal.position.y = -1.22;
    this.scene.add(this.pedestal);
    this.setStyle("cozy");
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
      this.userRotation += (event.clientX - this.pointerX) * .018;
      this.targetRotation = this.userRotation;
      this.pointerX = event.clientX;
      this.lastInteraction = performance.now();
    });
    const stop = () => { this.dragging = false; };
    this.canvas.addEventListener("pointerup", stop);
    this.canvas.addEventListener("pointercancel", stop);
  }

  setPhoto(dataUrl) {
    if (dataUrl === this.currentPhoto) return;
    this.currentPhoto = dataUrl;
    if (!dataUrl) {
      this.photoTexture?.dispose();
      this.photoTexture = null;
      this.faceMaterial.map = this.defaultTexture;
      this.faceMaterial.needsUpdate = true;
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
    };
    image.src = dataUrl;
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
    this.arms.forEach((arm) => { arm.material = materials.cloth; });
    this.legs.forEach((leg) => { leg.material = materials.sole; });
    this.ears.forEach((ear) => {
      ear.material = materials.accent;
      ear.visible = !detective;
    });
    this.scarf.material = materials.accent;
    this.scarf.visible = !detective;

    if (detective) {
      this.body.scale.set(.78, .9, .64);
      this.body.position.set(0, -.08, 0);
      this.belly.scale.set(.86, .95, .38);
      this.belly.position.set(0, -.1, .48);
      this.head.scale.set(1.18, 1.16, 1.04);
      this.head.position.set(0, 1.14, 0);
      this.face.scale.setScalar(1.18);
      this.face.position.set(0, 1.14, .78);
      this.arms[0].position.set(-.63, .04, 0);
      this.arms[1].position.set(.63, .04, 0);
      this.legs[0].position.set(-.28, -.8, 0);
      this.legs[1].position.set(.28, -.8, 0);
      this.detectiveAccessories.visible = true;
      this.camera.position.set(0, .45, 6.2);
      this.scanRing.scale.setScalar(1.12);
    } else {
      this.body.scale.set(.9, 1.05, .7);
      this.body.position.set(0, .02, 0);
      this.belly.scale.set(1, 1.08, .36);
      this.belly.position.set(0, -.04, .54);
      this.head.scale.set(1, 1.03, .92);
      this.head.position.set(0, 1.12, 0);
      this.face.scale.setScalar(1);
      this.face.position.set(0, 1.12, .69);
      this.arms[0].position.set(-.73, .15, 0);
      this.arms[1].position.set(.73, .15, 0);
      this.legs[0].position.set(-.35, -.82, 0);
      this.legs[1].position.set(.35, -.82, 0);
      this.detectiveAccessories.visible = false;
      this.camera.position.set(0, .38, 5.9);
      this.scanRing.scale.setScalar(1);
    }
    this.outlines.forEach((outline) => { outline.visible = detective; });
    this.camera.updateProjectionMatrix();
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    const elapsed = this.clock.getElapsedTime();
    if (!this.dragging && performance.now() - this.lastInteraction > 5000) {
      this.targetRotation = this.reducedMotion ? 0 : Math.sin(elapsed * .45) * .16;
      this.userRotation = this.targetRotation;
    }
    this.doll.rotation.y += (this.targetRotation - this.doll.rotation.y) * .08;
    this.doll.position.y = this.reducedMotion ? 0 : Math.sin(elapsed * 1.8) * .035;
    if (this.scanRing.visible) {
      this.scanRing.position.y = Math.sin(elapsed * 2.7) * 1.15 + .18;
      this.scanMaterial.opacity = .45 + Math.sin(elapsed * 5) * .2;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.photoTexture?.dispose();
    this.defaultTexture.dispose();
    this.renderer.dispose();
  }
}
