
import io from 'socket.io-client';
import { Subject } from "rxjs";
import { ConnectionStates } from "../types/app/connectionStates";
import { QueueingStates } from "../types/app/queueingStates";
import { LocalStorageService } from './local-storage.service';
import { ServerToClientName } from '../types/app/serverToClientName';
import { ServerToClient } from '../models/app/serverToClient';
import { PlayerConnectInfo } from '../models/app/playerConnectInfo';
import { ClientToServer } from '../models/app/clientToServer';

export class WebsocketService{
  private static instance: WebsocketService
  private localStorageService = LocalStorageService.SingletonInstance
  private connectionTimeoutSeconds = 3
  connectionStatusSubject: Subject<ConnectionStates> = new Subject()
  queueingStatusSubject: Subject<QueueingStates> = new Subject()
  serverToClientSubject: Subject<ServerToClient> = new Subject()
  server

  static get SingletonInstance(){
    return this.instance || (this.instance = new WebsocketService())
  }

  connect(){    
    let rejectConnectionAttempt

    new Promise((resolve, reject) => {
      rejectConnectionAttempt = reject
      this.connectionStatusSubject.next('trying to connect')

      if(this.server)
        this.server.destroy();
      this.server = io('localhost:69', {transports: ['websocket', 'flashsocket']});    
      this.handleClientMessages()  
      this.server.on('connect_error', () => {
        this.server.destroy();
        this.connectionStatusSubject.next('not connected')
        throw 'connection error'
      });

      
      const playerRegistration: PlayerConnectInfo = {
        name: this.localStorageService.name,
        clientId: this.localStorageService.clientId
      }
      const playerConnect: ClientToServer = {
        name: 'player connect',
        data: playerRegistration

      }
      this.sendMessageToServer(playerConnect)

      this.awaitServerEvent('player connected').then(
        clientId => {
          if(clientId)
            this.localStorageService.clientId = clientId
          resolve()
        }
      )

    })
    .then(() => this.connectionStatusSubject.next('connected'))
    .catch(reason => {
      this.connectionStatusSubject.next('not connected')
      throw reason
    })

    setTimeout(() => 
    rejectConnectionAttempt(`Connection attempt timed out after ${this.connectionTimeoutSeconds} seconds`), 
    this.connectionTimeoutSeconds * 1000);
  }

  handleClientMessages(){
    this.server.on('server to client', (serverToClient: ServerToClient) => {
      console.log(`serverToClient: ${serverToClient.name}`)
      this.serverToClientSubject.next(serverToClient)
    })
  }

  sendMessageToServer(clientToServer: ClientToServer){
    clientToServer.clientId = this.localStorageService.clientId
    clientToServer.gameId = this.localStorageService.gameId
    this.server.emit('client to server', clientToServer)
  }

  awaitServerEvent(serverEventName: ServerToClientName): Promise<any>{
    return new Promise(resolve => {
      const subscription = this.serverToClientSubject.subscribe(
        (serverToClient: ServerToClient) => {
          if(serverToClient.name == serverEventName){
            subscription.unsubscribe()
            serverToClient.data ? resolve(serverToClient.data) : resolve()
          }
        }
      )
    })
  }

  queForGame(){
    this.sendMessageToServer({name: 'que for game'})
    this.awaitServerEvent('added to que')
    .then(() => this.queueingStatusSubject.next('in que'))
    this.awaitServerEvent('game available')
    .then(gameId => {
      this.queueingStatusSubject.next('game available')
      this.localStorageService.gameId = gameId
    })
  }

  cancelQueForGame(){
    this.sendMessageToServer({name: 'cancel que for game'})
    this.awaitServerEvent('removed from que')
    .then(() => this.queueingStatusSubject.next('not queueing'))
  }
  
  acceptGame(){    
    const {gameId} = this.localStorageService
    this.sendMessageToServer({name: 'accept game', data: gameId})
    this.awaitServerEvent('game accepted')
    .then(() => this.queueingStatusSubject.next('waiting for others to accept'))
    
    this.awaitServerEvent('a player did not accept')
    .then(() => {
      this.queueingStatusSubject.next('not queueing')
      this.localStorageService.removeGameId()
    })
  }

  declineGame(){
    const {gameId} = this.localStorageService
    this.sendMessageToServer({name: 'decline game', data: gameId})
    this.awaitServerEvent('a player did not accept')
    .then(() => {
      this.queueingStatusSubject.next('not queueing')
      this.localStorageService.removeGameId()
    })
  }
  disconnect(){
    this.sendMessageToServer({name: 'disconnect'})
  }

}
