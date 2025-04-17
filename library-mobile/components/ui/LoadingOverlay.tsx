import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={[styles.container, { backgroundColor: backgroundColor + 'dd' }]}>
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tint} />
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});