# 🚨 FINAL FIX STEPS

## 1. Fix Database Permissions (RLS)
The "Failed to save registration" error means the database is blocking you.
1. Go to **Supabase Dashboard → SQL Editor**
2. Open/Paste `fix_registration_rls.sql`
3. **Run it**

## 2. Fix SMS CORS (Redeploy)
I updated the code to be even more permissive.

Run this in your terminal (use `npx.cmd` on Windows):

```bash
npx.cmd supabase functions deploy send-sms --no-verify-jwt
```

## 3. Verify
After doing both, try registering again.
