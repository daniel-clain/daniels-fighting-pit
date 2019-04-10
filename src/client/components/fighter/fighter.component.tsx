import { Component, Prop, State } from '@stencil/core';
import { FighterModelImage } from '../../../models/fighterModelImage';
import { FacingDirection } from '../../../types/facingDirection';
import { fighterModelImages } from '../../../server/game/fighterModelImages';
import { FighterModelStates } from '../../../types/fighterModelStates';
import { Fighter } from '../../../server/game/fighter/fighter';
import { Position } from '../../../models/position';


@Component({
	tag: 'fighter-component',
	styleUrls: ['fighter.scss'],
	shadow: true
})
export class FighterComponent {
	@Prop() fighter: Fighter
	@State() modelState: FighterModelStates
	@State() position: Position
	@State() facingDirection: FacingDirection


	punchingStyle
	knockedOutStyle
	dodgingStyle
	defendingStyle
	criticalStrikingStyle
	blockingStyle
	activeStyle
	recoveringStyle
	takingAHitStyle
	walkingStyle


	componentWillLoad(){

		this.fighter.positionUpdateSubject.subscribe(
			(position: Position) => this.position = {...position})

		this.fighter.modelStateUpdateSubject.subscribe(
			(modelState: FighterModelStates) => this.modelState = modelState)

		this.fighter.facingDirectionUpdateSubject.subscribe(
			(facingDirection: FacingDirection) => this.facingDirection = facingDirection)
			
		this.position = this.fighter.position
		this.modelState = this.fighter.modelState
		this.facingDirection = this.fighter.facingDirection

		fighterModelImages.forEach((image: FighterModelImage) => {
			const {width, height} = image.dimensions
			const fighterImageStyle = {
				width: `${width}px`,
				height: `${height}px`,
				backgroundImage: `url(../../assets/fighter-images/${image.imageName})`
			}
			switch(image.modelState){
				case 'punching' : this.punchingStyle = fighterImageStyle; break
				case 'knocked out' : this.knockedOutStyle = fighterImageStyle; break
				case 'dodging' : this.dodgingStyle = fighterImageStyle; break
				case 'defending' : this.defendingStyle = fighterImageStyle; break
				case 'critical striking' : this.criticalStrikingStyle = fighterImageStyle; break
				case 'blocking' : this.blockingStyle = fighterImageStyle; break
				case 'active' : this.activeStyle = fighterImageStyle; break
				case 'recovering' : this.recoveringStyle = fighterImageStyle; break
				case 'taking a hit' : this.takingAHitStyle = fighterImageStyle; break
				case 'walking' : this.walkingStyle = fighterImageStyle; break
			}
		})
	}
	
	render() {
		const movement = {
			left: `${this.position.x}px`,
			bottom: `${this.position.y}px`,
			zIndex: `${this.modelState == 'knocked out' ? '0' : 1000-this.position.y}`
		}
		
		return (
			
	<div class="fighter" style={movement}>
		<div class="fighter-name">{this.fighter.name}</div>
		<div class={`fighter__image 
		${this.modelState == 'punching' ? 'fighter__image--is-showing' : ''}
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		`} style={this.punchingStyle} ></div>
		<div class={`fighter__image 
		${this.modelState == 'knocked out' ? 'fighter__image--is-showing' : ''}
		`} style={this.knockedOutStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'dodging' ? 'fighter__image--is-showing' : ''}
		`} style={this.dodgingStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'defending' ? 'fighter__image--is-showing' : ''}
		`} style={this.defendingStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'critical striking' ? 'fighter__image--is-showing' : ''}
		`} style={this.criticalStrikingStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'blocking' ? 'fighter__image--is-showing' : ''}
		`} style={this.blockingStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'active' ? 'fighter__image--is-showing' : ''}
		`} style={this.activeStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'recovering' ? 'fighter__image--is-showing' : ''}
		`} style={this.recoveringStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'taking a hit' ? 'fighter__image--is-showing' : ''}
		`} style={this.takingAHitStyle} ></div>
		<div class={`fighter__image 
		${this.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.modelState == 'walking' ? 'fighter__image--is-showing' : ''}
		`} style={this.walkingStyle} ></div>
	</div>
		)
	}
}
