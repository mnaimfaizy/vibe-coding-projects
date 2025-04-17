import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { validatePasswordReset } from '../../utils/validation';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';

export const ResetPasswordForm: React.FC = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword, error, clearError, navigateAfterAuth } = useAuth();
  const textColor = useThemeColor({}, 'text');

  const handleSubmit = async () => {
    clearError();
    const formErrors = validatePasswordReset(password, confirmPassword);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    if (!token) {
      setErrors({
        general: 'Reset token is missing. Please request a new password reset link.'
      });
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      const success = await resetPassword({ token: token as string, newPassword: password });
      if (success) {
        setIsSuccess(true);
      }
      // On failure, we stay on this screen - no navigation
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigateAfterAuth('/login');
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: textColor }]}>
            Password Reset Complete
          </Text>
          <Text style={[styles.successMessage, { color: textColor }]}>
            Your password has been reset successfully. You can now log in with your new password.
          </Text>
        </View>
        
        <Button
          title="Go to Login"
          onPress={handleGoToLogin}
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

      {errors.general && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errors.general}</Text>
        </View>
      )}
      
      <Text style={[styles.instructions, { color: textColor }]}>
        Please enter your new password.
      </Text>
      
      <FormInput
        label="New Password"
        placeholder="Enter your new password"
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
        label="Confirm New Password"
        placeholder="Re-enter your new password"
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
        title="Reset Password"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      />
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
    marginTop: 16,
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