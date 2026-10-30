# Fastor CRM — Full Stack Application

> 🚀 **Live Deployment URL**: [https://frontend-omega-orpin-20.vercel.app](https://frontend-omega-orpin-20.vercel.app)  
> 📝 **Public Client Enquiry Form**: [https://frontend-omega-orpin-20.vercel.app/?view=public-form](https://frontend-omega-orpin-20.vercel.app/?view=public-form)  
> 📦 **GitHub Repository**: [https://github.com/yadavabhishek07/fastor-crm](https://github.com/yadavabhishek07/fastor-crm)

A full-stack CRM built with Node.js, Express, MongoDB, and React for managing educational enquiries and counselor lead claiming.

Developed by **Abhishek Yadav**.

[![Live App](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://frontend-omega-orpin-20.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-emerald?style=for-the-badge&logo=jest)](https://github.com/yadavabhishek07/fastor-crm)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/yadavabhishek07/fastor-crm)

---

## 🌐 Live Application Links

- **Live Web App**: [https://frontend-omega-orpin-20.vercel.app](https://frontend-omega-orpin-20.vercel.app)
- **Public Client Enquiry Form**: [https://frontend-omega-orpin-20.vercel.app/?view=public-form](https://frontend-omega-orpin-20.vercel.app/?view=public-form)
- **GitHub Repository**: [https://github.com/yadavabhishek07/fastor-crm](https://github.com/yadavabhishek07/fastor-crm)
- **Postman API Collection**: [backend/fastor-crm.postman_collection.json](backend/fastor-crm.postman_collection.json)

---

## Architecture & Flow

1. **Counselor Authentication**: Employees sign up and log in using their email. Passwords are encrypted with bcrypt, and sessions use JWT Bearer tokens.
2. **Public Enquiry Form**: A client-facing admission form (`POST /api/enquiries`) accessible without authentication. Leads are saved as `unclaimed`.
3. **Public Leads Feed**: Logged-in counselors can view all unclaimed enquiries.
4. **Atomic Lead Claiming**: Counselors can claim any public lead. Once claimed, the enquiry transitions to `claimed` status, assigns `claimedBy`, and becomes private to that counselor.
5. **Concurrency Safety**: Lead claiming uses MongoDB's atomic `findOneAndUpdate` filter `{ _id, claimedBy: null }`. If two counselors click "Claim" at the exact same millisecond, only one claim succeeds with `200 OK`, and the other receives `409 Conflict`.
6. **My Leads Feed**: Counselors have a private view of all leads they have claimed (`GET /api/enquiries/mine`).

---

## Core Acceptance Criteria

| Feature | Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Employee Register** | `/api/auth/register` | `POST` | None | Create counselor account |
| **Employee Login** | `/api/auth/login` | `POST` | None | Verify credentials & issue JWT |
| **Current User** | `/api/auth/me` | `GET` | Bearer JWT | Fetch logged-in counselor profile |
| **Public Lead Submission** | `/api/enquiries` | `POST` | None | Submit prospective student enquiry |
| **Fetch Unclaimed Leads** | `/api/enquiries/public` | `GET` | Bearer JWT | View all open public leads |
| **Claim Lead** | `/api/enquiries/:id/claim` | `POST` | Bearer JWT | Atomically claim lead |
| **Fetch My Claimed Leads** | `/api/enquiries/mine` | `GET` | Bearer JWT | View leads claimed by logged-in counselor |
| **Swagger Documentation** | `/api-docs` | `GET` | None | Interactive OpenAPI 3.0 explorer |
| **Health Check** | `/health` | `GET` | None | Service status |

---

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `helmet`, `cors`.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons.
- **Testing**: Jest, Supertest, `mongodb-memory-server`.
- **API Docs**: Swagger UI (`swagger-ui-express`).

---

## Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Install Dependencies
```bash
# Install backend and frontend dependencies
npm run install:all
```

### 2. Run Backend
```bash
cd backend
npm run dev
```
> **Note**: If `MONGO_URI` is left blank in `backend/.env`, an embedded in-memory MongoDB automatically starts. You can run the entire app locally without needing a local MongoDB or external database installed.
>
> If you have a MongoDB Atlas connection string, you can set it in `backend/.env`:
> ```env
> MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fastor_crm
> ```

- Backend URL: [http://localhost:5000](http://localhost:5000)
- Swagger API Docs: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

### 3. Run Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Tests

Run the test suite from the backend directory:

```bash
cd backend
npm test
```

### What is tested:
1. `tests/auth.test.js`: Employee registration, password hashing, token generation, duplicate email rejection, invalid login credentials, and JWT route guards.
2. `tests/enquiry.test.js`: Public form submissions (no auth), fetching unclaimed public leads, claiming leads, preventing double claims, and private lead isolation between different counselors.
3. `tests/concurrency.test.js`: Simulates 5 counselors attempting to claim the exact same lead simultaneously using `Promise.all`. Verifies that exactly 1 succeeds and 4 receive `409 Conflict`.

---

## Deployment Guide

### Option 1: Unified Single-Service Deployment (Render / Railway)
The backend is configured to serve the built frontend assets from `frontend/dist` in production.

1. Build command:
   ```bash
   npm run install:all && npm run build
   ```
2. Start command:
   ```bash
   npm start
   ```
3. Environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or host assigned)
   - `JWT_SECRET`: your secret string
   - `MONGO_URI`: your MongoDB Atlas connection string

A pre-configured `render.yaml` is included in the project root.

### Option 2: Split Deployment (Vercel Frontend + Render Backend)
- **Frontend on Vercel**: Import the `frontend` directory. Set `VITE_API_URL` to your deployed backend URL. A `frontend/vercel.json` rewrite configuration is provided.
- **Backend on Render/Railway**: Deploy the `backend` directory.

---

## Postman Collection

Import `backend/fastor-crm.postman_collection.json` into Postman. Requests have pre-configured test scripts that automatically save your JWT token to collection variables after login or register.
# fastor-crm
