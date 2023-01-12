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
exports.WorkerHandler = void 0;
var server_1 = require("../abstraction/server");
var WorkerHandler = /** @class */ (function (_super) {
    __extends(WorkerHandler, _super);
    function WorkerHandler() {
        return _super.call(this, 'WorkerHandler') || this;
    }
    WorkerHandler.prototype.handleConnection = function (WebSocket) {
    };
    WorkerHandler.prototype.handleMessage = function (message) {
    };
    WorkerHandler.prototype.handleInitialisationFailure = function (error) {
    };
    WorkerHandler.prototype.handleInitialisationSucceeded = function () {
    };
    WorkerHandler.prototype.handleServerClose = function () {
    };
    return WorkerHandler;
}(server_1.Server));
exports.WorkerHandler = WorkerHandler;
