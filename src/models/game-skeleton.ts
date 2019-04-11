import { RoundSkeleton } from "./round-skeleton";
import { PlayerSkeleton } from "./player-skeleton";
import { Manager } from "../server/game/manager/manager";

export interface GameSkeleton{
  players: PlayerSkeleton[]
  round: RoundSkeleton  
  manager?: Manager
}