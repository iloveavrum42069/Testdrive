# SMS Setup Instructions

## 1. Install Supabase CLI (if not installed)
```bash
npm install -g supabase
# OR use npx (no install needed)
```

## 2. Login to Supabase
```bash
npx supabase login
```

## 3. Link your project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```
(Find your project ref in Supabase Dashboard URL: `supabase.com/dashboard/project/PROJECT_REF`)

## 4. Set Twilio secrets
```bash
npx supabase secrets set TWILIO_ACCOUNT_SID=your_sid_here
npx supabase secrets set TWILIO_AUTH_TOKEN=your_token_here  
npx supabase secrets set TWILIO_PHONE_NUMBER=your_twilio_number_here
```

## 5. Deploy the Edge Function
```bash
npx supabase functions deploy send-sms --no-verify-jwt
```

## Done!
After deployment, every new registration will automatically send an SMS confirmation.

---

## Test manually
You can test the function in Supabase Dashboard:
1. Go to Edge Functions > send-sms
2. Click "Invoke" and send test JSON:
```json
{
  "phone": "+1XXXXXXXXXX",
  "firstName": "Test",
  "lastName": "User",
  "date": "December 5, 2024",
  "time": "10:00 AM",
  "carName": "Ford Mustang GT"
}
```
