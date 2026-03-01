import Database from 'better-sqlite3';
import path from 'path';
import { hashSync } from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'ssas.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database) {
  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_name TEXT,
      username TEXT UNIQUE,
      mobile_number TEXT,
      email TEXT,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ambulances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ambulance_type INTEGER,
      reg_number TEXT,
      driver_name TEXT,
      driver_contact TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_type TEXT UNIQUE,
      page_title TEXT,
      page_description TEXT,
      email TEXT,
      mobile_number TEXT,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS tracking_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_number TEXT,
      ambulance_reg_num TEXT,
      remark TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed data if empty
  const adminCount = database.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count === 0) {
    const hashedPassword = hashSync('Test@123', 10);
    database.prepare(`
      INSERT INTO admins (admin_name, username, mobile_number, email, password)
      VALUES (?, ?, ?, ?, ?)
    `).run('Admin', 'admin', '8989898980', 'admin@gmail.com', hashedPassword);

    // Seed ambulances
    const insertAmbulance = database.prepare(`
      INSERT INTO ambulances (ambulance_type, reg_number, driver_name, driver_contact, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertAmbulance.run(1, 'DL14RT5678', 'Joginder Singh', '4567891236', 'Pickup');
    insertAmbulance.run(2, 'DL15RT5678', 'Kamal Yadav', '7894563219', 'Assigned');
    insertAmbulance.run(1, 'DL14RT5679', 'Ramesh Singh', '2567891231', 'Pickup');
    insertAmbulance.run(2, 'UP15RT5612', 'Toshib Yadav', '6894563219', null);

    // Seed bookings
    const insertBooking = database.prepare(`
      INSERT INTO bookings (booking_number, patient_name, relative_name, relative_phone, hiring_date, hiring_time, ambulance_type, address, city, state, message, remark, status, ambulance_reg_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertBooking.run('292564626', 'Kishore Das', 'Manish', '1234567899', '2024-02-28', '22:21', 2, 'O-908, GHU, Block-7', 'Ghaziabad', 'UP', 'NA', 'Patient reached Hospital', 'Reached', 'DL15RT5678');
    insertBooking.run('193862343', 'Ravi Kumar', 'Manish', '78945641235', '2024-02-29', '23:23', 1, 'O-908, GHU, Block-7', 'Ghaziabad', 'UP', 'NA', 'Patient reached to the hospital', 'Reached', 'DL15RT5678');
    insertBooking.run('901408998', 'Lavanaya Singh', 'Aruna Singhaniya', '9876543210', '2024-02-29', '15:33', 1, 'P-816 Kanvya Nagar Geetanjali Apt', 'Lucknow', 'UP', 'Arrange BLS ambulance with gynoclogist', 'Patient Pick from given address', 'Pickup', 'DL14RT5678');
    insertBooking.run('603153853', 'Amit', 'Ravi Kumar', '1425362514', '2024-03-13', '23:04', 1, 'A 123 XYZ Society', 'Ghaziabad', 'UP', 'NA', 'Patient reached at hospital', 'Reached', 'DL15RT5678');
    insertBooking.run('369344538', 'John Doe', 'Alex', '1234569874', '2024-03-15', '10:15', 3, 'Hn 18/1 Xyz Apartment Mayur Vihar', 'New Delhi', 'Delhi', 'Please be on time', 'Reached hospital', 'Reached', 'DL15RT5678');
    insertBooking.run('185258573', 'John Jobs', 'Meera Madhvan', '4561237896', '2024-03-14', '14:08', 3, 'H-908, HPT Apartment', 'Ghaziabad', 'UP', 'Need Nurse with ambulance', 'Ambulance assigned', 'Assigned', 'DL15RT5678');

    // Seed tracking history
    const insertTracking = database.prepare(`
      INSERT INTO tracking_history (booking_number, ambulance_reg_num, remark, status)
      VALUES (?, ?, ?, ?)
    `);
    insertTracking.run('292564626', 'DL15RT5678', 'Assigned', 'Assigned');
    insertTracking.run('292564626', 'DL15RT5678', 'On the way', 'On the way');
    insertTracking.run('292564626', 'DL15RT5678', 'Ambulance Pick the patient', 'Pickup');
    insertTracking.run('292564626', 'DL15RT5678', 'Patient reached Hospital', 'Reached');
    insertTracking.run('901408998', 'DL14RT5678', 'Assigned Ambulance', 'Assigned');
    insertTracking.run('901408998', 'DL14RT5678', 'On The way', 'On the way');
    insertTracking.run('901408998', 'DL14RT5678', 'Patient Pick from given address', 'Pickup');

    // Seed pages
    const insertPage = database.prepare(`
      INSERT INTO pages (page_type, page_title, page_description, email, mobile_number)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertPage.run('aboutus', 'About Us', 'We prioritize the well-being of our patients above all else. That\'s why we offer top-notch ambulance services to ensure swift and secure medical transportation whenever the need arises. Our dedicated team of skilled paramedics and drivers is equipped with state-of-the-art ambulances, ready to respond to emergencies 24/7.', null, null);
    insertPage.run('contactus', 'Contact Us', '#890 KFG Apartment, Gauri Kunj, Delhi-India.', 'test@gmail.com', '7894561236');
  }
}

export default getDb;
