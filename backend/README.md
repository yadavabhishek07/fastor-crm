# Fastor CRM — Backend REST API

> 🚀 **Live Demo URL**: [https://frontend-omega-orpin-20.vercel.app](https://frontend-omega-orpin-20.vercel.app)

REST API for Fastor's counselor CRM system. Allows prospective clients to submit admission enquiries without authentication, and counselors to view and claim leads with concurrency safety.

Built with Node.js, Express, MongoDB (Mongoose), and JWT.

**Automated Test Suite**: 17/17 Integration Tests Passing (100% pass rate)  
**Postman Collection**: `fastor-crm.postman_collection.json` included in this folder  
**Swagger Docs**: Available locally at `/api-docs`

---

## Features & Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register a new employee/counselor (`name`, `email`, `password`, `role`).
- `POST /api/auth/login`: Authenticate with email & password, returns JWT token.
- `GET /api/auth/me`: Fetch current logged-in employee profile (Bearer JWT required).

### 2. Public Form API (`/api/enquiries`)
- `POST /api/enquiries`: Public admission enquiry capture (`name`, `email`, `phone`, `courseInterest`, `notes`). No authentication required. Stored with status `unclaimed`.

### 3. CRM Lead Management (`/api/enquiries`)
- `GET /api/enquiries/public`: Fetch unclaimed leads with pagination (`page`, `limit`), optional `course` filter, and `search`. Bearer JWT required.
- `POST /api/enquiries/:id/claim`: Atomically claim a public lead. Prevents race conditions with `findOneAndUpdate({ _id, claimedBy: null })`. Returns `409 Conflict` if already claimed. Bearer JWT required.
- `GET /api/enquiries/mine`: Fetch only leads claimed by the requesting counselor. Bearer JWT required.
- `GET /api/enquiries/:id`: Fetch single enquiry detail (accessible by the claiming counselor or admin). Bearer JWT required.

---

## Concurrency Protection

Lead claiming handles high-volume race conditions directly at the database query level:

```javascript
const enquiry = await Enquiry.findOneAndUpdate(
  { _id: id, claimedBy: null },
  {
    $set: {
      claimedBy: counselorId,
      claimedAt: new Date(),
      status: 'claimed'
    }
  },
  { new: true, runValidators: true }
);
```

If multiple counselors attempt to claim the same lead at the same time:
- Exactly **one** counselor's write will match `claimedBy: null` and succeed.
- Any subsequent or simultaneous requests will find no matching document and receive a `409 Conflict` HTTP response.

---

## Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated tests
npm test
```

### Environment Variables (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
MONGO_URI=mongodb+srv://...  # Optional: leave empty for in-memory MongoDB
```

Interactive Swagger documentation is available at:
`http://localhost:5000/api-docs`
