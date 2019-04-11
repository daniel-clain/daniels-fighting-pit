import { Fighter } from "../fighter/fighter";

export class Fight {
  fighters: Fighter[]
  winnerOfTheFight: Fighter
  constructor(fighters: Fighter[]) {
    this.fighters = fighters
    this.startFight()
    this.watchForAWinner()
  }
  private startFight() {
    
  }

  private watchForAWinner() {
    this.fighters.forEach((fighter: Fighter) => {
      fighter.knockedOutSubject.subscribe(() => this.fighterKnockedOut())
    })
  }

  private fighterKnockedOut(){
    if(this.fighters.filter(fighter => !fighter.knockedOut).length == 1)
      this.declareWinner(this.fighters.find(figher => !figher.knockedOut))

  }

  private declareWinner(fighter: Fighter){
    console.log(`${fighter.name} wins!!`)
  }

}