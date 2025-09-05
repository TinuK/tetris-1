# Game Logic Examples - Deep Dive

This document provides detailed examples of how our Tetris game mechanics work with annotated code.

## 1. Piece Movement with Collision Detection

```tsx
// File: lib/tetris/gameActions.ts

export function movePiece(gameState: TetrisGameState, direction: -1 | 1): TetrisGameState {
  // Early return if game not active or no piece to move
  if (gameState.gameState !== 'playing' || !gameState.activePiece) {
    return gameState;  // Return unchanged state
  }

  // Calculate movement offset
  const offset: Position = { x: direction, y: 0 };
  //                         ↑ -1 for left, +1 for right
  
  // Check if movement is valid using collision detection
  if (isValidPosition(gameState.board, gameState.activePiece, offset)) {
    //  ↑ Pure function that checks boundaries and collisions
    
    // Create new piece with updated position (immutable update)
    const newPiece: ActivePiece = {
      ...gameState.activePiece,  // Copy all existing properties
      position: {
        x: gameState.activePiece.position.x + direction,  // Update X
        y: gameState.activePiece.position.y               // Keep Y same
      },
      
      // Lock delay logic - if piece is resting on something and hasn't
      // exceeded move resets, reset the lock timer
      lockDelay: shouldLock(gameState.board, gameState.activePiece) && 
                 gameState.activePiece.moveResets < MAX_MOVE_RESETS 
        ? 0  // Reset lock delay
        : gameState.activePiece.lockDelay,  // Keep current delay
      
      // Increment move resets counter
      moveResets: shouldLock(gameState.board, gameState.activePiece) && 
                  gameState.activePiece.moveResets < MAX_MOVE_RESETS
        ? gameState.activePiece.moveResets + 1
        : gameState.activePiece.moveResets
    };

    // Return new game state with updated piece and ghost position
    return {
      ...gameState,  // Copy all game state
      activePiece: newPiece,
      ghostPiece: calculateGhostPosition(gameState.board, newPiece)
      //          ↑ Recalculate where piece would land
    };
  }

  // Movement blocked - return original state unchanged
  return gameState;
}
```

**Key Concepts:**
- **Immutable Updates**: Never modify existing objects, always create new ones
- **Early Returns**: Exit function early for invalid conditions
- **Lock Delay Reset**: Allow players more time when they're actively moving
- **Ghost Piece Update**: Keep preview in sync with actual piece

## 2. Super Rotation System (SRS) with Wall Kicks

```tsx
// File: lib/tetris/gameLogic.ts

export function tryRotation(
  board: GameBoard,
  piece: ActivePiece,
  direction: 1 | -1  // 1 = clockwise, -1 = counterclockwise
): ActivePiece | null {
  
  // Calculate new rotation state (0, 1, 2, 3)
  const newRotation = ((piece.rotation + direction + 4) % 4) as RotationState;
  //                   ↑ +4 ensures positive result for negative direction
  
  // Create piece with new rotation
  const rotatedPiece: ActivePiece = {
    ...piece,
    rotation: newRotation
  };
  
  // Test basic rotation first (no wall kick)
  if (isValidPosition(board, rotatedPiece)) {
    return {
      ...rotatedPiece,
      moveResets: piece.moveResets + 1  // Rotation counts as move reset
    };
  }
  
  // Basic rotation failed - try wall kicks
  const kickData = piece.type === 'I' 
    ? SRS_WALL_KICKS_I  // I-piece has special kick data
    : SRS_WALL_KICKS;   // Standard kick data for other pieces
  
  // Create key for wall kick lookup
  const fromState = piece.rotation;
  const toState = newRotation;
  const kickKey = `${fromState}${toState}`;  // e.g., "01" for 0→1 rotation
  
  const kicks = kickData[kickKey] || [];
  //            ↑ Get array of kick offsets to try
  
  // Try each wall kick offset
  for (const kick of kicks) {
    const testPiece: ActivePiece = {
      ...rotatedPiece,
      position: {
        x: rotatedPiece.position.x + kick.x,  // Apply kick offset
        y: rotatedPiece.position.y + kick.y
      }
    };
    
    // Test if this kick position is valid
    if (isValidPosition(board, testPiece)) {
      return {
        ...testPiece,
        moveResets: piece.moveResets + 1
      };
    }
  }
  
  // All rotations failed
  return null;
}
```

