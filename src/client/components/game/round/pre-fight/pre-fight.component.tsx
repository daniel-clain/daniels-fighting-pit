import { Component, Prop, State, EventEmitter, Event } from '@stencil/core';
import { Manager } from '../../../../../server/game/manager/manager';
import { FighterSkeleton } from '../../../../../models/fighter/fighter-skeleton';
import { PlayerActions } from '../../../../../models/game/playerActions';
import { ClientToServer } from '../../../../../models/app/clientToServer';
import { ManagerOption } from '../../../../../models/game/managerOptions';
import { PlayerReadyToggle } from '../../../../../models/game/playerReadyToggle';
import { WebsocketService } from '../../../../websocket.service';
import { ServerToClient } from '../../../../../models/app/serverToClient';

@Component({
  tag: 'pre-fight-component',
  styleUrl: 'pre-fight.scss',
  shadow: true
})
export class PreFightComponent {
  @Prop() manager: Manager;
  @Prop() roundFighters: FighterSkeleton[];
  @Prop() allFighters: FighterSkeleton[];
  @Prop({mutable: true}) timeRemaining: number;
  @State() imReady: boolean = false;
  @State() playerActions: PlayerActions = {
    bet: null,
    options: []
  }
  @Event() clientToServer: EventEmitter<ClientToServer>;
  @State() showTrainFighterPopup: boolean
  websocketService: WebsocketService
  betAmounts = [50, 200, 500]

  componentDidLoad(){
    this.websocketService = WebsocketService.SingletonInstance
    this.websocketService.serverToClientSubject.subscribe((serverToClient: ServerToClient) => {
      if(serverToClient.name == 'pre-fight update'){
        this.timeRemaining = serverToClient.data
      }
    })
  }

  componentDidUpdate(){
    if(this.timeRemaining == 0){
      this.websocketService.sendMessageToServer({name: 'player actions', data: this.playerActions})
    }
  }

  managerOptionsClicked(option: ManagerOption){
    if(option.name == 'Train fighter'){
      this.showTrainFighterPopup = true
    }
  }

  readyCheckboxClicked(){
    this.imReady = !this.imReady
    const playerReady: PlayerReadyToggle = {ready: this.imReady}
    this.websocketService.sendMessageToServer({name: 'pre-fight ready check', data: playerReady})
  }

  betClicked(fighter: FighterSkeleton, amount: number){
    if(this.manager.money - amount < 0)
      alert('you can not afford this bet')
    this.playerActions.bet = {
      fighter: fighter,
      amount: amount
    }
  }
  fighterSelectedForTraining(fighter: FighterSkeleton){
    this.playerActions.options.push({
      name: 'Train fighter',
      arguments: [fighter]
    })
    this.showTrainFighterPopup = false
  }

  render() {

    const {bet} = this.playerActions

    return (
      <div id='pre-fight'>
        <div id='pre-fight__background'></div>

        <div class={`train-fighter-popup ${this.showTrainFighterPopup && 'train-fighter-popup--showing'}`}>
          <div class='train-fighter-popup__fighters-pane'>
            {this.allFighters.map((fighter: FighterSkeleton) => 
              <button onClick={() => this.fighterSelectedForTraining(fighter)}>{fighter.name}</button>
            )}
          </div>
        </div>

        <div id='managers-money'>
          Manager's Money: ${this.manager.money - (bet ? bet.amount : 0)}
        </div>
        
        <div id='action-points'>Action Points: {this.manager.actionPoints}</div>

        <div id='pre-fight__time-remaining'>
          <div>Time Remaining: {this.timeRemaining}</div>
          <div id='pre-fight__time-remaining__im-ready'>
            Im Ready!
            
            <span class={`my-checkbox ${this.imReady && 'my-checkbox--checked'} `} onClick={() => this.readyCheckboxClicked()}></span>
          </div>
        </div>
        
        <div id='manager-options' class={`${this.imReady && 'disabled'}`}>
          <h3>Manager's Options</h3>
          {this.manager.options.map(managerOption => 
            <button onClick={() => this.managerOptionsClicked(managerOption)}>{managerOption.name}</button>
          )}
        </div>

        <div id='bet-on-fighter' class={`${this.imReady && 'disabled'}`}>
          <h3>Bet On a fighter</h3>
          {this.roundFighters.map(fighter => {
            return (
              <div class={`fighter-panel ${bet && bet.fighter.name == fighter.name&& 'fighter-panel--active'}`}>
                <div>{fighter.name}</div>
                <img class='fighter-panel__image' src='../../assets/fighter-images/idle.png'/>
                <div>
                  {this.betAmounts.map(betAmount => 
                    <button 
                      onClick={() => this.betClicked(fighter, betAmount)}
                      class={`fighter-panel__bet-button ${bet && bet.fighter.name == fighter.name && bet.amount == betAmount && 'fighter-panel__bet-button--active'}`}>
                      Bet ${betAmount}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
       
      </div>
    );
  }
}
