import { TetrisGameState, TetrominoType, GameStats } from './types';
import { 
  createEmptyBoard, 
  generateBag, 
  getNextPiece, 
  createActivePiece,
  getGravitySpeed
} from './gameLogic';
import { LINES_PER_LEVEL } from './constants';

// Create initial game state
export function createInitialGameState(): TetrisGameState {
  const bag = generateBag();
  const nextQueue: TetrominoType[] = [];
  
  // Fill next queue
  let currentBag = [...bag];
  for (let i = 0; i < 6; i++) {
    if (currentBag.length === 0) {
      currentBag = generateBag();
    }
    nextQueue.push(currentBag.shift()!);
  }
  
  // Get first piece
  const { piece: firstPiece, newBag } = getNextPiece({ 
    bag: currentBag, 
    nextQueue, 
    stats: { level: 1 } 
  } as TetrisGameState);
  
  const initialStats: GameStats = {
    score: 0,
    level: 1,
    lines: 0,
    linesUntilNext: LINES_PER_LEVEL[1]
  };
  
  return {
    board: createEmptyBoard(),
    activePiece: createActivePiece(firstPiece),
    holdPiece: null,
    canHold: true,
    nextQueue,
    bag: newBag,
    ghostPiece: null,
    stats: initialStats,
    gameState: 'playing',
    dropTime: getGravitySpeed(1) * (1000 / 60), // Convert frames to milliseconds
    lastDrop: 0,
    gravityLevel: 1
  };
}

// Reset game to initial state
export function resetGame(): TetrisGameState {
  return createInitialGameState();
}

// Pause/unpause game
export function togglePause(gameState: TetrisGameState): TetrisGameState {
  if (gameState.gameState === 'playing') {
    return { ...gameState, gameState: 'paused' };
  } else if (gameState.gameState === 'paused') {
    return { ...gameState, gameState: 'playing' };
  }
  return gameState;
}

// Set game over
export function setGameOver(gameState: TetrisGameState): TetrisGameState {
  return { ...gameState, gameState: 'gameOver' };
}

// Update drop time based on current level
export function updateDropTime(gameState: TetrisGameState): TetrisGameState {
  const newDropTime = getGravitySpeed(gameState.stats.level) * (1000 / 60);
  return { 
    ...gameState, 
    dropTime: newDropTime,
    gravityLevel: gameState.stats.level
  };
}