**Wall Kick Data Example:**
```tsx
// Different pieces have different wall kick patterns
export const SRS_WALL_KICKS: WallKickData = {
  "01": [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  "10": [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  // ... more kick patterns
};

// I-piece has longer kicks due to its 4-block length
export const SRS_WALL_KICKS_I: WallKickData = {
  "01": [{ x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
  // ... I-piece specific patterns
};
```

## 3. T-Spin Detection Algorithm

```tsx
// File: lib/tetris/gameLogic.ts

export function isTSpin(board: GameBoard, piece: ActivePiece): boolean {
  // Only T-pieces can perform T-spins
  if (piece.type !== 'T') return false;
  
  // T-spin requires the last action to be a rotation
  // (This is tracked in the game state - simplified here)
  
  // Get the T-piece center position
  const centerX = piece.position.x + 1;  // T-piece center is offset +1
  const centerY = piece.position.y + 1;
  
  // Define the 4 corners around the T-piece center
  const corners = [
    { x: centerX - 1, y: centerY + 1 },  // Top-left
    { x: centerX + 1, y: centerY + 1 },  // Top-right
    { x: centerX - 1, y: centerY - 1 },  // Bottom-left
    { x: centerX + 1, y: centerY - 1 }   // Bottom-right
  ];
  
  // Count how many corners are filled (blocked)
  let filledCorners = 0;
  const cornerStatus = corners.map(corner => {
    // Check if corner is out of bounds or occupied
    const isBlocked = corner.x < 0 || corner.x >= board.width ||
                      corner.y < 0 || corner.y >= board.height ||
                      (corner.y < board.height && board.grid[corner.y][corner.x] !== null);
    
    if (isBlocked) filledCorners++;
    return isBlocked;
  });
  
  // T-spin requires at least 3 corners to be blocked
  if (filledCorners < 3) return false;
  
  // Check "front corners" based on rotation state
  let frontCorners: boolean[] = [];
  
  switch (piece.rotation) {
    case 0: // Spawn state - front is top
      frontCorners = [cornerStatus[0], cornerStatus[1]];  // Top-left, top-right
      break;
    case 1: // 90° CW - front is right
      frontCorners = [cornerStatus[1], cornerStatus[3]];  // Top-right, bottom-right
      break;
    case 2: // 180° - front is bottom
      frontCorners = [cornerStatus[2], cornerStatus[3]];  // Bottom-left, bottom-right
      break;
    case 3: // 270° CW - front is left
      frontCorners = [cornerStatus[0], cornerStatus[2]];  // Top-left, bottom-left
      break;
  }
  
  const frontCornersBlocked = frontCorners.filter(blocked => blocked).length;
  
  // T-spin classification:
  // - If both front corners blocked: T-Spin Mini
  // - If 0 or 1 front corners blocked: Full T-Spin
  return frontCornersBlocked <= 1;  // Full T-spin (more points)
}
```

**Visual T-Spin Example:**
```
Before rotation (T-piece at bottom):
▓ ▓ ▓    ← Filled blocks
▓ T ▓    ← T-piece surrounded by 3+ corners
▓ ▓ ▓

After rotation:
▓ ▓ ▓
▓ T▓T    ← T-piece rotated into tight space
▓ T ▓    ← This is a T-spin!
```

## 4. Line Clear and Scoring System

