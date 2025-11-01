// src/components/ui/Layout.tsx
import React from 'react';
import Snowfall from './Snowfall';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Snow (fixed, behind everything) */}
      <Snowfall />

      {/* Bottom corner images */}
      <div className="corner-bl"></div>
      <div className="corner-br"></div>

      {/* Page content */}
      {children}
    </div>
  );
}