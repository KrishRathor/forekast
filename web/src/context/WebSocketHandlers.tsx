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



export const handlePlaceOrderResponse = () => {
  console.log("place order event")
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
