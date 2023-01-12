import { Server }     from '../abstraction/server';
import { ErrorEvent } from 'ws';

export class HivemindHandler extends Server {

    protected isMaster: boolean = false;

    public constructor () {
        super ('HivemindHandler');
    }

    handleConnection (WebSocket): void {
    }

    handleMessage (RawData): void {
    }

    handleInitialisationFailure (error: Error): void {
        if (!error.message.includes ('address already in use')) {
            this.logger.error (error);
            return;
        }

        this.logger.info ('A pre-existing controller has been found.');
        this.initialiseClient('ws://localhost:8081');
    }

    handleInitialisationSucceeded (): void {
        this.isMaster = true;
    }

    handleServerClose (): void {
        if (!this.isMaster) {
            this.closeClient ();
            return;
        }
    }
}