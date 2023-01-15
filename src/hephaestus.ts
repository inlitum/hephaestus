import 'reflect-metadata';
import * as minimist from 'minimist';
import * as process from 'process';
import {ClientWorker} from './worker/client-worker';
import {ClientController} from './controller/client-controller';
import {Populate} from './populator/populate';
import * as dotenv from 'dotenv';
import 'reflect-metadata';

//Load enviroment variables
dotenv.config()

let args = minimist(process.argv.slice(2), {
    string: ['start'],
    alias: {
        'start': 's'
    },
    default: {
        'start': 'client'
    }
});

let client: ClientWorker | null = null;
let server: ClientController | null = null;

if (args.start === 'client') {
    client = new ClientWorker();
    client.initialiseWebSocketClient('ws://localhost:6969');
}

if (args.start === 'server') {
    server = new ClientController();
    server.initialiseWebSocketServer({port: 6969});
}

if (args.start === 'populate') {
    let populate = new Populate();
}

process.stdin.resume();//so the program will not close instantly

function exitHandler(options: { cleanup?: boolean, exit?: boolean}) {
    if (options.cleanup) console.log('clean');
    if (options.exit) process.exit();

    if (client) {
        client.end ();
    }

    if (server) {
        server.end ();
    }
}

//do something when app is closing
process.on('exit', (exitCode) => {
    exitHandler({cleanup:true})
});

//catches ctrl+c event
process.on('SIGINT', () => {
    exitHandler({exit:true})
});

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', () => {
    exitHandler({exit:true})
});
process.on('SIGUSR2', () => {
    exitHandler({exit:true})
});

//catches uncaught exceptions
process.on('uncaughtException', () => {
    exitHandler({exit:true})
});
