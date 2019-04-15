import { PlayerSkeleton } from "./player-skeleton";
import { Manager } from "../../server/game/manager/manager";
import { FighterSkeleton } from "../fighter/fighter-skeleton";

export interface GameSkeleton{
  players: PlayerSkeleton[]
  manager?: Manager
  fighters: FighterSkeleton[]
}