// src/app/api/badges/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { BADGES, getEarnedBadges, checkNewBadges, type Badge } from '@/lib/badges';

interface UserBadge {
  id: string;
  badgeId: string;
  accountId: string;
  earnedAt: Date;
}

// GET - Fetch user badges and progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get user data from Firestore
    const userRef = doc(db, COLLECTIONS.USERS, accountId);
    const userSnap = await getDoc(userRef);

    let ticketCount = 0;
    let eventsAttended = 0;
    let earnedBadgeIds: string[] = [];

    if (userSnap.exists()) {
      const userData = userSnap.data();
      ticketCount = userData.ticketsPurchased || 0;
      eventsAttended = userData.eventsAttended || 0;
      earnedBadgeIds = userData.badges?.map((b: any) => b.id) || [];
    }

    // Get all possible badges with earned status
    const badgesWithStatus = BADGES.map(badge => {
      const isEarned = earnedBadgeIds.includes(badge.id);
      let progress = 0;

      // Calculate progress for threshold-based badges
      if (badge.criteria.type === 'tickets_purchased' && badge.criteria.threshold) {
        progress = Math.min((ticketCount / badge.criteria.threshold) * 100, 100);
      } else if (badge.criteria.type === 'events_attended' && badge.criteria.threshold) {
        progress = Math.min((eventsAttended / badge.criteria.threshold) * 100, 100);
      }

      return {
        ...badge,
        earned: isEarned,
        progress: Math.round(progress),
        earnedAt: isEarned ? new Date().toISOString() : null
      };
    });

    // Separate earned and locked badges
    const earnedBadges = badgesWithStatus.filter(b => b.earned);
    const lockedBadges = badgesWithStatus.filter(b => !b.earned);

    return NextResponse.json({
      badges: badgesWithStatus,
      earnedBadges,
      lockedBadges,
      stats: {
        totalBadges: BADGES.length,
        earnedCount: earnedBadges.length,
        ticketCount,
        eventsAttended
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST - Check and award new badges after ticket purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, eventId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get current user data
    const userRef = doc(db, COLLECTIONS.USERS, accountId);
    const userSnap = await getDoc(userRef);

    let userData: any = {
      ticketsPurchased: 0,
      eventsAttended: 0,
      badges: [],
      attendedEvents: []
    };

    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    const previousTicketCount = userData.ticketsPurchased || 0;
    const currentTicketCount = previousTicketCount + 1;

    // Check if this is a new event attended
    const attendedEvents = userData.attendedEvents || [];
    const isNewEvent = eventId && !attendedEvents.includes(eventId);
    const eventsAttended = userData.eventsAttended || 0;
    const newEventsAttended = isNewEvent ? eventsAttended + 1 : eventsAttended;

    // Get existing badge IDs
    const existingBadgeIds = userData.badges?.map((b: any) => b.id) || [];

    // Check for newly earned badges
    const newBadges = checkNewBadges(
      currentTicketCount,
      previousTicketCount,
      newEventsAttended,
      existingBadgeIds
    );

    // Update user document
    const updatedBadges = [
      ...userData.badges,
      ...newBadges.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        imageUrl: badge.emoji,
        earnedAt: new Date(),
        rarity: badge.rarity
      }))
    ];

    const updatedAttendedEvents = isNewEvent 
      ? [...attendedEvents, eventId] 
      : attendedEvents;

    await setDoc(userRef, {
      walletAddress: accountId,
      ticketsPurchased: currentTicketCount,
      eventsAttended: newEventsAttended,
      attendedEvents: updatedAttendedEvents,
      badges: updatedBadges,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      newBadges: newBadges.map(b => ({
        ...b,
        earnedAt: new Date().toISOString()
      })),
      stats: {
        ticketsPurchased: currentTicketCount,
        eventsAttended: newEventsAttended,
        totalBadges: updatedBadges.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    );
  }
}

// PUT - Manually award a special badge (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, badgeId, adminKey } = body;

    // Simple admin authentication (replace with proper auth)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!accountId || !badgeId) {
      return NextResponse.json(
        { error: 'Account ID and badge ID are required' },
        { status: 400 }
      );
    }

    // Find the badge
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Get user data
    const userRef = doc(db, COLLECTIONS.USERS, accountId);
    const userSnap = await getDoc(userRef);

    const userData = userSnap.exists() ? userSnap.data() : { badges: [] };
    const existingBadges = userData.badges || [];

    // Check if already earned
    if (existingBadges.some((b: any) => b.id === badgeId)) {
      return NextResponse.json(
        { error: 'Badge already earned' },
        { status: 400 }
      );
    }

    // Add the badge
    const newBadge = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      imageUrl: badge.emoji,
      earnedAt: new Date(),
      rarity: badge.rarity
    };

    await setDoc(userRef, {
      badges: [...existingBadges, newBadge],
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Badge awarded successfully',
      badge: newBadge
    }, { status: 200 });

  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}