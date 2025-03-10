import { motion } from 'framer-motion';

function BattleSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Battle Arena
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Challenge other trainers to epic Pokémon card battles and climb the ranks
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4 text-pokemon-yellow">Battle Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-pokemon-red mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Create custom battles with different formats and rules</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-pokemon-red mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Join battles created by other trainers using battle codes</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-pokemon-red mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Stake tokens on battles for higher rewards and prestige</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-pokemon-red mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Earn experience and climb the global leaderboard</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-pokemon-red mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Participate in weekly tournaments with exclusive rewards</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <motion.button 
                  className="bg-pokemon-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enter Battle Arena
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative h-80 md:h-96 overflow-hidden rounded-xl border-4 border-gray-700 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pokemon-red/20 to-pokemon-blue/20"></div>
              
              {/* Battle arena visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Player side */}
                  <div className="absolute bottom-4 left-4 right-4 h-24 bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 flex items-center justify-between px-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-pokemon-red rounded-full flex items-center justify-center text-white font-bold text-xl">
                        YOU
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-300">Your Team</div>
                        <div className="flex space-x-1 mt-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 bg-gray-700 rounded-full border border-gray-600"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-pokemon-yellow">VS</div>
                  </div>
                  
                  {/* Opponent side */}
                  <div className="absolute top-4 left-4 right-4 h-24 bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 flex items-center justify-between px-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-pokemon-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                        OPP
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-gray-300">Opponent's Team</div>
                        <div className="flex space-x-1 mt-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 bg-gray-700 rounded-full border border-gray-600"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Battle Code</div>
                      <div className="text-sm font-mono bg-gray-900 px-2 py-1 rounded">XB7D9F2E</div>
                    </div>
                  </div>
                  
                  {/* Battle field */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pokemon-red to-pokemon-blue animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Battle effects */}
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-pokemon-yellow text-black font-bold py-2 px-4 rounded-lg transform rotate-3 shadow-lg">
              LIVE NOW: 328 Battles
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.5"></path>
          <path d="M0,50 L100,50" stroke="white" strokeWidth="0.5"></path>
          <path d="M50,0 L50,100" stroke="white" strokeWidth="0.5"></path>
          <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5"></circle>
        </svg>
      </div>
    </section>
  );
}

export default BattleSection; 