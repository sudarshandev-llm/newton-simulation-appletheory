import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimulationCanvas from './components/SimulationCanvas';
import DataDashboard from './components/DataDashboard';
import FormulaCards from './components/FormulaCards';
import PlanetSelector from './components/PlanetSelector';
import QuizMode from './components/QuizMode';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import { getGravity } from './utils/planets';

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const [gravity, setGravity] = useState(getGravity('earth'));
  const [height, setHeight] = useState(5);
  const [windForce, setWindForce] = useState(0);
  const [airResistance, setAirResistance] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [physicsData, setPhysicsData] = useState({
    velocity: 0,
    acceleration: 0,
    force: 0,
    distance: 0,
    time: 0,
  });
  const [isFalling, setIsFalling] = useState(false);
  const [showExplanation, setShowExplanation] = useState(null);
  const simRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handlePlanetChange = useCallback((planetId) => {
    setSelectedPlanet(planetId);
    const newGravity = getGravity(planetId);
    setGravity(newGravity);
    if (simRef.current) {
      simRef.current.resetSimulation();
    }
    setIsFalling(false);
  }, []);

  const handlePhysicsUpdate = useCallback((data) => {
    setPhysicsData({
      velocity: data.velocity || 0,
      acceleration: data.acceleration || 0,
      force: data.force || 0,
      distance: data.distance || 0,
      time: data.time || 0,
    });
    setIsFalling(data.isFalling || false);
  }, []);

  const handleDrop = useCallback(() => {
    if (simRef.current) {
      simRef.current.dropApple();
      setIsFalling(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (simRef.current) {
      simRef.current.resetSimulation();
    }
    setIsFalling(false);
  }, []);

  const handleAppleHitGround = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Audio not available
    }
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const explanationContent = {
    gravity:
      'Gravity is a natural phenomenon by which all things with mass are brought toward one another. On Earth, gravity gives weight to physical objects and causes the apple to fall downward at 9.81 m/s².',
    freefall:
      'Free fall is any motion of a body where gravity is the only force acting upon it. In free fall, all objects accelerate at the same rate regardless of mass — as demonstrated by Galileo and later refined by Newton.',
    newton:
      'Sir Isaac Newton (1643-1727) formulated the law of universal gravitation after observing an apple fall from a tree. He realized the same force that pulls the apple toward Earth also keeps the Moon in orbit around Earth.',
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <LoadingScreen key="loading" onFinish={() => setLoading(false)} />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500 ${
            darkMode
              ? 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white'
              : 'bg-gradient-to-br from-[#E8F4FD] via-[#FFD1DC] to-[#D4EDDA] text-gray-900'
          }`}
        >
          <div className="flex-1 flex flex-col lg:flex-row gap-0 p-2 lg:p-3 overflow-hidden">
            {/* LEFT: Simulation Canvas */}
            <motion.div
              layout
              transition={springTransition}
              className="flex-1 min-h-0 lg:min-h-full flex flex-col"
            >
              <motion.div
                layout
                className="flex-1 glass-card overflow-hidden relative"
              >
                <SimulationCanvas
                  ref={simRef}
                  gravityValue={gravity}
                  planet={selectedPlanet}
                  windForce={windForce}
                  airResistance={airResistance}
                  slowMotion={slowMotion}
                  isPaused={isPaused}
                  dropHeight={height}
                  onPhysicsUpdate={handlePhysicsUpdate}
                  onAppleHitGround={handleAppleHitGround}
                  darkMode={darkMode}
                />

                {/* Watermark */}
                <div className="absolute bottom-3 right-3 text-[10px] text-white/30 dark:text-white/20 font-medium tracking-wider pointer-events-none select-none">
                  Made by Team Alum
                </div>

                {/* Newton silhouette hint */}
                <div className="absolute bottom-8 left-8 text-3xl opacity-20 dark:opacity-10 pointer-events-none select-none">
                  👤
                </div>

                {/* Overlay controls on canvas */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <button
                    onClick={togglePause}
                    className="w-8 h-8 rounded-xl bg-black/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 dark:hover:bg-white/20 transition-colors"
                    title={isPaused ? 'Resume' : 'Pause'}
                  >
                    {isPaused ? '▶' : '⏸'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-xl bg-black/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 dark:hover:bg-white/20 transition-colors"
                    title="Reset"
                  >
                    ↺
                  </button>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm ${
                    isPaused
                      ? 'bg-yellow-500/30 text-yellow-200'
                      : isFalling
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-blue-500/30 text-blue-200'
                  }`}>
                    {isPaused ? '⏸ PAUSED' : isFalling ? '● FALLING' : '● READY'}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT: Data Dashboard */}
            <motion.div
              layout
              transition={springTransition}
              className="w-full lg:w-96 xl:w-104 flex-shrink-0 overflow-y-auto scrollbar-hide"
            >
              <div className="p-2 lg:p-3 space-y-3">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h1 className="text-xl font-bold font-display text-gradient">
                      Newton's Apple
                    </h1>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Interactive Physics Lab
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-9 h-9 rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm flex items-center justify-center text-lg hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors"
                      title="Toggle theme"
                    >
                      {darkMode ? '☀️' : '🌙'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowQuiz(true)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      🧠 Quiz
                    </motion.button>
                  </div>
                </motion.div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDrop}
                    disabled={isFalling}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold text-sm disabled:opacity-50"
                  >
                    🍎 Drop Apple
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 font-semibold text-sm"
                  >
                    ↺ Reset
                  </motion.button>
                </div>

                {/* Planet Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="glass-card p-4">
                    <PlanetSelector
                      selected={selectedPlanet}
                      onSelect={handlePlanetChange}
                      darkMode={darkMode}
                    />
                  </div>
                </motion.div>

                {/* Physics Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass-card p-4 space-y-4"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Physics Controls
                  </p>

                  {/* Gravity Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Gravity: {gravity.toFixed(1)} m/s²</span>
                      <span>1 - 30</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.1"
                      value={gravity}
                      onChange={(e) => setGravity(parseFloat(e.target.value))}
                      className="slider-thumb"
                    />
                  </div>

                  {/* Height Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Drop Height: {height}m</span>
                      <span>1 - 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                      className="slider-thumb"
                    />
                  </div>

                  {/* Wind Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Wind Force: {windForce > 0 ? '→' : windForce < 0 ? '←' : '—'} {Math.abs(windForce).toFixed(1)}</span>
                      <span>-5 / 5</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={windForce}
                      onChange={(e) => setWindForce(parseFloat(e.target.value))}
                      className="slider-thumb"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setAirResistance(!airResistance)}
                        className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                          airResistance ? 'bg-gradient-to-r from-pink-400 to-blue-400' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <motion.div
                          animate={{ x: airResistance ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow"
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Air Resistance</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setSlowMotion(!slowMotion)}
                        className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                          slowMotion ? 'bg-gradient-to-r from-pink-400 to-blue-400' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <motion.div
                          animate={{ x: slowMotion ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow"
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Slow Motion</span>
                    </label>
                  </div>
                </motion.div>

                {/* Real-time Data */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-4"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Real-time Data
                  </p>
                  <DataDashboard
                    physicsData={physicsData}
                    isFalling={isFalling}
                    darkMode={darkMode}
                  />
                </motion.div>

                {/* Formula Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <FormulaCards
                    currentValues={{
                      gravity,
                      mass: 0.2,
                      time: physicsData.time,
                      velocity: physicsData.velocity,
                      distance: physicsData.distance,
                      acceleration: physicsData.acceleration,
                    }}
                    darkMode={darkMode}
                  />
                </motion.div>

                {/* Explanation Panels */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-4"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Learn More
                  </p>
                  <div className="space-y-2">
                    {[
                      { key: 'gravity', label: 'What is Gravity?', icon: '🌍' },
                      { key: 'freefall', label: 'What is Free Fall?', icon: '🍎' },
                      { key: 'newton', label: 'Newton\'s Discovery', icon: '📖' },
                    ].map((item) => (
                      <motion.button
                        key={item.key}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() =>
                          setShowExplanation(
                            showExplanation === item.key ? null : item.key
                          )
                        }
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          showExplanation === item.key
                            ? 'bg-gradient-to-r from-pink-400/10 to-blue-400/10 border border-pink-400/20'
                            : 'bg-white/40 dark:bg-gray-800/20 border border-transparent hover:bg-white/60 dark:hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.label}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            {showExplanation === item.key ? '▲' : '▼'}
                          </span>
                        </div>
                        <AnimatePresence>
                          {showExplanation === item.key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {explanationContent[item.key]}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <Footer darkMode={darkMode} />

          {/* Quiz Modal */}
          <AnimatePresence>
            {showQuiz && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowQuiz(false)}
              >
                <div
                  className="w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <QuizMode
                    darkMode={darkMode}
                    onClose={() => setShowQuiz(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
