import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!

serve(async (req) => {
    // Handle CORS preflight - return 200 immediately
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            status: 200
        })
    }

    try {
        const { phone, firstName, lastName, date, time, carName, customMessage } = await req.json()

        // Format phone number (remove non-digits, ensure +1 prefix for North America)
        let formattedPhone = phone.replace(/\D/g, '')
        if (formattedPhone.length === 10) {
            formattedPhone = '+1' + formattedPhone
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone
        }

        // Use custom message if provided (completion SMS), otherwise compose confirmation message
        const message = customMessage || `Confirmed: Test drive for ${carName} on ${date} at ${time}. Please bring your license.`

        // Send via Twilio API
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

        const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            },
            body: new URLSearchParams({
                To: formattedPhone,
                From: TWILIO_PHONE_NUMBER,
                Body: message,
            }),
        })

        const result = await response.json()

        if (!response.ok) {
            console.error('Twilio error:', result)
            throw new Error(result.message || 'Failed to send SMS')
        }

        return new Response(
            JSON.stringify({ success: true, sid: result.sid }),
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                    'Content-Type': 'application/json'
                }
            }
        )
    } catch (error) {
        console.error('Error sending SMS:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                    'Content-Type': 'application/json'
                }
            }
        )
    }
})
