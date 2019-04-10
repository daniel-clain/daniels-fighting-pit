import { Fighter } from "../fighter/fighter";
import { Round } from "../round/round";
import { ConnectedPlayer } from "../../../models/connectedPlayer";
import { random } from "../../../helper-functions/helper-functions";
import { GameSkeleton } from "../../../models/game-skeleton";
import { PlayerSkeleton } from "../../../models/player-skeleton";
import { RoundSkeleton } from "../../../models/round-skeleton";
import { FighterSkeleton } from "../../../models/fighter-skeleton";

export class Game {
	totalRounds: number;
	currentRound: Round;
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

	constructor(private gameId: string, private players: ConnectedPlayer[]) {
    console.log(this.gameId, this.players)
    this.startGame()
  }
  
  startGame(){
    this.currentRound = new Round(this.fighters.splice(0, 4), 1)

    this.sendPlayersInitialGameSkeleton()    
  }

  sendPlayersInitialGameSkeleton(){
    
    const gameSkeleton: GameSkeleton = {
      players: this.players.map((p: ConnectedPlayer): PlayerSkeleton => {
        const player: PlayerSkeleton = {
          name: p.name, playerId: p.clientId, money: 500, retired: false, sponsoredFighters: []
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
    this.players.forEach(player => player.sendToClient({name:'game started', data: gameSkeleton}))


  }
  
}