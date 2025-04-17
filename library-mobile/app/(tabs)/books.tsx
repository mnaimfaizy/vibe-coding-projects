import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';

// Sample book data - in a real app, this would come from the API
const sampleBooks = [
  { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee', available: true },
  { id: '2', title: '1984', author: 'George Orwell', available: true },
  { id: '3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', available: false },
  { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', available: true },
  { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', available: true },
  { id: '6', title: 'The Hobbit', author: 'J.R.R. Tolkien', available: false },
  { id: '7', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', available: true },
  { id: '8', title: 'Animal Farm', author: 'George Orwell', available: true },
  { id: '9', title: 'Brave New World', author: 'Aldous Huxley', available: false },
  { id: '10', title: 'The Alchemist', author: 'Paulo Coelho', available: true },
];

type Book = {
  id: string;
  title: string;
  author: string;
  available: boolean;
};

export default function BooksScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      // Reset to all books when search is empty
      setBooks(sampleBooks);
    } else {
      // Filter books based on search query
      const filteredBooks = sampleBooks.filter(book => 
        book.title.toLowerCase().includes(text.toLowerCase()) || 
        book.author.toLowerCase().includes(text.toLowerCase())
      );
      setBooks(filteredBooks);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookInfo}>
        <ThemedText style={styles.bookTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.bookAuthor}>by {item.author}</ThemedText>
      </View>
      <View style={styles.bookStatus}>
        <ThemedText 
          style={[
            styles.statusText, 
            { color: item.available ? 'green' : 'red' }
          ]}
        >
          {item.available ? 'Available' : 'Checked Out'}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: item.available ? tint : '#ccc' }]}
          disabled={!item.available}
        >
          <ThemedText style={styles.actionButtonText}>
            {item.available ? 'Borrow' : 'Unavailable'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search by title or author"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={textColor} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.booksList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No books found matching your search.
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  booksList: {
    padding: 15,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    opacity: 0.8,
  },
  bookStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});