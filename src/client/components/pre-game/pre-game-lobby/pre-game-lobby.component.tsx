
import { Component, State} from '@stencil/core';
import { QueueingStates } from '../../../../types/app/queueingStates';
import { WebsocketService } from '../../../websocket.service';

@Component({
  tag: 'pre-game-lobby-component',
  styleUrl: 'pre-game-lobby.scss',
  shadow: true
})
export class PreGameLobbyComponent {
  @State() queueingStatus: QueueingStates = 'not queueing'
  private websocketService: WebsocketService
  
  componentWillLoad(){    
    this.websocketService = WebsocketService.SingletonInstance
    this.websocketService.queueingStatusSubject.subscribe(
      (queueingStatus: QueueingStates) => this.queueingStatus = queueingStatus
    )
  }

  render() {
    return ([
      this.queueingStatus == 'not queueing' && [
        <p>A game will start when 4 players are queueing for a game.</p>,
        <button onClick={() => this.websocketService.queForGame()}>Que For Game</button>,
      ],
      this.queueingStatus == 'in que' && [
        <p>Waiting game to become available...</p>,
        <button onClick={() => this.websocketService.cancelQueForGame()}>Cancel Queueing For Game</button>,
      ], 
      this.queueingStatus == 'game available' && [
        <p>Game Availabe! click accept</p>,
        <button onClick={() => this.websocketService.acceptGame()}>Accept</button>,
        <button onClick={() => this.websocketService.cancelQueForGame()}>Decline</button>,
      ],      
      this.queueingStatus == 'waiting for others to accept' &&
        <p>Waiting for others to accept...</p>
    ])
  }
}