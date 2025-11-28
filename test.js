import { Blockchain } from './blockchain.js';
import Transaction from './transactions.js';

function runTest() {
    const chain = new Blockchain(3, 50, "data.json");

    console.log("=== Yeni Zincir Başlatıldı ===");
    console.log("Genesis Block hash:", chain.chain[0].hash);
 
    chain.addTransaction(new Transaction("Alice", "Bob", 70));
    chain.addTransaction(new Transaction("Bob", "Charlie", 30));

    console.log("\n=== Pending Transactions ===");
    console.log(chain.pendingTransactions);

    console.log("\n=== Mining pending transactions ===");
    chain.minePendingTransactions("Miner1");

    console.log("\nBalances:");
    console.log("Alice:", chain.getBalanceOf("Alice"));
    console.log("Bob:", chain.getBalanceOf("Bob"));
    console.log("Charlie:", chain.getBalanceOf("Charlie"));
    console.log("Miner1:", chain.getBalanceOf("Miner1"));

 
    chain.addTransaction(new Transaction("Alice", "Charlie", 10));
    chain.addTransaction(new Transaction("Bob", "Alice", 5));

    console.log("\n=== Mining pending transactions ===");
    chain.minePendingTransactions("Miner1");

    console.log("\nBalances after 2nd mining:");
    console.log("Alice:", chain.getBalanceOf("Alice"));
    console.log("Bob:", chain.getBalanceOf("Bob"));
    console.log("Charlie:", chain.getBalanceOf("Charlie"));
    console.log("Miner1:", chain.getBalanceOf("Miner1"));

    console.log("\nBlockchain valid?", chain.isChainValid());
}

runTest();
