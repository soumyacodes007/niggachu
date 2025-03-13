import { useState, useEffect } from 'react';
import { generateInitialDeck } from '../utils/pokemonUtils';
import { motion } from 'framer-motion';

// Add card back image URL
const CARD_BACK_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

// Add some battle effect images
const BATTLE_EFFECTS = {
  ATTACK: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-claw.png",
  DEFENSE: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hard-stone.png",
  HP: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png"
};

const BattleArena = ({ onExit, battleCode, battleName, betAmount, walletAddress, contractInstance }) => {
  const [playerDeck, setPlayerDeck] = useState([]);
  const [opponentDeck, setOpponentDeck] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [playerSelection, setPlayerSelection] = useState(null);
  const [opponentSelection, setOpponentSelection] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('creator');
  const [battleAnimation, setBattleAnimation] = useState(false);
  const [resultAnimation, setResultAnimation] = useState(false);

  // Error handling state
  const [hasError, setHasError] = useState(false);

  // Get battle state key
  const getBattleStateKey = () => `battle_${battleCode}_state`;
  const getCreatorSelectionKey = () => `battle_${battleCode}_creator_selection`;
  const getJoinerSelectionKey = () => `battle_${battleCode}_joiner_selection`;
  const getDecksKey = () => `battle_${battleCode}_decks`;

  // Check if it's this player's turn
  const isMyTurn = () => {
    if (isCreator) {
      return currentTurn === 'creator';
    } else {
      return currentTurn === 'joiner';
    }
  };

  useEffect(() => {
    const verifyBattleStatus = async () => {
      if (contractInstance && battleCode) {
        try {
          // Verify the battle exists on the blockchain
          const battleExists = await contractInstance.methods.battleExists(battleCode).call();
          const battleDetails = await contractInstance.methods.getBattleInfo(battleCode).call();
          
          console.log("Battle verification:", { battleExists, battleDetails });
          
          if (!battleExists) {
            alert("This battle no longer exists on the blockchain!");
            onExit();
            return;
          }
          
          // Determine player roles based on blockchain data
          if (battleDetails.creator.toLowerCase() === walletAddress.toLowerCase()) {
            setPlayerRole('creator');
          } else if (battleDetails.joiner.toLowerCase() === walletAddress.toLowerCase()) {
            setPlayerRole('joiner');
          } else {
            alert("You are not a participant in this battle!");
            onExit();
          }
          
          // Initialize game with contract data
          setCurrentTurn(battleDetails.currentTurn);
        } catch (error) {
          console.error("Error verifying battle status:", error);
        }
      }
    };
    
    verifyBattleStatus();
  }, [contractInstance, battleCode, walletAddress]);

  useEffect(() => {
    const battle = JSON.parse(localStorage.getItem('activeBattles'))?.[battleCode];
    if (!battle) {
      console.error('Battle not found!');
      onExit();
      return;
    }

    // Add debug logging
    console.log('Battle State:', {
      battleCode,
      battle,
      walletAddress,
      isCreator: battle.creator === walletAddress,
      opponent: battle.creator === walletAddress ? battle.joiner : battle.creator
    });

    const isCreatorPlayer = battle.creator === walletAddress;
    setIsCreator(isCreatorPlayer);
    setOpponent(isCreatorPlayer ? battle.joiner : battle.creator);

    const initializeGame = async () => {
      setIsLoading(true);
      try {
        // Only creator initializes the decks and game state
        if (isCreatorPlayer) {
          const deck1 = await generateInitialDeck();
          const deck2 = await generateInitialDeck();
          
          const decks = { deck1, deck2 };
          localStorage.setItem(getDecksKey(), JSON.stringify(decks));
          
          // Initialize game state with turn information
          const initialState = {
            currentRound: 0,
            creatorScore: 0,
            joinerScore: 0,
            selectedProperty: getRandomProperty(),
            currentTurn: 'creator', // Always start with creator
            lastUpdate: Date.now()
          };
          localStorage.setItem(getBattleStateKey(), JSON.stringify(initialState));
        }

        // Wait for decks to be available
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          const decks = JSON.parse(localStorage.getItem(getDecksKey()));
          if (decks) {
            if (isCreatorPlayer) {
              setPlayerDeck(decks.deck1);
              setOpponentDeck(decks.deck2);
        } else {
              setPlayerDeck(decks.deck2);
              setOpponentDeck(decks.deck1);
            }
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }

        setGameStarted(true);
      } catch (error) {
        console.error('Error initializing game:', error);
      }
      setIsLoading(false);
    };

    initializeGame();

    // Set up game state sync
    const syncInterval = setInterval(syncGameState, 1000);

    return () => {
      clearInterval(syncInterval);
      if (isCreatorPlayer) {
        localStorage.removeItem(getDecksKey());
        localStorage.removeItem(getBattleStateKey());
        localStorage.removeItem(getCreatorSelectionKey());
        localStorage.removeItem(getJoinerSelectionKey());
      }
    };
  }, [battleCode, walletAddress]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error) => {
      console.error("Animation error:", error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const getRandomProperty = () => {
        const properties = ['hp', 'attack', 'defense'];
    return properties[Math.floor(Math.random() * properties.length)];
  };

  const handleCardSelect = (card) => {
    console.log("Card selected:", card.name);
    console.log("Is my turn:", isMyTurn());
    console.log("Current turn:", currentTurn);
    console.log("Is creator:", isCreator);
    
    // Check if it's player's turn
    if (!isMyTurn()) {
      console.log("Not your turn!");
      return;
    }

    // Check if player has already selected
    if (playerSelection) {
      console.log("You've already selected a card!");
      return;
    }

    // Store the selection in localStorage with the correct key
    const selectionKey = isCreator ? getCreatorSelectionKey() : getJoinerSelectionKey();
    localStorage.setItem(selectionKey, JSON.stringify(card));
    console.log("Selection saved with key:", selectionKey);

    // Update local state
    setPlayerSelection(card);

    // Update game state with new turn
    const gameState = JSON.parse(localStorage.getItem(getBattleStateKey()));
    if (gameState) {
      const newTurn = isCreator ? 'joiner' : 'creator';
      const newGameState = {
        ...gameState,
        currentTurn: newTurn,
        lastUpdate: Date.now()
      };
      localStorage.setItem(getBattleStateKey(), JSON.stringify(newGameState));
      console.log("Turn changed to:", newTurn);
    }
  };

  const syncGameState = () => {
    const gameState = JSON.parse(localStorage.getItem(getBattleStateKey()));
    if (!gameState) return;

    // Update game state
    setCurrentRound(gameState.currentRound);
    setSelectedProperty(gameState.selectedProperty);
    setCurrentTurn(gameState.currentTurn);
    
    // Update scores based on player role
    if (isCreator) {
      setPlayerScore(gameState.creatorScore);
      setOpponentScore(gameState.joinerScore);
    } else {
      setPlayerScore(gameState.joinerScore);
      setOpponentScore(gameState.creatorScore);
    }

    // Get selections from localStorage
    const creatorSelection = JSON.parse(localStorage.getItem(getCreatorSelectionKey()));
    const joinerSelection = JSON.parse(localStorage.getItem(getJoinerSelectionKey()));

    // Update local selection state based on player role
    if (isCreator) {
      setPlayerSelection(creatorSelection);
      setOpponentSelection(joinerSelection);
    } else {
      setPlayerSelection(joinerSelection);
      setOpponentSelection(creatorSelection);
    }

    // Process round if both players have selected and no result yet
    if (creatorSelection && joinerSelection && !roundResult) {
      processRound(creatorSelection, joinerSelection);
    }
  };

  const processRound = (creatorCard, joinerCard) => {
    try {
      // Debug the property values being compared
      console.log("Round comparison:", {
        property: selectedProperty,
        creatorCard,
        joinerCard,
        creatorValue: creatorCard[selectedProperty],
        joinerValue: joinerCard[selectedProperty]
      });

      const creatorValue = creatorCard[selectedProperty];
      const joinerValue = joinerCard[selectedProperty];

      let winner;
      // Make sure we're getting the current scores from state or localStorage
      const gameState = JSON.parse(localStorage.getItem(getBattleStateKey()));
      let newCreatorScore = gameState.creatorScore;
      let newJoinerScore = gameState.joinerScore;

      // Ensure we're comparing numbers, not strings
      const numCreatorValue = Number(creatorValue);
      const numJoinerValue = Number(joinerValue);

      console.log("Comparing values:", numCreatorValue, "vs", numJoinerValue);

      if (numCreatorValue > numJoinerValue) {
        newCreatorScore += 1;
        winner = 'creator';
        console.log("Creator wins this round");
      } else if (numJoinerValue > numCreatorValue) {
        newJoinerScore += 1;
        winner = 'joiner';
        console.log("Joiner wins this round");
    } else {
        winner = 'tie';
        console.log("Round is a tie");
      }

      // Start battle animation sequence with safer timing
      setBattleAnimation(true);
      
      setTimeout(() => {
        try {
          setBattleAnimation(false);
          setResultAnimation(true);
          
          // Set round result for display
    setRoundResult({
            winner,
      property: selectedProperty,
            creatorValue: numCreatorValue,
            joinerValue: numJoinerValue
          });

          // Update scores in local state based on player role
          if (isCreator) {
            setPlayerScore(newCreatorScore);
            setOpponentScore(newJoinerScore);
          } else {
            setPlayerScore(newJoinerScore);
            setOpponentScore(newCreatorScore);
          }

          // Log the updated scores for debugging
          console.log("Updated scores:", {
            creatorScore: newCreatorScore,
            joinerScore: newJoinerScore,
            isCreator,
            playerScore: isCreator ? newCreatorScore : newJoinerScore,
            opponentScore: isCreator ? newJoinerScore : newCreatorScore
          });
        } catch (error) {
          console.error("Animation error:", error);
          setHasError(true);
        }
      }, 1500);

    // Move to next round after delay
    setTimeout(() => {
        try {
          setResultAnimation(false);
          
      if (currentRound < 9) {
            // Clear selections
            localStorage.removeItem(getCreatorSelectionKey());
            localStorage.removeItem(getJoinerSelectionKey());
            
            // Update game state for next round
            const gameState = {
              currentRound: currentRound + 1,
              creatorScore: newCreatorScore,
              joinerScore: newJoinerScore,
              selectedProperty: getRandomProperty(),
              currentTurn: 'creator', // Reset turn to creator for next round
              lastUpdate: Date.now()
            };
            localStorage.setItem(getBattleStateKey(), JSON.stringify(gameState));

            // Update decks by removing the selected cards
            if (isCreator) {
              setPlayerDeck(prev => prev.filter(card => card.id !== creatorCard.id));
              if (opponentSelection) {
                setOpponentDeck(prev => prev.filter(card => card.id !== joinerCard.id));
              }
            } else {
              setPlayerDeck(prev => prev.filter(card => card.id !== joinerCard.id));
              if (opponentSelection) {
                setOpponentDeck(prev => prev.filter(card => card.id !== creatorCard.id));
              }
            }

            // Reset local state
            setPlayerSelection(null);
            setOpponentSelection(null);
        setRoundResult(null);
            setCurrentRound(prev => prev + 1);
      } else {
        setGameOver(true);
            // Handle game over state
            const battle = JSON.parse(localStorage.getItem('activeBattles'))?.[battleCode];
            if (battle) {
              // Determine the winner based on final scores from the game state
              const finalGameState = JSON.parse(localStorage.getItem(getBattleStateKey()));
              console.log("Final game state:", finalGameState);
              
              let winnerAddress;
              if (finalGameState.creatorScore > finalGameState.joinerScore) {
                winnerAddress = battle.creator;
                console.log("Creator wins the game");
              } else if (finalGameState.joinerScore > finalGameState.creatorScore) {
                winnerAddress = battle.joiner;
                console.log("Joiner wins the game");
              } else {
                // Handle tie
                winnerAddress = 'tie';
                console.log("Game ended in a tie");
              }
              
              battle.status = 'completed';
              battle.winner = winnerAddress;
              battle.finalScores = {
                creator: finalGameState.creatorScore,
                joiner: finalGameState.joinerScore
              };
              
              const battles = JSON.parse(localStorage.getItem('activeBattles'));
              battles[battleCode] = battle;
              localStorage.setItem('activeBattles', JSON.stringify(battles));
              
              // If there's a clear winner, trigger the smart contract to distribute rewards
              if (winnerAddress !== 'tie') {
                console.log(`Triggering smart contract to pay ${winnerAddress}`);
                distributePrize(winnerAddress, battleCode, battle.betAmount);
              } else {
                // If it's a tie, return the bet amounts to both players
                console.log("It's a tie! Returning bet amounts to both players");
                refundBets(battle.creator, battle.joiner, battleCode, battle.betAmount);
              }
            }
          }
        } catch (error) {
          console.error("Round transition error:", error);
          setHasError(true);
        }
      }, 3000);
    } catch (error) {
      console.error("Process round error:", error);
      setHasError(true);
    }
  };

  // Function to interact with smart contract to distribute the prize
  const distributePrize = async (winnerAddress, battleCode, betAmount) => {
    try {
      if (!window.ethereum) {
        console.error("Ethereum provider not available");
        return;
      }
      
      // Get the battle contract instance
      const contract = await getBattleContract();
      
      if (isCreator) {
        // Only creator triggers the distribution to prevent duplicate calls
        console.log(`Distributing ${betAmount} ETH to winner: ${winnerAddress}`);
        await contract.methods.distributePrize(battleCode, winnerAddress).send({
          from: walletAddress,
          gas: 200000
        });
        console.log("Prize distribution successful");
      }
    } catch (error) {
      console.error("Error distributing prize:", error);
    }
  };

  // Function to refund bets in case of tie
  const refundBets = async (creatorAddress, joinerAddress, battleCode, betAmount) => {
    try {
      if (!window.ethereum) {
        console.error("Ethereum provider not available");
        return;
      }
      
      // Get the battle contract instance
      const contract = await getBattleContract();
      
      if (isCreator) {
        // Only creator triggers the refund to prevent duplicate calls
        console.log(`Refunding ${betAmount} ETH to each player due to tie`);
        await contract.methods.refundBets(battleCode, creatorAddress, joinerAddress).send({
          from: walletAddress,
          gas: 200000
        });
        console.log("Refund successful");
      }
    } catch (error) {
      console.error("Error refunding bets:", error);
    }
  };

  // Function to get the battle contract instance
  const getBattleContract = async () => {
    const web3 = new window.Web3(window.ethereum);
    return new web3.eth.Contract(
      PokemonBattleABI,
      POKEMON_BATTLE_CONTRACT_ADDRESS
    );
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-400';
      case 'ULTRA_RARE': return 'text-purple-400';
      case 'RARE': return 'text-blue-400';
      case 'UNCOMMON': return 'text-green-400';
      case 'COMMON': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getWinnerMessage = () => {
    if (!roundResult) return '';

    const didIWin = (isCreator && roundResult.winner === 'creator') || 
                   (!isCreator && roundResult.winner === 'joiner');

    return didIWin ? 'You won this round!' : 
           roundResult.winner === 'tie' ? 'It\'s a tie!' : 
           'Opponent won this round!';
  };

  const getWinnerClass = () => {
    if (!roundResult) return '';

    const didIWin = (isCreator && roundResult.winner === 'creator') || 
                   (!isCreator && roundResult.winner === 'joiner');

    return didIWin ? 'text-green-400' : 
           roundResult.winner === 'tie' ? 'text-yellow-400' : 
           'text-red-400';
  };

  // If we have an error, show a simpler UI to recover
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <h2 className="text-xl mb-4">Something went wrong with animations</h2>
          <p className="mb-4">We've encountered an issue with the battle animations.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-pokemon-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Reload Game
          </button>
          <button 
            onClick={onExit} 
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ml-4"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pokemon-yellow mb-4"></div>
          <p className="text-xl">Loading Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 min-w-full min-h-full object-cover z-0 opacity-50"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-black bg-opacity-70 text-white p-4">
      <div className="container mx-auto">
          {/* Debug Information */}
          <div className="bg-gray-800 bg-opacity-90 p-4 rounded-lg mb-4 text-sm font-mono">
            <h3 className="text-lg font-bold mb-2">Debug Info:</h3>
            <div>Battle Code: {battleCode}</div>
            <div>Your Address: {walletAddress}</div>
            <div>Role: {isCreator ? 'Creator' : 'Joiner'}</div>
            <div>Current Turn: {currentTurn}</div>
            <div>Is My Turn: {isMyTurn() ? 'Yes' : 'No'}</div>
            <div>Opponent Address: {opponent || 'Waiting for opponent...'}</div>
            <div>Game Started: {gameStarted ? 'Yes' : 'No'}</div>
            <div>Current Round: {currentRound + 1}/10</div>
            <div>Your Deck Size: {playerDeck.length}</div>
            <div>Opponent Deck Size: {opponentDeck.length}</div>
            {selectedProperty && <div>Current Property: {selectedProperty}</div>}
            {roundResult && <div>Last Round Winner: {roundResult.winner}</div>}
          </div>

          {/* Player role indicator */}
          <div className="text-center mb-4">
            <span className="bg-gray-800 bg-opacity-90 px-3 py-1 rounded-full text-sm">
              {isCreator ? 'Creator' : 'Joiner'}
            </span>
          </div>

          {/* Turn indicator */}
        <div className="text-center mb-4">
            <span className={`px-4 py-2 rounded-full ${
              isMyTurn() 
                ? 'bg-pokemon-red text-white' 
                : 'bg-gray-800 bg-opacity-90 text-gray-400'
            }`}>
              {isMyTurn() ? "Your Turn!" : "Opponent's Turn"}
          </span>
        </div>

        {/* Header with scores and round info */}
        <div className="flex justify-between items-center mb-6">
            <div className="text-xl bg-gray-800 bg-opacity-90 px-4 py-2 rounded">Your Score: {playerScore}</div>
            <div className="text-center">
              <div className="text-xl mb-2 bg-gray-800 bg-opacity-90 px-4 py-2 rounded">Round {currentRound + 1}/10</div>
              <div className="text-lg text-pokemon-yellow bg-gray-800 bg-opacity-90 px-4 py-2 rounded">
              Comparing: {selectedProperty?.toUpperCase()}
        </div>
      </div>
            <div className="text-xl bg-gray-800 bg-opacity-90 px-4 py-2 rounded">Opponent Score: {opponentScore}</div>
        </div>
        
        {/* Round Result Display */}
        {roundResult && (
            <div className="bg-gray-800 bg-opacity-90 p-4 rounded-lg mb-6 text-center">
            <h3 className="text-xl mb-2">Round Result</h3>
            <p className="mb-2">
                {selectedProperty?.toUpperCase()}: 
                <span className="font-bold ml-1">
                  {isCreator ? roundResult.creatorValue : roundResult.joinerValue}
                </span> 
                <span className="mx-2">vs</span> 
                <span className="font-bold">
                  {isCreator ? roundResult.joinerValue : roundResult.creatorValue}
                </span>
              </p>
              <p className={`text-lg ${getWinnerClass()} font-bold`}>
                {getWinnerMessage()}
            </p>
          </div>
        )}

          {/* Opponent's Cards (face down) */}
          <div className="mb-8">
            <h3 className="text-xl mb-4 bg-gray-800 bg-opacity-90 px-4 py-2 rounded inline-block">Opponent's Cards</h3>
            <div className="grid grid-cols-5 gap-4">
              {opponentDeck.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-gray-800 p-2 rounded-lg relative transform hover:scale-105 transition-transform"
                >
                  <img 
                    src={CARD_BACK_IMAGE}
                    alt="Card Back"
                    className="w-full h-32 object-contain opacity-90"
                  />
                  {opponentSelection?.id === card.id && (
                    <div className="absolute inset-0 border-2 border-pokemon-yellow rounded-lg"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Cards in Play */}
          {(playerSelection || opponentSelection) && (
            <div className="my-8">
              <h3 className="text-xl mb-4 bg-gray-800 bg-opacity-90 px-4 py-2 rounded inline-block">Cards in Play</h3>
              <div className="flex justify-center gap-8 items-center">
                {/* Your Selected Card */}
                {playerSelection && (
                  <motion.div 
                    className="bg-gray-800 p-4 rounded-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ 
                      scale: battleAnimation ? 1.05 : 1, 
                      x: battleAnimation ? -10 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={playerSelection.image}
                      alt={playerSelection.name}
                      className="w-40 h-40 object-contain"
                  />
                  <h4 className="text-lg font-bold capitalize mt-2">
                      {playerSelection.name}
                  </h4>
                    <p className={getRarityColor(playerSelection.rarity)}>
                      {playerSelection.rarity}
                    </p>
                    {/* Simplified stat display */}
                    <p className={selectedProperty === "attack" ? "text-red-400 font-bold" : ""}>
                      Attack: {playerSelection.attack}
                    </p>
                    <p className={selectedProperty === "defense" ? "text-blue-400 font-bold" : ""}>
                      Defense: {playerSelection.defense}
                    </p>
                    <p className={selectedProperty === "hp" ? "text-green-400 font-bold" : ""}>
                      HP: {playerSelection.hp}
                    </p>
                  </motion.div>
                )}

                {/* VS and Battle Effects - Simplified */}
                <div className="flex flex-col items-center justify-center relative">
                  {playerSelection && opponentSelection && (
                    <>
                      <motion.span 
                        className="text-4xl text-pokemon-yellow font-bold"
                        animate={{ 
                          scale: battleAnimation ? [1, 1.2, 0.8] : 1,
                          opacity: battleAnimation ? 0.7 : 1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        VS
                      </motion.span>
                      
                      {/* Simplified battle effect */}
                      {battleAnimation && (
                        <motion.div 
                          className="absolute"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <img 
                            src={BATTLE_EFFECTS[selectedProperty?.toUpperCase()]} 
                            alt="Battle Effect" 
                            className="w-16 h-16 object-contain"
                          />
                        </motion.div>
                      )}

                      {/* Result indicator - simplified */}
                      {resultAnimation && roundResult && (
                        <motion.div 
                          className={`absolute top-0 text-xl font-bold ${
                            roundResult.winner === 'tie' 
                              ? 'text-yellow-400' 
                              : ((isCreator && roundResult.winner === 'creator') || 
                                 (!isCreator && roundResult.winner === 'joiner')) 
                                ? 'text-green-400' 
                                : 'text-red-400'
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {roundResult.winner === 'tie' 
                            ? 'TIE!' 
                            : ((isCreator && roundResult.winner === 'creator') || 
                               (!isCreator && roundResult.winner === 'joiner')) 
                              ? 'WIN!' 
                              : 'LOSE!'}
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Opponent's Selected Card - Simplified */}
                {opponentSelection && (
                  <motion.div 
                    className="bg-gray-800 p-4 rounded-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ 
                      scale: battleAnimation ? 1.05 : 1, 
                      x: battleAnimation ? 10 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {roundResult ? (
                      <>
                        <img 
                          src={opponentSelection.image}
                          alt={opponentSelection.name}
                          className="w-40 h-40 object-contain"
                  />
                  <h4 className="text-lg font-bold capitalize mt-2">
                          {opponentSelection.name}
                  </h4>
                        <p className={getRarityColor(opponentSelection.rarity)}>
                          {opponentSelection.rarity}
                        </p>
                        {/* Simplified stat display */}
                        <p className={selectedProperty === "attack" ? "text-red-400 font-bold" : ""}>
                          Attack: {opponentSelection.attack}
                        </p>
                        <p className={selectedProperty === "defense" ? "text-blue-400 font-bold" : ""}>
                          Defense: {opponentSelection.defense}
                        </p>
                        <p className={selectedProperty === "hp" ? "text-green-400 font-bold" : ""}>
                          HP: {opponentSelection.hp}
                        </p>
                      </>
                    ) : (
                      <>
                        <img 
                          src={CARD_BACK_IMAGE}
                          alt="Card Back"
                          className="w-40 h-40 object-contain"
                        />
                        <p className="text-center mt-2">Waiting for reveal...</p>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
          </div>
          )}

          {/* Your Cards (face up) */}
          <div className="mt-8">
            <h3 className="text-xl mb-4 bg-gray-800 bg-opacity-90 px-4 py-2 rounded inline-block">
              Your Cards {!isMyTurn() && '(Waiting for opponent...)'}
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {playerDeck.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardSelect(card)}
                  className={`bg-gray-800 p-2 rounded-lg transition-colors
                    ${playerSelection?.id === card.id ? 'ring-2 ring-pokemon-yellow' : ''}
                    ${!isMyTurn() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}
                    ${playerSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isMyTurn() || !!playerSelection}
                >
                  <img 
                    src={card.image}
                    alt={card.name}
                    className="w-full h-32 object-contain"
                  />
                  <h4 className="text-sm font-bold capitalize mt-2">
                    {card.name}
                  </h4>
                  <p className={`text-sm ${getRarityColor(card.rarity)}`}>
                    {card.rarity}
                  </p>
                  <div className="text-sm mt-1">
                    HP: {card.hp} | ATK: {card.attack} | DEF: {card.defense}
                  </div>
                </button>
              ))}
              </div>
          </div>

          {/* Game Over Display */}
          {gameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <h2 className="text-3xl mb-4">Game Over!</h2>
                <p className="text-xl mb-4">
                  {playerScore > opponentScore 
                    ? 'You Won!' 
                    : opponentScore > playerScore 
                      ? 'Opponent Won!' 
                      : 'It\'s a Tie!'}
                </p>
                <p className="mb-4">
                  Final Score: {playerScore} - {opponentScore}
                </p>
                {playerScore > opponentScore && (
                  <p className="text-green-400 mb-4">
                    You will receive {2 * betAmount} ETH as reward!
                  </p>
                )}
                {opponentScore > playerScore && (
                  <p className="text-red-400 mb-4">
                    Your opponent wins the {2 * betAmount} ETH wager.
                  </p>
                )}
                {playerScore === opponentScore && (
                  <p className="text-yellow-400 mb-4">
                    Game tied - your {betAmount} ETH will be refunded.
                  </p>
                )}
                <button
                  onClick={onExit}
                  className="bg-pokemon-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Return to Lobby
                </button>
              </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;