import { Server, Socket } from "socket.io";
import { Player } from "../models/player";
import { QueManager } from "./QueManager";
import { ServerToClient } from "../models/serverToClient";
import { ClientToServer } from "../models/clientToServer";
import { PlayerConnectInfo } from "../models/playerRegistration";
import { GameManager } from "./GameManager";

export class EventsFromClientManager{
  connectedPlayers: Player[] = []
  gameManager: GameManager = new GameManager()
  queManger: QueManager = new QueManager(this.gameManager)

  constructor(private server: Server){
    this.server.on("connection", (socket: Socket) => {
      socket.on('client to server', 
      (clientToServer: ClientToServer) => this.handleClientMessages(clientToServer, socket))      
    });
  }
  handleClientMessages(clientToServer: ClientToServer, socket: Socket){
    const player: Player = this.connectedPlayers.find(p => p.clientId == clientToServer.clientId)
    switch(clientToServer.name){
      case 'que for game' : 
      case 'cancel que for game' : 
      case 'accept game' : 
        this.queManger.handleClientMessages(clientToServer, player)
        break
      case 'player connect' : this.connectPlayer(socket, clientToServer.data); break
      case 'disconnect' : this.playerDisconnected(clientToServer.clientId); break
    }
  }

  getSocketEmitter(socket: Socket){
    return (serverToClient: ServerToClient) => {
      socket.emit('server to client', serverToClient)
    }
  }

  connectPlayer(socket: Socket, playerConnectInfo: PlayerConnectInfo){
    let newClientId
    if(!playerConnectInfo.clientId){
      newClientId = new Date().getTime().toString()
      playerConnectInfo.clientId = newClientId
    }
    if(this.connectedPlayers.find(player => player.clientId == playerConnectInfo.clientId)){
      console.log('player should no already be in the connected players list')
      debugger
    }
    const connectedPlayer: Player = {
      connected: true, 
      ...playerConnectInfo, 
      sendToClient: this.getSocketEmitter(socket)
    }
    this.connectedPlayers.push(connectedPlayer)
    connectedPlayer.sendToClient({name: 'player connected', data: newClientId})

    console.log(`${playerConnectInfo.name} has connected`)
    return connectedPlayer
  }

  
  playerDisconnected(clientId: string){
    this.queManger.playerDisconnected(clientId)
    this.gameManager.playerDisconnected(clientId)
    this.connectedPlayers = this.connectedPlayers.filter(player => {        
      if(player.clientId == clientId){          
        console.log(`${player.name} has disconnected`)
        return false
      }
      return true
    })
  }


  
}