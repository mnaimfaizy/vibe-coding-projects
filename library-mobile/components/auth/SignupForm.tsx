import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { validateSignup } from '../../utils/validation';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';

export const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup, error, clearError, navigateAfterAuth } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const handleSubmit = async () => {
    clearError();
    const formErrors = validateSignup(name, email, password, confirmPassword);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      const success = await signup({ name, email, password });
      if (success) {
        // Only navigate to verification screen on success
        navigateAfterAuth('/verify-email');
      }
      // On failure, we stay on this screen - no navigation
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <FormInput
        label="Full Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) {
            setErrors({ ...errors, name: '' });
          }
        }}
        icon="person-outline"
        error={errors.name}
      />
      
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
      
      <FormInput
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) {
            setErrors({ ...errors, password: '' });
          }
        }}
        secureTextEntry
        icon="lock-closed-outline"
        error={errors.password}
      />
      
      <FormInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) {
            setErrors({ ...errors, confirmPassword: '' });
          }
        }}
        secureTextEntry
        icon="shield-checkmark-outline"
        error={errors.confirmPassword}
      />
      
      <Button
        title="Sign Up"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      />
      
      <View style={styles.loginContainer}>
        <Text style={[styles.loginText, { color: textColor }]}>
          Already have an account?{' '}
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
});