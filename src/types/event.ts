// src/types/event.ts

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  price: number; // in HBAR
  totalTickets: number;
  ticketsSold: number;
  imageUrl: string;
  organizerId: string;
  category: 'concert' | 'conference' | 'sports' | 'theater' | 'other';
  createdAt: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface CreateEventData {
  name: string;
  description: string;
  date: Date;
  location: string;
  price: number;
  totalTickets: number;
  imageUrl?: string;
  category: Event['category'];
}

export interface EventFilters {
  category?: Event['category'];
  priceRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  search?: string;
}