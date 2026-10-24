'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  HeartHandshake, 
  Activity, 
  QrCode, 
  Hospital, 
  Stethoscope, 
  UserCheck, 
  Calendar,
  Phone,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole, availableRoles } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobilePipelineOpen, setMobilePipelineOpen] = useState(false);

  // The 6 Continuous Stages of the Care Continuum Pipeline
  const pipelineStages = [
    {
      num: 1,
      id: 'scene',
      label: 'Scene Report',
      ps: 'Field Intake',
      href: '/report-emergency',
      role: 'bystander' as UserRole,
      icon: Activity,
      isActive: pathname === '/report-emergency',
    },
    {
      num: 2,
      id: 'qr',
      label: 'QR Bridge',
      ps: 'PS-40',
      href: '/incident/demo-incident-001',
      role: 'bystander' as UserRole,
      icon: QrCode,
      isActive: pathname.startsWith('/incident') || pathname.startsWith('/emergency-access'),
    },
    {
      num: 3,
      id: 'hospital',
      label: 'ER Intake',
      ps: 'Triage Desk',
      href: '/hospital/dashboard',
      role: 'hospital_responder' as UserRole,
      icon: Hospital,
      isActive: pathname.startsWith('/hospital'),
    },
    {
      num: 4,
      id: 'clinician',
      label: 'Clinician AI',
      ps: 'PS-39',
      href: '/clinician/cases/demo-incident-001',
      role: 'clinician' as UserRole,
      icon: Stethoscope,
      isActive: pathname.startsWith('/clinician'),
    },
    {
      num: 5,
      id: 'patient',
      label: 'Recovery Portal',
      ps: 'Patient App',
      href: '/patient/dashboard',
      role: 'patient' as UserRole,
      icon: UserCheck,
      isActive: pathname.startsWith('/patient'),
    },
    {
      num: 6,
      id: 'followup',
      label: 'Continuity',
      ps: 'PS-35',
      href: '/care-team/dashboard',
      role: 'care_team' as UserRole,
      icon: Calendar,
      isActive: pathname.startsWith('/care-team'),
    },
  ];

  const currentStageIdx = pipelineStages.findIndex(s => s.isActive);
  const nextStage = currentStageIdx >= 0 && currentStageIdx < pipelineStages.length - 1 ? pipelineStages[currentStageIdx + 1] : null;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#080C14]/90 border-b border-white/[0.08] transition-all">
      {/* 1. Ultra-Thin Emergency Priority Hotline Ribbon */}
      <div className="bg-[#120808]/90 border-b border-rose-950/60 px-4 py-1 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-300">
              <strong className="text-rose-400 font-semibold uppercase tracking-wider text-[10px] mr-1.5">Emergency Dispatch:</strong>
              Immediate life-threat? Call emergency services first.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-[10.5px] transition-colors"
            >
              <Phone className="w-2.5 h-2.5 fill-current" /> Dial 112
            </a>
            <a
              href="tel:108"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-[10.5px] border border-white/[0.08] transition-colors"
            >
              <Phone className="w-2.5 h-2.5" /> Ambulance 108
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo & Live Case Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 shadow-[0_0_15px_-3px_rgba(14,165,233,0.5)] group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                CareBridge<span className="text-sky-400 font-extrabold">AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                Healthcare Continuity
              </span>
            </div>
          </Link>

          {/* Active Synthetic Incident Pill */}
          <Link
            href="/incident/demo-incident-001"
            className="hidden xl:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/[0.07] border border-sky-500/20 text-[11px] text-sky-300 hover:bg-sky-500/[0.12] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-slate-400 font-semibold">INC-8821:</span>
            <span className="font-medium text-slate-200">Rohan Mehta (32M)</span>
          </Link>
        </div>

        {/* 3. Unified Continuous Pipeline Navigator (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0D1322] p-1 rounded-xl border border-white/[0.08] shadow-inner">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = stage.isActive;

            return (
              <React.Fragment key={stage.id}>
                <Link
                  href={stage.href}
                  onClick={() => switchRole(stage.role)}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isCurrent
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                  title={`${stage.label} (${stage.ps})`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-slate-950 text-sky-400' : 'bg-white/10 text-slate-400'
                  }`}>
                    {stage.num}
                  </span>
                  <span className="tracking-tight">{stage.label}</span>
                  <span className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                    isCurrent ? 'bg-slate-950/20 text-slate-900 font-semibold' : 'text-slate-500'
                  }`}>
                    {stage.ps}
                  </span>
                </Link>
                {idx < pipelineStages.length - 1 && (
                  <span className="text-white/10 text-[11px] px-0.5 select-none">›</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* 4. Controls: Role Selector & Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile Pipeline Toggle Button */}
          <button
            onClick={() => setMobilePipelineOpen(!mobilePipelineOpen)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Stages ({currentStageIdx + 1}/6)</span>
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 bg-[#0E1424] hover:bg-[#131B30] border border-white/[0.1] hover:border-sky-500/30 text-slate-200 text-xs py-1.5 px-3 rounded-lg transition-all shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              <div className="text-left flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] hidden sm:inline">Role:</span>
                <span className="font-semibold text-white text-[11.5px]">{user?.full_name || 'Rahul Sharma'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 opacity-70" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0D1322] border border-white/[0.12] rounded-xl shadow-2xl z-50 py-2 divide-y divide-white/[0.06] backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2">
                  <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Evaluation Persona Switcher</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Switch perspective across the care continuum</p>
                </div>
                <div className="py-1">
                  {availableRoles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                        role === r.role ? 'bg-sky-500/10 text-sky-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="block text-[12px] font-medium">{r.label}</span>
                        <span className="text-[10.5px] text-slate-400">{r.name}</span>
                      </div>
                      {role === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
                <div className="px-3.5 py-2 text-[10.5px] text-slate-500 flex items-center justify-between">
                  <span>Role: {role}</span>
                  <Link href="/about" className="text-sky-400 hover:underline">Limitations</Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Dispatch / Next Action Button */}
          {nextStage ? (
            <Link
              href={nextStage.href}
              onClick={() => switchRole(nextStage.role)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all shadow-sm"
            >
              <span>Next: {nextStage.label}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <Link
              href="/report-emergency"
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Pipeline Drawer (Dropdown on small screens) */}
      {mobilePipelineOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0A0F1D] px-4 py-3 space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Continuity Pipeline Stages:</p>
          <div className="grid grid-cols-2 gap-2">
            {pipelineStages.map(stage => {
              const Icon = stage.icon;
              return (
                <Link
                  key={stage.id}
                  href={stage.href}
                  onClick={() => {
                    switchRole(stage.role);
                    setMobilePipelineOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                    stage.isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-white/[0.02] text-slate-300 border border-white/[0.05]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-sky-400" />
                  <div>
                    <span className="block font-semibold">{stage.num}. {stage.label}</span>
                    <span className="text-[10px] text-slate-500">{stage.ps}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
