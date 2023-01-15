import { Controller }                 from './controller';
import { IncomingMessage }            from 'http';
import { RawData, WebSocket }         from 'ws';
import {Message} from "../message-types";

export class ClientController extends Controller {

    public constructor () {
        super ('ClientController');
    }

    /*
        public
     */

    /*
        client inheritable
     */

    clientClose (code?: number, reason?: Buffer): void {
    }

    clientConnected (): void {
    }

    clientError (error: Error): void {
    }

    receivedMessageFromServer (data: RawData): void {
    }

    /*
        server inheritable
     */

    receivedMessageFromClient (message: Message): void {
        if (!message.data) {
            return;
        }
        // switch (message.type) {
        //     case 'information': {
        //         let information = new InformationalData ();
        //         information.fillFromJSON (message.data);
        //         console.log(information)
        //     }
        // }
    }

    serverClose (): void {
    }

    serverConnection (websocket: WebSocket, request: IncomingMessage): void {

    }

    serverError (error: Error): void {
    }

    end(): void {
        if (this.isClient) {
            if (!this.websocket) {
                return;
            }
            this.websocket.close();
        }

        if (!this.isClient) {
            if (!this.websocketServer) {
                return;
            }
            this.websocketServer.close();
        }
    }

}