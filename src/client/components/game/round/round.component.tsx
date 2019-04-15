import { Component, Prop, State } from '@stencil/core';
import { RoundSkeleton } from '../../../../models/game/round-skeleton';
import { Manager } from '../../../../server/game/manager/manager';
import { FighterSkeleton } from '../../../../models/fighter/fighter-skeleton';
import { WebsocketService } from '../../../websocket.service';
import { ServerToClient } from '../../../../models/app/serverToClient';

@Component({
	tag: 'round-component',
	styleUrl: 'round.scss',
	shadow: true
})
export class RoundComponent {
	@State() round: RoundSkeleton
  @Prop() manager: Manager
	@Prop() allFighters: FighterSkeleton[]
	websocketService: WebsocketService
	
  componentDidLoad(){
    this.websocketService = WebsocketService.SingletonInstance
    this.websocketService.serverToClientSubject.subscribe((serverToClient: ServerToClient) => {
      if(serverToClient.name == 'round update'){
        this.round = serverToClient.data
      }
    })
  }

	render() {
		return this.round &&
			<div id='round'>
				{!this.round.stage &&
					<div id='round__number'>Round: {this.round.number}</div>}
				{this.round.stage == 'pre-fight' &&
					<pre-fight-component 
						manager={this.manager} 
						roundFighters={this.round.fighters} 
						allFighters={this.allFighters}>
					</pre-fight-component>
				}
				{this.round.stage == 'news' &&
					<news-component></news-component>
				}
				{this.round.stage == 'fight' &&
					<fight-component></fight-component>
				}
				{this.round.stage == 'post-fight' &&
					<post-fight-component></post-fight-component>
				}
			</div>
		
	}
}

