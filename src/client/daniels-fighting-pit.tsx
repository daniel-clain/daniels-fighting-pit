import { Component, State } from '@stencil/core';
import { WebsocketService } from './websocket.service';
import { ConnectionStates } from '../types/connectionStates';
import { LocalStorageService } from './local-storage.service';
import { GameSkeleton } from '../models/game-skeleton';
@Component({
  tag: 'daniels-fighting-pit',
  styleUrl: 'daniels-fighting-pit.scss',
  shadow: true
})
export class DanielsFightingPit {
  @State() private name: string
  @State() private connectionStatus: ConnectionStates
  @State() private gameActive: GameSkeleton
  private websocketService: WebsocketService
  private localStorageService: LocalStorageService

  componentWillLoad(){    
    this.websocketService = WebsocketService.SingletonInstance
    this.localStorageService = LocalStorageService.SingletonInstance
    this.establishSubscriptions()
    this.connectToGameServer()
  }

  establishSubscriptions(){
    this.websocketService.connectionStatusSubject.subscribe(
      (connectionStatus: ConnectionStates) => this.connectionStatus = connectionStatus
    )
    this.websocketService.activeGameSubject.subscribe(
      (gameActive: GameSkeleton) => this.gameActive = gameActive
    )
    this.localStorageService.nameSubject.subscribe(
      (name: string) => {
        this.name = name
        if(this.connectionStatus == 'not connected')
          this.websocketService.connect()
      }
    )
  }
  connectToGameServer(){    
    this.name = this.localStorageService.name
    if(this.name)
      this.websocketService.connect()
  }

  

  render() {
    return ([
      <div>ConnectionStatus: {this.connectionStatus}</div>,
      !this.name ? 
        <set-name-component></set-name-component> 
      : 
        this.connectionStatus != 'connected' ? 
          <not-connected-component></not-connected-component>
        : 
          !this.gameActive ? 
            <pre-game-lobby-component></pre-game-lobby-component>
          : 
            <game-component></game-component>
    ])
  }
}
