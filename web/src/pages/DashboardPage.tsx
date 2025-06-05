import { Analytics } from "@/components/dashboard/analytics";
import { useWebSocket } from "@/context/WebSocketContext";
import type { Trade } from "@/context/WebSocketHandlers";
import { useAuth } from "@clerk/clerk-react";
import type React from "react";
import { useEffect, useState } from "react";

export const DashboardPage = (): React.ReactElement => {

  const { userId } = useAuth();

  const { trades } = useWebSocket();

  const [userYesTrades, setUserYesTrades] = useState<Trade[]>([]);
  const [userNoTrades, setUserNoTrades] = useState<Trade[]>([]);


  useEffect(() => {
    const getTrades = async () => {
      const yes = trades.filter(k => (k.YesBuyer === userId))
      const no = trades.filter(k => (k.NoBuyer === userId))
      console.log('yes', yes);
      console.log('no', no);
      setUserYesTrades(yes);
      setUserNoTrades(no);

    }
    getTrades();
  }, [userId, trades])

  return (
    <div className="w-[80vw] max-w-screen-xl mx-auto flex gap-6 p-6" style={{ height: "80vh" }}>

      <div className="flex flex-col flex-[0.6] gap-6">
        <div className="bg-[#1A1A1D] rounded-lg p-6 flex justify-center items-center h-1/3">
          <Analytics />
        </div>

        <div className="bg-[#1A1A1D] rounded-lg p-4 flex-1 overflow-auto">
          <h2 className="text-lg font-semibold mb-3">Suggestions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
            <li>Recent Transactions</li>
            <li>Portfolio Performance Summary</li>
            <li>Latest Market News</li>
            <li>Alerts & Notifications</li>
          </ul>
        </div>
      </div>

      <div className="flex-[0.4] bg-[#1A1A1D] rounded-lg p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Holdings / Trades</h2>

        <div className="flex-1 overflow-auto text-sm text-gray-300 space-y-4">

          <div>
            <h2 className="text-white text-center font-semibold mb-2">Yes Trades</h2>
            <div className="space-y-1">
              <div className="flex justify-evenly px-1 text-xs text-gray-400">
                <span>Quantity</span>
                <span>Price</span>
              </div>
              {
                userYesTrades.map((trade, i) => (
                  <div key={i} className="flex justify-evenly px-1 text-green-400">
                    <span>{trade.Quantity}</span>
                    <span>{trade.YesPrice}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <h2 className="text-white text-center font-semibold mb-2">No Trades</h2>
            <div className="space-y-1">
              <div className="flex justify-evenly px-1 text-xs text-gray-400">
                <span>Quantity</span>
                <span>Price</span>
              </div>
              {
                userNoTrades.map((trade, i) => (
                  <div key={i} className="flex justify-evenly px-1 text-red-400">
                    <span>{trade.Quantity}</span>
                    <span>{100 - trade.YesPrice}</span>
                  </div>
                ))
              }
            </div>
          </div>

        </div>

      </div>
    </div >
  );
};

