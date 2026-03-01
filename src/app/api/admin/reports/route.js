import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Status distribution
        const { data: allBookings } = await supabase.from('bookings').select('status, ambulance_type, created_at');

        const statusCounts = {};
        const typeCounts = {};
        const monthlyCounts = {};

        (allBookings || []).forEach(b => {
            const st = b.status || 'New';
            statusCounts[st] = (statusCounts[st] || 0) + 1;

            const typeNames = { 1: 'BLS', 2: 'ALS', 3: 'Non-Emergency', 4: 'Boat' };
            const tn = typeNames[b.ambulance_type] || 'Unknown';
            typeCounts[tn] = (typeCounts[tn] || 0) + 1;

            if (b.created_at) {
                const month = b.created_at.substring(0, 7); // YYYY-MM
                monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
            }
        });

        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
        const monthlyData = Object.entries(monthlyCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count }));

        return NextResponse.json({ statusData, typeData, monthlyData, total: allBookings?.length || 0 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
