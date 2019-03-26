import { Component, Prop } from '@stencil/core';
import { Fighter } from '../../../classes/fighter/fighter';

@Component({
	tag: 'fighter-model',
	styleUrls: ['fighter-model.scss'],
	shadow: true
})
export class FighterModel {
	@Prop() fighter: Fighter
	render() {
		const {x, y} = this.fighter.pos
		const style = {
			left: `${x}px`,
			bottom: `${y}px`
		}
		return (
			<div class="fighter" style={style}>
				{this.fighter.name}
			</div>
		)
	}
}