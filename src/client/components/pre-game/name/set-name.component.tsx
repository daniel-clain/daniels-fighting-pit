import { Component, State } from "@stencil/core";
import { LocalStorageService } from "../../../local-storage.service";

@Component({
  tag: 'set-name-component',
  shadow: true
})
export class SetNameComponent{
  @State() private nameInputText = ''
  localStorageService: LocalStorageService

  componentWillLoad(){    
    this.localStorageService = LocalStorageService.SingletonInstance
  }

  nameChangeHandler(event){
    this.nameInputText = event.path[0].value
  }
  

  render(){
    return ([
      <input placeholder="Enter your name" onInput={event => this.nameChangeHandler(event)}/>,
      <button 
        disabled={this.nameInputText.length < 3} 
        onClick={() => {this.localStorageService.name = this.nameInputText; this.nameInputText = ''}}>
        Submit
      </button>
    ])
  }
}
