import { useState } from 'react';
import './index.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import FeaturedCards from './components/FeaturedCards';
import BattleSection from './components/BattleSection';
import Roadmap from './components/Roadmap';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import BattleButton from './components/BattleButton';
import BattleArena from './pages/BattleArena';

function App() {
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [battleInfo, setBattleInfo] = useState({
    battleCode: "",
    battleName: ""
  });

  const handleCreateBattle = (battleName) => {
    const battleCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setBattleInfo({
      battleCode,
      battleName
    });
    setShowBattleArena(true);
  };

  const handleJoinBattle = (battleCode) => {
    setBattleInfo({
      battleCode,
      battleName: "Joined Battle"
    });
    setShowBattleArena(true);
  };

  const handleExitBattle = () => {
    setShowBattleArena(false);
  };

  return (
    <div className="min-h-screen">
      {showBattleArena ? (
        <BattleArena 
          onExit={handleExitBattle} 
          battleCode={battleInfo.battleCode}
          battleName={battleInfo.battleName}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
          <button
            onClick={() => setShowBattleArena(true)}
            className="px-6 py-3 bg-pokemon-red hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            Enter Battle Arena
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
