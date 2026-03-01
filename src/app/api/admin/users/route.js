import { supabase } from '@/lib/supabase';
import { hashSync } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Try with role column first
        let { data, error } = await supabase.from('admins').select('id, admin_name, username, email, mobile_number, role, created_at').order('created_at', { ascending: false });
        if (error) {
            // Fallback: role column might not exist yet
            const result = await supabase.from('admins').select('id, admin_name, username, email, mobile_number, created_at').order('created_at', { ascending: false });
            data = (result.data || []).map(a => ({ ...a, role: 'super_admin' }));
        }
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request) {
    try {
        const { admin_name, username, email, mobile_number, password, role } = await request.json();
        if (!admin_name || !username || !password) {
            return NextResponse.json({ error: 'Name, username, and password are required.' }, { status: 400 });
        }
        const hashedPassword = hashSync(password, 10);
        const { error } = await supabase.from('admins').insert({ admin_name, username, email, mobile_number, password: hashedPassword, role: role || 'dispatcher' });
        if (error) {
            if (error.code === '23505') return NextResponse.json({ error: 'Username already exists.' }, { status: 400 });
            throw error;
        }
        return NextResponse.json({ message: 'User created.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
