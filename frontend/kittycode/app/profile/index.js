// File: screens/ProfileScreen.js

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icons for settings and log out
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router'; // Use expo-router for navigation

const ProfileScreen = () => {
  const router = useRouter(); // Access the router for navigation

  // Load fonts (optional)
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const userName = "John Doe"; // Placeholder username, you can replace it with dynamic user data
  const userProfilePic = "https://via.placeholder.com/150"; // Placeholder profile image URL

  // Handle logout and navigate to the splash screen
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          onPress: () => {
            // Navigate to the splash screen
            router.replace('../splash'); // Replaces the current screen with the splash screen
          }
        }
      ]
    );
  };

  // Handle navigation to Settings (Replace this with actual navigation logic)
  const handleSettings = () => {
    Alert.alert("Settings", "Navigate to Settings screen.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profilePicContainer}>
        <Image source={{ uri: userProfilePic }} style={styles.profilePic} />
      </View>

      {/* User Name */}
      <Text style={styles.userName}>{userName}</Text>

      {/* Settings Button */}
      <TouchableOpacity style={styles.button} onPress={handleSettings}>
        <Ionicons name="settings-outline" size={24} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>

      {/* Log Out Button */}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Styles for the Profile Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  profilePicContainer: {
    marginBottom: 20,
    borderRadius: 100,
    overflow: 'hidden',
    width: 150,
    height: 150,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4048DA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
  },
  logoutButton: {
    backgroundColor: '#FF3B30', // Red color for logout
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
});

export default ProfileScreen;
