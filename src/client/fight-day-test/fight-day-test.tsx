import { Component, Listen, Prop, State } from '@stencil/core';
import { Fighter } from '../../classes/fighter/fighter';
import { Dimensions } from '../../models/dimensions';
import { Subject } from 'rxjs';
import { ArenaInfo } from '../../models/arenaInfo';


@Component({
	tag: 'fight-day-test',
	shadow: true
})
export class FightDayTest {
	@State() frameUpdates = 0
	@Prop() fighters: Fighter[]
	dimensionUpdates: Subject<Dimensions> = new Subject();

	windowDimensions = {
		width: 100,
		height: 100,
	}
	scale = 1
	@Listen('window:resize')
	handleResize() {
		this.windowDimensions = {
			width: window.innerWidth,
			height: window.innerHeight
		}
	}

	componentDidLoad(){		
		this.windowDimensions = {
			width: window.innerWidth,
			height: window.innerHeight
		}
		const arenaInfo: ArenaInfo = {
			dimensions: this.windowDimensions,
			dimensionUpdates: this.dimensionUpdates

		}
		this.fighters.forEach((fighter: Fighter) => {
			const otherFighters = this.fighters.filter(f => f.name != fighter.name)
			fighter.fight(arenaInfo, otherFighters)
			fighter.movementSubj.subscribe(() => this.onFighterUpdate())
		})		
	}

	onFighterUpdate(){
		this.frameUpdates = this.frameUpdates + 1
	}
	
	render() {

		return (
			<fight-arena>
				{this.fighters.map(
					fighter => <fighter-model fighter={fighter} scale={this.scale} update={this.frameUpdates}></fighter-model>
				)}
			</fight-arena>
		)
	}

}