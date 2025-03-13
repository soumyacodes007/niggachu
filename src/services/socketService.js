import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.battleListeners = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3001');
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  createBattle(battleCode, creator, betAmount) {
    this.socket.emit('createBattle', { battleCode, creator, betAmount });
  }

  joinBattle(battleCode, joiner) {
    this.socket.emit('joinBattle', { battleCode, joiner });
  }

  initializeDecks(battleCode, decks) {
    this.socket.emit('initializeDecks', { battleCode, decks });
  }

  selectCard(battleCode, player, card) {
    this.socket.emit('selectCard', { battleCode, player, card });
  }

  updateGameState(battleCode, gameState) {
    this.socket.emit('updateGameState', { battleCode, gameState });
  }

  // Listen for battle events
  onBattleUpdate(callback) {
    this.socket.on('battleUpdate', callback);
  }

  onDecksInitialized(callback) {
    this.socket.on('decksInitialized', callback);
  }

  onCardSelected(callback) {
    this.socket.on('cardSelected', callback);
  }

  onRoundComplete(callback) {
    this.socket.on('roundComplete', callback);
  }

  onGameStateUpdated(callback) {
    this.socket.on('gameStateUpdated', callback);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService(); 