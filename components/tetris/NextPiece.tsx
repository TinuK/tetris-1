'use client';

import { TetrominoType } from '@/lib/tetris/types';
import { Block } from './Block';
import { TETROMINO_SHAPES } from '@/lib/tetris/constants';

interface NextPieceProps {
  pieces: TetrominoType[];
  title?: string;
}

export function NextPiece({ pieces, title = "NEXT" }: NextPieceProps) {
  const blockSize = 16;

  const renderPiece = (pieceType: TetrominoType, index: number) => {
    const shape = TETROMINO_SHAPES[pieceType][0]; // Always use spawn rotation
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
                top: row * blockSize
              }}
            >
              <Block type={pieceType} size={blockSize} />
            </div>
          );
        }
      }
    }

    return (
      <div
        key={index}
        className={`relative bg-gray-800 border border-gray-600 ${index === 0 ? 'mb-4' : 'mb-2'}`}
        style={{
          width: 4 * blockSize + 8,
          height: 4 * blockSize + 8,
          padding: 4
        }}
      >
        {blocks}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-900 border-2 border-yellow-400">
      <h3 className="text-white text-center font-bold mb-2">{title}</h3>
      {pieces.slice(0, 3).map((piece, index) => renderPiece(piece, index))}
    </div>
  );
}