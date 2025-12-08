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
| **PDF** | jsPDF |

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
2. **Real-Time Slot Locking** - Prevents double-booking via `slot_holds` table with 6-minute expiry
3. **Extend Hold Button** - Users can extend their slot reservation time (WCAG 2.2.1 compliant)
4. **Real-Time Dashboard Updates** - Registrations auto-refresh via Supabase Realtime
5. **PDF Waiver Generation** - Legally-binding digital signatures with jsPDF
6. **SMS Confirmations** - Supabase Edge Function → Twilio
7. **Event Management** - Events isolate registrations and waivers
8. **Event Archiving** - Read-only archived events with visual indicator
9. **Rate Limiting** - Database trigger prevents duplicate registrations
10. **Admin Dashboard** - Protected by Supabase Auth
11. **Role-Based Access** - Regular admins vs super admins
12. **Loading States** - Submit buttons show spinner during save operations
13. **Automatic Cleanup** - pg_cron job removes expired slot holds every 5 minutes

---

## Accessibility (AODA/WCAG 2.0 AA)

This application is designed for **AODA compliance** (Ontario, Canada) following WCAG 2.0 Level AA guidelines:

| Feature | Implementation |
|---------|----------------|
| **Keyboard Navigation** | All interactive elements are keyboard accessible |
| **Screen Reader Support** | ARIA labels, roles, and live regions throughout |
| **Form Accessibility** | Error messages linked via aria-describedby |
| **Progress Announcements** | Step indicators announce to screen readers |
| **Time Limit Compliance** | "Extend Hold" button allows users to extend time (WCAG 2.2.1) |
| **Focus Management** | Visible focus rings on all interactive elements |

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

1. `000_baseline_schema.sql` - Base tables, RLS policies, rate limiting
2. `001_initial_schema.sql` - Initial schema setup
3. `002_registrations.sql` - Registration table
4. `003_event_settings.sql` - Per-event settings
5. `004_fix_event_settings_rls.sql` - RLS policies fix
6. `005_fix_ford_2025_primary.sql` - Primary event fix
7. `006_add_event_type.sql` - Timed/Non-timed events
8. `007_allow_null_timeslots.sql` - Nullable date/time for non-timed
9. `008_schedule_slot_cleanup.sql` - pg_cron job for expired slot cleanup

---

## Scheduled Jobs (pg_cron)

The database includes a scheduled job that runs every 5 minutes:

```sql
-- Cleans up expired slot holds
SELECT cron.schedule(
  'cleanup-expired-slot-holds',
  '*/5 * * * *',
  'SELECT cleanup_expired_slot_holds();'
);
```

To verify: `SELECT * FROM cron.job;`

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
- `slot_holds` - Real-time slot availability updates
- `event_settings` - Auto-refresh public page on settings change

To enable: Supabase Dashboard → Database → Replication → Enable realtime

---

## Security

- Row Level Security (RLS) on all tables
- Security headers in `vercel.json` (CSP, X-Frame-Options, etc.)
- Admin routes protected by Supabase Auth
- Rate limiting on registration submissions
- Multi-tab session sync (logout in one tab logs out all tabs)

---

## Bundle Optimization

The project uses a minimal dependency set for optimal bundle size:

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `sonner` | Toast notifications |
| `jspdf` | PDF generation |
| `@supabase/supabase-js` | Database & Auth |
| `@tanstack/react-query` | Data fetching |
| `@vercel/analytics` | Analytics |
| `@vercel/speed-insights` | Performance |

---

## License

Private / Proprietary

