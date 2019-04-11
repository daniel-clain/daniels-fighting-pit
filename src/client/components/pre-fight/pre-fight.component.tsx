import { Component, Prop } from '@stencil/core';
import { Manager } from '../../../server/game/manager/manager';
import { FighterSkeleton } from '../../../models/fighter-skeleton';
import { ManagerOption } from '../../../models/managerOptions';

@Component({
  tag: 'pre-fight-component',
  styleUrl: 'pre-fight.scss',
  shadow: true
})
export class PreFightComponent {
  @Prop() manager: Manager;
  @Prop() fighters: FighterSkeleton[];

  managerOptionsClicked(option: ManagerOption){
    if(option.name == 'Train fighter'){
      alert('sorry, you can not train fighters at this time')
    }
  }
  

  render() {
    return (
      <div>
        <div id='managers-money'>Manager's Money: {this.manager.money}</div>
        
        <div id='manager-options'>
          <h1>Manager's Options</h1>
          {this.manager.options.map(managerOption => 
            <button onClick={() => this.managerOptionsClicked(managerOption)}>{managerOption.name}</button>
          )}
        </div>
        <div id='bet-on-fighter'>
          <h2>Bet On a fighter</h2>
          {this.fighters.map(fighter => {
            return ([
              <div>{fighter.name}</div>,
              <div><img src='../../assets/fighter-images/idle.png'/></div>,
              <div>
                <button>Bet $50</button>
                <button>Bet $150</button>
                <button>Bet $500</button>
              </div>
            ])
          })}
        </div>
       
      </div>
    );
  }
}
