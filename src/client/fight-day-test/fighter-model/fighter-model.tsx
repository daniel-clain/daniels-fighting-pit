import { Component, Prop } from '@stencil/core';
import { Fighter } from '../../../classes/fighter/fighter';
import { FighterModelImage } from '../../../models/fighterModelImage';


@Component({
	tag: 'fighter-model',
	styleUrls: ['fighter-model.scss'],
	shadow: true
})
export class FighterModel {
	@Prop() fighter: Fighter
	@Prop() scale: number
	@Prop() update: number

	
	render() {
		const {x, y} = this.fighter.pos
		const movement = {
			left: `${x}px`,
			bottom: `${y}px`
		}

		let fmi: FighterModelImage = this.fighter.fighterModelImages.find(image => image.matchingState === this.fighter.fighterState)
		const {width, height} = fmi.dimensions

		const fighterImageStyle = {
			width: `${width}px`,
			height: `${height}px`,
			backgroundImage: `url(../../assets/fighter-images/${fmi.imageName})`
		}
		return (
			<div class="fighter" style={movement}>
				<div class="fighter-name">{this.fighter.name}</div>
				<div class="fighter-image" style={fighterImageStyle}></div>
			</div>
		)
	}
}