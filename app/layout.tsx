import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'PublicPoll - Ask. Vote. Shape.',
  description: 'Your voice matters. Participate in polls and shape your community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-bg text-gray-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
