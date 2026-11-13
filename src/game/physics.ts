import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

export interface Vector2D {
  x: number;
  y: number;
}

export type PuckType = 'striker' | 'white' | 'black' | 'queen' | 'bomb';

export interface Puck {
  id: number;
  type: PuckType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  borderColor: string;
  isPocketed: boolean;
  scale: number; // For shrinking when falling into pocket
  inPocketSuction: boolean;
}

export interface Pocket {
  id: number;
  x: number;
  y: number;
  radius: number;
  captureRadius: number;
}

export interface Magnet {
  id: number;
  x: number;
  y: number;
  strength: number; // positive = attract, negative = repel
  radius: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export class PhysicsEngine {
  public boardWidth: number = 600;
  public boardHeight: number = 600;
  public margin: number = 42; // Cushion offset from outer frame
  public pockets: Pocket[] = [];
  public pucks: Puck[] = [];
  public magnets: Magnet[] = [];
  public obstacles: Obstacle[] = [];
  public globalGravity: Vector2D = { x: 0, y: 0 };
  public friction: number = 0.976; // Authentic tournament carrom powder glide

  private idCounter: number = 0;

  constructor(boardWidth: number = 600, boardHeight: number = 600) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.setupPockets();
  }

  public setBoardDimensions(width: number, height: number) {
    this.boardWidth = width;
    this.boardHeight = height;
    this.setupPockets();
  }

  private setupPockets() {
    const r = 22; // Authentic ICF tournament pocket radius (44px diam vs 30px puck)
    const captureR = 24;
    const offset = this.margin + 8;
    this.pockets = [
      { id: 1, x: offset, y: offset, radius: r, captureRadius: captureR },
      { id: 2, x: this.boardWidth - offset, y: offset, radius: r, captureRadius: captureR },
      { id: 3, x: this.boardWidth - offset, y: this.boardHeight - offset, radius: r, captureRadius: captureR },
      { id: 4, x: offset, y: this.boardHeight - offset, radius: r, captureRadius: captureR },
    ];
  }

  public createPuck(type: PuckType, x: number, y: number): Puck {
    let radius = 15;
    let mass = 1.0;
    let color = '#FFF9E6'; // White puck
    let borderColor = '#D4AF37';

    if (type === 'black') {
      color = '#2D2833';
      borderColor = '#FF4081';
      mass = 1.0;
    } else if (type === 'queen') {
      color = '#FF1744'; // Candy Queen Ruby Red
      borderColor = '#FFD700';
      radius = 16;
      mass = 1.2;
    } else if (type === 'striker') {
      color = '#00E5FF'; // Glowing Cyan Candy Striker
      borderColor = '#FFFFFF';
      radius = 21;
      mass = 3.2; // Heavier striker
    } else if (type === 'bomb') {
      color = '#212121';
      borderColor = '#FF5252';
      radius = 16;
      mass = 1.5;
    }

    const puck: Puck = {
      id: ++this.idCounter,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      mass,
      color,
      borderColor,
      isPocketed: false,
      scale: 1.0,
      inPocketSuction: false,
    };
    this.pucks.push(puck);
    return puck;
  }

