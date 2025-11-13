// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from 'react-hot-toast';
import WalletConnect from '@/components/WalletConnect';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TicketProof - Secure NFT Event Tickets",
  description: "Blockchain-powered event ticketing on Hedera",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1B2E',
              color: '#fff',
              border: '1px solid rgba(108, 99, 255, 0.2)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#00C6AE',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Navbar */}
        <nav className="border-b border-[#6C63FF]/20 bg-[#0B0B14]/95 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#6C63FF] to-[#FFB400] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <span className="text-xl md:text-2xl">🎫</span>
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Ticket<span className="text-[#FFB400]">Proof</span>
                </span>
              </Link>
              
              {/* Desktop Nav Links - Hide on mobile (below lg) */}
              <div className="hidden lg:flex items-center gap-8">
                <Link 
                  href="/events" 
                  className="text-[#D1D5DB] hover:text-white transition-colors font-medium relative group"
                >
                  Events
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#FFB400] group-hover:w-full transition-all"></span>
                </Link>
                <Link 
                  href="/tickets" 
                  className="text-[#D1D5DB] hover:text-white transition-colors font-medium relative group"
                >
                  My Tickets
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#FFB400] group-hover:w-full transition-all"></span>
                </Link>
                <Link 
                  href="/profile" 
                  className="text-[#D1D5DB] hover:text-white transition-colors font-medium relative group"
                >
                  Profile
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#FFB400] group-hover:w-full transition-all"></span>
                </Link>
                
                {/* Connect Wallet Component */}
                <WalletConnect />
              </div>

              {/* Mobile - Only Wallet Button */}
              <div className="lg:hidden">
                <WalletConnect />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pb-20 lg:pb-0">
          {children}
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTop />

        {/* Mobile Bottom Navigation - Only show on mobile (below lg) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0B0B14]/95 backdrop-blur-md border-t border-[#6C63FF]/20 z-50 safe-bottom">
          <div className="flex justify-around items-center py-3 px-2">
            <Link href="/events" className="flex flex-col items-center gap-1 text-[#D1D5DB] hover:text-[#FFB400] transition-colors min-w-0 flex-1">
              <span className="text-xl">🎪</span>
              <span className="text-xs font-medium">Events</span>
            </Link>
            <Link href="/tickets" className="flex flex-col items-center gap-1 text-[#D1D5DB] hover:text-[#FFB400] transition-colors min-w-0 flex-1">
              <span className="text-xl">🎫</span>
              <span className="text-xs font-medium">Tickets</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-[#D1D5DB] hover:text-[#FFB400] transition-colors min-w-0 flex-1">
              <span className="text-xl">👤</span>
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#0B0B14] border-t border-[#6C63FF]/20 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6C63FF] to-[#FFB400] rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎫</span>
                  </div>
                  <span className="text-2xl font-bold">
                    Ticket<span className="text-[#FFB400]">Proof</span>
                  </span>
                </div>
                <p className="text-[#D1D5DB] mb-4 max-w-sm">
                  Next-generation event ticketing powered by Hedera blockchain. 
                  Secure, verifiable, and unforgettable experiences.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 rounded-lg flex items-center justify-center transition-all group"
                  >
                    <span className="group-hover:scale-110 transition-transform">🔗</span>
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 rounded-lg flex items-center justify-center transition-all group"
                  >
                    <span className="group-hover:scale-110 transition-transform">🐦</span>
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 rounded-lg flex items-center justify-center transition-all group"
                  >
                    <span className="group-hover:scale-110 transition-transform">💬</span>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-lg mb-4">Platform</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/events" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      Browse Events
                    </Link>
                  </li>
                  <li>
                    <Link href="/events/create" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      Create Event
                    </Link>
                  </li>
                  <li>
                    <Link href="/tickets" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      My Tickets
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-bold text-lg mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      API Reference
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-[#D1D5DB] hover:text-[#FFB400] transition-colors">
                      Community
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#6C63FF]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#D1D5DB] text-sm">
                © 2025 TicketProof. Built on <span className="text-[#00C6AE]">Hedera</span> for Ascension Hackathon.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-[#D1D5DB] hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-[#D1D5DB] hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-[#D1D5DB] hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}