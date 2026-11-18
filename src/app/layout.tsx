import type { Metadata } from 'next';
import './tailadmin.css';
import './mockup.css';

export const metadata: Metadata = {
  title: 'Fugo Brief Intake',
  description: 'Form brief publik dan dashboard triase untuk Fugo Creative.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">{children}</body>
    </html>
  );
}
