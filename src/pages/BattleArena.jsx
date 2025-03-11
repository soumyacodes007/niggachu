import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const BattleArena = ({ onExit, battleCode, battleName, betAmount, walletAddress }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [player1Cards, setPlayer1Cards] = useState([]);
  const [player2Cards, setPlayer2Cards] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(1); // 1 or 2
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [roundResult, setRoundResult] = useState(null);
  const [isPlayer2Connected, setIsPlayer2Connected] = useState(false);
  
  // Fetch Pokemon cards on component mount
  useEffect(() => {
    const fetchPokemonCards = async () => {
      try {
        // Get 20 random Pokemon (10 for each player)
        const randomIds = Array.from({ length: 20 }, () => 
          Math.floor(Math.random() * 150) + 1
        );
        
        const pokemonPromises = randomIds.map(id => 
          axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        );
        
        const responses = await Promise.all(pokemonPromises);
        
        const pokemonCards = responses.map(response => {
          const pokemon = response.data;
          return {
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.other['official-artwork'].front_default,
            hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
            attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
            defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat
          };
        });
        
        // Split cards between players
        setPlayer1Cards(pokemonCards.slice(0, 10));
        setPlayer2Cards(pokemonCards.slice(10, 20));
        
        // In a real app, you'd use WebSockets to connect players
        // For demo purposes, we'll simulate player 2 joining after 3 seconds
        setTimeout(() => {
          setIsPlayer2Connected(true);
          setGameState('playing');
        }, 3000);
        
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
      }
    };
    
    fetchPokemonCards();
  }, []);
  
  const handleSelectProperty = (property) => {
    if (currentTurn === 1) {
      setSelectedProperty(property);
      playRound(property);
    }
  };
  
  const playRound = (property) => {
    if (currentRound >= 10) return;
    
    const player1Card = player1Cards[currentRound];
    const player2Card = player2Cards[currentRound];
    
    let winner;
    if (player1Card[property] > player2Card[property]) {
      winner = 1;
      setPlayer1Score(prev => prev + 10);
    } else if (player1Card[property] < player2Card[property]) {
      winner = 2;
      setPlayer2Score(prev => prev + 10);
    } else {
      winner = 0; // Draw
      setPlayer1Score(prev => prev + 5);
      setPlayer2Score(prev => prev + 5);
    }
    
    setRoundResult({
      player1Card,
      player2Card,
      property,
      winner
    });
    
    // Next turn
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
    
    // If it was player 2's turn, advance to next round
    if (currentTurn === 2) {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        if (currentRound + 1 >= 10) {
          setGameState('finished');
        }
      }, 2000);
    }
    
    // Simulate player 2's turn
    if (currentTurn === 1) {
      setTimeout(() => {
        const properties = ['hp', 'attack', 'defense'];
        const randomProperty = properties[Math.floor(Math.random() * properties.length)];
        playRound(randomProperty);
      }, 2000);
    }
  };
  
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
};

export default BattleArena;