"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var uuid_1 = require("uuid");
var ws_1 = require("ws");
var winston_1 = require("winston");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, label = winston_1.format.label, printf = winston_1.format.printf;
var Client = /** @class */ (function () {
    function Client(loggerName) {
        this._loggerName = '';
        this._loggerName = loggerName;
        this.uuid = this.generateUUID();
    }
    Object.defineProperty(Client.prototype, "logger", {
        // Retrievable logger.
        get: function () {
            // If no logger exists yet, create it.
            if (!this._logger) {
                var myFormat = printf(function (_a) {
                    var level = _a.level, message = _a.message, timestamp = _a.timestamp, label = _a.label;
                    return "".concat(timestamp, " ").concat(label, " ").concat(level, ": ").concat(message);
                });
                this._logger = (0, winston_1.createLogger)({
                    defaultMeta: { service: this._loggerName },
                    level: 'info',
                    format: combine(label({ label: "[".concat(this.uuid, "] - [").concat(this._loggerName, "]") }), timestamp(), myFormat),
                    transports: [
                        new winston_1.transports.File({ filename: '../hephaestus-error.log', level: 'error' }),
                        new winston_1.transports.File({ filename: '../hephaestus-combined.log' })
                    ]
                });
            }
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialises the websocket with the given address and config.
     * @param address The websocket server address
     * @param config
     */
    Client.prototype.initialiseClient = function (address, config) {
        var _this = this;
        this.webSocket = new ws_1.WebSocket(address, config);
        // Listen for websocket open events.
        this.webSocket.on('open', function () {
            _this.logger;
            _this.handleClientOpen();
        });
        // Listen for websocket message.
        this.webSocket.on('message', function (data) {
            _this.handleClientMessage(data);
        });
    };
    /**
     * Handles the client open connection. This is overridable.
     */
    Client.prototype.handleClientOpen = function () {
        var connectionMessage = {
            type: 'connection',
            uuid: this.uuid
        };
        // Send a message to the server with the generated UUID for this worker
        // so there is parity between server and client.
        this.webSocket.send(JSON.stringify(connectionMessage));
    };
    // Handles the client message, overridable.
    Client.prototype.handleClientMessage = function (data) {
    };
    // Generates a new UUID.
    Client.prototype.generateUUID = function () {
        return (0, uuid_1.v4)();
    };
    Client.prototype.closeClient = function () {
        this.webSocket.close();
    };
    return Client;
}());
exports.Client = Client;
