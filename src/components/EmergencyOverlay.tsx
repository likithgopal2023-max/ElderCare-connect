import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  QrCode,
  X,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertOctagon,
  HeartPulse,
  Building2,
} from 'lucide-react';
import { ElderProfileData, MedicationItem, CareCircleMember } from '../types';

interface EmergencyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ElderProfileData;
  medications: MedicationItem[];
  careCircle: CareCircleMember[];
  onLogEmergencyAction: (description: string) => void;
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({
  isOpen,
  onClose,
  profile,
  medications,
  careCircle,
  onLogEmergencyAction,
}) => {
  const [activeCallTarget, setActiveCallTarget] = useState<{
    label: string;
    name: string;
    phone: string;
  } | null>(null);
  const [callConfirmed, setCallConfirmed] = useState(false);
  const [qrToken, setQrToken] = useState('ECC-TMP-8924-LK');
  const [qrExpiryMinutes, setQrExpiryMinutes] = useState(15);

  if (!isOpen) return null;

  const daughter = careCircle.find((c) => c.relationship === 'Daughter') || careCircle[0];
  const caretaker = careCircle.find((c) => c.relationship === 'Caretaker') || careCircle[1];

  const handleRequestCall = (label: string, name: string, phone: string) => {
    setCallConfirmed(false);
    setActiveCallTarget({ label, name, phone });
    onLogEmergencyAction(`Initiated emergency call prompt for ${label}: ${name} (${phone})`);
  };

  const handleRegenerateQr = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setQrToken(`ECC-TMP-${randomCode}-LK`);
    setQrExpiryMinutes(15);
    onLogEmergencyAction('Generated new time-limited Emergency QR verification token.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-2 border-rose-600 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-8">
        {/* High-Visibility Emergency Header */}
        <div className="px-6 py-5 bg-rose-700 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-7 h-7 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-200">
                Emergency Mode Active · Critical Clinical & Contact Summary
              </div>
              <h2 className="text-xl lg:text-2xl font-bold">
                {profile.name} · Age {profile.age} · Blood Group {profile.bloodGroup}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Exit Emergency Mode</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Immediate Authorized Call Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                handleRequestCall(
                  'Emergency Contact (Daughter)',
                  daughter?.name || 'Anita Sharma',
                  daughter?.phone || '+91 98451 77420'
                )
              }
              className="p-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="text-xs text-rose-100">Call Emergency Contact</div>
                <div className="text-base mt-0.5">{daughter?.name || 'Anita Sharma'}</div>
                <div className="text-xs font-mono text-rose-100 mt-0.5 tabular-nums">
                  {daughter?.phone || '+91 98451 77420'}
                </div>
              </div>
              <PhoneCall className="w-6 h-6 shrink-0" />
            </button>

            <button
              onClick={() =>
                handleRequestCall(
                  'Caretaker',
                  caretaker?.name || 'Meena Nair',
                  caretaker?.phone || '+91 99002 45120'
                )
              }
              className="p-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="text-xs text-teal-100">Call Caretaker</div>
                <div className="text-base mt-0.5">{caretaker?.name || 'Meena Nair'}</div>
                <div className="text-xs font-mono text-teal-100 mt-0.5 tabular-nums">
                  {caretaker?.phone || '+91 99002 45120'}
                </div>
              </div>
              <PhoneCall className="w-6 h-6 shrink-0" />
            </button>

            <button
              onClick={() =>
                handleRequestCall(
                  'Primary Doctor',
                  profile.primaryDoctor,
                  profile.primaryDoctorPhone
                )
              }
              className="p-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="text-xs text-slate-300">Call Primary Doctor</div>
                <div className="text-base mt-0.5">Dr. Ravi Kumar</div>
                <div className="text-xs font-mono text-slate-300 mt-0.5 tabular-nums">
                  {profile.primaryDoctorPhone}
                </div>
              </div>
              <PhoneCall className="w-6 h-6 shrink-0" />
            </button>
          </div>

          {/* Explicit Authorization Confirmation Banner Before Placing Call */}
          {activeCallTarget && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Explicit Call Authorization Required
                </div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {callConfirmed
                    ? `Dialing ${activeCallTarget.name} at ${activeCallTarget.phone} and logging emergency notification to Care Circle...`
                    : `Confirm placing an emergency call to ${activeCallTarget.label}: ${activeCallTarget.name} (${activeCallTarget.phone})?`}
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                {!callConfirmed ? (
                  <>
                    <a
                      href={`tel:${activeCallTarget.phone.replace(/\s+/g, '')}`}
                      onClick={() => {
                        setCallConfirmed(true);
                        onLogEmergencyAction(
                          `Authorized emergency call to ${activeCallTarget.name}`
                        );
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg whitespace-nowrap cursor-pointer"
                    >
                      Authorize & Dial Now
                    </a>
                    <button
                      onClick={() => setActiveCallTarget(null)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Authorized & Logged
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Clinical Summary + Temporary QR Card Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70">
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Known Allergies
                  </div>
                  <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-900 dark:text-white list-disc list-inside">
                    {profile.allergies.map((al) => (
                      <li key={al}>{al}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Medical Conditions
                  </div>
                  <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-900 dark:text-white list-disc list-inside">
                    {profile.medicalConditions.map((cond) => (
                      <li key={cond}>{cond}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Active Daily Medications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {medications.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                      <span className="font-mono text-teal-700 dark:text-teal-400 tabular-nums">
                        {m.strength} • {m.scheduledTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Primary Hospital:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {profile.primaryHospital}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Health Insurance:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {profile.insuranceProvider} ({profile.insurancePolicyNumber})
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency QR Card with Temporary Verification */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>Digital Emergency QR Card</span>
                  </span>
                  <span className="text-xs font-mono text-amber-700 dark:text-amber-400 flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    Expires in {qrExpiryMinutes}:00
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Emergency QR → Secure verification → Limited emergency summary → Access expires
                  automatically.
                </p>
              </div>

              {/* Clean SVG Matrix QR Code Representation */}
              <div className="mx-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <svg
                  viewBox="0 0 120 120"
                  className="w-36 h-36 text-slate-900"
                  role="img"
                  aria-label="Temporary Emergency Verification QR Code"
                >
                  <rect width="120" height="120" fill="#ffffff" />
                  {/* Top-left finder pattern */}
                  <rect x="10" y="10" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                  <rect x="19" y="19" width="12" height="12" fill="#0f766e" />
                  {/* Top-right finder pattern */}
                  <rect x="80" y="10" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                  <rect x="89" y="19" width="12" height="12" fill="#0f766e" />
                  {/* Bottom-left finder pattern */}
                  <rect x="10" y="80" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                  <rect x="19" y="89" width="12" height="12" fill="#0f766e" />
                  {/* Data modules */}
                  <rect x="50" y="14" width="6" height="6" fill="#0f172a" />
                  <rect x="62" y="14" width="6" height="6" fill="#0f172a" />
                  <rect x="50" y="26" width="12" height="6" fill="#0f172a" />
                  <rect x="46" y="46" width="28" height="28" fill="none" stroke="#0f766e" strokeWidth="4" />
                  <rect x="56" y="56" width="8" height="8" fill="#be123c" />
                  <rect x="14" y="50" width="18" height="6" fill="#0f172a" />
                  <rect x="84" y="52" width="20" height="6" fill="#0f172a" />
                  <rect x="50" y="84" width="12" height="6" fill="#0f172a" />
                  <rect x="80" y="80" width="12" height="12" fill="#0f172a" />
                  <rect x="98" y="92" width="12" height="18" fill="#0f766e" />
                </svg>
                <div className="mt-2 text-xs font-mono font-bold text-slate-800 tabular-nums">
                  Token: {qrToken}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  Private vault documents are never exposed via QR.
                </span>
                <button
                  onClick={handleRegenerateQr}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rotate Token</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
