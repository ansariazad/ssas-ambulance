import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Email notification API
// Currently uses a webhook-compatible approach
// To integrate with a real email service, set EMAIL_SERVICE_URL in .env.local
// Supported: Resend, SendGrid, Mailgun (all have free tiers)
export async function POST(request) {
    try {
        const { booking_number, status, remark, recipient_email } = await request.json();

        if (!booking_number || !status) {
            return NextResponse.json({ error: 'Booking number and status required.' }, { status: 400 });
        }

        // Get booking details
        const { data: booking } = await supabase
            .from('bookings')
            .select('*')
            .eq('booking_number', booking_number)
            .single();

        if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

        const emailTo = recipient_email || booking.relative_email;

        // If EMAIL_SERVICE_URL is configured, send email
        const emailServiceUrl = process.env.EMAIL_SERVICE_URL;
        if (emailServiceUrl && emailTo) {
            try {
                await fetch(emailServiceUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.EMAIL_API_KEY || ''}`,
                    },
                    body: JSON.stringify({
                        from: 'SSAS Notifications <noreply@ssas.com>',
                        to: emailTo,
                        subject: `SSAS: Ambulance Status Update - ${status}`,
                        html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#f1f5f9;padding:2rem;border-radius:12px;">
                <h1 style="color:#06b6d4;margin-bottom:0.5rem;">🚑 SSAS</h1>
                <h2>Ambulance Status Update</h2>
                <div style="background:rgba(255,255,255,0.05);padding:1.5rem;border-radius:8px;margin:1rem 0;">
                  <p><strong>Booking #:</strong> ${booking_number}</p>
                  <p><strong>Patient:</strong> ${booking.patient_name}</p>
                  <p><strong>New Status:</strong> <span style="color:#06b6d4;font-weight:bold;">${status}</span></p>
                  <p><strong>Remark:</strong> ${remark || 'N/A'}</p>
                  ${booking.ambulance_reg_no ? `<p><strong>Ambulance:</strong> ${booking.ambulance_reg_no}</p>` : ''}
                </div>
                <p style="color:#94a3b8;font-size:0.85rem;">Track your ambulance at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track" style="color:#06b6d4;">SSAS Tracking</a></p>
              </div>
            `,
                    }),
                });

                // Mark as notified
                await supabase.from('bookings')
                    .update({ is_notified: true })
                    .eq('booking_number', booking_number);

                return NextResponse.json({ message: 'Email sent.', sent: true });
            } catch (emailError) {
                console.error('Email error:', emailError);
                return NextResponse.json({ message: 'Email service error, notification logged.', sent: false });
            }
        }

        // No email service configured - just log the notification
        return NextResponse.json({
            message: 'Notification logged. Configure EMAIL_SERVICE_URL in .env.local to send emails.',
            sent: false,
            notification: { to: emailTo, status, remark }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
