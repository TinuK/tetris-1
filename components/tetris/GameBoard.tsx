'use client';

import { GameBoard as GameBoardType, ActivePiece, Position } from '@/lib/tetris/types';
import { Block } from './Block';
import { getPieceBlocks } from '@/lib/tetris/gameLogic';
import { VISIBLE_HEIGHT } from '@/lib/tetris/constants';

interface GameBoardProps {
  board: GameBoardType;
  activePiece: ActivePiece | null;
  ghostPiece: Position[] | null;
}

export function GameBoard({ board, activePiece, ghostPiece }: GameBoardProps) {
  const blockSize = 24;
  
  // Get active piece positions
  const activePieceBlocks = activePiece ? getPieceBlocks(activePiece) : [];
  
  // Create a map for quick lookup of active piece blocks
  const activePieceMap = new Set(
    activePieceBlocks.map(pos => `${pos.x},${pos.y}`)
  );
  
  // Create a map for ghost piece blocks
  const ghostPieceMap = new Set(
    (ghostPiece || []).map(pos => `${pos.x},${pos.y}`)
  );

  // Render only visible rows (0-19, but we need to flip the y-axis)
  const visibleRows = [];
  for (let row = VISIBLE_HEIGHT - 1; row >= 0; row--) {
    const cells = [];
    for (let col = 0; col < board.width; col++) {
      const key = `${col},${row}`;
      const isActivePiece = activePieceMap.has(key);
      const isGhostPiece = ghostPieceMap.has(key) && !isActivePiece;
      
      let cellType = board.grid[row][col];
      
      if (isActivePiece && activePiece) {
        cellType = activePiece.type;
      }
      
      cells.push(
        <Block 
          key={`${col}-${row}`}
          type={cellType}
          isGhost={isGhostPiece}
          size={blockSize}
        />
      );
    }
    visibleRows.push(
      <div key={row} className="flex">
        {cells}
      </div>
    );
  }

  return (
    <div 
      className="border-4 border-yellow-400 bg-gray-900"
      style={{
        width: board.width * blockSize + 8,
        height: VISIBLE_HEIGHT * blockSize + 8,
        padding: 4,
        position: 'relative'
      }}
    >
      {/* Grid lines */}
      <div 
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          backgroundImage: `
            linear-gradient(to right, #0066ff 1px, transparent 1px),
            linear-gradient(to bottom, #0066ff 1px, transparent 1px)
          `,
          backgroundSize: `${blockSize}px ${blockSize}px`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      
      {/* Game blocks */}
      <div className="relative z-10">
        {visibleRows}
      </div>
    </div>
  );
}