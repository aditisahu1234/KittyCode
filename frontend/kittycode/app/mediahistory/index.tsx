import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Responsive utility function
const responsiveSize = (size) => (size * width) / 375;

export default function MediaScreen() {
  const [activeTab, setActiveTab] = useState('Media');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Media':
        return (
          <View style={styles.gallery}>
            <Text style={styles.sectionHeader}>Today</Text>
            <View style={styles.mediaRow}>
              {/* Placeholder images */}
              <Image style={styles.mediaImage} source={{ uri: 'https://placekitten.com/200/300' }} />
              <Image style={styles.mediaImage} source={{ uri: 'https://placekitten.com/200/300' }} />
            </View>
            <Text style={styles.sectionHeader}>Yesterday</Text>
            <View style={styles.mediaRow}>
              <Image style={styles.mediaImage} source={{ uri: 'https://placekitten.com/200/300' }} />
              <Image style={styles.mediaImage} source={{ uri: 'https://placekitten.com/200/300' }} />
              <Image style={styles.mediaImage} source={{ uri: 'https://placekitten.com/200/300' }} />
              <Image style={styles.mediaImage} source={{ uri: 'https://placekitten.com/200/300' }} />
            </View>
          </View>
        );
      case 'Links':
        return <Text style={styles.placeholder}>No links available</Text>;
      case 'Documents':
        return <Text style={styles.placeholder}>No documents available</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <AntDesign name="arrowleft" size={responsiveSize(24)} color="#ff66ff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>David Wayne</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <MaterialIcons name="videocam" size={responsiveSize(24)} color="#ff66ff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="call" size={responsiveSize(24)} color="#ff66ff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setActiveTab('Media')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'Media' && styles.activeTabText]}>Media</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Links')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'Links' && styles.activeTabText]}>Links</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Documents')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'Documents' && styles.activeTabText]}>Documents</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B86E5',
    paddingTop: responsiveSize(40),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSize(20),
    paddingBottom: responsiveSize(10),
  },
  backButton: {
    padding: responsiveSize(10),
  },
  headerText: {
    fontSize: responsiveSize(20),
    fontWeight: 'bold',
    color: '#FFF90F',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: responsiveSize(15),
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#5B86E5',
    paddingVertical: responsiveSize(10),
  },
  tabButton: {
    padding: responsiveSize(10),
  },
  tabText: {
    fontSize: responsiveSize(16),
    color: '#AAA',
  },
  activeTabText: {
    color: '#FFF90F',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#FFF90F',
  },
  contentContainer: {
    paddingHorizontal: responsiveSize(20),
    marginTop: responsiveSize(10),
  },
  gallery: {
    flexDirection: 'column',
  },
  sectionHeader: {
    fontSize: responsiveSize(16),
    fontWeight: 'bold',
    color: '#FFCCF9',
    marginVertical: responsiveSize(10),
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: responsiveSize(15),
  },
  mediaImage: {
    width: responsiveSize(100),
    height: responsiveSize(100),
    borderRadius: responsiveSize(10),
    marginBottom: responsiveSize(10),
  },
  placeholder: {
    fontSize: responsiveSize(16),
    color: '#FFF90F',
    textAlign: 'center',
    marginTop: responsiveSize(20),
  },
});
