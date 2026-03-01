import { supabase } from '@/lib/supabase';
import { generateBookingNumber } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Free geocoding using OpenStreetMap Nominatim
async function geocodeAddress(address, city, state) {
    try {
        const query = encodeURIComponent(`${address}, ${city}, ${state}, India`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
            headers: { 'User-Agent': 'SSAS-Ambulance/1.0' }
        });
        const data = await res.json();
        if (data && data[0]) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (e) { console.error('Geocoding error:', e); }
    return null;
}

// Find an available ambulance and driver
async function autoAssign(ambulanceType) {
    try {
        // Find available ambulance matching type
        let query = supabase.from('ambulances').select('*').eq('status', 'Available');
        if (ambulanceType) query = query.eq('type', ambulanceType);
        const { data: ambulances } = await query.limit(1);

        if (ambulances && ambulances.length > 0) {
            const ambulance = ambulances[0];
            // Mark ambulance as busy
            await supabase.from('ambulances').update({ status: 'On Trip' }).eq('id', ambulance.id);
            return {
                assigned_ambulance: ambulance.id,
                driver_name: ambulance.driver_name,
                ambulance_reg_no: ambulance.reg_number,
            };
        }
    } catch (e) { console.error('Auto-assign error:', e); }
    return null;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { pname, rname, phone, hdate, htime, ambulancetype, address, city, state, message, email } = body;

        if (!pname || !rname || !phone || !hdate || !htime || !ambulancetype || !address || !city || !state) {
            return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
        }

        const bookingNumber = generateBookingNumber();

        // Geocode the pickup address
        const coords = await geocodeAddress(address, city, state);

        // Auto-assign driver
        const assignment = await autoAssign(parseInt(ambulancetype));

        const bookingData = {
            booking_number: bookingNumber,
            patient_name: pname,
            relative_name: rname,
            relative_phone: phone,
            hiring_date: hdate,
            hiring_time: htime,
            ambulance_type: parseInt(ambulancetype),
            address, city, state,
            message: message || '',
            status: assignment ? 'Assigned' : 'New',
        };

        // Add optional fields
        if (email) bookingData.relative_email = email;
        if (coords) {
            bookingData.pickup_lat = coords.lat;
            bookingData.pickup_lng = coords.lng;
        }
        if (assignment) {
            bookingData.assigned_ambulance = assignment.assigned_ambulance;
            bookingData.driver_name = assignment.driver_name;
            bookingData.ambulance_reg_no = assignment.ambulance_reg_no;
        }

        // Insert — ignore errors from missing columns
        let { error } = await supabase.from('bookings').insert(bookingData);
        if (error) {
            // Fallback: try with only core fields
            const coreData = {
                booking_number: bookingNumber,
                patient_name: pname,
                relative_name: rname,
                relative_phone: phone,
                hiring_date: hdate,
                hiring_time: htime,
                ambulance_type: parseInt(ambulancetype),
                address, city, state,
                message: message || '',
            };
            const result = await supabase.from('bookings').insert(coreData);
            if (result.error) throw result.error;
        }

        return NextResponse.json({
            bookingNumber,
            message: 'Booking created successfully.',
            assigned: assignment ? true : false,
            driverName: assignment?.driver_name || null,
            ambulanceReg: assignment?.ambulance_reg_no || null,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
