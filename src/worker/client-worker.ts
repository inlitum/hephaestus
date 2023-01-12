import { Worker }  from './worker';
import { RawData } from 'ws';

export class ClientWorker extends Worker {

    public constructor () {
        super ('ClientWorker');
    }

    clientClose (code?: number, reason?: Buffer): void {
    }

    clientConnected (): void {
        this.websocket?.send (JSON.stringify({'type': 'information', 'data': 'Hi there'}));
    }

    clientError (error: Error): void {
    }

    receivedMessageFromServer (data: RawData): void {
    }
}