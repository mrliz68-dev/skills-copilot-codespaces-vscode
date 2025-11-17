# Caro Game - Real-time Multiplayer Tic Tac Toe

A full-stack web application for playing Tic Tac Toe (Caro) with real-time multiplayer support using WebSocket.

## 🏗️ Project Structure

```
caro-game/
├── backend/          # Spring Boot backend with WebSocket
│   ├── pom.xml
│   └── src/
│       └── main/java/com/caro/
│           ├── CaroGameApplication.java
│           ├── controller/
│           ├── service/
│           ├── websocket/
│           ├── model/
│           └── config/
└── frontend/         # React frontend
    ├── package.json
    ├── public/
    └── src/
        ├── components/
        ├── App.js
        └── index.js
```

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Build with Maven:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## 🎮 How to Play

1. **Create a Game**: Enter your name and click "Create New Game"
2. **Share the Game ID**: Share the generated Game ID with your friend
3. **Join the Game**: Your friend enters the Game ID and their name to join
4. **Play**: Take turns clicking cells on the 3x3 board
5. **Win**: Get 3 in a row (horizontal, vertical, or diagonal) to win!

## 💻 Technology Stack

### Backend
- **Spring Boot 3.2** - Java framework
- **WebSocket** - Real-time communication
- **Maven** - Build tool

### Frontend
- **React 18** - UI library
- **WebSocket API** - Real-time client connection
- **CSS3** - Styling and animations

## 🔌 WebSocket Protocol

### Client to Server Messages

```json
{
  "action": "create_game"
}
```

```json
{
  "action": "join_game",
  "gameId": "game-uuid",
  "playerName": "Player Name"
}
```

```json
{
  "action": "make_move",
  "row": 0,
  "col": 1
}
```

```json
{
  "action": "reset_game"
}
```

### Server to Client Messages

```json
{
  "type": "game_created",
  "gameId": "game-uuid",
  "message": "Game created..."
}
```

```json
{
  "type": "game_state",
  "game": { /* Game object with board state */ }
}
```

```json
{
  "type": "error",
  "message": "Error message"
}
```

## 🎯 Features

✅ Real-time multiplayer gameplay
✅ WebSocket for instant updates
✅ Game ID sharing system
✅ Win detection (rows, columns, diagonals)
✅ Draw detection
✅ Player turn indication
✅ Responsive design
✅ Beautiful UI with animations

## 📝 Game Rules

- 3x3 grid board
- Players alternate turns (X and O)
- First player to get 3 marks in a row wins
- If all 9 cells are filled without a winner, it's a draw

## 🛠️ Development

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Open two browser windows/tabs at `http://localhost:3000` to simulate multiplayer.

## 📦 Building for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/caro-game-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Deploy the build/ folder to a static hosting service
```

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on port 8080
- Check browser console for connection errors
- Verify CORS settings allow your frontend origin

### Game ID Not Working
- Make sure both players use the same Game ID
- Game ID is case-sensitive
- Game must be in "waiting" status for the second player to join

## 📄 License

MIT License

## 👨‍💻 Author

Created as a learning project demonstrating:
- Spring Boot WebSocket implementation
- Real-time multiplayer game architecture
- React state management
- Full-stack development

---

**Enjoy the game! 🎮**
