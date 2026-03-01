'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Pill, Thermometer, Baby, MapPin, Mail, Phone, ChevronRight, Shield, Clock, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';
import ServiceAreaMap from '@/components/ServiceAreaMap';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let current = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(current);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, started]);

  return <span ref={ref} className="counter-number">{count}{suffix}</span>;
}

export default function HomePage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    pname: '', rname: '', phone: '', email: '', hdate: '', htime: '',
    ambulancetype: '', address: '', city: '', state: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [contact, setContact] = useState({});

  // OTP State
  const [showOTP, setShowOTP] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    fetch('/api/pages')
      .then(r => r.json())
      .then(data => {
        const about = data.find(p => p.page_type === 'aboutus');
        const cont = data.find(p => p.page_type === 'contactus');
        if (about) setAboutText(about.page_description);
        if (cont) setContact(cont);
      }).catch(() => { });
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  // Step 1: Validate form, request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const { pname, rname, phone, hdate, htime, ambulancetype, address, city, state } = formData;
    if (!pname || !rname || !phone || !hdate || !htime || !ambulancetype || !address || !city || !state) {
      toast('Please fill all required fields.', 'error'); return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      toast('Enter a valid 10-digit phone number.', 'error'); return;
    }

    setOtpSending(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpCode(data.otp);
        setShowOTP(true);
        setOtpDigits(['', '', '', '']);
        setOtpTimer(300); // 5 min
        setTimeout(() => document.getElementById('otp-0')?.focus(), 200);
      } else {
        toast(data.error || 'Failed to send OTP.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    }
    setOtpSending(false);
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    // Auto-focus next
    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Step 2: Verify OTP and complete booking
  const handleVerifyAndBook = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 4) { toast('Enter the 4-digit OTP.', 'error'); return; }

    setSubmitting(true);
    try {
      // Verify OTP
      const verifyRes = await fetch('/api/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) { toast(verifyData.error || 'OTP verification failed.', 'error'); setSubmitting(false); return; }

      // OTP verified — now create booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otpVerified: true }),
      });
      const data = await res.json();
      if (res.ok) {
        const assignMsg = data.assigned
          ? `\nDriver: ${data.driverName} | Ambulance: ${data.ambulanceReg}`
          : '';
        toast(`Booking confirmed! #${data.bookingNumber}${assignMsg}`, 'success', 10000);

        // WhatsApp confirmation
        const phone = formData.phone.replace(/\D/g, '');
        const whatsappPhone = phone.startsWith('91') ? phone : '91' + phone;
        const trackUrl = `${window.location.origin}/track`;
        const driverInfo = data.assigned
          ? `\n👤 *Driver:* ${data.driverName}\n🚑 *Ambulance:* ${data.ambulanceReg}\n📌 *Status:* Assigned & dispatched!`
          : `\n📌 *Status:* Received — assigning driver shortly`;
        const whatsappMsg = encodeURIComponent(
          `🚑 *SSAS - Booking Confirmed!*\n\n` +
          `Hello *${formData.rname}*,\n\n` +
          `Your ambulance booking has been confirmed!\n\n` +
          `📋 *Booking Details:*\n` +
          `• Booking ID: *#${data.bookingNumber}*\n` +
          `• Patient: ${formData.pname}\n` +
          `• Date: ${formData.hdate}\n` +
          `• Time: ${formData.htime}\n` +
          `• Pickup: ${formData.address}, ${formData.city}, ${formData.state}` +
          driverInfo + `\n\n` +
          `🔍 *Track your ambulance:*\n${trackUrl}\n\n` +
          `Use Booking ID *#${data.bookingNumber}* to track status.\n\n` +
          `For emergencies call: 📞 108\n` +
          `_SSAS - Smart & Secure Ambulance Services_`
        );
        window.open(`https://wa.me/${whatsappPhone}?text=${whatsappMsg}`, '_blank');

        setFormData({ pname: '', rname: '', phone: '', email: '', hdate: '', htime: '', ambulancetype: '', address: '', city: '', state: '', message: '' });
        setShowOTP(false);
        setOtpDigits(['', '', '', '']);
      } else {
        toast(data.error || 'Something went wrong.', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const features = [
    { icon: <Heart size={28} />, title: 'Life Support', desc: 'Advanced life-saving equipment onboard every unit for critical care.' },
    { icon: <Pill size={28} />, title: 'Medical Support', desc: 'Certified paramedics providing expert medical assistance during transit.' },
    { icon: <Shield size={28} />, title: 'Safe Transport', desc: 'GPS-tracked vehicles ensuring the safest route to the nearest hospital.' },
    { icon: <Zap size={28} />, title: 'Rapid Response', desc: 'Average response time under 15 minutes across all service areas.' },
    { icon: <Thermometer size={28} />, title: 'Emergency Kit', desc: 'Fully equipped emergency kits for immediate on-site medical response.' },
    { icon: <Baby size={28} />, title: 'NICU Support', desc: 'Specialized neonatal intensive care units for newborn emergencies.' },
  ];

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <motion.div className="hero-content" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="hero-badge">
            <span className="dot" />
            24/7 Emergency Service Available
          </div>
          <h1 className="hero-title">
            Swift & Secure<br />
            <span className="gradient-text">Ambulance Services</span>
          </h1>
          <p className="hero-subtitle">
            Book an emergency ambulance in seconds. Our skilled paramedics and state-of-the-art vehicles ensure the fastest, safest medical transportation.
          </p>
          <div className="hero-actions">
            <a href="#booking" className="btn btn-primary btn-lg">
              Book Ambulance <ChevronRight size={18} />
            </a>
            <a href="/track" className="btn btn-secondary btn-lg">
              Track Ambulance
            </a>
          </div>
        </motion.div>
      </section>

      <main>
        {/* FEATURES */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2>Our Services</h2>
              <p>Comprehensive emergency medical transportation solutions</p>
              <div className="line" />
            </motion.div>
            <div className="features-grid">
              {features.map((f, i) => (
                <motion.div key={i} className="glass-card feature-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } } }}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="container">
            <motion.div className="cta-banner" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2>In an Emergency? Need Help Now?</h2>
              <p>Every second counts. Book an ambulance immediately or call our helpline.</p>
              <a href="#booking" className="btn btn-lg">Hire an Ambulance</a>
            </motion.div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2>About Us</h2>
              <div className="line" />
            </motion.div>
            <motion.div className="about-content" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  {aboutText || 'We prioritize the well-being of our patients above all else. Our dedicated team of skilled paramedics and drivers is equipped with state-of-the-art ambulances, ready to respond to emergencies 24/7.'}
                </p>
                <div className="about-stats">
                  <div className="glass-card stat-card"><div className="number"><AnimatedCounter target={500} suffix="+" /></div><div className="label">Successful Rides</div></div>
                  <div className="glass-card stat-card"><div className="number">24/7</div><div className="label">Available</div></div>
                  <div className="glass-card stat-card"><div className="number"><AnimatedCounter target={50} suffix="+" /></div><div className="label">Ambulances</div></div>
                  <div className="glass-card stat-card"><div className="number"><AnimatedCounter target={100} suffix="+" /></div><div className="label">Paramedics</div></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderLeft: '3px solid var(--accent-cyan)' }}>
                  <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Our Mission</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To provide rapid, reliable, and professional emergency medical transport services that save lives.</p>
                </div>
                <div className="glass-card" style={{ padding: '2rem', borderLeft: '3px solid var(--accent-emerald)' }}>
                  <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Our Vision</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To be the most trusted ambulance service provider, ensuring no emergency goes unanswered.</p>
                </div>
                <div className="glass-card" style={{ padding: '2rem', borderLeft: '3px solid var(--accent-purple)' }}>
                  <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>Our Promise</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Response within 15 minutes, fully equipped vehicles, and trained medical professionals on every call.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* BOOKING FORM */}
        <section id="booking" className="section">
          <div className="container">
            <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2>Book an Ambulance</h2>
              <p>Fill the form below to request an ambulance. We&apos;ll respond immediately.</p>
              <div className="line" />
            </motion.div>

            <motion.form className="glass-card booking-form" onSubmit={handleRequestOTP} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Book Ambulance</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Patient Name *</label>
                  <input className="input-field" name="pname" value={formData.pname} onChange={handleChange} placeholder="Patient full name" required />
                </div>
                <div className="input-group">
                  <label>Relative Name *</label>
                  <input className="input-field" name="rname" value={formData.rname} onChange={handleChange} placeholder="Contact person name" required />
                </div>
                <div className="input-group">
                  <label>Contact Number *</label>
                  <input className="input-field" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" required />
                </div>
                <div className="input-group">
                  <label>Email (for notifications)</label>
                  <input className="input-field" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <div className="input-group">
                  <label>Hiring Date *</label>
                  <input className="input-field" name="hdate" type="date" value={formData.hdate} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Hiring Time *</label>
                  <input className="input-field" name="htime" type="time" value={formData.htime} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Ambulance Type *</label>
                  <select className="input-field" name="ambulancetype" value={formData.ambulancetype} onChange={handleChange} required>
                    <option value="">Select type</option>
                    <option value="1">Basic Life Support (BLS)</option>
                    <option value="2">Advanced Life Support (ALS)</option>
                    <option value="3">Non-Emergency Transport</option>
                    <option value="4">Neonatal</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Address *</label>
                  <input className="input-field" name="address" value={formData.address} onChange={handleChange} placeholder="Pickup address" required />
                </div>
                <div className="input-group">
                  <label>City *</label>
                  <input className="input-field" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" required />
                </div>
                <div className="input-group">
                  <label>State *</label>
                  <input className="input-field" name="state" value={formData.state} onChange={handleChange} placeholder="Enter state" required />
                </div>
                <div className="input-group form-full">
                  <label>Message (Optional)</label>
                  <textarea className="input-field" name="message" value={formData.message} onChange={handleChange} placeholder="Any special instructions..." rows={4} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={otpSending || showOTP}>
                  {otpSending ? 'Sending OTP...' : '🔐 Verify & Book'}
                </button>
              </div>
            </motion.form>

            {/* OTP Verification Modal */}
            {showOTP && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '2.5rem', maxWidth: 440, width: '90%', textAlign: 'center', background: '#111827', borderRadius: 24, border: '1px solid #1e293b' }}>
                  <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 28 }}>🔐</div>
                  <h3 style={{ marginBottom: '0.5rem', color: '#ffffff', fontSize: '1.3rem' }}>Verify Your Phone</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    OTP sent to <b style={{ color: '#06b6d4' }}>{formData.phone}</b>
                  </p>

                  {/* Show OTP clearly */}
                  <div style={{ background: '#065f46', border: '1px solid #10b981', borderRadius: 12, padding: '12px 20px', marginBottom: '1.5rem', display: 'inline-block' }}>
                    <span style={{ color: '#6ee7b7', fontSize: '0.8rem' }}>Your OTP: </span>
                    <span style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: 6 }}>{otpCode}</span>
                  </div>

                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1rem' }}>Enter this code below to confirm your booking</p>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{
                          width: 58, height: 64, textAlign: 'center', fontSize: '1.8rem', fontWeight: 800,
                          background: '#1e293b', border: '2px solid #334155',
                          borderRadius: 14, color: '#ffffff', outline: 'none',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 12px rgba(6,182,212,0.3)'; }}
                        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
                      />
                    ))}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.2rem' }}>
                    {otpTimer > 0
                      ? `Expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                      : 'OTP expired'}
                    {' · '}
                    <button
                      onClick={(e) => { setOtpDigits(['', '', '', '']); handleRequestOTP(e); }}
                      disabled={otpSending}
                      style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      {otpSending ? 'Sending...' : '🔄 Resend OTP'}
                    </button>
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #334155', background: '#1e293b', color: '#ffffff', fontSize: '0.95rem', cursor: 'pointer' }}
                      onClick={() => { setShowOTP(false); setOtpDigits(['', '', '', '']); setOtpCode(''); }}
                    >Cancel</button>
                    <button
                      style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: otpDigits.join('').length === 4 ? 'linear-gradient(135deg, #06b6d4, #10b981)' : '#334155', color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, cursor: otpDigits.join('').length === 4 ? 'pointer' : 'not-allowed' }}
                      onClick={handleVerifyAndBook}
                      disabled={submitting || otpDigits.join('').length !== 4}
                    >
                      {submitting ? 'Confirming...' : '✅ Confirm Booking'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* SERVICE AREA MAP */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2>Our Service Area</h2>
              <p>We cover the entire Delhi NCR region with rapid response times</p>
              <div className="line" />
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <ServiceAreaMap />
            </motion.div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2>Contact Us</h2>
              <p>Reach out to us anytime — we&apos;re here to help 24/7</p>
              <div className="line" />
            </motion.div>
            <div className="contact-grid">
              <motion.div className="glass-card contact-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="contact-icon"><MapPin size={24} /></div>
                <h4>Our Address</h4>
                <p>{contact.page_description || '#890 KFG Apartment, Gauri Kunj, Delhi-India.'}</p>
              </motion.div>
              <motion.div className="glass-card contact-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.1 } } }}>
                <div className="contact-icon"><Mail size={24} /></div>
                <h4>Email Us</h4>
                <p>{contact.email || 'test@gmail.com'}</p>
              </motion.div>
              <motion.div className="glass-card contact-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.2 } } }}>
                <div className="contact-icon"><Phone size={24} /></div>
                <h4>Call Us</h4>
                <p>{contact.mobile_number || '7894561236'}</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
