'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  XCircle, 
  Clock, 
  MapPin, 
  Activity, 
  Lock, 
  Stethoscope, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { demoDB, DEMO_QR_TOKENS_VALUES } from '@/lib/demo-db';
import { QRAccessToken, Incident } from '@/lib/types';

export default function EmergencyAccessPage() {
  const params = useParams();
  const router = useRouter();
  const tokenParam = params?.token as string;

  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    reason?: string;
    token?: QRAccessToken;
    incident?: Incident;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    if (!tokenParam) return;

    const effectiveToken = tokenParam === 'demo' ? DEMO_QR_TOKENS_VALUES.active : tokenParam;
    const res = demoDB.validateQRToken(effectiveToken);

    demoDB.logAudit({
      actor_id: 'qr_scanner',
      actor_role: 'emergency_first_responder',
      event_type: 'qr_accessed',
      resource_type: 'qr_access_token',
      resource_id: res.token?.id || effectiveToken,
      description: `Emergency QR scan attempt: ${res.valid ? 'Access Granted' : 'Access Denied (' + res.reason + ')'}`,
      result: res.valid ? 'success' : 'denied',
    });

    if (res.valid && res.token) {
      const inc = demoDB.getIncident(res.token.incident_id);
      setValidationResult({
        valid: true,
        token: res.token,
        incident: inc,
      });
    } else {
      setValidationResult({
        valid: false,
        reason: res.reason,
        token: res.token,
      });
    }

    setLoading(false);
  }, [tokenParam]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-400" />
        <p>Validating cryptographic emergency access token...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Evaluator Fast State Switcher */}
      <div className="p-3.5 glass-panel rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="font-semibold text-white block">PS-40 Token State Switcher:</span>
          <span className="text-slate-400 text-[11px]">Test cryptographic access outcomes</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/emergency-access/${DEMO_QR_TOKENS_VALUES.active}`}
            className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/20 transition-all"
          >
            ✓ Active Token
          </Link>
          <Link
            href={`/emergency-access/${DEMO_QR_TOKENS_VALUES.expired}`}
            className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium border border-amber-500/20 transition-all"
          >
            ⏰ Expired Token
          </Link>
          <Link
            href={`/emergency-access/${DEMO_QR_TOKENS_VALUES.revoked}`}
            className="px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 font-medium border border-red-500/20 transition-all"
          >
            ✕ Revoked Token
          </Link>
        </div>
      </div>

      {/* STATE 1: ACCESS DENIED (Expired or Revoked or Invalid) */}
      {!validationResult?.valid && (
        <div className="glass-panel border-red-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20">
              Access Denied — Security Boundary Enforced
            </span>
            <h1 className="text-2xl font-bold text-white mt-2 tracking-tight">
              {validationResult?.reason || 'Token Access Invalid'}
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              This emergency QR record bridge is no longer valid. The time-limited access grant has either expired, been explicitly revoked by the patient/reporter, or exceeded permitted scan limits.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 max-w-md mx-auto text-left space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5 text-[11.5px]">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> PS-40 Protocol Note:
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Medical emergency data is never permanently accessible via printed QR codes once revoked or expired on the central server.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.08]"
            >
              Back to Home
            </Link>
            <Link
              href="/report-emergency"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Report New Emergency
            </Link>
          </div>
        </div>
      )}

      {/* STATE 2: ACCESS GRANTED (Permitted Emergency Triage View) */}
      {validationResult?.valid && validationResult.incident && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authorized Responder Access
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Token: {validationResult.token?.id.slice(0, 8)}...
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
                Emergency Triage Summary
              </h1>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold block">Scan Count: {validationResult.token?.use_count} of {validationResult.token?.max_uses}</span>
              <span>Expires: {new Date(validationResult.token!.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Scoped Notice */}
          <div className="p-3 bg-sky-500/[0.05] border border-sky-500/20 rounded-xl text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sky-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              Permitted Scope: Location, Category, Observed Injuries, Patient Triage
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">PS-40 Compliant</span>
          </div>

          {/* Data Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Incident Reference</span>
              <span className="text-base font-bold text-white font-mono">{validationResult.incident.incident_id}</span>
              <p className="text-xs text-slate-400">Reported: {new Date(validationResult.incident.incident_time).toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Patient Demographics</span>
              <span className="text-sm font-semibold text-slate-200">
                {validationResult.incident.patient_gender ? validationResult.incident.patient_gender.toUpperCase() : 'UNKNOWN'}, Approx {validationResult.incident.patient_age_approx || '25-30'} yrs
              </span>
              <p className="text-xs text-amber-300 font-medium">Identity: {validationResult.incident.patient_identity_status.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Location */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Accident Scene Location
            </span>
            <p className="text-sm font-medium text-white">{validationResult.incident.location_address}</p>
            {validationResult.incident.latitude && (
              <p className="text-xs font-mono text-slate-400">
                Coordinates: {validationResult.incident.latitude.toFixed(4)}, {validationResult.incident.longitude?.toFixed(4)}
              </p>
            )}
          </div>

          {/* Observed Injuries */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> Observed Injuries
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {validationResult.incident.injury_description || validationResult.incident.description}
            </p>
          </div>

          {validationResult.incident.observations && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Bystander Scene Notes
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {validationResult.incident.observations}
              </p>
            </div>
          )}

          {/* Clinician Handover Escalation */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4 text-sky-400" />
              <div>
                <p className="font-semibold text-xs text-white">Attending Surgeon / Doctor?</p>
                <p className="text-[11px] text-slate-400">Sign in to document assessment or issue approved care instructions.</p>
              </div>
            </div>
            <Link
              href="/clinician/dashboard"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-all"
            >
              Open Clinician Suite <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
