# 🎮 Hướng Dẫn Chạy Project Caro Game

## 📋 Cấu trúc dự án đã được tạo

```
/Users/hoannguyenduc/source/tmp/copilot/caro-game/
├── backend/                  # Spring Boot (Java)
│   ├── pom.xml              # Maven dependencies
│   └── src/main/java/com/caro/
│       ├── CaroGameApplication.java      # Entry point
│       ├── controller/GameController.java  # REST endpoints
│       ├── service/GameService.java       # Game logic
│       ├── websocket/GameWebSocketHandler.java  # WebSocket handler
│       ├── config/WebSocketConfig.java   # WebSocket setup
│       └── model/
│           ├── Player.java
│           ├── Game.java
│           └── GameBoard.java
│
├── frontend/                 # React
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── App.js           # Main component
│       ├── App.css
│       └── components/
│           ├── GameBoard.js
│           ├── GameBoard.css
│           ├── GameInfo.js
│           └── GameInfo.css
│
└── README.md
```

## 🚀 Chạy Backend (Spring Boot)

### Option 1: Dùng Maven (khuyến nghị)

```bash
cd /Users/hoannguyenduc/source/tmp/copilot/caro-game/backend

# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

**Output dự kiến:**
```
[INFO] BUILD SUCCESS
[INFO] Embedded Tomcat started on port(s): 8080
[INFO] Started CaroGameApplication in X.XXX seconds
```

✅ Backend chạy tại: **http://localhost:8080**

### Option 2: Dùng IDE (IntelliJ IDEA)

1. Mở folder `backend` trong IntelliJ
2. Right-click `CaroGameApplication.java`
3. Chọn "Run 'CaroGameApplication.main()'"

---

## 🎨 Chạy Frontend (React)

### Bước 1: Cài đặt dependencies

```bash
cd /Users/hoannguyenduc/source/tmp/copilot/caro-game/frontend

npm install
```

### Bước 2: Chạy dev server

```bash
npm start
```

**Output dự kiến:**
```
Compiled successfully!

You can now view caro-game-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ Frontend tự động mở tại: **http://localhost:3000**

---

## 🎮 Test Multiplayer Game

### Cách 1: Dùng 2 tab trình duyệt

1. **Tab 1 (Player X - tạo game):**
   - Mở http://localhost:3000
   - Nhập tên: "Player X"
   - Click "Create New Game"
   - Copy Game ID được tạo

2. **Tab 2 (Player O - join game):**
   - Mở http://localhost:3000 (tab khác)
   - Nhập tên: "Player O"
   - Dán Game ID từ Tab 1
   - Click "Join Game"

3. **Chơi game:**
   - Nhấp các ô để đánh dấu
   - Theo dõi lượt chơi (X/O) tự động chuyển
   - Thắng: 3 dấu hàng ngang/dọc/chéo
   - Hòa: 9 ô kín không ai thắng

### Cách 2: Dùng 2 trình duyệt khác nhau

Trên máy A: 
```bash
# Terminal 1
cd caro-game/backend
mvn spring-boot:run

# Terminal 2
cd caro-game/frontend
npm start
# Truy cập http://localhost:3000
```

Trên máy B:
```bash
# Truy cập http://<IP_MÁY_A>:3000
# Và join game
```

---

## 🛠️ Chạy Cả 2 dịch vụ Cùng Lúc

### Option 1: Dùng Script

```bash
cd /Users/hoannguyenduc/source/tmp/copilot/caro-game

chmod +x start-all.sh
./start-all.sh
```

### Option 2: Dùng 2 Terminal

**Terminal 1 - Backend:**
```bash
cd /Users/hoannguyenduc/source/tmp/copilot/caro-game/backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd /Users/hoannguyenduc/source/tmp/copilot/caro-game/frontend
npm start
```

---

## 📊 WebSocket Connection Flow

```
Frontend (React)
    ↓
    WebSocket Connection (ws://localhost:8080/ws/game)
    ↓
Backend (Spring Boot)
    ↓
GameWebSocketHandler
    ↓
GameService (Logic)
    ↓
GameBoard Model
    ↓
Response gửi về Frontend (Real-time update)
```

---

## 🔍 Kiểm tra & Debug

### 1. Kiểm tra Backend chạy

```bash
curl http://localhost:8080/api/game/create
```

Dự kiến response (JSON):
```json
{
  "gameId": "uuid-xxx",
  "playerX": null,
  "playerO": null,
  "board": {...},
  "status": "waiting"
}
```

### 2. Kiểm tra WebSocket Connection

Mở Browser DevTools (F12):
- Chuyển đến tab **Console**
- Kiếm dòng: `WebSocket connected`

### 3. Xem WebSocket Messages

DevTools → **Network** → **WS** → Click vào connection:
- **Messages tab** hiện tất cả tin nhắn
- Xem mọi action gửi/nhận

---

## 🐛 Xử lý Lỗi Thường Gặp

### Lỗi 1: "Connection refused"

**Nguyên nhân:** Backend chưa chạy

**Cách fix:**
```bash
cd backend
mvn spring-boot:run
```

### Lỗi 2: "Port 8080 already in use"

**Cách fix:**
```bash
# macOS/Linux - tìm process chiếm port
lsof -i :8080
kill -9 <PID>

# Hoặc chạy backend trên port khác
# Edit backend/src/main/resources/application.properties
# server.port=8081
```

### Lỗi 3: "npm start" không chạy

**Cách fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Lỗi 4: WebSocket connection timed out

**Nguyên nhân:** CORS hoặc firewall block

**Cách fix:**
- Kiểm tra `WebSocketConfig.java` có `.setAllowedOrigins("*")`
- Tắt VPN/Firewall tạm thời

---

## ✅ Checklist Chạy Thành Công

- [ ] Backend build successfully (`BUILD SUCCESS`)
- [ ] Backend start at port 8080
- [ ] Frontend install dependencies
- [ ] Frontend start at port 3000
- [ ] Browser không lỗi WebSocket
- [ ] Tạo game → nhận Game ID
- [ ] Join game → 2 players gặp nhau
- [ ] Click cell → update real-time ✅
- [ ] Win/Draw detection hoạt động

---

## 📝 Ghi chú

- **Default port Backend:** 8080
- **Default port Frontend:** 3000
- **Game Board:** 3x3 (Tic Tac Toe)
- **WebSocket URL:** `ws://localhost:8080/ws/game`
- **React Component:** Functional components with Hooks

---

## 🚀 Sẵn sàng chơi? Let's go! 🎮
