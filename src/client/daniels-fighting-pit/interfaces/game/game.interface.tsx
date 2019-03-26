import { Component, Prop } from '@stencil/core';
import { RoundStates } from '../../../../enums/roundStates';
import { Round } from '../../../../classes/round/round';
import { Game } from '../../../../classes/game/game';


@Component({
	tag: 'game-interface',
	shadow: true
})
export class GameInterface {
	@Prop() game: Game;

	
	componentDidLoad() {
		this.startGame()

	}
	startGame(){
		this.nextRound(1)
	}

	nextRound(roundNumber){
		if(this.game.currentRound)
			delete this.game.currentRound
		this.game.currentRound = new Round(roundNumber);
		while(this.game.currentRound.state !== RoundStates['end of round'])
		if(this.game.currentRound.roundNumber < this.game.totalRounds)
			this.nextRound(roundNumber ++)
	}


	render() {
		return (
			<div>
				{this.game.currentRound.state === RoundStates['pre fight'] &&
				<pre-fight-interface />}
				{this.game.currentRound.state === RoundStates['news headlines'] &&
				<news-headlines-interface />}
				{this.game.currentRound.state === RoundStates['fight day'] &&
				<fight-day-interface />}
			</div>
		);
	}
}
