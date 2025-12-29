import { Question } from '../types';

export const generateQuestion = (minTable: number, maxTable: number, difficulty: 'normal' | 'hard' = 'normal'): Question => {
  const factorA = Math.floor(Math.random() * (maxTable - minTable + 1)) + minTable;
  // For normal gameplay, Y is 1-12. For hard/boss, stick to standard or slightly harder ranges if needed, 
  // but the prompt specifies Y is 1-12.
  const factorB = Math.floor(Math.random() * 12) + 1;
  
  const correctAnswer = factorA * factorB;
  
  const options = new Set<number>();
  options.add(correctAnswer);

  while (options.size < 4) {
    let wrongAnswer;
    const strategy = Math.random();

    if (strategy < 0.3) {
      // Close number (answer +/- 1 to 5)
      const offset = Math.floor(Math.random() * 5) + 1;
      wrongAnswer = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
    } else if (strategy < 0.6) {
      // Common mistake (off by one factor)
      const offsetFactor = Math.random() > 0.5 ? 1 : -1;
      wrongAnswer = factorA * (factorB + offsetFactor);
    } else {
      // Random plausible number in range
      wrongAnswer = (Math.floor(Math.random() * (maxTable - minTable + 1)) + minTable) * (Math.floor(Math.random() * 12) + 1);
    }

    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    factorA,
    factorB,
    correctAnswer,
    options: Array.from(options).sort(() => Math.random() - 0.5)
  };
};

export const generateQuestionSet = (count: number, minTable: number, maxTable: number, difficulty: 'normal' | 'hard' = 'normal'): Question[] => {
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateQuestion(minTable, maxTable, difficulty));
  }
  return questions;
};

// Final boss mixes all tables 2-12
export const generateFinalBossSet = (count: number): Question[] => {
  return generateQuestionSet(count, 2, 12, 'hard');
};