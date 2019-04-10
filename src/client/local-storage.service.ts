import { Subject } from "rxjs";

export class LocalStorageService{
  private static instance: LocalStorageService
  nameSubject: Subject<string> = new Subject()

  static get SingletonInstance(){
    return this.instance || (this.instance = new LocalStorageService())
  }

  set name(name: string){
    localStorage.setItem('daniels-fighting-pit Name', name)
    this.nameSubject.next(name)
  }

  get name(){
    return localStorage.getItem('daniels-fighting-pit Name')
  }

  get clientId(){
    return  localStorage.getItem('daniels-fighting-pit Client ID')
  }

  set clientId(connectionId: string){
    localStorage.setItem('daniels-fighting-pit Client ID', connectionId)
  }

  get gameId(){
    return  localStorage.getItem('daniels-fighting-pit Game ID')
  }

  set gameId(gameId: string){
    localStorage.setItem('daniels-fighting-pit Game ID', gameId)
    
  }

  removeGameId(){
    localStorage.removeItem('daniels-fighting-pit Game ID')
  }
  

}
