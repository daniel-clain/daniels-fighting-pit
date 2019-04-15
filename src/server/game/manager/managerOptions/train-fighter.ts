
import { Fighter } from "../../fighter/fighter";
import { ManagerOption } from "../../../../models/game/managerOptions";
import { ManagerOptionNames } from "../../../../types/game/managerOptionNames";

export class TrainFighter extends ManagerOption{
  name: ManagerOptionNames = 'Train fighter'
  cost: number = 20

  constructor(private fighters: Fighter[]){
    super()
  }

  effect(fighter: Fighter){
    const targetFighter: Fighter = this.fighters.find((f: Fighter) => f.name == fighter.name)
    const randomVal = Math.floor(Math.random() * 3)
    switch(randomVal){
      case 0 : {
        targetFighter.maxStamina ++ 
        console.log(`${targetFighter.name} max stamina increased`)
      } break
      case 1 : {
        targetFighter.strength ++
        console.log(`${targetFighter.name} strength increased`)
      } break
      case 2 : {
        targetFighter.speed ++
        console.log(`${targetFighter.name} speed increased`)
      } break
    }
  }


}