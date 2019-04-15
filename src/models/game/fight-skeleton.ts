import { FighterSkeleton } from "../fighter/fighter-skeleton";

export class FightSkeleton{
  countDown: number
  timeRemaining: number
  fighters: FighterSkeleton[]
  winner?: FighterSkeleton
}