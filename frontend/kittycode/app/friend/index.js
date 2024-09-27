import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BASE_URL = "https://666d-171-48-110-53.ngrok-free.app";

const Friends = ({ userId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [friends, setFriends] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error.message);
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ toUsername: username }),
      });
      const data = await response.json();
      if (response.status === 200) {
        Alert.alert('Invite Sent', `An invite has been sent to ${username}`);
        setIsModalVisible(false);
        setUsername('');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error sending friend request:', error);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => {
        router.push({
          pathname: '../chatscreen',
          params: { userId, friendId: item._id, friendName: item.name },
        });
      }}
    >
      <View style={styles.profilePic}></View>
      <View style={styles.friendDetails}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>Online</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no friends yet.</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Friend</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddFriend}>
              <Text style={styles.modalButtonText}>Send Invite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
    padding: 20,
  },
  friendItem: {
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
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  friendStatus: {
    fontSize: 14,
    color: '#ccc',
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
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#ff6347',
    borderRadius: 50,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  friendRequestItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  friendRequestText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default Friends;
