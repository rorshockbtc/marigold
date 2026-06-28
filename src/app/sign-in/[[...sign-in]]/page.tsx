import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-serif font-bold text-primary">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to access your jurisdiction&apos;s active audit playbooks.</p>
      </div>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </div>
  );
}
