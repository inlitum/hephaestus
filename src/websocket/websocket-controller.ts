import { RawData, ServerOptions, WebSocket, WebSocketServer } from 'ws';
import { Message }                             from '../message-types';
import { Loggable }                                           from '../lib/loggable';
import { Hermes }                                             from '../hermes/hermes';

declare module 'ws' {
    interface WebSocket {
        id?: string;
    }
}

export class WebsocketController extends Loggable {

    public static INSTANCE: WebsocketController;

    protected websocketServer: WebSocketServer | null = null;

    protected get sockets (): {[id: string]: WebSocket} {
        if (!this._sockets) {
            this._sockets = {};
        }

        return this._sockets;
    }

    public constructor () {
        super ('WebsocketController');
        if (WebsocketController.INSTANCE != null) {
            return;
        }

        WebsocketController.INSTANCE = this;
    }

    initialiseWebSocketServer (config: ServerOptions = {}) {
        this.logger.info (`Initialising a new websocket server with id: ${this.id}`);

        this.websocketServer = new WebSocketServer (config);

        this.websocketServer.on ('close', () => {
            this.logger.info (`Websocket server flagged to close.`);
        });
        this.websocketServer.on ('connection', (websocket) => {
            this.logger.info (`Websocket server received a new connection.`);

            // Load all websocket event listeners.
            websocket.on ('message', (data: RawData) => {
                let message: Message;

                try {
                    message = JSON.parse (data.toString ());
                } catch (e) {
                    message      = {
                        type: 'errored',
                        data: ''
                    };
                }

                if (!message.type || message.type == 'errored') {
                    this.logger.error ('Invalid message received by websocket client.');
                    return;
                }

                if (message.type === 'handshake') {
                    console.log(message)
                    if (!message.data) {
                        this.logger.info ('Handshake message received from websocket client is invalid.');
                        return;
                    }

                    this.logger.info (`Handshake message received from websocket client is valid.`);
                    this.logger.info (`Setting the websocket client's id to [${message.data}].`);
                    websocket.id = message.data;
                    this.sockets[message.data] = websocket;
                    return;
                }

                this.logger.info (`Received handshake message from websocket client [${websocket.id}]:`);
                this.logger.info (JSON.stringify (message));

                message.websocketId = websocket.id;

                Hermes.handleRoute(message.type, message);
            });

            websocket.on ('close', (code: number, reason: Buffer) => {
                this.logger.info (`Connection to websocket client has close with code [${code}]`, reason.toString ());
            });

            websocket.on ('error', (error: Error) => {
                this.logger.info (`Connection to websocket client the returned following error:`, error);
            });
        });
        this.websocketServer.on ('error', (error: Error) => {
            this.logger.info (`Websocket server returned the following error:`, error);
        });
    }

    public static send (websocketId: string, message: any) {

    }

    public static sendAll (message: any) {

    }

    /**
     * Private
     */
    private _sockets: {[id: string]: WebSocket} | null = null;
}