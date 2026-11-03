"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, Mail, HelpCircle, Shield, ArrowRight, Phone, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ContactForm() {
  const searchParams = useSearchParams();
  const countyParam = searchParams.get("county");
  const topicParam = searchParams.get("topic");

  const defaultSubject = countyParam
    ? `Official Canvass Records Request — ${countyParam} County, MS`
    : "New Marigold Contact Submission";

  const defaultMessage = countyParam
    ? `I am an election official, county commissioner, or authorized campaign director requesting unmasked street-level canvassing sheets and cross-referenced voter roll audit rosters for ${countyParam} County, Mississippi (October 2026 extract). Please follow up regarding credential verification and delivery.`
    : "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [agency, setAgency] = useState("");

  useEffect(() => {
    if (countyParam) {
      setSubject(`Official Canvass Records Request — ${countyParam} County, MS`);
      setMessage(
        `I am an election official, county commissioner, or authorized campaign director requesting unmasked street-level canvassing sheets and cross-referenced voter roll audit rosters for ${countyParam} County, Mississippi (October 2026 extract). Please follow up regarding credential verification and delivery.`
      );
    }
  }, [countyParam]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="bg-[#FAF8F5] border-b border-[#DDD6CA] py-16 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="default" className="bg-amber-500/20 text-amber-700 border-amber-500/40 font-mono text-sm">
            {countyParam ? `Official Briefing · ${countyParam} County` : "Institutional Support"}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold font-serif tracking-tight text-[#111111]">
            {countyParam
              ? `Request Unmasked Canvass Data for ${countyParam} County`
              : "How can we assist your audit?"}
          </h1>
          <p className="text-base sm:text-lg text-[#5A534A] max-w-2xl mx-auto leading-relaxed">
            {countyParam
              ? "Under strict Zero-PII public safeguards, individual voter names and residential street numbers are never displayed on public web pages. Verified county officials and campaign directors can request unmasked canvassing sheets here."
              : "Whether you need a custom SDK paradigm, help with on-premise air-gap deployments, or are looking to partner, our technical desk is standing by."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-6">
        {countyParam && (
          <div className="mb-6 rounded-lg border-2 border-[#B45309] bg-[#FEF3C7] p-4 text-[#111111]">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-[#B45309] shrink-0 mt-0.5" />
              <div className="text-base leading-relaxed">
                <strong>Zero-PII Voter Privacy Policy:</strong> You are requesting official data for{" "}
                <strong>{countyParam} County, MS</strong>. To protect voter privacy, unmasked precinct canvassing rosters and residential street lists are provided only to authorized <strong>County Election Commissioners</strong> (who hold statutory authority to maintain and remove records from the voter rolls under Miss. Code Ann. § 23-15-153), County Registrars, or verified campaign representatives.
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-2xl border-border bg-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left Column: Form */}
            <div className="md:col-span-3 p-6 md:p-10">
              <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="text-2xl font-bold font-serif flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#B45309]" />
                  {countyParam ? "Canvass & Official Roll Request" : "Send a Secure Message"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {countyParam
                    ? "Inquiries are routed directly to our public-records verification desk. We respond with credential verification within 24–48 hours."
                    : "All messages are routed directly to our institutional partnership desk. We guarantee a 72-hour SLA for state agencies and vetted beta partners."}
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
                    <input type="hidden" name="subject" value={subject} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Full Name</label>
                        <Input name="name" required placeholder="Jane Doe" className="w-full" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Institutional / Official Email</label>
                        <Input name="email" type="email" required placeholder="jane@county.gov" className="w-full" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        {countyParam ? "County Election Commission / Campaign / Organization" : "Organization / Agency"}
                      </label>
                      <Input
                        name="organization"
                        required
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        placeholder={countyParam ? `${countyParam} County Election Commission` : "Department of State"}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Subject</label>
                      <Input
                        name="custom_subject"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Inquiry &amp; Verification Details</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe your official role and data requirements..."
                        className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      ></textarea>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-12 text-base font-bold bg-[#F59E0B] text-[#111111] hover:bg-[#D97706] shadow-md cursor-pointer"
                    >
                      {isSubmitting ? "Transmitting..." : countyParam ? "Submit Canvass Data Request" : "Securely Submit Message"}
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground pt-2">
                      Zero PII is shared publicly. By submitting this form, you agree to our{" "}
                      <Link href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                      </Link>.
                    </p>
                  </form>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 py-16">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold font-serif text-emerald-900">Request Received</h3>
                    <p className="text-emerald-800 text-sm max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting the Marigold Verification Desk. A specialist will verify your credentials and follow up regarding {countyParam ? `${countyParam} County` : "your inquiry"} within 24–48 hours.
                    </p>
                    <Button
                      onClick={() => setHasSubmitted(false)}
                      variant="outline"
                      className="mt-4 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Right Column: Info */}
            <div className="md:col-span-2 bg-[#FAF8F5] p-6 md:p-10 border-t md:border-t-0 md:border-l border-border flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-[#111111] flex items-center gap-2 mb-2 font-serif text-lg">
                    <Shield className="w-5 h-5 text-[#B45309]" />
                    Direct Verification Desk
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Need urgent data verification for an upcoming election board meeting or certification hearing? Reach our lead civic analytics team directly.
                  </p>
                  <a
                    href="mailto:cubby@colonhyphenbracket.pink"
                    className="text-[#B45309] font-bold text-sm inline-flex items-center gap-1 mt-3 hover:underline"
                  >
                    cubby@colonhyphenbracket.pink <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="border-t border-[#DDD6CA] pt-6">
                  <h4 className="font-bold text-[#111111] flex items-center gap-2 mb-2 font-serif text-lg">
                    <FileText className="w-5 h-5 text-[#B45309]" />
                    Public Reports Available
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Looking for the full statewide statistical briefing? The 82-county analysis is available immediately without an account.
                  </p>
                  <Link
                    href="/reports/mississippi-playbook-analysis"
                    className="text-[#B45309] font-bold text-sm inline-flex items-center gap-1 mt-3 hover:underline"
                  >
                    View Mississippi 82-County Report <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-8">Loading contact desk...</div>}>
      <ContactForm />
    </Suspense>
  );
}
