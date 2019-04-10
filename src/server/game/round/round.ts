import { RoundNews } from "../../../models/roundNews";
import { Fighter } from "../fighter/fighter";
import { Subject } from 'rxjs'
import { Fight } from "../fight/fight";
import { RoundStages } from "../../../models/round-stages";

export class Round {
  stage: RoundStages
  stateSubject: Subject<RoundStages> = new Subject();
  roundNumber: number;
  fighters: Fighter[]; 
  fight: Fight;
  private preFightTimer = 20;
  private roundNews: RoundNews[] = [];
  constructor(fighters: Fighter[], roundNumber) {
    this.fighters = fighters
    this.roundNumber = roundNumber;
    this.doPrefight()
      .then(this.doNews)
      .then(this.doFightDay)
  }

  private doPrefight() {
    this.updateStage('pre-fight')
    return new Promise(resolve => setTimeout(() => resolve, this.preFightTimer * 1000))
  }

  private updateStage(stage: RoundStages) {
    this.stage = stage;
    this.stateSubject.next(this.stage)
  }

  private async doNews() {
    this.updateStage('news')
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
    this.updateStage('fight in progress')
  }


}
