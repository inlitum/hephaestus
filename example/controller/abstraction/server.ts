import { ServerOptions, WebSocketServer, WebSocket, RawData, ErrorEvent } from 'ws';
import { Client }                                                         from '../../shared/classes/client';

declare module 'ws' {
    interface WebSocket {
        id: string;
    }
}

export abstract class Server extends Client {

    protected websocketServer: WebSocketServer | null;
    protected sockets: { [ key: string ]: WebSocket } = {};

    public constructor (loggerName: string) {
        super (loggerName);
    }

    initialiseServer (config: ServerOptions) {
        this.logger.info (`Initialising new Websocket server with UUID [${this.uuid}].`);
        this.websocketServer = new WebSocketServer (config);

        this.websocketServer.on ('listening', (w) => {
            this.handleInitialisationSucceeded ();
        });

        this.websocketServer.on ('error', (e) => {
            this.handleInitialisationFailure (e);
        });

        this.logger.info ('Listening for websocket connections');
        this.websocketServer.on ('connection', (ws) => {
            this.connection (ws);
        });

        this.websocketServer.on ('close', () => {
            this.logger.info ('Closing websocket connection');
        });
    }

    private connection (ws: WebSocket) {
        this.logger.info ('New websocket connection started.');

        this.sockets[ ws.id ] = ws;

        this.handleConnection (ws);
        this.logger.info (`Listening for messages from the new Websocket connection.`);
        ws.on ('message', (data: RawData) => {
            this.message ({ connection: ws, rawData: data.toString () });
        });

        ws.on ('close', () => {
            this.logger.info (`Websocket connection [${ws.id}] has been closed by worker.`);
            if (!ws.id) {
                return;
            }
            delete this.sockets[ ws.id ];
            this.logger.info (`Deleted stored websocket connection [${ws.id}].`);
        });
    }

    private message (data: { connection: WebSocket, rawData: string, message?: any }) {
        try {
            data.message = JSON.parse (data.rawData);
        } catch (e) {
            this.logger.error ('Invalid message received by websocket.');
            return;
        }

        if (data.message.type !== null && data.message.type === 'connection') {
            this.logger.info (`UUID [${data.message.uuid}] has been received from websocket connection.`);
            data.connection.id = data.message.uuid;
            this.logger.info (`Assigned UUID [${data.message.uuid}] to new websocket connection.`);
            this.sockets[ data.connection.id ] = data.connection;
            this.logger.info (`Websocket [${data.connection.id}] has been stored.`);
        } else {
            this.logger.info (`[${data.connection.id}] - Received message: ${JSON.stringify (data.message)}`);
            this.handleMessage (data);
        }
    }

    abstract handleConnection (WebSocket): void;

    abstract handleMessage (data: { connection: WebSocket, rawData: string, message?: any }): void;

    abstract handleInitialisationFailure (error: Error): void;

    abstract handleInitialisationSucceeded (): void;

    abstract handleServerClose (): void;

    closeServer (): void {
        this.websocketServer.close ();
    }

}