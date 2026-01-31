# Collaborative Drawing Canvas (Real-Time)

A real-time collaborative drawing application that allows multiple users to draw together on a shared canvas using WebSockets. Users can join rooms, draw simultaneously, see live cursors, perform undo/redo operations, and clear the canvas globally.

---

## Installation and Running the Project

## Prerequisites

Make sure the following are installed:

- Node.js (v18 or later recommended)
- npm (comes with Node.js)

## Step 1 — Clone the Repository

git clone https://github.com/YOUR_USERNAME/collaborative-canvas.git
cd collaborative-canvas

## Step 2 — Run Backend Server

Navigate to backend folder:

cd server


Install dependencies:

npm install


Start backend server:

npm start


Backend will run at:

http://localhost:5000

## Step 3 — Run Frontend Application

Open a new terminal and navigate to client folder:

cd client


Install dependencies:

npm install


Start frontend:

npm start


Frontend will run at:

http://localhost:3000

## Testing With Multiple Users

Follow these steps to verify real-time collaboration:

## Step 1

Open the application in your browser:

http://localhost:3000


Enter:

Room ID: room123

Name: User1

Click Join Room.

## Step 2

Open another browser window or Incognito tab.

Again open:

http://localhost:3000


Enter:

Room ID: room123

Name: User2

Click Join Room.


## Step 3 — Test Features

Now test the following:
| Feature         | Expected Result                 |
| --------------- | ------------------------------- |
| Drawing         | Appears instantly on both users |
| Cursor tracking | Visible in real time            |
| Undo            | Removes last stroke globally    |
| Redo            | Restores stroke globally        |
| Clear canvas    | Clears for all users            |
| Users panel     | Updates on join/leave           |


## Total Time Spent on the Project

Approximate development time:

| Task                               | Time    |
| ---------------------------------- | ------- |
| Frontend UI and Canvas Logic       | 6 hours |
| WebSocket Backend Implementation   | 5 hours |
| Undo/Redo Synchronization          | 2 hours |
| Deployment Setup (Vercel + Render) | 3 hours |
| Testing and Debugging              | 3 hours |

Total Time: ~19 Hours

## Tech Stack
###  Frontend

React.js

Native HTML5 Canvas API

Socket.IO Client

CSS

### Backend

Node.js

Express.js

Socket.IO