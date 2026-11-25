# Assignment B7A7 Submission Document

- **Student ID Last Digit**: 5
- **Assigned Domain**: Emergency Ambulance Dispatch
- **Backend Repository**: https://github.com/Tahsin-labs/Emergency-Ambulance-backend
- **Frontend Repository**: https://github.com/Tahsin-labs/Emergency-Ambulance
- **Backend Live Base URL**: https://emergency-ambulance-backend-sovv.onrender.com/api/v1

---

## 1. Credentials Sheet

| Role | Email | Password | Assigned Vehicle |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@ambulance.com` | `Admin@123456` | Master Governance & Audit |
| **DRIVER** | `driver3@ambulance.com` | `Driver@123456` | ICU Unit (`DHAKA-METRO-CH-11-1003`) |
| **PATIENT** | `patient1@example.com` | `Patient@123456` | Emergency Booking & Payment |

---

## 2. Key Architecture & Features

1. **BFF Pattern & Token Rotation**:
   - Access & refresh JWTs stored in `httpOnly` SameSite=Lax cookies via `/api/auth/*`.
   - Proxy handler (`/api/proxy/[...path]`) transparently attaches cookies and handles mutex silent refresh when receiving 401.
2. **Edge Route Protection**:
   - Next.js `middleware.ts` guards `/admin/*`, `/driver/*`, `/patient/*` with role verification and redirects unauthorized attempts.
3. **Emergency Priority Engine**:
   - Auto-allocates Basic, ALS, or ICU ambulances with appropriate life support equipment.
4. **Trip State Machine**:
   - Driver executes sequential actions from departure to pickup and hospital handoff.
5. **SSLCommerz Sandbox Payment**:
   - Digital fare calculation and payment gateway redirects.
