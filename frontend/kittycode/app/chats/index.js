import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { openRealm } from '../utils/realmManager';

const MessagesScreen = ({ userId, username }) => {
  const router = useRouter();
  const [messagesData, setMessagesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages from the backend
  useEffect(() => {
    const fetchChatsFromRealm = async () => {
      try {
        const realm = await openRealm();
    
        // Fetch all friends
        const friends = realm.objects('Friend').filtered('userId == $0', userId);
    
        // Fetch the latest message for each friend based on roomId
        const chatData = friends.map((friend) => {
          const latestMessage = realm
            .objects('Message')
            .filtered('roomId == $0', friend.roomId)
            .sorted('timestamp', true)[0];  // Get the latest message by sorting by timestamp
    
          return latestMessage ? {
            friendId: friend._id,
            friendName: friend.name,
            avatar: friend.avatar || 'https://via.placeholder.com/50',
            lastMessage: {
              encryptedText: latestMessage.text,
              timestamp: latestMessage.timestamp,
            },
            unread: false, // You might need to add logic for unread status
          } : null;
        }).filter(Boolean); // Remove null entries (chats without messages)
    
        // Sort chatData by the most recent message
        chatData.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
    
        setMessagesData(chatData);
      } catch (error) {
        console.error('Error fetching chat data from Realm:', error);
        Alert.alert('Error', 'Failed to fetch chats.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchChatsFromRealm(); // Call the new function
  }, [userId]);
  

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  };

  // Render each message item in the list
  // Render each message item in the list
const renderMessageItem = ({ item }) => (
  <TouchableOpacity
    style={styles.messageItem}
    onPress={() => router.push({
      pathname: '../chatscreen',
      params: { userId,username, friendId: item.friendId, friendName: item.friendName },
    })}
  >
    {/* Profile Picture */}
    <Image source={{ uri: item.avatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />

    {/* Message Details */}
    <View style={styles.messageDetails}>
      <Text style={styles.name}>{item.friendName}</Text>
      <Text style={styles.lastMessage} numberOfLines={1}>
        {item.lastMessage?.encryptedText || 'No messages yet'}  {/* Ensure lastMessage is a string */}
      </Text>
    </View>

    {/* Time and Unread Indicator */}
    <View style={styles.messageMeta}>
      <Text style={styles.time}>
        {item.lastMessage ? formatTimestamp(item.lastMessage.timestamp) : ''}
      </Text>
      {item.unread && <View style={styles.unreadIndicator} />}
    </View>
  </TouchableOpacity>
);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Chats...</Text>
      </View>
    );
  }

  if (messagesData.length === 0) {
    return (
      <View style={styles.noChatsContainer}>
        <Text style={styles.noChatsText}>No chats available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messagesData}
        // keyExtractor={(item) => item._id || item.id}
        keyExtractor={(item) => item.friendId}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
  },
  messageList: {
    padding: 10,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6E3CB5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageDetails: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#ddd',
    fontSize: 14,
  },
  messageMeta: {
    alignItems: 'flex-end',
  },
  time: {
    color: '#ddd',
    fontSize: 12,
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5CE58A',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default MessagesScreen;
