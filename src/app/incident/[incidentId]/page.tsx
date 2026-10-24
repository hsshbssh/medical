'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Hospital, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { Incident, QRAccessToken, HospitalDispatch, ClinicianResponse, CareInstruction, Prescription } from '@/lib/types';
import { QRDisplay } from '@/components/QRDisplay';
import { HospitalMap } from '@/components/HospitalMap';
import { HospitalIntegrationAdapter } from '@/lib/hospital-adapter';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function IncidentTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params?.incidentId as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [tokens, setTokens] = useState<QRAccessToken[]>([]);
  const [dispatches, setDispatches] = useState<HospitalDispatch[]>([]);
  const [responses, setResponses] = useState<ClinicianResponse[]>([]);
  const [instructions, setInstructions] = useState<CareInstruction[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);

  const loadData = () => {
    if (!incidentId) return;
    const inc = demoDB.getIncident(incidentId);
    if (inc) {
      setIncident({ ...inc });
      setTokens([...demoDB.getQRTokensByIncident(inc.id)]);
      setDispatches([...demoDB.getDispatchesByIncident(inc.id)]);
      setResponses([...demoDB.getResponsesByIncident(inc.id)]);
      setInstructions([...demoDB.getCareInstructions(inc.id)]);
      setPrescriptions([...demoDB.getPrescriptions(inc.id)]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [incidentId]);

  const handleRevokeToken = (tokenId: string) => {
    demoDB.revokeQRToken(tokenId);
    loadData();
  };

  const handleManualDispatch = async (facilityId: string) => {
    if (!incident) return;
    setIsDispatching(true);
    const facility = demoDB.getFacility(facilityId);
    if (facility) {
      await HospitalIntegrationAdapter.dispatchIncident(incident, facility, 'demo');
      loadData();
    }
    setIsDispatching(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-400" />
        <p>Loading incident details & cryptographic access state...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Incident Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested incident record does not exist or has expired.
        </p>
        <Link
          href="/report-emergency"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Report New Emergency
        </Link>
      </div>
    );
  }

  const primaryToken = tokens[0];
  const eligibleFacilities = HospitalIntegrationAdapter.getEligibleFacilities(incident.latitude, incident.longitude, 40);

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={2} incidentId={incident.incident_id} />
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8 flex-1 w-full">
        {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Incident {incident.incident_id}
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Status: {incident.status}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Demo Mode Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Reported on {new Date(incident.incident_time).toLocaleString()}
          </p>
        </div>

        {/* Action button to switch to Clinician review */}
        <div className="flex items-center gap-2">
          <Link
            href="/clinician/dashboard"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-all"
          >
            <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
            <span>Open as Clinician</span>
          </Link>
          <Link
            href="/hospital/dashboard"
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-all"
          >
            <Hospital className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open as Hospital</span>
          </Link>
        </div>
      </div>

      {/* Grid: Left Column (QR & Details), Right Column (Timeline & Hospital Radar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Bridge & Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* PS-40 QR Bridge Card */}
          {primaryToken ? (
            <QRDisplay token={primaryToken} onRevoke={handleRevokeToken} />
          ) : (
            <div className="p-6 glass-panel rounded-2xl text-center text-xs text-slate-400">
              No active QR token associated with this incident.
            </div>
          )}

          {/* Incident Circumstances */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Observed Circumstances & Triage
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Category</span>
                <span className="font-semibold text-white capitalize">{incident.category.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Patient Identity</span>
                <span className="font-semibold text-white capitalize">{incident.patient_identity_status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Approx. Age</span>
                <span className="text-slate-200">{incident.patient_age_approx || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Gender</span>
                <span className="text-slate-200 capitalize">{incident.patient_gender || 'Unknown'}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase mb-1">
                Reported Injuries:
              </span>
              <p className="text-xs text-slate-200 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                {incident.injury_description || incident.description}
              </p>
            </div>

            {incident.observations && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase mb-1">
                  Scene Observations:
                </span>
                <p className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                  {incident.observations}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
              <span>Location: {incident.location_address}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Consent Authorized
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Participating Hospital Dispatch */}
        <div className="lg:col-span-6 space-y-6">
          {/* Incident Timeline */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Incident Audit Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10 text-xs">
              {/* Event 1: Submitted */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                <div>
                  <span className="font-semibold text-white block">Incident Submitted by Bystander</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Minimal packet created with location & initial observations.
                  </p>
                  <span className="text-[10px] text-slate-500">{new Date(incident.created_at).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Event 2: Dispatched */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-slate-950" />
                <div>
                  <span className="font-semibold text-white block">Dispatched to Participating Facilities</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Minimal emergency packet routed to eligible government hospitals.
                  </p>
                  <span className="text-[10px] text-slate-500">{dispatches.length} facilities contacted</span>
                </div>
              </div>

              {/* Event 3: Hospital Acknowledged */}
              {dispatches.some(d => d.status === 'acknowledged' || d.status === 'accepted') && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-slate-950" />
                  <div>
                    <span className="font-semibold text-purple-300 block">Acknowledged by Hospital Emergency Desk</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Case accepted for clinical review by receiving facility.
                    </p>
                  </div>
                </div>
              )}

              {/* Event 4: Clinician Guidance */}
              {responses.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-slate-950" />
                  <div>
                    <span className="font-semibold text-teal-300 block">Verified Clinician Guidance Recorded</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {responses[0].clinician_name}: &quot;{responses[0].content.slice(0, 100)}...&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Event 5: Care Instructions */}
              {instructions.some(i => i.approval_status === 'approved') && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                  <div>
                    <span className="font-semibold text-emerald-300 block">Approved Care Instructions Ready</span>
                    <Link
                      href="/patient/dashboard"
                      className="text-sky-400 hover:text-sky-300 text-[11px] font-medium mt-1 inline-flex items-center gap-1"
                    >
                      View in Patient Dashboard <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hospital Radar Component */}
          <HospitalMap
            facilities={eligibleFacilities}
            dispatches={dispatches}
            incidentLatitude={incident.latitude}
            incidentLongitude={incident.longitude}
            incidentAddress={incident.location_address}
            onDispatch={handleManualDispatch}
            isDispatching={isDispatching}
          />
        </div>
      </div>
    </div>
  </div>
  );
}
