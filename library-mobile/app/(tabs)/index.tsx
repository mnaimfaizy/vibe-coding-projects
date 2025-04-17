import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function HomeScreen() {
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.welcomeContainer}>
        <ThemedText style={styles.title}>
          Welcome, {user?.name || 'Reader'}!
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover our library collection and manage your borrowed books.
        </ThemedText>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Library Services
        </ThemedText>
        <ThemedText style={styles.sectionText}>
          • Browse our extensive collection of books
        </ThemedText>
        <ThemedText style={styles.sectionText}>
          • Check out and return books easily
        </ThemedText>
        <ThemedText style={styles.sectionText}>
          • Manage your reading history
        </ThemedText>
        <ThemedText style={styles.sectionText}>
          • Get personalized recommendations
        </ThemedText>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          New Arrivals
        </ThemedText>
        <ThemedText style={styles.sectionText}>
          Check back soon to see our newest books!
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  section: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 24,
  },
});
