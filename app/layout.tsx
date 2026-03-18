import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PublicPoll - Citizen Voice',
  description: 'Your voice matters. Participate in daily polls and shape your community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
