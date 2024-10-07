const { box, randomBytes } = require('tweetnacl');
const base64 = require('@stablelib/base64');
const { TextDecoder, TextEncoder } = require('util');  // Node.js built-in utilities

// Helper functions to convert between base64 and Uint8Array
const encodeBase64 = base64.encode;
const decodeBase64 = base64.decode;

// Generates a new Diffie-Hellman key pair
exports.generateKeyPair = () => {
  const keyPair = box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
};

// Computes a shared secret using Diffie-Hellman key exchange
exports.computeSharedSecret = (publicKey, secretKey) => {
  const publicKeyUint8 = decodeBase64(publicKey);
  const secretKeyUint8 = decodeBase64(secretKey);
  return box.before(publicKeyUint8, secretKeyUint8);
};

// Derives a new symmetric key from a shared secret using SHA-256 (using crypto built-in in Node.js)
exports.deriveNewKey = (sharedSecret) => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(sharedSecret);
  return hash.digest();  // Returns a Uint8Array (Buffer in Node.js)
};

// Generates a nonce
const newNonce = () => randomBytes(box.nonceLength);

// Encrypts a message using the shared secret
exports.encrypt = (sharedSecret, message) => {
  const nonce = newNonce();
  const messageUint8 = new TextEncoder().encode(message);  // Convert message to Uint8Array
  const encrypted = box.after(messageUint8, nonce, sharedSecret);  // Use sharedSecret to encrypt

  // Combine nonce and encrypted message
  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  return encodeBase64(fullMessage);
};

// Decrypts a message using the shared secret
exports.decrypt = (sharedSecret, encryptedMessage) => {
  const messageWithNonce = decodeBase64(encryptedMessage);
  const nonce = messageWithNonce.slice(0, box.nonceLength);  // Extract nonce
  const message = messageWithNonce.slice(box.nonceLength);   // Extract encrypted message

  const decrypted = box.open.after(message, nonce, sharedSecret);  // Decrypt using sharedSecret
  if (!decrypted) {
    throw new Error('Could not decrypt message');
  }

  return new TextDecoder().decode(decrypted);  // Convert Uint8Array back to string
};
