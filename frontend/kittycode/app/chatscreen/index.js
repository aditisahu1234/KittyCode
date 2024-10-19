import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard,
  PermissionsAndroid,
  Animated,
  Alert, 
  Linking,
  InteractionManager
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';import { useLocalSearchParams } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { Audio } from 'expo-av';  // For audio recording
import io from 'socket.io-client';
import { 
  getPrivateKey, 
  sendMessage, 
  receiveMessage 
} from '../utils/crypto';
import { encode as encodeBase64 ,decode as decodeBase64 } from '@stablelib/base64';  // Import decodeBase64 from stablelib
import * as Keychain from 'react-native-keychain';  // Add this
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { openRealm } from '../utils/realmManager';


const saveMessageToRealm = async (message, userId) => {
  const realm = await openRealm();
  try {
    console.log('Attempting to save message to Realm:', message); // Logging the message before saving

    realm.write(() => {
      realm.create('Message', {
        _id: message._id,              // Ensure unique message ID
        userId: userId,                // Associate message with the current user
        roomId: message.roomId,         // Room ID of the chat
        senderId: message.senderId,     // Username instead of userId
        text: message.text || null,     // Decrypted message text or null for files
        file: message.file || null,     // Base64-encoded file data
        fileName: message.fileName || null, // File name
        fileType: message.fileType || null, // File type
        timestamp: new Date(message.timestamp),  // Message timestamp
        isSender: message.isSender,     // Indicates if this message was sent by the user
        type: message.type || 'text'    // Determine if it's a 'text', 'image', or 'file'
      }, 'modified');  // 'modified' ensures existing entries are updated
    });

    console.log(`Message saved to Realm: ${message.text || message.fileName}`); // Confirm message was saved
  } catch (error) {
    console.error('Error saving message to Realm:', error); // Log any errors during save
  }
};


const getMessagesFromRealm = async (roomId, userId) => {
  const realm = await openRealm();

  try {
    const messages = realm.objects('Message').filtered('roomId == $0', roomId).sorted('timestamp');

    console.log('Retrieved messages from Realm:', messages.map(m => m.text || m.fileName)); // Log retrieved messages

    const result = messages.map((msg) => ({
      _id: msg._id,
      userId: userId,                // Associate message with the current user
      roomId: msg.roomId,
      senderId: msg.senderId,        // This will be `username` now
      text: msg.text || null,        // Handle text or null for file messages
      file: msg.file || null,        // Base64-encoded file data (null if not a file)
      fileName: msg.fileName || null, // File name (for file messages)
      fileType: msg.fileType || null, // File type (for file messages)
      timestamp: msg.timestamp,
      isSender: msg.isSender,        // Indicates if this message was sent by the user
      type: msg.type || 'text',      // Either 'text', 'image', or 'file'
    }));

    return result;
  } catch (error) {
    console.error('Error retrieving messages from Realm:', error); // Log any errors during retrieval
    return [];
  } 
};

// Clear all messages from Realm (if needed)
const clearMessagesFromRealm = async (roomId) => {
  const realm = await openRealm();
  realm.write(() => {
    const messagesToDelete = realm.objects('Message').filtered('roomId == $0', roomId);
    realm.delete(messagesToDelete);
  });
};

const markMessageAsSent = async (roomId, messageId, userId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/chats/${roomId}/messages/${messageId}/sent`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userId}`,  // Assuming you are using JWT for auth
      },
    });

    if (!response.ok) {
      console.error('Failed to mark message as sent');
    } else {
      console.log(`Message ${messageId} marked as sent`);
    }
  } catch (error) {
    console.error('Error marking message as sent:', error);
  }
};


const BASE_URL = "https://4d6a-2401-4900-3de6-9762-1181-3588-71f2-7985.ngrok-free.app";
const socket = io(BASE_URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
});

