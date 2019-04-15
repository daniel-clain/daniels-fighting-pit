import { ManagerOptionNames } from "../../types/game/managerOptionNames";


export interface ManagerOptionSkeleton{
  name: ManagerOptionNames
  cost?: number
  arguments?: any[]
}