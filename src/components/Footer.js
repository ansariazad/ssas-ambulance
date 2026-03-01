import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>Emergency Ambulance Hiring Portal</h3>
                    <p>Providing swift and secure medical transportation services 24/7. Our skilled paramedics and state-of-the-art ambulances are always ready.</p>
                </div>
                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/#about">About Us</Link></li>
                        <li><Link href="/#booking">Book Ambulance</Link></li>
                        <li><Link href="/track">Track Ambulance</Link></li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="#">Basic Life Support</a></li>
                        <li><a href="#">Advanced Life Support</a></li>
                        <li><a href="#">Patient Transport</a></li>
                        <li><a href="#">Boat Ambulance</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Emergency Ambulance Hiring Portal. All rights reserved.</p>
            </div>
        </footer>
    );
}
