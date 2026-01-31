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
    ghostCursors: new Map(),
    lastPos: null
  });

  // ---------------- SOCKET INIT ----------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Render backend (hardcoded to avoid cache issues)
    const apiUrl = "https://collaborative-canvas-dd3c.onrender.com";

    console.log("RENDER BUILD ACTIVE");
    console.log("API URL USED:", apiUrl);

    socketRef.current = io(apiUrl, {
      transports: ["websocket"],
      secure: true,
      reconnection: true
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server");

      socketRef.current.emit("join_room", {
        roomId: roomData.roomId,
        userId: socketRef.current.id,
        userName: roomData.userName,
        color: roomData.color
      });
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

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };

  }, [roomData]);

  // ---------------- CANVAS ----------------

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
    ctx.fillText(userName, x + 15, y - 5);
  };

  const getCanvasCoordinates = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // ---------------- DRAW EVENTS ----------------

  const handleMouseDown = (e) => {
    drawingStateRef.current.lastPos = getCanvasCoordinates(e);
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

    drawStroke(canvasRef.current.getContext("2d"), drawData);
    socketRef.current.emit("draw", drawData);

    drawingStateRef.current.history.push(drawData);
    drawingStateRef.current.lastPos = pos;

    setCanUndo(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    drawingStateRef.current.lastPos = null;
  };

  // ---------------- UI ACTIONS ----------------

  const handleUndo = () => socketRef.current.emit("undo");
  const handleRedo = () => socketRef.current.emit("redo");

  const handleClear = () => {
    if (window.confirm("Clear the entire canvas?")) {
      socketRef.current.emit("clear_canvas");
    }
  };

  // ---------------- UI (OLD DESIGN KEPT) ----------------

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
            <option value="brush">🖌 Brush</option>
            <option value="eraser">🧹 Eraser</option>
          </select>
        </div>

        <div className="toolbar-section">
          <label>Color:</label>
          <input
            type="color"
            value={color}
            disabled={tool === "eraser"}
            onChange={(e) => setColor(e.target.value)}
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
          <button onClick={handleUndo} disabled={!canUndo}>↶ Undo</button>
          <button onClick={handleRedo} disabled={!canRedo}>↷ Redo</button>
          <button onClick={handleClear} className="danger">🗑 Clear</button>
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
      />

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
