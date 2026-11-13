import type { Magnet, Obstacle, PuckType, Vector2D } from './physics';

export interface LevelData {
  levelNumber: number;
  title: string;
  themeDesc: string;
  boardScale: number; // 1.0 = 600x600
  friction: number;
  globalGravity: Vector2D;
  magnets: Magnet[];
  obstacles: Obstacle[];
  pucks: Array<{ type: PuckType; x: number; y: number }>;
  maxStrikes: number;
  targetCount: number; // Number of pucks needed to clear level
}

// Pseudo-random number generator for deterministic levels 1-999
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function getLevel(levelNumber: number): LevelData {
  const baseSize = 600;

  // Level 1: Basic standard carrom with Ruby Queen + 2 White pucks
  if (levelNumber === 1) {
    return {
      levelNumber: 1,
      title: 'Queen & White Pucks',
      themeDesc: 'Classic Carrom! Pocket the Ruby Queen (center) and 2 White pucks.',
      boardScale: 1.0,
      friction: 0.976,
      globalGravity: { x: 0, y: 0 },
      magnets: [],
      obstacles: [],
      pucks: [
        { type: 'queen', x: 300, y: 300 },       // RED QUEEN IN CENTER!
        { type: 'white', x: 300 - 34, y: 300 },  // Left White
        { type: 'white', x: 300 + 34, y: 300 },  // Right White
      ],
      maxStrikes: 6,
      targetCount: 3,
    };
  }

  // Level 2: Board grows larger + Queen + 3 White pucks
  if (levelNumber === 2) {
    const s = 600 * 1.15;
    const c = s / 2;
    return {
      levelNumber: 2,
      title: 'Expanding Horizon',
      themeDesc: 'The board has grown larger! Pocket the Queen and 3 White pucks.',
      boardScale: 1.15,
      friction: 0.976,
      globalGravity: { x: 0, y: 0 },
      magnets: [],
      obstacles: [],
      pucks: [
        { type: 'queen', x: c, y: c },            // Red Queen
        { type: 'white', x: c - 34, y: c - 20 },
        { type: 'white', x: c + 34, y: c - 20 },
        { type: 'white', x: c, y: c + 35 },
      ],
      maxStrikes: 7,
      targetCount: 4,
    };
  }

  // Level 3: Downstairs Magnet (Pulling downwards) + Queen
  if (levelNumber === 3) {
    return {
      levelNumber: 3,
      title: 'Downstairs Magnetic Pull',
      themeDesc: 'A magnetic field at the bottom curves all bank shots downwards!',
      boardScale: 1.0,
      friction: 0.976,
      globalGravity: { x: 0, y: 140 }, // Strong downstairs pull
      magnets: [
        { id: 1, x: 300, y: 550, strength: 3.0, radius: 250 }
      ],
      obstacles: [],
      pucks: [
        { type: 'queen', x: 300, y: 300 }, // Red Queen
        { type: 'white', x: 260, y: 260 },
        { type: 'white', x: 340, y: 260 },
      ],
      maxStrikes: 6,
      targetCount: 3,
    };
  }

  // Level 4: Center Singularity Magnet + Queen
  if (levelNumber === 4) {
    const s = 600 * 1.05;
    const c = s / 2;
    return {
      levelNumber: 4,
      title: 'Center Singularity',
      themeDesc: 'The center circle has an intense magnetic vortex pulling inward!',
      boardScale: 1.05,
      friction: 0.976,
      globalGravity: { x: 0, y: 0 },
      magnets: [
        { id: 1, x: c, y: c, strength: 3.5, radius: 260 }
      ],
      obstacles: [],
      pucks: [
        { type: 'queen', x: c, y: c },
        { type: 'white', x: c - 70, y: c },
        { type: 'white', x: c + 70, y: c },
        { type: 'white', x: c, y: c - 70 },
      ],
      maxStrikes: 8,
      targetCount: 4,
    };
  }

  // Level 5: All-sides Magnetic Flux + The Queen & 4 Whites
  if (levelNumber === 5) {
    const s = 600 * 1.1;
    const c = s / 2;
    return {
      levelNumber: 5,
      title: 'Quad Magnetic Storm',
      themeDesc: 'Magnets on all 4 quadrants! Pocket the Ruby Queen and her guards.',
      boardScale: 1.1,
      friction: 0.976,
      globalGravity: { x: 0, y: 0 },
      magnets: [
        { id: 1, x: 120, y: 120, strength: 2.2, radius: 200 },
        { id: 2, x: s - 120, y: 120, strength: 2.2, radius: 200 },
        { id: 3, x: 120, y: s - 120, strength: 2.2, radius: 200 },
        { id: 4, x: s - 120, y: s - 120, strength: 2.2, radius: 200 },
      ],
      obstacles: [],
      pucks: [
        { type: 'queen', x: c, y: c },
        { type: 'white', x: c - 34, y: c },
        { type: 'white', x: c + 34, y: c },
        { type: 'white', x: c, y: c - 34 },
        { type: 'white', x: c, y: c + 34 },
      ],
      maxStrikes: 9,
      targetCount: 5,
    };
  }

  // Procedural levels for 6 to 999:
  const seed = levelNumber * 777;
  const scale = 1.0 + (levelNumber % 6) * 0.04;
  const width = baseSize * scale;
  const height = width;
  const center = width / 2;

  const hasDownstairsGravity = levelNumber % 4 === 3;
  const hasCenterMagnet = levelNumber % 5 === 0;
  const hasBumpers = levelNumber % 3 === 1 && levelNumber > 6;
  const isSuperSlick = levelNumber % 7 === 0;

  const puckCount = Math.min(7, 3 + Math.floor(levelNumber / 15));
  const generatedPucks: Array<{ type: PuckType; x: number; y: number }> = [];

  // Every level features a Queen in the center!
  generatedPucks.push({ type: 'queen', x: center, y: center });

  const remaining = puckCount - 1;
  for (let i = 0; i < remaining; i++) {
    const angle = (i / remaining) * Math.PI * 2 + seededRandom(seed + i) * 0.4;
    const dist = 38 + seededRandom(seed + i * 2) * 80;
    generatedPucks.push({
      type: 'white',
      x: center + Math.cos(angle) * dist,
      y: center + Math.sin(angle) * dist,
    });
  }

  const magnets: Magnet[] = [];
  if (hasCenterMagnet) {
    magnets.push({
      id: 1,
      x: center,
      y: center,
      strength: 2.0 + seededRandom(seed + 9) * 2.0,
      radius: 250,
    });
  } else if (levelNumber % 4 === 2) {
    // Twin corner magnets
    magnets.push(
      { id: 1, x: 140, y: 140, strength: 2.2, radius: 220 },
      { id: 2, x: width - 140, y: height - 140, strength: 2.2, radius: 220 }
    );
  }

  const obstacles: Obstacle[] = [];
  if (hasBumpers) {
    obstacles.push(
      { id: 1, x: center - 90, y: center - 90, radius: 18 },
      { id: 2, x: center + 90, y: center + 90, radius: 18 }
    );
  }

  const titles = [
    'Candy Orbit', 'Cosmic Rebound', 'Sugar Rush', 'Neon Vortex',
    'Jelly Bounce', 'Gravity Well', 'Golden Carrom', 'Prismatic Strike'
  ];
  const title = `${titles[levelNumber % titles.length]} #${levelNumber}`;

  return {
    levelNumber,
    title,
    themeDesc: `${hasDownstairsGravity ? 'Downstairs Gravity + ' : ''}${hasCenterMagnet ? 'Center Magnet + ' : ''}${hasBumpers ? 'Pinball Bumpers + ' : ''}Clear Queen & ${remaining} Whites!`,
    boardScale: scale,
    friction: isSuperSlick ? 0.985 : 0.976,
    globalGravity: hasDownstairsGravity ? { x: 0, y: 120 } : { x: 0, y: 0 },
    magnets,
    obstacles,
    pucks: generatedPucks,
    maxStrikes: puckCount + 3,
    targetCount: puckCount,
  };
}
