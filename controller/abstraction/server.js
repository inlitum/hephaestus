"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var ws_1 = require("ws");
var client_1 = require("../../shared/classes/client");
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server(loggerName) {
        var _this = _super.call(this, loggerName) || this;
        _this.sockets = {};
        return _this;
    }
    Server.prototype.initialiseServer = function (config) {
        var _this = this;
        this.logger.info("Initialising new Websocket server with UUID [".concat(this.uuid, "]."));
        this.websocketServer = new ws_1.WebSocketServer(config);
        this.websocketServer.on('listening', function (w) {
            _this.handleInitialisationSucceeded();
        });
        this.websocketServer.on('error', function (e) {
            _this.handleInitialisationFailure(e);
        });
        this.logger.info('Listening for websocket connections');
        this.websocketServer.on('connection', function (ws) {
            _this.connection(ws);
        });
        this.websocketServer.on('close', function () {
            _this.logger.info('Closing websocket connection');
        });
    };
    Server.prototype.connection = function (ws) {
        var _this = this;
        this.logger.info('New websocket connection started.');
        this.sockets[ws.id] = ws;
        this.handleConnection(ws);
        this.logger.info("Listening for messages from the new Websocket connection.");
        ws.on('message', function (data) {
            _this.message({ connection: ws, rawData: data.toString() });
        });
        ws.on('close', function () {
            _this.logger.info("Websocket connection [".concat(ws.id, "] has been closed by worker."));
            if (!ws.id) {
                return;
            }
            delete _this.sockets[ws.id];
            _this.logger.info("Deleted stored websocket connection [".concat(ws.id, "]."));
        });
    };
    Server.prototype.message = function (data) {
        try {
            data.message = JSON.parse(data.rawData);
        }
        catch (e) {
            this.logger.error('Invalid message received by websocket.');
            return;
        }
        if (data.message.type !== null && data.message.type === 'connection') {
            this.logger.info("UUID [".concat(data.message.uuid, "] has been received from websocket connection."));
            data.connection.id = data.message.uuid;
            this.logger.info("Assigned UUID [".concat(data.message.uuid, "] to new websocket connection."));
            this.sockets[data.connection.id] = data.connection;
            this.logger.info("Websocket [".concat(data.connection.id, "] has been stored."));
        }
        else {
            this.logger.info("[".concat(data.connection.id, "] - Received message: ").concat(JSON.stringify(data.message)));
            this.handleMessage(data);
        }
    };
    Server.prototype.closeServer = function () {
        this.websocketServer.close();
    };
    return Server;
}(client_1.Client));
exports.Server = Server;
