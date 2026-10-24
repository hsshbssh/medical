'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Activity, 
  ShieldCheck, 
  QrCode, 
  HeartHandshake, 
  Hospital, 
  Stethoscope, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  Lock, 
  ChevronRight, 
  AlertTriangle,
  Play,
  Volume2,
  FileText,
  Clock,
  Compass,
  UserCheck,
  PhoneCall,
  Search
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [activeStage, setActiveStage] = useState<number>(1);
  const [trackId, setTrackId] = useState('');
  const [showTrackInput, setShowTrackInput] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      router.push(`/incident/${encodeURIComponent(trackId.trim())}`);
    }
  };

  const stages = [
    {
      num: 1,
      title: 'Scene Intake',
      role: 'bystander' as UserRole,
      badge: 'Accident Scene',
      route: '/report-emergency',
      summary: 'Bystander or paramedic logs field observations, trauma flags, and precise GPS coordinates without delays.',
      metrics: { primary: 'Connaught Place, New Delhi', secondary: 'Coordinates: 28.6139° N, 77.2090° E', status: 'DISPATCHED' },
    },
    {
      num: 2,
      title: 'PS-40: QR Bridge',
      role: 'bystander' as UserRole,
      badge: 'Time-Limited Token',
      route: '/incident/demo-incident-001',
      summary: 'Generates a 24-hour cryptographically secure QR token. First responders scan to view critical emergency data with 1-click patient revocation.',
      metrics: { primary: 'Token: tk_sec_994821', secondary: 'Allergies: Penicillin (Severe) • Blood: O+', status: 'TOKEN ACTIVE' },
    },
    {
      num: 3,
      title: 'ER Reception Intake',
      role: 'hospital_responder' as UserRole,
      badge: 'Hospital Desk',
      route: '/hospital/dashboard',
      summary: 'Nearest participating trauma center calculates distance radar, receives incoming patient telemetry, and reserves an acute triage bed.',
      metrics: { primary: 'AIIMS New Delhi Trauma Center', secondary: 'Distance: 5.2 km (Haversine Radar) • Bed 4', status: 'BED RESERVED' },
    },
    {
      num: 4,
      title: 'PS-39: Clinician AI Suite',
      role: 'clinician' as UserRole,
      badge: 'Gemini Simplification',
      route: '/clinician/cases/demo-incident-001',
      summary: 'Physician writes clinical orders. Gemini AI translates medical jargon into plain English & Hindi with voice synthesis and mandatory doctor approval.',
      metrics: { primary: 'Dr. A. Sharma (Cardiothoracic)', secondary: 'Draft → Approved • Bilingual EN+HI Audio Ready', status: 'DOCTOR SIGNED' },
    },
    {
      num: 5,
      title: 'Patient Recovery Portal',
      role: 'patient' as UserRole,
      badge: 'Accessible Care',
      route: '/patient/dashboard',
      summary: 'Discharged patient views interactive daily checklist, listens to simplified audio playback, and checks verified prescription dosages.',
      metrics: { primary: 'Patient: Rohan Mehta (32M)', secondary: '4/4 Meds Logged • Daily Dressing Clean', status: 'IN RECOVERY' },
    },
    {
      num: 6,
      title: 'PS-35: Care Continuity',
      role: 'care_team' as UserRole,
      badge: 'Post-Discharge Ops',
      route: '/care-team/dashboard',
      summary: 'Care coordinator tracks appointment confirmations and automatically handles missed visits with operational escalation tasks.',
      metrics: { primary: 'Follow-up: Oct 26, 10:00 AM', secondary: 'Orthopedic OPD • Nurse Sunita Devi Assigned', status: 'CONFIRMED' },
    },
  ];

  const current = stages[activeStage - 1];

  return (
    <div className="flex flex-col min-h-screen bg-[#080C14]">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-white/[0.07] overflow-hidden">
        {/* Deep architectural radial lighting */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-sky-500/[0.07] blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-teal-500/[0.04] blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Prominent Emergency Assistance Option */}
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs text-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-red-950/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[11.5px] text-red-200/90 leading-tight">
                  <strong className="text-white">Life-Threatening Emergency?</strong> Submitting a report does not delay or replace contacting emergency services.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:112"
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                >
                  <PhoneCall className="w-3 h-3 fill-current" /> Call 112
                </a>
                <a
                  href="tel:108"
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors border border-white/10"
                >
                  Ambulance 108
                </a>
              </div>
            </div>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 animate-pulse" />
              <span className="font-semibold text-slate-200">Unified Healthcare Coordination Platform</span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] text-sky-400 font-mono font-medium">PS-40 + PS-39 + PS-35</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.12]">
              From Accident Scene <br />
              <span className="text-sky-400 font-extrabold">To Continuous Recovery</span>
            </h1>

            {/* Required Bystander Guidance Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto">
              Report an accident and share essential incident information with participating emergency facilities.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
              Generates a 24-hour cryptographic QR pass for responding paramedics, alerts nearby trauma centers with GPS triage telemetry, and tracks your patient journey from acute admission to discharge.
            </p>

            {/* Two Clear Bystander Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/report-emergency"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 transition-all hover:translate-y-[-1px] active:translate-y-0"
              >
                <Activity className="w-4 h-4" />
                Report an Emergency
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </Link>

              <button
                onClick={() => setShowTrackInput(!showTrackInput)}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px] ${
                  showTrackInput 
                    ? 'bg-sky-500/20 border-sky-400/40 text-white shadow-lg shadow-sky-500/10' 
                    : 'bg-[#0D1322] hover:bg-[#131B30] border-white/[0.1] text-slate-200'
                }`}
              >
                <Search className="w-4 h-4 text-sky-400" />
                Track an Existing Incident
              </button>
            </div>

            {/* Inline Incident Tracker Panel */}
            {showTrackInput && (
              <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto p-4 rounded-2xl bg-[#090E1D] border border-sky-500/30 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-sky-400" /> Enter Incident ID or Code
                  </span>
                  <button
                    type="button"
                    onClick={() => setTrackId('demo-incident-001')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 underline font-mono"
                  >
                    Use Sample ID
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="e.g. CB-20261024-A1B2 or demo-incident-001"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!trackId.trim()}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Track <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Architecture Metrics Strip */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">PS-40 Token Window</span>
                <span className="text-sm font-bold text-white mt-0.5 block">24h Max TTL</span>
                <span className="text-[10px] text-slate-400">1-click instant revoke</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">PS-39 Clinical Guardrail</span>
                <span className="text-sm font-bold text-white mt-0.5 block">Doctor Sign-Off</span>
                <span className="text-[10px] text-slate-400">0 AI-invented doses</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Audio Synthesis</span>
                <span className="text-sm font-bold text-white mt-0.5 block">English + Hindi</span>
                <span className="text-[10px] text-slate-400">Web Speech native TTS</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">PS-35 Care Escalation</span>
                <span className="text-sm font-bold text-white mt-0.5 block">Missed Visit Ops</span>
                <span className="text-[10px] text-slate-400">Nurse task routing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Care Continuum Pipeline Suite */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-[10.5px] uppercase font-bold tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            End-to-End Pipeline Demonstration
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            How The 6 Stages Flow Seamlessly
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Follow the live synthetic journey of patient <strong>Rohan Mehta (INC-8821)</strong> from accident scene to discharge follow-up.
          </p>
        </div>

        {/* Pipeline Control Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
          {stages.map(s => (
            <button
              key={s.num}
              onClick={() => setActiveStage(s.num)}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeStage === s.num
                  ? 'bg-sky-500/15 border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'bg-[#0D1322] border-white/[0.07] hover:bg-white/[0.04] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStage === s.num ? 'bg-sky-400 text-slate-950' : 'bg-white/10 text-slate-400'
                }`}>
                  {s.num}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  {s.badge}
                </span>
              </div>
              <p className={`text-xs font-semibold mt-2 ${
                activeStage === s.num ? 'text-white' : 'text-slate-300'
              }`}>
                {s.title}
              </p>
            </button>
          ))}
        </div>

        {/* Active Stage Deep Inspection Card */}
        <div className="clinical-card p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-sky-500/15 text-sky-300 font-mono font-bold text-xs border border-sky-500/30">
                  STAGE {current.num} OF 6
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Evaluator Perspective: <strong className="text-slate-200">{current.role}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {current.title}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {current.summary}
                </p>
              </div>

              {/* Live Simulated Telemetry */}
              <div className="p-4 rounded-xl bg-[#080C14] border border-white/[0.08] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400 text-[11px]">ACTIVE TELEMETRY</span>
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {current.metrics.status}
                  </span>
                </div>
                <div className="text-slate-200 font-semibold text-[13px]">
                  {current.metrics.primary}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {current.metrics.secondary}
                </div>
              </div>

              {/* Action Jump to Screen */}
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={current.route}
                  onClick={() => switchRole(current.role)}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all"
                >
                  <span>Launch Live Screen for Stage {current.num}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <span className="text-xs text-slate-400">
                  Auto-switches to <span className="font-semibold text-slate-300">{current.role}</span> view
                </span>
              </div>
            </div>

            {/* Right Visual Column (Interactive preview state) */}
            <div className="lg:col-span-5 bg-[#080C14] border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/[0.06] pb-2.5">
                <span className="font-semibold text-slate-300">Live Stage Preview</span>
                <span className="font-mono text-[10px] text-sky-400">ID: INC-8821</span>
              </div>

              {current.num === 1 && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <strong className="block text-rose-200">Trauma Level: Priority 2 (Urgent)</strong>
                    Two-wheeler collision at intersection. Conscious, severe limb pain.
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-slate-400 block text-[9.5px]">GPS ACCURACY</span>
                      <span>±4 meters fix</span>
                    </div>
                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-slate-400 block text-[9.5px]">SHARING</span>
                      <span>Emergency Only</span>
                    </div>
                  </div>
                </div>
              )}

              {current.num === 2 && (
                <div className="space-y-3 text-xs text-center">
                  <div className="w-36 h-36 mx-auto bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                    <QrCode className="w-32 h-32 text-slate-950" />
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-bold block">✓ Verified Active QR Pass</span>
                    First responders scan on-scene for scoped allergies & blood type.
                  </div>
                </div>
              )}

              {current.num === 3 && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] uppercase font-bold text-sky-400 block">Assigned Trauma Center</span>
                    <p className="text-white font-bold text-sm mt-0.5">AIIMS New Delhi Emergency</p>
                    <p className="text-slate-400 text-[11px] mt-1">Status: En route via Ambulance 108 • ETA 9 mins</p>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                    <span>Bed 4 Reserved (Acute Bay)</span>
                    <span className="font-mono text-[10px]">ACKNOWLEDGED</span>
                  </div>
                </div>
              )}

              {current.num === 4 && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Clinician Source Order</span>
                    <p className="text-slate-200 font-mono text-[11px]">Tab. Paracetamol 500mg PO Q6H PRN pain. Immobilize left limb.</p>
                  </div>
                  <div className="p-2.5 rounded bg-teal-500/[0.08] border border-teal-500/25">
                    <span className="text-[10px] text-teal-300 uppercase font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Gemini AI Plain Language (Hindi + English)
                    </span>
                    <p className="text-slate-200 text-[11px] mt-0.5">हर 6 घंटे में एक गोली पैरासिटामोल दर्द के लिए लें। पैर को आराम दें।</p>
                  </div>
                </div>
              )}

              {current.num === 5 && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-medium">
                      <span>Daily Recovery Checklist</span>
                      <span className="text-sky-400 font-mono text-[10px]">1 of 3 Done</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-400 h-full w-1/3 rounded-full" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-300">Voice Instructions</span>
                    <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" /> Play Audio
                    </span>
                  </div>
                </div>
              )}

              {current.num === 6 && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Post-Discharge Follow-up</span>
                    <p className="font-bold text-white text-sm">Orthopedic OPD Review</p>
                    <p className="text-slate-400 text-[11px]">Oct 26, 10:00 AM • Automated SMS & App reminder</p>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06] text-slate-400 text-[11px]">
                    Missed appointment protocol: Triggers coordinator re-contact workflow.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3 Problem Statements Interlocking Matrix */}
      <section className="py-16 bg-[#0D1322]/50 border-y border-white/[0.06] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three Problem Statements. Built as One System.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              CareBridge does not treat PS-40, PS-39, and PS-35 as disconnected modules. They form one continuous clinical handover chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PS-40 */}
            <div className="clinical-card p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Problem Statement 40</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Consent-Based QR Record Bridge</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Time-limited, cryptographically scoped QR code that gives first responders immediate access to vital allergies and trauma notes without exposing full lifetime medical history.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>24-hour automatic expiration cutoff</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>1-click patient instant revocation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Audit logged with timestamp and IP</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/emergency-access/demo"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.06]"
              >
                Inspect QR Token Engine <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* PS-39 */}
            <div className="clinical-card p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Problem Statement 39</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Accessible Care Instructions</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Translates complex physician discharge summaries into clear English & Hindi. Generates structured daily checklists with Web Speech audio and strict clinical safety sign-off.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Medicine names & dosages preserved verbatim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Mandatory human doctor approval</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Side-by-side English + Hindi TTS audio</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/clinician/cases/demo-incident-001"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.06]"
              >
                Inspect AI Care Simplifier <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* PS-35 */}
            <div className="clinical-card p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Problem Statement 35</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Follow-up Reminder System</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Continuous outpatient tracking across scheduled, confirmed, and missed visit states. Missed visits trigger operational coordinator tasks without altering doctor prescriptions unreviewed.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Automated appointment lifecycle reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Operational missed-visit escalation queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>1-click patient rescheduling requests</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/care-team/dashboard"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.06]"
              >
                Inspect Care Continuity Desk <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Responsible Clinical Governance Strip */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-6 rounded-2xl bg-[#0D1322] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Responsible Clinical Governance</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                CareBridge AI operates with strict boundaries: AI never diagnoses from incident images, never issues unreviewed prescriptions, and never replaces emergency dispatch services (112 / 108).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/about"
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-xs font-medium text-slate-300 border border-white/[0.08] transition-colors"
            >
              Clinical Limitations
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-xs font-medium text-slate-300 border border-white/[0.08] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
