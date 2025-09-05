# Project File Structure Documentation

This document provides a comprehensive overview of our Tetris project's file organization and architecture.

## 📁 Complete File Tree

```
tetris-1/
├── 📄 README.md                           # Project overview and setup instructions
├── 📄 CLAUDE.md                          # Claude Code assistant configuration
├── 📄 TETRIS_SPEC.md                     # Complete Tetris game specification
├── 📄 package.json                       # Node.js dependencies and scripts
├── 📄 package-lock.json                  # Locked dependency versions
├── 📄 next.config.ts                     # Next.js configuration
├── 📄 tsconfig.json                      # TypeScript configuration
├── 📄 tailwind.config.ts                 # Tailwind CSS configuration
├── 📄 eslint.config.mjs                  # ESLint linting configuration
├── 📄 postcss.config.mjs                 # PostCSS configuration
│
├── 📁 app/                               # Next.js 15 App Router
│   ├── 📄 layout.tsx                    # Root layout component
│   ├── 📄 page.tsx                      # Homepage (main game)
│   ├── 📄 globals.css                   # Global styles and Tailwind imports
│   └── 📄 favicon.ico                   # Website icon
│
├── 📁 components/                        # Reusable React components
│   └── 📁 tetris/                       # Tetris-specific UI components
│       ├── 📄 TetrisGame.tsx            # Main game orchestrator component
│       ├── 📄 GameBoard.tsx             # 10x20 game board grid
│       ├── 📄 Block.tsx                 # Individual tetromino block with 3D styling
│       ├── 📄 NextPiece.tsx             # Next pieces preview queue
│       ├── 📄 HoldPiece.tsx             # Hold piece display
│       ├── 📄 ScorePanel.tsx            # Score, level, lines display
│       └── 📄 Controls.tsx              # Control instructions display
│
├── 📁 lib/                              # Business logic and utilities
│   └── 📁 tetris/                       # Tetris game logic modules
│       ├── 📄 types.ts                  # TypeScript type definitions
│       ├── 📄 constants.ts              # Game constants and configurations
│       ├── 📄 gameLogic.ts              # Core game mechanics (pure functions)
│       ├── 📄 gameActions.ts            # Player action handlers
│       └── 📄 gameState.ts              # Game state management utilities
│
├── 📁 docs/                             # Project documentation
│   ├── 📄 arc42-documentation.md        # Complete Arc42 software architecture
│   ├── 📄 nextjs-beginners-guide.md    # Next.js concepts for beginners
│   ├── 📄 file-structure.md            # This file - project organization
│   │
│   ├── 📁 diagrams/                     # Architecture diagrams
│   │   ├── 📄 system-context.md         # System context diagram
│   │   ├── 📄 component-architecture.md  # Component relationships
│   │   ├── 📄 data-flow.md              # Data flow patterns
│   │   └── 📄 game-mechanics.md         # Game mechanics diagrams
│   │
│   └── 📁 examples/                     # Annotated code examples
│       ├── 📄 component-patterns.md     # React component patterns
│       └── 📄 game-logic-examples.md    # Game logic deep dives
│
└── 📁 .next/                           # Next.js build output (auto-generated)
```

## 🏗️ Architecture Overview

### Layer 1: Framework (Next.js App Router)
- **`app/`** - Next.js 15 routing and page structure
- **`layout.tsx`** - Global layout wrapper for all pages
- **`page.tsx`** - Homepage containing the Tetris game

### Layer 2: UI Components (React)
- **`components/tetris/`** - React components for game presentation
- Each component has a single responsibility (Block, GameBoard, etc.)
- Components are pure presentation - no game logic

### Layer 3: Business Logic (Pure Functions)
- **`lib/tetris/`** - Game mechanics and state management
- Pure functions enable easy testing and predictable behavior
- Separated from UI for better maintainability

### Layer 4: Documentation
- **`docs/`** - Comprehensive project documentation
- Includes architecture, examples, and beginner guides

## 📋 File Responsibilities

### Configuration Files

| File | Purpose | Key Contents |
|------|---------|--------------|
| `package.json` | Node.js project configuration | Dependencies, scripts, project metadata |
| `next.config.ts` | Next.js configuration | Build settings, Turbopack enable |
| `tsconfig.json` | TypeScript configuration | Compiler options, path mapping |
| `tailwind.config.ts` | Tailwind CSS configuration | Theme, utilities, responsive breakpoints |
| `eslint.config.mjs` | Code quality rules | Linting rules for code consistency |

