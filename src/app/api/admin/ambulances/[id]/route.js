import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { ambulance_type, reg_number, driver_name, driver_contact } = await request.json();
        const { error } = await supabase.from('ambulances')
            .update({ ambulance_type, reg_number, driver_name, driver_contact, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ message: 'Ambulance updated.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('ambulances').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ message: 'Ambulance deleted.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
