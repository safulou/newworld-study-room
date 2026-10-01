/**
 * Window Weather Particle Engine
 * Procedurally simulates Rain, Snow, Falling Leaves/Petals, and Celestial Dust Particles on the cabin window.
 */

export class WeatherEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext?.("2d") || null;
    this.mode = "none"; // "none" | "rain" | "snow" | "leaves" | "clear"
    this.animationFrame = null;
    this.width = canvas?.width || 88;
    this.height = canvas?.height || 96;
    this.particles = [];
    this.initParticles();
  }

  initParticles() {
    const w = this.width;
    const h = this.height;

    if (this.mode === "rain") {
      this.particles = Array.from({ length: 28 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        length: 6 + Math.random() * 8,
        speed: 1.5 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.5,
      }));
    } else if (this.mode === "snow") {
      this.particles = Array.from({ length: 24 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 1 + Math.random() * 1.6,
        speed: 0.4 + Math.random() * 0.8,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.4 + Math.random() * 0.5,
      }));
    } else if (this.mode === "leaves") {
      const colors = ["rgba(246, 200, 81, 0.75)", "rgba(224, 130, 90, 0.75)", "rgba(105, 200, 189, 0.65)"];
      this.particles = Array.from({ length: 16 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 2.5 + Math.random() * 2.5,
        speedX: 0.6 + Math.random() * 1.0,
        speedY: 0.5 + Math.random() * 0.9,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: 0.03 + Math.random() * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    } else if (this.mode === "clear") {
      this.particles = Array.from({ length: 12 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 0.8 + Math.random() * 1.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.04,
      }));
    } else {
      this.particles = [];
    }
  }

  setMode(mode) {
    const validModes = ["none", "rain", "snow", "leaves", "clear"];
    const targetMode = validModes.includes(mode) ? mode : "none";
    if (this.mode === targetMode) return;

    this.mode = targetMode;
    this.initParticles();

    if (this.mode === "none") {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.canvas) return;
    this.stop();

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      this.renderFrame();
      return;
    }

    const loop = () => {
      this.renderFrame();
      this.animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.clear();
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  renderFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (this.mode === "rain") {
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (const drop of this.particles) {
        ctx.strokeStyle = `rgba(180, 220, 255, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 0.5, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.2;
        if (drop.y > h) {
          drop.y = -drop.length;
          drop.x = Math.random() * w;
        }
        if (drop.x < 0) {
          drop.x = w;
        }
      }
    } else if (this.mode === "snow") {
      for (const flake of this.particles) {
        flake.swayAngle += flake.swaySpeed;
        const swayX = Math.sin(flake.swayAngle) * 0.6;
        flake.x += swayX;
        flake.y += flake.speed;

        if (flake.y > h) {
          flake.y = -2;
          flake.x = Math.random() * w;
        }
        if (flake.x < 0) flake.x = w;
        if (flake.x > w) flake.x = 0;

        ctx.fillStyle = `rgba(240, 248, 255, ${flake.opacity})`;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.mode === "leaves") {
      for (const leaf of this.particles) {
        leaf.x += leaf.speedX;
        leaf.y += leaf.speedY;
        leaf.angle += leaf.rotSpeed;

        if (leaf.x > w || leaf.y > h) {
          leaf.x = Math.random() * (w * 0.5);
          leaf.y = -leaf.size;
        }

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (this.mode === "clear") {
      for (const dust of this.particles) {
        dust.pulse += dust.pulseSpeed;
        const alpha = 0.2 + (Math.sin(dust.pulse) + 1) * 0.25;

        dust.y -= 0.2;
        if (dust.y < 0) {
          dust.y = h;
          dust.x = Math.random() * w;
        }

        ctx.fillStyle = `rgba(255, 224, 163, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  dispose() {
    this.stop();
    this.particles = [];
  }
}