### Application Files

| File | Purpose | Key Contents |
|------|---------|--------------|
| `app/layout.tsx` | Root layout component | HTML structure, global providers |
| `app/page.tsx` | Homepage | Main game container |
| `app/globals.css` | Global styles | Tailwind imports, custom CSS |

### UI Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `TetrisGame.tsx` | Game orchestrator | Keyboard handling, game loop, state management |
| `GameBoard.tsx` | Game field display | 10x20 grid, piece rendering, ghost piece |
| `Block.tsx` | Individual block | 3D beveled styling, type-based coloring |
| `NextPiece.tsx` | Next pieces queue | Preview upcoming pieces |
| `HoldPiece.tsx` | Hold piece display | Show currently held piece |
| `ScorePanel.tsx` | Game statistics | Score, level, lines cleared |
| `Controls.tsx` | Instructions | Control scheme display |

### Game Logic

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `types.ts` | Type definitions | Interfaces for game objects |
| `constants.ts` | Game constants | Piece shapes, colors, speeds, scoring |
| `gameLogic.ts` | Core mechanics | Collision detection, rotation, line clearing |
| `gameActions.ts` | Player actions | Move, rotate, drop, hold handlers |
| `gameState.ts` | State management | Create, reset, update game state |

## 🔄 Data Flow Architecture

```
User Input → TetrisGame → GameActions → GameLogic → New State → UI Update
    ↑                                                              ↓
    └────────────────── Visual Feedback ←─────────────────────────┘
```

## 📦 Module Dependencies

### Import Patterns

```typescript
// UI Components import from:
import { GameLogic } from '../lib/tetris/gameActions'
import { Types } from '../lib/tetris/types'

// Game Actions import from:
import { GameLogic } from './gameLogic'
import { GameState } from './gameState'
import { Constants } from './constants'

// Game Logic imports from:
import { Types } from './types'
import { Constants } from './constants'
```

### Dependency Rules
1. **UI → Actions → Logic**: UI calls actions, actions use logic
2. **No Circular Dependencies**: Clear hierarchical structure
3. **Pure Functions**: Logic modules have no side effects
4. **Type Safety**: All modules use shared type definitions

## 🎯 Design Principles

### File Organization
- **Feature-based grouping**: Related files in same directory
- **Layer separation**: UI, logic, and types in different modules
- **Single responsibility**: Each file has one clear purpose
- **Clear naming**: File names reflect their content and purpose

### Code Architecture
- **Immutable updates**: All state changes create new objects
- **Pure functions**: Business logic has no side effects
- **Separation of concerns**: UI, state, and logic are separate
- **Type safety**: TypeScript interfaces prevent runtime errors

### Documentation Strategy
- **Multiple formats**: Reference docs, tutorials, examples
- **Visual aids**: Diagrams for complex concepts
- **Progressive complexity**: Beginner to advanced explanations
- **Code annotations**: Inline explanations in examples

## 🚀 Adding New Features

### To add a new UI component:
1. Create file in `components/tetris/`
2. Define TypeScript interface for props
3. Import and use in parent component
4. Add to documentation

### To add new game mechanics:
1. Define types in `lib/tetris/types.ts`
2. Add constants to `lib/tetris/constants.ts`
3. Implement logic in `lib/tetris/gameLogic.ts`
4. Add action handler in `lib/tetris/gameActions.ts`
5. Update tests and documentation

### To add new documentation:
1. Create markdown file in appropriate `docs/` subdirectory
2. Include diagrams using Mermaid syntax
3. Add to table of contents in main documentation
4. Cross-reference related sections

## 🔍 Navigation Guide

### For Beginners:
1. Start with `docs/nextjs-beginners-guide.md`
2. Read `TETRIS_SPEC.md` for game requirements
3. Explore `components/tetris/` for UI examples
4. Review `docs/examples/` for code patterns

### For Developers:
1. Check `CLAUDE.md` for development setup
2. Review `docs/arc42-documentation.md` for architecture
3. Study `lib/tetris/` for business logic
4. Examine `docs/diagrams/` for system design

### For Contributors:
1. Follow patterns in existing code
2. Add tests for new functionality
3. Update documentation for changes
4. Maintain type safety and immutability

---

*This file structure follows Next.js 15 conventions and modern React best practices for maintainable, scalable applications.*