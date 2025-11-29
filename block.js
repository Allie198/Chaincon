// block.js
import crypto from "crypto";

export default class Block {
    constructor(idx, timestamp, transactions, prevHash = "") {
        this.idx = idx;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.nonce = 0;

        this.merkleRoot = this.calculateMerkleRoot();
        this.hash = this.calculateHash();
    }

    calculateMerkleRoot() {
        let hashes = this.transactions.map(tx =>
            crypto.createHash("sha256").update(JSON.stringify({
                from: tx.from,
                to: tx.to,
                amount: tx.amount,
                signature: tx.signature || null,
                senderPublicKey: tx.senderPublicKey || null
            })).digest("hex")
        );

        if (hashes.length === 0) {
            return crypto.createHash("sha256").update("").digest("hex");
        }

        while (hashes.length > 1) {
            const newLevel = [];
            for (let i = 0; i < hashes.length; i += 2) {
                const left = hashes[i];
                const right = (i + 1 < hashes.length) ? hashes[i + 1] : left;
                const combined = crypto.createHash("sha256")
                    .update(left + right)
                    .digest("hex");
                newLevel.push(combined);
            }
            hashes = newLevel;
        }

        return hashes[0];
    }

    calculateHash() {
        const txData = this.transactions.map(tx => ({
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            signature: tx.signature || null,
            senderPublicKey: tx.senderPublicKey || null
        }));

        return crypto
            .createHash("sha256")
            .update(
                this.idx +
                this.prevHash +
                this.timestamp +
                JSON.stringify(txData) +
                this.nonce
            )
            .digest("hex");
    }

    mineBlock(difficulty) {
        const target = "0".repeat(difficulty);

        while (!this.hash.startsWith(target)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined:", this.hash);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) return false;
        }
        return true;
    }
}
