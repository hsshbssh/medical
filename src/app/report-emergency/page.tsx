'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  MapPin, 
  Camera, 
  Phone, 
  Send, 
  Clock, 
  CheckCircle2, 
  Lock, 
  UploadCloud, 
  X,
  Compass,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Hospital,
  ShieldCheck,
  Check,
  Edit2,
  AlertTriangle
} from 'lucide-react';
import { IncidentCategory, PatientIdentityStatus } from '@/lib/types';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function ReportEmergencyPage() {
  const router = useRouter();

  // Guided Steps (1: Scene & Location, 2: Injuries & Patient, 3: Review & Submit)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [address, setAddress] = useState('Connaught Place, New Delhi, Delhi 110001');
  const [locationDesc, setLocationDesc] = useState('Near Gate 4 central circle');
  const [lat, setLat] = useState<number | undefined>(28.6139);
  const [lng, setLng] = useState<number | undefined>(77.2090);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [category, setCategory] = useState<IncidentCategory>('road_accident');
  const [injuryDesc, setInjuryDesc] = useState('Two-wheeler collision. Visible abrasion on left forearm and possible fracture on left knee. Patient conscious.');
  const [observations, setObservations] = useState('Helmet was worn. Bleeding controlled with cloth. Patient responsive to verbal questions.');
  const [identityStatus, setIdentityStatus] = useState<PatientIdentityStatus>('not_verified');
  const [patientGender, setPatientGender] = useState('male');
  const [patientAgeApprox, setPatientAgeApprox] = useState('25-30');
  const [reporterName, setReporterName] = useState('Rahul Sharma');
  const [reporterPhone, setReporterPhone] = useState('+91-9876543210');
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  // Trauma Flags
  const [isConscious, setIsConscious] = useState(true);
  const [hasHeavyBleeding, setHasHeavyBleeding] = useState(false);
  const [hasHeadInjury, setHasHeadInjury] = useState(false);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Geolocation trigger
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAddress(`Near ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (GPS Verified)`);
        setIsLocating(false);
        setLocationSuccess(true);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not access GPS. Please type the incident address manually.');
      },
      { timeout: 8000 }
    );
  };

  // Photo selection handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image must be under 10MB.');
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit report to Backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentConfirmed) {
      alert('Please confirm the data-sharing disclosure to initiate emergency coordination.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        latitude: lat,
        longitude: lng,
        location_address: address,
        location_description: locationDesc,
        category,
        description: injuryDesc || 'Emergency incident reported by bystander.',
        injury_description: `${injuryDesc} | Trauma Flags: Conscious: ${isConscious ? 'Yes' : 'No'}, Bleeding: ${hasHeavyBleeding ? 'Severe' : 'Controlled'}, Head Injury: ${hasHeadInjury ? 'Yes' : 'No'}`,
        observations,
        patient_identity_status: identityStatus,
        patient_gender: patientGender,
        patient_age_approx: patientAgeApprox,
        data_sharing_confirmed: consentConfirmed,
      };

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected incident submission.');
      }

      // Navigate to Persistent Incident Tracking view with real ID
      router.push(`/incident/${data.incident.id}`);
    } catch (err: any) {
      console.error('[Emergency Submission Error]:', err);
      setSubmissionError(err?.message || 'Error saving emergency report. Please verify connection and retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={1} />
      
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 flex-1 w-full">
        {/* Emergency Dispatch Banner */}
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs text-red-200 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white tracking-wide uppercase text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Urgent Emergency Priority
            </span>
            <div className="flex items-center gap-2">
              <a
                href="tel:112"
                className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors shadow-sm"
              >
                <PhoneCall className="w-3 h-3 fill-current" /> Call 112
              </a>
              <a
                href="tel:108"
                className="inline-flex items-center gap-1 bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium px-2.5 py-1 rounded text-xs border border-white/10 transition-colors"
              >
                Ambulance 108
              </a>
            </div>
          </div>
          <p className="text-[11.5px] text-red-300/90 leading-relaxed">
            Do not delay calling national emergency numbers while completing this report. Submitting alerts nearby hospital ER triage queues and generates a 24-hour cryptographic emergency QR bridge.
          </p>
        </div>

        {/* Guided Step Progress Indicator */}
        <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Bystander Incident Intake — Step {currentStep} of 3
            </span>
            <span className="text-slate-400 text-[11px]">
              {currentStep === 1 ? 'Scene Location' : currentStep === 2 ? 'Patient & Injuries' : 'Review & Dispatch'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-sky-400' : 'bg-white/10'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-sky-400' : 'bg-white/10'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep === 3 ? 'bg-emerald-400' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* Submission Error Alert */}
        {submissionError && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Submission Failure:</strong>
              <p className="mt-0.5">{submissionError}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Scene & Location */}
          {currentStep === 1 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-5 border border-white/[0.08] animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-400" /> 1. Accident Scene & Location
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify the accident site so participating hospital emergency departments can calculate distance radar.
                </p>
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Incident Address / Landmark <span className="text-red-400">*</span></span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="text-sky-400 hover:text-sky-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Compass className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Acquiring GPS...' : locationSuccess ? 'GPS Updated ✓' : 'Detect Current GPS'}
                  </button>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ring Road, near Moolchand flyover, New Delhi"
                  className="w-full bg-[#090D1A] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Location Landmark description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Landmark Notes (Optional)
                </label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder="e.g. Northbound side, near Gate 4 fountain"
                  className="w-full bg-[#090D1A] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200">
                  Emergency Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'road_accident', label: 'Road Accident' },
                    { id: 'fall', label: 'Severe Fall' },
                    { id: 'burn', label: 'Burn Trauma' },
                    { id: 'medical_emergency', label: 'Medical Emergency' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id as IncidentCategory)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        category === c.id
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-semibold'
                          : 'bg-[#090D1A] border-white/[0.08] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!address.trim()) {
                      alert('Please enter an accident location address.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-500/20"
                >
                  Next: Patient & Injury Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Injuries & Patient */}
          {currentStep === 2 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-5 border border-white/[0.08] animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" /> 2. Observed Injuries & Patient Status
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Document visible trauma and condition to aid hospital triage prior to ambulance arrival.
                </p>
              </div>

              {/* Quick Trauma Flags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Critical Trauma Flags:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConscious(!isConscious)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                      isConscious 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-red-500/20 border-red-500 text-red-200 font-bold'
                    }`}
                  >
                    <span>Conscious & Alert</span>
                    <span>{isConscious ? '✓ YES' : '✕ UNCONSCIOUS'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasHeavyBleeding(!hasHeavyBleeding)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                      hasHeavyBleeding 
                        ? 'bg-red-500/20 border-red-500 text-red-200 font-bold' 
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-300'
                    }`}
                  >
                    <span>Severe Bleeding</span>
                    <span>{hasHeavyBleeding ? '⚠️ YES' : 'Controlled'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasHeadInjury(!hasHeadInjury)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                      hasHeadInjury 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold' 
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-300'
                    }`}
                  >
                    <span>Suspected Head Trauma</span>
                    <span>{hasHeadInjury ? '⚠️ YES' : 'None'}</span>
                  </button>
                </div>
              </div>

              {/* Observable Injury Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Observable Injury Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={injuryDesc}
                  onChange={(e) => setInjuryDesc(e.target.value)}
                  placeholder="e.g. Visible laceration on forearm, pain in left knee, patient sitting upright."
                  className="w-full bg-[#090D1A] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Bystander Scene Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Scene Observations & Interventions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="e.g. Helmet worn. Pressure applied to wound. Bystanders managing traffic."
                  className="w-full bg-[#090D1A] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Demographics & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Patient Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full bg-[#090D1A] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Unknown</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Approximate Age Range</label>
                  <select
                    value={patientAgeApprox}
                    onChange={(e) => setPatientAgeApprox(e.target.value)}
                    className="w-full bg-[#090D1A] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="18-25">18–25 years</option>
                    <option value="25-30">25–30 years</option>
                    <option value="30-45">30–45 years</option>
                    <option value="45-60">45–60 years</option>
                    <option value="60+">60+ years</option>
                  </select>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!injuryDesc.trim()) {
                      alert('Please provide observed injury details.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-500/20"
                >
                  Next: Review & Dispatch <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6 border border-white/[0.08] animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> 3. Review & Dispatch Authorization
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verify the information before dispatching emergency packets and issuing the PS-40 QR Health Pass.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="p-4 rounded-xl bg-[#090D1A] border border-white/[0.08] space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="font-bold text-white uppercase text-[11px] tracking-wider">Report Summary</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Fields
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location:</span>
                    <p className="text-white font-medium">{address}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category:</span>
                    <p className="text-white font-medium capitalize">{category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Demographics:</span>
                    <p className="text-white font-medium capitalize">{patientGender}, approx {patientAgeApprox}y</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trauma Status:</span>
                    <p className="text-white font-medium">
                      {isConscious ? 'Conscious' : 'Unconscious'}, {hasHeavyBleeding ? 'Bleeding Severe' : 'Bleeding Controlled'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Injury Summary:</span>
                  <p className="text-slate-200 mt-0.5">{injuryDesc}</p>
                </div>
              </div>

              {/* Participating Emergency Facilities Transparency */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold uppercase tracking-wider">
                  <Hospital className="w-3.5 h-3.5" /> Destination Emergency Queues
                </div>
                <p className="text-xs text-slate-300">
                  Submitting will transmit initial scene telemetry to nearest participating trauma departments:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0E1528] border border-sky-500/20 text-slate-200">
                    <strong className="block text-white font-semibold">1. AIIMS Delhi Trauma Center</strong>
                    <span className="text-[11px] text-slate-400">Haversine Radar: ~5.2 km</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0E1528] border border-sky-500/20 text-slate-200">
                    <strong className="block text-white font-semibold">2. Safdarjung Hospital Emergency</strong>
                    <span className="text-[11px] text-slate-400">Haversine Radar: ~5.4 km</span>
                  </div>
                </div>
              </div>

              {/* Data Sharing Consent */}
              <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-1 rounded bg-[#090D1A] border-white/20 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                  <strong className="text-white block font-semibold mb-0.5">Emergency Coordination Consent & PS-40 Token Generation</strong>
                  I confirm this emergency observation is accurate to the best of my knowledge and authorize transmission to participating emergency facilities. A 24-hour cryptographic QR access pass will be generated.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !consentConfirmed}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 ml-auto"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {isSubmitting ? 'Dispatching & Generating Pass...' : 'Submit Emergency Report'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
