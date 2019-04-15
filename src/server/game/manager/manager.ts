import { Fighter } from "../fighter/fighter";
import { Bet } from "../../../models/game/bet";
import { ManagerOption } from "../../../models/game/managerOptions";

export class Manager{  
  retired: boolean = false
  money: number = 500
  sponsoredFighters: Fighter[] = []
  actionPoints = 3
  options: ManagerOption[]
  bet: Bet

  constructor(managerOptions: ManagerOption[]){
    this.options = managerOptions
  }
}