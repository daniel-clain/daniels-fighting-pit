import { AttackResults } from './../../enums/attackResults';
import { FighterAttack } from './../../models/fighterAttack';
import { FighterModelStates } from './../../enums/fighterModelStates';
import { Position } from "../../models/position";
import { FighterLevels } from "../../models/fighterLevels";
import { Subject, Subscription } from "rxjs";
import { helperFunctions as h } from "../../helper-functions/helper-functions";
import { Dimensions } from "../../models/dimensions";
import { FighterModelImage } from "../../models/fighterModelImage";
import { Hit } from '../../models/hit';
import { Edges } from '../../enums/edges';
import { ArenaInfo } from '../../models/arenaInfo';
import { Proximity } from '../../types/proximity';
import { FacingDirection } from '../../types/facingDirection';
import { Direction360 } from '../../types/movingDirection';
import { ModelEdgeVals } from '../../models/modelEdgeVals';
import { MajorActions } from '../../types/majorActions';
import { MinorActions } from '../../types/minorActions';



export class Fighter {
  position: Position
  name: string
  modelState: FighterModelStates
  facingDirection: FacingDirection
  arenaDimensions: Dimensions
  maxStamina = 4
  knockedOut = false
  actionInterval: NodeJS.Timeout

  modelUpdateSubj: Subject<any> = new Subject()
  movementSubj: Subject<Fighter> = new Subject();
  otherFighterSubscriptions: Subscription[]
  fighterLevels: FighterLevels = {
    stamina: 100,
    spirit: 100,
  };

  recoveryVal: number
  strength: number
  speed: number
  aggression: number
  stamina: number
  otherFightersInTheFight: Fighter[]
  fightersToTheLeft: Fighter[] = []
  fightersToTheRight: Fighter[] = []

  

  //////////////////////////////

  majorActionInProgress: MajorActions
  majorActionTimer: NodeJS.Timeout
  majorActionReject

  minorActionInProgress: MinorActions
  minorActionTimer: NodeJS.Timeout
  minorActionReject

  noActionFor7Seconds = false
  noActionTimerActive = false
  noActionTimer: NodeJS.Timeout

  movingDirection: Direction360

  //////////////////////////////

  fighterAttackingYou: Fighter
  fighterTargetedForAttack: Fighter
  retreatingFromFighter: Fighter

  //////////////////////////////  

  moving: boolean
  moveInterval: NodeJS.Timeout
  moveDurationTimer: NodeJS.Timeout

  //////////////////////////////  
  
  animationTimes = {
    punch: .7,
    block: .7,
    dodge: .7,
    takeAHit: .3
  }

  cooldowns = {
    punch: .5,
    block: .3,
    dodge: .3,
    takeAHit: .1
  }

  //////////////////////////////  

  victoryExpressions = [
    name => `well done to ${name} for winning the fight, you lost me $1000 asshole`,
    name => `congratulations ${name}, you won the fight, we are now going to test you for performance enhancing drugs`,
    name => `congratulations ${name}, you da man, nobody can touch you bro`,
    name => `${name} is the winner, good job bro`,
    name => `${name} has defeated everyone, ${name} is the winner`,
    name => `${name} is the champion, well done, you get a cookie`,
    name => `fuckn ${name} destroy all these manimals, bangla style`,
    name => `${name} smashed it, what a fuckin legend`,
    name => `all the bitches goin crazy for ${name}, someones gonna get laid tonight`,
    name => `${name} won...... he probably cheated.....`,
    name => `congratulations ${name} my G man`,
    name => `pop some champagne for ${name}, what a pimp`,
    name => `all hail ${name} champion of the world`,
    name => `${name} fully smashed it, congrats bro`,
    name => `${name} is the champion, init`,
    name => `${name} is probably gonna spend the victory money on cocaine and whores`,
    name => `oh my fucking god, did you see how badly ${name} messed up all those sorry sons of bitches, amazing`,
    name => `float like a butter fly, sting like bee, ${name} is the king of the world`,
    name => `and now anouncing the champion of the world..... ${name}`,
    name => `damn ${name}, you opend a can of woop ass on those bitch ass hoes`,
    name => `aint nobody gonna mess with ${name}, that geeza is dangerous`,
    name => `nobody can stop ${name}, he is a manimal my G man`,
    name => `${name} eats pieces of shit like you for breakfast`,
    name => `${name}, you're a winner baby`,
    name => `they only reason ${name} won is because the other fighter threw the fight out of pitty, clap clap`,
    name => `wow, nobody sawy that coming, how the hell did ${name} win?`,
    name => `fuck yeah ${name}, you one sexy biatch`,
    name => `Ladies and gentlemen, allow me to introduce your champion, the one, the only ${name}`,
    name => `holy fucking shit, ${name} is a fucking gangsta man`,
    name => `${name} won the fight, congratulations, your prize is you get to work on the talk talk PHP back end, hahah suck a bag of dicks`,
  ]

  

