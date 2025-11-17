import React from 'react';
import './GameBoard.css';

const GameBoard = ({ board, onMove, disabled }) => {
  if (!board) return null;

  const gridBoard = board.board || [];
  const size = gridBoard.length || 3;

  // compute cell size dynamically (max board width 480px)
  const maxBoardPx = 480;
  const cellPx = Math.max(28, Math.floor(maxBoardPx / size));
  const boardStyle = {
    gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
    gridAutoRows: `${cellPx}px`,
  };

  const handleCellClick = (row, col) => {
    if (!disabled && gridBoard[row] && gridBoard[row][col] === ' ') {
      onMove(row, col);
    }
  };

  return (
    <div className="game-board-container">
      <div className="game-board" style={boardStyle}>
        {gridBoard.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell !== ' ' ? 'filled' : ''} ${
                cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={disabled || cell !== ' '}
              style={{ width: cellPx, height: cellPx, fontSize: Math.max(16, Math.floor(cellPx / 2)) }}
            >
              {cell !== ' ' ? cell : ''}
            </button>
          ))
        ))}
      </div>
      {board.status === 'won' && (
        <div className="status-message won">
          🎉 Player {board.winner} won!
        </div>
      )}
      {board.status === 'draw' && (
        <div className="status-message draw">
          It's a draw!
        </div>
      )}
    </div>
  );
};

export default GameBoard;
