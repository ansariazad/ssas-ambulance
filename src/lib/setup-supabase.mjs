// Run this script to create tables and seed data in Supabase
// Usage: node src/lib/setup-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { hashSync } from 'bcryptjs';

const supabaseUrl = 'https://kapgegxhrzwhpsnemyzg.supabase.co';
const supabaseKey = 'sb_publishable_Q7gd5lANoAC69DKYnGwjNQ_pe-DIDEF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    // Simple test - try to access a table
    const { data, error } = await supabase.from('admins').select('*').limit(1);
    if (error && error.code === '42P01') {
        console.log('⚠️  Tables do not exist yet. You need to create them in Supabase SQL Editor.');
        console.log('');
        console.log('Go to: https://supabase.com/dashboard/project/kapgegxhrzwhpsnemyzg/sql');
        console.log('And run the SQL from: src/lib/supabase-schema.sql');
        return false;
    } else if (error) {
        console.error('❌ Connection error:', error.message);
        console.error('   Check your Supabase URL and anon key in .env.local');
        return false;
    }
    console.log('✅ Connected to Supabase!');
    return true;
}

async function seedData() {
    console.log('Seeding data...');

    // Seed admin
    const hashedPassword = hashSync('Test@123', 10);
    await supabase.from('admins').upsert({
        admin_name: 'Azad Ansari', username: 'admin', mobile_number: '7208434724',
        email: 'admin@gmail.com', password: hashedPassword
    }, { onConflict: 'username' });

    // Seed ambulances
    const ambulances = [
        { ambulance_type: 1, reg_number: 'DL14RT5678', driver_name: 'Joginder Singh', driver_contact: '4567891236', status: 'Pickup' },
        { ambulance_type: 2, reg_number: 'DL15RT5678', driver_name: 'Kamal Yadav', driver_contact: '7894563219', status: 'Assigned' },
        { ambulance_type: 1, reg_number: 'DL14RT5679', driver_name: 'Ramesh Singh', driver_contact: '2567891231', status: 'Pickup' },
        { ambulance_type: 2, reg_number: 'UP15RT5612', driver_name: 'Toshib Yadav', driver_contact: '6894563219', status: null },
    ];
    await supabase.from('ambulances').upsert(ambulances, { onConflict: 'reg_number' });

    // Seed bookings
    const bookings = [
        { booking_number: '292564626', patient_name: 'Kishore Das', relative_name: 'Manish', relative_phone: '1234567899', hiring_date: '2024-02-28', hiring_time: '22:21', ambulance_type: 2, address: 'O-908, GHU, Block-7', city: 'Ghaziabad', state: 'UP', message: 'NA', remark: 'Patient reached Hospital', status: 'Reached', ambulance_reg_no: 'DL15RT5678' },
        { booking_number: '193862343', patient_name: 'Ravi Kumar', relative_name: 'Manish', relative_phone: '78945641235', hiring_date: '2024-02-29', hiring_time: '23:23', ambulance_type: 1, address: 'O-908, GHU, Block-7', city: 'Ghaziabad', state: 'UP', message: 'NA', remark: 'Patient reached to the hospital', status: 'Reached', ambulance_reg_no: 'DL15RT5678' },
        { booking_number: '901408998', patient_name: 'Lavanaya Singh', relative_name: 'Aruna Singhaniya', relative_phone: '7208434724', hiring_date: '2024-02-29', hiring_time: '15:33', ambulance_type: 1, address: 'P-816 Kanvya Nagar', city: 'Lucknow', state: 'UP', message: 'Arrange BLS ambulance', remark: 'Patient Pick from given address', status: 'Pickup', ambulance_reg_no: 'DL14RT5678' },
        { booking_number: '603153853', patient_name: 'Amit', relative_name: 'Ravi Kumar', relative_phone: '1425362514', hiring_date: '2024-03-13', hiring_time: '23:04', ambulance_type: 1, address: 'A 123 XYZ Society', city: 'Ghaziabad', state: 'UP', message: 'NA', remark: 'Patient reached at hospital', status: 'Reached', ambulance_reg_no: 'DL15RT5678' },
        { booking_number: '369344538', patient_name: 'John Doe', relative_name: 'Alex', relative_phone: '1234569874', hiring_date: '2024-03-15', hiring_time: '10:15', ambulance_type: 3, address: 'Hn 18/1 Xyz Apartment', city: 'New Delhi', state: 'Delhi', message: 'Please be on time', remark: 'Reached hospital', status: 'Reached', ambulance_reg_no: 'DL15RT5678' },
        { booking_number: '185258573', patient_name: 'John Jobs', relative_name: 'Meera Madhvan', relative_phone: '4561237896', hiring_date: '2024-03-14', hiring_time: '14:08', ambulance_type: 3, address: 'H-908, HPT Apartment', city: 'Ghaziabad', state: 'UP', message: 'Need Nurse with ambulance', remark: 'Ambulance assigned', status: 'Assigned', ambulance_reg_no: 'DL15RT5678' },
    ];
    await supabase.from('bookings').upsert(bookings, { onConflict: 'booking_number' });

    // Seed tracking history
    const history = [
        { booking_number: '292564626', ambulance_reg_num: 'DL15RT5678', remark: 'Assigned', status: 'Assigned' },
        { booking_number: '292564626', ambulance_reg_num: 'DL15RT5678', remark: 'On the way', status: 'On the way' },
        { booking_number: '292564626', ambulance_reg_num: 'DL15RT5678', remark: 'Ambulance Pick the patient', status: 'Pickup' },
        { booking_number: '292564626', ambulance_reg_num: 'DL15RT5678', remark: 'Patient reached Hospital', status: 'Reached' },
        { booking_number: '901408998', ambulance_reg_num: 'DL14RT5678', remark: 'Assigned Ambulance', status: 'Assigned' },
        { booking_number: '901408998', ambulance_reg_num: 'DL14RT5678', remark: 'On The way', status: 'On the way' },
        { booking_number: '901408998', ambulance_reg_num: 'DL14RT5678', remark: 'Patient Pick from given address', status: 'Pickup' },
    ];
    await supabase.from('tracking_history').insert(history);

    // Seed pages
    const pages = [
        { page_type: 'aboutus', page_title: 'About Us', page_description: "We prioritize the well-being of our patients above all else. That's why we offer top-notch ambulance services to ensure swift and secure medical transportation whenever the need arises. Our dedicated team of skilled paramedics and drivers is equipped with state-of-the-art ambulances, ready to respond to emergencies 24/7." },
        { page_type: 'contactus', page_title: 'Contact Us', page_description: '#890 KFG Apartment, Gauri Kunj, Delhi-India.', email: 'test@gmail.com', mobile_number: '7208434724' },
    ];
    await supabase.from('pages').upsert(pages, { onConflict: 'page_type' });

    console.log('✅ Data seeded!');
}

async function main() {
    const connected = await testConnection();
    if (connected) {
        await seedData();
    }
}

main();
