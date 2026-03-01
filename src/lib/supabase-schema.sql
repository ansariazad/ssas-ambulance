-- SSAS Supabase Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kapgegxhrzwhpsnemyzg/sql

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  admin_name TEXT,
  username TEXT UNIQUE,
  mobile_number TEXT,
  email TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ambulances table
CREATE TABLE IF NOT EXISTS ambulances (
  id BIGSERIAL PRIMARY KEY,
  ambulance_type INTEGER,
  reg_number TEXT UNIQUE,
  driver_name TEXT,
  driver_contact TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_number TEXT UNIQUE,
  patient_name TEXT,
  relative_name TEXT,
  relative_phone TEXT,
  hiring_date TEXT,
  hiring_time TEXT,
  ambulance_type INTEGER,
  address TEXT,
  city TEXT,
  state TEXT,
  message TEXT,
  remark TEXT,
  status TEXT,
  ambulance_reg_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Pages table (CMS)
CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  page_type TEXT UNIQUE,
  page_title TEXT,
  page_description TEXT,
  email TEXT,
  mobile_number TEXT,
  updated_at TIMESTAMPTZ
);

-- Tracking history table
CREATE TABLE IF NOT EXISTS tracking_history (
  id BIGSERIAL PRIMARY KEY,
  booking_number TEXT,
  ambulance_reg_num TEXT,
  remark TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (allow all for now)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_history ENABLE ROW LEVEL SECURITY;

-- Policies to allow all operations (for development)
CREATE POLICY "Allow all on admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ambulances" ON ambulances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pages" ON pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tracking_history" ON tracking_history FOR ALL USING (true) WITH CHECK (true);
