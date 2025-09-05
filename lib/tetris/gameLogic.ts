import { 
  TetrominoType, 
  RotationState, 
  Position, 
  ActivePiece, 
  GameBoard, 
  TetrisGameState,
  GameStats
} from './types';
import { 
  TETROMINO_SHAPES, 
  SPAWN_POSITIONS, 
  SRS_WALL_KICKS, 
  ALL_PIECES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  VISIBLE_HEIGHT,
  GRAVITY_SPEEDS,
  LINES_PER_LEVEL,
  BASE_SCORES
} from './constants';

// Initialize empty game board
export function createEmptyBoard(): GameBoard {
  return {
    grid: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)),
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    visibleHeight: VISIBLE_HEIGHT
  };
}

// Get piece shape at specific rotation
export function getPieceShape(type: TetrominoType, rotation: RotationState): number[][] {
  return TETROMINO_SHAPES[type][rotation];
}

// Get absolute positions of piece blocks
export function getPieceBlocks(piece: ActivePiece): Position[] {
  const shape = getPieceShape(piece.type, piece.rotation);
  const blocks: Position[] = [];
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        blocks.push({
          x: piece.position.x + col,
          y: piece.position.y + row
        });
      }
    }
  }
  
  return blocks;
}

// Check if position is valid (within bounds and not colliding)
export function isValidPosition(board: GameBoard, piece: ActivePiece, offset: Position = { x: 0, y: 0 }): boolean {
  const testPiece = {
    ...piece,
    position: {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y
    }
  };
  
  const blocks = getPieceBlocks(testPiece);
  
  for (const block of blocks) {
    // Check bounds
    if (block.x < 0 || block.x >= board.width || block.y < 0) {
      return false;
    }
    
    // Check collision with existing blocks
    if (block.y < board.height && board.grid[block.y][block.x] !== null) {
      return false;
    }
  }
  
  return true;
}

// Generate 7-bag random sequence
export function generateBag(): TetrominoType[] {
  const bag = [...ALL_PIECES] as TetrominoType[];
  
  // Fisher-Yates shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  
  return bag;
}

// Get next piece from queue, refill bag if needed
export function getNextPiece(gameState: TetrisGameState): { piece: TetrominoType, newBag: TetrominoType[] } {
  let newBag = [...gameState.bag];
  
  if (newBag.length === 0) {
    newBag = generateBag();
  }
  
  const piece = newBag.shift()!;
  return { piece, newBag };
}

// Create new active piece
export function createActivePiece(type: TetrominoType): ActivePiece {
  return {
    type,
    position: SPAWN_POSITIONS[type],
    rotation: 0,
    lockDelay: 0,
    moveResets: 0
  };
}

// Try to rotate piece using Super Rotation System
export function tryRotation(board: GameBoard, piece: ActivePiece, direction: 1 | -1): ActivePiece | null {
  const newRotation = ((piece.rotation + direction + 4) % 4) as RotationState;
  
  // Get wall kick data
  const pieceType = piece.type === 'I' ? 'I' : 'JLSTZ';
  const rotationKey = `${pieceType}_${piece.rotation}_${newRotation}`;
  const wallKicks = SRS_WALL_KICKS[rotationKey] || [{ x: 0, y: 0 }];
  
  // Try each wall kick position
  for (const kick of wallKicks) {
    const testPiece = {
      ...piece,
      position: {
        x: piece.position.x + kick.x,
        y: piece.position.y - kick.y // Invert Y because our coordinate system is flipped
      },
      rotation: newRotation,
      moveResets: piece.moveResets + 1
    };
    
    if (isValidPosition(board, testPiece)) {
      return testPiece;
    }
  }
  
  return null;
}

// Lock piece into board
export function lockPiece(board: GameBoard, piece: ActivePiece): GameBoard {
  const newBoard = {
    ...board,
    grid: board.grid.map(row => [...row])
  };
  
  const blocks = getPieceBlocks(piece);
  
  for (const block of blocks) {
    if (block.y >= 0 && block.y < board.height) {
      newBoard.grid[block.y][block.x] = piece.type;
    }
  }
  
  return newBoard;
}

// Check for completed lines
export function getCompletedLines(board: GameBoard): number[] {
  const completedLines: number[] = [];
  
  for (let row = 0; row < board.height; row++) {
    if (board.grid[row].every(cell => cell !== null)) {
      completedLines.push(row);
    }
  }
  
  return completedLines;
}

