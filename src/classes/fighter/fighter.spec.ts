import { Fighter } from "./fighter";
import { Degree } from "../../models/degree";

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
})