  fighterModelImages: FighterModelImage[] = [
    {
      modelState: FighterModelStates['idle'],
      dimensions: { width: 58, height: 92 },
      imageName: 'idle.png'
    },
    {
      modelState: FighterModelStates['punching'],
      dimensions: { width: 63, height: 79 },
      imageName: 'punch.png'
    },
    {
      modelState: FighterModelStates['down and out'],
      dimensions: { width: 80, height: 40 },
      imageName: 'down-and-out.png'
    },
    {
      modelState: FighterModelStates['dodging'],
      dimensions: { width: 49, height: 79 },
      imageName: 'dodge.png'
    },
    {
      modelState: FighterModelStates['blocking'],
      dimensions: { width: 53, height: 74 },
      imageName: 'block.png'
    },
    {
      modelState: FighterModelStates['taking a hit'],
      dimensions: { width: 56, height: 83 },
      imageName: 'take-hit.png'
    },
    {
      modelState: FighterModelStates['walking'],
      dimensions: { width: 41, height: 93 },
      imageName: 'walking.png'
    },
    {
      modelState: FighterModelStates['recovering'],
      dimensions: { width: 45, height: 67 },
      imageName: 'recover.png'
    }
  ]


  constructor(name: string, position: Position, speed: number, strength: number) {
    this.name = name
    this.position = position
    this.speed = speed
    this.strength = strength
    this.stamina = 4
    this.updateFacingDirection(h.random(1) ? 'left' : 'right')
    this.modelState = FighterModelStates['idle'];

  }


  getModelEdgeVals(): ModelEdgeVals {
    const modelDimensions: Dimensions = this.fighterModelImages.find(image => image.modelState == this.modelState).dimensions
    let modelEdgeVals: ModelEdgeVals = {
      left: this.position.x,
      top: this.position.y,
      right: this.position.x + modelDimensions.width,
      bottom: this.position.y - modelDimensions.height
    }

    return modelEdgeVals
  }

  giveFightInfo(arenaInfo: ArenaInfo, otherFighters: Fighter[], fightStartSubject: Subject<any>) {
    this.arenaDimensions = arenaInfo.dimensions
    this.otherFightersInTheFight = otherFighters
    fightStartSubject.subscribe(() => {
      this.actionInterval = setInterval(() => this.action(), 100)
    })
  }

  

  canSeeAllFighters(facingDirection: FacingDirection): boolean {
    if (this.facingDirection == facingDirection && 
      (facingDirection == 'left' ? this.fightersToTheLeft.length : this.fightersToTheRight.length) == this.otherFightersInTheFight.length) {
      console.log(`${this.name} can see all fighters infront of him`);
      return true
    }
  }

  removeKnockedOutFighters(){
    this.otherFightersInTheFight = this.otherFightersInTheFight.filter((fighter: Fighter) => !fighter.knockedOut)
    this.fightersToTheLeft = this.fightersToTheLeft.filter((fighter: Fighter) => !fighter.knockedOut)
    this.fightersToTheRight = this.fightersToTheRight.filter((fighter: Fighter) => !fighter.knockedOut)

  }

