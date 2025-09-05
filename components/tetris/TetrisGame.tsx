'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TetrisGameState } from '@/lib/tetris/types';
import { createInitialGameState, resetGame, togglePause } from '@/lib/tetris/gameState';
import { 
  movePiece, 
  rotatePiece, 
  softDrop, 
  hardDrop, 
  holdPiece, 
  applyGravity, 
  updateLockDelay 
} from '@/lib/tetris/gameActions';
import { GameBoard } from './GameBoard';
import { NextPiece } from './NextPiece';
import { HoldPiece } from './HoldPiece';
import { ScorePanel } from './ScorePanel';

export function TetrisGame() {
  const [gameState, setGameState] = useState<TetrisGameState>(() => createInitialGameState());
  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const keyRepeatTimers = useRef<Map<string, number>>(new Map());

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setGameState(prevState => {
      if (prevState.gameState !== 'playing') return prevState;

      let newState = prevState;
      
      // Apply gravity
      newState = applyGravity(newState, deltaTime);
      
      // Update lock delay
      newState = updateLockDelay(newState, deltaTime);
      
      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.gameState === 'playing') {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameState, gameLoop]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.code;
    
    // Prevent default for game keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyZ', 'KeyX', 'KeyC', 'KeyP', 'KeyR'].includes(key)) {
      event.preventDefault();
    }

    // Ignore if key is already pressed (for non-repeating keys)
    if (keysPressed.current.has(key)) {
      return;
    }

    keysPressed.current.add(key);

    // Handle immediate actions
    switch (key) {
      case 'ArrowLeft':
        setGameState(prevState => movePiece(prevState, -1));
        // Set up repeat for movement
        keyRepeatTimers.current.set(key, window.setTimeout(() => {
          const repeatMovement = () => {
            setGameState(prevState => movePiece(prevState, -1));
            keyRepeatTimers.current.set(key, window.setTimeout(repeatMovement, 33)); // ~30fps repeat
          };
          repeatMovement();
        }, 167)); // Initial delay
        break;
      
      case 'ArrowRight':
        setGameState(prevState => movePiece(prevState, 1));
        // Set up repeat for movement
        keyRepeatTimers.current.set(key, window.setTimeout(() => {
          const repeatMovement = () => {
            setGameState(prevState => movePiece(prevState, 1));
            keyRepeatTimers.current.set(key, window.setTimeout(repeatMovement, 33)); // ~30fps repeat
          };
          repeatMovement();
        }, 167)); // Initial delay
        break;
      
      case 'ArrowDown':
        setGameState(prevState => softDrop(prevState));
        // Set up repeat for soft drop
        keyRepeatTimers.current.set(key, window.setTimeout(() => {
          const repeatDrop = () => {
            setGameState(prevState => softDrop(prevState));
            keyRepeatTimers.current.set(key, window.setTimeout(repeatDrop, 50)); // Faster repeat for soft drop
          };
          repeatDrop();
        }, 100));
        break;
      
      case 'ArrowUp':
      case 'Space':
        setGameState(prevState => hardDrop(prevState));
        break;
      
      case 'KeyZ': // Handles both 'z' and 'Z'
        setGameState(prevState => rotatePiece(prevState, -1));
        break;
      
      case 'KeyX': // Handles both 'x' and 'X'
        setGameState(prevState => rotatePiece(prevState, 1));
        break;
      
      case 'KeyC': // Handles both 'c' and 'C'
        setGameState(prevState => holdPiece(prevState));
        break;
      
      case 'KeyP': // Handles both 'p' and 'P'
        setGameState(prevState => togglePause(prevState));
        break;
      
      case 'KeyR': // Handles both 'r' and 'R'
        if (gameState.gameState === 'gameOver') {
          setGameState(resetGame());
        }
        break;
    }
  }, [gameState.gameState]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.code;
    keysPressed.current.delete(key);
    
    // Clear repeat timer
    const timer = keyRepeatTimers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      keyRepeatTimers.current.delete(key);
    }
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    const timers = keyRepeatTimers.current;
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Clear all timers
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, [handleKeyDown, handleKeyUp]);

  const renderGameOverlay = () => {
    switch (gameState.gameState) {
      case 'paused':
        return (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
              <p>Press P to resume</p>
            </div>
          </div>
        );
      
      case 'gameOver':
        return (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">GAME OVER</h2>
              <p className="mb-2">Final Score: {gameState.stats.score.toLocaleString()}</p>
              <p className="mb-2">Level: {gameState.stats.level}</p>
              <p className="mb-4">Lines: {gameState.stats.lines}</p>
              <p>Press R to restart</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="flex gap-6 relative">
        {/* Left Panel */}
        <div className="flex flex-col gap-4">
          <HoldPiece piece={gameState.holdPiece} canHold={gameState.canHold} />
          <ScorePanel stats={gameState.stats} />
        </div>

        {/* Game Board */}
        <div className="relative">
          <GameBoard 
            board={gameState.board} 
            activePiece={gameState.activePiece}
            ghostPiece={gameState.ghostPiece}
          />
          {renderGameOverlay()}
        </div>

        {/* Right Panel */}
        <div>
          <NextPiece pieces={gameState.nextQueue} />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 text-white text-center max-w-md">
        <h3 className="text-lg font-bold mb-4">CONTROLS</h3>
        <div className="text-sm space-y-1">
          <p><span className="font-mono">←→</span> Move • <span className="font-mono">↓</span> Soft Drop • <span className="font-mono">↑/Space</span> Hard Drop</p>
          <p><span className="font-mono">Z/z</span> Rotate CCW • <span className="font-mono">X/x</span> Rotate CW • <span className="font-mono">C/c</span> Hold</p>
          <p><span className="font-mono">P/p</span> Pause • <span className="font-mono">R/r</span> Restart (Game Over)</p>
          <p className="text-xs text-gray-400 mt-2">All letter keys work with or without Shift</p>
        </div>
      </div>
    </div>
  );
}