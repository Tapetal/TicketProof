// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

const normalizeFirestoreData = (data: Record<string, any>) => {
  const normalized: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      typeof (value as { toDate?: () => Date }).toDate === 'function'
    ) {
      const dateValue = (value as { toDate: () => Date }).toDate();
      normalized[key] = dateValue.toISOString();
    } else if (
      value &&
      typeof value === 'object' &&
      'seconds' in value &&
      typeof (value as { seconds: number }).seconds === 'number'
    ) {
      const dateValue = new Date((value as { seconds: number }).seconds * 1000);
      normalized[key] = dateValue.toISOString();
    } else {
      normalized[key] = value;
    }
  });

  return normalized;
};

// GET - Fetch all events
export async function GET() {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...normalizeFirestoreData(doc.data())
    }));

    return NextResponse.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      date,
      location,
      price,
      totalTickets,
      category,
      imageUrl,
      organizerId,
      organizerName,
      features
    } = body;

    // Validate required fields
    if (!name || !description || !date || !location || !price || !totalTickets) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert date safely to Firestore Timestamp
    let eventDate: Timestamp;
    try {
      eventDate = Timestamp.fromDate(new Date(date));
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Create event data
    const eventData = {
      name,
      description,
      date: eventDate, // ✅ Firestore Timestamp
      location,
      price: parseFloat(price),
      totalTickets: parseInt(totalTickets),
      ticketsSold: 0,
      category: category || 'other',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      organizerId: organizerId || 'user_123',
      organizerName: organizerName || 'Event Organizer',
      features: features || [
        '🎤 Amazing Experience',
        '🤝 Networking Opportunities',
        '🎁 Exclusive Perks',
        '📜 NFT Certificate',
        '🛠️ Hands-on Workshops',
        '🍽️ Catered Lunch',
      ],
      createdAt: Timestamp.now(),
      hederaTokenId: `0.0.${Math.floor(Math.random() * 1000000)}` // Mock Hedera token ID
    };

    // Save to Firestore
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, eventData);

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
      hederaTokenId: eventData.hederaTokenId,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
