'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Hospital, 
  ShieldCheck, 
  Activity, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Plus, 
  Search,
  Sliders,
  Database
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { HospitalFacility, AuditEvent, RoutingMode } from '@/lib/types';

export default function AdminDashboardPage() {
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'facilities' | 'audits' | 'integrations'>('facilities');
  const [globalMode, setGlobalMode] = useState<RoutingMode>('demo');

  const loadData = () => {
    setFacilities([...demoDB.getFacilities()]);
    setAuditEvents([...demoDB.getAuditEvents(undefined, 40)]);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDemoData = () => {
    if (confirm('Reset demo database to fresh synthetic initial state? All active test cases will be reset to defaults.')) {
      demoDB.reset();
      loadData();
      alert('Demo database successfully reset to clean synthetic seed!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-rose-400" /> Platform Administration
            </span>
            <span className="text-xs text-slate-400">System Governance & Facility Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            CareBridge AI System Console
          </h1>
          <p className="text-xs text-slate-400">
            Configure participating facilities, inspect cryptographic audit trails, and manage integration adapters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDemoData}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'facilities' ? 'border-rose-500 text-rose-400 bg-rose-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hospital className="w-4 h-4" />
          <span>Participating Facilities ({facilities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audits' ? 'border-rose-500 text-rose-400 bg-rose-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Log Trail ({auditEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'integrations' ? 'border-rose-500 text-rose-400 bg-rose-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Integration Adapter Modes</span>
        </button>
      </div>

      {/* TAB 1: FACILITIES */}
      {activeTab === 'facilities' && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Verified Government & Public Facilities</h2>
              <p className="text-xs text-slate-400">Configured endpoints for geographical nearest-hospital routing.</p>
            </div>
            <button
              onClick={() => alert('New hospital integration requires authorized administrative credentials and data provenance verification.')}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Register Facility
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 text-[10.5px] uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Facility Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4">Participation</th>
                  <th className="py-3 px-4">Emergency Dept</th>
                  <th className="py-3 px-4">Verified At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {facilities.map(facility => (
                  <tr key={facility.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{facility.name}</span>
                      <span className="text-[11px] text-slate-400">{facility.city}, {facility.state}</span>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {facility.facility_type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        facility.is_demo
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {facility.participation_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {facility.data_verified_at ? new Date(facility.data_verified_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG TRAIL */}
      {activeTab === 'audits' && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Immutable System Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Chronological record of emergency reports, QR token generations, hospital dispatches, and clinical sign-offs.
              </p>
            </div>
            <span className="text-xs text-slate-500">Live monitoring</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {auditEvents.map(event => (
              <div
                key={event.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {event.event_type}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      Actor: {event.actor_role || 'System'} ({event.actor_id || 'system'})
                    </span>
                  </div>
                  <p className="text-slate-300">{event.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    event.result === 'success'
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-red-950 text-red-300'
                  }`}>
                    {event.result}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATION ADAPTER MODES */}
      {activeTab === 'integrations' && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-white">Hospital Integration Adapter Configuration</h2>
            <p className="text-xs text-slate-400">
              Per Section 3 specification, hospital routing must explicitly separate demonstration from live external dispatch.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Mode A: Demo Mode */}
            <div className={`p-4 rounded-xl border transition-all ${
              globalMode === 'demo' ? 'bg-purple-950/40 border-purple-600 ring-1 ring-purple-500/30' : 'bg-slate-800/40 border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Mode A: Demonstration Mode (Default)</span>
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  Active
                </span>
              </div>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Routes minimal emergency packets to seeded in-memory demonstration hospital dashboards inside the application. Clearly labelled as simulated data.
              </p>
            </div>

            {/* Mode B: Integration-Ready Mode */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Mode B: Integration-Ready Mode</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Configurable
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Dispatches authorized HTTPS POST / FHIR emergency packets to real hospital receiving endpoints, with automatic retry policies and delivery acknowledgement webhooks.
              </p>
            </div>

            {/* Mode C: Unavailable Mode */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Mode C: Unavailable Mode</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Safety Fallback
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Triggered when a hospital endpoint cannot be confirmed or verified. Explicitly informs the reporter that digital dispatch is offline and instructs calling <strong>108 / 112</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
