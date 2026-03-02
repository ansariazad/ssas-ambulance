import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'SSAS - Smart & Secure Ambulance Services',
  description: 'Book emergency ambulance services instantly. Track your ambulance in real-time. 24/7 service with trained paramedics and GPS-tracked vehicles.',
  keywords: 'ambulance, emergency, booking, track, paramedic, hospital, SSAS, Delhi, NCR',
  authors: [{ name: 'SSAS Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
        <meta name="theme-color" content="#0a0e1a" />
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
