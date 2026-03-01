import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data, error } = await supabase.from('ambulances').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { ambulance_type, reg_number, driver_name, driver_contact } = await request.json();
        if (!ambulance_type || !reg_number || !driver_name || !driver_contact) {
            return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
        }
        const { error } = await supabase.from('ambulances').insert({ ambulance_type, reg_number, driver_name, driver_contact });
        if (error) throw error;
        return NextResponse.json({ message: 'Ambulance added.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
