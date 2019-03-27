import { FighterStates } from "../../enums/fighterStates";
import { Position } from "../../models/position";
import { FighterLevels } from "../../models/fighterLevels";
import { Subject } from "rxjs";
import { rand } from "../../helper-functions/helper-functions";
import { Dimensions } from "../../models/dimensions";
import { Hit } from "../../models/hit";
import { ArenaInfo } from "../../models/arenaInfo";
import { FighterModelImage } from "../../models/fighterModelImage";
/* import { Subject } from "rxjs";
import { FighterLevels } from "../../models/fighterLevels";
import { Hit } from "../../models/hit"; */


export class Fighter {
  pos: Position 
  name: string
  fighterState?: FighterStates
  arenaDimensions: Dimensions

  movingInDirection?: number;
  stateSubj: Subject<FighterStates> = new Subject();
  movementSubj: Subject<Fighter> = new Subject();
  fighterLevels: FighterLevels = {
    stamina: 100,
    spirit: 100,
  };

  strength: number;
  speed: number;
  aggression: number;

  
	fighterModelImages: FighterModelImage[] = [
		{
      matchingState: FighterStates['ready to fight'],
			dimensions: {width: 41, height: 93},
			imageName: 'idle.jpg'		
		},		
		{
      matchingState: FighterStates['attacking'],
			dimensions: {width: 63, height: 79},
			imageName: 'punch.jpg'		
		},		
		{
      matchingState: FighterStates['down and out'],
			dimensions: {width: 80, height: 40},
			imageName: 'down-and-out.jpg'		
		}
	]


  constructor(name: string, pos: Position) {
    this.name = name
    this.pos = pos
    this.fighterState = FighterStates['ready to fight'];
    this.setRandomProperties()
  }

  


	fight(arenaInfo: ArenaInfo, otherFighters: Fighter[]){
    this.arenaDimensions = arenaInfo.dimensions
    otherFighters.forEach(fighter => fighter.movementSubj.subscribe(fighter => this.onOtherFighterMovements(fighter)))
    arenaInfo.dimensionUpdates.subscribe(dimensions => this.arenaDimensions = dimensions)
		this.doThing()
  }
  
  onOtherFighterMovements(fighter: Fighter){
    const {x, y} = fighter.pos
    let fighterClose = false
    if((x < this.pos.x && x > this.pos.x - 20) && (y > this.pos.y - 20 && y < this.pos.y + 20)){
      //console.log(`${fighter.name} is to the left of ${this.name}`);
      fighterClose = true
    }
    if((x > this.pos.x && x < this.pos.x + 20) && (y > this.pos.y - 20 && y < this.pos.y + 20)){
      //console.log(`${fighter.name} is to the right of ${this.name}`);
      fighterClose = true
    }
    if((y < this.pos.y && y > this.pos.y - 20) && (x > this.pos.x - 20 && x < this.pos.x + 20)){
      //console.log(`${fighter.name} is below ${this.name}`);
      fighterClose = true
    }
    if((y > this.pos.y && y < this.pos.y + 20) && (x > this.pos.x - 20 && x < this.pos.x + 20)){
      //console.log(`${this.name} is above ${fighter.name}`);
      fighterClose = true
    }
    if(fighterClose){
      
      const chanceToAttack = rand(5)
      if(chanceToAttack > 3){
        //console.log(`${this.name} is close to ${fighter.name}`);
        if(this.fighterState !== FighterStates['attacking'] && this.fighterState !== FighterStates['down and out']){
          this.tryToHitFighter(fighter)
        }
        
      }
    }
  }

  tryToHitFighter(fighter: Fighter){
    this.fighterState = FighterStates['attacking']
    fighter.incommingAttack(this)
    setTimeout(() => this.backToNormal(), 2000)
  }

  backToNormal(){
    if(this.fighterState !== FighterStates['down and out']){
      this.fighterState = FighterStates['ready to fight']
    }
  }

  incommingAttack(fighter: Fighter){
    const missChance = rand(1)
    if(missChance == 0){
      console.log(`${fighter.name}'s attack missed ${this.name}`);
    } else {
      console.warn(`${fighter.name}'s attack hit ${this.name}`);
      this.fighterState = FighterStates["down and out"]
    }
  }
  

	doThing(){
		return new Promise((resolve) => {
			this.walkRandomDirection(rand(3))
			.then(() => {
        if(this.fighterState !== FighterStates['down and out'])
        this.doThing(); 
        resolve()
      })
		})

	}
	
	walking = true;

	async walkRandomDirection(forXseconds: number){
    //console.log(`${this.name} walk for ${forXseconds} seconds`);
		return new Promise((resolveWalking) => {
			
			const rd = rand(36)
			let timesUp = false;
			setTimeout(() => timesUp = true, forXseconds*1000)

			const walkABit = () => {
				let xPercent = 10;
				let yPercent = 10;
				let val
				if(rd > 0 && rd < 9){
					val = rd - 0			
					xPercent = val/.09
					yPercent = 100 - val/.09
				} 
				else if(rd >= 9 && rd < 18){	
					val = rd - 9						
					xPercent = val/.09
					yPercent = -(100 - val/.09)
				}
				else if(rd >= 18 && rd < 27){		
					val = rd - 18					
					xPercent = -(val/.09)
					yPercent = -(100 - val/.09)
				}
				else if(rd >= 27 && rd < 36){		
					val = rd - 27			
					xPercent = -(val/.09)
					yPercent = 100 - val/.09
        }
        
        const imageDimensions: Dimensions = this.fighterModelImages.reduce((dimensions: Dimensions, image: FighterModelImage) => {
          if(image.matchingState === this.fighterState){
            dimensions = image.dimensions
          }
          return dimensions

        }, {width: null, height: null})
				
				const {x, y} = this.pos
				const moveAmount = 5
				let addXAmmount = Math.round(xPercent/100*moveAmount)
				let addYAmmount = Math.round(yPercent/100*moveAmount)
				if((x + addXAmmount + imageDimensions.width) > this.arenaDimensions.width || x + addXAmmount < 0){
					addXAmmount = 0
				}
				if(y + addYAmmount > this.arenaDimensions.height || (y + addYAmmount - imageDimensions.height) < 0){
					addYAmmount = 0
				}
				this.pos = {
					x: x + addXAmmount,
					y: y + addYAmmount
				}
				
				this.movementSubj.next(this)
				return new Promise(resolve => setTimeout(resolve, 100))
			}

			const moveABitRepeat = () => {
				walkABit()
				.then(() => {					
					if(!timesUp){
						moveABitRepeat()
					} else {
						resolveWalking()
					}
				})
			}
			moveABitRepeat()
		})
  }
  
  private setRandomProperties() {
    //this.name = 'Fred';
  }
 
  public takeAHit(hit: Hit) {
    let { stamina } = this.fighterLevels
    stamina = stamina - hit.damage
    if (stamina <= 0)
      this.updateFighterState(FighterStates['down and out'])
  }

  private updateFighterState(state: FighterStates) {
    this.fighterState = state
    this.stateSubj.next(state)
  }
}