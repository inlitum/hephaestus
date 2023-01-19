import * as minimist           from 'minimist';
import * as process            from 'process';
import { Hermes }              from './hermes/hermes';
import { WebsocketController } from './websocket/websocket-controller';
import { WebsocketWorker }     from './websocket/websocketWorker';
import { Routes }              from './routes';
import * as dotenv             from 'dotenv';
import { Hive }                from './db/hive';

let args = minimist (process.argv.slice (2), {
    string: [ 'start' ],
    alias: {
        'start': 's'
    },
    default: {
        'start': 'client'
    }
});

dotenv.config ();

let hive = new Hive ();

if (args.start === 'client') {
    let client = new WebsocketWorker ();
    client.initialiseWebSocketClient ('ws://localhost:6969');
}

if (args.start === 'server') {
    new Hermes ();
    Routes ();

    let server = new WebsocketController ();
    server.initialiseWebSocketServer ({ port: 6969 });
}

if (args.start === 'create') {
    hive.createDb ();
}
if (args.start === 'populate') {

}
