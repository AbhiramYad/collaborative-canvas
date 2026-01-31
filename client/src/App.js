import React, { useState } from 'react';
import './App.css';
import DrawingCanvas from './components/DrawingCanvas';
import JoinRoom from './components/JoinRoom';

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [roomData, setRoomData] = useState(null);

  const handleJoinRoom = (data) => {
    setRoomData(data);
    setIsJoined(true);
  };

  const handleLeaveRoom = () => {
    setIsJoined(false);
    setRoomData(null);
  };

  return (
    <div className="App">
      {!isJoined ? (
        <JoinRoom onJoin={handleJoinRoom} />
      ) : (
        <DrawingCanvas roomData={roomData} onLeave={handleLeaveRoom} />
      )}
    </div>
  );
}

export default App;
//redeploy