import { Text, View } from "react-native";
import EncryptedStorage from 'react-native-encrypted-storage';
import { useRouter } from "expo-router";
import { useEffect } from "react";


// import './test'; // Add this to include the test

export default function Index() {
  const router = useRouter(); // Use router to handle navigation

  useEffect(() => {
    const checkUserCredentials = async () => {
      try {
        // Fetch the saved credentials from encrypted storage
        const userCredentials = await EncryptedStorage.getItem('user_credentials');
        
        if (userCredentials) {
          const { token, username } = JSON.parse(userCredentials);

          if (token && username) {
            // If credentials exist, navigate to the home screen
            router.push({
              pathname: "/homescreen", 
              params: { userId: token, username: username }
            });
            return;
          }
        }
      } catch (error) {
        console.error("Error retrieving credentials:", error);
      }

      // If no credentials, navigate to the splash screen
      router.push("/splash");
    };

    checkUserCredentials();
  }, []);
  
  return null; // No UI, as this is just a redirection screen
}
