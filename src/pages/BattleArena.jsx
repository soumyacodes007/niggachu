import { useState, useEffect } from 'react';
import { generateInitialDeck } from '../utils/pokemonUtils';

const BattleArena = ({ onExit, battleCode, battleName, betAmount, walletAddress }) => {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null); // Random property for the round
  const [player1Selection, setPlayer1Selection] = useState(null);
  const [player2Selection, setPlayer2Selection] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectionPhase, setSelectionPhase] = useState(true); // true = selecting cards, false = showing result
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Check if current player is creator or joiner
    const battle = JSON.parse(localStorage.getItem('activeBattles'))?.[battleCode];
    setIsCreator(battle?.creator === walletAddress);

    const initializeGame = async () => {
      setIsLoading(true);
      try {
        // Generate decks only if creator or if decks don't exist yet
        if (isCreator || !localStorage.getItem(`battle_${battleCode}_deck1`)) {
          const deck1 = await generateInitialDeck();
          const deck2 = await generateInitialDeck();
          
          localStorage.setItem(`battle_${battleCode}_deck1`, JSON.stringify(deck1));
          localStorage.setItem(`battle_${battleCode}_deck2`, JSON.stringify(deck2));
        }

        // Load decks from localStorage
        const deck1 = JSON.parse(localStorage.getItem(`battle_${battleCode}_deck1`));
        const deck2 = JSON.parse(localStorage.getItem(`battle_${battleCode}_deck2`));

        // Set initial decks based on player role
        if (isCreator) {
          setPlayer1Deck(deck1);
          setPlayer2Deck(deck2);
        } else {
          setPlayer1Deck(deck2);
          setPlayer2Deck(deck1);
        }
        
        setRandomProperty();
        setGameStarted(true);
      } catch (error) {
        console.error('Error initializing game:', error);
      }
      setIsLoading(false);
    };

    initializeGame();

    // Set up game state sync
    const syncInterval = setInterval(() => {
      syncGameState();
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      // Cleanup game data when component unmounts
      if (isCreator) {
        localStorage.removeItem(`battle_${battleCode}_deck1`);
        localStorage.removeItem(`battle_${battleCode}_deck2`);
        localStorage.removeItem(`battle_${battleCode}_state`);
      }
    };
  }, [battleCode, walletAddress, isCreator]);

  const setRandomProperty = () => {
        const properties = ['hp', 'attack', 'defense'];
        const randomProperty = properties[Math.floor(Math.random() * properties.length)];
    setSelectedProperty(randomProperty);
  };

  const handleCardSelect = (card) => {
    if (player1Selection) return;

    setPlayer1Selection(card);
    
    // Store selection based on player role
    const selectionKey = isCreator ? 'player1_selection' : 'player2_selection';
    localStorage.setItem(`battle_${battleCode}_${selectionKey}`, JSON.stringify(card));
  };

  const syncGameState = () => {
    const gameState = JSON.parse(localStorage.getItem(`battle_${battleCode}_state`)) || {};
    
    // Update game state based on stored data
    if (gameState.currentRound !== undefined) setCurrentRound(gameState.currentRound);
    if (gameState.selectedProperty) setSelectedProperty(gameState.selectedProperty);
    if (gameState.player1Score !== undefined) setPlayer1Score(gameState.player1Score);
    if (gameState.player2Score !== undefined) setPlayer2Score(gameState.player2Score);

    // Check for opponent's card selection
    const opponentKey = isCreator ? 'player2_selection' : 'player1_selection';
    const myKey = isCreator ? 'player1_selection' : 'player2_selection';
    
    const opponentSelection = localStorage.getItem(`battle_${battleCode}_${opponentKey}`);
    const mySelection = localStorage.getItem(`battle_${battleCode}_${myKey}`);
    
    // If both players have selected cards and we haven't processed the result yet
    if (opponentSelection && mySelection && !roundResult) {
      const opponentCard = JSON.parse(opponentSelection);
      const myCard = JSON.parse(mySelection);
      
      setPlayer2Selection(opponentCard);
      compareCards(myCard, opponentCard);
    }
  };

  const compareCards = (p1Card, p2Card) => {
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

    setPlayer1Score(newPlayer1Score);
    setPlayer2Score(newPlayer2Score);

    // Update game state in localStorage
    const gameState = {
      currentRound,
      selectedProperty,
      player1Score: newPlayer1Score,
      player2Score: newPlayer2Score,
    };
    localStorage.setItem(`battle_${battleCode}_state`, JSON.stringify(gameState));

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
        setPlayer1Deck(prev => prev.filter(card => card.id !== p1Card.id));
        setPlayer2Deck(prev => prev.filter(card => card.id !== p2Card.id));
        
        // Clear selections from localStorage
        localStorage.removeItem(`battle_${battleCode}_player1_selection`);
        localStorage.removeItem(`battle_${battleCode}_player2_selection`);
        
        // Reset for next round
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        setPlayer1Selection(null);
        setPlayer2Selection(null);
        setRoundResult(null);
        setRandomProperty();
        
        // Update game state
        localStorage.setItem(`battle_${battleCode}_state`, JSON.stringify({
          ...gameState,
          currentRound: nextRound,
        }));
      } else {
        setGameOver(true);
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

        {/* Card Selection Area */}
        <div className="mb-6">
          <h3 className="text-xl mb-4">
            {selectionPhase 
              ? 'Select your card for this round' 
              : 'Cards in play'}
          </h3>
          
          {/* Selected Cards Display */}
          {(player1Selection || player2Selection) && (
            <div className="flex justify-center gap-8 mb-6">
              {player1Selection && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <img 
                    src={player1Selection.image}
                    alt={player1Selection.name}
                    className="w-40 h-40"
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
              {player2Selection && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <img 
                    src={player2Selection.image}
                    alt={player2Selection.name}
                    className="w-40 h-40"
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
              </div>
            )}
          </div>
          )}

          {/* Available Cards */}
          {selectionPhase && (
            <div className="grid grid-cols-5 gap-4">
              {player1Deck.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardSelect(card)}
                  className={`bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors
                    ${player1Selection?.id === card.id ? 'ring-2 ring-pokemon-yellow' : ''}`}
                  disabled={!!player1Selection}
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
            )}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;