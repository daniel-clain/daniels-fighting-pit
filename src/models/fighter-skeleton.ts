import { FighterModelStates } from "../types/fighterModelStates";
import { Position } from "./position";
import { FacingDirection } from "../types/facingDirection";

export interface FighterSkeleton{
  name: string
  position: Position
  modelState: FighterModelStates
  facingDirection: FacingDirection
}