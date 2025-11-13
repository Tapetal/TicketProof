// src/app/api/tickets/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    if (!walletAddress && !userId) {
      return NextResponse.json(
        { success: false, error: 'walletAddress or userId is required' },
        { status: 400 }
      );
    }

    // Build Firestore query
    const ticketsRef = collection(db, COLLECTIONS.TICKETS);
    let q;

    if (eventId) {
      q = query(
        ticketsRef,
        where('eventId', '==', eventId),
        walletAddress
          ? where('ownerWallet', '==', walletAddress)
          : where('ownerId', '==', userId),
        orderBy('purchaseDate', 'desc')
      );
    } else {
      q = query(
        ticketsRef,
        walletAddress
          ? where('ownerWallet', '==', walletAddress)
          : where('ownerId', '==', userId),
        orderBy('purchaseDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);

    const tickets = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      // Safely convert Firestore Timestamps or plain strings to ISO strings
      const convertDate = (value: any) => {
        if (!value) return null;
        if (value.toDate) return value.toDate().toISOString(); // Firestore Timestamp
        if (value instanceof Date) return value.toISOString(); // JS Date
        if (typeof value === 'string') return value; // already ISO string
        return null;
      };

      return {
        id: doc.id,
        ...data,
        purchaseDate: convertDate(data.purchaseDate),
        eventDate: convertDate(data.eventDate),
      };
    });

    // Group tickets by event
    const ticketsByEvent = tickets.reduce((acc: any, ticket: any) => {
      if (!acc[ticket.eventId]) {
        acc[ticket.eventId] = {
          eventId: ticket.eventId,
          eventName: ticket.eventName,
          eventDate: ticket.eventDate,
          eventLocation: ticket.eventLocation,
          eventImageUrl: ticket.eventImageUrl,
          tickets: [],
        };
      }
      acc[ticket.eventId].tickets.push(ticket);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      tickets,
      ticketsByEvent: Object.values(ticketsByEvent),
      totalTickets: tickets.length,
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
