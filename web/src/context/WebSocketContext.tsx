import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { handleOrderbookUpdateResponse, handlePlaceOrderResponse, handleSubscribeResponse, type Trade } from "./WebSocketHandlers";
import type { OrderBookEntry } from "@/components/trades/data";

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


  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080/ws");
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
      console.log(event.data)
      try {

        const parsedData = JSON.parse(event.data)

        const type = parsedData.type;

        switch (type) {
          case "subscribe":
            handleSubscribeResponse()
            break
          case "orderbook:update":
            handleOrderbookUpdateResponse(parsedData, setCurrentPrice, setYesOrderbookData, setNoOrderbookData)
            break
          case "placeorder":
            if (parsedData.success == true) {
              handlePlaceOrderResponse(parsedData, setTrades)
            }
            break
          default:
            console.log("i don't know this one")
        }

      } catch (err) {
        console.log(err)
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
    console.log('yo')

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('here')
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

      console.log("came here")

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
    <WebSocketContext.Provider value={{ socket, sendMessage, subscribeToOrderbook, placeLimitOrder, ready, currentPrice, yesorderbookData, noorderbookData, trades }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
};

