import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: booking, error: bErr } = await supabase.from('bookings').select('*').eq('id', id).single();
        if (bErr || !booking) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

        // Get driver info
        let driverInfo = {};
        if (booking.ambulance_reg_no) {
            const { data: amb } = await supabase.from('ambulances').select('driver_name, driver_contact').eq('reg_number', booking.ambulance_reg_no).single();
            if (amb) driverInfo = amb;
        }

        const { data: history } = await supabase.from('tracking_history').select('*').eq('booking_number', booking.booking_number).order('created_at', { ascending: true });
        const { data: ambulances } = await supabase.from('ambulances').select('*');

        return NextResponse.json({ booking: { ...booking, ...driverInfo }, history: history || [], ambulances: ambulances || [] });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { status, remark, ambulance_reg_no } = await request.json();
        if (!status || !remark) return NextResponse.json({ error: 'Status and remark required.' }, { status: 400 });

        const { data: booking, error: bErr } = await supabase.from('bookings').select('*').eq('id', id).single();
        if (bErr || !booking) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

        await supabase.from('bookings').update({
            status, remark,
            ambulance_reg_no: ambulance_reg_no || booking.ambulance_reg_no,
            updated_at: new Date().toISOString(),
        }).eq('id', id);

        await supabase.from('tracking_history').insert({
            booking_number: booking.booking_number,
            ambulance_reg_num: ambulance_reg_no || booking.ambulance_reg_no,
            remark, status,
        });

        if (ambulance_reg_no) {
            await supabase.from('ambulances').update({ status, updated_at: new Date().toISOString() }).eq('reg_number', ambulance_reg_no);
        }

        return NextResponse.json({ message: 'Status updated.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
