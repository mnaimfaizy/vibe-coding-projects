import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';
import { ThemedText } from '../ThemedText';

interface BookDetailsModalProps {
  book: Book | null;
  visible: boolean;
  onClose: () => void;
  onCollectionUpdate?: () => void;
  inCollection?: boolean;
}

const { width } = Dimensions.get('window');
const COVER_HEIGHT = 240;

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  visible,
  onClose,
  onCollectionUpdate,
  inCollection = false
}) => {
  const [isInCollection, setIsInCollection] = useState<boolean>(inCollection);
  const [loading, setLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  // Keep local state in sync with props
  useEffect(() => {
    setIsInCollection(inCollection);
  }, [inCollection]);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'border');
  
  if (!book) return null;
  
  const authorText = book.authors && book.authors.length > 0
    ? book.authors.map(a => a.name).join(', ')
    : book.author || 'Unknown Author';
    
  const defaultImage = 'https://via.placeholder.com/300x450/CCCCCC/808080?text=No+Cover';
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);
      
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={[styles.container, { backgroundColor, borderColor }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={28} color={tint} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.coverContainer}>
              <Image source={imageSource} style={styles.coverImage} />
              {book.publishYear && (
                <View style={[styles.yearBadge, { backgroundColor }]}>
                  <ThemedText style={styles.yearText}>{book.publishYear}</ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.detailsContainer}>
              <ThemedText style={styles.title}>{book.title}</ThemedText>
              <ThemedText style={styles.author}>by {authorText}</ThemedText>
              
              {book.genre && (
                <View style={styles.genreContainer}>
                  <ThemedText style={[styles.genre, { color: tint }]}>
                    {book.genre}
                  </ThemedText>
                </View>
              )}
              
              {book.description && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                  <ThemedText style={styles.description}>{book.description}</ThemedText>
                </View>
              )}
              
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Details</ThemedText>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>ISBN:</ThemedText>
                  <ThemedText style={styles.detailValue}>{book.isbn || 'N/A'}</ThemedText>
                </View>
                
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Publication Year:</ThemedText>
                  <ThemedText style={styles.detailValue}>{book.publishYear || 'N/A'}</ThemedText>
                </View>
                
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Added on:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
          
          {isAuthenticated && (
            <View style={[styles.footer, { borderTopColor: borderColor }]}>
              <TouchableOpacity
                style={[
                  styles.collectionButton,
                  { backgroundColor: isInCollection ? '#e53935' : tint }
                ]}
                onPress={handleCollectionToggle}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={isInCollection ? 'bookmark-remove' : 'bookmark-outline'}
                      size={20}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <ThemedText style={styles.buttonText}>
                      {isInCollection ? 'Remove from Collection' : 'Add to Collection'}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverContainer: {
    width: '100%',
    height: COVER_HEIGHT,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  yearText: {
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    marginBottom: 16,
    opacity: 0.8,
  },
  genreContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  genre: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 140,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.9)', // Will be adjusted by ThemedView
    backdropFilter: 'blur(10px)',
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});