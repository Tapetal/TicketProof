// src/components/BadgeNotification.tsx
'use client';

import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { Badge, getRarityColor } from '@/lib/badges';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="bg-[#1A1B2E] border-2 rounded-2xl p-6 shadow-2xl max-w-sm relative overflow-hidden"
        style={{ borderColor: getRarityColor(badge.rarity) }}
      >
        {/* Animated background effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at top right, ${getRarityColor(badge.rarity)}, transparent)`
          }}
        />

        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-[#D1D5DB]" />
        </button>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${getRarityColor(badge.rarity)}20` }}
            >
              <Trophy className="w-6 h-6" style={{ color: getRarityColor(badge.rarity) }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: getRarityColor(badge.rarity) }}>
                {badge.rarity} Badge Earned!
              </p>
              <p className="text-sm text-[#D1D5DB]">Achievement Unlocked</p>
            </div>
          </div>

          {/* Badge Display */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl animate-bounce">
              {badge.emoji}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                {badge.name}
              </h3>
              <p className="text-sm text-[#D1D5DB]">
                {badge.description}
              </p>
            </div>
          </div>

          {/* Sparkle effect */}
          <div className="flex justify-center gap-2 text-2xl animate-pulse">
            ✨ 🎉 ✨
          </div>
        </div>
      </div>
    </div>
  );
}