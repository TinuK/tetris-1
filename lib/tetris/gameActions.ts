import { TetrisGameState, ActivePiece, Position } from './types';
import { 
  isValidPosition, 
  tryRotation, 
  lockPiece, 
  getCompletedLines, 
  clearLines, 
  calculateGhostPosition,
  isGameOver,
  shouldLock,
  calculateScore,
  updateStats,
  isTSpin,
  getNextPiece,
  createActivePiece
} from './gameLogic';
import { setGameOver, updateDropTime } from './gameState';
import { LOCK_DELAY, MAX_MOVE_RESETS, BASE_SCORES } from './constants';

// Move piece left or right
export function movePiece(gameState: TetrisGameState, direction: -1 | 1): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;
  }

  const offset: Position = { x: direction, y: 0 };
  
  if (isValidPosition(gameState.board, gameState.activePiece, offset)) {
    const newPiece: ActivePiece = {
      ...gameState.activePiece,
      position: {
        x: gameState.activePiece.position.x + direction,
        y: gameState.activePiece.position.y
      },
      lockDelay: shouldLock(gameState.board, gameState.activePiece) && gameState.activePiece.moveResets < MAX_MOVE_RESETS 
        ? 0 
        : gameState.activePiece.lockDelay,
      moveResets: shouldLock(gameState.board, gameState.activePiece) && gameState.activePiece.moveResets < MAX_MOVE_RESETS
        ? gameState.activePiece.moveResets + 1
        : gameState.activePiece.moveResets
    };

    return {
      ...gameState,
      activePiece: newPiece,
      ghostPiece: calculateGhostPosition(gameState.board, newPiece)
    };
  }

  return gameState;
}

// Rotate piece
export function rotatePiece(gameState: TetrisGameState, direction: 1 | -1): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;
  }

  const rotatedPiece = tryRotation(gameState.board, gameState.activePiece, direction);
  
  if (rotatedPiece) {
    const newPiece: ActivePiece = {
      ...rotatedPiece,
      lockDelay: shouldLock(gameState.board, rotatedPiece) && rotatedPiece.moveResets < MAX_MOVE_RESETS
        ? 0
        : gameState.activePiece.lockDelay
    };

    return {
      ...gameState,
      activePiece: newPiece,
      ghostPiece: calculateGhostPosition(gameState.board, newPiece)
    };
  }

  return gameState;
}

// Soft drop (move down faster)
export function softDrop(gameState: TetrisGameState): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;
  }

  const offset: Position = { x: 0, y: -1 };
  
  if (isValidPosition(gameState.board, gameState.activePiece, offset)) {
    const newPiece: ActivePiece = {
      ...gameState.activePiece,
      position: {
        x: gameState.activePiece.position.x,
        y: gameState.activePiece.position.y - 1
      }
    };

    return {
      ...gameState,
      activePiece: newPiece,
      stats: {
        ...gameState.stats,
        score: gameState.stats.score + BASE_SCORES.SOFT_DROP
      },
      ghostPiece: calculateGhostPosition(gameState.board, newPiece)
    };
  }

  return gameState;
}

// Hard drop (instant drop to bottom)
export function hardDrop(gameState: TetrisGameState): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;
  }

  const ghostPositions = calculateGhostPosition(gameState.board, gameState.activePiece);
  if (ghostPositions.length === 0) return gameState;

  // Calculate drop distance
  const dropDistance = gameState.activePiece.position.y - ghostPositions[0].y;
  
  const newPiece: ActivePiece = {
    ...gameState.activePiece,
    position: {
      x: gameState.activePiece.position.x,
      y: ghostPositions[0].y
    },
    lockDelay: LOCK_DELAY, // Force immediate lock
    moveResets: MAX_MOVE_RESETS // Prevent further resets
  };

  return {
    ...gameState,
    activePiece: newPiece,
    stats: {
      ...gameState.stats,
      score: gameState.stats.score + (BASE_SCORES.HARD_DROP * dropDistance)
    },
    ghostPiece: ghostPositions
  };
}

