import { motion } from 'framer-motion';

export default function Footer({ darkMode }) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 py-2 px-4"
    >
      <span className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wider">
        Made with innovation for students • Made by Team Alum
      </span>
      <span className="text-[10px] text-gray-300 dark:text-gray-600">|</span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">
        🍎 Newton's Apple v1.0
      </span>
    </motion.footer>
  );
}
