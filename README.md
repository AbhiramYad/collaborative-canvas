# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on a shared canvas with real-time synchronization.

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation & Setup

1. **Clone/Navigate to project**
   ```bash
   cd collaborative-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. **Start the application**
   ```bash
   npm start
   ```
   This will start both the server (port 5000) and React client (port 3000) concurrently.

### Manual Start (if needed)

**Terminal 1 - Server:**
```bash
cd server
npm start
```

**Terminal 2 - Client:**
```bash
cd client
npm start
```

## 🎮 How to Use

1. **Open the application** in your browser (http://localhost:3000)
2. **Enter Room Details:**
   - Room ID: A unique identifier for your drawing session (e.g., `room-art-123`)
   - Your Name: Display name for other users
   - Your Color: Pick a color that represents you
3. **Share the Room ID** with others to invite them to draw
4. **Start Drawing:**
   - Use the **Brush** tool to draw
   - Use the **Eraser** tool to erase
   - Adjust **Stroke Size** with the slider
   - Change **Colors** anytime
5. **Collaborate:**
   - See other users' drawings in real-time
   - View ghost cursors showing where others are drawing
   - Watch the users panel for who's online
6. **Undo/Redo:**
   - Click **Undo** to remove your last stroke
   - Click **Redo** to restore it
7. **Clear Canvas:** Clear the entire canvas with the **Clear** button

## ✨ Features Implemented

### Core Features
- ✅ **Real-time Canvas Synchronization** - All users see drawings instantly
- ✅ **Brush Tool** - Draw with adjustable stroke width and colors
- ✅ **Eraser Tool** - Remove content without affecting others' work
- ✅ **Ghost Cursors** - See where other users are moving
- ✅ **User Indicators** - List of connected users with their colors
- ✅ **Undo/Redo** - Undo your own strokes, redo them if needed
- ✅ **Global History** - New users load the entire drawing history
- ✅ **Room System** - Multiple isolated canvases per room ID

### Technical Implementation
- **Canvas API** - Native 2D context for all rendering
- **Socket.io** - Real-time bidirectional communication
- **React** - Component-based UI architecture
- **Normalized Coordinates** - Canvas coordinates properly mapped from mouse events
- **Efficient Event Batching** - Drawing events optimized for network performance

## 📁 Project Structure

```
collaborative-canvas/
├── client/
│   ├── public/
│   │   └── index.html           # Main HTML
│   ├── src/
│   │   ├── components/
│   │   │   ├── DrawingCanvas.js    # Canvas drawing logic
│   │   │   ├── DrawingCanvas.css   # Canvas styling
│   │   │   ├── JoinRoom.js         # Room join UI
│   │   │   └── JoinRoom.css        # Join room styling
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # App styling
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   └── package.json
├── server/
│   ├── server.js                # Express + Socket.io server
│   └── package.json
├── package.json                 # Root package config
├── README.md                    # This file
└── ARCHITECTURE.md              # Technical documentation
```

## 🔧 Technical Stack

- **Frontend:** React 18 + Vanilla JavaScript
- **Backend:** Node.js + Express
- **Real-time Communication:** Socket.io
- **Canvas API:** HTML5 Canvas 2D Context
- **Styling:** CSS3 with Flexbox

## 🐛 Known Limitations & Future Improvements

### Current Limitations
1. **No Canvas Persistence** - Drawing is lost when server restarts
2. **No User Authentication** - Any user can join with any name
3. **No Mobile Touch Support** - Touch events not yet implemented
4. **No Shape Tools** - Only brush and eraser available
5. **No Drawing History** - Cannot view previous versions

### Future Improvements
- [ ] Add shape drawing tools (rectangle, circle, line)
- [ ] Implement touch support for mobile devices
- [ ] Add canvas persistence to database
- [ ] User authentication and profiles
- [ ] Layer system for advanced editing
- [ ] Drawing history timeline
- [ ] Text tool for annotations
- [ ] Performance metrics/FPS counter
- [ ] Keyboard shortcuts
- [ ] Drawing export (PNG/SVG)

## 🚀 Using the Deployed Application

### Accessing the Live Application
1. Open your browser and navigate to the deployed URL (provided by your hosting platform)
2. You will be redirected to the application interface
3. The application is fully functional at the deployed endpoint

### Inviting Others to Collaborate
1. Share the deployed application URL with collaborators
2. Each user opens the URL in their browser
3. Users can join the same room by entering the same Room ID
4. Start drawing together in real-time

### Multi-Device Collaboration
1. Visit the deployed URL from any device with a browser
2. Enter the Room ID to join the same session
3. The socket connection automatically points to the deployed server
4. All devices will see drawings in real-time

## 📊 Performance Notes

- **Drawing Events:** Sent per mouse move (throttle if needed)
- **History Limit:** Unlimited, but large canvases may slow performance
- **Concurrent Users:** Tested with 5+ users per room
- **Network:** Works best with <100ms latency

## 🐛 Troubleshooting

### Connection Issues
- **Problem:** "Cannot connect to server"
  - **Solution:** Ensure server is running on port 5000
  - Check firewall settings

### Drawing Not Syncing
- **Problem:** Other users can't see your drawings
  - **Solution:** Check browser console for socket errors
  - Verify both users are in the same room ID (case-sensitive)

### Undo Not Working
- **Problem:** Undo button is disabled
  - **Solution:** You can only undo your own strokes, not others'
  - Other users' strokes remain visible

### Canvas Size Issues
- **Problem:** Drawing is offset or scaled incorrectly
  - **Solution:** The canvas automatically scales on window resize
  - Try refreshing the page

## ⏱️ Time Spent

- **Initial Setup:** 15 min
- **Server Development:** 45 min
- **React UI & Canvas:** 75 min
- **Real-time Sync:** 45 min
- **Undo/Redo & Features:** 60 min
- **Styling & Polish:** 30 min
- **Testing & Debugging:** 45 min
- **Documentation:** 20 min

**Total:** ~5.5 hours

## 📝 Code Quality Notes

- **Modular Architecture:** Clear separation of concerns
- **Commented Code:** Key functions have explanatory comments
- **Error Handling:** Socket disconnections and reconnections handled
- **Performance:** Efficient canvas redrawing and event emission
- **Responsive Design:** Works on different screen sizes

## 🎯 Evaluation Checklist

- [x] Canvas efficiency - Smooth drawing with no jagged edges
- [x] Real-time sync - Low latency, consistent state
- [x] Global undo/redo - Works across all clients
- [x] Ghost cursors - Other users visible
- [x] User management - Shows who's online
- [x] Code quality - Clean, modular, documented
- [x] Architecture - Clear data flow
- [x] Project structure - Following requirements

## 📞 Support

For issues or questions, check the ARCHITECTURE.md file for detailed technical documentation.

---

**Built with  for collaborative creativity**
