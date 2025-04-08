import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import AuthService from '@/services/authService';
import { useLocation } from 'react-router-dom';

// Define validation schema using zod
const verificationSchema = z.object({
  verificationCode: z.string()
    .min(6, 'Verification code must be at least 6 characters')
    .max(6, 'Verification code must be exactly 6 characters')
});

// Infer the TypeScript type from the schema
type VerificationFormValues = z.infer<typeof verificationSchema>;

export function EmailVerificationComponent() {
  const [isVerified, setIsVerified] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  
  const { 
    register, 
    handleSubmit,
    setValue, 
    formState: { errors, isSubmitting } 
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: ''
    }
  });
  
  // Check URL for token and auto-verify if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      setValue('verificationCode', token);
      verifyEmail(token);
    }
  }, [location.search, setValue]);
  
  const verifyEmail = async (token: string) => {
    try {
      await AuthService.verifyEmail(token);
      setIsVerified(true);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    }
  };
  
  const onSubmit = async (data: VerificationFormValues) => {
    // Reset error state
    setError('');
    
    try {
      await verifyEmail(data.verificationCode);
    } catch (err) {
      // Error already handled in verifyEmail function
    }
  };
  
  const handleResendCode = async () => {
    // Reset states
    setError('');
    setResendLoading(true);
    
    try {
      // In a real implementation, this would call an endpoint to resend the verification email
      // For now, we'll just simulate it with a timeout
      setTimeout(() => {
        setIsResent(true);
        setResendLoading(false);
        
        // Clear resent message after some time
        setTimeout(() => setIsResent(false), 5000);
      }, 1000);
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
      setResendLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to your email
          </CardDescription>
        </CardHeader>
        {error && (
          <div className="mx-6 mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {isVerified ? (
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Email verified successfully! You may now access all features.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <a href="/dashboard" className="text-blue-600 hover:underline">
                Continue to Dashboard
              </a>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                {isResent && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600">
                      New verification code sent. Please check your email.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input 
                    id="verificationCode"
                    placeholder="Enter the 6-digit code"
                    {...register('verificationCode')}
                    aria-invalid={errors.verificationCode ? 'true' : 'false'}
                  />
                  {errors.verificationCode && (
                    <p className="text-sm text-red-500 mt-1">{errors.verificationCode.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify Email'}
              </Button>
              <div className="mt-4 text-sm text-center">
                Didn't receive the code?{" "}
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-blue-600 hover:underline disabled:text-blue-300"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                      Resending...
                    </>
                  ) : 'Resend Code'}
                </button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}