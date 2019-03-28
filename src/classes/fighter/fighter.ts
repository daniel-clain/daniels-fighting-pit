import {AttackResults} from './../../enums/attackResults';
import {FighterAttack} from './../../models/fighterAttack';
import {LeftOrRight} from './../../enums/leftOrRight';
import {FighterModelStates} from './../../enums/fighterModelStates';
import {Edges} from './../../enums/edges';
import { FighterTacticsStates } from "../../enums/fighterTacticsStates";
import { Position } from "../../models/position";
import { FighterLevels } from "../../models/fighterLevels";
import { Subject, Subscription } from "rxjs";
import { rand } from "../../helper-functions/helper-functions";
import { Dimensions } from "../../models/dimensions";
import { ArenaInfo } from "../../models/arenaInfo";
import { FighterModelImage } from "../../models/fighterModelImage";
import { FighterStates } from '../../enums/fighterStates';
import { Hit } from '../../models/hit';
class ModelEdgeVals{
  top: number;
  left: number
  right: number;
  bottom: number;
}

export class Fighter {
  pos: Position 
  name: string
  state: FighterStates
  tacticsState: FighterTacticsStates
  modelState: FighterModelStates
  facingDirectionState: LeftOrRight
  arenaDimensions: Dimensions
  watchOtherFightersSubscriptions: Subscription[]

  tacticsStateSubj: Subject<FighterTacticsStates> = new Subject();
  modelUpdateSubj: Subject<any> = new Subject()
  movementSubj: Subject<Fighter> = new Subject();
  fighterLevels: FighterLevels = {
    stamina: 100,
    spirit: 100,
  };
  recoveryTimes = {
    punch: 700,
    block: 500,
    dodge: 500,
    takeAHit: 700
  }

  strength: number
  speed: number
  aggression: number
  stamina: number

  private _movingDirection: number

  
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


  constructor(name: string, pos: Position, speed: number) {
    this.name = name
    this.pos = pos
    this.speed = speed
    this.stamina = 2
    this.tacticsState = FighterTacticsStates['attacking'];
    this.modelState = FighterModelStates['idle'];
    this.setRandomProperties()
  }

  getModelEdgeVals(): ModelEdgeVals{
    const modelDimensions: Dimensions = this.fighterModelImages.find(image => image.modelState == this.modelState).dimensions
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
    this.watchOtherFighters(otherFighters)
    arenaInfo.dimensionUpdates.subscribe(dimensions => this.arenaDimensions = dimensions)
		this.doThing()
  }

  private watchOtherFighters(otherFighters: Fighter[]){
    this.watchOtherFightersSubscriptions = otherFighters.map(fighter => fighter.movementSubj.subscribe(fighter => this.respondToOtherFighterMovements(fighter)))
    
  }
  
  private checkIfCloseTo(edge: Edges, thisVals: ModelEdgeVals, otherVals: ModelEdgeVals): boolean{
    const space = 20
    const other80 = (otherVals.top - otherVals.bottom) * 0.8
    const this80 = (thisVals.top - thisVals.bottom) * 0.8
    /* console.log(`LEFT: otherVals.left: ${otherVals.left} < thisVals.left: ${thisVals.left} &&
    otherVals.right: ${otherVals.right} > thisVals.left - space: ${thisVals.left - space}`); */

    /* console.log(`VERTICLE: otherVals.bottom: ${otherVals.bottom} < thisVals.top: ${thisVals.top} &&
    otherVals.top: ${otherVals.top} > thisVals.bottom: ${thisVals.bottom}`); */
    if(edge == Edges.left){
      if(((otherVals.left < thisVals.left) && (otherVals.right > (thisVals.left - space))) && 
      ((otherVals.bottom + other80) < thisVals.top && otherVals.top  > (thisVals.bottom + this80))){
        return true
      }
    }

    /* console.log(`RIGHT: otherVals.right: ${otherVals.right} > thisVals.right: ${thisVals.right} && 
    otherVals.left: ${otherVals.left} < thisVals.right + space: ${thisVals.right + space}`); */
    if(edge == Edges.right){
      if((otherVals.right > thisVals.right && otherVals.left < (thisVals.right + space)) && 
      ((otherVals.bottom + other80) < thisVals.top && otherVals.top  > (thisVals.bottom + this80))){
        return true
      }
    }

  }

  private otherFighterIsClose(fighter: Fighter): LeftOrRight{
    const thisEdgeVals: ModelEdgeVals = this.getModelEdgeVals()
    const otherEdgeVals: ModelEdgeVals = fighter.getModelEdgeVals()
    const isCloseToLeft = this.checkIfCloseTo(Edges.left, thisEdgeVals, otherEdgeVals)
    const isCloseToRight = this.checkIfCloseTo(Edges.right, thisEdgeVals, otherEdgeVals)

    if(isCloseToLeft){
      return LeftOrRight['left']
    }
    if(isCloseToRight){
      return LeftOrRight['right']
    }
  }

  private respondToCloseFighter(fighter: Fighter, otherFighterSide: LeftOrRight){
    const facingOtherFighter: boolean = otherFighterSide == this.facingDirectionState
    if(facingOtherFighter){

      switch(this.tacticsState){
        case FighterTacticsStates['attacking'] : 
          this.tryToHitFighter(fighter)
          break;
        case FighterTacticsStates['defending'] :
          this.prepareToBlockOrDodge()
          break;
        case FighterTacticsStates['keeping away'] : 
          this.movingDirection = 9
          break;
      }
    } else {
      const chanceToTurnAndFaceOtherFighter = rand(1)
      if(chanceToTurnAndFaceOtherFighter){
        this.updateFacingDirection(otherFighterSide)
      }
    }
  }

