import { RoundStates } from "../../enums/roundStates";
import { RoundNews } from "../../models/roundNews";
import { Fighter } from "../fighter/fighter";
import { Subject } from 'rxjs'
import { Fight } from "../fight/fight";
/* import { FightStates } from "../../enums/fightStates"; */

export class Round {
  state: RoundStates
  stateSubject: Subject<RoundStates> = new Subject();
  roundNumber: number;
  fighters: Fighter[]; 
  fight: Fight;
  private preFightTimer = 20;
  private roundNews: RoundNews[] = [];
  constructor(roundNumber) {
    this.roundNumber = roundNumber;
    this.doPrefight()
      .then(this.doNews)
      .then(this.doFightDay)
  }

  private doPrefight() {
    this.updateState(RoundStates['pre fight'])
    return new Promise(resolve => setTimeout(() => resolve, this.preFightTimer * 1000))
  }

  private updateState(state: RoundStates) {
    this.state = state;
    this.stateSubject.next(this.state)
  }

  private async doNews() {
    this.updateState(RoundStates['news headlines'])
    for (let i = 0; i < this.roundNews.length; i++) {
      await this.showNewsItem(this.roundNews[i])
    }
  }
  private showNewsItem(newsItem: RoundNews): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), newsItem.duration * 1000)
    })
  }

  private doFightDay() {
    this.updateState(RoundStates['fight day'])
    /* this.fight = new Fight(this.fighters)
    this.fight.fightStateSubject.subscribe(
      (fightState: FightStates) => {
        if(fightState === FightStates['end of fight'])
          this.setState(RoundStates['end of round'])
      }
    ) */
  }

  setState(roundState){
    this.state = roundState;
    this.stateSubject.next(roundState)
  }

}
