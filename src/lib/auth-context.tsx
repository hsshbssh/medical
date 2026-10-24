'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from './types';
import { getDemoCurrentUser, getDemoUserProfile, demoLogin, demoLogout, getDemoUsers } from './supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  availableRoles: { role: UserRole; name: string; email: string; label: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_INFO: { role: UserRole; name: string; email: string; label: string }[] = [
  { role: 'bystander', name: 'Rahul Sharma', email: 'bystander@carebridge.demo', label: 'Bystander / Reporter' },
  { role: 'hospital_responder', name: 'Dr. Anil Kumar', email: 'hospital@carebridge.demo', label: 'Hospital Emergency Responder' },
  { role: 'clinician', name: 'Dr. Meera Reddy', email: 'clinician@carebridge.demo', label: 'Verified Clinician' },
  { role: 'patient', name: 'Priya Patel', email: 'patient@carebridge.demo', label: 'Patient' },
  { role: 'care_team', name: 'Nurse Sunita Devi', email: 'careteam@carebridge.demo', label: 'Care Team Member' },
  { role: 'admin', name: 'System Admin', email: 'admin@carebridge.demo', label: 'Platform Administrator' },
];

const DEFAULT_PROFILE: Profile = {
  id: 'demo-bystander-001',
  email: 'bystander@carebridge.demo',
  full_name: 'Rahul Sharma',
  role: 'bystander',
  phone: '+91-9876543210',
  is_verified: true,
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(DEFAULT_PROFILE);

  useEffect(() => {
    // Initialize with stored user or bystander
    const existing = getDemoUserProfile();
    if (existing) {
      setUser(existing);
    } else {
      const defaultUser = ROLE_INFO[0];
      demoLogin(defaultUser.email, 'demo123');
      const loaded = getDemoUserProfile();
      if (loaded) setUser(loaded);
    }
  }, []);

  const login = async (email: string, password = 'demo123') => {
    const res = demoLogin(email, password);
    if (res.user) {
      const profile = getDemoUserProfile();
      setUser(profile);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to login' };
  };

  const logout = () => {
    demoLogout();
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const target = ROLE_INFO.find(r => r.role === newRole);
    if (target) {
      demoLogin(target.email, 'demo123');
      const profile = getDemoUserProfile();
      setUser(profile);
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || 'bystander',
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    availableRoles: ROLE_INFO,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
