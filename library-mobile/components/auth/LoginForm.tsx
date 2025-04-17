import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { validateLogin } from '../../utils/validation';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, clearError, navigateAfterAuth } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const handleSubmit = async () => {
    clearError();
    const formErrors = validateLogin(email, password);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      const success = await login({ email, password });
      if (success) {
        // Navigation will be handled internally by the AuthContext
        // For login with verification required, we need to navigate to verify-email
        // For successful login, the isAuthenticated state change will trigger navigation
      }
      // On failure, we stay on this screen - no navigation
    } catch (error) {
      console.error('Login error:', error);
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
        placeholder="Enter your password"
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
      
      <Link href="/forgot-password" asChild>
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={[styles.forgotPasswordText, { color: tint }]}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </Link>
      
      <Button
        title="Login"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      />
      
      <View style={styles.registerContainer}>
        <Text style={[styles.registerText, { color: textColor }]}>
          Don't have an account?{' '}
        </Text>
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <Text style={[styles.registerLink, { color: tint }]}>Sign Up</Text>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});