  private prepareToBlockOrDodge(){

  }
  
  private respondToOtherFighterMovements(fighter: Fighter){
    if(this.modelState !== FighterModelStates['idle']) return

    const otherFighterIsClose: LeftOrRight = this.otherFighterIsClose(fighter)
    if(otherFighterIsClose){
      this.respondToCloseFighter(fighter, otherFighterIsClose)
    }
  }

  private awaitRecoveryTime(recoveryTime: number): Promise<any>{
    return new Promise(resolve => setTimeout(() => resolve(), recoveryTime))
  }

  private tryToHitFighter(fighter: Fighter){
    this.updateModelState(FighterModelStates['punching'])
    const attack: FighterAttack = {
      speed: this.speed,
      strength: this.strength
    }
    const result: AttackResults = fighter.getAttacked(this, attack)

    this.awaitRecoveryTime(this.recoveryTimes.punch)
    .then(() => this.afterTryToHitFighter(result))

  }

  afterTryToHitFighter(result: AttackResults){
    if(result == AttackResults['critical']){
      this.stamina = this.stamina + 1
    }
    this.backToNormal()
  }


  private dodge(fighterAttack: FighterAttack): boolean {
    const randomNumber: number = rand(10)

    const speedDifference: number = this.speed - fighterAttack.speed
    if(speedDifference == 2){
      return randomNumber < 6
    }
    if(speedDifference == 1){
      return randomNumber < 5
    }
    if(speedDifference == 0){
      return randomNumber < 4
    }
    if(speedDifference == -1){
      return randomNumber < 3
    }
    if(speedDifference == -2){
      return randomNumber < 2
    }
  }

  private block(fighterAttack: FighterAttack): boolean {
    const randomNumber: number = rand(10)

    const strengthDifference: number = this.strength - fighterAttack.strength
    if(strengthDifference == 2){
      return randomNumber < 6
    }
    if(strengthDifference == 1){
      return randomNumber < 5
    }
    if(strengthDifference == 0){
      return randomNumber < 4
    }
    if(strengthDifference == -1){
      return randomNumber < 3
    }
    if(strengthDifference == -2){
      return randomNumber < 2
    }
  }


  getAttacked(fighter: Fighter, fighterAttack: FighterAttack): AttackResults{
    if(this.dodge(fighterAttack)){
      console.log(`${fighter.name}'s attack was dodged by ${this.name}`);
      this.updateModelState(FighterModelStates['dodging'])
      this.awaitRecoveryTime(this.recoveryTimes.dodge)
      .then(() => this.afterDodge())
      return AttackResults['dodged']
    } else {
      if(this.block(fighterAttack)){
        console.log(`${fighter.name}'s attack was blocked by ${this.name}`);
        this.updateModelState(FighterModelStates['blocking'])
        this.awaitRecoveryTime(this.recoveryTimes.block)
        .then(() => this.afterBlock())
        return AttackResults['blocked']
      } else {
        const hit: Hit = {damage: 1}
        console.warn(`${fighter.name}'s attack hit ${this.name}`);
        this.awaitRecoveryTime(this.recoveryTimes.block)
        .then(() => this.justTookAHit(hit))
        return AttackResults['hit']
      }
    }
  }

  private afterDodge(){
    this.backToNormal()
  }
  private afterBlock(){
    this.backToNormal()
  }

  private justTookAHit(hit: Hit){
    this.stamina = this.stamina - hit.damage
    if(this.stamina <= 0){
      this.getKnockedOut()
    } else {
      this.backToNormal()
    }
  }

  private getKnockedOut(){
    this.watchOtherFightersSubscriptions.forEach(subscription => subscription.unsubscribe())
    this.updateModelState(FighterModelStates['down and out'])
    this.tacticsState = null
  }

  private backToNormal(){
    this.updateModelState(FighterModelStates['idle'])
    this.doThing()
  }
  

	doThing(){
		return new Promise((resolve) => {
			this.walkRandomDirection(rand(3))
			.then(() => {
        if(this.modelState == FighterModelStates['idle'])
        this.doThing(); 
        resolve()
      })
		})

	}
	setFacingDirectionByDegree(directionDegree){
    if(directionDegree < 18){
      if(this.facingDirectionState != LeftOrRight.right ){
        this.updateFacingDirection(LeftOrRight.right)
      }
    } else {
      if(this.facingDirectionState != LeftOrRight.left ){
        this.updateFacingDirection(LeftOrRight.left)
      }
    }

  }
  
  updateModelState(state: FighterModelStates){
    this.modelState = state
    this.modelUpdateSubj.next()
  }

  updateFacingDirection(dir: LeftOrRight){
    this.facingDirectionState = dir
    this.modelUpdateSubj.next()

  }

  move(){
    const randomDuration = rand(4, true)
    

  }

  private set movingDirection(direction){
    if(direction < 0 || direction >= 36){
      throw `invalid moving direction ${direction}`
    }
    this._movingDirection = direction
  }
  private get movingDirection(){
    return this._movingDirection
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
				if(rd >= 0 && rd < 9){
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
					if(!timesUp && this.modelState == FighterModelStates['idle']){
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