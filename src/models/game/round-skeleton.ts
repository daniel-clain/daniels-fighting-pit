import { FighterSkeleton } from "../fighter/fighter-skeleton";
import { RoundStages } from "../../types/game/round-stages";


export interface RoundSkeleton{
  fighters: FighterSkeleton[]
  stage: RoundStages
  number: number
}