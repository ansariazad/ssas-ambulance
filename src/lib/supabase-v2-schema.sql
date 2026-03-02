-- SSAS Schema Updates for Advanced Features
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/kapgegxhrzwhpsnemyzg/sql

-- 1. Add role column to admins (super_admin, dispatcher, driver)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'super_admin';

-- 2. Add location fields to bookings for map tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hospital_lat DOUBLE PRECISION;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hospital_lng DOUBLE PRECISION;

-- 3. Add photo fields to ambulances for image uploads
ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS driver_photo TEXT;
ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS ambulance_photo TEXT;

-- 4. Add email notification fields to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS relative_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE;

-- 5. Create Supabase Storage bucket for images (run separately or via dashboard)
-- Go to Storage tab in Supabase dashboard > Create bucket "ssas-uploads" (public)

-- 6. Enable Realtime on bookings and tracking_history
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE tracking_history;

-- 7. Update existing admin to super_admin
UPDATE admins SET role = 'super_admin' WHERE id = 1;

-- 8. Add sample dispatcher and driver admins
INSERT INTO admins (admin_name, username, mobile_number, email, password, role) 
VALUES ('Azad Ansari', 'dispatcher', '7208434724', 'dispatch@ssas.com', '$2b$10$Y7.55g4eIq0mw54.hxYCA.CWND6F7ouT17./rd3hvgr18dRjOnW3y', 'dispatcher')
ON CONFLICT (username) DO NOTHING;

INSERT INTO admins (admin_name, username, mobile_number, email, password, role) 
VALUES ('Driver Joginder', 'driver1', '4567891236', 'driver1@ssas.com', '$2b$10$Y7.55g4eIq0mw54.hxYCA.CWND6F7ouT17./rd3hvgr18dRjOnW3y', 'driver')
ON CONFLICT (username) DO NOTHING;
