import { Client } from '../shared/classes/client';

let worker = new Client ('Worker');

worker.initialiseClient('ws://localhost:8080');

process.on('exit', function (code) {
    worker.closeClient ();
});