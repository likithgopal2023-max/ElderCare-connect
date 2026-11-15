# Security Specification — ElderCare Connect

## 1. Data Invariants

1. **Master Gate & Ownership Invariant**: Every `ElderProfile` document at `/elder_profiles/{profileId}` MUST have `ownerId == request.auth.uid` and can only be read or mutated by the authenticated verified owner or a verified administrator (`exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or bootstrapped admin email `likith.gopal2023@gmail.com` with `email_verified == true`).
2. **Subcollection Relational Sync**: Every `Medication` (`/elder_profiles/{profileId}/medications/{medicationId}`) and `Appointment` (`/elder_profiles/{profileId}/appointments/{appointmentId}`) MUST reference an existing parent `/elder_profiles/{profileId}` document whose `ownerId == request.auth.uid` and `incoming().profileId == profileId`.
3. **Strict Keys & Anti-Shadowing**: All `create` operations enforce `.keys().hasAll(...)` and `.keys().hasOnly(...)`. All `update` operations begin with `isValid[Entity](incoming())` and explicitly restrict modified keys via `incoming().diff(existing()).affectedKeys().hasOnly(...)`.
4. **Immortal & Temporal Integrity**: `ownerId`, `profileId`, and `createdAt` are immutable on update (`incoming().ownerId == existing().ownerId`, `incoming().createdAt == existing().createdAt`). `createdAt` on create and `updatedAt` on create/update must equal `request.time`.
5. **Path Variable Hardening & Size Bounds**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars), and every string field enforces explicit `.size()` bounds matching `firebase-blueprint.json`.

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Create (`ElderProfile`)**: `{ ownerId: "user_1", name: "Lakshmi", ... }` with `auth = null`.
2. **Unverified Email Write (`ElderProfile`)**: Authenticated user with `email_verified: false` attempting `create`.
3. **Identity Spoofing (`ElderProfile`)**: User `user_1` creating profile with `ownerId: "user_2"`.
4. **Shadow Field Injection (`ElderProfile`)**: Valid profile payload plus `{ isSuperAdmin: true }`.
5. **Resource Poisoning / Oversized String (`ElderProfile`)**: `name` with 500 characters (`> 100`).
6. **Invalid Care Code Pattern (`ElderProfile`)**: `careCode: "ABCDEF"` (violates `^[0-9]{6}$`).
7. **Timestamp Forgery (`ElderProfile`)**: Client-supplied past `createdAt` instead of `request.time`.
8. **Immutable Field Mutation (`ElderProfile`)**: Updating `ownerId` or `createdAt` during an update.
9. **Orphaned Subcollection Write (`Medication`)**: Creating a medication under a non-existent `profileId`.
10. **Invalid Enum Status (`Medication`)**: Setting `status: "hacked_status"` (not in `['taken', 'upcoming', 'missed', 'skipped', 'snoozed']`).
11. **Terminal State Bypass (`Appointment`)**: Attempting to update a `completed` or `cancelled` appointment as a non-admin.
12. **PII / Blanket List Scrape (`ElderProfile`)**: User `user_2` attempting to `get` or `list` `user_1`'s `/elder_profiles` documents.
