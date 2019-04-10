import { ClientToServerName } from "../types/clientToServerName";

export interface ClientToServer{
  name: ClientToServerName
  clientId?: string
  data?: any
}