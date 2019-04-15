import { ClientToGame } from "./clientToGame";

export type ClientToServerName =
  ClientToGame |
  'player connect' |
  'disconnect' |
  'que for game' |
  'cancel que for game' |
  'decline game' |
  'accept game' 