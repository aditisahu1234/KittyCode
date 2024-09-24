import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

export default function SplashScreen() {
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'StickNoBills': require('../../assets/fonts/StickNoBills.ttf'),
  });

  /* To-do : add error and loading logic for font */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <LinearGradient
        style={styles.brand}
        colors={["#FC80D1", "#C6FE4E"]}
      >
        KittyCode
      </LinearGradient>

      <Text style={styles.description}>
        A secure chatting application that prioritizes user privacy and safe messaging.
      </Text>

      {/* Image Section */}
      <Image
        source={require('../../assets/images/kitty.png')} // Update this path with your local image
        style={styles.image}
      />

      {/* Dots for page navigation */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>

      {/* Get Started Button */}
      <LinearGradient
       colors={["#FC80D1", "#C6FE4E"]}
        style={styles.button}
        // start={{x:0.9, y:0.0}}
        // end={{x:1,y:0.5}} 
      >
        <Link href={'/account'} style={styles.buttonText}>Get Started</Link>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC', // Main background color as seen in the screenshot
    alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 20,
    // paddingBottom:20,
    paddingTop: 60
  },
  title: {
    paddingLeft: 30,
    alignSelf: 'flex-start',
    fontSize: 36,
    fontFamily: 'Poppins-SemiBold',
    color: '#C6FE4E', // Bright yellow color for "Welcome to"
    fontWeight: '600',
    marginBottom: 5,
  },
  brand: {
    paddingLeft: 30,
    paddingBottom: 10,
    alignSelf: 'flex-start',
    fontSize: 40,
    // backgroundColor: '#FC80D1', // Pinkish color for "KittyCode"
    fontWeight: '700',
    marginBottom: 15,
    fontFamily: 'StickNoBills'
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF', // White text for the description
    // textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
    paddingLeft: 40,
  },
  image: {
    width: 245,
    height: 245, // Adjusted for the cat image in the screenshot
    resizeMode: 'contain',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
    paddingVertical: 10,
    paddingHorizontal: 100,
    borderRadius: 19,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
