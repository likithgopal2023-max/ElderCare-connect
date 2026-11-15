import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  Users,
  Sparkles,
  X,
  ShieldAlert,
} from 'lucide-react';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySimulationOutcome: () => void;
  onResetSimulationOutcome: () => void;
}

interface SimStep {
  stepNumber: number;
  title: string;
  timeOffset: string;
  actor: string;
  detail: string;
  alertMessage: string;
  priority: 'info' | 'reminder' | 'attention' | 'urgent';
}

const SIMULATION_STEPS: SimStep[] = [
  {
    stepNumber: 1,
    title: 'Medication Due (06:30 PM)',
    timeOffset: '06:30 PM',
    actor: 'Medication Scheduler',
    detail:
      'Evening blood pressure medication Amlodipine Besylate 5 mg (1 tablet before dinner) becomes due on Lakshmi Devi’s timeline.',
    alertMessage: 'Scheduled Dose Active: Amlodipine 5 mg • 6:30 PM',
    priority: 'info',
  },
  {
    stepNumber: 2,
    title: 'Elderly User Receives Gentle 1st Reminder',
    timeOffset: '06:30 PM (+0m)',
    actor: 'Smart Reminder Engine',
    detail:
      'Lakshmi’s tablet and phone play a calm chime with large high-contrast text and voice prompt.',
    alertMessage: '“It’s time to take your Amlodipine 5 mg.”',
    priority: 'reminder',
  },
  {
    stepNumber: 3,
    title: 'Medication Not Confirmed — 10-Minute Follow-Up',
    timeOffset: '06:40 PM (+10m)',
    actor: 'Smart Reminder Engine',
    detail:
      'No confirmation tap received yet. The system sends a gentle second nudge without alarming the family prematurely.',
    alertMessage: '“Your evening medication is still waiting.”',
    priority: 'reminder',
  },
  {
    stepNumber: 4,
    title: 'System Waits & Verifies 30-Minute Check',
    timeOffset: '07:00 PM (+30m)',
    actor: 'Smart Reminder Engine',
    detail:
      'After 30 minutes, a third check-in prompt asks if the tablet was taken, offering one-tap “Taken” or “Snooze 15m”.',
    alertMessage: '“Have you taken your Amlodipine 5 mg?”',
    priority: 'attention',
  },
  {
    stepNumber: 5,
    title: 'Medication Becomes Missed (Safe Guidance Displayed)',
    timeOffset: '07:15 PM (+45m)',
    actor: 'Medication Safety Guard',
    detail:
      'Dose is marked as Missed (⚠). Displays non-diagnostic safety guidance: never recommends taking an extra or double dose.',
    alertMessage:
      '“Medication appears to be missed. Please follow your doctor’s prescribed instructions. If unsure, contact your healthcare professional.”',
    priority: 'attention',
  },
  {
    stepNumber: 6,
    title: 'Caretaker Meena Receives Priority Alert',
    timeOffset: '07:15 PM',
    actor: 'Notification Engine → Caretaker',
    detail:
      'Checks Care Circle permissions: Caretaker Meena Nair has Daily Care Administration access and receives an immediate in-app & push alert.',
    alertMessage: 'Caretaker Alert dispatched to Meena Nair: Verify 6:30 PM Amlodipine dose.',
    priority: 'attention',
  },
  {
    stepNumber: 7,
    title: 'Family Dashboard Updates in Real Time',
    timeOffset: '07:16 PM',
    actor: 'Notification Engine → Family',
    detail:
      'Daughter Anita Sharma’s Care Overview updates live, showing 1 missed evening dose and Caretaker Meena’s active follow-up status.',
    alertMessage: 'Anita Sharma’s Family Overview synced via real-time listener.',
    priority: 'info',
  },
  {
    stepNumber: 8,
    title: 'Adherence Score & Timeline Dynamically Recalculate',
    timeOffset: '07:16 PM',
    actor: 'Adherence Analytics Engine',
    detail:
      'Today’s progress updates to 3 / 5 taken, 1 missed, 1 upcoming; event is logged in the unified Healthcare Timeline and Audit Log.',
    alertMessage: 'Daily Adherence & Care Routine Score updated.',
    priority: 'info',
  },
  {
    stepNumber: 9,
    title: 'CareAI Generates Organizational Routine Insight',
    timeOffset: '07:17 PM',
    actor: 'CareAI Companion',
    detail:
      'CareAI synthesizes the pattern into a non-diagnostic organizational insight for Lakshmi and Anita.',
    alertMessage:
      'CareAI Insight: “Evening medication appears to have the highest number of delays this week. Consider pairing the 6:30 PM reminder with dinner preparation.”',
    priority: 'info',
  },
];

