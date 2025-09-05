'use client';

import { TetrominoType } from '@/lib/tetris/types';
import { TETROMINO_COLORS } from '@/lib/tetris/constants';

interface BlockProps {
  type: TetrominoType | null;
  isGhost?: boolean;
  size?: number;
}

export function Block({ type, isGhost = false, size = 24 }: BlockProps) {
  if (!type) {
    return (
      <div 
        className="border border-blue-500/50" 
        style={{ 
          width: size, 
          height: size,
          backgroundColor: 'transparent'
        }} 
      />
    );
  }

  const colors = TETROMINO_COLORS[type];
  
  if (isGhost) {
    return (
      <div 
        className="border border-gray-400"
        style={{ 
          width: size, 
          height: size,
          backgroundColor: 'transparent',
          border: `1px solid ${colors.main}40`
        }} 
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: colors.main,
        position: 'relative',
        border: '1px solid #000'
      }}
    >
      {/* Highlight edge (top and left) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 2,
          height: 2,
          backgroundColor: colors.highlight
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 2,
          bottom: 2,
          backgroundColor: colors.highlight
        }}
      />
      
      {/* Shadow edge (bottom and right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 2,
          right: 0,
          height: 2,
          backgroundColor: colors.shadow
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 0,
          width: 2,
          bottom: 0,
          backgroundColor: colors.shadow
        }}
      />
    </div>
  );
}