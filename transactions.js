import crypto from 'crypto'

export default class Transaction { 
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = Number(amount);
        this.signature = null;
    }

    calculateHash() {
        return crypto
        .createHash("sha256")
        .update(this.from + this.to + this.amount).digest("hex");
    }

    sign(keyPair) {
        if (keyPair("hex") !== this.from) throw new Error("Eşleşme sorunu");
        const hash = this.calculateHash();
        const sig = keyPair.sign(hash, "base64");
        this.signature = sig.toDer("hex");

    }

      isValid() {
        if (this.from === null) return true;

        if (!this.signature) return false;

        const verify = crypto.createVerify("SHA256");
        verify.update(this.calculateHash());
        verify.end();

        try {
            const publicKeyObj = crypto.createPublicKey({
                key: Buffer.from(this.from, "hex"),
                format: "der",
                type: "spki",
            });

            return verify.verify(publicKeyObj, Buffer.from(this.signature, "hex"));
        } catch {
            return false;
        }
    }
}
