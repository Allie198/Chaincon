import WebSocket from "ws";

export default class Gossip {
        constructor (port, node) {
            this.port = port;
            this.node = node;
            this.peers = [];
        }

        start() {
            const server = new WebSocket.Server({port: this.port});
            console.log("P2P listening on " , this.port);
            server.on("connection", ws => this.onConnection(ws));
        }

        connectTo(peer) {
            const ws = new WebSocket(peer);
            ws.on("open", () => this.onConnection(ws));
        }

        onConnection(ws) {
            this.peers.push(ws);
            ws.on("message", msg => this.onMessage(JSON.parse(msg)));
            ws.send(JSON.stringify({type: "CHAIN", data: this.node.blockchain.chain}))
        }

        broadcast(data) {
            this.peers.forEach(ws => ws.send(JSON.stringify(data)));
        }

        onMessage({ type, data }) {
        if (type === "CHAIN") {
            if (data.length > this.node.blockchain.chain.length) {
                this.node.blockchain.chain = data;
                this.node.blockchain.save();
            }
        }

        if (type === "NEW_BLOCK") {
            this.node.blockchain.addBlock(data);
        }
    }


}