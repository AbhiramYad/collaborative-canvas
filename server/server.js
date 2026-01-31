/*const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure allowed origins for production
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5000')
  .split(',')
  .map(origin => origin.trim());

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;

// Store active rooms and their drawing history
const rooms = new Map();

// Initialize a room
function initializeRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      drawingHistory: [],
      undoStack: [],
      currentUserColors: {}
    });
  }
  return rooms.get(roomId);
}

// Track connected users
const userSessions = new Map();

io.on('connection', (socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  // User joins a room
  socket.on('join_room', (data) => {
    const { roomId, userId, userName } = data;
    socket.join(roomId);

    const room = initializeRoom(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      userId,
      userName,
      x: 0,
      y: 0,
      color: data.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`
    });

    userSessions.set(socket.id, { roomId, userId });

    console.log(`→ User ${socket.id} joined room ${roomId}`);

    // Send drawing history to the new user
    socket.emit('load_history', {
      history: room.drawingHistory,
      users: Array.from(room.users.values())
    });

    // Notify others about the new user
    socket.to(roomId).emit('user_joined', {
      userId: socket.id,
      userName,
      color: room.users.get(socket.id).color
    });

    // Broadcast current users in the room
    io.to(roomId).emit('update_users', Array.from(room.users.values()));
  });

  // Handle drawing events
  socket.on('draw', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room) return;

    // Add to history
    room.drawingHistory.push(data);
    room.undoStack = []; // Clear redo stack on new draw

    // Broadcast to all users in the room
    socket.to(session.roomId).emit('draw', data);
  });

  // Handle cursor movement (ghost cursor)
  socket.on('cursor_move', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (user) {
      user.x = data.x;
      user.y = data.y;
    }

    socket.to(session.roomId).emit('cursor_move', {
      userId: socket.id,
      x: data.x,
      y: data.y,
      userName: user.userName
    });
  });

  // Handle undo
  socket.on('undo', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room || room.drawingHistory.length === 0) return;

    // Remove the last stroke by this user
    let removed = null;
    for (let i = room.drawingHistory.length - 1; i >= 0; i--) {
      if (room.drawingHistory[i].userId === socket.id) {
        removed = room.drawingHistory.splice(i, 1)[0];
        room.undoStack.push(removed);
        break;
      }
    }

    if (removed) {
      io.to(session.roomId).emit('undo', {
        userId: socket.id,
        history: room.drawingHistory,
        canRedo: room.undoStack.length > 0,
        canUndo: room.drawingHistory.length > 0
      });
    }
  });

  // Handle redo
  socket.on('redo', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room || room.undoStack.length === 0) return;

    const restored = room.undoStack.pop();
    room.drawingHistory.push(restored);

    io.to(session.roomId).emit('redo', {
      userId: socket.id,
      history: room.drawingHistory,
      stroke: restored,
      canRedo: room.undoStack.length > 0,
      canUndo: room.drawingHistory.length > 0
    });
  });

  // Handle clear canvas
  socket.on('clear_canvas', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room) return;

    room.drawingHistory = [];
    room.undoStack = [];

    io.to(session.roomId).emit('clear_canvas');
  });

  // User disconnects
  socket.on('disconnect', () => {
    const session = userSessions.get(socket.id);
    if (session) {
      const room = rooms.get(session.roomId);
      if (room) {
        room.users.delete(socket.id);
        io.to(session.roomId).emit('user_left', { userId: socket.id });
        io.to(session.roomId).emit('update_users', Array.from(room.users.values()));
      }
    }
    userSessions.delete(socket.id);
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
*/


const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Health check route (IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Socket.IO with open CORS for deployment testing
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;

// Store active rooms and their drawing history
const rooms = new Map();

// Initialize a room
function initializeRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      drawingHistory: [],
      undoStack: [],
      currentUserColors: {}
    });
  }
  return rooms.get(roomId);
}

// Track connected users
const userSessions = new Map();

io.on('connection', (socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  socket.on('join_room', (data) => {
    const { roomId, userId, userName } = data;
    socket.join(roomId);

    const room = initializeRoom(roomId);

    room.users.set(socket.id, {
      id: socket.id,
      userId,
      userName,
      x: 0,
      y: 0,
      color: data.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`
    });

    userSessions.set(socket.id, { roomId, userId });

    socket.emit('load_history', {
      history: room.drawingHistory,
      users: Array.from(room.users.values())
    });

    socket.to(roomId).emit('user_joined', {
      userId: socket.id,
      userName,
      color: room.users.get(socket.id).color
    });

    io.to(roomId).emit('update_users', Array.from(room.users.values()));
  });

  socket.on('draw', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room) return;

    room.drawingHistory.push(data);
    room.undoStack = [];

    socket.to(session.roomId).emit('draw', data);
  });

  socket.on('cursor_move', (data) => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (user) {
      user.x = data.x;
      user.y = data.y;
    }

    socket.to(session.roomId).emit('cursor_move', {
      userId: socket.id,
      x: data.x,
      y: data.y,
      userName: user.userName
    });
  });

  socket.on('undo', () => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room || room.drawingHistory.length === 0) return;

    let removed = null;

    for (let i = room.drawingHistory.length - 1; i >= 0; i--) {
      if (room.drawingHistory[i].userId === socket.id) {
        removed = room.drawingHistory.splice(i, 1)[0];
        room.undoStack.push(removed);
        break;
      }
    }

    if (removed) {
      io.to(session.roomId).emit('undo', {
        history: room.drawingHistory,
        canRedo: room.undoStack.length > 0,
        canUndo: room.drawingHistory.length > 0
      });
    }
  });

  socket.on('redo', () => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room || room.undoStack.length === 0) return;

    const restored = room.undoStack.pop();
    room.drawingHistory.push(restored);

    io.to(session.roomId).emit('redo', {
      history: room.drawingHistory,
      canRedo: room.undoStack.length > 0,
      canUndo: room.drawingHistory.length > 0
    });
  });

  socket.on('clear_canvas', () => {
    const session = userSessions.get(socket.id);
    if (!session) return;

    const room = rooms.get(session.roomId);
    if (!room) return;

    room.drawingHistory = [];
    room.undoStack = [];

    io.to(session.roomId).emit('clear_canvas');
  });

  socket.on('disconnect', () => {
    const session = userSessions.get(socket.id);

    if (session) {
      const room = rooms.get(session.roomId);

      if (room) {
        room.users.delete(socket.id);
        io.to(session.roomId).emit('user_left', { userId: socket.id });
        io.to(session.roomId).emit('update_users', Array.from(room.users.values()));
      }
    }

    userSessions.delete(socket.id);
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
