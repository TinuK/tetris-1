'use client';

import { TetrominoType } from '@/lib/tetris/types';
import { Block } from './Block';
import { TETROMINO_SHAPES } from '@/lib/tetris/constants';

interface HoldPieceProps {
  piece: TetrominoType | null;
  canHold: boolean;
}

export function HoldPiece({ piece, canHold }: HoldPieceProps) {
  const blockSize = 16;

  const renderPiece = () => {
    if (!piece) return null;

    const shape = TETROMINO_SHAPES[piece][0]; // Always use spawn rotation
    const blocks = [];
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          blocks.push(
            <div
              key={`${row}-${col}`}
              style={{
                position: 'absolute',
                left: col * blockSize,
                top: row * blockSize,
                opacity: canHold ? 1 : 0.5
              }}
            >
              <Block type={piece} size={blockSize} />
            </div>
          );
        }
      }
    }

    return blocks;
  };

  return (
    <div className="p-4 bg-gray-900 border-2 border-yellow-400 mb-4">
      <h3 className="text-white text-center font-bold mb-2">HOLD</h3>
      <div
        className="relative bg-gray-800 border border-gray-600"
        style={{
          width: 4 * blockSize + 8,
          height: 4 * blockSize + 8,
          padding: 4
        }}
      >
        {renderPiece()}
      </div>
      {!canHold && (
        <div className="text-center text-red-400 text-xs mt-1">
          LOCKED
        </div>
      )}
    </div>
  );
}