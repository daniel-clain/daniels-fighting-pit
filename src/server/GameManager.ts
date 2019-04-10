import { ConnectedPlayer } from "../models/connectedPlayer";
import { Game } from "./game/game/game";

export class GameManager{

  gamesInProgress: Game[] = []
  
  startNewGame(gameId: string, players: ConnectedPlayer[]){
    const newGame: Game = new Game(gameId, players)
    this.gamesInProgress.push(newGame)
  }
}