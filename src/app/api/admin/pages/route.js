import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data, error } = await supabase.from('pages').select('*');
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { page_type, page_description, email, mobile_number } = await request.json();
        const { error } = await supabase.from('pages')
            .update({ page_description, email: email || null, mobile_number: mobile_number || null, updated_at: new Date().toISOString() })
            .eq('page_type', page_type);
        if (error) throw error;
        return NextResponse.json({ message: 'Page updated.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
