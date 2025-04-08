import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock } from "lucide-react";

export function EmailVerificationComponent() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isResent, setIsResent] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would connect to your API
    console.log('Verification code submitted:', verificationCode);
    setIsVerified(true);
  };
  
  const handleResendCode = () => {
    // In a real implementation, this would trigger a new email
    console.log('Resending verification code');
    setIsResent(true);
    setTimeout(() => setIsResent(false), 5000);
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
          <form onSubmit={handleSubmit}>
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
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit">Verify Email</Button>
              <div className="mt-4 text-sm text-center">
                Didn't receive the code?{" "}
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  className="text-blue-600 hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}