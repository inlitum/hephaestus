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
exports.HivemindHandler = void 0;
var server_1 = require("../abstraction/server");
var HivemindHandler = /** @class */ (function (_super) {
    __extends(HivemindHandler, _super);
    function HivemindHandler() {
        var _this = _super.call(this, 'HivemindHandler') || this;
        _this.isMaster = false;
        return _this;
    }
    HivemindHandler.prototype.handleConnection = function (WebSocket) {
    };
    HivemindHandler.prototype.handleMessage = function (RawData) {
    };
    HivemindHandler.prototype.handleInitialisationFailure = function (error) {
        if (!error.message.includes('address already in use')) {
            this.logger.error(error);
            return;
        }
        this.logger.info('A pre-existing controller has been found.');
        this.initialiseClient('ws://localhost:8081');
    };
    HivemindHandler.prototype.handleInitialisationSucceeded = function () {
        this.isMaster = true;
    };
    HivemindHandler.prototype.handleServerClose = function () {
        if (!this.isMaster) {
            this.closeClient();
            return;
        }
    };
    return HivemindHandler;
}(server_1.Server));
exports.HivemindHandler = HivemindHandler;
