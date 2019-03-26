
import io from 'socket.io-client';
import { ConnectionStates } from '../../../enums/connectionStates';
import { PlayerStates } from '../../../enums/playerStates';
import { Subject } from 'rxjs';
import { ClientToServerEmits } from '../../../enums/clientToServerEmits';
import { ServerToClientEmits } from '../../../enums/serverToClientEmits';
import { Game } from '../../../classes/game/game';

export class WebsocketManager {
  private socket

  playerStateUpdatesSubject: Subject<PlayerStates> = new Subject();


  get socketConnection(): Promise<ConnectionStates> {
    this.socket = io('localhost:69', {transports: ['websocket', 'polling', 'flashsocket']});
    
    this.socket.on(ServerToClientEmits['aonther user has connected'], () => {
      console.log('aonther user has connected');
    })
    this.socket.on(ServerToClientEmits['player state update'], (state: PlayerStates) => {
      this.playerStateUpdatesSubject.next(state)
    })
    this.socket.on(ServerToClientEmits['aonther user has disconnected'], () => {
      console.log('aonther user has disconnected');
    })
    return new Promise<ConnectionStates>((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('ding connected');
        const returnState: ConnectionStates = ConnectionStates['connected']
        resolve(returnState)
      })
      setTimeout(() => {
        reject('server didnt respond withing 5 seconds')
      }, 5000)
    })
  }

  tryToConnectToGameWebsocketServer(): Promise<ConnectionStates> {    
    return this.socketConnection
  }
  disconnectFromGameWebsocketServer(){
    this.socket.emit(ClientToServerEmits['disconnect'])
  }

  queForGame(): Promise<any>{
    this.socket.emit(ClientToServerEmits['que for game'])
    return new Promise(resolve => {
      this.socket.on(ServerToClientEmits['enough players for game'], groupId => {
        resolve(groupId)
      })
    })
  }

  cancelQueForGame(){    
    this.socket.emit(ClientToServerEmits['cancel que for game'])
  }
  
  gameDeclined(groupId){    
    this.socket.emit(ClientToServerEmits['decline game'], groupId)
  }
  
  gameAccepted(groupId): Promise<Game>{    
    this.socket.emit(ClientToServerEmits['accept game'], groupId)
    return new Promise((resolve, reject) => {
      this.socket.on(ServerToClientEmits['game started'], game => {
        resolve(game)
      })
      this.socket.on(ServerToClientEmits['other players did not accept'], () => {
        reject()
      })
    })
  }
}