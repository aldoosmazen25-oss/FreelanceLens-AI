# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Strict Tenant Isolation**: Every document inside `/users/{userId}` and its subcollections (`projects`, `proposals`, `financials`, `chatSessions`, `notifications`) can ONLY be read or mutated by the authenticated user where `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. **Owner Field Integrity**: Every subcollection document MUST contain `ownerId == userId` and `ownerId == request.auth.uid`. On update, `ownerId` and `id` are immutable.
3. **Path Variable Hardening**: Every document ID (`userId`, `projectId`, `proposalId`, `transactionId`, `sessionId`, `notificationId`) must pass `isValidId(id)` (`size <= 128` and regex `^[a-zA-Z0-9_\-]+$`).
4. **Volumetric & Key Bounds**: Every string field has an explicit `.size() <= maxLength` bound matching `firebase-blueprint.json`.

## 2. The "Dirty Dozen" Payloads
1. **Cross-Tenant Read**: `uid: "attacker"` reading `/users/victim/projects/p1` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: `email_verified: false` writing `/users/u1` -> `PERMISSION_DENIED`.
3. **Owner Spoofing on Create**: `uid: "u1"` creating `/users/u1/projects/p1` with `ownerId: "u2"` -> `PERMISSION_DENIED`.
4. **Owner Mutation on Update**: Updating `ownerId` on `/users/u1/projects/p1` -> `PERMISSION_DENIED`.
5. **ID Poisoning**: Creating `/users/u1/projects/invalid$id!` -> `PERMISSION_DENIED`.
6. **Oversized Title DoW**: Creating project with `title.size() > 240` -> `PERMISSION_DENIED`.
7. **Invalid Status Enum**: Creating project with `status: "hacked"` -> `PERMISSION_DENIED`.
8. **Negative Financial Amount**: Creating financial record with `amount: -500` -> `PERMISSION_DENIED`.
9. **Invalid Financial Type**: Creating financial record with `type: "crypto_transfer"` -> `PERMISSION_DENIED`.
10. **Unauthenticated List**: `auth == null` listing `/users/u1/proposals` -> `PERMISSION_DENIED`.
11. **Missing Required Keys**: Creating proposal without `fullText` -> `PERMISSION_DENIED`.
12. **Blanket Root Write**: Writing to `/system/config` -> `PERMISSION_DENIED` via global catch-all.
