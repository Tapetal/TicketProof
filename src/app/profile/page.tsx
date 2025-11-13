// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, Ticket, Trophy, TrendingUp, Copy, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ATTENDEE_LEVELS } from '@/types/user';
import { BADGES, getEarnedBadges, getRarityColor } from '@/lib/badges';
import EmptyState from '@/components/EmptyState';
import { ProfileStatsSkeleton, BadgeSkeleton } from '@/components/LoadingSkeleton';

export default function ProfilePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Get wallet address
  useEffect(() => {
    const savedWallet = localStorage.getItem('hedera_account_id');
    setWalletAddress(savedWallet);
  }, []);

  // Fetch user's tickets for stats
  useEffect(() => {
    const fetchTickets = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/tickets?walletAddress=${walletAddress}`);
        const data = await response.json();

        if (data.success) {
          setTickets(data.tickets || []);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchTickets();
    }
  }, [walletAddress]);

  // Calculate user stats
  const totalTickets = tickets.length;
  const eventsAttended = new Set(tickets.map(t => t.eventId)).size;
  const totalSpent = tickets.reduce((sum, t) => sum + (t.metadata?.price || 0), 0);
  
  // Get earned badges using the badge system
  const earnedBadges = getEarnedBadges(totalTickets, eventsAttended);
  
  // Calculate level
  const getAttendeeLevel = () => {
    for (const [level, data] of Object.entries(ATTENDEE_LEVELS)) {
      if (totalTickets >= data.min && totalTickets <= data.max) {
        return { level, ...data };
      }
    }
    return { level: 'Newcomer', ...ATTENDEE_LEVELS.Newcomer };
  };

  const currentLevel = getAttendeeLevel();
  const nextLevel = Object.entries(ATTENDEE_LEVELS).find(([_, data]) => data.min > totalTickets);
  const progressToNext = nextLevel 
    ? ((totalTickets - currentLevel.min) / (nextLevel[1].min - currentLevel.min)) * 100
    : 100;

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not connected state
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-[#6C63FF] to-[#00C6AE] rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-[#D1D5DB] mb-8">
            Please connect your wallet to view your profile
          </p>
          <Link href="/" className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#6C63FF] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B14] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#FFB400] to-[#00C6AE] bg-clip-text text-transparent">
              My Profile
            </span>
          </h1>
          <p className="text-xl text-[#D1D5DB]">
            Your Web3 event journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-[#6C63FF] to-[#00C6AE] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>

              {/* Level */}
              <div className="text-center mb-6">
                <div 
                  className="inline-block px-4 py-2 rounded-full font-bold mb-2"
                  style={{ backgroundColor: `${currentLevel.color}20`, color: currentLevel.color }}
                >
                  {currentLevel.level}
                </div>
                <p className="text-sm text-[#D1D5DB]">Attendee Level</p>
              </div>

              {/* Wallet Address */}
              <div className="bg-[#0B0B14] border border-[#6C63FF]/20 rounded-lg p-4 mb-4">
                <p className="text-xs text-[#D1D5DB] mb-2">Wallet Address</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-white truncate">
                    {walletAddress}
                  </p>
                  <button
                    onClick={copyWalletAddress}
                    className="ml-2 p-2 hover:bg-[#6C63FF]/10 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#D1D5DB]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link
                  href="/events"
                  className="block w-full text-center bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white py-2.5 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all"
                >
                  Browse Events
                </Link>
                <Link
                  href="/tickets"
                  className="block w-full text-center bg-[#0B0B14] border border-[#6C63FF]/20 text-[#D1D5DB] py-2.5 rounded-lg font-semibold hover:border-[#6C63FF]/50 transition-all"
                >
                  View Tickets
                </Link>
              </div>
            </div>

            {/* Level Progress */}
            <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FFB400]" />
                Level Progress
              </h3>
              
              {nextLevel ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: currentLevel.color }} className="font-semibold">
                      {currentLevel.level}
                    </span>
                    <span style={{ color: nextLevel[1].color }} className="font-semibold">
                      {nextLevel[0]}
                    </span>
                  </div>
                  <div className="w-full bg-[#0B0B14] rounded-full h-3 mb-2">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progressToNext}%`,
                        background: `linear-gradient(to right, ${currentLevel.color}, ${nextLevel[1].color})`
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#D1D5DB] text-center">
                    {nextLevel[1].min - totalTickets} more tickets to {nextLevel[0]}
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-[#FFB400] font-semibold">🎉 Max Level Reached!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Badges */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6 hover:border-[#6C63FF]/50 transition-all">
                <Ticket className="w-8 h-8 text-[#6C63FF] mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {totalTickets}
                </div>
                <p className="text-sm text-[#D1D5DB]">Total Tickets</p>
              </div>

              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6 hover:border-[#6C63FF]/50 transition-all">
                <Trophy className="w-8 h-8 text-[#FFB400] mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {eventsAttended}
                </div>
                <p className="text-sm text-[#D1D5DB]">Events Attended</p>
              </div>

              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6 hover:border-[#6C63FF]/50 transition-all">
                <TrendingUp className="w-8 h-8 text-[#00C6AE] mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {earnedBadges.length}
                </div>
                <p className="text-sm text-[#D1D5DB]">Badges Earned</p>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#FFB400]" />
                Achievement Badges
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {BADGES.map((badge) => {
                  const isEarned = earnedBadges.some(b => b.id === badge.id);

                  return (
                    <div
                      key={badge.id}
                      className={`relative bg-[#0B0B14] border-2 rounded-xl p-4 text-center transition-all ${
                        isEarned
                          ? 'border-[#6C63FF]/50 hover:border-[#6C63FF] hover:shadow-[0_0_20px_rgba(108,99,255,0.3)]'
                          : 'border-[#6C63FF]/10 opacity-40 grayscale'
                      }`}
                    >
                      {/* Rarity Indicator */}
                      {isEarned && (
                        <div
                          className="absolute top-2 right-2 w-2 h-2 rounded-full"
                          style={{ backgroundColor: getRarityColor(badge.rarity) }}
                        />
                      )}

                      <div className="text-4xl mb-2">{badge.emoji}</div>
                      <p className="font-semibold text-white text-sm mb-1">
                        {badge.name}
                      </p>
                      <p className="text-xs capitalize" style={{ color: getRarityColor(badge.rarity) }}>
                        {badge.rarity}
                      </p>
                      
                      {!isEarned && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-2xl">🔒</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            {tickets.length > 0 && (
              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center gap-4 p-4 bg-[#0B0B14] border border-[#6C63FF]/10 rounded-lg hover:border-[#6C63FF]/30 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#6C63FF] to-[#00C6AE] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {ticket.eventName}
                        </p>
                        <p className="text-sm text-[#D1D5DB]">
                          Purchased {new Date(ticket.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}