  lookAtAllFightersInfrontOfYou() {
    this.removeKnockedOutFighters()
    this.otherFightersInTheFight.forEach((fighter: Fighter) => {      

      const otherModelEdgeVals: ModelEdgeVals = fighter.getModelEdgeVals()
      const thisModelEdgeVals: ModelEdgeVals = this.getModelEdgeVals()
      if (this.facingDirection == 'left') {
        if (otherModelEdgeVals.left < thisModelEdgeVals.left || otherModelEdgeVals.right < thisModelEdgeVals.right) {
          if(this.fightersToTheLeft.find(f => f.name == fighter.name) == undefined)
            this.fightersToTheLeft.push(fighter)
        } else {          
          if(this.fightersToTheLeft.find(f => f.name == fighter.name) != undefined)
            this.fightersToTheLeft = this.fightersToTheLeft.filter(f => f.name !== fighter.name)
        }
      }

      if (this.facingDirection == 'right') {
        if (otherModelEdgeVals.right > thisModelEdgeVals.right || otherModelEdgeVals.left > thisModelEdgeVals.left) {
          if(this.fightersToTheRight.find(f => f.name == fighter.name) == undefined)
            this.fightersToTheRight.push(fighter)
        } else {          
          if(this.fightersToTheRight.find(f => f.name == fighter.name) != undefined)
            this.fightersToTheRight = this.fightersToTheRight.filter(f => f.name !== fighter.name)
        }
      }
    })
  }

  checkBehind() {
    this.facingDirection = this.facingDirection == 'left' ? 'right' : 'left'
  }
  
  turnAround() {
    this.updateFacingDirection(this.facingDirection == 'left' ? 'right' : 'left')
    this.modelUpdateSubj.next()
  }

  getClosestFighter(): Fighter {
    let fighterNamesAndDistances = []

    fighterNamesAndDistances = this.otherFightersInTheFight.map((fighter: Fighter) => {
      return {
        name: fighter.name,
        distance: this.getFighterDistanceAway(fighter)
      }
    }) 

    if(fighterNamesAndDistances.length != 0){
      fighterNamesAndDistances.sort((a, b) => a.distance - b.distance)
      return this.otherFightersInTheFight.find(f => f.name == fighterNamesAndDistances[0].name)
    }
    else {
      this.victory()
    }
  }

  victory(){
    clearInterval(this.actionInterval)
    const victoryExpression = this.victoryExpressions[h.random(this.victoryExpressions.length - 1)]
    
    var victorySpeech = new SpeechSynthesisUtterance(victoryExpression(this.name));
    this.speak(victorySpeech)

  }

  speak(msg: SpeechSynthesisUtterance){
    window.speechSynthesis.speak(msg);
  }

  getClosestFighterInfrontOfYou(): Fighter{
    let fighterNamesAndDistances = []
    
    const fightersInfrontOfYou: Fighter[] = this.facingDirection == 'left' ?
    this.fightersToTheLeft : this.fightersToTheRight

    fighterNamesAndDistances = fightersInfrontOfYou.map((fighter: Fighter) => {
      return {
        name: fighter.name,
        distance: this.getFighterDistanceAway(fighter)
      }
    }) 

    if(fighterNamesAndDistances.length != 0){
      fighterNamesAndDistances.sort((a, b) => a.distance - b.distance)
      return this.otherFightersInTheFight.find(f => f.name == fighterNamesAndDistances[0].name)
    }
    else {
      debugger
    }
  }

  getCloseFightersInfrontOfYou(): Fighter[]{
    const fightersInfrontOfYou: Fighter[] = this.facingDirection == 'left' ?
    this.fightersToTheLeft : this.fightersToTheRight

    const closeFightersInfrontOfYou: Fighter[] = fightersInfrontOfYou.filter((fighter: Fighter) => {
      const fighterProximity = this.getFighterProximity(fighter)
      return fighterProximity == 'close'
    }) 

    return closeFightersInfrontOfYou
  }

  chanceToLookBehind(): boolean{
    return h.random(3) == 0
  }


  action() {
    if(!this.majorActionInProgress){
      this.lookAtAllFightersInfrontOfYou()
      let closeFightersInfrontOfYou: Fighter[] = this.getCloseFightersInfrontOfYou()
      if(closeFightersInfrontOfYou.length != 0){
        this.respondToCloseFighter()
      }
      else {
        const lookBehind = this.chanceToLookBehind()
        if(lookBehind){
          this.lookAtAllFightersInfrontOfYou()
          let closeFightersInfrontOfYou: Fighter[] = this.getCloseFightersInfrontOfYou()
          if(closeFightersInfrontOfYou.length != 0){
            this.respondToCloseFighter()
          }
          else {
            this.respondToNoCloseFighter()
          }
        }
        else{
          this.respondToNoCloseFighter()
        }
      }
    }
  }

