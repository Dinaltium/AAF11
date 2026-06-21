import React from 'react';
import './globals.css';
import { Nav, Footer } from '@/components/ui';
import { isMockMode } from '@/lib/api';

export const metadata = {
  title: 'AAF11 Nexus — Team AAF11',
  description:
    'We design and ship web, desktop, IoT, and AI products. AAF11 Nexus is our operations platform — monitored, managed, and showcased in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {isMockMode() ? (
          <div className="notice">
            PREVIEW — rendering from mock data (test mode). Connect the Hub for live content.
          </div>
        ) : null}
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
