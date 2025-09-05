import { WallKickData } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 40;
export const VISIBLE_HEIGHT = 20;
export const SPAWN_ROW = 21;

export const LOCK_DELAY = 500; // milliseconds
export const MAX_MOVE_RESETS = 15;
export const SOFT_DROP_MULTIPLIER = 20;

// Gravity speeds (frames per drop at 60 FPS)
export const GRAVITY_SPEEDS: Record<number, number> = {
  1: 48,   // 0.8 seconds
  2: 43,
  3: 38,
  4: 33,
  5: 28,
  6: 23,
  7: 18,
  8: 13,
  9: 8,
  10: 6,
  13: 5,
  16: 4,
  19: 3,
  29: 2,
  30: 1    // 1/60 second
};

// Lines required to level up
export const LINES_PER_LEVEL: Record<number, number> = {
  1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 10, 9: 10,
  10: 20, 11: 20, 12: 20, 13: 20, 14: 20, 15: 20,
  16: 30 // 16+ requires 30 lines each
};

// Tetromino shape definitions (4x4 grid for each rotation)
export const TETROMINO_SHAPES: Record<string, number[][][]> = {
  I: [
    // State 0 (spawn)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State R (90° CW)
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ],
    // State 2 (180°)
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0]
    ],
    // State L (270° CW)
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ]
  ],
  J: [
    // State 0
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State R
    [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    // State 2
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ],
    // State L
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  L: [
    // State 0
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State R
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    // State 2
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State L
    [
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  O: [
    // All states are the same for O-piece
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  S: [
    // State 0
    [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State R
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ],
    // State 2
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    // State L
    [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  Z: [
    // State 0
    [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State R
    [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    // State 2
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    // State L
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  T: [
    // State 0
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // State R
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    // State 2
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    // State L
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ]
};

// Color definitions with 3D effect
export const TETROMINO_COLORS: Record<string, { main: string; highlight: string; shadow: string }> = {
  I: { main: '#00ffff', highlight: '#66ffff', shadow: '#0099cc' },
  J: { main: '#0000ff', highlight: '#6666ff', shadow: '#0000cc' },
  L: { main: '#ff6600', highlight: '#ff9966', shadow: '#cc3300' },
  O: { main: '#ffff00', highlight: '#ffff66', shadow: '#cccc00' },
  S: { main: '#00ff00', highlight: '#66ff66', shadow: '#00cc00' },
  Z: { main: '#ff0000', highlight: '#ff6666', shadow: '#cc0000' },
  T: { main: '#ff00ff', highlight: '#ff66ff', shadow: '#cc00cc' }
};

// Spawn positions for each piece
export const SPAWN_POSITIONS: Record<string, { x: number; y: number }> = {
  I: { x: 3, y: SPAWN_ROW },
  J: { x: 3, y: SPAWN_ROW },
  L: { x: 3, y: SPAWN_ROW },
  O: { x: 4, y: SPAWN_ROW },
  S: { x: 3, y: SPAWN_ROW },
  Z: { x: 3, y: SPAWN_ROW },
  T: { x: 3, y: SPAWN_ROW }
};

// Super Rotation System (SRS) wall kick data
export const SRS_WALL_KICKS: WallKickData = {
  // Non-I pieces: J, L, S, T, Z
  'JLSTZ_0_R': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  'JLSTZ_R_0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  'JLSTZ_R_2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  'JLSTZ_2_R': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  'JLSTZ_2_L': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  'JLSTZ_L_2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  'JLSTZ_L_0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  'JLSTZ_0_L': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  
  // I piece has different wall kicks
  'I_0_R': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
  'I_R_0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }],
  'I_R_2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, { x: 2, y: -1 }],
  'I_2_R': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }],
  'I_2_L': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }],
  'I_L_2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
  'I_L_0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }],
  'I_0_L': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, { x: 2, y: -1 }],
  
  // O piece doesn't rotate, so no wall kicks needed
};

// 7-bag randomizer pieces
export const ALL_PIECES: string[] = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'];

// Scoring
export const BASE_SCORES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  T_SPIN_SINGLE: 800,
  T_SPIN_DOUBLE: 1200,
  T_SPIN_TRIPLE: 1600,
  SOFT_DROP: 1,
  HARD_DROP: 2
};