// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import QRCode from 'qrcode';
import { format } from 'date-fns';

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate QR code from data
export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Format date for display
export function formatEventDate(date: Date): string {
  return format(new Date(date), 'MMM dd, yyyy • h:mm a');
}

// Format price in HBAR
export function formatPrice(hbar: number): string {
  return `${hbar.toFixed(2)} HBAR`;
}

// Calculate attendee level based on tickets purchased
export function calculateAttendeeLevel(ticketsPurchased: number): string {
  if (ticketsPurchased >= 50) return 'Platinum';
  if (ticketsPurchased >= 25) return 'Gold';
  if (ticketsPurchased >= 10) return 'Silver';
  if (ticketsPurchased >= 3) return 'Bronze';
  return 'Newcomer';
}

// Truncate wallet address
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check if event is upcoming
export function isEventUpcoming(eventDate: Date): boolean {
  return new Date(eventDate) > new Date();
}

// Calculate real-time countdown to event
export function getTimeUntilEvent(eventDate: Date): string {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();

  if (diff < 0) return 'Event has passed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
  
  return 'Starting now!';
}

// Get detailed countdown with multiple units
export function getDetailedCountdown(eventDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false
  };
}