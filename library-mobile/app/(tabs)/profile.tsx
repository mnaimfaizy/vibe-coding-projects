import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => logout() 
        }
      ]
    );
  };

  const handleChangePassword = () => {
    // In a real app, navigate to change password screen
    Alert.alert('Change Password', 'This feature will be implemented soon!');
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <View style={[styles.profileImage, { backgroundColor: tint }]}>
            <ThemedText style={styles.profileInitial}>
              {user?.name?.charAt(0) || 'U'}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.profileName}>
          {user?.name || 'User'}
        </ThemedText>
        <ThemedText style={styles.profileEmail}>
          {user?.email || 'email@example.com'}
        </ThemedText>
      </View>
      
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="person-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>Edit Profile</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleChangePassword}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="lock-closed-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>Change Password</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Library Activity</ThemedText>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="book-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>Borrowed Books</ThemedText>
            <ThemedText style={styles.menuSubtext}>0 books</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="time-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>Reading History</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="bookmarks-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>Wishlist</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>Notifications</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="moon-outline" size={22} color={tint} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuText}>App Appearance</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="#ff3b30" />
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#777',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 10,
  },
  menuIcon: {
    width: 40,
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    paddingLeft: 5,
  },
  menuText: {
    fontSize: 16,
  },
  menuSubtext: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.5,
  },
});