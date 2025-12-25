import React, { useState, useEffect, useRef } from 'react';
import { Play, Map as MapIcon, Star, Shield, Trophy, RotateCcw, Volume2, VolumeX, ArrowRight, Heart } from 'lucide-react';
import { WORLDS, FINAL_BOSS, QUESTIONS_PER_LEVEL, PASSING_SCORE_PER_LEVEL, BOSS_QUESTIONS_COUNT, POINTS_CORRECT, POINTS_SPEED_BONUS, SPEED_THRESHOLD_SEC } from './constants';
import { GameState, Question, PlayerStats } from './types';
import { generateQuestionSet, generateFinalBossSet } from './utils/math';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { BadgeDisplay } from './components/BadgeDisplay';
import { initAudio, setMute, playClick, playCorrect, playWrong, playWin, playBossHit, playGameOver, playLevelUp } from './utils/audio';

const App: React.FC = () => {
  // State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [stats, setStats] = useState<PlayerStats>({ score: 0, badges: [], currentWorldIndex: 0 });
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [levelCorrectCount, setLevelCorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState<{ show: boolean, isCorrect: boolean, message: string, correctAnswer?: number } | null>(null);
  const [bossHealth, setBossHealth] = useState(100);
  const [isFinalBoss, setIsFinalBoss] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Derived State
  const currentWorld = WORLDS[stats.currentWorldIndex];
  const isLastWorld = stats.currentWorldIndex === WORLDS.length - 1;

  useEffect(() => {
    setMute(!soundEnabled);
  }, [soundEnabled]);

  // --- Game Loop Helpers ---

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(0);
    timerRef.current = window.setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startGame = () => {
    initAudio();
    playClick();
    setStats({ score: 0, badges: [], currentWorldIndex: 0 });
    setGameState('WORLD_INTRO');
  };

  const startLevel = () => {
    playClick();
    const questions = generateQuestionSet(QUESTIONS_PER_LEVEL, currentWorld.minTable, currentWorld.maxTable);
    setCurrentQuestions(questions);
    setCurrentQIndex(0);
    setLevelCorrectCount(0);
    setIsFinalBoss(false);
    setGameState('PLAYING');
    startTimer();
  };

  const startBoss = (isFinal: boolean) => {
    playBossHit(); // Intro sound effect
    setIsFinalBoss(isFinal);
    let questions;
    if (isFinal) {
        questions = generateFinalBossSet(FINAL_BOSS.totalQuestions);
    } else {
        questions = generateQuestionSet(BOSS_QUESTIONS_COUNT, currentWorld.minTable, currentWorld.maxTable, 'hard');
    }
    setCurrentQuestions(questions);
    setCurrentQIndex(0);
    setLevelCorrectCount(0);
    setBossHealth(100);
    setGameState('BOSS_BATTLE');
    startTimer();
  };

  const handleAnswer = (selectedOption: number) => {
    stopTimer();
    const currentQ = currentQuestions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    const isSpeedy = timer <= SPEED_THRESHOLD_SEC;

    let points = 0;
    if (isCorrect) {
      playCorrect();
      
      points = POINTS_CORRECT + (isSpeedy ? POINTS_SPEED_BONUS : 0);
      setStats(prev => ({ ...prev, score: prev.score + points }));
      setLevelCorrectCount(prev => prev + 1);
      
      // Boss Damage Logic
      if (gameState === 'BOSS_BATTLE') {
        setTimeout(() => playBossHit(), 200); // Delayed impact sound
        const damagePerHit = 100 / currentQuestions.length;
        setBossHealth(prev => Math.max(0, prev - damagePerHit));
      }
    } else {
      playWrong();
    }

    const messages = {
      correct: ["Awesome! 🎉", "You're a Math Wizard! 🧙‍♂️", "Correct! ⭐", "Superb! 🚀", "Fantastic! 🌟"],
      wrong: ["Oops! Try to remember this one.", "Not quite, but keep going!", "Close one! 🐢", "Don't give up! 💪"]
    };
    
    const randomMsg = isCorrect 
      ? messages.correct[Math.floor(Math.random() * messages.correct.length)]
      : messages.wrong[Math.floor(Math.random() * messages.wrong.length)];

    setFeedback({
      show: true,
      isCorrect,
      message: randomMsg,
      correctAnswer: currentQ.correctAnswer
    });
  };

  const nextQuestion = () => {
    setFeedback(null);
    playClick();
    
    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      startTimer();
    } else {
      // End of queue
      handlePhaseCompletion();
    }
  };

  const handlePhaseCompletion = () => {
    if (gameState === 'PLAYING') {
      // Level Playing Complete
      if (levelCorrectCount >= PASSING_SCORE_PER_LEVEL) {
        playLevelUp();
        setGameState('LEVEL_COMPLETE'); // Success, ready for boss
      } else {
        playGameOver();
        setGameState('GAME_OVER'); // Failed level
      }
    } else if (gameState === 'BOSS_BATTLE') {
      // Boss Battle Complete
      // Check win condition
      const required = isFinalBoss ? FINAL_BOSS.requiredCorrect : 2; // Mini boss needs 2/3
      if (levelCorrectCount >= required) {
        if (isFinalBoss) {
            // Game Won
            playWin();
            setStats(prev => ({
                ...prev,
                badges: [...prev.badges, FINAL_BOSS.badgeName]
            }));
            setGameState('VICTORY');
        } else {
            // World Boss Defeated
            playWin();
            setStats(prev => ({
                ...prev,
                badges: [...prev.badges, currentWorld.badgeName]
            }));
            setGameState('BOSS_DEFEATED');
        }
      } else {
        playGameOver();
        setGameState('GAME_OVER');
      }
    }
  };

  const nextWorld = () => {
    playClick();
    setStats(prev => ({ ...prev, currentWorldIndex: prev.currentWorldIndex + 1 }));
    setGameState('WORLD_INTRO');
  };

  // --- Render Components ---

  const renderBackground = () => {
    if (gameState === 'MENU' || gameState === 'VICTORY') return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
    if (isFinalBoss) return "bg-gradient-to-b from-gray-900 to-red-900";
    return `bg-gradient-to-br ${currentWorld.bgGradient}`;
  };

  if (gameState === 'MENU') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${renderBackground()} text-white`}>
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-md text-yellow-300">
            Malaysian<br/>Math Adventure
          </h1>
          <p className="text-lg mb-8 text-white/90">Become the Multiplication Master!</p>
          
          <div className="space-y-4">
            <Button fullWidth size="xl" onClick={startGame} className="shadow-lg shadow-indigo-900/50">
              <Play fill="currentColor" /> Start Journey
            </Button>
            
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => {
                  playClick();
                  setSoundEnabled(!soundEnabled);
                }}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {soundEnabled ? <Volume2 /> : <VolumeX />}
              </button>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-4 gap-2 text-xs opacity-70">
             {WORLDS.map(w => (
               <div key={w.id} className="flex flex-col items-center">
                 <div className="bg-white/20 p-2 rounded-full mb-1">{w.icon === 'tree' ? '🌴' : w.icon === 'waves' ? '🌊' : w.icon === 'cloud' ? '☁️' : '🌌'}</div>
                 <span>{w.minTable}-{w.maxTable}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'WORLD_INTRO') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${renderBackground()} text-white`}>
         <div className="max-w-2xl w-full bg-white text-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className={`h-32 ${currentWorld.bgGradient} flex items-center justify-center`}>
                <span className="text-6xl animate-bounce-slow">{currentWorld.icon === 'tree' ? '🌴' : currentWorld.icon === 'waves' ? '🌊' : currentWorld.icon === 'cloud' ? '☁️' : '🌌'}</span>
            </div>
            <div className="p-8 text-center">
              <h2 className={`text-3xl font-bold mb-2 ${currentWorld.primaryColor}`}>{currentWorld.name}</h2>
              <p className="text-gray-500 font-semibold mb-4 uppercase tracking-wider">{currentWorld.theme}</p>
              <p className="text-lg mb-6 text-gray-600 leading-relaxed">{currentWorld.description}</p>
              
              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                <p className="font-bold text-blue-800">Mission:</p>
                <p className="text-blue-600">Master multiplication tables {currentWorld.minTable} to {currentWorld.maxTable}!</p>
              </div>

              <Button fullWidth size="lg" onClick={startLevel} className="animate-pulse">
                Start Exploring <ArrowRight />
              </Button>
            </div>
         </div>
      </div>
    );
  }

  if (gameState === 'PLAYING' || gameState === 'BOSS_BATTLE') {
    const currentQ = currentQuestions[currentQIndex];
    return (
      <div className={`min-h-screen flex flex-col ${renderBackground()} p-4`}>
        {/* Header Stats */}
        <div className="flex justify-between items-center bg-white/20 backdrop-blur-sm p-3 rounded-2xl text-white mb-6">
          <div className="flex items-center gap-2 font-bold">
            <Star className="text-yellow-300" fill="currentColor" />
            <span>{stats.score}</span>
          </div>
          <div className="font-bold text-lg">
             {gameState === 'BOSS_BATTLE' ? (isFinalBoss ? "FINAL BOSS" : "GUARDIAN BATTLE") : currentWorld.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
              Q: {currentQIndex + 1}/{currentQuestions.length}
            </span>
          </div>
        </div>

        {/* Boss Health Bar */}
        {gameState === 'BOSS_BATTLE' && (
          <div className="mb-6 max-w-lg mx-auto w-full animate-shake">
            <div className="flex justify-between text-white font-bold mb-1">
               <span>{isFinalBoss ? FINAL_BOSS.name : currentWorld.bossName} {isFinalBoss ? FINAL_BOSS.emoji : currentWorld.bossEmoji}</span>
               <span className="text-red-200">{Math.ceil(bossHealth)}% HP</span>
            </div>
            <div className="h-6 bg-gray-900/50 rounded-full overflow-hidden border-2 border-red-500/50">
              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${bossHealth}%` }} />
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-full text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <h3 className="text-gray-500 font-semibold uppercase tracking-widest text-sm mb-4">
              Solve the Equation
            </h3>
            
            <div className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 font-mono tracking-tight">
              {currentQ.factorA} × {currentQ.factorB} = ?
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== null}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-2xl md:text-3xl py-6 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Modal / Overlay */}
        {feedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-slow">
               <div className={`text-6xl mb-4 ${feedback.isCorrect ? 'animate-bounce' : 'animate-shake'}`}>
                 {feedback.isCorrect ? '🎉' : '🤔'}
               </div>
               <h3 className={`text-2xl font-bold mb-2 ${feedback.isCorrect ? 'text-green-600' : 'text-orange-500'}`}>
                 {feedback.message}
               </h3>
               {!feedback.isCorrect && (
                 <p className="text-gray-500 mb-6 text-lg">
                   The answer was <span className="font-bold text-gray-800">{feedback.correctAnswer}</span>
                 </p>
               )}
               {feedback.isCorrect && (
                 <p className="text-gray-400 mb-6 text-sm font-bold uppercase tracking-wider">
                   Next Challenge Awaits!
                 </p>
               )}
               <Button fullWidth onClick={nextQuestion} variant={feedback.isCorrect ? 'success' : 'secondary'}>
                 Continue
               </Button>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'LEVEL_COMPLETE') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${renderBackground()} text-white`}>
        <div className="bg-white text-gray-900 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Level Complete!</h2>
          <p className="text-gray-600 mb-6">You've mastered the basics of {currentWorld.name}.</p>
          
          <div className="bg-red-50 border-2 border-red-100 rounded-xl p-6 mb-6">
            <h3 className="text-red-600 font-bold text-xl mb-1">WARNING!</h3>
            <p className="text-red-800 mb-2">{currentWorld.bossDescription}</p>
            <div className="text-4xl my-2">{currentWorld.bossEmoji}</div>
            <p className="text-sm text-red-500 font-bold uppercase">Defeat the guardian to earn your badge!</p>
          </div>

          <Button fullWidth size="lg" variant="danger" onClick={() => startBoss(false)}>
             Fight {currentWorld.bossName}!
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'BOSS_DEFEATED') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${renderBackground()} text-white`}>
        <div className="bg-white text-gray-900 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-3xl font-bold mb-2 text-indigo-700">Guardian Defeated!</h2>
          <p className="text-gray-600 mb-4">You have earned a new badge:</p>
          <div className="inline-block bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full font-bold text-lg mb-8 border-2 border-yellow-300">
            {currentWorld.badgeName}
          </div>
          
          {isLastWorld ? (
             <Button fullWidth size="xl" variant="danger" onClick={() => setGameState('BOSS_INTRO')}>
               Enter Final Battle!
             </Button>
          ) : (
             <Button fullWidth size="lg" onClick={nextWorld}>
               Travel to Next World <ArrowRight />
             </Button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'BOSS_INTRO') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white text-center">
            <div className="max-w-lg w-full">
                <div className="text-8xl mb-6 animate-pulse">🐉🔥</div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-red-500 mb-4 uppercase tracking-widest">Ultimate Math Dragon</h1>
                <p className="text-xl text-gray-300 mb-8">
                    You have reached the edge of the galaxy. To become the <span className="text-yellow-400 font-bold">Multiplication Master of Malaysia</span>, you must defeat the Dragon!
                </p>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-8">
                    <p className="font-mono text-green-400">Rules:</p>
                    <ul className="text-left text-gray-400 mt-2 space-y-2">
                        <li>• 5 Ultimate Questions</li>
                        <li>• Mixed Tables (2-12)</li>
                        <li>• Must get 4/5 correct</li>
                    </ul>
                </div>
                <Button fullWidth size="xl" variant="danger" onClick={() => startBoss(true)}>
                    Start Final Battle
                </Button>
            </div>
        </div>
      )
  }

  if (gameState === 'VICTORY') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-t from-yellow-400 via-orange-500 to-red-500 text-white text-center overflow-y-auto">
         <div className="bg-white/90 backdrop-blur-md text-gray-900 p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl w-full my-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-2">CONGRATULATIONS!</h1>
            <p className="text-xl text-gray-600 mb-8">You are the...</p>
            
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-100 p-6 rounded-2xl border-4 border-yellow-400 mb-8 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-2xl md:text-4xl font-black text-yellow-800 uppercase tracking-wide leading-tight">
                    {FINAL_BOSS.title}
                </h2>
            </div>
            
            <div className="mb-8">
                <p className="font-bold text-gray-500 mb-2">Total Score</p>
                <p className="text-5xl font-mono font-bold text-indigo-600">{stats.score}</p>
            </div>

            <div className="mb-8">
                <p className="font-bold text-gray-500 mb-2">Badges Collected</p>
                <BadgeDisplay badges={stats.badges} />
            </div>

            <p className="text-gray-600 italic mb-8">"You unleashed your math power and defeated the Ultimate Dragon! 🐉🔥🎉"</p>

            <Button onClick={() => window.location.reload()} size="lg" variant="primary">
                <RotateCcw size={20} /> Play Again
            </Button>
         </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-800 text-white text-center">
            <div className="bg-white text-gray-900 p-8 rounded-3xl shadow-2xl max-w-md w-full">
                <div className="text-6xl mb-4 text-gray-400">😢</div>
                <h2 className="text-3xl font-bold mb-2">Don't Give Up!</h2>
                <p className="text-gray-600 mb-6">
                    {gameState === 'BOSS_BATTLE' 
                        ? "The Guardian was too strong this time. Review your tables and try again!" 
                        : "You need 7/10 correct to advance. Keep practicing!"}
                </p>
                
                <div className="bg-gray-100 p-4 rounded-xl mb-6">
                    <div className="flex justify-between mb-1 text-sm font-bold text-gray-500">
                        <span>Score</span>
                        <span>{stats.score}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button fullWidth onClick={startLevel} variant="primary">
                        <RotateCcw size={18} /> Retry Level
                    </Button>
                    <Button fullWidth onClick={() => setGameState('MENU')} variant="secondary">
                        Back to Menu
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  return null;
};

export default App;