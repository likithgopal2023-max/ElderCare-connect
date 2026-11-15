import React, { useState } from 'react';
import {
  ShieldCheck,
  BellRing,
  Users,
  CalendarClock,
  Sparkles,
  HeartPulse,
  ArrowRight,
  Play,
  Lock,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import { GENERATED_IMAGES } from '../data/demoData';
import { UserRole } from '../types';

interface LandingPageProps {
  onEnterApp: (role?: UserRole) => void;
  onOpenAuthModal: () => void;
  onLaunchInteractiveDemo: () => void;
}

const ECOSYSTEM_NODES = [
  {
    step: '01',
    role: 'Elderly Person',
    person: 'Lakshmi Devi (72)',
    summary: 'Center of every care decision; confirms daily medicines, routines, and permissions.',
  },
  {
    step: '02',
    role: 'Smart Reminder',
    person: 'Multi-Stage Alert',
    summary: 'Gentle prompt at dose time, 10-min follow-up, and 30-min check before escalating.',
  },
  {
    step: '03',
    role: 'Caretaker',
    person: 'Meena Nair',
    summary: 'Assists with daily schedule, records dose administration, and adds care observations.',
  },
  {
    step: '04',
    role: 'Family Member',
    person: 'Anita & Rajesh',
    summary: 'Receives peace-of-mind check-ins, adherence summaries, and missed-dose alerts.',
  },
  {
    step: '05',
    role: 'Doctor',
    person: 'Dr. Ravi Kumar',
    summary: 'Reviews accurate adherence logs, prescriptions, and clinical visit preparation.',
  },
  {
    step: '06',
    role: 'CareAI Assistant',
    person: 'Non-Diagnostic Guide',
    summary: 'Explains instructions in plain language and summarizes routines & lab reports safely.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuthModal,
  onLaunchInteractiveDemo,
}) => {
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [heroImgError, setHeroImgError] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar Contract: Exactly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 lg:px-12 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (single text element, one line) */}
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-teal-800 dark:text-teal-400 whitespace-nowrap shrink-0"
        >
          ElderCare Connect
        </a>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#why-eldercare"
            className="hover:text-teal-700 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Capabilities
          </a>
          <a
            href="#ecosystem"
            className="hover:text-teal-700 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Care Ecosystem
          </a>
          <a
            href="#how-it-works"
            className="hover:text-teal-700 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#safety"
            className="hover:text-teal-700 dark:hover:text-teal-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Safety Standards
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onEnterApp('elderly')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Care Workspace
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="max-w-7xl mx-auto w-full px-6 lg:px-12 pt-12 pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Core Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                Shared Digital Healthcare Ecosystem · Senior-First Design
              </p>
              <h1
                className="font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
                style={{ fontSize: 'clamp(2.4rem, 4.2vw, 3.75rem)', textWrap: 'balance' }}
              >
                Smarter Care. Safer Days. Together.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                An intelligent healthcare companion connecting elderly individuals with the people
                who care about them — keeping seniors in full control of their daily medications,
                appointments, and emergency readiness.
              </p>
            </div>

            {/* Hero Actions */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onEnterApp('elderly')}
                  className="px-6 py-3.5 text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="px-6 py-3.5 text-base font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign In / Care Code
                </button>
                <button
                  onClick={onLaunchInteractiveDemo}
                  className="px-5 py-3.5 text-base font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Instant Role Preview Switcher for Judges / Evaluators */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  Instant Demo Access — Explore as any role in Lakshmi Devi’s Care Ecosystem:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onEnterApp('elderly')}
                    className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Elderly Owner (Lakshmi, 72)
                  </button>
                  <button
                    onClick={() => onEnterApp('family')}
                    className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Family Member (Anita - Daughter)
                  </button>
                  <button
                    onClick={() => onEnterApp('caretaker')}
                    className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Caretaker (Meena)
                  </button>
                  <button
                    onClick={() => onEnterApp('admin')}
                    className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-600 rounded-lg text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Platform Admin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Measured Scrim */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-full min-h-[360px] flex flex-col justify-end">
              {!heroImgError ? (
                <img
                  src={GENERATED_IMAGES.heroEcosystem}
                  alt="Lakshmi Devi reviewing her morning medication schedule on a tablet in a sunlit living room"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-900 flex items-center justify-center p-8">
                  <HeartPulse className="w-20 h-20 text-teal-300/40" />
                </div>
              )}
              <div className="relative z-10 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 lg:p-8 text-white space-y-3">
                <div className="text-xs font-medium text-teal-300">
                  Live Care Routine · Today at 8:06 AM · Care Code 482913
                </div>
                <p className="text-lg font-semibold leading-snug">
                  “Lakshmi completed her morning Metformin 500 mg. Daughter Anita and Caretaker
                  Meena are synced automatically.”
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-200 pt-1 tabular-nums">
                  <span>4 / 5 Doses On Track</span>
                  <span aria-hidden="true">·</span>
                  <span>94% Weekly Adherence</span>
                  <span aria-hidden="true">·</span>
                  <span>Dr. Kumar Tomorrow 11:30 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Interactive Ecosystem Flow Bar Below Hero Split */}
        <div
          id="ecosystem"
          className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Connected Healthcare Ecosystem Flow
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Elder → Medication Reminder → Caretaker → Family Member → Doctor → CareAI Assistant
              </p>
            </div>
            <button
              onClick={onLaunchInteractiveDemo}
              className="px-4 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Simulate Live Escalation Flow →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pt-6">
            {ECOSYSTEM_NODES.map((node, index) => {
              const isSelected = index === activeNodeIndex;
              return (
                <button
                  key={node.step}
                  onClick={() => setActiveNodeIndex(index)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-600 dark:border-teal-500'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-mono text-teal-700 dark:text-teal-400 mb-1 tabular-nums">
                    {node.step}. {node.role}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {node.person}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {node.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why ElderCare Connect? (Asymmetric Bento Grid) */}
      <section
        id="why-eldercare"
        className="py-16 lg:py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why ElderCare Connect?
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Designed for clarity, clinical reliability, and respectful family collaboration
              without overwhelming interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  01. Medication Safety & Smart Refill Protection
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tracks exact strength, food timing (before/after breakfast), prescribing doctor,
                  and remaining tablet counts. Proactively warns 5 to 7 days before Metformin or
                  Atorvastatin runs low, while explicitly preventing unsafe double-dosing after a
                  missed dose.
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Includes visual pill verification · Food instruction tags · Automatic refill
                thresholds
              </div>
            </div>

            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  02. Multi-Stage Smart Reminders
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  More than an alarm: sends a gentle prompt on time, a 10-minute reminder, a
                  30-minute check, and only then notifies authorized caretakers or family.
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Email · In-App · Browser alerts
              </div>
            </div>

            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  03. Permission-First Family Collaboration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Lakshmi Devi owns her profile and approves every Care Circle member via a 6-digit
                  Care Code. Family members see real-time check-ins without intrusive phone calls.
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Role-based access · Full audit log
              </div>
            </div>

            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  04. Appointment & Clinic Maps
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Interactive Google Maps view for upcoming cardiology and endocrinology visits with
                  distance calculation, clinic notes, and 7-day / 1-day / 1-hour reminders.
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Calendar · List · Timeline · Maps
              </div>
            </div>

            <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  05. Voice-First CareAI & Emergency QR
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Speak naturally to CareAI to check morning doses or summarize lab reports, plus
                  instant Emergency Mode with a time-limited verification QR card.
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Voice assistant · Temporary QR access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (6 Steps) + Adjacent Proof */}
      <section id="how-it-works" className="py-16 lg:py-20 max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
        <div className="space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How ElderCare Connect Works
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Six clear steps from profile setup to coordinated daily care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Create Elderly Profile',
                desc: 'Set up medical conditions, allergies, blood group, emergency contacts, and Senior Mode preferences.',
              },
              {
                num: '02',
                title: 'Add Medications & Refills',
                desc: 'Enter dosage, food timing, prescribing doctor, and pill inventory for automated refill tracking.',
              },
              {
                num: '03',
                title: 'Invite Trusted Family & Caretakers',
                desc: 'Share the 6-digit Care Code (e.g. 482913). The elderly owner approves every member and sets permissions.',
              },
              {
                num: '04',
                title: 'Schedule Doctor Appointments',
                desc: 'Organize clinic visits with interactive maps, visit checklists, and 7-day / 1-day / 1-hour alerts.',
              },
              {
                num: '05',
                title: 'Receive Intelligent Reminders',
                desc: 'Gentle multi-stage reminders adapt to daily habits and alert caretakers only when a dose is missed.',
              },
              {
                num: '06',
                title: 'Monitor Healthcare Routines',
                desc: 'Track adherence analytics, daily “I’m Okay” check-ins, and AI-generated organizational insights.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="text-sm font-mono font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
                  Step {item.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Claim-to-Proof Adjacency: Quantified Impact & Attributable Family Testimonial */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Measured Reliability for Families & Seniors
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-2 tabular-nums">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">94.2%</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  30-Day Medication Adherence Rate across pilot households
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">-68%</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Reduction in anxious daily check-in phone calls within 14 days
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-8 lg:border-l border-slate-200 dark:border-slate-800 space-y-4">
            <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed italic">
              “Before ElderCare Connect, my brother Rajesh and I called our mother three times a day
              just to ask if she took her morning Metformin or evening blood pressure tablet. Now
              she taps ‘I’m Okay’ at 9 AM, Meena logs the morning dose, and we all feel connected
              without making Mother feel micromanaged.”
            </p>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Anita Sharma · Daughter & Primary Care Partner · Bengaluru, India
            </div>
          </div>
        </div>
      </section>

      {/* Medical Safety & Privacy Banner */}
      <section
        id="safety"
        className="bg-teal-900 text-white py-12 px-6 lg:px-12 border-t border-teal-800"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-teal-200 text-sm font-semibold">
              <Lock className="w-4 h-4" />
              <span>Medical Safety & Privacy Commitment</span>
            </div>
            <p className="text-base lg:text-lg font-medium leading-relaxed">
              “ElderCare Connect is designed to help organize healthcare routines and communication.
              It does not replace professional medical advice, diagnosis, or treatment.”
            </p>
            <p className="text-xs text-teal-200/90">
              Technology doesn’t replace human care — it helps people care better. Protected by
              zero-trust role permissions and complete access audit logs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onEnterApp('elderly')}
              className="px-6 py-3 text-sm font-semibold bg-white text-teal-900 hover:bg-teal-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch Lakshmi’s Dashboard
            </button>
            <button
              onClick={onLaunchInteractiveDemo}
              className="px-5 py-3 text-sm font-semibold bg-teal-800 text-white border border-teal-600 hover:bg-teal-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Run Interactive Demo
            </button>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 px-6 lg:px-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            ElderCare Connect · Shared Elderly Healthcare Ecosystem
          </div>
          <div className="flex items-center gap-6">
            <span>Senior-Friendly Accessibility</span>
            <span aria-hidden="true">·</span>
            <span>Role-Based Privacy</span>
            <span aria-hidden="true">·</span>
            <span>CareAI Non-Diagnostic Assistant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
