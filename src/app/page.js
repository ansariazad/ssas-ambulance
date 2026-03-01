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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Booking successful! Number: ${data.bookingNumber}. Save this for tracking.`, 'success', 8000);

        // Send WhatsApp confirmation to customer
        const phone = formData.phone.replace(/\D/g, '');
        const whatsappPhone = phone.startsWith('91') ? phone : '91' + phone;
        const trackUrl = `${window.location.origin}/track`;
        const whatsappMsg = encodeURIComponent(
          `🚑 *SSAS - Booking Confirmed!*\n\n` +
          `Hello *${formData.rname}*,\n\n` +
          `Your ambulance booking has been confirmed!\n\n` +
          `📋 *Booking Details:*\n` +
          `• Booking ID: *#${data.bookingNumber}*\n` +
          `• Patient: ${formData.pname}\n` +
          `• Date: ${formData.hdate}\n` +
          `• Time: ${formData.htime}\n` +
          `• Pickup: ${formData.address}, ${formData.city}, ${formData.state}\n\n` +
          `🔍 *Track your ambulance:*\n${trackUrl}\n\n` +
          `Use Booking ID *#${data.bookingNumber}* to track status.\n\n` +
          `For emergencies call: 📞 108\n` +
          `_SSAS - Smart & Secure Ambulance Services_`
        );
        window.open(`https://wa.me/${whatsappPhone}?text=${whatsappMsg}`, '_blank');

        setFormData({ pname: '', rname: '', phone: '', email: '', hdate: '', htime: '', ambulancetype: '', address: '', city: '', state: '', message: '' });
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

            <motion.form className="glass-card booking-form" onSubmit={handleSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Patient Name *</label>
                  <input className="input-field" name="pname" value={formData.pname} onChange={handleChange} placeholder="Enter patient name" required />
                </div>
                <div className="input-group">
                  <label>Relative Name *</label>
                  <input className="input-field" name="rname" value={formData.rname} onChange={handleChange} placeholder="Enter relative name" required />
                </div>
                <div className="input-group">
                  <label>Contact Number *</label>
                  <input className="input-field" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" required />
                </div>
                <div className="input-group">
                  <label>Email (for notifications)</label>
                  <input className="input-field" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email for status updates" />
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
                    <option value="">Select Type</option>
                    <option value="1">Basic Life Support (BLS)</option>
                    <option value="2">Advanced Life Support (ALS)</option>
                    <option value="3">Non-Emergency Transport</option>
                    <option value="4">Boat Ambulance</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Address *</label>
                  <input className="input-field" name="address" value={formData.address} onChange={handleChange} placeholder="Enter pickup address" required />
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
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.form>
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