  respondToCloseFighter(){
    if(this.minorActionInProgress){
      this.cancelMinorAction()
    }
    const closestFighter: Fighter = this.getClosestFighterInfrontOfYou()
    this.respondToFighter(closestFighter)
  }

  respondToNoCloseFighter(){
    if(!this.minorActionInProgress){
      const closestFighter: Fighter = this.getClosestFighter()
      if(!this.isFacingFighter(closestFighter)){
        this.turnAround()
      }
      const closestFighterProximity: Proximity = this.getFighterProximity(closestFighter)

      if(closestFighterProximity == 'nearby'){
        this.respondToFighter(closestFighter)
      }
      else {
        if(this.stamina < this.maxStamina){
          this.recover()
        }
        else {
          if(this.noActionFor7Seconds){    
            console.log(`${this.name} has had no action for 7 seconds, responding to ${closestFighterProximity} fighter ${closestFighter.name}`);              
            if(closestFighterProximity != 'far'){
              debugger
            }
            this.respondToFighter(closestFighter)
          }
          else {
            this.wanderAround()
            this.startNoActionTimer()
          }
        }
      }
    }
  }

  startNoActionTimer(){
    this.noActionTimerActive = true
    this.noActionTimer = setTimeout(() => {
      this.noActionFor7Seconds = true
    }, 7000)
  }
  resetNoActionTimer(){
    this.noActionTimerActive = false
    this.noActionFor7Seconds = false
    clearTimeout(this.noActionTimer)
  }

  
  getProbabilityToAttack(fighter: Fighter): number {
    let probability = 1
    if (fighter.facingDirection == this.facingDirection)
      probability += 2
    if (this.stamina == this.maxStamina)
      probability += 2
    if(this.noActionFor7Seconds)
      probability += 2

    const seventyPercentOfOtherFighters = Math.round(this.otherFightersInTheFight.length * 0.7)
    if (this.getNumberFightersInfront('nearby') < seventyPercentOfOtherFighters)
      probability++
    if (this.getNumberFightersInfront('close') > seventyPercentOfOtherFighters)
      probability--

    return probability

  }

  getProbabilityToDefend(fighter: Fighter): number {
    let probability = 0
    if (fighter.fighterTargetedForAttack == this)
      probability += 2
    if (this.stamina < this.maxStamina)
      probability += 2
    if (this.speed < 3)
      probability -= 1

    return probability
  }

  getProbabilityToRetreat(fighter: Fighter): number {
    let probability = 0

    if (this.stamina < this.maxStamina / 2) {
      probability += 4
      if (this.speed = 3)
        probability += 1
          
      if (fighter.fighterTargetedForAttack == this)
        probability += 2

    }

    const seventyPercentOfOtherFighters = Math.round(this.otherFightersInTheFight.length * 0.7)
    if (this.getNumberFightersInfront('nearby') > seventyPercentOfOtherFighters)
      probability += 2
    if (this.getNumberFightersInfront('close') > seventyPercentOfOtherFighters)
      probability += 3

    return probability
  }

  respondToFighter(fighter: Fighter){
    
    const probailityToAttack: number = this.getProbabilityToAttack(fighter)
    const probailityToDefend: number = this.getProbabilityToDefend(fighter)
    const probailityToRetreat: number = this.getProbabilityToRetreat(fighter)

    const totalProbability = probailityToAttack + probailityToDefend + probailityToRetreat

    const random = h.random(totalProbability)
    let probabilityRange: number = 0

    if (random >= probabilityRange && random < probailityToAttack + probabilityRange) {
      this.fighterTargetedForAttack = fighter
      this.attackFighter()
    } else {
      this.fighterTargetedForAttack = undefined
    }
    probabilityRange += probailityToAttack

    if (random >= probabilityRange && random < probailityToDefend + probabilityRange) {
      this.defend()
    }
    probabilityRange += probailityToDefend

    if (random >= probabilityRange && random < probailityToRetreat + probabilityRange) {
      this.retreatingFromFighter = fighter      
      this.retreatFromFighter()
    } else {      
      this.retreatingFromFighter = undefined    
    }
  }

  

