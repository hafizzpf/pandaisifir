export type GameState = 
  | 'MENU' 
  | 'WORLD_INTRO' 
  | 'PLAYING' 
  | 'LEVEL_COMPLETE' 
  | 'BOSS_INTRO' 
  | 'BOSS_BATTLE' 
  | 'BOSS_DEFEATED' 
  | 'GAME_OVER' 
  | 'VICTORY';

export interface Question {
  id: string;
  factorA: number;
  factorB: number;
  correctAnswer: number;
  options: number[];
}

export interface WorldConfig {
  id: number;
  name: string;
  theme: string;
  description: string;
  minTable: number;
  maxTable: number;
  bgGradient: string;
  primaryColor: string;
  icon: string;
  badgeName: string;
  bossName: string;
  bossEmoji: string;
  bossDescription: string;
}

export interface PlayerStats {
  score: number;
  badges: string[];
  currentWorldIndex: number;
}