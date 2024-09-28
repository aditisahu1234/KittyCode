import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

const BASE_URL = "http://3.26.156.142:3000";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [loaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  const handleLogin = async () => {
    setLoading(true);
  
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      setLoading(false);
  
      if (data.success) {
        Alert.alert('Success', 'Login successful');
        // Navigate to HomeScreen, passing both token and username
        
        router.push({
          pathname: '../homescreen',
          params: { userId: data.token, username: data.username }, // Pass the username here
        });
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };
  

  if (!loaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="#d1ff00" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, Welcome Back</Text>
        <Text style={styles.subText}>Happy to see you again, to use your account please login first.</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#fff"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#fff"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        <LinearGradient
          colors={['#ff00ff', '#ffd700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.orLoginWith}>Or Login with</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <AntDesign name="google" size={40} color="#4C8BF5" />
        </TouchableOpacity>
        <TouchableOpacity>
          <AntDesign name="apple1" size={40} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="facebook-square" size={40} color="#3b5998" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#616BFC',
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d1ff00',
    textAlign: 'left',
  },
  subText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#d1ff00',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1ff00',
    borderRadius: 25,
    padding: 10,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    paddingLeft: 20,
  },
  forgotPassword: {
    alignItems: 'flex-end',
  },
  forgotText: {
    color: '#ffd700',
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 30,
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orLoginWith: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
