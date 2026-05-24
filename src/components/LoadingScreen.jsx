import { motion } from 'framer-motion';

export default function LoadingScreen({ onFinish }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#E8F4FD] via-[#FFD1DC] to-[#D4EDDA] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          🍎
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2"
        >
          Newton's Apple
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 dark:text-gray-400 text-sm mb-8"
        >
          Interactive Physics Lab
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ delay: 0.6, duration: 1.5, ease: 'easeInOut' }}
          className="h-1 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mx-auto mb-6"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="text-xs text-gray-400 dark:text-gray-500"
        >
          Made by Team Alum
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onFinish}
          className="mt-8 px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30"
        >
          Enter Lab
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
