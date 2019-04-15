
import { ClientId } from "../../../../types/game/clientId";
import { Subject } from "rxjs";
import { PlayerActions } from "../../../../models/game/playerActions";
import { Player } from "../../../../models/app/player";
import { PlayerReadyToggle } from "../../../../models/game/playerReadyToggle";

export class PreFight{
  private preFightFinished
  private timeRemaining
  private preFightTime = 30
  private countDownInterval: NodeJS.Timeout
  private preFightTimer: NodeJS.Timeout
  private playersReadyList: ClientId[] = []
  private playerActionsList: PlayerActions[] = []
  public playerActionsSubject: Subject<PlayerActions[]> = new Subject()
  private playerActionsTimer: NodeJS.Timeout
  test = true

  constructor(private players: Player[]){    
    this.timeRemaining = this.preFightTime
  }

  private sendPreFightUpdateToClients(){
    this.players.forEach((player: Player) => {
      player.sendToClient({name:'pre-fight update', data: this.timeRemaining})
    })
  }

  public start(): Promise<any>{
    this.sendPreFightUpdateToClients()
    this.startTimer()
    return new Promise(resolve => this.preFightFinished = resolve);
  }

  private startTimer(){    
    this.timeRemaining--
    this.countDownInterval = setInterval(() => {
      this.timeRemaining--
      this.sendPreFightUpdateToClients()
    }, 1000)    
    this.preFightTimer = setTimeout(() => {
      clearInterval(this.countDownInterval)
      this.waitToReceiveAllPlayerActions()
    }, this.preFightTime * 1000)
  }
  
  public playerIsReadyToggle(playerReadyToggle: PlayerReadyToggle){
    if(playerReadyToggle.ready){
      this.playersReadyList.push(playerReadyToggle.clientId)
      if(this.test)
        this.allPlayersAreReady()
    } else{
      this.playersReadyList = this.playersReadyList.filter(clientId => clientId != playerReadyToggle.clientId)
    }
    const allPlayersAreReady = (): boolean => this.playersReadyList.length == this.players.length
    if(allPlayersAreReady()){
      this.allPlayersAreReady()
    }
  }
  
  private allPlayersAreReady(){
    clearTimeout(this.preFightTimer)
    clearInterval(this.countDownInterval)
    this.timeRemaining = 0
    this.sendPreFightUpdateToClients()
    this.waitToReceiveAllPlayerActions()
  }
  
  private waitToReceiveAllPlayerActions(){
    const waitTime = 5
    this.playerActionsTimer = setTimeout(() => {
      this.emitPlayerActionsForGameSubscription()
    }, waitTime * 1000)
  }

  public receivePlayerAction(playerActions: PlayerActions){
    this.playerActionsList.push(playerActions)
    let haveReceivedAllPlayerActions = (): boolean => this.playerActionsList.length == this.players.length
    
    if(this.test)
      haveReceivedAllPlayerActions = () => true
    if(haveReceivedAllPlayerActions){
      clearTimeout(this.playerActionsTimer)
      this.emitPlayerActionsForGameSubscription()
    }
  }

  private emitPlayerActionsForGameSubscription(){
    this.playerActionsSubject.next(this.playerActionsList)
    this.playerActionsSubject.complete()
    this.preFightFinished()
  }
  
}