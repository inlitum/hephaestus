import { createLogger, format, info, Logger, transports } from 'winston';
import { v4 }                                             from 'uuid';

const { combine, timestamp, label, printf } = format;

export class Loggable {
    private _loggerName: string;
    public logger: Logger;
    public id: string;

    public constructor (loggerName: string) {
        this._loggerName = loggerName;
        this.id          = this.generateUUID ();

        const myFormat = printf (({ level, message, timestamp, label }) => {
            return `${timestamp} ${label} ${level}: ${message}`;
        });
        this.logger   = createLogger ({
            defaultMeta: { service: this._loggerName },
            level: 'info',
            format: combine (
                label ({ label: `[${this.id}] - [${this._loggerName}]` }),
                timestamp (),
                myFormat
            ),
            transports: [
                new transports.File ({ filename: './hephaestus-error.log', level: 'error' }),
                new transports.File ({ filename: './hephaestus-combined.log' }),
                new transports.Console ({ level: 'info'})
            ]
        });
    }
    // Generates a new UUID.
    public generateUUID () {
        return v4 ();
    }

}