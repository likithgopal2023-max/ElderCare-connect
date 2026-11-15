import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  Search,
  Send,
  Mic,
  ShieldAlert,
  BellRing,
  Mail,
  Sliders,
  Lock,
  Activity,
  BarChart3,
  HeartHandshake,
  Eye,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import {
  UserRole,
  ElderProfileData,
  MedicationItem,
  AppointmentItem,
  CareCircleMember,
  HealthDocument,
  NotificationItem,
  TimelineEvent,
  AuditLogEntry,
  CareNote,
  ChatMessage,
  NotificationPreferences,
} from '../types';
import { WEEKLY_ADHERENCE_DATA } from '../data/demoData';

// 1. MY CARE CIRCLE VIEW
export const CareCircleView: React.FC<{
  role: UserRole;
  careCode: string;
  members: CareCircleMember[];
  careNotes: CareNote[];
  timeline: TimelineEvent[];
  onApproveMember: (id: string) => void;
  onRemoveMember: (id: string) => void;
  onInviteMember: (member: Omit<CareCircleMember, 'id' | 'onlineStatus' | 'lastActivity'>) => void;
  onAddCareNote: (content: string) => void;
}> = ({
  role,
  careCode,
  members,
  careNotes,
  timeline,
  onApproveMember,
  onRemoveMember,
  onInviteMember,
  onAddCareNote,
}) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRelation, setInviteRelation] =
    useState<CareCircleMember['relationship']>('Daughter');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePerm, setInvitePerm] =
    useState<CareCircleMember['permissionLevel']>('Medication & Schedule Viewer');
  const [noteInput, setNoteInput] = useState('');
  const [formError, setFormError] = useState('');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.includes('@')) {
      setFormError('Please provide a valid member name and email address.');
      return;
    }
    setFormError('');
    onInviteMember({
      name: inviteName.trim(),
      relationship: inviteRelation,
      role: inviteRelation === 'Caretaker' ? 'caretaker' : 'family',
      permissionLevel: invitePerm,
      notificationChannels: ['Email', 'In-App'],
      receivesMissedMedAlerts: true,
      phone: invitePhone.trim() || '+91 98450 00000',
      email: inviteEmail.trim(),
      accessStatus: role === 'elderly' ? 'approved' : 'pending',
    });
    setInviteName('');
    setInvitePhone('');
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddCareNote(noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="space-y-8">
      {/* Header & Care Code Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Care Circle & Trusted Network
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Lakshmi Devi retains full ownership of permissions. Family members and caretakers
            collaborate transparently.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <div className="text-xs">
              <div className="text-slate-500 dark:text-slate-400">6-Digit Care Access Code</div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                {careCode}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowInviteForm((prev) => !prev)}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Invite Member Form */}
      {showInviteForm && (
        <form
          onSubmit={handleInviteSubmit}
          className="bg-white dark:bg-slate-900 border border-teal-600 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Invite Trusted Family Member, Caretaker, or Doctor
            </h3>
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Relationship / Role
              </label>
              <select
                value={inviteRelation}
                onChange={(e) =>
                  setInviteRelation(e.target.value as CareCircleMember['relationship'])
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Spouse">Spouse</option>
                <option value="Caretaker">Caretaker</option>
                <option value="Primary Doctor">Primary Doctor</option>
                <option value="Emergency Contact">Emergency Contact</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permission Level
              </label>
              <select
                value={invitePerm}
                onChange={(e) =>
                  setInvitePerm(e.target.value as CareCircleMember['permissionLevel'])
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Full Care Partner">Full Care Partner</option>
                <option value="Medication & Schedule Viewer">Medication & Schedule Viewer</option>
                <option value="Daily Care Administration">Daily Care Administration</option>
                <option value="Clinical Oversight">Clinical Oversight</option>
                <option value="Emergency Only">Emergency Only</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
            >
              {role === 'elderly'
                ? 'Approve & Add to Care Circle'
                : 'Submit Access Request for Elderly Approval'}
            </button>
          </div>
        </form>
      )}

      {/* Care Circle Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  <div className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    {member.relationship} · {member.permissionLevel}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                  {member.accessStatus === 'pending'
                    ? 'Pending Approval'
                    : member.onlineStatus === 'online'
                    ? 'Active Now'
                    : 'Offline'}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>Last activity: {member.lastActivity}</div>
                <div className="tabular-nums">Phone: {member.phone}</div>
                <div>
                  Notifications: {member.notificationChannels.join(' · ')}
                  {member.receivesMissedMedAlerts ? ' · Missed-Dose Alerts ON' : ''}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {member.accessStatus === 'pending' ? (
                role === 'elderly' || role === 'admin' ? (
                  <button
                    onClick={() => onApproveMember(member.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Access</span>
                  </button>
                ) : (
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    Awaiting Lakshmi Devi’s approval
                  </span>
                )
              ) : (
                <a
                  href={`tel:${member.phone.replace(/\s+/g, '')}`}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Call {member.name.split(' ')[0]}
                </a>
              )}

              {(role === 'elderly' || role === 'admin') && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Care Circle Activity Feed & Collaborative Care Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-Time Care Circle Activity Feed */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Care Circle Real-Time Activity Feed
          </h3>
          <div className="space-y-3">
            {timeline.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.category === 'medication_missed' ? '⚠ ' : '✓ '}
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0 tabular-nums">
                  {item.timeLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collaborative Care Notes */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Shared Caretaker & Family Observations
          </h3>
          <form onSubmit={handleNoteSubmit} className="flex gap-2">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add a care note or observation (e.g., BP 124/78 after morning walk)..."
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              Add Note
            </button>
          </form>
          <div className="space-y-3">
            {careNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {note.authorName} · {note.authorRole}
                  </span>
                  <span>{note.timestamp}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. UNIFIED HEALTHCARE TIMELINE VIEW
export const HealthcareTimelineView: React.FC<{
  timeline: TimelineEvent[];
}> = ({ timeline }) => {
  const [filterCat, setFilterCat] = useState<string>('all');

  const filtered =
    filterCat === 'all' ? timeline : timeline.filter((t) => t.category === filterCat);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Unified Healthcare Timeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Chronological history of medications taken, missed-dose alerts, completed doctor
            appointments, and uploaded prescriptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'medication_taken', label: 'Taken' },
            { id: 'medication_missed', label: 'Missed' },
            { id: 'appointment', label: 'Appointments' },
            { id: 'document', label: 'Documents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCat(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterCat === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                  {ev.dateLabel} • {ev.timeLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>Recorded by {ev.actor}</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{ev.title}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{ev.description}</p>
            </div>
            <div className="text-xs font-semibold text-slate-500 shrink-0">
              {ev.category === 'medication_taken' && '✓ Medication Confirmed'}
              {ev.category === 'medication_missed' && '⚠ Attention Logged'}
              {ev.category === 'appointment' && '✓ Clinical Visit'}
              {ev.category === 'document' && '✓ Vault Record'}
              {ev.category === 'checkin' && '💚 Wellness Check-In'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. HEALTH DOCUMENT VAULT VIEW
export const HealthDocumentsView: React.FC<{
  documents: HealthDocument[];
  onUploadDocument: (doc: Omit<HealthDocument, 'id' | 'uploadedAt'>) => void;
  onDeleteDocument: (id: string) => void;
  onSummarizeDocument: (id: string) => Promise<void>;
}> = ({ documents, onUploadDocument, onDeleteDocument, onSummarizeDocument }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HealthDocument['category']>('Prescription');
  const [newDoctor, setNewDoctor] = useState('Dr. Ravi Kumar');
  const [newContent, setNewContent] = useState('');
  const [previewDoc, setPreviewDoc] = useState<HealthDocument | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.rawContentPreview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onUploadDocument({
      title: newTitle.trim(),
      category: newCategory,
      uploadedBy: 'Lakshmi Devi',
      doctorName: newDoctor.trim() || 'Primary Physician',
      fileSize: '740 KB PDF',
      rawContentPreview:
        newContent.trim() ||
        'Clinical document uploaded to ElderCare Connect Vault for Care Circle reference.',
    });
    setNewTitle('');
    setNewContent('');
    setShowUploadModal(false);
  };

  const handleTriggerSummary = async (id: string) => {
    setSummarizingId(id);
    try {
      await onSummarizeDocument(id);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDownloadText = (docItem: HealthDocument) => {
    const blob = new Blob(
      [
        `ELDERCARE CONNECT — HEALTH DOCUMENT RECORD\nTitle: ${docItem.title}\nCategory: ${docItem.category}\nDoctor: ${docItem.doctorName}\nUploaded: ${docItem.uploadedAt}\n\nClinical Notes:\n${docItem.rawContentPreview}\n\nCareAI Informational Summary:\n${docItem.aiSummary || 'Not generated yet.'}`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Health Document Vault & AI Summarizer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Securely store prescriptions, lab reports, scans, and insurance records with one-tap
            informational CareAI summaries.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal((p) => !p)}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Upload Form */}
      {showUploadModal && (
        <form
          onSubmit={handleUploadSubmit}
          className="bg-white dark:bg-slate-900 border border-teal-600 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Upload New Health Document to Secure Vault
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Lipid Profile Lab Report — Nov 2026"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as HealthDocument['category'])}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Medical Report">Medical Report</option>
                <option value="Scan Report">Scan Report</option>
                <option value="Insurance Document">Insurance Document</option>
                <option value="Doctor Note">Doctor Note</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Doctor / Clinic Name
              </label>
              <input
                type="text"
                value={newDoctor}
                onChange={(e) => setNewDoctor(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Measurements or Prescription Text (for CareAI Summary)
            </label>
            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Paste or type key report notes so CareAI can explain them in simple language..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
            >
              Save to Vault
            </button>
          </div>
        </form>
      )}

      {/* Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prescriptions, lab reports, doctors..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
          {['all', 'Prescription', 'Lab Report', 'Insurance Document', 'Doctor Note'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat === 'all' ? 'All Documents' : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDocs.map((docItem) => (
          <div
            key={docItem.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {docItem.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {docItem.category} · {docItem.doctorName} · {docItem.uploadedAt} (
                      {docItem.fileSize})
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {docItem.rawContentPreview}
              </p>

              {docItem.aiSummary && (
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 space-y-1">
                  <div className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CareAI Informational Summary</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {docItem.aiSummary}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerSummary(docItem.id)}
                  disabled={summarizingId === docItem.id}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {summarizingId === docItem.id
                      ? 'Summarizing...'
                      : docItem.aiSummary
                      ? 'Refresh AI Summary'
                      : 'Generate AI Summary'}
                  </span>
                </button>
                <button
                  onClick={() => setPreviewDoc(docItem)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadText(docItem)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  title="Download Document Summary"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteDocument(docItem.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {previewDoc.title}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="text-xs text-slate-500">
              {previewDoc.category} · {previewDoc.doctorName} · Uploaded by {previewDoc.uploadedBy}
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {previewDoc.rawContentPreview}
            </div>
            {previewDoc.aiSummary && (
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
                <strong>CareAI Summary:</strong> {previewDoc.aiSummary}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 4. CAREAI HEALTHCARE ASSISTANT VIEW
export const CareAIAssistantView: React.FC<{
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onOpenVoiceModal: () => void;
  isSending: boolean;
}> = ({ messages, onSendMessage, onOpenVoiceModal, isSending }) => {
  const [input, setInput] = useState('');

  const DEMO_PROMPTS = [
    'What do I need to do today?',
    'Who needs to know if my evening medicine is missed?',
    'What is happening tomorrow?',
    'Explain my Metformin 500 mg instructions in simple words.',
    'Help me prepare 3 questions for my Cardiology visit with Dr. Ravi Kumar.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const q = input.trim();
    setInput('');
    await onSendMessage(q);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[620px] overflow-hidden">
        <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-teal-300" />
            <div>
              <h2 className="text-base font-bold">CareAI — Intelligent Healthcare Companion</h2>
              <p className="text-xs text-teal-200">
                Powered by Gemini · Non-Diagnostic Routine & Schedule Assistant
              </p>
            </div>
          </div>
          <button
            onClick={onOpenVoiceModal}
            className="px-3.5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>🎙 Talk to CareAI</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 px-1 tabular-nums">
                {m.sender === 'user' ? 'You' : 'CareAI'} · {m.timestamp}
              </span>
            </div>
          ))}
          {isSending && (
            <div className="text-xs font-medium text-teal-700 dark:text-teal-400 animate-pulse">
              CareAI is reviewing Lakshmi Devi’s schedule and permissions...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CareAI about today’s medicines, appointments, or care circle..."
            className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
          />
          <button
            type="submit"
            disabled={isSending}
            className="px-5 py-2.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Ask CareAI</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Panel: AI Demonstration Prompts & Safety Guardrails */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            One-Tap CareAI Demonstration Prompts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any prompt below to test CareAI’s context-aware responses:
          </p>
          <div className="space-y-2">
            {DEMO_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => onSendMessage(p)}
                className="w-full text-left p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                “{p}”
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Strict Medical Safety Boundary</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            CareAI never diagnoses illnesses, prescribes medications, alters dosages, or recommends
            doubling a missed dose. For any medical concern, CareAI directs you to Dr. Ravi Kumar or
            local emergency services.
          </p>
        </div>
      </div>
    </div>
  );
};

// 5. NOTIFICATIONS CENTER & EMAIL ENGINE SETTINGS
export const NotificationsCenterView: React.FC<{
  notifications: NotificationItem[];
  prefs: NotificationPreferences;
  onMarkAllRead: () => void;
  onUpdatePrefs: (updated: NotificationPreferences) => void;
  onSendTestNotification: () => Promise<void>;
}> = ({ notifications, prefs, onMarkAllRead, onUpdatePrefs, onSendTestNotification }) => {
  const [dispatchingTest, setDispatchingTest] = useState(false);

  const handleTest = async () => {
    setDispatchingTest(true);
    try {
      await onSendTestNotification();
    } finally {
      setDispatchingTest(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Smart Priority Notification Feed */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Smart Priority Notification Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              🟢 Information · 🟡 Reminder · 🟠 Attention · 🔴 Urgent
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={dispatchingTest}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl cursor-pointer"
            >
              {dispatchingTest ? 'Dispatching...' : 'Trigger Test Email & Alert'}
            </button>
            <button
              onClick={onMarkAllRead}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Mark All Read
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border ${
                !n.read
                  ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              } space-y-2`}
            >
              <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {n.priority === 'urgent' && '🔴 Urgent'}
                  {n.priority === 'attention' && '🟠 Attention'}
                  {n.priority === 'reminder' && '🟡 Reminder'}
                  {n.priority === 'info' && '🟢 Information'} · {n.title}
                </span>
                <span className="font-mono text-slate-500">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {n.message}
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 pt-1">
                <span>Recipients: {n.recipients.join(', ')}</span>
                <span aria-hidden="true">·</span>
                <span>Channels: {n.channelsDelivered.join(' / ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Email & Multi-Channel Notification Preferences */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-700" />
            <span>Notification & Email Engine Settings</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure how medication, appointment, family, and emergency alerts are delivered.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {[
            {
              key: 'emailEnabled' as const,
              label: 'Email Notifications (SMTP / Server Dispatch)',
              desc: 'Send missed medication, refill, and appointment alerts via email.',
            },
            {
              key: 'inAppEnabled' as const,
              label: 'In-App Real-Time Feed Alerts',
              desc: 'Instant updates on Elderly, Family, and Caretaker dashboards.',
            },
            {
              key: 'browserEnabled' as const,
              label: 'Browser Push Notifications',
              desc: 'Desktop and mobile browser banners when a dose is due.',
            },
            {
              key: 'dailyCheckInReminderEnabled' as const,
              label: '9:00 AM Daily “I’m Okay” Check-In Reminder',
              desc: 'Prompt elderly user at 9 AM before alerting caretaker.',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.desc}
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs[item.key]}
                onChange={(e) => onUpdatePrefs({ ...prefs, [item.key]: e.target.checked })}
                className="mt-1 w-4 h-4 accent-teal-700"
              />
            </label>
          ))}
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notification Frequency
            </label>
            <select
              value={prefs.frequency}
              onChange={(e) =>
                onUpdatePrefs({
                  ...prefs,
                  frequency: e.target.value as NotificationPreferences['frequency'],
                })
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="Immediate">Immediate (Recommended for Medication Safety)</option>
              <option value="Batched Hourly">Batched Hourly Digest</option>
              <option value="Daily Summary">Daily Care Summary Only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. REPORTS, FAMILY OVERVIEW & AUDIT LOG VIEW
export const ReportsAndAuditView: React.FC<{
  profile: ElderProfileData;
  medications: MedicationItem[];
  appointments: AppointmentItem[];
  auditLogs: AuditLogEntry[];
}> = ({ profile, medications, appointments, auditLogs }) => {
  const takenCount = medications.filter((m) => m.status === 'taken').length;
  const missedCount = medications.filter((m) => m.status === 'missed').length;
  const refillAlertsCount = medications.filter(
    (m) => m.remainingPills / m.dailyRequirement <= m.refillThresholdDays
  ).length;
  const upcomingAptsCount = appointments.filter((a) => a.status === 'scheduled').length;

  return (
    <div className="space-y-8">
      {/* Section 29: Analytics Dashboard for Family ("Mother's Care Overview") */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Family Collaborator View
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Mother’s Care Overview ({profile.name})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Last Check-In: {profile.lastCheckInTime}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 tabular-nums">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">Medication Adherence</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">94%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">30-Day Rolling Average</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">Today’s Doses Taken</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {takenCount} / {medications.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{missedCount} missed today</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">Upcoming Appointments</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {upcomingAptsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Next: Tomorrow 11:30 AM</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">Refill Alerts</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{refillAlertsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Metformin & Atorvastatin</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">Consistent Streak</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">
              {profile.streakDays} Days
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Morning routine on schedule</div>
          </div>
        </div>
      </div>

      {/* Weekly Adherence Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          7-Day Adherence & Dose Timing Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Day of Week</th>
                <th className="py-2.5 px-3 font-semibold text-right">Adherence %</th>
                <th className="py-2.5 px-3 font-semibold text-right">Taken Doses</th>
                <th className="py-2.5 px-3 font-semibold text-right">Late Doses</th>
                <th className="py-2.5 px-3 font-semibold text-right">Missed Doses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {WEEKLY_ADHERENCE_DATA.map((row) => (
                <tr key={row.day} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {row.day}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700 dark:text-teal-400">
                    {row.percentage}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{row.taken}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-600">{row.late}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600">{row.missed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 31: Security & Privacy Audit Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700" />
              <span>Security & Privacy Access Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every profile view, medication update, and permission change is permanently logged.
            </p>
          </div>
        </div>
        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-white">
                  {log.actionType} · {log.actorName} ({log.actorRole})
                </div>
                <div className="text-slate-600 dark:text-slate-300">{log.description}</div>
              </div>
              <span className="font-mono text-slate-500 shrink-0 tabular-nums">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
