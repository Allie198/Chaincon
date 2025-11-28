import EC from "elliptic";
const ec = new EC.ec("secp256k1");

export default class Wallet {
    constructor() {
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic("hex");
        this.privateKey = this.key.getPrivate("hex");
    }

    sign(tx) {
        tx.sign(this.key);
    }
}
