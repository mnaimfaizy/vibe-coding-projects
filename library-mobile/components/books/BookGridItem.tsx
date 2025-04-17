import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';
import { ThemedText } from '../ThemedText';

interface BookGridItemProps {
  book: Book;
  inCollection?: boolean;
  onPress?: (book: Book) => void;
  onCollectionUpdate?: () => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 items per row with spacing
const ITEM_HEIGHT = ITEM_WIDTH * 1.5; // Golden ratio-ish

export const BookGridItem: React.FC<BookGridItemProps> = ({ 
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
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'border');

  const authorText = book.authors && book.authors.length > 0
    ? book.authors[0].name // Just show the primary author in grid view
    : book.author || 'Unknown Author';
    
  const defaultImage = 'https://via.placeholder.com/150x200/CCCCCC/808080?text=No+Cover';
  const imageSource = book.cover ? { uri: book.cover } : { uri: defaultImage };

  const handleCollectionToggle = async (e: any) => {
    e.stopPropagation();
    
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
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.cover} />
        
        {book.publishYear && (
          <View style={[styles.yearBadge, { backgroundColor }]}>
            <ThemedText style={styles.yearText}>{book.publishYear}</ThemedText>
          </View>
        )}
        
        {isAuthenticated && (
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              { backgroundColor: isInCollection ? tint : 'rgba(0,0,0,0.5)' }
            ]}
            onPress={handleCollectionToggle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons 
                name={isInCollection ? 'bookmark' : 'bookmark-outline'} 
                size={16} 
                color="#fff" 
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title} numberOfLines={2}>{book.title}</ThemedText>
        <ThemedText style={styles.author} numberOfLines={1}>{authorText}</ThemedText>
        
        {book.genre && (
          <ThemedText style={[styles.genre, { color: tint }]} numberOfLines={1}>
            {book.genre}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.35,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  genre: {
    fontSize: 11,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  }
});