  attackFighter() {
    const fighterProximity: Proximity = this.getFighterProximity(this.fighterTargetedForAttack)
    if(fighterProximity == 'close'){
      console.log(`${this.name} trying to hit ${this.fighterTargetedForAttack.name}`);
      this.tryToHitFighter()
    }
    else{
      this.movingDirection = this.getDirectionOfFighter(this.fighterTargetedForAttack)      
      if(!this.moving && !this.minorActionInProgress){        
        console.log(`${this.name} moving to attacking ${this.fighterTargetedForAttack.name}`);
        this.move(1)
      }
    }
  }

  defend() {
    this.startMinorAction(1, 'defending')
    this.updateModelState(FighterModelStates['blocking'])
  }

  retreatFromFighter() {
    console.log(`${this.name} retreating from ${this.retreatingFromFighter.name}`);
    this.movingDirection = this.getDirectionOfFighter(this.retreatingFromFighter, true)    
    if(!this.moving && !this.minorActionInProgress){
      this.move(3)
    }
  }

  wanderAround() {
    this.movingDirection = <Direction360>h.random(360)
    const randomDuration = h.random(4, true)    
    
    if(!this.moving && !this.minorActionInProgress){
      this.move(randomDuration)
    }
  }

  recover() {
    if(this.knockedOut){
      debugger
    }
    this.updateModelState(FighterModelStates['recovering'])
    this.startMinorAction(2, 'recovering')
    .then(() => {
      this.stamina++
    })
  }



  cancelMinorAction(){
    this.minorActionInProgress = null
    this.minorActionReject()    
    if(this.moving)
      this.cancelMove()
  }
  

  cancelMajorAction(){
    this.majorActionInProgress = null
    this.majorActionReject()
    if(this.minorActionInProgress){
      this.cancelMinorAction()
    }
  }


  startMinorAction(duration: number, actionName: MinorActions): Promise<any>{
    this.minorActionInProgress = actionName

    return new Promise((resolve, reject) => {
      this.minorActionReject = reject
      setTimeout(() => {
        this.minorActionInProgress = null
        resolve()
      }, duration*1000)   

    }).catch(()=>{})     
  }

  
  startMajorAction(duration: number, actionName: MajorActions): Promise<any>{
    if(this.majorActionInProgress){
      debugger
    }
    this.majorActionInProgress = actionName
    return new Promise((resolve, reject) => {
      this.majorActionReject = reject
      setTimeout(() => {
        this.majorActionInProgress = null
        if(this.knockedOut){
          reject()
        }
        resolve()
      }, duration*1000)   

    }).catch(()=>{})     
  }

  majorActionCoolDown(duration: number){
    if(!this.majorActionInProgress && !this.knockedOut){
      this.updateModelState(FighterModelStates['idle'])
      this.startMajorAction(duration, 'cooldown')
    }
  }

  getFighterDistanceAway(fighter: Fighter): number{
    let distance
    let xDiff
    if(this.position.x > fighter.position.x)
      xDiff = this.position.x - fighter.position.x
    else 
      xDiff = fighter.position.x - this.position.x

    let yDiff
    if(this.position.y > fighter.position.y)
      yDiff = this.position.y - fighter.position.y
    else 
      yDiff = fighter.position.y - this.position.y

    distance = Math.sqrt(yDiff*yDiff + xDiff*xDiff)

    return distance
  }

  getFighterProximity(fighter: Fighter): Proximity {
    const otherModelEdgeVals: ModelEdgeVals = fighter.getModelEdgeVals()
    const thisModelEdgeVals: ModelEdgeVals = this.getModelEdgeVals()
    let distanceBetweenFighters
    if (this.facingDirection == 'left') {
      distanceBetweenFighters = thisModelEdgeVals.left - otherModelEdgeVals.right
    }
    if (this.facingDirection == 'right') {
      distanceBetweenFighters = otherModelEdgeVals.left - thisModelEdgeVals.right
    }

    const closeVerticleHitBox = this.fighterWithinVerticleHitBox(fighter, 'close')
    const nearbyVerticleHitBox = this.fighterWithinVerticleHitBox(fighter, 'nearby')

    if (distanceBetweenFighters < 15 && closeVerticleHitBox)
      return 'close'
    if (distanceBetweenFighters < 200 && nearbyVerticleHitBox)
      return 'nearby'

    return 'far'
  }

