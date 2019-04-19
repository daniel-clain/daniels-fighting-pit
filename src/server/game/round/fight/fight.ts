
import { Fighter } from "../../fighter/fighter";
import { FightSkeleton } from "../../../../models/game/fight-skeleton";
import { Player } from "../../../../models/app/player";
import { ArenaDimensions } from "../../../../models/fighter/arena-dimensions";
import { random } from "../../../../helper-functions/helper-functions";
import { Subscription } from "rxjs";
import { FighterModelImage } from "../../../../models/fighter/fighterModelImage";

export class Fight {
  winner: Fighter
  private fightFinished
  private timeBeforeStartFighting = 5
  private fightTime = 120
  private waitAtEndOfFight = 5
  private countDown: number
  private timeRemaining: number
  private countDownInterval: NodeJS.Timeout
  private fightTimer: NodeJS.Timeout
  private fighterSubscriptions: Subscription[]
  
  private arenaDimensions: ArenaDimensions = {
    width: 600,
    height: 330,
    upFromBottom: 293,
    outFromLeft: 317
  }

  constructor(private players: Player[], private fighters: Fighter[]) {
  }
  
  private sendFightUpdateToClients(){    
    this.players.forEach((player: Player) => {
      player.sendToClient({name:'fight update', data: this.getFightSkeleton()})
    })
  }

  start(){

    this.countDown = this.timeBeforeStartFighting
    this.timeRemaining = this.fightTime
    this.resetFighters()
    this.sendFightUpdateToClients()
    this.countDownBeforeStartFighting()
    return new Promise(resolve => this.fightFinished = resolve);
  }

  
  private resetFighters(){
    this.fighterSubscriptions = []
    this.fighters.forEach((fighter: Fighter) => {
      fighter.knockedOut = false
      fighter.spirit = 0
      fighter.stamina = fighter.maxStamina
      fighter.position.x = random(this.arenaDimensions.width) + this.arenaDimensions.outFromLeft
      const modelHeight: number = fighter.fighterModelImages.find((image: FighterModelImage) => image.modelState == 'active').dimensions.height
      fighter.position.y = random(this.arenaDimensions.height - modelHeight) + this.arenaDimensions.upFromBottom + modelHeight
      fighter.otherFightersInTheFight = []
    })
  }

  private countDownBeforeStartFighting(){  
    this.countDown--  
    const countDownInterval = setInterval(() => {
      this.countDown--
      this.sendFightUpdateToClients()
    }, 1000)
    setTimeout(() => {
      clearInterval(countDownInterval)
      this.tellFightersToStartFighting()
      this.watchForAWinner()
      this.startTimer()
    }, this.timeBeforeStartFighting * 1000)    
  }

  private startTimer(){
    this.timeRemaining--
    this.countDownInterval = setInterval(() => {
      this.timeRemaining--
      this.sendFightUpdateToClients()
    }, 1000)
    this.fightTimer = setTimeout(() => {
      clearInterval(this.countDownInterval)      
      this.timeIsUp()
      this.declareDraw()
    }, this.fightTime * 1000)
  }

  private timeIsUp(){
    this.timeRemaining = 0
    this.sendFightUpdateToClients()
    this.fighters.forEach((fighter: Fighter) => {
      fighter.stopFighting()
    })
  }

  private tellFightersToStartFighting(){
    console.log('tellFightersToStartFighting');
    this.fighters.forEach((fighter: Fighter) => {
      const otherFighters = this.fighters.filter(f => f.name != fighter.name)
      fighter.giveFightInfo(otherFighters, this.arenaDimensions)
      this.fighterSubscriptions.push(fighter.updateSubject.subscribe(() => this.sendFightUpdateToClients()))
      fighter.startFighting()
    })	
  }
  
  private watchForAWinner() {
    this.fighters.forEach((fighter: Fighter) => {
      this.fighterSubscriptions.push(fighter.knockedOutSubject.subscribe(() => {
        const numberOfFightersLeft: number = this.fighters.filter(fighter => !fighter.knockedOut).length        
        if(numberOfFightersLeft == 1){
          this.winner = this.fighters.find(figher => !figher.knockedOut)
          this.declareWinner()
        }
      }))
    })
  }

  private declareDraw(){
    console.log(`fight was a draw`)
    this.endOfFight()
  }

  private declareWinner(){
    clearInterval(this.countDownInterval)
    clearTimeout(this.fightTimer)
    this.timeIsUp()
    console.log(`${this.winner.name} wins!!`)
    this.endOfFight()
  }

  private endOfFight(){
    setTimeout(() => 
      this.fighterSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe())
    , 1000)
    setTimeout(() => this.fightFinished(), this.waitAtEndOfFight * 1000)
  }

  private getFightSkeleton(): FightSkeleton{
    return {
      timeRemaining: this.timeRemaining,
      countDown: this.countDown,
      fighters: this.fighters.map((fighter: Fighter) => fighter.getFighterSkeleton()),
      winner: this.winner && this.winner.getFighterSkeleton()
    }
  }

}