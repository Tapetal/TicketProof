// src/components/PurchaseModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Ticket, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Event } from '@/types/event';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import BadgeNotification from '@/components/BadgeNotification';
import { BADGES, Badge } from '@/lib/badges';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  quantity: number;
}

type PurchaseStep = 'wallet' | 'confirm' | 'processing' | 'success' | 'error';

export default function PurchaseModal({ isOpen, onClose, event, quantity }: PurchaseModalProps) {
  const [step, setStep] = useState<PurchaseStep>('wallet');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  const totalPrice = event.price * quantity;

  // Check for existing wallet connection
  useEffect(() => {
    if (isOpen) {
      const savedAccountId = localStorage.getItem('hedera_account_id');
      if (savedAccountId) {
        setAccountId(savedAccountId);
        setStep('confirm');
      } else {
        setStep('wallet');
      }
    }
  }, [isOpen]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('wallet');
        setError(null);
        setTxHash(null);
        setTicketIds([]);
        setNewBadges([]);
        setCurrentBadgeIndex(0);
      }, 300);
    }
  }, [isOpen]);

  // Connect wallet
  const connectWallet = async (walletType: 'hashpack' | 'blade') => {
    try {
      // Simulate wallet connection (replace with actual integration)
      const mockAccountId = walletType === 'hashpack' ? '0.0.123456' : '0.0.234567';
      
      setAccountId(mockAccountId);
      localStorage.setItem('hedera_account_id', mockAccountId);
      setStep('confirm');
      
      toast.success(`${walletType === 'hashpack' ? 'HashPack' : 'Blade'} connected!`);
    } catch (err) {
      toast.error('Failed to connect wallet');
      console.error(err);
    }
  };

  // Process purchase
  const handlePurchase = async () => {
    setStep('processing');
    setError(null);

    try {
      // Call the mint API
      const response = await fetch('/api/tickets/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          walletAddress: accountId,
          userId: accountId // Using wallet address as user ID for now
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to purchase tickets');
      }

      // Extract ticket IDs and transaction hash
      const ticketIdsList = data.tickets.map((t: any) => t.ticketId);
      
      setTxHash(data.transactionHash);
      setTicketIds(ticketIdsList);
      setStep('success');

      // Check for new badges
      if (data.newBadges && data.newBadges.length > 0) {
        const earnedBadges = BADGES.filter(b => data.newBadges.includes(b.id));
        setNewBadges(earnedBadges);
        setCurrentBadgeIndex(0);
      }

      toast.success('Tickets purchased successfully! 🎉');
    } catch (err: any) {
      setError(err.message || 'Failed to purchase tickets');
      setStep('error');
      toast.error('Purchase failed');
    }
  };

  // Handle badge notification close
  const handleBadgeClose = () => {
    if (currentBadgeIndex < newBadges.length - 1) {
      // Show next badge
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      // All badges shown, clear the list
      setNewBadges([]);
      setCurrentBadgeIndex(0);
    }
  };

  // Close modal
  const handleClose = () => {
    if (step === 'processing') return; // Don't allow closing during transaction
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Purchase Tickets</h2>
            {step !== 'processing' && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Event Summary */}
            <div className="bg-violet-50 rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <img
                  src={event.imageUrl || 'https://via.placeholder.com/80'}
                  alt={event.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg line-clamp-1">{event.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Wallet Connection Step */}
            {step === 'wallet' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Connect your wallet to purchase tickets
                </p>

                <button
                  onClick={() => connectWallet('hashpack')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-violet-600 rounded-xl hover:bg-violet-50 transition-all btn-press hover-glow"
                >
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔷</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">HashPack Wallet</p>
                    <p className="text-sm text-gray-600">Most popular option</p>
                  </div>
                </button>

                <button
                  onClick={() => connectWallet('blade')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Blade Wallet</p>
                    <p className="text-sm text-gray-600">Fast & secure</p>
                  </div>
                </button>
              </div>
            )}

            {/* Confirmation Step */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Connected Account</span>
                    <span className="font-mono text-sm">{accountId}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tickets</span>
                    <span className="font-semibold">{quantity}x</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Price per ticket</span>
                    <span>{formatPrice(event.price)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-violet-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>✓</strong> Each ticket will be minted as an NFT
                    <br />
                    <strong>✓</strong> Tickets are transferable
                    <br />
                    <strong>✓</strong> Includes QR code for entry
                  </p>
                </div>

                <button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Confirm Purchase
                </button>
              </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-violet-600 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Processing Transaction</h3>
                <p className="text-gray-600 mb-4">
                  Minting your NFT tickets on Hedera...
                </p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Purchase Successful! 🎉</h3>
                <p className="text-gray-600 mb-6">
                  Your tickets have been minted and sent to your wallet
                </p>

                {/* Show badge earned message if any */}
                {newBadges.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 font-semibold">
                      🏆 You earned {newBadges.length} new badge{newBadges.length > 1 ? 's' : ''}!
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Check your profile to see your achievements
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-gray-600 mb-2">Transaction Hash</p>
                  <p className="font-mono text-xs break-all">{txHash}</p>
                </div>

                <div className="space-y-3">
                  {ticketIds.map((ticketId, index) => (
                    <div key={ticketId} className="flex items-center gap-3 bg-violet-50 p-3 rounded-lg">
                      <Ticket className="w-5 h-5 text-violet-600" />
                      <span className="font-medium">Ticket #{index + 1}</span>
                      <span className="text-xs text-gray-500 ml-auto">{ticketId}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/tickets';
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-semibold mt-6 hover:shadow-lg transition-all"
                >
                  View My Tickets
                </button>
              </div>
            )}

            {/* Error Step */}
            {step === 'error' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Purchase Failed</h3>
                <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>

                <button
                  onClick={() => setStep('confirm')}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge Notifications - Render outside modal */}
      {newBadges.length > 0 && currentBadgeIndex < newBadges.length && (
        <BadgeNotification
          badge={newBadges[currentBadgeIndex]}
          onClose={handleBadgeClose}
        />
      )}
    </>
  );
}