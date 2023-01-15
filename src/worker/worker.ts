import { v4 }                                       from 'uuid';
import { ClientOptions, RawData, WebSocket }        from 'ws';
import { createLogger, Logger, transports, format } from 'winston';
import { HandshakeData, Message }                   from '../message-types';
import {serialize} from "class-transformer";

const { combine, timestamp, label, printf } = format;

export abstract class Worker {

    protected readonly id: string;
    protected websocket: WebSocket | null = null;

    protected get logger (): Logger {
        if (!this._logger) {
            const myFormat = printf (({ level, message, timestamp, label }) => {
                return `${timestamp} ${label} ${level}: ${message}`;
            });
            this._logger   = createLogger ({
                defaultMeta: { service: this._loggerName },
                level: 'info',
                format: combine (
                    label ({ label: `[${this.id}] - [${this._loggerName}]` }),
                    timestamp (),
                    myFormat
                ),
                transports: [
                    new transports.File ({ filename: './hephaestus-error.log', level: 'error' }),
                    new transports.File ({ filename: './hephaestus-combined.log' })
                ]
            });
        }

        return this._logger;
    }

    public constructor (loggerName: string) {
        this.id          = this.generateUUID ();
        this._loggerName = loggerName;
    }

    public initialiseWebSocketClient (address: string, config: ClientOptions = {}) {
        this.logger.info (`Initialising a new websocket client with id: ${this.id}`);
        this.websocket = new WebSocket (address, config);

        this.websocket.on ('open', () => {
            this.logger.info (`Connected to websocket server at address [${address}] using server config: ${config}`);
            this.performInitialHandshake ();
            this.clientConnected ();
        });

        this.websocket.on ('message', (data: RawData) => {
            this.logger.info (`Received message from websocket server at address [${address}]: ${data}`);
            this.receivedMessageFromServer (data);
        });

        this.websocket.on ('close', (code: number, reason: Buffer) => {
            this.logger.info (`Connection close with websocket server at address [${address}] with code [${code}]: ${reason.toString ()}`);
            this.clientClose (code, reason);
        });

        this.websocket.on ('error', (error: Error) => {
            this.logger.info (`Connection to websocket server at address [${address}] returned following error: ${error}`);
            this.clientError (error);

            if (!this.websocket) {
                return;
            }
            this.websocket.close ();
        });
    }

    public abstract clientConnected (): void;

    public abstract clientClose (code?: number, reason?: Buffer): void;

    public abstract clientError (error: Error): void;

    public abstract receivedMessageFromServer (data: RawData): void;

    public abstract end (): void;

    // Generates a new UUID.
    public generateUUID () {
        return v4 ();
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

    private _logger: Logger | null = null;
    private readonly _loggerName: string;

    private performInitialHandshake () {
        if (!this.websocket) {
            return;
        }

        let handshake = new HandshakeData ();

        handshake.id = this.id;

        let connectionMessage  = new Message ();
        connectionMessage.data = handshake;
        // Send a message to the server with the generated UUID for this worker
        // so there is parity between server and client.
        this.websocket.send (JSON.stringify (serialize(connectionMessage)));
    }
}