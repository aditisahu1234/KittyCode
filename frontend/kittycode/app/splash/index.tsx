import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

import GradientText from '@/screens/gradient';

export default function SplashScreen() {
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'StickNoBills': require('../../assets/fonts/StickNoBills-SemiBold.ttf'),
  });

  /* Handle font loading */
  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>

      <GradientText style={styles.brand} text="KittyCode"/>
      
      {/* KittyCode Text with Gradient */}
      {/* <LinearGradient
        style={styles.brandContainer}
        colors={["#FC80D1", "#C6FE4E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.brand}>KittyCode</Text>
      </LinearGradient> */}

      {/* Description Text */}
      <Text style={styles.description}>
        A secure chatting application that prioritizes user privacy and safe messaging.
      </Text>

      {/* Image of the Kitty */}
      <Image
        source={require('../../assets/images/kitty.png')} 
        style={styles.image}
      />

      {/* Dots for navigation */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>

      {/* Get Started Button with the original gradient */}
      <LinearGradient
        colors={["#FC80D1", "#C6FE4E"]} 
        style={styles.button}
      >
        <Link href={'../account'} style={styles.buttonText}>
          Get Started
        </Link>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC', // Background color matching design
    alignItems: 'center',
    justifyContent: 'center', // Center everything vertically
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 44,
    fontFamily: 'Poppins-SemiBold',
    color: '#C6FE4E', // Yellow color for the "Welcome to",
  },

  brand: {
    fontSize: 60, // Larger size for prominent "KittyCode"
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'StickNoBills',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center', 
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 40, // Balanced padding to ensure centered alignment
  },
  image: {
    width: 245,
    height: 245, // Image size matches design
    resizeMode: 'contain',
    marginBottom: 30, // Space below the image
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Spacing below dots
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF', // White dots for navigation
    marginHorizontal: 5, // Spacing between dots
  },
  activeDot: {
    backgroundColor: '#FF85B3', // Pink for the active dot
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25, // More rounded button corners
    alignItems: 'center'
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#000', // White text for the button
    fontSize: 20,
    fontWeight: 'bold',
  },
});