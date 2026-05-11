# CourtFlow Design Document

## 1. Project Overview

CourtFlow is an Indoor Sports Facility Management System for a private sports company that operates multiple indoor locations, courts, and training areas. The system replaces spreadsheet-based booking management with centralized facility management, role-based access, and automated booking conflict prevention.

Key goals:

- Prevent double bookings for the same facility and time slot.
- Provide clear role-based actions for admins, managers, and staff.
- Keep the user experience simple and responsive for day-to-day operations.

## 2. Architecture Overview

CourtFlow follows a classic full stack architecture:

- **Frontend**: React + Vite SPA for staff and manager workflows.
- **Backend**: Express.js REST API with validation and role middleware.
- **Database**: MongoDB for flexible operational data and audit logs.
- **Authentication**: Firebase Authentication for secure sign-in and user identity.

The frontend communicates with the backend using REST endpoints. The backend is the single source of truth for authorization and booking rules.

## 3. Tech Stack Justification

- **React + Vite**: Fast development and build speed, modern tooling, and a clean SPA experience.
- **Express.js**: Simple, well-known REST framework with low overhead for a compact API.
- **MongoDB**: Flexible schema for facility, booking, and audit data with easy indexing and scaling.
- **Firebase Auth**: Offloads secure authentication and token management, enabling quick and reliable sign-in.

Firebase was chosen to avoid building password storage and login flows from scratch. MongoDB was chosen for quick iteration and flexible data modeling that suits evolving booking requirements.

## 4. Backend Design

The backend is organized by responsibility:

- **Routes**: Define REST endpoints and apply role middleware.
- **Controllers**: Thin request handlers that call services.
- **Services**: Business logic (booking rules, authorization checks, audit creation).
- **DTOs**: Validate and normalize incoming request data.
- **Models**: Mongoose schemas for persistence.
- **Middleware**: Auth validation, role checks, request logging, and error handling.

This structure keeps logic testable and avoids heavy controllers.

## 5. Frontend Design

The frontend is a React SPA with:

- **Pages** for bookings, facilities, users, audit logs, and auth.
- **Reusable components** (tables, forms, modals, badges) for consistent UI.
- **Hooks** to centralize API calls, error handling, and role access.
- **Protected routes** that hide restricted screens based on role.

The UI is intentionally simple and responsive to keep daily operations efficient.

## 6. Database Design

Core collections:

- **User**: Firebase UID, email, display name, role, active status.
- **Facility**: Code, name, location, sport type, capacity, rate, status.
- **Booking**: Facility, bookedBy, client/session fields, start/end, status, cancellation metadata.
- **AuditLog**: Actor, action, entity type/id, metadata.

Indexes are defined for facility availability and booking overlap checks.

## 7. Authentication & Authorization

- **Authentication**: Firebase Auth handles login and identity tokens.
- **Authorization**: API validates tokens via Firebase Admin and applies role middleware.
- **Roles**: Admin, Manager, and Staff with explicit route access.

Role middleware enforces permissions server-side. The frontend hides actions a user cannot perform, but the API is always authoritative.

## 8. Booking Conflict Prevention Logic

A booking is rejected when another active booking exists for the same facility where:

```
newStart < existingEnd && newEnd > existingStart
```

Adjacent bookings are allowed, so a booking ending at 11:00 does not block one starting at 11:00.

To reduce race conditions, booking creation uses a MongoDB transaction when supported. The service updates a facility revision and checks for overlaps before inserting the booking. A fallback exists for environments without replica set support.

## 9. API Design Approach

- REST endpoints grouped by domain: `/users`, `/facilities`, `/bookings`, `/audit-logs`.
- Consistent response shape with success flags and messages.
- DTOs validate inputs at the boundary before services run.
- Role middleware applied at the route layer.

## 10. Assumptions Made

- Staff can manage only their own bookings unless granted manager role.
- Managers can manage facilities and bookings across locations.
- Admins manage users and role changes.
- Firebase is the system of record for authentication.
- Booking times are in ISO format and use the system timezone.

## 11. Trade-offs & Limitations

- Firebase speeds up auth but requires external setup for reviewers.
- MongoDB transactions require a replica set; local Docker setup is more involved.
- The API is compact for assessment scope; reporting and analytics are minimal.
- The frontend uses a straightforward UI rather than a heavy design system.

## 12. Scalability Considerations

- MongoDB indexes support large booking histories and availability searches.
- Stateless API containers can scale horizontally behind a load balancer.
- The role middleware and service separation support future feature growth.
- Audit logs can be moved to a separate store as volume grows.

## 13. Future Improvements

- Pagination and advanced search filters on all list pages.
- Automated email notifications for booking confirmations/cancellations.
- Calendar view for booking management.
- Admin dashboards with reporting and usage analytics.
- CI/CD with production-grade monitoring and log aggregation.

## 14. Setup Instructions

1. Configure Firebase project and add web app credentials.
2. Create a MongoDB instance (local or Atlas).
3. Set environment variables for API and frontend.
4. Run backend and frontend in development, or build and run via Docker Compose.

For production, use a reverse proxy (Nginx) and a managed MongoDB instance (Atlas).

## 15. Conclusion

CourtFlow delivers a practical and secure scheduling platform for indoor sports facilities. The system improves on spreadsheet workflows by centralizing facilities, enforcing roles, and preventing booking conflicts. The architecture is intentionally simple while remaining extensible for future scale and features.

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
