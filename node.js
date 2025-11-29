 
import readline from "readline";
import Blockchain from "./blockchain.js";
import Wallet from "./wallet.js";
import Miner from "./miner.js";
import Gossip from "./gossip.js";
import Transaction from "./transactions.js";

export default class Node {
    constructor({ p2pPort = 6001, peers = [], dataFile = "blockchain.json", walletFile = "wallet.json" } = {}) {
        this.blockchain = new Blockchain(dataFile);
        this.wallet = Wallet.loadOrCreate(walletFile);
        this.miner = new Miner(this.blockchain, this.wallet.address);
        this.gossip = new Gossip(p2pPort, this);
        this.peersToConnect = peers;

        this.p2pPort = p2pPort;

        this.miner.on("hashRate", h => {
            process.stdout.write(`\rHashrate: ${h} H/s`);
        });

        this.miner.on("blockMined", block => {
            console.log("\nYeni blok mine edildi, index:", block.idx);
            this.gossip.broadcast({ type: "NEW_BLOCK", data: block });
        });
    }

    start() {
        this.gossip.start();
        this.peersToConnect.forEach(p => this.gossip.connectTo(p));
        this.startCli();
    }

    printChain() {
    const formatted = this.blockchain.chain.map(block => ({
        idx: block.idx,
        timestamp: block.timestamp,
        prevHash: block.prevHash,
        hash: block.hash,
        nonce: block.nonce,
        merkleRoot: block.merkleRoot,
        transactions: block.transactions.map(tx => ({
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            senderPublicKey: tx.senderPublicKey,
            signature: tx.signature
        }))
    }));

    console.log(JSON.stringify(formatted, null, 2));
}


    startCli() {
        console.log("Node başladı. P2P port:", this.p2pPort);
        console.log("Wallet address:", this.wallet.address);
        console.log("Wallet public key:", this.wallet.publicKey);
        console.log("UYARI: Private key dosyada, kimseyle paylaşma.");
        console.log("Komutlar: help, addr, balance, send <toAddr> <amount>, mine, chain, peers, mempool, exit");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "> "
        });

        rl.prompt();

        rl.on("line", async (line) => {
            const [cmd, ...args] = line.trim().split(/\s+/);

            try {
                switch (cmd) {
                    case "help":
                        console.log("Komutlar:");
                        console.log("  help                         - Komutları göster");
                        console.log("  addr                         - Cüzdan adresini göster");
                        console.log("  balance                      - Bu cüzdanın bakiyesini göster");
                        console.log("  send <toAddr> <amount>       - Transaction oluştur ve mempool'a ekle");
                        console.log("  mine                         - Yeni blok mine et");
                        console.log("  chain                        - Zinciri yazdır (kısa)");
                        console.log("  peers                        - Peer sayısını göster");
                        console.log("  mempool                      - Mempool'daki tx sayısını göster");
                        console.log("  exit                         - Çıkış");
                        break;

                    case "addr":
                        console.log("Address:", this.wallet.address);
                        console.log("Public key:", this.wallet.publicKey);
                        break;

                    case "balance": {
                        const bal = this.blockchain.getBalance(this.wallet.address);
                        console.log("Balance:", bal);
                        break;
                    }

                    case "send": {
                        const [to, amountStr] = args;
                        const amount = Number(amountStr);

                        if (!to || !amountStr || Number.isNaN(amount)) {
                            console.log("Kullanım: send <toAddr> <amount>");
                            break;
                        }

                        const tx = new Transaction(this.wallet.address, to, amount);
                        this.wallet.sign(tx);

                        this.blockchain.addTransaction(tx);
                        this.gossip.broadcast({ type: "NEW_TX", data: tx });

                        console.log("Transaction mempool'a eklendi.");
                        break;
                    }

                    case "mine": {
                        await this.miner.mine();
                        break;
                    }

                    case "chain": {
                        this.printChain();
                        break;
                    }

                    case "peers":
                        console.log("Peer sayısı:", this.gossip.peers.length);
                        break;

                    case "mempool":
                        console.log("Mempool tx sayısı:", this.blockchain.mempool.length);
                        break;

                    case "exit":
                        rl.close();
                        break;

                    case "":
                        break;

                    default:
                        console.log("Bilinmeyen komut. help yaz.");
                }
            } catch (e) {
                console.log("Hata:", e.message);
            }

            rl.prompt();
        }).on("close", () => {
            console.log("Çıkılıyor...");
            process.exit(0);
        });
    }

    addTransactionFromNetwork(txObj) {
    const tx = new Transaction(
        txObj.from ?? null,
        txObj.to,
        txObj.amount,
        txObj.senderPublicKey || null
    );
    tx.signature = txObj.signature || null;

    if (!tx.isValid()) {
        throw new Error("Geçersiz transaction");
    }

    this.blockchain.addTransaction(tx);
}

}
