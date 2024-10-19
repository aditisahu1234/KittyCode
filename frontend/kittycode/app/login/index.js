import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { generateKeyPair, getPrivateKey } from "../utils/crypto";
import { encode as encodeBase64 } from "@stablelib/base64";
const BASE_URL = "http://192.168.225.62:3000";  // Backend URL
// const BASE_URL = "https://4d6a-2401-4900-3de6-9762-1181-3588-71f2-7985.ngrok-free.app";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [loaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });


  const handleLogin = async () => {
    setLoading(true);
  
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send email and password to backend
      });
  
      const data = await response.json(); // Parse response JSON
      setLoading(false);
  
      if (data.success) {
        Alert.alert("Success", "Login successful");
        console.log("UserId:", data.token);
        
        // Store the token and username in Encrypted Storage
        await EncryptedStorage.setItem(
          'user_credentials',
          JSON.stringify({ token: data.token, username: data.username })
        );
        
        const userCredentials = await EncryptedStorage.getItem('user_credentials');
        
        if (userCredentials) {
          const { token, username } = JSON.parse(userCredentials);

          if (token && username) {
            // If credentials exist, navigate to the home screen
            console.log("token :", token);
            console.log("username :", username);
          }
        }

        // Retrieve stored private key from Keychain
        let storedPrivateKey = await getPrivateKey(data.username);
  
        console.log("Stored Private Key:", storedPrivateKey); // Log the stored private key
  
        if (!storedPrivateKey) {
          console.log("No existing private key found. Generating new key pair.");
  
          // Private key doesn't exist, generate a new key pair
          const keyPair = generateKeyPair();
  
          // Log the generated private key
          console.log("Generated Private Key:", keyPair.secretKey);
  
          try {
            // Store the private key in Keychain
            await Keychain.setGenericPassword(
              data.username,  // Use token directly as the "username"
              encodeBase64(keyPair.secretKey)  // Store the private key as the "password" in base64 format
            );
            console.log("Private key stored successfully!");
          } catch (storeError) {
            console.error("Error storing private key:", storeError);
            Alert.alert(
              "Storage Error",
              "Failed to secure your encryption keys. Please try again."
            );
            return;
          }
  
          // Send the public key to the backend after successful login
          await fetch(`${BASE_URL}/api/auth/store-public-key`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`, // Send the token for authentication
            },
            body: JSON.stringify({
              publicKey: encodeBase64(keyPair.publicKey), // Send the public key in the body
            }),
          });
  
          storedPrivateKey = keyPair.secretKey; // Set the stored private key to the newly generated one
        } else {
          console.log("Private key already exists. Reusing the existing key.");
        }
  
        // Log the retrieved or newly generated private key
        console.log("Retrieved Private Key:", storedPrivateKey);
  
        if (storedPrivateKey) {
          // Navigate to HomeScreen, passing both token and username
          router.push({
            pathname: "../homescreen",
            params: { userId: data.token, username: data.username },
          });
        } else {
          Alert.alert("Error", "Failed to retrieve private key");
        }
      } else {
        Alert.alert("Error", data.message); // Show error message from the backend
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "An error occurred. Please try again."); // General error message
    }
  };
  

  if (!loaded) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Show loader if fonts aren't loaded
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/account')}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, Welcome Back</Text>
        <Text style={styles.subText}>
          Happy to see you again, to use your account please login first.
        </Text>
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

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <LinearGradient
          colors={["#FC80D1", "#C6FE4E"]}
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
    backgroundColor: "#616BFC",
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d1ff00",
    textAlign: "left",
  },
  subText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
    textAlign: "left",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#d1ff00",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1ff00",
    borderRadius: 25,
    padding: 10,
    fontSize: 16,
    color: "#fff",
    marginBottom: 15,
    paddingLeft: 20,
  },
  forgotPassword: {
    alignItems: "flex-end",
  },
  forgotText: {
    color: "#ffd700",
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 30,
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  orLoginWith: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});