
import { Component, State} from '@stencil/core';
import { QueueingStates } from '../../../../types/app/queueingStates';
import { WebsocketService } from '../../../websocket.service';

@Component({
  tag: 'pre-game-lobby-component',
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
      this.queueingStatus == 'not queueing' &&
        <button onClick={() => this.websocketService.queForGame()}>Que For Game</button>,
      this.queueingStatus == 'in que' && [
        <button onClick={() => this.websocketService.cancelQueForGame()}>Cancel Queueing For Game</button>,
        <div>Waiting game to become available...</div>,
      ], 
      this.queueingStatus == 'game available' && [
        <button onClick={() => this.websocketService.acceptGame()}>Accept</button>,
        <button onClick={() => this.websocketService.cancelQueForGame()}>Decline</button>,
        <div>Game Availabe! click accept</div>
      ],      
      this.queueingStatus == 'waiting for others to accept' &&
        <div>Waiting for others to accept...</div>
    ])
  }
}