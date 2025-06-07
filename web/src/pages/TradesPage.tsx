import { Chart } from "@/components/trades/Chart";
import { OrderBook } from "@/components/trades/Orderbook";
import { OrderModal } from "@/components/trades/OrderModal";
import { useWebSocket } from "@/context/WebSocketContext";
import { useMarketByID } from "@/hooks/market";
import type React from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export const TradesPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");


  useEffect(() => {
    if (!id) {
      toast("No Id was provided, redirecting to home");
      navigate("/");
    }
  }, [id]);


  if (!id) {
    return <div>No ID Provided</div>;
  }

  const [price, setPrice] = useState(49.0);
  const [change, _setChange] = useState(20.0);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() * 20 - 10).toFixed(2);
      setPrice((prev) => +(prev + parseFloat(change)).toFixed(2));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const { marketByID } = useMarketByID(id);
  const { subscribeToOrderbook, ready, currentPrice } = useWebSocket();

  useEffect(() => {
    if (id) subscribeToOrderbook(id);
  }, [id, ready]);

  if (marketByID.data == null) return <div>Invalid ID</div>;
  if (marketByID.isLoading) return <div>Loading market...</div>;

  return (
    <div className="min-h-screen p-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="flex flex-col gap-4 flex-grow w-full">
          <div className="bg-[#14151B] flex flex-wrap items-center gap-4 p-4 rounded-md">
            <img src="faq.png" alt="questionmark" className="w-10 h-10" />
            <p className="text-lg sm:text-xl md:text-2xl font-medium">
              Q: {marketByID.data.Question}?
            </p>
            <p
              className={`text-lg md:text-xl ${price >= 50 ? "text-green-500" : "text-red-500"
                }`}
            >
              ${currentPrice}
            </p>
            <div className="flex flex-col ml-auto text-sm md:text-base text-white">
              <p className="opacity-70">24H Change</p>
              <p className={`${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {change}%
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 min-h-[60vh]">
            <div className="bg-[#14151B] rounded-md p-4 w-full md:w-3/4 min-h-[300px]">
              <Chart />
            </div>
            <div className="bg-[#14151B] rounded-md p-4 w-full md:w-1/4 min-h-[300px]">
              <OrderBook marketID={id} />
            </div>
          </div>
        </div>

        <div className="w-full md:w-[400px] bg-[#14151B] rounded-md p-4" style={{ height: 'calc(80px + 70vh)' }}>
          <OrderModal id={id} />
        </div>
      </div>
    </div>
  );
};

