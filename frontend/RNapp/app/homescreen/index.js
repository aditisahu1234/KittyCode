import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Chats from '../chats';
import Friends from '../friend';

const HomeScreen = () => {
  const { userId, username } = useLocalSearchParams(); // Fetching userId and username
  const [selectedTab, setSelectedTab] = useState('Chats');

  // Handle missing userId
  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'No user ID found. Please log in again.');
      // Here you could navigate to the login screen if userId is missing
    }
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.notificationButton}>
          <AntDesign name="notification" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <AntDesign name="user" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeContainer}>
        {/* Conditional rendering to ensure username is valid */}
        <Text style={styles.welcomeText}>
          {username ? `Welcome, ${username}` : 'Welcome!'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${selectedTab ? selectedTab : ''}`}
          placeholderTextColor="#aaa"
        />
        <AntDesign name="search1" size={20} color="#aaa" style={styles.searchIcon} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Chats' && styles.activeTab]}
          onPress={() => setSelectedTab('Chats')}
        >
          <Text style={styles.tabText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Friends' && styles.activeTab]}
          onPress={() => setSelectedTab('Friends')}
        >
          <Text style={styles.tabText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Calls</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional rendering for Chats and Friends */}
      {selectedTab === 'Chats' ? (
        <Chats userId={userId} />
      ) : (
        <Friends userId={userId} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  notificationButton: {
    padding: 10,
  },
  profileButton: {
    padding: 10,
  },
  welcomeContainer: {
    marginBottom: 10,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    marginRight: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ffd700',
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default HomeScreen;
