# Design Notes

## Goal

CourtFlow prevents double bookings for indoor sports facilities while keeping access control clear for admins, managers, and staff.

## Roles

- `ADMIN`: manages user accounts and user activation.
- `MANAGER`: manages facilities, bookings, role changes, and history.
- `STAFF`: views facilities/history and creates or cancels bookings.

The backend enforces permissions with route-level role middleware. The frontend should hide unavailable actions, but the API remains the source of truth.


## Access Control Assumptions

- New authenticated users are created as `STAFF` unless their email is listed in `INITIAL_ADMIN_EMAILS`.
- Admins and managers cannot change their own role. This avoids accidental lockout and privilege confusion.
- Managers cannot change existing admin users.
- Managers cannot assign the `ADMIN` role to another user. Admin promotion is reserved for admins.
- Inactive users can still authenticate with Firebase, but the API rejects application access with `403 User account is inactive`. The frontend shows an account unavailable screen and asks them to sign out.
- Admins can view all audit history. Managers can view audit history performed by managers and staff. Staff can view only their own audit history.

## Authentication

Firebase Auth owns login and registration. The frontend sends the Firebase ID token to the API as a bearer token. The backend verifies that token using Firebase Admin SDK, then loads or creates a MongoDB user profile containing the application role.

This avoids storing passwords in MongoDB and keeps the app-specific authorization model separate from identity management.

## Data Model

- `User`: Firebase UID, email, display name, role, active status.
- `Facility`: code, name, location, sport type, capacity, hourly price, status.
- `Booking`: facility, bookedBy, client/session fields, start/end time, status, cancellation data.
- `AuditLog`: actor, action, entity type/id, metadata.

## Booking Conflict Rule

A booking is rejected when another active booking exists for the same facility where:

```txt
newStart < existingEnd && newEnd > existingStart
```

Adjacent bookings are allowed because a session ending at 11:00 does not overlap one starting at 11:00.

## Concurrency Protection

Booking creation uses a MongoDB transaction. Inside the transaction, the service updates the facility document by incrementing `bookingRevision`, then checks for overlapping active bookings and inserts the new booking.

That facility write makes concurrent transactions for the same facility conflict and retry, which protects the overlap rule across multiple API instances. This requires MongoDB replica set support, so Docker Compose runs MongoDB as a single-node replica set.

## DTOs and Services

DTO modules validate and normalize request inputs at the boundary. Controllers stay thin, services own business rules, and models only define persistence shape. This keeps responsibilities easy to reason about and test.

## Logging and Audit

Winston logs human-readable lines to console and files. Audit logs store business actions such as booking creation/cancellation, facility changes, and role changes.

## Trade-offs

- Firebase speeds up secure auth but adds external setup for reviewers.
- MongoDB transactions need a replica set, which makes local Docker setup slightly more involved.
- The current API is intentionally compact for the assessment; pagination and richer reporting can be added later.
