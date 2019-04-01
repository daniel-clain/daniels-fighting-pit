import {AttackResults} from './../../enums/attackResults';
import {FighterAttack} from './../../models/fighterAttack';
import {LeftOrRight} from './../../enums/leftOrRight';
import {FighterModelStates} from './../../enums/fighterModelStates';
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
import { FighterProximity } from '../../models/fighterProximity';
import { Closeness } from '../../enums/closeness';
import { Degree } from '../../models/degree';
import { FighterActionStates } from '../../enums/fighterActionStates';
import { Edges } from '../../enums/edges';
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
  actionState: FighterActionStates
  modelState: FighterModelStates
  facingDirectionState: LeftOrRight
  arenaDimensions: Dimensions
  movePromiseReject

  modelUpdateSubj: Subject<any> = new Subject()
  movementSubj: Subject<Fighter> = new Subject();
  otherFighterSubscriptions: Subscription[]
  fighterLevels: FighterLevels = {
    stamina: 100,
    spirit: 100,
  };
  animationTimes = {
    punch: 700,
    block: 700,
    dodge: 700,
    takeAHit: 700
  }
  
  recoveryTimes = {
    punch: 500,
    block: 300,
    dodge: 200,
    takeAHit: 200
  }

  recoveryVal: number
  strength: number
  speed: number
  aggression: number
  stamina: number

  private movingDirection: Degree = {value: 0}
  private veryCloseFighters: Fighter[] = []
  private nearbyFighters: Fighter[] = []
  private farFighters: Fighter[] = []

  
	fighterModelImages: FighterModelImage[] = [
		{
      modelState: FighterModelStates['idle'],
			dimensions: {width: 58, height: 92},
			imageName: 'idle.png'		
		},		
		{
      modelState: FighterModelStates['punching'],
			dimensions: {width: 63, height: 79},
			imageName: 'punch.png'		
		},		
		{
      modelState: FighterModelStates['down and out'],
			dimensions: {width: 80, height: 40},
			imageName: 'down-and-out.png'		
		},		
		{
      modelState: FighterModelStates['dodging'],
			dimensions: {width: 49, height: 79},
			imageName: 'dodge.png'		
		},		
		{
      modelState: FighterModelStates['blocking'],
			dimensions: {width: 53, height: 74},
			imageName: 'block.png'		
		},		
		{
      modelState: FighterModelStates['taking a hit'],
			dimensions: {width: 56, height: 83},
			imageName: 'take-hit.png'		
		},		
		{
      modelState: FighterModelStates['walking'],
			dimensions: {width: 41, height: 93},
			imageName: 'walking.png'		
		},		
		{
      modelState: FighterModelStates['recovering'],
			dimensions: {width: 45, height: 67},
			imageName: 'recover.png'		
		}
	]


  constructor(name: string, pos: Position, speed: number, strength: number) {
    this.name = name
    this.pos = pos
    this.speed = speed
    this.strength = strength
    this.stamina = 4
    this.recoveryVal = 2
    this.tacticsState = FighterTacticsStates['watch'];
    this.modelState = FighterModelStates['idle'];
    this.actionState = FighterActionStates['nothing']

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
    // arenaInfo.dimensionUpdates.subscribe(dimensions => this.arenaDimensions = dimensions)		

    this.updateTacticsState(FighterTacticsStates['wander around'])
    this.pollOtherFightersPositions(otherFighters)
  }


  
  private checkHowCloseOtherFighterIs(fighter: Fighter): FighterProximity{
    
    const otherVals = fighter.getModelEdgeVals()
    const thisVals = this.getModelEdgeVals()

    const otherHeight80 = (otherVals.top - otherVals.bottom) * 0.8
    const thisHeight80 = (thisVals.top - thisVals.bottom) * 0.8
    const otherHeight20 = (otherVals.top - otherVals.bottom) * 0.2
    const thisHeight20 = (thisVals.top - thisVals.bottom) * 0.2

    const rangesOfCloseness = [
      {
        closeness: Closeness['very close'], 
        space: 15,
        thisHeight: thisHeight80,
        otherHeight: otherHeight80
      },
      {
        closeness: Closeness['nearby'], 
        space: 200,
        thisHeight: thisHeight20,
        otherHeight: otherHeight20
      },
      {
        closeness: Closeness['far'], 
        space: 500,
        thisHeight: thisHeight20,
        otherHeight: otherHeight20
      },
      {
        closeness: Closeness['very far'], 
        space: null
      }
    ]

    for(let i = 0; i < rangesOfCloseness.length; i++){
      if(rangesOfCloseness[i].closeness !== Closeness['very far']){
        if(((otherVals.left <= thisVals.left) && (otherVals.right > (thisVals.left - rangesOfCloseness[i].space))) && 
        ((otherVals.bottom + rangesOfCloseness[i].otherHeight) < thisVals.top && otherVals.top  > (thisVals.bottom + rangesOfCloseness[i].thisHeight))){
          return {side: LeftOrRight['left'], closeness: rangesOfCloseness[i].closeness}
        }
        if((otherVals.right >= thisVals.right && otherVals.left < (thisVals.right + rangesOfCloseness[i].space)) && 
        ((otherVals.bottom + rangesOfCloseness[i].otherHeight) < thisVals.top && otherVals.top  > (thisVals.bottom + rangesOfCloseness[i].thisHeight))){
          return {side: LeftOrRight['right'], closeness: rangesOfCloseness[i].closeness}
        }
      } else {
        if(otherVals.left < thisVals.left){
          return {side: LeftOrRight['left'], closeness:rangesOfCloseness[i].closeness}
        }
        if(otherVals.right > thisVals.right){
          return {side: LeftOrRight['right'], closeness: rangesOfCloseness[i].closeness}
        }
      }
    }
  }

   

  getDegreeOfOtherFighter(fighter: Fighter, opposite?: boolean): Degree{
    let otherFigherDegreeFromFighter: Degree = {value: null}
    let xLength = fighter.pos.x - this.pos.x
    let yLength = fighter.pos.y - this.pos.y
    if(opposite){      
      xLength = this.pos.x - fighter.pos.x
      yLength = this.pos.y - fighter.pos.y
    }
    
    if (yLength == 0 && xLength == 0){
      otherFigherDegreeFromFighter.value = 0
    } else if(yLength == 0 || xLength == 0){
      if(xLength == 0 && xLength > 0){
        otherFigherDegreeFromFighter.value = 0
      }
      if(yLength == 0 && xLength > 0){
        otherFigherDegreeFromFighter.value = 90
      }
      if(xLength == 0 && yLength < 0){
        otherFigherDegreeFromFighter.value = 180
      }
      if(yLength == 0 && xLength < 0){
        otherFigherDegreeFromFighter.value = 270
      }
    } else {
      let adjacentSide
      let oppositeSide
      let addedDegrees
      if(xLength < 0 && yLength > 0){
        oppositeSide = yLength
        adjacentSide = xLength * -1
        addedDegrees = 270
      }    
      if(xLength < 0 && yLength < 0){
        adjacentSide = yLength * -1
        oppositeSide = xLength * -1
        addedDegrees = 180
      }    
      if(xLength > 0 && yLength < 0){
        oppositeSide = yLength * -1
        adjacentSide = xLength
        addedDegrees = 90
      }    
      if(xLength > 0 && yLength > 0){
        adjacentSide = yLength
        oppositeSide = xLength
        addedDegrees = 0
      }
  
      const degrees = Math.round(Math.atan(oppositeSide/adjacentSide) * (180 / Math.PI))
      otherFigherDegreeFromFighter.value = degrees + addedDegrees
    }

    return otherFigherDegreeFromFighter
  }

  private prepareToBlockOrDodge(){

  }

  private pollOtherFightersPositions(otherFighters: Fighter[]){    

    setTimeout(() => {
      if(this.modelState != FighterModelStates['down and out']){
    
        otherFighters = otherFighters.filter(fighter => fighter.modelState !== FighterModelStates['down and out'])
        this.determineOtherFightersProximity(otherFighters)        
        this.respondToOtherFighterPositions()

        this.pollOtherFightersPositions(otherFighters)
      }
    }, 100)

  }

  private respondToOtherFighterPositions(){    

    const facingCloseFighter = this.veryCloseFighters.find(fighter => {
      const fighterProximity: FighterProximity = this.checkHowCloseOtherFighterIs(fighter)
      const facingOtherFighter: boolean = fighterProximity.side == this.facingDirectionState
      if(facingOtherFighter){
        return true
      }
    })

    if(facingCloseFighter){
      
      if(this.actionState == FighterActionStates['nothing']){
        this.interuptWanderingAround('close to fighter')
        this.respondToCloseFighter(facingCloseFighter)
      }
    } 
    else {
      const facingNearFighter = this.nearbyFighters.find(fighter => {
        const fighterProximity: FighterProximity = this.checkHowCloseOtherFighterIs(fighter)
        const facingOtherFighter: boolean = fighterProximity.side == this.facingDirectionState
        if(facingOtherFighter){
          return true
        }
      })
      if(facingNearFighter){
        
        if(this.actionState == FighterActionStates['nothing'] && (this.modelState == FighterModelStates['idle'] || this.modelState == FighterModelStates['walking'])){
          this.respondToNearbyFighter(facingNearFighter)
        }
      } 
      else {
        const farFighter = this.farFighters[0]
        if(rand(5) < 3 && farFighter){
          if(this.actionState == FighterActionStates['nothing']){
            this.respondToFarFighter(farFighter)
          }
        }
        else {
          // if no one is near recover then walk around
          if(this.actionState == FighterActionStates['nothing']){
            if(this.tacticsState == FighterTacticsStates['keeping away']){
              if(this.stamina < 4){
                this.updateTacticsState(FighterTacticsStates['recover'])
              } else {            
                this.updateTacticsState(FighterTacticsStates['wander around'])
              }
            } else if(this.tacticsState !== FighterTacticsStates['wander around']) {
              console.log(`nobody infront of ${this.name}`);
              this.updateTacticsState(FighterTacticsStates['wander around'])
            }
          }
        }
      }
    }  
  }
  
  private recoveryLoop(){
    setTimeout(() => {
      if(this.modelState == FighterModelStates['recovering']){
        this.stamina++
        if(this.stamina < 4){
          this.recoveryLoop()
        } else {
          console.log(`${this.name} is fully recovered`);
          this.updateTacticsState(FighterTacticsStates['wander around'])
        }
      }
    }, this.recoveryVal*1000)
  }

  private interuptWanderingAround(reason: string){
    if(this.tacticsState == FighterTacticsStates['wander around']){
      if(this.movePromiseReject){
        this.movePromiseReject(reason)
      }
    }
  }
  
  private determineOtherFightersProximity(fighters: Fighter[]){
    this.nearbyFighters = []
    this.veryCloseFighters = []
    this.farFighters = []
    fighters.forEach(fighter => {
      const fighterProximity: FighterProximity = this.checkHowCloseOtherFighterIs(fighter)
      if(fighterProximity){
        if(fighterProximity.closeness == Closeness['very close']){
          if(!this.veryCloseFighters.find(f => f.name == fighter.name))
            this.veryCloseFighters.push(fighter)
        }      
        if(fighterProximity.closeness == Closeness['nearby']){
          if(!this.nearbyFighters.find(f => f.name == fighter.name))
            this.nearbyFighters.push(fighter)
        }
        if(fighterProximity.closeness == Closeness['far']){
          if(!this.farFighters.find(f => f.name == fighter.name))
            this.farFighters.push(fighter)
        }
      } 
    })
  }

  
  private respondToCloseFighter(fighter: Fighter){    
    if(this.tacticsState == FighterTacticsStates['wander around'] || this.tacticsState == FighterTacticsStates['watch']){
      const decideToAttack = rand(4)
      if(decideToAttack){
        this.updateTacticsState(FighterTacticsStates['attack'])
      } else {
        this.updateTacticsState(FighterTacticsStates['keeping away'])
      }
    }

    switch(this.tacticsState){
      case FighterTacticsStates['attack'] : 
        this.tryToHitFighter(fighter)
        break;
      case FighterTacticsStates['defend'] :
        this.prepareToBlockOrDodge()
        break;
      case FighterTacticsStates['keeping away'] : 
        this.moveAwayFromFighter(fighter)
        break;
    }
  }

  private respondToNearbyFighter(fighter: Fighter){
    if(this.tacticsState == FighterTacticsStates['wander around'] || this.tacticsState == FighterTacticsStates['watch']){
      const decideToAttack = rand(4)
      if(decideToAttack){
        this.updateTacticsState(FighterTacticsStates['attack'])
      } else {
        this.updateTacticsState(FighterTacticsStates['keeping away'])
      }
    }

    switch(this.tacticsState){
      case FighterTacticsStates['attack'] :           
        this.moveTowardFighter(fighter)          
        break;        
      case FighterTacticsStates['keeping away'] :   
        this.moveAwayFromFighter(fighter)
        break;
    }
    
  } 

  
  private respondToFarFighter(fighter: Fighter){
    if(this.tacticsState == FighterTacticsStates['wander around']){
        this.updateTacticsState(FighterTacticsStates['attack'])
    }

    switch(this.tacticsState){
      case FighterTacticsStates['attack'] :           
        this.moveTowardFighter(fighter)          
        break;    
    }    
  } 
  moveTowardFighter(fighter: Fighter){
    this.movingDirection = this.getDegreeOfOtherFighter(fighter)
    this.updateActionState(FighterActionStates['moving toward fighter'])
    const duration = 2
    console.log(`${this.name} is moving toward ${fighter.name} for ${duration} seconds`);
    this.move(duration)
    .then(() => {
      this.updateActionState(FighterActionStates['nothing'])
    })
    .catch(error => {
      console.log(`${this.name} move toward finished early because ${error}`);
      if(error.match(/^(?=.*\bedge\b)(?=.*\bhit\b).*$/g)){
        this.moveAwayFromWall()
        .then(() => this.updateActionState(FighterActionStates['nothing']))
      } else {
        this.updateActionState(FighterActionStates['nothing'])
      }
    })
  }

  moveAwayFromFighter(fighter){
    this.movingDirection = this.getDegreeOfOtherFighter(fighter, true)
    this.updateActionState(FighterActionStates['moving away from fighter'])
    
    const duration = 4
    //console.log(`${this.name} is moving away from ${fighter.name} for ${duration} seconds`);
    this.move(duration)
    .then(() => {
      this.updateActionState(FighterActionStates['nothing'])
    })
    .catch(error => {
      console.log(`${this.name} move away finished early because ${error}`);
      if(error.match(/^(?=.*\bedge\b)(?=.*\bhit\b).*$/g)){
        this.moveAwayFromWall()
        .then(() => this.updateActionState(FighterActionStates['nothing']))
      } else {
        this.updateActionState(FighterActionStates['nothing'])
      }
    })
  }

  private awaitAnimationTime(animationTime: number): Promise<any>{
    return new Promise(resolve => setTimeout(() => resolve(), animationTime))
  }
  private awaitRecoveryTime(recoveryTime: number): Promise<any>{
    return new Promise(resolve => setTimeout(() => resolve(), recoveryTime))
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

  isFacingFighter(fighter: Fighter): boolean{
    return this.facingDirectionState != fighter.facingDirectionState
  }


  private tryToHitFighter(fighter: Fighter){
    this.updateModelState(FighterModelStates['punching'])
    this.updateActionState(FighterActionStates['attacking'])
    const attack: FighterAttack = {
      speed: this.speed,
      strength: this.strength
    }
    const result: AttackResults = fighter.getAttacked(this, attack)

    this.awaitAnimationTime(this.animationTimes.punch)
    .then(() => this.afterTryToHitFighter(result))

  }

  getAttacked(fighter: Fighter, fighterAttack: FighterAttack): AttackResults{
    if(this.isFacingFighter(fighter)){
      if(this.dodge(fighterAttack)){
        console.log(`${fighter.name}'s attack was dodged by ${this.name}`);
        this.updateModelState(FighterModelStates['dodging'])
        this.updateActionState(FighterActionStates['defending'])
        this.awaitAnimationTime(this.animationTimes.dodge)
        .then(() => this.afterDodge())
        return AttackResults['dodged']
      } else if(this.block(fighterAttack)){
        console.log(`${fighter.name}'s attack was blocked by ${this.name}`);
        this.updateModelState(FighterModelStates['blocking'])
        this.updateActionState(FighterActionStates['defending'])
        this.awaitAnimationTime(this.animationTimes.block)
        .then(() => this.afterBlock())
        return AttackResults['blocked']
      }
    }
    const hit: Hit = {damage: 1}
    console.warn(`${fighter.name}'s attack hit ${this.name}`);
    this.updateModelState(FighterModelStates['taking a hit'])
    this.awaitAnimationTime(this.animationTimes.takeAHit)
    .then(() => this.justTookAHit(hit))
    return AttackResults['hit']
  }

  

  afterTryToHitFighter(result: AttackResults){
    if(result == AttackResults['critical']){
      this.stamina = this.stamina + 1
    }

    this.updateModelState(FighterModelStates['idle'])

    
    this.awaitRecoveryTime(this.recoveryTimes.punch)
    .then(() => this.backToNormal())
  }

  private afterDodge(){
    if(rand(3)){
      this.updateTacticsState(FighterTacticsStates['attack'])    
    } else { 
      this.updateTacticsState(FighterTacticsStates['keeping away']) 
    }        
    this.awaitRecoveryTime(this.recoveryTimes.dodge)
    .then(() => this.backToNormal())
  }
  private afterBlock(){
    if(rand(3)){
      this.updateTacticsState(FighterTacticsStates['keeping away'])   
    } else {
      this.updateTacticsState(FighterTacticsStates['attack'])   
    }   
    this.awaitRecoveryTime(this.recoveryTimes.block)
    .then(() => this.backToNormal())
  }

  private justTookAHit(hit: Hit){
    this.stamina = this.stamina - hit.damage
    if(this.stamina <= 0){
      this.getKnockedOut()
    } else if( this.stamina <= 2){
      this.updateTacticsState(FighterTacticsStates['keeping away'])   
      
      this.awaitRecoveryTime(this.recoveryTimes.takeAHit)
      .then(() => this.backToNormal())
    } else {
      
      this.awaitRecoveryTime(this.recoveryTimes.takeAHit)
      .then(() => this.backToNormal())
    }
  }

  private getKnockedOut(){
    console.error(`${this.name} has been knocked out`);
    this.updateModelState(FighterModelStates['down and out'])
    this.updateTacticsState(null)
  }

  private backToNormal(){
    if(this.modelState != FighterModelStates['down and out']){
      this.updateActionState(FighterActionStates['nothing'])
      this.updateModelState(FighterModelStates['idle'])
    }
  }  
  

	setFacingDirectionByDegree(directionDegree){
    if(directionDegree < 180){
      if(this.facingDirectionState != LeftOrRight.right ){
        this.updateFacingDirection(LeftOrRight.right)
      }
    } else {
      if(this.facingDirectionState != LeftOrRight.left ){
        this.updateFacingDirection(LeftOrRight.left)
      }
    }
  }

  private updateModelState(state: FighterModelStates){
    this.modelState = state
    this.modelUpdateSubj.next()
  }

  private updateFacingDirection(dir: LeftOrRight){
    this.facingDirectionState = dir
    this.modelUpdateSubj.next()
  }

  private updateTacticsState(state: FighterTacticsStates){
    this.tacticsState = state
    //console.log(`${this.name} tactics state update to ${state}`);
    if(state == FighterTacticsStates['wander around']){      
      this.randomlyWanderAround()
    }   
    if(state == FighterTacticsStates['recover']){
      console.log(`${this.name} is recovering`);      
      this.updateModelState(FighterModelStates['recovering'])
      this.recoveryLoop()
    }
  }
  private updateActionState(state: FighterActionStates){
    console.log(`${this.name} action state update to ${state}`);
    this.actionState = state
  }

  
	randomlyWanderAround(){
    this.movingDirection.value = rand(360)
    const randomDuration = rand(4, true)
    //console.log(`${this.name} moving for ${randomDuration} seconds started`);
    this.move(randomDuration)
    .then(() => this.randomlyWanderAround())
    .catch(error => {
      console.log(`${this.name} wander around ${randomDuration}secs finished early because ${error}`);
      if(this.tacticsState == FighterTacticsStates['wander around']){
        if(error.match(/^(?=.*\bedge\b)(?=.*\bhit\b).*$/g)){
          this.moveAwayFromWall()
          .then(() => this.randomlyWanderAround())
        }
      }
    })
  }
  
  moveAwayFromWall(): Promise<any>{
    let val
    if( this.movingDirection.value < 180){
      val = this.movingDirection.value + (rand(90) + 90)
    }
    if( this.movingDirection.value > 180){
      val = this.movingDirection.value - (rand(90) + 90)
    }
    this.movingDirection.value = val
    return this.move(1).catch(() => {})
  }



  move(duration: number){
    if(this.movePromiseReject){
      this.movePromiseReject('new move started')
    }
    return new Promise((resolve, reject) => {
      this.movePromiseReject = reject
      this.setFacingDirectionByDegree(this.movingDirection.value)
      if(this.modelState != FighterModelStates['walking']){
        this.updateModelState(FighterModelStates['walking'])
      }

      let moveDurationFinished = false
			setTimeout(() => moveDurationFinished = true, duration*1000)

      const moveABitRepeat = () => {
        this.moveABit()
        .then(
          () => {
            if(!moveDurationFinished){
              moveABitRepeat() 
            } else {
              resolve()
            }
          }
        ).catch(reason => {
          reject(reason)
        })
      }

      moveABitRepeat()
      
    })
    .then(() => {
      delete this.movePromiseReject

    })
  }
  moveABit(): Promise<any>{
    return new Promise((resolve, reject) => {
      const {x, y} = this.getMoveXAndYAmmount()
      const edgeHit: Edges = this.moveHitEdge(x,y)
      if(edgeHit){
        reject(`hit ${edgeHit} edge`)
      } 
      else if(this.modelState !== FighterModelStates['walking']){
        this.updateActionState(FighterActionStates['nothing'])
        reject(`model state is ${this.modelState}`)
      }
      else {
        this.updatePosition(x, y)
        setTimeout(resolve, 100)
      }
    })
  }

  updatePosition(x: number, y: number){
    this.pos = {
      x: this.pos.x + x,
      y: this.pos.y + y
    }    
    this.movementSubj.next(this)
  }

  moveHitEdge(x, y): Edges{
    const edgeVals: ModelEdgeVals = this.getModelEdgeVals()
    if(edgeVals.right + x >= this.arenaDimensions.width){
      return Edges.right
    }
    if(edgeVals.left + x < 0){
      return Edges.left
    }
    if(edgeVals.top + y > this.arenaDimensions.height){
      return Edges.top
    }
    if(edgeVals.bottom + y < 0){
      return Edges.bottom
    }
  }

  getMoveXAndYAmmount(): Position{
    let xPercent = 10;
    let yPercent = 10;
    let val
    if(this.movingDirection.value >= 0 && this.movingDirection.value < 90){
      val = this.movingDirection.value - 0			
      xPercent = val/.9
      yPercent = 100 - val/.9
    } 
    else if(this.movingDirection.value >= 90 && this.movingDirection.value < 180){	
      val = this.movingDirection.value - 90						
      xPercent = val/.9
      yPercent = -(100 - val/.9)
    }
    else if(this.movingDirection.value >= 180 && this.movingDirection.value < 270){		
      val = this.movingDirection.value - 180					
      xPercent = -(val/.9)
      yPercent = -(100 - val/.9)
    }
    else if(this.movingDirection.value >= 270 && this.movingDirection.value < 360){		
      val = this.movingDirection.value - 270			
      xPercent = -(val/.9)
      yPercent = 100 - val/.9
    }
    
    const moveAmount = 5
    let addXAmmount = Math.round(xPercent/100*moveAmount)
    let addYAmmount = Math.round(yPercent/100*moveAmount)
    
    return {x: addXAmmount, y: addYAmmount}
  }
}