'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Activity, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Pill 
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { Incident, CareInstruction, Prescription } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function ClinicianDashboardPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [instructions, setInstructions] = useState<CareInstruction[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    setIncidents(demoDB.getAllIncidents());
    setInstructions(demoDB.getCareInstructions());
    setPrescriptions(demoDB.getPrescriptions());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-sky-400" /> Attending Trauma Clinician
            </span>
            <span className="text-xs text-slate-400">Dr. Meera Reddy (Orthopedic Trauma)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Clinical Triage, AI Instructions & Prescriptions
          </h1>
          <p className="text-xs text-slate-400">
            Review emergency scene cases, generate simplified AI care plans (PS-39), issue verified prescriptions, and schedule follow-ups (PS-35).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-right">
            <span className="text-slate-400 block text-[10.5px]">Trauma Roster</span>
            <strong className="text-white text-sm">{incidents.length} Active Cases</strong>
          </div>
        </div>
      </div>

      {/* Safety Protocol Banner */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Clinical Safety Protocol (Section 4 Compliance):</p>
          <p className="text-[11.5px] text-slate-400 leading-relaxed">
            All AI-assisted care instructions remain in <strong>Draft Status</strong> until you review and sign off. Medicine names, exact dosages, frequencies, and red-flag return precautions are strictly validated. Prescriptions originate exclusively from authenticated clinical actions.
          </p>
        </div>
      </div>

      {/* Assigned Cases Table */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Assigned Emergency Trauma Cases
          </h2>
          <span className="text-xs text-slate-400">Showing active queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.02] text-slate-400 text-[10.5px] uppercase tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Case ID</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Patient Demographics</th>
                <th className="py-3 px-4 font-semibold">AI Care Plan</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {incidents.map(inc => {
                const hasApprovedInstruction = instructions.some(i => i.incident_id === inc.id && i.approval_status === 'approved');

                return (
                  <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {inc.incident_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {inc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {inc.location_address}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-amber-300/90 capitalize">
                        {inc.patient_identity_status.replace('_', ' ')} ({inc.patient_gender || 'M'})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {hasApprovedInstruction ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
                        </span>
                      ) : (
                        <span className="text-[10px] bg-white/[0.04] text-slate-400 px-2 py-0.5 rounded-md border border-white/[0.06] w-fit block font-medium">
                          Draft / Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/clinician/cases/${inc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-all shadow-sm"
                      >
                        Clinical Review <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">PS-39 Instructions</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{instructions.length}</div>
          <p className="text-[11px] text-slate-400">Clinician-approved accessible care instruction packages.</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">Prescriptions Issued</span>
            <Pill className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{prescriptions.length}</div>
          <p className="text-[11px] text-slate-400">Authorized clinician electronic prescriptions recorded.</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">PS-35 Follow-ups</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{demoDB.followUps.length}</div>
          <p className="text-[11px] text-slate-400">Outpatient recovery appointments scheduled.</p>
        </div>
      </div>
    </div>
  );
}
