const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app URL
    methods: ["GET", "POST"]
  }
});

// Store active battles in memory (replace with database in production)
const activeBattles = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new battle
  socket.on('createBattle', ({ battleCode, creator, betAmount }) => {
    activeBattles.set(battleCode, {
      creator,
      betAmount,
      status: 'waiting',
      players: [creator],
      decks: null,
      currentRound: 0,
      player1Score: 0,
      player2Score: 0,
      selectedProperty: null,
      player1Selection: null,
      player2Selection: null
    });
    
    socket.join(battleCode);
    console.log(`Battle created: ${battleCode}`);
  });

  // Join an existing battle
  socket.on('joinBattle', ({ battleCode, joiner }) => {
    const battle = activeBattles.get(battleCode);
    if (battle && battle.status === 'waiting') {
      battle.joiner = joiner;
      battle.players.push(joiner);
      battle.status = 'ready';
      
      socket.join(battleCode);
      io.to(battleCode).emit('battleUpdate', { ...battle, battleCode });
      console.log(`Player joined battle: ${battleCode}`);
    }
  });

  // Initialize decks
  socket.on('initializeDecks', ({ battleCode, decks }) => {
    const battle = activeBattles.get(battleCode);
    if (battle) {
      battle.decks = decks;
      io.to(battleCode).emit('decksInitialized', decks);
    }
  });

  // Handle card selection
  socket.on('selectCard', ({ battleCode, player, card }) => {
    const battle = activeBattles.get(battleCode);
    if (battle) {
      if (player === battle.creator) {
        battle.player1Selection = card;
      } else {
        battle.player2Selection = card;
      }
      
      io.to(battleCode).emit('cardSelected', {
        player,
        card: { ...card, isRevealed: false }
      });

      // If both players have selected, process the round
      if (battle.player1Selection && battle.player2Selection) {
        io.to(battleCode).emit('roundComplete', {
          player1Card: battle.player1Selection,
          player2Card: battle.player2Selection,
          property: battle.selectedProperty
        });
      }
    }
  });

  // Update game state
  socket.on('updateGameState', ({ battleCode, gameState }) => {
    const battle = activeBattles.get(battleCode);
    if (battle) {
      Object.assign(battle, gameState);
      io.to(battleCode).emit('gameStateUpdated', gameState);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Handle cleanup if needed
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 