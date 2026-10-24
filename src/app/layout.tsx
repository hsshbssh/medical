import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CareBridge AI — Healthcare Emergency Coordination & Continuity',
  description: 'A unified healthcare continuity platform connecting accident scene reporting, time-limited emergency QR record bridges (PS-40), hospital triage intake, plain-language AI care instructions (PS-39), and post-discharge follow-up care (PS-35).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          
          {/* Global Healthcare Footer */}
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 text-xs">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-sky-600 flex items-center justify-center text-white">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">CareBridge AI</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Connecting bystanders, emergency facilities, and clinicians to bridge the gap from accident scene to continued recovery.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Demonstration Healthcare Prototype</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Core Problem Statements</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/emergency-access/demo" className="hover:text-sky-400 transition-colors">
                      PS-40: Consent-Based QR Bridge
                    </Link>
                  </li>
                  <li>
                    <Link href="/clinician/dashboard" className="hover:text-sky-400 transition-colors">
                      PS-39: Accessible Care Instructions
                    </Link>
                  </li>
                  <li>
                    <Link href="/care-team/dashboard" className="hover:text-sky-400 transition-colors">
                      PS-35: Follow-up Reminder System
                    </Link>
                  </li>
                  <li>
                    <Link href="/report-emergency" className="hover:text-sky-400 transition-colors">
                      Scene-to-Care Incident Flow
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Responsible Protocol</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy & Data Sharing Policy</Link></li>
                  <li><Link href="/about" className="hover:text-sky-400 transition-colors">Clinical Limitations & Scope</Link></li>
                  <li><Link href="/admin/dashboard" className="hover:text-sky-400 transition-colors">Audit Trail & Governance</Link></li>
                  <li><span className="text-slate-500">Synthetic Demo Records Policy</span></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Emergency Services</h4>
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl space-y-2 text-red-200">
                  <p className="font-semibold text-[11px] text-red-300 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" /> Emergency Contacts:
                  </p>
                  <p className="text-[11px]">National Emergency: <strong>112</strong></p>
                  <p className="text-[11px]">Medical Ambulance: <strong>108</strong></p>
                  <p className="text-[11px]">Disaster Response: <strong>1077</strong></p>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
              <p>© 2026 CareBridge AI. Non-commercial healthcare prototype demonstration. Not a certified emergency dispatch system.</p>
              <p>Designed with clinical safety guardrails & privacy-by-design.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
