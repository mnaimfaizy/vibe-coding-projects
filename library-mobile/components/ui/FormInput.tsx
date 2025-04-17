import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  secureTextEntry,
  icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const borderColor = isFocused ? tint : error ? '#ff0000' : '#ccc';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? tint : textColor}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholderTextColor="#888"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
  },
  icon: {
    marginLeft: 12,
  },
  showPasswordButton: {
    padding: 8,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
});