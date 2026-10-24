'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';
import { demoDB } from '@/lib/demo-db';
import { HospitalIntegrationAdapter } from '@/lib/hospital-adapter';
import { IncidentCategory, PatientIdentityStatus } from '@/lib/types';
import { CaseContinuityBar } from '@/components/CaseContinuityBar';

export default function ReportEmergencyPage() {
  const router = useRouter();

  // Form State
  const [address, setAddress] = useState('Connaught Place, New Delhi, Delhi');
  const [lat, setLat] = useState<number | undefined>(28.6139);
  const [lng, setLng] = useState<number | undefined>(77.2090);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [category, setCategory] = useState<IncidentCategory>('road_accident');
  const [injuryDesc, setInjuryDesc] = useState('');
  const [observations, setObservations] = useState('');
  const [identityStatus, setIdentityStatus] = useState<PatientIdentityStatus>('not_verified');
  const [patientGender, setPatientGender] = useState('male');
  const [patientAgeApprox, setPatientAgeApprox] = useState('25-30');
  const [reporterName, setReporterName] = useState('Rahul Sharma');
  const [reporterPhone, setReporterPhone] = useState('+91-9876543210');
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setAddress(`Near ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (GPS Verified)`);
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

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentConfirmed) {
      alert('Please confirm the data-sharing disclosure to initiate emergency coordination.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Incident in Demo DB
      const newIncident = demoDB.createIncident({
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        latitude: lat,
        longitude: lng,
        location_address: address,
        incident_time: new Date().toISOString(),
        category,
        description: injuryDesc || 'Emergency incident reported by bystander.',
        injury_description: injuryDesc,
        observations,
        patient_identity_status: identityStatus,
        patient_gender: patientGender,
        patient_age_approx: patientAgeApprox,
        status: 'submitted',
        routing_mode: 'demo',
        data_sharing_confirmed: consentConfirmed,
        consent_timestamp: new Date().toISOString(),
      });

      // 2. Generate Secure QR Token (PS-40)
      const tokenHash = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2) + Date.now().toString(36);
      demoDB.createQRToken({
        incident_id: newIncident.id,
        token_hash: tokenHash,
        permitted_scope: ['incident_summary', 'location', 'injury_description', 'patient_status'],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        max_uses: 10,
        use_count: 0,
        status: 'active',
        created_by: reporterName,
      });

      // 3. Dispatch to nearby participating facilities
      const nearby = HospitalIntegrationAdapter.getEligibleFacilities(lat, lng, 30);
      for (const facility of nearby.slice(0, 3)) {
        await HospitalIntegrationAdapter.dispatchIncident(newIncident, facility, 'demo');
      }

      // 4. Update status to dispatched
      demoDB.updateIncidentStatus(newIncident.id, 'dispatched');

      // 5. Navigate to Restricted Incident Tracking view
      router.push(`/incident/${newIncident.id}`);
    } catch (err) {
      console.error(err);
      alert('Error creating emergency incident report. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CaseContinuityBar currentStage={1} />
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6 flex-1 w-full">
      {/* Priority Warning Header */}
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs text-red-200 space-y-2 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white tracking-wide uppercase text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Urgent Emergency Priority
          </span>
          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-all"
            >
              <Phone className="w-3 h-3 fill-current" /> 112
            </a>
            <a
              href="tel:108"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-white/10 transition-all"
            >
              108
            </a>
          </div>
        </div>
        <p className="text-[11.5px] text-red-200/80 leading-relaxed">
          Do not delay calling national emergency numbers while completing this report. Digital reporting alerts participating hospital ER dashboards and provisions a secure patient QR bridge.
        </p>
      </div>

      {/* Main Reporting Form Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="pb-4 border-b border-white/[0.08]">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
            Emergency Intake Form
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
            Accident Scene Incident Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Minimal field collection to expedite hospital routing. No account registration required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11.5px] font-semibold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> Incident Location *
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-md border border-white/[0.08] transition-all"
              >
                <Compass className="w-3 h-3" />
                {isLocating ? 'Acquiring GPS...' : 'Auto-Detect Coordinates'}
              </button>
            </div>

            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter landmark, road, or intersection..."
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 transition-colors"
            />

            {locationSuccess && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3 h-3" /> GPS verified ({lat?.toFixed(4)}, {lng?.toFixed(4)})
              </p>
            )}
          </div>

          {/* Section 2: Category & Circumstances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-200 block mb-1.5">
                Incident Classification *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-[#111726] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:border-sky-500"
              >
                <option value="road_accident">Road Accident (Vehicle / Pedestrian)</option>
                <option value="fall">Severe Fall / Trauma</option>
                <option value="burn">Thermal / Chemical Burn</option>
                <option value="medical_emergency">Sudden Medical Collapse</option>
                <option value="workplace_injury">Workplace / Industrial Trauma</option>
                <option value="assault">Assault / Physical Injury</option>
                <option value="other">Other Emergency</option>
              </select>
            </div>

            <div>
              <label className="text-[11.5px] font-semibold text-slate-200 block mb-1.5">
                Approximate Time
              </label>
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Just Now ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </div>
            </div>
          </div>

          {/* Section 3: Observed Injuries */}
          <div className="space-y-3">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-200 block mb-1.5">
                Observed Trauma & Visible Injuries *
              </label>
              <textarea
                required
                rows={2}
                value={injuryDesc}
                onChange={e => setInjuryDesc(e.target.value)}
                placeholder="e.g. Left forearm bleeding, suspected fracture on left leg, conscious and responsive..."
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-semibold text-slate-200 block mb-1.5">
                Scene Observations (Optional)
              </label>
              <textarea
                rows={2}
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="e.g. Helmet worn, bystander applied clean pressure cloth, seated away from traffic..."
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Patient Identity Pill Selector */}
          <div className="space-y-2">
            <label className="text-[11.5px] font-semibold text-slate-200 block">
              Patient Identification Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'not_verified', label: 'Not Yet Verified' },
                { val: 'unknown', label: 'Unconscious / Unknown' },
                { val: 'known', label: 'Known Patient' },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setIdentityStatus(opt.val as PatientIdentityStatus)}
                  className={`py-2 px-3 rounded-xl border text-xs transition-all ${
                    identityStatus === opt.val
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-200 font-semibold'
                      : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10.5px] text-slate-400 block mb-1">Estimated Age</span>
                <input
                  type="text"
                  value={patientAgeApprox}
                  onChange={e => setPatientAgeApprox(e.target.value)}
                  placeholder="e.g. 25-30"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[10.5px] text-slate-400 block mb-1">Gender</span>
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value)}
                  className="w-full bg-[#111726] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Optional Photo Upload with Encrypted Notice */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11.5px] font-semibold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                Optional Injury Photograph (Encrypted Private Storage)
              </label>
              <span className="text-[10px] text-slate-500">Max 10MB</span>
            </div>

            {photoPreview ? (
              <div className="rounded-xl border border-white/[0.1] bg-black/40 p-2 flex items-center gap-3">
                <img src={photoPreview} alt="Selected injury" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-white">{photoName}</p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3 text-emerald-400" /> Encrypted attachment ready for hospital upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoName(null);
                  }}
                  className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-white/[0.14] hover:border-white/[0.25] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">Click to select photo or take picture</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Never used for automated AI diagnosis</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}

            {photoError && <p className="text-xs text-red-400">{photoError}</p>}
          </div>

          {/* Section 6: Data Sharing Authorization */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentConfirmed}
                onChange={e => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 bg-slate-900 border-white/20"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Emergency Data-Sharing Authorization:</strong> I authorize dispatching this minimal incident packet to eligible nearby participating hospitals, generating a secure time-limited QR record bridge, and logging this emergency coordination request.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Generating QR Bridge & Alerting Eligible Facilities...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Incident Report & Provision QR Bridge
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
}
