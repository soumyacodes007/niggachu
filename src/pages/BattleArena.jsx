import { motion } from 'framer-motion';

function BattleArena({ onExit }) {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col overflow-hidden">
      {/* Battle header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <motion.button
            className="mr-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onExit}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </motion.button>
          <h2 className="text-xl font-bold text-white">Battle Arena</h2>
        </div>
      </div>
      
      {/* Battle arena main area */}
      <div className="flex-grow relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-20"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-10">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
        
        {/* Battle zones */}
        <div className="relative h-full flex flex-col">
          {/* Opponent zone */}
          <div className="h-1/3 border-b border-white/10">
            <div className="h-full flex items-center justify-center">
              <div className="text-white/50 text-lg">Opponent's Field</div>
            </div>
          </div>
          
          {/* Middle zone */}
          <div className="h-1/3 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-white/30">VS</span>
            </div>
          </div>
          
          {/* Player zone */}
          <div className="h-1/3 border-t border-white/10">
            <div className="h-full flex items-center justify-center">
              <div className="text-white/50 text-lg">Your Field</div>
            </div>
          </div>
        </div>
        
        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Footer status bar */}
      <div className="bg-gray-800 h-16 border-t border-gray-700 flex items-center justify-center">
        <div className="text-white/50">Ready for battle</div>
      </div>
    </div>
  );
}

export default BattleArena;