import fs from "fs";
import Block from "./block.js";

export default class Blockchain {
    constructor(filename, difficulty = 2, reward = 100) {
        this.difficulty = difficulty;
        this.reward = reward;
        this.filename = filename;

        this.chain = [];
        this.mempool = [];

        this.load();
    }

    createGenesis() {
        return new Block(0, Date.now(), [], "0");
    }

    load() {
        if (!fs.existsSync(this.filename)) {
            this.chain = [this.createGenesis()];
            this.save();
            return;
        }

        const data = JSON.parse(fs.readFileSync(this.filename));
        this.chain = data.map(b => new Block(b.index, b.timestamp, b.transactions, b.prevHash));
    }

    save() {
        fs.writeFileSync(this.filename, JSON.stringify(this.chain, null, 2));
    }

    getLatest() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block) {
        this.chain.push(block);
        this.save();
    }

    addTransaction(tx) {
        if (!tx.isValid()) throw new Error("Geçersiz transaction");
        this.mempool.push(tx);
    }

    getBalance(addr) {
        let balance = 0;

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.from === addr) balance -= tx.amount;
                if (tx.to === addr) balance += tx.amount;
            }
        }

        return balance;
    }
}