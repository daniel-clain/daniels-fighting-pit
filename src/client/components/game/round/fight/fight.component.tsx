import { Component, State } from "@stencil/core";
import { WebsocketService } from "../../../../websocket.service";
import { ServerToClient } from "../../../../../models/app/serverToClient";
import { FightSkeleton } from "../../../../../models/game/fight-skeleton";
import { FighterSkeleton } from "../../../../../models/fighter/fighter-skeleton";

@Component({
  tag: 'fight-component',
  styleUrl: 'fight.scss',
  shadow: true
})
export class FightComponent {

  @State() fight: FightSkeleton
  websocketService: WebsocketService

  
	componentWillLoad(){
		this.websocketService = WebsocketService.SingletonInstance
    this.websocketService.serverToClientSubject.subscribe((serverToClient: ServerToClient) => {
      if(serverToClient.name == 'fight update'){
        this.fight = serverToClient.data
      }
    })
	}

  render(){
    let countDown: number
    let timeRemaining: number
    let fighters: FighterSkeleton[]
    let winner: FighterSkeleton
    
    if(this.fight){      
      countDown = this.fight.countDown
      timeRemaining = this.fight.timeRemaining
      fighters = this.fight.fighters
      winner = this.fight.winner
    }
    
    return this.fight && 
      <div id='fight'>
        {countDown != 0 && 
          <div id='fight__count-down'>{countDown}</div>
        }
        {countDown == 0 && timeRemaining != 0 && 
          <div id='fight__time-remaining'>Time Remaining: {timeRemaining}</div>}
        <div class='arena'>
          <div class='arena--behind'></div>
          <div class='arena--fight-area'>
          {
            fighters.map(fighter => <fighter-component fighter={fighter}></fighter-component>)
          }
          </div>
          <div class='arena--infront'></div>
        
        </div>
        {winner && 
          <div id='fight__winner'>{winner.name} Wins!</div>
        }
        {timeRemaining == 0 && !winner &&
          <div id='fight__winner'>Fight Was A Draw</div>
        }
      </div>
  }
}