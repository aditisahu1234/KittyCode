import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Button } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { openRealm } from '../utils/realmManager';

const BASE_URL = "http://3.26.156.142:3000";


const Friends = ({ userId, username }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [friends, setFriends] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false); // For refresh
  const router = useRouter();

  useEffect(() => {
    loadFriendsFromRealm();  // Load friends from Realm on mount
  }, [userId]);

  const loadFriendsFromRealm = async() => {
    const realm = await openRealm();
    const savedFriends = realm.objects('Friend').filtered('userId == $0', userId);
    console.log(savedFriends);
    setFriends(Array.from(savedFriends)); // Load friends from Realm
  };

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
      const fetchedFriends = data.friends || [];

      console.log("Fetched Friends:", fetchedFriends);

      updateRealmWithNewFriends(fetchedFriends); // Update Realm with new friends

    } catch (error) {
      console.error('Error fetching friends:', error.message);
    }
  };

  const updateRealmWithNewFriends = async (fetchedFriends) => {
    const realm = await openRealm();
    realm.write(() => {
      // Compare and update Realm data
      fetchedFriends.forEach((fetchedFriend) => {
        const existingFriend = realm.objectForPrimaryKey('Friend', fetchedFriend._id);
        if (!existingFriend) {
          // If the friend doesn't exist in Realm, add it
          realm.create('Friend', {
            _id: fetchedFriend._id,
            userId: userId, // Add this line to associate the friend with the current user
            name: fetchedFriend.name,
            status: 'Online',  // Default to 'Online', you can update with real status
            roomId: fetchedFriend.roomId || null, // Add roomId if available
          });
        } else if (existingFriend.name !== fetchedFriend.name || existingFriend.roomId !== fetchedFriend.roomId) {
          existingFriend.name = fetchedFriend.name;
          if (fetchedFriend.roomId) {
            existingFriend.roomId = fetchedFriend.roomId;
          }
        }
      });

      // Remove friends from Realm if they are not in the fetched list
      const savedFriends = realm.objects('Friend');
      savedFriends.forEach((savedFriend) => {
        if (!fetchedFriends.find(friend => friend._id === savedFriend._id)) {
          realm.delete(savedFriend);
        }
      });
    });

    // Update the friends state from the updated Realm data
    loadFriendsFromRealm();
  };

  const handleAddFriend = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ toUsername: friendUsername }),
      });
      const data = await response.json();
      if (response.status === 200) {
        Alert.alert('Invite Sent', `An invite has been sent to ${friendUsername}`);
        setIsModalVisible(false);
        setFriendUsername('');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error sending friend request:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFriends();  // Fetch the updated friend list and update Realm
    setIsRefreshing(false);
  };

  // Sequential rendering with setTimeout for each friend
  const renderFriendsOneByOne = () => {
    let index = 0;
    const renderNext = () => {
      if (index < friends.length) {
        setTimeout(() => {
          setFriends(prev => [...prev, friends[index]]);
          index++;
          renderNext();
        }, 50);  // Render each friend after 50ms
      }
    };
    renderNext();
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => {
        router.push({
          pathname: '../chatscreen',
          params: { userId, username, friendId: item._id, friendName: item.name , roomId: item.roomId },
        });
      }}
    >
      <View style={styles.profilePic}></View>
      <View style={styles.friendDetails}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>{item.status}</Text>
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
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={handleRefresh} 
        disabled={isRefreshing}
      >
        <AntDesign name="reload1" size={24} color="#fff" />
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
              value={friendUsername}
              onChangeText={setFriendUsername}
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
  refreshButton: {
  position: 'absolute',
  bottom: 100,  // Positioned above the add friend button
  right: 30,
  backgroundColor: '#4CAF50',
  borderRadius: 50,
  padding: 15,
  justifyContent: 'center',
  alignItems: 'center',
  },

});

export default Friends;