  fighterWithinVerticleHitBox(fighter: Fighter, proximity: Proximity): boolean {
    const thisModelHeight: number = this.fighterModelImages.find(image => image.modelState == this.modelState).dimensions.height
    const otherModelHeight: number = this.fighterModelImages.find(image => image.modelState == this.modelState).dimensions.height

    const twentyPercentOfThisHeight = thisModelHeight * 0.2
    const twentyPercentOfOtherHeight = otherModelHeight * 0.2

    const thisHitBoxTop = this.position.y
    const thisHitBoxBottom = this.position.y - twentyPercentOfThisHeight

    const otherHitBoxTop = fighter.position.y
    const otherHitBoxBottom = fighter.position.y - twentyPercentOfOtherHeight

    if (proximity == 'close') {
      if (thisHitBoxTop > otherHitBoxBottom && thisHitBoxBottom < otherHitBoxTop)
        return true
    }

    if (proximity == 'nearby') {
      const nearbyVerticleSpace = 150
      if (thisHitBoxTop + nearbyVerticleSpace > otherHitBoxBottom && thisHitBoxBottom - nearbyVerticleSpace < otherHitBoxTop)
        return true
    }
  }


  getDirectionOfFighter(fighter: Fighter, opposite?: boolean): Direction360 {

  
    let otherFigherDirectionFromFighter: Direction360
    let xLength = fighter.position.x - this.position.x
    let yLength = fighter.position.y - this.position.y
    if (opposite) {
      xLength = this.position.x - fighter.position.x
      yLength = this.position.y - fighter.position.y
    }

    if (yLength == 0 && xLength == 0) {
      otherFigherDirectionFromFighter = 0
    } else if (yLength == 0 || xLength == 0) {
      if (xLength == 0 && xLength > 0) {
        otherFigherDirectionFromFighter = 0
      }
      if (yLength == 0 && xLength > 0) {
        otherFigherDirectionFromFighter = 90
      }
      if (xLength == 0 && yLength < 0) {
        otherFigherDirectionFromFighter = 180
      }
      if (yLength == 0 && xLength < 0) {
        otherFigherDirectionFromFighter = 270
      }
    } else {
      let adjacentSide
      let oppositeSide
      let addedDegrees
      if (xLength < 0 && yLength > 0) {
        oppositeSide = yLength
        adjacentSide = xLength * -1
        addedDegrees = 270
      }
      if (xLength < 0 && yLength < 0) {
        adjacentSide = yLength * -1
        oppositeSide = xLength * -1
        addedDegrees = 180
      }
      if (xLength > 0 && yLength < 0) {
        oppositeSide = yLength * -1
        adjacentSide = xLength
        addedDegrees = 90
      }
      if (xLength > 0 && yLength > 0) {
        adjacentSide = yLength
        oppositeSide = xLength
        addedDegrees = 0
      }

      const degrees = Math.round(Math.atan(oppositeSide / adjacentSide) * (180 / Math.PI))
      otherFigherDirectionFromFighter = degrees + addedDegrees
    }

    return otherFigherDirectionFromFighter
  }



  getNumberFightersInfront(proximity: Proximity): number {
    let nearbyFightersInfront: number = 0
    if (this.facingDirection == 'left') {
      nearbyFightersInfront = this.fightersToTheLeft.reduce((numberOfFighters: number, fighter: Fighter) => {
        const fighterProximity: Proximity = this.getFighterProximity(fighter)
        if (fighterProximity == proximity) {
          numberOfFighters++
        }
        return numberOfFighters
      }, 0)
    }

    if (this.facingDirection == 'right') {
      nearbyFightersInfront = this.fightersToTheRight.reduce((numberOfFighters: number, fighter: Fighter) => {
        const fighterProximity: Proximity = this.getFighterProximity(fighter)
        if (fighterProximity == proximity) {
          numberOfFighters++
        }
        return numberOfFighters
      }, 0)
    }

    return nearbyFightersInfront

  }


