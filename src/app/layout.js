import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'SSAS - Smart & Secure Ambulance Services',
  description: 'Book emergency ambulance services instantly. Track your ambulance in real-time. 24/7 service with trained paramedics and GPS-tracked vehicles.',
  keywords: 'ambulance, emergency, booking, track, paramedic, hospital, SSAS, Delhi, NCR',
  authors: [{ name: 'SSAS Team' }],
  openGraph: {
    title: 'SSAS - Smart & Secure Ambulance Services',
    description: 'Book & track emergency ambulance services in real-time. Available 24/7.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
