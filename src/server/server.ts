
import * as socketio from "socket.io";
import { Socket, Server } from 'socket.io';
import { Player } from "../models/player";
import { PlayerStates } from "../enums/playerStates";
import { ClientToServerEmits } from "../enums/clientToServerEmits";
import { PlayersReadyGroup } from "../models/playersReadyGroup";
import { ServerToClientEmits } from "../enums/serverToClientEmits";
import { Game } from "../classes/game/game";

const connectedSockets: Socket[] = []
const players: Player[] = []
let playersQueuingForAGame: Player[] = []
let playerReadyGroups: PlayersReadyGroup[] = []

const io: Server = socketio.listen(69, )
io.on("connection", (socket: Socket) => {
  handleNewPlayerConnected(socket)

});

const handleNewPlayerConnected = (socket: Socket) => {
  console.log("a user connected ", socket.id);
  connectedSockets.push(socket)
  players.push({playerState: PlayerStates['idle'], socketId: socket.id})
  io.emit('aonther user has connected')
  socket.emit('connected')
  socket.on('disconnect', () => {
    io.emit('aonther user has disconnected')
  })
  socket.on(ClientToServerEmits['que for game'], () => {
    const player: Player = players.find(player => player.socketId === socket.id)
    playerQueForGame(player)
  })
  socket.on(ClientToServerEmits['cancel que for game'], () => {
    const player: Player = players.find(player => player.socketId === socket.id)
    playerCancelQueForGame(player)
  })
  socket.on(ClientToServerEmits['decline game'], gameGroupId => {
    playerDeclinedGame(socket.id, gameGroupId)
  })
  socket.on(ClientToServerEmits['game accepted'], gameGroupId => {
    playerAcceptedGame(socket.id, gameGroupId)
  })

}

const playerAcceptedGame = (playerSocketId, gameGroupId: string) => {  
  updatePlayerState(playerSocketId, PlayerStates["waiting for other players to accept"])
  checkIfAllPlayersHaveAccepted(gameGroupId)
  
}

const checkIfAllPlayersHaveAccepted = (gameGroupId: string) => {  
  const playerReadyGroup: PlayersReadyGroup = playerReadyGroups.find(group => group.groupId == gameGroupId)
  const allPlayersAccepted: boolean = playerReadyGroup.playersSocketIds.reduce((x, playersSocketId) => {
    if(x){
      const player: Player = players.find(player => player.socketId == playersSocketId)
      x = player.playerState === PlayerStates['waiting for other players to accept']
    }
    return x
  }, true)

  if(allPlayersAccepted){
    setupNewGame(playerReadyGroup.groupId, playerReadyGroup.playersSocketIds)
  }
}

const setupNewGame = (groupId, playerSocketIds) => {
  const game: Game = new Game(groupId, playerSocketIds)
  playerSocketIds.forEach(socketId => {
    const playerSocket: Socket = connectedSockets.find(socket => socket.id = socketId)
    playerSocket.emit(ServerToClientEmits['game started'], game)
    updatePlayerState(socketId, PlayerStates['in game'])
  });

}

const playerDeclinedGame = (decliningPlayerSocketId, gameGroupId: string) => {  
  const playerReadyGroup: PlayersReadyGroup = playerReadyGroups.find(group => group.groupId == gameGroupId)
  playerReadyGroup.playersSocketIds.forEach(playerSocketId => {
    const playerSocket = connectedSockets.find(socket => socket.id === playerSocketId)
    playerSocket.emit(ServerToClientEmits['other players did not accept'], decliningPlayerSocketId)
    updatePlayerState(playerSocketId, PlayerStates['idle'])
  })
  playerReadyGroups = playerReadyGroups.filter(group => group.groupId !== gameGroupId)
}

const playerCancelQueForGame = cancellingPlayer => {  
  playersQueuingForAGame = playersQueuingForAGame.filter(player => player.socketId !== cancellingPlayer.socketId)
  updatePlayerState(cancellingPlayer.socketId, PlayerStates['idle'])
}


const playerQueForGame = (player: Player) => { 
  addPlayerToQue(player)
  updatePlayerState(player.socketId, PlayerStates["queueing for a game"])

}

const addPlayerToQue = (player) => {
  playersQueuingForAGame.push(player)
  if(playersQueuingForAGame.length === 4){
    const gamePlayers: Player[] = playersQueuingForAGame.splice(0, 4)
    enoughPlayersForGame(gamePlayers)
  }
}
const enoughPlayersForGame = (players: Player[]) => {
  const playersReadyGroup: PlayersReadyGroup = {
    groupId: Date.now().toString(),
    playersSocketIds: players.map(player => player.socketId)
  }
  playerReadyGroups.push(playersReadyGroup)
    players.forEach(player => {
      const socket: Socket = connectedSockets.find(socket => socket.id == player.socketId)
      player.playerState = PlayerStates['game ready']
      socket.emit(ServerToClientEmits['enough players for game'], {groupId: playersReadyGroup.groupId})   
      socket.emit(ServerToClientEmits['player state update'], player.playerState) 
  })
}

const updatePlayerState = (playerSocketId, state: PlayerStates) => {
  const player: Player = players.find(player => player.socketId = playerSocketId)
  player.playerState = state
  const playerSocket = connectedSockets.find(socket => socket.id === player.socketId)
  playerSocket.emit(ServerToClientEmits['player state update'], player.playerState)

}
