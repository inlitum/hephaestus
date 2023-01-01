"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../shared/classes/client");
var worker = new client_1.Client('Worker');
worker.initialiseClient('ws://localhost:8080');
process.on('exit', function (code) {
    worker.closeClient();
});
