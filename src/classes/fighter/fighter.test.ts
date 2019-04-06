/* import { Fighter } from "./fighter";
import { Degree } from "../../models/degree";
import { LeftOrRight } from "../../enums/leftOrRight";
import { ArenaInfo } from "../../models/arenaInfo";
import { Subject } from "rxjs";
import { Proximity } from "../../enums/fighterProximity";
import { helperFunctions } from "../../helper-functions/helper-functions";

const stubArenaInfo: ArenaInfo = {dimensionUpdates: new Subject(), dimensions: {height: 1, width: 1}}
const fakeRandom = randomVal => jest.fn((number: number, startAtOne?: boolean) => Math.round((randomVal * (number + (startAtOne ? -1 : 0))) + (startAtOne ? 1 : 0)))

let testFighter = new Fighter('Daniel', {x:300, y:300}, 3, 3)
let closeFighterOnTheLeft = new Fighter('Evil Enemy1', {x:290, y:300}, 3, 3)
let nearbyFighterOnTheLeft = new Fighter('Evil Enemy2', {x:150, y:300}, 3, 3)
let farFighterOnTheLeft = new Fighter('Evil Enemy3', {x:50, y:300}, 3, 3)
let fighterOnTheRight = new Fighter('Evil Enemy4', {x:400, y:300}, 3, 3)

describe('seeFightersInfrontOfYou()', () => { 
  beforeEach(() => {
    testFighter.giveFightInfo(stubArenaInfo, [], new Subject)
  })
  it('should call getClosestFighter()', () => {
    const getClosestFighterSpy = spyOn(testFighter, 'getClosestFighter')
    testFighter.seeFightersInfrontOfYou()
    expect(getClosestFighterSpy).toBeCalled()
  })
  describe ('if closest fighter is undefined', () => {
    beforeEach(() => {
      testFighter.getClosestFighter = jest.fn(() => undefined)
    })
    it('should return interupted false', () => {
      const interupted: boolean = testFighter.seeFightersInfrontOfYou()
      expect(interupted).toBe(false) 
    });
    
    it('should not call getFighterProximity()', () => {
      const getFighterProximitySpy = spyOn(testFighter, 'getFighterProximity')
      expect(getFighterProximitySpy).not.toBeCalled()
    });
  });
  describe ('if closest fighter is not undefined', () => {   
    describe ('if closest fighter proximity is close', () => {  
      it('should call respondToCloseFighter() and return interupted true', () => {
        testFighter.getClosestFighter = jest.fn(() => closeFighterOnTheLeft)
        testFighter.getFighterProximity = jest.fn(() => Proximity['close'])
        const respondToCloseFighterSpy = spyOn(testFighter, 'respondToCloseFighter')
        const interupted: boolean = testFighter.seeFightersInfrontOfYou()
        expect(respondToCloseFighterSpy).toBeCalledWith(closeFighterOnTheLeft)
        expect(interupted).toBe(true)
      });
    });
    describe ('if closest fighter proximity is nearby', () => {  
      it('should call respondToNearbyFighter() and return interupted true', () => {
        testFighter.getClosestFighter = jest.fn(() => nearbyFighterOnTheLeft)
        testFighter.getFighterProximity = jest.fn(() => Proximity['nearby'])
        const respondToNearbyFighterSpy = spyOn(testFighter, 'respondToNearbyFighter')
        const interupted: boolean = testFighter.seeFightersInfrontOfYou()
        expect(respondToNearbyFighterSpy).toBeCalledWith(nearbyFighterOnTheLeft)
        expect(interupted).toBe(true)
      });
    });
    describe ('if closest fighter proximity is far', () => {  
      describe ('if noActionFor5Seconds is false', () => {
        it('should not call respondToFarFighter() and return interupted false', () => {
          testFighter.noActionFor5Seconds = false
          testFighter.getClosestFighter = jest.fn(() => farFighterOnTheLeft)
          testFighter.getFighterProximity = jest.fn(() => Proximity['far'])
          const respondToFarFighterSpy = spyOn(testFighter, 'respondToFarFighter')
          const interupted: boolean = testFighter.seeFightersInfrontOfYou()
          expect(respondToFarFighterSpy).not.toBeCalled()
          expect(interupted).toBe(false)
        });
      });
      describe ('if noActionFor5Seconds is true', () => {
        it('should call respondToFarFighter() and return interupted true', () => {
          testFighter.noActionFor5Seconds = true
          testFighter.getClosestFighter = jest.fn(() => farFighterOnTheLeft)
          testFighter.getFighterProximity = jest.fn(() => Proximity['far'])
          const respondToFarFighterSpy = spyOn(testFighter, 'respondToFarFighter')
          const interupted: boolean = testFighter.seeFightersInfrontOfYou()
          expect(respondToFarFighterSpy).toBeCalledWith(farFighterOnTheLeft)
          expect(interupted).toBe(true)
        });
      });
    });
  });

  describe('when this fighter is facing left', () => {

    beforeEach(() => {
      testFighter.facingDirection = LeftOrRight['left']
      testFighter.giveFightInfo(stubArenaInfo, [farFighterOnTheLeft, nearbyFighterOnTheLeft,closeFighterOnTheLeft, fighterOnTheRight], new Subject())
    })
  
    it('should populate the fightersToTheLeftArray array with fighterProximity objects for all fighters to the left of this fighter', () => {
      testFighter.seeFightersInfrontOfYou()
      expect(testFighter.fightersToTheLeft.length).toEqual(3)
    })
    it('should not include fighters to the right of this fighter', () => {
      testFighter.seeFightersInfrontOfYou()
      expect(testFighter.fightersToTheLeft.find(fighter => fighter.name == 'Evil Enemy4')).toEqual(undefined)
    })
  })  
})

describe('lookForOtherFighters()', () => {
  beforeEach(() => {
    testFighter.giveFightInfo(stubArenaInfo, [], new Subject())
  })
  
  it('should call seeFightersInfrontOfYou()', () => {
    const seeFightersInfrontOfYouSpy = spyOn(testFighter, "seeFightersInfrontOfYou")
    testFighter.lookForOtherFighters()
    expect(seeFightersInfrontOfYouSpy).toBeCalled()
  })
  describe ('if lookForOtherFighters() is not interupted', () => {
    it ('should call canSeeAllFighters()', () => {
      testFighter.seeFightersInfrontOfYou = jest.fn(() => false)
      const canSeeAllFightersSpy = spyOn(testFighter, 'canSeeAllFighters')
      testFighter.lookForOtherFighters()
      expect(canSeeAllFightersSpy).toBeCalled()
    });
    describe('if canSeeAllFighters() is false', () => {
      it ('should call turnAround() and call seeFightersInfrontOfYou()', () => {
        testFighter.canSeeAllFighters = jest.fn(() => false)
        const turnAroundSpy = spyOn(testFighter, 'turnAround')
        const seeFightersInfrontOfYouSpy = spyOn(testFighter, "seeFightersInfrontOfYou")
        testFighter.lookForOtherFighters()
        expect(turnAroundSpy).toBeCalled()
        expect(seeFightersInfrontOfYouSpy).toBeCalledTimes(2)
      });
    })
    describe('if canSeeAllFighters() is true', () => {
      it ('should no call turnAround() or seeFightersInfrontOfYou()', () => {
        testFighter.canSeeAllFighters = jest.fn(() => true)
        const turnAroundSpy = spyOn(testFighter, 'turnAround')
        const seeFightersInfrontOfYouSpy = spyOn(testFighter, "seeFightersInfrontOfYou")
        testFighter.lookForOtherFighters()
        expect(turnAroundSpy).not.toBeCalled()
        expect(seeFightersInfrontOfYouSpy).not.toBeCalledTimes(2)
      });
    })
  });
  
}) 


describe ('respondToNearbyFighter()', () => {
  it('should call getProbailityToAttack(), getProbabilityToDefend() and getProabilityToRetreat()', () => {    
    const getProbailityToAttackSpy = spyOn(testFighter, 'getProbabilityToAttack')
    const getProbabilityToDefendSpy = spyOn(testFighter, 'getProbabilityToDefend')
    const getProabilityToRetreatSpy = spyOn(testFighter, 'getProbabilityToRetreat')
    
    const randomSpy = spyOn(helperFunctions, 'random').and.callFake(fakeRandom)

    testFighter.respondToNearbyFighter(nearbyFighterOnTheLeft)
    expect(getProbailityToAttackSpy).toBeCalled()
    expect(getProbabilityToDefendSpy).toBeCalled()
    expect(getProabilityToRetreatSpy).toBeCalled()
    expect(randomSpy).toBeCalled()
    
  });
  describe ('When stamina is high and other fighter has his back turned', () => {
    it('should call moveToAttackFighter() and not call prepareToDefend() or retreatFromFighter()', () => {    
      const moveToAttackFighterSpy = spyOn(testFighter, 'attackFighter')
      const prepareToDefendSpy = spyOn(testFighter, 'prepareToDefend')
      const retreatFromFighterSpy = spyOn(testFighter, 'retreatFromFighter')
      spyOn(helperFunctions, 'random').and.callFake(fakeRandom(0.1))
      nearbyFighterOnTheLeft.facingDirection = LeftOrRight['left']
      testFighter.stamina = testFighter.maxStamina
      testFighter.respondToNearbyFighter(nearbyFighterOnTheLeft)      
      expect(moveToAttackFighterSpy).toBeCalled()
      expect(prepareToDefendSpy).not.toBeCalled()
      expect(retreatFromFighterSpy).not.toBeCalled()
      
      
    });
  });
  
});


describe('getDegreeOfOtherFighter()', () => {

  describe('the degrees difference if both fighters have the same y axis', () => {
    it('should be left or right, therfore the directions should be 9 for right and 27 for left, in this example the 2nd fighters x is greater than the 1sts so the 2nd fighters should be to the right of the 1st and the result should be 9', () => {
      let fighterInstance1 = new Fighter('Daniel', {x:5, y:20}, 3, 3)
      let fighterInstance2 = new Fighter('Evil Enemy', {x:15, y:20}, 3, 3)
      
      const result: Degree = fighterInstance1.getDegreeOfOtherFighter(fighterInstance2)
      expect(result.value).toEqual(90)
    })
  })

  it('should return the direction in degress of the 2nd fighter from the 1st fighter', () => {
    let fighterInstance1 = new Fighter('Daniel', {x:127, y:213}, 3, 3)
    let fighterInstance2 = new Fighter('Evil Enemy', {x:142, y:168}, 3, 3)
    
    const result: Degree = fighterInstance1.getDegreeOfOtherFighter(fighterInstance2)
    expect(result.value).toEqual(162)
  })

  
  describe('when 2nd fighter is up to the left of the 1st fighter', () => {
    it('the degree value should be over 270', () => {
      let fighterInstance1 = new Fighter('Daniel', {x:300, y:300}, 3, 3)
      let fighterInstance2 = new Fighter('Evil Enemy', {x:200, y:400}, 3, 3)
      
      const result: Degree = fighterInstance1.getDegreeOfOtherFighter(fighterInstance2)
      expect(result.value).toBeGreaterThan(270)
    })
  })
  describe('on the rare occasion that both fighters are in the exact same place', () => {
    it('should return 0', () => {
      let fighterInstance1 = new Fighter('Daniel', {x:150, y:150}, 3, 3)
      let fighterInstance2 = new Fighter('Evil Enemy', {x:150, y:150}, 3, 3)
      
      const result: Degree = fighterInstance1.getDegreeOfOtherFighter(fighterInstance2)
      expect(result.value).toBe(0)
    })
  })
}) */