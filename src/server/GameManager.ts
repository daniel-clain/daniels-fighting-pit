import { Player } from "../models/player";
import { Game } from "./game/game/game";

export class GameManager{

  gamesInProgress: Game[] = []
  
  startNewGame(gameId: string, players: Player[]){
    const newGame: Game = new Game(gameId, players)
    this.gamesInProgress.push(newGame)
    newGame.gameTearDownSubject.subscribe(() => {
      newGame.players.forEach(player => {
        player.sendToClient({name: 'game ended', data: gameId})
      })
    })
  }


  
  playerDisconnected(clientId: string){
    let player: Player
    const playersGame: Game = this.gamesInProgress.find(
      (game: Game) => {
        const p = game.players.find(player => player.clientId == clientId)
        if(p){
          player = p
          return true
        }
      }
    )
    if(playersGame)
      playersGame.pause(player)
  }
}