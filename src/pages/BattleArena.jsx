import { useState, useEffect } from 'react';
import { generateInitialDeck } from '../utils/pokemonUtils';

// Add card back image URL
const CARD_BACK_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

const BattleArena = ({ onExit, battleCode, battleName, betAmount, walletAddress }) => {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [player1Selection, setPlayer1Selection] = useState(null);
  const [player2Selection, setPlayer2Selection] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Get battle state key
  const getBattleStateKey = () => `battle_${battleCode}_state`;
  const getPlayer1SelectionKey = () => `battle_${battleCode}_player1_selection`;
  const getPlayer2SelectionKey = () => `battle_${battleCode}_player2_selection`;
  const getDecksKey = () => `battle_${battleCode}_decks`;

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
        // Only creator initializes the decks
        if (isCreatorPlayer) {
          const deck1 = await generateInitialDeck();
          const deck2 = await generateInitialDeck();
          
          const decks = { deck1, deck2 };
          localStorage.setItem(getDecksKey(), JSON.stringify(decks));
          
          // Initialize game state
          const initialState = {
            currentRound: 0,
            player1Score: 0,
            player2Score: 0,
            selectedProperty: getRandomProperty(),
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
            setPlayer1Deck(isCreatorPlayer ? decks.deck1 : decks.deck2);
            setPlayer2Deck(isCreatorPlayer ? decks.deck2 : decks.deck1);
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
      // Only creator cleans up the game data
      if (isCreatorPlayer) {
        localStorage.removeItem(getDecksKey());
        localStorage.removeItem(getBattleStateKey());
        localStorage.removeItem(getPlayer1SelectionKey());
        localStorage.removeItem(getPlayer2SelectionKey());
      }
    };
  }, [battleCode, walletAddress]);

  const getRandomProperty = () => {
    const properties = ['hp', 'attack', 'defense'];
    return properties[Math.floor(Math.random() * properties.length)];
  };

  const handleCardSelect = (card) => {
    if ((isCreator && player1Selection) || (!isCreator && player2Selection)) return;

    const selectionKey = isCreator ? getPlayer1SelectionKey() : getPlayer2SelectionKey();
    localStorage.setItem(selectionKey, JSON.stringify(card));

    if (isCreator) {
      setPlayer1Selection(card);
    } else {
      setPlayer2Selection(card);
    }
  };

  const syncGameState = () => {
    const gameState = JSON.parse(localStorage.getItem(getBattleStateKey()));
    if (!gameState) return;

    // Update game state
    setCurrentRound(gameState.currentRound);
    setSelectedProperty(gameState.selectedProperty);
    setPlayer1Score(gameState.player1Score);
    setPlayer2Score(gameState.player2Score);

    // Check for card selections
    const p1Selection = JSON.parse(localStorage.getItem(getPlayer1SelectionKey()));
    const p2Selection = JSON.parse(localStorage.getItem(getPlayer2SelectionKey()));

    if (isCreator) {
      setPlayer1Selection(p1Selection);
      setPlayer2Selection(p2Selection);
    } else {
      setPlayer1Selection(p2Selection);
      setPlayer2Selection(p1Selection);
    }

    // Process round if both players have selected
    if (p1Selection && p2Selection && !roundResult) {
      processRound(p1Selection, p2Selection);
    }
  };

  const processRound = (p1Card, p2Card) => {
    const p1Value = p1Card[selectedProperty];
    const p2Value = p2Card[selectedProperty];

    let result;
    let newPlayer1Score = player1Score;
    let newPlayer2Score = player2Score;

    if (p1Value > p2Value) {
      newPlayer1Score += 1;
      result = 'player1';
    } else if (p2Value > p1Value) {
      newPlayer2Score += 1;
      result = 'player2';
    } else {
      result = 'tie';
    }

    // Only creator updates the shared state
    if (isCreator) {
      const gameState = {
        currentRound,
        selectedProperty,
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        lastUpdate: Date.now()
      };
      localStorage.setItem(getBattleStateKey(), JSON.stringify(gameState));
    }

    setRoundResult({
      winner: result,
      property: selectedProperty,
      player1Value: p1Value,
      player2Value: p2Value
    });

    // Move to next round after delay
    setTimeout(() => {
      if (currentRound < 9) {
        // Remove selected cards from decks
        setPlayer1Deck(prev => prev.filter(card => card.id !== (isCreator ? p1Card.id : p2Card.id)));
        setPlayer2Deck(prev => prev.filter(card => card.id !== (isCreator ? p2Card.id : p1Card.id)));
        
        // Clear selections
        if (isCreator) {
          localStorage.removeItem(getPlayer1SelectionKey());
          localStorage.removeItem(getPlayer2SelectionKey());
          
          // Update game state for next round
          const gameState = {
            currentRound: currentRound + 1,
            selectedProperty: getRandomProperty(),
            player1Score: newPlayer1Score,
            player2Score: newPlayer2Score,
            lastUpdate: Date.now()
          };
          localStorage.setItem(getBattleStateKey(), JSON.stringify(gameState));
        }
        
        setPlayer1Selection(null);
        setPlayer2Selection(null);
        setRoundResult(null);
      } else {
        setGameOver(true);
        // Handle game over state
        if (isCreator) {
          const battle = JSON.parse(localStorage.getItem('activeBattles'))?.[battleCode];
          if (battle) {
            battle.status = 'completed';
            battle.winner = newPlayer1Score > newPlayer2Score ? battle.creator : battle.joiner;
            const battles = JSON.parse(localStorage.getItem('activeBattles'));
            battles[battleCode] = battle;
            localStorage.setItem('activeBattles', JSON.stringify(battles));
          }
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        {/* Debug Information */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4 text-sm font-mono">
          <h3 className="text-lg font-bold mb-2">Debug Info:</h3>
          <div>Battle Code: {battleCode}</div>
          <div>Your Address: {walletAddress}</div>
          <div>Role: {isCreator ? 'Creator (Player 1)' : 'Joiner (Player 2)'}</div>
          <div>Opponent Address: {opponent || 'Waiting for opponent...'}</div>
          <div>Game Started: {gameStarted ? 'Yes' : 'No'}</div>
          <div>Current Round: {currentRound + 1}/10</div>
          <div>Your Deck Size: {player1Deck.length}</div>
          <div>Opponent Deck Size: {player2Deck.length}</div>
        </div>

        {/* Add player role indicator */}
        <div className="text-center mb-4">
          <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
            {isCreator ? 'Player 1' : 'Player 2'}
          </span>
        </div>

        {/* Header with scores and round info */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl">Your Score: {player1Score}</div>
          <div>
            <div className="text-center text-xl mb-2">Round {currentRound + 1}/10</div>
            <div className="text-center text-lg text-pokemon-yellow">
              Comparing: {selectedProperty?.toUpperCase()}
        </div>
      </div>
          <div className="text-xl">Opponent Score: {player2Score}</div>
        </div>
        
        {/* Round Result Display */}
        {roundResult && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center">
            <h3 className="text-xl mb-2">Round Result</h3>
            <p className="mb-2">
              {selectedProperty}: {roundResult.player1Value} vs {roundResult.player2Value}
            </p>
            <p className={`text-lg ${
              roundResult.winner === 'player1' 
                ? 'text-green-400' 
                : roundResult.winner === 'player2' 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
            }`}>
              {roundResult.winner === 'player1' 
                ? 'You won this round!' 
                : roundResult.winner === 'player2' 
                  ? 'Opponent won this round!' 
                  : 'It\'s a tie!'}
            </p>
          </div>
        )}

        {/* Opponent's Cards (face down) */}
        <div className="mb-8">
          <h3 className="text-xl mb-4">Opponent's Cards</h3>
          <div className="grid grid-cols-5 gap-4">
            {player2Deck.map((card, index) => (
              <div
                key={card.id}
                className="bg-gray-800 p-2 rounded-lg relative transform hover:scale-105 transition-transform"
              >
                <img 
                  src={CARD_BACK_IMAGE}
                  alt="Card Back"
                  className="w-full h-32 object-contain opacity-90"
                />
                {player2Selection?.id === card.id && (
                  <div className="absolute inset-0 border-2 border-pokemon-yellow rounded-lg"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Cards in Play */}
        {(player1Selection || player2Selection) && (
          <div className="my-8">
            <h3 className="text-xl mb-4">Cards in Play</h3>
            <div className="flex justify-center gap-8">
              {/* Your Selected Card */}
              {player1Selection && (
                <div className="bg-gray-800 p-4 rounded-lg transform transition-transform hover:scale-105">
                  <img 
                    src={player1Selection.image}
                    alt={player1Selection.name}
                    className="w-40 h-40 object-contain"
                  />
                  <h4 className="text-lg font-bold capitalize mt-2">
                    {player1Selection.name}
                  </h4>
                  <p className={getRarityColor(player1Selection.rarity)}>
                    {player1Selection.rarity}
                  </p>
                  <p>
                    {selectedProperty}: {player1Selection[selectedProperty]}
                  </p>
                </div>
              )}

              {/* VS Indicator */}
              {player1Selection && player2Selection && (
                <div className="flex items-center">
                  <span className="text-4xl text-pokemon-yellow font-bold">VS</span>
                </div>
              )}

              {/* Opponent's Selected Card */}
              {player2Selection && (
                <div className="bg-gray-800 p-4 rounded-lg transform transition-transform hover:scale-105">
                  {roundResult ? (
                    <>
                      <img 
                        src={player2Selection.image}
                        alt={player2Selection.name}
                        className="w-40 h-40 object-contain"
                      />
                      <h4 className="text-lg font-bold capitalize mt-2">
                        {player2Selection.name}
                      </h4>
                      <p className={getRarityColor(player2Selection.rarity)}>
                        {player2Selection.rarity}
                      </p>
                      <p>
                        {selectedProperty}: {player2Selection[selectedProperty]}
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
          <h3 className="text-xl mb-4">Your Cards</h3>
          <div className="grid grid-cols-5 gap-4">
            {player1Deck.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className={`bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors
                  ${player1Selection?.id === card.id ? 'ring-2 ring-pokemon-yellow' : ''}
                  ${!isCreator && player2Selection ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!!player1Selection || (!isCreator && player2Selection)}
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <h2 className="text-3xl mb-4">Game Over!</h2>
              <p className="text-xl mb-4">
                {player1Score > player2Score 
                  ? 'You Won!' 
                  : player2Score > player1Score 
                    ? 'Opponent Won!' 
                    : 'It\'s a Tie!'}
              </p>
              <p className="mb-4">
                Final Score: {player1Score} - {player2Score}
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
  );
};

export default BattleArena;