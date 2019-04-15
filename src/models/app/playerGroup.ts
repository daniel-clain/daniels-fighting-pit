import { Player } from "./player";

export interface PlayerGroup{
  groupId: string
  playersResponse: {player: Player, accepted: boolean}[]
  
}