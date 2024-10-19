import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function CreateGroupScreen() {
    const [groupName, setGroupName] = useState('');
    const [members, setMembers] = useState([]);

    const addMember = () => {
        // Add member logic here
    };

    const [loaded, error] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    });

    if (!loaded) {
        return null; // You can add a loader here if fonts are not loaded
    }

    return (
        <View style={styles.container}>
            {/* Circular Back Arrow */}
            <TouchableOpacity style={styles.backButton}>
                <Ionicons name="arrow-back" size={width * 0.05} color="#ff6ec7" />
            </TouchableOpacity>

            {/* Header */}
            <Text style={styles.header}>Create Group</Text>

            {/* Group Name Input */}
            <TextInput
                style={styles.input}
                placeholder="Enter Name Group"
                placeholderTextColor="#fff"
                value={groupName}
                onChangeText={(text) => setGroupName(text)}
            />

            {/* Members Input */}
            <TouchableOpacity style={styles.addMemberButton} onPress={addMember}>
                <Text style={styles.addMemberText}>+ Add members to group</Text>
            </TouchableOpacity>

            {/* Create Group Button */}
            <TouchableOpacity>
                <LinearGradient style={styles.createGroupButton} colors={["#FC80D1", "#C6FE4E"]}>
                    <Text style={styles.createGroupText}>Create Group</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#616BFC', // Deep blue background
        paddingHorizontal: width * 0.05, // Responsive padding
        justifyContent: 'center',
        gap: 8
    },
    backButton: {
        position: 'absolute',
        top: height * 0.05, // Responsive top margin
        left: width * 0.05, // Responsive left margin
        width: width * 0.12, // Circular size based on width
        height: width * 0.12, // Circular height equal to width
        borderRadius: (width * 0.12) / 2, // Make it a circle
        borderWidth: 1,
        borderColor: '#FF4DFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5, // Shadow for Android
    },
    header: {
        fontSize: width * 0.07, // Responsive font size
        color: '#b3f348',
        textAlign: 'center',
        marginBottom: height * 0.03, // Responsive bottom margin
        fontFamily: 'Poppins-SemiBold'
    },
    input: {
        borderRadius: 15,
        paddingHorizontal: width * 0.05, // Responsive padding
        paddingVertical: height * 0.02,
        marginBottom: height * 0.02, // Responsive margin
        fontSize: width * 0.045, // Responsive font size
        fontFamily: 'Poppins-Regular',
        color: '#fff',
        borderColor: '#FF4DFF',
        borderWidth: 1,
    },
    addMemberButton: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: height * 0.02, // Responsive padding
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.04, // Responsive bottom margin
    },
    addMemberText: {
        color: '#ff6ec7',
        fontSize: width * 0.045, // Responsive font size
        fontFamily: 'Poppins-SemiBold'
    },
    createGroupButton: {
        backgroundColor: '#ff6ec7',
        borderRadius: 30,
        paddingVertical: height * 0.02, // Responsive padding
        alignItems: 'center',
    },
    createGroupText: {
        fontSize: width * 0.05, // Responsive font size
        color: '#000',
        fontWeight: 'bold',
        fontFamily: 'Poppins-SemiBold'
    },
});