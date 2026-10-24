'use client';

import React, { useState } from 'react';
import { HospitalFacility, HospitalDispatch, RoutingMode } from '@/lib/types';
import { 
  Hospital, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Compass, 
  Building2 
} from 'lucide-react';

interface HospitalMapProps {
  facilities: (HospitalFacility & { distance_km: number })[];
  dispatches?: HospitalDispatch[];
  incidentLatitude?: number;
  incidentLongitude?: number;
  incidentAddress?: string;
  onDispatch?: (facilityId: string) => void;
  isDispatching?: boolean;
}

export function HospitalMap({
  facilities,
  dispatches = [],
  incidentLatitude = 28.6139,
  incidentLongitude = 77.2090,
  incidentAddress = 'Current Accident Location',
  onDispatch,
  isDispatching = false,
}: HospitalMapProps) {
  const [selectedFacility, setSelectedFacility] = useState<string | null>(facilities[0]?.id || null);

  const getDispatchStatus = (facilityId: string) => {
    return dispatches.find(d => d.facility_id === facilityId);
  };

  const getStatusBadge = (dispatch?: HospitalDispatch) => {
    if (!dispatch) {
      return (
        <span className="text-[10px] bg-white/[0.04] text-slate-400 px-2 py-0.5 rounded border border-white/[0.06]">
          Not Dispatched
        </span>
      );
    }

    switch (dispatch.status) {
      case 'acknowledged':
      case 'accepted':
        return (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Acknowledged by Hospital
          </span>
        );
      case 'sent':
      case 'delivery_confirmed':
        return (
          <span className="text-[10px] bg-sky-500/10 text-sky-300 font-medium px-2 py-0.5 rounded border border-sky-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400 animate-spin" /> Dispatched
          </span>
        );
      case 'demo_only':
        return (
          <span className="text-[10px] bg-purple-500/10 text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-500/20">
            Demo Dispatched
          </span>
        );
      case 'failed':
        return (
          <span className="text-[10px] bg-red-500/10 text-red-300 font-semibold px-2 py-0.5 rounded border border-red-500/20">
            Dispatch Failed
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
            {dispatch.status}
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-white/[0.02] border-b border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Participating Government Hospitals</h3>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
            <span className="truncate max-w-md">{incidentAddress}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Geodesic Coordinates (Haversine)</span>
        </div>
      </div>

      {/* Caution Bar */}
      <div className="bg-amber-500/[0.04] border-b border-amber-500/10 px-4 py-2 text-[11px] text-amber-200/90 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>Proximity Caution:</strong> Distance does not guarantee emergency room bed availability. Seeded facilities represent demonstration endpoints.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
        {/* Hospital Facility List */}
        <div className="lg:col-span-7 p-4 space-y-2.5 max-h-[460px] overflow-y-auto">
          {facilities.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No participating hospitals found within radius.
            </div>
          ) : (
            facilities.map(facility => {
              const dispatch = getDispatchStatus(facility.id);
              const isSelected = selectedFacility === facility.id;

              return (
                <div
                  key={facility.id}
                  onClick={() => setSelectedFacility(facility.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.06] border-sky-500/60 shadow-md ring-1 ring-sky-500/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-white text-sm tracking-tight">{facility.name}</span>
                        {facility.is_demo && (
                          <span className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            Demo
                          </span>
                        )}
                        <span className="text-[9px] uppercase font-medium px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400">
                          {facility.facility_type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">{facility.address}, {facility.city}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 block font-mono">
                        {facility.distance_km} km
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
                    <div>{getStatusBadge(dispatch)}</div>

                    <div className="flex items-center gap-2">
                      {facility.phone && (
                        <a
                          href={`tel:${facility.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-all border border-white/[0.06]"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Call</span>
                        </a>
                      )}

                      {onDispatch && (!dispatch || dispatch.status === 'failed') && (
                        <button
                          disabled={isDispatching}
                          onClick={e => {
                            e.stopPropagation();
                            onDispatch(facility.id);
                          }}
                          className="px-2.5 py-1 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Alert</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Facility Inspector */}
        <div className="lg:col-span-5 p-4 bg-black/20 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              Facility Routing Inspector
            </h4>

            {selectedFacility ? (
              (() => {
                const facility = facilities.find(f => f.id === selectedFacility);
                if (!facility) return null;
                const dispatch = getDispatchStatus(facility.id);

                return (
                  <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Selected Destination</span>
                      <span className="font-bold text-white text-sm">{facility.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Latitude</span>
                        <span className="font-mono text-slate-300">{facility.latitude}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Longitude</span>
                        <span className="font-mono text-slate-300">{facility.longitude}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Distance</span>
                        <span className="font-semibold text-sky-400 font-mono">{facility.distance_km} km</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Emergency Trauma</span>
                        <span className="text-emerald-400 font-medium">24/7 Active</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium mb-1">Integration Channel</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {facility.is_demo ? (
                          <span className="text-purple-300 font-medium">
                            Mode A (Demo Adapter): Seeded simulation dashboard. Dispatches appear in the Hospital Responder queue.
                          </span>
                        ) : (
                          <span className="text-emerald-300 font-medium">
                            Mode B (Integration-Ready): Verified API endpoint configured for secure FHIR/REST dispatch.
                          </span>
                        )}
                      </p>
                    </div>

                    {dispatch && (
                      <div className="pt-2 border-t border-white/[0.04] space-y-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Transmission Telemetry</span>
                        <p className="text-[11px] text-slate-300">
                          Status: <strong className="text-white uppercase font-mono">{dispatch.status}</strong>
                        </p>
                        {dispatch.dispatched_at && (
                          <p className="text-[10px] text-slate-500">
                            Sent: {new Date(dispatch.dispatched_at).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-500">Select a facility to inspect coordinates.</p>
            )}
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Ambulance Direct Hotline:</span>
            <a href="tel:108" className="font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Dial 108
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
