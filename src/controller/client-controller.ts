import { Controller }         from './controller';
import { IncomingMessage }    from 'http';
import { RawData, WebSocket } from 'ws';
import { Message }            from '../message-types';

export class ClientController extends Controller {

    public constructor () {
        super ('ClientController');
    }

    clientClose (code?: number, reason?: Buffer): void {
    }

    clientConnected (): void {
    }

    clientError (error: Error): void {
    }

    receivedMessageFromClient (data: Message): void {
    }

    receivedMessageFromServer (data: RawData): void {
    }

    serverClose (): void {
    }

    serverConnection (websocket: WebSocket, request: IncomingMessage): void {
    }

    serverError (error: Error): void {
    }

}