  // Check if any active pucks are still in motion
  public isBoardMoving(): boolean {
    const minSpeedSq = 0.04;
    for (const p of this.pucks) {
      if (!p.isPocketed) {
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > minSpeedSq) return true;
      }
    }
    return false;
  }

  // Stop tiny residual drift
  public stopResidualMotion() {
    for (const p of this.pucks) {
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq < 0.05) {
        p.vx = 0;
        p.vy = 0;
      }
    }
  }

  // Rotate the entire physics coordinate space 90° clockwise
  public rotateWorld90Clockwise() {
    const cx = this.boardWidth / 2;
    const cy = this.boardHeight / 2;

    for (const p of this.pucks) {
      if (p.type === 'striker') continue; // Striker is repositioned separately on bottom baseline
      const dx = p.x - cx;
      const dy = p.y - cy;
      // Clockwise 90°: (x', y') = (cx - dy, cy + dx)
      p.x = cx - dy;
      p.y = cy + dx;
      const oldVx = p.vx;
      const oldVy = p.vy;
      p.vx = -oldVy;
      p.vy = oldVx;
    }

    // Rotate magnets
    for (const m of this.magnets) {
      const dx = m.x - cx;
      const dy = m.y - cy;
      m.x = cx - dy;
      m.y = cy + dx;
    }

    // Rotate obstacles
    for (const obs of this.obstacles) {
      const dx = obs.x - cx;
      const dy = obs.y - cy;
      obs.x = cx - dy;
      obs.y = cy + dx;
    }

    // Rotate global gravity
    const gx = this.globalGravity.x;
    const gy = this.globalGravity.y;
    this.globalGravity.x = -gy;
    this.globalGravity.y = gx;
  }

  // Update physics with 8 sub-steps per frame (guarantees continuous collision detection)
  public update(onPuckPocketed: (puck: Puck, pocket: Pocket) => void) {
    const subSteps = 8;
    const dt = 1 / subSteps;

    for (let step = 0; step < subSteps; step++) {
      // 1. Apply Forces: Global gravity + Magnets
      for (const p of this.pucks) {
        if (p.isPocketed) continue;

        // Apply global gravity (e.g. downward magnetic pull downstairs)
        p.vx += this.globalGravity.x * dt;
        p.vy += this.globalGravity.y * dt;

        // Apply Point Magnets
        for (const mag of this.magnets) {
          const dx = mag.x - p.x;
          const dy = mag.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mag.radius * mag.radius && distSq > 100) {
            const dist = Math.sqrt(distSq);
            // Inverse square force
            const force = (mag.strength * 1200) / distSq;
            p.vx += (dx / dist) * force * dt;
            p.vy += (dy / dist) * force * dt;
          }
        }

        // Apply friction
        p.vx *= Math.pow(this.friction, dt);
        p.vy *= Math.pow(this.friction, dt);

        // Move puck
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      // 2. Pocket Entry & Capture (Natural Drop, No Artificial Magnet Vacuum)
      for (const p of this.pucks) {
        if (p.isPocketed) continue;

        for (const pocket of this.pockets) {
          const dx = pocket.x - p.x;
          const dy = pocket.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Only when disc center actually crosses into the pocket opening
          if (dist < pocket.captureRadius) {
            p.inPocketSuction = true;
            // Realistic downward velocity dampening and slight natural inward tumble
            p.vx *= 0.72;
            p.vy *= 0.72;
            p.vx += (dx / (dist + 0.1)) * 0.4;
            p.vy += (dy / (dist + 0.1)) * 0.4;

            // Visual scale shrink as puck falls into hole net
            p.scale = Math.max(0.1, dist / pocket.captureRadius);

            // Pocket capture threshold
            if (dist < pocket.radius * 0.8 || p.scale <= 0.4) {
              p.isPocketed = true;
              p.vx = 0;
              p.vy = 0;
              p.scale = 0;
              onPuckPocketed(p, pocket);
              break;
            }
          }
        }
      }

      // 3. Puck-to-Puck Circle Collisions
      const activePucks = this.pucks.filter(p => !p.isPocketed);
      for (let i = 0; i < activePucks.length; i++) {
        for (let j = i + 1; j < activePucks.length; j++) {
          const p1 = activePucks[i];
          const p2 = activePucks[j];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (p1.radius + p2.radius) * Math.min(p1.scale, p2.scale);

          if (dist < minDist && dist > 0) {
            // Normal vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping discs
            const overlap = (minDist - dist) * 0.5;
            p1.x -= nx * overlap;
            p1.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;

            // Relative velocity along normal
            const kx = p1.vx - p2.vx;
            const ky = p1.vy - p2.vy;
            const p = 2 * (nx * kx + ny * ky) / (p1.mass + p2.mass);

            const restitution = 0.82; // Authentic wood-on-wood carrom men bounce
            p1.vx -= p * p2.mass * nx * restitution;
            p1.vy -= p * p2.mass * ny * restitution;
            p2.vx += p * p1.mass * nx * restitution;
            p2.vy += p * p1.mass * ny * restitution;

            // Sounds & haptics for significant hits
            const hitVelocity = Math.sqrt(kx * kx + ky * ky);
            if (hitVelocity > 1.5 && step === 0) {
              sounds.playWoodClick(hitVelocity);
              if (hitVelocity > 6) triggerHaptic.light();
            }
          }
        }
      }

      // 4. Obstacle Collisions
      for (const p of activePucks) {
        for (const obs of this.obstacles) {
          const dx = p.x - obs.x;
          const dy = p.y - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p.radius + obs.radius;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            p.x = obs.x + nx * minDist;
            p.y = obs.y + ny * minDist;

            const dot = p.vx * nx + p.vy * ny;
            p.vx = (p.vx - 2 * dot * nx) * 1.1; // Bumper kickback!
            p.vy = (p.vy - 2 * dot * ny) * 1.1;

            if (step === 0) {
              sounds.playCushionBounce(18);
              triggerHaptic.medium();
            }
          }
        }
      }

      // 5. Cushion / Board Boundary Collisions
      const minX = this.margin;
      const maxX = this.boardWidth - this.margin;
      const minY = this.margin;
      const maxY = this.boardHeight - this.margin;
      const cushionRestitution = 0.74; // Authentic rubber carrom cushion bounce

      for (const p of activePucks) {
        // Check if near any pocket
        const nearestPocket = this.pockets.find(pkt => Math.hypot(p.x - pkt.x, p.y - pkt.y) < pkt.captureRadius * 1.2);

        if (nearestPocket) {
          // If close to pocket corner, pull in rather than bouncing off cushion
          continue;
        }

        if (p.x - p.radius < minX) {
          p.x = minX + p.radius;
          p.vx = -p.vx * cushionRestitution;
          if (step === 0 && Math.abs(p.vx) > 2) {
            sounds.playCushionBounce(Math.abs(p.vx));
            triggerHaptic.light();
          }
        } else if (p.x + p.radius > maxX) {
          p.x = maxX - p.radius;
          p.vx = -p.vx * cushionRestitution;
          if (step === 0 && Math.abs(p.vx) > 2) {
            sounds.playCushionBounce(Math.abs(p.vx));
            triggerHaptic.light();
          }
        }

        if (p.y - p.radius < minY) {
          p.y = minY + p.radius;
          p.vy = -p.vy * cushionRestitution;
          if (step === 0 && Math.abs(p.vy) > 2) {
            sounds.playCushionBounce(Math.abs(p.vy));
            triggerHaptic.light();
          }
        } else if (p.y + p.radius > maxY) {
          p.y = maxY - p.radius;
          p.vy = -p.vy * cushionRestitution;
          if (step === 0 && Math.abs(p.vy) > 2) {
            sounds.playCushionBounce(Math.abs(p.vy));
            triggerHaptic.light();
          }
        }

        // Hard clamping safety to guarantee puck never escapes the board
        p.x = Math.max(minX * 0.8, Math.min(maxX + minX * 0.2, p.x));
        p.y = Math.max(minY * 0.8, Math.min(maxY + minY * 0.2, p.y));
      }
    }
  }
}
