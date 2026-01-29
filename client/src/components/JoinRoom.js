import React, { useState } from 'react';
import './JoinRoom.css';

function JoinRoom({ onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [color, setColor] = useState('#FF6B6B');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim() || !userName.trim()) {
      setError('Please fill in all fields');
      return;
    }
    onJoin({ roomId: roomId.trim(), userName: userName.trim(), color });
  };

  return (
    <div className="join-room-container">
      <div className="join-room-card">
        <h1>🎨 Drawing Canvas</h1>
        <p className="subtitle">Join a room to start drawing with others</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Enter room ID (e.g., room-123)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              id="userName"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Your Color</label>
            <div className="color-picker">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <span className="color-preview" style={{ backgroundColor: color }}></span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="join-button">
            Join Room
          </button>
        </form>

        <div className="instructions">
          <h3>How it works:</h3>
          <ul>
            <li>Enter a room ID (same ID = same canvas)</li>
            <li>Invite others to join the same room</li>
            <li>Start drawing in real-time!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
