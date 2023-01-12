import { WorkerHandler }   from './servers/worker-handler';
import { HivemindHandler } from './servers/hivemind-handler';

let workerHandler   = new WorkerHandler ();
let hivemindHandler = new HivemindHandler ();

workerHandler.initialiseServer ({ port: 8080 });
hivemindHandler.initialiseServer ({ port: 8081 });
// Hook into the close event for the process, this way we can quickly close the websocket server.
process.on('exit', function (code) {
    workerHandler.closeServer();
    hivemindHandler.closeServer();
});