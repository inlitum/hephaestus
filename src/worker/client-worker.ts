import { Worker }                                    from './worker';
import { RawData }                                   from 'ws';
import { HandshakeData, InformationalData, Message } from '../message-types';

export class ClientWorker extends Worker {

    public constructor () {
        super ('ClientWorker');
    }

    clientClose (code?: number, reason?: Buffer): void {
    }

    clientConnected (): void {
        let information         = new InformationalData ();
        information.information = 1;

        let message = new Message ();

        message.type = 'information';
        message.data = JSON.stringify (information);

        this.websocket?.send (JSON.stringify (message));
    }

    clientError (error: Error): void {
    }

    receivedMessageFromServer (data: RawData): void {
    }
}