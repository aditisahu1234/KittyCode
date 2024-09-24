import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const ChatScreen = () => {
  const { friendId, friendName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Mock fetching chat messages
    setMessages([
      { id: '1', text: 'Hello!', sender: 'friend' },
      { id: '2', text: 'Hi there!', sender: 'me' },
    ]);
  }, [friendId]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { id: Date.now().toString(), text: inputMessage, sender: 'me' }]);
      setInputMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageItem, item.sender === 'me' && styles.myMessage]}>
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
        keyExtractor={(item) => item.id}
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
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
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
