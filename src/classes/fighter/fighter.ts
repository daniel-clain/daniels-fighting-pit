import { FighterStates } from "../../enums/fighterStates";
/* import { Subject } from "rxjs";
import { FighterLevels } from "../../models/fighterLevels";
import { Hit } from "../../models/hit"; */
class XY {
  x: number;
  y: number;
}

export class Fighter {
  pos: XY 
  name: string
  fighterState?: FighterStates
  /* fighterStateSubject: Subject<FighterStates> = new Subject();
  fighterLevels: FighterLevels = {
    stamina: 100,
    spirit: 100,
  };

  strength: number;
  speed: number;
  aggression: number;
 */

  constructor() {
    this.fighterState = FighterStates['ready to fight'];
    //this.setRandomProperties()
  }
  /*private setRandomProperties() {
    this.name = 'Fred';
  }
 
  public takeAHit(hit: Hit) {
    let { stamina } = this.fighterLevels
    stamina = stamina - hit.damage
    if (stamina <= 0)
      this.updateFighterState(FighterStates['down and out'])
  }

  private updateFighterState(state: FighterStates) {
    this.fighterState = state
    this.fighterStateSubject.next(state)
  } */
}