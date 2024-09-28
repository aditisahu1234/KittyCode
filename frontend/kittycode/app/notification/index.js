import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useLocalSearchParams, useRouter  } from 'expo-router';

const BASE_URL = "http://3.26.156.142:3000";

const NotificationScreen = () => {
  const { userId } = useLocalSearchParams(); 
  const router = useRouter();  // Initialize useRouter for navigation
  const [friendRequests, setFriendRequests] = useState([]);

  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/friends/requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });
      const data = await response.json();
      setFriendRequests(data || []);
    } catch (error) {
      console.log('Error fetching friend requests:', error);
    }
  };

  const acceptRequest = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ requestId: id }),
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Friend request accepted');
        fetchFriendRequests(); // Refresh the list
      }
    } catch (error) {
      console.log('Error accepting friend request:', error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/friends/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ requestId: id }),
      });
      if (response.status === 200) {
        Alert.alert('Rejected', 'Friend request rejected');
        fetchFriendRequests(); // Refresh the list
      }
    } catch (error) {
      console.log('Error rejecting friend request:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homescreen')}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Notifications</Text>

      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.friendRequestCard}>
            <Image source={{ uri: item.from.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.from.name}</Text>
              <Text style={styles.message}>sent you a friend request</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptRequest(item._id)}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => rejectRequest(item._id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
    paddingHorizontal: 20,
    paddingTop: 50, // Top padding for status bar area
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontFamily:"Poppins-SemiBold",
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  friendRequestCard: {
    flexDirection: 'row',
    backgroundColor: '#6E3CB5', // Card background color
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#5CE58A', // Green button
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#FF6E6E', // Red button
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 14,
    color: '#4B1D9B',
    fontWeight: 'bold',
  },
});

export default NotificationScreen;