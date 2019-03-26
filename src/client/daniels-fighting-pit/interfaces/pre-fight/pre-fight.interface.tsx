import { Component, Prop } from '@stencil/core';
import { Fighter } from '../../../../classes/fighter/fighter';
import { ManagerOption } from '../../../../models/managerOptions';


@Component({
  tag: 'pre-fight-interface',
  shadow: true
})
export class PreFightInterface {
  @Prop() managersMoney: number;
  @Prop() managersOptions: ManagerOption[];
  @Prop() fighters: Fighter[];

  render() {
    return (
      <div>
        <div>Managers Money: {this.managersMoney}</div>
        <div>
          <h1>Bet On a fighter</h1>
          {this.fighters.forEach(fighter => {
            return ([
              <div>{fighter.name}</div>,
              <div>
                <button>Bet $50</button>
                <button>Bet $150</button>
                <button>Bet $500</button>
              </div>
            ])
          })}
        </div>
        <div>
          <h1>Manager's Options</h1>
          {this.managersOptions.forEach(managerOption => {
            return (
              <div>{managerOption.name}</div>
            )
          })}
        </div>
       
      </div>
    );
  }
}
