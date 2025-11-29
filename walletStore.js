 import fs from "fs";
import Wallet from "./wallet.js";

const WALLET_FILE = "wallet.json";  

export function loadOrCreateWallet() {
    if (fs.existsSync(WALLET_FILE)) {
        const data = JSON.parse(fs.readFileSync(WALLET_FILE, "utf-8"));
        const wallet = Wallet.import(data);
        console.log("Eski wallet yüklendi:", wallet.address);
        return wallet;
    }

    const wallet = new Wallet(); 
    fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet.export(), null, 2));
    console.log("Yeni wallet oluşturuldu:", wallet.address);
    return wallet;
}

export function saveWallet(wallet) {
    fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet.export(), null, 2));
}
