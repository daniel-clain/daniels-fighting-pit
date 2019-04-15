import { GameUpdates } from "../game/gameUpdates";


export type ServerToClientName = 
'player connected' |
'added to que' |
'removed from que' |
'a player did not accept' |
'a player has connected' |
'a player has disconnected' |
'game available' | 
'game accepted' |
GameUpdates