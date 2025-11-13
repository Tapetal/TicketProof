// src/app/tickets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, QrCode, Download, Share2, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import { TicketCardSkeleton } from '@/components/LoadingSkeleton';

interface TicketGroup {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImageUrl: string;
  tickets: any[];
}

export default function MyTicketsPage() {
  const [ticketsByEvent, setTicketsByEvent] = useState<TicketGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Get wallet address from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('hedera_account_id');
    setWalletAddress(savedWallet);
  }, []);

  // Fetch tickets
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
          setTicketsByEvent(data.ticketsByEvent || []);
        } else {
          toast.error('Failed to load tickets');
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchTickets();
    }
  }, [walletAddress]);

  const handleShowQR = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  const handleDownloadTicket = (ticket: any) => {
    // Create a simple ticket image/PDF download
    const ticketData = `
Event: ${ticket.eventName}
Date: ${new Date(ticket.eventDate).toLocaleDateString()}
Location: ${ticket.eventLocation}
Ticket ID: ${ticket.id}
NFT: ${ticket.nftTokenId}-${ticket.serialNumber}
    `.trim();

    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Ticket downloaded!');
  };

  const handleShareTicket = (ticket: any) => {
    const shareUrl = `${window.location.origin}/events/${ticket.eventId}`;
    
    if (navigator.share) {
      navigator.share({
        title: ticket.eventName,
        text: `Check out my ticket for ${ticket.eventName}!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Event link copied!');
    }
  };

  // Not connected state
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-[#6C63FF] to-[#00C6AE] rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-[#D1D5DB] mb-8">
            Please connect your wallet to view your tickets
          </p>
          <Link href="/" className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#6C63FF] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (ticketsByEvent.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-[#1A1B2E] border-2 border-[#6C63FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-12 h-12 text-[#6C63FF]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            No Tickets Yet
          </h2>
          <p className="text-[#D1D5DB] mb-8">
            You haven't purchased any tickets. Explore events and get your first NFT ticket!
          </p>
          <Link href="/events" className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] transition-all">
            Browse Events
          </Link>
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
              My Tickets
            </span>
          </h1>
          <p className="text-xl text-[#D1D5DB]">
            Your NFT tickets • {ticketsByEvent.reduce((acc, group) => acc + group.tickets.length, 0)} total
          </p>
        </div>

        {/* Tickets by Event */}
        <div className="space-y-12">
          {ticketsByEvent.map((group) => (
            <div key={group.eventId}>
              {/* Event Header */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={group.eventImageUrl || 'https://via.placeholder.com/80'}
                  alt={group.eventName}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {group.eventName}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-[#D1D5DB]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(group.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {group.eventLocation}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#FFB400]">
                    {group.tickets.length}
                  </div>
                  <div className="text-sm text-[#D1D5DB]">
                    ticket{group.tickets.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Tickets Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.tickets.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl overflow-hidden hover:border-[#6C63FF]/50 hover:shadow-[0_0_30px_rgba(108,99,255,0.2)] transition-all group"
                  >
                    {/* Ticket Card */}
                    <div className="p-6">
                      {/* Ticket Number */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-[#FFB400]">
                          TICKET #{idx + 1}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Full Token ID Display */}
                      <div className="mb-4 p-3 bg-[#0B0B14] rounded-lg border border-[#6C63FF]/10">
                        <p className="text-xs text-[#D1D5DB] mb-2 font-semibold">Token ID</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-white break-all flex-1">
                            {ticket.nftTokenId}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-[#6C63FF]/10">
                          <p className="text-xs text-[#D1D5DB] mb-1">Serial #</p>
                          <p className="text-sm font-mono text-[#FFB400] font-bold">
                            {ticket.serialNumber}
                          </p>
                        </div>
                      </div>

                      {/* Purchase Date */}
                      <div className="mb-6">
                        <p className="text-xs text-[#D1D5DB] mb-1">Purchased</p>
                        <p className="text-sm text-white">
                          {new Date(ticket.purchaseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleShowQR(ticket)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white py-2.5 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all"
                        >
                          <QrCode className="w-4 h-4" />
                          Show QR Code
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadTicket(ticket)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#0B0B14] border border-[#6C63FF]/20 text-[#D1D5DB] py-2 rounded-lg hover:border-[#6C63FF]/50 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => handleShareTicket(ticket)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#0B0B14] border border-[#6C63FF]/20 text-[#D1D5DB] py-2 rounded-lg hover:border-[#6C63FF]/50 transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Stub Effect */}
                    <div className="h-2 bg-gradient-to-r from-[#6C63FF] to-[#00C6AE]"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          />
          <div className="relative bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6 md:p-8 max-w-md w-full my-8">
            {/* Close Button - Fixed at top */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#0B0B14] hover:bg-red-500/20 border border-[#6C63FF]/20 hover:border-red-500/50 rounded-lg transition-all z-10"
            >
              <X className="w-5 h-5 text-[#D1D5DB] hover:text-red-400" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6 text-center pr-8">
              Ticket QR Code
            </h3>
            
            {/* QR Code Display */}
            <div className="bg-white p-4 rounded-xl mb-6">
              {selectedTicket.qrCode ? (
                <img
                  src={selectedTicket.qrCode}
                  alt="QR Code"
                  className="w-full h-auto max-w-[280px] mx-auto"
                />
              ) : (
                <div className="aspect-square flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">QR Code not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Info */}
            <div className="space-y-3 mb-6 text-sm bg-[#0B0B14] rounded-xl p-4 border border-[#6C63FF]/10">
              <div>
                <p className="text-[#D1D5DB] text-xs mb-1">Event</p>
                <p className="font-semibold text-white">{selectedTicket.eventName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[#D1D5DB] text-xs mb-1">Token ID</p>
                  <p className="font-mono text-[#FFB400] text-xs break-all">
                    {selectedTicket.nftTokenId}
                  </p>
                </div>
                <div>
                  <p className="text-[#D1D5DB] text-xs mb-1">Serial</p>
                  <p className="font-mono text-[#00C6AE] font-bold">
                    #{selectedTicket.serialNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-[#D1D5DB] text-center">
                📱 Present this QR code at the event entrance for verification
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}