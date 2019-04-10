import { Fighter } from "../server/game/fighter/fighter";

export interface PlayerSkeleton{
  name: string
  playerId: string
  retired: boolean
  money: number
  sponsoredFighters: Fighter[]
}