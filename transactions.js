import EC from "elliptic";
import crypto from "crypto";

const ec = new EC.ec("secp256k1");
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58encode(buffer) {
    let x = BigInt("0x" + buffer.toString("hex"));
    let output = "";
    while (x > 0n) {
        const mod = Number(x % 58n);
        output = BASE58[mod] + output;
        x = x / 58n;
    }
    return output;
}

function publicKeyToAddress(pubKeyHex) {
    const sha = crypto.createHash("sha256")
        .update(Buffer.from(pubKeyHex, "hex"))
        .digest();
    const ripe = crypto.createHash("ripemd160")
        .update(sha)
        .digest();
    return base58encode(ripe);
}

export default class Transaction {
    constructor(from, to, amount, senderPublicKey = null) {
        this.from = from;
        this.to = to;
        this.amount = Number(amount);
        this.senderPublicKey = senderPublicKey;
        this.signature = null;
    }

    calculateHash() {
        return crypto
            .createHash("sha256")
            .update(
                String(this.from ?? "") +
                String(this.to ?? "") +
                String(this.amount)
            )
            .digest("hex");
    }

    sign(keyPair) {
        const pubHex = keyPair.getPublic("hex");
        const addr = publicKeyToAddress(pubHex);

        if (this.from !== addr) {
            throw new Error("Eşleşme sorunu: from, bu cüzdanın address'i değil");
        }

        const hash = this.calculateHash();
        const sig = keyPair.sign(hash, "hex");

        this.senderPublicKey = pubHex;
        this.signature = sig.toDER("hex");
    }

    isValid() {
        if (this.from === null) return true;

        if (!this.signature || !this.senderPublicKey) {
            return false;
        }

        const addr = publicKeyToAddress(this.senderPublicKey);
        if (addr !== this.from) {
            return false;
        }

        const key = ec.keyFromPublic(this.senderPublicKey, "hex");
        const hash = this.calculateHash();

        return key.verify(hash, this.signature, "hex");
    }
}