  tryToDodge(fighterAttack: FighterAttack): boolean {

    const randomNumber: number = h.random(10)

    const speedDifference: number = this.speed - fighterAttack.speed
    if (speedDifference == 2) {
      return randomNumber < 6
    }
    if (speedDifference == 1) {
      return randomNumber < 5
    }
    if (speedDifference == 0) {
      return randomNumber < 4
    }
    if (speedDifference == -1) {
      return randomNumber < 3
    }
    if (speedDifference == -2) {
      return randomNumber < 2
    }
  }

  tryToBlock(fighterAttack: FighterAttack): boolean {

    const randomNumber: number = h.random(10)

    const strengthDifference: number = this.strength - fighterAttack.strength
    if (strengthDifference == 2) {
      return randomNumber < 6
    }
    if (strengthDifference == 1) {
      return randomNumber < 5
    }
    if (strengthDifference == 0) {
      return randomNumber < 4
    }
    if (strengthDifference == -1) {
      return randomNumber < 3
    }
    if (strengthDifference == -2) {
      return randomNumber < 2
    }
  }

  isFacingFighter(fighter: Fighter): boolean {
    const directionOfFighter: Direction360 = this.getDirectionOfFighter(fighter)
    if(directionOfFighter < 180 && this.facingDirection == 'right'){
      return true
    }
    if(directionOfFighter >= 180 && this.facingDirection == 'left'){
      return true
    }
  }

  updateFacingDirection(facingDirection: FacingDirection){
    this.facingDirection = facingDirection
    this.modelUpdateSubj.next()
  }


  tryToHitFighter() {
    this.resetNoActionTimer()
    const attack: FighterAttack = {
      speed: this.speed,
      strength: this.strength
    }
    const result: AttackResults = this.fighterTargetedForAttack.getAttacked(this, attack)

    this.startMajorAction(this.animationTimes.punch, 'punching')
    .then(() => this.afterTryToHitFighter(result))
    this.updateModelState(FighterModelStates['punching'])

  }

  getAttacked(fighter: Fighter, fighterAttack: FighterAttack): AttackResults {    
    this.resetNoActionTimer()
    if (this.isFacingFighter(fighter) && !this.majorActionInProgress) {
      if (this.tryToDodge(fighterAttack)) {
        this.dodgeFighterAttack(fighter)
        return AttackResults['dodged']
      } 
      else if (this.tryToBlock(fighterAttack)) {
        this.blockFighterAttack(fighter)
        return AttackResults['blocked']
      }
    }
    const hit: Hit = { damage: 1 }
    this.takeAHit(hit, fighter)
    return AttackResults['hit']
  }

  blockFighterAttack(fighter: Fighter){
    console.log(`${this.name} blocked ${fighter.name}'s attack`);
    this.startMajorAction(this.animationTimes.block, 'blocking')
    .then(() => this.afterBlock())
    this.updateModelState(FighterModelStates['blocking'])
  }

  dodgeFighterAttack(fighter: Fighter){
    console.log(`${this.name} dodged ${fighter.name}'s attack`);
    this.startMajorAction(this.animationTimes.dodge, 'dodging')
    .then(() => this.afterDodge())
    this.updateModelState(FighterModelStates['dodging'])    
  }

  takeAHit(hit: Hit, fighter: Fighter){    
    if(this.majorActionInProgress)
      this.cancelMajorAction()  

    this.stamina = this.stamina - hit.damage
    console.warn(`${this.name} was hit by ${fighter.name}'s attack`);

    if (this.stamina == 0) {     
      this.knockedOut = true
      console.error(`${this.name} has been knocked out by ${fighter.name}`);
      var msg = new SpeechSynthesisUtterance(`${this.name} has been knocked out by ${fighter.name}`);
      this.speak(msg)
      this.cancelMajorAction()
      clearInterval(this.actionInterval)
    }

    this.startMajorAction(this.animationTimes.takeAHit, 'taking a hit')
    .then(() => {
      if(this.knockedOut){
        this.updateModelState(FighterModelStates['down and out'])
      } else {
        this.majorActionCoolDown(this.cooldowns.takeAHit)
      }
    })
    
    this.updateModelState(FighterModelStates['taking a hit'])  
  }
  


