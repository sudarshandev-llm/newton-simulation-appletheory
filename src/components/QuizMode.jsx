import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    q: "What happens to the apple's velocity as it falls?",
    options: [
      'It increases',
      'It decreases',
      'It stays constant',
      'It becomes zero',
    ],
    correct: 0,
    explanation:
      "The apple's velocity increases by 9.81 m/s every second due to Earth's gravitational acceleration (g = 9.81 m/s²).",
  },
  {
    q: 'On which planet would the apple fall fastest?',
    options: ['Earth', 'Moon', 'Mars', 'Jupiter'],
    correct: 3,
    explanation:
      'Jupiter has the highest gravitational acceleration at 24.79 m/s², nearly 2.5 times that of Earth!',
  },
  {
    q: 'If you drop the apple from a higher point, what changes?',
    options: [
      'It hits the ground with higher velocity',
      'It falls slower',
      'Gravity decreases',
      'The apple becomes heavier',
    ],
    correct: 0,
    explanation:
      'A higher drop means more time to accelerate, resulting in a greater final velocity when it reaches the ground.',
  },
  {
    q: 'What force causes the apple to fall?',
    options: ['Magnetic force', 'Gravitational force', 'Centrifugal force', 'Nuclear force'],
    correct: 1,
    explanation:
      "Gravity is the attractive force between the Earth and the apple. It's described by F = mg.",
  },
  {
    q: 'Without air resistance, which falls faster — a feather or an apple?',
    options: [
      'The apple',
      'The feather',
      'They fall at the same rate',
      "It depends on the planet's color",
    ],
    correct: 2,
    explanation:
      'In a vacuum (no air resistance), all objects fall at the same rate regardless of their mass! This was shown by Galileo.',
  },
  {
    q: 'What does the formula v = u + at tell us?',
    options: [
      'How far the apple falls',
      'How fast the apple is moving after time t',
      'How much the apple weighs',
      'The color of the apple',
    ],
    correct: 1,
    explanation:
      'v = u + at gives the velocity after time t, where u is initial velocity, a is acceleration, and t is time elapsed.',
  },
];

export default function QuizMode({ darkMode, onClose }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = useCallback((index) => {
    setSelected(index);
    setShowResult(true);
    if (index === questions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  }, [currentQ]);

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  }, [currentQ]);

  const restart = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card p-6 relative"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
          {finished ? '🎉 Quiz Complete!' : '🧠 Predict What Happens'}
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {!finished ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-400 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-medium text-gray-400">
                {currentQ + 1}/{questions.length}
              </span>
            </div>

            <p className="text-base font-semibold text-gray-800 dark:text-white mb-4">
              {questions[currentQ].q}
            </p>

            <div className="space-y-2">
              {questions[currentQ].options.map((opt, i) => {
                const isCorrect = i === questions[currentQ].correct;
                const isSelected = selected === i;
                let bgClass = 'bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-600';

                if (showResult) {
                  if (isCorrect) {
                    bgClass = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    bgClass = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500';
                  }
                } else if (isSelected) {
                  bgClass = 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500';
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    onClick={() => !showResult && handleAnswer(i)}
                    disabled={showResult}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${bgClass} ${
                      showResult && isCorrect ? 'shadow-md' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        showResult && isCorrect
                          ? 'bg-emerald-400 text-white'
                          : showResult && isSelected && !isCorrect
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}>
                        {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✕' : String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className={`p-3 rounded-xl text-sm ${
                    selected === questions[currentQ].correct
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                    <p className="font-medium mb-1">
                      {selected === questions[currentQ].correct ? '✅ Correct!' : '❌ Not quite!'}
                    </p>
                    <p className="text-xs opacity-80">{questions[currentQ].explanation}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextQuestion}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold text-sm"
                  >
                    {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white font-display mb-2">
            {score} / {questions.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {score === questions.length
              ? 'Perfect score! You\'re a physics genius! 🌟'
              : score >= questions.length / 2
              ? 'Great job! Keep exploring! 🚀'
              : 'Good start! Try again to improve! 💪'}
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={restart}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold text-sm"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
