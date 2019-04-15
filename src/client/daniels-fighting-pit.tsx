import { Component, State } from '@stencil/core';
import { WebsocketService } from './websocket.service';
import { ConnectionStates } from '../types/app/connectionStates';
import { LocalStorageService } from './local-storage.service';
import { ServerToClient } from '../models/app/serverToClient';
import { GameSkeleton } from '../models/game/game-skeleton';

@Component({
  tag: 'daniels-fighting-pit',
  styleUrl: 'daniels-fighting-pit.scss',
  shadow: true
})
export class DanielsFightingPit {
  @State() private name: string
  @State() private connectionStatus: ConnectionStates
  @State() private gameActive: boolean
  private websocketService: WebsocketService
  private localStorageService: LocalStorageService

  componentWillLoad(){    
    this.websocketService = WebsocketService.SingletonInstance
    this.localStorageService = LocalStorageService.SingletonInstance
    this.establishSubscriptions()
    this.connectToGameServer()
    window.onbeforeunload = () => this.websocketService.disconnect()
  }

  establishSubscriptions(){
    this.websocketService.connectionStatusSubject.subscribe(
      (connectionStatus: ConnectionStates) => this.connectionStatus = connectionStatus
    )
    this.websocketService.serverToClientSubject.subscribe((serverToClient: ServerToClient) => {

      if(serverToClient.name == 'game started'){
        this.gameActive = true
        this.localStorageService.gameId = serverToClient.data
      }
        
        
      if(serverToClient.name == 'game ended')
        this.gameActive = false
    })
    
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
    return (
      !this.name ? 
        <set-name-component></set-name-component> 
      : this.connectionStatus != 'connected' ? 
          <not-connected-component></not-connected-component>
        : !this.gameActive ? 
            <pre-game-lobby-component></pre-game-lobby-component>
          : <game-component></game-component>
    )
  }
}
