# Fastor CRM — Backend REST API (Node.js Developer Assignment)

A robust, production-grade Customer Relationship Management (CRM) backend REST API built for Fastor's counselor & enquiry workflow.

---

## 🎯 System Business Logic

1. **Employee / Counselor Accounts**: Each employee/counselor is associated with their unique company email. Authentication is secured using JSON Web Tokens (JWT) and `bcryptjs`.
2. **Public Enquiry Form**: A publicly accessible endpoint allows prospective students/clients to submit enquiry details (`name`, `email`, `phone`, `courseInterest`, `notes`) without any authentication.
3. **Public Lead Pool**: Inside the CRM, counselors can view all incoming unclaimed enquiries (public leads).
4. **Atomic Lead Claiming**: Counselors can "Claim" an unclaimed public lead. Claiming immediately assigns the lead to that counselor, transforming it into a private lead invisible to any other employee.
5. **Concurrency Protection**: High-volume race condition prevention using atomic database updates (`findOneAndUpdate` with `claimedBy: null`). If multiple counselors attempt to claim the exact same lead simultaneously, exactly one succeeds, while all other requests receive an explicit `409 Conflict`.

---

## 📋 Acceptance Criteria Checklist

| Acceptance Criterion | Endpoint | Method | Authentication | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Employee Registration** | `/api/auth/register` | `POST` | Public | ✅ Implemented |
| **Employee Login** | `/api/auth/login` | `POST` | Public | ✅ Implemented |
| **Get Counselor Profile** | `/api/auth/me` | `GET` | Bearer JWT | ✅ Implemented |
| **Public Lead Submission** | `/api/enquiries` | `POST` | Public (No Auth) | ✅ Implemented |
| **Fetch Unclaimed Leads** | `/api/enquiries/public` | `GET` | Bearer JWT | ✅ Implemented |
| **Atomic Claim Lead** | `/api/enquiries/:id/claim` | `POST` | Bearer JWT | ✅ Implemented |
| **Fetch My Claimed Leads** | `/api/enquiries/mine` | `GET` | Bearer JWT | ✅ Implemented |
| **Interactive Swagger Docs** | `/api-docs` | `GET` | Public | ✅ Implemented |
| **Health Check** | `/health` | `GET` | Public | ✅ Implemented |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`
- **Testing**: `jest`, `supertest`, `mongodb-memory-server`
- **API Documentation**: Swagger UI (`swagger-ui-express`, OpenAPI 3.0)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
> **Zero-Setup In-Memory Mode**: If `MONGO_URI` is left blank in `.env`, the server automatically starts an embedded in-memory MongoDB server. You can run and test the entire backend immediately without needing an external MongoDB server or Atlas cluster!
>
> If you have a local MongoDB or MongoDB Atlas URI, set:
> ```env
> MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fastor_crm
> ```

### 3. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

- **Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🧪 Running Automated Tests

A comprehensive suite covering authentication, data validation, enquiry workflows, and concurrency race conditions is included:

```bash
npm test
```

### Test Coverage Highlights:
- **Unit & Integration Tests**: Checks employee registration, duplicate prevention, password encryption, token expiration, public lead creation, and claim access controls.
- **Race Condition Concurrency Test**: Fires 5 simultaneous claim requests against the same lead at the exact same millisecond using `Promise.all`. Verifies that exactly one counselor succeeds (`200 OK`) and the remaining 4 receive `409 Conflict`.

---

## 📬 Postman Collection

A ready-to-use Postman collection is included in:
`backend/fastor-crm.postman_collection.json`

Import it into Postman to test all endpoints. Login and register endpoints automatically extract and store the JWT Bearer token into collection variables.
