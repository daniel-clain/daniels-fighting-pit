import { FighterModelStates } from "../../types/figher/fighterModelStates";
import { Position } from "./position";
import { FacingDirection } from "../../types/figher/facingDirection";

export interface FighterSkeleton{
  name: string
  position: Position
  modelState: FighterModelStates
  facingDirection: FacingDirection
}