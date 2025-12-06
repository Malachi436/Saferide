'use client';

import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
