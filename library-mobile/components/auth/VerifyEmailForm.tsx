import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';
import { isValidEmail } from '../../utils/validation';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';

export const VerifyEmailForm: React.FC = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const { verifyEmail, resendVerification } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  // If we have a token in the URL, try to verify it
  React.useEffect(() => {
    if (token) {
      handleVerifyToken(token as string);
    }
  }, [token]);

  const handleVerifyToken = async (verificationToken: string) => {
    setVerifying(true);
    setError(null);
    
    try {
      await verifyEmail(verificationToken);
      setVerificationSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify email. The token may be invalid or expired.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setResending(true);
    setError(null);
    
    try {
      await resendVerification(email);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  if (verificationSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: textColor }]}>
            Email Verified!
          </Text>
          <Text style={[styles.successMessage, { color: textColor }]}>
            Your email has been successfully verified. You can now log in to your account.
          </Text>
        </View>
        
        <Button
          title="Go to Login"
          onPress={() => router.replace('/login')}
        />
      </View>
    );
  }

  if (resendSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: textColor }]}>
            Verification Email Sent
          </Text>
          <Text style={[styles.successMessage, { color: textColor }]}>
            We've sent a new verification email to {email}. Please check your inbox and follow the instructions.
          </Text>
        </View>
        
        <Button
          title="Back to Login"
          onPress={() => router.replace('/login')}
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
      
      <View style={styles.messageContainer}>
        <Text style={[styles.messageTitle, { color: textColor }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.messageText, { color: textColor }]}>
          Please check your email inbox for a verification link. If you haven't received the email, you can request a new one below.
        </Text>
      </View>
      
      <FormInput
        label="Email"
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="mail-outline"
      />
      
      <Button
        title="Resend Verification Email"
        onPress={handleResendVerification}
        loading={resending}
        disabled={resending || verifying}
        style={styles.button}
      />
      
      <TouchableOpacity
        onPress={() => router.replace('/login')}
        style={styles.backToLoginContainer}
      >
        <Text style={[styles.backToLoginText, { color: tint }]}>
          Back to Login
        </Text>
      </TouchableOpacity>
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
  messageContainer: {
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 16,
  },
  backToLoginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
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