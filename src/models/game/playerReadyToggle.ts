import { ClientId } from "../../types/game/clientId";

export interface PlayerReadyToggle{
  ready: boolean
  clientId?: ClientId
}