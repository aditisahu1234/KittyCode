
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';

export default function App() {
    const [loaded, error] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
      });
  return (
    <View style={styles.container}>

      {/* New to KittyCode section */}
      <View style={styles.section}>
        <Text style={styles.heading}>New to KittyCode?</Text>
        <Text style={styles.subtext}>
          Create your KittyCode account to securely connect with your friends securely and people over the world!
        </Text>
        <TouchableOpacity style={styles.button}>
          <LinearGradient
            colors={["#FC80D1", "#C6FE4E"]}
            style={styles.gradientButton}
          >
            <Link href={'/createaccount'} style={styles.buttonText}>Create an account</Link>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Already have an account section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Already have an account?</Text>
        <Text style={styles.subtext}>
          Login to your existing account. Enjoy the secure end-to-end encryption features of the app, ensuring topmost privacy and data safety.
        </Text>
        <TouchableOpacity style={styles.button}>
          <LinearGradient
            colors={["#FC80D1", "#C6FE4E"]}
            style={styles.gradientButton}
          >
            <Link href={'/login'} style={styles.buttonText}>Login</Link>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC', // Background color
    // justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 70
  },
  section: {
    marginBottom: 40,
  },
  heading: {
    fontFamily: 'Poppins-SemiBold',
    color: '#C6FE4E', // Neon green color for heading
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingLeft: 20,
    // textAlign: 'center',
  },
  subtext: {
    color: '#ffffff',
    fontFamily:"Poppins-Regular",
    fontSize: 16,
    // textAlign: 'center',
    paddingLeft: 20,
    marginBottom: 62,
  },
  button: {
    alignItems: 'center',
  },
  gradientButton: {
    width: 320,
    paddingVertical: 10,
    borderRadius: 19,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
