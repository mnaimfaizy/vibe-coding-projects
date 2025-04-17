import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';
import { ThemedText } from '../ThemedText';

interface BookCardProps {
  book: Book;
  inCollection?: boolean;
  onPress?: (book: Book) => void;
  onCollectionUpdate?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  inCollection = false,
  onPress,
  onCollectionUpdate
}) => {
  const [isInCollection, setIsInCollection] = useState<boolean>(inCollection);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  // Keep local state in sync with props
  useEffect(() => {
    setIsInCollection(inCollection);
  }, [inCollection]);
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'border');

  const authorText = book.authors && book.authors.length > 0
    ? book.authors.map(a => a.name).join(', ')
    : book.author || 'Unknown Author';
    
  const year = book.publishYear ? ` (${book.publishYear})` : '';

  const defaultImage = 'https://via.placeholder.com/150x200/CCCCCC/808080?text=No+Cover';
  const imageSource = book.cover ? { uri: book.cover } : { uri: defaultImage };

  const handleCollectionToggle = async () => {
    // First verify user is authenticated
    if (!isAuthenticated) {
      console.log('Cannot toggle collection - user not authenticated');
      return;
    }
    
    // Double-check we have a token before making API calls
    const token = await getToken();
    if (!token) {
      console.log('No token available, cannot modify collection');
      return;
    }
    
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (isInCollection) {
        await bookService.removeFromCollection(book.id);
        setIsInCollection(false);
      } else {
        await bookService.addToCollection(book.id);
        setIsInCollection(true);
      }
      
      if (onCollectionUpdate) {
        onCollectionUpdate();
      }
    } catch (error) {
      console.error('Failed to update collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={() => onPress && onPress(book)}
      activeOpacity={0.7}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.cover} />
        </View>
        
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title} numberOfLines={1}>{book.title}</ThemedText>
          <ThemedText style={styles.author} numberOfLines={1}>{authorText}{year}</ThemedText>
        </View>
      </View>
      
      {isAuthenticated && (
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={handleCollectionToggle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={tint} />
          ) : (
            <Ionicons 
              name={isInCollection ? 'bookmark' : 'bookmark-outline'} 
              size={20} 
              color={tint} 
            />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 2,
    padding: 16,
    shadowColor: '#CCC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  contentWrapper: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    opacity: 0.6,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});