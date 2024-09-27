import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function App() {
    const [loaded, error] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    });

    if (!loaded) {
        return null; // You can add a loader here if fonts are not loaded
    }

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
                        <Link href={'../createaccount'} style={styles.buttonText}>
                            <Text>Create an account</Text>
                        </Link>
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
                        <Link href={'../login'} style={styles.buttonText}>
                            <Text>Login</Text>
                        </Link>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#616BFC',
        paddingHorizontal: width * 0.05, // 5% padding for all screen sizes
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    section: {
        marginBottom: height * 0.05, // Margin responsive to screen height
        width: '100%', // Ensure sections take full width
    },
    heading: {
        fontFamily: 'Poppins-SemiBold',
        color: '#C6FE4E',
        fontSize: width * 0.065, // Font size relative to screen width
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: width * 0.05, // Padding relative to screen width
    },
    subtext: {
        color: '#ffffff',
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.04, // Font size relative to screen width
        paddingLeft: width * 0.05, // Padding relative to screen width
        marginBottom: height * 0.06, // Margin responsive to screen height
    },
    button: {
        alignItems: 'center',
    },
    gradientButton: {
        width: width * 0.85, // Button width as a percentage of screen width
        paddingVertical: height * 0.02, // Padding responsive to screen height
        borderRadius: 19,
    },
    buttonText: {
        fontFamily: 'Poppins-SemiBold',
        color: '#000',
        fontSize: width * 0.05, // Font size relative to screen width
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
