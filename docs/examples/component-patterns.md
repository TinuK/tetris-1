# React Component Patterns - Annotated Examples

This document provides annotated examples of React patterns used in our Tetris game.

## 1. Basic Function Component with Props

```tsx
// File: components/tetris/Block.tsx

interface BlockProps {
  type: TetrominoType;        // ← TypeScript interface defines prop types
  isGhost?: boolean;          // ← Optional prop (? means optional)
}

export function Block({ type, isGhost = false }: BlockProps) {
  //                   ↑ Destructuring props with default value
  
  // Get color configuration from constants
  const colors = TETROMINO_COLORS[type];
  //    ↑ Accessing constant based on piece type
  
  if (isGhost) {
    // Render ghost piece (transparent preview)
    return (
      <div 
        className="w-6 h-6 border border-gray-400 border-opacity-50"
        //        ↑ Tailwind utility classes for styling
        style={{
          borderStyle: 'dashed',
          backgroundColor: 'transparent'
        }}
        //  ↑ Inline styles for ghost appearance
      />
    );
  }

  // Render solid block with 3D effect
  return (
    <div 
      className="w-6 h-6 border border-gray-800 relative"
      style={{ 
        backgroundColor: colors.main,
        //             ↑ Dynamic background color based on piece type
      }}
    >
      {/* Top highlight edge for 3D effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: colors.highlight }}
        //                          ↑ Lighter shade for highlight
      />
      
      {/* Left highlight edge */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-1"
        style={{ backgroundColor: colors.highlight }}
      />
      
      {/* Bottom shadow edge for 3D depth */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: colors.shadow }}
        //                          ↑ Darker shade for shadow
      />
      
      {/* Right shadow edge */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-1"
        style={{ backgroundColor: colors.shadow }}
      />
    </div>
  );
}
```

**Key Patterns:**
- **Props Interface**: TypeScript interface defines expected props
- **Destructuring**: Extract props with default values
- **Conditional Rendering**: Different JSX based on props
- **Dynamic Styling**: CSS properties calculated from data
- **Component Composition**: Building complex UI from simple elements

## 2. State Management with useState Hook

```tsx
// File: components/tetris/TetrisGame.tsx (simplified)

export function TetrisGame() {
  // Initialize game state with complex object
  const [gameState, setGameState] = useState<TetrisGameState>(() => 
    createInitialGameState()
    //    ↑ Lazy initialization - function only called once
  );
  
  // Simple boolean state for pause menu
  const [showControls, setShowControls] = useState(false);
  //     ↑ State variable    ↑ Setter function
  
  // Keyboard event handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    //                   ↑ useCallback prevents unnecessary re-renders
    
    // Prevent default browser behavior
    event.preventDefault();
    
    switch (event.code) {  // Using 'code' instead of 'key' for consistency
      case 'ArrowLeft':
        setGameState(prevState => 
          //          ↑ Function update pattern for complex state
          movePiece(prevState, -1)
          //        ↑ Pure function returns new state
        );
        break;
        
      case 'ArrowRight':
        setGameState(prevState => movePiece(prevState, 1));
        break;
        
      case 'KeyP':  // Both 'P' and 'p' handled by code
      case 'KeyP':
        setGameState(prevState => togglePause(prevState));
        break;
        
      case 'KeyC':  // Hold piece
        setGameState(prevState => holdPiece(prevState));
        break;
    }
  }, []); // Empty dependency array - function never changes
  
  // Effect for keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup function - removes event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]); // Re-run if handleKeyPress changes
  
  return (
    <div className="tetris-game">
      {/* Conditional rendering of pause overlay */}
      {gameState.gameState === 'paused' && (
        <div className="pause-overlay">
          <h2>Game Paused</h2>
          <p>Press P to resume</p>
        </div>
      )}
      
      {/* Game board component with state passed as props */}
      <GameBoard 
        board={gameState.board}
        activePiece={gameState.activePiece}
        ghostPiece={gameState.ghostPiece}
      />
    </div>
  );
}
```

**Key Patterns:**
- **useState**: Managing component state
- **Lazy Initialization**: Expensive initial state calculation
- **Function Updates**: Using previous state to calculate new state
- **useCallback**: Performance optimization for event handlers
- **useEffect**: Side effects and cleanup
- **Conditional JSX**: Show/hide elements based on state

## 3. Game Loop with useEffect

```tsx
// File: components/tetris/TetrisGame.tsx (game loop section)

export function TetrisGame() {
  const [gameState, setGameState] = useState<TetrisGameState>(() => 
    createInitialGameState()
  );
  
  // Game loop effect - runs when game state changes
  useEffect(() => {
    // Only run game loop when actively playing
    if (gameState.gameState !== 'playing') return;
    
    let animationFrameId: number;  // Store request ID for cleanup
    let lastTime = 0;              // Track time for delta calculation
    
    const gameLoop = (currentTime: number) => {
      // Calculate time elapsed since last frame
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update game state based on time passed
      setGameState(prevState => {
        // Apply gravity (piece falling)
        let newState = applyGravity(prevState, deltaTime);
        //             ↑ Pure function processes time-based movement
        
        // Handle lock delay (when piece can't fall)
        newState = updateLockDelay(newState, deltaTime);
        //         ↑ Another pure function for lock timing
        
        return newState;
      });
      
      // Schedule next frame
      animationFrameId = requestAnimationFrame(gameLoop);
      //                 ↑ Browser API for smooth 60fps animation
    };
    
    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);
    
    // Cleanup function - stops the game loop
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        //↑ Important: prevent memory leaks
      }
    };
  }, [gameState.gameState]); // Re-run when game state (playing/paused) changes
  
  return (
    <div className="tetris-game">
      {/* Game UI components */}
    </div>
  );
}
```

