import fs from 'fs'
import Block  from './block'
 

export class Blockchain {
    constructor (difficulty=2, miningReward=100, filename="data.json") {
            
            this.difficulty = difficulty;
            this.reward = miningReward;
            this.filename = filename;

            this.chain = [];
            this.mempol = []

            this.load();
    }

    save() {
        fs.writeFileSync(this.filename, JSON.stringify(this.chain,null, 4))
    }

    createGenesisBlock() {
            return new Block(0, new Date().toISOString(), [], "0")
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



    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) { 
        if (!transaction.isValid()) throw new Error("Geçersiz transaction");
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(minerAddress) {
 
        this.pendingTransactions.push(
            new Transaction(null, minerAddress, this.miningReward)
        );

        const block = new Block(
            this.chain.length,
            new Date().toISOString(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        console.log("Block mine edildi");

        this.chain.push(block);
 
        this.pendingTransactions = [];
        
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

    getBalanceOf(address) {
    let balance = 0;

    for (const block of this.chain) {
        for (const tx of block.transactions) {
            const amount = Number(tx.amount) || 0;
            if (tx.from === address) balance -= amount;
            if (tx.to === address) balance += amount;
        }
    }

    return balance;
 }

}

