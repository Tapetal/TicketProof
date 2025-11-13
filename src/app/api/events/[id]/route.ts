// src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id: eventId } = await params;

    // Fetch event from Firestore
    const eventDoc = await getDoc(doc(db, 'events', eventId));

    if (!eventDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = {
      id: eventDoc.id,
      ...normalizeFirestoreData(eventDoc.data())
    };

    return NextResponse.json({
      success: true,
      event: eventData
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}