**Key Patterns:**
- **requestAnimationFrame**: Smooth game loop at 60fps
- **Delta Time**: Frame-rate independent game logic
- **Effect Cleanup**: Prevent memory leaks and unwanted side effects
- **Dependency Array**: Control when effects run
- **State Batching**: Multiple state updates in single frame

## 4. Pure Functions for Game Logic

```tsx
// File: lib/tetris/gameLogic.ts

// Pure function - no side effects, same input always gives same output
export function isValidPosition(
  board: GameBoard,
  piece: ActivePiece,
  offset: Position = { x: 0, y: 0 }
): boolean {
  // Get all block positions for the piece
  const blocks = getPieceBlocks(piece);
  //             ↑ Another pure function
  
  // Check each block position
  for (const block of blocks) {
    const newX = block.x + offset.x;
    const newY = block.y + offset.y;
    
    // Check boundaries
    if (newX < 0 || newX >= board.width) return false;
    if (newY < 0) return false;  // Allow going above visible area
    
    // Check collision with existing blocks
    if (newY < board.height && board.grid[newY][newX] !== null) {
      return false;  // Position is occupied
    }
  }
  
  return true;  // All positions are valid
}

// Pure function for calculating piece positions
export function getPieceBlocks(piece: ActivePiece): Position[] {
  // Get piece shape from constants
  const shape = TETROMINO_SHAPES[piece.type][piece.rotation];
  //            ↑ Look up shape based on type and rotation
  
  const blocks: Position[] = [];
  
  // Convert 2D shape array to absolute positions
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {  // 1 means block exists
        blocks.push({
          x: piece.position.x + col,
          y: piece.position.y + (shape.length - 1 - row)
          //                     ↑ Invert Y because our coordinate system
          //                       has Y=0 at bottom, arrays start at top
        });
      }
    }
  }
  
  return blocks;
}

// Pure function for line clearing
export function clearLines(
  board: GameBoard, 
  completedLines: number[]
): GameBoard {
  if (completedLines.length === 0) return board;
  
  // Create new grid (don't modify original)
  const newGrid = board.grid.map(row => [...row]);  // Deep copy
  //                                   ↑ Spread operator copies array
  
  // Remove completed lines (from bottom to top to preserve indices)
  const sortedLines = [...completedLines].sort((a, b) => b - a);
  //                  ↑ Copy array before sorting
  
  for (const lineIndex of sortedLines) {
    newGrid.splice(lineIndex, 1);  // Remove line
    newGrid.push(new Array(board.width).fill(null));  // Add empty line at top
  }
  
  return {
    ...board,      // Copy board properties
    grid: newGrid  // Use new grid
  };
}
```

**Key Patterns:**
- **Pure Functions**: No side effects, predictable output
- **Immutability**: Never modify input parameters
- **Array Methods**: map, filter, reduce for data transformation
- **Spread Operator**: Copy objects and arrays
- **Type Safety**: TypeScript ensures correct parameter types

## 5. Custom Hook Pattern (Advanced)

```tsx
// File: hooks/useGameLoop.ts (hypothetical custom hook)

export function useGameLoop(
  gameState: TetrisGameState,
  onUpdate: (deltaTime: number) => void
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      onUpdate(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [onUpdate]);
  
  useEffect(() => {
    if (gameState.gameState === 'playing') {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [gameState.gameState, animate]);
}

// Usage in component:
export function TetrisGame() {
  const [gameState, setGameState] = useState(createInitialGameState);
  
  const handleGameUpdate = useCallback((deltaTime: number) => {
    setGameState(prevState => {
      let newState = applyGravity(prevState, deltaTime);
      newState = updateLockDelay(newState, deltaTime);
      return newState;
    });
  }, []);
  
  useGameLoop(gameState, handleGameUpdate);
  
  return <div>{/* Game UI */}</div>;
}
```

**Key Patterns:**
- **Custom Hooks**: Extract reusable stateful logic
- **useRef**: Persist values across renders without triggering re-renders
- **Hook Composition**: Combine multiple hooks for complex behavior

## Common Patterns Summary

1. **Component Props**: Define interfaces, use destructuring, provide defaults
2. **State Management**: Use useState for local state, prefer function updates
3. **Side Effects**: Use useEffect for DOM interactions, event listeners, timers
4. **Performance**: Use useCallback/useMemo to prevent unnecessary re-renders
5. **Pure Functions**: Keep business logic separate from UI, enable easy testing
6. **Immutability**: Always create new objects/arrays instead of modifying existing ones
7. **TypeScript**: Use interfaces and types for better development experience