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

  // Load active battles from localStorage on component mount
  useEffect(() => {
    const storedBattles = localStorage.getItem('activeBattles');
    if (storedBattles) {
      setActiveBattles(JSON.parse(storedBattles));
    }
    
    // Set up an interval to check for updates in localStorage
    const intervalId = setInterval(() => {
      const currentBattles = localStorage.getItem('activeBattles');
      if (currentBattles) {
        const parsedBattles = JSON.parse(currentBattles);
        setActiveBattles(parsedBattles);
        
        // Check if user is waiting and someone joined their battle
        if (showWaitingRoom && battleInfo.battleCode) {
          const userBattle = parsedBattles[battleInfo.battleCode];
          if (userBattle && userBattle.status === 'ready') {
            setShowWaitingRoom(false);
            setShowBattleArena(true);
          }
        }
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [showWaitingRoom, battleInfo.battleCode]);

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
    
    // Add to active battles and save to localStorage
    const updatedBattles = {
      ...activeBattles,
      [battleCode]: {
        battleName,
        betAmount,
        creator: walletAddress,
        status: 'waiting'
      }
    };
    
    setActiveBattles(updatedBattles);
    localStorage.setItem('activeBattles', JSON.stringify(updatedBattles));
    
    // Show waiting room
    setShowWaitingRoom(true);
  };

  const handleJoinBattle = (battleCode, betAmount) => {
    // Get latest battles from localStorage
    const storedBattles = localStorage.getItem('activeBattles');
    const currentBattles = storedBattles ? JSON.parse(storedBattles) : {};
    
    // Check if battle exists
    if (currentBattles[battleCode]) {
      // Update battle status
      const updatedBattles = {
        ...currentBattles,
        [battleCode]: {
          ...currentBattles[battleCode],
          joiner: walletAddress,
          status: 'ready'
        }
      };
      
      // Update local state
      setActiveBattles(updatedBattles);
      
      // Save to localStorage for other browsers to pick up
      localStorage.setItem('activeBattles', JSON.stringify(updatedBattles));
      
      // Update battle info
      setBattleInfo({
        battleCode,
        battleName: currentBattles[battleCode].battleName,
        betAmount,
        joiner: walletAddress
      });
      
      // Show battle arena
      setShowBattleArena(true);
      setShowWaitingRoom(false);
    } else {
      alert("Battle code not found. Please check and try again.");
    }
  };

  const handleExitBattle = () => {
    setShowBattleArena(false);
    setShowWaitingRoom(false);
    
    // Remove battle if creator exits
    if (battleInfo.creator === walletAddress) {
      const updatedBattles = {...activeBattles};
      delete updatedBattles[battleInfo.battleCode];
      
      setActiveBattles(updatedBattles);
      localStorage.setItem('activeBattles', JSON.stringify(updatedBattles));
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
