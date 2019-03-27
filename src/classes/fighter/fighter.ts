import {FighterModelStates} from './../../enums/fighterModelStates';

import {FacingDirections} from './../../enums/facingDirections';
import {Edges} from './../../enums/edges';
import { FighterTacticsStates } from "../../enums/fighterTacticsStates";
import { Position } from "../../models/position";
import { FighterLevels } from "../../models/fighterLevels";
import { Subject, Subscription } from "rxjs";
import { rand } from "../../helper-functions/helper-functions";
import { Dimensions } from "../../models/dimensions";
import { ArenaInfo } from "../../models/arenaInfo";
import { FighterModelImage } from "../../models/fighterModelImage";
class ModelEdgeVals{
  top: number;
  left: number
  right: number;
  bottom: number;
}

export class Fighter {
  pos: Position 
  name: string
  fighterTacticsState: FighterTacticsStates
  fighterModelState: FighterModelStates
  facingDirectionState: FacingDirections
  arenaDimensions: Dimensions
  watchOtherFighters: Subscription[]

  movingInDirection: number;
  stateSubj: Subject<FighterTacticsStates> = new Subject();
  modelUpdateSubj: Subject<any> = new Subject()
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
      modelState: FighterModelStates['idle'],
			dimensions: {width: 41, height: 93},
			imageName: 'idle.jpg'		
		},		
		{
      modelState: FighterModelStates['punching'],
			dimensions: {width: 63, height: 79},
			imageName: 'punch.jpg'		
		},		
		{
      modelState: FighterModelStates['down and out'],
			dimensions: {width: 80, height: 40},
			imageName: 'down-and-out.jpg'		
		},		
		{
      modelState: FighterModelStates['dodging'],
			dimensions: {width: 49, height: 79},
			imageName: 'dodge.jpg'		
		},		
		{
      modelState: FighterModelStates['blocking'],
			dimensions: {width: 53, height: 74},
			imageName: 'block.jpg'		
		},		
		{
      modelState: FighterModelStates['taking a hit'],
			dimensions: {width: 56, height: 83},
			imageName: 'take-hit.jpg'		
		}
	]


  constructor(name: string, pos: Position) {
    this.name = name
    this.pos = pos
    this.fighterTacticsState = FighterTacticsStates['ready to fight'];
    this.fighterModelState = FighterModelStates['idle'];
    this.setRandomProperties()
  }

  getModelEdgeVals(): ModelEdgeVals{
    const modelDimensions: Dimensions = this.fighterModelImages.find(image => image.modelState == this.fighterModelState).dimensions
    let modelEdgeVals: ModelEdgeVals = {
      left: this.pos.x,
      top: this.pos.y,
      right: this.pos.x + modelDimensions.width,
      bottom: this.pos.y - modelDimensions.height
    }

    return modelEdgeVals
  }

	fight(arenaInfo: ArenaInfo, otherFighters: Fighter[]){
    this.arenaDimensions = arenaInfo.dimensions
    this.watchOtherFighters = otherFighters.map(fighter => fighter.movementSubj.subscribe(fighter => this.onOtherFighterMovements(fighter)))
    arenaInfo.dimensionUpdates.subscribe(dimensions => this.arenaDimensions = dimensions)
		this.doThing()
  }
  
  private checkIfCloseTo(edge: Edges, thisVals: ModelEdgeVals, otherVals: ModelEdgeVals): boolean{
    const space = 10
    const other40 = (thisVals.top - thisVals.bottom) * 0.4
    /* console.log(`LEFT: otherVals.left: ${otherVals.left} < thisVals.left: ${thisVals.left} &&
    otherVals.right: ${otherVals.right} > thisVals.left - space: ${thisVals.left - space}`); */

    /* console.log(`VERTICLE: otherVals.bottom: ${otherVals.bottom} < thisVals.top: ${thisVals.top} &&
    otherVals.top: ${otherVals.top} > thisVals.bottom: ${thisVals.bottom}`); */
    if(edge == Edges.left){
      if(((otherVals.left < thisVals.left) && (otherVals.right > (thisVals.left - space))) && 
      (otherVals.bottom + other40 < thisVals.top && otherVals.top - other40 > thisVals.bottom)){
        return true
      }
    }

    /* console.log(`RIGHT: otherVals.right: ${otherVals.right} > thisVals.right: ${thisVals.right} && 
    otherVals.left: ${otherVals.left} < thisVals.right + space: ${thisVals.right + space}`); */
    if(edge == Edges.right){
      if((otherVals.right > thisVals.right && otherVals.left < (thisVals.right + space)) && 
      (otherVals.bottom + other40 < thisVals.top && otherVals.top - other40 > thisVals.bottom)){
        return true
      }
    }

  }
  
  private onOtherFighterMovements(fighter: Fighter){
    const thisEdgeVals: ModelEdgeVals = this.getModelEdgeVals()
    const otherEdgeVals: ModelEdgeVals = fighter.getModelEdgeVals()
    let fighterClose = false
    const isCloseToLeft = this.checkIfCloseTo(Edges.left, thisEdgeVals, otherEdgeVals)
    const isCloseToRight = this.checkIfCloseTo(Edges.right, thisEdgeVals, otherEdgeVals)
    if(isCloseToLeft){
      fighterClose = true
      this.facingDirectionState = FacingDirections['left']
      this.modelUpdateSubj.next()
      console.log(`${fighter.name} is to the left of ${this.name}`);
    }
    if(isCloseToRight){
      fighterClose = true
      this.facingDirectionState = FacingDirections['right']
      this.modelUpdateSubj.next()
      console.log(`${fighter.name} is to the right of ${this.name}`);
    }
    
    if(fighterClose){
      
      const chanceToAttack = rand(5)
      if(chanceToAttack > 3){
        //console.log(`${this.name} is close to ${fighter.name}`);
        if(this.fighterModelState == FighterModelStates['idle']){
          this.tryToHitFighter(fighter)
        }
        
      }
    }
  }

  private tryToHitFighter(fighter: Fighter){
    this.fighterModelState = FighterModelStates['punching']
    fighter.incommingAttack(this)
    setTimeout(() => this.backToNormal(), 700)
  }

  private backToNormal(){
    if(this.fighterTacticsState !== FighterTacticsStates['down and out']){
      this.fighterModelState = FighterModelStates['idle']
      this.doThing()
    }
  }

  incommingAttack(fighter: Fighter){
    const dodgeChance = rand(1)
    if(dodgeChance == 0){
      console.log(`${fighter.name}'s attack was dodged by ${this.name}`);
      this.fighterModelState = FighterModelStates['dodging']
      setTimeout(() => this.backToNormal(), 800)
    } else {
      const blockChance = rand(1)
      if(blockChance == 0){
        console.log(`${fighter.name}'s attack was blocked by ${this.name}`);
        this.fighterModelState = FighterModelStates['blocking']
        setTimeout(() => this.backToNormal(), 500)
      } else {
        console.warn(`${fighter.name}'s attack hit ${this.name}`);
        this.fighterModelState = FighterModelStates['taking a hit']
        setTimeout(() => this.getKnockedOut(), 800)
      }
    }
  }

  private getKnockedOut(){
    this.watchOtherFighters.forEach(subscription => subscription.unsubscribe())
    this.fighterModelState = FighterModelStates["down and out"]
    this.fighterTacticsState = FighterTacticsStates["down and out"]
  }
  

	doThing(){
		return new Promise((resolve) => {
			this.walkRandomDirection(rand(3))
			.then(() => {
        if(this.fighterModelState == FighterModelStates['idle'])
        this.doThing(); 
        resolve()
      })
		})

	}
	setFacingDirectionByDegree(directionDegree){
    if(directionDegree < 18){
      if(this.facingDirectionState != FacingDirections.right ){
        this.updateFacingDirection(FacingDirections.right)
      }
    } else {
      if(this.facingDirectionState != FacingDirections.left ){
        this.updateFacingDirection(FacingDirections.left)
      }
    }

  }

  updateFacingDirection(dir: FacingDirections){
    this.facingDirectionState = dir
    this.modelUpdateSubj.next()

  }

	async walkRandomDirection(forXseconds: number){
    //console.log(`${this.name} walk for ${forXseconds} seconds`);
		return new Promise((resolveWalking) => {
			
      const rd = rand(36)
      this.setFacingDirectionByDegree(rd)
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
        
				
				const {x, y} = this.pos
				const moveAmount = 5
				let addXAmmount = Math.round(xPercent/100*moveAmount)
        let addYAmmount = Math.round(yPercent/100*moveAmount)
        
        const edgeVals: ModelEdgeVals = this.getModelEdgeVals()
				if(edgeVals.right + addXAmmount > this.arenaDimensions.width || edgeVals.left + addXAmmount < 0){
          addXAmmount = 0
          timesUp = true
				}
				if(edgeVals.top + addYAmmount > this.arenaDimensions.height || edgeVals.bottom + addYAmmount < 0){
					addYAmmount = 0
          timesUp = true
				}
				this.pos = {
					x: x + addXAmmount,
					y: y + addYAmmount
				}
				
        this.movementSubj.next(this)
        this.modelUpdateSubj.next()
				return new Promise(resolve => setTimeout(resolve, 100))
			}

			const moveABitRepeat = () => {
				walkABit()
				.then(() => {					
					if(!timesUp && this.fighterModelState == FighterModelStates['idle']){
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

}