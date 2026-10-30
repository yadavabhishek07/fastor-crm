# Fastor CRM

A full-stack Customer Relationship Management (CRM) system designed for educational institutions to capture prospective student leads and enable counselors to claim and manage them privately.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://frontend-omega-orpin-20.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Tests-17%20Passed-22c55e?style=for-the-badge&logo=jest)](https://github.com/yadavabhishek07/fastor-crm)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react)](https://react.dev/)

---

## Quick Links

- **Live Application**: [https://frontend-omega-orpin-20.vercel.app](https://frontend-omega-orpin-20.vercel.app)
- **Public Student Admission Form**: [https://frontend-omega-orpin-20.vercel.app/?view=public-form](https://frontend-omega-orpin-20.vercel.app/?view=public-form)
- **Postman API Collection**: [`backend/fastor-crm.postman_collection.json`](backend/fastor-crm.postman_collection.json)

---

## Core Features

- **Public Enquiry Form**: Prospective students can submit admission enquiries (`Name`, `Email`, `Phone`, `Course`, `Notes`) without authentication.
- **Counselor Authentication**: Secure employee registration and login using `bcryptjs` password hashing and JWT Bearer tokens.
- **Public Lead Pool**: Authenticated counselors can view all incoming unclaimed enquiries.
- **Atomic Lead Claiming**: Claiming an enquiry assigns it exclusively to the counselor, making it private and hidden from other counselors.
- **Concurrency & Race Condition Protection**: Built using MongoDB's atomic `findOneAndUpdate({ _id, claimedBy: null })`. If multiple counselors claim the same lead simultaneously, only one succeeds (`200 OK`) and others receive `409 Conflict`.
- **Private Pipeline**: Counselors can view and track only the leads they have claimed (`/api/enquiries/mine`).

---

## REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new employee/counselor |
| `POST` | `/api/auth/login` | Public | Login counselor and receive JWT token |
| `GET` | `/api/auth/me` | Private | Fetch logged-in counselor profile |
| `POST` | `/api/enquiries` | Public | Submit prospective client enquiry form |
| `GET` | `/api/enquiries/public` | Private | Fetch all unclaimed (public) leads |
| `POST` | `/api/enquiries/:id/claim` | Private | Atomically claim a public lead |
| `GET` | `/api/enquiries/mine` | Private | Fetch leads claimed by logged-in user |
| `GET` | `/health` | Public | API health check |

---

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, express-validator, helmet, cors
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Testing**: Jest, Supertest, MongoDB Memory Server (zero-dependency in-memory testing)
- **Deployment**: Vercel

---

## Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/yadavabhishek07/fastor-crm.git
cd fastor-crm
npm run install:all
```

### 2. Start Backend & Frontend
```bash
# Terminal 1 - Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend
npm run dev
```

> **Zero-Setup Database**: If `MONGO_URI` is left blank in `backend/.env`, an embedded in-memory MongoDB automatically starts without requiring an external database setup.

---

## Automated Testing

Run the full integration test suite (17 tests covering auth, lead lifecycle, and concurrent race conditions):

```bash
cd backend
npm test
```

```text
PASS tests/auth.test.js
PASS tests/enquiry.test.js
PASS tests/concurrency.test.js

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
```

---

## Author

**Abhishek Yadav**  
GitHub: [@yadavabhishek07](https://github.com/yadavabhishek07)
