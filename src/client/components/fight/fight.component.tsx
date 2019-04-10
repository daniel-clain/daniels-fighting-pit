import { Component, Prop } from "@stencil/core";
import { Fight } from "../../../server/game/fight/fight";

@Component({
  tag: 'fight-component',
  shadow: true
})
export class FightComponent {
  @Prop() fight: Fight

  

  render(){
    return this.fight.fighters.map(fighter => <fighter-component fighter={fighter}></fighter-component>)
  }
}