import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { count: totalAmbulances } = await supabase.from('ambulances').select('*', { count: 'exact', head: true });
        const { count: allRequests } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        const { count: newRequests } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).or('status.is.null,status.eq.');
        const { count: assigned } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Assigned');
        const { count: onTheWay } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'On the way');
        const { count: pickup } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Pickup');
        const { count: reached } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Reached');
        const { count: rejected } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Rejected');

        return NextResponse.json({
            totalAmbulances: totalAmbulances || 0,
            allRequests: allRequests || 0,
            newRequests: newRequests || 0,
            assigned: assigned || 0,
            onTheWay: onTheWay || 0,
            pickup: pickup || 0,
            reached: reached || 0,
            rejected: rejected || 0,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
