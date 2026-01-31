## System Architecture — Collaborative Drawing Canvas

This document explains how real-time drawing data flows between users, the WebSocket protocol design, undo/redo synchronization strategy, performance optimizations, and conflict handling mechanisms.




---

# 🎯 Drawing Data Flow Explanation

1. User draws on the canvas using mouse input
2. Frontend captures stroke coordinates
3. Stroke data is sent to server using WebSocket
4. Server stores the stroke in room history
5. Server broadcasts stroke data to all users in the same room
6. All connected clients render the stroke instantly


## Flow Diagram

---

# WebSocket Protocol Design

Socket.IO is used for real-time bidirectional communication.

---

## Client → Server Events

### join_room

Sent when user joins a room:

json
{
  "roomId": "room123",
  "userId": "socket_id",
  "userName": "User1",
  "color": "#ff0000"
}

## Draw

Sent when a user draws a stroke:

{
  "start": { "x": 120, "y": 200 },
  "end": { "x": 140, "y": 210 },
  "style": {
    "color": "#000000",
    "width": 3
  },
  "userId": "socket_id",
  "timestamp": 1690000000000
}

## cursor_move

{
  "x": 200,
  "y": 150
}

## Server → Client Events
### load_history

Sent when user joins:

{
  "history": [...],
  "users": [...]
}

### draw

Broadcast stroke data to other users.

### update_users
[
  {
    "id": "socket_id",
    "userName": "User1",
    "color": "#ff0000"
  }
]

### undo / redo
{
  "history": [...],
  "canUndo": true,
  "canRedo": false
}

### clear_canvas

Broadcast canvas clear event.


## Undo / Redo Strategy

Undo and redo are controlled by the backend server to maintain global consistency.

### Undo Process

1.Server maintains a drawingHistory array per room

2.On undo request:

 .Last stroke created by requesting user is removed

 .Stroke is pushed into undoStack

3.Updated history is broadcast to all clients

4.Clients redraw the entire canvas using updated history

### Redo Process

1.Server pops the latest stroke from undoStack

2.Adds it back into drawingHistory

3.Broadcasts updated history to all users

4.Clients redraw the canvas

## Performance Decisions

Several optimizations were implemented for real-time performance:

### WebSocket Instead of HTTP Polling

Reason:

1.Low latency communication

2.Persistent connection

3.Reduced network overhead

4.Efficient continuous updates

### Lightweight Stroke Data Transmission

Only essential drawing information is transmitted:

.Start coordinates

.End coordinates

.Stroke color

.Stroke width

This minimizes bandwidth usage.

### In-Memory Data Storage

Room states are stored using JavaScript Maps:

1.Fast access

2.Low latency

3.Simple memory management

4.No database overhead

### Canvas Rendering Strategy

. Local drawing occurs instantly for responsiveness

. Full redraw is triggered only on history updates

. Prevents unnecessary re-render cycles

## Conflict Handling (Simultaneous Drawing)

Multiple users can draw simultaneously.

Conflict resolution approach:

### Parallel Drawing Strategy

Server accepts all stroke events

Strokes are appended sequentially

Order of broadcast ensures consistency

Overlapping strokes visually merge naturally

### Why Locking Is Not Required

Each stroke is independent and atomic:

No shared state mutation

Canvas allows natural layering

No race condition impact on visual output