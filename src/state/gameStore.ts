export interface PlayerSettings {
  sfxVolume: number; // 0.0 to 1.0
  musicVolume: number; // 0.0 to 1.0
  hapticsIntensity: 'off' | 'soft' | 'crisp' | 'heavy';
  targetFps: 60 | 120;
  isProUser: boolean; // Ad-Free Pro pass
}

export interface StrikerItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  color: string;
  borderColor: string;
  mass: number;
  restitution: number;
  trait: string;
}

export interface BoardThemeItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  frameColor: string;
  surfaceColor: string;
  cushionColor: string;
  mandalaColor: string;
  pocketColor: string;
  pocketRimColor: string;
  glowColor: string;
}

export interface PuckSkinItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  unlocked: boolean;
  whiteColor: string;
  whiteBorder: string;
  queenColor: string;
  queenBorder: string;
}

export interface GameProgress {
  currentLevel: number;
  unlockedLevel: number;
  levelStars: Record<number, number>; // level -> 1, 2, or 3
  coins: number;
  selectedBoardTheme: string;
  selectedStriker: string;
  selectedPuckSkin: string;
  dailyCompletedDate: string; // YYYY-MM-DD
  dailyStreak: number;
  settings: PlayerSettings;
  achievements: Record<string, boolean>;
  strikerCharges: Record<string, number>; // Striker ID -> powder matches remaining
  strikerLevels: Record<string, number>; // Striker ID -> upgrade level (1 to 5)
  lastSpinDate: string; // YYYY-MM-DD
  boardPowderCharges: number; // Board powder matches remaining
}

export const INITIAL_BOARD_THEMES: BoardThemeItem[] = [
  {
    id: 'heritage_wood',
    name: 'Heritage Rosewood',
    desc: 'Traditional tournament teak with polished brass trim.',
    price: 0,
    unlocked: true,
    frameColor: '#261713',
    surfaceColor: '#EBD5B3',
    cushionColor: '#4A2A20',
    mandalaColor: '#D4AF37',
    pocketColor: '#0A0706',
    pocketRimColor: '#E5A93B',
    glowColor: '#00E5FF',
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    desc: 'High-tech synthwave dark grid with luminous cyan cushions.',
    price: 450,
    unlocked: false,
    frameColor: '#0B0813',
    surfaceColor: '#161226',
    cushionColor: '#2D1B4E',
    mandalaColor: '#00E5FF',
    pocketColor: '#030206',
    pocketRimColor: '#FF4081',
    glowColor: '#FF4081',
  },
  {
    id: 'royal_velvet',
    name: 'Royal Velvet',
    desc: 'Deep emerald velvet felt with 24k gold flourishes.',
    price: 800,
    unlocked: false,
    frameColor: '#12261A',
    surfaceColor: '#1B432C',
    cushionColor: '#0F2B1B',
    mandalaColor: '#FFD700',
    pocketColor: '#040C07',
    pocketRimColor: '#FFD700',
    glowColor: '#00E676',
  },
  {
    id: 'candy_wonderland',
    name: 'Pastel Candy',
    desc: 'Vibrant bubblegum pink & cotton candy sweet bliss.',
    price: 1200,
    unlocked: false,
    frameColor: '#36152B',
    surfaceColor: '#FCE4EC',
    cushionColor: '#E91E63',
    mandalaColor: '#FF4081',
    pocketColor: '#1A0714',
    pocketRimColor: '#FF80AB',
    glowColor: '#FF4081',
  },
];

