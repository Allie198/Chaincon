// gossip.js
import { WebSocket, WebSocketServer } from "ws";

export default class Gossip {
    constructor(port, node) {
        this.port = port;
        this.node = node;
        this.peers = [];
    }

    start() {
        const server = new WebSocketServer({ port: this.port });
        console.log("P2P listening on", this.port);

        server.on("connection", ws => this.onConnection(ws));
    }

    connectTo(peer) {
        const ws = new WebSocket(peer);
        ws.on("open", () => {
            console.log("Peer'e bağlanıldı:", peer);
            this.onConnection(ws);
        });
        ws.on("error", err => {
            console.log("Peer bağlantı hatası:", peer, err.message);
        });
    }

    onConnection(ws) {
        this.peers.push(ws);

        ws.on("message", msg => {
            try {
                const data = JSON.parse(msg);
                this.onMessage(data);
            } catch {
                console.log("Geçersiz mesaj alındı");
            }
        });

        ws.on("close", () => {
            this.peers = this.peers.filter(p => p !== ws);
        });

        ws.send(JSON.stringify({
            type: "CHAIN",
            data: this.node.blockchain.chain
        }));
    }

    broadcast(data) {
        const str = JSON.stringify(data);
        this.peers.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(str);
            }
        });
    }

    onMessage({ type, data }) {
        if (type === "CHAIN") {
            this.node.blockchain.replaceChain(data);
        }

        if (type === "NEW_BLOCK") {
            const block = data;
            const newChain = this.node.blockchain.chain.concat([block]);
            this.node.blockchain.replaceChain(newChain);
        }

        if (type === "NEW_TX") {
            const txObj = data;
            try {
                this.node.addTransactionFromNetwork(txObj);
            } catch (e) {
                console.log("Gelen tx eklenemedi:", e.message);
            }
        }
    }
}
