import type { OrderBookDataI } from "@/components/trades/data";
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
  alltrades: Trade[]
  type: string;
}


export const handlePlaceOrderResponse = (data: any, setTrades: Dispatch<SetStateAction<Trade[]>>) => {
  const parsedData = data as TradesResponse

  setTrades(_prev => parsedData.alltrades)

}

export const handleSubscribeResponse = () => {
  // TODO: do something here
}

export const handleOrderbookUpdateResponse = (
  data: any,
  setCurrentPrice: Dispatch<SetStateAction<number>>,
  setYesOrderbookData: Dispatch<SetStateAction<OrderLevel[]>>,
  setNoOrderbookData: Dispatch<SetStateAction<OrderLevel[]>>,
  setOrderbookData: Dispatch<SetStateAction<OrderBookDataI | null>>
) => {

  console.log('response: ', data)

  const parsedData = data as OrderBookUpdate

  setCurrentPrice(parsedData.currentPrice)
  setYesOrderbookData(parsedData.yesorders)
  setNoOrderbookData(parsedData.noorders)

  setOrderbookData({
    marketID: parsedData.marketID,
    currentPrice: parsedData.currentPrice,
    yesOrders: parsedData.yesorders,
    noOrders: parsedData.noorders
  })

}
