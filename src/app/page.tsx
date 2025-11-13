// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState({
    eventsCreated: 0,
    ticketsSold: 0,
    activeUsers: 0,
    volumeHBAR: 0
  });
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Check wallet connection
  useEffect(() => {
    const walletAddress = localStorage.getItem('hedera_account_id');
    setIsWalletConnected(!!walletAddress);
  }, []);

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();

        if (data.success) {
          const events = data.events || [];
          const totalTicketsSold = events.reduce((sum: number, event: any) => sum + (event.ticketsSold || 0), 0);
          const totalVolume = events.reduce((sum: number, event: any) => sum + ((event.ticketsSold || 0) * (event.price || 0)), 0);

          setStats({
            eventsCreated: events.length,
            ticketsSold: totalTicketsSold,
            activeUsers: Math.min(totalTicketsSold, events.length * 10), // Estimate
            volumeHBAR: totalVolume
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = () => {
    // Scroll to navbar to show connect wallet button
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Trigger the wallet connect button in navbar
    const walletButton = document.querySelector('button[class*="bg-gradient"]') as HTMLElement;
    if (walletButton) {
      walletButton.click();
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B14]">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/20 via-[#0B0B14] to-[#00C6AE]/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzZDNjNGRiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-14">
            {/* Badge */}
            <div className="inline-block mb-5 animate-fade-in">
              <span className="bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                🚀 Powered by Hedera Blockchain
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#FFB400] to-[#00C6AE] bg-clip-text text-transparent">
                Experience Events
              </span>
              <br />
              <span className="text-white">Like Never Before</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#D1D5DB] mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-1">
              Secure, verifiable NFT tickets on Hedera.
              <span className="text-[#FFB400]"> No fakes. No fraud.</span>
              <br />Just authentic, unforgettable experiences.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
              <Link
                href="/events"
                className="group relative bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-8 py-4 rounded-xl font-semibold text-base hover:shadow-[0_0_40px_rgba(108,99,255,0.6)] transition-all transform hover:scale-105 btn-press"
              >
                <span className="relative z-10">Explore Events</span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/events/create"
                className="group relative bg-[#0B0B14] border-2 border-[#FFB400] text-[#FFB400] px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#FFB400] hover:text-[#0B0B14] transition-all transform hover:scale-105 btn-press"
              >
                Create Event
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
            {[
              { value: stats.eventsCreated.toString(), label: "Events Created", color: "#6C63FF" },
              { value: stats.ticketsSold.toString(), label: "Tickets Sold", color: "#FFB400" },
              { value: stats.activeUsers.toString(), label: "Active Users", color: "#00C6AE" },
              { value: `$${stats.volumeHBAR.toFixed(0)}`, label: "Volume (HBAR)", color: "#6C63FF" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#0B0B14]/50 backdrop-blur-sm border border-[#6C63FF]/20 rounded-2xl p-4 sm:p-5 text-center hover:border-[#6C63FF]/50 transition-all group animate-fade-in-up"
                style={{ animationDelay: `${(idx + 3) * 0.1}s` }}
              >
                <div
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-[#D1D5DB] text-xs md:text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Why Choose <span className="text-[#FFB400]">TicketProof</span>?
          </h2>
          <p className="text-[#D1D5DB] text-base md:text-lg">
            Built on cutting-edge blockchain technology for the future of events
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: "🎫",
              title: "NFT-Powered Tickets",
              description:
                "Every ticket is a unique NFT on Hedera, making counterfeiting impossible. Own your ticket as a digital collectible.",
              gradient: "from-[#6C63FF] to-[#00C6AE]",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              description:
                "Sub-second transaction finality with near-zero fees. Hedera's hashgraph technology ensures instant ticket delivery.",
              gradient: "from-[#FFB400] to-[#6C63FF]",
            },
            {
              icon: "🏆",
              title: "Earn Rewards",
              description:
                "Collect exclusive badges, level up your profile, and unlock VIP perks as you attend more events.",
              gradient: "from-[#00C6AE] to-[#FFB400]",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-[#0B0B14] border border-[#6C63FF]/20 rounded-2xl p-6 hover:border-[#6C63FF]/50 transition-all transform hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
              ></div>
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 text-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFB400] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#D1D5DB] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-[#6C63FF]/10 to-[#00C6AE]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Get Started in <span className="text-[#FFB400]">3 Steps</span>
            </h2>
            <p className="text-[#D1D5DB] text-base md:text-lg">
              Join the future of event ticketing in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your Hedera wallet (HashPack or Blade) in seconds" },
              { step: "02", title: "Browse Events", desc: "Discover amazing events and secure your spot" },
              { step: "03", title: "Get NFT Ticket", desc: "Receive your unique NFT ticket instantly" },
            ].map((item, idx) => (
              <div key={idx} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#6C63FF] to-transparent -z-10"></div>
                )}
                <div className="bg-[#0B0B14] border border-[#6C63FF]/20 rounded-2xl p-6 text-center hover:border-[#FFB400] transition-all group">
                  <div className="text-5xl font-bold bg-gradient-to-br from-[#6C63FF] to-[#00C6AE] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#D1D5DB] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#6C63FF] via-[#FFB400] to-[#00C6AE] rounded-3xl p-8 sm:p-12 text-center">
          <div className="absolute top-0 left-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of event-goers using blockchain-verified tickets.
              Your next unforgettable experience is just a click away.
            </p>
            <button 
              onClick={handleConnectWallet}
              className="bg-[#0B0B14] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold text-base hover:bg-white hover:text-[#6C63FF] transition-all transform hover:scale-105 shadow-2xl btn-press"
            >
              {isWalletConnected ? 'Browse Events' : 'Connect Wallet & Get Started'}
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <p className="text-[#D1D5DB] text-base">
            Trusted by event organizers worldwide
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-50">
          {["Hedera", "HashPack", "Blade", "Firebase", "Web3"].map(
            (partner, idx) => (
              <div key={idx} className="text-lg sm:text-xl font-semibold text-[#D1D5DB]">
                {partner}
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}