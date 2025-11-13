// src/types/ticket.ts

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  ownerId: string;
  ownerWallet: string;
  nftTokenId: string; // Hedera token ID
  serialNumber: string;
  purchaseDate: Date;
  qrCode: string;
  status: 'active' | 'used' | 'transferred';
  metadata: TicketMetadata;
}

export interface TicketMetadata {
  eventName: string;
  eventDate: Date;
  location: string;
  seatNumber?: string;
  ticketTier?: 'general' | 'vip' | 'premium';
  imageUrl: string;
}

export interface PurchaseTicketData {
  eventId: string;
  quantity: number;
  walletAddress: string;
}