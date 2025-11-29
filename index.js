 
import Node from "./node.js";

const args = process.argv.slice(2);

 
const p2pPort = Number(args[0] || 6001);
const peers = args.slice(1);

const node = new Node({
    p2pPort,
    peers,
    dataFile: "blockchain.json",           // TÜM NODE'LAR İÇİN AYNI
    walletFile: `wallet_${p2pPort}.json`   // HER NODE İÇİN FARKLI CÜZDAN
});

node.start();
