import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'SSAS - Smart & Secure Ambulance Services',
  description: 'SSAS - Book emergency ambulance services instantly. Track your ambulance in real-time with our advanced portal.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
