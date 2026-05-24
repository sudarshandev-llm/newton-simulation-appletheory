import { motion, AnimatePresence } from 'framer-motion';

const formulas = [
  {
    id: 'fmg',
    name: "Newton's Second Law",
    formula: 'F = mg',
    desc: 'Force equals mass times gravitational acceleration',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'vuat',
    name: 'Velocity Equation',
    formula: 'v = u + at',
    desc: 'Final velocity equals initial velocity plus acceleration × time',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'sut',
    name: 'Distance Equation',
    formula: 's = ut + ½at²',
    desc: 'Distance equals initial velocity × time plus half acceleration × time squared',
    color: 'from-emerald-400 to-teal-500',
  },
];

export default function FormulaCards({ currentValues, darkMode }) {
  const getFormulaWithValues = (formula) => {
    if (!currentValues) return formula;
    const { gravity, mass, time, velocity, distance, acceleration } = currentValues;

    switch (formula) {
      case 'F = mg':
        return `F = ${mass.toFixed(2)} × ${gravity.toFixed(2)} = ${(mass * gravity).toFixed(2)} N`;
      case 'v = u + at':
        return `v = 0 + ${acceleration.toFixed(2)} × ${time.toFixed(2)} = ${velocity.toFixed(2)} m/s`;
      case 's = ut + ½at²':
        return `s = 0 + ½ × ${acceleration.toFixed(2)} × ${(time * time).toFixed(2)} = ${distance.toFixed(2)} m`;
      default:
        return formula;
    }
  };

  return (
    <div className="space-y-3">
      {formulas.map((f, i) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`glass-card overflow-hidden ${darkMode ? 'dark' : ''}`}
        >
          <div className={`h-1 w-full bg-gradient-to-r ${f.color}`} />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {f.name}
              </span>
              <motion.span
                className="text-2xl font-bold font-display text-gradient"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {f.formula}
              </motion.span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{f.desc}</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentValues?.time?.toFixed(2) || '0'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-mono bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
              >
                {getFormulaWithValues(f.formula)}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
