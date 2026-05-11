# CourtFlow

Indoor sports facility booking system for staff, managers, and admins.

## Stack

- Backend: Express.js, MongoDB, Mongoose
- Auth: Firebase Auth, verified on the API with Firebase Admin SDK
- Logging: Winston console and file logs
- Docker: API plus MongoDB replica set


## Access Rules

- New Firebase signups become `STAFF` by default.
- Emails listed in `INITIAL_ADMIN_EMAILS` become `ADMIN` on first login.
- Admins and managers cannot change their own role.
- Managers cannot change admin users or assign the admin role.
- Inactive users receive a `403` from the API and cannot use the frontend until reactivated.
- Admins can view all history. Managers see history performed by managers and staff. Staff only see their own history.

## Backend Setup

```bash
cd courtflow-api
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:3000` by default.

Health check:

```bash
curl http://localhost:3000/api/health
```

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/courtflow?replicaSet=rs0
LOG_LEVEL=info
INITIAL_ADMIN_EMAILS=admin@example.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_KEY
-----END PRIVATE KEY-----
"
```

## Firebase Credentials

The frontend uses the Firebase web app config. The backend needs Firebase Admin SDK service account values.

1. Open Firebase Console.
2. Select the project.
3. Go to Project settings > Service accounts.
4. Generate a new private key.
5. Copy these values from the downloaded JSON:
   - `project_id` to `FIREBASE_PROJECT_ID`
   - `client_email` to `FIREBASE_CLIENT_EMAIL`
   - `private_key` to `FIREBASE_PRIVATE_KEY`

Keep the private key quoted in `.env` and preserve `
` line breaks.

## Docker

From the repo root:

```bash
docker compose up --build
```

The API is exposed on `http://localhost:3000` and MongoDB on `localhost:27017`.

MongoDB runs as a single-node replica set because booking creation uses transactions to protect against concurrent overlap writes.

## Tests

```bash
cd courtflow-api
npm test
```

The booking tests use an in-memory MongoDB replica set and cover:

- rejecting overlapping bookings
- allowing adjacent bookings
- allowing same-time bookings on different facilities
- concurrent same-slot booking attempts

## API Response Shape

Success:

```json
{
  "success": true,
  "message": "Facilities fetched",
  "data": []
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": {}
}
```

## Logs

Runtime logs are written to:

```txt
courtflow-api/logs/combined.log
courtflow-api/logs/error.log
```

