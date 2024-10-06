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
  Keyboard 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';import { useLocalSearchParams } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { 
  getPrivateKey, 
  sendMessage, 
  receiveMessage 
} from '../utils/crypto';
import { decode as decodeBase64 } from '@stablelib/base64';  // Import decodeBase64 from stablelib
import * as Keychain from 'react-native-keychain';  // Add this
import { useRouter } from 'expo-router';

const BASE_URL = "https://b57d-122-163-78-156.ngrok-free.app";
const socket = io(BASE_URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
});

const ChatScreen = () => {
  const { userId, username, friendId, friendName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
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
      let privateKey; // Define privateKey within the scope of the function

      if (credentials && credentials.username === username) {
        privateKey = decodeBase64(credentials.password); // Decode the stored private key
        setUserPrivateKey(privateKey);  // Set the user's private key in state
        console.log('User private key:', privateKey);  // Log the private key
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
      setFriendPublicKey(friendPublicKeyUint8Array);
      
      if (!privateKey || !friendPublicKeyUint8Array) {
        console.error('Keys missing, cannot initialize chat.');
        return;
      }
      
      socket.connect();
      
      socket.connect();
      socket.emit('joinRoom', data._id);

      await fetchMessages(data._id, privateKey); // Use the privateKey here
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
              privateKey,  // Use the private key to decrypt the message
              message.senderPublicKey,
              null,
              message.encryptedText
            );
            return { ...message, text: decryptedMessage, isSender: message.sender === userId };
          } catch (decryptError) {
            console.error('Error decrypting message:', decryptError);
            return { ...message, text: 'Error decrypting message', isSender: message.sender === userId };
          }
        })
      );
  
      setMessages(decryptedMessages);
    } catch (error) {
      console.log('Error fetching messages:', error.message);
    }
  };
  

  useEffect(() => {
    if (!userPrivateKey) return;
  
    socket.on('receiveMessage', async (message) => {
      try {
        const decryptedMessage = await receiveMessage(
          userPrivateKey,  // Use the private key to decrypt the incoming message
          message.senderPublicKey,
          null,
          message.encryptedText
        );
  
        setMessages((prevMessages) => [...prevMessages, { ...message, text: decryptedMessage }]);
  
        if (isAtBottom) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error('Error handling received message:', error);
      }
    });
  
    return () => socket.off('receiveMessage');
  }, [isAtBottom, userPrivateKey]);
  

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
      const { encryptedMessage, newDhPublicKey } = await sendMessage(
        userPrivateKey,
        friendPublicKey,
        null,
        inputMessage
      );
  
      // Create a properly formatted message object
      const message = {
        sender: userId,
        encryptedText: encryptedMessage,
        timestamp: new Date().toISOString(),
        senderPublicKey: newDhPublicKey, // Make sure this is included
      };
  
      console.log('Sending encrypted message:', message);
      socket.emit('sendMessage', { roomId, message });
  
      // Add message to local state
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, text: inputMessage, isSender: true }
      ]);
      
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageItem,
      item.isSender ? styles.myMessage : styles.receivedMessage // Use isSender to decide the style
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
  

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
          <TouchableOpacity style={styles.attachmentButton}>
            <MaterialIcons name="add" size={24} color="#616BFC" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type here..."
            multiline
          />
          <TouchableOpacity style={styles.microphoneButton}>
            <MaterialIcons name="mic" size={24} color="#616BFC" />
          </TouchableOpacity>
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
        </View>
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
