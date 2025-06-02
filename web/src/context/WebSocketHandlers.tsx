import type { Dispatch, SetStateAction } from "react";

type OrderLevel = {
  price: number;
  quantity: number;
  total: number;
};

type OrderBookUpdate = {
  type: "orderbook:update";
  marketID: string;
  currentPrice: number;
  yesorders: OrderLevel[];
  noorders: OrderLevel[];
};

export interface Trade {
  YesBuyer: string;
  NoBuyer: string;
  YesPrice: number;
  Quantity: number;
  Timestamp: string;
}

interface TradesResponse {
  success: boolean;
  trades: Trade[];
  alltrades: Trade[]
  type: string;
}


export const handlePlaceOrderResponse = (data: any, setTrades: Dispatch<SetStateAction<Trade[]>>) => {
  console.log("place order event", data)
  const parsedData = data as TradesResponse

  setTrades(parsedData.alltrades)

}

export const handleSubscribeResponse = () => {
  console.log("subscribe event")
}

export const handleOrderbookUpdateResponse = (
  data: any,
  setCurrentPrice: Dispatch<SetStateAction<number>>,
  setYesOrderbookData: Dispatch<SetStateAction<OrderLevel[]>>,
  setNoOrderbookData: Dispatch<SetStateAction<OrderLevel[]>>

) => {
  console.log("orderbook update event")
  const parsedData = data as OrderBookUpdate

  setCurrentPrice(parsedData.currentPrice)
  setYesOrderbookData(parsedData.yesorders)
  setNoOrderbookData(parsedData.noorders)

}
