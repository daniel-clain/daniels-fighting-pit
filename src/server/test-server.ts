
import * as socketio from "socket.io";
import { Server } from 'socket.io';
import { EventsFromClientManager } from "./EventsFromClientManager";

const server: Server = socketio.listen(69)
new EventsFromClientManager(server)