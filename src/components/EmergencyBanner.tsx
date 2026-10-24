'use client';

import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';

export function EmergencyBanner() {
  return (
    <div className="bg-[#180A0A]/95 border-b border-red-950/80 text-red-200/90 px-4 py-2 text-xs sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-medium text-slate-300">
            <span className="text-red-400 font-semibold tracking-wide uppercase text-[10.5px] mr-1.5">
              Urgent Medical Priority:
            </span>
            If you are witnessing a life-threatening accident, call emergency services immediately before filing digital records.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white font-semibold px-2.5 py-1 rounded-md text-[11px] transition-all shadow-sm active:scale-95"
          >
            <Phone className="w-3 h-3 fill-current" /> Dial 112
          </a>
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium px-2.5 py-1 rounded-md text-[11px] border border-white/10 transition-all active:scale-95"
          >
            <Phone className="w-3 h-3" /> Ambulance 108
          </a>
        </div>
      </div>
    </div>
  );
}
