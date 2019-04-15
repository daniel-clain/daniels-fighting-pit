import { ClientToServerName } from "../../types/app/clientToServerName";



export interface ClientToServer{
  name: ClientToServerName
  clientId?: string
  gameId?: string
  data?: any
}