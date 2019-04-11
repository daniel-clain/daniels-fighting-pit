import { Component, Prop } from '@stencil/core';
import { GameSkeleton } from '../../../models/game-skeleton';

@Component({
	tag: 'game-component',
	shadow: true
})
export class GameComponent {
	@Prop() game: GameSkeleton

	render() {
		return ([
			this.game.round.stage == 'pre-fight' &&
				<pre-fight-component manager={this.game.manager} fighters={this.game.round.fighters}></pre-fight-component>,
			this.game.round.stage == 'news' &&
				<news-component></news-component>,
			this.game.round.stage == 'fight in progress' &&
				<fight-component></fight-component>,
			this.game.round.stage == 'post-fight' &&
				<post-fight-component></post-fight-component>
		])
		
	}
}

