'use client';

import { GameStats } from '@/lib/tetris/types';

interface ScorePanelProps {
  stats: GameStats;
}

export function ScorePanel({ stats }: ScorePanelProps) {
  return (
    <div className="p-4 bg-gray-900 border-2 border-yellow-400 space-y-4">
      <div>
        <h3 className="text-white text-center font-bold mb-2">SCORE</h3>
        <div className="text-white text-center text-xl font-mono">
          {stats.score.toLocaleString()}
        </div>
      </div>
      
      <div>
        <h3 className="text-white text-center font-bold mb-2">LEVEL</h3>
        <div className="text-white text-center text-2xl font-mono">
          {stats.level}
        </div>
      </div>
      
      <div>
        <h3 className="text-white text-center font-bold mb-2">LINES</h3>
        <div className="text-white text-center text-xl font-mono">
          {stats.lines}
        </div>
        <div className="text-gray-400 text-center text-sm">
          Next: {stats.linesUntilNext}
        </div>
      </div>
    </div>
  );
}