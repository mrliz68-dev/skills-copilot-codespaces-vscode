package com.caro.model;

import lombok.Data;

@Data
public class GameBoard {
    private String[][] board; // size x size grid
    private String currentPlayer; // "X" or "O"
    private String status; // "active", "won", "draw"
    private String winner; // player symbol or null
    private int size; // board dimension
    private int winLength; // needed in a row to win

    public GameBoard(int size, int winLength) {
        this.size = Math.max(3, size);
        this.winLength = Math.max(3, Math.min(this.size, winLength));
        this.board = new String[this.size][this.size];
        initializeBoard();
        this.currentPlayer = "X";
        this.status = "active";
        this.winner = null;
    }

    private void initializeBoard() {
        for (int i = 0; i < this.size; i++) {
            for (int j = 0; j < this.size; j++) {
                board[i][j] = " ";
            }
        }
    }
}
