import { supabase } from '@/lib/supabase';
import { generateBookingNumber } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { pname, rname, phone, hdate, htime, ambulancetype, address, city, state, message, email } = body;

        if (!pname || !rname || !phone || !hdate || !htime || !ambulancetype || !address || !city || !state) {
            return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
        }

        const bookingNumber = generateBookingNumber();

        const { error } = await supabase.from('bookings').insert({
            booking_number: bookingNumber,
            patient_name: pname,
            relative_name: rname,
            relative_phone: phone,
            relative_email: email || null,
            hiring_date: hdate,
            hiring_time: htime,
            ambulance_type: parseInt(ambulancetype),
            address, city, state,
            message: message || '',
        });

        if (error) throw error;
        return NextResponse.json({ bookingNumber, message: 'Booking created successfully.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
