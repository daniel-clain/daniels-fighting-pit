import { ServerToClient } from "./serverToClient";
import { PlayerSkeleton } from "./player-skeleton";
import { Manager } from "../server/game/manager/manager";


export interface Player extends PlayerSkeleton{
  connected: boolean
  name: string
  clientId: string
  manager?: Manager
  sendToClient(serverToClient: ServerToClient): void
}