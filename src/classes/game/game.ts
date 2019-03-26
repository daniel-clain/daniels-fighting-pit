import { Fighter } from "../fighter/fighter";
import { Round } from "../round/round";

export class Game{
    totalRounds: number;
    currentRound: Round;
    fighters: Fighter[];

    constructor(private groupId: string, private playerSocketIds: string[]){
        console.log(this.groupId, this.playerSocketIds)
        
    }

}