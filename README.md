# EV Network — Internal Operations Platform (Proposal 1)

Frontend-only client prototype. **Phase 1 (Modules 1–8)** only.

## Run

```bash
cd EVInternalApp-Prototype
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Login

`/` splash → `/login` combined screen with **Admin | Employee** switch (Admin default). No separate role-selection page.

- **Admin** → OTP → `/admin`
- **Employee** → OTP + PIN + device bind → `/app`

Simulated auth: any 10-digit mobile; OTP any 6 digits except `000000`; employee PIN any 4 digits except `0000`.

## Demo

- Presenter panel: `Ctrl+Shift+D` or `?presenter=1`
- Golden thread: Employee submits request → Admin Approvals → Approve with PIN → Employee notification + audit event
- No Phase 2 UI (inventory, payouts, reports, documents) — gated by `FEATURES.phase2 = false`

## Stack

Next.js · TypeScript · Tailwind v4 · Zustand · lucide-react · motion

No backend, APIs, GPS, camera, banking, Tally, or SMS/WhatsApp integrations.
