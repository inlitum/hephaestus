import { Worker }                                             from '../worker/worker';
import { RawData, ServerOptions, WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage }                                    from 'http';
import { Message }                                            from '../message-types';

declare module 'ws' {
    interface WebSocket {
        id?: string;
    }
}

export abstract class Controller extends Worker {

    protected websocketServer: WebSocketServer | null = null;

    protected get sockets (): {[id: string]: WebSocket} {
        if (!this._sockets) {
            this._sockets = {};
        }

        return this._sockets;
    }

    public constructor (loggerName: string) {
        super (loggerName);
    }

    initialiseWebSocketServer (config: ServerOptions = {}) {
        this.logger.info (`Initialising a new websocket server with id: ${this.id}`);

        this.websocketServer = new WebSocketServer(config);

        this.websocketServer.on ('close', () => {
            this.logger.info (`Websocket server flagged to close.`);
            this.serverClose ();
        });
        this.websocketServer.on ('connection', (websocket, request) => {
            this.logger.info (`Websocket server received a new connection.`);

            // Load all websocket event listeners.
            websocket.on ('message', (data: RawData) => {

                let message: Message;

                try {
                    message = JSON.parse (data.toString());
                } catch (e) {
                    message = { type: 'errored', data: null };
                }

                if (!message.type || message.type == 'errored') {
                    this.logger.error ('Invalid message received by websocket client.');
                    return;
                }

                if (message.type === 'handshake') {
                    if (!message.data.id) {
                        this.logger.info ( 'Handshake message received from websocket client is invalid.');
                        return;
                    }

                    this.logger.info ( `Handshake message received from websocket client is valid.`);
                    this.logger.info ( `Setting the websocket client's id to [${message.data.id}].`);
                    websocket.id = message.data.id;
                    this.sockets[message.data.id] = websocket;
                    return;
                }

                this.logger.info ( `Received handshake message from websocket client [${websocket.id}]:`);
                this.logger.info ( JSON.stringify(message));
                this.receivedMessageFromClient (message);
            });

            websocket.on ('close', (code: number, reason: Buffer) => {
                this.logger.info (`Connection to websocket client has close with code [${code}]`, reason.toString());
            });

            websocket.on ('error', (error: Error) => {
                this.logger.info (`Connection to websocket client the returned following error:`, error);
            });

            this.serverConnection (websocket, request);
        });
        this.websocketServer.on ('error', (error: Error) => {
            this.logger.info (`Websocket server returned the following error:`, error);
            this.serverError(error);
        });
    }

    public abstract serverConnection (websocket: WebSocket, request: IncomingMessage): void;
    public abstract serverClose (): void;
    public abstract serverError (error: Error): void;
    public abstract receivedMessageFromClient (data: Message): void;

    /**
     * Private
     */
    private _sockets: {[uuid: string]: WebSocket} | null = null;

    /**
     * Worker related code.
     */
    close (code: number, reason: Buffer): void {}

    connected (): void {}

    error (error: Error): void {}

    message (data: RawData): void {}

}