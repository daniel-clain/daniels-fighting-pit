"use strict";
exports.__esModule = true;
var socketio = require("socket.io");
var playerStates_1 = require("../enums/playerStates");
var clientToServerEmits_1 = require("../enums/clientToServerEmits");
var serverToClientEmits_1 = require("../enums/serverToClientEmits");
var game_1 = require("../classes/game/game");
var connectedSockets = [];
var players = [];
var playersQueuingForAGame = [];
var playerReadyGroups = [];
var io = socketio.listen(69);
io.on("connection", function (socket) {
    handleNewPlayerConnected(socket);
});
var handleNewPlayerConnected = function (socket) {
    console.log("a user connected ", socket.id);
    connectedSockets.push(socket);
    players.push({ playerState: playerStates_1.PlayerStates['idle'], socketId: socket.id });
    io.emit('aonther user has connected');
    socket.emit('connected');
    socket.on('disconnect', function () {
        io.emit('aonther user has disconnected');
    });
    socket.on(clientToServerEmits_1.ClientToServerEmits['que for game'], function () {
        var player = players.find(function (player) { return player.socketId === socket.id; });
        playerQueForGame(player);
    });
    socket.on(clientToServerEmits_1.ClientToServerEmits['cancel que for game'], function () {
        var player = players.find(function (player) { return player.socketId === socket.id; });
        playerCancelQueForGame(player);
    });
    socket.on(clientToServerEmits_1.ClientToServerEmits['decline game'], function (gameGroupId) {
        playerDeclinedGame(socket.id, gameGroupId);
    });
    socket.on(clientToServerEmits_1.ClientToServerEmits['game accepted'], function (gameGroupId) {
        playerAcceptedGame(socket.id, gameGroupId);
    });
};
var playerAcceptedGame = function (playerSocketId, gameGroupId) {
    updatePlayerState(playerSocketId, playerStates_1.PlayerStates["waiting for other players to accept"]);
    checkIfAllPlayersHaveAccepted(gameGroupId);
};
var checkIfAllPlayersHaveAccepted = function (gameGroupId) {
    var playerReadyGroup = playerReadyGroups.find(function (group) { return group.groupId == gameGroupId; });
    var allPlayersAccepted = playerReadyGroup.playersSocketIds.reduce(function (x, playersSocketId) {
        if (x) {
            var player = players.find(function (player) { return player.socketId == playersSocketId; });
            x = player.playerState === playerStates_1.PlayerStates['waiting for other players to accept'];
        }
        return x;
    }, true);
    if (allPlayersAccepted) {
        setupNewGame(playerReadyGroup.groupId, playerReadyGroup.playersSocketIds);
    }
};
var setupNewGame = function (groupId, playerSocketIds) {
    var game = new game_1.Game(groupId, playerSocketIds);
    playerSocketIds.forEach(function (socketId) {
        var playerSocket = connectedSockets.find(function (socket) { return socket.id = socketId; });
        playerSocket.emit(serverToClientEmits_1.ServerToClientEmits['game started'], game);
        updatePlayerState(socketId, playerStates_1.PlayerStates['in game']);
    });
};
var playerDeclinedGame = function (decliningPlayerSocketId, gameGroupId) {
    var playerReadyGroup = playerReadyGroups.find(function (group) { return group.groupId == gameGroupId; });
    playerReadyGroup.playersSocketIds.forEach(function (playerSocketId) {
        var playerSocket = connectedSockets.find(function (socket) { return socket.id === playerSocketId; });
        playerSocket.emit(serverToClientEmits_1.ServerToClientEmits['other players did not accept'], decliningPlayerSocketId);
        updatePlayerState(playerSocketId, playerStates_1.PlayerStates['idle']);
    });
    playerReadyGroups = playerReadyGroups.filter(function (group) { return group.groupId !== gameGroupId; });
};
var playerCancelQueForGame = function (cancellingPlayer) {
    playersQueuingForAGame = playersQueuingForAGame.filter(function (player) { return player.socketId !== cancellingPlayer.socketId; });
    updatePlayerState(cancellingPlayer.socketId, playerStates_1.PlayerStates['idle']);
};
var playerQueForGame = function (player) {
    addPlayerToQue(player);
    updatePlayerState(player.socketId, playerStates_1.PlayerStates["queueing for a game"]);
};
var addPlayerToQue = function (player) {
    playersQueuingForAGame.push(player);
    if (playersQueuingForAGame.length === 4) {
        var gamePlayers = playersQueuingForAGame.splice(0, 4);
        enoughPlayersForGame(gamePlayers);
    }
};
var enoughPlayersForGame = function (players) {
    var playersReadyGroup = {
        groupId: Date.now().toString(),
        playersSocketIds: players.map(function (player) { return player.socketId; })
    };
    playerReadyGroups.push(playersReadyGroup);
    players.forEach(function (player) {
        var socket = connectedSockets.find(function (socket) { return socket.id == player.socketId; });
        player.playerState = playerStates_1.PlayerStates['game ready'];
        socket.emit(serverToClientEmits_1.ServerToClientEmits['enough players for game'], { groupId: playersReadyGroup.groupId });
        socket.emit(serverToClientEmits_1.ServerToClientEmits['player state update'], player.playerState);
    });
};
var updatePlayerState = function (playerSocketId, state) {
    var player = players.find(function (player) { return player.socketId = playerSocketId; });
    player.playerState = state;
    var playerSocket = connectedSockets.find(function (socket) { return socket.id === player.socketId; });
    playerSocket.emit(serverToClientEmits_1.ServerToClientEmits['player state update'], player.playerState);
};
