// CareBridge AI — Supabase Client Configuration
// Handles both real Supabase connections and demo mode fallback

import type { Profile, UserRole } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL !== '' &&
    SUPABASE_URL !== 'https://demo.supabase.co' &&
    SUPABASE_ANON_KEY !== '' &&
    SUPABASE_ANON_KEY !== 'demo-anon-key'
  );
}

export function isDemoMode(): boolean {
  return IS_DEMO_MODE || !isSupabaseConfigured();
}

// ============================================================
// Demo Auth Store (in-memory, for when Supabase is not configured)
// ============================================================

interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  facility_id?: string;
  is_verified: boolean;
  password: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-bystander-001',
    email: 'bystander@carebridge.demo',
    full_name: 'Rahul Sharma',
    role: 'bystander',
    phone: '+91-9876543210',
    is_verified: true,
    password: 'demo123',
  },
  {
    id: 'demo-patient-001',
    email: 'patient@carebridge.demo',
    full_name: 'Priya Patel',
    role: 'patient',
    phone: '+91-9876543211',
    is_verified: true,
    password: 'demo123',
  },
  {
    id: 'demo-hospital-001',
    email: 'hospital@carebridge.demo',
    full_name: 'Dr. Anil Kumar',
    role: 'hospital_responder',
    phone: '+91-9876543212',
    facility_id: 'demo-facility-001',
    is_verified: true,
    password: 'demo123',
  },
  {
    id: 'demo-clinician-001',
    email: 'clinician@carebridge.demo',
    full_name: 'Dr. Meera Reddy',
    role: 'clinician',
    phone: '+91-9876543213',
    facility_id: 'demo-facility-001',
    is_verified: true,
    password: 'demo123',
  },
  {
    id: 'demo-careteam-001',
    email: 'careteam@carebridge.demo',
    full_name: 'Nurse Sunita Devi',
    role: 'care_team',
    phone: '+91-9876543214',
    facility_id: 'demo-facility-001',
    is_verified: true,
    password: 'demo123',
  },
  {
    id: 'demo-admin-001',
    email: 'admin@carebridge.demo',
    full_name: 'System Admin',
    role: 'admin',
    is_verified: true,
    password: 'demo123',
  },
];

// Session management via localStorage
let currentDemoUser: DemoUser | null = null;

export function getDemoUsers() {
  return DEMO_USERS.map(({ password, ...user }) => user);
}

export function demoLogin(email: string, password: string): { user: Omit<DemoUser, 'password'>; error?: string } | { user: null; error: string } {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return { user: null, error: 'Invalid email or password' };
  }
  currentDemoUser = user;
  if (typeof window !== 'undefined') {
    localStorage.setItem('carebridge_demo_user', JSON.stringify({ id: user.id, email: user.email }));
  }
  const { password: _, ...safeUser } = user;
  return { user: safeUser };
}

export function demoLogout() {
  currentDemoUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('carebridge_demo_user');
  }
}

export function getDemoCurrentUser(): Omit<DemoUser, 'password'> | null {
  if (currentDemoUser) {
    const { password: _, ...safeUser } = currentDemoUser;
    return safeUser;
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('carebridge_demo_user');
    if (stored) {
      try {
        const { id } = JSON.parse(stored);
        const user = DEMO_USERS.find(u => u.id === id);
        if (user) {
          currentDemoUser = user;
          const { password: _, ...safeUser } = user;
          return safeUser;
        }
      } catch {
        // Invalid stored data
      }
    }
  }
  return null;
}

export function getDemoUserProfile(): Profile | null {
  const user = getDemoCurrentUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    phone: user.phone,
    facility_id: user.facility_id,
    is_verified: user.is_verified,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
