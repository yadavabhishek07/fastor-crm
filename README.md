# Fastor CRM — Full Stack Developer Assignment

A complete, production-ready Full Stack Customer Relationship Management (CRM) system designed and built for Fastor's counselor & enquiry workflow.

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth, Atomic Concurrency Claiming, Jest/Supertest suite, Swagger OpenAPI 3.0 docs.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, interactive counselor dashboard & public client admission enquiry form.

---

## 🏛️ System Architecture & Workflow

```
+-------------------------------------------------------------------------+
|                           Fastor CRM Ecosystem                          |
+-------------------------------------------------------------------------+

  [ Prospective Client / Student ]              [ Counselor / Employee ]
                 │                                         │
        (No Authentication)                          (JWT Bearer)
                 ▼                                         ▼
   POST /api/enquiries (Form)               GET /api/enquiries/public (Leads)
                 │                                         │
                 ▼                                         ▼
  ┌───────────────────────────────┐         ┌───────────────────────────────┐
  │       MongoDB Enquiry         │         │   POST /api/enquiries/:id     │
  │ status: "unclaimed"           │◄────────┤            /claim             │
  │ claimedBy: null               │         │   (Atomic Concurrency Lock)   │
  └───────────────────────────────┘         └───────────────────────────────┘
                                                           │
                                                           ▼
                                            ┌───────────────────────────────┐
                                            │       Private Lead State      │
                                            │ status: "claimed"             │
                                            │ claimedBy: counselor._id      │
                                            │ claimedAt: Timestamp          │
                                            └───────────────────────────────┘
                                                           │
                                                           ▼
                                            GET /api/enquiries/mine
                                            (Visible ONLY to this Counselor)
```

---

## 📋 Acceptance Criteria Mapping

| Acceptance Criterion | Implementation Details | Endpoint | Status |
| :--- | :--- | :--- | :--- |
| **API for Employee Register & Login** | Secured with `bcryptjs` password hashing and signed JWT Bearer tokens | `POST /api/auth/register`<br>`POST /api/auth/login` | ✅ Completed |
| **Public Form API (No Auth)** | Prospective client lead capture (`name`, `email`, `phone`, `courseInterest`, `notes`) | `POST /api/enquiries` | ✅ Completed |
| **API to Claim Leads** | Atomic `findOneAndUpdate({ _id, claimedBy: null })` preventing double-claiming and returning `409 Conflict` on race conditions | `POST /api/enquiries/:id/claim` | ✅ Completed |
| **API to Fetch Unclaimed Leads** | Returns only active public leads (`claimedBy: null`) with pagination & search | `GET /api/enquiries/public` | ✅ Completed |
| **API to Fetch Claimed Leads** | Returns only leads private to the logged-in counselor (`claimedBy: req.user._id`) | `GET /api/enquiries/mine` | ✅ Completed |

---

## 📁 Repository Structure

```text
fastor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # DB connector with MongoMemoryServer fallback
│   │   │   └── swagger.js        # OpenAPI 3.0 Swagger specifications
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile endpoints
│   │   │   └── enquiryController.js # Public submit, public list, claim, my leads
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT Bearer token verification
│   │   │   ├── errorHandler.js   # Global error & duplicate key handlers
│   │   │   └── validate.js       # express-validator schemas
│   │   ├── models/
│   │   │   ├── Employee.js       # Counselor schema with bcrypt hashing
│   │   │   └── Enquiry.js        # Lead schema with compound indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # Auth routing
│   │   │   └── enquiryRoutes.js  # Enquiry & claim routing
│   │   ├── app.js                # Express application configuration
│   │   └── server.js             # HTTP server entrypoint
│   ├── tests/
│   │   ├── setup.js              # In-memory MongoDB testing environment
│   │   ├── auth.test.js          # Authentication integration tests
│   │   ├── enquiry.test.js       # CRM enquiry lifecycle integration tests
│   │   └── concurrency.test.js   # High-concurrency race condition test
│   ├── fastor-crm.postman_collection.json # Exported Postman collection
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Responsive navigation & counselor status
│   │   │   ├── PublicEnquiryForm.jsx # Prospective student form (No auth)
│   │   │   ├── LoginForm.jsx         # Counselor sign-in with quick demo fill
│   │   │   ├── RegisterForm.jsx      # Counselor sign-up
│   │   │   ├── PublicLeadsView.jsx   # Public unclaimed leads grid with Claim action
│   │   │   ├── MyLeadsView.jsx       # Private claimed leads management
│   │   │   └── LeadCard.jsx          # Lead card with contact actions
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth & JWT state
│   │   ├── services/
│   │   │   └── api.js                # Clean fetch client with Bearer auth injection
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
> **Zero-Setup Mode**: If no `MONGO_URI` is provided in `.env`, the backend will automatically spin up an embedded in-memory MongoDB server. You do not need to install MongoDB locally or configure Atlas to test it!

- **Swagger API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### 2. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suite

Run the full automated test suite covering all business logic, validation, authentication, and concurrency race conditions:

```bash
cd backend
npm test
```

### Concurrency Race Condition Proof
In `backend/tests/concurrency.test.js`, 5 counselors attempt to claim the exact same lead simultaneously using `Promise.all`. The test verifies:
- Exactly 1 counselor receives `200 OK`.
- The other 4 counselors receive `409 Conflict`.
- Database integrity is maintained with zero double-claims.

---

## 📬 Postman Collection
Import `backend/fastor-crm.postman_collection.json` into Postman. It contains pre-configured requests, environment variables, and automatic JWT token extraction scripts.
