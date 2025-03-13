import { useState, useEffect } from 'react';
import { generateInitialDeck } from '../utils/pokemonUtils';

// Add card back image URL
const CARD_BACK_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

const BattleArena = ({ onExit, battleCode, battleName, betAmount, walletAddress }) => {
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
    const creatorValue = creatorCard[selectedProperty];
    const joinerValue = joinerCard[selectedProperty];

    let winner;
    let newCreatorScore = isCreator ? playerScore : opponentScore;
    let newJoinerScore = isCreator ? opponentScore : playerScore;

    if (creatorValue > joinerValue) {
      newCreatorScore += 1;
      winner = 'creator';
    } else if (joinerValue > creatorValue) {
      newJoinerScore += 1;
      winner = 'joiner';
    } else {
      winner = 'tie';
    }

    // Set round result for display
    setRoundResult({
      winner,
      property: selectedProperty,
      creatorValue,
      joinerValue
    });

    // Update scores in local state based on player role
    if (isCreator) {
      setPlayerScore(newCreatorScore);
      setOpponentScore(newJoinerScore);
    } else {
      setPlayerScore(newJoinerScore);
      setOpponentScore(newCreatorScore);
    }

    // Move to next round after delay
    setTimeout(() => {
      if (currentRound < 9) {
        // Clear selections
        localStorage.removeItem(getCreatorSelectionKey());
        localStorage.removeItem(getJoinerSelectionKey());
        
        // Update game state for next round (only creator needs to do this)
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
          battle.status = 'completed';
          battle.winner = newCreatorScore > newJoinerScore ? battle.creator : battle.joiner;
          const battles = JSON.parse(localStorage.getItem('activeBattles'));
          battles[battleCode] = battle;
          localStorage.setItem('activeBattles', JSON.stringify(battles));
        }
      }
    }, 3000);
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
                {selectedProperty}: {isCreator ? roundResult.creatorValue : roundResult.joinerValue} vs {isCreator ? roundResult.joinerValue : roundResult.creatorValue}
              </p>
              <p className={`text-lg ${getWinnerClass()}`}>
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
              <div className="flex justify-center gap-8">
                {/* Your Selected Card */}
                {playerSelection && (
                  <div className="bg-gray-800 p-4 rounded-lg transform transition-transform hover:scale-105">
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
                    <p>
                      {selectedProperty}: {playerSelection[selectedProperty]}
                    </p>
                  </div>
                )}

                {/* VS Indicator */}
                {playerSelection && opponentSelection && (
                  <div className="flex items-center">
                    <span className="text-4xl text-pokemon-yellow font-bold">VS</span>
                  </div>
                )}

                {/* Opponent's Selected Card */}
                {opponentSelection && (
                  <div className="bg-gray-800 p-4 rounded-lg transform transition-transform hover:scale-105">
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
                        <p>
                          {selectedProperty}: {opponentSelection[selectedProperty]}
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
                  </div>
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