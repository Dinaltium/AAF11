import React from 'react';

export const metadata = {
  title: 'AAF11 Nexus Hub',
  description: 'Backend API and admin for AAF11 Nexus.',
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
