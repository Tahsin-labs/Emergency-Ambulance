# ResQ — Emergency Ambulance Dispatch & Hospital Coordination

A modern, accessible emergency ambulance dispatch and hospital bed coordination system built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Express + Prisma + Neon PostgreSQL**.

---

## 🚀 Live Portals & Links

- **Live Frontend App**: [Deployable on Vercel]
- **Live Backend API**: [https://emergency-ambulance-backend-sovv.onrender.com/api/v1](https://emergency-ambulance-backend-sovv.onrender.com/api/v1)
- **Backend Repo**: [https://github.com/Tahsin-labs/Emergency-Ambulance-backend](https://github.com/Tahsin-labs/Emergency-Ambulance-backend)
- **Frontend Repo**: [https://github.com/Tahsin-labs/Emergency-Ambulance](https://github.com/Tahsin-labs/Emergency-Ambulance)

---

## 🔑 1-Click Demo Credentials

Directly selectable on [`/login`](/login):

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ambulance.com` | `Admin@123456` | Dashboard Analytics, Fleet CRUD, Hospitals, User Management |
| **Driver (ICU)** | `driver3@ambulance.com` | `Driver@123456` | Duty Toggle, ICU Assignment, State Machine Transitions |
| **Patient** | `patient1@example.com` | `Patient@123456` | Emergency Triage Booking, Live Polling Tracking, SSLCommerz Pay |

---

## 🛠️ Stack & Architecture

- **Next.js 15 App Router**: Server Components by default with client islands for interactivity.
- **BFF (Backend-For-Frontend) Pattern**: Secure `httpOnly` JWT cookies with mutex-locked silent token refresh.
- **Edge Route Protection**: Middleware checking JWT roles for `/admin/*`, `/driver/*`, and `/patient/*`.
- **TanStack Query v5 + Zustand**: Data caching, mutations, and reactive 4s polling for trip tracking.
- **React Hook Form + Zod**: Mirroring backend schemas with Bangladesh phone number validation.
- **SSLCommerz Sandbox**: Digital fare payment initiation and callbacks (`/payment/success`, `/payment/fail`, `/payment/cancel`).

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).
