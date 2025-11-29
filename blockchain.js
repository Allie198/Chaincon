import fs from "fs";
import Block from "./block.js";
import Transaction from "./transactions.js";

export default class Blockchain {
    constructor(filename = "blockchain.json", difficulty = 3, reward = 100) {
        this.filename = filename;
        this.difficulty = difficulty;
        this.reward = reward;

        this.chain = [];
        this.mempool = [];

        this.load();
    }

    createGenesis() {
        const genesis = new Block(0, Date.now(), [], "0");
        return genesis;
    }

    createBlockFromPlain(b) {
        const txs = (b.transactions || []).map(t => {
            const tx = new Transaction(
                t.from ?? null,
                t.to,
                t.amount,
                t.senderPublicKey || null
            );
            tx.signature = t.signature || null;
            return tx;
        });

        const block = new Block(b.idx, b.timestamp, txs, b.prevHash);
        block.nonce = b.nonce || 0;
        block.hash = b.hash || block.calculateHash();
        block.merkleRoot = b.merkleRoot || block.calculateMerkleRoot();
        return block;
    }

    load() {
        if (!fs.existsSync(this.filename)) {
            console.log("Blockchain dosyası yok, yeni genesis oluşturuluyor...");
            this.chain = [this.createGenesis()];
            this.mempool = [];
            this.save();
            return;
        }

        const raw = fs.readFileSync(this.filename, "utf8");
        if (!raw.trim()) {
            console.log("Boş blockchain dosyası, yeni genesis oluşturuluyor...");
            this.chain = [this.createGenesis()];
            this.mempool = [];
            this.save();
            return;
        }

        const data = JSON.parse(raw);

        const chainData = Array.isArray(data) ? data : (data.chain || []);
        const mempoolData = Array.isArray(data) ? [] : (data.mempool || []);

        this.chain = chainData.map(b => this.createBlockFromPlain(b));

        this.mempool = mempoolData.map(t => {
            const tx = new Transaction(
                t.from ?? null,
                t.to,
                t.amount,
                t.senderPublicKey || null
            );
            tx.signature = t.signature || null;
            return tx;
        });

        console.log(`Blockchain yüklendi. Blok sayısı: ${this.chain.length}`);
    }

    save() {
        const data = {
            chain: this.chain,
            mempool: this.mempool,
            difficulty: this.difficulty,
            reward: this.reward
        };

        fs.writeFileSync(this.filename, JSON.stringify(data, null, 2), "utf8");
    }

    getLatest() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block) {
        const latest = this.getLatest();

        if (block.prevHash !== latest.hash) {
            console.log("Geçersiz block: prevHash uyuşmuyor");
            return false;
        }

        const target = "0".repeat(this.difficulty);
        if (!block.hash.startsWith(target)) {
            console.log("Geçersiz block: difficulty tutmuyor");
            return false;
        }

        if (!block.hasValidTransactions()) {
            console.log("Geçersiz block: transactionlar valid değil");
            return false;
        }

        this.chain.push(block);

        const blockTxHashes = new Set(block.transactions.map(tx => tx.calculateHash()));
        this.mempool = this.mempool.filter(tx => !blockTxHashes.has(tx.calculateHash()));

        this.save();
        return true;
    }

        addTransaction(tx) {
        if (!tx.isValid()) {
            throw new Error("Geçersiz transaction");
        }

        if (tx.from !== null) {
            const senderBalance = this.getBalance(tx.from);
            if (senderBalance < tx.amount) {
                throw new Error("Yetersiz bakiye");
            }
        }

        this.mempool.push(tx);
        this.save();
    }


    getBalance(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.from === address) balance -= tx.amount;
                if (tx.to === address) balance += tx.amount;
            }
        }

        for (const tx of this.mempool) {
                if (tx.from === address) balance -= tx.amount;
                if (tx.to === address) balance += tx.amount;
    }


        return balance;
    }

    replaceChain(newChainPlain) {
        if (!Array.isArray(newChainPlain)) return;
        if (newChainPlain.length <= this.chain.length) return;

        const newChain = [];
        for (const b of newChainPlain) {
            const block = this.createBlockFromPlain(b);
            newChain.push(block);
        }

        for (let i = 1; i < newChain.length; i++) {
            const prev = newChain[i - 1];
            const curr = newChain[i];

            if (curr.prevHash !== prev.hash) {
                console.log("Gelen zincir geçersiz (prevHash)");
                return;
            }
            const target = "0".repeat(this.difficulty);
            if (!curr.hash.startsWith(target)) {
                console.log("Gelen zincir geçersiz (difficulty)");
                return;
            }
            if (!curr.hasValidTransactions()) {
                console.log("Gelen zincir geçersiz (tx)");
                return;
            }
        }

        console.log("Daha uzun zincir bulundu, zincir güncellendi.");
        this.chain = newChain;
        this.save();
    }
}
