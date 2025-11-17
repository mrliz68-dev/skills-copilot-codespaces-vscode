package com.caro.model;

import lombok.Data;

@Data
public class Game {
    private String gameId;
    private Player playerX;
    private Player playerO;
    private GameBoard board;
    private String status; // "waiting", "active", "finished"
    
    public Game(String gameId, int size, int winLength) {
        this.gameId = gameId;
        this.board = new GameBoard(size, winLength);
        this.status = "waiting";
    }
}
