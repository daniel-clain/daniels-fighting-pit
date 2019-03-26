
import { Component, Prop, Event, EventEmitter} from '@stencil/core';
import { PlayerStates } from '../../../../enums/playerStates';


@Component({
  tag: 'pre-game-lobby',
  shadow: true
})
export class PreGameLobby {
  @Prop() playerState: PlayerStates;
  
  @Event() queForGame: EventEmitter;
  @Event() cancelQueForGame: EventEmitter;
  @Event() gameAccepted: EventEmitter;
  @Event() gameDeclined: EventEmitter;

  render() {
    return (
      <div>
        
        <div>Player State: {this.playerState}</div>
        {this.playerState === PlayerStates['idle'] &&
          <button onClick={() => this.queForGame.emit()}>Que For Game</button>}
          {this.playerState === PlayerStates['queueing for a game'] &&
            <button onClick={() => this.cancelQueForGame.emit()}>Cancel Queueing For Game</button>}
          {this.playerState === PlayerStates['game ready'] && ([
            <h2>There are enough players for a game!</h2>,
            <button onClick={() => this.gameAccepted.emit()}>Accept Game</button>,
            <button onClick={() => this.gameDeclined.emit()}>Decline</button>
          ])}          
          {this.playerState === PlayerStates['waiting for other players to accept'] &&
            <div>Waiting for others to accept...</div>}
          
      </div>
    )
  }
}