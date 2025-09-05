# Next.js Beginners Guide for Tetris Project

This guide helps Next.js beginners understand the concepts and patterns used in our Tetris project.

## Table of Contents
1. [What is Next.js?](#what-is-nextjs)
2. [Project Structure](#project-structure)
3. [App Router Architecture](#app-router-architecture)
4. [TypeScript Basics](#typescript-basics)
5. [React Components](#react-components)
6. [State Management](#state-management)
7. [Styling with Tailwind CSS](#styling-with-tailwind-css)
8. [Understanding Our Tetris Code](#understanding-our-tetris-code)

## What is Next.js?

Next.js is a React framework that provides additional features to make building web applications easier:

- **Server-Side Rendering (SSR)**: Pages can be rendered on the server before sending to the browser
- **App Router**: A new way to organize pages and layouts (we use this!)
- **Built-in Optimization**: Automatic code splitting, image optimization, and more
- **TypeScript Support**: Built-in TypeScript support for better development experience

## Project Structure

Our Tetris project follows Next.js 15 App Router conventions:

```
tetris-1/
├── app/                    # App Router pages and layouts
│   ├── layout.tsx         # Root layout (wraps all pages)
│   ├── page.tsx           # Home page (our game)
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   └── tetris/           # Tetris-specific components
│       ├── TetrisGame.tsx # Main game component
│       ├── GameBoard.tsx  # Game board grid
│       ├── Block.tsx      # Individual block rendering
│       └── ...
├── lib/                  # Utility functions and game logic
│   └── tetris/          # Tetris game logic
│       ├── types.ts     # TypeScript type definitions
│       ├── constants.ts # Game constants
│       ├── gameLogic.ts # Core game mechanics
│       └── ...
└── docs/                # Documentation
```

### Why This Structure?

- **`app/`**: Next.js 15 uses this for routing. Each folder becomes a URL path
- **`components/`**: Reusable UI pieces that can be used anywhere
- **`lib/`**: Business logic separated from UI components
- **`docs/`**: Project documentation (like this guide!)

## App Router Architecture

### Pages and Routes

In Next.js App Router:

- **`app/page.tsx`** = Homepage (/)
- **`app/about/page.tsx`** = /about page
- **`app/game/page.tsx`** = /game page

Our Tetris game lives on the homepage (`app/page.tsx`).

### Layouts

**`app/layout.tsx`** wraps every page in your app:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}  {/* This is where page content goes */}
      </body>
    </html>
  )
}
```

## TypeScript Basics

TypeScript adds types to JavaScript to catch errors early:

### Basic Types
```tsx
// String, number, boolean
const playerName: string = "Player1";
const score: number = 1000;
const gameOver: boolean = false;

// Arrays
const pieces: string[] = ["I", "J", "L", "O"];
const numbers: number[] = [1, 2, 3, 4];
```

### Interfaces (Custom Types)
```tsx
// Define the shape of an object
interface Position {
  x: number;
  y: number;
}

// Use it
const piecePosition: Position = { x: 5, y: 10 };
```

### Our Tetris Types
We define all our game types in `lib/tetris/types.ts`:

```tsx
export interface ActivePiece {
  type: TetrominoType;      // Which piece (I, J, L, O, S, Z, T)
  position: Position;       // Where it is on the board
  rotation: RotationState;  // How it's rotated
  lockDelay: number;        // Time until it locks in place
  moveResets: number;       // How many times it reset lock delay
}
```

## React Components

React components are functions that return JSX (HTML-like syntax):

### Function Component
```tsx
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

### Component with Props
```tsx
interface GreetingProps {
  name: string;
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="Player" />
```

### Our Block Component Example
```tsx
interface BlockProps {
  type: TetrominoType;
  isGhost?: boolean;
}

export function Block({ type, isGhost = false }: BlockProps) {
  const colors = TETROMINO_COLORS[type];
  
  return (
    <div 
      className={`block ${isGhost ? 'ghost' : ''}`}
      style={{ 
        backgroundColor: isGhost ? 'transparent' : colors.main 
      }}
    />
  );
}
```

## State Management

React uses "state" to store data that can change:

### useState Hook
```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // Initial value: 0
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Our Game State
Our Tetris game uses complex state:

```tsx
const [gameState, setGameState] = useState<TetrisGameState>(() => 
  createInitialGameState()
);
```

The game state includes:
- Board grid (40x10 array)
- Active piece position and rotation
- Score, level, lines cleared
- Next pieces queue
- Hold piece
- Game status (playing, paused, game over)

### useEffect Hook
Runs code when component mounts or when dependencies change:

```tsx
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component mounted!');
  
  // Cleanup function (runs when component unmounts)
  return () => {
    console.log('Component unmounted!');
  };
}, []); // Empty array = run once on mount
```

### Our Game Loop
We use `useEffect` for the game loop:

```tsx
useEffect(() => {
  if (gameState.gameState !== 'playing') return;

  let animationFrameId: number;
  let lastTime = 0;

  const gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update game logic with time delta
    setGameState(prevState => {
      let newState = applyGravity(prevState, deltaTime);
      newState = updateLockDelay(newState, deltaTime);
      return newState;
    });

    animationFrameId = requestAnimationFrame(gameLoop);
  };

  animationFrameId = requestAnimationFrame(gameLoop);

  return () => cancelAnimationFrame(animationFrameId);
}, [gameState.gameState]);
```

## Styling with Tailwind CSS

Tailwind CSS uses utility classes instead of custom CSS:

### Basic Classes
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Blue background, white text, padding, rounded corners
</div>
```

### Common Patterns
- `bg-color-number`: Background colors
- `text-color-number`: Text colors
- `p-number`: Padding
- `m-number`: Margin
- `w-number`, `h-number`: Width and height
- `flex`, `grid`: Layout systems

### Our Game Board Styling
```tsx
<div className="bg-gray-900 p-4 border-4 border-yellow-400">
  {/* Dark background, padding, yellow border */}
</div>
```

## Understanding Our Tetris Code

### File Organization

1. **`lib/tetris/types.ts`**: Defines all TypeScript interfaces
2. **`lib/tetris/constants.ts`**: Game constants (pieces, colors, speeds)
3. **`lib/tetris/gameLogic.ts`**: Pure functions for game mechanics
4. **`lib/tetris/gameActions.ts`**: Player action functions
5. **`lib/tetris/gameState.ts`**: State management utilities
6. **`components/tetris/`**: React components for UI

### Data Flow

1. **User Input** → Keyboard event in `TetrisGame.tsx`
2. **Action** → Call function from `gameActions.ts`
3. **Logic** → Use functions from `gameLogic.ts`
4. **State Update** → Update game state
5. **Re-render** → Components show new state

### Example: Moving a Piece

1. User presses left arrow
2. `TetrisGame.tsx` catches keydown event
3. Calls `movePiece(gameState, -1)`
4. `movePiece` checks if move is valid using `isValidPosition`
5. If valid, returns new state with updated piece position
6. `setGameState` triggers re-render
7. `GameBoard` shows piece in new position

### Key Concepts

**Pure Functions**: Functions that don't modify inputs, just return new values
```tsx
// Good: Pure function
function movePiece(gameState: TetrisGameState, direction: number): TetrisGameState {
  return { ...gameState, activePiece: newPiece };
}

// Bad: Modifies input
function movePiece(gameState: TetrisGameState, direction: number) {
  gameState.activePiece.position.x += direction; // Don't do this!
}
```

**Immutability**: Always create new objects instead of modifying existing ones
```tsx
// Good: Create new object
const newPiece = { ...oldPiece, position: { x: newX, y: newY } };

// Bad: Modify existing object
oldPiece.position.x = newX; // Don't do this!
```

**Separation of Concerns**: 
- UI components only handle display and user interaction
- Game logic functions only handle game rules
- State management keeps everything in sync

## Next Steps

1. **Explore the code**: Start with `components/tetris/TetrisGame.tsx`
2. **Modify something small**: Try changing a color in `constants.ts`
3. **Add a feature**: Maybe a pause button or score display
4. **Learn more React**: Official React docs at react.dev
5. **Learn more Next.js**: Official Next.js docs at nextjs.org

## Common Beginner Questions

**Q: Why so many files?**
A: Separating code into logical files makes it easier to find, test, and modify specific features.

**Q: What's with all the `{ }` and `...` syntax?**
A: These are JavaScript/TypeScript features for destructuring and spreading objects/arrays.

**Q: Why TypeScript instead of JavaScript?**
A: TypeScript catches errors before your code runs and makes it easier to understand what data looks like.

**Q: How does the game loop work?**
A: `requestAnimationFrame` calls our function 60 times per second, each time we update the game state based on how much time passed.

**Q: Where should I start if I want to modify the game?**
A: Start with `constants.ts` to change colors or speeds, then try modifying component JSX to change the appearance.

---

*This guide covers the basics you need to understand our Tetris project. Don't worry if it seems overwhelming at first - start small and gradually explore more complex concepts!*