import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Clock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-sky-400">Data Governance</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Healthcare Privacy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Privacy Policy & Emergency Data-Sharing Protocol
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          How CareBridge AI protects sensitive health information, scopes emergency QR access, and safeguards patient autonomy.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed shadow-xl">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" />
            1. Minimal Data Collection & Zero Unnecessary Ingestion
          </h2>
          <p>
            When an incident is reported, bystanders are never required to provide excessive personal, biometric, or historical medical data to submit a report. Only observable circumstances (location, incident category, and visible injuries) are collected to expedite emergency medical coordination.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            2. PS-40: Cryptographically Scoped, Time-Limited QR Bridges
          </h2>
          <p>
            CareBridge AI does not publish full medical records via QR codes. Instead, QR codes reference opaque, cryptographically unpredictable tokens that grant strictly scoped, temporary access (default 24 hours).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Tokens automatically expire after the configured window.</li>
            <li>Patients and reporters can revoke access immediately at any time.</li>
            <li>Once revoked or expired, subsequent scans are immediately rejected by server-side validation.</li>
            <li>All scan attempts are recorded in an immutable audit log.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            3. Private Storage for Clinical Attachments
          </h2>
          <p>
            Photographs uploaded during incident reporting are stored in private, encrypted cloud storage buckets. Permanent public URLs are never generated. Access is restricted to authenticated attending clinicians via short-lived signed URLs.
          </p>
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-200">
            <strong>Clinical Safety Mandate:</strong> Uploaded injury photographs are never used for automated computer vision diagnosis or broadcast to external facilities indiscriminately.
          </div>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            4. Consent Records & Patient Revocation Rights
          </h2>
          <p>
            Patients maintain ownership of their records. The patient portal provides full visibility into which facilities have received notifications, who has accessed the incident file, and the ability to terminate active QR access bridges with a single click.
          </p>
        </section>
      </div>
    </div>
  );
}
