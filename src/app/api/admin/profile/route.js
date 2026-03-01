import { supabase } from '@/lib/supabase';
import { hashSync, compareSync } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminId = searchParams.get('id');
        if (!adminId) return NextResponse.json({ error: 'ID required.' }, { status: 400 });

        const { data, error } = await supabase
            .from('admins')
            .select('id, admin_name, username, email, mobile_number')
            .eq('id', adminId)
            .single();
        if (error) throw error;
        return NextResponse.json(data || {});
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id, admin_name, email, mobile_number, current_password, new_password } = await request.json();

        if (new_password) {
            const { data: admin } = await supabase.from('admins').select('*').eq('id', id).single();
            if (!admin || !compareSync(current_password, admin.password)) {
                return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
            }
            const hashed = hashSync(new_password, 10);
            await supabase.from('admins').update({ password: hashed }).eq('id', id);
            return NextResponse.json({ message: 'Password updated.' });
        }

        await supabase.from('admins').update({ admin_name, email, mobile_number }).eq('id', id);
        return NextResponse.json({ message: 'Profile updated.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
