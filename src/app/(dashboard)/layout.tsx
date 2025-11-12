// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  firebaseUid: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue mx-auto mb-4"></div>
          <p className="text-mediumGray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-charcoal text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-cream">MileSync</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink href="/dashboard" active={pathname === '/dashboard'}>
                Dashboard
              </NavLink>
              <NavLink href="/dashboard/goals" active={pathname?.startsWith('/dashboard/goals')}>
                Goals
              </NavLink>
              <NavLink href="/dashboard/progress" active={pathname?.startsWith('/dashboard/progress')}>
                Progress
              </NavLink>
              <NavLink href="/dashboard/chat" active={pathname?.startsWith('/dashboard/chat')}>
                Chat
              </NavLink>

              {/* User Menu */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-mediumGray">
                <div className="text-sm">
                  <p className="font-medium">{user.fullName || 'User'}</p>
                  <p className="text-lightGray text-xs">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-cream text-charcoal rounded-lg hover:bg-opacity-90 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-mediumGray transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-charcoal border-t border-mediumGray">
            <div className="px-4 py-4 space-y-3">
              <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/dashboard/goals" onClick={() => setMobileMenuOpen(false)}>
                Goals
              </MobileNavLink>
              <MobileNavLink href="/dashboard/progress" onClick={() => setMobileMenuOpen(false)}>
                Progress
              </MobileNavLink>
              <MobileNavLink href="/dashboard/chat" onClick={() => setMobileMenuOpen(false)}>
                Chat
              </MobileNavLink>
              <div className="pt-4 border-t border-mediumGray">
                <p className="text-sm font-medium text-white mb-1">{user.fullName || 'User'}</p>
                <p className="text-xs text-lightGray mb-3">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-cream text-charcoal rounded-lg hover:bg-opacity-90 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Desktop Nav Link Component
function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg font-medium transition-all ${
        active ? 'bg-cream text-charcoal' : 'text-white hover:bg-mediumGray'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile Nav Link Component
function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-white hover:bg-mediumGray rounded-lg transition-all"
    >
      {children}
    </Link>
  );
}
