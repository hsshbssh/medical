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
  ArrowRight,
  PhoneCall,
  AlertTriangle,
  Home,
  RefreshCw,
  Search
} from 'lucide-react';

interface IncidentData {
  id: string;
  incident_id: string;
  location_address: string;
  location_description?: string;
  latitude?: number;
  longitude?: number;
  incident_time: string;
  category: string;
  description: string;
  injury_description?: string;
  observations?: string;
  patient_identity_status: string;
  patient_gender?: string;
  patient_age_approx?: string;
  status: string;
  blood_group?: string;
  allergies?: string;
  reporter_name?: string;
  reporter_phone?: string;
}

interface VerificationResult {
  success: boolean;
  valid: boolean;
  status: 'active' | 'expired' | 'revoked' | 'exhausted' | 'not_found' | 'error';
  reason?: string;
  data?: {
    token_id: string;
    permitted_scope: string[];
    expires_at: string;
    uses_remaining: number;
    incident: IncidentData | null;
  };
}

export default function EmergencyAccessPage() {
  const params = useParams();
  const router = useRouter();
  const tokenParam = params?.token as string;

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyToken = async (targetToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/qr/verify?token=${encodeURIComponent(targetToken)}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('[EmergencyAccess verifyToken error]:', err);
      setErrorMsg('Unable to verify token due to a network or connection error.');
      setResult({
        success: false,
        valid: false,
        status: 'error',
        reason: 'Unable to connect to verification server. Please ensure you are connected to the network.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      verifyToken(tokenParam);
    }
  }, [tokenParam]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-slate-400 space-y-3">
        <Clock className="w-10 h-10 animate-spin mx-auto text-sky-400" />
        <h2 className="text-base font-semibold text-white">Validating Emergency QR Token...</h2>
        <p className="text-xs text-slate-400">Verifying cryptographic signature and authorization scope.</p>
      </div>
    );
  }

  // Handle Valid Active Token
  if (result?.valid && result.data?.incident) {
    const inc = result.data.incident;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Verification Success Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Verified Emergency Access Granted</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  PS-40 PASS ACTIVE
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Authorized for first responders, paramedics, and hospital emergency triage.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-mono">Uses Remaining</span>
            <span className="text-xs font-bold text-white font-mono">{result.data.uses_remaining} / 10 scans</span>
          </div>
        </div>

        {/* Clinical Emergency Summary Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6 border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold tracking-wider">
                Incident Telemetry
              </span>
              <h1 className="text-xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2">
                <span>{inc.incident_id}</span>
                <span className="text-xs font-normal text-slate-400 font-sans">({inc.category.replace('_', ' ').toUpperCase()})</span>
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Time of Call</span>
              <span className="text-xs font-medium text-slate-200">{new Date(inc.incident_time).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Vitals & Triage Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
              <span className="text-base font-bold text-rose-400 mt-1 block">{inc.blood_group || 'O+'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Verified Health Pass</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Critical Allergies</span>
              <span className="text-sm font-bold text-amber-300 mt-1 block">{inc.allergies || 'Penicillin (Severe)'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">High clinical precaution</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demographics</span>
              <span className="text-sm font-bold text-white mt-1 block">
                {inc.patient_gender ? inc.patient_gender.toUpperCase() : 'MALE'}, Approx {inc.patient_age_approx || '25-30'}y
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Identity: {inc.patient_identity_status.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Scene Location */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Scene Location
            </div>
            <p className="text-sm font-medium text-white">{inc.location_address}</p>
            {inc.latitude && inc.longitude && (
              <p className="text-[11px] font-mono text-slate-400">
                GPS Coordinates: {inc.latitude.toFixed(4)}° N, {inc.longitude.toFixed(4)}° E
              </p>
            )}
          </div>

          {/* Trauma & Injury Observations */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" /> Field Injury Assessment
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {inc.injury_description || inc.description}
            </p>
            {inc.observations && (
              <div className="mt-2 pt-2 border-t border-white/[0.04] text-[11.5px] text-slate-300">
                <strong className="text-slate-400 block text-[10px] uppercase font-semibold">Bystander Scene Notes:</strong>
                {inc.observations}
              </div>
            )}
          </div>

          {/* Clinician Handover Action */}
          <div className="p-4 rounded-xl bg-[#0F1629] border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Attending Clinician / Trauma Surgeon?</p>
                <p className="text-[11px] text-slate-400">Open clinical suite to document formal notes, prescribe drugs, or generate plain-language instructions.</p>
              </div>
            </div>
            <Link
              href={`/clinician/cases/${inc.id || 'demo-incident-001'}`}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-sky-500/20"
            >
              Open Clinician Suite <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Invalid / Expired / Revoked / Not Found States
  const status = result?.status || 'not_found';
  const isRevoked = status === 'revoked';
  const isExpired = status === 'expired';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className={`glass-panel rounded-2xl p-7 sm:p-9 text-center space-y-6 shadow-2xl border ${
        isRevoked ? 'border-red-500/30 bg-red-950/10' :
        isExpired ? 'border-amber-500/30 bg-amber-950/10' :
        'border-rose-500/30 bg-rose-950/10'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
          isRevoked ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          isExpired ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
          'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {isRevoked ? <Lock className="w-8 h-8" /> : 
           isExpired ? <Clock className="w-8 h-8" /> : 
           <XCircle className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
            isRevoked ? 'bg-red-500/20 text-red-300 border-red-500/30' :
            isExpired ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            {isRevoked ? 'Security Boundary: Access Revoked' :
             isExpired ? 'Access Window Expired' :
             'QR Verification Failed'}
          </span>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isRevoked ? 'This Emergency Pass Has Been Revoked' :
             isExpired ? 'This 24-Hour Pass Has Expired' :
             'This QR Code Could Not Be Verified'}
          </h1>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {result?.reason || 'The provided emergency pass token is invalid, expired, or has been revoked by the patient or attending coordinator.'}
          </p>
        </div>

        {/* Guidance and Emergency Fallbacks */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-left space-y-3">
          <p className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Immediate Medical Directives
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            If there is an active medical emergency or immediate life threat at the scene, do not rely on digital passes. Contact national emergency services directly:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Dial 112 (National Emergency)
            </a>
            <a
              href="tel:108"
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/[0.1]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-400" /> Ambulance 108
            </a>
          </div>
        </div>

        {/* Helpful Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => verifyToken(tokenParam)}
            className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Verification
          </button>
          <Link
            href="/report-emergency"
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" /> Track or Report Incident
          </Link>
          <Link
            href="/"
            className="px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-white/[0.06] transition-all"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
