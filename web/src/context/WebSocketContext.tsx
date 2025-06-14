import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { handleOrderbookUpdateResponse, handlePlaceOrderResponse, handleSubscribeResponse, type Trade } from "./WebSocketHandlers";
import { type OrderBookDataI, type OrderBookEntry } from "@/components/trades/data";
import { useSetRecoilState } from "recoil";
import { tradeStore } from "@/store/tradesStore";
import { WEBSOCKET_URL } from "@/lib/BackendUrl";

type WebSocketContextType = {
  socket: WebSocket | null;
  sendMessage: (msg: string) => void;
  subscribeToOrderbook: (marketID: string) => void;
  placeLimitOrder: (marketID: string, userID: string, quantity: number, price: number, yes: boolean) => void
  ready: boolean;
  currentPrice: number;
  yesorderbookData: OrderBookEntry[];
  noorderbookData: OrderBookEntry[];
  trades: Trade[];
  orderBookData: OrderBookDataI | null
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [yesorderbookData, setYesOrderbookData] = useState<OrderBookEntry[]>([]);
  const [noorderbookData, setNoOrderbookData] = useState<OrderBookEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([])
  const setRecoilTrades = useSetRecoilState(tradeStore)
  const [orderBookData, setOrderbookData] = useState<OrderBookDataI | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    socketRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setReady(true);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setReady(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      setReady(false);
    };

    ws.onmessage = (event) => {
      try {

        const parsedData = JSON.parse(event.data)

        const type = parsedData.type;

        switch (type) {
          case "subscribe":
            handleSubscribeResponse()
            break
          case "orderbook:update":
            handleOrderbookUpdateResponse(parsedData, setCurrentPrice, setYesOrderbookData, setNoOrderbookData, setOrderbookData)
            break
          case "placeorder":
            if (parsedData.success == true) {
              handlePlaceOrderResponse(parsedData, setTrades)
            }
            break
          case "trades":
            if (parsedData.success == true) {
              handlePlaceOrderResponse(parsedData, setTrades)
              setRecoilTrades(parsedData.alltrades)
            }
            break
          default:
          // handle this
        }

      } catch (err) {
        // TODO: hanlde err
      }
    }

    return () => {
      ws.close();
    };
  }, []);


  const sendMessage = (msg: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    }
  };

  const subscribeToOrderbook = (marketID: string) => {

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = {
        type: "subscribe:orderbook",
        data: {
          marketid: marketID
        }
      }
      socketRef.current.send(JSON.stringify(payload))
    }
  }

  const placeLimitOrder = (marketID: string, userID: string, quantity: number, price: number, yes: boolean) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {

      const payload = {
        type: "order",
        data: {
          marketid: marketID,
          userid: userID,
          quantity,
          price,
          yes
        }
      }
      socketRef.current.send(JSON.stringify(payload))
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage, subscribeToOrderbook, placeLimitOrder, ready, currentPrice, yesorderbookData, noorderbookData, trades, orderBookData }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
};

