import { Component, State } from '@stencil/core';
import { WebsocketService } from '../../websocket.service';
import { ServerToClient } from '../../../models/app/serverToClient';
import { GameSkeleton } from '../../../models/game/game-skeleton';

@Component({
	tag: 'game-component',
	shadow: true
})
export class GameComponent {
	@State() game: GameSkeleton = {
		players: null,
		manager: null,
		fighters: null,

	}
	websocketService: WebsocketService

	componentDidLoad(){
		this.websocketService = WebsocketService.SingletonInstance
		this.websocketService.serverToClientSubject.subscribe((serverToClient: ServerToClient) => {
			if(serverToClient.name == 'game update')
        this.game = serverToClient.data
    })
	}

	render() {
		return this.game && <round-component manager={this.game.manager} allFighters={this.game.fighters}></round-component>
	}
}


