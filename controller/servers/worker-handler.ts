import { Server }     from '../abstraction/server';
import { ErrorEvent } from 'ws';

export class WorkerHandler extends Server {

    public constructor () {
        super ('WorkerHandler');
    }

    handleConnection (WebSocket): void {

    }

    handleMessage (message: any): void {
    }

    handleInitialisationFailure (error: Error): void {

    }

    handleInitialisationSucceeded (): void {
    }

    handleServerClose (): void {
    }

}