// Hold current piece
export function holdPiece(gameState: TetrisGameState): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece || !gameState.canHold) {
    return gameState;
  }

  let newActivePiece: ActivePiece;
  const newHoldPiece = gameState.activePiece.type;
  const newNextQueue = [...gameState.nextQueue];
  let newBag = [...gameState.bag];

  if (gameState.holdPiece) {
    // Swap with held piece
    newActivePiece = createActivePiece(gameState.holdPiece);
  } else {
    // Take next piece from queue
    const { piece, newBag: updatedBag } = getNextPiece(gameState);
    newActivePiece = createActivePiece(piece);
    newBag = updatedBag;
    newNextQueue.shift();
    
    // Refill queue if needed
    if (newNextQueue.length < 3) {
      const { piece: nextPiece, newBag: finalBag } = getNextPiece({ ...gameState, bag: newBag });
      newNextQueue.push(nextPiece);
      newBag = finalBag;
    }
  }

  // Check if new piece can be placed
  if (isGameOver(gameState.board, newActivePiece)) {
    return setGameOver(gameState);
  }

  return {
    ...gameState,
    activePiece: newActivePiece,
    holdPiece: newHoldPiece,
    canHold: false,
    nextQueue: newNextQueue,
    bag: newBag,
    ghostPiece: calculateGhostPosition(gameState.board, newActivePiece)
  };
}

// Handle gravity (natural piece falling)
export function applyGravity(gameState: TetrisGameState, deltaTime: number): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;
  }

  const newLastDrop = gameState.lastDrop + deltaTime;
  
  if (newLastDrop >= gameState.dropTime) {
    const offset: Position = { x: 0, y: -1 };
    
    if (isValidPosition(gameState.board, gameState.activePiece, offset)) {
      // Move piece down
      const newPiece: ActivePiece = {
        ...gameState.activePiece,
        position: {
          x: gameState.activePiece.position.x,
          y: gameState.activePiece.position.y - 1
        }
      };

      return {
        ...gameState,
        activePiece: newPiece,
        lastDrop: 0,
        ghostPiece: calculateGhostPosition(gameState.board, newPiece)
      };
    } else {
      // Can't move down, start lock delay
      return {
        ...gameState,
        lastDrop: 0
      };
    }
  }

  return {
    ...gameState,
    lastDrop: newLastDrop
  };
}

// Handle lock delay timer
export function updateLockDelay(gameState: TetrisGameState, deltaTime: number): TetrisGameState {
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;
  }

  if (shouldLock(gameState.board, gameState.activePiece)) {
    const newLockDelay = gameState.activePiece.lockDelay + deltaTime;
    
    if (newLockDelay >= LOCK_DELAY) {
      // Lock the piece
      return lockActivePiece(gameState);
    } else {
      return {
        ...gameState,
        activePiece: {
          ...gameState.activePiece,
          lockDelay: newLockDelay
        }
      };
    }
  } else {
    // Reset lock delay if piece can move down
    return {
      ...gameState,
      activePiece: {
        ...gameState.activePiece,
        lockDelay: 0
      }
    };
  }
}

// Lock active piece and handle line clears
function lockActivePiece(gameState: TetrisGameState): TetrisGameState {
  if (!gameState.activePiece) return gameState;

  // Check for T-spin before locking
  const wasTSpin = isTSpin(gameState.board, gameState.activePiece);
  
  // Lock piece into board
  const newBoard = lockPiece(gameState.board, gameState.activePiece);
  
  // Check for completed lines
  const completedLines = getCompletedLines(newBoard);
  const clearedBoard = clearLines(newBoard, completedLines);
  
  // Calculate score
  const lineScore = calculateScore(completedLines.length, gameState.stats.level, wasTSpin);
  
  // Update stats
  const newStats = {
    ...updateStats(gameState.stats, completedLines.length),
    score: gameState.stats.score + lineScore
  };
  
  // Get next piece
  const { piece: nextPiece, newBag } = getNextPiece(gameState);
  const newNextQueue = [...gameState.nextQueue];
  newNextQueue.shift();
  
  // Refill queue if needed
  if (newNextQueue.length < 3) {
    const { piece: refillPiece } = getNextPiece({ ...gameState, bag: newBag });
    newNextQueue.push(refillPiece);
  }
  
  const newActivePiece = createActivePiece(nextPiece);
  
  // Check for game over
  if (isGameOver(clearedBoard, newActivePiece)) {
    return setGameOver({
      ...gameState,
      board: clearedBoard,
      activePiece: null,
      stats: newStats
    });
  }
  
  // Update drop time based on new level
  let updatedGameState: TetrisGameState = {
    ...gameState,
    board: clearedBoard,
    activePiece: newActivePiece,
    canHold: true, // Reset hold ability
    nextQueue: newNextQueue,
    bag: newBag,
    stats: newStats,
    ghostPiece: calculateGhostPosition(clearedBoard, newActivePiece)
  };
  
  // Update gravity if level changed
  if (newStats.level !== gameState.stats.level) {
    updatedGameState = updateDropTime(updatedGameState);
  }
  
  return updatedGameState;
}