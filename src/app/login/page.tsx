'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HeartHandshake, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Stethoscope,
  Hospital,
  UserCheck,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole, availableRoles, role } = useAuth();
  const [email, setEmail] = useState('clinician@carebridge.demo');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleQuickRole = (r: UserRole) => {
    switchRole(r);
    if (r === 'bystander') router.push('/report-emergency');
    else if (r === 'hospital_responder') router.push('/hospital/dashboard');
    else if (r === 'clinician') router.push('/clinician/dashboard');
    else if (r === 'patient') router.push('/patient/dashboard');
    else if (r === 'care_team') router.push('/care-team/dashboard');
    else if (r === 'admin') router.push('/admin/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-900/30">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Sign In to CareBridge AI</h1>
        <p className="text-xs text-slate-400">
          Access role-specific healthcare workflows with authorized credentials.
        </p>
      </div>

      {/* 1-Click Persona Quick Logins for Evaluator */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
            1-Click Demo Evaluation Sign-in
          </span>
          <span className="text-[10px] text-slate-500">No Typing Needed</span>
        </div>

        <div className="space-y-1.5">
          {availableRoles.map(item => (
            <button
              key={item.role}
              onClick={() => handleQuickRole(item.role)}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs flex items-center justify-between group transition-all"
            >
              <div>
                <span className="font-bold text-white block group-hover:text-sky-300 transition-colors">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400">{item.name} ({item.email})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Manual Sign-in Form */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manual Authentication</h2>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleCustomLogin} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md mt-2"
          >
            <Lock className="w-4 h-4" /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
