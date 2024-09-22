import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For sign-up
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign-up

  // Handle login or sign-up based on the current mode (isSignUp)
  const handleAuth = async () => {
    if (isSignUp && password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    try {
      const url = isSignUp 
        ? 'http://10.0.2.2:3000/api/auth/register' // Replace with your sign-up API
        : 'http://10.0.2.2:3000/api/auth/login'; // Your login API

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the JWT token locally (AsyncStorage or SecureStorage)
        Alert.alert(isSignUp ? 'Sign Up Success' : 'Login Success', 'Welcome!');
      } else {
        Alert.alert(isSignUp ? 'Sign Up Failed' : 'Login Failed', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}
      <Button title={isSignUp ? 'Sign Up' : 'Login'} onPress={handleAuth} />

      <Text style={styles.switchText}>
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <Text
          style={styles.switchButton}
          onPress={() => setIsSignUp((prev) => !prev)}
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  switchText: {
    marginTop: 15,
    textAlign: 'center',
  },
  switchButton: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
