export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'Z' | 'T';

export type RotationState = 0 | 1 | 2 | 3; // 0=spawn, 1=90°CW, 2=180°, 3=270°CW

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelTransition';

export interface Position {
  x: number;
  y: number;
}

export interface Block {
  type: TetrominoType;
  position: Position;
}

export interface TetrominoData {
  type: TetrominoType;
  shape: number[][][]; // [rotationState][row][col]
  color: {
    main: string;
    highlight: string;
    shadow: string;
  };
  spawnPosition: Position;
}

export interface ActivePiece {
  type: TetrominoType;
  position: Position;
  rotation: RotationState;
  lockDelay: number;
  moveResets: number;
}

export interface GameBoard {
  grid: (TetrominoType | null)[][]; // 40 rows x 10 cols
  width: number;
  height: number;
  visibleHeight: number;
}

export interface GameStats {
  score: number;
  level: number;
  lines: number;
  linesUntilNext: number;
}

export interface TetrisGameState {
  board: GameBoard;
  activePiece: ActivePiece | null;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  nextQueue: TetrominoType[];
  bag: TetrominoType[];
  ghostPiece: Position[] | null;
  stats: GameStats;
  gameState: GameState;
  dropTime: number;
  lastDrop: number;
  gravityLevel: number;
}

export interface WallKickData {
  [key: string]: Position[];
}