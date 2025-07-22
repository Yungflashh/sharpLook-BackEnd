"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const socket_handlers_1 = require("./sockets/socket.handlers");
const PORT = 4000;
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // adjust this in production
        methods: ["GET", "POST"],
    },
});
(0, socket_handlers_1.registerSocketHandlers)(io);
server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
