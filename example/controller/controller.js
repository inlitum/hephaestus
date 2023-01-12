"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker_handler_1 = require("./servers/worker-handler");
var hivemind_handler_1 = require("./servers/hivemind-handler");
var workerHandler = new worker_handler_1.WorkerHandler();
var hivemindHandler = new hivemind_handler_1.HivemindHandler();
workerHandler.initialiseServer({ port: 8080 });
hivemindHandler.initialiseServer({ port: 8081 });
// Hook into the close event for the process, this way we can quickly close the websocket server.
process.on('exit', function (code) {
    workerHandler.closeServer();
    hivemindHandler.closeServer();
});
