import { Dimensions } from "./dimensions";
import { MajorActions } from "../types/majorActions";
import { MinorActions } from "../types/minorActions";
import { FighterStates } from "../types/fighterStates";

export class FighterModelImage{
	modelState: MajorActions | MinorActions | FighterStates
	dimensions: Dimensions
	imageName: string
}
