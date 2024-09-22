import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.brand}>KittyCode</Text>

      <Text style={styles.description}>
        A secure chatting application that prioritizes user privacy and safe messaging
      </Text>

      {/* Image Section */}
      <Image
        source={require('../../asset/images/kitty.png')} // Update this path with your local image
        style={styles.image}
      />

      {/* Dots for page navigation */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC', // Main background color as seen in the screenshot
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#C6FE4E', // Bright yellow color for "Welcome to"
    fontWeight: '600',
    marginBottom: 5,
  },
  brand: {
    fontSize: 40,
    color: '#FC80D1', // Pinkish color for "KittyCode"
    fontWeight: '700',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF', // White text for the description
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: "Poppins",
    paddingLeft:38,
    paddingRight:90
  },
  image: {
    width: 245,
    height: 245, // Adjusted for the cat image in the screenshot
    resizeMode: 'contain',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF', // White dots
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#FF85B3', // Highlighted pink dot for active page
  },
  button: {
    backgroundColor: '#FF85B3', // Gradient-like pink color for the button
    paddingVertical: 15,
    paddingHorizontal: 100,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
