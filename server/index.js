const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const rooms = {};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('create-room', ({ playerName, maxPlayers, ruleset }) => {
    const code = generateCode();
    rooms[code] = {
      code,
      maxPlayers,
      ruleset,
      host: socket.id,
      players: [{ id: socket.id, name: playerName, isHost: true, isAI: false }],
      gameState: null
    };
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = playerName;
    socket.emit('room-created', { code, room: rooms[code] });
    console.log(`Room ${code} created by ${playerName}`);
  });

  socket.on('join-room', ({ code, playerName }) => {
    const room = rooms[code];
    if (!room) {
      socket.emit('join-error', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit('join-error', { message: 'Room is full.' });
      return;
    }
    if (room.gameState) {
      socket.emit('join-error', { message: 'Game already started.' });
      return;
    }

    room.players.push({ id: socket.id, name: playerName, isHost: false, isAI: false });
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = playerName;

    socket.emit('room-joined', { code, room });
    io.to(code).emit('lobby-updated', { players: room.players, maxPlayers: room.maxPlayers });
    console.log(`${playerName} joined room ${code}`);
  });

  socket.on('add-bot', ({ code }) => {
    const room = rooms[code];
    if (!room || socket.id !== room.host) return;
    if (room.players.length >= room.maxPlayers) return;

    const botNum = room.players.filter(p => p.isAI).length + 1;
    const bot = { id: `bot-${Date.now()}`, name: `Bot ${botNum}`, isHost: false, isAI: true };
    room.players.push(bot);
    io.to(code).emit('lobby-updated', { players: room.players, maxPlayers: room.maxPlayers });
  });

  socket.on('remove-bot', ({ code, botId }) => {
    const room = rooms[code];
    if (!room || socket.id !== room.host) return;
    room.players = room.players.filter(p => p.id !== botId);
    io.to(code).emit('lobby-updated', { players: room.players, maxPlayers: room.maxPlayers });
  });

  socket.on('start-game', ({ code }) => {
    const room = rooms[code];
    if (!room || socket.id !== room.host) return;
    if (room.players.length < 2) return;
    io.to(code).emit('game-starting', { players: room.players, ruleset: room.ruleset });
    console.log(`Game started in room ${code}`);
  });

  socket.on('state-update', ({ code, state }) => {
    const room = rooms[code];
    if (!room) return;
    room.gameState = state;
    socket.to(code).emit('state-synced', { state });
  });

  socket.on('player-action', ({ code, action }) => {
    const room = rooms[code];
    if (!room) return;
    io.to(room.host).emit('action-received', { from: socket.id, action });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code || !rooms[code]) return;
    const room = rooms[code];

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {
      delete rooms[code];
      console.log(`Room ${code} deleted (empty)`);
    } else if (socket.id === room.host) {
      const nextHost = room.players.find(p => !p.isAI);
      if (nextHost) {
        room.host = nextHost.id;
        nextHost.isHost = true;
        io.to(code).emit('host-changed', { newHostId: nextHost.id });
      }
      io.to(code).emit('lobby-updated', { players: room.players, maxPlayers: room.maxPlayers });
    } else {
      io.to(code).emit('lobby-updated', { players: room.players, maxPlayers: room.maxPlayers });
    }

    console.log(`${socket.data.playerName} disconnected from room ${code}`);
  });
});

app.get('/health', (_, res) => res.json({ status: 'ok', rooms: Object.keys(rooms).length }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`UNO server running on port ${PORT}`));
