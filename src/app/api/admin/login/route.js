import { supabase } from '@/lib/supabase';
import { compareSync } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
        }

        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !admin || !compareSync(password, admin.password)) {
            return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
        }

        const adminData = {
            id: admin.id,
            admin_name: admin.admin_name,
            username: admin.username,
            email: admin.email,
            mobile_number: admin.mobile_number,
            role: admin.role || 'super_admin',
        };

        const response = NextResponse.json(adminData);

        response.cookies.set('ssas_session', JSON.stringify({ id: admin.id, username: admin.username, role: admin.role || 'super_admin' }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
