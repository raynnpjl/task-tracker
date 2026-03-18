'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { AuthProvider } from '@/contexts/auth-context';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Layers className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg text-foreground">TaskFlow</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>Built with focus. Designed for productivity.</p>
      </footer>
    </div>
    </AuthProvider>
  );
}