export const InteractiveDemoModal: React.FC<InteractiveDemoModalProps> = ({
  isOpen,
  onClose,
  onApplySimulationOutcome,
  onResetSimulationOutcome,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(2200);
  const [appliedToApp, setAppliedToApp] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIndex >= SIMULATION_STEPS.length - 1) {
      setIsPlaying(false);
      if (!appliedToApp) {
        onApplySimulationOutcome();
        setAppliedToApp(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next === 4 && !appliedToApp) {
          onApplySimulationOutcome();
          setAppliedToApp(true);
        }
        return next;
      });
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, speedMs, appliedToApp, onApplySimulationOutcome]);

  if (!isOpen) return null;

  const activeStep = SIMULATION_STEPS[currentStepIndex];

  const handleManualStep = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
    if (index >= 4 && !appliedToApp) {
      onApplySimulationOutcome();
      setAppliedToApp(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setAppliedToApp(false);
    onResetSimulationOutcome();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-teal-900 text-white flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-teal-300">
              Interactive Product Walkthrough · 9-Stage Escalation Engine
            </div>
            <h2 className="text-xl font-bold mt-0.5">
              Smart Medication Reminder & Care Circle Simulation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white transition-colors cursor-pointer"
            aria-label="Close Interactive Demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulation Controls Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {currentStepIndex === 0 ? 'Start Medication Simulation' : 'Resume Simulation'}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={() =>
                handleManualStep(Math.min(SIMULATION_STEPS.length - 1, currentStepIndex + 1))
              }
              disabled={currentStepIndex >= SIMULATION_STEPS.length - 1}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Next Step</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Simulation Speed:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-950 rounded-lg">
              {[
                { label: 'Slow (3.5s)', ms: 3500 },
                { label: 'Normal (2.2s)', ms: 2200 },
                { label: 'Fast (1.1s)', ms: 1100 },
              ].map((opt) => (
                <button
                  key={opt.ms}
                  onClick={() => setSpeedMs(opt.ms)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    speedMs === opt.ms
                      ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Body: Left 9-Step Timeline + Right Active Stage Spotlight */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 9 Steps Progress */}
          <div className="lg:col-span-5 space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {SIMULATION_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.stepNumber}
                  onClick={() => handleManualStep(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 dark:border-teal-500 text-slate-900 dark:text-white'
                      : isCompleted
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 tabular-nums shrink-0">
                      0{step.stepNumber}
                    </span>
                    <span className="text-xs font-semibold truncate">{step.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 tabular-nums">
                    {step.timeOffset}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Stage Live View */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  Stage {activeStep.stepNumber} of {SIMULATION_STEPS.length} · {activeStep.actor}
                </span>
                <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                  Simulated Clock: {activeStep.timeOffset}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeStep.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeStep.detail}
              </p>

              {/* Simulated Live Alert Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  activeStep.priority === 'attention'
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200'
                    : activeStep.priority === 'reminder'
                    ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-950 dark:text-sky-200'
                    : 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {activeStep.priority === 'attention' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : activeStep.stepNumber === 9 ? (
                    <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  ) : (
                    <BellRing className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                      Live System Dispatch
                    </div>
                    <div className="text-sm font-semibold leading-snug">
                      {activeStep.alertMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Ecosystem Sync Indicators */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Real-Time Ecosystem Impact:
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs tabular-nums">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500">6:30 PM Dose</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentStepIndex >= 4
                      ? '⚠ Missed'
                      : currentStepIndex >= 1
                      ? '◷ Waiting'
                      : '◷ Upcoming'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500">Caretaker Meena</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentStepIndex >= 5 ? 'Alerted (Active)' : 'Standing By'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500">Adherence Score</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentStepIndex >= 7 ? '86% (Updated)' : '92% (Current)'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-teal-700" />
                  <span>Never recommends doubling a missed medication dose.</span>
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/50 hover:bg-teal-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  Inspect Live Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
