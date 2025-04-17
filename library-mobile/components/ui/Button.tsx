import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}) => {
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? '#ccc' : tint,
          borderColor: disabled ? '#ccc' : tint,
          borderWidth: 1,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? '#f5f5f5' : '#f0f0f0',
          borderColor: disabled ? '#f0f0f0' : '#e0e0e0',
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? '#ccc' : tint,
          borderWidth: 1,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: disabled ? '#ccc' : tint,
          borderColor: disabled ? '#ccc' : tint,
          borderWidth: 1,
        };
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return { color: backgroundColor };
      case 'secondary':
        return { color: textColor };
      case 'outline':
        return { color: disabled ? '#ccc' : tint };
      case 'text':
        return { color: disabled ? '#ccc' : tint };
      default:
        return { color: backgroundColor };
    }
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? backgroundColor : tint} 
          size="small" 
        />
      ) : (
        <Text style={[styles.text, textStyles]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});