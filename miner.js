import Block from "./block.js";
import Transaction from "./transactions.js";
import EventEmitter from "events";

export default class Miner extends EventEmitter {
    constructor(blockchain, rewardAddress) {
        super();
        this.blockchain = blockchain;
        this.rewardAddress = rewardAddress;

        this.isMining = false;
        this.currentJobId = 0;
        this.hashCounter = 0;
        this.hashesPerSecond = 0;
        this.lastHashCountTime = 0;
    }

    selectTransactions(limit = 5000) {
        const mempool = [...this.blockchain.mempool];
        return mempool.slice(0, limit);
    }

    countHash() {
        this.hashCounter++;

        const now = Date.now();
        if (now - this.lastHashCountTime >= 1000) {
            this.hashesPerSecond = this.hashCounter;
            this.hashCounter = 0;
            this.lastHashCountTime = now;

            this.emit("hashRate", this.hashesPerSecond);
        }
    }

    async mine() {
        if (this.isMining) {
            console.log("Zaten mining yapılıyor.");
            return;
        }

        this.isMining = true;
        this.currentJobId++;
        const jobId = this.currentJobId;

        this.emit("miningStarted");

        const rewardTx = new Transaction(null, this.rewardAddress, this.blockchain.reward);
        const selectedTxs = this.selectTransactions();
        selectedTxs.push(rewardTx);

        const block = new Block(
            this.blockchain.chain.length,
            Date.now(),
            selectedTxs,
            this.blockchain.getLatest().hash
        );

        console.log("Mining başladı | İşlem Sayısı:", selectedTxs.length);

        this.lastHashCountTime = Date.now();
        this.hashCounter = 0;

        const target = "0".repeat(this.blockchain.difficulty);

        while (this.isMining) {
 
            if (jobId !== this.currentJobId) {
                console.log("Mining iptal edildi (yeni iş başladı).");
                this.emit("miningStopped");
                return;
            }

            block.nonce++;
            block.hash = block.calculateHash();

            this.countHash();

            if (block.hash.startsWith(target)) {
                console.log("Blok mine edildi | Hash:", block.hash);

                this.blockchain.addBlock(block);
                this.blockchain.mempool = [];

                this.isMining = false;
                this.emit("blockMined", block);
                return block;
            }

  
            await new Promise(res => setImmediate(res));
        }

        console.log("Mining durduruldu.");
        this.emit("miningStopped");
    }
 
    stop() {
        if (!this.isMining) return;

        this.isMining = false;
        this.currentJobId++ 
        console.log("Mining durduruldu.");
        this.emit("miningStopped");
    }
}
