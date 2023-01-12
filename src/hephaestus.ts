import * as minimist        from 'minimist';
import * as process         from 'process';
import { ClientWorker }     from './worker/client-worker';
import { ClientController } from './controller/client-controller';
import { Populate }         from './populator/populate';

let args = minimist(process.argv.slice(2), {
    string: ['start'],
    alias: {
        'start': 's'
    },
    default: {
        'start': 'client'
    }
});

if (args.start === 'client') {
    let client = new ClientWorker ();
    client.initialiseWebSocketClient ('ws://localhost:6969');
}

if ( args.start === 'server') {
    let server = new ClientController ();
    server.initialiseWebSocketServer({ port: 6969 });
}

if ( args.start === 'populate') {
    let populate = new Populate ();
}
