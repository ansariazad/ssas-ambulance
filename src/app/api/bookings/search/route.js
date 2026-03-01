import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';

        if (!q.trim()) return NextResponse.json([]);

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .or(`booking_number.ilike.%${q}%,patient_name.ilike.%${q}%,relative_phone.ilike.%${q}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
