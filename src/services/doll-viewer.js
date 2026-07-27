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
    this.camera.position.set(0, .25, 5.2);
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
    const skin = new THREE.MeshStandardMaterial({ color: 0xe6c9a2, roughness: .72 });
    const cloth = new THREE.MeshStandardMaterial({ color: 0x69c8bd, roughness: .62, metalness: .04 });
    const clothDark = new THREE.MeshStandardMaterial({ color: 0x4e8298, roughness: .68 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xf1b65f, roughness: .55 });
    const sole = new THREE.MeshStandardMaterial({ color: 0x24384a, roughness: .8 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(.76, 40, 28), cloth);
    body.scale.set(.9, 1.05, .7);
    body.position.y = .02;
    this.doll.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 22), clothDark);
    belly.scale.set(1, 1.08, .36);
    belly.position.set(0, -.04, .54);
    this.doll.add(belly);

    const head = new THREE.Mesh(new THREE.SphereGeometry(.73, 48, 34), skin);
    head.scale.set(1, 1.03, .92);
    head.position.y = 1.12;
    this.doll.add(head);

    const makeLimb = (x, y, rotation, material = cloth) => {
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(.18, .46, 8, 18), material);
      limb.position.set(x, y, 0);
      limb.rotation.z = rotation;
      this.doll.add(limb);
    };
    makeLimb(-.73, .15, -.48);
    makeLimb(.73, .15, .48);
    makeLimb(-.35, -.82, .04, sole);
    makeLimb(.35, -.82, -.04, sole);

    const earGeometry = new THREE.SphereGeometry(.2, 24, 18);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(earGeometry, accent);
      ear.position.set(side * .58, 1.63, -.05);
      ear.scale.set(1, 1.14, .65);
      this.doll.add(ear);
    });

    const scarf = new THREE.Mesh(new THREE.TorusGeometry(.47, .09, 12, 40), accent);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.set(0, .57, .06);
    this.doll.add(scarf);

    this.defaultTexture = defaultFaceTexture();
    this.faceMaterial = new THREE.MeshBasicMaterial({ map: this.defaultTexture, transparent: true });
    const face = new THREE.Mesh(new THREE.CircleGeometry(.575, 64), this.faceMaterial);
    face.position.set(0, 1.12, .69);
    this.doll.add(face);

    this.scanMaterial = new THREE.MeshBasicMaterial({ color: 0xffe0a3, transparent: true, opacity: .75 });
    this.scanRing = new THREE.Mesh(new THREE.TorusGeometry(.92, .025, 8, 64), this.scanMaterial);
    this.scanRing.rotation.x = Math.PI / 2;
    this.scanRing.visible = false;
    this.doll.add(this.scanRing);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(.82, .94, .16, 48),
      new THREE.MeshStandardMaterial({ color: 0x5a3828, roughness: .76 }),
    );
    pedestal.position.y = -1.22;
    this.scene.add(pedestal);
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
