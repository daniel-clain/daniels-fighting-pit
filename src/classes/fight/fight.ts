/* import { Fighter } from "../fighter/fighter";
import { FightStates } from "../../enums/fightStates";
import { FighterStates } from "../../enums/fighterStates";
import { Subject } from "rxjs"; */

export class Fight {
  /* private countdown = 3
  fightState: FightStates = FightStates['beginning of fight'];
  fightStateSubject: Subject<FightStates> = new Subject();
  winnerOfTheFight: Fighter
  constructor(private fighters: Fighter[]) {
    this.startFight()
    this.watchForAWinner()
  }
  private startFight() {
    setTimeout(() => this.setFightState(FightStates['active']), this.countdown * 100)
  }

  private watchForAWinner() {
    this.fighters.forEach((fighter: Fighter) => {
      fighter.fighterStateSubject.subscribe(
        (fighterState: FighterStates) => {
          if (fighterState === FighterStates['down and out']) {
            const fightersSillAbleToFight = this.fighters.filter(fighter => fighter.fighterState !== FighterStates['down and out'])
            if (fightersSillAbleToFight.length === 1) {
              this.winnerOfTheFight = fightersSillAbleToFight[0]
              this.setFightState(FightStates['end of fight'])
            }
          }
        }
      )
    })
  }

  setFightState(fightState){
    this.fightStateSubject.next(fightState)
    this.fightState = fightState;
  } */

}