```tsx
// File: lib/tetris/gameLogic.ts

export function calculateScore(
  linesCleared: number,
  level: number,
  isTSpin: boolean = false,
  isBackToBack: boolean = false
): number {
  if (linesCleared === 0) return 0;
  
  let baseScore = 0;
  
  if (isTSpin) {
    // T-spin scoring (higher than regular line clears)
    switch (linesCleared) {
      case 1:
        baseScore = BASE_SCORES.T_SPIN_SINGLE;  // 800
        break;
      case 2:
        baseScore = BASE_SCORES.T_SPIN_DOUBLE;  // 1200
        break;
      case 3:
        baseScore = BASE_SCORES.T_SPIN_TRIPLE;  // 1600
        break;
    }
  } else {
    // Regular line clear scoring
    switch (linesCleared) {
      case 1:
        baseScore = BASE_SCORES.SINGLE;   // 100
        break;
      case 2:
        baseScore = BASE_SCORES.DOUBLE;   // 300
        break;
      case 3:
        baseScore = BASE_SCORES.TRIPLE;   // 500
        break;
      case 4:
        baseScore = BASE_SCORES.TETRIS;   // 800
        break;
    }
  }
  
  // Level multiplier
  let finalScore = baseScore * (level + 1);
  
  // Back-to-back bonus (50% more points)
  if (isBackToBack && (linesCleared === 4 || isTSpin)) {
    finalScore = Math.floor(finalScore * 1.5);
  }
  
  return finalScore;
}

// Line clearing process
function lockActivePiece(gameState: TetrisGameState): TetrisGameState {
  if (!gameState.activePiece) return gameState;

  // 1. Check for T-spin before locking
  const wasTSpin = isTSpin(gameState.board, gameState.activePiece);
  
  // 2. Lock piece into board
  const newBoard = lockPiece(gameState.board, gameState.activePiece);
  
  // 3. Find completed lines
  const completedLines = getCompletedLines(newBoard);
  //                     ↑ Returns array of row indices
  
  // 4. Clear lines and apply gravity
  const clearedBoard = clearLines(newBoard, completedLines);
  
  // 5. Calculate score with bonuses
  const lineScore = calculateScore(
    completedLines.length,
    gameState.stats.level,
    wasTSpin,
    gameState.backToBack && (completedLines.length === 4 || wasTSpin)
  );
  
  // 6. Update statistics
  const newStats = {
    ...updateStats(gameState.stats, completedLines.length),
    score: gameState.stats.score + lineScore
  };
  
  return {
    ...gameState,
    board: clearedBoard,
    stats: newStats,
    backToBack: completedLines.length === 4 || wasTSpin  // Track for next clear
  };
}
```

## 5. 7-Bag Randomizer Implementation

```tsx
// File: lib/tetris/gameLogic.ts

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];  // Don't modify original
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];  // Swap elements
  }
  
  return shuffled;
}

export function getNextPiece(gameState: TetrisGameState): {
  piece: TetrominoType;
  newBag: TetrominoType[];
} {
  let newBag = [...gameState.bag];  // Copy current bag
  
  // If bag is empty, create and shuffle a new bag
  if (newBag.length === 0) {
    newBag = shuffleArray(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
    //       ↑ Each piece appears exactly once per bag
  }
  
  // Draw piece from bag (removes from array)
  const piece = newBag.shift()!;  // ! asserts array is not empty
  
  return { piece, newBag };
}

// Queue management
export function refillNextQueue(
  currentQueue: TetrominoType[],
  currentBag: TetrominoType[],
  targetLength: number = 6
): { newQueue: TetrominoType[]; newBag: TetrominoType[] } {
  
  const queue = [...currentQueue];
  let bag = [...currentBag];
  
  // Fill queue to target length
  while (queue.length < targetLength) {
    const { piece, newBag } = getNextPiece({ bag } as TetrisGameState);
    queue.push(piece);
    bag = newBag;
  }
  
  return { newQueue: queue, newBag: bag };
}
```

**7-Bag Benefits:**
- **Balanced Distribution**: Each piece appears exactly once every 7 pieces
- **Predictable Drought**: Never more than 12 pieces between same type
- **Fair Gameplay**: Eliminates unlucky streaks of unwanted pieces

## Key Programming Principles

1. **Pure Functions**: Predictable, testable, no side effects
2. **Immutability**: Never modify input data, always return new objects
3. **Single Responsibility**: Each function has one clear purpose
4. **Type Safety**: TypeScript prevents many runtime errors
5. **Separation of Concerns**: UI, game logic, and state management are separate
6. **Defensive Programming**: Check for invalid states and handle gracefully