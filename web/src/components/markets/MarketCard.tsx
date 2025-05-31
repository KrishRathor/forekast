import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface MarketCardProps {
  id: string;
  question: string;
  category: string;
  expiry: string;
  participants: number;
  volume: number;
  yesProb: number;
  isTrending?: boolean;
}

export const MarketCard = ({
  id,
  question,
  category,
  expiry,
  participants,
  volume,
  yesProb,
  isTrending,
}: MarketCardProps): React.ReactElement => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trade?id=${id}`);
  };

  return (
    <div
      className="rounded-2xl border border-neutral-800 bg-[#1A1A1D] p-4 shadow hover:shadow-lg hover:border-white/10 transition cursor-pointer w-full max-w-md"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs bg-neutral-700 text-white px-2 py-0.5 rounded-full">
          {category}
        </span>
        {isTrending && (
          <div className="flex items-center text-xs text-pink-400 gap-1">
            <TrendingUp size={14} />
            Trending
          </div>
        )}
      </div>

      <h2 className="text-white font-semibold text-base sm:text-lg line-clamp-2 mb-3">
        {question}
      </h2>

      <div className="flex flex-wrap justify-between gap-x-2 gap-y-2 text-sm text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{new Date(expiry).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{getRelativeTime(expiry)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span>{participants.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          💰 <span>${volume.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative w-full h-6 rounded-full bg-neutral-700 overflow-hidden mb-1 mt-2">
        <div
          className="absolute left-0 top-0 h-full bg-green-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-medium transition-all"
          style={{ width: `${yesProb * 100}%` }}
        >
          {yesProb > 0.1 && <span className="px-2">Yes {Math.round(yesProb * 100)}%</span>}
        </div>
        <div
          className="absolute right-0 top-0 h-full bg-red-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-medium transition-all"
          style={{ width: `${(1 - yesProb) * 100}%` }}
        >
          {(1 - yesProb) > 0.1 && <span className="px-2">No {Math.round((1 - yesProb) * 100)}%</span>}
        </div>
      </div>
    </div>
  );
};
const getRelativeTime = (expiry: string): string => {
  const now = new Date();
  const exp = new Date(expiry);
  const diff = +exp - +now;
  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  return `${days}d ${hours}h`;
};

export const MarketCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#1A1A1D] p-4 w-full max-w-md animate-pulse">
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 w-16 bg-neutral-600 rounded-full" />
        <div className="h-4 w-20 bg-neutral-600 rounded-full" />
      </div>
      <div className="h-5 bg-neutral-600 rounded mb-3 w-3/4" />
      <div className="h-5 bg-neutral-600 rounded mb-3 w-2/4" />
      <div className="flex justify-between mb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-14 bg-neutral-700 rounded" />
        ))}
      </div>
      <div className="w-full h-6 bg-neutral-700 rounded-full" />
    </div>
  );
};

