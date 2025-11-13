// src/lib/badges.ts

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: 'tickets_purchased' | 'events_attended' | 'early_bird' | 'special';
    threshold?: number;
  };
}

export const BADGES: Badge[] = [
  {
    id: 'first_ticket',
    name: 'First Timer',
    description: 'Purchased your first NFT ticket',
    emoji: '🎫',
    rarity: 'common',
    criteria: { type: 'tickets_purchased', threshold: 1 }
  },
  {
    id: 'bronze_collector',
    name: 'Bronze Collector',
    description: 'Own 3 or more tickets',
    emoji: '🥉',
    rarity: 'common',
    criteria: { type: 'tickets_purchased', threshold: 3 }
  },
  {
    id: 'silver_collector',
    name: 'Silver Collector',
    description: 'Own 10 or more tickets',
    emoji: '🥈',
    rarity: 'rare',
    criteria: { type: 'tickets_purchased', threshold: 10 }
  },
  {
    id: 'gold_collector',
    name: 'Gold Collector',
    description: 'Own 25 or more tickets',
    emoji: '🥇',
    rarity: 'epic',
    criteria: { type: 'tickets_purchased', threshold: 25 }
  },
  {
    id: 'platinum_member',
    name: 'Platinum Member',
    description: 'Own 50 or more tickets',
    emoji: '💎',
    rarity: 'legendary',
    criteria: { type: 'tickets_purchased', threshold: 50 }
  },
  {
    id: 'event_explorer',
    name: 'Event Explorer',
    description: 'Attended 5 different events',
    emoji: '🗺️',
    rarity: 'rare',
    criteria: { type: 'events_attended', threshold: 5 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Attended 10 different events',
    emoji: '🦋',
    rarity: 'epic',
    criteria: { type: 'events_attended', threshold: 10 }
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    emoji: '🌟',
    rarity: 'legendary',
    criteria: { type: 'special' }
  }
];

// Check which new badges a user has earned
export function checkNewBadges(
  currentTicketCount: number,
  previousTicketCount: number,
  eventsAttended: number,
  existingBadges: string[]
): Badge[] {
  const newBadges: Badge[] = [];

  for (const badge of BADGES) {
    // Skip if already earned
    if (existingBadges.includes(badge.id)) continue;

    // Check criteria
    if (badge.criteria.type === 'tickets_purchased') {
      if (
        currentTicketCount >= badge.criteria.threshold! &&
        previousTicketCount < badge.criteria.threshold!
      ) {
        newBadges.push(badge);
      }
    } else if (badge.criteria.type === 'events_attended') {
      if (eventsAttended >= badge.criteria.threshold!) {
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
}

// Get all badges a user has earned
export function getEarnedBadges(
  ticketCount: number,
  eventsAttended: number,
  specialBadges: string[] = []
): Badge[] {
  const earned: Badge[] = [];

  for (const badge of BADGES) {
    if (badge.criteria.type === 'tickets_purchased') {
      if (ticketCount >= badge.criteria.threshold!) {
        earned.push(badge);
      }
    } else if (badge.criteria.type === 'events_attended') {
      if (eventsAttended >= badge.criteria.threshold!) {
        earned.push(badge);
      }
    } else if (badge.criteria.type === 'special' && specialBadges.includes(badge.id)) {
      earned.push(badge);
    }
  }

  return earned;
}

// Get rarity color
export function getRarityColor(rarity: Badge['rarity']): string {
  const colors = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };
  return colors[rarity];
}