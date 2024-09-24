import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Let's create your account!</Text>
      <Text style={styles.subText}>It will just take 2 minutes! Start chatting with your friends and family!</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        placeholderTextColor="#ffffff"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Your Email Address"
        placeholderTextColor="#ffffff"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Set Password"
        placeholderTextColor="#ffffff"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#ffffff"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <LinearGradient style={styles.button} colors={["#FC80D1", "#C6FE4E"]}>
        <Text style={styles.buttonText}>Create your account</Text>
      </LinearGradient>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#DAFF01',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    fontFamily:"Poppins-Regular",
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#FF4DFF',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF4DFF',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});