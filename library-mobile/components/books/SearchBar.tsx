import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  initialValue?: string;
  showFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterPress,
  placeholder = 'Search for books...',
  initialValue = '',
  showFilters = true
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  
  const animatedWidth = useRef(new Animated.Value(1)).current;
  
  const backgroundColor = useThemeColor({ light: '#f2f2f7', dark: '#1c1c1e' }, 'searchBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#8e8e93', dark: '#636366' }, 'placeholderText');
  const tint = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({ light: '#8e8e93', dark: '#636366' }, 'tabIconDefault');
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedWidth, {
      toValue: 0.85,
      duration: 200,
      useNativeDriver: false
    }).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false
    }).start();
  };
  
  const handleSearch = () => {
    onSearch(searchQuery);
    Keyboard.dismiss();
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.searchContainer, 
        { backgroundColor, width: animatedWidth.interpolate({
          inputRange: [0, 1],
          outputRange: ['85%', '100%']
        }) }
      ]}>
        <View style={styles.iconContainer}>
          <Ionicons name="search" size={20} color={iconColor} />
        </View>
        
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={iconColor} />
          </TouchableOpacity>
        )}
        
        {showFilters && (
          <TouchableOpacity 
            onPress={onFilterPress} 
            style={styles.filterButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="options-outline" size={20} color={tint} />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {isFocused && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            Keyboard.dismiss();
            handleBlur();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={tint} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  iconContainer: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 6,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
  cancelButton: {
    marginLeft: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }
});