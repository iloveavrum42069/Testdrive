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
5. **Event Management** - Events isolate registrations and waivers
6. **Rate Limiting** - Database trigger on registrations
7. **Admin Dashboard** - Protected by Supabase Auth

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
| `events` | [NEW] Events definition (start/end dates, status) |
| `registrations` | All bookings (linked to `events.id`) |
| `slot_holds` | Temporary slot reservations (6 min TTL) |
| `settings` | App configuration (page settings) |

### Migrations
You must run the SQL migrations in `supabase/migrations/` to set up the `events` table and RLS policies.

---

## Super Admin Access

## Super Admin Access

The `super_admin` role is required to access:
1. **Page Editor** - Modify content, cars, and slots
2. **Event Manager** - Create, archive, and switch active events

### Method 1: Supabase Dashboard (UI)
1. Go to Authentication -> Users
2. Edit User -> Metadata
3. Add: `{"role": "super_admin"}`
4. Save User

### Method 2: SQL Editor
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "super_admin"}'
WHERE email = 'your_email@example.com';
```

---

## Security

- Row Level Security (RLS) on all tables
- Security headers in `vercel.json`
- Admin routes protected by Supabase Auth

---

## License

Private / Proprietary
