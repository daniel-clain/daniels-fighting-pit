import { Fighter } from "../fighter/fighter";
import { Round } from "../round/round";
import { Player } from "../../../models/player";
import { random } from "../../../helper-functions/helper-functions";
import { GameSkeleton } from "../../../models/game-skeleton";
import { PlayerSkeleton } from "../../../models/player-skeleton";
import { RoundSkeleton } from "../../../models/round-skeleton";
import { FighterSkeleton } from "../../../models/fighter-skeleton";
import { Manager } from "../manager/manager";
import { GameToClient } from "../../../types/gameToClient";
import { Subject } from "rxjs";

export class Game {
	totalRounds: number
  currentRound: Round
  gameId: string
  players: Player[]
  gameTearDownTimer: NodeJS.Timeout
  gameTearDownSubject: Subject<any> = new Subject()



	fighters: Fighter[] = [
    new Fighter('Daniel', {x: random(700), y: random(300) + 100}, 3, 3, 3, 3, 0),
    new Fighter('Tomasz', {x: random(500), y: random(300) + 100}, 2, 2, 2, 1, 0),
    new Fighter('Hassan', {x: random(500), y: random(300) + 100}, 2, 2, 2, 1, 0), 
    new Fighter('Dardan', {x: random(500), y: random(300) + 100}, 3, 1, 1, 1, 0),
    new Fighter('Alex', {x: random(700), y: random(300) + 100}, 1, 1, 0, 3, 0),
    new Fighter('Angelo', {x: random(700), y: random(300) + 100}, 0, 2, 0, 1, 0),
    new Fighter('Paul', {x: random(700), y: random(300) + 100}, 0, 1, 0, 0, 0),
    new Fighter('Suleman', {x: random(700), y: random(300) + 100}, 0, 3, 0, 0, 0),
    new Fighter('Mark', {x: random(700), y: random(300) + 100}, 1, 1, 0, 0, 0),
    new Fighter('Mat', {x: random(700), y: random(300) + 100}, 1, 1, 0, 3, 0),
    new Fighter('Mike', {x: random(700), y: random(300) + 100}, 0, 3, 2, 0, 0) 
  ]

	constructor(gameId: string, players: Player[]) {
    this.gameId = gameId
    this.players = players
    console.log(this.gameId, this.players)
    this.startGame()
  }
  
  startGame(){
    this.currentRound = new Round(this.fighters.splice(0, 4), 1)
    this.players.forEach((player: Player) => {
      player.manager = new Manager()
    })

    this.sendPlayersInitialGameSkeleton()    
  }

  pause(player: Player){
    this.playersBroadcast('pause', player)
    this.gameTearDownTimer = setTimeout(() => {
      this.gameTearDownSubject.next()
    }, 10000)
  }

  playersBroadcast(gameToClient: GameToClient, data: any){
    this.players.forEach(player => 
      player.sendToClient({name: gameToClient, data: data}))
  }

  sendPlayersInitialGameSkeleton(){
    
    const gameSkeleton: GameSkeleton = {
      players: this.players.map((p: Player): PlayerSkeleton => {
        const player: PlayerSkeleton = {
          connected: p.connected,
          name: p.name
        }
        return player
      }),
      round: {
        fighters: this.currentRound.fighters.map((f: Fighter) => {
          const fighter: FighterSkeleton = {
            name: f.name,
            facingDirection: f.facingDirection,
            modelState: f.modelState,
            position: f.position
          }
          return fighter
        }),

        stage: this.currentRound.stage
      } as RoundSkeleton
    }
    this.players.forEach((player: Player) => {
      gameSkeleton.manager = player.manager
      player.sendToClient({name:'game started', data: gameSkeleton})
    })


  }
  
}