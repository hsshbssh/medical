import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ShieldCheck, AlertTriangle, QrCode, Sparkles, Calendar, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-sky-400">About CareBridge AI</span>
          <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
            Prototype Specification
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Bridging Scene, Hospital & Continued Care
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          From Emergency Scene to Continued Care: A responsible healthcare workflow prototype.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
        {/* Critical Prototype Boundaries Notice */}
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-900/80 text-amber-200/90 space-y-2 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Mandatory Prototype Disclosure & Safety Limitations
          </div>
          <p>
            CareBridge AI is an engineering prototype designed to demonstrate a responsible healthcare coordination workflow. 
            <strong> It is NOT a certified emergency dispatch system, NOT a substitute for national emergency telephone services (112 / 108), and NOT a clinically validated medical device.</strong>
          </p>
          <p>
            All demonstration hospital records, clinician profiles, and patient histories included in this prototype are synthetic demo entities created strictly for workflow evaluation.
          </p>
        </div>

        {/* 3 Core Problem Statements Solved */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white">Three Interconnected Problem Statements</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <QrCode className="w-4 h-4" />
                PS-40: Consent-Based Emergency Patient Record Bridge
              </div>
              <p>
                Eliminates the dangerous delay between accident reporting and hospital triage. A secure, time-limited QR access token is generated on scene. First responders access only permitted vital parameters without broad data exposure.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                PS-39: Accessible Care Instructions Assistant
              </div>
              <p>
                Complex doctor discharge notes are simplified via server-side Gemini AI into easily actionable steps in English and Hindi with audio playback. Strict clinical safety rules preserve exact medicine dosages, frequencies, and red-flag return precautions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Calendar className="w-4 h-4" />
                PS-35: Patient Follow-Up Reminder System
              </div>
              <p>
                Prevents post-discharge recovery complications. Follow-ups are tracked through scheduled, reminder-sent, confirmed, and missed states with active care coordinator escalations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
