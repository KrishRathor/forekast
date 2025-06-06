import { useMarkets } from '@/hooks/market';
import { useNavigate } from 'react-router-dom';

export const LiveMarket = () => {
  const { liveMarkets } = useMarkets();

  const navigate = useNavigate();

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-[#0E0F14]" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Live Opinion Markets
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            See real-time trading activity on our most popular opinion markets.
          </p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400">
                  <th className="px-6 py-4 text-left">Market</th>
                  <th className="px-6 py-4 text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {liveMarkets.data?.map((market) => (
                  <tr key={market.ID} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{market.Question}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            navigate(`/trade?id=${market.ID}`)
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded transition-colors">
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              navigate("/markets")
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center">
            View all markets
          </button>
        </div>
      </div>
    </section>
  );
};

