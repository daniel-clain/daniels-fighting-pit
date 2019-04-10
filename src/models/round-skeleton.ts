import { FighterSkeleton } from "./fighter-skeleton";
import { RoundStages } from "./round-stages";

export interface RoundSkeleton{
  fighters: FighterSkeleton[]
  stage: RoundStages
}