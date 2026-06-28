import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-serif font-bold text-primary">Create Your Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Register to join your local volunteer network or state agency team.</p>
      </div>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </div>
  );
}
