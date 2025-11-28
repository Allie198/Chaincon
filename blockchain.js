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
