'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft, 
  ArrowRight, 
  Activity, 
  QrCode, 
  Hospital, 
  Stethoscope, 
  UserCheck, 
  Calendar,
  CheckCircle2,
  Sparkles,
  Shield
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface CaseContinuityBarProps {
  currentStage: 1 | 2 | 3 | 4 | 5 | 6;
  incidentId?: string;
  patientName?: string;
}

export function CaseContinuityBar({
  currentStage,
  incidentId = 'demo-incident-001',
  patientName = 'Rohan Mehta (32M)',
}: CaseContinuityBarProps) {
  const router = useRouter();
  const { switchRole } = useAuth();

  const stages = [
    {
      num: 1,
      title: 'Scene Report',
      ps: 'Field Intake',
      role: 'bystander' as UserRole,
      route: '/report-emergency',
      icon: Activity,
    },
    {
      num: 2,
      title: 'QR Access Pass',
      ps: 'PS-40',
      role: 'bystander' as UserRole,
      route: `/incident/${incidentId}`,
      icon: QrCode,
    },
    {
      num: 3,
      title: 'ER Reception Desk',
      ps: 'Hospital Intake',
      role: 'hospital_responder' as UserRole,
      route: '/hospital/dashboard',
      icon: Hospital,
    },
    {
      num: 4,
      title: 'Clinician AI Suite',
      ps: 'PS-39',
      role: 'clinician' as UserRole,
      route: `/clinician/cases/${incidentId}`,
      icon: Stethoscope,
    },
    {
      num: 5,
      title: 'Patient Recovery',
      ps: 'Discharge Portal',
      role: 'patient' as UserRole,
      route: '/patient/dashboard',
      icon: UserCheck,
    },
    {
      num: 6,
      title: 'Care Continuity',
      ps: 'PS-35',
      role: 'care_team' as UserRole,
      route: '/care-team/dashboard',
      icon: Calendar,
    },
  ];

  const current = stages[currentStage - 1];
  const prev = currentStage > 1 ? stages[currentStage - 2] : null;
  const next = currentStage < 6 ? stages[currentStage] : null;

  const navigateToStage = (targetStage: typeof stages[0]) => {
    switchRole(targetStage.role);
    router.push(targetStage.route);
  };

  return (
    <div className="bg-[#0A0F1D] border-b border-white/[0.08] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Active Case Identity & Problem Statement Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-sky-400 font-bold text-[11px]">ACTIVE CASE:</span>
            <span className="text-white font-semibold">{incidentId.toUpperCase()}</span>
            <span className="text-slate-400 font-medium">({patientName})</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 text-[10.5px] font-mono border border-sky-500/20">
            {current.ps} Stage {currentStage} of 6
          </span>
        </div>

        {/* Center: Stage Progression Tracker */}
        <div className="hidden lg:flex items-center gap-1 bg-[#080C14] px-2 py-1 rounded-lg border border-white/[0.06]">
          {stages.map((s, idx) => {
            const isCurrent = s.num === currentStage;
            const isCompleted = s.num < currentStage;

            return (
              <button
                key={s.num}
                onClick={() => navigateToStage(s)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : isCompleted
                    ? 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                title={`Jump to Stage ${s.num}: ${s.title}`}
              >
                <span className={`w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-bold ${
                  isCurrent ? 'bg-slate-950 text-sky-400' : isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : s.num}
                </span>
                <span>{s.title}</span>
                {idx < stages.length - 1 && <span className="text-white/10 ml-1">›</span>}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Previous / Next Flow Controls */}
        <div className="flex items-center gap-2">
          {prev && (
            <button
              onClick={() => navigateToStage(prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[11px] font-medium border border-white/[0.06] transition-colors"
            >
              <ArrowLeft className="w-3 h-3 text-slate-400" />
              <span>Back: {prev.title}</span>
            </button>
          )}

          {next ? (
            <button
              onClick={() => navigateToStage(next)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-bold shadow-sm transition-all"
            >
              <span>Next: {next.title}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Pipeline Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