  afterTryToHitFighter(result: AttackResults) {
    
    if(!this.majorActionInProgress){
      if (result == AttackResults['critical']) {
        this.stamina = this.stamina + 1
      }

      this.majorActionCoolDown(this.cooldowns.punch)
    }
  }

  afterDodge() {    
    this.majorActionCoolDown(this.cooldowns.dodge)
  }
  afterBlock() {
    this.majorActionCoolDown(this.cooldowns.block)
  }




  updateModelState(state: FighterModelStates) {
    if(this.modelState == FighterModelStates['down and out'] && state != FighterModelStates['down and out']){
      debugger
    }
    this.modelState = state
    this.modelUpdateSubj.next()
  }

  setFacingDirectionByDegree(movingDirection: Direction360){
    if(movingDirection < 180){
      if(this.facingDirection != 'right')
        this.updateFacingDirection('right')
      
    } else {
      if(this.facingDirection != 'left')
        this.updateFacingDirection('left')
    }
  }


  cancelMove(){
    this.moving = false
    clearInterval(this.moveInterval)
    clearTimeout(this.moveDurationTimer)
    if(this.minorActionInProgress){
      this.cancelMinorAction()
    }
  }

  move(duration: number) {
    this.moving = true
    this.updateModelState(FighterModelStates['walking'])
    this.moveInterval = setInterval(() => {      
      
      if(this.knockedOut){
        this.cancelMove()
      }
      this.setFacingDirectionByDegree(this.movingDirection)
      const { x, y } = this.getMoveXAndYAmmount()
      if (this.moveHitEdge(x, y)){
        this.moveAwayFromWall()
      }
      else {
        this.position = {
          x: this.position.x + x,
          y: this.position.y + y
        }
        this.movementSubj.next(this)
      }
    }, 100)
    this.moveDurationTimer = setTimeout(() => {
      this.moving = false
      clearInterval(this.moveInterval)
    }, duration*1000)    
    
    this.startMinorAction(duration, 'walking')
  }

  moveHitEdge(x, y): Edges {
    const edgeVals: ModelEdgeVals = this.getModelEdgeVals()
    if (edgeVals.right + x >= this.arenaDimensions.width) {
      return Edges.right
    }
    if (edgeVals.left + x < 0) {
      return Edges.left
    }
    if (edgeVals.top + y > this.arenaDimensions.height) {
      return Edges.top
    }
    if (edgeVals.bottom + y < 0) {
      return Edges.bottom
    }
  }

  moveAwayFromWall(){
    if( this.movingDirection < 180){
      this.movingDirection = <Direction360>(this.movingDirection + (h.random(90) + 90))
    }
    if( this.movingDirection > 180){
      this.movingDirection =  <Direction360>(this.movingDirection - (h.random(90) + 90))
    }
  }

  getMoveXAndYAmmount(): Position {
    let xPercent = 10;
    let yPercent = 10;
    let val
    if (this.movingDirection >= 0 && this.movingDirection < 90) {
      val = this.movingDirection - 0
      xPercent = val / .9
      yPercent = 100 - val / .9
    }
    else if (this.movingDirection >= 90 && this.movingDirection < 180) {
      val = this.movingDirection - 90
      xPercent = val / .9
      yPercent = -(100 - val / .9)
    }
    else if (this.movingDirection >= 180 && this.movingDirection < 270) {
      val = this.movingDirection - 180
      xPercent = -(val / .9)
      yPercent = -(100 - val / .9)
    }
    else if (this.movingDirection >= 270 && this.movingDirection < 360) {
      val = this.movingDirection - 270
      xPercent = -(val / .9)
      yPercent = 100 - val / .9
    }

    const moveAmount = 5
    let addXAmmount = Math.round(xPercent / 100 * moveAmount)
    let addYAmmount = Math.round(yPercent / 100 * moveAmount)

    return { x: addXAmmount, y: addYAmmount }
  }
}