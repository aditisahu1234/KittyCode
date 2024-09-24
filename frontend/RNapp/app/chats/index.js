import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const Chats = () => {
  const renderItem = ({ item }) => (
    <View style={styles.chatItem}>
      <View style={styles.profilePic}></View>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage}>{item.message}</Text>
      </View>
      <Text style={styles.chatTime}>{item.time}</Text>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={[]}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no chats yet.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4c50a5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatMessage: {
    fontSize: 14,
    color: '#ccc',
  },
  chatTime: {
    fontSize: 12,
    color: '#aaa',
  },
  unreadBadge: {
    backgroundColor: '#ff0000',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default Chats;
