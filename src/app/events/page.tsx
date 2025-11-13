'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EventCardSkeleton } from '@/components/LoadingSkeleton';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          toast.error('Failed to load events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'concert', label: '🎵 Concerts' },
    { id: 'conference', label: '💼 Conferences' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'theater', label: '🎭 Theater' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0B0B14]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#FFB400] to-[#00C6AE] bg-clip-text text-transparent">
              Discover Events
            </span>
          </h1>
          <p className="text-xl text-[#D1D5DB] max-w-2xl mx-auto">
            Secure your spot at amazing events with blockchain-verified tickets
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D1D5DB] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0B0B14] border border-[#6C63FF]/20 text-white rounded-lg focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white'
                        : 'bg-[#0B0B14] border border-[#6C63FF]/20 text-[#D1D5DB] hover:border-[#6C63FF]/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-6xl mx-auto mb-6">
          {loading ? (
            <div className="flex items-center gap-2 text-[#D1D5DB]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading events...</span>
            </div>
          ) : (
            <p className="text-[#D1D5DB]">
              Found <span className="font-semibold text-[#FFB400]">{filteredEvents.length}</span> events
            </p>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const ticketsLeft = event.totalTickets - event.ticketsSold;
              const isSoldOut = ticketsLeft === 0;
              const isAlmostSoldOut = ticketsLeft <= 50 && !isSoldOut;
              const soldPercentage = (event.ticketsSold / event.totalTickets) * 100;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl overflow-hidden h-full transform hover:-translate-y-2 hover:border-[#6C63FF]/50 hover:shadow-[0_0_30px_rgba(108,99,255,0.3)] transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {isSoldOut && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            SOLD OUT
                          </span>
                        )}
                        {isAlmostSoldOut && (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {ticketsLeft} LEFT
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B14] via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 text-white group-hover:text-[#FFB400] transition-colors duration-200">
                        {event.name}
                      </h3>
                      <p className="text-[#D1D5DB] text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-[#D1D5DB] text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-[#6C63FF]" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-[#D1D5DB] text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-[#FFB400]" />
                          {event.location}
                        </div>
                      </div>

                      {/* Price & Progress */}
                      <div className="border-t border-[#6C63FF]/20 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="text-2xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] bg-clip-text text-transparent">
                              {event.price} HBAR
                            </p>
                            <p className="text-xs text-[#D1D5DB]">per ticket</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">
                              {event.ticketsSold}/{event.totalTickets}
                            </p>
                            <p className="text-xs text-[#D1D5DB]">sold</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#0B0B14] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isSoldOut
                                ? 'bg-red-500'
                                : isAlmostSoldOut
                                ? 'bg-yellow-500'
                                : 'bg-gradient-to-r from-[#6C63FF] to-[#00C6AE]'
                            }`}
                            style={{ width: `${soldPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-4">
                        <div className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white py-2 rounded-lg font-semibold text-center group-hover:shadow-[0_0_20px_rgba(108,99,255,0.5)] transition-all">
                          {isSoldOut ? 'View Details' : 'Buy Tickets'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-[#D1D5DB] mb-4">No events found</p>
            <p className="text-[#D1D5DB]">Try adjusting your search or filters</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#6C63FF] via-[#FFB400] to-[#00C6AE] text-white rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Want to create your own event?</h2>
            <p className="text-lg mb-6 opacity-90">
              Launch your event with NFT tickets in minutes
            </p>
            <Link
              href="/events/create"
              className="inline-block bg-[#0B0B14] text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#6C63FF] transition-all transform hover:scale-105"
            >
              Create Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
