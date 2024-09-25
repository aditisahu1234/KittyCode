import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';

const BASE_URL = "https://f2c3-106-221-156-149.ngrok-free.app"; // Replace with your actual base URL
const socket = io(BASE_URL, {
  autoConnect: false,  // Disable automatic connection for manual control
  reconnectionAttempts: 3,  // Retry 3 times to reconnect if disconnected
});

const ChatScreen = () => {
  const { userId, friendId, friendName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true); // Track if user is at the bottom of the chat
  const flatListRef = useRef(null); // Reference to the FlatList
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    console.log('userId:', userId, 'friendId:', friendId);

    const fetchChatRoom = async () => {
      if (!userId || !friendId) {
        console.warn('userId or friendId is missing');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/chats/room`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userId}`,  // Ensure token is passed
          },
          body: JSON.stringify({ friendId }),
        });

        const data = await response.json();
        setRoomId(data._id);
        socket.connect();
        socket.emit('joinRoom', data._id);  // Join room after fetching it
        fetchMessages(data._id);  // Fetch messages after joining room
      } catch (error) {
        console.log('Error fetching chat room:', error.message);
      }
    };

    fetchChatRoom();

    return () => socket.disconnect();  // Clean up socket on unmount
  }, [friendId]);

  const fetchMessages = async (roomId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/chats/${roomId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,  // Use the userId here
        },
      });
      const data = await response.json();

      setMessages(data);
    } catch (error) {
      console.log('Error fetching messages:', error.message);
    }
  };

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);

      if (isAtBottom) {
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    });

    return () => socket.off('receiveMessage');  // Clean up listener on unmount
  }, [isAtBottom]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height);  // Set the keyboard offset
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);  // Reset keyboard offset
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      console.warn('Message is missing');
      return;
    }

    if (!roomId) {
      console.warn('Room ID is missing');
      return;
    }

    const message = {
      sender: userId,  // Keep sender as userId
      text: inputMessage,
      timestamp: new Date(),
      isSender: true,  // Mark as sender since this user sent the message
    };

    console.log('Sending message:', message);
    socket.emit('sendMessage', { roomId, message });

    // Set the message immediately with isSender flag
    setMessages((prevMessages) => [...prevMessages, message]);

    setInputMessage('');  // Clear the input after sending the message

    // Scroll to bottom after sending a message
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsAtBottom(true);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageItem,
        item.isSender ? styles.myMessage : styles.receivedMessage,  // Use isSender flag
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;  // Adjust for better detection
    setIsAtBottom(isAtBottom);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({
      offset: messages.length * 100 + 50,  // Assuming average message height, add extra padding
      animated: true,
    });
    setIsAtBottom(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profilePic} />
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
          keyExtractor={(item) => item._id || item.id}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
          ref={flatListRef} // Add ref to FlatList
          onScroll={handleScroll} // Track scroll to detect user scrolling
          onContentSizeChange={() => {
            if (isAtBottom) flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        {!isAtBottom && (
          <TouchableOpacity style={styles.scrollToBottomButton} onPress={scrollToBottom}>
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
          />
          <TouchableOpacity style={styles.microphoneButton}>
            <MaterialIcons name="mic" size={24} color="#616BFC" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[styles.sendButton, (!roomId || !inputMessage.trim()) && { opacity: 0.5 }]}
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
  },
});

export default ChatScreen;
