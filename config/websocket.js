const WebSocket = require("ws")

let wss

function socket(expressServer) {

    wss = new WebSocket.Server({
        server: expressServer,
        path: "/websockets",
    });

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            console.log('received: %s', message);
        });
        console.log("new client connected")
    });
}

function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
}

module.exports = {
    socket: socket,
    broadcast: broadcast
}