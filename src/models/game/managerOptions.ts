
import { ManagerOptionSkeleton } from "./managerOptionSkeleton";
import { ManagerOptionNames } from "../../types/game/managerOptionNames";

export class ManagerOption{
	name: ManagerOptionNames
	cost: number
	effect?(any?): void
	getSkeleton(): ManagerOptionSkeleton {
		return {
			name: this.name,
			cost: this.cost,
		}
	}
}