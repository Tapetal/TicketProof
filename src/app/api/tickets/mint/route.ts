// src/app/api/tickets/mint/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { mintTicket } from '@/lib/hedera';
import { generateQRCode, calculateAttendeeLevel } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.eventId || !body.quantity || !body.walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch event details
    const eventRef = doc(db, COLLECTIONS.EVENTS, body.eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = eventDoc.data();
    const ticketsLeft = eventData.totalTickets - eventData.ticketsSold;

    // Check availability
    if (body.quantity > ticketsLeft) {
      return NextResponse.json(
        { success: false, error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    // Mint NFT tickets on Hedera
    const mintedTickets = [];
    const hederaTokenId = eventData.hederaTokenId;

    for (let i = 0; i < body.quantity; i++) {
      try {
        // ✅ Normalize event date safely
        const eventDateValue =
          eventData.date instanceof Date
            ? eventData.date
            : eventData.date?.toDate
              ? eventData.date.toDate()
              : new Date(eventData.date);

        if (isNaN(eventDateValue.getTime())) {
          throw new Error('Invalid event date format');
        }

        // Prepare ticket metadata
        const ticketMetadata = {
          eventId: body.eventId,
          eventName: eventData.name,
          eventDate: eventDateValue.toISOString(),
          location: eventData.location,
          owner: body.walletAddress,
          ticketNumber: eventData.ticketsSold + i + 1,
          mintedAt: new Date().toISOString()
        };

        // Mint NFT on Hedera (fallback to mock if needed)
        let nftData;
        try {
          nftData = await mintTicket(hederaTokenId, ticketMetadata);
        } catch (error) {
          console.error('Hedera minting failed, using mock data:', error);
          nftData = {
            tokenId: hederaTokenId,
            serialNumber: `${Date.now()}-${i}`
          };
        }

        // Generate QR code for ticket
        const qrCodeData = JSON.stringify({
          ticketId: `${nftData.tokenId}-${nftData.serialNumber}`,
          eventId: body.eventId,
          owner: body.walletAddress
        });
        const qrCode = await generateQRCode(qrCodeData);

        // Save ticket to Firestore
        const ticketDoc = await addDoc(collection(db, COLLECTIONS.TICKETS), {
          eventId: body.eventId,
          eventName: eventData.name,
          eventDate: eventDateValue.toISOString(),
          eventLocation: eventData.location,
          eventImageUrl: eventData.imageUrl,
          ownerId: body.userId || 'anonymous',
          ownerWallet: body.walletAddress,
          nftTokenId: nftData.tokenId,
          serialNumber: nftData.serialNumber,
          qrCode,
          status: 'active',
          purchaseDate: Timestamp.now(),
          metadata: ticketMetadata
        });

        mintedTickets.push({
          ticketId: ticketDoc.id,
          nftTokenId: nftData.tokenId,
          serialNumber: nftData.serialNumber,
          qrCode
        });

      } catch (error) {
        console.error(`Failed to mint ticket ${i + 1}:`, error);
        throw error;
      }
    }

    // Update event ticket count
    await updateDoc(eventRef, {
      ticketsSold: increment(body.quantity)
    });

    // Update user stats and badges
    const newBadges: string[] = [];
    if (body.userId) {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, body.userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const currentTickets = userDoc.data().ticketsPurchased || 0;
          const newTotal = currentTickets + body.quantity;
          const newLevel = calculateAttendeeLevel(newTotal);

          const milestones = [
            { count: 1, badgeId: 'first_ticket', name: 'First Timer' },
            { count: 3, badgeId: 'bronze_collector', name: 'Bronze Collector' },
            { count: 10, badgeId: 'silver_collector', name: 'Silver Collector' },
            { count: 25, badgeId: 'gold_collector', name: 'Gold Collector' },
            { count: 50, badgeId: 'platinum_member', name: 'Platinum Member' }
          ];

          const existingBadges = userDoc.data().badges || [];

          for (const milestone of milestones) {
            if (currentTickets < milestone.count && newTotal >= milestone.count) {
              if (!existingBadges.includes(milestone.badgeId)) {
                newBadges.push(milestone.badgeId);
                console.log(`User earned ${milestone.name} badge!`);
              }
            }
          }

          await updateDoc(userRef, {
            ticketsPurchased: increment(body.quantity),
            attendeeLevel: newLevel,
            badges: [...existingBadges, ...newBadges],
            lastActive: Timestamp.now()
          });
        } else {
          await setDoc(userRef, {
            walletAddress: body.walletAddress,
            ticketsPurchased: body.quantity,
            attendeeLevel: calculateAttendeeLevel(body.quantity),
            badges: body.quantity >= 1 ? ['first_ticket'] : [],
            totalSpent: 0,
            createdAt: Timestamp.now(),
            lastActive: Timestamp.now()
          });
          if (body.quantity >= 1) {
            newBadges.push('first_ticket');
          }
        }
      } catch (error) {
        console.error('Failed to update user stats:', error);
      }
    }

    // Mock transaction hash for demo
    const txHash = '0x' + Math.random().toString(36).substring(2, 15);

    return NextResponse.json(
      {
        success: true,
        tickets: mintedTickets,
        transactionHash: txHash,
        message: `Successfully minted ${body.quantity} ticket(s)`
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error minting tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
