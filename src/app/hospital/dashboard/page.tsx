'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Hospital, 
  Activity, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  User,
  Stethoscope,
  Filter
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { HospitalDispatch, Incident, DispatchStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function HospitalDashboardPage() {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState<HospitalDispatch[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged' | 'accepted'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.incidents) {
          data.incidents.forEach((inc: Incident) => {
            if (!demoDB.getIncident(inc.id)) {
              demoDB.incidents.unshift(inc);
            }
          });
          if (data.dispatches) {
            data.dispatches.forEach((d: HospitalDispatch) => {
              if (!demoDB.dispatches.find(item => item.id === d.id)) {
                demoDB.dispatches.unshift(d);
              }
            });
          }
        }
      }
    } catch (e) {
      console.warn('API fetch incidents failed, using demoDB', e);
    }

    const allDispatches = demoDB.dispatches;
    const allIncidents = demoDB.getAllIncidents();
    setDispatches([...allDispatches]);
    setIncidents([...allIncidents]);
    if (!selectedIncident && allIncidents.length > 0) {
      setSelectedIncident(allIncidents[0]);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (dispatchId: string, newStatus: DispatchStatus) => {
    demoDB.updateDispatchStatus(dispatchId, newStatus);
    demoDB.logAudit({
      actor_id: user?.id || 'demo-hospital-001',
      actor_role: 'hospital_responder',
      event_type: newStatus === 'accepted' ? 'case_accepted' : 'dispatch_acknowledged',
      resource_type: 'hospital_dispatch',
      resource_id: dispatchId,
      description: `Hospital responder updated status to ${newStatus}`,
      result: 'success',
    });
    loadData();
  };

  const getIncidentForDispatch = (incidentId: string) => {
    return incidents.find(i => i.id === incidentId || i.incident_id === incidentId);
  };

  const filteredDispatches = dispatches.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'pending') return d.status === 'sent' || d.status === 'pending' || d.status === 'demo_only';
    if (filter === 'acknowledged') return d.status === 'acknowledged';
    if (filter === 'accepted') return d.status === 'accepted';
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 flex-1 w-full">
        {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <Hospital className="w-3.5 h-3.5 text-emerald-400" /> Authorized Hospital Responder
            </span>
            <span className="text-xs text-slate-400">AIIMS New Delhi — Emergency Dept</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Dispatch Receiver & Handover Desk
          </h1>
          <p className="text-xs text-slate-400">
            Real-time incoming scene packets from bystanders & emergency responders within coverage radius.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-slate-300 border border-white/[0.08]">
            Active Alerts: <strong className="text-white">{dispatches.length}</strong>
          </span>
          <Link
            href="/clinician/dashboard"
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Clinician Review
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        {(['all', 'pending', 'acknowledged', 'accepted'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
              filter === tab
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Queue & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incoming Case Queue */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Incoming Queue ({filteredDispatches.length})
          </h3>

          {filteredDispatches.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel text-center text-xs text-slate-500">
              No cases matching current filter.
            </div>
          ) : (
            filteredDispatches.map(dispatch => {
              const inc = getIncidentForDispatch(dispatch.incident_id);
              const isSelected = selectedIncident?.id === inc?.id;

              return (
                <div
                  key={dispatch.id}
                  onClick={() => inc && setSelectedIncident(inc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.06] border-sky-500/60 shadow-md ring-1 ring-sky-500/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{inc?.incident_id || 'Incident'}</span>
                        <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                          {inc?.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{inc?.location_address}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md ${
                        dispatch.status === 'accepted' || dispatch.status === 'acknowledged'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {dispatch.status}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {dispatch.distance_km ? `${dispatch.distance_km} km away` : 'Nearby'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {inc?.injury_description || inc?.description}
                  </p>

                  {/* Quick Action Buttons inside Card */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      Dispatched: {dispatch.dispatched_at ? new Date(dispatch.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>

                    <div className="flex gap-1.5">
                      {dispatch.status !== 'acknowledged' && dispatch.status !== 'accepted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(dispatch.id, 'acknowledged');
                          }}
                          className="px-2 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-500/20 transition-all"
                        >
                          Acknowledge
                        </button>
                      )}
                      {dispatch.status !== 'accepted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(dispatch.id, 'accepted');
                          }}
                          className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/20 transition-all"
                        >
                          Accept Case
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Detail & Clinical Handover */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Incident Case File
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {selectedIncident.incident_id}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Category: <strong className="text-white capitalize">{selectedIncident.category.replace('_', ' ')}</strong>
                  </p>
                </div>

                <Link
                  href={`/incident/${selectedIncident.id}`}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  Incident Track View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Triage Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Identity</span>
                  <span className="font-semibold text-white capitalize">{selectedIncident.patient_identity_status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Approx. Age</span>
                  <span className="text-slate-200">{selectedIncident.patient_age_approx || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Gender</span>
                  <span className="text-slate-200 capitalize">{selectedIncident.patient_gender || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Routing</span>
                  <span className="text-purple-300 font-semibold">Demo Mode</span>
                </div>
              </div>

              {/* Scene & Injury Notes */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 uppercase block mb-1">
                    Reported Injury Circumstances:
                  </span>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-200 leading-relaxed">
                    {selectedIncident.injury_description || selectedIncident.description}
                  </div>
                </div>

                {selectedIncident.observations && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 uppercase block mb-1">
                      Scene Observations (Bystander):
                    </span>
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-300 leading-relaxed">
                      {selectedIncident.observations}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-semibold text-slate-300 uppercase block mb-1">
                    Accident Location:
                  </span>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{selectedIncident.location_address}</span>
                  </div>
                </div>
              </div>

              {/* Handover & Clinician Review Actions */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
                  <Stethoscope className="w-4 h-4" />
                  Clinical Triage Handover
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Assign this incident to the attending trauma team or verified clinician for formal clinical assessment, care instructions, and follow-up scheduling.
                </p>
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/clinician/cases/${selectedIncident.id}`}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    Open Clinician Assessment Suite <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl glass-panel text-center text-xs text-slate-500">
              Select an incident from the queue to view details and record handover.
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
