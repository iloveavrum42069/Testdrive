# Test Drive Registration System

A production-grade web application for managing automotive test drive registrations with real-time slot management, PDF waiver generation, and SMS confirmations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Hosting** | Vercel |
| **SMS** | Twilio |
| **PDF** | jsPDF, html2canvas |

---

## Project Structure

```
src/
├── components/
│   ├── registration/        # User-facing registration flow
│   │   ├── CarSelection.tsx
│   │   ├── TimeSlotSelection.tsx
│   │   ├── PersonalInfo.tsx
│   │   ├── WaiverSignature.tsx
│   │   └── Confirmation.tsx
│   ├── admin/               # Admin portal
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── PageEditor.tsx
│   │   ├── AddRegistrationModal.tsx
│   │   ├── ScheduleGrid.tsx
│   │   └── dashboard/       # Dashboard sub-components
│   │       ├── StatsCards.tsx
│   │       ├── RegistrationList.tsx
│   │       ├── RegistrationDetailModal.tsx
│   │       └── LicenseVerificationModal.tsx
│   ├── shared/              # Shared/reusable components
│   │   ├── ProgressIndicator.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── PrivacyPolicyModal.tsx
│   │   ├── TermsOfServiceModal.tsx
│   │   └── ui/              # UI primitives
│   └── figma/               # Figma-exported components
├── services/
│   ├── storageService.ts    # Facade for all storage operations
│   ├── supabaseStorage.ts   # Direct Supabase DB/Storage calls
│   ├── authService.ts       # Supabase Auth wrapper
│   ├── pdfService.ts        # Waiver PDF generation
│   └── smsService.ts        # Twilio SMS via Edge Function
├── lib/
│   └── supabase.ts          # Supabase client initialization
├── types/
│   └── index.ts             # Centralized TypeScript interfaces
├── hooks/
│   └── useRegistrations.ts  # Registration data hook
├── utils/
│   ├── formatters.ts        # Date/time formatters
│   └── csvExport.ts         # CSV export utility
└── App.tsx                  # Main app with routing/state

supabase/
└── functions/
    └── send-sms/            # Edge Function for Twilio SMS
```

---

## Key Features

1. **Real-Time Slot Locking** - Prevents double-booking via `slot_holds` table
2. **PDF Waiver Generation** - Uses html2canvas + jsPDF
3. **SMS Confirmations** - Supabase Edge Function → Twilio
4. **Rate Limiting** - Database trigger on registrations
5. **Admin Dashboard** - Protected by Supabase Auth

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Edge Function secrets (set via `supabase secrets set`):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

---

## Local Development

```bash
npm install
npm run dev
```

---

## Deployment

### Vercel
Push to GitHub → Vercel auto-deploys

### Supabase Edge Functions
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-sms --no-verify-jwt
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `registrations` | All test drive bookings |
| `slot_holds` | Temporary slot reservations (6 min TTL) |
| `settings` | App configuration (page settings) |

---

## Security

- Row Level Security (RLS) on all tables
- Security headers in `vercel.json`
- Admin routes protected by Supabase Auth

---

## License

Private / Proprietary