// Clear completed lines and apply gravity
export function clearLines(board: GameBoard, linesToClear: number[]): GameBoard {
  if (linesToClear.length === 0) return board;
  
  const newGrid = board.grid.filter((_, index) => !linesToClear.includes(index));
  
  // Add empty rows at the top
  while (newGrid.length < board.height) {
    newGrid.push(Array(board.width).fill(null));
  }
  
  return {
    ...board,
    grid: newGrid
  };
}

// Calculate ghost piece position
export function calculateGhostPosition(board: GameBoard, piece: ActivePiece): Position[] {
  let ghostY = piece.position.y;
  
  // Drop until collision
  while (isValidPosition(board, { ...piece, position: { ...piece.position, y: ghostY - 1 } })) {
    ghostY--;
  }
  
  const ghostPiece = { ...piece, position: { ...piece.position, y: ghostY } };
  return getPieceBlocks(ghostPiece);
}

// Check for game over conditions
export function isGameOver(board: GameBoard, piece: ActivePiece): boolean {
  // Block out: piece spawns overlapping existing blocks
  return !isValidPosition(board, piece);
}

// Check if piece should lock (can't move down)
export function shouldLock(board: GameBoard, piece: ActivePiece): boolean {
  return !isValidPosition(board, piece, { x: 0, y: -1 });
}

// Calculate score for line clear
export function calculateScore(linesCleared: number, level: number, isTSpin: boolean = false): number {
  let baseScore = 0;
  
  if (isTSpin) {
    switch (linesCleared) {
      case 1: baseScore = BASE_SCORES.T_SPIN_SINGLE; break;
      case 2: baseScore = BASE_SCORES.T_SPIN_DOUBLE; break;
      case 3: baseScore = BASE_SCORES.T_SPIN_TRIPLE; break;
    }
  } else {
    switch (linesCleared) {
      case 1: baseScore = BASE_SCORES.SINGLE; break;
      case 2: baseScore = BASE_SCORES.DOUBLE; break;
      case 3: baseScore = BASE_SCORES.TRIPLE; break;
      case 4: baseScore = BASE_SCORES.TETRIS; break;
    }
  }
  
  return baseScore * (level + 1);
}

// Update game stats after line clear
export function updateStats(stats: GameStats, linesCleared: number): GameStats {
  const newStats = { ...stats };
  newStats.lines += linesCleared;
  
  // Check for level up
  newStats.linesUntilNext -= linesCleared;
  
  if (newStats.linesUntilNext <= 0) {
    newStats.level++;
    newStats.linesUntilNext = LINES_PER_LEVEL[newStats.level] || 30;
  }
  
  return newStats;
}

// Get gravity speed for current level
export function getGravitySpeed(level: number): number {
  // Find the highest level that's <= current level
  const speeds = Object.keys(GRAVITY_SPEEDS)
    .map(Number)
    .sort((a, b) => a - b);
  
  let targetLevel = 1;
  for (const speedLevel of speeds) {
    if (speedLevel <= level) {
      targetLevel = speedLevel;
    } else {
      break;
    }
  }
  
  return GRAVITY_SPEEDS[targetLevel];
}

// Check if T-spin was performed (simplified detection)
export function isTSpin(board: GameBoard, piece: ActivePiece): boolean {
  if (piece.type !== 'T') return false;
  
  // T-spin detection is complex - this is a simplified version
  // Real implementation would check for 3-corner rule and kick detection
  const blocks = getPieceBlocks(piece);
  const centerBlock = blocks.find(b => b.x === piece.position.x + 1 && b.y === piece.position.y + 1);
  
  if (!centerBlock) return false;
  
  // Check corners around the T-piece center
  const corners = [
    { x: centerBlock.x - 1, y: centerBlock.y - 1 },
    { x: centerBlock.x + 1, y: centerBlock.y - 1 },
    { x: centerBlock.x - 1, y: centerBlock.y + 1 },
    { x: centerBlock.x + 1, y: centerBlock.y + 1 }
  ];
  
  let blockedCorners = 0;
  for (const corner of corners) {
    if (corner.x < 0 || corner.x >= board.width || corner.y < 0 || 
        (corner.y < board.height && board.grid[corner.y][corner.x] !== null)) {
      blockedCorners++;
    }
  }
  
  return blockedCorners >= 3;
}