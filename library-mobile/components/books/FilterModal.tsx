import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';

export interface FilterOptions {
  genre?: string;
  year?: number | null;
  availability?: 'all' | 'available' | 'unavailable';
  sortBy?: 'title' | 'author' | 'year' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'border');
  const tint = useThemeColor({}, 'tint');
  
  const genres = [
    'Fiction', 
    'Non-Fiction', 
    'Mystery', 
    'Science Fiction', 
    'Fantasy', 
    'Romance', 
    'Thriller', 
    'Biography',
    'History',
    'Self-Help'
  ];
  
  const years = [
    { label: 'Any Year', value: null },
    { label: '2023+', value: 2023 },
    { label: '2020+', value: 2020 },
    { label: '2015+', value: 2015 },
    { label: '2010+', value: 2010 },
    { label: '2000+', value: 2000 },
    { label: 'Before 2000', value: 1999 },
  ];
  
  const sortOptions = [
    { label: 'Title (A-Z)', value: { sortBy: 'title', sortOrder: 'asc' } },
    { label: 'Title (Z-A)', value: { sortBy: 'title', sortOrder: 'desc' } },
    { label: 'Author (A-Z)', value: { sortBy: 'author', sortOrder: 'asc' } },
    { label: 'Year (Newest)', value: { sortBy: 'year', sortOrder: 'desc' } },
    { label: 'Year (Oldest)', value: { sortBy: 'year', sortOrder: 'asc' } },
    { label: 'Popularity', value: { sortBy: 'popularity', sortOrder: 'desc' } },
  ];
  
  const availabilityOptions = [
    { label: 'All Books', value: 'all' },
    { label: 'Available Only', value: 'available' },
    { label: 'Checked Out', value: 'unavailable' },
  ];
  
  const handleSelectGenre = (genre: string) => {
    Haptics.selectionAsync();
    setFilters(prev => ({
      ...prev,
      genre: prev.genre === genre ? undefined : genre
    }));
  };
  
  const handleSelectYear = (year: number | null) => {
    Haptics.selectionAsync();
    setFilters(prev => ({ ...prev, year }));
  };
  
  const handleSelectSort = (sortBy: 'title' | 'author' | 'year' | 'popularity', sortOrder: 'asc' | 'desc') => {
    Haptics.selectionAsync();
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };
  
  const handleSelectAvailability = (availability: 'all' | 'available' | 'unavailable') => {
    Haptics.selectionAsync();
    setFilters(prev => ({ ...prev, availability }));
  };
  
  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };
  
  const handleResetFilters = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFilters({});
  };
  
  const isFiltered = Object.values(filters).some(value => value !== undefined);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={[styles.container, { backgroundColor, borderColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.title}>Filter Books</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={tint} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Genres</ThemedText>
              <View style={styles.chipContainer}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.chip,
                      { borderColor },
                      filters.genre === genre && { backgroundColor: tint, borderColor: tint }
                    ]}
                    onPress={() => handleSelectGenre(genre)}
                  >
                    <ThemedText 
                      style={[
                        styles.chipText,
                        filters.genre === genre && { color: '#fff' }
                      ]}
                    >
                      {genre}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Publication Year</ThemedText>
              <View style={styles.optionsContainer}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year.label}
                    style={[
                      styles.option,
                      { borderColor },
                      filters.year === year.value && { backgroundColor: tint, borderColor: tint }
                    ]}
                    onPress={() => handleSelectYear(year.value)}
                  >
                    <ThemedText 
                      style={[
                        styles.optionText,
                        filters.year === year.value && { color: '#fff' }
                      ]}
                    >
                      {year.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Availability</ThemedText>
              <View style={styles.optionsContainer}>
                {availabilityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      { borderColor },
                      filters.availability === option.value && { backgroundColor: tint, borderColor: tint }
                    ]}
                    onPress={() => handleSelectAvailability(option.value)}
                  >
                    <ThemedText 
                      style={[
                        styles.optionText,
                        filters.availability === option.value && { color: '#fff' }
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Sort By</ThemedText>
              <View style={styles.optionsContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={`${option.value.sortBy}-${option.value.sortOrder}`}
                    style={[
                      styles.option,
                      { borderColor },
                      filters.sortBy === option.value.sortBy && 
                      filters.sortOrder === option.value.sortOrder && 
                      { backgroundColor: tint, borderColor: tint }
                    ]}
                    onPress={() => handleSelectSort(option.value.sortBy, option.value.sortOrder)}
                  >
                    <ThemedText 
                      style={[
                        styles.optionText,
                        filters.sortBy === option.value.sortBy && 
                        filters.sortOrder === option.value.sortOrder && 
                        { color: '#fff' }
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            {isFiltered && (
              <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
                <ThemedText style={{ color: tint }}>Reset Filters</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: tint }]} onPress={handleApplyFilters}>
              <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
            </TouchableOpacity>
          </View>
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
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'column',
  },
  option: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});