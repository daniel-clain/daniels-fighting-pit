import { Component, Listen, State } from '@stencil/core';
import { Fighter } from '../../classes/fighter/fighter';
import { Dimensions } from '../../models/dimensions';
import { Subject } from 'rxjs';
import { ArenaInfo } from '../../models/arenaInfo';
import { random } from '../../helper-functions/helper-functions';



@Component({
	tag: 'fight-day-test',
	shadow: true
})
export class FightDayTest {

	
	@State() fighters: Fighter[] = [
    new Fighter('Daniel', {x: random(700), y: random(300) + 100}, 3, 3, 3, 3, 0),
    new Fighter('Tomasz', {x: random(500), y: random(300) + 100}, 2, 2, 2, 1, 0),
    new Fighter('Hassan', {x: random(500), y: random(300) + 100}, 2, 2, 2, 1, 0), 
    new Fighter('Dardan', {x: random(500), y: random(300) + 100}, 3, 1, 1, 1, 0),
    new Fighter('Alex', {x: random(700), y: random(300) + 100}, 1, 1, 0, 3, 0),
    new Fighter('Angelo', {x: random(700), y: random(300) + 100}, 0, 2, 0, 1, 0),
    new Fighter('Paul', {x: random(700), y: random(300) + 100}, 0, 1, 0, 0, 0),
    new Fighter('Suleman', {x: random(700), y: random(300) + 100}, 0, 3, 0, 0, 0),
    new Fighter('Mark', {x: random(700), y: random(300) + 100}, 1, 1, 0, 0, 0),/**/
    new Fighter('Mat', {x: random(700), y: random(300) + 100}, 1, 1, 0, 3, 0),
    new Fighter('Mike', {x: random(700), y: random(300) + 100}, 0, 3, 2, 0, 0) 
  ]
  
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
	fightStartSubject: Subject<any> = new Subject()

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
			fighter.giveFightInfo(arenaInfo, otherFighters, this.fightStartSubject)
		})	
		this.fightStartSubject.next()
	}

	render() {

		return (
			<fight-arena>
				{this.fighters.map(fighter => <fighter-model fighter={fighter}></fighter-model>)}
			</fight-arena>
		)
	}


}