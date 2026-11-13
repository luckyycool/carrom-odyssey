export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'star' | 'spark';
  rotation: number;
  rotSpeed: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  stroke: string;
  alpha: number;
  scale: number;
  maxScale: number;
  age: number;
  duration: number;
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export class CandyEffectsManager {
  public particles: Particle[] = [];
  public texts: FloatingText[] = [];
  public ripples: Ripple[] = [];
  private textIdCounter = 0;

  // Palette of candy colors
  private candyColors = ['#FF4081', '#FFD700', '#00E5FF', '#00E676', '#AA00FF', '#FF9100', '#FFFFFF'];

  public addPuckSinkExplosion(x: number, y: number, combo: number) {
    // 1. Ripple wave
    this.ripples.push({
      x,
      y,
      radius: 10,
      maxRadius: 65,
      color: combo >= 3 ? '#FFD700' : '#FF4081',
      alpha: 0.9,
    });

    // 2. Star & Sparkle burst
    const count = 25 + combo * 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: this.candyColors[Math.floor(Math.random() * this.candyColors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        shape: Math.random() > 0.4 ? 'star' : 'circle',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    // 3. Candy Crush Voice / Word Popup
    let phrase = 'NICE!';
    let textColor = '#00E676';
    let strokeColor = '#004D20';

    if (combo === 2) {
      phrase = 'SWEET!';
      textColor = '#FF4081';
      strokeColor = '#4A0020';
    } else if (combo === 3) {
      phrase = 'TASTY!';
      textColor = '#FFA000';
      strokeColor = '#4A2A00';
    } else if (combo === 4) {
      phrase = 'DELICIOUS!';
      textColor = '#AA00FF';
      strokeColor = '#30004A';
    } else if (combo >= 5) {
      phrase = 'DIVINE!';
      textColor = '#FFD700';
      strokeColor = '#543800';
    }

    this.texts.push({
      id: ++this.textIdCounter,
      text: phrase,
      x,
      y: y - 25,
      color: textColor,
      stroke: strokeColor,
      alpha: 1,
      scale: 0.3,
      maxScale: 1.4,
      age: 0,
      duration: 65, // frames
    });
  }

  // Motion sparkles behind striker
  public addStrikerTrail(x: number, y: number, speed: number) {
    if (speed < 4) return;
    const count = Math.min(3, Math.floor(speed / 4));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#00E5FF' : '#FFD700',
        alpha: 0.8,
        decay: 0.06 + Math.random() * 0.05,
        shape: 'spark',
        rotation: 0,
        rotSpeed: 0,
      });
    }
  }

  public update() {
    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94; // friction
      p.vy *= 0.94;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 2.2;
      r.alpha -= 0.035;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.age++;
      t.y -= 1.2; // float upwards

      // Scale punch
      if (t.age < 10) {
        t.scale += (t.maxScale - t.scale) * 0.35;
      } else if (t.age < 18) {
        t.scale -= (t.scale - 1.0) * 0.25;
      }

      if (t.age > t.duration - 20) {
        t.alpha = (t.duration - t.age) / 20;
      }

      if (t.age >= t.duration) {
        this.texts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // 1. Render Ripples
    for (const r of this.ripples) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'star') {
        // Draw 4-point star
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s * 1.5);
        ctx.lineTo(s * 0.4, -s * 0.4);
        ctx.lineTo(s * 1.5, 0);
        ctx.lineTo(s * 0.4, s * 0.4);
        ctx.lineTo(0, s * 1.5);
        ctx.lineTo(-s * 0.4, s * 0.4);
        ctx.lineTo(-s * 1.5, 0);
        ctx.lineTo(-s * 0.4, -s * 0.4);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Render Floating Candy Text
    for (const t of this.texts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      ctx.font = '900 24px "Fredoka", "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 3D Shadow
      ctx.fillStyle = t.stroke;
      ctx.fillText(t.text, 0, 4);

      // Text stroke
      ctx.lineWidth = 4;
      ctx.strokeStyle = t.stroke;
      ctx.strokeText(t.text, 0, 0);

      // Foreground fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    }
  }
}
