import React, { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import './App.css';

// Helper: check winner for arbitrary board size and winLength
function checkWinnerGrid(grid, winLength) {
  const rows = grid.length;
  const cols = grid[0].length;

  const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

  const dirs = [
    [0, 1], // right
    [1, 0], // down
    [1, 1], // down-right
    [1, -1], // down-left
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r][c];
      if (!v || v === ' ') continue;
      for (const [dr, dc] of dirs) {
        let cnt = 1;
        let rr = r + dr;
        let cc = c + dc;
        while (inBounds(rr, cc) && grid[rr][cc] === v) {
          cnt++;
          if (cnt >= winLength) return v;
          rr += dr;
          cc += dc;
        }
      }
    }
  }
  return null;
}

const App = () => {
  const [mode, setMode] = useState('online'); // 'online' or 'local'
  const [boardSize, setBoardSize] = useState(15);
  const [winLength, setWinLength] = useState(5);

  // Online state (from server)
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inputGameId, setInputGameId] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  const wsRef = useRef(null);

  // Local mode state
  const [localGame, setLocalGame] = useState(null);

  // Setup/teardown websocket only when in online mode
  useEffect(() => {
    if (mode !== 'online') return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//localhost:8080/ws/game`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received:', message);

      if (message.type === 'game_created') {
        setGameId(message.gameId);
        setError(message.message || '');
      } else if (message.type === 'game_state') {
        setGameState(message.game);
        if (message.game.playerX && message.game.playerO) {
          setGameStarted(true);
        }
      } else if (message.type === 'error') {
        setError(message.message);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [mode]);

  // Online actions
  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'create_game', size: boardSize, winLength }));
      setPlayerName('');
    }
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!inputGameId.trim()) {
      setError('Please enter a game ID');
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'join_game', gameId: inputGameId, playerName }));
      setPlayerName('');
      setInputGameId('');
    }
  };

  const handleOnlineMove = (row, col) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && gameState) {
      wsRef.current.send(JSON.stringify({ action: 'make_move', row, col }));
    }
  };

  const handleOnlineReset = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'reset_game' }));
      setGameStarted(false);
      setGameState(null);
    }
  };

  // Local actions (both players on same browser)
  const startLocalGame = () => {
    const size = Math.max(3, Math.min(25, parseInt(boardSize, 10) || 15));
    const win = Math.max(3, Math.min(size, parseInt(winLength, 10) || (size >= 10 ? 5 : 3)));
    const board = Array.from({ length: size }, () => Array.from({ length: size }, () => ' '));
    setLocalGame({ board, currentPlayer: 'X', status: 'active', winner: null, size, winLength: win });
    setError('');
  };

  const handleLocalMove = (row, col) => {
    if (!localGame || localGame.status !== 'active') return;
    const grid = localGame.board.map((r) => r.slice());
    if (grid[row][col] !== ' ') return;
    grid[row][col] = localGame.currentPlayer;

    const winner = checkWinnerGrid(grid, localGame.winLength);
    let status = localGame.status;
    let winnerId = null;
    if (winner) {
      status = 'finished';
      winnerId = winner;
    } else {
      // check draw
      const full = grid.every((r) => r.every((c) => c !== ' '));
      if (full) {
        status = 'draw';
      }
    }

    setLocalGame({
      board: grid,
      currentPlayer: winnerId || status === 'draw' ? localGame.currentPlayer : (localGame.currentPlayer === 'X' ? 'O' : 'X'),
      status,
      winner: winnerId,
      size: localGame.size,
      winLength: localGame.winLength,
    });
  };

  const resetLocalGame = () => startLocalGame();

  return (
    <div className="app">
      <div className="container">
        <h1>🎮 Caro Game</h1>
        <p className="subtitle">Real-time Multiplayer Tic Tac Toe / Caro</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
          <label>
            Mode:&nbsp;
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="online">Online (WebSocket)</option>
              <option value="local">Local (same browser)</option>
            </select>
          </label>
          <label>
            Board size:&nbsp;
            <input type="number" min="3" max="25" value={boardSize} onChange={(e) => setBoardSize(e.target.value)} style={{ width: 72 }} />
          </label>
          <label>
            Win length:&nbsp;
            <input type="number" min="3" max="25" value={winLength} onChange={(e) => setWinLength(e.target.value)} style={{ width: 72 }} />
          </label>
        </div>

        {mode === 'online' && (
          <>
            {!gameStarted && !gameId && (
              <div className="setup-section">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                  <button onClick={handleCreateGame} className="btn btn-primary">
                    Create New Game
                  </button>
                </div>
                <div className="divider">OR</div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Game ID to join"
                    value={inputGameId}
                    onChange={(e) => setInputGameId(e.target.value)}
                  />
                  <button onClick={handleJoinGame} className="btn btn-secondary">
                    Join Game
                  </button>
                </div>
              </div>
            )}

            {gameId && !gameStarted && (
              <div className="wait-section">
                <p className="game-id">Game ID: <strong>{gameId}</strong></p>
                <p className="wait-text">⏳ Waiting for another player to join...</p>
                <p className="copy-hint">Share this Game ID with your friend</p>
              </div>
            )}

            {gameState && gameStarted && (
              <div className="game-section">
                <GameInfo game={gameState} />
                <GameBoard 
                  board={gameState.board} 
                  onMove={handleOnlineMove}
                  disabled={gameState.status === 'finished'}
                />
                {gameState.status === 'finished' && (
                  <button onClick={handleOnlineReset} className="btn btn-reset">
                    Play Again
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {mode === 'local' && (
          <>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
              <button className="btn btn-primary" onClick={startLocalGame}>Start Local Game</button>
              <button className="btn btn-secondary" onClick={resetLocalGame} disabled={!localGame}>Reset</button>
            </div>

            {localGame && (
              <div className="game-section">
                <GameInfo game={{ playerX: { name: 'Player X' }, playerO: { name: 'Player O' }, board: { ...localGame, board: localGame.board, status: localGame.status } }} />
                <GameBoard board={{ board: localGame.board, status: localGame.status, winner: localGame.winner }} onMove={handleLocalMove} disabled={localGame.status !== 'active'} />
                {localGame.status !== 'active' && (
                  <button onClick={resetLocalGame} className="btn btn-reset">Play Again</button>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
