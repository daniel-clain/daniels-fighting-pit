import { Fighter } from "../fighter/fighter";
import { RoundStages } from "../../../types/game/round-stages";
import { PreFight } from "./pre-fight/pre-fight";
import { News } from "./news/news";
import { Fight } from "./fight/fight";
import { PostFight } from "./post-fight/post-fight";
import { Player } from "../../../models/app/player";
import { RoundSkeleton } from "../../../models/game/round-skeleton";

export class Round {
   
  private stage: RoundStages
  private roundFinished
  number: number

  preFight: PreFight
  news: News
  fight: Fight
  postFight: PostFight

  constructor(number: number, private players: Player[], private fighters: Fighter[]){
    this.number = number
    this.preFight = new PreFight(this.players)
    this.news = new News()
    this.fight = new Fight(this.players, this.fighters)
    this.postFight = new PostFight(this.players, this.fighters)
  }

  private sendRoundUpdateToClients(){    
    const roundSkeleton: RoundSkeleton = this.getRoundSkeleton()
    this.players.forEach((player: Player) => {
      player.sendToClient({name:'round update', data: roundSkeleton})
    })
  }

  start(): Promise<any>{
    this.updateStage('pre-fight')
    this.preFight.start()
    .then(() => {
      this.updateStage('news')
      this.news.start()
      .then(() => {
        this.updateStage('fight')
        this.fight.start()
        .then(() => {
          this.updateStage('post-fight')
          this.postFight.start(this.fight.winner)
          .then(() => {
            this.roundFinished()
          })
        })
      })
    })
    
    return new Promise(resolve => this.roundFinished = resolve);
  }

  private updateStage(stage: RoundStages) {
    this.stage = stage
    console.log(`Round Stage: ${stage}`);
    this.sendRoundUpdateToClients()
  }

  getRoundSkeleton(): RoundSkeleton{
    return {
      fighters: this.fighters.map((fighter: Fighter) => fighter.getFighterSkeleton()),
      stage: this.stage,
      number: this.number
    }
  }

}
