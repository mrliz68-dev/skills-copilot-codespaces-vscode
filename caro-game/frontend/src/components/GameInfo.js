import React from 'react';
import './GameInfo.css';

const GameInfo = ({ game }) => {
  if (!game) return null;

  const playerX = game.playerX || {};
  const playerO = game.playerO || {};
  const board = game.board || {};

  return (
    <div className="game-info">
      <div className="player-info">
        <div className={`player ${board.currentPlayer === 'X' ? 'active' : ''}`}>
          <span className="symbol x">X</span>
          <span className="name">{playerX.name || 'Player X'}</span>
        </div>
        <div className="vs">VS</div>
        <div className={`player ${board.currentPlayer === 'O' ? 'active' : ''}`}>
          <span className="symbol o">O</span>
          <span className="name">{playerO.name || 'Player O'}</span>
        </div>
      </div>
      {board.status === 'active' && (
        <div className="turn-indicator">
          Current Turn: <strong>{board.currentPlayer}</strong>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
