/*import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './DrawingCanvas.css';

function DrawingCanvas({ roomData, onLeave }) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(roomData.color);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'
  const [users, setUsers] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const drawingStateRef = useRef({
    history: [],
    redoStack: [],
    ghostCursors: new Map(),
    lastPos: null
  });

  // Initialize canvas and socket connection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Initialize socket connection
    const apiUrl = process.env.REACT_APP_API_URL ;
    socketRef.current = io(apiUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('join_room', {
        roomId: roomData.roomId,
        userId: socketRef.current.id,
        userName: roomData.userName,
        color: roomData.color
      });
    });

    // Load drawing history from server
    socketRef.current.on('load_history', (data) => {
      console.log('Loading history:', data.history.length, 'strokes');
      drawingStateRef.current.history = data.history;
      redrawCanvas();
      setUsers(data.users);
    });

    // Receive drawing from other users
    socketRef.current.on('draw', (drawData) => {
      drawingStateRef.current.history.push(drawData);
      redrawCanvas();
      setCanUndo(true);
    });

    // Receive cursor movement from other users
    socketRef.current.on('cursor_move', (data) => {
      drawingStateRef.current.ghostCursors.set(data.userId, {
        x: data.x,
        y: data.y,
        userName: data.userName
      });
      redrawCanvas();
    });

    // Handle undo from server
    socketRef.current.on('undo', (data) => {
      drawingStateRef.current.history = data.history;
      drawingStateRef.current.redoStack = [];
      redrawCanvas();
      setCanUndo(data.canUndo);
      setCanRedo(data.canRedo);
    });

    // Handle redo from server
    socketRef.current.on('redo', (data) => {
      drawingStateRef.current.history = data.history;
      redrawCanvas();
      setCanUndo(data.canUndo);
      setCanRedo(data.canRedo);
    });

    // Handle clear canvas
    socketRef.current.on('clear_canvas', () => {
      drawingStateRef.current.history = [];
      drawingStateRef.current.redoStack = [];
      redrawCanvas();
      setCanUndo(false);
      setCanRedo(false);
    });

    // Update users list
    socketRef.current.on('update_users', (usersList) => {
      setUsers(usersList);
    });

    socketRef.current.on('user_joined', (data) => {
      console.log(`${data.userName} joined the room`);
    });

    socketRef.current.on('user_left', (data) => {
      drawingStateRef.current.ghostCursors.delete(data.userId);
      redrawCanvas();
    });

    // Handle window resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData]);

  // Redraw canvas with all history and ghost cursors
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    drawingStateRef.current.history.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw ghost cursors
    drawingStateRef.current.ghostCursors.forEach((cursor, userId) => {
      drawGhostCursor(ctx, cursor);
    });
  };

  // Draw a single stroke
  const drawStroke = (ctx, stroke) => {
    const { start, end, style } = stroke;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  // Draw ghost cursor with user name
  const drawGhostCursor = (ctx, cursor) => {
    const { x, y, userName } = cursor;

    // Draw cursor circle
    ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Draw user name
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '12px Arial';
    ctx.fillText(userName, x + 15, y - 5);
  };

  // Get normalized canvas coordinates
  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  // Mouse down - start drawing
  const handleMouseDown = (event) => {
    const pos = getCanvasCoordinates(event);
    drawingStateRef.current.lastPos = pos;
    setIsDrawing(true);
  };

  // Mouse move - draw line
  const handleMouseMove = (event) => {
    const pos = getCanvasCoordinates(event);

    // Emit cursor position
    socketRef.current.emit('cursor_move', {
      x: pos.x,
      y: pos.y
    });

    if (!isDrawing || !drawingStateRef.current.lastPos) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawData = {
      start: drawingStateRef.current.lastPos,
      end: pos,
      style: {
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth
      },
      userId: socketRef.current.id,
      timestamp: Date.now()
    };

    // Draw locally
    drawStroke(ctx, drawData);

    // Send to server
    socketRef.current.emit('draw', drawData);

    // Add to history
    drawingStateRef.current.history.push(drawData);
    drawingStateRef.current.redoStack = [];

    drawingStateRef.current.lastPos = pos;
    setCanUndo(true);
    setCanRedo(false);
  };

  // Mouse up - stop drawing
  const handleMouseUp = () => {
    setIsDrawing(false);
    drawingStateRef.current.lastPos = null;
  };

  // Undo
  const handleUndo = () => {
    socketRef.current.emit('undo');
  };

  // Redo
  const handleRedo = () => {
    socketRef.current.emit('redo');
  };

  // Clear canvas
  const handleClear = () => {
    if (window.confirm('Clear the entire canvas?')) {
      socketRef.current.emit('clear_canvas');
    }
  };

  return (
    <div className="drawing-canvas-container">
      <div className="toolbar">
        <div className="toolbar-section">
          <h2>{roomData.roomId}</h2>
          <span className="user-count">{users.length} user(s)</span>
        </div>

        <div className="toolbar-section">
          <label>Tool:</label>
          <select value={tool} onChange={(e) => setTool(e.target.value)}>
            <option value="brush">🖌️ Brush</option>
            <option value="eraser">🧹 Eraser</option>
          </select>
        </div>

        <div className="toolbar-section">
          <label>Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser'}
          />
        </div>

        <div className="toolbar-section">
          <label>Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
          <span>{strokeWidth}px</span>
        </div>

        <div className="toolbar-section">
          <button onClick={handleUndo} disabled={!canUndo} title="Undo">
            ↶ Undo
          </button>
          <button onClick={handleRedo} disabled={!canRedo} title="Redo">
            ↷ Redo
          </button>
          <button onClick={handleClear} className="danger" title="Clear Canvas">
            🗑️ Clear
          </button>
        </div>

        <div className="toolbar-section right">
          <div className="user-info">
            <span className="user-name">{roomData.userName}</span>
            <span
              className="user-color"
              style={{ backgroundColor: roomData.color }}
            ></span>
          </div>
          <button onClick={onLeave} className="leave-button">
            Leave
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      ></canvas>

      <div className="users-panel">
        <h3>Users in Room</h3>
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <span
                className="user-dot"
                style={{ backgroundColor: user.color }}
              ></span>
              <span className="user-name-item">{user.userName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DrawingCanvas;
*/
import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./DrawingCanvas.css";

