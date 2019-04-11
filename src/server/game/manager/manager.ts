import { Fighter } from "../fighter/fighter";
import { ManagerOption } from "../../../models/managerOptions";

export class Manager{  
  retired: boolean = false
  money: number = 500
  sponsoredFighters: Fighter[] = []
  options: ManagerOption[] = [
    {
      name: 'Train fighter',
      cost: 20,
      effect: figher => this.trainFighter(figher)
    }
  ]


  trainFighter(fighter: Fighter){
    fighter.strength ++
    fighter.speed ++
    fighter.aggression ++
    fighter.intelligence ++
    fighter.stamina ++
    fighter.spirit ++
    fighter.maxStamina ++
    fighter.maxStamina ++
  }

}