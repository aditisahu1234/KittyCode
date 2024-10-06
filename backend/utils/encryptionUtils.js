const { box, randomBytes } = require('tweetnacl');
const { TextDecoder, TextEncoder } = require('util');
const crypto = require('crypto');

// Use Node.js native Buffer for base64 encoding/decoding
const encodeBase64 = (data) => Buffer.from(data).toString('base64');  // Uint8Array to Base64
const decodeBase64 = (data) => new Uint8Array(Buffer.from(data, 'base64'));  // Base64 to Uint8Array

// Generates a new Diffie-Hellman key pair
const generateKeyPair = () => {
  const keyPair = box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
};

// Computes a shared secret using Diffie-Hellman key exchange
const computeSharedSecret = (publicKey, secretKey) => {
  const publicKeyUint8 = decodeBase64(publicKey);
  const secretKeyUint8 = decodeBase64(secretKey);
  return box.before(publicKeyUint8, secretKeyUint8);
};

// Derives a new symmetric key from a shared secret using SHA-256
const deriveNewKey = (sharedSecret) => {
  const hash = crypto.createHash('sha256');
  hash.update(sharedSecret);
  return hash.digest();  // Uint8Array (Buffer in Node.js)
};

// Generates a nonce (for encryption)
const newNonce = () => randomBytes(box.nonceLength);

// Encrypts a message using the shared secret
const encrypt = (sharedSecret, message) => {
  const nonce = newNonce();
  const messageUint8 = new TextEncoder().encode(message);
  const encrypted = box.after(messageUint8, nonce, sharedSecret);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  return encodeBase64(fullMessage);
};

// Decrypts a message using the shared secret
const decrypt = (sharedSecret, encryptedMessage) => {
  const messageWithNonce = decodeBase64(encryptedMessage);
  const nonce = messageWithNonce.slice(0, box.nonceLength);
  const message = messageWithNonce.slice(box.nonceLength);

  const decrypted = box.open.after(message, nonce, sharedSecret);
  if (!decrypted) {
    throw new Error('Could not decrypt message');
  }

  return new TextDecoder().decode(decrypted);
};

// Export functions using module.exports
module.exports = {
  generateKeyPair,
  computeSharedSecret,
  deriveNewKey,
  encrypt,
  decrypt,
};
