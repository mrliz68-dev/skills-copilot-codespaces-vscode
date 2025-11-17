package com.caro.controller;

import com.caro.model.Game;
import com.caro.service.GameService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {
    
    private final GameService gameService;
    
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }
    
    @PostMapping("/create")
    public Game createGame() {
        return gameService.createGame();
    }
    
    @GetMapping("/{gameId}")
    public Game getGame(@PathVariable String gameId) {
        return gameService.getGame(gameId);
    }
}
