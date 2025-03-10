import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function BattleButton({ onCreateBattle, onJoinBattle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [battleCode, setBattleCode] = useState('');
  const [battleName, setBattleName] = useState('');
  const [battleType, setBattleType] = useState('standard');
  const [stakeAmount, setStakeAmount] = useState(0);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowCreateForm(false);
      setShowJoinForm(false);
    }
  };

  const handleCreateBattle = (e) => {
    e.preventDefault();
    // Call the parent component's create battle function
    onCreateBattle(battleName);
    
    // Reset form
    setShowCreateForm(false);
    setIsOpen(false);
    setBattleName('');
    setBattleType('standard');
    setStakeAmount(0);
  };

  const handleJoinBattle = (e) => {
    e.preventDefault();
    // Call the parent component's join battle function
    onJoinBattle(battleCode);
    
    // Reset form
    setShowJoinForm(false);
    setIsOpen(false);
    setBattleCode('');
  };

  const generateBattleCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  return (
    <>
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${isOpen ? 'bg-red-600' : 'bg-pokemon-red'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleOpen}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && !showCreateForm && !showJoinForm && (
            <motion.div
              className="absolute bottom-20 right-0 bg-gray-800 rounded-lg shadow-xl p-4 w-64"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-bold text-center mb-2">Battle Arena</h3>
                <motion.button
                  className="bg-pokemon-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateForm(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Battle
                </motion.button>
                <motion.button
                  className="bg-pokemon-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowJoinForm(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Join Battle
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              className="absolute bottom-20 right-0 bg-gray-800 rounded-lg shadow-xl p-4 w-80"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3 className="text-lg font-bold text-center mb-4">Create New Battle</h3>
              <form onSubmit={handleCreateBattle}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Battle Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-yellow"
                    placeholder="Enter battle name"
                    value={battleName}
                    onChange={(e) => setBattleName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Battle Type</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-yellow"
                    value={battleType}
                    onChange={(e) => setBattleType(e.target.value)}
                  >
                    <option value="standard">Standard (3v3)</option>
                    <option value="tournament">Tournament Style</option>
                    <option value="draft">Draft Battle</option>
                    <option value="legendary">Legendary Only</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Stake Amount (optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-yellow"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 bg-pokemon-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Create
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showJoinForm && (
            <motion.div
              className="absolute bottom-20 right-0 bg-gray-800 rounded-lg shadow-xl p-4 w-80"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3 className="text-lg font-bold text-center mb-4">Join Battle</h3>
              <form onSubmit={handleJoinBattle}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Battle Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-yellow"
                    placeholder="Enter battle code"
                    value={battleCode}
                    onChange={(e) => setBattleCode(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowJoinForm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 bg-pokemon-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Join
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Backdrop for when modal is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleOpen}
        ></div>
      )}
    </>
  );
}

export default BattleButton; 