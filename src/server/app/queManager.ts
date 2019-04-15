import { Player } from "../../models/app/player";
import { PlayerGroup } from "../../models/app/playerGroup";
import { GameManager } from "./GameManager";
import { ClientToServer } from "../../models/app/clientToServer";


export class QueManager{

  playersQueueingForAGame: Player[] = []
  gameAvailableGroups: PlayerGroup[] = []
  
  constructor(private gameManager: GameManager){}

  handleClientMessages(clientToServer: ClientToServer, player: Player){    
    switch(clientToServer.name){
      case 'que for game' : this.queForGame(player); break
      case 'cancel que for game' : this.cancelQueForGame(player); break
      case 'accept game' : this.acceptGame(player, clientToServer.data); break
      case 'decline game' : this.declineGame(clientToServer.data); break
    }
  }

  queForGame(player: Player){
    this.playersQueueingForAGame.push(player)
    console.log(`${player.name} added to que`)
    player.sendToClient({name: 'added to que'})

    this.checkIfTheresEnoughPlayersForAGame()

    /* ~~~  */ this.mockOtherPlayersJoinIn1Seconds()


  }

  cancelQueForGame(player: Player){
    this.playersQueueingForAGame = this.playersQueueingForAGame.filter(
      (p: Player) => p.clientId != player.clientId)
    console.log(`${player.name} removed from que`)
    player.sendToClient({name: 'removed from que'})
  }

  mockOtherPlayersJoinIn1Seconds(){
    setTimeout(() => {
      this.playersQueueingForAGame.push(
        new Player(null, 'Fred', 'mock1'),
        new Player(null, 'Bob', 'mock2'),
        new Player(null, 'Jim', 'mock3')
      )
      this.checkIfTheresEnoughPlayersForAGame()
    }, 1000)
  }

  checkIfTheresEnoughPlayersForAGame(){    
    if(this.playersQueueingForAGame.length > 4){
      console.log('Error: there should not be more than 4 players in the que');
      debugger
    }
    if(this.playersQueueingForAGame.length == 4){
      const players: Player[] = this.playersQueueingForAGame.splice(0, 4)
      const group: PlayerGroup = {
        groupId: new Date().getTime().toString(),
        playersResponse: players.map(player => ({
          accepted: false,
          player: player
        }))
      }
      this.gameAvailableGroups.push(group)

      players.forEach(player => player.sendToClient({name: 'game available', data: group.groupId}))
      //setTimeout(() => this.declineGame(group.groupId), 5000)
    }
  }

  declineGame(groupId){    
    const group: PlayerGroup = this.gameAvailableGroups.find(group => group.groupId == groupId)    
    if(!group){
      console.log('Error: should be able to find group by id');
      debugger
    }

    group.playersResponse.forEach(response => response.player.sendToClient({name: 'a player did not accept'}))

    this.gameAvailableGroups = this.gameAvailableGroups.filter(group => group.groupId != groupId)
  }

  acceptGame(player: Player, groupId){
    const group: PlayerGroup = this.gameAvailableGroups.find(group => group.groupId == groupId)    
    if(!group){
      console.log('Error: should be able to find group by id');
      debugger
    }
    group.playersResponse = group.playersResponse.map(response => {
      if(response.player.clientId == player.clientId){
        response.accepted = true
      }
      return response
    })

    console.log(`${player.name} accepted the game`)
    player.sendToClient({name: 'game accepted'})
    
    this.checkIfAllPlayersHaveAcceptedTheGame(group)
    
    /* ~~~  */ this.mockOtherPlayersAcceptIn1Seconds(group)

    this.checkIfAllPlayersHaveAcceptedTheGame(group)
    

  }

  mockOtherPlayersAcceptIn1Seconds(group){
    setTimeout(() => {      
      group.playersResponse = group.playersResponse.map(response => {
        response.accepted = true
        return response
      })
      this.checkIfAllPlayersHaveAcceptedTheGame(group)
    }, 1000)

  }

  checkIfAllPlayersHaveAcceptedTheGame(group: PlayerGroup){
    const allPlayersAccepted: boolean = group.playersResponse.reduce((allAccepted, response) => {
      if(!response.accepted)
        allAccepted = false
      return allAccepted
    }, true as boolean)

    if(allPlayersAccepted){
      const players = group.playersResponse.map(response => response.player)
      this.gameManager.startNewGame(group.groupId, players)
      this.gameAvailableGroups = this.gameAvailableGroups.filter(g => g.groupId != group.groupId)
    }
  }

  playerDisconnected(clientId: string){
    let index = this.playersQueueingForAGame.findIndex(player => player.clientId == clientId)
    if(index >= 0)
      this.playersQueueingForAGame.splice(index, 1)

      
    const group: PlayerGroup = this.gameAvailableGroups.find(
      group => !!group.playersResponse.find(
        response => response.player.clientId == clientId
      )
    )
    if(group)
      this.declineGame(group.groupId)

    
  }
  
}