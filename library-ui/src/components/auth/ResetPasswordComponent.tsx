import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2 } from "lucide-react";
import AuthService from '@/services/authService';

// Define validation schema using zod
const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

// Infer the TypeScript type from the schema
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ''
    }
  });
  
  const email = watch('email');
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    // Reset error state
    setError('');
    
    try {
      await AuthService.requestPasswordReset(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Error requesting password reset. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {isSubmitted ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  If an account exists with {email}, we've sent a password reset link.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    placeholder="your.email@example.com"
                    type="email"
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {!isSubmitted && (
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Reset Password'}
              </Button>
            )}
            <div className="mt-4 text-sm text-center">
              <a href="/login" className="text-blue-600 hover:underline">
                Return to Login
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}