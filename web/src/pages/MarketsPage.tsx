import { MarketCard, MarketCardSkeleton } from "@/components/markets/MarketCard";
import { useMarkets } from "@/hooks/market";
import type React from "react";

export const MarketsPage = (): React.ReactElement => {
  const { liveMarkets } = useMarkets();

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Live Markets</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Participate in prediction markets, explore trending questions, and forecast outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {liveMarkets.isLoading &&
            Array.from({ length: 4 }).map((_, i) => <MarketCardSkeleton key={i} />)}

          {liveMarkets.data?.map((market) => (
            <MarketCard
              key={market.ID}
              id={market.ID}
              question={market.Question}
              category="Crypto"
              expiry={market.Expiry}
              participants={1204}
              volume={10400}
              yesProb={0.58}
              isTrending={true}
            />
          ))}
                    {liveMarkets.data?.map((market) => (
            <MarketCard
              key={market.ID}
              id={market.ID}
              question={market.Question}
              category="Crypto"
              expiry={market.Expiry}
              participants={1204}
              volume={10400}
              yesProb={0.58}
              isTrending={true}
            />
          ))}
          {liveMarkets.data?.map((market) => (
            <MarketCard
              key={market.ID}
              id={market.ID}
              question={market.Question}
              category="Crypto"
              expiry={market.Expiry}
              participants={1204}
              volume={10400}
              yesProb={0.58}
              isTrending={true}
            />
          ))}

        </div>
      </div>
    </div>
  );
};

