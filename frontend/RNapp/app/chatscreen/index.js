import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';

const BASE_URL = "https://f2c3-106-221-156-149.ngrok-free.app"; // Replace with your actual base URL
const socket = io(BASE_URL); // Connect to WebSocket server

const ChatScreen = () => {
  const { userId, friendId, friendName } = useLocalSearchParams();  // Retrieve userId here
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    console.log('userId:', userId, 'friendId:', friendId);  // Debug: Check userId and friendId
    const fetchChatRoom = async () => {
      if (!userId || !friendId) {
        console.warn('userId or friendId is missing');  // Warn if missing
        return;
      }
  
      try {
        const response = await fetch(`${BASE_URL}/api/chats/room`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userId}`,  // Ensure token is passed
          },
          body: JSON.stringify({ friendId }),  // Pass only friendId to backend
        });
  
        const data = await response.json();
        console.log('Room ID fetched:', data._id);  // Debug: Ensure roomId is valid
  
        if (data._id) {
          setRoomId(data._id);  // Set the room ID for the chat
          socket.emit('joinRoom', data._id);  // Join the room after fetching it
          fetchMessages(data._id);  // Fetch the messages for this room
        } else {
          console.warn('Room ID not received from backend');
        }
      } catch (error) {
        console.log('Error fetching chat room:', error.message);
      }
    };
  
    fetchChatRoom();
  
    return () => {
      socket.disconnect();  // Disconnect socket on component unmount
    };
  }, [friendId]);

  // Fetch existing messages
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

  // Handle incoming messages in real-time
  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('Received message:', message);  // Debug: Check received message
      setMessages((prevMessages) => [...prevMessages, message]);  // Append the message to chat
    });

    return () => {
      socket.off('receiveMessage');  // Clean up listener on unmount
    };
  }, []);

  // Handle sending message on the client
  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      console.warn('Message is missing');  // Check if message is empty
      return;
    }

    if (!roomId) {
      console.warn('Room ID is missing');  // Check if roomId is missing
      return;
    }

    const message = {
      sender: userId,
      text: inputMessage,
      timestamp: new Date(),
    };

    console.log('Sending message:', message);  // Debug: Log the message being sent

    // Emit the message to the server
    socket.emit('sendMessage', { roomId, message });

    // Optimistically update the chat
    setMessages((prevMessages) => [...prevMessages, message]);

    // Clear input field
    setInputMessage('');
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageItem, item.sender === userId && styles.myMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

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
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id || item.id}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
      />
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
          disabled={!roomId || !inputMessage.trim()}  // Disable button if no message or roomId
        >
          <AntDesign name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
});

export default ChatScreen;