const ChatScreen = () => {
  const { userId, username, friendId, friendName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);  // State for plus button options
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState(null);  // State for audio recording
  const [isRecording, setIsRecording] = useState(false);  // To track recording state
  const [pulseAnim] = useState(new Animated.Value(1));  // For pulsating animation
  const timerRef = useRef(null);  // Reference for the recording timer
  const [roomId, setRoomId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [userPrivateKey, setUserPrivateKey] = useState(null);  // User's private key
  const [friendPublicKey, setFriendPublicKey] = useState(null);  // Friend's public key
  const flatListRef = useRef(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!userId || !friendId || !username) {
        console.warn('userId, friendId, or username is missing');
        return;
      }
  
      try {
        console.log('Initializing chat room for user:', userId, ' with name :', username, ' with friend:', friendId);
  
        const credentials = await Keychain.getGenericPassword();
        let privateKey;
  
        if (credentials && credentials.username === username) {
          privateKey = decodeBase64(credentials.password); // Decode stored private key
          setUserPrivateKey(privateKey);
          console.log('User private key:', privateKey);
        } else {
          console.error('No private key found for the user.');
          return;
        }
  
        const response = await fetch(`${BASE_URL}/api/chats/room`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userId}`,
          },
          body: JSON.stringify({ friendId }),
        });
  
        const data = await response.json();
  
        if (!data._id || !data.friendPublicKey) {
          console.error('Failed to retrieve room ID or friend public key:', data);
          alert(data.message); 
          return;
        }
  
        console.log('Friend public key received:', data.friendPublicKey);
  
        const friendPublicKeyUint8Array = decodeBase64(data.friendPublicKey);
        setRoomId(data._id);

        const realm = await openRealm();
          realm.write(() => {
            const friend = realm.objectForPrimaryKey('Friend', friendId);
            if (friend) {
              friend.roomId = data._id;
            }
          });
          
        setFriendPublicKey(friendPublicKeyUint8Array);
        
        if (!privateKey || !friendPublicKeyUint8Array) {
          console.error('Keys missing, cannot initialize chat.');
          return;
        }
  
        // Load messages from Realm first
        const localMessages = await getMessagesFromRealm(data._id, userId);
        setMessages(localMessages);
  
        socket.connect();
        socket.emit('joinRoom', data._id);
  
        // Fetch new messages from server after loading local ones
        await fetchMessages(data._id, privateKey);
      } catch (error) {
        console.error('Error initializing chat room:', error.message);
      }
    };
  
    initializeChatRoom();
  
    return () => socket.disconnect();
  }, [userId, friendId, username]);
  

  
  const fetchMessages = async (roomId, privateKey) => {
    if (!privateKey) {
      console.error('Private key not available');
      return;
    }
  
    try {
      const response = await fetch(`${BASE_URL}/api/chats/${roomId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });
  
      const encryptedMessages = await response.json();
      if (!Array.isArray(encryptedMessages)) {
        console.warn('Invalid response for messages:', encryptedMessages);
        return;
      }
  
      const decryptedMessages = await Promise.all(
        encryptedMessages.map(async (message) => {
          try {
            const decryptedMessage = await receiveMessage(
              privateKey,
              message.senderPublicKey,
              null,
              message.encryptedText
            );
  
            // For locally storing, use the username instead of userId
            const messageForLocal = {
              ...message,
              text: decryptedMessage,
              senderId: message.sender === userId ? username : message.sender,  // Map userId to username locally
              isSender: message.sender === userId,     // Indicates if this message was sent by the user
            };
  
            // Save the decrypted message to Realm with `username`
            await saveMessageToRealm({
              ...messageForLocal,
              roomId: roomId,
              timestamp: message.timestamp,
            },userId);
            
            // If the message status is still pending, mark it as sent
          if (message.status === 'pending') {
            await markMessageAsSent(roomId, message._id, userId);
          }
          
            return messageForLocal;
          } catch (decryptError) {
            console.error('Error decrypting message:', decryptError);
            return { ...message, text: 'Error decrypting message', isSender: message.sender === userId };
          }
        })
      );
  
      // Update state with new decrypted messages
      setMessages((prevMessages) => [...prevMessages, ...decryptedMessages]);
    } catch (error) {
      console.log('Error fetching messages:', error.message);
    }
  };
  
  useEffect(() => {
    if (!userPrivateKey) return;
  
    socket.on('receiveMessage', async (message) => {
      try {
        console.log('Message received from server:', message);
  
        // Decrypt the incoming message
        const decryptedMessage = await receiveMessage(
          userPrivateKey,
          message.senderPublicKey,
          null,
          message.encryptedText
        );

        console.log('Decrypted message:', decryptedMessage);


        let finalMessage;
        if (message.type === 'file') {
          // Parse the decrypted file data
          const fileData = JSON.parse(decryptedMessage);
          finalMessage = {
            _id: message._id,
            roomId: roomId,
            senderId: message.sender,
            text: fileData.file,
            fileName: message.fileName,
            fileType: message.fileType,
            timestamp: message.timestamp,
            isSender: false,
            type: 'file'
          };
        } else {
          // Handle other message types as before
          finalMessage = {
            _id: message._id,
            roomId: roomId,
            senderId: message.sender,
            text: decryptedMessage,
            timestamp: message.timestamp,
            isSender: false,
            type: message.type || 'text'
          };
        }
  
        // Save the decrypted message to Realm
        // await saveMessageToRealm(messageForLocal);
        await saveMessageToRealm(finalMessage, userId);
        console.log(`Marking message as sent - roomId: ${roomId}, messageId: ${message._id}`);

        setMessages(prevMessages => [...prevMessages, finalMessage]);
        // Notify the backend that the message has been received and decrypted

        if (isAtBottom) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }

        await markMessageAsSent(roomId, message._id, userId);  // Call function to mark message as sent
  
        
      } catch (error) {
        console.error('Error decrypting message:', error);
      }
    });
  
    return () => socket.off('receiveMessage');
  }, [userId,isAtBottom, userPrivateKey, roomId]);
  
    // Add roomId as a dependency
  

  // Send Text Message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      console.warn('Message is missing');
      return;
    }

    if (!roomId || !userPrivateKey || !friendPublicKey) {
      console.warn('Room ID, private key, or friend public key is missing');
      return;
    }

    try {
      console.log('Encrypting message:', inputMessage);

      // Perform encryption in the background
      InteractionManager.runAfterInteractions(async () => {
        const { encryptedMessage, newDhPublicKey } = await sendMessage(
          userPrivateKey,
          friendPublicKey,
          null,
          inputMessage
        );

        const messageForServer = {
          _id: Date.now().toString(), // Unique ID for message
          roomId: roomId,
          sender: userId,
          encryptedText: encryptedMessage,
          timestamp: new Date().toISOString(),
          senderPublicKey: newDhPublicKey,
          type: 'text'
        };

        console.log('Sending encrypted message to server:', messageForServer);
        socket.emit('sendMessage', { roomId, message: messageForServer });

        const messageForLocal = {
          _id: messageForServer._id,
          userId: userId,             // Include userId here
          roomId: roomId,
          senderId: username,
          text: inputMessage,
          timestamp: messageForServer.timestamp,
          isSender: true,
          type: 'text'
        };

        await saveMessageToRealm(messageForLocal, userId);
        setMessages((prevMessages) => [...prevMessages, messageForLocal]);
        setInputMessage('');
      });

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleSendImage = async (base64Image) => {
    if (!roomId || !userPrivateKey || !friendPublicKey) {
      console.warn('Room ID, private key, or friend public key is missing');
      return;
    }

    try {
      // Perform the heavy encryption process in the background
      InteractionManager.runAfterInteractions(async () => {
        console.log('Encrypting message:', base64Image);

        // Asynchronously encrypt the image
        const { encryptedMessage, newDhPublicKey } = await sendMessage(
          userPrivateKey,
          friendPublicKey,
          null,
          base64Image
        );

        const messageForServer = {
          _id: Date.now().toString(), // Unique ID for message
          roomId: roomId,
          sender: userId,
          encryptedText: encryptedMessage,
          timestamp: new Date().toISOString(),
          senderPublicKey: newDhPublicKey,
          type: 'image'
        };

        console.log('Sending encrypted image message to server:', messageForServer);
        socket.emit('sendMessage', { roomId, message: messageForServer });

        // Save to Realm for immediate display (unencrypted locally)
        const messageForLocal = {
          _id: messageForServer._id,
          userId: userId,             // Include userId here
          roomId: roomId,
          senderId: username,
          text: base64Image,  // Save base64 image directly for display
          timestamp: messageForServer.timestamp,
          isSender: true,
          type: 'image'
        };

        await saveMessageToRealm(messageForLocal, userId);
        setMessages((prevMessages) => [...prevMessages, messageForLocal]);
      });

    } catch (error) {
      console.error('Error sending image:', error);
    }
  };


  const handleSendFile = async (base64File, fileName, fileType) => {
    if (!roomId || !userPrivateKey || !friendPublicKey) {
      console.warn('Room ID, private key, or friend public key is missing');
      return;
    }

    try {
      console.log('File size (bytes):', base64File.length);

      // Offload file processing to background thread
      InteractionManager.runAfterInteractions(async () => {
        console.log('Encrypting file message...');
        const fileData = {
          file: base64File,
          fileName: fileName,
          fileType: fileType
        };

        const fileDataString = JSON.stringify(fileData);
        const { encryptedMessage, newDhPublicKey } = await sendMessage(
          userPrivateKey,
          friendPublicKey,
          null,
          fileDataString
        );

        const messageForServer = {
          _id: Date.now().toString(),
          roomId: roomId,
          sender: userId,
          encryptedText: encryptedMessage,
          timestamp: new Date().toISOString(),
          senderPublicKey: newDhPublicKey,
          type: 'file',
          fileName: fileName,
          fileType: fileType
        };

        console.log('Sending encrypted file message to server...');
        socket.emit('sendMessage', { roomId, message: messageForServer }, (ack) => {
          if (ack && ack.error) {
            console.error('Error from server:', ack.error);
          } else {
            console.log('File message sent successfully');
          }
        });

        // Save to Realm for immediate display
        const messageForLocal = {
          _id: messageForServer._id,
          userId: userId,             // Include userId here
          roomId: roomId,
          senderId: username,
          text: base64File,
          timestamp: messageForServer.timestamp,
          isSender: true,
          type: 'file',
          fileName: fileName,
          fileType: fileType
        };

        await saveMessageToRealm(messageForLocal, userId);
        setMessages(prevMessages => [...prevMessages, messageForLocal]);
        console.log('File message processed successfully');
      });

    } catch (error) {
      console.error('Error sending file:', error);
      Alert.alert('Error', 'Failed to send file. Please try again.');
    }
  };

  const renderMessage = ({ item }) => {
    const handleFilePress = async () => {
      if (item.type === 'file') {
        try {
          // First, we need to save the base64 file to a temporary location
          const filePath = `${RNFS.CachesDirectoryPath}/${item.fileName}`;
          await RNFS.writeFile(filePath, item.text, 'base64');
  
          // Now we can open the file
          await FileViewer.open(filePath, { showOpenWithDialog: true });
        } catch (error) {
          console.error('Error opening file:', error);
          Alert.alert('Error', 'Could not open the file.');
        }
      }
    };
  
    return (
      <TouchableOpacity onPress={handleFilePress}>
        <View style={[
          styles.messageItem,
          item.isSender ? styles.myMessage : styles.receivedMessage
        ]}>
          {item.type === 'image' ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.text}` }}
              style={styles.messageImage}
            />
          ) : item.type === 'file' ? (
            <View style={styles.fileMessage}>
              <View style={styles.fileInfo}>
                <MaterialIcons name="attach-file" size={24} color="#616BFC" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{item.fileName}</Text>
                  <Text style={styles.fileType}>{item.fileType}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  
  
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = 
      contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;
    setIsAtBottom(isAtBottom);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsAtBottom(true);
  };

  const insets = useSafeAreaInsets();

  // Function to handle file selection and sending
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // Allow all file types
      });
      const fileUri = result[0].uri;
      console.log('Selected file URI:', fileUri);  // Debug log the URI
      const fileName = result[0].name;
      const fileType = result[0].type; // e.g., 'application/pdf'

      console.log('Selected file:', fileName, fileType);

      // Convert file to Base64
      const base64File = await convertToBase64(fileUri);

      // Send the file
      handleSendFile(base64File, fileName, fileType);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled file picker');
      } else {
        console.error('File picking error:', err);
      }

    }
  };


  // Function to handle image selection
  const handleImageSelect = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.error('Image picker error:', response.errorMessage);
      } else {
        const selectedImage = response.assets[0];

          // Compress or resize image before conversion to base64
        const resizedImage = await ImageResizer.createResizedImage(
          selectedImage.uri,
          800,    // New width (reduce the size)
          800,    // New height
          'JPEG', // Format
          80      // Quality (0 to 100)
        );

        const base64Image = await convertToBase64(resizedImage.uri); // Convert resized image to base64
        handleSendImage(base64Image); // Encrypt and send the resized base64 image
      }
    });
  };

  const convertToBase64 = async (uri) => {
    try {
      const base64 = await RNFS.readFile(uri, 'base64');
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
    }
  };

  // Function to handle video selection
  const handleVideoSelect = async () => {
    launchImageLibrary({ mediaType: 'video' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.errorMessage) {
        console.error('Video picker error:', response.errorMessage);
      } else {
        console.log('Selected video: ', response.assets);
        // You can now send this video in your message
      }
    });
  };

  //Audio Permission
  const getAudioPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message:
              'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } 
      return true; // For iOS, permission is handled differently.
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Start pulsating animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
  };


  const startRecording = async () => {
    try {
      // If a recording is already in progress, stop it before starting a new one
      if (recording) {
        if (recording.isRecording) {
          console.warn('A recording is already in progress, stopping the current recording...');
          await stopRecording();  // Stop and reset before starting new recording
        }
      }
  
      const hasPermission = await getAudioPermissions();
      if (!hasPermission) {
        console.error('Audio recording permissions not granted');
        return;
      }
  
      console.log('Starting recording...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      const newRecording = new Audio.Recording(); // Create a new instance
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync(); // Start recording
      setRecording(newRecording); // Store the recording instance in state
      setIsRecording(true);
      setRecordingDuration(0);
      startPulseAnimation();
  
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prevDuration => prevDuration + 1);
      }, 1000);
  
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };
  
  
  const stopRecording = async () => {
    if (!recording) {
      console.warn('No active recording to stop');
      return;
    }
  
    try {
      console.log('Stopping recording...');
      clearInterval(timerRef.current);  // Stop the timer
      setRecordingDuration(0);  // Reset timer
      setIsRecording(false);
      stopPulseAnimation();
  
      await recording.stopAndUnloadAsync(); // Stop and unload the recording
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
  
      // Reset the recording state to null only after fully stopping
      setRecording(null); 
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };
  
  

  // Convert seconds to MM:SS format
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/40' }} 
          style={styles.profilePic} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.friendName}>{friendName}</Text>
          <Text style={styles.status}>Online</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="phone" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="videocamera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id || String(item.timestamp)}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
          ref={flatListRef}
          onScroll={handleScroll}
          onContentSizeChange={() => {
            if (isAtBottom) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />

        {!isAtBottom && (
          <TouchableOpacity 
            style={styles.scrollToBottomButton} 
            onPress={scrollToBottom}
          >
            <MaterialIcons name="arrow-downward" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={() => setIsOptionsVisible(!isOptionsVisible)}
            >
              <MaterialIcons name="add" size={24} color="#616BFC" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type here..."
            multiline
          />

          {/* Pulsating microphone button */}
          <Animated.View style={[styles.microphoneButton, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity 
              onPress={recording ? stopRecording : startRecording}
            >
              <MaterialIcons name={recording ? "stop" : "mic"} size={24} color={isRecording ? "#ff4d4d" : "#616BFC"} />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity 
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              (!roomId || !inputMessage.trim()) && { opacity: 0.5 }
            ]}
            disabled={!roomId || !inputMessage.trim()}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Options menu for file/image/video selection */}
          {isOptionsVisible && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={handleFileSelect}>
                <MaterialIcons name="attach-file" size={24} color="#616BFC" />
                <Text>File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleImageSelect}>
                <MaterialIcons name="photo" size={24} color="#616BFC" />
                <Text>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleVideoSelect}>
                <MaterialIcons name="videocam" size={24} color="#616BFC" />
                <Text>Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Show the timer when recording */}
        {isRecording && (
          <View style={styles.recordingTimerContainer}>
            <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#616BFC',
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  status: {
    color: '#D3D3D3',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatListContent: {
    paddingVertical: 10,
  },
  messageItem: {
    maxWidth: '70%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  // New styles for image messages
  messageImage: {
    width: 200,        // Adjust width to your needs
    height: 200,       // Adjust height to your needs
    borderRadius: 15,  // Keep it consistent with the rounded corners
    marginTop: 5,      // Add margin to separate image from other message content
    resizeMode: 'cover',  // Ensures the image covers the given area
  },
  fileMessage: {
    padding: 10,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    marginLeft: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  fileType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 30,
  },
  microphoneButton: {
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#616BFC',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
  },
  optionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingTimerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    marginVertical: 5,
    position: 'absolute',
    bottom: 100, // Adjust the position above the input bar
    alignSelf: 'center',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  microphoneButton: {
    padding: 10,
    // Style for microphone button with dynamic scaling
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#616BFC',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ChatScreen;
