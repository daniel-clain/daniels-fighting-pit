import { DanielsFightingPit } from './daniels-fighting-pit';
import { WebsocketManager } from './websocketManager/websocketManager';
import { ConnectionStates } from '../../enums/connectionStates';

class MockFailWebsocketMessageManager extends WebsocketManager{
  get socketConnection(): Promise<ConnectionStates> {
    throw new Error()
    return Promise.resolve(ConnectionStates.connected);
  }
}
class MockSucceedeWebsocketManager extends WebsocketManager{
  get socketConnection(): Promise<ConnectionStates> {
    return Promise.resolve(ConnectionStates['connected']);
  }
}
const mockFailWebsocketMessageManager = new MockFailWebsocketMessageManager()
const mockSucceedeWebsocketMessageManager = new MockSucceedeWebsocketManager()

describe('daniels-fighting-pit', () => {
  let appTestInstance: DanielsFightingPit;
  beforeAll(async() => {
    appTestInstance = new DanielsFightingPit(mockSucceedeWebsocketMessageManager)
  })
  
  describe('when the app starts', () => {
    /* it('should try to connect to the games web socket server', async() => {
      const connectToGameSockerServerSpy = spyOn(appTestInstance, '')
      appTestInstance.componentDidLoad()
      expect(connectToGameSockerServerSpy).toHaveBeenCalled();
    }); */
    
    describe('when the app tries to connect to the games websocket server', () => {

      spyOn(appTestInstance, 'connectionState')
      
      /* it('should throw an error if the games web socket server hasnt responded to the promise in 5 seconds', async() => {
        // const connectToGameSockerServerSpy = spyOn(appTestInstance, 'connectToGameSocketServer').and.returnValue(Promise.reject('server didnt respond withing 5 seconds'))
        //await expect(appTestInstance.connectToGameSocketServer()).rejects.toEqual('server didnt respond withing 5 seconds');
        await expect(appTestInstance.connectToGameSocketServer()).resolves.toBeTruthy();
      }); */

      describe('if the websocket connection class resolves the connection', () => {
        const instanceWithGoodConnection = new DanielsFightingPit(mockSucceedeWebsocketMessageManager)
        it('should set the connectionStatus to connected', async() => {
          instanceWithGoodConnection.componentDidLoad()
          await expect(instanceWithGoodConnection.connectionState).toBe(ConnectionStates['connected'])
        })
      })

    })
    

  })

});
