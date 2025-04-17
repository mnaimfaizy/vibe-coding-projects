import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { validatePasswordResetRequest } from '../../utils/validation';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';

export const PasswordResetForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { requestPasswordReset, error, clearError, navigateAfterAuth } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const handleSubmit = async () => {
    clearError();
    const formErrors = validatePasswordResetRequest(email);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      const success = await requestPasswordReset({ email });
      if (success) {
        // Only update UI state on success, no navigation
        setIsSubmitted(true);
      }
      // On failure, we stay on the form screen
    } catch (error) {
      console.error('Password reset request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigateAfterAuth('/login');
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: textColor }]}>
            Check your email
          </Text>
          <Text style={[styles.successMessage, { color: textColor }]}>
            If an account exists with {email}, we've sent instructions to reset your password.
          </Text>
        </View>
        
        <Button
          title="Back to Login"
          onPress={handleBackToLogin}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <Text style={[styles.instructions, { color: textColor }]}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>
      
      <FormInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) {
            setErrors({ ...errors, email: '' });
          }
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="mail-outline"
        error={errors.email}
      />
      
      <Button
        title="Reset Password"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      />
      
      <View style={styles.loginContainer}>
        <Text style={[styles.loginText, { color: textColor }]}>
          Remember your password?{' '}
        </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={[styles.loginLink, { color: tint }]}>Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
});