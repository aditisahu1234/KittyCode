// import {
//     generateKeyPair,
//     sendMessage,
//     receiveMessage,
//     storeKeyPair,
//     getKeyPair,
// } from '../utils/crypto';
// import { encode as encodeBase64, decode as decodeBase64 } from '@stablelib/base64';
// export const runTest = async () => {
//     try {
//         console.log("Starting Double Ratchet Test...");

//         // Step 1: Generate key pairs for User A and User B
//         console.log("Generating key pairs...");
//         const userAKeyPair = generateKeyPair();
//         const userBKeyPair = generateKeyPair();

//         if (!userAKeyPair || !userBKeyPair) {
//             throw new Error("Failed to generate key pairs");
//         }

//         console.log("User A Public Key:", encodeBase64(userAKeyPair.publicKey));
//         console.log("User B Public Key:", encodeBase64(userBKeyPair.publicKey));

//         // Store key pairs for both users
//         console.log("Storing key pairs...");
//         await storeKeyPair('UserA', userAKeyPair);
//         await storeKeyPair('UserB', userBKeyPair);

//         // Retrieve stored key pairs to confirm
//         console.log("Retrieving stored key pairs...");
//         const storedUserAKeyPair = await getKeyPair('UserA');
//         const storedUserBKeyPair = await getKeyPair('UserB');

//         if (!storedUserAKeyPair || !storedUserBKeyPair) {
//             throw new Error("Failed to retrieve stored key pairs");
//         }

//         console.log('Retrieved User A Key Pair:', storedUserAKeyPair);
//         console.log('Retrieved User B Key Pair:', storedUserBKeyPair);

//         // Step 2: Message exchanges between User A and User B
//         const messages = [
//             'Hello, User B!', // A to B
//             'Hi, User A!', // B to A
//             'How are you?', // A to B
//             'Doing well, thanks!', // B to A
//             'Good to hear!' // A to B
//         ];

//         let previousKeyA = null;
//         let previousKeyB = null;

//         // User A sends the first message
//         console.log("User A sending the first message...");
//         const { encryptedMessage: encryptedMessage1, newDhPublicKey: newDhPublicKey1 } = await sendMessage(
//             storedUserAKeyPair.secretKey,
//             storedUserBKeyPair.publicKey,
//             previousKeyA,
//             messages[0]
//         );
//         console.log("Encrypted Message 1:", encryptedMessage1);
//         console.log("User A's New DH Public Key 1:", newDhPublicKey1);

//         // User B receives the first message
//         console.log("User B receiving the first message...");
//         const decryptedMessage1 = await receiveMessage(
//             storedUserBKeyPair.secretKey,
//             newDhPublicKey1,
//             previousKeyB,
//             encryptedMessage1
//         );
//         console.log("Decrypted Message 1:", decryptedMessage1);
//         if (decryptedMessage1 !== messages[0]) {
//             console.error("Test failed: Messages do not match!");
//         }

//         // Continue with further exchanges and log similarly
//         // Now B sends a reply to A
//         console.log("User B sending reply to A...");
//         const { encryptedMessage: encryptedMessage2, newDhPublicKey: newDhPublicKey2 } = await sendMessage(
//             storedUserBKeyPair.secretKey,
//             storedUserAKeyPair.publicKey,
//             previousKeyB,
//             messages[1]
//         );
//         console.log("Encrypted Message 2:", encryptedMessage2);
//         console.log("User B's New DH Public Key 2:", newDhPublicKey2);

//         // A receives B's message
//         console.log("User A receiving message from B...");
//         const decryptedMessage2 = await receiveMessage(
//             storedUserAKeyPair.secretKey,
//             newDhPublicKey2,
//             previousKeyA,
//             encryptedMessage2
//         );
//         console.log("Decrypted Message 2:", decryptedMessage2);
//         if (decryptedMessage2 !== messages[1]) {
//             console.error("Test failed: Messages do not match!");
//         }

//         // Continue the message exchanges with User A and B
//         for (let i = 2; i < messages.length; i++) {
//             if (i % 2 === 0) {
//                 console.log(`User A sending message ${i + 1}...`);
//                 const { encryptedMessage, newDhPublicKey } = await sendMessage(
//                     storedUserAKeyPair.secretKey,
//                     storedUserBKeyPair.publicKey,
//                     previousKeyA,
//                     messages[i]
//                 );
//                 console.log(`Encrypted Message ${i + 1}:`, encryptedMessage);
//                 console.log(`User A's New DH Public Key ${i + 1}:`, newDhPublicKey);

//                 const decryptedMessage = await receiveMessage(
//                     storedUserBKeyPair.secretKey,
//                     newDhPublicKey,
//                     previousKeyB,
//                     encryptedMessage
//                 );
//                 console.log(`Decrypted Message ${i + 1}:`, decryptedMessage);
//                 if (decryptedMessage !== messages[i]) {
//                     console.error("Test failed: Messages do not match!");
//                 }

//                 previousKeyA = newDhPublicKey; // Update previous key for A
//             } else {
//                 console.log(`User B sending message ${i + 1}...`);
//                 const { encryptedMessage, newDhPublicKey } = await sendMessage(
//                     storedUserBKeyPair.secretKey,
//                     storedUserAKeyPair.publicKey,
//                     previousKeyB,
//                     messages[i]
//                 );
//                 console.log(`Encrypted Message ${i + 1}:`, encryptedMessage);
//                 console.log(`User B's New DH Public Key ${i + 1}:`, newDhPublicKey);

//                 const decryptedMessage = await receiveMessage(
//                     storedUserAKeyPair.secretKey,
//                     newDhPublicKey,
//                     previousKeyA,
//                     encryptedMessage
//                 );
//                 console.log(`Decrypted Message ${i + 1}:`, decryptedMessage);
//                 if (decryptedMessage !== messages[i]) {
//                     console.error("Test failed: Messages do not match!");
//                 }

//                 previousKeyB = newDhPublicKey; // Update previous key for B
//             }
//         }

//         console.log("All tests passed: Messages match!");

//     } catch (error) {
//         console.error("Error during test execution:", error);
//     }
// };

// // Call the test function
// runTest();
