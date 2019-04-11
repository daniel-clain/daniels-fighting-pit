import { ManagerOptionNames } from "../types/managerOptionNames";


export interface ManagerOption{
    name: ManagerOptionNames,
    cost: number,
    effect: Function
}