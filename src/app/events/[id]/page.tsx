// src/app/events/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Ticket, Clock, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PurchaseModal from '@/components/PurchaseModal';
import toast from 'react-hot-toast';

const parseEventDate = (value: unknown): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    const parsed = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    typeof (value as { seconds: number }).seconds === 'number'
  ) {
    const parsed = new Date((value as { seconds: number }).seconds * 1000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Fetch event from API
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();

        if (data.success && data.event) {
          const parsedDate = parseEventDate(data.event.date);
          setEvent({
            ...data.event,
            date: parsedDate,
            features: data.event.features || [
              '🎤 Amazing Experience',
              '🤝 Networking Opportunities',
              '🎁 Exclusive Perks',
              '📜 NFT Certificate'
            ]
          });
        } else {
          toast.error('Event not found');
          setTimeout(() => router.push('/events'), 2000);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
        setTimeout(() => router.push('/events'), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#6C63FF] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Event not found</p>
          <Link href="/events" className="text-[#FFB400] hover:underline">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const totalTickets = Number(event.totalTickets ?? 0);
  const ticketsSold = Number(event.ticketsSold ?? 0);
  const ticketsLeft = Math.max(totalTickets - ticketsSold, 0);
  const isSoldOut = ticketsLeft === 0;
  const isAlmostSoldOut = ticketsLeft <= 50 && !isSoldOut;
  const eventDate = parseEventDate(event.date);

  const timeUntilEvent = () => {
    if (!eventDate) return 'Date to be announced';

    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'}`;
    }

    if (diff > 0) {
      return 'Starting soon';
    }

    return 'Event in progress';
  };
  const countdownLabel = timeUntilEvent();

  return (
    <div className="min-h-screen bg-[#0B0B14]">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          alt={event.name}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B14] via-[#0B0B14]/50 to-transparent" />
        
        {/* Back Button */}
        <Link
          href="/events"
          className="absolute top-8 left-8 flex items-center gap-2 text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-black/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </Link>

        {/* Event Title Overlay */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              {event.category?.toUpperCase() || 'EVENT'}
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">{event.name}</h1>
            <p className="text-xl text-gray-200">
              Hosted by {event.organizerName || 'Event Organizer'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl p-6">
                <Calendar className="w-8 h-8 text-[#6C63FF] mb-3" />
                <p className="text-sm text-[#D1D5DB] mb-1">Date & Time</p>
                <p className="font-semibold text-white">
                  {eventDate
                    ? eventDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Date to be announced'}
                </p>
                <p className="text-sm text-[#D1D5DB]">
                  {eventDate
                    ? eventDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                    : '—'}
                </p>
              </div>

              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl p-6">
                <MapPin className="w-8 h-8 text-[#FFB400] mb-3" />
                <p className="text-sm text-[#D1D5DB] mb-1">Location</p>
                <p className="font-semibold text-white">{event.location}</p>
              </div>

              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl p-6">
                <Users className="w-8 h-8 text-[#00C6AE] mb-3" />
                <p className="text-sm text-[#D1D5DB] mb-1">Attendees</p>
                <p className="font-semibold text-white">{event.ticketsSold || 0} registered</p>
                <p className="text-sm text-[#D1D5DB]">{ticketsLeft} spots left</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-[#D1D5DB] leading-relaxed mb-6">
                {event.description}
              </p>

              {event.features && event.features.length > 0 && (
                <>
                  <h3 className="text-xl font-bold text-white mb-4">What's Included</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {event.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-[#D1D5DB]">
                        <span className="text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* NFT Benefits */}
            <div className="bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] rounded-xl p-8 text-white">
              <div className="flex items-start gap-4">
                <Shield className="w-12 h-12 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">NFT Ticket Benefits</h3>
                  <ul className="space-y-2 opacity-90">
                    <li>✓ Verifiable proof of attendance</li>
                    <li>✓ Transferable to friends</li>
                    <li>✓ Unlock exclusive perks and rewards</li>
                    <li>✓ Collectible digital memorabilia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-8">
                {/* Price */}
                <div className="text-center mb-6">
                  <p className="text-[#D1D5DB] mb-2">Ticket Price</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] bg-clip-text text-transparent">
                    {event.price} <span className="text-2xl">HBAR</span>
                  </p>
                </div>

                {/* Time Until Event */}
                <div className="bg-[#6C63FF]/10 rounded-lg p-4 mb-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#6C63FF]">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">
                      {countdownLabel}
                      {countdownLabel.endsWith('day') || countdownLabel.endsWith('days') ? ' until event' : ''}
                    </span>
                  </div>
                </div>

                {/* Availability Status */}
                {isAlmostSoldOut && !isSoldOut && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <p className="text-yellow-500 font-semibold text-center">
                      ⚡ Only {ticketsLeft} tickets left!
                    </p>
                  </div>
                )}

                {isSoldOut && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-red-500 font-semibold text-center">
                      🎫 Event Sold Out
                    </p>
                  </div>
                )}

                {/* Quantity Selector */}
                {!isSoldOut && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                      Number of Tickets
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 border-2 border-[#6C63FF] text-[#6C63FF] rounded-lg font-bold hover:bg-[#6C63FF]/10 transition-all"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="flex-1 text-center text-2xl font-bold bg-[#0B0B14] border-2 border-[#6C63FF]/20 text-white rounded-lg py-2"
                        min="1"
                        max="10"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="w-12 h-12 border-2 border-[#6C63FF] text-[#6C63FF] rounded-lg font-bold hover:bg-[#6C63FF]/10 transition-all"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-[#D1D5DB] mt-2">Max 10 tickets per purchase</p>
                  </div>
                )}

                {/* Total */}
                {!isSoldOut && (
                  <div className="border-t border-[#6C63FF]/20 pt-4 mb-6">
                    <div className="flex justify-between text-lg mb-2">
                      <span className="text-[#D1D5DB]">Subtotal</span>
                      <span className="font-semibold text-white">{event.price * quantity} HBAR</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-[#FFB400]">{event.price * quantity} HBAR</span>
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={isSoldOut}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    isSoldOut
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] hover:scale-105'
                  }`}
                >
                  {isSoldOut ? 'Sold Out' : 'Buy Tickets'}
                </button>

                {/* Info */}
                <div className="mt-6 space-y-2 text-sm text-[#D1D5DB]">
                  <p className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Secure payment via Hedera
                  </p>
                  <p className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Instant NFT ticket delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        event={event}
        quantity={quantity}
      />
    </div>
  );
}