import { supabase } from '@/lib/supabase';
import { hashSync } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { username, email } = await request.json();
        if (!username || !email) {
            return NextResponse.json({ error: 'Username and email are required.' }, { status: 400 });
        }

        const { data: admin, error } = await supabase
            .from('admins')
            .select('id, email')
            .eq('username', username)
            .single();

        if (error || !admin) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        if (admin.email !== email) {
            return NextResponse.json({ error: 'Email does not match our records.' }, { status: 400 });
        }

        // Generate temp password
        const tempPassword = 'SSAS' + Math.floor(1000 + Math.random() * 9000);
        const hashed = hashSync(tempPassword, 10);

        await supabase.from('admins').update({ password: hashed }).eq('id', admin.id);

        // In production, send this via email. For now, return it.
        return NextResponse.json({
            message: 'Password has been reset.',
            tempPassword,
            note: 'Please change this password after logging in.'
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
