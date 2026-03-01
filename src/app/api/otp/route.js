import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// In-memory OTP store (resets on server restart - for production use Redis/DB)
const otpStore = new Map();
const rateLimitStore = new Map();

// Rate limiting: max 5 OTP requests per phone per 10 minutes
function checkRateLimit(phone) {
    const key = phone.replace(/\D/g, '');
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (entry) {
        // Clean old entries
        const recent = entry.filter(t => now - t < 10 * 60 * 1000);
        if (recent.length >= 5) return false;
        recent.push(now);
        rateLimitStore.set(key, recent);
    } else {
        rateLimitStore.set(key, [now]);
    }
    return true;
}

// Generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
}

// POST /api/otp - Request OTP
export async function POST(request) {
    try {
        const { phone, action } = await request.json();

        if (!phone || phone.replace(/\D/g, '').length < 10) {
            return NextResponse.json({ error: 'Valid phone number required.' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');

        // Verify OTP
        if (action === 'verify') {
            const { otp } = await request.json().catch(() => ({}));
            // Re-parse because we already consumed the body
            return NextResponse.json({ error: 'Use GET for verification.' }, { status: 400 });
        }

        // Rate limit
        if (!checkRateLimit(cleanPhone)) {
            return NextResponse.json({ error: 'Too many requests. Try again in 10 minutes.' }, { status: 429 });
        }

        const otp = generateOTP();
        otpStore.set(cleanPhone, { otp, expires: Date.now() + 5 * 60 * 1000, verified: false });

        // Clean expired OTPs periodically
        for (const [key, val] of otpStore.entries()) {
            if (Date.now() > val.expires) otpStore.delete(key);
        }

        return NextResponse.json({
            message: 'OTP sent successfully.',
            otp, // In production, remove this — send via SMS/WhatsApp instead
            expiresIn: 300,
        });
    } catch (error) {
        console.error('OTP error:', error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

// PUT /api/otp - Verify OTP
export async function PUT(request) {
    try {
        const { phone, otp } = await request.json();
        const cleanPhone = phone.replace(/\D/g, '');

        const stored = otpStore.get(cleanPhone);
        if (!stored) {
            return NextResponse.json({ error: 'No OTP found. Request a new one.' }, { status: 400 });
        }
        if (Date.now() > stored.expires) {
            otpStore.delete(cleanPhone);
            return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 });
        }
        if (stored.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
        }

        // Mark as verified
        stored.verified = true;
        otpStore.set(cleanPhone, stored);

        return NextResponse.json({ message: 'Phone verified successfully!', verified: true });
    } catch (error) {
        console.error('OTP verify error:', error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
