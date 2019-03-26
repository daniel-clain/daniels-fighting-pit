import { Component, State } from '@stencil/core';
import { Fighter } from '../../classes/fighter/fighter';
import { FighterStates } from '../../enums/fighterStates';
import { rand } from '../../helper-functions/helper-functions';

@Component({
	tag: 'fight-day-test',
	shadow: true
})
export class FightDayTest {
	@State() fighters: Fighter[] = [
		{name:'bob', pos:{x:20, y:20},},
		{name:'fred', pos:{x:20, y:80}},
		{name:'alan', pos:{x:80, y:80}},
		{name:'steve', pos:{x:80, y:20}
	}]

	componentDidLoad(){
		this.fighters.forEach(fighter => this.fight(fighter))
	}

	fight(fighter: Fighter){


		const checkToWalk = setInterval(() => {
			if(fighter.fighterState !== FighterStates['down and out']){
				this.walkRandomDirection(fighter, 4)
				console.log('ding');
			}
			if(this.fighters.filter(fighter => fighter.fighterState !== FighterStates["down and out"]).length === 1){
				clearInterval(checkToWalk)
				console.log('winner :', fighter);
			}
		}, 4*1000)

		
		
		
		console.log('finish');

	}
	
	walking = true;

	async walkRandomDirection(fighter: Fighter, forXseconds: number){
		const rd = rand(360)
		setTimeout(() => {console.log(`moved for ${forXseconds}`);this.walking = false}, forXseconds)

		const walkABit = async() => {
			let xPercent;
			let yPercent
			if(rd > 0 && rd < 90){
				xPercent = rd*.9
				yPercent = 100 - rd*.9
			} 
			else if(rd >= 90 && rd < 180){

			}
			const {x, y} = fighter.pos
			fighter.pos = {
				x: x + xPercent,
				y: y + yPercent
			}

			await setTimeout(null, 100)
		}

		const repeatWalkABit = async () =>{
			await walkABit()
			if(this.walking)repeatWalkABit()
		}
		//repeatWalkABit()
	}


	
	render() {
		return (
			<div>
				<fight-arena>
					{this.fighters.map(fighter => 
						<fighter-model fighter={fighter}>{fighter.name}</fighter-model>)
					}
				</fight-arena>
			</div>
		)
	}

}