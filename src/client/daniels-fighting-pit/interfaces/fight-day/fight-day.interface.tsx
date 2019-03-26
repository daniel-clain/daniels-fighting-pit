import { Component, Prop } from '@stencil/core';
import { Fighter } from '../../../../classes/fighter/fighter';


@Component({
  tag: 'fight-day-interface',
  shadow: true
})
export class FightDayInterface {
  @Prop() fighters: Fighter[];

  render() {
    return (
      <div>
        
        {this.fighters.forEach(fighter => {
          return fighter
        })}
       
      </div>
    );
  }
}
