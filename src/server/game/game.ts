import { Round } from "./round/round";
import { Subject } from "rxjs";
import { Fighter } from "./fighter/fighter";
import { ResearchFighter } from "./manager/managerOptions/research-fighter";
import { TrainFighter } from "./manager/managerOptions/train-fighter";
import { Manager } from "./manager/manager";
import { PlayerSkeleton } from "../../models/game/player-skeleton";
import { Player } from "../../models/app/player";
import { ManagerOption } from "../../models/game/managerOptions";
import { PlayerActions } from "../../models/game/playerActions";
import { ManagerOptionSkeleton } from "../../models/game/managerOptionSkeleton";
import { GameSkeleton } from "../../models/game/game-skeleton";
import { random } from "../../helper-functions/helper-functions";


export class Game {
	private totalRounds: number
  currentRound: Round
  gameId: string
  players: Player[]
  private gameTearDownTimer: NodeJS.Timeout
  gameTearDownSubject: Subject<any> = new Subject()
  gamePaused: boolean



	private fighters: Fighter[] = [
    new Fighter('Daniel', {x: random(700), y: random(300) + 100}, 3, 3, 3, 3, 0),
    new Fighter('Tomasz', {x: random(700), y: random(300) + 100}, 2, 2, 2, 1, 0),
    new Fighter('Hassan', {x: random(700), y: random(300) + 100}, 2, 2, 2, 1, 0), 
    new Fighter('Dardan', {x: random(700), y: random(300) + 100}, 3, 1, 1, 1, 0),
    new Fighter('Alex', {x: random(700), y: random(300) + 100}, 1, 1, 0, 3, 0),
    new Fighter('Angelo', {x: random(700), y: random(300) + 100}, 0, 2, 0, 1, 0),
    new Fighter('Paul', {x: random(700), y: random(300) + 100}, 0, 1, 0, 0, 0),
    new Fighter('Suleman', {x: random(700), y: random(300) + 100}, 0, 3, 0, 0, 0),
    new Fighter('Mark', {x: random(700), y: random(300) + 100}, 1, 1, 0, 0, 0),
    new Fighter('Mat', {x: random(700), y: random(300) + 100}, 1, 1, 0, 3, 0),
    new Fighter('Mike', {x: random(700), y: random(300) + 100}, 0, 3, 2, 0, 0) 
  ]

  private managerOptions: ManagerOption[] = [
    new ResearchFighter(),
    new TrainFighter(this.fighters)
  ]

	constructor(gameId: string, players: Player[]) {
    this.gameId = gameId
    this.players = players
    
    this.players.forEach((player: Player) => {
      player.manager = new Manager(this.managerOptions)
    })
  }
  
  private sendGameUpdateToClients(){    
    const gameSkeleton: GameSkeleton = this.getGameSkeleton()
    this.players.forEach((player: Player) => {
      gameSkeleton.manager = player.manager
      player.sendToClient({name:'game update', data: gameSkeleton})
    })
  }
  
  start(){    
    this.sendGameUpdateToClients()   
    this.nextRound(1)
  }

  private getRoundFighters(): Fighter[]{
    const fourFighters: Fighter[] = []
    for(;fourFighters.length < 4;){
      const randomFighter: Fighter = this.fighters[Math.floor(Math.random() * this.fighters.length)]
      if(!fourFighters.find(fighter => fighter.name == randomFighter.name))
        fourFighters.push(randomFighter)
    }
    return fourFighters
  }


  private nextRound(roundNumber: number){ 
    console.log(`Round ${roundNumber}!`); 
    const roundFighters = this.getRoundFighters()  
    this.currentRound = new Round(roundNumber, this.players, roundFighters)
    this.currentRound.preFight.playerActionsSubject.subscribe(
      (playerActionsList: PlayerActions[]) => this.processPlayerActions(playerActionsList)
    )        
    this.currentRound.start()
    .then(() => this.roundFinished())
  }

  private roundFinished(){    

    if(this.currentRound.number == this.totalRounds){
      this.gameOver()
    } else{
      const nextRoundNumber = this.currentRound.number + 1
      delete this.currentRound
      this.nextRound(nextRoundNumber)
    }
  }


  private gameOver(){
    
  }

  private processPlayerActions(playerActionsList: PlayerActions[]){
    playerActionsList = playerActionsList.filter(option => option.clientId != 'mock')
    playerActionsList.forEach((playerSelectedManagerOption: PlayerActions) => {
      const player: Player = this.players.find((player: Player) => player.clientId == playerSelectedManagerOption.clientId)
      if(playerSelectedManagerOption.bet){
        player.manager.bet = playerSelectedManagerOption.bet
        player.manager.money -= playerSelectedManagerOption.bet.amount
      }
      playerSelectedManagerOption.options.forEach((option: ManagerOptionSkeleton) => {
        const managerOption: ManagerOption = this.managerOptions.find((managerOption: ManagerOption) => managerOption.name == option.name)
        if(managerOption.name == 'Train fighter'){
          console.log(`${player.name} is training ${option.arguments[0].name}`)
        }
        managerOption.effect(...option.arguments)
      })
    })
  }


  pause(player: Player){
    console.log(`game paused because of ${player.name}`)
    this.gamePaused = true
    this.sendGameUpdateToClients()
    this.gameTearDownTimer = setTimeout(() => {
      this.gameTearDownSubject.next()
    }, 10000)
  }

  unpause(player: Player){    
    console.log(`game unpaused because of ${player.name}`)
    clearTimeout(this.gameTearDownTimer)
  }



  private getGameSkeleton(): GameSkeleton{
    return {
      players: this.players.map((player: Player): PlayerSkeleton => player.getPlayerSkeleton()),
      fighters: this.fighters.map((fighter: Fighter) => fighter.getFighterSkeleton())
    }
  }


  
}