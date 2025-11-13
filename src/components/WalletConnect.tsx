// src/components/WalletConnect.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import toast from 'react-hot-toast';

interface WalletConnectProps {
  onConnect?: (accountId: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('hedera_account_id');
    if (savedAccountId) {
      setAccountId(savedAccountId);
    }
  }, []);

  // HashPack connection
  const connectHashPack = async () => {
    setIsConnecting(true);
    try {
      // Check if HashConnect is available
      if (typeof window !== 'undefined' && (window as any).hashconnect) {
        const hashconnect = (window as any).hashconnect;
        
        // Initialize HashConnect
        const appMetadata = {
          name: "TicketProof",
          description: "Blockchain Event Ticketing",
          icon: "https://ticketproof.app/icon.png"
        };

        const initData = await hashconnect.init(appMetadata, "testnet", false);
        
        // Pair with wallet
        const pairingData = await hashconnect.connectToLocalWallet();
        
        if (pairingData && pairingData.accountIds && pairingData.accountIds.length > 0) {
          const connectedAccountId = pairingData.accountIds[0];
          setAccountId(connectedAccountId);
          localStorage.setItem('hedera_account_id', connectedAccountId);
          
          toast.success('Wallet connected successfully!');
          onConnect?.(connectedAccountId);
        }
      } else {
        // Simulate wallet connection for demo purposes
        const mockAccountId = '0.0.123456';
        setAccountId(mockAccountId);
        localStorage.setItem('hedera_account_id', mockAccountId);
        
        toast.success('Wallet connected (Demo Mode)');
        onConnect?.(mockAccountId);
      }
    } catch (error) {
      console.error('HashPack connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Blade Wallet connection
  const connectBlade = async () => {
    setIsConnecting(true);
    try {
      // Check if Blade is available
      if (typeof window !== 'undefined' && (window as any).blade) {
        const blade = (window as any).blade;
        const accountData = await blade.createSession();
        
        if (accountData && accountData.accountId) {
          setAccountId(accountData.accountId);
          localStorage.setItem('hedera_account_id', accountData.accountId);
          
          toast.success('Blade Wallet connected!');
          onConnect?.(accountData.accountId);
        }
      } else {
        // Simulate wallet connection for demo
        const mockAccountId = '0.0.234567';
        setAccountId(mockAccountId);
        localStorage.setItem('hedera_account_id', mockAccountId);
        
        toast.success('Blade Wallet connected (Demo Mode)');
        onConnect?.(mockAccountId);
      }
    } catch (error) {
      console.error('Blade connection error:', error);
      toast.error('Failed to connect Blade wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccountId(null);
    localStorage.removeItem('hedera_account_id');
    setShowDropdown(false);
    toast.success('Wallet disconnected');
    onDisconnect?.();
  };

  // Copy account ID
  const copyAccountId = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      setCopied(true);
      toast.success('Account ID copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If wallet is connected, show account info
  if (accountId) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-3 md:px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm md:text-base"
        >
          <Wallet className="w-4 h-4" />
          <span className="font-medium hidden sm:inline">{truncateAddress(accountId)}</span>
          <span className="font-medium sm:hidden">{truncateAddress(accountId, 2)}</span>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl shadow-2xl p-4 z-50 animate-fade-in-down">
            {/* Account Info */}
            <div className="mb-4 pb-4 border-b border-[#6C63FF]/20">
              <p className="text-xs text-gray-400 mb-1">Connected Account</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-medium text-white">{accountId}</p>
                <button
                  onClick={copyAccountId}
                  className="ml-2 p-1 hover:bg-[#6C63FF]/20 rounded transition-colors"
                  title="Copy account ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Balance (Mock) */}
            <div className="mb-4 pb-4 border-b border-[#6C63FF]/20">
              <p className="text-xs text-gray-400 mb-1">Balance</p>
              <p className="text-lg font-bold text-[#00C6AE]">100.00 HBAR</p>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={disconnect}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-lg hover:bg-red-500/20 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  // If wallet is not connected, show connect button
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>

      {/* Wallet Selection Dropdown */}
      {showDropdown && !isConnecting && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200">
            <p className="font-semibold text-gray-900">Connect Wallet</p>
            <p className="text-xs text-gray-500 mt-1">Choose your preferred wallet</p>
          </div>

          {/* HashPack Option */}
          <button
            onClick={connectHashPack}
            className="w-full flex items-center gap-3 p-4 hover:bg-violet-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔷</span>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">HashPack</p>
              <p className="text-xs text-gray-500">Most popular Hedera wallet</p>
            </div>
          </button>

          {/* Blade Wallet Option */}
          <button
            onClick={connectBlade}
            className="w-full flex items-center gap-3 p-4 hover:bg-violet-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚔️</span>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Blade Wallet</p>
              <p className="text-xs text-gray-500">Secure & fast</p>
            </div>
          </button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}