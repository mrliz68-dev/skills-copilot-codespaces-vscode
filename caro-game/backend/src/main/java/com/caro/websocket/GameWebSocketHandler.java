package com.caro.websocket;

import com.caro.model.Game;
import com.caro.model.Player;
import com.caro.service.GameService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
    
    private final GameService gameService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Map to track which session belongs to which game
    private final Map<String, String> sessionToGameMap = new ConcurrentHashMap<>();
    // Map to track game sessions for broadcasting
    private final Map<String, Set<WebSocketSession>> gameToSessionsMap = new ConcurrentHashMap<>();
    
    public GameWebSocketHandler(GameService gameService) {
        this.gameService = gameService;
    }
    
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        try {
            JsonNode payload = objectMapper.readTree(message.getPayload());
            String action = payload.get("action").asText();

            switch (action) {
                case "create_game":
                    handleCreateGame(session, payload);
                    break;
                case "join_game":
                    handleJoinGame(session, payload);
                    break;
                case "make_move":
                    handleMakeMove(session, payload);
                    break;
                case "reset_game":
                    handleResetGame(session);
                    break;
                default:
                    sendError(session, "Unknown action: " + action);
            }
        } catch (Exception e) {
            sendError(session, "Error processing message: " + e.getMessage());
        }
    }

    private void handleCreateGame(WebSocketSession session, JsonNode payload) throws IOException {
        int size = 15;
        int winLength = 5;
        if (payload.has("size")) size = payload.get("size").asInt(15);
        if (payload.has("winLength")) winLength = payload.get("winLength").asInt(5);
        Game game = gameService.createGame(size, winLength);
        String gameId = game.getGameId();

        sessionToGameMap.put(session.getId(), gameId);
        gameToSessionsMap.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(session);

        String response = objectMapper.writeValueAsString(Map.of(
            "type", "game_created",
            "gameId", gameId,
            "size", size,
            "winLength", winLength,
            "message", "Game created. Waiting for another player..."
        ));

        session.sendMessage(new TextMessage(response));
    }
    
    private void handleJoinGame(WebSocketSession session, JsonNode payload) throws IOException {
        String gameId = payload.get("gameId").asText();
        String playerName = payload.get("playerName").asText();
        
        Game game = gameService.getGame(gameId);
        if (game == null) {
            sendError(session, "Game not found: " + gameId);
            return;
        }
        
        Player player = new Player(session.getId(), playerName, null, false);
        gameService.joinGame(gameId, player);
        
        sessionToGameMap.put(session.getId(), gameId);
        gameToSessionsMap.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(session);
        
        // Broadcast game state to both players
        broadcastGameState(gameId, game);
    }
    
    private void handleMakeMove(WebSocketSession session, JsonNode payload) throws IOException {
        String gameId = sessionToGameMap.get(session.getId());
        if (gameId == null) {
            sendError(session, "No game associated with this session");
            return;
        }
        
        int row = payload.get("row").asInt();
        int col = payload.get("col").asInt();
        
        Game game = gameService.getGame(gameId);
        if (game == null) {
            sendError(session, "Game not found");
            return;
        }
        
        String symbol = game.getBoard().getCurrentPlayer();
        boolean success = gameService.makeMove(gameId, row, col, symbol);
        
        if (success) {
            broadcastGameState(gameId, game);
        } else {
            sendError(session, "Invalid move");
        }
    }
    
    private void handleResetGame(WebSocketSession session) throws IOException {
        String gameId = sessionToGameMap.get(session.getId());
        if (gameId != null) {
            Game oldGame = gameService.getGame(gameId);
            int size = 15;
            int winLength = 5;
            if (oldGame != null && oldGame.getBoard() != null) {
                size = oldGame.getBoard().getSize();
                winLength = oldGame.getBoard().getWinLength();
            }
            // Create new game with same size/winLength
            Game newGame = gameService.createGame(size, winLength);
            gameToSessionsMap.remove(gameId);

            // Update session mapping
            sessionToGameMap.put(session.getId(), newGame.getGameId());
            gameToSessionsMap.computeIfAbsent(newGame.getGameId(), k -> ConcurrentHashMap.newKeySet()).add(session);

            String response = objectMapper.writeValueAsString(Map.of(
                "type", "game_created",
                "gameId", newGame.getGameId(),
                "size", size,
                "winLength", winLength,
                "message", "Game reset. Waiting for another player..."
            ));
            session.sendMessage(new TextMessage(response));
        }
    }
    
    private void broadcastGameState(String gameId, Game game) throws IOException {
        Set<WebSocketSession> sessions = gameToSessionsMap.get(gameId);
        if (sessions == null) return;
        
        String message = objectMapper.writeValueAsString(Map.of(
            "type", "game_state",
            "game", game
        ));
        
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message));
            }
        }
    }
    
    private void sendError(WebSocketSession session, String errorMessage) throws IOException {
        if (session.isOpen()) {
            String response = objectMapper.writeValueAsString(Map.of(
                "type", "error",
                "message", errorMessage
            ));
            session.sendMessage(new TextMessage(response));
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String gameId = sessionToGameMap.remove(session.getId());
        if (gameId != null) {
            Set<WebSocketSession> sessions = gameToSessionsMap.get(gameId);
            if (sessions != null) {
                sessions.remove(session);
            }
        }
    }
}
