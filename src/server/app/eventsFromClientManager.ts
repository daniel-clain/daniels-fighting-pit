
import { GameManager } from "./GameManager";
import { QueManager } from "./QueManager";
import { Socket, Server } from "socket.io";
import { Player } from "../../models/app/player";
import { ServerToClient } from "../../models/app/serverToClient";
import { PlayerConnectInfo } from "../../models/app/playerConnectInfo";
import { ClientToServer } from "../../models/app/clientToServer";


export class EventsFromClientManager{
  players: Player[] = []
  gameManager: GameManager = new GameManager()
  queManger: QueManager = new QueManager(this.gameManager)

  constructor(private server: Server){
    this.server.on("connection", (socket: Socket) => {
      socket.on('client to server', 
      (clientToServer: ClientToServer) => this.handleClientMessages(clientToServer, socket))      
    });
  }
  handleClientMessages(clientToServer: ClientToServer, socket: Socket){
    const player: Player = this.players.find((player: Player)  => player.clientId == clientToServer.clientId)
    switch(clientToServer.name){
      case 'que for game' : 
      case 'cancel que for game' : 
      case 'accept game' : 
        this.queManger.handleClientMessages(clientToServer, player)
        break
      case 'pre-fight ready check' :
      case 'player actions' :
        this.gameManager.handleClientMessages(clientToServer, player)
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

    if(!playerConnectInfo.clientId){
      const newClientId = new Date().getTime().toString()
      playerConnectInfo.clientId = newClientId
    }

    const foundPlayer: Player = this.players.find(player => player.clientId == playerConnectInfo.clientId)
    if(foundPlayer){
      console.log('player should no already be in the connected players list')
      foundPlayer.updateNewConnection(socket)
    }

    const {name, clientId} = playerConnectInfo
    const player: Player = new Player(socket, name, clientId)
    this.players.push(player)
    player.sendToClient({name: 'player connected', data: player.clientId})
    console.log(`${playerConnectInfo.name} has connected`)
  }
  
  playerDisconnected(clientId: string){
    this.queManger.playerDisconnected(clientId)
    this.gameManager.playerDisconnected(clientId)
    this.players = this.players.filter(player => {        
      if(player.clientId == clientId){          
        console.log(`${player.name} has disconnected`)
        return false
      }
      return true
    })
  }
  
}