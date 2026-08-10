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
      
      <div className="mt-8 max-w-md w-full bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-1">Important System Requirements</h4>
        <p className="mb-2">
          Because Marigold Insights processes millions of data points locally in your browser memory (to maintain your privacy), we officially support <strong>Chromium-based browsers</strong>:
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>Google Chrome</li>
          <li>Microsoft Edge</li>
          <li>Brave Browser</li>
          <li>Opera</li>
        </ul>
        <p>
          If you encounter any issues creating an account or running an audit, please let us know via our <a href="/contact" className="underline font-medium hover:text-blue-900">Contact Form</a>.
        </p>
      </div>
    </div>
  );
}
