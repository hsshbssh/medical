'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Stethoscope, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  Calendar, 
  FileText, 
  Pill, 
  AlertTriangle, 
  ArrowLeft,
  ShieldCheck,
  Send,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { Incident, CareInstruction, Prescription, FollowUp, ChecklistItem } from '@/lib/types';
import { simplifyCareInstructions } from '@/lib/gemini';
import { useAuth } from '@/lib/auth-context';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function ClinicianCaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params?.incidentId as string;
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'instructions' | 'prescription' | 'followup' | 'assessment'>('instructions');

  // Assessment State
  const [assessmentNotes, setAssessmentNotes] = useState('Suspected left patellar/tibial injury with superficial forearm abrasion. Limb immobilized. Patient alert and hemodynamically stable.');
  const [assessmentSaved, setAssessmentSaved] = useState(false);

  // AI Care Instructions (PS-39) State
  const [sourceNotes, setSourceNotes] = useState(
    `Post-initial assessment care: 1. Immobilize the left lower extremity using available splinting material. 2. Clean the forearm abrasion with normal saline and apply sterile dressing. 3. Monitor for signs of compartment syndrome including increasing pain, pallor, pulselessness, paresthesia. 4. Administer analgesic as prescribed - Tab. Paracetamol 500mg PO every 6 hours for pain, maximum 4 doses in 24 hours. 5. Apply ice pack to knee region for 15-20 minutes every 2 hours. 6. Keep limb elevated above heart level when resting. 7. Follow up at orthopedic OPD within 48 hours for X-ray review. 8. Return immediately if: increasing swelling, numbness/tingling, fever >100.4F, wound shows signs of infection (redness, warmth, discharge).`
  );
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiDraftEn, setAiDraftEn] = useState<string | null>(null);
  const [aiDraftHi, setAiDraftHi] = useState<string | null>(null);
  const [aiChecklist, setAiChecklist] = useState<ChecklistItem[]>([]);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi'>('en');
  const [isApproved, setIsApproved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Prescription Form State
  const [meds, setMeds] = useState([
    { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3 days', route: 'Oral', instructions: 'Take with food for pain. Do not exceed 4 tabs/day.' }
  ]);
  const [rxNotes, setRxNotes] = useState('Mild-to-moderate analgesia for trauma pain. Monitor for allergies.');
  const [rxIssued, setRxIssued] = useState(false);

  // Follow-up Form State (PS-35)
  const [fuDate, setFuDate] = useState('2026-10-26');
  const [fuTime, setFuTime] = useState('10:00');
  const [fuPurpose, setFuPurpose] = useState('X-ray review and orthopedic evaluation');
  const [fuScheduled, setFuScheduled] = useState(false);

  useEffect(() => {
    if (!incidentId) return;
    const inc = demoDB.getIncident(incidentId);
    if (inc) {
      setIncident({ ...inc });
      const existing = demoDB.getCareInstructions(inc.id)[0];
      if (existing) {
        setAiDraftEn(existing.simplified_text || null);
        setAiDraftHi(existing.simplified_text_hindi || null);
        setAiChecklist(existing.checklist_items || []);
        setIsApproved(existing.approval_status === 'approved');
      }
    }
    setLoading(false);
  }, [incidentId]);

  const handleGenerateAi = async () => {
    setIsAiGenerating(true);
    try {
      const res = await simplifyCareInstructions({
        sourceText: sourceNotes,
        targetLanguage: 'both',
      });
      setAiDraftEn(res.simplifiedTextEn);
      setAiDraftHi(res.simplifiedTextHi);
      setAiChecklist(res.checklistItems);
      setIsApproved(false);
    } catch (e) {
      alert('Error running AI simplification.');
    }
    setIsAiGenerating(false);
  };

  const handleApproveCareInstructions = () => {
    if (!incident || !aiDraftEn) return;
    demoDB.createCareInstruction({
      incident_id: incident.id,
      patient_id: 'demo-patient-001',
      original_text: sourceNotes,
      simplified_text: aiDraftEn,
      simplified_text_hindi: aiDraftHi || undefined,
      language: selectedLang,
      checklist_items: aiChecklist,
      ai_model_used: 'gemini-1.5-flash',
      approval_status: 'approved',
      author_id: user?.id || 'demo-clinician-001',
      author_name: user?.full_name || 'Dr. Meera Reddy',
      reviewer_id: user?.id || 'demo-clinician-001',
      reviewer_name: user?.full_name || 'Dr. Meera Reddy',
      reviewed_at: new Date().toISOString(),
      version: 1,
    });

    demoDB.logAudit({
      actor_id: user?.id || 'demo-clinician-001',
      actor_role: 'clinician',
      event_type: 'care_instruction_approved',
      resource_type: 'care_instruction',
      resource_id: incident.id,
      description: `Clinician approved AI simplified care instructions in English and Hindi`,
      result: 'success',
    });

    setIsApproved(true);
    alert('Care instructions formally approved and published to Patient Portal!');
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = selectedLang === 'hi' ? aiDraftHi : aiDraftEn;
    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleIssuePrescription = () => {
    if (!incident) return;
    demoDB.createPrescription({
      incident_id: incident.id,
      prescriber_id: user?.id || 'demo-clinician-001',
      prescriber_name: user?.full_name || 'Dr. Meera Reddy',
      patient_id: 'demo-patient-001',
      medications: meds,
      clinical_notes: rxNotes,
      status: 'issued',
      issued_at: new Date().toISOString(),
    });

    demoDB.logAudit({
      actor_id: user?.id || 'demo-clinician-001',
      actor_role: 'clinician',
      event_type: 'prescription_issued',
      resource_type: 'prescription',
      resource_id: incident.id,
      description: `Prescription issued for ${meds.map(m => m.name).join(', ')}`,
      result: 'success',
    });

    setRxIssued(true);
    alert('Verified electronic prescription issued and linked to patient file!');
  };

  const handleScheduleFollowup = () => {
    if (!incident) return;
    demoDB.createFollowUp({
      patient_id: 'demo-patient-001',
      incident_id: incident.id,
      clinician_id: user?.id || 'demo-clinician-001',
      care_team_member_id: 'demo-careteam-001',
      follow_up_date: fuDate,
      follow_up_time: fuTime,
      purpose: fuPurpose,
      status: 'scheduled',
      reminder_status: 'pending',
    });

    demoDB.logAudit({
      actor_id: user?.id || 'demo-clinician-001',
      actor_role: 'clinician',
      event_type: 'followup_created',
      resource_type: 'follow_up',
      resource_id: incident.id,
      description: `Scheduled follow-up for ${fuDate} at ${fuTime}`,
      result: 'success',
    });

    setFuScheduled(true);
    alert('Follow-up appointment scheduled! Monitored by Care Team.');
  };

  if (loading || !incident) {
    return <div className="p-16 text-center text-slate-400">Loading case file...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={4} incidentId={incident.incident_id} />
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-6 flex-1 w-full">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/clinician/dashboard"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clinician Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                Case Assessment
              </span>
              <span className="text-xs font-mono font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                {incident.incident_id}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
              Clinical Assessment & Care Instructions Suite
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Scene: {incident.location_address} • Patient: {incident.patient_identity_status.replace('_', ' ')} ({incident.patient_gender || 'M'})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/incident/${incident.id}`}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> View Public Scene Card
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] gap-1 text-xs">
        {[
          { id: 'instructions', label: 'PS-39: AI Care Instructions', icon: Sparkles },
          { id: 'prescription', label: 'Clinical Prescription', icon: Pill },
          { id: 'followup', label: 'PS-35: Schedule Follow-up', icon: Calendar },
          { id: 'assessment', label: 'Physician Assessment', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-medium flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? 'border-sky-500 text-sky-300 bg-sky-500/10 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI CARE INSTRUCTIONS (PS-39) */}
      {activeTab === 'instructions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Clinician's Source Input */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  1. Clinician&apos;s Source Orders
                </h3>
                <span className="text-[10px] text-slate-400">Clinical Source</span>
              </div>

              <textarea
                rows={12}
                value={sourceNotes}
                onChange={e => setSourceNotes(e.target.value)}
                placeholder="Paste or enter detailed clinical discharge instructions..."
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-xs text-white leading-relaxed font-mono focus:border-teal-500"
              />

              <button
                onClick={handleGenerateAi}
                disabled={isAiGenerating}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAiGenerating ? 'Simplifying with Gemini AI...' : 'Simplify with Gemini AI'}
              </button>
            </div>

            {/* Right: AI Draft, Bilingual View & Review */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      2. AI Plain-Language Draft
                    </span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md ${
                      isApproved
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {isApproved ? '✓ Clinician Approved' : 'Draft Under Review'}
                    </span>
                  </div>

                  {/* Language & TTS Controls */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/[0.08] text-xs">
                      <button
                        onClick={() => setSelectedLang('en')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedLang === 'en' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setSelectedLang('hi')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedLang === 'hi' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        हिंदी (Hindi)
                      </button>
                    </div>

                    <button
                      onClick={handleToggleSpeech}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all"
                      title={isSpeaking ? 'Stop Audio' : 'Listen via Text-to-Speech'}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400 animate-pulse" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                    </button>
                  </div>
                </div>

                {/* Simplified Text Output */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto font-sans">
                  {selectedLang === 'hi'
                    ? (aiDraftHi || 'No Hindi translation available yet. Click "Simplify with Gemini AI".')
                    : (aiDraftEn || 'Click "Simplify with Gemini AI" to transform doctor notes into patient-accessible format.')
                  }
                </div>

                {/* Structured Interactive Checklist Items */}
                {aiChecklist.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                      Generated Action Checklist ({aiChecklist.length} Items):
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {aiChecklist.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-start gap-2 text-xs"
                        >
                          <span className="text-slate-400 font-mono text-[11px] mt-0.5">{idx + 1}.</span>
                          <div className="flex-1">
                            <span className="text-slate-200">{item.text}</span>
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

              {/* Sign-Off / Approval Button */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Reviewer: <strong className="text-white">{user?.full_name || 'Dr. Meera Reddy'}</strong>
                </span>

                <button
                  onClick={handleApproveCareInstructions}
                  disabled={!aiDraftEn || isApproved}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApproved ? 'Instructions Approved & Live' : 'Approve Clinical Care Instructions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL PRESCRIPTION */}
      {activeTab === 'prescription' && (
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Authorized Clinical Action
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Electronic Medical Prescription
              </h2>
            </div>
            {rxIssued && (
              <span className="text-xs bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Prescription Issued
              </span>
            )}
          </div>

          <div className="space-y-4">
            {meds.map((med, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10.5px] text-slate-400 uppercase font-medium block mb-1">Medicine Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={e => {
                        const newMeds = [...meds];
                        newMeds[index].name = e.target.value;
                        setMeds(newMeds);
                      }}
                      className="w-full bg-[#111726] border border-white/[0.08] rounded-lg p-2 text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] text-slate-400 uppercase font-medium block mb-1">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={e => {
                        const newMeds = [...meds];
                        newMeds[index].dosage = e.target.value;
                        setMeds(newMeds);
                      }}
                      className="w-full bg-[#111726] border border-white/[0.08] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] text-slate-400 uppercase font-medium block mb-1">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={e => {
                        const newMeds = [...meds];
                        newMeds[index].frequency = e.target.value;
                        setMeds(newMeds);
                      }}
                      className="w-full bg-[#111726] border border-white/[0.08] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-[10.5px] text-slate-400 uppercase font-medium block mb-1">Patient Instructions</label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={e => {
                      const newMeds = [...meds];
                      newMeds[index].instructions = e.target.value;
                      setMeds(newMeds);
                    }}
                    className="w-full bg-[#111726] border border-white/[0.08] rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setMeds([...meds, { name: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' }])}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Medication
            </button>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">Clinical Notes for Pharmacist & Patient</label>
              <textarea
                rows={2}
                value={rxNotes}
                onChange={e => setRxNotes(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleIssuePrescription}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Pill className="w-4 h-4" /> Issue Electronic Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PS-35 SCHEDULE FOLLOW-UP */}
      {activeTab === 'followup' && (
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                PS-35 Continuity Care
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Schedule Patient Recovery Follow-Up
              </h2>
            </div>
            {fuScheduled && (
              <span className="text-xs bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Follow-Up Scheduled
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-medium text-slate-400 uppercase block mb-1">Date</label>
                <input
                  type="date"
                  value={fuDate}
                  onChange={e => setFuDate(e.target.value)}
                  className="w-full bg-[#111726] border border-white/[0.08] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-slate-400 uppercase block mb-1">Time</label>
                <input
                  type="time"
                  value={fuTime}
                  onChange={e => setFuTime(e.target.value)}
                  className="w-full bg-[#111726] border border-white/[0.08] rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-medium text-slate-400 uppercase block mb-1">Appointment Purpose</label>
              <input
                type="text"
                value={fuPurpose}
                onChange={e => setFuPurpose(e.target.value)}
                className="w-full bg-[#111726] border border-white/[0.08] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-slate-300 space-y-1">
              <span className="font-semibold text-white block">Assigned Care Coordinator</span>
              <p className="text-[11px] text-slate-400">Nurse Sunita Devi (Orthopedic Care Team)</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleScheduleFollowup}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4" /> Confirm & Schedule Follow-Up Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PHYSICIAN ASSESSMENT NOTES */}
      {activeTab === 'assessment' && (
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4 max-w-3xl">
          <h2 className="text-base font-bold text-white">Clinical Assessment Findings</h2>
          <textarea
            rows={5}
            value={assessmentNotes}
            onChange={e => setAssessmentNotes(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 text-xs text-white leading-relaxed"
          />
          <button
            onClick={() => {
              demoDB.createClinicianResponse({
                incident_id: incident.id,
                clinician_id: user?.id || 'demo-clinician-001',
                clinician_name: user?.full_name || 'Dr. Meera Reddy',
                response_type: 'initial_assessment',
                content: assessmentNotes,
                status: 'approved',
                is_primary_responder: true,
              });
              setAssessmentSaved(true);
              alert('Assessment notes saved to patient audit log.');
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
          >
            Save Clinical Finding
          </button>
        </div>
      )}
    </div>
  </div>
  );
}
