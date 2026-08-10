import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-serif font-bold text-primary">Create Your Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Register to join your local volunteer network or state agency team.</p>
      </div>
      <div className="mb-8 max-w-md w-full bg-blue-50 border border-blue-100 rounded-lg p-5 text-sm text-blue-800 shadow-sm">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <span>⚠️</span> Important System Requirements
        </h4>
        <p className="mb-3 leading-relaxed">
          Because Marigold Insights processes millions of data points locally in your browser memory (to protect citizen privacy), we officially support <strong>Chromium-based browsers</strong>:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1 font-medium">
          <li>Google Chrome</li>
          <li>Microsoft Edge</li>
          <li>Brave Browser</li>
          <li>Opera</li>
        </ul>
        <p className="leading-relaxed">
          If you encounter any issues creating an account or running an audit, please let us know via our <a href="/contact" className="underline font-bold hover:text-blue-900">Contact Form</a>.
        </p>
      </div>

      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </div>
  );
}
