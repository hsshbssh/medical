'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  QrCode, 
  Sparkles, 
  Calendar, 
  Pill, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Check, 
  RotateCcw,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { Incident, QRAccessToken, CareInstruction, Prescription, FollowUp, ChecklistItem } from '@/lib/types';
import { QRDisplay } from '@/components/QRDisplay';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function PatientDashboardPage() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [token, setToken] = useState<QRAccessToken | null>(null);
  const [careInstruction, setCareInstruction] = useState<CareInstruction | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const loadData = () => {
    const inc = demoDB.incidents[0];
    setIncident(inc || null);

    if (inc) {
      const t = demoDB.getQRTokensByIncident(inc.id)[0];
      setToken(t || null);

      const ci = demoDB.getCareInstructions(inc.id)[0];
      setCareInstruction(ci || null);
      if (ci?.checklist_items) {
        setChecklist([...ci.checklist_items]);
      }

      setPrescriptions([...demoDB.getPrescriptions(inc.id)]);
      setFollowUps([...demoDB.getFollowUps()]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, is_completed: !item.is_completed } : item));
  };

  const handleRevoke = (tokenId: string) => {
    demoDB.revokeQRToken(tokenId);
    loadData();
    alert('QR access token revoked. Scanning this QR code will now immediately deny access.');
  };

  const handleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = lang === 'hi' ? careInstruction?.simplified_text_hindi : careInstruction?.simplified_text;
    if (!text) return;

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utt.rate = 0.9;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={5} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 flex-1 w-full">
      {/* Patient Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Patient Continuity Portal
            </span>
            <span className="text-xs text-slate-400">Priya Patel (ID: PT-98214)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            My Recovery & Care Continuity Center
          </h1>
          <p className="text-xs text-slate-400">
            Control your emergency QR access token (PS-40), review doctor-approved plain-language instructions (PS-39), and manage appointments (PS-35).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-right">
            <span className="text-slate-400 block text-[10.5px]">Emergency Contact</span>
            <span className="font-semibold text-white">Rajesh Patel (+91-9876543220)</span>
          </div>
        </div>
      </div>

      {/* Grid: 3 Major Problem Statements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: PS-40 QR Bridge & Prescriptions */}
        <div className="lg:col-span-5 space-y-6">
          {/* PS-40 Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                PS-40: My Emergency QR Bridge
              </h2>
              <span className="text-[10px] text-slate-400">Patient-Controlled</span>
            </div>

            {token ? (
              <QRDisplay token={token} onRevoke={handleRevoke} />
            ) : (
              <div className="p-6 glass-panel rounded-2xl text-center text-xs text-slate-400">
                No active QR token found.
              </div>
            )}
          </div>

          {/* Electronic Prescriptions */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Pill className="w-3.5 h-3.5 text-sky-400" />
              Verified Doctor Prescriptions
            </h2>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-slate-500">No prescriptions issued for this incident yet.</p>
            ) : (
              prescriptions.map(rx => (
                <div key={rx.id} className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
                    <span>Prescriber: <strong className="text-white">{rx.prescriber_name || 'Dr. Meera Reddy'}</strong></span>
                    <span className="text-emerald-400 font-semibold">{rx.status.toUpperCase()}</span>
                  </div>

                  {rx.medications.map((med, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{med.name}</span>
                        <span className="font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">{med.dosage}</span>
                      </div>
                      <p className="text-slate-300">Take: {med.frequency} for {med.duration} ({med.route})</p>
                      {med.instructions && <p className="text-[11px] text-slate-400">{med.instructions}</p>}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: PS-39 Accessible Care Instructions & PS-35 Follow-ups */}
        <div className="lg:col-span-7 space-y-6">
          {/* PS-39 AI Care Instructions & Interactive Checklist */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                  PS-39 Accessible Guidance
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  My Approved Care Instructions
                </h2>
              </div>

              {/* Language & Audio Controls */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/[0.08] text-xs">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      lang === 'en' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('hi')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      lang === 'hi' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>

                <button
                  onClick={handleSpeech}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-all"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Listen Aloud'}</span>
                </button>
              </div>
            </div>

            {/* Instruction Summary */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto font-sans">
              {lang === 'hi'
                ? careInstruction?.simplified_text_hindi || 'कोई हिंदी निर्देश उपलब्ध नहीं है।'
                : careInstruction?.simplified_text || 'No approved instructions available yet.'
              }
            </div>

            {/* Interactive Recovery Checklist */}
            {checklist.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recovery Action Checklist
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {checklist.filter(c => c.is_completed).length} of {checklist.length} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                        item.is_completed
                          ? 'bg-white/[0.01] border-white/[0.04] opacity-50'
                          : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                        item.is_completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/20 bg-slate-900'
                      }`}>
                        {item.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <span className={`block leading-relaxed ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {item.text}
                        </span>
                      </div>

                      {item.is_critical && (
                        <span className="text-[9.5px] uppercase font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/60 shrink-0">
                          Critical
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PS-35 Upcoming Follow-up Appointments */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                PS-35: Follow-Up Appointments & Reminders
              </h2>
              <span className="text-xs text-slate-400">Outpatient Schedule</span>
            </div>

            {followUps.length === 0 ? (
              <p className="text-xs text-slate-500">No scheduled follow-up appointments yet.</p>
            ) : (
              <div className="space-y-3">
                {followUps.map(fu => (
                  <div key={fu.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{fu.purpose}</span>
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md ${
                        fu.status === 'scheduled' || fu.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}>
                        {fu.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Appointment Date</span>
                        <span>{fu.follow_up_date} at {fu.follow_up_time}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Reminder Telemetry</span>
                        <span className="text-indigo-300 font-semibold">{fu.reminder_status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Coordinator: Nurse Sunita Devi</span>
                      <button
                        onClick={() => alert('Rescheduling request dispatched to Care Team!')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Request Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
