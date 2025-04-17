import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { BookCard } from '../../components/books/BookCard';
import { BookDetailsModal } from '../../components/books/BookDetailsModal';
import { BookGridItem } from '../../components/books/BookGridItem';
import { FilterModal, FilterOptions } from '../../components/books/FilterModal';
import { SearchBar } from '../../components/books/SearchBar';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { bookService } from '../../services/bookService';
import { Book } from '../../types/Book';
import { getToken } from '../../utils/storage';

export default function BooksScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [userCollectionIds, setUserCollectionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // For display mode toggle (List vs Grid)
  const [isListMode, setIsListMode] = useState(true);
  
  // For animated header
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  
  // Check auth token at startup
  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await getToken();
      console.log('Auth token in BooksScreen:', token ? 'Present' : 'Missing');
      setAuthChecked(true);
    };
    
    checkAuthToken();
  }, []);
  
  // Load books when component mounts
  useEffect(() => {
    fetchBooks();
  }, []);
  
  // Handle authentication state changes and tab focus
  useFocusEffect(
    useCallback(() => {
      // Always fetch books when focusing the screen
      fetchBooks();
      
      // Only attempt to fetch collection data if authenticated and auth check is complete
      if (isAuthenticated && !authLoading && authChecked) {
        console.log('User is authenticated, fetching collection');
        fetchUserCollection();
      } else {
        console.log('Not fetching collection - user not authenticated or auth still loading');
        // Clear collection data if not authenticated
        if (!isAuthenticated) {
          setUserCollectionIds(new Set());
        }
      }
    }, [isAuthenticated, authLoading, authChecked])
  );
  
  // Fetch books based on search and filters
  useEffect(() => {
    fetchBooks();
  }, [searchQuery, filters]);
  
  const fetchBooks = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      let booksData;
      
      if (searchQuery) {
        const response = await bookService.searchBooks({ q: searchQuery });
        booksData = response.books || [];
      } else {
        const response = await bookService.getAllBooks();
        booksData = response.books || [];
      }
      
      // Apply filters if any
      if (Object.keys(filters).length > 0) {
        booksData = applyFilters(booksData);
      }
      
      setBooks(booksData);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError('Failed to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchUserCollection = async () => {
    // Skip if not authenticated or already fetching
    if (!isAuthenticated || collectionLoading) {
      console.log('Skipping collection fetch - not authenticated or already loading');
      return;
    }
    
    try {
      setCollectionLoading(true);
      console.log('Fetching user collection...');
      
      const token = await getToken();
      if (!token) {
        console.log('No token available, cannot fetch collection');
        return;
      }
      
      const response = await bookService.getUserCollection();
      const collectionBooks = response.books || [];
      const collectionIds = new Set(collectionBooks.map(book => book.id));
      setUserCollectionIds(collectionIds);
      console.log(`Collection fetched: ${collectionIds.size} books found`);
    } catch (err) {
      console.error('Failed to fetch user collection:', err);
      // Don't show an error UI for this - just silently fail
    } finally {
      setCollectionLoading(false);
    }
  };
  
  const applyFilters = (booksToFilter: Book[]) => {
    return booksToFilter.filter(book => {
      // Filter by genre
      if (filters.genre && book.genre !== filters.genre) {
        return false;
      }
      
      // Filter by year
      if (filters.year !== undefined && filters.year !== null) {
        if (
          !book.publishYear || 
          (filters.year < 2000 && book.publishYear >= 2000) ||
          (filters.year >= 2000 && book.publishYear < filters.year)
        ) {
          return false;
        }
      }
      
      // More filters can be added here
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (filters.sortBy === 'title') {
        return filters.sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      
      if (filters.sortBy === 'author') {
        const authorA = a.authors && a.authors.length > 0 
          ? a.authors[0].name 
          : a.author || '';
          
        const authorB = b.authors && b.authors.length > 0 
          ? b.authors[0].name 
          : b.author || '';
          
        return filters.sortOrder === 'asc' 
          ? authorA.localeCompare(authorB)
          : authorB.localeCompare(authorA);
      }
      
      if (filters.sortBy === 'year') {
        const yearA = a.publishYear || 0;
        const yearB = b.publishYear || 0;
        
        return filters.sortOrder === 'asc' 
          ? yearA - yearB
          : yearB - yearA;
      }
      
      // Default sorting by title
      return a.title.localeCompare(b.title);
    });
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
    
    // Only fetch collection if authenticated
    if (isAuthenticated && authChecked) {
      fetchUserCollection();
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterPress = () => {
    setFilterModalVisible(true);
    Haptics.selectionAsync();
  };
  
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setDetailsModalVisible(true);
  };
  
  const handleCollectionUpdate = () => {
    fetchUserCollection();
  };
  
  const toggleDisplayMode = () => {
    Haptics.selectionAsync();
    setIsListMode(!isListMode);
  };
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [80, 0],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  const isCollectionBook = (bookId: number) => {
    return userCollectionIds.has(bookId);
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    if (isListMode) {
      return (
        <BookCard
          book={item}
          inCollection={isCollectionBook(item.id)}
          onPress={handleBookPress}
          onCollectionUpdate={handleCollectionUpdate}
        />
      );
    } else {
      return (
        <BookGridItem
          book={item}
          inCollection={isCollectionBook(item.id)}
          onPress={handleBookPress}
          onCollectionUpdate={handleCollectionUpdate}
        />
      );
    }
  };
  
  const renderHeader = () => (
    <>
      <Animated.View style={[
        styles.welcomeContainer,
        { 
          height: headerHeight, 
          opacity: headerOpacity 
        }
      ]}>
        <ThemedText style={styles.welcomeTitle}>Explore Books</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>
          Find your next favorite read
        </ThemedText>
      </Animated.View>
      
      <View style={styles.searchAndFilterContainer}>
        <SearchBar 
          onSearch={handleSearch} 
          onFilterPress={handleFilterPress}
          initialValue={searchQuery}
        />
        
        <TouchableOpacity 
          style={styles.displayModeButton}
          onPress={toggleDisplayMode}
        >
          <Ionicons
            name={isListMode ? 'grid-outline' : 'list-outline'}
            size={22}
            color={tint}
          />
        </TouchableOpacity>
      </View>
      
      {Object.keys(filters).length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ThemedText style={styles.activeFiltersText}>
            Filters active
          </ThemedText>
          <TouchableOpacity 
            onPress={() => setFilters({})}
            style={styles.clearFiltersButton}
          >
            <ThemedText style={{ color: tint }}>Clear</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
  
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={tint} />
          <ThemedText style={styles.emptyText}>Loading books...</ThemedText>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={tint} />
          <ThemedText style={styles.emptyText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: tint }]}
            onPress={fetchBooks}
          >
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={64} color={tint} style={{ opacity: 0.5 }} />
        <ThemedText style={styles.emptyText}>
          {searchQuery 
            ? `No books found matching "${searchQuery}"`
            : 'No books available'
          }
        </ThemedText>
        {searchQuery && (
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: tint }]}
            onPress={() => setSearchQuery('')}
          >
            <ThemedText style={styles.retryButtonText}>Clear Search</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        numColumns={isListMode ? 1 : 2}
        key={isListMode ? 'list' : 'grid'} // This is important for FlatList to re-render when we change modes
        columnWrapperStyle={!isListMode ? styles.gridColumnWrapper : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[tint]}
            tintColor={tint}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
      
      <BookDetailsModal
        book={selectedBook}
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        onCollectionUpdate={handleCollectionUpdate}
        inCollection={selectedBook ? isCollectionBook(selectedBook.id) : false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between', 
    marginBottom: 0,
  },
  welcomeContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayModeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeFiltersText: {
    fontSize: 14,
  },
  clearFiltersButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});