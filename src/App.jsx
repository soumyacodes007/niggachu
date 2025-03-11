import { useState, useEffect } from 'react';
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
import WaitingRoom from './components/WaitingRoom';

function App() {
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [battleInfo, setBattleInfo] = useState({
    battleCode: "",
    battleName: "",
    betAmount: 0
  });
  const [activeBattles, setActiveBattles] = useState({});

  // Connect wallet function
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet!");
    }
  };

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, []);

  const handleCreateBattle = (battleName, betAmount) => {
    const battleCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Store battle info in state
    setBattleInfo({
      battleCode,
      battleName,
      betAmount,
      creator: walletAddress
    });
    
    // Add to active battles
    setActiveBattles(prev => ({
      ...prev,
      [battleCode]: {
        battleName,
        betAmount,
        creator: walletAddress,
        status: 'waiting'
      }
    }));
    
    // Show waiting room instead of battle arena
    setShowWaitingRoom(true);
  };

  const handleJoinBattle = (battleCode, betAmount) => {
    // Check if battle exists
    if (activeBattles[battleCode]) {
      // Update battle status
      setActiveBattles(prev => ({
        ...prev,
        [battleCode]: {
          ...prev[battleCode],
          joiner: walletAddress,
          status: 'ready'
        }
      }));
      
      setBattleInfo(prev => ({
        ...prev,
        battleCode,
        battleName: activeBattles[battleCode].battleName,
        betAmount,
        joiner: walletAddress
      }));
      
      // Show battle arena directly when joining
      setShowBattleArena(true);
      setShowWaitingRoom(false);
      
      // Simulate notifying the creator
      // In a real app, this would be done through WebSockets
      if (battleInfo.battleCode === battleCode) {
        setShowBattleArena(true);
        setShowWaitingRoom(false);
      }
    } else {
      alert("Battle code not found. Please check and try again.");
    }
  };

  const handleExitBattle = () => {
    setShowBattleArena(false);
    setShowWaitingRoom(false);
    
    // Remove battle if creator exits
    if (battleInfo.creator === walletAddress) {
      setActiveBattles(prev => {
        const updatedBattles = {...prev};
        delete updatedBattles[battleInfo.battleCode];
        return updatedBattles;
      });
    }
  };

  // For demo purposes: simulate another player joining
  const simulateJoin = () => {
    handleJoinBattle(battleInfo.battleCode, battleInfo.betAmount);
  };

  return (
    <div className="min-h-screen">
      {showBattleArena ? (
        <BattleArena 
          onExit={handleExitBattle} 
          battleCode={battleInfo.battleCode}
          battleName={battleInfo.battleName}
          betAmount={battleInfo.betAmount}
          walletAddress={walletAddress}
        />
      ) : showWaitingRoom ? (
        <WaitingRoom 
          battleCode={battleInfo.battleCode}
          battleName={battleInfo.battleName}
          betAmount={battleInfo.betAmount}
          onExit={handleExitBattle}
          onSimulateJoin={simulateJoin} // For testing only
        />
      ) : (
        <>
          <Header 
            walletConnected={walletConnected} 
            walletAddress={walletAddress} 
            onConnectWallet={connectWallet} 
          />
          <Hero />
          <Features />
          <FeaturedCards />
          <BattleSection 
            onCreateBattle={handleCreateBattle}
            onJoinBattle={handleJoinBattle}
            walletConnected={walletConnected}
            onConnectWallet={connectWallet}
            activeBattles={activeBattles}
          />
          <Roadmap />
          <Testimonials />
          <FAQ />
          <CallToAction />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
