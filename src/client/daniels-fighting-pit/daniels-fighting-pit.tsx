import { Component, State, Listen } from '@stencil/core';
import { ConnectionStates } from '../../enums/connectionStates';
import { WebsocketManager } from './websocketManager/websocketManager';
import { PlayerStates } from '../../enums/playerStates';
import { Game } from '../../classes/game/game';
import { Fighter } from '../../classes/fighter/fighter';


@Component({
  tag: 'daniels-fighting-pit',
  styleUrl: 'daniels-fighting-pit.css',
  shadow: true
})
export class DanielsFightingPit {
  @State() connectionState: ConnectionStates = ConnectionStates['not connected'];
  @State() playerState: PlayerStates = PlayerStates['idle']
  websocketManager: WebsocketManager;
  groupId: string;
  game: Game;
  
	fighters: Fighter[] = [
    new Fighter('Daniel', {x:120, y:180}),
    new Fighter('Angelo', ({x:120, y:120})),
    new Fighter('Tomasz', {x:180, y:180}),
    new Fighter('Hassan', {x:180, y:120}),
    new Fighter('Alex', {x:220, y:280}),
    new Fighter('Andy', ({x:220, y:220})),
    new Fighter('Mark', {x:280, y:280}),
    new Fighter('Mat', {x:280, y:220}),
    new Fighter('Dardan', {x:320, y:380})
  ]
  
  
  @Listen('queForGame')
  queForGameHandler() {
    this.websocketManager.queForGame()
    .then(groupId => this.groupId = groupId)
  }  
  @Listen('cancelQueForGame')
  cancelQueForGame() {
    this.websocketManager.cancelQueForGame()
  }
  
  @Listen('gameDeclined')
  gameDeclined() {
    this.websocketManager.gameDeclined(this.groupId)
    delete this.groupId;
  }
  @Listen('gameAccepted')
  gameAccepted() {
    this.websocketManager.gameAccepted(this.groupId)
    .then(
      (game: Game) => this.game = game
    )
    delete this.groupId;  
  }

  componentDidLoad(){
    console.log('daniels-fighting-pit');
    window.onbeforeunload = () => {
      this.websocketManager.disconnectFromGameWebsocketServer()
    }
    this.websocketManager =  new WebsocketManager()
    //this.websocketManager.tryToConnectToGameWebsocketServer()
    //.then(connectionState => this.connectionState = connectionState)
    
    this.websocketManager.playerStateUpdatesSubject.subscribe(state => this.playerState = state)

  }

  render() {
    const {playerState} = this;
    return (
      <main>
        <fight-day-test fighters={this.fighters}></fight-day-test>
        { !'penis' && <div>Connection State: {this.connectionState}</div>}
        {this.connectionState === ConnectionStates['connected'] && 
        <pre-game-lobby playerState={playerState} />}
        {this.connectionState === ConnectionStates['not connected'] && 
        <connection-error-message />}
        {this.connectionState === ConnectionStates['connected'] && this.playerState === PlayerStates['in game'] && 
        <game-interface />}
      </main>
    );
  }
}
