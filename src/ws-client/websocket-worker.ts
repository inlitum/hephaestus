import { ClientOptions, RawData, WebSocket } from 'ws';
import { Message }            from '../message-types';
import { Loggable }                          from '../lib/loggable';

export class WebsocketWorker extends Loggable {
    protected websocket: WebSocket | null = null;

    public constructor () {
        super('WebsocketWorker')
    }

    public initialiseWebSocketClient (address: string, config: ClientOptions = {}) {
        this.logger.info (`Initialising a new websocket client with id: ${this.id}`);
        this.websocket = new WebSocket (address, config);

        this.websocket.on ('open', () => {
            this.logger.info (`Connected to websocket server at address [${address}] using server config: ${config}`);
            this.performInitialHandshake ();
            let s = {
                type: 'inventory.create',
                data: {
                    playerId: 1,
                    itemId: 4,
                    stackSize: 64,
                    row: 1,
                    column: 1
                }
            };

            this.websocket?.send (JSON.stringify(s));
        });

        this.websocket.on ('message', (data: RawData) => {
            this.logger.info (`Received message from websocket server at address [${address}]: ${data}`);
        });

        this.websocket.on ('close', (code: number, reason: Buffer) => {
            this.logger.info (`Connection close with websocket server at address [${address}] with code [${code}]: ${reason.toString ()}`);
            return;
        });

        this.websocket.on ('error', (error: Error) => {
            this.logger.info (`Connection to websocket server at address [${address}] returned following error: ${error}`);
            this.websocket?.close();
        });
    }


    public closeClient () {
        if (!this.websocket) {
            return;
        }
        this.websocket.close ();
    }

    /****************************
     * Privates                 *
     ****************************/

    private performInitialHandshake () {
        if (!this.websocket) {
            return;
        }

        let handshake: Message = {
            type: 'handshake',
            data: this.id
        };

        // Send a message to the server with the generated UUID for this worker
        // so there is parity between server and client.
        this.websocket.send (JSON.stringify (handshake));
    }
}