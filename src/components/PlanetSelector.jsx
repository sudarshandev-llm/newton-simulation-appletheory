import { motion } from 'framer-motion';
import { planets } from '../utils/planets';

export default function PlanetSelector({ selected, onSelect, darkMode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Select Planet
      </p>
      <div className="grid grid-cols-4 gap-2">
        {planets.map((planet) => (
          <motion.button
            key={planet.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(planet.id)}
            className={`relative p-3 rounded-xl text-center transition-all duration-200 ${
              selected === planet.id
                ? 'bg-gradient-to-br from-pink-400/20 to-blue-400/20 border-2 border-pink-400/50 dark:border-pink-400/50 shadow-lg'
                : 'bg-white/50 dark:bg-gray-800/40 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{planet.icon}</div>
            <p className={`text-xs font-semibold ${
              selected === planet.id
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {planet.name}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {planet.gravity} m/s²
            </p>
            {selected === planet.id && (
              <motion.div
                layoutId="planetIndicator"
                className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full border-2 border-white dark:border-gray-900"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
