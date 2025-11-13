// src/components/LoadingSkeleton.tsx

export function EventCardSkeleton() {
  return (
    <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-[#0B0B14]"></div>
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        <div className="h-6 bg-[#0B0B14] rounded w-3/4"></div>
        <div className="h-4 bg-[#0B0B14] rounded w-full"></div>
        <div className="h-4 bg-[#0B0B14] rounded w-5/6"></div>
        
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-[#0B0B14] rounded w-2/3"></div>
          <div className="h-4 bg-[#0B0B14] rounded w-1/2"></div>
        </div>

        <div className="pt-4 border-t border-[#6C63FF]/10">
          <div className="h-8 bg-[#0B0B14] rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-[#0B0B14] rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-xl overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-5 bg-[#0B0B14] rounded w-24"></div>
          <div className="h-5 bg-[#0B0B14] rounded w-16"></div>
        </div>
        
        <div className="h-20 bg-[#0B0B14] rounded"></div>
        <div className="h-4 bg-[#0B0B14] rounded w-2/3"></div>
        
        <div className="space-y-2 pt-4">
          <div className="h-10 bg-[#0B0B14] rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-[#0B0B14] rounded flex-1"></div>
            <div className="h-10 bg-[#0B0B14] rounded flex-1"></div>
          </div>
        </div>
      </div>
      <div className="h-2 bg-[#0B0B14]"></div>
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="bg-[#1A1B2E] border border-[#6C63FF]/20 rounded-2xl p-6 animate-pulse">
      <div className="h-8 bg-[#0B0B14] rounded w-8 mb-3"></div>
      <div className="h-10 bg-[#0B0B14] rounded w-20 mb-1"></div>
      <div className="h-4 bg-[#0B0B14] rounded w-24"></div>
    </div>
  );
}

export function BadgeSkeleton() {
  return (
    <div className="bg-[#0B0B14] border-2 border-[#6C63FF]/10 rounded-xl p-4 text-center animate-pulse">
      <div className="w-12 h-12 bg-[#1A1B2E] rounded-full mx-auto mb-2"></div>
      <div className="h-4 bg-[#1A1B2E] rounded w-3/4 mx-auto mb-1"></div>
      <div className="h-3 bg-[#1A1B2E] rounded w-1/2 mx-auto"></div>
    </div>
  );
}