import { Component, State} from "@stencil/core";
import { WebsocketService } from "../../../websocket.service";
import { ConnectionStates } from "../../../../types/app/connectionStates";

@Component({
  tag: 'not-connected-component',
  styleUrl: 'not-connected.scss',
  shadow: true
})
export class NotConnectedComponent{
  private websocketService: WebsocketService
  @State() private connectionStatus: ConnectionStates

  componentWillLoad(){    
    this.websocketService = WebsocketService.SingletonInstance
    this.websocketService.connectionStatusSubject.subscribe(
      (connectionStatus: ConnectionStates) => this.connectionStatus = connectionStatus
    )
  }

  render(){
    return (
      this.connectionStatus == 'trying to connect' 
      ? 'Connecting to game server......' 
      : 'Not connected' && 
        <button 
          onClick={() => this.websocketService.connect()}>
          Try to connect
        </button>
    )
  }
}
