import { motion } from 'framer-motion';
import { useState } from 'react';
import BattleButton from './BattleButton';

const BattleSection = ({ onCreateBattle, onJoinBattle, walletConnected, onConnectWallet, activeBattles }) => {
  const [battleName, setBattleName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [betAmount, setBetAmount] = useState(0);
  const [joinBetAmount, setJoinBetAmount] = useState(0);
  const [showActiveBattles, setShowActiveBattles] = useState(false);

  if (!walletConnected) {
    return (
      <section id="battle" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Battle Arena</h2>
          <p className="mb-6">Connect your wallet to create or join battles</p>
          <button 
            onClick={onConnectWallet}
            className="bg-pokemon-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            Connect Wallet
          </button>
        </div>
      </section>
    );
  }

  const handleJoinWithCode = () => {
    if (joinCode && joinBetAmount > 0) {
      onJoinBattle(joinCode, joinBetAmount);
    }
  };

  return (
    <section id="battle" className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Battle Arena</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {/* Create Battle */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1">
            <h3 className="text-xl font-bold mb-4">Create Battle</h3>
            <input
              type="text"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              placeholder="Enter battle name"
              className="w-full p-2 mb-4 text-black rounded"
            />
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Bet amount in $"
              className="w-full p-2 mb-4 text-black rounded"
            />
            <BattleButton
              onClick={() => onCreateBattle(battleName, betAmount)}
              className="w-full"
              disabled={!battleName || betAmount <= 0}
            >
              Create Battle
            </BattleButton>
          </div>

          {/* Join Battle */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1">
            <h3 className="text-xl font-bold mb-4">Join Battle</h3>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter battle code"
              className="w-full p-2 mb-4 text-black rounded"
            />
            <input
              type="number"
              value={joinBetAmount}
              onChange={(e) => setJoinBetAmount(e.target.value)}
              placeholder="Bet amount in $"
              className="w-full p-2 mb-4 text-black rounded"
            />
            <BattleButton
              onClick={handleJoinWithCode}
              className="w-full mb-4"
              disabled={!joinCode || joinBetAmount <= 0}
            >
              Join Battle
            </BattleButton>
            
            <div className="text-center">
              <button 
                onClick={() => setShowActiveBattles(!showActiveBattles)}
                className="text-pokemon-yellow hover:underline"
              >
                {showActiveBattles ? "Hide" : "Show"} Active Battles
              </button>
            </div>
            
            {showActiveBattles && Object.keys(activeBattles).length > 0 && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="font-semibold mb-2">Active Battles:</h4>
                <div className="space-y-2">
                  {Object.entries(activeBattles).map(([code, battle]) => (
                    battle.status === 'waiting' && (
                      <div key={code} className="bg-gray-700 p-2 rounded flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{battle.battleName}</div>
                          <div className="text-sm text-gray-400">${battle.betAmount}</div>
                        </div>
                        <button
                          onClick={() => {
                            setJoinCode(code);
                            setJoinBetAmount(battle.betAmount);
                          }}
                          className="bg-pokemon-blue px-3 py-1 rounded text-sm"
                        >
                          Select
                        </button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BattleSection; 