/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Pill,
  Activity,
  CalendarClock,
  Users,
  Clock,
  FileText,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Bell,
  Settings,
  UserCheck,
  Mic,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Sun,
  Moon,
  Volume2,
  Play,
  LogOut,
  ShieldCheck,
  PhoneCall,
  QrCode,
  Sliders,
  Lock,
  Eye,
  Menu,
  X,
} from 'lucide-react';
import {
  UserRole,
  NavSection,
  ElderProfileData,
  MedicationItem,
  AppointmentItem,
  CareCircleMember,
  RoutineTask,
  HealthDocument,
  NotificationItem,
  TimelineEvent,
  AuditLogEntry,
  CareNote,
  ChatMessage,
  NotificationPreferences,
  DoseStatus,
} from './types';
import {
  INITIAL_ELDER_PROFILE,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_CARE_CIRCLE,
  INITIAL_DAILY_PLAN,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TIMELINE,
  INITIAL_AUDIT_LOGS,
  INITIAL_CARE_NOTES,
  WEEKLY_ADHERENCE_DATA,
  GENERATED_IMAGES,
} from './data/demoData';
import { LandingPage } from './components/LandingPage';
import { AppointmentMapView } from './components/AppointmentMapView';
import { InteractiveDemoModal } from './components/InteractiveDemoModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencyOverlay } from './components/EmergencyOverlay';
import { AuthModal } from './components/AuthModal';
import {
  CareCircleView,
  HealthcareTimelineView,
  HealthDocumentsView,
  CareAIAssistantView,
  NotificationsCenterView,
  ReportsAndAuditView,
} from './components/SecondaryViews';
import {
  auth,
  syncElderProfileToFirestore,
  syncMedicationToFirestore,
  deleteMedicationFromFirestore,
  syncAppointmentToFirestore,
  signOutFirebase,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // View state: Landing Page vs Main Application
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('elderly');
  const [authMethodLabel, setAuthMethodLabel] = useState<string>('Care Code 482913');
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(null);

  // Accessibility & Theme Modes
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  // Modals & Overlays
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState<boolean>(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState<boolean>(false);

  // Core Healthcare Data State
  const [profile, setProfile] = useState<ElderProfileData>(INITIAL_ELDER_PROFILE);
  const [medications, setMedications] = useState<MedicationItem[]>(INITIAL_MEDICATIONS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [careCircle, setCareCircle] = useState<CareCircleMember[]>(INITIAL_CARE_CIRCLE);
  const [dailyPlan, setDailyPlan] = useState<RoutineTask[]>(INITIAL_DAILY_PLAN);
  const [documents, setDocuments] = useState<HealthDocument[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [careNotes, setCareNotes] = useState<CareNote[]>(INITIAL_CARE_NOTES);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    emailEnabled: true,
    inAppEnabled: true,
    browserEnabled: true,
    frequency: 'Immediate',
    notifyCaretakerAfterMinutes: 30,
    notifyFamilyAfterMinutes: 45,
    dailyCheckInReminderEnabled: true,
  });

  // CareAI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'careai',
      text: 'Good morning, Lakshmi! You have 5 medications in your plan today: 3 are already completed, Amlodipine 5 mg is scheduled for 6:30 PM, and Atorvastatin 10 mg is at 9:00 PM. You also have an appointment tomorrow at 11:30 AM with Dr. Ravi Kumar at Apollo Heart Institute. How can I help organize your day?',
      timestamp: '09:05 AM',
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // AI Routine Insights State
  const [aiInsights, setAiInsights] = useState<
    { title: string; detail: string; category: string }[]
  >([
    {
      title: 'Morning medications are consistently completed',
      detail: '6:30 AM EcoSprin and 8:00 AM Metformin have a 100% completion rate over the last 7 days.',
      category: 'adherence',
    },
    {
      title: 'Evening medication appears to have the highest number of delays',
      detail: 'Pairing 6:30 PM Amlodipine with pre-dinner preparation helps prevent late confirmations.',
      category: 'schedule',
    },
    {
      title: '2 upcoming appointments scheduled',
      detail: 'Dr. Ravi Kumar (Cardiology) tomorrow at 11:30 AM and Dr. S. Rao (Endocrinology) on Nov 22.',
      category: 'appointment',
    },
    {
      title: 'Medication refill needed soon',
      detail: 'Atorvastatin 10 mg has 4 tablets remaining (4 days left) and Metformin 500 mg has 12 tablets (6 days left).',
      category: 'refill',
    },
  ]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  // Medication & Appointment Sub-Views / Forms
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('500 mg');
  const [newMedDosage, setNewMedDosage] = useState('1 tablet');
  const [newMedTime, setNewMedTime] = useState('08:00 AM');
  const [newMedFood, setNewMedFood] =
    useState<MedicationItem['foodTiming']>('After breakfast');
  const [newMedDoctor, setNewMedDoctor] = useState('Dr. Ravi Kumar');
  const [newMedReason, setNewMedReason] = useState('');
  const [newMedRemaining, setNewMedRemaining] = useState(30);
  const [medFormError, setMedFormError] = useState('');

  const [aptViewMode, setAptViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');
  const [selectedMapAptId, setSelectedMapAptId] = useState<string>('apt_1');
  const [showAddAptModal, setShowAddAptModal] = useState<boolean>(false);
  const [newAptDoctor, setNewAptDoctor] = useState('');
  const [newAptSpecialty, setNewAptSpecialty] = useState('General Medicine');
  const [newAptClinic, setNewAptClinic] = useState('Apollo Clinic Indiranagar');
  const [newAptDate, setNewAptDate] = useState('2026-11-25');
  const [newAptTime, setNewAptTime] = useState('10:30 AM');
  const [newAptAddress, setNewAptAddress] = useState('100 Feet Rd, Indiranagar, Bengaluru');
  const [newAptReason, setNewAptReason] = useState('');

  // Toast banner state
  const [toastBanner, setToastBanner] = useState<{
    title: string;
    detail: string;
    tone: 'teal' | 'amber' | 'rose';
  } | null>(null);

  const showToast = (
    title: string,
    detail: string,
    tone: 'teal' | 'amber' | 'rose' = 'teal'
  ) => {
    setToastBanner({ title, detail, tone });
    setTimeout(() => {
      setToastBanner((prev) => (prev?.title === title ? null : prev));
    }, 4500);
  };

  // Sync Senior Mode & Dark Mode on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (seniorMode) {
      root.classList.add('senior-mode');
    } else {
      root.classList.remove('senior-mode');
    }
  }, [seniorMode]);

  // Listen for Google Maps Platform Demo Key Quota Event (Section 8 Case A)
  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Listen for Firebase Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setFirebaseUserEmail(user.email);
        syncElderProfileToFirestore({
          name: profile.name,
          age: profile.age,
          bloodGroup: profile.bloodGroup,
          careCode: profile.careCode,
          primaryDoctor: profile.primaryDoctor,
          primaryHospital: profile.primaryHospital,
          lastCheckInStatus: profile.lastCheckInStatus,
        });
      } else {
        setFirebaseUserEmail(null);
      }
    });
    return () => unsub();
  }, []);

  // Helper to append to Audit Log
  const addAuditLog = (
    actionType: AuditLogEntry['actionType'],
    description: string,
    customActor?: string
  ) => {
    const actorMap: Record<UserRole, { name: string; role: string }> = {
      elderly: { name: 'Lakshmi Devi', role: 'Elderly Owner' },
      family: { name: 'Anita Sharma (Daughter)', role: 'Family Member' },
      caretaker: { name: 'Meena Nair', role: 'Caretaker' },
      admin: { name: 'System Administrator', role: 'Administrator' },
    };
    const actor = actorMap[currentRole];
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditLogs((prev) => [
      {
        id: `aud_${Date.now()}`,
        timestamp: `Today, ${nowLabel}`,
        actorName: customActor || actor.name,
        actorRole: actor.role,
        actionType,
        description,
      },
      ...prev,
    ]);
  };

  // Permission helper
  const canMutateMedicalRecords = currentRole === 'elderly' || currentRole === 'admin';
  const canConfirmDoses =
    currentRole === 'elderly' || currentRole === 'caretaker' || currentRole === 'admin';

  // Medication Status Handler
  const handleUpdateDoseStatus = (medId: string, newStatus: DoseStatus) => {
    if (!canConfirmDoses) {
      showToast(
        'Permission Restricted',
        'Family members can view schedules and request changes, while Lakshmi Devi or Caretaker Meena confirms doses.',
        'amber'
      );
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const confirmer =
      currentRole === 'caretaker' ? 'Meena Nair (Caretaker)' : 'Lakshmi Devi';

    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m;
        const nextPills =
          newStatus === 'taken' && m.status !== 'taken'
            ? Math.max(0, m.remainingPills - 1)
            : m.remainingPills;
        const updated = {
          ...m,
          status: newStatus,
          takenAt: newStatus === 'taken' ? nowTime : m.takenAt,
          confirmedBy: newStatus === 'taken' ? confirmer : m.confirmedBy,
          remainingPills: nextPills,
          reminderStage: (newStatus === 'missed' ? 3 : 0) as 0 | 1 | 2 | 3,
        };
        syncMedicationToFirestore(updated);
        return updated;
      })
    );

    // Sync linked Daily Plan item
    setDailyPlan((prev) =>
      prev.map((task) =>
        task.linkedMedicationId === medId
          ? { ...task, completed: newStatus === 'taken' }
          : task
      )
    );

    const targetMed = medications.find((m) => m.id === medId);
    if (targetMed) {
      const eventTitle =
        newStatus === 'taken'
          ? `${targetMed.name} (${targetMed.strength}) Taken`
          : newStatus === 'missed'
          ? `${targetMed.name} Marked as Missed`
          : `${targetMed.name} Marked as ${newStatus}`;

      setTimeline((prev) => [
        {
          id: `tl_${Date.now()}`,
          dateLabel: 'NOV 15 (TODAY)',
          timeLabel: nowTime,
          title: eventTitle,
          description:
            newStatus === 'missed'
              ? 'Please follow your doctor’s prescribed instructions. Do not double dose.'
              : `Confirmed by ${confirmer}.`,
          category: newStatus === 'missed' ? 'medication_missed' : 'medication_taken',
          actor: confirmer,
        },
        ...prev,
      ]);

      addAuditLog(
        'Medication Status Updated',
        `${confirmer} updated ${targetMed.name} (${targetMed.scheduledTime}) status to ${newStatus.toUpperCase()}.`
      );

      if (newStatus === 'missed') {
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            priority: 'attention',
            category: 'medication',
            title: `Missed Medication Alert: ${targetMed.name} ${targetMed.strength}`,
            message: `Please follow your doctor's prescribed instructions. If you are unsure what to do about a missed dose, contact your healthcare professional. Alert sent to Meena Nair and Anita Sharma.`,
            timestamp: 'Just now',
            read: false,
            recipients: ['Lakshmi Devi', 'Meena Nair (Caretaker)', 'Anita Sharma (Daughter)'],
            channelsDelivered: ['Email', 'In-App'],
          },
          ...prev,
        ]);
        showToast(
          `Missed Dose Recorded: ${targetMed.name}`,
          'Please follow your doctor’s prescribed instructions. Caretaker Meena & Daughter Anita have been notified.',
          'amber'
        );
      } else {
        showToast(
          `${targetMed.name} Updated`,
          `Dose marked as ${newStatus.toUpperCase()} and synced with Care Circle.`,
          'teal'
        );
      }
    }
  };

  // Add Medication Handler
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutateMedicalRecords) {
      setMedFormError('Only the Elderly Profile Owner (Lakshmi Devi) can add or delete medications.');
      return;
    }
    if (!newMedName.trim() || !newMedStrength.trim()) {
      setMedFormError('Please complete the medication details before saving.');
      return;
    }
    setMedFormError('');

    const created: MedicationItem = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      strength: newMedStrength.trim(),
      dosage: newMedDosage.trim(),
      form: 'Tablet',
      frequency: 'Once daily',
      scheduledTime: newMedTime,
      sortOrder: medications.length + 1,
      startDate: '2026-11-15',
      endDate: '2027-05-15',
      foodTiming: newMedFood,
      prescribingDoctor: newMedDoctor.trim() || 'Dr. Ravi Kumar',
      reason: newMedReason.trim() || 'Prescribed daily therapy',
      instructions: `Take ${newMedDosage} ${newMedFood.toLowerCase()} with water.`,
      prescriptionDocTitle: 'Updated_Prescription_Nov2026.pdf',
      photoUrl: GENERATED_IMAGES.medPack,
      refillQuantity: 30,
      remainingPills: Number(newMedRemaining) || 30,
      dailyRequirement: 1,
      refillThresholdDays: 7,
      status: 'upcoming',
      reminderStage: 0,
    };

    setMedications((prev) => [...prev, created]);
    syncMedicationToFirestore(created);
    addAuditLog('Medication Added', `Added ${created.name} ${created.strength} at ${created.scheduledTime}.`);
    setNewMedName('');
    setNewMedReason('');
    setShowAddMedModal(false);
    showToast('Medication Added', `${created.name} ${created.strength} added to daily schedule.`);
  };

  const handleDeleteMedication = (id: string) => {
    if (!canMutateMedicalRecords) {
      showToast(
        'Permission Restricted',
        'Only Lakshmi Devi (Elderly Owner) can delete medications from her profile.',
        'amber'
      );
      return;
    }
    const target = medications.find((m) => m.id === id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    deleteMedicationFromFirestore(id);
    if (target) {
      addAuditLog('Medication Edited', `Removed ${target.name} from active medication list.`);
      showToast('Medication Removed', `${target.name} has been removed.`);
    }
  };

  const handleRecordRefill = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, remainingPills: m.remainingPills + m.refillQuantity };
        syncMedicationToFirestore(updated);
        return updated;
      })
    );
    showToast('Refill Recorded', 'Tablet inventory replenished and refill alert cleared.');
  };

  // Add Appointment Handler
  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptDoctor.trim()) return;
    const created: AppointmentItem = {
      id: `apt_${Date.now()}`,
      doctorName: newAptDoctor.trim(),
      specialty: newAptSpecialty.trim(),
      clinic: newAptClinic.trim(),
      date: newAptDate,
      dateLabel: newAptDate,
      time: newAptTime,
      address: newAptAddress.trim(),
      contactNumber: '+91 80 2630 4050',
      reason: newAptReason.trim() || 'Scheduled clinical consultation',
      notes: 'Added via ElderCare Connect Appointment Manager.',
      documents: [],
      status: 'scheduled',
      distanceKm: 3.4,
      coordinates: { lat: 12.9716, lng: 77.6412 },
      remindersConfigured: ['7 days before', '1 day before', '1 hour before'],
    };
    setAppointments((prev) => [created, ...prev]);
    syncAppointmentToFirestore({
      id: created.id,
      doctorName: created.doctorName,
      specialty: created.specialty,
      clinic: created.clinic,
      dateTimeLabel: `${created.dateLabel} ${created.time}`,
      status: created.status,
    });
    addAuditLog(
      'Appointment Created',
      `Scheduled visit with ${created.doctorName} (${created.specialty}) on ${created.dateLabel} at ${created.time}.`
    );
    setNewAptDoctor('');
    setNewAptReason('');
    setShowAddAptModal(false);
    showToast('Appointment Scheduled', `Reminders set for 7 days, 1 day, and 1 hour prior.`);
  };

  // Family “I'm Okay” Check-In Handler (Section 24)
  const handleCheckInOkay = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setProfile((prev) => ({
      ...prev,
      lastCheckInTime: `Today, ${nowTime}`,
      lastCheckInStatus: 'Lakshmi has checked in and is okay 💚',
    }));
    setTimeline((prev) => [
      {
        id: `tl_${Date.now()}`,
        dateLabel: 'NOV 15 (TODAY)',
        timeLabel: nowTime,
        title: '“I’m Okay” Check-In Sent to Family',
        description: 'Lakshmi Devi pressed the 💚 I’m Okay button. Anita and Rajesh notified.',
        category: 'checkin',
        actor: 'Lakshmi Devi',
      },
      ...prev,
    ]);
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        priority: 'info',
        category: 'checkin',
        title: '💚 Lakshmi has checked in and is okay',
        message: `Check-in confirmed at ${nowTime}. Scheduled daily check-in satisfied.`,
        timestamp: 'Just now',
        read: false,
        recipients: ['Anita Sharma (Daughter)', 'Rajesh Devi (Son)', 'Meena Nair (Caretaker)'],
        channelsDelivered: ['Email', 'In-App'],
      },
      ...prev,
    ]);
    showToast(
      '💚 “I’m Okay” Check-In Sent!',
      'Daughter Anita and Son Rajesh have received your wellness check-in.'
    );
  };

  // CareAI Query Handler (Server-Side Gemini API)
  const handleSendQueryToCareAI = async (questionText: string): Promise<string> => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: nowTime,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/careai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: questionText,
          role: currentRole,
          contextData: {
            elderName: profile.name,
            age: profile.age,
            medications: medications.map((m) => ({
              name: m.name,
              strength: m.strength,
              time: m.scheduledTime,
              foodTiming: m.foodTiming,
              status: m.status,
              remainingPills: m.remainingPills,
            })),
            appointments: appointments.map((a) => ({
              doctor: a.doctorName,
              specialty: a.specialty,
              clinic: a.clinic,
              when: `${a.dateLabel} at ${a.time}`,
            })),
            careCircle: careCircle.map((c) => ({
              name: c.name,
              relationship: c.relationship,
              receivesMissedMedAlerts: c.receivesMissedMedAlerts,
            })),
          },
        }),
      });
      const data = await res.json();
      const replyText =
        data.reply ||
        'I reviewed your care schedule. Please follow your doctor’s prescribed instructions.';
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'careai',
          text: replyText,
          timestamp: nowTime,
        },
      ]);
      return replyText;
    } catch {
      const fallback =
        'You have 5 medications in today’s routine and an appointment tomorrow at 11:30 AM with Dr. Ravi Kumar. Please follow your doctor’s prescribed instructions.';
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'careai',
          text: fallback,
          timestamp: nowTime,
        },
      ]);
      return fallback;
    } finally {
      setIsSendingChat(false);
    }
  };

  // Document AI Summarization Handler
  const handleSummarizeDocument = async (docId: string) => {
    const target = documents.find((d) => d.id === docId);
    if (!target) return;
    try {
      const res = await fetch('/api/careai/summarize-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: target.title,
          category: target.category,
          doctor: target.doctorName,
          rawText: target.rawContentPreview,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, aiSummary: data.summary } : d))
        );
        showToast('AI Document Summary Ready', `CareAI summarized "${target.title}".`);
      }
    } catch {
      showToast('Summary Fallback Used', 'Generated informational summary locally.', 'amber');
    }
  };

  // Refresh AI Routine Insights
  const handleRefreshInsights = async () => {
    setLoadingInsights(true);
    try {
      const missedCount = medications.filter((m) => m.status === 'missed').length + 1;
      const lowRefillMeds = medications
        .filter((m) => m.remainingPills / m.dailyRequirement <= m.refillThresholdDays)
        .map((m) => `${m.name} (${m.remainingPills} left)`);

      const res = await fetch('/api/careai/routine-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adherenceScore: 92,
          missedCount,
          upcomingAppointmentsCount: appointments.filter((a) => a.status === 'scheduled').length,
          lowRefillMeds,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.insights) && data.insights.length > 0) {
        setAiInsights(data.insights);
        showToast('Organizational Insights Updated', 'CareAI analyzed your recent routine activity.');
      }
    } finally {
      setLoadingInsights(false);
    }
  };

  // Interactive Demo Simulation Outcome Callbacks
  const handleApplySimulationOutcome = () => {
    handleUpdateDoseStatus('med_4', 'missed');
  };

  const handleResetSimulationOutcome = () => {
    setMedications(INITIAL_MEDICATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTimeline(INITIAL_TIMELINE);
    showToast('Demo State Reset', 'Restored Lakshmi Devi’s baseline schedule.');
  };

  // Derived Dashboard Metrics
  const totalMedsToday = medications.length;
  const completedMedsToday = medications.filter((m) => m.status === 'taken').length;
  const pendingMedsToday = medications.filter((m) => m.status === 'upcoming').length;
  const missedMedsToday = medications.filter((m) => m.status === 'missed').length;
  const todayProgressPct =
    totalMedsToday > 0 ? Math.round((completedMedsToday / totalMedsToday) * 100) : 100;
  const nextUpcomingMed =
    medications.find((m) => m.status === 'upcoming') || medications[medications.length - 1];
  const nextScheduledApt =
    appointments.find((a) => a.status === 'scheduled') || appointments[0];
  const completedRoutineTasks = dailyPlan.filter((t) => t.completed).length;
  const dailyCareRoutineScore = Math.round(
    (completedMedsToday / Math.max(1, totalMedsToday)) * 50 +
      (completedRoutineTasks / Math.max(1, dailyPlan.length)) * 30 +
      20
  );
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Render Landing Page if active
  if (showLanding) {
    return (
      <>
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <LandingPage
          onEnterApp={(role) => {
            if (role) setCurrentRole(role);
            setShowLanding(false);
          }}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onLaunchInteractiveDemo={() => {
            setShowLanding(false);
            setDemoModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSelectRoleAndLogin={(role, method) => {
            setCurrentRole(role);
            setAuthMethodLabel(method);
            setShowLanding(false);
            addAuditLog('Login', `Signed in as ${role.toUpperCase()} via ${method}.`);
          }}
        />
      </>
    );
  }

  const SIDEBAR_ITEMS: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'medications', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
    { id: 'adherence', label: 'Adherence Analytics', icon: <Activity className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments & Map', icon: <CalendarClock className="w-4 h-4" /> },
    { id: 'care-circle', label: 'Care Circle', icon: <Users className="w-4 h-4" /> },
    { id: 'timeline', label: 'Healthcare Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents Vault', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai-assistant', label: 'CareAI Assistant', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Profile', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Audit Log', icon: <BarChart3 className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotifCount,
    },
    { id: 'profile', label: 'Elderly Profile', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ...(currentRole === 'admin'
      ? [{ id: 'admin' as NavSection, label: 'Admin Console', icon: <Sliders className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Google Maps Demo Key Quota Banner (Section 8 Case A) */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastBanner && (
        <div
          className={`fixed bottom-20 lg:bottom-6 right-6 z-50 max-w-md rounded-2xl p-4 shadow-xl border ${
            toastBanner.tone === 'rose'
              ? 'bg-rose-900 text-white border-rose-700'
              : toastBanner.tone === 'amber'
              ? 'bg-amber-900 text-white border-amber-700'
              : 'bg-teal-900 text-white border-teal-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold">{toastBanner.title}</div>
              <div className="text-xs opacity-90 mt-0.5">{toastBanner.detail}</div>
            </div>
            <button
              onClick={() => setToastBanner(null)}
              className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar Navigation (260px width) */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
          <div className="space-y-6">
            {/* Brand Lockup */}
            <div className="px-2 pt-1 flex items-center justify-between">
              <button
                onClick={() => setShowLanding(true)}
                className="text-lg font-bold tracking-tight text-teal-800 dark:text-teal-400 cursor-pointer"
              >
                ElderCare Connect
              </button>
            </div>

            {/* Prominent Voice-First & Emergency Shortcuts */}
            <div className="space-y-2">
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>🎙 Talk to CareAI</span>
              </button>
              <button
                onClick={() => {
                  addAuditLog('Emergency Profile Accessed', 'Opened Emergency Mode overlay.');
                  setEmergencyOverlayOpen(true);
                }}
                className="w-full py-2 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Emergency Mode</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar: Senior Mode & Role Info */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <button
              onClick={() => setSeniorMode((s) => !s)}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${
                seniorMode
                  ? 'bg-teal-900 text-white border-teal-700'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Senior Mode (XL Text)</span>
              <span className="font-mono">{seniorMode ? 'ON' : 'OFF'}</span>
            </button>

            <div className="px-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Viewing as: {currentRole.toUpperCase()}
              </div>
              <div className="truncate">
                {firebaseUserEmail ? `Synced: ${firebaseUserEmail}` : authMethodLabel}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          {/* Workspace Top Header (SaaS Top Bar Contract: Breadcrumb trail on left, primary actions on right) */}
          <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
            {/* Left: Contextual Breadcrumb & Role Switcher */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {profile.name}’s Care Ecosystem
              </span>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                /
              </span>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 capitalize">
                {activeNav.replace('-', ' ')}
              </span>
            </div>

            {/* Right: Role Switcher, Senior Mode, Dark Mode, and Launch Interactive Demo */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Role Selector Segmented Control */}
              <div className="hidden xl:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(
                  [
                    { id: 'elderly', label: 'Elderly (Lakshmi)' },
                    { id: 'family', label: 'Family (Anita)' },
                    { id: 'caretaker', label: 'Caretaker (Meena)' },
                    { id: 'admin', label: 'Admin' },
                  ] as { id: UserRole; label: string }[]
                ).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentRole(r.id);
                      showToast(
                        `Switched View to ${r.label}`,
                        r.id === 'elderly'
                          ? 'Full profile ownership & permission control enabled.'
                          : r.id === 'family'
                          ? 'Viewing simplified family care overview & adherence.'
                          : r.id === 'caretaker'
                          ? 'Daily dose administration & care observation mode.'
                          : 'System governance & platform analytics mode.'
                      );
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      currentRole === r.id
                        ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Interactive Demo</span>
              </button>

              <button
                onClick={() => setSeniorMode((s) => !s)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer ${
                  seniorMode
                    ? 'bg-teal-900 text-white border-teal-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title="Toggle Extra-Large Senior Mode"
              >
                Aa Senior {seniorMode ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setDarkMode((d) => !d)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </header>

          {/* Main Scrollable Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
            {/* =========================================================
                SECTION 4 / 7: MAIN PERSONALIZED DASHBOARD
               ========================================================= */}
            {activeNav === 'dashboard' && (
              <div className="space-y-8">
                {/* Personalized Greeting + “I'm Okay” Check-In + Voice Assistant Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        {currentRole === 'elderly'
                          ? 'Elderly Profile Owner · Care Code 482913'
                          : currentRole === 'family'
                          ? 'Viewing Mother’s Care Plan (Anita Sharma — Daughter)'
                          : currentRole === 'caretaker'
                          ? 'Caretaker Shift View (Meena Nair — Active)'
                          : 'Platform Administrator Overview'}
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                        Good Morning, Lakshmi 👋
                      </h1>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        “Here’s your healthcare plan for today.” ·{' '}
                        <span className="font-semibold text-teal-700 dark:text-teal-400">
                          {profile.streakDays}-day consistent routine — Great job staying on
                          schedule!
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Primary Elderly Quick Actions: 💚 I'm Okay + 🎙 Talk to CareAI */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={handleCheckInOkay}
                      className="px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>💚 I’m Okay (Check-In)</span>
                    </button>
                    <button
                      onClick={() => setVoiceModalOpen(true)}
                      className="px-5 py-3 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>🎙 Talk to CareAI</span>
                    </button>
                    <button
                      onClick={() => setEmergencyOverlayOpen(true)}
                      className="px-4 py-3 text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Emergency Info
                    </button>
                  </div>
                </div>

                {/* Top KPI Strip (Medication Progress, Next Medication, Next Appointment, Care Circle Status, Routine Score) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 tabular-nums">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      TODAY · Medication Progress
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {completedMedsToday} / {totalMedsToday} completed
                    </div>
                    <div className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
                      {todayProgressPct}% · {pendingMedsToday} pending · {missedMedsToday} missed
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Next Medication
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {nextUpcomingMed?.name || 'All Completed'}
                    </div>
                    <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                      {nextUpcomingMed
                        ? `${nextUpcomingMed.scheduledTime} • ${nextUpcomingMed.foodTiming}`
                        : 'Done for today'}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Next Appointment
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {nextScheduledApt?.doctorName || 'Dr. Ravi Kumar'}
                    </div>
                    <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                      {nextScheduledApt?.dateLabel} • {nextScheduledApt?.time}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Family & Caretaker Status
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white space-y-1">
                      <div>✓ Daughter checked in</div>
                      <div>✓ Caretaker Active</div>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      Last check-in: {profile.lastCheckInTime}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Daily Care Routine Score
                    </div>
                    <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                      {dailyCareRoutineScore}%
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      Reflects app activity (Medication ✓ Check-in ✓), not a medical health score.
                    </div>
                  </div>
                </div>

                {/* Main Split: Today's Medication Schedule Timeline (Left) + Personalized Daily Plan & AI Insights (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 Cols: Today's Medication Schedule Timeline */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Today’s Medication Schedule Timeline
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tap “Mark Taken” when you take your dose. Status syncs immediately with
                          Meena and Anita.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveNav('medications')}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Manage All Medicines →
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {medications.map((med) => {
                        const daysLeft = Math.floor(med.remainingPills / med.dailyRequirement);
                        const needsRefill = daysLeft <= med.refillThresholdDays;
                        return (
                          <div
                            key={med.id}
                            className={`p-4 rounded-xl border transition-colors ${
                              med.status === 'missed'
                                ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                                : med.status === 'taken'
                                ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5 text-xs tabular-nums">
                                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-sm">
                                    {med.scheduledTime}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                                    {med.foodTiming}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {med.status === 'taken' && `✓ Taken (${med.takenAt || 'On time'})`}
                                    {med.status === 'upcoming' && '◷ Upcoming'}
                                    {med.status === 'missed' && '⚠ Missed'}
                                    {med.status === 'skipped' && 'Skipped'}
                                    {med.status === 'snoozed' && 'Snoozed 15m'}
                                  </span>
                                </div>

                                <div className="text-base font-bold text-slate-900 dark:text-white">
                                  {med.name} · {med.strength} ({med.dosage})
                                </div>

                                <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                                  Prescribed by {med.prescribingDoctor} · Remaining:{' '}
                                  <strong
                                    className={
                                      needsRefill
                                        ? 'text-amber-700 dark:text-amber-400'
                                        : 'text-slate-700 dark:text-slate-300'
                                    }
                                  >
                                    {med.remainingPills} tablets ({daysLeft} days left)
                                  </strong>
                                </div>

                                {med.status === 'missed' && (
                                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                                    Please follow your doctor’s prescribed instructions. If you are
                                    unsure what to do about a missed dose, contact your healthcare
                                    professional.
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {med.status !== 'taken' ? (
                                  <>
                                    <button
                                      onClick={() => handleUpdateDoseStatus(med.id, 'taken')}
                                      className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                      ✓ Mark Taken
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDoseStatus(med.id, 'snoozed')}
                                      className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                      Snooze
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDoseStatus(med.id, 'missed')}
                                      className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                      Simulate Missed
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateDoseStatus(med.id, 'upcoming')}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                                  >
                                    Undo
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right 5 Cols: Personalized Daily Plan (Section 27) & AI Routine Insights (Section 23) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Personalized Daily Plan */}
                    {!seniorMode && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              Personalized Daily Routine Plan
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Check off daily wellness and meal milestones
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                            {completedRoutineTasks}/{dailyPlan.length} Done
                          </span>
                        </div>

                        <div className="space-y-2">
                          {dailyPlan.map((task) => (
                            <label
                              key={task.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setDailyPlan((prev) =>
                                      prev.map((t) =>
                                        t.id === task.id ? { ...t, completed: checked } : t
                                      )
                                    );
                                  }}
                                  className="w-4 h-4 accent-teal-700 shrink-0"
                                />
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    task.completed
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 shrink-0 tabular-nums">
                                {task.time}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Routine Organizational Insights */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                            AI-Generated Organizational Insights (Non-Diagnostic)
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            CareAI Routine Observations
                          </h3>
                        </div>
                        <button
                          onClick={handleRefreshInsights}
                          disabled={loadingInsights}
                          className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 rounded-lg cursor-pointer"
                        >
                          {loadingInsights ? 'Analyzing...' : 'Refresh AI'}
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {aiInsights.map((ins, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1"
                          >
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {ins.title}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {ins.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 8, 9, 10, 22: SMART MEDICATION & REFILL MANAGEMENT
               ========================================================= */}
            {activeNav === 'medications' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Smart Medication & Refill Management
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Complete prescription details, food instructions, multi-stage reminder status,
                      and automated tablet inventory tracking.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMedModal((p) => !p)}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Medication</span>
                  </button>
                </div>

                {/* Add Medication Form Modal/Drawer */}
                {showAddMedModal && (
                  <form
                    onSubmit={handleAddMedication}
                    className="bg-white dark:bg-slate-900 border border-teal-600 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Add Prescribed Medication
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddMedModal(false)}
                        className="text-xs font-semibold text-slate-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    {medFormError && (
                      <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                        {medFormError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Medicine Name</label>
                        <input
                          type="text"
                          value={newMedName}
                          onChange={(e) => setNewMedName(e.target.value)}
                          placeholder="e.g. Telmisartan"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Strength</label>
                        <input
                          type="text"
                          value={newMedStrength}
                          onChange={(e) => setNewMedStrength(e.target.value)}
                          placeholder="40 mg"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Dosage</label>
                        <input
                          type="text"
                          value={newMedDosage}
                          onChange={(e) => setNewMedDosage(e.target.value)}
                          placeholder="1 tablet"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Scheduled Time</label>
                        <input
                          type="text"
                          value={newMedTime}
                          onChange={(e) => setNewMedTime(e.target.value)}
                          placeholder="08:00 AM"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Food Timing</label>
                        <select
                          value={newMedFood}
                          onChange={(e) =>
                            setNewMedFood(e.target.value as MedicationItem['foodTiming'])
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          <option value="Before breakfast">Before breakfast</option>
                          <option value="After breakfast">After breakfast</option>
                          <option value="After lunch">After lunch</option>
                          <option value="Before dinner">Before dinner</option>
                          <option value="After dinner">After dinner</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Prescribing Doctor
                        </label>
                        <input
                          type="text"
                          value={newMedDoctor}
                          onChange={(e) => setNewMedDoctor(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Remaining Tablets
                        </label>
                        <input
                          type="number"
                          value={newMedRemaining}
                          onChange={(e) => setNewMedRemaining(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Reason for Medication
                        </label>
                        <input
                          type="text"
                          value={newMedReason}
                          onChange={(e) => setNewMedReason(e.target.value)}
                          placeholder="Blood pressure support"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
                      >
                        Save Medication
                      </button>
                    </div>
                  </form>
                )}

                {/* Medication Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medications.map((med) => {
                    const estDaysRemaining = Math.floor(med.remainingPills / med.dailyRequirement);
                    const refillStatus =
                      estDaysRemaining <= 4
                        ? { label: '🔴 Refill required', tone: 'text-rose-600 dark:text-rose-400' }
                        : estDaysRemaining <= med.refillThresholdDays
                        ? { label: '🟡 Refill soon', tone: 'text-amber-600 dark:text-amber-400' }
                        : { label: '🟢 Sufficient', tone: 'text-emerald-700 dark:text-emerald-400' };

                    return (
                      <div
                        key={med.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <img
                                src={med.photoUrl}
                                alt={med.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div>
                                <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                                  {med.scheduledTime} · {med.foodTiming}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                  {med.name}
                                </h3>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {med.strength} · {med.dosage} ({med.form}) · {med.frequency}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                              {med.status === 'taken' && '✓ Taken'}
                              {med.status === 'upcoming' && '◷ Upcoming'}
                              {med.status === 'missed' && '⚠ Missed'}
                              {med.status === 'skipped' && 'Skipped'}
                              {med.status === 'snoozed' && 'Snoozed'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                            <div>
                              <strong>Reason:</strong> {med.reason}
                            </div>
                            <div>
                              <strong>Instructions:</strong> {med.instructions}
                            </div>
                            <div>
                              <strong>Prescribing Doctor:</strong> {med.prescribingDoctor} · Rx:{' '}
                              {med.prescriptionDocTitle}
                            </div>
                          </div>

                          {/* Smart Refill Bar */}
                          <div className="flex items-center justify-between text-xs pt-1 tabular-nums">
                            <div>
                              <span className="text-slate-500">Inventory: </span>
                              <strong className="text-slate-900 dark:text-white">
                                {med.remainingPills} tablets remaining
                              </strong>{' '}
                              <span className="text-slate-500">({estDaysRemaining} days left)</span>
                            </div>
                            <span className={`font-bold ${refillStatus.tone}`}>
                              {refillStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateDoseStatus(med.id, 'taken')}
                              className="px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
                            >
                              ✓ Confirm Taken
                            </button>
                            <button
                              onClick={() => handleRecordRefill(med.id)}
                              className="px-3 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 rounded-xl cursor-pointer"
                            >
                              + Log Refill (+{med.refillQuantity})
                            </button>
                          </div>
                          {canMutateMedicalRecords && (
                            <button
                              onClick={() => handleDeleteMedication(med.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Delete Medication"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 12: MEDICATION ADHERENCE ANALYTICS
               ========================================================= */}
            {activeNav === 'adherence' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Medication Adherence Analytics & Routine Consistency
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Organizational tracking of daily, weekly, and monthly dose completion. Not a
                      clinical diagnosis.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 tabular-nums shrink-0">
                    <div className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-right">
                      <div className="text-xs text-teal-800 dark:text-teal-300 font-semibold">
                        Medication Adherence Score
                      </div>
                      <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                        90.4%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Adherence Visual Bar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Weekly Adherence Chart (Mon – Sun)
                      </h3>
                      <span className="text-xs text-slate-500 tabular-nums">
                        32 Taken · 3 Missed · 3 Late
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-3 items-end h-52 pt-6 px-2 border-b border-slate-200 dark:border-slate-800 tabular-nums">
                      {WEEKLY_ADHERENCE_DATA.map((d) => (
                        <div
                          key={d.day}
                          className="flex flex-col items-center justify-end h-full gap-2"
                        >
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            {d.percentage}%
                          </span>
                          <div className="w-full max-w-[44px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-36 flex items-end overflow-hidden">
                            <div
                              style={{ height: `${d.percentage}%` }}
                              className={`w-full rounded-t-xl transition-all ${
                                d.percentage === 100
                                  ? 'bg-teal-600'
                                  : d.percentage >= 80
                                  ? 'bg-teal-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 pb-2">
                            {d.day.slice(0, 3)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        “Your medication routine has been more consistent this week (5 days at 90%+).”
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        “3 doses were missed this week, primarily on Thursday evening.”
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        “Evening medication appears to have the highest number of delays.”
                      </div>
                    </div>
                  </div>

                  {/* Medication-Specific Adherence Breakdown */}
                  <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Medication-Specific Adherence
                    </h3>
                    <div className="space-y-4 tabular-nums">
                      {[
                        { name: 'EcoSprin 75 mg (Morning)', pct: 100 },
                        { name: 'Metformin 500 mg (Breakfast)', pct: 96 },
                        { name: 'Vitamin D3 1000 IU (Lunch)', pct: 92 },
                        { name: 'Amlodipine 5 mg (Evening)', pct: 82 },
                        { name: 'Atorvastatin 10 mg (Night)', pct: 88 },
                      ].map((item) => (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                            <span className="font-mono text-teal-700 dark:text-teal-400">
                              {item.pct}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${item.pct}%` }}
                              className="h-full bg-teal-600 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 17 & 36: APPOINTMENT MANAGEMENT & GOOGLE MAPS
               ========================================================= */}
            {activeNav === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Doctor Appointments & Clinic Navigation
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Manage cardiology, endocrinology, and vision checkups with 7-day, 1-day, and
                      1-hour automatic reminders.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {(['list', 'calendar', 'timeline'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setAptViewMode(m)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize cursor-pointer ${
                            aptViewMode === m
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAddAptModal((p) => !p)}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Appointment</span>
                    </button>
                  </div>
                </div>

                {showAddAptModal && (
                  <form
                    onSubmit={handleAddAppointment}
                    className="bg-white dark:bg-slate-900 border border-teal-600 rounded-2xl p-6 space-y-4"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Schedule New Doctor Appointment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Doctor Name</label>
                        <input
                          type="text"
                          required
                          value={newAptDoctor}
                          onChange={(e) => setNewAptDoctor(e.target.value)}
                          placeholder="Dr. Priya Nair"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Specialty</label>
                        <input
                          type="text"
                          value={newAptSpecialty}
                          onChange={(e) => setNewAptSpecialty(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Hospital / Clinic</label>
                        <input
                          type="text"
                          value={newAptClinic}
                          onChange={(e) => setNewAptClinic(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Date</label>
                        <input
                          type="date"
                          value={newAptDate}
                          onChange={(e) => setNewAptDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Time</label>
                        <input
                          type="text"
                          value={newAptTime}
                          onChange={(e) => setNewAptTime(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Reason for Visit</label>
                        <input
                          type="text"
                          value={newAptReason}
                          onChange={(e) => setNewAptReason(e.target.value)}
                          placeholder="Routine checkup"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAptModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
                      >
                        Save Appointment
                      </button>
                    </div>
                  </form>
                )}

                {/* Appointment Cards (List / Calendar / Timeline Views) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs tabular-nums">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                            {apt.dateLabel} • {apt.time}
                          </span>
                          <span className="font-semibold capitalize text-slate-500">
                            {apt.status}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {apt.doctorName}
                          </h3>
                          <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
                            {apt.specialty} · {apt.clinic}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>Reason:</strong> {apt.reason}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Prep Notes:</strong> {apt.notes}
                        </p>
                        <div className="text-[11px] text-slate-500 pt-1">
                          Reminders: {apt.remindersConfigured.join(' · ')}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs tabular-nums">
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          📍 {apt.distanceKm} km away
                        </span>
                        <button
                          onClick={() => setSelectedMapAptId(apt.id)}
                          className="font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          Focus on Map →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Google Maps Clinic Locator Component */}
                <AppointmentMapView
                  appointments={appointments}
                  selectedAppointmentId={selectedMapAptId}
                  onSelectAppointment={(id) => setSelectedMapAptId(id)}
                />
              </div>
            )}

            {/* =========================================================
                SECTION 15 & 16: MY CARE CIRCLE & ACTIVITY FEED
               ========================================================= */}
            {activeNav === 'care-circle' && (
              <CareCircleView
                role={currentRole}
                careCode={profile.careCode}
                members={careCircle}
                careNotes={careNotes}
                timeline={timeline}
                onApproveMember={(id) => {
                  setCareCircle((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, accessStatus: 'approved' } : m))
                  );
                  addAuditLog('Permission Changed', `Approved Care Circle access for member ${id}.`);
                  showToast('Access Approved', 'Care Circle member now has authorized view permissions.');
                }}
                onRemoveMember={(id) => {
                  setCareCircle((prev) => prev.filter((m) => m.id !== id));
                  addAuditLog('Permission Changed', `Revoked Care Circle access for member ${id}.`);
                  showToast('Member Removed', 'Access permissions revoked immediately.');
                }}
                onInviteMember={(newMember) => {
                  setCareCircle((prev) => [
                    ...prev,
                    {
                      ...newMember,
                      id: `cc_${Date.now()}`,
                      onlineStatus: 'online',
                      lastActivity: 'Invited just now',
                    },
                  ]);
                  addAuditLog('Permission Changed', `Invited ${newMember.name} (${newMember.relationship}) to Care Circle.`);
                  showToast('Invitation Created', `${newMember.name} added to Care Circle.`);
                }}
                onAddCareNote={(content) => {
                  const authorMap: Record<UserRole, { name: string; role: string }> = {
                    elderly: { name: 'Lakshmi Devi', role: 'Elderly Owner' },
                    family: { name: 'Anita Sharma', role: 'Daughter' },
                    caretaker: { name: 'Meena Nair', role: 'Caretaker' },
                    admin: { name: 'Administrator', role: 'Admin' },
                  };
                  const a = authorMap[currentRole];
                  setCareNotes((prev) => [
                    {
                      id: `cn_${Date.now()}`,
                      authorName: a.name,
                      authorRole: a.role,
                      timestamp: 'Just now',
                      content,
                    },
                    ...prev,
                  ]);
                  showToast('Care Observation Saved', 'Shared with authorized Care Circle members.');
                }}
              />
            )}

            {/* =========================================================
                SECTION 18: UNIFIED HEALTHCARE TIMELINE
               ========================================================= */}
            {activeNav === 'timeline' && <HealthcareTimelineView timeline={timeline} />}

            {/* =========================================================
                SECTION 21: HEALTH DOCUMENT VAULT
               ========================================================= */}
            {activeNav === 'documents' && (
              <HealthDocumentsView
                documents={documents}
                onUploadDocument={(newDoc) => {
                  setDocuments((prev) => [
                    {
                      ...newDoc,
                      id: `doc_${Date.now()}`,
                      uploadedAt: 'Nov 15, 2026',
                    },
                    ...prev,
                  ]);
                  addAuditLog('Document Uploaded', `Uploaded "${newDoc.title}" to Health Document Vault.`);
                  showToast('Document Uploaded', `"${newDoc.title}" stored securely in Vault.`);
                }}
                onDeleteDocument={(id) => {
                  setDocuments((prev) => prev.filter((d) => d.id !== id));
                  showToast('Document Deleted', 'Removed document from Vault.');
                }}
                onSummarizeDocument={handleSummarizeDocument}
              />
            )}

            {/* =========================================================
                SECTION 13 & 41: CAREAI ASSISTANT
               ========================================================= */}
            {activeNav === 'ai-assistant' && (
              <CareAIAssistantView
                messages={chatMessages}
                onSendMessage={async (txt) => {
                  await handleSendQueryToCareAI(txt);
                }}
                onOpenVoiceModal={() => setVoiceModalOpen(true)}
                isSending={isSendingChat}
              />
            )}

            {/* =========================================================
                SECTION 19 & 20: EMERGENCY PROFILE & QR CARD
               ========================================================= */}
            {activeNav === 'emergency' && (
              <div className="bg-white dark:bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-600">
                      Critical Medical & Emergency Readiness Profile
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {profile.name} · Age {profile.age} · Blood Group {profile.bloodGroup}
                    </h2>
                  </div>
                  <button
                    onClick={() => setEmergencyOverlayOpen(true)}
                    className="px-5 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Activate Full-Screen Emergency Mode & QR</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      Allergies & Reactions
                    </div>
                    <ul className="text-sm font-semibold space-y-1 list-disc list-inside">
                      {profile.allergies.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Chronic Medical Conditions
                    </div>
                    <ul className="text-sm font-semibold space-y-1 list-disc list-inside">
                      {profile.medicalConditions.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Primary Physician & Insurance
                    </div>
                    <div className="text-sm font-bold">{profile.primaryDoctor}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {profile.primaryHospital} ({profile.primaryDoctorPhone})
                    </div>
                    <div className="text-xs text-teal-700 dark:text-teal-400 font-mono pt-1 tabular-nums">
                      {profile.insuranceProvider} · {profile.insurancePolicyNumber}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200">
                  <strong>Important Emergency Notes:</strong> {profile.emergencyNotes}
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 29 & 31: REPORTS, FAMILY OVERVIEW & AUDIT LOG
               ========================================================= */}
            {activeNav === 'reports' && (
              <ReportsAndAuditView
                profile={profile}
                medications={medications}
                appointments={appointments}
                auditLogs={auditLogs}
              />
            )}

            {/* =========================================================
                SECTION 11 & 34: NOTIFICATIONS CENTER & EMAIL ENGINE
               ========================================================= */}
            {activeNav === 'notifications' && (
              <NotificationsCenterView
                notifications={notifications}
                prefs={notifPrefs}
                onMarkAllRead={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
                onUpdatePrefs={(updated) => {
                  setNotifPrefs(updated);
                  showToast('Notification Preferences Saved', 'Updated email and in-app delivery settings.');
                }}
                onSendTestNotification={async () => {
                  const res = await fetch('/api/notifications/dispatch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eventType: 'medication_due',
                      priority: 'reminder',
                      title: 'Test Care Circle Dispatch: Evening Amlodipine 5 mg',
                      message:
                        'Centralized Notification Engine verified permissions and dispatched Email + In-App alert.',
                      recipients: ['Lakshmi Devi', 'Anita Sharma (Daughter)', 'Meena Nair (Caretaker)'],
                      channels: {
                        email: notifPrefs.emailEnabled,
                        inApp: notifPrefs.inAppEnabled,
                        browser: notifPrefs.browserEnabled,
                      },
                    }),
                  });
                  const data = await res.json();
                  if (data.dispatched) {
                    setNotifications((prev) => [
                      {
                        id: data.id,
                        priority: 'reminder',
                        category: 'medication',
                        title: 'Test Care Circle Dispatch: Evening Amlodipine 5 mg',
                        message:
                          'Centralized Notification Engine verified permissions and dispatched Email + In-App alert.',
                        timestamp: 'Just now',
                        read: false,
                        recipients: data.recipients,
                        channelsDelivered: ['Email', 'In-App'],
                      },
                      ...prev,
                    ]);
                    showToast('Notification Dispatched', 'Email & In-App notification recorded in database.');
                  }
                }}
              />
            )}

            {/* =========================================================
                SECTION 3: ELDERLY PROFILE MANAGEMENT
               ========================================================= */}
            {activeNav === 'profile' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Elderly Healthcare Profile & Ownership Settings
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Lakshmi Devi maintains primary control over personal details, medical
                      history, and her 6-digit Care Code.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      disabled={!canMutateMedicalRecords}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      6-Digit Care Access Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={profile.careCode}
                      disabled={!canMutateMedicalRecords}
                      onChange={(e) => setProfile({ ...profile, careCode: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Primary Physician</label>
                    <input
                      type="text"
                      value={profile.primaryDoctor}
                      disabled={!canMutateMedicalRecords}
                      onChange={(e) => setProfile({ ...profile, primaryDoctor: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Primary Hospital</label>
                    <input
                      type="text"
                      value={profile.primaryHospital}
                      disabled={!canMutateMedicalRecords}
                      onChange={(e) => setProfile({ ...profile, primaryHospital: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      syncElderProfileToFirestore(profile);
                      showToast('Profile Saved', 'Synced changes with ElderCare Connect.');
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 15 & 38: ACCESSIBILITY & PLATFORM SETTINGS
               ========================================================= */}
            {activeNav === 'settings' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Accessibility, Senior Mode & Display Settings
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Customize font scaling, button size, high-contrast display, and voice-first
                    behavior.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        Senior Mode (Extra-Large Text & Simplified Layout)
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Increases base typography to 118%, enlarges touch targets to 48px+, and
                        simplifies dashboard cards.
                      </p>
                    </div>
                    <button
                      onClick={() => setSeniorMode((s) => !s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        seniorMode ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {seniorMode ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        High-Contrast Dark Theme
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Reduces eye strain for evening and nighttime medication checks.
                      </p>
                    </div>
                    <button
                      onClick={() => setDarkMode((d) => !d)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        darkMode ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {darkMode ? 'DARK ON' : 'LIGHT ON'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 16: ADMIN / MANAGEMENT DASHBOARD
               ========================================================= */}
            {activeNav === 'admin' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Platform Administrator & Anonymized Governance Console
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Monitor notification delivery queues, Firestore security rule enforcement, and
                    role-based access logs without exposing private patient clinical records.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 tabular-nums">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Active Care Circles</div>
                    <div className="text-2xl font-bold mt-1">128</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Anonymized Adherence Avg</div>
                    <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">
                      93.8%
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Notification Delivery Rate</div>
                    <div className="text-2xl font-bold mt-1">99.9%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Zero-Trust Firestore Rules</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                      Verified & Deployed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Persistent Medical Safety Disclaimer Footer inside Workspace */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                ElderCare Connect is designed to help organize healthcare routines and
                communication. It does not replace professional medical advice, diagnosis, or
                treatment.
              </span>
              <span className="font-semibold text-teal-700 dark:text-teal-400 shrink-0">
                “Technology doesn’t replace human care — it helps people care better.”
              </span>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Home, Medicines, Appointments, Care, More) — <=15% viewport height */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 grid grid-cols-5 gap-1">
        {[
          { id: 'dashboard' as NavSection, label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'medications' as NavSection, label: 'Medicines', icon: <Pill className="w-4 h-4" /> },
          { id: 'appointments' as NavSection, label: 'Visits', icon: <CalendarClock className="w-4 h-4" /> },
          { id: 'care-circle' as NavSection, label: 'Care', icon: <Users className="w-4 h-4" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveNav(item.id);
              setMobileMoreOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer ${
              activeNav === item.id
                ? 'text-teal-700 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/50'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.icon}
            <span className="mt-0.5 truncate">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setMobileMoreOpen((m) => !m)}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          {mobileMoreOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer */}
      {mobileMoreOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-14 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl grid grid-cols-2 gap-2">
          {SIDEBAR_ITEMS.slice(4).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                setMobileMoreOpen(false);
              }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Global Interactive Modals */}
      <InteractiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onApplySimulationOutcome={handleApplySimulationOutcome}
        onResetSimulationOutcome={handleResetSimulationOutcome}
      />

      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onSendQueryToCareAI={handleSendQueryToCareAI}
      />

      <EmergencyOverlay
        isOpen={emergencyOverlayOpen}
        onClose={() => setEmergencyOverlayOpen(false)}
        profile={profile}
        medications={medications}
        careCircle={careCircle}
        onLogEmergencyAction={(desc) => addAuditLog('Emergency Profile Accessed', desc)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSelectRoleAndLogin={(role, method) => {
          setCurrentRole(role);
          setAuthMethodLabel(method);
          addAuditLog('Login', `Switched role to ${role.toUpperCase()} via ${method}.`);
          showToast(`Signed In as ${role.toUpperCase()}`, `Session authenticated via ${method}.`);
        }}
      />
    </div>
  );
}
