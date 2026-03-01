import { NextResponse } from 'next/server';

// SMS Notification API
// Integrates with Twilio (free trial: https://www.twilio.com/try-twilio)
// Set these env vars in .env.local:
//   TWILIO_ACCOUNT_SID=your_account_sid
//   TWILIO_AUTH_TOKEN=your_auth_token
//   TWILIO_PHONE_NUMBER=+1234567890

export async function POST(request) {
    try {
        const { to, message, booking_number, status } = await request.json();

        if (!to || !message) {
            return NextResponse.json({ error: 'Phone number and message are required.' }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return NextResponse.json({
                message: 'SMS not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env.local',
                sent: false,
            });
        }

        // Send SMS via Twilio REST API
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const smsBody = `🚑 SSAS Update\nBooking: #${booking_number}\nStatus: ${status}\n${message}`;

        const res = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            },
            body: new URLSearchParams({ To: to, From: fromNumber, Body: smsBody }),
        });

        if (res.ok) {
            return NextResponse.json({ message: 'SMS sent.', sent: true });
        } else {
            const err = await res.json();
            return NextResponse.json({ error: err.message || 'SMS failed.', sent: false }, { status: 400 });
        }
    } catch (error) {
        console.error('SMS error:', error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
