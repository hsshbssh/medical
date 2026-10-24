'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  QrCode, 
  Hospital, 
  Stethoscope, 
  UserCheck, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function WorkflowStepper() {
  const pathname = usePathname();
  const { switchRole } = useAuth();

  const steps = [
    {
      id: 'step-1',
      num: '1',
      label: 'Scene',
      fullLabel: '1. Incident Scene',
      href: '/report-emergency',
      role: 'bystander' as const,
      icon: Activity,
      isActive: pathname === '/report-emergency',
    },
    {
      id: 'step-2',
      num: '2',
      label: 'QR Bridge',
      fullLabel: '2. QR Token Bridge',
      href: '/incident/demo-incident-001',
      role: 'bystander' as const,
      icon: QrCode,
      isActive: pathname.startsWith('/incident') || pathname.startsWith('/emergency-access'),
    },
    {
      id: 'step-3',
      num: '3',
      label: 'ER Desk',
      fullLabel: '3. Hospital Intake',
      href: '/hospital/dashboard',
      role: 'hospital_responder' as const,
      icon: Hospital,
      isActive: pathname.startsWith('/hospital'),
    },
    {
      id: 'step-4',
      num: '4',
      label: 'Clinician AI',
      fullLabel: '4. Clinician & AI Plan',
      href: '/clinician/cases/demo-incident-001',
      role: 'clinician' as const,
      icon: Stethoscope,
      isActive: pathname.startsWith('/clinician'),
    },
    {
      id: 'step-5',
      num: '5',
      label: 'Patient',
      fullLabel: '5. Patient Recovery',
      href: '/patient/dashboard',
      role: 'patient' as const,
      icon: UserCheck,
      isActive: pathname.startsWith('/patient'),
    },
    {
      id: 'step-6',
      num: '6',
      label: 'Follow-up',
      fullLabel: '6. Care Continuity',
      href: '/care-team/dashboard',
      role: 'care_team' as const,
      icon: Calendar,
      isActive: pathname.startsWith('/care-team'),
    },
  ];

  const currentIdx = steps.findIndex(s => s.isActive);
  const nextStep = currentIdx >= 0 && currentIdx < steps.length - 1 ? steps[currentIdx + 1] : null;

  return (
    <div className="bg-[#0A0E1A]/80 border-b border-white/[0.05] py-2 px-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Compact Segmented Stepper */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 mr-2 hidden lg:inline shrink-0">
            Pipeline Flow:
          </span>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <Link
                  href={step.href}
                  onClick={() => switchRole(step.role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                    step.isActive
                      ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    step.isActive ? 'bg-sky-400 text-slate-950' : 'bg-white/10 text-slate-400'
                  }`}>
                    {step.num}
                  </span>
                  <span>{step.label}</span>
                </Link>
                {idx < steps.length - 1 && (
                  <span className="text-white/10 text-[10px] px-0.5">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Quiet Next Step pill */}
        {nextStep && (
          <Link
            href={nextStep.href}
            onClick={() => switchRole(nextStep.role)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-[11px] font-medium border border-white/[0.08] transition-all shrink-0"
          >
            <span>Next: {nextStep.label}</span>
            <ArrowRight className="w-3 h-3 text-sky-400" />
          </Link>
        )}
      </div>
    </div>
  );
}
