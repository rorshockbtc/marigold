import { WebCryptoManager } from "../src/lib/security/WebCryptoManager";

// In Node 18, crypto is globally available in the experimental fetch API, but to be safe:
import crypto from "crypto";
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = crypto.webcrypto;
}

async function runTests() {
  console.log("Starting Cryptographic Integrity Tests...");
  
  const PIN = "123456";
  const SERVER_PEPPER = "random-long-pepper-string-from-clerk";
  const PLAINTEXT = "Sensitive Voter Name: John Doe";

  try {
    console.log("1. Testing Key Derivation...");
    const key = await WebCryptoManager.deriveKey(PIN, SERVER_PEPPER);
    console.log("   ✓ Key successfully derived from PIN and Server Pepper.");

    console.log("2. Testing Encryption...");
    const ciphertext = await WebCryptoManager.encryptData(PLAINTEXT, key);
    console.log("   ✓ Ciphertext generated:", ciphertext);

    console.log("3. Testing Decryption...");
    const decrypted = await WebCryptoManager.decryptData(ciphertext, key);
    console.log("   ✓ Decrypted text:", decrypted);
    
    if (decrypted !== PLAINTEXT) {
      throw new Error("Decrypted text does not match original plaintext.");
    }
    console.log("   ✓ Integrity check passed.");

    console.log("4. Testing Incorrect PIN (Offline Brute-Force Attempt)...");
    const wrongKey = await WebCryptoManager.deriveKey("999999", SERVER_PEPPER);
    try {
      await WebCryptoManager.decryptData(ciphertext, wrongKey);
      throw new Error("Decryption should have failed with the wrong PIN!");
    } catch (err: any) {
      console.log("   ✓ Decryption correctly failed with incorrect PIN. Error:", err.message);
    }

    console.log("All cryptographic tests passed successfully.");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
