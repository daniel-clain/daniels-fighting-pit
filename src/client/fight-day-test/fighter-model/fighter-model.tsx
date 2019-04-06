import { Component, Prop } from '@stencil/core';
import { Fighter } from '../../../classes/fighter/fighter';
import { FighterModelImage } from '../../../models/fighterModelImage';
import { FighterModelStates } from '../../../enums/fighterModelStates';


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
		const {x, y} = this.fighter.position
		const movement = {
			left: `${x}px`,
			bottom: `${y}px`,
			zIndex: `${this.fighter.modelState == FighterModelStates['down and out'] ? '0' : 1000-y}`
		}
		

		let fmi: FighterModelImage = this.fighter.fighterModelImages.find(image => image.modelState === this.fighter.modelState)
		const {width, height} = fmi.dimensions

		const fighterImageStyle = {
			width: `${width}px`,
			height: `${height}px`,
			transform: `${this.fighter.facingDirection == 'left' ? 'scalex(-1)' : 'none'}`,
			backgroundImage: `url(../../assets/fighter-images/${fmi.imageName})`
		}
		
		
		return ([
			<div class="preloaded-images">
				<img src="assets/fighter-images/block.png" />
				<img src="assets/fighter-images/dodge.png" />
				<img src="assets/fighter-images/down-and-out.png" />
				<img src="assets/fighter-images/idle.png" />
				<img src="assets/fighter-images/punch.png" />
				<img src="assets/fighter-images/recover.png" />
				<img src="assets/fighter-images/take-hit.png" />
				<img src="assets/fighter-images/walking.png" />
			</div>,
			<div class="fighter" style={movement}>
				<div class="fighter-name">{this.fighter.name}</div>
				<div class="fighter-image__" style={fighterImageStyle}></div>
			</div>
		])
	}
}