import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';  // Use Google Signin
import { generateKeyPair, getPrivateKey } from "../utils/crypto";
import { encode as encodeBase64 } from "@stablelib/base64";

const BASE_URL = "http://192.168.137.14:3000";  // Backend URL
// const BASE_URL = "http://3.26.156.142:3000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal for second stage
  const router = useRouter();

  const [loaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  // Initialize Google Sign-In in useEffect
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '89431481616-edhm1hgqcf181a1mrqk0cpeon9k1i6ud.apps.googleusercontent.com', // Replace with your actual Google web client ID
      offlineAccess: true, // If you need access to the user's refresh token
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        Alert.alert("Success", "Login successful");
        
        await EncryptedStorage.setItem(
          'user_credentials',
          JSON.stringify({ token: data.token, username: data.username })
        );

        let storedPrivateKey = await getPrivateKey(data.username);

        if (!storedPrivateKey) {
          const keyPair = generateKeyPair();
          await Keychain.setGenericPassword(
            data.username,
            encodeBase64(keyPair.secretKey)
          );
          await fetch(`${BASE_URL}/api/auth/store-public-key`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({
              publicKey: encodeBase64(keyPair.publicKey),
            }),
          });
          storedPrivateKey = keyPair.secretKey;
        }

        // Prompt for second-stage verification
        setModalVisible(true); // Open modal for Google verification
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      Alert.alert("Google Verification", "Google account verified.");
      setModalVisible(false);
    } catch (error) {
      // Catch and show the error but continue with login
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Alert.alert("Google Sign-In", "Sign-in was cancelled.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Alert.alert("Google Sign-In", "Sign-in is in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Alert.alert("Google Sign-In", "Play services not available.");
      } else {
        console.error("Google sign-in error:", error);
        // Alert.alert("Error", "Google sign-in failed, but proceeding to login.");
      }
      setModalVisible(false);  // Close the modal regardless of the error
    }
  
    // Proceed to the home screen after handling Google Sign-In or error
    const userCredentials = await EncryptedStorage.getItem('user_credentials');
    const { token, username } = JSON.parse(userCredentials);
    router.push({
      pathname: "../homescreen",
      params: { userId: token, username: username },
    });
  };
  

  if (!loaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
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

      {/* Second-stage verification modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Please verify your identity with Google</Text>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
            >
              <FontAwesome name="google" size={40} color="#4C8BF5" />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  googleText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#4C8BF5",
  },
});
