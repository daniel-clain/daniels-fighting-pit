
import { Fighter } from "../../fighter/fighter";
import { Player } from "../../../../models/app/player";

export class PostFight{
  postFightFinished
  duration = 1
  winner: Fighter

  constructor(private players: Player[], private fighters: Fighter[]){}

  start(winner: Fighter){
    this.winner = winner
    this.showResults()
    return new Promise(resolve => this.postFightFinished = resolve);
  }

  private showResults(){
    this.players.forEach((player: Player) => {
      if(player.clientId.substring(0, 4) != 'mock'){
        if(player.manager.bet){
          const {amount, fighter} = player.manager.bet
          console.log(`${player.name}'s bet was $${amount} on ${fighter.name}`);
        }
      }
    })
    
    this.fighters.forEach((fighter: Fighter) => {
      if(this.winner){
        console.log(`${fighter.name} was ${fighter.name == this.winner.name ? 'the winner' : 'knocked out'}`);
      } else {
        console.log(`${fighter.name} was ${fighter.knockedOut ? 'knocked out' : 'remaining at the end'}`);
      }

    })
    setTimeout(() => this.postFightFinished(), this.duration * 1000)
    
  }
}