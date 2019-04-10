import { ServerToClient } from "./serverToClient";


export interface ConnectedPlayer{
  name: string
  clientId: string
  sendToClient(serverToClient: ServerToClient): void
}