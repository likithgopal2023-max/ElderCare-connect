/**
 * Phase 0 Security TDD Specification for ElderCare Connect Firestore Rules
 * Verifies that all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Create on ElderProfile',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: null,
    payload: { ownerId: 'user_1', name: 'Lakshmi Devi', age: 72 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write on ElderProfile',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: false },
    payload: { ownerId: 'user_1', name: 'Lakshmi Devi', age: 72 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing (ownerId mismatch)',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_2', name: 'Lakshmi Devi', age: 72 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection (ghost field isSuperAdmin)',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_1', name: 'Lakshmi Devi', isSuperAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Resource Poisoning (name > 100 chars)',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_1', name: 'A'.repeat(250), age: 72 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Invalid Care Code Pattern (non-numeric)',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_1', name: 'Lakshmi Devi', careCode: 'ABCDEF' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Timestamp Forgery (client timestamp != request.time)',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_1', name: 'Lakshmi Devi', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable Field Mutation (changing ownerId on update)',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Orphaned Subcollection Write on Medication',
    collectionPath: '/elder_profiles/nonexistent_prof/medications/med_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { ownerId: 'user_1', profileId: 'nonexistent_prof', name: 'Metformin' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Invalid Enum Status on Medication',
    collectionPath: '/elder_profiles/prof_1/medications/med_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { status: 'invalid_enum_state' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Terminal State Bypass on Completed Appointment',
    collectionPath: '/elder_profiles/prof_1/appointments/apt_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'test@example.com', email_verified: true },
    payload: { status: 'scheduled' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'PII Cross-Tenant Read on ElderProfile',
    collectionPath: '/elder_profiles/prof_1',
    operation: 'get',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
