'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  RotateCcw, 
  Phone, 
  Filter, 
  Check, 
  Bell,
  ArrowRight
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { FollowUp, FollowUpStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function CareTeamDashboardPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'missed' | 'completed'>('all');

  const loadData = () => {
    setFollowUps([...demoDB.followUps]);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: FollowUpStatus, notes?: string) => {
    demoDB.updateFollowUpStatus(id, newStatus, notes);
    demoDB.logAudit({
      actor_id: user?.id || 'demo-careteam-001',
      actor_role: 'care_team',
      event_type: 'followup_updated',
      resource_type: 'follow_up',
      resource_id: id,
      description: `Follow-up status changed to ${newStatus}`,
      result: 'success',
    });
    loadData();
  };

  const handleSendReminder = (id: string) => {
    const fu = demoDB.followUps.find(f => f.id === id);
    if (fu) {
      fu.reminder_status = 'sent';
      fu.reminder_sent_at = new Date().toISOString();
      loadData();
      alert(`Reminder dispatched to patient for ${fu.follow_up_date}!`);
    }
  };

  const filteredFollowUps = followUps.filter(fu => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return fu.status === 'scheduled';
    if (filter === 'missed') return fu.status === 'missed';
    if (filter === 'completed') return fu.status === 'completed';
    return true;
  });

  const missedCount = followUps.filter(fu => fu.status === 'missed').length;
  const upcomingCount = followUps.filter(fu => fu.status === 'scheduled').length;

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={6} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 flex-1 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Outpatient Care Coordination
            </span>
            <span className="text-xs text-slate-400">Nurse Sunita Devi</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            PS-35 Patient Follow-Up & Reminder Management
          </h1>
          <p className="text-xs text-slate-400">
            Monitor post-discharge attendance, dispatch reminder telemetry, and coordinate missed visit escalations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
            <span className="text-slate-400 block text-[10.5px]">Active Schedule</span>
            <span className="font-semibold text-white">{upcomingCount} Upcoming</span>
          </div>
          {missedCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              <span className="block text-[10.5px] uppercase font-semibold">Overdue Tasks</span>
              <span className="font-semibold text-white">{missedCount} Missed Visit</span>
            </div>
          )}
        </div>
      </div>

      {/* Missed Appointment Escalation Alert */}
      {missedCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/60 text-xs text-red-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-white">Missed Appointment Operational Escalation (Rule 12 Compliance):</p>
              <p className="text-[11.5px] text-red-200/80 leading-relaxed">
                Patient Priya Patel missed an orthopedic wound dressing appointment. A follow-up task has been logged. Note: A missed appointment never automatically invents a new medical plan; it creates an operational outreach task.
              </p>
            </div>
          </div>
          <a
            href="tel:+919876543211"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" /> Contact Patient
          </a>
        </div>
      )}

      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-1.5 text-xs">
        {(['all', 'scheduled', 'missed', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
              filter === tab
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFollowUps.map(fu => {
          const isMissed = fu.status === 'missed';
          const isCompleted = fu.status === 'completed';

          return (
            <div
              key={fu.id}
              className={`p-5 rounded-2xl glass-panel flex flex-col justify-between space-y-4 transition-all ${
                isMissed
                  ? 'border-red-500/30 ring-1 ring-red-500/20'
                  : isCompleted
                  ? 'opacity-70'
                  : 'hover:border-white/[0.14]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Patient: Priya Patel
                  </span>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md ${
                    isMissed
                      ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  }`}>
                    {fu.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">{fu.purpose}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Scheduled Date</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {fu.follow_up_date}
                    </span>
                    <span className="text-[11px] text-slate-400">{fu.follow_up_time}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Reminder Status</span>
                    <span className="text-indigo-300 font-semibold block mt-0.5">
                      {fu.reminder_status.toUpperCase()}
                    </span>
                    {fu.reminder_sent_at && (
                      <span className="text-[9.5px] text-slate-500">Sent: {new Date(fu.reminder_sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>

                {fu.attendance_notes && (
                  <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-[11px] text-red-200">
                    <strong>Operational Log:</strong> {fu.attendance_notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs">
                {fu.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(fu.id, 'completed', 'Patient attended follow-up clinic.')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-1 border border-emerald-500/20 transition-all"
                  >
                    <Check className="w-3 h-3" /> Mark Attended
                  </button>
                )}

                {fu.status === 'scheduled' && (
                  <button
                    onClick={() => handleSendReminder(fu.id)}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium flex items-center gap-1 border border-purple-500/20 transition-all"
                  >
                    <Bell className="w-3 h-3" /> Send Reminder
                  </button>
                )}

                {fu.status === 'missed' && (
                  <button
                    onClick={() => {
                      const newDate = prompt('Enter rescheduled date (YYYY-MM-DD):', '2026-10-27');
                      if (newDate) {
                        handleUpdateStatus(fu.id, 'rescheduled', `Rescheduled to ${newDate}`);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-medium flex items-center gap-1 border border-white/[0.08] transition-all"
                  >
                    <RotateCcw className="w-3 h-3" /> Reschedule
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
  );
}
