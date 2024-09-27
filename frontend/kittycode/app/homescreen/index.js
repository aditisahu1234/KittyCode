// File: screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router'; // Ensure to import Link
import Chats from '../chats';
import Friends from '../friend';
import { useFonts } from 'expo-font';

const HomeScreen = () => {
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });
  const { userId, username } = useLocalSearchParams(); // Fetching userId and username
  const [selectedTab, setSelectedTab] = useState('Chats');
  const [menuVisible, setMenuVisible] = useState(false); // For controlling the 3-dot menu visibility

  // Handle missing userId
  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'No user ID found. Please log in again.');
    }
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            {/* Navigate to Profile using Link */}
            <Link href="/profile" asChild>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
            </Link>

            {/* Navigate to Notification using Link */}
            <Link href={{ pathname: '/notification', params: { userId } }} asChild>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuItemText}>Notification</Text>
              </TouchableOpacity>
            </Link>

          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header with App Name and Menu Icon */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>KittyCode</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs for Navigation */}
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

      {/* Content Rendering Based on Selected Tab */}
      {selectedTab === 'Chats' ? (
        <Chats userId={userId} />
      ) : (
        <Friends userId={userId} />
      )}
    </SafeAreaView>
  );
};

// Styles for the HomeScreen component
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#616BFC',
    padding: 20,
  },
  welcomeContainer: {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 26,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 3,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    marginRight: 10,
  },
  icon: {
    marginRight: 15,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 20,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: 150,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
});

export default HomeScreen;
