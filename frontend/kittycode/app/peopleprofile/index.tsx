import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Switch, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function UserProfileScreen() {
  return (
    <LinearGradient
      colors={['#5B86E5', '#36D1DC']}
      style={styles.container}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <AntDesign name="arrowleft" size={responsiveSize(24)} color="#ff66ff" />
        </TouchableOpacity>
        <Text style={styles.profileTitle}>Chat's User Information</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://placekitten.com/200/200' }} // Placeholder, replace with actual user image
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>David Wayne</Text>
        <Text style={styles.profileNumber}>(+44) 20 1234 5689</Text>

        {/* Top Icons */}
        <View style={styles.topIcons}>
          <Ionicons name="ios-videocam" size={responsiveSize(24)} color="white" />
          <Ionicons name="ios-call" size={responsiveSize(24)} color="white" style={styles.iconSpacing} />
        </View>
      </View>

      {/* Scrollable Options */}
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Media, Links & Documents</Text>
          <Text style={styles.optionCount}>152</Text>
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Mute Notification</Text>
          <Switch value={false} />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Custom Notification</Text>
          <Switch value={false} />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Protected Chat</Text>
          <Switch value={false} />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Hide Chat</Text>
          <Switch value={false} />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Hide Chat History</Text>
          <Switch value={false} />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Add To Group</Text>
          <MaterialIcons name="group-add" size={responsiveSize(24)} color="#fff" />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Custom Color Chat</Text>
          <View style={styles.colorPicker}></View>
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Custom Background Chat</Text>
          <View style={styles.colorPicker}></View>
        </View>

        {/* Scroll down for these options */}
        <View style={styles.bottomOptions}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: 'red' }]}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, { color: 'red' }]}>Block</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Utility function to calculate responsive sizes
const responsiveSize = (size) => {
  const baseWidth = 375; // reference width (iPhone 6/7/8)
  return (size * width) / baseWidth;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSize(15),
    paddingVertical: responsiveSize(10),
  },
  backButton: {
    marginRight: responsiveSize(10),
  },
  profileTitle: {
    color: 'white',
    fontSize: responsiveSize(18),
    fontWeight: 'bold',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: responsiveSize(20),
  },
  profileImage: {
    width: responsiveSize(100),
    height: responsiveSize(100),
    borderRadius: responsiveSize(50),
    marginBottom: responsiveSize(10),
  },
  profileName: {
    fontSize: responsiveSize(22),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: responsiveSize(5),
  },
  profileNumber: {
    fontSize: responsiveSize(16),
    color: '#fff',
  },
  topIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: responsiveSize(10),
  },
  iconSpacing: {
    marginLeft: responsiveSize(15),
  },
  optionsContainer: {
    paddingHorizontal: responsiveSize(15),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSize(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionText: {
    fontSize: responsiveSize(16),
    color: '#fff',
  },
  optionCount: {
    color: '#fff',
    fontSize: responsiveSize(14),
  },
  colorPicker: {
    width: responsiveSize(24),
    height: responsiveSize(24),
    backgroundColor: '#00FF00',
    borderRadius: responsiveSize(12),
  },
  bottomOptions: {
    marginTop: responsiveSize(20),
    paddingBottom: responsiveSize(40),
  },
});
