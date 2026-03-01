import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: booking, error: bErr } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (bErr || !booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

        // Get driver info if ambulance assigned
        let driverInfo = {};
        if (booking.ambulance_reg_no) {
            const { data: amb } = await supabase
                .from('ambulances')
                .select('driver_name, driver_contact')
                .eq('reg_number', booking.ambulance_reg_no)
                .single();
            if (amb) driverInfo = amb;
        }

        const { data: history } = await supabase
            .from('tracking_history')
            .select('*')
            .eq('booking_number', booking.booking_number)
            .order('created_at', { ascending: true });

        return NextResponse.json({
            booking: { ...booking, ...driverInfo },
            history: history || [],
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
