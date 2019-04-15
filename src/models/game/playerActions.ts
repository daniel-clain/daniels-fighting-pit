import { ManagerOptionSkeleton } from "./managerOptionSkeleton";
import { Bet } from "./bet";
import { ClientId } from "../../types/game/clientId";

export interface PlayerActions{
  options: ManagerOptionSkeleton[]
  bet: Bet
  clientId?: ClientId
}