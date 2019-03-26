import { PlayerStates } from "../enums/playerStates";


export interface Player{
    playerState: PlayerStates
    socketId: string
}