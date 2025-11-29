import EC from "elliptic";
import crypto from "crypto";

const ec = new EC.ec("secp256k1");

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58encode(buffer) {
    let x = BigInt("0x" + buffer.toString("hex"));
    let output = "";
    while (x > 0) {
        const mod = Number(x % 58n);
        output = BASE58[mod] + output;
        x = x / 58n;
    }
    return output;
}

function publicKeyToAddress(pubKeyHex) {
    const sha = crypto.createHash("sha256").update(Buffer.from(pubKeyHex, "hex")).digest();
    const ripe = crypto.createHash("ripemd160").update(sha).digest();
    return base58encode(ripe);
}


export default class Wallet {
    /**

     * @param {string|null} privateKeyHex 
     */

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

    signMessage(msg) {
        const msgHash = crypto.createHash("sha256").update(msg).digest("hex");
        return this.key.sign(msgHash, "hex");
    }

     static verifyMessage(msg, signature, publicKey) {
        const key = ec.keyFromPublic(publicKey, "hex");
        const msgHash = crypto.createHash("sha256").update(msg).digest("hex");
        return key.verify(msgHash, signature);
    }

    getBalance(blockchain) {
        let balance = 0;

        for (const block of blockchain.chain) {
            for (const tx of block.transactions) {
                if (tx.from === this.address) balance -= tx.amount;
                if (tx.to === this.address) balance += tx.amount;
            }
        }

        return balance;
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




}