package com.caro.service;

import com.caro.model.Game;
import com.caro.model.GameBoard;
import com.caro.model.Player;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class GameService {
    private Map<String, Game> games = new HashMap<>();

    public Game createGame(int size, int winLength) {
        String gameId = UUID.randomUUID().toString().substring(0, 8);
        Game game = new Game(gameId, size, winLength);
        games.put(gameId, game);
        return game;
    }

    public Game getGame(String gameId) {
        return games.get(gameId);
    }

    public boolean joinGame(String gameId, Player player) {
        Game game = games.get(gameId);
        if (game == null) return false;
        if (game.getPlayerX() == null) {
            game.setPlayerX(player);
            return true;
        } else if (game.getPlayerO() == null) {
            game.setPlayerO(player);
            game.setStatus("active");
            return true;
        }
        return false;
    }

    public boolean makeMove(String gameId, int row, int col, String symbol) {
        Game game = games.get(gameId);
        if (game == null) return false;
        GameBoard board = game.getBoard();
        if (row < 0 || row >= board.getSize() || col < 0 || col >= board.getSize()) return false;
        if (!board.getBoard()[row][col].equals(" ")) return false;
        board.getBoard()[row][col] = symbol;
        // check winner
        String winner = checkWinner(board, row, col);
        if (!winner.equals("")) {
            game.setStatus("finished");
            board.setWinner(winner);
        } else if (isBoardFull(board)) {
            game.setStatus("finished");
        }
        return true;
    }

    private String checkWinner(GameBoard board, int lastRow, int lastCol) {
        String[][] b = board.getBoard();
        String sym = b[lastRow][lastCol];
        if (sym.equals(" ")) return "";
        int size = board.getSize();
        int win = board.getWinLength();

        // Directions: horizontal, vertical, diag1 (/), diag2 (\)
        int[][] dirs = new int[][]{{0,1},{1,0},{1,1},{1,-1}};
        for (int[] d : dirs) {
            int count = 1;
            // check one direction
            int r = lastRow + d[0];
            int c = lastCol + d[1];
            while (r >=0 && r < size && c >=0 && c < size && b[r][c].equals(sym)) {
                count++; r += d[0]; c += d[1];
            }
            // check opposite direction
            r = lastRow - d[0];
            c = lastCol - d[1];
            while (r >=0 && r < size && c >=0 && c < size && b[r][c].equals(sym)) {
                count++; r -= d[0]; c -= d[1];
            }
            if (count >= win) return sym;
        }
        return "";
    }

    private boolean isBoardFull(GameBoard board) {
        String[][] b = board.getBoard();
        int size = board.getSize();
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                if (b[i][j].equals(" ")) return false;
            }
        }
        return true;
    }
}
