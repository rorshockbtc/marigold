using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Marigold.SDK
{
    /// <summary>
    /// The Marigold SDK provides robust, zero-cloud Layer 2 Civic Data platform integration.
    /// This client handles all underlying cryptography including IVs, Nonces, and AuthTags.
    /// </summary>
    public class MarigoldClient
    {
        private readonly byte[] _key;

        /// <summary>
        /// Initializes a new instance of the MarigoldClient.
        /// </summary>
        /// <param name="base64OrHexKey">A 256-bit key provided as a Base64 or Hex string.</param>
        public MarigoldClient(string base64OrHexKey)
        {
            if (string.IsNullOrWhiteSpace(base64OrHexKey))
                throw new ArgumentException("Key cannot be null or whitespace.", nameof(base64OrHexKey));

            _key = TryParseKey(base64OrHexKey);

            if (_key.Length != 32)
                throw new CryptographicException($"Invalid key length. Expected 32 bytes (256-bit), got {_key.Length} bytes.");
        }

        private byte[] TryParseKey(string keyString)
        {
            // Attempt Base64 decode
            try
            {
                byte[] decoded = Convert.FromBase64String(keyString);
                if (decoded.Length == 32) return decoded;
            }
            catch (FormatException ex) {
                throw new ArgumentException($"Failed Base64 decoding. If it's supposed to be Hex, it's not valid Hex either. Stop mashing the keyboard. Details: {ex.Message}", nameof(keyString), ex);
            }

            // Attempt Hex decode
            try
            {
                if (keyString.Length % 2 == 0 && keyString.All(c => "0123456789abcdefABCDEF".Contains(c)))
                {
                    var hexBytes = Enumerable.Range(0, keyString.Length)
                         .Where(x => x % 2 == 0)
                         .Select(x => Convert.ToByte(keyString.Substring(x, 2), 16))
                         .ToArray();
                    if (hexBytes.Length == 32) return hexBytes;
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"Failed Hex decoding. Ensure it is a valid Base64 or Hex encoded string representing exactly 32 bytes. Details: {ex.Message}", nameof(keyString), ex);
            }

            throw new ArgumentException("Failed to decode the provided key. We expect 32 bytes. No more, no less.");
        }

        /// <summary>
        /// Encrypts the provided plaintext using AES-256-GCM.
        /// Generates a random 12-byte nonce/IV and appends it and the 16-byte authentication tag to the cipher text.
        /// </summary>
        /// <param name="plainText">The data to encrypt.</param>
        /// <returns>Base64 encoded string containing Nonce + CipherText + AuthTag.</returns>
        public string Encrypt(string plainText)
        {
            if (plainText == null) throw new ArgumentNullException(nameof(plainText));

            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            byte[] nonce = new byte[12]; // GCM standard nonce size
            byte[] tag = new byte[16];   // GCM standard tag size
            byte[] cipherText = new byte[plainBytes.Length];

            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(nonce);
            }

            using (var aesGcm = new AesGcm(_key))
            {
                aesGcm.Encrypt(nonce, plainBytes, cipherText, tag);
            }

            // Construct payload: Nonce (12) | CipherText (N) | Tag (16)
            byte[] payload = new byte[nonce.Length + cipherText.Length + tag.Length];
            Buffer.BlockCopy(nonce, 0, payload, 0, nonce.Length);
            Buffer.BlockCopy(cipherText, 0, payload, nonce.Length, cipherText.Length);
            Buffer.BlockCopy(tag, 0, payload, nonce.Length + cipherText.Length, tag.Length);

            return Convert.ToBase64String(payload);
        }

        /// <summary>
        /// Decrypts a previously encrypted Marigold payload.
        /// </summary>
        /// <param name="encryptedPayload">Base64 or Hex encoded string containing Nonce + CipherText + AuthTag.</param>
        /// <returns>The decrypted plaintext string.</returns>
        public string Decrypt(string encryptedPayload)
        {
            if (string.IsNullOrWhiteSpace(encryptedPayload))
                throw new ArgumentException("Payload cannot be null or whitespace.", nameof(encryptedPayload));

            byte[] payloadBytes = ParsePayload(encryptedPayload);

            if (payloadBytes.Length < 12 + 16)
                throw new CryptographicException("Invalid payload length. It must contain at least a 12-byte nonce and a 16-byte auth tag.");

            byte[] nonce = new byte[12];
            byte[] tag = new byte[16];
            byte[] cipherText = new byte[payloadBytes.Length - nonce.Length - tag.Length];

            Buffer.BlockCopy(payloadBytes, 0, nonce, 0, nonce.Length);
            Buffer.BlockCopy(payloadBytes, nonce.Length, cipherText, 0, cipherText.Length);
            Buffer.BlockCopy(payloadBytes, nonce.Length + cipherText.Length, tag, 0, tag.Length);

            byte[] plainBytes = new byte[cipherText.Length];

            try
            {
                using (var aesGcm = new AesGcm(_key))
                {
                    aesGcm.Decrypt(nonce, cipherText, tag, plainBytes);
                }
            }
            catch (CryptographicException ex)
            {
                throw new CryptographicException("Decryption failed. The data may be tampered with or the key is incorrect.", ex);
            }

            return Encoding.UTF8.GetString(plainBytes);
        }

        private byte[] ParsePayload(string payload)
        {
            // Attempt Hex decode
            if (payload.Length % 2 == 0 && payload.All(c => "0123456789abcdefABCDEF".Contains(c)))
            {
                try
                {
                    return Enumerable.Range(0, payload.Length)
                         .Where(x => x % 2 == 0)
                         .Select(x => Convert.ToByte(payload.Substring(x, 2), 16))
                         .ToArray();
                }
                catch (Exception ex)
                {
                    throw new ArgumentException($"Payload looked like Hex but failed to decode. Details: {ex.Message}", nameof(payload), ex);
                }
            }
            try
            {
                return Convert.FromBase64String(payload);
            }
            catch (FormatException ex)
            {
                throw new ArgumentException("Failed to decode the encrypted payload. Ensure it is valid Base64 or Hex.", ex);
            }
        }
    }
}
