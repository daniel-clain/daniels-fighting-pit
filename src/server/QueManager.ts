import { ConnectedPlayer } from "../models/connectedPlayer";
import { GameManager } from "./GameManager";
import { PlayerGroup } from "../models/playerGroup";
import { ClientToServer } from "../models/clientToServer";

export class QueManager{

  playersQueueingForAGame: ConnectedPlayer[] = []
  gameAvailableGroups: PlayerGroup[] = []
  
  constructor(private gameManager: GameManager){}

  handleClientMessages(clientToServer: ClientToServer, player: ConnectedPlayer){    
    switch(clientToServer.name){
      case 'que for game' : this.queForGame(player); break
      case 'cancel que for game' : this.cancelQueForGame(player); break
      case 'accept game' : this.acceptGame(player, clientToServer.data); break
      case 'decline game' : this.declineGame(clientToServer.data); break
    }
  }

  queForGame(player: ConnectedPlayer){
    this.playersQueueingForAGame.push(player)
    console.log(`${player.name} added to que`)
    player.sendToClient({name: 'added to que'})

    this.checkIfTheresEnoughPlayersForAGame()

    /* ~~~  */ this.mockOtherPlayersJoinIn3Seconds()


  }

  cancelQueForGame(player: ConnectedPlayer){
    this.playersQueueingForAGame = this.playersQueueingForAGame.filter(
      (p: ConnectedPlayer) => p.clientId != player.clientId)
    console.log(`${player.name} removed from que`)
    player.sendToClient({name: 'removed from que'})
  }

  mockOtherPlayersJoinIn3Seconds(){
    setTimeout(() => {
      this.playersQueueingForAGame.push(
        {name: 'Fred', clientId: 'mock', sendToClient: () => console.log('emit to mock client')}, 
        {name: 'Bob', clientId: 'mock', sendToClient: () => console.log('emit to mock client')}, 
        {name: 'Jim', clientId: 'mock', sendToClient: () => console.log('emit to mock client')}, 
      )
      this.checkIfTheresEnoughPlayersForAGame()
    }, 2000)
  }

  checkIfTheresEnoughPlayersForAGame(){    
    if(this.playersQueueingForAGame.length > 4){
      console.log('Error: there should not be more than 4 players in the que');
      debugger
    }
    if(this.playersQueueingForAGame.length == 4){
      const players: ConnectedPlayer[] = this.playersQueueingForAGame.splice(0, 4)
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

  acceptGame(player: ConnectedPlayer, groupId){
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
    
    /* ~~~  */ this.mockOtherPlayersAcceptIn2Seconds(group)

    this.checkIfAllPlayersHaveAcceptedTheGame(group)
    

  }

  mockOtherPlayersAcceptIn2Seconds(group){
    setTimeout(() => {      
      group.playersResponse = group.playersResponse.map(response => {
        response.accepted = true
        return response
      })
      this.checkIfAllPlayersHaveAcceptedTheGame(group)
    }, 2000)

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
  
}