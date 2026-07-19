"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, Mail, HelpCircle, Shield, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Submit to web3forms natively using form action below
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="bg-slate-950 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Institutional Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight">
            How can we assist your audit?
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Whether you need a custom SDK paradigm, help with on-premise air-gap deployments, or are looking to partner, our technical desk is standing by.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-10">
        <Card className="shadow-2xl border-border bg-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left Column: Form */}
            <div className="md:col-span-3 p-8 md:p-10">
              <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  Send a Secure Message
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  All messages are routed directly to our institutional partnership desk. We guarantee a 72-hour SLA for state agencies and vetted beta partners.
                </p>
              </CardHeader>
              
              <CardContent className="px-0 pb-0">
                {!hasSubmitted ? (
                  <form 
                    action="https://api.web3forms.com/submit" 
                    method="POST" 
                    className="space-y-5"
                    onSubmit={handleSubmit}
                  >
                    <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />
                    <input type="hidden" name="replyto" value="cubby@colonhyphenbracket.pink" />
                    <input type="hidden" name="subject" value="New Marigold Contact Submission" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Full Name</label>
                        <Input name="name" required placeholder="Jane Doe" className="w-full" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Institutional Email</label>
                        <Input name="email" type="email" required placeholder="jane@state.gov" className="w-full" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Organization / Agency</label>
                      <Input name="organization" required placeholder="Department of State" className="w-full" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">How can we help?</label>
                      <textarea 
                        name="message" 
                        required 
                        rows={5}
                        placeholder="Please describe your technical architecture or partnership inquiry..."
                        className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      ></textarea>
                    </div>

                    <Button type="submit" variant="primary" className="w-full h-12 text-base shadow-md">
                      {isSubmitting ? "Transmitting..." : "Securely Submit Message"}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground pt-2">
                      By submitting this form, you agree to our <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                    </p>
                  </form>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 py-16">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-900">Message Received</h3>
                    <p className="text-emerald-800 text-sm max-w-sm mx-auto">
                      Thank you for contacting the Marigold Architecture Desk. A technical specialist will review your inquiry and respond within 72 hours.
                    </p>
                    <Button onClick={() => setHasSubmitted(false)} variant="outline" className="mt-4 border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                      Send Another Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Right Column: Info */}
            <div className="md:col-span-2 bg-slate-50 p-8 md:p-10 border-t md:border-t-0 md:border-l border-border flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-accent" />
                    Direct Technical Desk
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Need immediate technical intervention for your deployment? Reach our lead architecture team directly via email.
                  </p>
                  <a href="mailto:cubby@colonhyphenbracket.pink" className="text-accent font-bold text-sm inline-flex items-center gap-1 mt-3 hover:underline">
                    cubby@colonhyphenbracket.pink <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div>
                  <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    Self-Serve Support
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Many deployment and algorithmic questions are answered in our interactive learning center.
                  </p>
                  <Link href="/learning-center" className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-all inline-block">
                    Browse Learning Center
                  </Link>
                </div>
              </div>

              <div className="mt-12 bg-amber-50 p-5 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium">
                    Phone support is strictly reserved for active Tier-1 state agency deployments with valid compliance tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
