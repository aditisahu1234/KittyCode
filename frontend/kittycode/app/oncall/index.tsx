import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Utility function to calculate responsive sizes
const responsiveSize = (size) => {
  const baseWidth = 375; // reference width (iPhone 6/7/8)
  return (size * width) / baseWidth;
};

export default function OnCallScreen() {
  return (
    <LinearGradient
      colors={['#36D1DC', '#5B86E5']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <AntDesign name="arrowleft" size={responsiveSize(24)} color="#ff66ff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Calling ...</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://placekitten.com/200/200' }} // Placeholder image, replace with actual user image
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>David Wayne</Text>
        <Text style={styles.profileNumber}>(+44) 50 9285 3022</Text>
      </View>

      {/* Call Actions */}
      <View style={styles.callActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'red' }]}>
          <MaterialIcons name="call-end" size={responsiveSize(40)} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'green' }]}>
          <MaterialIcons name="call" size={responsiveSize(40)} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: responsiveSize(30),
    paddingHorizontal: responsiveSize(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: responsiveSize(10),
  },
  headerText: {
    fontSize: responsiveSize(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  profileCard: {
    alignItems: 'center',
    marginVertical: responsiveSize(30),
  },
  profileImage: {
    width: responsiveSize(120),
    height: responsiveSize(120),
    borderRadius: responsiveSize(60),
    marginBottom: responsiveSize(10),
  },
  profileName: {
    fontSize: responsiveSize(22),
    fontWeight: 'bold',
    color: '#fff',
  },
  profileNumber: {
    fontSize: responsiveSize(16),
    color: '#fff',
    marginTop: responsiveSize(5),
  },
  callActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: responsiveSize(70),
    height: responsiveSize(70),
    borderRadius: responsiveSize(35),
    alignItems: 'center',
    justifyContent: 'center',
  },
});