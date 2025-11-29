import crypto from "crypto";

export const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58encode(buffer) {
    let x = BigInt("0x" + buffer.toString("hex"));
    let output = "";
    while (x > 0n) {
        const mod = Number(x % 58n);
        output = BASE58[mod] + output;
        x = x / 58n;
    }
    return output || "1";
}

export function publicKeyToAddress(pubKeyHex) {
    const sha = crypto.createHash("sha256")
        .update(Buffer.from(pubKeyHex, "hex"))
        .digest();
    const ripe = crypto.createHash("ripemd160")
        .update(sha)
        .digest();
    return base58encode(ripe);
}
