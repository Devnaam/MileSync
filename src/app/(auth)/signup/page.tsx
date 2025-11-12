// src/app/(auth)/signup/page.tsx
import Link from 'next/link';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import Card from '@/components/ui/Card';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream to-white p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Start Your Journey
          </h1>
          <p className="text-mediumGray">
            Create an account to begin achieving your goals
          </p>
        </div>

        <GoogleAuthButton />

        <div className="mt-6 text-center">
          <p className="text-sm text-mediumGray">
            Already have an account?{' '}
            <Link href="/login" className="text-accentBlue font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-lightGray">
          <p className="text-xs text-mediumGray text-center">
            By signing up, you agree to MileSync's Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}
