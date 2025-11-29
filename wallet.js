import fs from "fs";
import EC from "elliptic";
import crypto from "crypto";
import { publicKeyToAddress } from "./crypto-utils.js";

const ec = new EC.ec("secp256k1");

export default class Wallet {
    constructor(privateKeyHex = null) {
        if (privateKeyHex) {
            this.keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
        } else {
            this.keyPair = ec.genKeyPair();
        }

        this.privateKey = this.keyPair.getPrivate("hex");
        this.publicKey = this.keyPair.getPublic("hex");
        this.address = publicKeyToAddress(this.publicKey);
    }

    sign(tx) {
        if (!tx || typeof tx.calculateHash !== "function") {
            throw new Error("Geçersiz transaction");
        }
        tx.sign(this.keyPair);
    }

    export() {
        return {
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            address: this.address
        };
    }

    static import(json) {
        if (!json.privateKey) throw new Error("Geçersiz wallet export");
        return new Wallet(json.privateKey);
    }

    saveToFile(filename) {
        fs.writeFileSync(filename, JSON.stringify(this.export(), null, 2), "utf8");
    }

    static loadOrCreate(filename) {
        if (fs.existsSync(filename)) {
            const raw = fs.readFileSync(filename, "utf8");
            const data = JSON.parse(raw);
            return Wallet.import(data);
        } else {
            const wallet = new Wallet();
            wallet.saveToFile(filename);
            return wallet;
        }
    }
}
