import Block from "./block.js";
import Transaction from "./transactions.js"
import EventEmitter from "events";

export default class Miner extends EventEmitter {
    constructor(blockchain, rewardAddress) {
        super();
        this.blockchain = blockchain;
        this.rewardAddress = rewardAddress;

        this.isMining = false;
        
        this.currentJob = 0;
        this.hashesPerSecond = 0;
        this.lastHashCountTime = 0;
        this.hashCounter = 0;
    }

    selectTransaction(limit=5000) { 
            let mempool = [...this.blockchain.mempool];
            return mempool.slice(0,limit);
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
            console.log("Zaten mining yapılıyor");
            return;

        }

        this.isMining = true;
        this.currentJob++;
        const job = this.currentJob;
        this.emit("miningStarted");

        const rewardTx = new Transaction(null, this.rewardAddress, this.blockchain.reward);
        this.blockchain.mempool.push(rewardTx);

        const selectedTxs = this.selectTransactions();

        const block = new Block(
            this.blockchain.chain.length,
            Date.now(),
            selectedTxs,
            this.blockchain.getLatest().hash
        );

        console.log("Mining Başladı | İşlem Sayısı: " + selectedTxs.length);

        this.lastHashCountTime = Date.now();
        this.hashCounter = 0;

        const target = "0".repeat(this.blockchain.difficulty);

        while (true) {
 
            if (jobId !== this.currentJobId) {
                console.log("Mining iptal edildi | yeni iş başlatıldı.");
                this.isMining = false;
                this.emit("miningStopped");
                return;
            }

            block.nonce++;
            block.hash = block.calculateHash();

            this.countHash();

            if (block.hash.startsWith(target)) {
                console.log(`Blok mine edildi | Hash: ${block.hash}`);

                this.blockchain.addBlock(block);
                this.blockchain.mempool = [];

                this.isMining = false;
                this.emit("blockMined", block);

                return block;
            }
 
            await new Promise(r => setImmediate(r));
        }
    }

    stop() {
        if (!this.isMining) return;

        this.isMining = false;
        this.currentJobId++;
        this.emit("miningStopped");
        console.log("Mining durduruldu.");
    }

    }
