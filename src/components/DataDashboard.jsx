import { motion, AnimatePresence } from 'framer-motion';

const DataCard = ({ label, value, unit, icon, color = 'from-pink-400 to-blue-400' }) => (
  <motion.div
    layout
    className="glass-card p-4"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white font-display truncate">
          {typeof value === 'number' ? value.toFixed(2) : value}
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  </motion.div>
);

export default function DataDashboard({ physicsData, isFalling, darkMode }) {
  const {
    velocity = 0,
    acceleration = 0,
    force = 0,
    distance = 0,
    time = 0,
  } = physicsData;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFalling ? 'falling' : 'idle'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-3"
      >
        <DataCard
          label="Velocity"
          value={velocity}
          unit="m/s"
          icon="⚡"
          color="from-yellow-400 to-orange-500"
        />
        <DataCard
          label="Acceleration"
          value={acceleration}
          unit="m/s²"
          icon="📈"
          color="from-purple-400 to-pink-500"
        />
        <DataCard
          label="Force"
          value={force}
          unit="N"
          icon="💪"
          color="from-red-400 to-pink-500"
        />
        <DataCard
          label="Distance"
          value={distance}
          unit="m"
          icon="📏"
          color="from-blue-400 to-cyan-500"
        />
        <div className="col-span-2">
          <DataCard
            label="Time Elapsed"
            value={time}
            unit="s"
            icon="⏱️"
            color="from-emerald-400 to-teal-500"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
