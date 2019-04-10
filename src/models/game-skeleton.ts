import { RoundSkeleton } from "./round-skeleton";
import { PlayerSkeleton } from "./player-skeleton";

export interface GameSkeleton{
  players: PlayerSkeleton[]
  round: RoundSkeleton
}