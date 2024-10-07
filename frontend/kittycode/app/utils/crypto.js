import { box, randomBytes, setPRNG } from 'tweetnacl';
import { decode as decodeUTF8, encode as encodeUTF8 } from '@stablelib/utf8';
import { decode as decodeBase64, encode as encodeBase64 } from '@stablelib/base64';
import * as Crypto from 'expo-crypto';
import * as Keychain from 'react-native-keychain';
import { Buffer } from 'buffer';

global.Buffer = Buffer;  // Polyfill Buffer globally

// PRNG setup for random byte generation
export const PRNG = (x, n) => {
  const randomBytes = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytes[i];
  }
};

setPRNG(PRNG);

// Generates a new Diffie-Hellman key pair
export const generateKeyPair = () => box.keyPair();

// Computes a shared secret using Diffie-Hellman key exchange
export const computeSharedSecret = (publicKey, secretKey) => box.before(publicKey, secretKey);

// Derives a new symmetric key from the previous one using SHA-256 hash
export const deriveNewKey = async (previousKey) => {
  const previousKeyBase64 = encodeBase64(previousKey);
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, previousKeyBase64);
  return Uint8Array.from(Buffer.from(hash, 'hex'));
};

// Generates a nonce
const newNonce = () => randomBytes(box.nonceLength);

export const encrypt = (secretOrSharedKey, json) => {
  const nonce = newNonce();  // nonce should always have correct length
  const messageUint8 = encodeUTF8(JSON.stringify(json));
  const encrypted = box.after(messageUint8, nonce, secretOrSharedKey);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  return encodeBase64(fullMessage);  // Should return nonce + message together
};

// Decrypts a message using a symmetric key
export const decrypt = (secretOrSharedKey, messageWithNonce) => {
  if (!messageWithNonce) {
    throw new Error('Invalid message: messageWithNonce is undefined');
  }

  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);

  if (messageWithNonceAsUint8Array.length < box.nonceLength) {
    throw new Error('Invalid message: message length is too short');
  }

  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(box.nonceLength);

  const decrypted = box.open.after(message, nonce, secretOrSharedKey);

  if (!decrypted) {
    throw new Error('Could not decrypt message');
  }

  return JSON.parse(decodeUTF8(decrypted));
};


// Simplified private key retrieval using Keychain
export const getPrivateKey = async (username) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username === username) {
      return decodeBase64(credentials.password);  // Directly decode the base64-encoded private key
    }
    console.log("No valid private key found in storage");
    return null;
  } catch (error) {
    console.error("Error retrieving private key:", error);
    return null;
  }
};

// Sending a message with Double Ratchet logic (with key ratcheting)
export const sendMessage = async (senderSecretKey, receiverPublicKey, previousKey, message) => {
  const newDhKeyPair = generateKeyPair();  // Generate new DH key pair for ratcheting
  const newSharedSecret = computeSharedSecret(receiverPublicKey, newDhKeyPair.secretKey);  // Compute shared secret
  const newSymmetricKey = await deriveNewKey(newSharedSecret);  // Derive new symmetric key for encryption
  const encryptedMessage = encrypt(newSymmetricKey, message);  // Encrypt the message

  return {
    encryptedMessage,
    newDhPublicKey: encodeBase64(newDhKeyPair.publicKey),  // Return the new DH public key for ratcheting
  };
};

// Receiving a message with Double Ratchet logic (with key ratcheting)
export const receiveMessage = async (receiverSecretKey, senderDhPublicKey, previousKey, encryptedMessage) => {
  const senderPublicKey = decodeBase64(senderDhPublicKey);  // Use decodeBase64 to convert sender's public key
  const newSharedSecret = computeSharedSecret(senderPublicKey, receiverSecretKey);  // Compute shared secret
  const newSymmetricKey = await deriveNewKey(newSharedSecret);  // Derive new symmetric key for decryption
  const decryptedMessage = decrypt(newSymmetricKey, encryptedMessage);  // Decrypt the message

  return decryptedMessage;
};

// Function to handle public key exchange
export const exchangePublicKeys = async (userId, friendId, publicKey) => {
  try {
    const response = await fetch(`${BASE_URL}/api/chats/exchange-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify({
        friendId,
        publicKey,
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      console.error('Failed to exchange keys:', data);
      alert(data.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error exchanging public keys:', error.message);
    return null;
  }
};
