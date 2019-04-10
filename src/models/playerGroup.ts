import { ConnectedPlayer } from "./connectedPlayer";

export interface PlayerGroup{
  groupId: string
  playersResponse: {player: ConnectedPlayer, accepted: boolean}[]
  
}