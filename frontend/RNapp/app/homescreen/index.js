import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Chats from '../chats';
import Friends from '../friend';

const HomeScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Chats');

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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${selectedTab}`}
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
      {selectedTab === 'Chats' ? <Chats /> : <Friends />}
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
    paddingBottom: 10, // Added padding
  },
  notificationButton: {
    padding: 10, // Added padding
  },
  profileButton: {
    padding: 10, // Added padding
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    marginBottom: 20, // Adjusted margin for better spacing
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
    marginBottom: 20, // Adjusted margin for better spacing
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
