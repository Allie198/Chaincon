import crypto from 'crypto'
import fs from 'fs'

export class Block {
    constructor(idx, timestamp, transactions, prevHash = '') {
        this.idx = idx;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.nonce = 0;
        

        this.merkleRoot = this.calculateMerkleRoot();
        this.hash = this.calculateHash();
    }

    calculateMerkleRoot() {
        let hashes = this.transaction.map(
            transaction => crypto.createHash("sha256").update(JSON.stringify(transaction)).digest("hex")
        );

        if (hashes.length === 0) {
            return crypto.createHash("sha256").update("").digest("hex");
        }

        while (hashes.length > 1) { 
            let newLevel = []

            for (let i = 0; i < hashes.length; i+=2) {
                const left = hashes[i];
                const right = (i + 1 < hashes.length ? hashes[i + 1] : left);
                const combine = crypto.createHash("sha256").update(left + right).digest("hex");
                
                newLevel.push(combine);
            }

            hashes = newLevel();
        }

        return hashes[0];
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.idx + this.prevHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
            .digest('hex');
    }

    mineBlock(difficulty) {
        const target = '0'.repeat(difficulty);
        
        while (!this.hash.startsWith(target)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block Mined : " + this.hash);
    }

    hasValidTransactions() {
        for (const transaction of this.transactions) if (!transaction.isValid()) return false;
        return true;
    }
}


export class Blockchain {
    constructor (difficulty=2, miningReward=100, filename="data.json") {
        this.chain = [this.createGenesisBlock()];
        
        this.difficulty = difficulty;
        this.miningReward = miningReward;
        this.filename = filename;
        this.pendingTransactions = [];

        this.load();
    }

    save() {
        fs.writeFileSync(this.filename, JSON.stringify(this.chain,null, 4))
    }

    load() {
        if (fs.existsSync(this.filename)) {
            const data = JSON.parse(fs.readFileSync(this.filename));
            this.chain = data.map(
                b => new Block(b.idx, b.timestamp, b.transactions, b.prevHash)
            );
        }
    }

    createGenesisBlock() {
            return new Block(0, new Date().toISOString(), [], "0")
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) { 
        if (!transaction.isValid()) throw new Error("Geçersiz transaction");
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(minerAddress) {
        const block = new Block (
            this.chain.length, new Date().toISOString(), this.pendingTransactions, this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);

        console.log("Block mine edildi");
        
        this.chain.push(block);
        this.pendingTransactions = [new Transaction(null, minerAddress, this.miningReward)];
        
        this.save();
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const curr = this.chain[i];
            const prev = this.chain[i - 1];

            if (!curr.hasValidTransactions()) return false;
            if (curr.hash !== curr.calculateHash()) return false;
            if (curr.prevHash !== prev.hash) return false;
        }

        return true;
    }
}

