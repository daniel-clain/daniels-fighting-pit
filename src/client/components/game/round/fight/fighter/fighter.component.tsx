import { Component, Prop } from '@stencil/core';
import { FighterSkeleton } from '../../../../../../models/fighter/fighter-skeleton';
import { FighterModelImage } from '../../../../../../models/fighter/fighterModelImage';




@Component({
	tag: 'fighter-component',
	styleUrls: ['fighter.scss'],
	shadow: true
})
export class FighterComponent {
	@Prop() fighter: FighterSkeleton

	

fighterModelImages: FighterModelImage[] = [
	{
		modelState: 'active',
		dimensions: { width: 58, height: 92 },
		imageName: 'idle.png'
	},
	{
		modelState: 'punching',
		dimensions: { width: 63, height: 79 },
		imageName: 'punch.png'
	},
	{
		modelState: 'critical striking',
		dimensions: { width: 87, height: 86 },
		imageName: 'kick.png'
	},
	{
		modelState: 'knocked out',
		dimensions: { width: 80, height: 40 },
		imageName: 'down-and-out.png'
	},
	{
		modelState: 'dodging',
		dimensions: { width: 49, height: 79 },
		imageName: 'dodge.png'
	},
	{
		modelState: 'blocking',
		dimensions: { width: 53, height: 74 },
		imageName: 'block.png'
	},
	{
		modelState: 'defending',
		dimensions: { width: 53, height: 74 },
		imageName: 'block.png'
	},
	{
		modelState: 'taking a hit',
		dimensions: { width: 56, height: 83 },
		imageName: 'take-hit.png'
	},
	{
		modelState: 'walking',
		dimensions: { width: 41, height: 93 },
		imageName: 'walking.png'
	},
	{
		modelState: 'recovering',
		dimensions: { width: 45, height: 67 },
		imageName: 'recover.png'
	}
]


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


		this.fighterModelImages.forEach((image: FighterModelImage) => {
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
			left: `${this.fighter.position.x}px`,
			bottom: `${this.fighter.position.y}px`,
			zIndex: `${this.fighter.modelState == 'knocked out' ? '0' : 1000-this.fighter.position.y}`
		}
		
		return (
			
	<div class="fighter" style={movement}>
		<div class="fighter-name">{this.fighter.name}</div>
		<div class={`fighter__image 
		${this.fighter.modelState == 'punching' ? 'fighter__image--is-showing' : ''}
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		`} style={this.punchingStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.modelState == 'knocked out' ? 'fighter__image--is-showing' : ''}
		`} style={this.knockedOutStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'dodging' ? 'fighter__image--is-showing' : ''}
		`} style={this.dodgingStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'defending' ? 'fighter__image--is-showing' : ''}
		`} style={this.defendingStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'critical striking' ? 'fighter__image--is-showing' : ''}
		`} style={this.criticalStrikingStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'blocking' ? 'fighter__image--is-showing' : ''}
		`} style={this.blockingStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'active' ? 'fighter__image--is-showing' : ''}
		`} style={this.activeStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'recovering' ? 'fighter__image--is-showing' : ''}
		`} style={this.recoveringStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'taking a hit' ? 'fighter__image--is-showing' : ''}
		`} style={this.takingAHitStyle} ></div>
		<div class={`fighter__image 
		${this.fighter.facingDirection == 'left' ? 'fighter__image--facing-left' : ''}
		${this.fighter.modelState == 'walking' ? 'fighter__image--is-showing' : ''}
		`} style={this.walkingStyle} ></div>
	</div>
		)
	}
}
