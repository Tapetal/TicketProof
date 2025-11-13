// src/components/EventCard.tsx
'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/types/event';
import { formatEventDate, formatPrice } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const ticketsLeft = event.totalTickets - event.ticketsSold;
  const isSoldOut = ticketsLeft === 0;
  const isAlmostSoldOut = ticketsLeft <= 50 && !isSoldOut;
  const soldPercentage = (event.ticketsSold / event.totalTickets) * 100;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block animate-fade-in-up"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'both'
      }}
    >
      <div className="card overflow-hidden h-full transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover-glow">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100">
              <span className="text-6xl">🎫</span>
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Category Badge */}
            <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
              {event.category}
            </span>

            {/* Status Badges */}
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

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors duration-200">
            {event.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            {/* Date */}
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-violet-600 flex-shrink-0" />
              <span className="truncate">{formatEventDate(event.date)}</span>
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-violet-600 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            {/* Attendees */}
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-2 text-violet-600 flex-shrink-0" />
              <span>{event.ticketsSold} attending</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-4">
            {/* Price & Sales Info */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-2xl font-bold text-violet-600">
                  {formatPrice(event.price)}
                </p>
                <p className="text-xs text-gray-500">per ticket</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {event.ticketsSold}/{event.totalTickets}
                </p>
                <p className="text-xs text-gray-500">tickets sold</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-red-500'
                      : isAlmostSoldOut
                      ? 'bg-yellow-500'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600'
                  }`}
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
              {/* Percentage Label */}
              <p className="text-xs text-gray-500 text-right mt-1">
                {soldPercentage.toFixed(0)}% sold
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-4">
            <div className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2 rounded-lg font-semibold text-center group-hover:shadow-lg transition-all">
              {isSoldOut ? 'View Details' : 'Buy Tickets'}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  );
}