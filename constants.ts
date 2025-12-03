import { WorldConfig } from './types';

export const WORLDS: WorldConfig[] = [
  {
    id: 0,
    name: "Rainforest World 🌴",
    theme: "Taman Negara",
    description: "Trek through the ancient jungles of Taman Negara! Watch out for tigers.",
    minTable: 2,
    maxTable: 5,
    bgGradient: "from-green-400 to-emerald-700",
    primaryColor: "text-green-700",
    icon: "tree",
    badgeName: "Rainforest Explorer 🐒",
    bossName: "Rainforest Guardian",
    bossEmoji: "🐅",
    bossDescription: "The Tiger Spirit challenges you!",
  },
  {
    id: 1,
    name: "Ocean World 🌊",
    theme: "Pulau Redang",
    description: "Dive deep into the crystal waters of Pulau Redang. The sharks are hungry for math!",
    minTable: 6,
    maxTable: 8,
    bgGradient: "from-cyan-400 to-blue-700",
    primaryColor: "text-blue-700",
    icon: "waves",
    badgeName: "Ocean Diver 🐠",
    bossName: "Ocean Guardian",
    bossEmoji: "🦈",
    bossDescription: "The Shark Spirit circles around you!",
  },
  {
    id: 2,
    name: "Sky World ☁️",
    theme: "KL Tower",
    description: "Climb the Petronas Twin Towers and touch the clouds!",
    minTable: 9,
    maxTable: 10,
    bgGradient: "from-sky-300 to-indigo-500",
    primaryColor: "text-indigo-700",
    icon: "cloud",
    badgeName: "Sky Climber 🏙️",
    bossName: "Sky Guardian",
    bossEmoji: "🦅",
    bossDescription: "The Eagle Spirit soars above!",
  },
  {
    id: 3,
    name: "Galaxy World 🌌",
    theme: "Langkawi Spaceport",
    description: "Blast off from Langkawi into the cosmos!",
    minTable: 11,
    maxTable: 12,
    bgGradient: "from-purple-500 to-black",
    primaryColor: "text-purple-700",
    icon: "star",
    badgeName: "Galaxy Voyager 🚀",
    bossName: "Galaxy Guardian",
    bossEmoji: "🐉",
    bossDescription: "The Dragon Spirit guards the stars!",
  }
];

export const FINAL_BOSS = {
  name: "Ultimate Math Dragon",
  emoji: "🐉🔥",
  description: "The final challenge to become the Multiplication Master of Malaysia!",
  requiredCorrect: 4,
  totalQuestions: 5,
  badgeName: "Dragon Slayer 🐉⚔️",
  title: "Multiplication Master of Malaysia 👑"
};

export const QUESTIONS_PER_LEVEL = 10;
export const PASSING_SCORE_PER_LEVEL = 7; // 7 out of 10
export const BOSS_QUESTIONS_COUNT = 3;
export const POINTS_CORRECT = 10;
export const POINTS_SPEED_BONUS = 5;
export const SPEED_THRESHOLD_SEC = 5;