import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

        if (status === 'New') {
            query = query.or('status.is.null,status.eq.');
        } else if (status && status !== 'All') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
