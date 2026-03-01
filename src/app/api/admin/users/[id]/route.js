import { supabase } from '@/lib/supabase';
import { hashSync } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { admin_name, email, mobile_number, password, role } = await request.json();

        const updates = { admin_name, email, mobile_number, role };
        if (password) updates.password = hashSync(password, 10);

        const { error } = await supabase.from('admins').update(updates).eq('id', id);
        if (error) throw error;
        return NextResponse.json({ message: 'User updated.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const { error } = await supabase.from('admins').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ message: 'User deleted.' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
