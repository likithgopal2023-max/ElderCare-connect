export type UserRole = 'elderly' | 'family' | 'caretaker' | 'admin';

export type DoseStatus = 'taken' | 'upcoming' | 'missed' | 'skipped' | 'snoozed';

export type AlertPriority = 'info' | 'reminder' | 'attention' | 'urgent';

export type NavSection =
  | 'dashboard'
  | 'medications'
  | 'adherence'
  | 'appointments'
  | 'care-circle'
  | 'timeline'
  | 'documents'
  | 'ai-assistant'
  | 'emergency'
  | 'reports'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'admin';

export interface ElderProfileData {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  bloodGroup: string;
  careCode: string;
  avatarUrl: string;
  phone: string;
  address: string;
  primaryDoctor: string;
  primaryDoctorPhone: string;
  primaryHospital: string;
  allergies: string[];
  medicalConditions: string[];
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyNotes: string;
  lastCheckInTime: string;
  lastCheckInStatus: string;
  dailyCheckInTargetTime: string;
  streakDays: number;
}

export interface MedicationItem {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  form: 'Tablet' | 'Capsule' | 'Softgel' | 'Liquid' | 'Injection';
  frequency: string;
  scheduledTime: string;
  sortOrder: number;
  startDate: string;
  endDate: string;
  foodTiming: 'Before breakfast' | 'After breakfast' | 'After lunch' | 'Before dinner' | 'After dinner' | 'With water';
  prescribingDoctor: string;
  reason: string;
  instructions: string;
  prescriptionDocTitle: string;
  photoUrl: string;
  refillQuantity: number;
  remainingPills: number;
  dailyRequirement: number;
  refillThresholdDays: number;
  status: DoseStatus;
  takenAt?: string;
  confirmedBy?: string;
  reminderStage: 0 | 1 | 2 | 3; // 0: normal, 1: due now, 2: +10m waiting, 3: +30m check / missed
}

export interface AppointmentItem {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  dateLabel: string;
  time: string;
  address: string;
  contactNumber: string;
  reason: string;
  notes: string;
  documents: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  remindersConfigured: string[];
}

export interface CareCircleMember {
  id: string;
  name: string;
  relationship: 'Daughter' | 'Son' | 'Spouse' | 'Caretaker' | 'Primary Doctor' | 'Emergency Contact';
  role: UserRole | 'doctor';
  permissionLevel: 'Full Care Partner' | 'Medication & Schedule Viewer' | 'Daily Care Administration' | 'Clinical Oversight' | 'Emergency Only';
  onlineStatus: 'online' | 'offline';
  lastActivity: string;
  notificationChannels: ('Email' | 'In-App' | 'SMS/Push')[];
  receivesMissedMedAlerts: boolean;
  phone: string;
  email: string;
  avatarUrl?: string;
  accessStatus: 'approved' | 'pending';
}

export interface RoutineTask {
  id: string;
  time: string;
  title: string;
  category: 'medication' | 'meal' | 'activity' | 'checkin' | 'rest';
  completed: boolean;
  linkedMedicationId?: string;
}

export interface HealthDocument {
  id: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'Medical Report' | 'Scan Report' | 'Insurance Document' | 'Doctor Note';
  uploadedAt: string;
  uploadedBy: string;
  doctorName: string;
  fileSize: string;
  rawContentPreview: string;
  aiSummary?: string;
}

export interface NotificationItem {
  id: string;
  priority: AlertPriority;
  category: 'medication' | 'appointment' | 'family' | 'emergency' | 'refill' | 'checkin';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  recipients: string[];
  channelsDelivered: ('Email' | 'In-App' | 'Browser')[];
}

export interface TimelineEvent {
  id: string;
  dateLabel: string;
  timeLabel: string;
  title: string;
  description: string;
  category: 'medication_taken' | 'medication_missed' | 'appointment' | 'document' | 'checkin' | 'care_note';
  actor: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType:
    | 'Login'
    | 'Profile Access'
    | 'Medication Added'
    | 'Medication Edited'
    | 'Medication Status Updated'
    | 'Appointment Created'
    | 'Document Uploaded'
    | 'Permission Changed'
    | 'Emergency Profile Accessed';
  description: string;
}

export interface CareNote {
  id: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'careai';
  text: string;
  timestamp: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  browserEnabled: boolean;
  frequency: 'Immediate' | 'Batched Hourly' | 'Daily Summary';
  notifyCaretakerAfterMinutes: number;
  notifyFamilyAfterMinutes: number;
  dailyCheckInReminderEnabled: boolean;
}
