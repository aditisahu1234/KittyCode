import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // for icons
import { useFonts } from 'expo-font';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Dummy users data
const users = [
    { id: '123456', name: 'David Wayne', image: 'https://via.placeholder.com/50' },
    { id: '789012', name: 'Edward Mint', image: 'https://via.placeholder.com/50' },
    { id: '345678', name: 'May HG. Kang', image: 'https://via.placeholder.com/50' },
    { id: '901234', name: 'Lily Dare', image: 'https://via.placeholder.com/50' },
    { id: '567890', name: 'Dennis Dang', image: 'https://via.placeholder.com/50' },
    { id: '234567', name: 'Cayla Rajji', image: 'https://via.placeholder.com/50' },
    { id: '678901', name: 'Erin Turcotte', image: 'https://via.placeholder.com/50' },
];

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter users based on the search query
    const filteredUsers = users.filter(user => user.id.includes(searchQuery));

    const [loaded, error] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    });

    if (!loaded) {
        return null; // You can add a loader here if fonts are not loaded
    }

    return (
        <View style={styles.container}>
            {/* Header and Search bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={width * 0.05} color="#ff6ec7" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Add Friend</Text>
            </View>

            {/* Search bar */}
            <TextInput
                style={styles.searchContainer}
                placeholder="Enter User ID"
                placeholderTextColor="#fff"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* User list */}
            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.userContainer}>
                        <Image source={{ uri: item.image }} style={styles.userImage} />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{item.name}</Text>
                            <Text style={styles.userId}>ID: {item.id}</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton}>
                            <Ionicons name="person-add" size={24} color="#FC80D1" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#616BFC', // Main background color
        paddingTop: height * 0.05, // Responsive padding
        paddingHorizontal: width * 0.05, // Responsive horizontal padding
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.02, // Responsive bottom margin
    },
    backButton: {
        width: width * 0.1, // Responsive circular size
        height: width * 0.1,
        borderRadius: (width * 0.1) / 2,
        borderWidth: 1,
        borderColor: '#FF4DFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        marginRight: width * 0.05, // Responsive margin
    },
    headerText: {
        color: '#fff',
        fontSize: width * 0.065, // Responsive font size
        fontFamily: 'Poppins-Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#FF4DFF',
        padding: width * 0.03, // Responsive padding
        marginBottom: height * 0.02, // Responsive bottom margin
        color: '#fff',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        padding: width * 0.02, // Responsive padding
        marginBottom: height * 0.01, // Responsive margin
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderColor: '#FF4DFF',
        borderWidth: 1.6,
    },
    userImage: {
        width: width * 0.12, // Responsive image size
        height: width * 0.12,
        borderRadius: (width * 0.12) / 2,
        marginRight: width * 0.04, // Responsive margin
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: width * 0.045, // Responsive font size
        fontFamily: 'Poppins-Regular',
        fontWeight: '500',
        color: '#C6FE4E',
    },
    userId: {
        fontSize: width * 0.04, // Responsive font size
        fontFamily: 'Poppins-Regular',
        color: '#fff',
    },
    addButton: {
        paddingHorizontal: width * 0.02, // Responsive padding
        paddingVertical: width * 0.02, // Responsive padding
        borderRadius: 15,
        backgroundColor: '#ffffff20',
        marginRight: width * 0.02, // Responsive margin
        // borderColor: '#FF4DFF',
        // borderWidth: 1,
    },
});
