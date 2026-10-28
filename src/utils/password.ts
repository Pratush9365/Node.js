import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const KEY_BYTES = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, KEY_BYTES, (error, key) => (error ? reject(error) : resolve(key)));
    });
}

/** scrypt with a random per-password salt, stored as `scrypt:<salt hex>:<key hex>`. */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const key = await derive(password, salt);
    return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

/** Constant-time comparison; a malformed stored hash simply fails. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [scheme, saltHex, keyHex] = stored.split(":");
    if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
    const expected = Buffer.from(keyHex, "hex");
    if (expected.length !== KEY_BYTES) return false;
    const actual = await derive(password, Buffer.from(saltHex, "hex"));
    return timingSafeEqual(actual, expected);
}
