import * as crypto from 'crypto';

/**
 * Marigold SDK Client
 * Provides robust, zero-cloud Layer 2 Civic Data platform integration.
 * Abstracts IV, Nonce, and AuthTag handling using AES-256-GCM.
 */
export class MarigoldClient {
    private readonly key: Buffer;

    /**
     * Initializes the MarigoldClient with a 256-bit key.
     * @param base64OrHexKey A 32-byte key encoded in Base64 or Hex.
     */
    constructor(base64OrHexKey: string) {
        if (!base64OrHexKey || typeof base64OrHexKey !== 'string') {
            throw new Error('MarigoldClient initialization failed: Key must be a non-empty string.');
        }

        this.key = this.tryParseKey(base64OrHexKey);

        if (this.key.length !== 32) {
            throw new Error(`MarigoldClient initialization failed: Invalid key length. Expected 32 bytes, got ${this.key.length} bytes.`);
        }
    }

    private tryParseKey(keyStr: string): Buffer {
        // Attempt hex first if it matches hex pattern (only valid hex chars and even length)
        const isHex = /^[0-9a-fA-F]+$/.test(keyStr) && keyStr.length % 2 === 0;
        if (isHex) {
            const buf = Buffer.from(keyStr, 'hex');
            if (buf.length === 32) return buf;
        }

        // Attempt base64
        try {
            const buf = Buffer.from(keyStr, 'base64');
            if (buf.length === 32) return buf;
            throw new Error(`MarigoldClient initialization failed: Key decoded to ${buf.length} bytes, expected 32. Try again, but this time with a real 256-bit key.`);
        } catch (e) {
            throw new Error(`MarigoldClient initialization failed: Could not decode key as Hex or Base64. Ensure your key isn't garbage. Details: ${(e as Error).message}`);
        }
    }

    /**
     * Encrypts plaintext data securely using AES-256-GCM.
     * @param plainText The string data to encrypt.
     * @returns A Base64 encoded payload formatted as: Nonce (12 bytes) + CipherText + AuthTag (16 bytes).
     */
    public encrypt(plainText: string): string {
        if (typeof plainText !== 'string') {
            throw new Error('Encryption failed: Plaintext must be a string.');
        }

        try {
            const nonce = crypto.randomBytes(12); // GCM standard
            const cipher = crypto.createCipheriv('aes-256-gcm', this.key, nonce);

            const encrypted = Buffer.concat([
                cipher.update(plainText, 'utf8'),
                cipher.final()
            ]);

            const authTag = cipher.getAuthTag();

            // Structure: Nonce + CipherText + AuthTag
            const payload = Buffer.concat([nonce, encrypted, authTag]);

            return payload.toString('base64');
        } catch (error) {
            throw new Error(`Encryption failed due to an internal cryptographic error: ${(error as Error).message}`);
        }
    }

    /**
     * Decrypts a previously encrypted Marigold payload.
     * @param encryptedPayload Base64 or Hex encoded payload containing Nonce + CipherText + AuthTag.
     * @returns The decrypted plaintext string.
     */
    public decrypt(encryptedPayload: string): string {
        if (!encryptedPayload || typeof encryptedPayload !== 'string') {
            throw new Error('Decryption failed: Payload must be a non-empty string.');
        }

        const payloadBuffer = this.parsePayload(encryptedPayload);

        // 12 bytes nonce + at least 1 byte cipher + 16 bytes auth tag is technically 29 bytes, but empty string makes it 28
        if (payloadBuffer.length < 28) {
            throw new Error('Decryption failed: Payload is too short to contain required cryptographic components (Nonce + AuthTag).');
        }

        const nonce = payloadBuffer.subarray(0, 12);
        const authTag = payloadBuffer.subarray(payloadBuffer.length - 16);
        const cipherText = payloadBuffer.subarray(12, payloadBuffer.length - 16);

        try {
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, nonce);
            decipher.setAuthTag(authTag);

            const decrypted = Buffer.concat([
                decipher.update(cipherText),
                decipher.final()
            ]);

            return decrypted.toString('utf8');
        } catch (error) {
            throw new Error(`Decryption failed: Data may be corrupted, tampered with, or the key is invalid. Details: ${(error as Error).message}`);
        }
    }

    private parsePayload(payload: string): Buffer {
        // Simple heuristic: if it looks entirely hex and has an even length, treat as hex.
        // Otherwise try Base64.
        const isHex = /^[0-9a-fA-F]+$/.test(payload) && payload.length % 2 === 0;
        
        if (isHex) {
            return Buffer.from(payload, 'hex');
        }

        // Try Base64
        const base64Buf = Buffer.from(payload, 'base64');
        return base64Buf;
    }
}
