import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
  socket: WebSocket | null;
  sendMessage: (msg: string) => void;
  subscribeToOrderbook: (marketID: string) => void;
  ready: boolean
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState<boolean>(false);

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

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage, subscribeToOrderbook, ready }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
};

