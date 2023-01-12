import { v4 }                                       from 'uuid';
import { WebSocket, ServerConfig, RawData }         from 'ws';
import { InitialConnection }                        from '../interfaces/messages';
import { createLogger, Logger, transports, format } from 'winston';

const { combine, timestamp, label, printf } = format;

export class Client {
    private _logger: Logger | null;
    private _loggerName: string = '';
    // The unique identifier for the client.
    protected uuid: string;
    protected webSocket: WebSocket;

    // Retrievable logger.
    protected get logger (): Logger {
        // If no logger exists yet, create it.
        if (!this._logger) {
            const myFormat = printf (({ level, message, timestamp, label }) => {
                return `${timestamp} ${label} ${level}: ${message}`;
            });
            this._logger   = createLogger ({
                defaultMeta: { service: this._loggerName },
                level: 'info',
                format: combine (
                    label ({ label: `[${this.uuid}] - [${this._loggerName}]` }),
                    timestamp (),
                    myFormat
                ),
                transports: [
                    new transports.File ({ filename: '../hephaestus-error.log', level: 'error' }),
                    new transports.File ({ filename: '../hephaestus-combined.log' })
                ]
            });
        }

        return this._logger;
    }

    public constructor (loggerName: string) {
        this._loggerName = loggerName;
        this.uuid        = this.generateUUID ();
    }

    /**
     * Initialises the websocket with the given address and config.
     * @param address The websocket server address
     * @param config
     */
    public initialiseClient (address: string, config?: ServerConfig) {
        this.webSocket = new WebSocket (address, config);
        // Listen for websocket open events.
        this.webSocket.on ('open', () => {
            this.logger;
            this.handleClientOpen ();
        });
        // Listen for websocket message.
        this.webSocket.on ('message', (data: RawData) => {
            this.handleClientMessage (data);
        });
    }

    /**
     * Handles the client open connection. This is overridable.
     */
    public handleClientOpen () {
        let connectionMessage: InitialConnection = {
            type: 'connection',
            uuid: this.uuid
        };
        // Send a message to the server with the generated UUID for this worker
        // so there is parity between server and client.
        this.webSocket.send (JSON.stringify (connectionMessage));
    }

    // Handles the client message, overridable.
    public handleClientMessage (data: RawData) {
    }

    // Generates a new UUID.
    public generateUUID () {
        return v4 ();
    }

    public closeClient () {
        this.webSocket.close ();
    }
}