export const INITIAL_STRIKERS: StrikerItem[] = [
  {
    id: 'standard_cyan',
    name: 'Cyan Precision',
    desc: 'Official starter striker with balanced mass and compact tactical aim guide.',
    price: 0,
    unlocked: true,
    color: '#00E5FF',
    borderColor: '#FFFFFF',
    mass: 3.2,
    restitution: 0.82,
    trait: 'Balanced',
  },
  {
    id: 'heavy_juggernaut',
    name: 'The Juggernaut',
    desc: 'Heavy lead core (+30% mass) smashes through puck clusters with unstoppable force.',
    price: 500,
    unlocked: false,
    color: '#37474F',
    borderColor: '#FFD700',
    mass: 4.2,
    restitution: 0.80,
    trait: '+30% Mass',
  },
  {
    id: 'glass_feather',
    name: 'Glass Feather',
    desc: 'High-elasticity crystal (+15% bounce) delivers lively bank-shot rebounds.',
    price: 850,
    unlocked: false,
    color: '#E0F7FA',
    borderColor: '#00B0FF',
    mass: 2.8,
    restitution: 0.92,
    trait: '+15% Rebound',
  },
  {
    id: 'laser_pointer',
    name: 'Gold Crown',
    desc: 'Gilded tournament striker with 3× extended laser bank-shot trajectory raycast!',
    price: 1500,
    unlocked: false,
    color: '#FFD700',
    borderColor: '#FFF9C4',
    mass: 3.4,
    restitution: 0.86,
    trait: 'Extended Aim',
  },
];

export const INITIAL_PUCK_SKINS: PuckSkinItem[] = [
  {
    id: 'classic_wood',
    name: 'Tournament Teak',
    desc: 'Heritage carved wooden men with gold lacquer.',
    price: 0,
    unlocked: true,
    whiteColor: '#FFF9E6',
    whiteBorder: '#D4AF37',
    queenColor: '#FF1744',
    queenBorder: '#FFD700',
  },
  {
    id: 'cyber_gems',
    name: 'Neon Holo-Gems',
    desc: 'Luminous glowing pucks with neon core reflections.',
    price: 600,
    unlocked: false,
    whiteColor: '#E0F2F1',
    whiteBorder: '#00BFA5',
    queenColor: '#D500F9',
    queenBorder: '#FF4081',
  },
  {
    id: 'ruby_royale',
    name: 'Ruby & Pearl',
    desc: 'Polished pearl white stones and royal deep ruby queen.',
    price: 1000,
    unlocked: false,
    whiteColor: '#F5F5F5',
    whiteBorder: '#9E9E9E',
    queenColor: '#B71C1C',
    queenBorder: '#FFD700',
  },
];

const STORAGE_KEY = 'carrom_odyssey_master_data_v1';

export const DEFAULT_STRIKER_CHARGES: Record<string, number> = {
  standard_cyan: 999, // Starter striker has infinite base powder
  heavy_juggernaut: 15,
  glass_feather: 15,
  laser_pointer: 15,
};

export const DEFAULT_STRIKER_LEVELS: Record<string, number> = {
  standard_cyan: 1,
  heavy_juggernaut: 1,
  glass_feather: 1,
  laser_pointer: 1,
};

export function loadGameData(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        settings: {
          sfxVolume: 0.8,
          musicVolume: 0.5,
          hapticsIntensity: 'crisp',
          targetFps: 60,
          isProUser: false,
          ...parsed.settings,
        },
        strikerCharges: {
          ...DEFAULT_STRIKER_CHARGES,
          ...parsed.strikerCharges,
        },
        strikerLevels: {
          ...DEFAULT_STRIKER_LEVELS,
          ...parsed.strikerLevels,
        },
        lastSpinDate: parsed.lastSpinDate || '',
        boardPowderCharges: parsed.boardPowderCharges ?? 10,
      };
    }
  } catch {}

  return {
    currentLevel: 1,
    unlockedLevel: 1,
    levelStars: {},
    coins: 250, // Starting welcome bonus
    selectedBoardTheme: 'heritage_wood',
    selectedStriker: 'standard_cyan',
    selectedPuckSkin: 'classic_wood',
    dailyCompletedDate: '',
    dailyStreak: 0,
    settings: {
      sfxVolume: 0.8,
      musicVolume: 0.5,
      hapticsIntensity: 'crisp',
      targetFps: 60,
      isProUser: false,
    },
    achievements: {},
    strikerCharges: { ...DEFAULT_STRIKER_CHARGES },
    strikerLevels: { ...DEFAULT_STRIKER_LEVELS },
    lastSpinDate: '',
    boardPowderCharges: 10,
  };
}

export function saveGameData(data: GameProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
