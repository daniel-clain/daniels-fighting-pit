import { ServerToClient } from "../enums/serverToClient";

export interface ServerEvent{
  name: ServerToClient
  data: any
}