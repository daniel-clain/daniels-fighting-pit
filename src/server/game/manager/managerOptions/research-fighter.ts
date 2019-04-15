import { ManagerOption } from "../../../../models/game/managerOptions";
import { ManagerOptionNames } from "../../../../types/game/managerOptionNames";


export class ResearchFighter extends ManagerOption{
  name: ManagerOptionNames = 'Research fighter'
  cost: number = 0
  
  constructor(){
    super()
  }

}