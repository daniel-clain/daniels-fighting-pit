import { Game } from "../game/game";
import { Player } from "../../models/app/player";
import { ClientToServer } from "../../models/app/clientToServer";

export class GameManager{

  gamesInProgress: Game[] = []
  
  startNewGame(gameId: string, players: Player[]){
    console.log('starting new game')
    players.forEach(player => {
      player.sendToClient({name: 'game started', data: gameId})
    })
    
    const newGame: Game = new Game(gameId, players)
    this.gamesInProgress.push(newGame)
    
    newGame.gameTearDownSubject.subscribe(() => {
      newGame.players.forEach(player => {
        player.sendToClient({name: 'game ended', data: gameId})
      })
      newGame.gameTearDownSubject.complete()
    })
    setTimeout(() => newGame.start(), 500)
  }
  

  handleClientMessages(clientToServer: ClientToServer, player: Player){
    console.log(`${player.name} has sent a game update`)
    const game: Game = this.gamesInProgress.find((game: Game) => game.gameId == clientToServer.gameId)
    if(!game){
      console.log('it should find a game')
      debugger
    }

    clientToServer.data.clientId = clientToServer.clientId


    switch(clientToServer.name){
      case 'pre-fight ready check' : game.currentRound.preFight.playerIsReadyToggle(clientToServer.data); break
      case 'player actions' : game.currentRound.preFight.receivePlayerAction(clientToServer.data); break
    }
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