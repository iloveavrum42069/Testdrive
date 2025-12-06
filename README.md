# Test Drive Registration System

A production-grade web application for managing automotive test drive registrations with real-time slot management, PDF waiver generation, and SMS confirmations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Hosting** | Vercel |
| **Analytics** | Vercel Speed Insights + Web Analytics |
| **SMS** | Twilio |
| **PDF** | jsPDF, html2canvas |

---

## Project Structure

```
src/
├── components/
│   ├── registration/        # User-facing registration flow
│   ├── admin/               # Admin dashboard components
│   │   ├── dashboard/       # Dashboard sub-components
│   │   ├── PageEditor.tsx   # Settings editor
│   │   └── EventManager.tsx # Event management
│   └── shared/              # Shared/reusable components
│       └── ui/              # UI primitives
├── services/
│   ├── storageService.ts    # Facade for all storage operations
│   ├── supabaseStorage.ts   # Direct Supabase DB/Storage calls
│   ├── authService.ts       # Supabase Auth wrapper
│   ├── pdfService.ts        # Waiver PDF generation
│   └── smsService.ts        # Twilio SMS via Edge Function
├── hooks/
│   └── useRegistrations.ts  # Registration data hook with real-time
├── lib/
│   └── supabase.ts          # Supabase client initialization
├── types/
│   └── index.ts             # Centralized TypeScript interfaces
├── utils/
│   ├── formatters.ts        # Date/time formatters
│   └── csvExport.ts         # CSV export utility
└── App.tsx                  # Main app with routing/state

supabase/
├── functions/
│   └── send-sms/            # Edge Function for Twilio SMS
└── migrations/              # SQL migrations (run in order)
```

---

## Key Features

1. **Timed & Non-Timed Events** - Support for scheduled test drives or walk-in style events
2. **Real-Time Slot Locking** - Prevents double-booking via `slot_holds` table
3. **Real-Time Dashboard Updates** - Registrations auto-refresh via Supabase Realtime
4. **PDF Waiver Generation** - Uses html2canvas + jsPDF
5. **SMS Confirmations** - Supabase Edge Function → Twilio
6. **Event Management** - Events isolate registrations and waivers
7. **Event Archiving** - Read-only archived events with visual indicator
8. **Rate Limiting** - Database trigger on registrations
9. **Admin Dashboard** - Protected by Supabase Auth
10. **Role-Based Access** - Regular admins vs super admins

---

## Event Types

| Type | Description |
|------|-------------|
| **Timed** | Users select a specific time slot (default) |
| **Non-Timed** | Walk-in style, no time slot selection required |

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

Includes:
- **Speed Insights** - Core Web Vitals monitoring
- **Web Analytics** - Page views, visitors, referrers

### Supabase Edge Functions
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-sms --no-verify-jwt
```

---

## Database Migrations

Run these SQL migrations in order via Supabase SQL Editor:

1. `001_initial_schema.sql` - Base tables
2. `002_registrations.sql` - Registration table
3. `003_event_settings.sql` - Per-event settings
4. `004_fix_event_settings_rls.sql` - RLS policies
5. `005_fix_ford_2025_primary.sql` - Primary event fix
6. `006_add_event_type.sql` - Timed/Non-timed events
7. `007_allow_null_timeslots.sql` - Nullable date/time for non-timed

---

## Super Admin Access

The `super_admin` role is required to access:
- **Page Editor** - Modify content, cars, and slots
- **Event Manager** - Create, archive, and switch events
- **Set Primary Event** - Choose which event shows to public

### Set Role via SQL
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "super_admin"}'
WHERE email = 'your_email@example.com';
```

---

## Real-Time Features

Enable Supabase Realtime for these tables:
- `registrations` - Auto-refresh admin dashboard
- `event_settings` - Auto-refresh public page on settings change

To enable: Supabase Dashboard → Database → Replication → Enable realtime

---

## Security

- Row Level Security (RLS) on all tables
- Security headers in `vercel.json`
- Admin routes protected by Supabase Auth

---

## License

Private / Proprietary
