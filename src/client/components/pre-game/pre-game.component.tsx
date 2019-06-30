import { Component, Prop} from "@stencil/core";

import { ConnectionStates } from './../../../types/app/connectionStates'


@Component({
  tag: 'pre-game-component',
  styleUrl: 'pre-game.scss',
  shadow: true
})
export class PreGameComponent{
  @Prop() name: string
  @Prop() connectionStatus: ConnectionStates
  render(){
    return (
      <div class='pre-game'>
        <div class='pre-game__background'></div>
        <div class='pre-game__container'>
          <div class='pre-game__container__heading'>Daniel's Fighting Pit</div>
          <div class='pre-game__container__content'>
            {!this.name ? 
              <set-name-component></set-name-component> 
            : this.connectionStatus == 'connected' ? 
              <pre-game-lobby-component></pre-game-lobby-component>
            : <not-connected-component></not-connected-component>
            }
          </div>
        </div>
      </div>
    )
  }
}
