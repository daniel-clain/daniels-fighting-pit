import { ServerToClient } from "./serverToClient";
import { Socket } from "socket.io";
import { PlayerSkeleton } from "../game/player-skeleton";
import { Manager } from "../../server/game/manager/manager";
import { ClientId } from "../../types/game/clientId";


export class Player{
  name: string
  clientId: ClientId
  connected: boolean
  manager: Manager

  constructor(private socket: Socket, name: string, clientId: ClientId){
    this.name = name
    this.clientId = clientId
    this.connected = true
  }

  sendToClient(serverToClient: ServerToClient): void {    
    if(this.clientId.substring(0, 4) !== 'mock')
      this.socket.emit('server to client', serverToClient)
  }

  getPlayerSkeleton(): PlayerSkeleton{
    return {
      connected: this.connected,
      name: this.name
    }
  }

  updateNewConnection(socket: Socket){
    this.connected = true
    this.socket = socket
  }
}