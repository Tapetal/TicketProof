// src/types/user.ts

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  displayName?: string;
  ticketsPurchased: number;
  attendeeLevel: AttendeeLevel;
  badges: Badge[];
  totalSpent: number; // in HBAR
  createdAt: Date;
  lastActive: Date;
}

export type AttendeeLevel = 'Newcomer' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface BadgeCriteria {
  type: 'tickets_purchased' | 'events_attended' | 'early_bird' | 'referral' | 'special';
  threshold?: number;
  description: string;
}

// Gamification levels
export const ATTENDEE_LEVELS: Record<AttendeeLevel, { min: number; max: number; color: string }> = {
  Newcomer: { min: 0, max: 2, color: '#94a3b8' },
  Bronze: { min: 3, max: 9, color: '#cd7f32' },
  Silver: { min: 10, max: 24, color: '#c0c0c0' },
  Gold: { min: 25, max: 49, color: '#ffd700' },
  Platinum: { min: 50, max: Infinity, color: '#e5e4e2' }
};