function DrawingCanvas({ roomData, onLeave }) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(roomData.color);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [tool, setTool] = useState("brush");
  const [users, setUsers] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const drawingStateRef = useRef({
    history: [],
    redoStack: [],
    ghostCursors: new Map(),
    lastPos: null
  });

  // -------------------- SOCKET + CANVAS INIT --------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas properly
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Backend URL from Vercel ENV
    const apiUrl = "https://collaborative-canvas-dd3c.onrender.com";

    console.log("RENDER BUILD ACTIVE");

    console.log("API URL USED:", apiUrl);

    if (!apiUrl) {
      console.error("REACT_APP_API_URL is NOT defined");
      return;
    }

    // Force websocket (no polling)
    socketRef.current = io(apiUrl, {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    // ---------------- SOCKET EVENTS ----------------

    socketRef.current.on("connect", () => {
      console.log("Connected to server");

      socketRef.current.emit("join_room", {
        roomId: roomData.roomId,
        userId: socketRef.current.id,
        userName: roomData.userName,
        color: roomData.color
      });
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socketRef.current.on("load_history", (data) => {
      drawingStateRef.current.history = data.history;
      redrawCanvas();
      setUsers(data.users);
    });

    socketRef.current.on("draw", (drawData) => {
      drawingStateRef.current.history.push(drawData);
      redrawCanvas();
      setCanUndo(true);
    });

    socketRef.current.on("cursor_move", (data) => {
      drawingStateRef.current.ghostCursors.set(data.userId, {
        x: data.x,
        y: data.y,
        userName: data.userName
      });
      redrawCanvas();
    });

    socketRef.current.on("undo", (data) => {
      drawingStateRef.current.history = data.history;
      redrawCanvas();
      setCanUndo(data.canUndo);
      setCanRedo(data.canRedo);
    });

    socketRef.current.on("redo", (data) => {
      drawingStateRef.current.history = data.history;
      redrawCanvas();
      setCanUndo(data.canUndo);
      setCanRedo(data.canRedo);
    });

    socketRef.current.on("clear_canvas", () => {
      drawingStateRef.current.history = [];
      redrawCanvas();
      setCanUndo(false);
      setCanRedo(false);
    });

    socketRef.current.on("update_users", (usersList) => {
      setUsers(usersList);
    });

    socketRef.current.on("user_left", (data) => {
      drawingStateRef.current.ghostCursors.delete(data.userId);
      redrawCanvas();
    });

    // Resize handling
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (socketRef.current) socketRef.current.disconnect();
    };

    // eslint-disable-next-line
  }, [roomData]);

  // ---------------- CANVAS FUNCTIONS ----------------

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawingStateRef.current.history.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    drawingStateRef.current.ghostCursors.forEach((cursor) => {
      drawGhostCursor(ctx, cursor);
    });
  };

  const drawStroke = (ctx, stroke) => {
    const { start, end, style } = stroke;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const drawGhostCursor = (ctx, cursor) => {
    const { x, y, userName } = cursor;

    ctx.fillStyle = "rgba(100,150,255,0.3)";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(userName, x + 12, y - 5);
  };

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // ---------------- DRAW HANDLERS ----------------

  const handleMouseDown = (e) => {
    const pos = getCanvasCoordinates(e);
    drawingStateRef.current.lastPos = pos;
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const pos = getCanvasCoordinates(e);

    socketRef.current.emit("cursor_move", pos);

    if (!isDrawing || !drawingStateRef.current.lastPos) return;

    const drawData = {
      start: drawingStateRef.current.lastPos,
      end: pos,
      style: {
        color: tool === "eraser" ? "#ffffff" : color,
        width: tool === "eraser" ? strokeWidth * 3 : strokeWidth
      },
      userId: socketRef.current.id,
      timestamp: Date.now()
    };

    const ctx = canvasRef.current.getContext("2d");
    drawStroke(ctx, drawData);

    socketRef.current.emit("draw", drawData);

    drawingStateRef.current.history.push(drawData);
    drawingStateRef.current.lastPos = pos;

    setCanUndo(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    drawingStateRef.current.lastPos = null;
  };

  const handleUndo = () => socketRef.current.emit("undo");

  const handleRedo = () => socketRef.current.emit("redo");

  const handleClear = () => {
    if (window.confirm("Clear canvas?")) {
      socketRef.current.emit("clear_canvas");
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="drawing-canvas-container">
      <div className="toolbar">
        <h2>{roomData.roomId}</h2>

        <select value={tool} onChange={(e) => setTool(e.target.value)}>
          <option value="brush">Brush</option>
          <option value="eraser">Eraser</option>
        </select>

        <input
          type="color"
          value={color}
          disabled={tool === "eraser"}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />

        <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
        <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={onLeave}>Leave</button>
      </div>

      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className="users-panel">
        <h3>Users</h3>
        {users.map((u) => (
          <div key={u.id}>{u.userName}</div>
        ))}
      </div>
    </div>
  );
}

export default DrawingCanvas;
