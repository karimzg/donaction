# Roles & Permissions - Donaction

> **Last Updated**: 2026-03-09

## Two Role Systems

Donaction has **two distinct role systems** that must not be confused:

### 1. Platform-level roles (`users-permissions` plugin)
- Managed by Strapi's built-in users-permissions plugin
- Defines global access level to the platform
- Roles: `Authenticated`, `Public`, etc.
- The **Super Admin** is the platform operator with access to all clubs

### 2. Club-level roles (`klubr-membre.role`)
- Defined in `klubr-membre` schema as an enumeration
- Each member record is **attached to a specific klubr** via the `klubr` relation
- Hierarchy (by weight):

| Role | Weight | Scope | Description |
|------|--------|-------|-------------|
| `KlubMember` | 20 | Club | Standard member |
| `KlubMemberLeader` | 30 | Club | Club leader/director |
| `NetworkLeader` | 40 | Club | Network-level leader |
| `AdminEditor` | 50 | Club | Club admin with editing rights |
| `Admin` | 60 | **Platform** | Super admin — cross-club access, NOT bound to one club |

**Source**: `src/helpers/memberRoles.ts`

## Critical Distinction: `Admin` Role

The `Admin` role in `klubr-membre` is special:
- It is **NOT a club-level role** — it represents the platform super admin
- An `Admin` member may or may not have a `klubr-membre` record for a given club
- **Never use** `getKlubMembres(klubrDocId, ['Admin'])` to notify the super admin — unreliable
- **Always use** `sendBrevoTransacEmail({ destIsAdmin: true })` to reach the super admin

## Notification Patterns

### Notify club leaders (for a specific club)
```typescript
const leaders = await strapiInstance
    .service('api::klubr-membre.klubr-membre')
    .getKlubMembres(klubr.documentId, ['KlubMemberLeader', 'AdminEditor']);
```

### Notify platform super admin
```typescript
await sendBrevoTransacEmail({
    templateId: BREVO_TEMPLATES.SOME_TEMPLATE,
    destIsAdmin: true,  // Routes to ADMIN_EMAIL_PRIMARY + BCC
    params: { ... },
    tags: ['admin-alert', ...],
});
```

### Notify both (e.g., dispute lost)
1. `getKlubMembres()` with `['KlubMemberLeader', 'AdminEditor']` for club leaders
2. Separate `sendBrevoTransacEmail({ destIsAdmin: true })` for super admin

## Permission Helpers

File: `src/helpers/permissions.ts`

| Helper | Checks |
|--------|--------|
| `memberIsAdmin(m)` | `role === 'Admin'` |
| `memberIsAdminEditor(m)` | `role === 'AdminEditor'` |
| `memberIsLeader(m)` | `role === 'KlubMemberLeader'` |
| `memberIsAtLeastLeader(m)` | `weight >= 30` (KlubMemberLeader+) |
| `profileIsAtLeastKlubrLeader(p, uuid)` | At least leader **AND** belongs to that klubr |

## Key Service

`getKlubMembres(klubrDocumentId, roles[])` — queries `klubr-membre` filtered by:
- `klubr.documentId === klubrDocumentId` (club-scoped)
- `role $in roles` (role filter)
- Returns members with populated `users_permissions_user.email`
